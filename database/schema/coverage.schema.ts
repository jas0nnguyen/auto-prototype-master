/**
 * Coverage Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents a specific coverage provision within a product.
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { coveragePart } from './coverage-part.schema';
import { product } from './product.schema';
import { auditTimestamps } from './_base.schema';

export const coverage = pgTable('coverage', {
  // Primary Key
  coverage_identifier: uuid('coverage_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  coverage_code: varchar('coverage_code', { length: 50 }).notNull(),
  coverage_name: varchar('coverage_name', { length: 255 }).notNull(),
  coverage_description: text('coverage_description'),

  // Relationships
  coverage_part_identifier: uuid('coverage_part_identifier')
    .references(() => coveragePart.coverage_part_identifier)
    .notNull(),
  product_identifier: uuid('product_identifier')
    .references(() => product.product_identifier)
    .notNull(),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Coverage = typeof coverage.$inferSelect;
export type NewCoverage = typeof coverage.$inferInsert;
