/**
 * Vehicle Entity Schema - OMG P&C Data Model v1.0
 *
 * Subtype of Insurable Object representing motor vehicles.
 */

import { pgTable, uuid, varchar, integer, decimal, date, timestamp, index } from 'drizzle-orm/pg-core';
import { insurableObject } from './insurable-object.schema';
import { party } from './party.schema';
import { auditTimestamps } from './_base.schema';

export const vehicle = pgTable('vehicle', {
  // Primary Key (FK to Insurable Object - subtype pattern)
  vehicle_identifier: uuid('vehicle_identifier')
    .primaryKey()
    .references(() => insurableObject.insurable_object_identifier, { onDelete: 'cascade' }),

  // Vehicle Identification
  vin: varchar('vin', { length: 17 }).unique(),
  license_plate_number: varchar('license_plate_number', { length: 20 }),
  license_plate_state_code: varchar('license_plate_state_code', { length: 2 }),

  // Vehicle Details
  year: integer('year').notNull(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  body_style: varchar('body_style', { length: 50 }),
  vehicle_type_code: varchar('vehicle_type_code', { length: 50 }), // SEDAN, SUV, TRUCK, etc.

  // Vehicle Specifications
  engine_type: varchar('engine_type', { length: 50 }),
  engine_displacement: decimal('engine_displacement', { precision: 5, scale: 1 }),
  fuel_type: varchar('fuel_type', { length: 50 }),
  transmission_type: varchar('transmission_type', { length: 50 }),

  // Valuation and Safety
  purchase_date: date('purchase_date'),
  purchase_price: decimal('purchase_price', { precision: 10, scale: 2 }),
  current_value: decimal('current_value', { precision: 10, scale: 2 }),
  odometer_reading: integer('odometer_reading'),

  // Usage Information
  annual_mileage: integer('annual_mileage'),
  primary_use: varchar('primary_use', { length: 50 }), // COMMUTE, PLEASURE, BUSINESS
  ownership_type: varchar('ownership_type', { length: 50 }), // OWNED, LEASED, FINANCED

  // Safety Features
  anti_theft_device: varchar('anti_theft_device', { length: 100 }),
  safety_features: varchar('safety_features', { length: 500 }), // JSON array of features

  // Lienholder Information (for financed/leased vehicles)
  lienholder_party_id: uuid('lienholder_party_id')
    .references(() => party.party_identifier, { onDelete: 'set null' }),

  // Audit Timestamps
  ...auditTimestamps,
}, (table) => ({
  // Index for lienholder lookup optimization
  vehicle_lienholder_party_id_idx: index('vehicle_lienholder_party_id_idx').on(table.lienholder_party_id),
}));

export type Vehicle = typeof vehicle.$inferSelect;
export type NewVehicle = typeof vehicle.$inferInsert;
