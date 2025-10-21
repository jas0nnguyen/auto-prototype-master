/**
 * Assessment Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents damage assessments and evaluations (used for claims and underwriting).
 */

import { pgTable, uuid, varchar, decimal, date, text, timestamp } from 'drizzle-orm/pg-core';
import { party } from './party.schema';
import { auditTimestamps } from './_base.schema';

export const assessment = pgTable('assessment', {
  // Primary Key
  assessment_identifier: uuid('assessment_identifier').primaryKey().defaultRandom(),

  // Assessment Details
  damage_description: text('damage_description'),
  estimated_amount: decimal('estimated_amount', { precision: 12, scale: 2 }),
  assessment_date: date('assessment_date').notNull(),
  assessment_type: varchar('assessment_type', { length: 50 }), // CLAIM, UNDERWRITING, INSPECTION

  // Relationships
  assessor_party_id: uuid('assessor_party_id')
    .references(() => party.party_identifier),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Assessment = typeof assessment.$inferSelect;
export type NewAssessment = typeof assessment.$inferInsert;
