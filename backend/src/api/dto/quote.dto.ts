/**
 * Quote Service Data Transfer Objects (DTOs)
 *
 * These DTOs define the shape of data for quote-related API endpoints.
 * They serve as contracts between the frontend and backend.
 */

/**
 * Create Quote Request DTO
 *
 * This is what the frontend sends when a customer starts a new quote.
 * It contains all the information collected from the quote flow pages.
 */
export class CreateQuoteRequestDto {
  // === DRIVER INFORMATION (from DriverInfo page) ===

  /** Driver's first name */
  driver_first_name: string;

  /** Driver's last name */
  driver_last_name: string;

  /** Driver's date of birth (YYYY-MM-DD format) */
  driver_birth_date: string;

  /** Driver's email address */
  driver_email: string;

  /** Driver's phone number */
  driver_phone: string;

  /** Driver's gender (optional, where permitted by law) */
  driver_gender?: string;

  /** Years the driver has been licensed */
  driver_years_licensed?: number;

  // === ADDRESS INFORMATION ===

  /** Street address (line 1) */
  address_line_1: string;

  /** Apartment/unit number (line 2, optional) */
  address_line_2?: string;

  /** City name */
  address_city: string;

  /** State code (e.g., 'CA') */
  address_state: string;

  /** ZIP code */
  address_zip: string;

  // === VEHICLE INFORMATION (from VehicleInfo page) ===

  /** Vehicle year */
  vehicle_year: number;

  /** Vehicle make (e.g., 'Toyota') */
  vehicle_make: string;

  /** Vehicle model (e.g., 'Camry') */
  vehicle_model: string;

  /** Vehicle VIN (optional, 17 characters) */
  vehicle_vin?: string;

  /** Vehicle usage type: 'PERSONAL', 'COMMUTE', 'BUSINESS' */
  vehicle_usage?: string;

  /** Estimated annual mileage */
  annual_mileage?: number;

  // === COVERAGE INFORMATION (from CoverageSelection page) ===

  /** Bodily Injury Liability limit (e.g., '100000/300000') */
  coverage_bodily_injury?: string;

  /** Property Damage Liability limit (e.g., '50000') */
  coverage_property_damage?: string;

  /** Collision deductible amount */
  coverage_collision_deductible?: number;

  /** Comprehensive deductible amount */
  coverage_comprehensive_deductible?: number;

  /** Include Uninsured Motorist coverage? */
  include_uninsured_motorist?: boolean;

  /** Include Medical Payments coverage? */
  include_medical_payments?: boolean;

  /** Include Rental Reimbursement coverage? */
  include_rental_reimbursement?: boolean;

  /** Include Roadside Assistance coverage? */
  include_roadside_assistance?: boolean;
}

/**
 * Update Coverage Request DTO
 *
 * This is used when the customer changes their coverage selections
 * and wants to recalculate the premium without creating a new quote.
 */
export class UpdateCoverageRequestDto {
  /** Bodily Injury Liability limit */
  coverage_bodily_injury?: string;

  /** Property Damage Liability limit */
  coverage_property_damage?: string;

  /** Collision deductible amount */
  coverage_collision_deductible?: number;

  /** Comprehensive deductible amount */
  coverage_comprehensive_deductible?: number;

  /** Include Uninsured Motorist coverage? */
  include_uninsured_motorist?: boolean;

  /** Include Medical Payments coverage? */
  include_medical_payments?: boolean;

  /** Include Rental Reimbursement coverage? */
  include_rental_reimbursement?: boolean;

  /** Include Roadside Assistance coverage? */
  include_roadside_assistance?: boolean;
}

/**
 * Quote Response DTO
 *
 * This is what the backend sends back when returning quote information.
 * It includes everything the frontend needs to display the quote.
 */
export class QuoteResponseDto {
  // === QUOTE IDENTIFIERS ===

  /** Unique quote identifier (UUID) */
  quote_id: string;

  /** Human-readable quote number (e.g., 'QTE-2025-123456') */
  quote_number: string;

  /** Quote status: 'DRAFT', 'ACTIVE', 'CONVERTED', 'EXPIRED' */
  quote_status: string;

  // === DRIVER INFORMATION ===

  driver: {
    /** Driver's party identifier (UUID) */
    party_id: string;
    /** Full name */
    full_name: string;
    /** Email address */
    email: string;
    /** Phone number */
    phone: string;
    /** Date of birth */
    birth_date: string;
    /** Years licensed */
    years_licensed?: number;
  };

  // === ADDRESS INFORMATION ===

  address: {
    /** Full address line 1 */
    line_1: string;
    /** Full address line 2 (optional) */
    line_2?: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** ZIP code */
    zip: string;
  };

  // === VEHICLE INFORMATION ===

  vehicle: {
    /** Vehicle identifier (UUID) */
    vehicle_id: string;
    /** VIN (if provided) */
    vin?: string;
    /** Year */
    year: number;
    /** Make */
    make: string;
    /** Model */
    model: string;
    /** Trim level (if known) */
    trim?: string;
    /** Estimated value */
    estimated_value?: number;
    /** Annual mileage */
    annual_mileage?: number;
    /** Usage type */
    usage_type?: string;
  };

  // === COVERAGE INFORMATION ===

  coverages: Array<{
    /** Coverage identifier */
    coverage_id: string;
    /** Coverage type code (e.g., 'BI_LIABILITY') */
    coverage_code: string;
    /** Display name (e.g., 'Bodily Injury Liability') */
    coverage_name: string;
    /** Limit amount (if applicable) */
    limit_amount?: number;
    /** Deductible amount (if applicable) */
    deductible_amount?: number;
    /** Individual premium for this coverage */
    premium_amount: number;
  }>;

  // === PREMIUM INFORMATION ===

  premium: {
    /** Subtotal before discounts, surcharges, taxes, and fees */
    subtotal: number;
    /** Total discounts applied (negative number) */
    total_discounts: number;
    /** Total surcharges applied (positive number) */
    total_surcharges: number;
    /** Taxes and fees */
    total_taxes_and_fees: number;
    /** Final premium amount */
    total_premium: number;
    /** Currency code (e.g., 'USD') */
    currency: string;
  };

  // === PREMIUM BREAKDOWN (detailed) ===

  premium_breakdown: {
    /** List of applied discounts */
    discounts: Array<{
      /** Discount name */
      name: string;
      /** Discount amount (negative) */
      amount: number;
    }>;
    /** List of applied surcharges */
    surcharges: Array<{
      /** Surcharge name */
      name: string;
      /** Surcharge amount (positive) */
      amount: number;
    }>;
    /** List of taxes and fees */
    taxes_and_fees: Array<{
      /** Tax/fee name */
      name: string;
      /** Tax/fee amount */
      amount: number;
    }>;
  };

  // === QUOTE METADATA ===

  /** Date quote was created */
  created_at: string;

  /** Date quote was last updated */
  updated_at: string;

  /** Date quote expires (typically 30 days from creation) */
  expiration_date: string;

  /** Days remaining before quote expires */
  days_until_expiration: number;

  /** Is this quote expired? */
  is_expired: boolean;

  /** Can this quote be converted to a policy? */
  can_bind: boolean;
}

/**
 * Quote Summary Response DTO (for lists)
 *
 * A lighter version of QuoteResponseDto used when returning
 * multiple quotes (e.g., in a customer's quote history).
 */
export class QuoteSummaryDto {
  /** Quote identifier */
  quote_id: string;

  /** Quote number */
  quote_number: string;

  /** Quote status */
  quote_status: string;

  /** Driver name */
  driver_name: string;

  /** Vehicle description (e.g., '2023 Toyota Camry') */
  vehicle_description: string;

  /** Total premium amount */
  total_premium: number;

  /** Created date */
  created_at: string;

  /** Expiration date */
  expiration_date: string;

  /** Is expired? */
  is_expired: boolean;
}

/**
 * LEARNING NOTE: Why use separate Create/Update/Response DTOs?
 *
 * 1. CREATE DTO: Only fields needed to create a new resource
 *    - No IDs (those are generated by the server)
 *    - No timestamps (also generated by server)
 *
 * 2. UPDATE DTO: Only fields that can be changed
 *    - Usually a subset of create fields
 *    - Often has optional fields (only update what's provided)
 *
 * 3. RESPONSE DTO: Everything the client needs to display the resource
 *    - Includes IDs, timestamps
 *    - May include calculated fields (like days_until_expiration)
 *    - Often includes related data (like driver info nested in quote)
 *
 * This separation provides:
 * - Clear API contracts
 * - Better security (clients can't set server-generated fields)
 * - Type safety (different endpoints accept different shapes)
 */
