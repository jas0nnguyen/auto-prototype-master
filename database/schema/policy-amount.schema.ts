/**
 * Policy Amount (Money) Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents monetary amounts associated with policies (premiums, fees, taxes).
 */

import { pgTable, uuid, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { geographicLocation } from './geographic-location.schema';
import { auditTimestamps } from './_base.schema';

export const policyAmount = pgTable('policy_amount', {
  // Primary Key
  policy_amount_identifier: uuid('policy_amount_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_identifier: uuid('policy_identifier')
    .references(() => policy.policy_identifier, { onDelete: 'cascade' })
    .notNull(),
  geographic_location_identifier: uuid('geographic_location_identifier')
    .references(() => geographicLocation.geographic_location_identifier),

  // Amount Details
  amount_type_code: varchar('amount_type_code', { length: 50 }).notNull(), // PREMIUM, TAX, FEE, SURCHARGE, DISCOUNT
  amount_value: decimal('amount_value', { precision: 12, scale: 2 }).notNull(),
  currency_code: varchar('currency_code', { length: 3 }).default('USD'),
  amount_description: varchar('amount_description', { length: 500 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type PolicyAmount = typeof policyAmount.$inferSelect;
export type NewPolicyAmount = typeof policyAmount.$inferInsert;
