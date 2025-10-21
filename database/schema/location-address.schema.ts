/**
 * Location Address Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents physical addresses with standard components.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps, temporalTracking } from './_base.schema';

export const locationAddress = pgTable('location_address', {
  // Primary Key
  location_address_identifier: uuid('location_address_identifier').primaryKey().defaultRandom(),

  // Address Components
  line_1_address: varchar('line_1_address', { length: 255 }).notNull(),
  line_2_address: varchar('line_2_address', { length: 255 }),
  municipality_name: varchar('municipality_name', { length: 100 }).notNull(),
  state_code: varchar('state_code', { length: 2 }).notNull(),
  postal_code: varchar('postal_code', { length: 20 }).notNull(),
  country_code: varchar('country_code', { length: 3 }).default('USA'),

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

export type LocationAddress = typeof locationAddress.$inferSelect;
export type NewLocationAddress = typeof locationAddress.$inferInsert;
