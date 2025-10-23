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
import { QuoteService } from '../../services/quote/quote.service';

/**
 * DTO for binding a quote to a policy
 */
export class BindQuoteDto {
  quoteNumber: string;
  paymentMethod: 'credit_card' | 'ach';

  // Credit card fields
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;

  // ACH fields
  routingNumber?: string;
  accountNumber?: string;
  accountType?: 'checking' | 'savings';
}

/**
 * T095: Policies Controller
 * Endpoints for policy binding, activation, and retrieval
 */
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
