/**
 * Account Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents the customer relationship container that holds one or more Agreements (Policies).
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const account = pgTable('account', {
  // Primary Key
  account_identifier: uuid('account_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  account_type_code: varchar('account_type_code', { length: 50 }).notNull(), // INSURED_ACCOUNT, PRODUCER_ACCOUNT
  account_name: varchar('account_name', { length: 255 }).notNull(),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
