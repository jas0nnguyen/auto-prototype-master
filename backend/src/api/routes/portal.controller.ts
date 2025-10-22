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
import { FileInterceptor } from '@nestjs/platform-express';
import { QuoteService } from '../../services/quote/quote.service';

// Simple response helper
const formatResponse = (data: any, message?: string) => ({
  success: true,
  data,
  message,
});

@Controller('api/v1/portal')
export class PortalController {
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * GET /api/v1/portal/:policyNumber/dashboard
   * Get complete dashboard data (policy, drivers, vehicles, premium, payments, claims)
   */
  @Get(':policyNumber/dashboard')
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
  async fileClaim(
    @Param('policyNumber') policyNumber: string,
    @Body()
    body: {
      incident_date: string;
      loss_type: string;
      description: string;
      vehicle_identifier?: string;
      driver_identifier?: string;
    },
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
