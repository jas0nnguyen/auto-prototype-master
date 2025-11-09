/**
 * DocumentService - CRUD operations for document management
 *
 * Provides core document lifecycle operations:
 * - Create document records in database
 * - Retrieve documents by ID, policy, type
 * - Update document status (GENERATING → READY → SUPERSEDED)
 * - Track document access audit trail
 * - Generate human-readable document numbers (DZDOC-XXXXXXXX)
 *
 * Feature: 003-portal-document-download
 */

import { Injectable, Inject, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import type { Database } from '../../database/drizzle.config';
import { document } from '../../../../database/schema/document.schema';
import { policy } from '../../../../database/schema/policy.schema';
import { vehicle } from '../../../../database/schema/vehicle.schema';
import { and, eq, desc, sql } from 'drizzle-orm';
import type {
  DocumentType,
  DocumentStatus,
  DocumentMetadata,
  DocumentGenerationRequest
} from '../../types/document.types';
import { TemplateService } from './template.service';
import { PDFGeneratorService } from './pdf-generator.service';
import { StorageService } from './storage.service';
import { mapPolicyToDeclarationsData } from '../../utils/document-formatters';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private db: Database,
    private readonly templateService: TemplateService,
    private readonly pdfGenerator: PDFGeneratorService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Generate human-readable document number
   * Format: DZDOC-XXXXXXXX (8 random alphanumeric characters)
   */
  private generateDocumentNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
    let number = 'DZDOC-';
    for (let i = 0; i < 8; i++) {
      number += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return number;
  }

  /**
   * Create a new document record in database
   *
   * @param data - Document creation parameters
   * @returns Created document metadata
   */
  async createDocument(data: {
    policy_id: string;
    document_type: DocumentType;
    document_name: string;
    vehicle_id?: string;
    version?: number;
    template_version?: string;
  }): Promise<DocumentMetadata> {
    this.logger.log(`Creating document: ${data.document_type} for policy ${data.policy_id}`);

    // Generate unique document number
    const document_number = this.generateDocumentNumber();

    // Determine version number (default to 1 if not provided)
    const version = data.version || 1;

    // Create document record
    const [createdDocument] = await this.db.insert(document).values({
      document_number,
      policy_id: data.policy_id,
      vehicle_id: data.vehicle_id || null,
      claim_id: null, // Future: will be used for claim-related documents
      document_type: data.document_type,
      document_name: data.document_name,
      version,
      is_current: true,
      document_status: 'GENERATING',
      storage_url: null, // Will be set after PDF generation
      file_size_bytes: null,
      mime_type: 'application/pdf',
      template_version: data.template_version || '1.0.0',
      generation_attempt: 1,
      generation_error: null,
      generated_at: null,
      superseded_at: null,
      accessed_at: null,
      accessed_count: 0,
      description: null,
    }).returning();

    this.logger.log(`Document created: ${document_number}`);

    return this.mapToDocumentMetadata(createdDocument);
  }

  /**
   * Get document by document_id
   *
   * @param documentId - UUID of the document
   * @returns Document metadata
   * @throws NotFoundException if document not found
   */
  async getDocument(documentId: string): Promise<DocumentMetadata> {
    this.logger.log(`Fetching document: ${documentId}`);

    const [foundDocument] = await this.db
      .select()
      .from(document)
      .where(eq(document.document_id, documentId));

    if (!foundDocument) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    return this.mapToDocumentMetadata(foundDocument);
  }

  /**
   * Get document by document_number (human-readable ID)
   *
   * @param documentNumber - Document number (e.g., DZDOC-12345678)
   * @returns Document metadata
   * @throws NotFoundException if document not found
   */
  async getDocumentByNumber(documentNumber: string): Promise<DocumentMetadata> {
    this.logger.log(`Fetching document by number: ${documentNumber}`);

    const [foundDocument] = await this.db
      .select()
      .from(document)
      .where(eq(document.document_number, documentNumber));

    if (!foundDocument) {
      throw new NotFoundException(`Document not found: ${documentNumber}`);
    }

    return this.mapToDocumentMetadata(foundDocument);
  }

  /**
   * Get all documents for a policy
   *
   * @param policyId - UUID of the policy
   * @param options - Query options
   * @returns Array of document metadata
   */
  async getDocumentsByPolicy(
    policyId: string,
    options: {
      current_only?: boolean; // Only return is_current = true documents
      document_type?: DocumentType; // Filter by document type
      include_superseded?: boolean; // Include superseded documents
    } = {}
  ): Promise<DocumentMetadata[]> {
    const {
      current_only = true,
      document_type,
      include_superseded = false,
    } = options;

    this.logger.log(`Fetching documents for policy: ${policyId}`, {
      current_only,
      document_type,
      include_superseded,
    });

    // Build query conditions
    const conditions = [eq(document.policy_id, policyId)];

    if (current_only && !include_superseded) {
      conditions.push(eq(document.is_current, true));
    }

    if (document_type) {
      conditions.push(eq(document.document_type, document_type));
    }

    // Execute query
    const documents = await this.db
      .select()
      .from(document)
      .where(and(...conditions))
      .orderBy(desc(document.generated_at));

    return documents.map(this.mapToDocumentMetadata);
  }

  /**
   * Update document status
   *
   * @param documentId - UUID of the document
   * @param status - New status
   * @param metadata - Additional metadata to update
   */
  async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    metadata: {
      storage_url?: string;
      file_size_bytes?: number;
      generation_error?: string;
      generation_attempt?: number;
    } = {}
  ): Promise<DocumentMetadata> {
    this.logger.log(`Updating document ${documentId} to status: ${status}`);

    const updateData: any = {
      document_status: status,
    };

    // Add metadata fields if provided
    if (metadata.storage_url) {
      updateData.storage_url = metadata.storage_url;
    }
    if (metadata.file_size_bytes) {
      updateData.file_size_bytes = metadata.file_size_bytes;
    }
    if (metadata.generation_error) {
      updateData.generation_error = metadata.generation_error;
    }
    if (metadata.generation_attempt) {
      updateData.generation_attempt = metadata.generation_attempt;
    }

    // Set generated_at timestamp when status becomes READY
    if (status === 'READY') {
      updateData.generated_at = new Date();
    }

    // Set superseded_at timestamp when status becomes SUPERSEDED
    if (status === 'SUPERSEDED') {
      updateData.superseded_at = new Date();
      updateData.is_current = false;
    }

    const [updatedDocument] = await this.db
      .update(document)
      .set(updateData)
      .where(eq(document.document_id, documentId))
      .returning();

    if (!updatedDocument) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    return this.mapToDocumentMetadata(updatedDocument);
  }

  /**
   * Log document download/access
   *
   * Updates accessed_at timestamp and increments accessed_count
   *
   * @param documentId - UUID of the document
   */
  async logDownload(documentId: string): Promise<void> {
    this.logger.log(`Logging download for document: ${documentId}`);

    await this.db
      .update(document)
      .set({
        accessed_at: new Date(),
        accessed_count: sql`${document.accessed_count} + 1`,
      })
      .where(eq(document.document_id, documentId));
  }

  /**
   * Get next version number for a document type
   *
   * Calculates the next version number for a given policy + document_type + vehicle combination
   *
   * @param policyId - UUID of the policy
   * @param documentType - Type of document
   * @param vehicleId - Optional vehicle ID (for ID cards)
   * @returns Next version number
   */
  async getNextVersion(
    policyId: string,
    documentType: DocumentType,
    vehicleId?: string
  ): Promise<number> {
    const conditions = [
      eq(document.policy_id, policyId),
      eq(document.document_type, documentType),
    ];

    if (vehicleId) {
      conditions.push(eq(document.vehicle_id, vehicleId));
    } else {
      conditions.push(sql`${document.vehicle_id} IS NULL`);
    }

    const documents = await this.db
      .select()
      .from(document)
      .where(and(...conditions))
      .orderBy(desc(document.version));

    if (documents.length === 0) {
      return 1; // First version
    }

    return documents[0].version + 1;
  }

  /**
   * Supersede previous document versions
   *
   * Marks all previous versions of a document as SUPERSEDED
   *
   * @param policyId - UUID of the policy
   * @param documentType - Type of document
   * @param vehicleId - Optional vehicle ID (for ID cards)
   */
  async supersedePreviousVersions(
    policyId: string,
    documentType: DocumentType,
    vehicleId?: string
  ): Promise<void> {
    this.logger.log(`Superseding previous versions: ${documentType} for policy ${policyId}`);

    const conditions = [
      eq(document.policy_id, policyId),
      eq(document.document_type, documentType),
      eq(document.is_current, true),
    ];

    if (vehicleId) {
      conditions.push(eq(document.vehicle_id, vehicleId));
    } else {
      conditions.push(sql`${document.vehicle_id} IS NULL`);
    }

    await this.db
      .update(document)
      .set({
        document_status: 'SUPERSEDED',
        superseded_at: new Date(),
        is_current: false,
      })
      .where(and(...conditions));
  }

  /**
   * Generate documents for a policy (orchestration method)
   *
   * This method orchestrates the full document generation workflow:
   * 1. Fetch policy data from database (policy, vehicles, parties, coverages)
   * 2. Supersede previous document versions (if force_regenerate or policy change)
   * 3. Create new document records in GENERATING status
   * 4. Render HTML templates with policy data
   * 5. Generate PDFs from HTML using Playwright
   * 6. Upload PDFs to Vercel Blob storage
   * 7. Update document records to READY status with storage URLs
   *
   * @param request - Document generation request
   * @returns Array of generated document metadata
   * @throws InternalServerErrorException if generation fails after retries
   */
  async generateDocuments(request: DocumentGenerationRequest): Promise<DocumentMetadata[]> {
    const { policy_id, document_type, vehicle_id, force_regenerate = false } = request;

    this.logger.log(`Generating documents for policy ${policy_id}`, {
      document_type,
      vehicle_id,
      force_regenerate,
    });

    try {
      // Step 1: Fetch policy data from database
      const [policyData] = await this.db
        .select()
        .from(policy)
        .where(eq(policy.policy_identifier, policy_id));

      if (!policyData) {
        throw new NotFoundException(`Policy not found: ${policy_id}`);
      }

      // Extract vehicle data from quote_snapshot (vehicles are stored in JSON, not normalized)
      const quoteSnapshot = policyData.quote_snapshot as any;
      const vehicles = quoteSnapshot?.vehicles || (quoteSnapshot?.vehicle ? [quoteSnapshot.vehicle] : []);

      // For now, we'll generate a declarations page (most common document type)
      const documentsToGenerate: DocumentType[] = document_type
        ? [document_type]
        : ['DECLARATIONS' as DocumentType]; // Default to declarations if not specified

      const generatedDocuments: DocumentMetadata[] = [];

      for (const docType of documentsToGenerate) {
        try {
          // Step 2: Get next version number
          const nextVersion = await this.getNextVersion(policy_id, docType, vehicle_id);

          // Step 3: Supersede previous versions if force regenerate
          if (force_regenerate && nextVersion > 1) {
            await this.supersedePreviousVersions(policy_id, docType, vehicle_id);
          }

          // Step 4: Create document record in GENERATING status
          const documentName = this.generateDocumentName(policyData, docType, nextVersion);
          const documentRecord = await this.createDocument({
            policy_id,
            document_type: docType,
            document_name: documentName,
            vehicle_id,
            version: nextVersion,
            template_version: '1.0.0',
          });

          // Step 5: Render template with policy data
          let html: string;
          if (docType === 'DECLARATIONS') {
            // For now, we'll need parties and coverages - these would come from your actual schema
            // This is a simplified version that would be expanded with actual data fetching
            const templateData = mapPolicyToDeclarationsData(
              policyData,
              vehicles,
              [], // parties - would fetch from DB
              []  // coverages - would fetch from DB
            );
            html = await this.templateService.renderTemplate('declarations-page.hbs', templateData);
          } else {
            throw new Error(`Template not implemented for document type: ${docType}`);
          }

          // Step 6: Generate PDF from HTML
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

          // Step 7: Upload PDF to Vercel Blob
          const filename = this.generateStoragePath(policyData.policy_number, docType, nextVersion);
          const { url, size } = await this.storageService.uploadDocument(
            filename,
            pdfBuffer,
            'application/pdf'
          );

          // Step 8: Update document record to READY status
          const updatedDocument = await this.updateDocumentStatus(
            documentRecord.document_id,
            'READY' as DocumentStatus,
            {
              storage_url: url,
              file_size_bytes: size,
            }
          );

          generatedDocuments.push(updatedDocument);
          this.logger.log(`Document generated successfully: ${documentRecord.document_number}`);
        } catch (error) {
          this.logger.error(`Failed to generate ${docType} document:`, error);
          // Continue with other documents even if one fails
        }
      }

      return generatedDocuments;
    } catch (error) {
      this.logger.error('Document generation failed:', error);
      throw new InternalServerErrorException('Failed to generate documents', error.message);
    }
  }

  /**
   * Generate storage path for Blob storage
   * Format: policies/{policyNumber}/documents/{documentType}-v{version}.pdf
   */
  private generateStoragePath(
    policyNumber: string,
    documentType: DocumentType,
    version: number
  ): string {
    const docTypeSlug = documentType.toLowerCase().replace(/_/g, '-');
    return `policies/${policyNumber}/documents/${docTypeSlug}-v${version}.pdf`;
  }

  /**
   * Generate human-readable document name
   * Examples:
   * - "Auto Insurance Declarations - DZQV87Z4FH.pdf"
   * - "Insurance ID Card - Vehicle 1 - DZQV87Z4FH.pdf"
   * - "Policy Document - DZQV87Z4FH.pdf"
   */
  private generateDocumentName(
    policyData: any,
    documentType: DocumentType,
    version: number
  ): string {
    const docTypeNames: Record<DocumentType, string> = {
      DECLARATIONS: 'Auto Insurance Declarations',
      POLICY_DOCUMENT: 'Policy Document',
      ID_CARD: 'Insurance ID Card',
      CLAIM_ATTACHMENT: 'Claim Attachment',
      PROOF_OF_INSURANCE: 'Proof of Insurance',
    };

    const typeName = docTypeNames[documentType] || documentType;
    return `${typeName} - ${policyData.policy_number}.pdf`;
  }

  /**
   * Map database document to DocumentMetadata DTO
   */
  private mapToDocumentMetadata(doc: any): DocumentMetadata {
    return {
      document_id: doc.document_id,
      document_number: doc.document_number,
      document_type: doc.document_type as DocumentType,
      document_name: doc.document_name,
      version: doc.version,
      is_current: doc.is_current,
      document_status: doc.document_status as DocumentStatus,
      storage_url: doc.storage_url,
      file_size_bytes: doc.file_size_bytes,
      mime_type: doc.mime_type,
      created_at: doc.created_at,
      accessed_at: doc.accessed_at,
      accessed_count: doc.accessed_count,
    };
  }
}
