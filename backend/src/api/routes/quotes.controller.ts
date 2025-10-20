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
 * DTO for creating a quote
 * This defines what data the frontend must send
 */
class CreateQuoteDTO implements CreateQuoteInput {
  driver!: {
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

  address!: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };

  vehicle!: {
    year: number;
    make: string;
    model: string;
    vin: string;
    bodyType?: string;
    annualMileage?: number;
  };

  coverages?: {
    bodilyInjury?: boolean;
    propertyDamage?: boolean;
    collision?: boolean;
    comprehensive?: boolean;
  };
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
  async createQuote(@Body() input: CreateQuoteDTO): Promise<QuoteResult> {
    try {
      this.logger.log('Creating new quote', {
        driverEmail: input.driver.email,
        vehicleVin: input.vehicle.vin
      });

      // Convert birthDate string to Date if needed
      if (typeof input.driver.birthDate === 'string') {
        input.driver.birthDate = new Date(input.driver.birthDate);
      }

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
   *   "policy_number": "Q-20251019-AB12CD",
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
   *   "policy_number": "Q-20251019-AB12CD",
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
