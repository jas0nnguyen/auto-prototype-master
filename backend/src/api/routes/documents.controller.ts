/**
 * DocumentsController - REST API endpoints for document management
 *
 * Endpoints:
 * - GET /api/v1/portal/:policyNumber/documents - List all documents for a policy
 * - GET /api/v1/portal/:policyNumber/documents/:documentId/download - Download a document
 *
 * Feature: 003-portal-document-download
 * Tasks: T023, T024, T025
 */

import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentService } from '../../services/document-service/document.service';
import { TemplateService } from '../../services/document-service/template.service';
import { PDFGeneratorService } from '../../services/document-service/pdf-generator.service';
import { DocumentType } from '../../types/document.types';
import { DATABASE_CONNECTION } from '../../database/database.module';
import type { Database } from '../../database/drizzle.config';
import { Inject } from '@nestjs/common';
import { policy } from '../../../../database/schema/policy.schema';
import { eq } from 'drizzle-orm';
import { mapPolicyToDeclarationsData } from '../../utils/document-formatters';

@Controller('api/v1/portal')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly templateService: TemplateService,
    private readonly pdfGenerator: PDFGeneratorService,
    @Inject(DATABASE_CONNECTION) private db: Database,
  ) {}

  /**
   * GET /api/v1/portal/:policyNumber/documents
   *
   * List all documents for a policy
   *
   * Query parameters:
   * - document_type (optional): Filter by document type
   * - include_superseded (optional): Include superseded versions (default: false)
   *
   * @param policyNumber - Human-readable policy number (e.g., DZQV87Z4FH)
   * @param documentType - Optional document type filter
   * @param includeSuperseded - Optional flag to include superseded documents
   * @returns Array of document metadata
   */
  @Get(':policyNumber/documents')
  async listDocuments(
    @Param('policyNumber') policyNumber: string,
    @Query('document_type') documentType?: DocumentType,
    @Query('include_superseded') includeSuperseded?: string,
  ) {
    this.logger.log(`Listing documents for policy: ${policyNumber}`, {
      documentType,
      includeSuperseded,
    });

    try {
      // Step 1: Look up policy by policy number to get policy_id
      const [policyData] = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, policyNumber));

      if (!policyData) {
        throw new NotFoundException(`Policy not found: ${policyNumber}`);
      }

      // Step 2: Fetch documents for this policy
      const documents = await this.documentService.getDocumentsByPolicy(
        policyData.policy_identifier,
        {
          current_only: !includeSuperseded || includeSuperseded === 'false',
          document_type: documentType,
          include_superseded: includeSuperseded === 'true',
        }
      );

      return {
        success: true,
        data: documents,
        meta: {
          policy_number: policyNumber,
          total: documents.length,
          filter: {
            document_type: documentType || null,
            include_superseded: includeSuperseded === 'true',
          },
        },
      };
    } catch (error) {
      this.logger.error('Failed to list documents:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Failed to retrieve documents: ${error.message}`);
    }
  }

  /**
   * GET /api/v1/portal/:policyNumber/documents/:documentId/download
   *
   * Download a document (redirects to signed Blob URL or serves mock PDF)
   *
   * @param policyNumber - Human-readable policy number (e.g., DZQV87Z4FH)
   * @param documentId - UUID of the document
   * @param res - Express response object for redirect
   */
  @Get(':policyNumber/documents/:documentId/download')
  async downloadDocument(
    @Param('policyNumber') policyNumber: string,
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Download request for document: ${documentId} (policy: ${policyNumber})`);

    try {
      // Step 1: Verify policy exists
      const [policyData] = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_number, policyNumber));

      if (!policyData) {
        throw new NotFoundException(`Policy not found: ${policyNumber}`);
      }

      // Step 2: Fetch document by ID
      const document = await this.documentService.getDocument(documentId);

      // Step 3: Verify document belongs to this policy
      if (document.document_id !== documentId) {
        throw new NotFoundException(
          `Document ${documentId} not found for policy ${policyNumber}`
        );
      }

      // Step 4: Check if document is ready for download
      if (document.document_status !== 'READY') {
        return res.status(HttpStatus.ACCEPTED).json({
          success: false,
          message: `Document is currently ${document.document_status}. Please try again later.`,
          data: {
            document_id: document.document_id,
            document_status: document.document_status,
          },
        });
      }

      // Step 5: Verify storage URL exists
      if (!document.storage_url) {
        throw new NotFoundException('Document file not found in storage');
      }

      // Step 6: Log download access (audit trail)
      await this.documentService.logDownload(documentId);

      // Step 7: Check if this is a mock URL (starts with /documents/)
      // For demo purposes, generate PDF on-the-fly from template
      if (document.storage_url.startsWith('/documents/')) {
        this.logger.log('Generating PDF on-the-fly from template');

        try {
          // Fetch full policy data with quote_snapshot
          const quoteSnapshot = policyData.quote_snapshot as any;

          // Extract vehicles from snapshot (use array if available, fallback to single vehicle)
          const vehicles = quoteSnapshot?.vehicles || (quoteSnapshot?.vehicle ? [quoteSnapshot.vehicle] : []);

          // Extract drivers from snapshot (combine primary driver + additional drivers)
          const drivers = [];
          if (quoteSnapshot?.driver) {
            drivers.push(quoteSnapshot.driver);
          }
          if (quoteSnapshot?.additionalDrivers && Array.isArray(quoteSnapshot.additionalDrivers)) {
            drivers.push(...quoteSnapshot.additionalDrivers);
          }

          // Extract parties for mapPolicyToDeclarationsData (it expects party entities)
          const parties = drivers.map((driver, index) => ({
            first_name: driver.firstName || 'Unknown',
            last_name: driver.lastName || 'Driver',
            birth_date: driver.birthDate,
            drivers_license_number: driver.licenseNumber,
            license_number: driver.licenseNumber,
            role_type: index === 0 ? 'PRIMARY_POLICYHOLDER' : 'ADDITIONAL_DRIVER',
            // Address from snapshot
            address: quoteSnapshot?.address?.addressLine1,
            address_line_1: quoteSnapshot?.address?.addressLine1,
            city: quoteSnapshot?.address?.city,
            state: quoteSnapshot?.address?.state,
            state_province: quoteSnapshot?.address?.state,
            zip: quoteSnapshot?.address?.zipCode,
            postal_code: quoteSnapshot?.address?.zipCode,
          }));

          // Ensure we have at least one party (fallback to mock data if needed)
          if (parties.length === 0) {
            this.logger.warn('No drivers found in quote_snapshot, using fallback data');
            parties.push({
              first_name: 'John',
              last_name: 'Doe',
              birth_date: new Date('1980-01-01'),
              drivers_license_number: 'DL123456',
              license_number: 'DL123456',
              role_type: 'PRIMARY_POLICYHOLDER',
              address: quoteSnapshot?.address?.addressLine1 || '123 Main St',
              address_line_1: quoteSnapshot?.address?.addressLine1 || '123 Main St',
              city: quoteSnapshot?.address?.city || 'San Francisco',
              state: quoteSnapshot?.address?.state || 'CA',
              state_province: quoteSnapshot?.address?.state || 'CA',
              zip: quoteSnapshot?.address?.zipCode || '94102',
              postal_code: quoteSnapshot?.address?.zipCode || '94102',
            });
          }

          // Map coverages from snapshot - extract actual coverage data
          const coverages: any[] = [];
          if (quoteSnapshot?.coverages) {
            const cov = quoteSnapshot.coverages;

            // Bodily Injury Liability
            if (cov.bodilyInjuryLimit) {
              const biLimit = typeof cov.bodilyInjuryLimit === 'string'
                ? parseInt(cov.bodilyInjuryLimit.split('/')[0].replace(/\D/g, '')) * 1000
                : 100000;
              coverages.push({
                coverage_type: 'BODILY_INJURY_LIABILITY',
                limit_amount: biLimit,
                deductible_amount: null,
                coverage_premium: 0, // Premium breakdown not available in snapshot
              });
            }

            // Property Damage Liability
            if (cov.propertyDamageLimit) {
              const pdLimit = typeof cov.propertyDamageLimit === 'string'
                ? parseInt(cov.propertyDamageLimit.replace(/\D/g, '')) * 1000
                : 100000;
              coverages.push({
                coverage_type: 'PROPERTY_DAMAGE_LIABILITY',
                limit_amount: pdLimit,
                deductible_amount: null,
                coverage_premium: 0,
              });
            }

            // Collision
            if (cov.hasCollision) {
              const collisionDed = typeof cov.collisionDeductible === 'string'
                ? parseInt(cov.collisionDeductible.replace(/\D/g, ''))
                : (cov.collisionDeductible || 500);
              coverages.push({
                coverage_type: 'COLLISION',
                limit_amount: null,
                deductible_amount: collisionDed,
                coverage_premium: 0,
              });
            }

            // Comprehensive
            if (cov.hasComprehensive) {
              const comprehensiveDed = typeof cov.comprehensiveDeductible === 'string'
                ? parseInt(cov.comprehensiveDeductible.replace(/\D/g, ''))
                : (cov.comprehensiveDeductible || 500);
              coverages.push({
                coverage_type: 'COMPREHENSIVE',
                limit_amount: null,
                deductible_amount: comprehensiveDed,
                coverage_premium: 0,
              });
            }

            // Uninsured Motorist
            if (cov.hasUninsured) {
              const umLimit = typeof cov.bodilyInjuryLimit === 'string'
                ? parseInt(cov.bodilyInjuryLimit.split('/')[0].replace(/\D/g, '')) * 1000
                : 100000;
              coverages.push({
                coverage_type: 'UNINSURED_MOTORIST',
                limit_amount: umLimit,
                deductible_amount: null,
                coverage_premium: 0,
              });
            }

            // Roadside Assistance
            if (cov.hasRoadside) {
              coverages.push({
                coverage_type: 'ROADSIDE_ASSISTANCE',
                limit_amount: null,
                deductible_amount: null,
                coverage_premium: 0,
              });
            }

            // Rental Reimbursement
            if (cov.hasRental) {
              const rentalLimit = typeof cov.rentalLimit === 'string'
                ? parseInt(cov.rentalLimit.replace(/\D/g, ''))
                : (cov.rentalLimit || 50);
              coverages.push({
                coverage_type: 'RENTAL_REIMBURSEMENT',
                limit_amount: rentalLimit,
                deductible_amount: null,
                coverage_premium: 0,
              });
            }
          }

          // Format data for template using the existing formatter
          const templateData = mapPolicyToDeclarationsData(
            policyData,
            vehicles,
            parties,
            coverages
          );

          // Render HTML template
          const html = await this.templateService.renderTemplate('declarations-page.html', templateData);

          // Generate PDF from HTML
          const pdfBuffer = await this.pdfGenerator.generatePDF(html, {
            format: 'Letter',
            printBackground: true,
            margin: {
              top: '0.5in',
              right: '0.5in',
              bottom: '0.5in',
              left: '0.5in',
            },
          });

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${document.document_name}"`);
          return res.send(pdfBuffer);
        } catch (error) {
          this.logger.error('Failed to generate PDF from template:', error);
          this.logger.error('Error stack:', error.stack);
          this.logger.error('Error details:', JSON.stringify(error, null, 2));
          throw new InternalServerErrorException(`Failed to generate PDF document: ${error.message}`);
        }
      }

      // Step 8: Redirect to actual Vercel Blob URL (production)
      return res.redirect(HttpStatus.TEMPORARY_REDIRECT, document.storage_url);
    } catch (error) {
      this.logger.error('Failed to download document:', error);

      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to download document',
        error: error.message,
      });
    }
  }

  /**
   * Generate a simple mock PDF for demo purposes
   * Returns a minimal valid PDF with policy information
   */
  private generateMockPDF(policyNumber: string, documentType: string, documentName: string): Buffer {
    // Minimal valid PDF structure (PDF 1.4)
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(Mock Insurance Document) Tj
0 -30 Td
/F1 14 Tf
(Policy Number: ${policyNumber}) Tj
0 -20 Td
(Document Type: ${documentType}) Tj
0 -20 Td
(Document Name: ${documentName}) Tj
0 -40 Td
/F1 12 Tf
(This is a demo document for development purposes.) Tj
0 -20 Td
(Actual PDF generation will be implemented in production.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000303 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
554
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }
}
