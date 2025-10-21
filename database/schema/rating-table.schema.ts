/**
 * Rating Table Entity Schema - Rating Engine Extension
 *
 * Stores base rates and rating multipliers for premium calculation.
 */

import { pgTable, uuid, varchar, decimal, text, date, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const ratingTable = pgTable('rating_table', {
  // Primary Key
  rating_table_identifier: uuid('rating_table_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  table_name: varchar('table_name', { length: 100 }).notNull(),
  table_code: varchar('table_code', { length: 50 }).notNull().unique(),
  table_type: varchar('table_type', { length: 50 }).notNull(), // BASE_RATE, MULTIPLIER, FACTOR
  table_description: text('table_description'),

  // Lookup Keys (JSON for flexibility)
  lookup_key_1: varchar('lookup_key_1', { length: 100 }),
  lookup_key_2: varchar('lookup_key_2', { length: 100 }),
  lookup_key_3: varchar('lookup_key_3', { length: 100 }),

  // Rate Value
  rate_value: decimal('rate_value', { precision: 10, scale: 4 }).notNull(),

  // Effective Period
  effective_date: date('effective_date').notNull(),
  expiration_date: date('expiration_date'),

  // Audit Timestamps
  ...auditTimestamps,
});

export type RatingTable = typeof ratingTable.$inferSelect;
export type NewRatingTable = typeof ratingTable.$inferInsert;
