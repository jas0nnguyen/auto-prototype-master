/**
 * Surcharge Entity Schema - Rating Engine Extension
 *
 * Stores surcharge information applied to premiums.
 */

import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { policy } from './policy.schema';
import { auditTimestamps } from './_base.schema';

export const surcharge = pgTable('surcharge', {
  // Primary Key
  surcharge_identifier: uuid('surcharge_identifier').primaryKey().defaultRandom(),

  // Relationships
  policy_identifier: uuid('policy_identifier')
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  // Surcharge Details
  surcharge_code: varchar('surcharge_code', { length: 50 }).notNull(),
  surcharge_name: varchar('surcharge_name', { length: 255 }).notNull(),
  surcharge_description: text('surcharge_description'),
  surcharge_type: varchar('surcharge_type', { length: 50 }), // YOUNG_DRIVER, DUI, HIGH_PERFORMANCE, etc.
  surcharge_percentage: decimal('surcharge_percentage', { precision: 5, scale: 2 }).notNull(), // e.g., 50.00 for 50%
  surcharge_amount: decimal('surcharge_amount', { precision: 10, scale: 2 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Surcharge = typeof surcharge.$inferSelect;
export type NewSurcharge = typeof surcharge.$inferInsert;

/**
 * Standard Auto Insurance Surcharges
 */
export const StandardSurcharges = {
  YOUNG_DRIVER: { code: 'YOUNG_DRIVER', percentage: 50.00, description: 'Young Driver Surcharge (+30-100%)' },
  DUI: { code: 'DUI', percentage: 75.00, description: 'DUI/DWI Conviction (+50-100%)' },
  HIGH_PERFORMANCE: { code: 'HIGH_PERFORMANCE', percentage: 40.00, description: 'High-Performance Vehicle (+25-75%)' },
  ACCIDENT_FAULT: { code: 'ACCIDENT_FAULT', percentage: 20.00, description: 'At-Fault Accident (+15-40%)' },
  SPEEDING_TICKET: { code: 'SPEEDING_TICKET', percentage: 15.00, description: 'Speeding Violation (+10-25%)' },
  LAPSED_COVERAGE: { code: 'LAPSED_COVERAGE', percentage: 10.00, description: 'Lapsed Coverage (+5-20%)' },
  HIGH_RISK_ZIP: { code: 'HIGH_RISK_ZIP', percentage: 15.00, description: 'High-Risk Location (+10-30%)' },
  CREDIT_SCORE: { code: 'CREDIT_SCORE', percentage: 25.00, description: 'Poor Credit Score (+15-50%)' },
} as const;
