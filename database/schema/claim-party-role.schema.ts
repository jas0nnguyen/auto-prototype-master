/**
 * Claim Party Role Schema
 *
 * OMG P&C Data Model v1.0 - Party Role pattern for Claims
 * Links parties to claims with their role (CLAIMANT, INSURED, WITNESS, etc.)
 */

import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditTimestamps } from './_base.schema';
import { claim } from './claim.schema';
import { party } from './party.schema';

/**
 * Claim Party Role entity (OMG pattern)
 *
 * Associates a Party with a Claim in a specific role.
 * Examples: CLAIMANT (person filing), INSURED (policyholder), WITNESS, ADJUSTER
 */
export const claimPartyRole = pgTable('claim_party_role', {
  claim_party_role_id: uuid('claim_party_role_id').primaryKey().defaultRandom(),

  // Foreign keys
  claim_id: uuid('claim_id')
    .notNull()
    .references(() => claim.claim_id, { onDelete: 'cascade' }),
  party_identifier: uuid('party_identifier')
    .notNull()
    .references(() => party.party_identifier, { onDelete: 'restrict' }),

  // Role type code (OMG pattern)
  role_type_code: varchar('role_type_code', { length: 30 }).notNull(), // CLAIMANT, INSURED, WITNESS, ADJUSTER

  // Audit trail
  ...auditTimestamps,
});

/**
 * Claim Party Role Relations
 */
export const claimPartyRoleRelations = relations(claimPartyRole, ({ one }) => ({
  // Many-to-one: Claim Party Role belongs to one Claim
  claim: one(claim, {
    fields: [claimPartyRole.claim_id],
    references: [claim.claim_id],
  }),

  // Many-to-one: Claim Party Role involves one Party
  party: one(party, {
    fields: [claimPartyRole.party_identifier],
    references: [party.party_identifier],
  }),
}));

/**
 * TypeScript type for Claim Party Role
 */
export type ClaimPartyRole = typeof claimPartyRole.$inferSelect;
export type NewClaimPartyRole = typeof claimPartyRole.$inferInsert;
