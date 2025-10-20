/**
 * Person Entity Schema - OMG P&C Data Model v1.0
 *
 * Subtype of Party representing individual persons.
 * Inherits from Party via party_identifier foreign key.
 */

import { pgTable, uuid, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { party } from './party.schema';
import { auditTimestamps } from './_base.schema';

export const person = pgTable('person', {
  // Primary Key (FK to Party - subtype pattern)
  person_identifier: uuid('person_identifier')
    .primaryKey()
    .references(() => party.party_identifier, { onDelete: 'cascade' }),

  // Name Components
  prefix_name: varchar('prefix_name', { length: 20 }), // Mr., Mrs., Dr.
  first_name: varchar('first_name', { length: 100 }).notNull(),
  middle_name: varchar('middle_name', { length: 100 }),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  suffix_name: varchar('suffix_name', { length: 20 }), // Jr., Sr., III
  full_legal_name: varchar('full_legal_name', { length: 255 }),
  nickname: varchar('nickname', { length: 100 }),

  // Personal Information
  birth_date: date('birth_date'),
  birth_place_name: varchar('birth_place_name', { length: 255 }),
  gender_code: varchar('gender_code', { length: 20 }),

  // Audit Timestamps
  ...auditTimestamps,
});

export type Person = typeof person.$inferSelect;
export type NewPerson = typeof person.$inferInsert;
