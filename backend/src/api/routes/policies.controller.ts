/**
 * Policies API Controller
 *
 * Handles policy binding and activation endpoints.
 * This controller manages the conversion of quotes to policies with payment.
 */

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuoteService } from '../../services/quote/quote.service';

/**
 * DTO for binding a quote to a policy
 */
export class BindQuoteDto {
  @ApiProperty({ example: 'DZQV87Z4FH', description: 'Quote number in DZXXXXXXXX format' })
  quoteNumber: string;

  @ApiProperty({
    example: 'credit_card',
    description: 'Payment method type',
    enum: ['credit_card', 'ach']
  })
  paymentMethod: 'credit_card' | 'ach';

  // Credit card fields
  @ApiPropertyOptional({ example: '4242424242424242', description: 'Credit card number (required if paymentMethod is credit_card)' })
  cardNumber?: string;

  @ApiPropertyOptional({ example: '12/25', description: 'Card expiration date MM/YY (required if paymentMethod is credit_card)' })
  cardExpiry?: string;

  @ApiPropertyOptional({ example: '123', description: 'Card CVV (required if paymentMethod is credit_card)' })
  cardCvv?: string;

  // ACH fields
  @ApiPropertyOptional({ example: '110000000', description: 'Bank routing number (required if paymentMethod is ach)' })
  routingNumber?: string;

  @ApiPropertyOptional({ example: '000123456789', description: 'Bank account number (required if paymentMethod is ach)' })
  accountNumber?: string;

  @ApiPropertyOptional({
    example: 'checking',
    description: 'Account type (required if paymentMethod is ach)',
    enum: ['checking', 'savings']
  })
  accountType?: 'checking' | 'savings';
}

/**
 * T095: Policies Controller
 * Endpoints for policy binding, activation, and retrieval
 */
@ApiTags('Policies')
@Controller('api/v1/policies')
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);

  constructor(private readonly quoteService: QuoteService) {}

  /**
   * POST /api/v1/policies/bind
   * Bind a quote to a policy with payment
   *
   * @example
   * Request:
   * {
   *   "quoteNumber": "DZ12345678",
   *   "paymentMethod": "credit_card",
   *   "cardNumber": "4242424242424242",
   *   "cardExpiry": "12/25",
   *   "cardCvv": "123"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "policyId": "uuid",
   *     "policyNumber": "DZ12345678",
   *     "status": "BOUND",
   *     "payment": { ... },
   *     "documents": [ ... ]
   *   }
   * }
   */
  @Post('bind')
  @ApiOperation({
    summary: 'Bind quote to policy',
    description: 'Convert a quote to a bound policy by processing payment. Supports credit card and ACH payments. Transitions quote status from QUOTED → BINDING → BOUND.'
  })
  @ApiBody({ type: BindQuoteDto, description: 'Payment information and quote number' })
  @ApiResponse({ status: 200, description: 'Policy bound successfully with payment confirmation and generated documents' })
  @ApiResponse({ status: 400, description: 'Invalid payment details or quote not in QUOTED status' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.OK)
  async bindQuote(@Body() bindQuoteDto: BindQuoteDto) {
    this.logger.log(`Binding quote ${bindQuoteDto.quoteNumber}`);

    const result = await this.quoteService.bindQuote(
      bindQuoteDto.quoteNumber,
      {
        paymentMethod: bindQuoteDto.paymentMethod,
        cardNumber: bindQuoteDto.cardNumber,
        cardExpiry: bindQuoteDto.cardExpiry,
        cardCvv: bindQuoteDto.cardCvv,
        routingNumber: bindQuoteDto.routingNumber,
        accountNumber: bindQuoteDto.accountNumber,
        accountType: bindQuoteDto.accountType,
      }
    );

    return {
      success: true,
      data: result,
      message: 'Quote bound to policy successfully',
    };
  }

  /**
   * POST /api/v1/policies/:id/activate
   * Activate a policy (transition from BOUND to IN_FORCE)
   *
   * @example
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "policyId": "uuid",
   *     "status": "IN_FORCE",
   *     "effectiveDate": "2025-11-01",
   *     "expirationDate": "2026-11-01"
   *   }
   * }
   */
  @Post(':id/activate')
  @ApiOperation({
    summary: 'Activate policy',
    description: 'Activate a bound policy (transitions status from BOUND → IN_FORCE). This happens automatically on the effective date.'
  })
  @ApiParam({ name: 'id', description: 'Policy ID (UUID) or policy number (DZXXXXXXXX format)', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Policy activated successfully' })
  @ApiResponse({ status: 400, description: 'Policy not in BOUND status' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.OK)
  async activatePolicy(@Param('id') policyId: string) {
    this.logger.log(`Activating policy ${policyId}`);

    const result = await this.quoteService.activatePolicy(policyId);

    return {
      success: true,
      data: result,
      message: 'Policy activated successfully',
    };
  }

  /**
   * GET /api/v1/policies/:id
   * Get policy details by policy ID
   *
   * @example
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "policy": { ... },
   *     "payments": [ ... ],
   *     "documents": [ ... ],
   *     "events": [ ... ]
   *   }
   * }
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get policy details',
    description: 'Retrieve complete policy details including payments, documents, and events by policy ID or policy number'
  })
  @ApiParam({ name: 'id', description: 'Policy ID (UUID) or policy number (DZXXXXXXXX format)', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Policy details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPolicy(@Param('id') policyId: string) {
    this.logger.log(`Getting policy ${policyId}`);

    // TODO: Implement full policy retrieval with joins
    // For now, just use the existing quote service method
    const policy = await this.quoteService.getQuote(policyId);

    return {
      success: true,
      data: policy,
    };
  }
}
