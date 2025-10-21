/**
 * Rating Factor Entity Schema - Rating Engine Extension
 *
 * Stores individual rating factors used in premium calculation.
 */

import { pgTable, uuid, varchar, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const ratingFactor = pgTable('rating_factor', {
  // Primary Key
  rating_factor_identifier: uuid('rating_factor_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  factor_name: varchar('factor_name', { length: 100 }).notNull(),
  factor_category: varchar('factor_category', { length: 50 }).notNull(), // VEHICLE, DRIVER, LOCATION, COVERAGE
  factor_code: varchar('factor_code', { length: 50 }).notNull(),
  factor_value: varchar('factor_value', { length: 255 }),
  factor_weight: decimal('factor_weight', { precision: 5, scale: 4 }), // Multiplier (e.g., 1.2500)
  factor_description: text('factor_description'),

  // Audit Timestamps
  ...auditTimestamps,
});

export type RatingFactor = typeof ratingFactor.$inferSelect;
export type NewRatingFactor = typeof ratingFactor.$inferInsert;
