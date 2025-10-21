/**
 * Policy Event Entity Schema - OMG P&C Data Model v1.0
 *
 * Subtype of Event entity for policy-specific events.
 * Tracks policy lifecycle events: creation, binding, activation, cancellation, renewal.
 * Provides audit trail for policy status changes.
 */

import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { event } from './event.schema';
import { policy } from './policy.schema';

export const policyEvent = pgTable('policy_event', {
  // Primary Key (inherits from Event)
  policy_event_id: uuid('policy_event_id')
    .primaryKey()
    .defaultRandom(),

  // Foreign Keys
  event_id: uuid('event_id')
    .notNull()
    .references(() => event.event_id, { onDelete: 'cascade' }),

  policy_id: uuid('policy_id')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  // Policy Event Specific Attributes
  previous_status: varchar('previous_status', { length: 20 }), // Status before this event
  new_status: varchar('new_status', { length: 20 }), // Status after this event
  change_reason: varchar('change_reason', { length: 255 }), // Why the status changed
});

export type PolicyEvent = typeof policyEvent.$inferSelect;
export type NewPolicyEvent = typeof policyEvent.$inferInsert;
