/**
 * Policy Entity Schema - OMG P&C Data Model v1.0
 *
 * Subtype of Agreement representing an insurance contract.
 * A quote is represented as a Policy with status='QUOTED'.
 */

import { pgTable, uuid, varchar, date, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { agreement } from './agreement.schema';
import { auditTimestamps } from './_base.schema';

export const policy = pgTable('policy', {
  // Primary Key (FK to Agreement - subtype pattern)
  policy_identifier: uuid('policy_identifier')
    .primaryKey()
    .references(() => agreement.agreement_identifier, { onDelete: 'cascade' }),

  // Core Attributes
  policy_number: varchar('policy_number', { length: 50 }).notNull().unique(),
  effective_date: date('effective_date').notNull(),
  expiration_date: date('expiration_date').notNull(),
  status_code: varchar('status_code', { length: 50 }).notNull(), // QUOTED, BINDING, BOUND, ACTIVE, CANCELLED, EXPIRED

  // Quote-specific fields (hybrid approach - JSONB + denormalized)
  quote_snapshot: jsonb('quote_snapshot'), // Complete quote data for fast CRM retrieval
  marital_status: varchar('marital_status', { length: 20 }), // Denormalized for query performance
  coverage_start_date: date('coverage_start_date'), // Denormalized for query performance

  // Audit Timestamps
  ...auditTimestamps,
});

export type Policy = typeof policy.$inferSelect;
export type NewPolicy = typeof policy.$inferInsert;

/**
 * Policy Status Codes (OMG Pattern)
 */
export const PolicyStatus = {
  QUOTED: 'QUOTED',           // Quote generated, awaiting customer decision (expires in 30 days)
  BINDING: 'BINDING',         // Customer submitted payment, transaction processing
  BOUND: 'BOUND',             // Payment successful, policy purchased, awaiting effective date
  ACTIVE: 'ACTIVE',           // Policy effective date reached, coverage in force
  CANCELLED: 'CANCELLED',     // Policy terminated before expiration
  EXPIRED: 'EXPIRED',         // Policy reached expiration date
} as const;
