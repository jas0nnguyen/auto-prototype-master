/**
 * Party Role Relationship Tables - OMG P&C Data Model v1.0
 *
 * Implements the Party Role pattern for many-to-many relationships with roles and temporal validity.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { party } from './party.schema';
import { agreement } from './agreement.schema';
import { account } from './account.schema';
import { insurableObject } from './insurable-object.schema';
import { auditTimestamps, temporalTracking } from './_base.schema';

/**
 * Agreement Party Role - Links Party to Agreement with specific role
 */
export const agreementPartyRole = pgTable('agreement_party_role', {
  // Primary Key
  agreement_party_role_identifier: uuid('agreement_party_role_identifier').primaryKey().defaultRandom(),

  // Relationships
  agreement_identifier: uuid('agreement_identifier')
    .references(() => agreement.agreement_identifier, { onDelete: 'cascade' })
    .notNull(),
  party_identifier: uuid('party_identifier')
    .references(() => party.party_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Role
  party_role_code: varchar('party_role_code', { length: 50 }).notNull(), // INSURED, NAMED_INSURED, DRIVER, etc.

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

/**
 * Account Party Role - Links Party to Account with specific role
 */
export const accountPartyRole = pgTable('account_party_role', {
  // Primary Key
  account_party_role_identifier: uuid('account_party_role_identifier').primaryKey().defaultRandom(),

  // Relationships
  account_identifier: uuid('account_identifier')
    .references(() => account.account_identifier, { onDelete: 'cascade' })
    .notNull(),
  party_identifier: uuid('party_identifier')
    .references(() => party.party_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Role
  party_role_code: varchar('party_role_code', { length: 50 }).notNull(), // CUSTOMER, POLICYHOLDER, etc.

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

/**
 * Insurable Object Party Role - Links Party to Insurable Object with specific role
 */
export const insurableObjectPartyRole = pgTable('insurable_object_party_role', {
  // Primary Key
  insurable_object_party_role_identifier: uuid('insurable_object_party_role_identifier').primaryKey().defaultRandom(),

  // Relationships
  insurable_object_identifier: uuid('insurable_object_identifier')
    .references(() => insurableObject.insurable_object_identifier, { onDelete: 'cascade' })
    .notNull(),
  party_identifier: uuid('party_identifier')
    .references(() => party.party_identifier, { onDelete: 'cascade' })
    .notNull(),

  // Role
  party_role_code: varchar('party_role_code', { length: 50 }).notNull(), // OWNER, LESSEE, DRIVER, etc.

  // Temporal Tracking (OMG Pattern)
  ...temporalTracking,

  // Audit Timestamps
  ...auditTimestamps,
});

export type AgreementPartyRole = typeof agreementPartyRole.$inferSelect;
export type NewAgreementPartyRole = typeof agreementPartyRole.$inferInsert;

export type AccountPartyRole = typeof accountPartyRole.$inferSelect;
export type NewAccountPartyRole = typeof accountPartyRole.$inferInsert;

export type InsurableObjectPartyRole = typeof insurableObjectPartyRole.$inferSelect;
export type NewInsurableObjectPartyRole = typeof insurableObjectPartyRole.$inferInsert;
