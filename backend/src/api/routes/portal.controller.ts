/**
 * Portal API Controller
 *
 * Handles all portal-related endpoints for self-service functionality:
 * - Dashboard data (policy overview)
 * - Policy details (drivers, vehicles, coverages)
 * - Billing history
 * - Claims (list, view, file new)
 * - Document downloads
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuoteService } from '../../services/quote/quote.service';

// Simple response helper
const formatResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message,
});

/**
 * DTO for filing a claim
 */
export class FileClaimDto {
  @ApiProperty({ example: '2025-10-15', description: 'Date of incident (YYYY-MM-DD)' })
  incident_date: string;

  @ApiProperty({
    example: 'COLLISION',
    description: 'Type of loss',
    enum: ['COLLISION', 'COMPREHENSIVE', 'LIABILITY', 'UNINSURED_MOTORIST']
  })
  loss_type: string;

  @ApiProperty({ example: 'Rear-ended at stoplight on Main St', description: 'Detailed description of incident' })
  description: string;

  @ApiPropertyOptional({ example: 'VIN123456789', description: 'Vehicle involved in incident (optional)' })
  vehicle_identifier?: string;

  @ApiPropertyOptional({ example: 'DRIVER123', description: 'Driver involved in incident (optional)' })
  driver_identifier?: string;
}

@ApiTags('Portal')
@Controller('api/v1/portal')
export class PortalController {
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * GET /api/v1/portal/:policyNumber/dashboard
   * Get complete dashboard data (policy, drivers, vehicles, premium, payments, claims)
   */
  @Get(':policyNumber/dashboard')
  @ApiOperation({
    summary: 'Get dashboard data',
    description: 'Retrieve complete dashboard overview including policy details, drivers, vehicles, premium breakdown, recent payments, and active claims'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDashboard(@Param('policyNumber') policyNumber: string) {
    try {
      const data = await this.quoteService.getDashboardData(policyNumber);
      return formatResponse(data, 'Dashboard data retrieved');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get dashboard data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/policy
   * Get policy details only
   */
  @Get(':policyNumber/policy')
  @ApiOperation({
    summary: 'Get policy details',
    description: 'Retrieve detailed policy information including drivers, vehicles, coverages, and premium breakdown'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Policy details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPolicy(@Param('policyNumber') policyNumber: string) {
    try {
      const policy = await this.quoteService.getPolicyByNumber(policyNumber);
      return formatResponse(policy, 'Policy retrieved');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get policy',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/billing
   * Get payment history for policy
   */
  @Get(':policyNumber/billing')
  @ApiOperation({
    summary: 'Get billing history',
    description: 'Retrieve complete payment history for a policy including successful payments, pending transactions, and failed attempts'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Billing history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBilling(@Param('policyNumber') policyNumber: string) {
    try {
      const payments = await this.quoteService.getBillingHistory(policyNumber);
      return formatResponse(payments, 'Billing history retrieved');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get billing history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/claims
   * Get all claims for policy
   */
  @Get(':policyNumber/claims')
  @ApiOperation({
    summary: 'Get claims list',
    description: 'Retrieve all claims associated with a policy including claim number, status, incident date, and loss type'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiResponse({ status: 200, description: 'Claims list retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getClaims(@Param('policyNumber') policyNumber: string) {
    try {
      const claims = await this.quoteService.getClaims(policyNumber);
      return formatResponse(claims, 'Claims retrieved');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get claims',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/claims/:claimId
   * Get claim details with events and documents
   */
  @Get(':policyNumber/claims/:claimId')
  @ApiOperation({
    summary: 'Get claim details',
    description: 'Retrieve detailed information for a specific claim including timeline events and attached documents'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiParam({ name: 'claimId', description: 'Claim ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' })
  @ApiResponse({ status: 200, description: 'Claim details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getClaimDetails(
    @Param('policyNumber') policyNumber: string,
    @Param('claimId') claimId: string,
  ) {
    try {
      const claim = await this.quoteService.getClaimById(claimId);
      return formatResponse(claim, 'Claim details retrieved');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get claim details',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/v1/portal/:policyNumber/claims
   * File a new claim
   */
  @Post(':policyNumber/claims')
  @ApiOperation({
    summary: 'File a new claim',
    description: 'Submit a new insurance claim with incident details. Generates a claim number and creates initial claim event.'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiBody({ type: FileClaimDto, description: 'Claim details including incident date, loss type, and description' })
  @ApiResponse({ status: 201, description: 'Claim filed successfully with claim number generated' })
  @ApiResponse({ status: 400, description: 'Invalid claim data' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fileClaim(
    @Param('policyNumber') policyNumber: string,
    @Body() body: FileClaimDto,
  ) {
    try {
      const claim = await this.quoteService.fileClaim(policyNumber, body);
      return formatResponse(claim, 'Claim filed successfully');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to file claim',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/v1/portal/:policyNumber/claims/:claimId/documents
   * Upload document to claim (mock - no actual file storage)
   */
  @Post(':policyNumber/claims/:claimId/documents')
  @ApiOperation({
    summary: 'Upload claim document',
    description: 'Upload supporting documentation to a claim (photos, police reports, etc.). Accepts JPEG, PNG, and PDF files up to 10MB. Demo mode - no actual file storage.'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiParam({ name: 'claimId', description: 'Claim ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' })
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeds 10MB limit' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadClaimDocument(
    @Param('policyNumber') policyNumber: string,
    @Param('claimId') claimId: string,
    @UploadedFile() file: any,
  ) {
    try {
      // Validate file type and size
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG, PNG, and PDF allowed.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new HttpException('File size exceeds 10MB limit', HttpStatus.BAD_REQUEST);
      }

      // Upload document (mock)
      const document = await this.quoteService.uploadClaimDocument(claimId, {
        filename: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
      });

      return formatResponse(document, 'Document uploaded successfully');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload document',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/documents/:documentId
   * Download document (mock - returns metadata only)
   */
  @Get(':policyNumber/documents/:documentId')
  @ApiOperation({
    summary: 'Download document',
    description: 'Download a policy or claim document. Demo mode - returns metadata only, no actual file download.'
  })
  @ApiParam({ name: 'policyNumber', description: 'Policy number in DZXXXXXXXX format', example: 'DZQV87Z4FH' })
  @ApiParam({ name: 'documentId', description: 'Document ID (UUID)', example: 'd1e2f3g4-h5i6-7890-jklm-1234567890ab' })
  @ApiResponse({ status: 200, description: 'Document metadata retrieved (download URL provided in demo mode)' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async downloadDocument(
    @Param('policyNumber') policyNumber: string,
    @Param('documentId') documentId: string,
  ) {
    try {
      // In a real implementation, this would stream the file from storage
      // For now, return document metadata
      return formatResponse(
        {
          document_id: documentId,
          policy_number: policyNumber,
          download_url: `/documents/download/${documentId}`,
          message: 'Document download not implemented in demo mode',
        },
        'Document metadata retrieved',
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to download document',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
