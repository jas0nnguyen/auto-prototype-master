/**
 * Policy Coverage Detail Entity Schema - OMG P&C Data Model v1.0
 *
 * Links a Policy to specific Coverage provisions for specific Insurable Objects (Vehicles).
 */

import { pgTable, uuid, varchar, date, text, timestamp } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { coverage } from './coverage.schema';
import { insurableObject } from './insurable-object.schema';
import { auditTimestamps } from './_base.schema';

export const policyCoverageDetail = pgTable('policy_coverage_detail', {
  // Primary Key
  policy_coverage_detail_identifier: uuid('policy_coverage_detail_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_identifier: uuid('policy_identifier')
    .references(() => policy.policy_identifier, { onDelete: 'cascade' })
    .notNull(),
  coverage_identifier: uuid('coverage_identifier')
    .references(() => coverage.coverage_identifier)
    .notNull(),
  insurable_object_identifier: uuid('insurable_object_identifier')
    .references(() => insurableObject.insurable_object_identifier),

  // Coverage Details
  effective_date: date('effective_date').notNull(),
  expiration_date: date('expiration_date').notNull(),
  coverage_description: text('coverage_description'),
  is_included: varchar('is_included', { length: 10 }).default('true'),

  // Audit Timestamps
  ...auditTimestamps,
});

export type PolicyCoverageDetail = typeof policyCoverageDetail.$inferSelect;
export type NewPolicyCoverageDetail = typeof policyCoverageDetail.$inferInsert;
