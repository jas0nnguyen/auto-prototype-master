/**
 * Agreement Entity Schema - OMG P&C Data Model v1.0
 *
 * A legally binding contract among identified parties. Policy is a subtype of Agreement.
 */

import { pgTable, uuid, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { product } from './product.schema';
import { auditTimestamps } from './_base.schema';

export const agreement = pgTable('agreement', {
  // Primary Key
  agreement_identifier: uuid('agreement_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  agreement_type_code: varchar('agreement_type_code', { length: 50 }).notNull(), // POLICY, REINSURANCE
  agreement_name: varchar('agreement_name', { length: 255 }),
  agreement_original_inception_date: date('agreement_original_inception_date'),

  // Relationships
  product_identifier: uuid('product_identifier')
    .references(() => product.product_identifier)
    .notNull(),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Agreement = typeof agreement.$inferSelect;
export type NewAgreement = typeof agreement.$inferInsert;
