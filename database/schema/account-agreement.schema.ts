/**
 * Account-Agreement Relationship Entity - OMG P&C Data Model v1.0
 *
 * Links Account to Agreement (many-to-many) with temporal validity.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { account } from './account.schema';
import { agreement } from './agreement.schema';
import { auditTimestamps, temporalTracking } from './_base.schema';

export const accountAgreement = pgTable('account_agreement', {
  // Primary Key
  account_agreement_identifier: uuid('account_agreement_identifier').primaryKey().defaultRandom(),

  // Relationships
  account_identifier: uuid('account_identifier')
    .references(() => account.account_identifier, { onDelete: 'cascade' })
    .notNull(),
  agreement_identifier: uuid('agreement_identifier')
    .references(() => agreement.agreement_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Relationship Type
  relationship_type: varchar('relationship_type', { length: 50 }), // PRIMARY, SECONDARY

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

export type AccountAgreement = typeof accountAgreement.$inferSelect;
export type NewAccountAgreement = typeof accountAgreement.$inferInsert;
