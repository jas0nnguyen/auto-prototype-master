/**
 * Claim Event Schema
 *
 * OMG P&C Data Model v1.0 - Event subtype for Claims
 * Tracks significant events in the claim lifecycle for audit trail.
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { claim } from './claim.schema';

/**
 * Claim Event entity (OMG Event subtype)
 *
 * Records significant events in a claim's lifecycle:
 * - CLAIM_SUBMITTED: Initial claim filing
 * - CLAIM_UNDER_REVIEW: Assigned to adjuster
 * - CLAIM_APPROVED: Coverage approved
 * - CLAIM_DENIED: Coverage denied
 * - CLAIM_PAID: Payment issued
 * - CLAIM_CLOSED: Claim finalized
 */
export const claimEvent = pgTable('claim_event', {
  event_id: uuid('event_id').primaryKey().defaultRandom(),

  // Claim reference
  claim_id: uuid('claim_id')
    .notNull()
    .references(() => claim.claim_id, { onDelete: 'cascade' }),

  // Event details
  event_type: varchar('event_type', { length: 50 }).notNull(), // CLAIM_SUBMITTED, CLAIM_UNDER_REVIEW, etc.
  event_date: timestamp('event_date').notNull().defaultNow(),
  description: text('description'),

  // Metadata (JSON-serialized additional data)
  metadata: text('metadata'), // JSON string with event-specific data

  // Who triggered the event (optional - system or user ID)
  triggered_by: varchar('triggered_by', { length: 100 }),

  created_at: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Claim Event Relations
 */
export const claimEventRelations = relations(claimEvent, ({ one }) => ({
  // Many-to-one: Claim Event belongs to one Claim
  claim: one(claim, {
    fields: [claimEvent.claim_id],
    references: [claim.claim_id],
  }),
}));

/**
 * TypeScript type for Claim Event
 */
export type ClaimEvent = typeof claimEvent.$inferSelect;
export type NewClaimEvent = typeof claimEvent.$inferInsert;
