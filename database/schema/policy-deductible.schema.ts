/**
 * Policy Deductible Entity Schema - OMG P&C Data Model v1.0
 *
 * Defines coverage deductibles (e.g., $500 deductible for collision).
 */

import { pgTable, uuid, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { policyCoverageDetail } from './policy-coverage-detail.schema';
import { auditTimestamps } from './_base.schema';

export const policyDeductible = pgTable('policy_deductible', {
  // Primary Key
  policy_deductible_identifier: uuid('policy_deductible_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_coverage_detail_identifier: uuid('policy_coverage_detail_identifier')
    .references(() => policyCoverageDetail.policy_coverage_detail_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Deductible Details
  deductible_type_code: varchar('deductible_type_code', { length: 50 }).notNull(), // PER_CLAIM, PER_OCCURRENCE
  deductible_amount: decimal('deductible_amount', { precision: 10, scale: 2 }).notNull(),
  deductible_description: varchar('deductible_description', { length: 500 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type PolicyDeductible = typeof policyDeductible.$inferSelect;
export type NewPolicyDeductible = typeof policyDeductible.$inferInsert;
