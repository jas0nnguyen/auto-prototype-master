/**
 * Premium Calculation Entity Schema - Rating Engine Extension
 *
 * Stores complete audit trail of premium calculations with all factors, weights, and intermediate values.
 */

import { pgTable, uuid, varchar, decimal, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { auditTimestamps } from './_base.schema';

export const premiumCalculation = pgTable('premium_calculation', {
  // Primary Key
  premium_calculation_identifier: uuid('premium_calculation_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_identifier: uuid('policy_identifier')
    .references(() => policy.policy_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Base Premium
  base_premium: decimal('base_premium', { precision: 10, scale: 2 }).notNull(),

  // Rating Factors (stored as JSON for audit trail)
  vehicle_factors: jsonb('vehicle_factors'), // { age: 1.2, make: 1.1, model: 1.0, ... }
  driver_factors: jsonb('driver_factors'),   // { age: 1.5, experience: 1.2, violations: 1.3, ... }
  location_factors: jsonb('location_factors'), // { zipCode: 1.1, urbanRural: 1.0, ... }
  coverage_factors: jsonb('coverage_factors'), // { limits: 1.2, deductibles: 0.9, ... }

  // Discounts and Surcharges
  discounts_applied: jsonb('discounts_applied'), // [{ code: 'GOOD_DRIVER', percentage: 15, amount: 150 }, ...]
  surcharges_applied: jsonb('surcharges_applied'), // [{ code: 'YOUNG_DRIVER', percentage: 50, amount: 500 }, ...]

  // Calculated Amounts
  total_factor_multiplier: decimal('total_factor_multiplier', { precision: 8, scale: 4 }),
  subtotal_before_discounts: decimal('subtotal_before_discounts', { precision: 10, scale: 2 }),
  total_discount_amount: decimal('total_discount_amount', { precision: 10, scale: 2 }),
  total_surcharge_amount: decimal('total_surcharge_amount', { precision: 10, scale: 2 }),

  // Taxes and Fees
  premium_tax_percentage: decimal('premium_tax_percentage', { precision: 5, scale: 2 }),
  premium_tax_amount: decimal('premium_tax_amount', { precision: 10, scale: 2 }),
  policy_fee_amount: decimal('policy_fee_amount', { precision: 10, scale: 2 }),
  dmv_fee_amount: decimal('dmv_fee_amount', { precision: 10, scale: 2 }),

  // Final Premium
  total_premium: decimal('total_premium', { precision: 10, scale: 2 }).notNull(),

  // Calculation Metadata
  calculation_timestamp: timestamp('calculation_timestamp').defaultNow().notNull(),
  calculation_version: varchar('calculation_version', { length: 20 }), // Rating engine version
  calculation_notes: text('calculation_notes'),

  // Audit Timestamps
  ...auditTimestamps,
});

export type PremiumCalculation = typeof premiumCalculation.$inferSelect;
export type NewPremiumCalculation = typeof premiumCalculation.$inferInsert;
