/**
 * Party Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents a person, organization, or group of interest to the enterprise.
 * Party serves as the central entity for all person/organization relationships.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps, temporalTracking } from './_base.schema';

export const party = pgTable('party', {
  // Primary Key
  party_identifier: uuid('party_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  party_name: varchar('party_name', { length: 255 }).notNull(),
  party_type_code: varchar('party_type_code', { length: 50 }).notNull(), // PERSON, ORGANIZATION, GROUPING

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

export type Party = typeof party.$inferSelect;
export type NewParty = typeof party.$inferInsert;
