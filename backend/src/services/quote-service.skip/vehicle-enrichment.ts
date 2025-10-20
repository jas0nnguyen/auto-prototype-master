/**
 * Vehicle Enrichment Service (T065)
 *
 * This service takes basic vehicle information (VIN or make/model/year)
 * and "enriches" it with additional data like specifications, value,
 * and safety ratings.
 *
 * WHAT IS "ENRICHMENT"?
 * Like adding toppings to a pizza - you start with basic dough (VIN),
 * then add cheese, sauce, toppings (make, model, trim, value, ratings).
 *
 * The enrichment process:
 * 1. Start with: VIN or Make/Model/Year
 * 2. Call VIN decoder service (mock) to get specifications
 * 3. Call vehicle valuation service to get estimated value
 * 4. Call safety ratings service to get crash test scores
 * 5. Create InsurableObject and Vehicle entities
 * 6. Return enriched vehicle data
 */

import { v4 as uuidv4 } from 'uuid';
import {
  InsurableObject,
  Vehicle,
  VehicleIdentifier,
} from '../../types/omg-entities';
import { isValidVIN } from '../../utils/validators';

/**
 * Input for vehicle enrichment
 *
 * User can provide EITHER:
 * - A VIN (17 characters) - we decode everything from this
 * - Make + Model + Year - we look up specifications
 */
export interface VehicleEnrichmentInput {
  // Option 1: VIN (Vehicle Identification Number)
  vin?: string;

  // Option 2: Manual entry
  year?: number;
  make?: string;
  model?: string;
  trim?: string;

  // Additional optional info
  annual_mileage?: number;
  vehicle_usage?: string;  // 'PERSONAL', 'COMMUTE', 'BUSINESS'
  ownership_status?: string;  // 'OWNED', 'FINANCED', 'LEASED'
}

/**
 * Result from vehicle enrichment
 *
 * Contains the created entities and all enriched data.
 */
export interface VehicleEnrichmentResult {
  /** The Vehicle identifier (UUID) */
  vehicle_identifier: VehicleIdentifier;

  /** The created InsurableObject entity (parent) */
  insurable_object: InsurableObject;

  /** The created Vehicle entity (child) */
  vehicle: Vehicle;

  /** Was VIN decoding successful? */
  vin_decoded: boolean;

  /** Enriched data that was added */
  enriched_data: {
    trim?: string;
    body_type?: string;
    engine_size?: string;
    fuel_type?: string;
    transmission_type?: string;
    estimated_value?: number;
    nhtsa_overall_rating?: number;
    iihs_overall_rating?: string;
  };
}

/**
 * Mock VIN decoder response
 * (In real implementation, this would come from external service)
 */
interface VINDecoderResponse {
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: number;
    trim: string;
    body_type: string;
    engine_size: string;
    fuel_type: string;
    transmission_type: string;
  };
  error?: string;
}

/**
 * Mock vehicle valuation response
 */
interface VehicleValuationResponse {
  success: boolean;
  data?: {
    estimated_value: number;
    value_range: {
      low: number;
      high: number;
    };
  };
}

/**
 * Mock safety ratings response
 */
interface SafetyRatingsResponse {
  success: boolean;
  data?: {
    nhtsa_overall_rating: number;  // 1-5 stars
    iihs_overall_rating: string;   // 'GOOD', 'ACCEPTABLE', 'MARGINAL', 'POOR'
  };
}

/**
 * Vehicle Enrichment Service Class
 */
export class VehicleEnrichmentService {
  /**
   * Enrich vehicle data from VIN or make/model/year
   *
   * This is the main entry point for vehicle enrichment.
   * It orchestrates calls to multiple services to gather
   * comprehensive vehicle information.
   *
   * @param input - Basic vehicle information
   * @returns Promise resolving to enriched vehicle data
   */
  async enrichVehicleData(
    input: VehicleEnrichmentInput
  ): Promise<VehicleEnrichmentResult> {
    /**
     * STEP 1: VALIDATE INPUT
     * Either VIN or (Make + Model + Year) must be provided
     */
    this.validateInput(input);

    /**
     * STEP 2: DECODE VIN (if provided)
     * Calls VIN decoder service to extract vehicle specifications
     */
    let vehicleSpecs: VINDecoderResponse['data'] | undefined;
    let vinDecoded = false;

    if (input.vin) {
      const decoderResponse = await this.callVINDecoderService(input.vin);
      if (decoderResponse.success && decoderResponse.data) {
        vehicleSpecs = decoderResponse.data;
        vinDecoded = true;
      }
    }

    /**
     * STEP 3: DETERMINE FINAL VEHICLE SPECS
     * Use VIN-decoded data if available, otherwise use manual input
     */
    const finalSpecs = {
      make: vehicleSpecs?.make || input.make || 'Unknown',
      model: vehicleSpecs?.model || input.model || 'Unknown',
      year: vehicleSpecs?.year || input.year || new Date().getFullYear(),
      trim: vehicleSpecs?.trim || input.trim,
      body_type: vehicleSpecs?.body_type,
      engine_size: vehicleSpecs?.engine_size,
      fuel_type: vehicleSpecs?.fuel_type,
      transmission_type: vehicleSpecs?.transmission_type,
    };

    /**
     * STEP 4: GET VEHICLE VALUATION
     * Calls valuation service to estimate vehicle worth
     */
    const valuationResponse = await this.callVehicleValuationService(
      finalSpecs.make,
      finalSpecs.model,
      finalSpecs.year
    );

    /**
     * STEP 5: GET SAFETY RATINGS
     * Calls safety ratings service for crash test scores
     */
    const safetyResponse = await this.callSafetyRatingsService(
      finalSpecs.make,
      finalSpecs.model,
      finalSpecs.year
    );

    /**
     * STEP 6: CREATE INSURABLE OBJECT ENTITY
     * InsurableObject is the parent entity for anything that can be insured
     */
    const insurableObject = this.createInsurableObjectEntity(finalSpecs);

    /**
     * STEP 7: CREATE VEHICLE ENTITY
     * Vehicle is a subtype of InsurableObject with vehicle-specific fields
     */
    const vehicle = this.createVehicleEntity(
      input,
      finalSpecs,
      insurableObject.insurable_object_identifier,
      valuationResponse.data,
      safetyResponse.data
    );

    /**
     * STEP 8: RETURN ENRICHED RESULT
     */
    return {
      vehicle_identifier: vehicle.vehicle_identifier,
      insurable_object: insurableObject,
      vehicle,
      vin_decoded: vinDecoded,
      enriched_data: {
        trim: finalSpecs.trim,
        body_type: finalSpecs.body_type,
        engine_size: finalSpecs.engine_size,
        fuel_type: finalSpecs.fuel_type,
        transmission_type: finalSpecs.transmission_type,
        estimated_value: valuationResponse.data?.estimated_value,
        nhtsa_overall_rating: safetyResponse.data?.nhtsa_overall_rating,
        iihs_overall_rating: safetyResponse.data?.iihs_overall_rating,
      },
    };
  }

  /**
   * Validate vehicle enrichment input
   *
   * @param input - The input to validate
   * @throws Error if validation fails
   */
  private validateInput(input: VehicleEnrichmentInput): void {
    // Must have either VIN or (make + model + year)
    const hasVIN = !!input.vin;
    const hasManualEntry = !!(input.make && input.model && input.year);

    if (!hasVIN && !hasManualEntry) {
      throw new Error(
        'Must provide either VIN or (make + model + year)'
      );
    }

    // Validate VIN format if provided
    if (input.vin && !isValidVIN(input.vin)) {
      throw new Error('Invalid VIN format');
    }

    // Validate year range (1900 to next year)
    if (input.year) {
      const currentYear = new Date().getFullYear();
      if (input.year < 1900 || input.year > currentYear + 1) {
        throw new Error(
          `Year must be between 1900 and ${currentYear + 1}`
        );
      }
    }
  }

  /**
   * Call VIN decoder service (MOCK)
   *
   * In a real implementation, this would call an external API like:
   * - NHTSA VIN Decoder API (free, US government)
   * - DataOne VIN Decoder
   * - Edmunds Vehicle API
   *
   * For now, we return mock data based on common VINs.
   *
   * @param vin - The VIN to decode
   * @returns Mock decoder response
   */
  private async callVINDecoderService(
    vin: string
  ): Promise<VINDecoderResponse> {
    /**
     * Simulate API call delay (realistic: 200-500ms)
     */
    await this.delay(300);

    /**
     * Mock VIN database
     * Real implementation would call external API
     */
    const mockVINDatabase: Record<string, VINDecoderResponse['data']> = {
      // 2023 Toyota Camry
      '4T1G11AK5PU123456': {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        trim: 'LE',
        body_type: 'Sedan',
        engine_size: '2.5L I4',
        fuel_type: 'Gasoline',
        transmission_type: 'Automatic',
      },
      // 2022 Honda Civic
      '2HGFC2F59NH123456': {
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        trim: 'Sport',
        body_type: 'Sedan',
        engine_size: '2.0L I4',
        fuel_type: 'Gasoline',
        transmission_type: 'CVT',
      },
      // Add more mock VINs as needed
    };

    const decoded = mockVINDatabase[vin];

    if (decoded) {
      return {
        success: true,
        data: decoded,
      };
    }

    /**
     * If VIN not in our mock database, return generic data
     * based on VIN position patterns (real VIN decoding logic)
     */
    return {
      success: false,
      error: 'VIN not found in decoder database',
    };
  }

  /**
   * Call vehicle valuation service (MOCK)
   *
   * In a real implementation, this would call:
   * - Kelley Blue Book (KBB) API
   * - Edmunds TMV (True Market Value)
   * - Black Book API
   *
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param year - Vehicle year
   * @returns Mock valuation response
   */
  private async callVehicleValuationService(
    make: string,
    model: string,
    year: number
  ): Promise<VehicleValuationResponse> {
    await this.delay(250);

    /**
     * Simple mock valuation logic
     * Real implementation would use actual market data
     *
     * Formula: Base value - depreciation per year
     */
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Base values by make (very simplified)
    const baseValues: Record<string, number> = {
      'Toyota': 28000,
      'Honda': 27000,
      'Ford': 25000,
      'Chevrolet': 24000,
      'Tesla': 45000,
      'BMW': 50000,
      'Mercedes-Benz': 55000,
    };

    const baseValue = baseValues[make] || 20000;

    /**
     * Depreciation calculation
     * - New cars lose ~20% in year 1
     * - Then ~10% per year for years 2-5
     * - Then ~5% per year after that
     */
    let estimatedValue = baseValue;
    if (age === 1) {
      estimatedValue *= 0.8;  // 20% depreciation
    } else if (age <= 5) {
      estimatedValue *= 0.8 * Math.pow(0.9, age - 1);  // 20% + 10% per year
    } else {
      estimatedValue *= 0.8 * Math.pow(0.9, 4) * Math.pow(0.95, age - 5);
    }

    // Round to nearest $100
    estimatedValue = Math.round(estimatedValue / 100) * 100;

    return {
      success: true,
      data: {
        estimated_value: estimatedValue,
        value_range: {
          low: Math.round(estimatedValue * 0.9),
          high: Math.round(estimatedValue * 1.1),
        },
      },
    };
  }

  /**
   * Call safety ratings service (MOCK)
   *
   * In a real implementation, this would call:
   * - NHTSA Safety Ratings API (free)
   * - IIHS Ratings Database
   *
   * @param make - Vehicle make
   * @param model - Vehicle model
   * @param year - Vehicle year
   * @returns Mock safety ratings response
   */
  private async callSafetyRatingsService(
    make: string,
    model: string,
    year: number
  ): Promise<SafetyRatingsResponse> {
    await this.delay(200);

    /**
     * Mock safety ratings database
     * Real implementation would query actual crash test data
     */
    const mockRatings: Record<string, SafetyRatingsResponse['data']> = {
      'Toyota-Camry': {
        nhtsa_overall_rating: 5,
        iihs_overall_rating: 'GOOD',
      },
      'Honda-Civic': {
        nhtsa_overall_rating: 5,
        iihs_overall_rating: 'GOOD',
      },
      'Tesla-Model3': {
        nhtsa_overall_rating: 5,
        iihs_overall_rating: 'GOOD',
      },
    };

    const key = `${make}-${model.replace(/\s+/g, '')}`;
    const ratings = mockRatings[key];

    if (ratings) {
      return {
        success: true,
        data: ratings,
      };
    }

    // Default to average ratings if not found
    return {
      success: true,
      data: {
        nhtsa_overall_rating: 4,  // 4 out of 5 stars
        iihs_overall_rating: 'ACCEPTABLE',
      },
    };
  }

  /**
   * Create InsurableObject entity
   *
   * InsurableObject is the parent entity in the OMG model.
   * It represents anything that can be insured (vehicle, home, etc.).
   *
   * @param specs - Vehicle specifications
   * @returns Created InsurableObject entity
   */
  private createInsurableObjectEntity(
    specs: { make: string; model: string; year: number }
  ): InsurableObject {
    const now = new Date();
    const identifier = uuidv4();

    return {
      insurable_object_identifier: identifier,
      insurable_object_type_code: 'VEHICLE',
      insurable_object_name: `${specs.year} ${specs.make} ${specs.model}`,
      begin_date: now,
      end_date: null,  // Currently valid
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Create Vehicle entity
   *
   * Vehicle is a subtype of InsurableObject with vehicle-specific fields.
   *
   * @param input - Original input
   * @param specs - Vehicle specifications
   * @param insurableObjectId - Parent InsurableObject identifier
   * @param valuation - Valuation data (if available)
   * @param safety - Safety ratings (if available)
   * @returns Created Vehicle entity
   */
  private createVehicleEntity(
    input: VehicleEnrichmentInput,
    specs: any,
    insurableObjectId: string,
    valuation?: VehicleValuationResponse['data'],
    safety?: SafetyRatingsResponse['data']
  ): Vehicle {
    const now = new Date();

    return {
      vehicle_identifier: insurableObjectId,  // Same as parent
      vin: input.vin || '',  // Empty string if not provided
      make: specs.make,
      model: specs.model,
      year: specs.year,
      trim: specs.trim,
      body_type: specs.body_type,
      engine_size: specs.engine_size,
      fuel_type: specs.fuel_type,
      transmission_type: specs.transmission_type,
      vehicle_usage_type: input.vehicle_usage,
      annual_mileage: input.annual_mileage,
      ownership_status: input.ownership_status,
      estimated_value: valuation?.estimated_value,
      nhtsa_overall_rating: safety?.nhtsa_overall_rating,
      iihs_overall_rating: safety?.iihs_overall_rating,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Utility: Simulate async delay
   *
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ============================================================================
 * LEARNING SUMMARY: VEHICLE ENRICHMENT
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. DATA ENRICHMENT
 *    - Start with minimal data (VIN or make/model/year)
 *    - Call external services to add information
 *    - Return comprehensive vehicle profile
 *
 * 2. SERVICE ORCHESTRATION
 *    - Main service coordinates multiple sub-services
 *    - Each sub-service has single responsibility
 *    - Results combined into final output
 *
 * 3. MOCK SERVICES
 *    - Simulate external API behavior
 *    - Return realistic data
 *    - Add realistic delays
 *    - Easier to test than real APIs
 *
 * 4. SUBTYPE PATTERN
 *    - InsurableObject (parent) - generic
 *    - Vehicle (child) - specific
 *    - vehicle_identifier = insurable_object_identifier
 *
 * 5. FALLBACK LOGIC
 *    - Try VIN decoder first
 *    - Fall back to manual entry if VIN fails
 *    - Provide default values when services fail
 *
 * REAL-WORLD ANALOGY:
 *
 * Vehicle enrichment is like buying a used car:
 * 1. Start with: License plate number (VIN)
 * 2. Look up: Registration records (VIN decoder)
 * 3. Check: Market value (valuation service)
 * 4. Review: Safety history (crash test ratings)
 * 5. Result: Complete car profile with price, specs, safety
 *
 * NEXT STEPS:
 * - Implement actual VIN decoder API integration
 * - Add caching for valuation lookups (avoid repeated API calls)
 * - Implement vehicle image lookup
 * - Add more comprehensive safety data (crash test videos, ratings detail)
 */
