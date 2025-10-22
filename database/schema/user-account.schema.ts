/**
 * User Account Schema (Demo Mode - No Authentication)
 *
 * OMG P&C extension for portal access.
 * In demo mode, access is granted via URL with policy number (no passwords).
 * In production, this would include authentication fields.
 */

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';

/**
 * User Account entity
 *
 * Represents a portal user account linked to one or more policies.
 * Demo mode: URL-based access with policy number (no password required).
 */
export const userAccount = pgTable('user_account', {
  account_id: uuid('account_id').primaryKey().defaultRandom(),

  // Primary policy (user may have multiple policies linked to same email)
  policy_identifier: uuid('policy_identifier')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  // Contact information
  email: varchar('email', { length: 255 }).notNull(),

  // Demo mode access token (UUID for URL-based portal access)
  // In production, this would be replaced with proper authentication
  access_token: uuid('access_token').notNull().defaultRandom(),

  // Tracking
  last_accessed_at: timestamp('last_accessed_at'),

  ...auditTimestamps,
});

/**
 * User Account Relations
 */
// Temporarily disabled to avoid circular dependency during migration generation
// export const userAccountRelations = relations(userAccount, ({ one }) => ({
//   // Many-to-one: User Account belongs to one Policy
//   policy: one(policy, {
//     fields: [userAccount.policy_identifier],
//     references: [policy.policy_identifier],
//   }),
// }));

/**
 * TypeScript type for User Account
 */
export type UserAccount = typeof userAccount.$inferSelect;
export type NewUserAccount = typeof userAccount.$inferInsert;
