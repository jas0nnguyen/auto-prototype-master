/**
 * Event Entity Schema - OMG P&C Data Model v1.0
 *
 * Base entity for all system events.
 * Uses inheritance pattern: Policy Event and Claim Event are subtypes.
 * Events provide audit trail and history tracking for business processes.
 */

import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const event = pgTable('event', {
  // Primary Key
  event_id: uuid('event_id').primaryKey().defaultRandom(),

  // Core Attributes
  event_type: varchar('event_type', { length: 50 }).notNull(), // POLICY_CREATED, CLAIM_FILED, etc.
  event_subtype: varchar('event_subtype', { length: 50 }), // For categorization (e.g., NEW_BUSINESS, ENDORSEMENT)
  event_date: timestamp('event_date').notNull().defaultNow(),

  // Event Details (flexible JSONB for event-specific data)
  event_data: jsonb('event_data'), // Stores event-specific attributes
  event_description: varchar('event_description', { length: 500 }), // Human-readable description

  // Actor Tracking
  actor_id: uuid('actor_id'), // Who triggered the event (User ID, system process ID, etc.)
  actor_type: varchar('actor_type', { length: 50 }), // USER, SYSTEM, API, BATCH_PROCESS

  // Audit Timestamps
  ...auditTimestamps,
});

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
