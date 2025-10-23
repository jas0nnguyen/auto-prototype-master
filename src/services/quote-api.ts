/**
 * Quote API Client Service (T077)
 *
 * This service handles all HTTP communication with the backend quote API.
 * It's like a messenger that carries data between frontend and backend.
 *
 * WHY A SEPARATE SERVICE FILE?
 * - Centralizes all API calls in one place
 * - Easy to change API URLs (one place to update)
 * - Reusable across components
 * - Can mock for testing
 */

/**
 * Quote data types (matching backend DTOs)
 */
export interface CreateQuoteRequest {
  // NEW: Multi-driver/vehicle support
  drivers?: Array<{
    first_name: string;
    last_name: string;
    birth_date: string;
    email: string;
    phone: string;
    gender?: string;
    marital_status?: string;
    years_licensed?: number;
    relationship?: string;
    is_primary?: boolean;
  }>;
  vehicles?: Array<{
    year: number;
    make: string;
    model: string;
    vin?: string;
    annual_mileage?: number;
    body_type?: string;
    usage?: string;
    primary_driver_id?: string;
  }>;

  // LEGACY: Single driver info (backward compatibility)
  driver_first_name?: string;
  driver_last_name?: string;
  driver_birth_date?: string;
  driver_email?: string;
  driver_phone?: string;
  driver_gender?: string;
  driver_marital_status?: string;
  driver_years_licensed?: number;

  // Address (applies to primary driver)
  address_line_1: string;
  address_line_2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;

  // LEGACY: Single vehicle info (backward compatibility)
  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_vin?: string;
  annual_mileage?: number;
  vehicle_usage?: string;
  vehicle_annual_mileage?: number;
  vehicle_body_type?: string;

  // Coverage selections (EXPANDED for complete quote data)
  coverage_start_date?: string;  // NEW
  coverage_bodily_injury_limit?: string;  // NEW
  coverage_property_damage_limit?: string;  // NEW
  coverage_has_collision?: boolean;  // NEW
  coverage_collision_deductible?: number;
  coverage_has_comprehensive?: boolean;  // NEW
  coverage_comprehensive_deductible?: number;
  coverage_has_uninsured?: boolean;  // NEW
  coverage_has_roadside?: boolean;  // NEW
  coverage_has_rental?: boolean;  // NEW
  coverage_rental_limit?: number;  // NEW

  // Keep legacy fields for backward compatibility
  coverage_bodily_injury?: string;
  coverage_property_damage?: string;
  include_uninsured_motorist?: boolean;
  include_medical_payments?: boolean;
  include_rental_reimbursement?: boolean;
  include_roadside_assistance?: boolean;
}

export interface QuoteResponse {
  quote_number: string;
  quote_status?: string;
  policy_id?: string;
  effective_date?: string;
  expiration_date?: string;
  created_at?: string;
  // Primary driver (PNI)
  driver?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: string;
    maritalStatus?: string;
    birthDate?: string;
    yearsLicensed?: number;
    isPrimary?: boolean;
  };
  // ALL additional drivers
  additionalDrivers?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: string;
    maritalStatus?: string;
    birthDate?: string;
    yearsLicensed?: number;
    relationship?: string;
  }>;
  // Primary vehicle (backward compatibility)
  vehicle?: {
    year: number;
    make: string;
    model: string;
    vin?: string;
    bodyType?: string;
    annualMileage?: number;
  };
  // ALL vehicles
  vehicles?: Array<{
    year: number;
    make: string;
    model: string;
    vin?: string;
    bodyType?: string;
    annualMileage?: number;
    primaryDriverId?: string;
  }>;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  coverages?: {
    startDate?: string;
    bodilyInjuryLimit?: string;
    propertyDamageLimit?: string;
    hasCollision?: boolean;
    collisionDeductible?: number;
    hasComprehensive?: boolean;
    comprehensiveDeductible?: number;
    hasUninsured?: boolean;
    hasRoadside?: boolean;
    hasRental?: boolean;
    rentalLimit?: number;
  };
  premium?: {
    total: number;
    monthly: number;
    sixMonth: number;
  };
  // Legacy fields for backward compatibility
  quoteId?: string;
  quoteNumber?: string;
  createdAt?: Date;
  expiresAt?: Date;
}

/**
 * Quote API Service Class
 *
 * This class provides methods for all quote-related API operations.
 */
class QuoteApiService {
  /**
   * Base API URL
   *
   * Uses VITE_API_BASE_URL environment variable if set, otherwise falls back to:
   * - Development: '/api/v1' (proxied by Vite to localhost:3000)
   * - Production: Must set VITE_API_BASE_URL to deployed backend URL
   *
   * For Vercel deployment without backend, you can:
   * 1. Run backend locally and use ngrok/tunnel
   * 2. Deploy backend separately and set VITE_API_BASE_URL
   * 3. Use Vercel serverless functions (requires backend conversion)
   */
  private baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  /**
   * Create a new quote
   *
   * POST /api/v1/quotes
   *
   * @param data - Quote creation data
   * @returns Promise resolving to created quote
   *
   * ASYNC/AWAIT EXPLAINED (again, but from frontend perspective):
   * - fetch() returns a Promise (like an IOU for data)
   * - await pauses until the Promise resolves
   * - Lets you write async code that looks synchronous
   */
  async createQuote(data: CreateQuoteRequest): Promise<QuoteResponse> {
    try {
      /**
       * fetch() API
       *
       * Built-in browser API for making HTTP requests.
       * Modern replacement for XMLHttpRequest.
       *
       * Returns a Promise<Response>
       */
      const response = await fetch(`${this.baseUrl}/quotes`, {
        method: 'POST',              // HTTP method (POST = create)
        headers: {
          'Content-Type': 'application/json',  // Tell server we're sending JSON
        },
        body: JSON.stringify(data),  // Convert JavaScript object to JSON string
      });

      /**
       * Check if response is successful (status 200-299)
       */
      if (!response.ok) {
        /**
         * Parse error response
         */
        const error = await response.json();
        throw new Error(error.message || 'Failed to create quote');
      }

      /**
       * Parse successful response
       *
       * .json() returns a Promise, so we await it
       */
      const result = await response.json();

      /**
       * Backend returns the quote directly (not wrapped)
       * {
       *   quoteId: '...',
       *   quoteNumber: '...',
       *   premium: 1950,
       *   createdAt: Date,
       *   expiresAt: Date
       * }
       */
      return result;

    } catch (error) {
      /**
       * Error handling
       *
       * Re-throw the error so the calling code can handle it
       * (usually displayed to the user via UI)
       */
      console.error('[QuoteAPI] Error creating quote:', error);
      throw error;
    }
  }

  /**
   * Get quote by ID
   *
   * GET /api/v1/quotes/:id
   *
   * @param quoteId - Quote identifier (UUID)
   * @returns Promise resolving to quote data
   */
  async getQuoteById(quoteId: string): Promise<QuoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/quotes/${quoteId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch quote');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error fetching quote:', error);
      throw error;
    }
  }

  /**
   * Get quote by quote number
   *
   * GET /api/v1/quotes/reference/:refNumber
   *
   * @param quoteNumber - Quote number (e.g., 'QTE-2025-123456')
   * @returns Promise resolving to quote data
   */
  async getQuoteByNumber(quoteNumber: string): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/reference/${quoteNumber}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch quote');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error fetching quote by number:', error);
      throw error;
    }
  }

  /**
   * Update primary driver information
   *
   * PUT /api/v1/quotes/:quoteNumber/primary-driver
   *
   * @param quoteNumber - Quote number (e.g., 'QZ2610')
   * @param driverData - Updated primary driver and address data
   * @returns Promise resolving to updated quote with new premium
   */
  async updatePrimaryDriver(
    quoteNumber: string,
    driverData: {
      driver_first_name: string;
      driver_last_name: string;
      driver_birth_date: string;
      driver_email: string;
      driver_phone: string;
      driver_gender?: string;
      driver_marital_status?: string;
      address_line_1: string;
      address_line_2?: string;
      address_city: string;
      address_state: string;
      address_zip: string;
    }
  ): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteNumber}/primary-driver`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(driverData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update primary driver');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error updating primary driver:', error);
      throw error;
    }
  }

  /**
   * Update quote with additional drivers
   *
   * PUT /api/v1/quotes/:quoteNumber/drivers
   *
   * @param quoteNumber - Quote number (e.g., 'QZ2610')
   * @param additionalDrivers - Array of additional drivers to add
   * @returns Promise resolving to updated quote with new premium
   */
  async updateQuoteDrivers(
    quoteNumber: string,
    additionalDrivers: Array<{
      first_name: string;
      last_name: string;
      birth_date: string;
      email: string;
      phone: string;
      gender?: string;
      marital_status?: string;
      years_licensed?: number;
      relationship?: string;
    }>
  ): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteNumber}/drivers`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ additionalDrivers }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update drivers');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error updating drivers:', error);
      throw error;
    }
  }

  /**
   * Update quote with vehicles
   *
   * PUT /api/v1/quotes/:quoteNumber/vehicles
   *
   * @param quoteNumber - Quote number (e.g., 'QZ2610')
   * @param vehicles - Array of vehicles to add/update
   * @returns Promise resolving to updated quote with new premium
   */
  async updateQuoteVehicles(
    quoteNumber: string,
    vehicles: Array<{
      year: number;
      make: string;
      model: string;
      vin?: string;
      body_type?: string;
      annual_mileage?: number;
      primary_driver_id?: string;
    }>
  ): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteNumber}/vehicles`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vehicles }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update vehicles');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error updating vehicles:', error);
      throw error;
    }
  }

  /**
   * Update quote coverage and finalize quote
   *
   * PUT /api/v1/quotes/:quoteNumber/coverage
   *
   * @param quoteNumber - Quote number (e.g., 'QZ2610')
   * @param coverageData - Updated coverage selections
   * @returns Promise resolving to updated quote (status: QUOTED)
   */
  async updateQuoteCoverage(
    quoteNumber: string,
    coverageData: {
      coverage_start_date?: string;
      coverage_bodily_injury_limit?: string;
      coverage_property_damage_limit?: string;
      coverage_collision?: boolean;
      coverage_collision_deductible?: number;
      coverage_comprehensive?: boolean;
      coverage_comprehensive_deductible?: number;
      coverage_uninsured_motorist?: boolean;
      coverage_roadside_assistance?: boolean;
      coverage_rental_reimbursement?: boolean;
      coverage_rental_limit?: number;
    }
  ): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteNumber}/coverage`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(coverageData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update coverage');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error updating coverage:', error);
      throw error;
    }
  }

  /**
   * Recalculate quote premium
   *
   * POST /api/v1/quotes/:id/calculate
   *
   * Triggers premium recalculation after coverage changes.
   *
   * @param quoteId - Quote identifier
   * @returns Promise resolving to updated quote with new premium
   */
  async recalculateQuote(quoteId: string): Promise<QuoteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quotes/${quoteId}/calculate`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to recalculate quote');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('[QuoteAPI] Error recalculating quote:', error);
      throw error;
    }
  }
}

/**
 * Export a singleton instance
 *
 * SINGLETON PATTERN:
 * - Create one instance of the service
 * - Export that instance (not the class)
 * - All imports use the same instance
 *
 * Benefits:
 * - Shared state (if needed)
 * - Consistent configuration
 * - Easy to mock for testing
 */
export const quoteApi = new QuoteApiService();

/**
 * Also export the class for testing/mocking
 */
export default QuoteApiService;

/**
 * ============================================================================
 * LEARNING SUMMARY: API CLIENT SERVICES
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. API CLIENT
 *    - Centralized place for all API calls
 *    - Handles HTTP requests/responses
 *    - Abstracts fetch() details from components
 *
 * 2. FETCH API
 *    - Built-in browser API for HTTP requests
 *    - Returns Promises
 *    - Modern replacement for XMLHttpRequest
 *
 * 3. JSON SERIALIZATION
 *    - JSON.stringify() = JS object → JSON string
 *    - response.json() = JSON string → JS object
 *    - Required for HTTP communication
 *
 * 4. ERROR HANDLING
 *    - Check response.ok (status 200-299)
 *    - Parse error messages from backend
 *    - Re-throw errors for component handling
 *
 * 5. TYPESCRIPT INTERFACES
 *    - Define request/response shapes
 *    - Type safety for API calls
 *    - Catch errors at compile time
 *
 * ANALOGIES:
 *
 * - API Client = Postal Service
 *   - You give them a letter (request)
 *   - They deliver it to an address (URL)
 *   - They bring back a reply (response)
 *
 * - fetch() = Making a Phone Call
 *   - Dial number (URL)
 *   - Say your message (request body)
 *   - Wait for response
 *   - Hang up when done
 *
 * - JSON.stringify() = Packaging a Gift
 *   - Put items in a box (object → string)
 *   - Ship the box
 *   - Receiver unpacks it (string → object)
 *
 * - Singleton Pattern = Shared Telephone
 *   - One phone for the whole office
 *   - Everyone uses the same phone
 *   - Consistent phone number (configuration)
 *
 * BEST PRACTICES:
 *
 * 1. Centralize API Calls
 *    - All API logic in service files
 *    - Components just call methods
 *    - Easy to change/test
 *
 * 2. Type Safety
 *    - Define interfaces for requests/responses
 *    - TypeScript catches mismatches
 *    - Self-documenting code
 *
 * 3. Error Handling
 *    - Always check response.ok
 *    - Parse error messages
 *    - Log errors for debugging
 *
 * 4. Consistent Patterns
 *    - All methods follow same structure
 *    - try/catch for error handling
 *    - Return just the data portion
 */
