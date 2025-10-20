/**
 * Coverage Part Entity Schema - OMG P&C Data Model v1.0
 *
 * Reference table for coverage types (e.g., Bodily Injury, Property Damage, Collision).
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const coveragePart = pgTable('coverage_part', {
  // Primary Key
  coverage_part_identifier: uuid('coverage_part_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  coverage_part_code: varchar('coverage_part_code', { length: 50 }).notNull().unique(),
  coverage_part_name: varchar('coverage_part_name', { length: 255 }).notNull(),
  coverage_part_description: text('coverage_part_description'),
  coverage_category: varchar('coverage_category', { length: 50 }), // LIABILITY, COLLISION, COMPREHENSIVE
  is_required: varchar('is_required', { length: 10 }).default('false'), // State-dependent

  // Audit Timestamps
  ...auditTimestamps,
});

export type CoveragePart = typeof coveragePart.$inferSelect;
export type NewCoveragePart = typeof coveragePart.$inferInsert;

/**
 * Standard Auto Insurance Coverage Parts
 */
export const StandardCoverageParts = {
  BI: 'BODILY_INJURY',              // Bodily Injury Liability
  PD: 'PROPERTY_DAMAGE',            // Property Damage Liability
  COLL: 'COLLISION',                // Collision Coverage
  COMP: 'COMPREHENSIVE',            // Comprehensive Coverage
  UM_BI: 'UNINSURED_MOTORIST_BI',   // Uninsured Motorist Bodily Injury
  UM_PD: 'UNINSURED_MOTORIST_PD',   // Uninsured Motorist Property Damage
  MEDICAL: 'MEDICAL_PAYMENTS',      // Medical Payments
  PIP: 'PERSONAL_INJURY_PROTECTION', // Personal Injury Protection
  RENTAL: 'RENTAL_REIMBURSEMENT',   // Rental Reimbursement
  ROADSIDE: 'ROADSIDE_ASSISTANCE',  // Roadside Assistance
} as const;
