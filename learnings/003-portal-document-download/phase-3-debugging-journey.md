# Feature 003 - Phase 3: Debugging Journey - View and Download Documents

**Completed**: 2025-11-09
**Goal**: Document all bugs encountered and fixed during Phase 3 implementation

---

## Overview

During Phase 3 implementation of the document download feature, we encountered and fixed **10 major bugs**. This document provides a complete record of each bug, its root cause, the solution, and key lessons learned.

---

## Bug #1: Import Path Too Shallow

**Error**:
```
src/api/routes/documents.controller.ts:28:24 - error TS2307: Cannot find module '../../database/schema/policy.schema'
```

**Files Affected**:
- `documents.controller.ts:28`
- `document.service.ts:17-19`

**Root Cause**:
Import paths used `../../database/schema/` but the database folder is at the project root, not within `backend/src/`. The file structure is:

```
project/
├── database/           ← Database is here (project root)
│   └── schema/
└── backend/
    └── src/
        ├── api/
        │   └── routes/
        │       └── documents.controller.ts  ← File is here (4 levels deep)
        └── services/
```

**Solution**:
Changed import paths from `../../database/schema/` to `../../../../database/schema/`

```typescript
// BEFORE (WRONG)
import { policy } from '../../database/schema/policy.schema';

// AFTER (CORRECT)
import { policy } from '../../../../database/schema/policy.schema';
```

**Lesson**: Always count directory levels carefully when using relative imports. From `backend/src/api/routes/` to project root is 4 levels up (`../../../../`).

---

## Bug #2: Type Assertion Missing

**Error**:
```
Type '"DECLARATIONS"[]' is not assignable to type 'DocumentType[]'
```

**Root Cause**:
TypeScript couldn't infer that the string literal `'DECLARATIONS'` is a valid `DocumentType` enum value.

**Solution**:
Added type assertions using `as`:

```typescript
// BEFORE (WRONG)
document_type: ['DECLARATIONS', 'POLICY_DOCUMENT']

// AFTER (CORRECT)
document_type: ['DECLARATIONS' as DocumentType, 'POLICY_DOCUMENT' as DocumentType]
```

**Lesson**: When working with TypeScript enums, use type assertions to help the compiler understand literal values.

---

## Bug #3: Vehicle Query - Missing Column

**Error**:
```
Property 'policy_id' does not exist on type 'vehicle'
```

**Root Cause**:
Code tried to query vehicles with `.where(eq(vehicle.policy_id, policy_id))`, but the `vehicle` table doesn't have a `policy_id` column. Vehicles are stored in the `quote_snapshot` JSON field on the policy table.

**Solution**:
Extract vehicles from the policy's `quote_snapshot` instead of querying vehicle table:

```typescript
// BEFORE (WRONG)
const vehicles = await this.db
  .select()
  .from(vehicle)
  .where(eq(vehicle.policy_id, policy_id));  // ❌ vehicle table has no policy_id

// AFTER (CORRECT)
const quoteSnapshot = policyData.quote_snapshot as any;
const vehicles = quoteSnapshot?.vehicles ||
  (quoteSnapshot?.vehicle ? [quoteSnapshot.vehicle] : []);
```

**Lesson**: Check database schema before writing queries. Not all data is in separate tables - some is stored as JSON.

---

## Bug #4: Missing Required Database Fields

**Error**: Documents were being created but missing required fields, causing silent failures.

**Root Cause**:
Document inserts in `quote.service.ts` weren't providing all required fields:
- `version` (required)
- `is_current` (required)
- `document_status` (required)
- `generated_at` (required)

**Solution**:
Added all required fields to document insert operations:

```typescript
// BEFORE (INCOMPLETE)
const declarationsDoc = await this.db.insert(document).values({
  policy_id: policyId,
  document_number: `DOC-${this.generateId()}`,
  document_type: 'POLICY_DOCUMENT',
  document_name: `Policy_Declarations_${policyNumber}.pdf`,
  storage_url: `/documents/policies/${policyNumber}/declarations.pdf`,
  mime_type: 'application/pdf',
  file_size_bytes: 245600,
}).returning();

// AFTER (COMPLETE)
const declarationsDoc = await this.db.insert(document).values({
  policy_id: policyId,
  document_number: `DOC-${this.generateId()}`,
  document_type: 'POLICY_DOCUMENT' as DocumentType,  // ← Added type assertion
  document_name: `Policy_Declarations_${policyNumber}.pdf`,
  version: 1,                    // ← Added
  is_current: true,              // ← Added
  document_status: 'READY' as DocumentStatus,  // ← Added
  storage_url: `/documents/policies/${policyNumber}/declarations.pdf`,
  mime_type: 'application/pdf',
  file_size_bytes: 245600,
  generated_at: new Date(),      // ← Added
}).returning();
```

**Lesson**: Always check database schema for required fields. Missing required fields can cause silent failures or database errors.

---

## Bug #5: Template File Not Found

**Error**:
```
ENOENT: no such file or directory, open '.../backend/backend/templates/declarations-page.html'
```

**Root Cause**:
Path was doubled (`backend/backend/`) because TemplateService used `path.join(process.cwd(), 'backend', 'templates')`, but `process.cwd()` was already `/path/to/project/backend` when running `npm run start:dev`.

**File paths**:
```
process.cwd() = /path/to/project/backend
path.join(process.cwd(), 'backend', 'templates')
  = /path/to/project/backend/backend/templates  ❌ WRONG

Should be:
path.join(process.cwd(), 'templates')
  = /path/to/project/backend/templates  ✅ CORRECT
```

**Solution**:
1. **Copied template file** from specs to backend:
   ```bash
   cp specs/003-portal-document-download/templates/declarations-page.html backend/templates/
   ```

2. **Fixed TemplateService path**:
   ```typescript
   // BEFORE (WRONG)
   this.templatesDir = path.join(process.cwd(), 'backend', 'templates');

   // AFTER (CORRECT)
   this.templatesDir = path.join(process.cwd(), 'templates');
   ```

**Lesson**:
- `process.cwd()` returns the directory where the Node.js process was started
- When running `npm run start:dev` from backend folder, `process.cwd()` is already in backend
- Always log paths during development to verify they're correct

---

## Bug #6: TypeScript Implicit Any

**Error**:
```
error TS7034: Variable 'coverages' implicitly has type 'any[]'
error TS2304: Cannot find name 'InternalServerErrorException'
```

**Root Cause**:
1. TypeScript couldn't infer the type of `coverages` array
2. Missing import for `InternalServerErrorException` from NestJS

**Solution**:
```typescript
// Fix 1: Add explicit type
const coverages: any[] = [];  // ← Added type annotation

// Fix 2: Add missing import
import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,  // ← Added this
  Logger,
  HttpStatus,
} from '@nestjs/common';
```

**Lesson**:
- Always provide explicit types for variables when TypeScript can't infer them
- Double-check imports when using framework exceptions or utilities

---

## Bug #7: Date Timezone Offset 🔴 CRITICAL

**Problem**: Birth date "01/01/1990" was displaying as "12/31/1989" in the generated PDF.

**Root Cause**:
Using local timezone methods (`.getMonth()`, `.getDate()`, `.getFullYear()`) on a UTC ISO string caused an off-by-one-day error in Pacific timezone.

**How it happens**:
```
Database stores: "1990-01-01T00:00:00.000Z" (midnight UTC)
Pacific timezone: UTC-8 hours
Local conversion: "1989-12-31T16:00:00.000-08:00" (4pm previous day)
getMonth() and getDate() use local timezone → 12/31/1989 ❌
```

**Solution**:
Use UTC methods instead of local timezone methods:

```typescript
const formatDate = (date: Date | string): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;

  // BEFORE (WRONG - uses local timezone)
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  // AFTER (CORRECT - uses UTC timezone)
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const year = d.getUTCFullYear();

  return `${month}/${day}/${year}`;
};
```

**File**: `backend/src/utils/document-formatters.ts:106-114`

**Lesson**:
- Always use UTC methods (`.getUTCMonth()`, `.getUTCDate()`, `.getUTCFullYear()`) when working with date-only values
- Local timezone methods can cause off-by-one-day errors depending on user's timezone
- This is especially important for insurance documents which are legal contracts

---

## Bug #8: Premium Showing $0.00 🔴 CRITICAL

**Problem**: Premium amounts displayed as "$0.00" instead of the actual premium like "$850.50".

**Root Cause**:
Code tried to read `policy.total_premium`, but that field was `null`. The actual premium data was stored in `quote_snapshot.premium.total`.

**Data structure**:
```typescript
policy = {
  policy_id: "abc-123",
  policy_number: "DZ7FKLQPNT",
  total_premium: null,  // ❌ NULL - not populated
  quote_snapshot: {
    premium: {
      total: 850.50,      // ✅ Actual data here
      sixMonth: 850.50,
      monthly: 141.75,
    }
  }
}
```

**Solution**:
Added fallback chain to check multiple sources:

```typescript
// BEFORE (WRONG)
const totalPremium = policy.total_premium || 0;  // Always 0

// AFTER (CORRECT)
const totalPremium =
  policy.total_premium ||                    // Try policy field first
  quoteSnapshot?.premium?.total ||           // Fallback to snapshot total
  quoteSnapshot?.premium?.sixMonth ||        // Fallback to 6-month premium
  0;                                         // Default to 0
```

**File**: `backend/src/utils/document-formatters.ts:177`

**Lesson**:
- Data can be stored in multiple places during different application stages
- Always provide fallback chains when data might be in different locations
- Use optional chaining (`?.`) to safely access nested properties
- Log values during development to see where data actually is

---

## Bug #9: Empty Coverage List

**Problem**: No coverages were displayed in the PDF's coverage summary table.

**Root Cause**:
Coverages array was empty because we weren't extracting coverage data from the `quote_snapshot.coverages` object.

**Data structure**:
```typescript
quote_snapshot: {
  coverages: {
    bodilyInjuryLimit: "100/300",
    propertyDamageLimit: "100",
    hasCollision: true,
    collisionDeductible: 500,
    hasComprehensive: true,
    comprehensiveDeductible: 500,
    hasUninsured: true,
    hasRoadside: true,
    hasRental: true,
    rentalLimit: 50,
  }
}
```

**Solution**:
Extract all coverage types from `quote_snapshot.coverages`:

```typescript
const coverages: any[] = [];
if (quoteSnapshot?.coverages) {
  const cov = quoteSnapshot.coverages;

  // Bodily Injury Liability
  if (cov.bodilyInjuryLimit) {
    const biLimit = typeof cov.bodilyInjuryLimit === 'string'
      ? parseInt(cov.bodilyInjuryLimit.split('/')[0].replace(/\D/g, '')) * 1000
      : 100000;
    coverages.push({
      coverage_type: 'BODILY_INJURY_LIABILITY',
      limit_amount: biLimit,
      deductible_amount: null,
      coverage_premium: 0,
    });
  }

  // ... similar for all other coverage types
}
```

**File**: `backend/src/api/routes/documents.controller.ts:233-324`

**Lesson**:
- JSON data structures can vary (boolean flags, string limits, numeric deductibles)
- Always check data types before parsing (string vs number)
- Provide sensible defaults when data is missing

---

## Bug #10: TypeError - .replace() on Number 🔴 CRITICAL

**Error**:
```
cov.collisionDeductible?.replace is not a function
```

**Root Cause**:
Code assumed `collisionDeductible` was a string and tried to call `.replace(/\D/g, '')` on it, but it was actually a number. You can't call string methods on numbers.

**Data examples**:
```typescript
// Sometimes it's a string
collisionDeductible: "$500"  // ✅ Can call .replace()

// Sometimes it's a number
collisionDeductible: 500     // ❌ Can't call .replace() on number
```

**Solution**:
Add type checking before calling string methods:

```typescript
// BEFORE (WRONG)
const collisionDed = cov.collisionDeductible?.replace(/\D/g, '');
// ❌ Fails if collisionDeductible is a number

// AFTER (CORRECT)
const collisionDed = typeof cov.collisionDeductible === 'string'
  ? parseInt(cov.collisionDeductible.replace(/\D/g, ''))  // Parse string
  : (cov.collisionDeductible || 500);                     // Use number directly
```

**Applied to all coverage values**:
```typescript
// Bodily Injury Limit (can be "100/300" or number)
const biLimit = typeof cov.bodilyInjuryLimit === 'string'
  ? parseInt(cov.bodilyInjuryLimit.split('/')[0].replace(/\D/g, '')) * 1000
  : 100000;

// Property Damage Limit (can be "100" or number)
const pdLimit = typeof cov.propertyDamageLimit === 'string'
  ? parseInt(cov.propertyDamageLimit.replace(/\D/g, '')) * 1000
  : 100000;

// Rental Limit (can be "50" or number)
const rentalLimit = typeof cov.rentalLimit === 'string'
  ? parseInt(cov.rentalLimit.replace(/\D/g, ''))
  : (cov.rentalLimit || 50);
```

**Lesson**:
- Never assume data types when working with external data or JSON
- Always use `typeof` checks before calling type-specific methods
- Provide default values for missing data
- This pattern is essential when data comes from user input or different API versions

---

## Summary

**Total Bugs Fixed**: 10

**Critical Bugs** (user-facing issues):
- Bug #7: Date timezone offset
- Bug #8: Premium showing $0.00
- Bug #10: TypeError on type-specific methods

**Infrastructure Bugs** (build/compile errors):
- Bug #1: Import paths
- Bug #2: Type assertions
- Bug #3: Missing database column
- Bug #4: Missing required fields
- Bug #5: Template file path
- Bug #6: TypeScript types
- Bug #9: Empty coverage list

**Key Lessons**:
1. Always use UTC date methods for date-only values
2. Check data types before calling type-specific methods
3. Provide fallback chains for data that might be in multiple locations
4. Verify database schema before writing queries
5. Log paths during development to catch `process.cwd()` issues

---

**Document Created**: 2025-11-09
**Phase**: 3 - User Story 1
**Feature**: 003-portal-document-download
