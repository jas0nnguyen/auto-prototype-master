/**
 * Signatures Controller
 *
 * REST API endpoints for digital signature management during the signing ceremony.
 * Handles signature creation and retrieval for policy binding workflow.
 *
 * Endpoints:
 * - POST /api/v1/signatures - Create new signature
 * - GET /api/v1/signatures/:quoteId - Get signature by quote ID
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  HttpStatus,
  HttpException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { Request } from 'express';
import { SignatureService } from '../../services/signature-service/signature.service';

/**
 * DTO for creating a signature
 */
class CreateSignatureDTO {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'UUID of the quote being signed',
    format: 'uuid',
  })
  @IsUUID()
  quote_id!: string;

  @ApiProperty({
    example: 'b1ffce99-9c0b-4ef8-bb6d-6bb9bd380a22',
    description: 'UUID of the party (signer)',
    format: 'uuid',
  })
  @IsUUID()
  party_id!: string;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
    description: 'Base64-encoded signature image (PNG or JPEG)',
    maxLength: 1400000,
  })
  @IsString()
  signature_image_data!: string;

  @ApiProperty({
    example: 'PNG',
    description: 'Image format of the signature',
    enum: ['PNG', 'JPEG'],
  })
  @IsEnum(['PNG', 'JPEG'])
  signature_format!: 'PNG' | 'JPEG';
}

/**
 * Signatures Controller
 */
@ApiTags('Signatures')
@Controller('api/v1/signatures')
export class SignaturesController {
  private readonly logger = new Logger(SignaturesController.name);

  constructor(private readonly signatureService: SignatureService) {}

  /**
   * T033: Create a new signature
   *
   * POST /api/v1/signatures
   *
   * Stores a digital signature captured during the signing ceremony.
   * Validates format, size, and enforces one signature per quote.
   *
   * @example Request Body:
   * {
   *   "quote_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
   *   "party_id": "b1ffce99-9c0b-4ef8-bb6d-6bb9bd380a22",
   *   "signature_image_data": "data:image/png;base64,iVBORw0KGgoAAAANS...",
   *   "signature_format": "PNG"
   * }
   *
   * @example Success Response (201):
   * {
   *   "status": "success",
   *   "data": {
   *     "signature_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "quote_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
   *     "party_id": "b1ffce99-9c0b-4ef8-bb6d-6bb9bd380a22",
   *     "signature_format": "PNG",
   *     "signature_date": "2025-11-09T14:30:00Z",
   *     "created_at": "2025-11-09T14:30:00Z"
   *   }
   * }
   *
   * @example Error Response (400):
   * {
   *   "status": "error",
   *   "error": {
   *     "code": "VALIDATION_ERROR",
   *     "message": "Signature format must be PNG or JPEG"
   *   }
   * }
   *
   * @example Error Response (404):
   * {
   *   "status": "error",
   *   "error": {
   *     "code": "NOT_FOUND",
   *     "message": "Quote with ID a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 not found"
   *   }
   * }
   *
   * @example Error Response (409):
   * {
   *   "status": "error",
   *   "error": {
   *     "code": "DUPLICATE",
   *     "message": "Signature already exists for this quote"
   *   }
   * }
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new signature',
    description: 'Store a digital signature captured during the signing ceremony',
  })
  @ApiBody({
    type: CreateSignatureDTO,
    description: 'Signature data with quote ID, party ID, image data, and format',
  })
  @ApiResponse({
    status: 201,
    description: 'Signature created successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            signature_id: { type: 'string', format: 'uuid' },
            quote_id: { type: 'string', format: 'uuid' },
            party_id: { type: 'string', format: 'uuid' },
            signature_format: { type: 'string', enum: ['PNG', 'JPEG'] },
            signature_date: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data (validation error)',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Signature format must be PNG or JPEG' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Quote or Party not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            message: { type: 'string', example: 'Quote with ID ... not found' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Signature already exists for this quote',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'DUPLICATE' },
            message: { type: 'string', example: 'Signature already exists for this quote' },
          },
        },
      },
    },
  })
  async createSignature(
    @Body() dto: CreateSignatureDTO,
    @Req() request: Request
  ): Promise<any> {
    this.logger.log('Creating signature', {
      quoteId: dto.quote_id,
      partyId: dto.party_id,
      format: dto.signature_format,
    });

    try {
      // Extract request metadata for audit trail
      const requestMetadata = {
        ip_address: this.extractIpAddress(request),
        user_agent: request.headers['user-agent'],
      };

      // Create signature via service
      const signature = await this.signatureService.createSignature(
        {
          quote_id: dto.quote_id,
          party_id: dto.party_id,
          signature_image_data: dto.signature_image_data,
          signature_format: dto.signature_format,
        },
        requestMetadata
      );

      this.logger.log('Signature created successfully', {
        signatureId: signature.signature_id,
        quoteId: signature.quote_id,
      });

      // Return success response (201)
      return {
        status: 'success',
        data: {
          signature_id: signature.signature_id,
          quote_id: signature.quote_id,
          party_id: signature.party_id,
          signature_format: signature.signature_format,
          signature_date: signature.signature_date,
          created_at: signature.created_at,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create signature', error);

      // Handle specific error types
      if (error instanceof BadRequestException) {
        throw new HttpException(
          {
            status: 'error',
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            status: 'error',
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          },
          HttpStatus.NOT_FOUND
        );
      }

      if (error instanceof ConflictException) {
        throw new HttpException(
          {
            status: 'error',
            error: {
              code: 'DUPLICATE',
              message: error.message,
            },
          },
          HttpStatus.CONFLICT
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * T034: Get signature by quote ID
   *
   * GET /api/v1/signatures/:quoteId
   *
   * Retrieves the signature associated with a specific quote.
   * Returns full signature data including image data for display.
   *
   * @example Success Response (200):
   * {
   *   "status": "success",
   *   "data": {
   *     "signature_id": "550e8400-e29b-41d4-a716-446655440000",
   *     "quote_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
   *     "party_id": "b1ffce99-9c0b-4ef8-bb6d-6bb9bd380a22",
   *     "signature_image_data": "data:image/png;base64,iVBORw0KGgoAAAANS...",
   *     "signature_format": "PNG",
   *     "signature_date": "2025-11-09T14:30:00Z",
   *     "created_at": "2025-11-09T14:30:00Z"
   *   }
   * }
   *
   * @example Error Response (404):
   * {
   *   "status": "error",
   *   "error": {
   *     "code": "NOT_FOUND",
   *     "message": "No signature found for quote ID a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
   *   }
   * }
   */
  @Get(':quoteId')
  @ApiOperation({
    summary: 'Get signature by quote ID',
    description: 'Retrieve the signature associated with a specific quote',
  })
  @ApiParam({
    name: 'quoteId',
    description: 'UUID of the quote',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Signature found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            signature_id: { type: 'string', format: 'uuid' },
            quote_id: { type: 'string', format: 'uuid' },
            party_id: { type: 'string', format: 'uuid' },
            signature_image_data: { type: 'string', example: 'data:image/png;base64,...' },
            signature_format: { type: 'string', enum: ['PNG', 'JPEG'] },
            signature_date: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Signature not found for this quote',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            message: { type: 'string', example: 'No signature found for quote ID ...' },
          },
        },
      },
    },
  })
  async getSignatureByQuoteId(@Param('quoteId') quoteId: string): Promise<any> {
    this.logger.log('Getting signature by quote ID', { quoteId });

    try {
      const signature = await this.signatureService.getSignatureByQuoteId(quoteId);

      if (!signature) {
        throw new NotFoundException(`No signature found for quote ID ${quoteId}`);
      }

      this.logger.log('Signature retrieved successfully', {
        signatureId: signature.signature_id,
        quoteId,
      });

      // Return success response (200)
      return {
        status: 'success',
        data: {
          signature_id: signature.signature_id,
          quote_id: signature.quote_id,
          party_id: signature.party_id,
          signature_image_data: signature.signature_image_data,
          signature_format: signature.signature_format,
          signature_date: signature.signature_date,
          created_at: signature.created_at,
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve signature', error);

      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            status: 'error',
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          },
          HttpStatus.NOT_FOUND
        );
      }

      // Generic error fallback
      throw new HttpException(
        {
          status: 'error',
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Extract IP address from request
   * Handles X-Forwarded-For header for proxies (Vercel, nginx, etc.)
   */
  private extractIpAddress(request: Request): string | undefined {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (forwardedFor) {
      // X-Forwarded-For can be a comma-separated list, take the first one
      return typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : forwardedFor[0];
    }

    // Fallback to direct connection IP
    return request.ip || request.socket?.remoteAddress;
  }
}
