/**
 * Product Entity Schema - OMG P&C Data Model v1.0
 *
 * Represents the insurance offering (e.g., "Personal Auto Insurance").
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';

export const product = pgTable('product', {
  // Primary Key
  product_identifier: uuid('product_identifier').primaryKey().defaultRandom(),

  // Core Attributes
  line_of_business_identifier: uuid('line_of_business_identifier'),
  licensed_product_name: varchar('licensed_product_name', { length: 255 }).notNull().unique(),
  product_description: text('product_description'),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
