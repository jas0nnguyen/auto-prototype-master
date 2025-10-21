/**
 * Geographic Location Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents jurisdictional and physical locations including state, municipality, and address.
 * Critical for rating, underwriting, and regulatory compliance.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const geographicLocation = pgTable('geographic_location', {
  // Primary Key
  geographic_location_identifier: uuid('geographic_location_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  geographic_location_type_code: varchar('geographic_location_type_code', { length: 50 }),
  location_code: varchar('location_code', { length: 50 }),
  location_name: varchar('location_name', { length: 255 }),
  location_number: varchar('location_number', { length: 50 }),
  state_code: varchar('state_code', { length: 2 }),

  // Hierarchical Relationships
  parent_geographic_location_identifier: uuid('parent_geographic_location_identifier'),
  location_address_identifier: uuid('location_address_identifier'),
  physical_location_identifier: uuid('physical_location_identifier'),

  // Audit Timestamps
  ...auditTimestamps,
});

// Self-referential foreign key for hierarchy
export const geographicLocationRelations = {
  parent: geographicLocation.parent_geographic_location_identifier,
};

export type GeographicLocation = typeof geographicLocation.$inferSelect;
export type NewGeographicLocation = typeof geographicLocation.$inferInsert;
