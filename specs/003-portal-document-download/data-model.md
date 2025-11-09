# Data Model: Policy Document Rendering and Download

**Feature**: Policy Document Rendering and Download
**Branch**: `003-portal-document-download`
**Created**: 2025-11-09
**OMG P&C Compliance**: OMG Property & Casualty Data Model v1.0

## 1. Introduction

This document defines the database schema for the policy document rendering system. The design follows OMG P&C Data Model v1.0 patterns while extending the existing `documents` table to support:

- **Document Generation**: Create policy documents from HTML templates merged with policy data
- **Document Storage**: Store generated PDFs in Vercel Blob with metadata tracking
- **Document Versioning**: Track document versions when policy changes occur
- **Document Access Control**: Ensure only authorized policyholders access their documents
- **Audit Trail**: Log document generation, access, and lifecycle events

### Key Design Decisions

1. **Extend Existing Schema**: Enhance existing `document.schema.ts` rather than create new table
2. **Version Tracking**: Use version number column with `is_current` flag for fast queries
3. **Soft Delete Pattern**: Mark superseded documents with status change, retain for audit
4. **Polymorphic Relationships**: Documents can relate to policies, vehicles (for ID cards), or claims
5. **Storage Abstraction**: Store Vercel Blob URLs, not file contents (separation of concerns)

---

## 2. Document Entity Schema

### Enhanced Document Table

The existing `document` table will be enhanced to support document generation requirements:

```typescript
/**
 * Document Entity Schema - Enhanced for Document Generation
 *
 * Extends OMG P&C Data Model v1.0 Document entity with versioning,
 * generation tracking, and access audit capabilities.
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { auditTimestamps } from './_base.schema';
import { policy } from './policy.schema';
import { vehicle } from './vehicle.schema';

// Document Type Enum
export const documentTypeEnum = pgEnum('document_type', [
  'DECLARATIONS',      // Auto-generated declarations page
  'POLICY_DOCUMENT',   // Complete policy document
  'ID_CARD',          // Insurance ID card (vehicle-specific)
  'CLAIM_ATTACHMENT', // Claim-related documents (future)
  'PROOF_OF_INSURANCE', // Generic proof of insurance (future)
]);

// Document Status Enum
export const documentStatusEnum = pgEnum('document_status', [
  'GENERATING',   // Document generation in progress
  'READY',        // Document generated and available for download
  'FAILED',       // Generation failed after retries
  'SUPERSEDED',   // Replaced by newer version
]);

export const document = pgTable('document', {
  // ========================================
  // Primary Key
  // ========================================
  document_id: uuid('document_id').primaryKey().defaultRandom(),

  // ========================================
  // Foreign Keys (Polymorphic)
  // ========================================
  policy_id: uuid('policy_id')
    .notNull()
    .references(() => policy.policy_identifier, { onDelete: 'cascade' }),

  vehicle_id: uuid('vehicle_id')
    .references(() => vehicle.vehicle_identifier, { onDelete: 'cascade' }),
    // Nullable - only populated for vehicle-specific documents (e.g., ID cards)

  claim_id: uuid('claim_id'),
    // Future: will reference claim table (Phase 5+)
    // Nullable - only populated for claim-related documents

  // ========================================
  // Document Classification
  // ========================================
  document_number: varchar('document_number', { length: 20 })
    .notNull()
    .unique(),
    // Human-readable identifier: "DZDOC-12345678"

  document_type: documentTypeEnum('document_type').notNull(),
    // Type of document (see enum above)

  document_name: varchar('document_name', { length: 255 }).notNull(),
    // Display name: "Auto Insurance Declarations - DZQV87Z4FH.pdf"

  // ========================================
  // Versioning and Lifecycle
  // ========================================
  version: integer('version').notNull(),
    // Incremental version number (starts at 1)
    // Unique per (policy_id + document_type + vehicle_id) combination

  is_current: boolean('is_current').notNull().default(true),
    // TRUE = latest version, FALSE = superseded
    // Enables fast queries for "current" documents (indexed)

  document_status: documentStatusEnum('document_status')
    .notNull()
    .default('GENERATING'),
    // Current status in generation/lifecycle workflow

  // ========================================
  // Storage Information
  // ========================================
  storage_url: varchar('storage_url', { length: 1024 }),
    // Vercel Blob URL (nullable until generation completes)
    // Example: "https://xxxxx.public.blob.vercel-storage.com/policies/DZQV87Z4FH/declarations-v1.pdf"

  file_size_bytes: integer('file_size_bytes'),
    // File size in bytes (populated after upload)

  mime_type: varchar('mime_type', { length: 100 }).default('application/pdf'),
    // Content type (always PDF for generated documents)

  // ========================================
  // Generation Metadata
  // ========================================
  template_version: varchar('template_version', { length: 20 }),
    // Version of HTML template used for generation
    // Enables template change tracking

  generation_attempt: integer('generation_attempt').notNull().default(1),
    // Retry counter (increments on each attempt, max 3)

  generation_error: varchar('generation_error', { length: 1000 }),
    // Error message if status = FAILED

  generated_at: timestamp('generated_at'),
    // Timestamp when document generation completed successfully
    // Nullable until status transitions to READY

  superseded_at: timestamp('superseded_at'),
    // Timestamp when this version was replaced by a newer one
    // Nullable for current versions

  // ========================================
  // Access Audit Trail
  // ========================================
  accessed_at: timestamp('accessed_at'),
    // Last download/access timestamp

  accessed_count: integer('accessed_count').notNull().default(0),
    // Total number of times document was downloaded

  // ========================================
  // Document Metadata
  // ========================================
  description: varchar('description', { length: 500 }),
    // Optional description or notes

  // ========================================
  // Audit Timestamps (Standard OMG Pattern)
  // ========================================
  ...auditTimestamps,
    // created_at: When DB record was created
    // updated_at: When record was last modified

}, (table) => ({
  // ========================================
  // Indexes for Performance
  // ========================================

  // Index: Fast lookup of current documents for a policy
  idx_current_documents: index('idx_current_documents')
    .on(table.policy_id, table.document_type, table.is_current),

  // Index: Fast lookup by document number
  idx_document_number: index('idx_document_number')
    .on(table.document_number),

  // Index: Fast lookup of documents by generation date (for history)
  idx_generated_at: index('idx_generated_at')
    .on(table.generated_at),

  // Index: Fast lookup of documents by status (for monitoring)
  idx_document_status: index('idx_document_status')
    .on(table.document_status),

  // Index: Fast lookup of vehicle-specific documents (ID cards)
  idx_vehicle_documents: index('idx_vehicle_documents')
    .on(table.vehicle_id, table.document_type, table.is_current),

  // ========================================
  // Constraints
  // ========================================

  // Unique constraint: Only one version per (policy + doc_type + vehicle + version)
  uniq_policy_doc_vehicle_version: unique('uniq_policy_doc_vehicle_version')
    .on(table.policy_id, table.document_type, table.vehicle_id, table.version),
}));

// TypeScript types for type-safe queries
export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;
```

---

## 3. Document Enums

### Document Type Codes

```typescript
export const DocumentType = {
  DECLARATIONS: 'DECLARATIONS',           // Auto-generated declarations page
  POLICY_DOCUMENT: 'POLICY_DOCUMENT',     // Complete policy document
  ID_CARD: 'ID_CARD',                    // Insurance ID card (vehicle-specific)
  CLAIM_ATTACHMENT: 'CLAIM_ATTACHMENT',   // Claim-related documents (future)
  PROOF_OF_INSURANCE: 'PROOF_OF_INSURANCE', // Generic proof of insurance (future)
} as const;
```

**Usage Notes**:
- `DECLARATIONS`: Generated for all policies, contains summary of coverage, vehicles, drivers
- `POLICY_DOCUMENT`: Full policy terms and conditions (future enhancement)
- `ID_CARD`: Generated per vehicle, contains vehicle-specific proof of insurance
- `CLAIM_ATTACHMENT`: Supporting documents for claims (not implemented in this feature)
- `PROOF_OF_INSURANCE`: Generic proof for DMV/lenders (future enhancement)

### Document Status Codes

```typescript
export const DocumentStatus = {
  GENERATING: 'GENERATING',   // PDF generation in progress
  READY: 'READY',            // Document available for download
  FAILED: 'FAILED',          // Generation failed after 3 retries
  SUPERSEDED: 'SUPERSEDED',  // Replaced by newer version
} as const;
```

**Status Definitions**:
- `GENERATING`: Background job is rendering PDF (typically 1-15 seconds)
- `READY`: PDF generated, uploaded to Vercel Blob, available for download
- `FAILED`: Generation encountered error, see `generation_error` field for details
- `SUPERSEDED`: New version created due to policy change, this version is historical

---

## 4. Database Indexes

### Performance Indexes

| Index Name | Columns | Purpose | Use Case |
|------------|---------|---------|----------|
| `idx_current_documents` | `(policy_id, document_type, is_current)` | Fast lookup of latest documents | Portal document list page |
| `idx_document_number` | `(document_number)` | Fast lookup by document number | Direct document access |
| `idx_generated_at` | `(generated_at DESC)` | Fast sorting by generation date | Document history/timeline |
| `idx_document_status` | `(document_status)` | Monitor in-progress/failed docs | Admin dashboard, retry jobs |
| `idx_vehicle_documents` | `(vehicle_id, document_type, is_current)` | Fast lookup of vehicle ID cards | Portal vehicle details page |

### Query Performance Expectations

**Common Queries**:

```sql
-- Get all current documents for a policy (Portal dashboard)
-- Expected: <1ms with index
SELECT * FROM document
WHERE policy_id = $1
  AND is_current = TRUE
  AND document_status = 'READY'
ORDER BY document_type;

-- Get document history for a policy (Document history page)
-- Expected: <5ms with index
SELECT * FROM document
WHERE policy_id = $1
  AND document_type = 'DECLARATIONS'
ORDER BY generated_at DESC;

-- Get vehicle-specific ID card (Portal vehicle page)
-- Expected: <1ms with index
SELECT * FROM document
WHERE vehicle_id = $1
  AND document_type = 'ID_CARD'
  AND is_current = TRUE;

-- Monitor in-progress generations (Background job monitoring)
-- Expected: <10ms with index
SELECT * FROM document
WHERE document_status = 'GENERATING'
  AND created_at < NOW() - INTERVAL '5 minutes';
```

---

## 5. Entity Relationships

### Relationship Diagram

```
┌─────────────────┐
│     Policy      │
│  (policy_id)    │
└────────┬────────┘
         │
         │ 1:N (one policy has many documents)
         │
         ▼
┌─────────────────────┐
│     Document        │
│  (document_id)      │
│                     │◄────────────────┐
│  policy_id (FK)     │                 │
│  vehicle_id (FK?)   │                 │
│  version            │                 │ 1:1 (one ID card per vehicle)
│  is_current         │                 │
│  document_status    │                 │
└─────────────────────┘                 │
                                        │
                                        │
                                 ┌──────┴──────┐
                                 │   Vehicle   │
                                 │ (vehicle_id)│
                                 └─────────────┘
```

### Foreign Key Relationships

| Child Table | Column | References | Relationship | Cascade Behavior |
|-------------|--------|------------|--------------|------------------|
| `document` | `policy_id` | `policy.policy_identifier` | Many-to-One | ON DELETE CASCADE |
| `document` | `vehicle_id` | `vehicle.vehicle_identifier` | Many-to-One (nullable) | ON DELETE CASCADE |

**Cascade Behavior Rationale**:
- When a policy is deleted, all associated documents are automatically deleted
- When a vehicle is removed from a policy, its ID cards are automatically deleted
- Ensures no orphaned documents remain in storage

### Polymorphic Relationships

The `document` table uses **nullable foreign keys** to support multiple parent entities:

```typescript
// Policy-level documents (declarations, full policy)
{
  policy_id: 'uuid-of-policy',
  vehicle_id: null,
  claim_id: null,
  document_type: 'DECLARATIONS'
}

// Vehicle-specific documents (ID cards)
{
  policy_id: 'uuid-of-policy',
  vehicle_id: 'uuid-of-vehicle',
  claim_id: null,
  document_type: 'ID_CARD'
}

// Claim documents (future)
{
  policy_id: 'uuid-of-policy',
  vehicle_id: null,
  claim_id: 'uuid-of-claim',
  document_type: 'CLAIM_ATTACHMENT'
}
```

---

## 6. State Transitions

### Document Lifecycle State Machine

```
                     ┌─────────────┐
                     │   INITIAL   │
                     │   (no row)  │
                     └──────┬──────┘
                            │
                            │ create_document()
                            │
                            ▼
                     ┌─────────────┐
                ┌────┤ GENERATING  ├────┐
                │    └─────────────┘    │
                │                       │
                │ generation_failed()   │ generation_complete()
                │ (retry < 3)           │
                │                       │
                ▼                       ▼
         ┌─────────────┐         ┌──────────┐
         │   FAILED    │         │  READY   │
         │ (terminal)  │         └────┬─────┘
         └─────────────┘              │
                                      │
                                      │ new_version_created()
                                      │
                                      ▼
                                ┌────────────┐
                                │ SUPERSEDED │
                                │ (terminal) │
                                └────────────┘
```

### State Transition Rules

| Current Status | Event | Next Status | Side Effects |
|---------------|-------|-------------|--------------|
| `(none)` | `create_document()` | `GENERATING` | - Create DB record<br>- Set `generation_attempt = 1`<br>- Trigger background job |
| `GENERATING` | `generation_complete()` | `READY` | - Upload PDF to Vercel Blob<br>- Set `storage_url`<br>- Set `file_size_bytes`<br>- Set `generated_at = NOW()`<br>- Set `is_current = TRUE` |
| `GENERATING` | `generation_failed()` (attempt < 3) | `GENERATING` | - Increment `generation_attempt`<br>- Retry generation<br>- Log error in `generation_error` |
| `GENERATING` | `generation_failed()` (attempt = 3) | `FAILED` | - Set `generation_error`<br>- Send alert to monitoring<br>- No further retries |
| `READY` | `new_version_created()` | `SUPERSEDED` | - Set `is_current = FALSE`<br>- Set `superseded_at = NOW()`<br>- Create new row with `version + 1` |
| `SUPERSEDED` | (no transitions) | `SUPERSEDED` | Terminal state - historical record |
| `FAILED` | `retry_document()` (manual) | `GENERATING` | - Reset `generation_attempt = 1`<br>- Clear `generation_error`<br>- Trigger generation |

### Status Field Updates

```typescript
// Service method examples
async markDocumentReady(documentId: string, storageUrl: string, fileSize: number) {
  await db.update(document)
    .set({
      document_status: 'READY',
      storage_url: storageUrl,
      file_size_bytes: fileSize,
      generated_at: new Date(),
      is_current: true,
    })
    .where(eq(document.document_id, documentId));
}

async markDocumentFailed(documentId: string, error: string) {
  await db.update(document)
    .set({
      document_status: 'FAILED',
      generation_error: error,
    })
    .where(eq(document.document_id, documentId));
}

async supersedePreviousVersion(policyId: string, documentType: string, vehicleId?: string) {
  await db.update(document)
    .set({
      document_status: 'SUPERSEDED',
      is_current: false,
      superseded_at: new Date(),
    })
    .where(and(
      eq(document.policy_id, policyId),
      eq(document.document_type, documentType),
      vehicleId ? eq(document.vehicle_id, vehicleId) : isNull(document.vehicle_id),
      eq(document.is_current, true)
    ));
}
```

---

## 7. Migration Strategy

### Adding to Existing Schema

The `document` table already exists from Phase 4. This feature will **alter** the existing table:

**Migration File**: `database/migrations/0003_enhance_documents_for_generation.sql`

```sql
-- =============================================
-- Migration: Enhance Documents for Generation
-- Created: 2025-11-09
-- Feature: 003-portal-document-download
-- =============================================

-- Step 1: Create document_type enum
CREATE TYPE document_type AS ENUM (
  'DECLARATIONS',
  'POLICY_DOCUMENT',
  'ID_CARD',
  'CLAIM_ATTACHMENT',
  'PROOF_OF_INSURANCE'
);

-- Step 2: Create document_status enum
CREATE TYPE document_status AS ENUM (
  'GENERATING',
  'READY',
  'FAILED',
  'SUPERSEDED'
);

-- Step 3: Add new columns to document table
ALTER TABLE document
  -- Versioning columns
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT TRUE,

  -- Status tracking
  ADD COLUMN document_status document_status NOT NULL DEFAULT 'READY',

  -- Generation metadata
  ADD COLUMN template_version VARCHAR(20),
  ADD COLUMN generation_attempt INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN generation_error VARCHAR(1000),
  ADD COLUMN generated_at TIMESTAMP,
  ADD COLUMN superseded_at TIMESTAMP,

  -- Access audit
  ADD COLUMN accessed_at TIMESTAMP,
  ADD COLUMN accessed_count INTEGER NOT NULL DEFAULT 0,

  -- Enhanced storage info
  ADD COLUMN file_size_bytes INTEGER,

  -- Enhanced foreign key
  ADD COLUMN vehicle_id UUID REFERENCES vehicle(vehicle_identifier) ON DELETE CASCADE;

-- Step 4: Update document_type column to use enum
ALTER TABLE document
  ALTER COLUMN document_type TYPE document_type USING document_type::document_type;

-- Step 5: Create performance indexes
CREATE INDEX idx_current_documents ON document(policy_id, document_type, is_current);
CREATE INDEX idx_document_number ON document(document_number);
CREATE INDEX idx_generated_at ON document(generated_at DESC);
CREATE INDEX idx_document_status ON document(document_status);
CREATE INDEX idx_vehicle_documents ON document(vehicle_id, document_type, is_current)
  WHERE vehicle_id IS NOT NULL;

-- Step 6: Add unique constraint for versioning
ALTER TABLE document
  ADD CONSTRAINT uniq_policy_doc_vehicle_version
  UNIQUE (policy_id, document_type, vehicle_id, version);

-- Step 7: Backfill existing documents (if any)
UPDATE document
  SET
    document_status = 'READY',
    version = 1,
    is_current = TRUE,
    generated_at = created_at,
    accessed_count = 0
  WHERE document_status IS NULL;

-- Step 8: Add comment documentation
COMMENT ON TABLE document IS
  'OMG P&C Document entity - stores policy documents, ID cards, and claim attachments with versioning';

COMMENT ON COLUMN document.version IS
  'Incremental version number (1-based), unique per (policy + doc_type + vehicle)';

COMMENT ON COLUMN document.is_current IS
  'TRUE for latest version, FALSE for superseded versions (enables fast queries)';

COMMENT ON COLUMN document.document_status IS
  'Current lifecycle status: GENERATING, READY, FAILED, or SUPERSEDED';
```

### Drizzle Schema Migration

**Generate Migration**:
```bash
# After updating document.schema.ts
cd database
npx drizzle-kit generate:pg
```

**Apply Migration**:
```bash
# Run migration against Neon database
npx drizzle-kit push:pg
```

### Rollback Strategy

If migration needs to be reversed:

```sql
-- Rollback migration (emergency only)
ALTER TABLE document
  DROP COLUMN version,
  DROP COLUMN is_current,
  DROP COLUMN document_status,
  DROP COLUMN template_version,
  DROP COLUMN generation_attempt,
  DROP COLUMN generation_error,
  DROP COLUMN generated_at,
  DROP COLUMN superseded_at,
  DROP COLUMN accessed_at,
  DROP COLUMN accessed_count,
  DROP COLUMN file_size_bytes,
  DROP COLUMN vehicle_id;

DROP INDEX IF EXISTS idx_current_documents;
DROP INDEX IF EXISTS idx_document_number;
DROP INDEX IF EXISTS idx_generated_at;
DROP INDEX IF EXISTS idx_document_status;
DROP INDEX IF EXISTS idx_vehicle_documents;

DROP TYPE document_type;
DROP TYPE document_status;
```

---

## 8. Sample Queries

### Common Query Patterns

#### Query 1: Get All Current Documents for Portal Dashboard

```typescript
// Drizzle ORM query
import { eq, and, desc } from 'drizzle-orm';

async function getCurrentDocuments(policyId: string): Promise<Document[]> {
  return await db.query.document.findMany({
    where: and(
      eq(document.policy_id, policyId),
      eq(document.is_current, true),
      eq(document.document_status, 'READY')
    ),
    orderBy: [desc(document.generated_at)],
  });
}
```

**SQL Equivalent**:
```sql
SELECT * FROM document
WHERE policy_id = '550e8400-e29b-41d4-a716-446655440000'
  AND is_current = TRUE
  AND document_status = 'READY'
ORDER BY generated_at DESC;
```

**Result Example**:
```json
[
  {
    "document_id": "uuid-1",
    "policy_id": "uuid-policy",
    "vehicle_id": null,
    "document_number": "DZDOC-12345678",
    "document_type": "DECLARATIONS",
    "document_name": "Auto Insurance Declarations - DZQV87Z4FH.pdf",
    "version": 2,
    "is_current": true,
    "document_status": "READY",
    "storage_url": "https://xxx.blob.vercel-storage.com/...",
    "file_size_bytes": 524288,
    "generated_at": "2025-11-09T14:30:00Z",
    "accessed_count": 5
  },
  {
    "document_id": "uuid-2",
    "policy_id": "uuid-policy",
    "vehicle_id": "uuid-vehicle-1",
    "document_number": "DZDOC-12345679",
    "document_type": "ID_CARD",
    "document_name": "Insurance ID Card - 2020 Toyota Camry.pdf",
    "version": 1,
    "is_current": true,
    "document_status": "READY",
    "storage_url": "https://xxx.blob.vercel-storage.com/...",
    "file_size_bytes": 102400,
    "generated_at": "2025-11-09T14:32:00Z",
    "accessed_count": 2
  }
]
```

---

#### Query 2: Get Document History (All Versions)

```typescript
async function getDocumentHistory(
  policyId: string,
  documentType: string
): Promise<Document[]> {
  return await db.query.document.findMany({
    where: and(
      eq(document.policy_id, policyId),
      eq(document.document_type, documentType)
    ),
    orderBy: [desc(document.version)],
  });
}
```

**SQL Equivalent**:
```sql
SELECT * FROM document
WHERE policy_id = '550e8400-e29b-41d4-a716-446655440000'
  AND document_type = 'DECLARATIONS'
ORDER BY version DESC;
```

---

#### Query 3: Create New Document Version

```typescript
async function createNewVersion(
  policyId: string,
  documentType: string,
  vehicleId?: string
): Promise<string> {
  return await db.transaction(async (tx) => {
    // Step 1: Supersede previous version
    await tx.update(document)
      .set({
        is_current: false,
        document_status: 'SUPERSEDED',
        superseded_at: new Date(),
      })
      .where(and(
        eq(document.policy_id, policyId),
        eq(document.document_type, documentType),
        vehicleId ? eq(document.vehicle_id, vehicleId) : isNull(document.vehicle_id),
        eq(document.is_current, true)
      ));

    // Step 2: Get next version number
    const maxVersionResult = await tx
      .select({ max: max(document.version) })
      .from(document)
      .where(and(
        eq(document.policy_id, policyId),
        eq(document.document_type, documentType),
        vehicleId ? eq(document.vehicle_id, vehicleId) : isNull(document.vehicle_id)
      ));

    const nextVersion = (maxVersionResult[0]?.max ?? 0) + 1;

    // Step 3: Create new version
    const [newDoc] = await tx.insert(document).values({
      policy_id: policyId,
      vehicle_id: vehicleId,
      document_type: documentType,
      document_number: generateDocumentNumber(),
      document_name: `${documentType} - Version ${nextVersion}`,
      version: nextVersion,
      is_current: true,
      document_status: 'GENERATING',
      generation_attempt: 1,
    }).returning();

    return newDoc.document_id;
  });
}
```

---

#### Query 4: Log Document Download

```typescript
async function logDocumentDownload(documentId: string): Promise<void> {
  await db.update(document)
    .set({
      accessed_at: new Date(),
      accessed_count: sql`${document.accessed_count} + 1`,
    })
    .where(eq(document.document_id, documentId));
}
```

**SQL Equivalent**:
```sql
UPDATE document
SET
  accessed_at = NOW(),
  accessed_count = accessed_count + 1
WHERE document_id = '550e8400-e29b-41d4-a716-446655440000';
```

---

#### Query 5: Find Failed Generations for Retry

```typescript
async function getFailedDocuments(): Promise<Document[]> {
  return await db.query.document.findMany({
    where: and(
      eq(document.document_status, 'FAILED'),
      lt(document.generation_attempt, 3) // Only retry if < 3 attempts
    ),
    orderBy: [asc(document.created_at)],
  });
}
```

**SQL Equivalent**:
```sql
SELECT * FROM document
WHERE document_status = 'FAILED'
  AND generation_attempt < 3
ORDER BY created_at ASC;
```

---

#### Query 6: Get Vehicle ID Cards

```typescript
async function getVehicleIdCards(policyId: string): Promise<Document[]> {
  return await db.query.document.findMany({
    where: and(
      eq(document.policy_id, policyId),
      eq(document.document_type, 'ID_CARD'),
      eq(document.is_current, true),
      eq(document.document_status, 'READY')
    ),
    with: {
      vehicle: true, // Join with vehicle table for display
    },
  });
}
```

**SQL Equivalent**:
```sql
SELECT
  d.*,
  v.year,
  v.make,
  v.model,
  v.vin
FROM document d
JOIN vehicle v ON d.vehicle_id = v.vehicle_identifier
WHERE d.policy_id = '550e8400-e29b-41d4-a716-446655440000'
  AND d.document_type = 'ID_CARD'
  AND d.is_current = TRUE
  AND d.document_status = 'READY';
```

---

#### Query 7: Monitor In-Progress Generations

```typescript
async function getStuckGenerations(timeoutMinutes: number = 5): Promise<Document[]> {
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  return await db.query.document.findMany({
    where: and(
      eq(document.document_status, 'GENERATING'),
      lt(document.created_at, cutoffTime)
    ),
  });
}
```

**SQL Equivalent**:
```sql
SELECT * FROM document
WHERE document_status = 'GENERATING'
  AND created_at < NOW() - INTERVAL '5 minutes';
```

---

## 9. Data Validation Rules

### Field Constraints

| Field | Validation Rule | Error Handling |
|-------|----------------|----------------|
| `document_number` | Unique, 20 chars max, format: "DZDOC-XXXXXXXX" | Throw constraint violation error |
| `policy_id` | Must reference existing policy | Foreign key constraint |
| `vehicle_id` | Must reference existing vehicle (if provided) | Foreign key constraint |
| `version` | Positive integer, ≥1 | Check constraint |
| `is_current` | Boolean, exactly one TRUE per (policy + doc_type + vehicle) | Application logic |
| `document_status` | Must be valid enum value | Enum constraint |
| `storage_url` | Max 1024 chars, HTTPS URL (when READY) | Application validation |
| `file_size_bytes` | Positive integer (when READY) | Application validation |
| `generation_attempt` | Positive integer, 1-3 | Application logic |

### Business Logic Validations

```typescript
// Validation: Only one current version allowed
async function validateSingleCurrentVersion(
  policyId: string,
  documentType: string,
  vehicleId?: string
): Promise<boolean> {
  const currentDocs = await db.query.document.findMany({
    where: and(
      eq(document.policy_id, policyId),
      eq(document.document_type, documentType),
      vehicleId ? eq(document.vehicle_id, vehicleId) : isNull(document.vehicle_id),
      eq(document.is_current, true)
    ),
  });

  return currentDocs.length <= 1;
}

// Validation: READY documents must have storage_url
function validateReadyDocument(doc: Document): boolean {
  if (doc.document_status === 'READY') {
    return !!(doc.storage_url && doc.file_size_bytes && doc.generated_at);
  }
  return true;
}

// Validation: FAILED documents must have error message
function validateFailedDocument(doc: Document): boolean {
  if (doc.document_status === 'FAILED') {
    return !!doc.generation_error;
  }
  return true;
}
```

---

## 10. Storage Cost Estimates

### Database Storage

**Assumptions**:
- 10,000 policies
- 5 documents per policy (1 declaration + 4 vehicle ID cards)
- Average 3 versions per document (due to policy changes)
- Row size: ~500 bytes (with all metadata)

**Calculation**:
```
Total rows: 10,000 policies × 5 docs × 3 versions = 150,000 rows
Row size: ~500 bytes (UUID columns + varchars + timestamps + indexes)
Total size: 150,000 × 500 bytes = 75 MB
PostgreSQL overhead (indexes, bloat): +30% = 97.5 MB

Neon PostgreSQL pricing: $0.102/GB-month
Monthly cost: 0.0975 GB × $0.102 = $0.01/month (negligible)
```

### Blob Storage

See `research.md` Section 2 for detailed Vercel Blob cost analysis.

**Summary** (10,000 policies):
- Storage: ~$0.58/month (25GB @ $0.023/GB)
- Data transfer: ~$2.50/month (50GB downloads @ $0.05/GB)
- Operations: ~$0.20/month (50,000 uploads @ $5/million)
- **Total: ~$3.28/month**

---

## 11. Security Considerations

### Access Control

**Portal Access**:
- Documents only accessible via authenticated portal session (policy number-based)
- Validate `policy_id` matches logged-in user's policy before returning document
- No direct Blob URL exposure in public APIs (use signed URLs with expiration)

**Blob URL Security**:
```typescript
// Generate signed download URL (1-hour expiration)
import { generateSignedUrl } from '@vercel/blob';

async function getSecureDownloadUrl(documentId: string, policyId: string): Promise<string> {
  // Validate user owns this document
  const doc = await db.query.document.findFirst({
    where: and(
      eq(document.document_id, documentId),
      eq(document.policy_id, policyId)
    ),
  });

  if (!doc || doc.document_status !== 'READY') {
    throw new Error('Document not found or not ready');
  }

  // Generate time-limited signed URL
  const signedUrl = await generateSignedUrl(doc.storage_url, {
    expiresIn: 3600, // 1 hour
  });

  return signedUrl;
}
```

### Data Privacy

- **PII Protection**: Documents contain policyholder names, addresses, DOB - treat as PII
- **HTTPS Only**: All document downloads must use HTTPS
- **Audit Trail**: Log all document access in `accessed_at` and `accessed_count`
- **Retention Policy**: Implement 7-year retention, then automatic deletion

---

## Summary

**Schema Status**: ✅ Ready for implementation

**Key Metrics**:
- **Tables**: 1 (document - enhanced)
- **Enums**: 2 (document_type, document_status)
- **Indexes**: 5 performance indexes
- **Foreign Keys**: 2 (policy, vehicle)
- **Constraints**: 1 unique constraint (versioning)

**Implementation Readiness**:
- [x] Schema designed with OMG P&C compliance
- [x] Migration strategy defined
- [x] Query patterns documented
- [x] State transitions mapped
- [x] Cost estimates calculated
- [x] Security considerations addressed

**Next Steps**:
1. Review and approve schema design
2. Generate Drizzle migration
3. Apply migration to development database
4. Implement document service methods
5. Create API endpoints for document operations

---

**Document Prepared By**: Claude Code
**Date**: 2025-11-09
**Version**: 1.0
