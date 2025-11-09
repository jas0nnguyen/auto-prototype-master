/**
 * Document Entity Schema - Enhanced for Document Generation
 *
 * Extends OMG P&C Data Model v1.0 Document entity with versioning,
 * generation tracking, and access audit capabilities.
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';
import { vehicle } from './vehicle.schema';

// Document Type Enum
export const documentTypeEnum = pgEnum('document_type', [
  'DECLARATIONS',      // Auto-generated declarations page
  'POLICY_DOCUMENT',   // Complete policy document
  'ID_CARD',          // Insurance ID card (vehicle-specific)
  'CLAIM_ATTACHMENT', // Claim-related documents (future)
  'PROOF_OF_INSURANCE', // Generic proof of insurance (future)
]);

// Document Status Enum
export const documentStatusEnum = pgEnum('document_status', [
  'GENERATING',   // Document generation in progress
  'READY',        // Document generated and available for download
  'FAILED',       // Generation failed after retries
  'SUPERSEDED',   // Replaced by newer version
]);

export const document = pgTable('document', {
  // ========================================
  // Primary Key
  // ========================================
  document_id: uuid('document_id').primaryKey().defaultRandom(),

  // ========================================
  // Foreign Keys (Polymorphic)
  // ========================================
  policy_id: uuid('policy_id')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  vehicle_id: uuid('vehicle_id')
    .references(() => vehicle.vehicle_identifier, { onDelete: 'cascade' }),
    // Nullable - only populated for vehicle-specific documents (e.g., ID cards)

  claim_id: uuid('claim_id'),
    // Future: will reference claim table (Phase 5+)
    // Nullable - only populated for claim-related documents

  // ========================================
  // Document Classification
  // ========================================
  document_number: varchar('document_number', { length: 20 })
    .notNull()
    .unique(),
    // Human-readable identifier: "DZDOC-12345678"

  document_type: documentTypeEnum('document_type').notNull(),
    // Type of document (see enum above)

  document_name: varchar('document_name', { length: 255 }).notNull(),
    // Display name: "Auto Insurance Declarations - DZQV87Z4FH.pdf"

  // ========================================
  // Versioning and Lifecycle
  // ========================================
  version: integer('version').notNull(),
    // Incremental version number (starts at 1)
    // Unique per (policy_id + document_type + vehicle_id) combination

  is_current: boolean('is_current').notNull().default(true),
    // TRUE = latest version, FALSE = superseded
    // Enables fast queries for "current" documents (indexed)

  document_status: documentStatusEnum('document_status')
    .notNull()
    .default('GENERATING'),
    // Current status in generation/lifecycle workflow

  // ========================================
  // Storage Information
  // ========================================
  storage_url: varchar('storage_url', { length: 1024 }),
    // Vercel Blob URL (nullable until generation completes)
    // Example: "https://xxxxx.public.blob.vercel-storage.com/policies/DZQV87Z4FH/declarations-v1.pdf"

  file_size_bytes: integer('file_size_bytes'),
    // File size in bytes (populated after upload)

  mime_type: varchar('mime_type', { length: 100 }).default('application/pdf'),
    // Content type (always PDF for generated documents)

  // ========================================
  // Generation Metadata
  // ========================================
  template_version: varchar('template_version', { length: 20 }),
    // Version of HTML template used for generation
    // Enables template change tracking

  generation_attempt: integer('generation_attempt').notNull().default(1),
    // Retry counter (increments on each attempt, max 3)

  generation_error: varchar('generation_error', { length: 1000 }),
    // Error message if status = FAILED

  generated_at: timestamp('generated_at'),
    // Timestamp when document generation completed successfully
    // Nullable until status transitions to READY

  superseded_at: timestamp('superseded_at'),
    // Timestamp when this version was replaced by a newer one
    // Nullable for current versions

  // ========================================
  // Access Audit Trail
  // ========================================
  accessed_at: timestamp('accessed_at'),
    // Last download/access timestamp

  accessed_count: integer('accessed_count').notNull().default(0),
    // Total number of times document was downloaded

  // ========================================
  // Document Metadata
  // ========================================
  description: varchar('description', { length: 500 }),
    // Optional description or notes

  // ========================================
  // Audit Timestamps (Standard OMG Pattern)
  // ========================================
  ...auditTimestamps,
    // created_at: When DB record was created
    // updated_at: When record was last modified

}, (table) => ({
  // ========================================
  // Indexes for Performance
  // ========================================

  // Index: Fast lookup of current documents for a policy
  idx_current_documents: index('idx_current_documents')
    .on(table.policy_id, table.document_type, table.is_current),

  // Index: Fast lookup by document number
  idx_document_number: index('idx_document_number')
    .on(table.document_number),

  // Index: Fast lookup of documents by generation date (for history)
  idx_generated_at: index('idx_generated_at')
    .on(table.generated_at),

  // Index: Fast lookup of documents by status (for monitoring)
  idx_document_status: index('idx_document_status')
    .on(table.document_status),

  // Index: Fast lookup of vehicle-specific documents (ID cards)
  idx_vehicle_documents: index('idx_vehicle_documents')
    .on(table.vehicle_id, table.document_type, table.is_current),

  // ========================================
  // Constraints
  // ========================================

  // Unique constraint: Only one version per (policy + doc_type + vehicle + version)
  uniq_policy_doc_vehicle_version: unique('uniq_policy_doc_vehicle_version')
    .on(table.policy_id, table.document_type, table.vehicle_id, table.version),
}));

// TypeScript types for type-safe queries
export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;
