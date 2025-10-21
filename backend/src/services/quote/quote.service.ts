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
    this.logger.log('Creating new quote', {
      driverEmail: input.driver.email,
      vehicleVin: input.vehicle.vin
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
        object_description: `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model}`,
      }).returning();

      // Step 6: Create Vehicle (specific vehicle details)
      const vehicleData: any = {
        vehicle_identifier: newInsurableObject.insurable_object_identifier,
        vin: input.vehicle.vin || null,  // Use null instead of empty string for unique constraint
        make: input.vehicle.make,
        model: input.vehicle.model,
        year: input.vehicle.year,
      };

      // Only add optional fields if they have values
      if (input.vehicle.bodyType) vehicleData.body_style = input.vehicle.bodyType;
      if (input.vehicle.annualMileage) vehicleData.annual_mileage = input.vehicle.annualMileage;

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
   * Generate quote number in format: QXXXXX (5 random alphanumeric characters)
   */
  private generateQuoteNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 5; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `Q${suffix}`;
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

    // Vehicle age factor
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - input.vehicle.year;
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
}
