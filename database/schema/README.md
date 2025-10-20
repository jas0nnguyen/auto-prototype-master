# Database Schema

This directory contains Drizzle ORM schema definitions for the auto insurance platform.

## Overview

The schema follows the **OMG Property & Casualty Data Model v1.0** standard with 33 entities:
- **27 OMG P&C Core Entities**: Party, Policy, Coverage, Claim, etc.
- **6 Rating Engine Entities**: Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation

## Directory Structure

```
schema/
├── README.md                       # This file
├── _base.schema.ts                 # Base schema helpers and types
├── party.schema.ts                 # Party entity
├── person.schema.ts                # Person (Party subtype)
├── communication-identity.schema.ts
├── geographic-location.schema.ts
├── location-address.schema.ts
├── account.schema.ts
├── product.schema.ts
├── agreement.schema.ts
├── policy.schema.ts                # Policy (Agreement subtype)
├── insurable-object.schema.ts
├── vehicle.schema.ts               # Vehicle (Insurable Object subtype)
├── coverage.schema.ts
├── coverage-part.schema.ts
├── policy-coverage-detail.schema.ts
├── policy-limit.schema.ts
├── policy-deductible.schema.ts
├── policy-amount.schema.ts
├── rating-factor.schema.ts
├── rating-table.schema.ts
├── discount.schema.ts
├── surcharge.schema.ts
├── premium-calculation.schema.ts
├── party-roles.schema.ts           # Party Role relationship tables
├── payment.schema.ts
├── event.schema.ts
├── policy-event.schema.ts
├── claim.schema.ts
├── claim-party-role.schema.ts
├── claim-event.schema.ts
├── user-account.schema.ts
├── document.schema.ts
├── assessment.schema.ts
└── account-agreement.schema.ts
```

## OMG Compliance Patterns

### 1. Primary Keys
All entities use UUID primary keys following OMG naming:
```typescript
{entity_name}_identifier: uuid('party_identifier').primaryKey().defaultRandom()
```

### 2. Temporal Tracking
Most entities include temporal validity:
```typescript
begin_date: timestamp('begin_date').notNull().defaultNow()
end_date: timestamp('end_date')  // nullable
```

### 3. Audit Timestamps
All entities include standard audit fields:
```typescript
created_at: timestamp('created_at').notNull().defaultNow()
updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date())
```

### 4. Subtype Pattern
Subtypes reference parent entity:
```typescript
// Person is a subtype of Party
person_identifier: uuid('person_identifier').primaryKey().references(() => party.party_identifier)
```

### 5. Party Role Pattern
Many-to-many relationships use Party Role tables:
```typescript
// Agreement Party Role links Party to Agreement
agreement_party_role_id: uuid('agreement_party_role_id').primaryKey().defaultRandom()
agreement_id: uuid('agreement_id').references(() => agreement.agreement_id)
party_id: uuid('party_id').references(() => party.party_identifier)
role_type_code: varchar('role_type_code', { length: 50 }) // INSURED, OWNER, etc.
```

## Migration Workflow

### 1. Create Schema Files
Define your schema using Drizzle ORM syntax in `.schema.ts` files.

### 2. Generate Migration
```bash
npm run db:generate
```
This creates SQL migration files in `database/migrations/`

### 3. Review Migration
Check the generated SQL in `database/migrations/{timestamp}_*.sql`

### 4. Apply Migration
```bash
npm run db:migrate
```

### 5. Development Push (Optional)
For rapid development, push schema directly without migrations:
```bash
npm run db:push
```
⚠️ **Warning**: Only use in development. Production should use migrations.

## Schema Development Guidelines

1. **Follow OMG Naming**: Use exact OMG entity and attribute names
2. **Include Comments**: Document entity purpose and relationships
3. **Validate Types**: Use TypeScript types that match database types
4. **Add Constraints**: Include NOT NULL, UNIQUE, CHECK constraints
5. **Index Strategically**: Add indexes for foreign keys and query columns
6. **Test Locally**: Verify migrations work before committing

## Example Schema File

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Party Entity (OMG P&C Core)
 *
 * Represents a person, organization, or group of interest.
 */
export const party = pgTable('party', {
  party_identifier: uuid('party_identifier').primaryKey().defaultRandom(),
  party_name: varchar('party_name', { length: 255 }).notNull(),
  party_type_code: varchar('party_type_code', { length: 50 }).notNull(),
  begin_date: timestamp('begin_date').notNull().defaultNow(),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});
```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [OMG P&C Data Model Spec](../specs/001-auto-insurance-flow/data-model.md)
- [Migration Guide](../specs/001-auto-insurance-flow/quickstart.md#database-setup)
