/**
 * Document Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents policy documents, ID cards, claim attachments, and other files.
 * Stores metadata and references to document storage (mock S3 URLs for demo).
 */

import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';

export const document = pgTable('document', {
  // Primary Key
  document_id: uuid('document_id').primaryKey().defaultRandom(),

  // Foreign Keys (polymorphic - can relate to policy, claim, etc.)
  policy_id: uuid('policy_id').references(() => policy.policy_identifier, { onDelete: 'cascade' }),
  claim_id: uuid('claim_id'), // Will reference claim table (created in Phase 5)

  // Core Attributes
  document_number: varchar('document_number', { length: 20 }).notNull().unique(), // e.g., "DOC-DZ12345678"
  document_type: varchar('document_type', { length: 50 }).notNull(), // POLICY_PDF, ID_CARD, CLAIM_ATTACHMENT, etc.
  document_name: varchar('document_name', { length: 255 }).notNull(), // Original filename or generated name

  // Storage Information
  storage_url: varchar('storage_url', { length: 500 }).notNull(), // Mock S3 path: /documents/policies/DZ12345678/declarations.pdf
  file_size: integer('file_size'), // File size in bytes
  mime_type: varchar('mime_type', { length: 100 }), // application/pdf, image/jpeg, etc.

  // Document Metadata
  description: varchar('description', { length: 500 }), // Description of document contents
  generated_at: timestamp('generated_at').notNull().defaultNow(), // When document was created/generated
  expires_at: timestamp('expires_at'), // For documents with expiration (e.g., ID cards)

  // Audit Timestamps
  ...auditTimestamps,
});

export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;
