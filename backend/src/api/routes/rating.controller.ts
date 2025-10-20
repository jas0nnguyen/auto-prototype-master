/**
 * Rating Engine API Controller
 *
 * This controller handles HTTP requests for premium calculations.
 * It's like a restaurant waiter - takes orders (requests), delivers them
 * to the kitchen (rating engine service), and brings back the food (response).
 *
 * WHAT IS A CONTROLLER?
 * A controller is a class that:
 * 1. Receives HTTP requests (POST, GET, PUT, DELETE)
 * 2. Validates the request data
 * 3. Calls the appropriate service to do the work
 * 4. Formats and returns the response
 *
 * NESTJS DECORATORS EXPLAINED:
 * Decorators are @ symbols followed by a function name. They add
 * special behavior to classes, methods, and parameters.
 *
 * Think of decorators like stickers on a mailbox that tell the
 * postal service how to handle the mail.
 */

import {
  Controller,      // Marks this class as a controller
  Post,            // Marks a method as handling POST requests
  Body,            // Extracts the request body
  HttpCode,        // Sets the HTTP status code
  HttpStatus,      // Enum with status codes (200, 201, 404, etc.)
  UsePipes,        // Applies validation pipes
  ValidationPipe,  // Built-in pipe for validation
} from '@nestjs/common';
import {
  ApiTags,         // Groups endpoints in Swagger docs
  ApiOperation,    // Describes what an endpoint does
  ApiResponse,     // Documents possible responses
  ApiBody,         // Documents request body structure
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

// Import DTOs (Data Transfer Objects - the shape of our data)
import {
  CalculatePremiumRequestDto,
  CalculatePremiumResponseDto,
} from '../dto/rating.dto';

// Import response formatters for consistent API responses
import { success, badRequest, internalError } from '../../utils/response-formatter';

/**
 * @Controller decorator defines the base route for all endpoints
 * in this controller. All routes will start with '/api/v1/rating'.
 *
 * Why '/api/v1'?
 * - '/api' = tells the client this is an API endpoint (not a web page)
 * - '/v1' = version 1 of the API (allows future changes without breaking old clients)
 * - '/rating' = this controller handles rating/premium calculations
 */
@Controller('api/v1/rating')
/**
 * @ApiTags decorator groups related endpoints in Swagger documentation.
 * All endpoints in this controller will appear under 'Rating Engine'
 * in the Swagger UI (http://localhost:3000/api/docs).
 */
@ApiTags('Rating Engine')
export class RatingController {
  /**
   * Constructor is where we inject dependencies
   *
   * DEPENDENCY INJECTION EXPLAINED:
   * Instead of creating services ourselves (new RatingService()),
   * we let NestJS create and provide them. This makes testing easier
   * and ensures we use the same instance everywhere.
   *
   * The 'private' keyword automatically creates a class property:
   *   constructor(private ratingService: RatingService)
   * is the same as:
   *   private ratingService: RatingService;
   *   constructor(ratingService: RatingService) {
   *     this.ratingService = ratingService;
   *   }
   */
  constructor() {
    // We'll inject RatingService here once it's created in later tasks
    // For now, we'll use a placeholder implementation
  }

  /**
   * Calculate Premium Endpoint
   *
   * POST /api/v1/rating/calculate
   *
   * This endpoint receives vehicle, driver, location, and coverage data,
   * then calculates the insurance premium using the rating engine.
   *
   * DECORATOR BREAKDOWN:
   */

  /**
   * @Post() - This method handles HTTP POST requests
   * POST is used for creating/calculating new things (vs GET for reading)
   *
   * The route is: POST /api/v1/rating/calculate
   * (combines @Controller('api/v1/rating') + @Post('calculate'))
   */
  @Post('calculate')

  /**
   * @HttpCode() - Sets the HTTP status code for successful responses
   * 200 OK = Standard success response with data
   * (vs 201 Created = for creating new resources)
   */
  @HttpCode(HttpStatus.OK)

  /**
   * @ApiOperation() - Documents what this endpoint does (for Swagger)
   * Shows up in API documentation with a description
   */
  @ApiOperation({
    summary: 'Calculate insurance premium',
    description: 'Calculates auto insurance premium based on vehicle, driver, location, and coverage information. Returns detailed breakdown of rating factors, discounts, surcharges, and final premium amount.',
  })

  /**
   * @ApiBody() - Documents the expected request body structure
   * Tells Swagger what data to expect in the POST body
   */
  @ApiBody({
    type: CalculatePremiumRequestDto,
    description: 'Premium calculation input data',
    examples: {
      'Basic Quote': {
        value: {
          vehicle_year: 2023,
          vehicle_make: 'Toyota',
          vehicle_model: 'Camry',
          vehicle_value: 28000,
          vehicle_usage: 'COMMUTE',
          annual_mileage: 12000,
          driver_birth_date: new Date('1990-05-15'),
          driver_gender: 'M',
          driver_years_licensed: 10,
          driver_accident_count: 0,
          driver_violation_count: 0,
          driver_has_defensive_driving: true,
          location_zip_code: '94102',
          location_state_code: 'CA',
          location_is_urban: true,
          coverage_bodily_injury_limit: '100000/300000',
          coverage_property_damage_limit: '50000',
          coverage_collision_deductible: 1000,
          coverage_comprehensive_deductible: 500,
          coverage_uninsured_motorist: true,
          coverage_medical_payments: true,
          coverage_rental_reimbursement: false,
          coverage_roadside_assistance: true,
        },
      },
    },
  })

  /**
   * @ApiResponse() - Documents possible response structures
   * Helps developers understand what they'll get back
   */
  @ApiResponse({
    status: 200,
    description: 'Premium calculated successfully',
    type: CalculatePremiumResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })

  /**
   * @UsePipes() - Applies validation to the request
   * ValidationPipe checks that the data matches the DTO structure
   *
   * Options:
   * - whitelist: true = removes properties not in DTO
   * - forbidNonWhitelisted: true = throws error if extra properties exist
   * - transform: true = converts plain objects to DTO class instances
   */
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  /**
   * The actual method that handles the request
   *
   * @param calculateDto - The request body, automatically validated by ValidationPipe
   * @returns A promise that resolves to the calculation response
   *
   * ASYNC/AWAIT EXPLAINED:
   * - 'async' means this function returns a Promise
   * - 'await' pauses execution until the Promise resolves
   * - This allows us to write asynchronous code that looks synchronous
   *
   * Example:
   *   const result = await doSomething();  // waits for doSomething to finish
   *   console.log(result);                 // only runs after doSomething completes
   */
  async calculatePremium(
    @Body() calculateDto: CalculatePremiumRequestDto
  ): Promise<any> {
    /**
     * TRY/CATCH EXPLAINED:
     * Like a safety net - if anything goes wrong in the 'try' block,
     * the 'catch' block handles the error instead of crashing the app.
     */
    try {
      /**
       * PLACEHOLDER IMPLEMENTATION
       *
       * In a real implementation, we would:
       * 1. Call the rating engine service:
       *    const result = await this.ratingService.calculatePremium(calculateDto);
       * 2. Return the formatted response:
       *    return success(result, 'Premium calculated successfully');
       *
       * For now, we'll return a mock response with realistic data.
       */

      // Generate a unique calculation ID
      const calculationId = uuidv4();

      // Mock base premium calculation (realistic range: $800-$3000)
      const basePremium = 1200;

      // Mock rating factors (these would come from the rating engine)
      const vehicleFactors = {
        age: 1.05,          // 5% increase for vehicle age
        make: 1.0,          // No adjustment for make (Toyota is average)
        model: 0.95,        // 5% decrease for model (Camry is safe)
        safety_rating: 0.92, // 8% decrease for good safety rating
      };

      const driverFactors = {
        age: 1.0,           // No adjustment (30-year-old driver is average)
        experience: 0.95,   // 5% decrease for 10 years experience
        violations: 1.0,    // No violations = no surcharge
        accidents: 1.0,     // No accidents = no surcharge
      };

      const locationFactors = {
        zip_code: 1.15,     // 15% increase for urban SF zip code
        state: 1.1,         // 10% increase for California
      };

      const coverageFactors = {
        liability: 1.0,     // Base liability coverage
        collision: 1.25,    // 25% of premium from collision coverage
        comprehensive: 1.15, // 15% of premium from comprehensive
        optional: 1.05,     // 5% for optional coverages
      };

      // Calculate subtotal after all factors
      // Formula: basePremium × vehicle × driver × location × coverage
      const subtotal = basePremium *
        Object.values(vehicleFactors).reduce((a, b) => a * b, 1) *
        Object.values(driverFactors).reduce((a, b) => a * b, 1) *
        Object.values(locationFactors).reduce((a, b) => a * b, 1) *
        Object.values(coverageFactors).reduce((a, b) => a * b, 1);

      // Mock discounts
      const discounts = {
        good_driver: -75,           // No violations/accidents
        defensive_driving: -50,      // Completed defensive driving course
        multi_policy: -0,            // Would apply if bundling policies
      };
      const totalDiscounts = Object.values(discounts).reduce((a, b) => a + b, 0);

      // Mock surcharges
      const surcharges = {
        young_driver: 0,    // Would apply if under 25
        urban_location: 0,  // Already factored in location_factors
      };
      const totalSurcharges = Object.values(surcharges).reduce((a, b) => a + b, 0);

      // Calculate premium after discounts and surcharges
      const premiumAfterAdjustments = subtotal + totalDiscounts + totalSurcharges;

      // Mock taxes and fees (realistic values)
      const taxesAndFees = {
        state_premium_tax: Math.round(premiumAfterAdjustments * 0.03), // 3% tax
        policy_fee: 15,                                                  // Flat policy fee
        dmv_fee: 10,                                                     // DMV filing fee
      };
      const totalTaxesAndFees = Object.values(taxesAndFees).reduce((a, b) => a + b, 0);

      // Final premium
      const finalPremium = premiumAfterAdjustments + totalTaxesAndFees;

      // Build response DTO
      const response: CalculatePremiumResponseDto = {
        base_premium: Math.round(basePremium * 100) / 100,  // Round to 2 decimals
        final_premium: Math.round(finalPremium * 100) / 100,
        vehicle_factors: vehicleFactors,
        driver_factors: driverFactors,
        location_factors: locationFactors,
        coverage_factors: coverageFactors,
        discounts: discounts,
        total_discounts: totalDiscounts,
        surcharges: surcharges,
        total_surcharges: totalSurcharges,
        taxes_and_fees: taxesAndFees,
        total_taxes_and_fees: totalTaxesAndFees,
        calculation_timestamp: new Date().toISOString(),
        calculation_id: calculationId,
        quote_number: undefined, // Set when calculating for an existing quote
      };

      /**
       * success() function returns a standardized response:
       * {
       *   success: true,
       *   data: response,
       *   message: 'Premium calculated successfully',
       *   meta: { timestamp: '2025-10-19T...' }
       * }
       */
      return success(response, 'Premium calculated successfully');

    } catch (error) {
      /**
       * Error handling - if anything goes wrong, return a formatted error
       *
       * In development, we show the full error message.
       * In production, we hide error details for security.
       */
      console.error('[RatingController] Error calculating premium:', error);

      return internalError(
        'Failed to calculate premium',
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  }

  /**
   * FUTURE ENDPOINTS (to be implemented in later tasks):
   *
   * @Get('factors')
   * async getRatingFactors() - Returns current rating table multipliers
   *
   * @Get('discounts')
   * async getAvailableDiscounts() - Returns list of available discounts
   *
   * @Get('state-rates/:stateCode')
   * async getStateRates() - Returns base rates for a specific state
   */
}

/**
 * ============================================================================
 * COMPREHENSIVE LEARNING SUMMARY: NESTJS CONTROLLERS
 * ============================================================================
 *
 * KEY CONCEPTS:
 *
 * 1. CONTROLLERS
 *    - Handle incoming HTTP requests
 *    - Return HTTP responses
 *    - Use decorators to define routes and behavior
 *    - Delegate business logic to services
 *
 * 2. DECORATORS
 *    - @ symbols that add metadata and behavior
 *    - @Controller() - defines the base route
 *    - @Post(), @Get(), @Put(), @Delete() - define HTTP methods
 *    - @Body() - extracts request body
 *    - @Param() - extracts URL parameters
 *    - @Query() - extracts query string parameters
 *
 * 3. DEPENDENCY INJECTION
 *    - NestJS creates and manages class instances
 *    - Services are "injected" into constructors
 *    - Promotes loose coupling and testability
 *
 * 4. VALIDATION
 *    - ValidationPipe automatically validates DTOs
 *    - Checks that data matches expected types
 *    - Returns 400 Bad Request if validation fails
 *
 * 5. ERROR HANDLING
 *    - try/catch blocks prevent crashes
 *    - Return formatted error responses
 *    - Log errors for debugging
 *
 * 6. API DOCUMENTATION
 *    - Swagger decorators generate automatic docs
 *    - Developers can see and test endpoints
 *    - Reduces communication overhead
 *
 * ANALOGIES:
 *
 * - Controller = Restaurant Waiter
 *   - Takes orders (requests)
 *   - Delivers to kitchen (services)
 *   - Brings back food (responses)
 *
 * - Decorators = Mailbox Stickers
 *   - Tell the system how to handle the item
 *   - Add extra information/behavior
 *   - Don't change the underlying code
 *
 * - DTOs = Forms
 *   - Define what information is needed
 *   - Validate the data is correct
 *   - Ensure consistency
 *
 * - Dependency Injection = Restaurant Supply Chain
 *   - Central supplier (NestJS) provides ingredients (services)
 *   - Chefs (controllers) don't hunt for ingredients themselves
 *   - Ensures everyone uses the same quality ingredients
 *
 * NEXT STEPS:
 * - Create the actual RatingEngineService (tasks T053-T061)
 * - Inject the service into this controller
 * - Replace mock implementation with real calculations
 * - Add more endpoints for rating tables and factors
 */
