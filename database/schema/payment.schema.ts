/**
 * Payment Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents a payment transaction for policy premium.
 * Stores tokenized payment information (last 4 digits, account masks)
 * to comply with PCI DSS requirements - no full card numbers stored.
 */

import { pgTable, uuid, varchar, integer, timestamp, decimal } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';

export const payment = pgTable('payment', {
  // Primary Key
  payment_id: uuid('payment_id').primaryKey().defaultRandom(),

  // Foreign Keys
  policy_id: uuid('policy_id')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  // Core Attributes
  payment_number: varchar('payment_number', { length: 20 }).notNull().unique(), // e.g., "PAY-DZ12345678"
  payment_method: varchar('payment_method', { length: 20 }).notNull(), // 'credit_card' | 'ach' | 'debit_card'
  payment_status: varchar('payment_status', { length: 20 }).notNull(), // PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // Payment amount in USD

  // Tokenized Payment Data (PCI Compliant - no full card numbers)
  last_four_digits: varchar('last_four_digits', { length: 4 }), // Last 4 of card/account
  card_brand: varchar('card_brand', { length: 20 }), // Visa, Mastercard, Discover, Amex
  account_type: varchar('account_type', { length: 20 }), // checking, savings (for ACH)

  // Payment Gateway Response
  transaction_id: varchar('transaction_id', { length: 100 }), // External gateway transaction ID
  gateway_response: varchar('gateway_response', { length: 255 }), // Success message or error details

  // Timestamps
  payment_date: timestamp('payment_date').notNull().defaultNow(),
  processed_at: timestamp('processed_at'), // When payment was fully processed

  // Audit Timestamps
  ...auditTimestamps,
});

export type Payment = typeof payment.$inferSelect;
export type NewPayment = typeof payment.$inferInsert;
