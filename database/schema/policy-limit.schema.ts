/**
 * Policy Limit Entity Schema - OMG P&C Data Model v1.0
 *
 * Defines coverage limits (e.g., $100,000 per person for bodily injury).
 */

import { pgTable, uuid, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { policyCoverageDetail } from './policy-coverage-detail.schema';
import { auditTimestamps } from './_base.schema';

export const policyLimit = pgTable('policy_limit', {
  // Primary Key
  policy_limit_identifier: uuid('policy_limit_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_coverage_detail_identifier: uuid('policy_coverage_detail_identifier')
    .references(() => policyCoverageDetail.policy_coverage_detail_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Limit Details
  limit_type_code: varchar('limit_type_code', { length: 50 }).notNull(), // PER_PERSON, PER_ACCIDENT, PER_OCCURRENCE
  limit_amount: decimal('limit_amount', { precision: 12, scale: 2 }).notNull(),
  limit_description: varchar('limit_description', { length: 500 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type PolicyLimit = typeof policyLimit.$inferSelect;
export type NewPolicyLimit = typeof policyLimit.$inferInsert;
