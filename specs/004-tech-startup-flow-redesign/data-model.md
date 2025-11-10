# Data Model: Tech Startup Flow Redesign

**Feature**: 004-tech-startup-flow-redesign
**Date**: 2025-11-09
**OMG Compliance**: Property & Casualty Data Model v1.0

---

## Overview

The tech-startup flow **reuses existing database tables** from Phase 3-5 implementations. Only **one new entity** (Signature) is required. All other entities are existing and OMG-compliant.

**Database**: Neon PostgreSQL (shared with existing `/quote/*` flow)
**ORM**: Drizzle ORM
**Migration Strategy**: Additive only (no breaking changes)

---

## New Entities

### Signature

**Purpose**: Store digital signatures captured during the signing ceremony (Screen 10).

**OMG Mapping**: Extends OMG Agreement with digital signature evidence.

**Schema** (`database/schema/signature.schema.ts`):

```typescript
import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { quotes } from './quote.schema';
import { parties } from './party.schema';

export const signatures = pgTable('signature', {
  // Primary Key
  signature_id: uuid('signature_id').primaryKey().defaultRandom(),

  // Foreign Keys
  quote_id: uuid('quote_id')
    .notNull()
    .references(() => quotes.quote_id, { onDelete: 'cascade' }),

  party_id: uuid('party_id')
    .notNull()
    .references(() => parties.party_id, { onDelete: 'cascade' }),

  // Signature Data
  signature_image_data: text('signature_image_data').notNull(), // Base64 PNG/JPEG
  signature_format: varchar('signature_format', { length: 10 }).notNull(), // 'PNG' or 'JPEG'
  signature_date: timestamp('signature_date').notNull().defaultNow(),

  // Audit Trail
  ip_address: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  user_agent: text('user_agent'),

  // Temporal Tracking
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

export type Signature = typeof signatures.$inferSelect;
export type NewSignature = typeof signatures.$inferInsert;
```

**Indexes**:
```typescript
// Add to schema file
import { index } from 'drizzle-orm/pg-core';

export const signatureQuoteIdIdx = index('signature_quote_id_idx').on(signatures.quote_id);
export const signaturePartyIdIdx = index('signature_party_id_idx').on(signatures.party_id);
```

**Business Rules**:
- One signature per quote (enforced at application layer)
- Signature required before policy binding (FR-010)
- Image data stored as Base64 string (no file storage needed)
- Max size: 1MB (enforced at application layer)
- Format: PNG (primary) or JPEG (fallback)

**Sample Data**:
```typescript
{
  signature_id: "550e8400-e29b-41d4-a716-446655440000",
  quote_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  party_id: "b1ffce99-9c0b-4ef8-bb6d-6bb9bd380a22",
  signature_image_data: "data:image/png;base64,iVBORw0KGgoAAAANS...",
  signature_format: "PNG",
  signature_date: "2025-11-09T14:30:00Z",
  ip_address: "192.168.1.100",
  user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  created_at: "2025-11-09T14:30:00Z",
  updated_at: "2025-11-09T14:30:00Z"
}
```

---

## Extended Entities (Minor Modifications)

### Vehicle (Existing - Minor Extension)

**Purpose**: Add optional lienholder tracking for financed/leased vehicles.

**Schema Update** (`database/schema/vehicle.schema.ts`):

```typescript
// Add to existing vehicle table
export const vehicles = pgTable('vehicle', {
  // ... existing fields ...

  // NEW: Optional lienholder reference
  lienholder_party_id: uuid('lienholder_party_id')
    .references(() => parties.party_id, { onDelete: 'set null' }),

  // ... rest of existing fields ...
});
```

**Business Rules**:
- lienholder_party_id is **nullable** (optional collection per clarification #4)
- Only populated when ownership_status is 'FINANCED' or 'LEASED'
- Lienholder is a Party with PartyRole = 'LIENHOLDER'
- No separate Lienholder table needed (follows OMG Party pattern)

**Migration**:
```sql
-- Add column to existing vehicle table
ALTER TABLE vehicle
ADD COLUMN lienholder_party_id UUID REFERENCES party(party_id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX vehicle_lienholder_party_id_idx ON vehicle(lienholder_party_id);
```

---

## Reused Entities (No Changes)

The following entities are **already implemented** in Phase 3-5 and require **no modifications**:

### Core Quote Entities (Phase 3)
- **Quote**: Main quote entity with quote_number (DZXXXXXXXX format)
- **Policy**: Policy entity with policy_number, effective/expiration dates
- **Agreement**: Base agreement entity linking to Party roles
- **Coverage**: Coverage selections (Liability, Collision, Comprehensive, etc.)
- **CoveragePart**: Specific coverage parts with limits/deductibles
- **Vehicle**: Vehicle entity with VIN, make, model, year
- **InsurableObject**: Base for insured items
- **Party**: Party entity (Person, Organization, etc.)
- **Person**: Person details (name, DOB, gender)
- **PartyRole**: Party roles (Insured, Driver, Lienholder, etc.)

### Communication Entity (Phase 3)
- **Communication**: Email and mobile phone storage
  - Used by FR-003 (Email Collection Screen)
  - communication_type_code: 'EMAIL' | 'MOBILE'
  - communication_value: actual email/phone string

### Payment Entities (Phase 4)
- **Payment**: Payment transactions
- **PaymentMethod**: Payment method details
  - **Clarification**: Credit card only for this flow (no bank account)
  - Fields: card_last_4, expiration_date, billing_zip
  - payment_method_type: 'CREDIT_CARD' (no 'BANK_ACCOUNT' needed)

### Portal Entities (Phase 5)
- **UserAccount**: User login credentials
  - Used by FR-020 (New Account Setup Modal)
  - Fields: email (unique), password_hash, created_date

### Rating Entities (Phase 3)
- **RatingFactor**: Rating multipliers
- **RatingTable**: Rating lookup tables
- **Discount**: Discount rules
- **Surcharge**: Surcharge rules

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tech Startup Flow Data Model                │
└─────────────────────────────────────────────────────────────────┘

                              Quote
                                │
                ┌───────────────┼───────────────┐
                │               │               │
              Party          Vehicle        Signature (NEW)
                │               │               │
        ┌───────┴───────┐       │               ├─ signature_image_data
        │               │       │               ├─ signature_format
     Person      PartyRole      │               ├─ signature_date
        │           │           │               ├─ ip_address
        │      ┌────┴────┐      │               └─ user_agent
        │   Insured   Driver    │
        │                       │
        │               lienholder_party_id (nullable)
        │                       │
        └─────────────────┬─────┘
                          │
                    Communication
                          │
                   ┌──────┴──────┐
                 EMAIL         MOBILE


                              Quote
                                │
                ┌───────────────┼───────────────┐
                │               │               │
            Coverage        Payment         UserAccount
                │               │               │
           CoveragePart    PaymentMethod       │
                                                │
                                          PasswordHash
```

---

## Database Migration Plan

### Migration: Add Signature Table

**File**: `database/migrations/0002_add_signature_table.sql`

```sql
-- Create signature table
CREATE TABLE signature (
  signature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quote(quote_id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES party(party_id) ON DELETE CASCADE,
  signature_image_data TEXT NOT NULL,
  signature_format VARCHAR(10) NOT NULL,
  signature_date TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX signature_quote_id_idx ON signature(quote_id);
CREATE INDEX signature_party_id_idx ON signature(party_id);

-- Add column to vehicle table for lienholder
ALTER TABLE vehicle
ADD COLUMN lienholder_party_id UUID REFERENCES party(party_id) ON DELETE SET NULL;

CREATE INDEX vehicle_lienholder_party_id_idx ON vehicle(lienholder_party_id);

-- Add check constraint for signature format
ALTER TABLE signature
ADD CONSTRAINT signature_format_check CHECK (signature_format IN ('PNG', 'JPEG'));
```

**Rollback**:
```sql
-- Drop signature table
DROP TABLE IF EXISTS signature;

-- Drop lienholder column from vehicle
ALTER TABLE vehicle DROP COLUMN IF EXISTS lienholder_party_id;
```

---

## OMG Compliance Verification

### Signature Entity

**OMG P&C Mapping**:
- Extends **Agreement** entity concept
- Represents digital evidence of agreement acceptance
- Links to **Party** (signer) and **Quote** (subject of agreement)

**OMG Attributes Mapping**:
| OMG Concept          | Our Implementation      | Notes                           |
|----------------------|-------------------------|---------------------------------|
| Agreement            | Quote + Signature       | Quote becomes Agreement on sign |
| Party (Signer)       | party_id FK             | Reference to Party entity       |
| Agreement Date       | signature_date          | Date/time of signature          |
| Agreement Evidence   | signature_image_data    | Digital signature image         |
| Audit Trail          | ip_address, user_agent  | Non-OMG extension for security  |

**Non-Standard Extensions** (Justified):
- `signature_image_data`: Digital signature capture (not in OMG v1.0, but aligned with digital transformation)
- `ip_address`, `user_agent`: Security audit requirements (industry best practice)

### Lienholder Tracking

**OMG P&C Mapping**:
- Follows **Party Role** pattern
- Lienholder is a Party with role_type_code = 'LIENHOLDER'
- Links to Vehicle via lienholder_party_id FK

**OMG Compliance**: ✅ Full compliance
- Uses existing Party entity (OMG-compliant)
- Uses PartyRole pattern (OMG-compliant)
- No new tables needed

---

## Data Volume Estimates

**Expected Records per Quote Flow**:
- 1 Quote
- 1-2 Parties (primary insured, additional drivers)
- 1-3 Vehicles
- 4-8 Coverages
- 1-2 Communications (email, mobile)
- 1 Signature (new)
- 0-1 Lienholders (optional)
- 1 UserAccount (if new user)
- 1 Payment
- 1 Policy (after binding)

**Storage Estimates**:
- Signature image: ~50KB per signature (Base64 PNG)
- Total per quote: ~100KB including all entities
- 10,000 quotes: ~1GB database storage

**Performance Considerations**:
- Indexes on foreign keys for fast lookups
- Signature data stored as TEXT (PostgreSQL handles efficiently)
- No file storage needed (Base64 inline)

---

## Summary

**New Tables**: 1 (Signature)
**Modified Tables**: 1 (Vehicle - add lienholder_party_id column)
**Reused Tables**: 31 (all Phase 3-5 entities)

**OMG Compliance**: ✅ Fully compliant
- Signature extends Agreement concept
- Lienholder follows Party Role pattern
- All other entities unchanged and compliant

**Migration Impact**: Low
- Additive changes only
- No breaking changes to existing flows
- Backward compatible with `/quote/*` flow

**Ready for Phase 1**: API contracts, quickstart guide
