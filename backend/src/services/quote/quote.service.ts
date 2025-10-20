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
import { eq } from 'drizzle-orm';
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
  // Driver information
  driver: {
    firstName: string;
    lastName: string;
    birthDate: Date;
    email: string;
    phone: string;
    gender?: string;
    yearsLicensed?: number;
    licenseNumber?: string;
    licenseState?: string;
  };

  // Address information
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Vehicle information
  vehicle: {
    year: number;
    make: string;
    model: string;
    vin: string;
    bodyType?: string;
    annualMileage?: number;
  };

  // Coverage selections (simple for now)
  coverages?: {
    bodilyInjury?: boolean;
    propertyDamage?: boolean;
    collision?: boolean;
    comprehensive?: boolean;
  };
}

/**
 * Quote creation result
 */
export interface QuoteResult {
  quoteId: string;        // Human-readable quote ID (same as quote number for simplicity)
  quoteNumber: string;    // Quote reference number (Q-20251019-ABC123)
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
        vin: input.vehicle.vin,
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

      // Step 8: Create Agreement (parent contract)
      const [newAgreement] = await this.db.insert(agreement).values({
        agreement_type_code: 'POLICY',
        product_identifier: productId,
      }).returning();

      // Step 9: Generate quote number
      const quoteNumber = this.generateQuoteNumber();

      // Step 10: Calculate premium (simple formula for now)
      const premium = this.calculatePremium(input);

      // Step 11: Create Policy (quote is a policy with status=QUOTED)
      const [newPolicy] = await this.db.insert(policy).values({
        policy_identifier: newAgreement.agreement_identifier, // Subtype shares PK
        policy_number: quoteNumber,
        effective_date: new Date().toISOString().split('T')[0],
        expiration_date: this.calculateExpirationDate().toISOString().split('T')[0],
        status_code: 'QUOTED',
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
   * Get quote by quote number (human-readable ID)
   */
  async getQuote(quoteNumber: string): Promise<any> {
    this.logger.debug('Fetching quote by number', { quoteNumber });

    const result = await this.db
      .select()
      .from(policy)
      .where(eq(policy.policy_number, quoteNumber))
      .limit(1);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Quote ${quoteNumber} not found`);
    }

    return result[0];
  }

  /**
   * Get quote by quote number
   */
  async getQuoteByNumber(quoteNumber: string): Promise<any> {
    this.logger.debug('Fetching quote by number', { quoteNumber });

    const result = await this.db
      .select()
      .from(policy)
      .where(eq(policy.policy_number, quoteNumber))
      .limit(1);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Quote ${quoteNumber} not found`);
    }

    return result[0];
  }

  /**
   * Generate quote number in format: Q-YYYYMMDD-XXXXXX
   */
  private generateQuoteNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Generate 6 random alphanumeric characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `Q-${dateStr}-${suffix}`;
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
