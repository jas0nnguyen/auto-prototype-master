/**
 * Claim Schema
 *
 * OMG P&C Data Model v1.0 - Claim entity
 * Represents an insurance claim filed against a policy.
 */

import { pgTable, uuid, varchar, text, timestamp, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';
import { vehicle } from './vehicle.schema';
import { person } from './person.schema';

/**
 * Claim entity (OMG core entity)
 *
 * Represents a loss event and request for coverage under a policy.
 */
export const claim = pgTable('claim', {
  claim_id: uuid('claim_id').primaryKey().defaultRandom(),

  // Human-readable claim number (DZXXXXXXXX format, same pattern as quote/policy)
  claim_number: varchar('claim_number', { length: 20 }).notNull().unique(),

  // Policy reference
  policy_identifier: uuid('policy_identifier')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'restrict' }),

  // Incident details
  incident_date: date('incident_date').notNull(),
  loss_type: varchar('loss_type', { length: 50 }).notNull(), // COLLISION, COMPREHENSIVE, LIABILITY, etc.
  description: text('description').notNull(),

  // Related entities (optional - which vehicle/driver involved)
  vehicle_identifier: uuid('vehicle_identifier').references(() => vehicle.vehicle_identifier, {
    onDelete: 'set null',
  }),
  driver_identifier: uuid('driver_identifier').references(() => person.person_identifier, {
    onDelete: 'set null',
  }),

  // Claim status
  status: varchar('status', { length: 30 }).notNull().default('SUBMITTED'), // SUBMITTED, UNDER_REVIEW, APPROVED, DENIED, PAID, CLOSED

  // Financial details (populated during adjudication)
  estimated_loss_amount: varchar('estimated_loss_amount', { length: 20 }), // Money as string
  approved_amount: varchar('approved_amount', { length: 20 }), // Money as string
  paid_amount: varchar('paid_amount', { length: 20 }), // Money as string

  // Audit trail
  ...auditTimestamps,
});

/**
 * Claim Relations
 */
// Temporarily disabled to avoid circular dependency during migration generation
// export const claimRelations = relations(claim, ({ one }) => ({
//   // Many-to-one: Claim belongs to one Policy
//   policy: one(policy, {
//     fields: [claim.policy_identifier],
//     references: [policy.policy_identifier],
//   }),

//   // Many-to-one: Claim may involve one Vehicle
//   vehicle: one(vehicle, {
//     fields: [claim.vehicle_identifier],
//     references: [vehicle.vehicle_identifier],
//   }),

//   // Many-to-one: Claim may involve one Driver
//   driver: one(person, {
//     fields: [claim.driver_identifier],
//     references: [person.person_identifier],
//   }),
// }));

/**
 * TypeScript type for Claim
 */
export type Claim = typeof claim.$inferSelect;
export type NewClaim = typeof claim.$inferInsert;
