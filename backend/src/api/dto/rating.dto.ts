/**
 * Rating Engine Data Transfer Objects (DTOs)
 *
 * DTOs are like "forms" that define exactly what data should look like
 * when it comes into the API (Request DTOs) and goes out (Response DTOs).
 *
 * Think of DTOs as:
 * - REQUEST DTOs = Forms you fill out to submit data
 * - RESPONSE DTOs = Receipts you get back with information
 *
 * Why use DTOs?
 * 1. Type Safety: TypeScript knows exactly what fields exist
 * 2. Validation: We can validate data matches the expected shape
 * 3. Documentation: Other developers know what to send/expect
 * 4. Consistency: All API responses follow the same patterns
 */

/**
 * Request DTO for calculating premium
 *
 * This is what the frontend sends to the backend when requesting
 * a premium calculation. It's like a form with all the information
 * needed to calculate insurance rates.
 */
export class CalculatePremiumRequestDto {
  // === VEHICLE INFORMATION ===

  /** Vehicle year (e.g., 2023) - newer vehicles may cost more to insure */
  vehicle_year: number;

  /** Vehicle make (e.g., 'Toyota') - luxury brands cost more */
  vehicle_make: string;

  /** Vehicle model (e.g., 'Camry') - sports cars cost more */
  vehicle_model: string;

  /** Vehicle VIN (optional) - 17 characters, provides exact vehicle details */
  vehicle_vin?: string;

  /** Estimated vehicle value in USD - higher value = higher premium */
  vehicle_value?: number;

  /** How the vehicle is used: 'PERSONAL', 'COMMUTE', 'BUSINESS' */
  vehicle_usage?: string;

  /** Miles driven per year - more miles = higher risk */
  annual_mileage?: number;

  // === DRIVER INFORMATION ===

  /** Driver's date of birth - younger drivers pay more */
  driver_birth_date: Date;

  /** Gender (where allowed by state law): 'M', 'F', 'O', 'U' */
  driver_gender?: string;

  /** Marital status - married drivers often get discounts */
  driver_marital_status?: string;

  /** Years of driving experience - more experience = lower rates */
  driver_years_licensed?: number;

  /** Number of accidents in last 3 years - increases premium */
  driver_accident_count?: number;

  /** Number of violations/tickets in last 3 years - increases premium */
  driver_violation_count?: number;

  /** Has completed defensive driving course - eligible for discount */
  driver_has_defensive_driving?: boolean;

  // === LOCATION INFORMATION ===

  /** ZIP code where vehicle is garaged - urban areas cost more */
  location_zip_code: string;

  /** State code (e.g., 'CA', 'NY') - rates vary by state */
  location_state_code: string;

  /** Is location in urban area? - urban = higher risk */
  location_is_urban?: boolean;

  // === COVERAGE INFORMATION ===

  /**
   * Bodily Injury Liability limit (e.g., '100000/300000')
   * Format: per-person/per-accident
   * Required by law in most states
   */
  coverage_bodily_injury_limit?: string;

  /**
   * Property Damage Liability limit (e.g., '50000')
   * Covers damage to other people's property
   */
  coverage_property_damage_limit?: string;

  /**
   * Collision deductible (amount you pay before insurance kicks in)
   * Common values: 500, 1000, 2500
   * Higher deductible = lower premium
   */
  coverage_collision_deductible?: number;

  /**
   * Comprehensive deductible (for theft, weather, vandalism)
   * Higher deductible = lower premium
   */
  coverage_comprehensive_deductible?: number;

  /** Include Uninsured Motorist coverage? */
  coverage_uninsured_motorist?: boolean;

  /** Include Medical Payments coverage? */
  coverage_medical_payments?: boolean;

  /** Include Rental Reimbursement coverage? */
  coverage_rental_reimbursement?: boolean;

  /** Include Roadside Assistance coverage? */
  coverage_roadside_assistance?: boolean;
}

/**
 * Response DTO for premium calculation
 *
 * This is what the backend sends back to the frontend after
 * calculating the premium. It's like a detailed receipt showing
 * exactly how the final price was calculated.
 */
export class CalculatePremiumResponseDto {
  // === PREMIUM BREAKDOWN ===

  /**
   * Base premium before any factors applied
   * This is the starting point for all calculations
   */
  base_premium: number;

  /**
   * Final premium amount (what the customer pays)
   * base_premium × all factors + taxes + fees
   */
  final_premium: number;

  // === RATING FACTORS ===
  // These are multipliers applied to the base premium
  // Each factor is a decimal number (1.0 = no change, 1.2 = 20% increase, 0.9 = 10% decrease)

  /**
   * Vehicle rating factors with their weights
   * Example: { age: 1.05, make: 1.1, model: 0.95, safety: 0.9 }
   */
  vehicle_factors: Record<string, number>;

  /**
   * Driver rating factors with their weights
   * Example: { age: 1.2, experience: 0.95, violations: 1.15 }
   */
  driver_factors: Record<string, number>;

  /**
   * Location rating factors with their weights
   * Example: { zip_code: 1.1, urban_rural: 1.05 }
   */
  location_factors: Record<string, number>;

  /**
   * Coverage rating factors with their weights
   * Example: { collision: 1.3, comprehensive: 1.2, liability: 1.0 }
   */
  coverage_factors: Record<string, number>;

  // === DISCOUNTS ===
  // Discounts reduce the premium (negative impact on final cost)

  /**
   * Applied discounts with their values
   * Example: { multi_policy: -50, good_driver: -75, defensive_driving: -25 }
   */
  discounts: Record<string, number>;

  /** Total discount amount (sum of all discounts) */
  total_discounts: number;

  // === SURCHARGES ===
  // Surcharges increase the premium (positive impact on final cost)

  /**
   * Applied surcharges with their values
   * Example: { young_driver: 200, accident_history: 150 }
   */
  surcharges: Record<string, number>;

  /** Total surcharge amount (sum of all surcharges) */
  total_surcharges: number;

  // === TAXES & FEES ===

  /**
   * Taxes and fees by type
   * Example: { state_tax: 24, policy_fee: 15, dmv_fee: 10 }
   */
  taxes_and_fees: Record<string, number>;

  /** Total tax and fee amount */
  total_taxes_and_fees: number;

  // === METADATA ===

  /** When this calculation was performed (ISO 8601 timestamp) */
  calculation_timestamp: string;

  /** Unique identifier for this calculation (for audit trail) */
  calculation_id: string;

  /** Quote number if this calculation is associated with a quote */
  quote_number?: string;
}

/**
 * LEARNING NOTE: What is a Record<string, number>?
 *
 * Record<string, number> means "an object with string keys and number values"
 *
 * Example:
 * const factors: Record<string, number> = {
 *   age: 1.2,          // string key: 'age', number value: 1.2
 *   experience: 0.95,  // string key: 'experience', number value: 0.95
 * };
 *
 * It's like a dictionary where:
 * - Keys are always strings (the name of the factor)
 * - Values are always numbers (the multiplier or amount)
 */
