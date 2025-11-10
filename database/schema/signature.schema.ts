import { pgTable, uuid, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { party } from './party.schema';

/**
 * Signature Entity
 *
 * Purpose: Store digital signatures captured during the signing ceremony (Screen 10)
 * OMG Mapping: Extends OMG Agreement with digital signature evidence
 *
 * Business Rules:
 * - One signature per quote (enforced at application layer)
 * - Signature required before policy binding (FR-010)
 * - Image data stored as Base64 string (no file storage needed)
 * - Max size: 1MB (enforced at application layer via base64 length check)
 * - Format: PNG (primary) or JPEG (fallback)
 */
export const signatures = pgTable('signature', {
  // Primary Key
  signature_id: uuid('signature_id').primaryKey().defaultRandom(),

  // Foreign Keys
  quote_id: uuid('quote_id')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  party_id: uuid('party_id')
    .notNull()
    .references(() => party.party_identifier, { onDelete: 'cascade' }),

  // Signature Data
  signature_image_data: text('signature_image_data').notNull(), // Base64 PNG/JPEG
  signature_format: varchar('signature_format', { length: 10 }).notNull(), // 'PNG' or 'JPEG'
  signature_date: timestamp('signature_date').notNull().defaultNow(),

  // Audit Trail
  ip_address: varchar('ip_address', { length: 45 }), // IPv4 (15 chars) or IPv6 (45 chars)
  user_agent: text('user_agent'),

  // Temporal Tracking
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
}, (table) => ({
  // Indexes for query optimization
  signature_quote_id_idx: index('signature_quote_id_idx').on(table.quote_id),
  signature_party_id_idx: index('signature_party_id_idx').on(table.party_id),
}));

// Type exports for TypeScript type safety
export type Signature = typeof signatures.$inferSelect;
export type NewSignature = typeof signatures.$inferInsert;
