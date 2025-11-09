import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { PDFGeneratorService } from './pdf-generator.service';
import { TemplateService } from './template.service';
import { DocumentService } from './document.service';
import { DocumentsController } from '../../api/routes/documents.controller';
import { DatabaseModule } from '../../database/database.module';

/**
 * DocumentServiceModule - Provides document generation and storage services
 *
 * Exports:
 * - TemplateService: Handlebars template compilation and rendering
 * - StorageService: Vercel Blob storage integration for document upload/download
 * - PDFGeneratorService: PDF document generation using Playwright
 * - DocumentService: High-level document management (Phase 3)
 *
 * Controllers:
 * - DocumentsController: REST API endpoints for document management
 *
 * Feature: 003-portal-document-download
 */
@Module({
  imports: [DatabaseModule],
  controllers: [DocumentsController],
  providers: [
    DocumentService,
    TemplateService,
    StorageService,
    PDFGeneratorService,
  ],
  exports: [
    DocumentService,
    TemplateService,
    StorageService,
    PDFGeneratorService,
  ],
})
export class DocumentServiceModule {}
