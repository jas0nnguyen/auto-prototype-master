/**
 * Quotes Controller - Simplified Version
 *
 * REST API endpoints for quote management:
 * - POST /api/v1/quotes - Create new quote
 * - GET /api/v1/quotes/:id - Get quote by policy ID
 * - GET /api/v1/quotes/reference/:quoteNumber - Get quote by quote number
 *
 * This is a clean, simple implementation that works with the new QuoteService.
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { QuoteService } from '../../services/quote/quote.service';
import type { CreateQuoteInput, QuoteResult } from '../../services/quote/quote.service';

/**
 * DTO for creating a quote (flat structure from frontend)
 * This defines what data the frontend must send
 */
class CreateQuoteDTO {
  // Driver info
  driver_first_name!: string;
  driver_last_name!: string;
  driver_birth_date!: string | Date;
  driver_email!: string;
  driver_phone!: string;
  driver_gender?: string;
  driver_years_licensed?: number;

  // Address
  address_line_1!: string;
  address_line_2?: string;
  address_city!: string;
  address_state!: string;
  address_zip!: string;

  // Vehicle
  vehicle_year!: number;
  vehicle_make!: string;
  vehicle_model!: string;
  vehicle_vin?: string;
  annual_mileage?: number;
  vehicle_usage?: string;

  // Coverage
  coverage_bodily_injury?: string;
  coverage_property_damage?: string;
  coverage_collision_deductible?: number;
  coverage_comprehensive_deductible?: number;
  include_uninsured_motorist?: boolean;
  include_medical_payments?: boolean;
  include_rental_reimbursement?: boolean;
  include_roadside_assistance?: boolean;
}

@Controller('api/v1/quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quoteService: QuoteService) {}

  /**
   * Create a new quote
   *
   * POST /api/v1/quotes
   *
   * @example Request Body:
   * {
   *   "driver": {
   *     "firstName": "Jane",
   *     "lastName": "Smith",
   *     "birthDate": "1990-05-15",
   *     "email": "jane@example.com",
   *     "phone": "555-0100"
   *   },
   *   "address": {
   *     "addressLine1": "123 Main St",
   *     "city": "Los Angeles",
   *     "state": "CA",
   *     "zipCode": "90001"
   *   },
   *   "vehicle": {
   *     "year": 2020,
   *     "make": "Honda",
   *     "model": "Accord",
   *     "vin": "1HGBH41JXMN109186"
   *   }
   * }
   *
   * @example Response:
   * {
   *   "quoteNumber": "Q-20251019-AB12CD",
   *   "policyId": "123e4567-e89b-12d3-a456-426614174000",
   *   "premium": 1300,
   *   "createdAt": "2025-10-19T12:00:00.000Z",
   *   "expiresAt": "2025-11-18T12:00:00.000Z"
   * }
   */
  @Post()
  async createQuote(@Body() dto: CreateQuoteDTO): Promise<QuoteResult> {
    try {
      this.logger.log('Creating new quote', {
        driverEmail: dto.driver_email,
        vehicleVin: dto.vehicle_vin
      });

      // Transform flat DTO into nested structure for QuoteService
      const input: CreateQuoteInput = {
        driver: {
          firstName: dto.driver_first_name,
          lastName: dto.driver_last_name,
          birthDate: typeof dto.driver_birth_date === 'string'
            ? new Date(dto.driver_birth_date)
            : dto.driver_birth_date,
          email: dto.driver_email,
          phone: dto.driver_phone,
          gender: dto.driver_gender,
          yearsLicensed: dto.driver_years_licensed,
        },
        address: {
          addressLine1: dto.address_line_1,
          addressLine2: dto.address_line_2,
          city: dto.address_city,
          state: dto.address_state,
          zipCode: dto.address_zip,
        },
        vehicle: {
          year: dto.vehicle_year,
          make: dto.vehicle_make,
          model: dto.vehicle_model,
          vin: dto.vehicle_vin || '',  // Will be converted to null in QuoteService
          annualMileage: dto.annual_mileage,
        },
        coverages: {
          bodilyInjury: !!dto.coverage_bodily_injury,
          propertyDamage: !!dto.coverage_property_damage,
          collision: !!dto.coverage_collision_deductible,
          comprehensive: !!dto.coverage_comprehensive_deductible,
        },
      };

      const result = await this.quoteService.createQuote(input);

      this.logger.log('Quote created successfully', {
        quoteId: result.quoteId,
        quoteNumber: result.quoteNumber
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to create quote', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to create quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get quote by quote number (human-readable ID)
   *
   * GET /api/v1/quotes/:id
   *
   * @example Response:
   * {
   *   "policy_identifier": "123e4567-e89b-12d3-a456-426614174000",
   *   "policy_number": "QA1B2C",
   *   "status_code": "QUOTED",
   *   "effective_date": "2025-10-19",
   *   "expiration_date": "2026-10-19"
   * }
   */
  @Get(':id')
  async getQuote(@Param('id') id: string) {
    try {
      this.logger.debug('Fetching quote by number', { quoteNumber: id });
      return await this.quoteService.getQuote(id);
    } catch (error) {
      this.logger.error('Failed to retrieve quote', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${id} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get quote by quote number
   *
   * GET /api/v1/quotes/reference/:quoteNumber
   *
   * @example Response:
   * {
   *   "policy_identifier": "123e4567-e89b-12d3-a456-426614174000",
   *   "policy_number": "QA1B2C",
   *   "status_code": "QUOTED",
   *   "effective_date": "2025-10-19",
   *   "expiration_date": "2026-10-19"
   * }
   */
  @Get('reference/:quoteNumber')
  async getQuoteByNumber(@Param('quoteNumber') quoteNumber: string) {
    try {
      this.logger.debug('Fetching quote by number', { quoteNumber });
      return await this.quoteService.getQuoteByNumber(quoteNumber);
    } catch (error) {
      this.logger.error('Failed to retrieve quote', error);

      if (error instanceof Error && error.message.includes('not found')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Quote ${quoteNumber} not found`,
          },
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve quote',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
