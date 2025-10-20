/**
 * Quote Service (T063) - Main Service
 *
 * This is the "conductor" service that orchestrates quote operations.
 * It coordinates calls to other specialized services (party creation,
 * vehicle enrichment, policy creation, coverage assignment, etc.).
 *
 * CRUD = Create, Read, Update, Delete
 * This service implements all CRUD operations for quotes.
 */

import { v4 as uuidv4 } from 'uuid';
import { PartyCreationService } from './party-creation';
import { VehicleEnrichmentService } from './vehicle-enrichment';
import {
  Policy,
  PolicyStatusCode,
  QuoteStatusCode,
} from '../../types/omg-entities';

/**
 * Create Quote Input (from API)
 */
export interface CreateQuoteInput {
  // Driver info
  driver_first_name: string;
  driver_last_name: string;
  driver_birth_date: Date;
  driver_email: string;
  driver_phone: string;
  driver_gender?: string;
  driver_years_licensed?: number;

  // Address
  address_line_1: string;
  address_city: string;
  address_state: string;
  address_zip: string;

  // Vehicle
  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_vin?: string;
  annual_mileage?: number;

  // Coverage preferences
  coverage_bodily_injury?: string;
  coverage_property_damage?: string;
  coverage_collision_deductible?: number;
  coverage_comprehensive_deductible?: number;
}

/**
 * Quote Service Class
 */
export class QuoteService {
  private partyService: PartyCreationService;
  private vehicleService: VehicleEnrichmentService;

  constructor() {
    this.partyService = new PartyCreationService();
    this.vehicleService = new VehicleEnrichmentService();
  }

  /**
   * Create a new quote
   *
   * This is the main method that creates a complete quote:
   * 1. Create Party/Person entities
   * 2. Enrich vehicle data
   * 3. Create Policy with status=QUOTED
   * 4. Assign coverages
   * 5. Calculate premium
   * 6. Return quote data
   */
  async createQuote(input: CreateQuoteInput): Promise<any> {
    try {
      // Step 1: Create Party/Person
      const partyResult = await this.partyService.createPartyFromQuoteInput({
        first_name: input.driver_first_name,
        last_name: input.driver_last_name,
        birth_date: input.driver_birth_date,
        email: input.driver_email,
        phone: input.driver_phone,
        gender_code: input.driver_gender,
        address_line_1: input.address_line_1,
        city: input.address_city,
        state: input.address_state,
        zip_code: input.address_zip,
      });

      // Step 2: Enrich vehicle data
      const vehicleResult = await this.vehicleService.enrichVehicleData({
        vin: input.vehicle_vin,
        year: input.vehicle_year,
        make: input.vehicle_make,
        model: input.vehicle_model,
        annual_mileage: input.annual_mileage,
      });

      // Step 3: Create Policy with QUOTED status
      const quoteNumber = this.generateQuoteNumber();
      const policy = this.createQuotedPolicy(
        quoteNumber,
        partyResult.party_identifier,
        vehicleResult.vehicle_identifier
      );

      // Step 4: TODO - Assign coverages (T067)
      // Step 5: TODO - Calculate premium (rating engine)

      // Return quote summary
      return {
        quote_id: policy.policy_identifier,
        quote_number: quoteNumber,
        quote_status: QuoteStatusCode.ACTIVE,
        driver: {
          party_id: partyResult.party_identifier,
          full_name: partyResult.party.party_name,
          email: input.driver_email,
        },
        vehicle: {
          vehicle_id: vehicleResult.vehicle_identifier,
          description: vehicleResult.insurable_object.insurable_object_name,
          vin: vehicleResult.vehicle.vin,
        },
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[QuoteService] Error creating quote:', error);
      throw error;
    }
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(quoteId: string): Promise<any> {
    // TODO: Query database
    throw new Error('Not implemented - requires database integration');
  }

  /**
   * Get quote by quote number
   */
  async getQuoteByNumber(quoteNumber: string): Promise<any> {
    // TODO: Query database
    throw new Error('Not implemented - requires database integration');
  }

  /**
   * Update quote coverage
   */
  async updateQuoteCoverage(quoteId: string, coverages: any): Promise<any> {
    // TODO: Update coverage and recalculate premium
    throw new Error('Not implemented');
  }

  /**
   * Generate unique quote number
   * Format: QTE-YYYY-NNNNNN
   * Example: QTE-2025-123456
   */
  private generateQuoteNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `QTE-${year}-${randomNum}`;
  }

  /**
   * Create Policy entity with QUOTED status
   */
  private createQuotedPolicy(
    quoteNumber: string,
    partyId: string,
    vehicleId: string
  ): Policy {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 30); // 30-day quote validity

    return {
      policy_identifier: uuidv4(),
      policy_number: quoteNumber,
      policy_status_code: QuoteStatusCode.ACTIVE as any,
      geographic_location_identifier: '', // TODO: Create from address
      effective_date: now,
      expiration_date: expirationDate,
      quote_number: quoteNumber,
      quote_expiration_date: expirationDate,
      total_premium_amount: 0, // TODO: Calculate
      total_premium_currency: 'USD',
      created_at: now,
      updated_at: now,
    };
  }
}
