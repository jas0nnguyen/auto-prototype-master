/**
 * Communication Identity Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents contact methods (email, phone, mobile, fax) associated with a Party.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { geographicLocation } from './geographic-location.schema';
import { auditTimestamps } from './_base.schema';

export const communicationIdentity = pgTable('communication_identity', {
  // Primary Key
  communication_identifier: uuid('communication_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  communication_type_code: varchar('communication_type_code', { length: 50 }).notNull(), // EMAIL, PHONE, MOBILE, FAX
  communication_value: varchar('communication_value', { length: 255 }).notNull(),
  communication_qualifier_value: varchar('communication_qualifier_value', { length: 100 }), // Extension, etc.

  // Relationships
  geographic_location_identifier: uuid('geographic_location_identifier')
    .references(() => geographicLocation.geographic_location_identifier),

  // Audit Timestamps
  ...auditTimestamps,
});

export type CommunicationIdentity = typeof communicationIdentity.$inferSelect;
export type NewCommunicationIdentity = typeof communicationIdentity.$inferInsert;
