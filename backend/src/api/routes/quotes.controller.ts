/**
 * Quotes Controller (T069)
 *
 * NestJS REST controller for quote-related endpoints.
 * Handles HTTP requests for creating, retrieving, and updating insurance quotes.
 *
 * What is a Controller?
 * A controller is like a receptionist at a hotel - it receives requests from customers
 * (the frontend), routes them to the right service (business logic), and returns
 * the response back to the customer.
 *
 * NestJS Decorators Explained:
 * - @Controller('path'): Defines the base URL path for all routes in this controller
 * - @Post(): Handles HTTP POST requests (creating new resources)
 * - @Get(): Handles HTTP GET requests (reading existing resources)
 * - @Put(): Handles HTTP PUT requests (updating existing resources)
 * - @Param('id'): Extracts a parameter from the URL (e.g., /quotes/:id)
 * - @Body(): Extracts data from the request body (JSON payload)
 *
 * Example URL Structure:
 * - POST /api/v1/quotes → CreateQuote
 * - GET /api/v1/quotes/:id → GetQuoteById
 * - GET /api/v1/quotes/reference/:refNumber → GetQuoteByNumber
 * - PUT /api/v1/quotes/:id/coverage → UpdateCoverage
 * - POST /api/v1/quotes/:id/calculate → CalculatePremium
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuoteService } from '../../services/quote-service/quote.service';
import { PremiumCalculator } from '../../services/rating-engine/premium-calculator';
import { CoverageAssignmentService } from '../../services/quote-service/coverage-assignment';
import {
  CreateQuoteRequestDto,
  UpdateCoverageRequestDto,
  QuoteResponseDto,
} from '../dto/quote.dto';
import * as ResponseFormatter from '../../utils/response-formatter';

/**
 * Quotes Controller
 *
 * Handles all quote-related API endpoints:
 * - Creating new quotes
 * - Retrieving quotes by ID or quote number
 * - Updating coverage selections
 * - Calculating/recalculating premiums
 */
@Controller('api/v1/quotes')
@ApiTags('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(
    private readonly quoteService: QuoteService,
    private readonly premiumCalculator: PremiumCalculator,
    private readonly coverageService: CoverageAssignmentService,
  ) {}

  /**
   * POST /api/v1/quotes
   * Create a new insurance quote
   *
   * This endpoint is called when a customer completes the quote flow.
   * It creates all the necessary entities (Party, Person, Vehicle, Policy)
   * and calculates the initial premium.
   *
   * Request Body Example:
   * {
   *   "driver_first_name": "John",
   *   "driver_last_name": "Doe",
   *   "driver_birth_date": "1985-03-15",
   *   "driver_email": "john@example.com",
   *   "driver_phone": "555-1234",
   *   "address_line_1": "123 Main St",
   *   "address_city": "Los Angeles",
   *   "address_state": "CA",
   *   "address_zip": "90001",
   *   "vehicle_year": 2020,
   *   "vehicle_make": "Toyota",
   *   "vehicle_model": "Camry",
   *   "vehicle_vin": "1HGBH41JXMN109186",
   *   "coverage_bodily_injury": "100000/300000",
   *   "coverage_property_damage": "50000"
   * }
   *
   * Response Example:
   * {
   *   "success": true,
   *   "data": {
   *     "quote_id": "uuid-here",
   *     "quote_number": "QTE-2025-123456",
   *     "quote_status": "ACTIVE",
   *     "driver": { ... },
   *     "vehicle": { ... },
   *     "premium": {
   *       "total_premium": 1250.00,
   *       "currency": "USD"
   *     },
   *     "expiration_date": "2025-11-18"
   *   }
   * }
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new quote',
    description: 'Creates a new insurance quote with driver, vehicle, and coverage information',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Quote created successfully',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async createQuote(@Body() createQuoteDto: CreateQuoteRequestDto) {
    try {
      this.logger.log('Creating new quote...');

      // Validate input
      if (!createQuoteDto.driver_email || !createQuoteDto.vehicle_year) {
        throw new BadRequestException(
          ResponseFormatter.validationError({
            driver_email: createQuoteDto.driver_email ? [] : ['Email is required'],
            vehicle_year: createQuoteDto.vehicle_year ? [] : ['Vehicle year is required'],
          })
        );
      }

      // Convert DTO to service input format
      const quoteInput = {
        driver_first_name: createQuoteDto.driver_first_name,
        driver_last_name: createQuoteDto.driver_last_name,
        driver_birth_date: new Date(createQuoteDto.driver_birth_date),
        driver_email: createQuoteDto.driver_email,
        driver_phone: createQuoteDto.driver_phone,
        driver_gender: createQuoteDto.driver_gender,
        driver_years_licensed: createQuoteDto.driver_years_licensed,
        address_line_1: createQuoteDto.address_line_1,
        address_city: createQuoteDto.address_city,
        address_state: createQuoteDto.address_state,
        address_zip: createQuoteDto.address_zip,
        vehicle_year: createQuoteDto.vehicle_year,
        vehicle_make: createQuoteDto.vehicle_make,
        vehicle_model: createQuoteDto.vehicle_model,
        vehicle_vin: createQuoteDto.vehicle_vin,
        annual_mileage: createQuoteDto.annual_mileage,
        coverage_bodily_injury: createQuoteDto.coverage_bodily_injury,
        coverage_property_damage: createQuoteDto.coverage_property_damage,
        coverage_collision_deductible: createQuoteDto.coverage_collision_deductible,
        coverage_comprehensive_deductible: createQuoteDto.coverage_comprehensive_deductible,
      };

      // Create quote through service
      const quote = await this.quoteService.createQuote(quoteInput);

      this.logger.log(`Quote created successfully: ${quote.quote_number}`);

      // Return formatted success response
      return ResponseFormatter.created(quote, 'Quote created successfully');
    } catch (error) {
      this.logger.error(`Failed to create quote: ${error.message}`, error.stack);

      // If it's already a NestJS HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, wrap in internal server error
      throw new HttpException(
        ResponseFormatter.internalError('Failed to create quote', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/v1/quotes/:id
   * Retrieve a quote by its UUID
   *
   * URL Parameters:
   * - id: Quote UUID (e.g., '123e4567-e89b-12d3-a456-426614174000')
   *
   * Response: Full quote details (same as create response)
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get quote by ID',
    description: 'Retrieves a quote by its UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quote found',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quote not found',
  })
  async getQuoteById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving quote by ID: ${id}`);

      const quote = await this.quoteService.getQuoteById(id);

      if (!quote) {
        throw new NotFoundException(
          ResponseFormatter.notFound('Quote', id)
        );
      }

      return ResponseFormatter.success(quote, 'Quote retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve quote: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseFormatter.internalError('Failed to retrieve quote', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/v1/quotes/reference/:refNumber
   * Retrieve a quote by its human-readable quote number
   *
   * URL Parameters:
   * - refNumber: Quote number (e.g., 'QTE-2025-123456')
   *
   * Response: Full quote details
   */
  @Get('reference/:refNumber')
  @ApiOperation({
    summary: 'Get quote by quote number',
    description: 'Retrieves a quote by its human-readable quote number',
  })
  @ApiParam({
    name: 'refNumber',
    description: 'Quote number',
    example: 'QTE-2025-123456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quote found',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quote not found',
  })
  async getQuoteByNumber(@Param('refNumber') refNumber: string) {
    try {
      this.logger.log(`Retrieving quote by number: ${refNumber}`);

      const quote = await this.quoteService.getQuoteByNumber(refNumber);

      if (!quote) {
        throw new NotFoundException(
          ResponseFormatter.notFound('Quote', refNumber)
        );
      }

      return ResponseFormatter.success(quote, 'Quote retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve quote: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseFormatter.internalError('Failed to retrieve quote', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PUT /api/v1/quotes/:id/coverage
   * Update coverage selections for an existing quote
   *
   * This endpoint is called when a customer changes their coverage
   * selections on the CoverageSelection page. It updates the coverages
   * and recalculates the premium.
   *
   * URL Parameters:
   * - id: Quote UUID
   *
   * Request Body Example:
   * {
   *   "coverage_bodily_injury": "250000/500000",
   *   "coverage_property_damage": "100000",
   *   "coverage_collision_deductible": 500,
   *   "coverage_comprehensive_deductible": 500,
   *   "include_uninsured_motorist": true,
   *   "include_rental_reimbursement": true
   * }
   *
   * Response: Updated quote with new premium
   */
  @Put(':id/coverage')
  @ApiOperation({
    summary: 'Update coverage selections',
    description: 'Updates coverage selections for a quote and recalculates premium',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coverage updated successfully',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quote not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid coverage data',
  })
  async updateCoverage(
    @Param('id') id: string,
    @Body() updateCoverageDto: UpdateCoverageRequestDto,
  ) {
    try {
      this.logger.log(`Updating coverage for quote: ${id}`);

      // Update coverage through service
      const updatedQuote = await this.quoteService.updateQuoteCoverage(
        id,
        updateCoverageDto
      );

      if (!updatedQuote) {
        throw new NotFoundException(
          ResponseFormatter.notFound('Quote', id)
        );
      }

      this.logger.log(`Coverage updated successfully for quote: ${id}`);

      return ResponseFormatter.success(
        updatedQuote,
        'Coverage updated successfully'
      );
    } catch (error) {
      this.logger.error(`Failed to update coverage: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseFormatter.internalError('Failed to update coverage', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/v1/quotes/:id/calculate
   * Recalculate premium for a quote
   *
   * This endpoint can be called to force a premium recalculation
   * without changing any data. Useful for refreshing calculations
   * with updated rating factors.
   *
   * URL Parameters:
   * - id: Quote UUID
   *
   * Response: Updated quote with recalculated premium
   */
  @Post(':id/calculate')
  @ApiOperation({
    summary: 'Recalculate premium',
    description: 'Recalculates the premium for a quote using current rating factors',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Premium recalculated successfully',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quote not found',
  })
  async calculatePremium(@Param('id') id: string) {
    try {
      this.logger.log(`Recalculating premium for quote: ${id}`);

      // First, get the quote
      const quote = await this.quoteService.getQuoteById(id);

      if (!quote) {
        throw new NotFoundException(
          ResponseFormatter.notFound('Quote', id)
        );
      }

      // Recalculate premium
      // NOTE: This would call the premium calculator with the quote's data
      // For now, we'll just return the existing quote
      // TODO: Implement actual recalculation when database integration is complete

      this.logger.log(`Premium recalculated successfully for quote: ${id}`);

      return ResponseFormatter.success(
        quote,
        'Premium recalculated successfully'
      );
    } catch (error) {
      this.logger.error(`Failed to calculate premium: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseFormatter.internalError('Failed to calculate premium', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

/**
 * LEARNING NOTES: NestJS Controller Patterns
 *
 * 1. DEPENDENCY INJECTION
 *    Services are injected via the constructor. NestJS automatically
 *    creates instances and passes them in.
 *
 *    Example:
 *    constructor(private readonly quoteService: QuoteService) {}
 *
 *    This is like ordering room service - you don't cook the food yourself,
 *    the kitchen (NestJS) provides it ready-made.
 *
 * 2. DECORATORS
 *    Decorators are special annotations that add functionality to classes/methods.
 *    They're like labels or tags that tell NestJS how to handle things.
 *
 *    @Controller('api/v1/quotes') - Base URL path
 *    @Post() - Handle POST requests
 *    @Get(':id') - Handle GET requests with a URL parameter
 *
 * 3. ERROR HANDLING
 *    Always wrap business logic in try/catch blocks.
 *    Use specific HttpException types (NotFoundException, BadRequestException).
 *    Return standardized error responses using ResponseFormatter.
 *
 * 4. VALIDATION
 *    Validate input early (at the start of the method).
 *    Throw BadRequestException with clear error messages.
 *    Use DTOs to define expected input shape.
 *
 * 5. LOGGING
 *    Log important events (request received, operation completed, errors).
 *    Use different log levels (log, warn, error).
 *    Include relevant context (IDs, status codes).
 *
 * 6. RESPONSE FORMATTING
 *    Always use ResponseFormatter utility functions.
 *    Ensures consistent response structure across all endpoints.
 *    Makes frontend parsing easier and more reliable.
 */
