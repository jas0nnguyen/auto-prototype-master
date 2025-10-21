/**
 * Quote Service - Simplified Version
 *
 * This is a clean, simple implementation that handles the core quote flow:
 * 1. Create quote (Party → Person → Vehicle → Policy)
 * 2. Calculate premium (simple formula)
 * 3. Retrieve quotes by ID or quote number
 *
 * This replaces the complex 17-service architecture with a single,
 * understandable service that gets the job done.
 */

import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import {
  party,
  person,
  communicationIdentity,
  vehicle,
  insurableObject,
  product,
  agreement,
  policy,
} from '../../../../database/schema';
import type { Database } from '../../database/drizzle.config';
import { DATABASE_CONNECTION } from '../../database/database.module';

/**
 * Input data for creating a quote
 */
export interface CreateQuoteInput {
  // Primary driver information (PNI - Primary Named Insured)
  driver: {
    firstName: string;
    lastName: string;
    birthDate: Date;
    email: string;
    phone: string;
    gender?: string;
    maritalStatus?: string;  // NEW: For CRM
    yearsLicensed?: number;
    licenseNumber?: string;
    licenseState?: string;
  };

  // Additional drivers (stored in quote_snapshot as metadata)
  additionalDrivers?: Array<{
    firstName: string;
    lastName: string;
    birthDate: Date;
    email: string;
    phone: string;
    gender?: string;
    maritalStatus?: string;
    yearsLicensed?: number;
    relationship?: string; // spouse, child, parent, sibling, other
  }>;

  // Address information (for PNI)
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Primary vehicle information (kept for backward compatibility)
  vehicle?: {
    year: number;
    make: string;
    model: string;
    vin: string;
    bodyType?: string;
    annualMileage?: number;
    primaryDriverId?: string;
  };

  // All vehicles (stored in quote_snapshot as metadata)
  vehicles?: Array<{
    year: number;
    make: string;
    model: string;
    vin: string;
    bodyType?: string;
    annualMileage?: number;
    primaryDriverId?: string; // ID reference to which driver primarily uses this vehicle
  }>;

  // Coverage selections (EXPANDED for complete quote data)
  coverages?: {
    startDate?: string;  // Coverage start date
    bodilyInjuryLimit?: string;  // e.g., "100/300"
    propertyDamageLimit?: string;  // e.g., "50000"
    collision?: boolean;
    collisionDeductible?: number;  // e.g., 500
    comprehensive?: boolean;
    comprehensiveDeductible?: number;  // e.g., 500
    uninsuredMotorist?: boolean;
    roadsideAssistance?: boolean;
    rentalReimbursement?: boolean;
    rentalLimit?: number;  // e.g., 50 (per day)
  };
}

/**
 * Quote creation result
 */
export interface QuoteResult {
  quoteId: string;        // Human-readable quote ID (same as quote number for simplicity)
  quoteNumber: string;    // Quote reference number (format: QXXXXX, e.g., QA1B2C)
  premium: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Quote Service
 */
@Injectable()
export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database
  ) {}

  /**
   * Create a new quote
   *
   * This is the main method that creates a complete quote in one transaction.
   */
  async createQuote(input: CreateQuoteInput): Promise<QuoteResult> {
    // Get primary vehicle (from legacy field or first vehicle in array)
    const primaryVehicle = input.vehicle || input.vehicles?.[0];
    if (!primaryVehicle) {
      throw new Error('At least one vehicle is required');
    }

    this.logger.log('Creating new quote', {
      driverEmail: input.driver.email,
      vehicleVin: primaryVehicle.vin
    });

    try {
      // Step 1: Create Party (the person buying insurance)
      const [newParty] = await this.db.insert(party).values({
        party_name: `${input.driver.firstName} ${input.driver.lastName}`,
        party_type_code: 'PERSON',
      }).returning();

      this.logger.debug('Created party', { partyId: newParty.party_identifier });

      // Step 2: Create Person (detailed person info)
      await this.db.insert(person).values({
        person_identifier: newParty.party_identifier, // Subtype shares PK
        first_name: input.driver.firstName,
        last_name: input.driver.lastName,
        birth_date: input.driver.birthDate.toISOString().split('T')[0],
        gender_code: input.driver.gender || null,
      }).returning();

      // Step 3: Create Communication Identity (email)
      await this.db.insert(communicationIdentity).values({
        party_identifier: newParty.party_identifier,
        communication_type_code: 'EMAIL',
        communication_value: input.driver.email,
      }).returning();

      // Step 4: Create Communication Identity (phone)
      await this.db.insert(communicationIdentity).values({
        party_identifier: newParty.party_identifier,
        communication_type_code: 'PHONE',
        communication_value: input.driver.phone,
      }).returning();

      // Step 5: Create Insurable Object (generic object)
      const [newInsurableObject] = await this.db.insert(insurableObject).values({
        insurable_object_type_code: 'VEHICLE',
        object_description: `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`,
      }).returning();

      // Step 6: Create Vehicle (specific vehicle details)
      const vehicleData: any = {
        vehicle_identifier: newInsurableObject.insurable_object_identifier,
        vin: primaryVehicle.vin || null,  // Use null instead of empty string for unique constraint
        make: primaryVehicle.make,
        model: primaryVehicle.model,
        year: primaryVehicle.year,
      };

      // Only add optional fields if they have values
      if (primaryVehicle.bodyType) vehicleData.body_style = primaryVehicle.bodyType;
      if (primaryVehicle.annualMileage) vehicleData.annual_mileage = primaryVehicle.annualMileage;

      await this.db.insert(vehicle).values(vehicleData).returning();

      this.logger.debug('Created vehicle', { vehicleId: newInsurableObject.insurable_object_identifier });

      // Step 7: Ensure Product exists (Personal Auto Insurance)
      const productId = await this.ensureProductExists();

      // Step 8: Calculate premium (before creating agreement so we can store it)
      const premium = this.calculatePremium(input);

      // Step 9: Generate quote number
      const quoteNumber = this.generateQuoteNumber();

      // Step 10: Build complete quote snapshot for CRM (HYBRID APPROACH)
      // Includes ALL drivers and ALL vehicles for complete CRM data
      const quoteSnapshot = {
        // Primary vehicle (backward compatibility)
        vehicle: input.vehicle ? {
          year: input.vehicle.year,
          make: input.vehicle.make,
          model: input.vehicle.model,
          vin: input.vehicle.vin || null,
          bodyType: input.vehicle.bodyType || null,
          annualMileage: input.vehicle.annualMileage || null,
        } : null,
        // ALL vehicles (for multi-vehicle quotes)
        vehicles: (input.vehicles || []).map(v => ({
          year: v.year,
          make: v.make,
          model: v.model,
          vin: v.vin || null,
          bodyType: v.bodyType || null,
          annualMileage: v.annualMileage || null,
          primaryDriverId: v.primaryDriverId || null,
        })),
        // Primary driver (PNI - Primary Named Insured)
        driver: {
          firstName: input.driver.firstName,
          lastName: input.driver.lastName,
          birthDate: input.driver.birthDate.toISOString().split('T')[0],
          email: input.driver.email,
          phone: input.driver.phone,
          gender: input.driver.gender || null,
          maritalStatus: input.driver.maritalStatus || null,
          yearsLicensed: input.driver.yearsLicensed || null,
          isPrimary: true,
        },
        // ALL additional drivers (for multi-driver quotes)
        additionalDrivers: (input.additionalDrivers || []).map(d => ({
          firstName: d.firstName,
          lastName: d.lastName,
          birthDate: d.birthDate.toISOString().split('T')[0],
          email: d.email,
          phone: d.phone,
          gender: d.gender || null,
          maritalStatus: d.maritalStatus || null,
          yearsLicensed: d.yearsLicensed || null,
          relationship: d.relationship || null,
        })),
        address: {
          addressLine1: input.address.addressLine1,
          addressLine2: input.address.addressLine2 || null,
          city: input.address.city,
          state: input.address.state,
          zipCode: input.address.zipCode,
        },
        coverages: {
          startDate: input.coverages?.startDate || null,
          bodilyInjuryLimit: input.coverages?.bodilyInjuryLimit || null,
          propertyDamageLimit: input.coverages?.propertyDamageLimit || null,
          hasCollision: input.coverages?.collision || false,
          collisionDeductible: input.coverages?.collisionDeductible || null,
          hasComprehensive: input.coverages?.comprehensive || false,
          comprehensiveDeductible: input.coverages?.comprehensiveDeductible || null,
          hasUninsured: input.coverages?.uninsuredMotorist || false,
          hasRoadside: input.coverages?.roadsideAssistance || false,
          hasRental: input.coverages?.rentalReimbursement || false,
          rentalLimit: input.coverages?.rentalLimit || null,
        },
        premium: {
          total: premium,
          monthly: Math.round(premium / 6 * 100) / 100,
          sixMonth: premium,
        },
        meta: {
          createdAt: new Date().toISOString(),
          quoteNumber: quoteNumber,
          version: 2, // Incremented to v2 to indicate multi-driver/vehicle support
        },
      };

      // Step 11: Create Agreement (parent contract) with driver email and premium
      const [newAgreement] = await this.db.insert(agreement).values({
        agreement_type_code: 'POLICY',
        product_identifier: productId,
        driver_email: input.driver.email,
        premium_amount: premium.toString(),
      }).returning();

      // Step 12: Create Policy with snapshot and denormalized fields
      const [newPolicy] = await this.db.insert(policy).values({
        policy_identifier: newAgreement.agreement_identifier,
        policy_number: quoteNumber,
        effective_date: new Date().toISOString().split('T')[0],
        expiration_date: this.calculateExpirationDate().toISOString().split('T')[0],
        status_code: 'QUOTED',
        quote_snapshot: quoteSnapshot,  // ✅ Complete quote data
        marital_status: input.driver.maritalStatus || null,  // ✅ Denormalized for queries
        coverage_start_date: input.coverages?.startDate || null,  // ✅ Denormalized for queries
      }).returning();

      this.logger.log('Quote created successfully', {
        quoteNumber,
        policyId: newPolicy.policy_identifier,
        premium
      });

      return {
        quoteId: quoteNumber,      // Use quote number as the human-readable ID
        quoteNumber,
        premium,
        createdAt: new Date(),
        expiresAt: this.calculateQuoteExpiration(),
      };
    } catch (error) {
      this.logger.error('Failed to create quote', error);
      // Log full error details for debugging
      if (error && typeof error === 'object') {
        this.logger.error('Error details:', JSON.stringify(error, null, 2));
      }
      throw error;
    }
  }

  /**
   * Get quote by quote number
   * Returns complete quote data from snapshot (HYBRID APPROACH)
   *
   * Fast retrieval using quote_snapshot JSON field.
   * All 28+ fields available for CRM display.
   */
  async getQuote(quoteNumber: string): Promise<any> {
    this.logger.debug('Fetching quote by number', { quoteNumber });

    // Fast path: Retrieve quote with snapshot
    const result = await this.db
      .select({
        quoteNumber: policy.policy_number,
        quoteStatus: policy.status_code,
        policyId: policy.policy_identifier,
        effectiveDate: policy.effective_date,
        expirationDate: policy.expiration_date,
        quoteSnapshot: policy.quote_snapshot,
        premiumAmount: agreement.premium_amount,
        createdAt: agreement.created_at,
      })
      .from(policy)
      .innerJoin(agreement, eq(policy.policy_identifier, agreement.agreement_identifier))
      .where(eq(policy.policy_number, quoteNumber))
      .limit(1);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Quote ${quoteNumber} not found`);
    }

    const quote = result[0];
    const snapshot = quote.quoteSnapshot as any;

    this.logger.debug('Retrieved quote', {
      quoteNumber: quote.quoteNumber,
      hasSnapshot: !!snapshot,
      snapshotVersion: snapshot?.meta?.version,
    });

    // Return CRM-ready complete quote data (all fields including multi-driver/vehicle)
    return {
      quote_number: quote.quoteNumber,
      quote_status: quote.quoteStatus,
      policy_id: quote.policyId,
      effective_date: quote.effectiveDate,
      expiration_date: quote.expirationDate,
      created_at: quote.createdAt,

      // Vehicle details (from snapshot) - primary vehicle for backward compatibility
      vehicle: snapshot?.vehicle || {
        year: null,
        make: null,
        model: null,
        vin: null,
        bodyType: null,
        annualMileage: null,
      },

      // ALL vehicles (for CRM - multi-vehicle support)
      vehicles: snapshot?.vehicles || [],

      // Driver details (from snapshot) - PNI
      driver: snapshot?.driver || {
        firstName: null,
        lastName: null,
        birthDate: null,
        email: null,
        phone: null,
        gender: null,
        maritalStatus: null,
        yearsLicensed: null,
      },

      // ALL additional drivers (for CRM - multi-driver support)
      additionalDrivers: snapshot?.additionalDrivers || [],

      // Address (from snapshot)
      address: snapshot?.address || {
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        zipCode: null,
      },

      // Coverage selections (from snapshot)
      coverages: snapshot?.coverages || {
        startDate: null,
        bodilyInjuryLimit: null,
        propertyDamageLimit: null,
        hasCollision: false,
        collisionDeductible: null,
        hasComprehensive: false,
        comprehensiveDeductible: null,
        hasUninsured: false,
        hasRoadside: false,
        hasRental: false,
        rentalLimit: null,
      },

      // Premium breakdown (from snapshot or fallback to agreement)
      premium: snapshot?.premium || {
        total: parseFloat(quote.premiumAmount || '0'),
        monthly: Math.round(parseFloat(quote.premiumAmount || '0') / 6 * 100) / 100,
        sixMonth: parseFloat(quote.premiumAmount || '0'),
      },
    };
  }

  /**
   * Get quote by quote number
   * Returns complete quote data with vehicle, driver, and premium information
   */
  async getQuoteByNumber(quoteNumber: string): Promise<any> {
    // Delegate to getQuote - they do the same thing
    return this.getQuote(quoteNumber);
  }

  /**
   * Generate quote number in format: DZXXXXXXXX (DZ prefix + 8 random alphanumeric characters)
   */
  private generateQuoteNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `DZ${suffix}`;
  }

  /**
   * Calculate premium (simple formula)
   *
   * Formula: Base Premium × Vehicle Factor × Driver Factor
   *
   * This is a simplified calculation. The full rating engine with
   * discounts, surcharges, and complex multipliers can be added later.
   */
  private calculatePremium(input: CreateQuoteInput): number {
    // Base premium starts at $1000
    let basePremium = 1000;

    // Get primary vehicle (from legacy field or first vehicle in array)
    const primaryVehicle = input.vehicle || input.vehicles?.[0];
    if (!primaryVehicle) {
      throw new Error('At least one vehicle is required for premium calculation');
    }

    // Vehicle age factor
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - primaryVehicle.year;
    let vehicleFactor = 1.0;

    if (vehicleAge <= 3) {
      vehicleFactor = 1.3; // New cars cost more to repair
    } else if (vehicleAge <= 7) {
      vehicleFactor = 1.0; // Mid-age baseline
    } else {
      vehicleFactor = 0.9; // Older cars less valuable
    }

    // Driver age factor
    const birthDate = new Date(input.driver.birthDate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    let driverFactor = 1.0;

    if (age < 25) {
      driverFactor = 1.8; // Young drivers higher risk
    } else if (age >= 65) {
      driverFactor = 1.2; // Senior drivers moderate risk
    } else {
      driverFactor = 1.0; // 25-64 baseline
    }

    // Coverage factor (simple)
    let coverageFactor = 1.0;
    if (input.coverages?.collision) coverageFactor += 0.3;
    if (input.coverages?.comprehensive) coverageFactor += 0.2;

    // Calculate total
    const totalPremium = Math.round(basePremium * vehicleFactor * driverFactor * coverageFactor);

    this.logger.debug('Premium calculated', {
      basePremium,
      vehicleFactor,
      driverFactor,
      coverageFactor,
      totalPremium,
    });

    return totalPremium;
  }

  /**
   * Ensure Product exists (create if not)
   */
  private async ensureProductExists(): Promise<string> {
    const productName = 'Personal Auto Insurance';

    // Check if product exists
    const existing = await this.db
      .select()
      .from(product)
      .where(eq(product.licensed_product_name, productName))
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0].product_identifier;
    }

    // Create product
    const [newProduct] = await this.db.insert(product).values({
      licensed_product_name: productName,
      product_description: 'Standard personal auto insurance coverage',
    }).returning();

    this.logger.debug('Created product', { productId: newProduct.product_identifier });

    return newProduct.product_identifier;
  }

  /**
   * Calculate policy expiration date (1 year from now)
   */
  private calculateExpirationDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  /**
   * Calculate quote expiration date (30 days from now)
   */
  private calculateQuoteExpiration(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Update primary driver information
   *
   * This method updates the quote_snapshot with new primary driver and address data,
   * then recalculates premium (age/gender may affect rates).
   */
  async updatePrimaryDriver(
    quoteNumber: string,
    driver: {
      firstName: string;
      lastName: string;
      birthDate: Date;
      email: string;
      phone: string;
      gender?: string;
      maritalStatus?: string;
    },
    address: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
    }
  ): Promise<QuoteResult> {
    this.logger.log('Updating primary driver for quote', { quoteNumber });

    try {
      // Fetch existing quote
      const existingQuote = await this.getQuote(quoteNumber);
      if (!existingQuote) {
        throw new NotFoundException(`Quote ${quoteNumber} not found`);
      }

      // Get the policy record
      const policyResult = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, quoteNumber))
        .limit(1);

      if (!policyResult || policyResult.length === 0) {
        throw new NotFoundException(`Policy for quote ${quoteNumber} not found`);
      }

      const policyRecord = policyResult[0];
      const currentSnapshot = policyRecord.quote_snapshot as any;

      // Build updated snapshot with new primary driver and address
      const updatedSnapshot = {
        ...currentSnapshot,
        driver: {
          firstName: driver.firstName,
          lastName: driver.lastName,
          birthDate: driver.birthDate.toISOString().split('T')[0],
          email: driver.email,
          phone: driver.phone,
          gender: driver.gender || null,
          maritalStatus: driver.maritalStatus || null,
        },
        address: {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
        meta: {
          ...currentSnapshot.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      // Recalculate premium (driver age and gender affect rates)
      const newPremium = this.calculatePremiumProgressive({
        driver,
        additionalDrivers: currentSnapshot.additionalDrivers || [],
        vehicles: currentSnapshot.vehicles || [],
        coverages: currentSnapshot.coverages || {},
      });

      // Update premium in snapshot
      updatedSnapshot.premium = {
        total: newPremium,
        monthly: Math.round(newPremium / 6 * 100) / 100,
        sixMonth: newPremium,
      };

      // Update policy record
      await this.db
        .update(policy)
        .set({
          quote_snapshot: updatedSnapshot,
        })
        .where(eq(policy.policy_number, quoteNumber));

      // Update agreement premium
      await this.db
        .update(agreement)
        .set({
          premium_amount: newPremium.toString(),
        })
        .where(eq(agreement.agreement_identifier, policyRecord.policy_identifier));

      this.logger.log('Primary driver updated successfully', { quoteNumber, newPremium });

      return {
        quoteId: quoteNumber,
        quoteNumber,
        premium: newPremium,
        createdAt: new Date(policyRecord.effective_date),
        expiresAt: this.calculateQuoteExpiration(),
      };
    } catch (error) {
      this.logger.error('Failed to update primary driver', error);
      throw error;
    }
  }

  /**
   * Update quote with additional drivers
   *
   * This method updates the quote_snapshot with new driver data and recalculates premium.
   */
  async updateQuoteDrivers(
    quoteNumber: string,
    additionalDrivers: Array<{
      firstName: string;
      lastName: string;
      birthDate: Date;
      email: string;
      phone: string;
      gender?: string;
      maritalStatus?: string;
      yearsLicensed?: number;
      relationship?: string;
    }>
  ): Promise<QuoteResult> {
    this.logger.log('Updating drivers for quote', { quoteNumber, driverCount: additionalDrivers.length });

    try {
      // Fetch existing quote
      const existingQuote = await this.getQuote(quoteNumber);
      if (!existingQuote) {
        throw new NotFoundException(`Quote ${quoteNumber} not found`);
      }

      // Get the policy record
      const policyResult = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, quoteNumber))
        .limit(1);

      if (!policyResult || policyResult.length === 0) {
        throw new NotFoundException(`Policy for quote ${quoteNumber} not found`);
      }

      const policyRecord = policyResult[0];
      const currentSnapshot = policyRecord.quote_snapshot as any;

      // Get primary driver email to filter them out
      const primaryDriverEmail = currentSnapshot.driver?.email;

      // Filter out primary driver from additional drivers (prevent duplicates)
      const filteredDrivers = additionalDrivers.filter(
        d => d.email.toLowerCase() !== primaryDriverEmail?.toLowerCase()
      );

      if (filteredDrivers.length !== additionalDrivers.length) {
        this.logger.warn('Filtered out primary driver from additional drivers', {
          quoteNumber,
          primaryDriverEmail,
          originalCount: additionalDrivers.length,
          filteredCount: filteredDrivers.length,
        });
      }

      // Build updated snapshot with new drivers
      const updatedSnapshot = {
        ...currentSnapshot,
        additionalDrivers: filteredDrivers.map(d => ({
          firstName: d.firstName,
          lastName: d.lastName,
          birthDate: d.birthDate.toISOString().split('T')[0],
          email: d.email,
          phone: d.phone,
          gender: d.gender || null,
          maritalStatus: d.maritalStatus || null,
          yearsLicensed: d.yearsLicensed || null,
          relationship: d.relationship || null,
        })),
        meta: {
          ...currentSnapshot.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      // Recalculate premium with additional drivers
      const newPremium = this.calculatePremiumProgressive({
        driver: currentSnapshot.driver,
        additionalDrivers,
        vehicles: currentSnapshot.vehicles,
        coverages: currentSnapshot.coverages,
      });

      // Update premium in snapshot
      updatedSnapshot.premium = {
        total: newPremium,
        monthly: Math.round(newPremium / 6 * 100) / 100,
        sixMonth: newPremium,
      };

      // Update policy record
      await this.db
        .update(policy)
        .set({
          quote_snapshot: updatedSnapshot,
        })
        .where(eq(policy.policy_number, quoteNumber));

      // Update agreement premium
      await this.db
        .update(agreement)
        .set({
          premium_amount: newPremium.toString(),
        })
        .where(eq(agreement.agreement_identifier, policyRecord.policy_identifier));

      this.logger.log('Drivers updated successfully', { quoteNumber, newPremium });

      return {
        quoteId: quoteNumber,
        quoteNumber,
        premium: newPremium,
        createdAt: new Date(policyRecord.effective_date),
        expiresAt: this.calculateQuoteExpiration(),
      };
    } catch (error) {
      this.logger.error('Failed to update drivers', error);
      throw error;
    }
  }

  /**
   * Update quote with vehicles
   *
   * This method updates the quote_snapshot with vehicle data and recalculates premium.
   */
  async updateQuoteVehicles(
    quoteNumber: string,
    vehicles: Array<{
      year: number;
      make: string;
      model: string;
      vin: string;
      bodyType?: string;
      annualMileage?: number;
      primaryDriverId?: string;
    }>
  ): Promise<QuoteResult> {
    this.logger.log('Updating vehicles for quote', { quoteNumber, vehicleCount: vehicles.length });

    try {
      // Fetch existing quote
      const existingQuote = await this.getQuote(quoteNumber);
      if (!existingQuote) {
        throw new NotFoundException(`Quote ${quoteNumber} not found`);
      }

      // Get the policy record
      const policyResult = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, quoteNumber))
        .limit(1);

      if (!policyResult || policyResult.length === 0) {
        throw new NotFoundException(`Policy for quote ${quoteNumber} not found`);
      }

      const policyRecord = policyResult[0];
      const currentSnapshot = policyRecord.quote_snapshot as any;

      // Build updated snapshot with new vehicles
      const updatedSnapshot = {
        ...currentSnapshot,
        vehicles: vehicles.map(v => ({
          year: v.year,
          make: v.make,
          model: v.model,
          vin: v.vin || null,
          bodyType: v.bodyType || null,
          annualMileage: v.annualMileage || null,
          primaryDriverId: v.primaryDriverId || null,
        })),
        // Also update legacy vehicle field (first vehicle)
        vehicle: vehicles.length > 0 ? {
          year: vehicles[0].year,
          make: vehicles[0].make,
          model: vehicles[0].model,
          vin: vehicles[0].vin || null,
          bodyType: vehicles[0].bodyType || null,
          annualMileage: vehicles[0].annualMileage || null,
        } : null,
        meta: {
          ...currentSnapshot.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      // Recalculate premium with vehicles (MAJOR FACTOR)
      const newPremium = this.calculatePremiumProgressive({
        driver: currentSnapshot.driver,
        additionalDrivers: currentSnapshot.additionalDrivers || [],
        vehicles,
        coverages: currentSnapshot.coverages,
      });

      // Update premium in snapshot
      updatedSnapshot.premium = {
        total: newPremium,
        monthly: Math.round(newPremium / 6 * 100) / 100,
        sixMonth: newPremium,
      };

      // Update policy record
      await this.db
        .update(policy)
        .set({
          quote_snapshot: updatedSnapshot,
        })
        .where(eq(policy.policy_number, quoteNumber));

      // Update agreement premium
      await this.db
        .update(agreement)
        .set({
          premium_amount: newPremium.toString(),
        })
        .where(eq(agreement.agreement_identifier, policyRecord.policy_identifier));

      this.logger.log('Vehicles updated successfully', { quoteNumber, newPremium });

      return {
        quoteId: quoteNumber,
        quoteNumber,
        premium: newPremium,
        createdAt: new Date(policyRecord.effective_date),
        expiresAt: this.calculateQuoteExpiration(),
      };
    } catch (error) {
      this.logger.error('Failed to update vehicles', error);
      throw error;
    }
  }

  /**
   * Update quote with coverage selections and finalize to QUOTED status
   *
   * This method updates coverages and changes status from INCOMPLETE → QUOTED.
   */
  async updateQuoteCoverage(
    quoteNumber: string,
    coverages: {
      startDate?: string;
      bodilyInjuryLimit?: string;
      propertyDamageLimit?: string;
      collision?: boolean;
      collisionDeductible?: number;
      comprehensive?: boolean;
      comprehensiveDeductible?: number;
      uninsuredMotorist?: boolean;
      roadsideAssistance?: boolean;
      rentalReimbursement?: boolean;
      rentalLimit?: number;
    }
  ): Promise<QuoteResult> {
    this.logger.log('Updating coverage and finalizing quote', { quoteNumber });

    try {
      // Fetch existing quote
      const existingQuote = await this.getQuote(quoteNumber);
      if (!existingQuote) {
        throw new NotFoundException(`Quote ${quoteNumber} not found`);
      }

      // Get the policy record
      const policyResult = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, quoteNumber))
        .limit(1);

      if (!policyResult || policyResult.length === 0) {
        throw new NotFoundException(`Policy for quote ${quoteNumber} not found`);
      }

      const policyRecord = policyResult[0];
      const currentSnapshot = policyRecord.quote_snapshot as any;

      // Build updated snapshot with new coverages
      const updatedSnapshot = {
        ...currentSnapshot,
        coverages: {
          startDate: coverages.startDate || null,
          bodilyInjuryLimit: coverages.bodilyInjuryLimit || null,
          propertyDamageLimit: coverages.propertyDamageLimit || null,
          hasCollision: coverages.collision || false,
          collisionDeductible: coverages.collisionDeductible || null,
          hasComprehensive: coverages.comprehensive || false,
          comprehensiveDeductible: coverages.comprehensiveDeductible || null,
          hasUninsured: coverages.uninsuredMotorist || false,
          hasRoadside: coverages.roadsideAssistance || false,
          hasRental: coverages.rentalReimbursement || false,
          rentalLimit: coverages.rentalLimit || null,
        },
        meta: {
          ...currentSnapshot.meta,
          updatedAt: new Date().toISOString(),
          finalizedAt: new Date().toISOString(),
        },
      };

      // Recalculate final premium with all coverages
      const newPremium = this.calculatePremiumProgressive({
        driver: currentSnapshot.driver,
        additionalDrivers: currentSnapshot.additionalDrivers || [],
        vehicles: currentSnapshot.vehicles || [],
        coverages,
      });

      // Update premium in snapshot
      updatedSnapshot.premium = {
        total: newPremium,
        monthly: Math.round(newPremium / 6 * 100) / 100,
        sixMonth: newPremium,
      };

      // Calculate expiration date (30 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      // Update policy record - CHANGE STATUS TO QUOTED
      await this.db
        .update(policy)
        .set({
          quote_snapshot: updatedSnapshot,
          status_code: 'QUOTED',  // ← Status change from INCOMPLETE to QUOTED
          expiration_date: expirationDate.toISOString().split('T')[0],
          coverage_start_date: coverages.startDate || null,
        })
        .where(eq(policy.policy_number, quoteNumber));

      // Update agreement premium
      await this.db
        .update(agreement)
        .set({
          premium_amount: newPremium.toString(),
        })
        .where(eq(agreement.agreement_identifier, policyRecord.policy_identifier));

      this.logger.log('Coverage updated and quote finalized', { quoteNumber, newPremium, status: 'QUOTED' });

      return {
        quoteId: quoteNumber,
        quoteNumber,
        premium: newPremium,
        createdAt: new Date(policyRecord.effective_date),
        expiresAt: expirationDate,
      };
    } catch (error) {
      this.logger.error('Failed to update coverage', error);
      throw error;
    }
  }

  /**
   * Calculate premium progressively (supports incomplete data)
   *
   * This enhanced version can calculate premium at any stage of the quote flow.
   */
  private calculatePremiumProgressive(data: {
    driver: any;
    additionalDrivers?: any[];
    vehicles?: any[];
    coverages?: any;
  }): number {
    // Base premium starts at $1000
    let basePremium = 1000;

    // Driver age factor (primary driver)
    const birthDate = new Date(data.driver.birthDate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    let driverFactor = 1.0;

    if (age < 25) {
      driverFactor = 1.8; // Young drivers higher risk
    } else if (age >= 65) {
      driverFactor = 1.2; // Senior drivers moderate risk
    } else {
      driverFactor = 1.0; // 25-64 baseline
    }

    // Additional drivers factor
    let additionalDriversFactor = 1.0;
    if (data.additionalDrivers && data.additionalDrivers.length > 0) {
      // Each additional driver adds 15% to premium
      additionalDriversFactor = 1 + (data.additionalDrivers.length * 0.15);
    }

    // Vehicle factor (use first vehicle if provided, else assume average)
    let vehicleFactor = 1.0;
    if (data.vehicles && data.vehicles.length > 0) {
      const primaryVehicle = data.vehicles[0];
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - primaryVehicle.year;

      if (vehicleAge <= 3) {
        vehicleFactor = 1.3; // New cars cost more to repair
      } else if (vehicleAge <= 7) {
        vehicleFactor = 1.0; // Mid-age baseline
      } else {
        vehicleFactor = 0.9; // Older cars less valuable
      }

      // Multi-car discount (10% off for each additional vehicle)
      if (data.vehicles.length > 1) {
        const multiCarDiscount = 0.9 - ((data.vehicles.length - 1) * 0.05);
        vehicleFactor *= Math.max(multiCarDiscount, 0.75); // Cap at 25% discount
      }
    }

    // Coverage factor (use actual if provided, else minimum)
    let coverageFactor = 1.0;
    if (data.coverages) {
      // Bodily Injury Liability - Higher limits cost more
      const biLimit = data.coverages.bodilyInjuryLimit || data.coverages.bodilyInjuryLimit;
      if (biLimit === '25/50') coverageFactor += 0.05;       // Minimum
      else if (biLimit === '50/100') coverageFactor += 0.10;  // Standard
      else if (biLimit === '100/300') coverageFactor += 0.15; // Recommended (baseline)
      else if (biLimit === '250/500') coverageFactor += 0.25; // High coverage
      else coverageFactor += 0.15; // Default to recommended

      // Property Damage Liability - Higher limits cost more
      const pdLimit = data.coverages.propertyDamageLimit || data.coverages.propertyDamageLimit;
      if (pdLimit === '25000') coverageFactor += 0.03;      // Minimum
      else if (pdLimit === '50000') coverageFactor += 0.05; // Standard (baseline)
      else if (pdLimit === '100000') coverageFactor += 0.08; // High coverage
      else coverageFactor += 0.05; // Default to standard

      // Collision Coverage - Deductible affects price (higher deductible = lower price)
      if (data.coverages.collision || data.coverages.hasCollision) {
        const collDeductible = data.coverages.collisionDeductible || data.coverages.collisionDeductible;
        if (collDeductible === 250) coverageFactor += 0.35;       // Low deductible = higher premium
        else if (collDeductible === 500) coverageFactor += 0.30;  // Standard deductible
        else if (collDeductible === 1000) coverageFactor += 0.25; // High deductible = lower premium
        else if (collDeductible === 2500) coverageFactor += 0.20; // Very high deductible = much lower premium
        else coverageFactor += 0.30; // Default to standard
      }

      // Comprehensive Coverage - Deductible affects price (higher deductible = lower price)
      if (data.coverages.comprehensive || data.coverages.hasComprehensive) {
        const compDeductible = data.coverages.comprehensiveDeductible || data.coverages.comprehensiveDeductible;
        if (compDeductible === 250) coverageFactor += 0.25;       // Low deductible = higher premium
        else if (compDeductible === 500) coverageFactor += 0.20;  // Standard deductible
        else if (compDeductible === 1000) coverageFactor += 0.15; // High deductible = lower premium
        else if (compDeductible === 2500) coverageFactor += 0.10; // Very high deductible = much lower premium
        else coverageFactor += 0.20; // Default to standard
      }

      // Uninsured/Underinsured Motorist
      if (data.coverages.uninsuredMotorist || data.coverages.hasUninsured) coverageFactor += 0.10;

      // Roadside Assistance
      if (data.coverages.roadsideAssistance || data.coverages.hasRoadside) coverageFactor += 0.05;

      // Rental Reimbursement - Limit affects price
      if (data.coverages.rentalReimbursement || data.coverages.hasRental) {
        const rentalLimit = data.coverages.rentalLimit || data.coverages.rentalLimit;
        if (rentalLimit === 30) coverageFactor += 0.03;      // $30/day
        else if (rentalLimit === 50) coverageFactor += 0.05; // $50/day
        else if (rentalLimit === 75) coverageFactor += 0.07; // $75/day
        else coverageFactor += 0.05; // Default to $50/day
      }
    }

    // Calculate total
    const totalPremium = Math.round(
      basePremium * vehicleFactor * driverFactor * additionalDriversFactor * coverageFactor
    );

    this.logger.debug('Progressive premium calculated', {
      basePremium,
      vehicleFactor,
      driverFactor,
      additionalDriversFactor,
      coverageFactor,
      totalPremium,
    });

    return totalPremium;
  }
}
