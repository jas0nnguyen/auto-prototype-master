/**
 * Discount Entity Schema - Rating Engine Extension
 *
 * Stores discount information applied to premiums.
 */

import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { auditTimestamps } from './_base.schema';

export const discount = pgTable('discount', {
  // Primary Key
  discount_identifier: uuid('discount_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_identifier: uuid('policy_identifier')
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  // Discount Details
  discount_code: varchar('discount_code', { length: 50 }).notNull(),
  discount_name: varchar('discount_name', { length: 255 }).notNull(),
  discount_description: text('discount_description'),
  discount_type: varchar('discount_type', { length: 50 }), // GOOD_DRIVER, MULTI_CAR, LOW_MILEAGE, etc.
  discount_percentage: decimal('discount_percentage', { precision: 5, scale: 2 }).notNull(), // e.g., 15.00 for 15%
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Discount = typeof discount.$inferSelect;
export type NewDiscount = typeof discount.$inferInsert;

/**
 * Standard Auto Insurance Discounts
 */
export const StandardDiscounts = {
  GOOD_DRIVER: { code: 'GOOD_DRIVER', percentage: 15.00, description: 'Good Driver Discount (15-25%)' },
  MULTI_CAR: { code: 'MULTI_CAR', percentage: 10.00, description: 'Multi-Car Discount (5-15%)' },
  LOW_MILEAGE: { code: 'LOW_MILEAGE', percentage: 10.00, description: 'Low Mileage Discount (5-15%)' },
  ANTI_THEFT: { code: 'ANTI_THEFT', percentage: 5.00, description: 'Anti-Theft Device Discount (5-10%)' },
  SAFETY_FEATURES: { code: 'SAFETY_FEATURES', percentage: 5.00, description: 'Safety Features Discount (3-7%)' },
  DEFENSIVE_DRIVING: { code: 'DEFENSIVE_DRIVING', percentage: 10.00, description: 'Defensive Driving Course (5-15%)' },
  BUNDLED: { code: 'BUNDLED', percentage: 10.00, description: 'Bundled Policies Discount (10-20%)' },
} as const;
