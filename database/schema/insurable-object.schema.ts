/**
 * Insurable Object Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents objects that can be insured (vehicles, properties, etc.).
 * Vehicle is a subtype of Insurable Object.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps, temporalTracking } from './_base.schema';

export const insurableObject = pgTable('insurable_object', {
  // Primary Key
  insurable_object_identifier: uuid('insurable_object_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  insurable_object_type_code: varchar('insurable_object_type_code', { length: 50 }).notNull(), // VEHICLE, PROPERTY, etc.
  object_name: varchar('object_name', { length: 255 }),
  object_description: varchar('object_description', { length: 500 }),

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

export type InsurableObject = typeof insurableObject.$inferSelect;
export type NewInsurableObject = typeof insurableObject.$inferInsert;
