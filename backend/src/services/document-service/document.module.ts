import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { PDFGeneratorService } from './pdf-generator.service';
import { StorageService } from './storage.service';
import { DocumentService } from './document.service';
import { DocumentsController } from '../../api/routes/documents.controller';

/**
 * DocumentModule - NestJS module for document generation services
 *
 * Provides:
 * - DocumentService: CRUD operations and document generation orchestration
 * - TemplateService: Handlebars template compilation and rendering
 * - PDFGeneratorService: HTML-to-PDF conversion using Playwright
 * - StorageService: Vercel Blob document upload/download
 * - DocumentsController: REST API endpoints for document management
 *
 * Feature: 003-portal-document-download
 *
 * Usage:
 * Import this module in other modules that need document generation capabilities.
 * All services are exported and can be injected into other services/controllers.
 *
 * Example:
 * ```typescript
 * @Module({
 *   imports: [DocumentModule],
 * })
 * export class SomeOtherModule {}
 * ```
 */
@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentService,
    TemplateService,
    PDFGeneratorService,
    StorageService,
  ],
  exports: [
    DocumentService,
    TemplateService,
    PDFGeneratorService,
    StorageService,
  ],
})
export class DocumentModule {}
