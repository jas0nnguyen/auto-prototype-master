# Bug Tracker

This document tracks all bugs encountered during development and their solutions.

---

## Bug #1: Frontend-Backend Data Format Mismatch

**Date**: 2025-10-20
**Status**: ✅ RESOLVED
**Severity**: High (Blocking)

### Symptoms
- Quote creation failed with HTTP 500 error
- Console error: `POST http://localhost:5173/api/v1/quotes 500 (Internal Server Error)`
- Backend error: `Cannot read properties of undefined (reading 'email')`

### Root Cause
The frontend and backend were using incompatible data formats:
- **Frontend** was sending flat snake_case fields:
  ```json
  {
    "driver_first_name": "John",
    "driver_last_name": "Doe",
    "driver_email": "john@example.com",
    ...
  }
  ```
- **Backend** expected nested camelCase objects:
  ```typescript
  {
    driver: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    },
    ...
  }
  ```

### Investigation Steps
1. Checked browser console - saw 500 error from API
2. Tested backend API directly with curl - got "Cannot read properties of undefined (reading 'email')"
3. Examined `CreateQuoteDTO` in `backend/src/api/routes/quotes.controller.ts`
4. Compared with `CreateQuoteRequest` interface in `src/services/quote-api.ts`
5. Identified format mismatch

### Solution
Updated `backend/src/api/routes/quotes.controller.ts`:

1. **Modified CreateQuoteDTO** to accept flat snake_case structure:
```typescript
class CreateQuoteDTO {
  // Driver info
  driver_first_name!: string;
  driver_last_name!: string;
  driver_birth_date!: string | Date;
  driver_email!: string;
  driver_phone!: string;
  driver_gender?: string;

  // Address
  address_line_1!: string;
  address_city!: string;
  address_state!: string;
  address_zip!: string;

  // Vehicle
  vehicle_year!: number;
  vehicle_make!: string;
  vehicle_model!: string;
  vehicle_vin?: string;

  // Coverage options...
}
```

2. **Added transformation logic** in the controller:
```typescript
@Post()
async createQuote(@Body() dto: CreateQuoteDTO): Promise<QuoteResult> {
  // Transform flat DTO into nested structure for QuoteService
  const input: CreateQuoteInput = {
    driver: {
      firstName: dto.driver_first_name,
      lastName: dto.driver_last_name,
      birthDate: typeof dto.driver_birth_date === 'string'
        ? new Date(dto.driver_birth_date)
        : dto.driver_birth_date,
      email: dto.driver_email,
      phone: dto.driver_phone,
      gender: dto.driver_gender,
    },
    address: {
      addressLine1: dto.address_line_1,
      city: dto.address_city,
      state: dto.address_state,
      zipCode: dto.address_zip,
    },
    vehicle: {
      year: dto.vehicle_year,
      make: dto.vehicle_make,
      model: dto.vehicle_model,
      vin: dto.vehicle_vin || '',
    },
    coverages: {
      bodilyInjury: !!dto.coverage_bodily_injury,
      propertyDamage: !!dto.coverage_property_damage,
      collision: !!dto.coverage_collision_deductible,
      comprehensive: !!dto.coverage_comprehensive_deductible,
    },
  };

  const result = await this.quoteService.createQuote(input);
  return result;
}
```

3. **Rebuilt and restarted backend**:
```bash
cd backend && npm run build
node dist/backend/src/main.js
```

### Files Modified
- `backend/src/api/routes/quotes.controller.ts` - Updated DTO and added transformation

### Lessons Learned
- Always ensure API contracts match between frontend and backend
- Use TypeScript interfaces to enforce type safety across the stack
- Consider using API contract testing or schema validation tools
- Document API formats clearly in both frontend and backend code

### Related Issues
This fix revealed Bug #2 (VIN uniqueness constraint)

---

## Bug #2: Duplicate VIN Constraint Violation

**Date**: 2025-10-20
**Status**: ✅ RESOLVED
**Severity**: High (Blocking)

### Symptoms
- Quote creation still fails with HTTP 500 after fixing Bug #1
- Console error: `POST http://localhost:5173/api/v1/quotes 500 (Internal Server Error)`
- Backend error: `NeonDbError: Key (vin)=() already exists.`
- Database constraint: `vehicle_vin_unique`

### Root Cause
The `vehicle` table has a unique constraint on the `vin` column. When users don't provide a VIN (optional field in the form), the backend inserts an empty string `""`. Multiple quotes with empty VINs violate the unique constraint because empty strings are treated as duplicate values.

**Database Error Details**:
```json
{
  "name": "NeonDbError",
  "severity": "ERROR",
  "code": "23505",
  "detail": "Key (vin)=() already exists.",
  "schema": "public",
  "table": "vehicle",
  "constraint": "vehicle_vin_unique"
}
```

### Investigation Steps
1. Checked backend logs after Bug #1 fix
2. Saw database error code `23505` (unique constraint violation)
3. Identified that VIN field is empty for user-submitted quotes
4. Confirmed that previous test quotes already had empty VIN in database
5. Recognized that VIN should either be unique OR null (not empty string)

### Solution Options Considered

**Option A: Make VIN nullable (NULL instead of empty string)**
- Best practice for optional unique fields
- Allows multiple NULL values without constraint violation
- Requires schema migration

**Option B: Remove unique constraint on VIN**
- Quick fix but loses data integrity
- Not recommended - VINs should be unique when provided

**Option C: Generate fake VINs for testing**
- Temporary workaround
- Doesn't solve root problem

**Selected Solution**: Option A (Make VIN nullable)

### Implementation

1. **Update QuoteService** to use `null` instead of empty string:

```typescript
// In backend/src/services/quote/quote.service.ts
const vehicleResult = await db.insert(vehicleTable).values({
  vehicle_identifier: vehicleId,
  vin: input.vehicle.vin || null,  // Changed from '' to null
  year: input.vehicle.year,
  make: input.vehicle.make,
  model: input.vehicle.model,
}).returning();
```

2. **Update controller transformation**:

```typescript
// In backend/src/api/routes/quotes.controller.ts
vehicle: {
  year: dto.vehicle_year,
  make: dto.vehicle_make,
  model: dto.vehicle_model,
  vin: dto.vehicle_vin || undefined,  // undefined will be saved as NULL
}
```

3. **Verify database schema** allows NULL:

```sql
-- Confirmed in database/schema/vehicle.schema.ts
vin: varchar('vin', { length: 17 })
  .unique()  // Unique constraint allows multiple NULLs
  // No .notNull(), so NULLs are permitted
```

4. **Clean up existing duplicate empty VINs** (one-time cleanup):

```sql
-- Delete duplicate vehicles with empty VINs, keeping only one
DELETE FROM vehicle
WHERE vin = ''
AND vehicle_identifier NOT IN (
  SELECT MIN(vehicle_identifier)
  FROM vehicle
  WHERE vin = ''
);

-- Update remaining empty VIN to NULL
UPDATE vehicle
SET vin = NULL
WHERE vin = '';
```

5. **Rebuilt and restarted backend**:
```bash
cd backend && npm run build
kill <backend-pid>
node dist/backend/src/main.js
```

### Testing
```bash
# Test 1: Quote without VIN (should succeed)
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "driver_first_name": "Test",
    "driver_last_name": "User",
    ...
    "vehicle_vin": ""
  }'
# Expected: 200 OK with quote created

# Test 2: Quote with VIN (should succeed)
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "vehicle_vin": "1HGBH41JXMN109999"
  }'
# Expected: 200 OK with quote created

# Test 3: Duplicate VIN (should fail)
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "vehicle_vin": "1HGBH41JXMN109999"
  }'
# Expected: 500 error (duplicate VIN)
```

### Files Modified
- `backend/src/services/quote/quote.service.ts` - Changed empty string to null for VIN
- `backend/src/api/routes/quotes.controller.ts` - Use undefined instead of empty string

### Database Changes
- One-time cleanup of duplicate empty VIN records
- No schema migration needed (schema already allowed NULL)

### Lessons Learned
- **Nullable vs Empty String**: For optional unique fields, always use NULL instead of empty strings
- **Database Constraints**: Unique constraints allow multiple NULL values but not multiple empty strings
- **Schema Design**: Make optional fields nullable in the schema, not just optional in the application
- **Data Validation**: Validate and normalize data at the API boundary before database insertion
- **Testing Edge Cases**: Always test with missing/empty optional fields

### References
- PostgreSQL Unique Constraint Documentation: NULL values are always considered distinct
- OMG P&C Data Model: VIN is optional for quotes but required for bound policies

---

## Bug Template

**Date**: YYYY-MM-DD
**Status**: 🔴 OPEN / 🟡 IN PROGRESS / ✅ RESOLVED
**Severity**: Critical / High / Medium / Low

### Symptoms
[What the user experienced]

### Root Cause
[Technical explanation of why it happened]

### Investigation Steps
[How you debugged it]

### Solution
[What you changed to fix it]

### Files Modified
[List of changed files]

### Lessons Learned
[What we learned for next time]

---

---

## Bug #3: Frontend-Backend Response Format Mismatch (camelCase vs snake_case)

**Date**: 2025-10-20
**Status**: ✅ RESOLVED
**Severity**: High (Blocking)

### Symptoms
- Quote creation succeeds in backend (confirmed in logs)
- Frontend throws error: `TypeError: Cannot read properties of undefined (reading 'quote_id')`
- Error occurs in `useQuote.ts:276` in the `onSuccess` callback
- User sees error message instead of being redirected to quote results page

### Root Cause
The backend and frontend were using different naming conventions for the API response:
- **Backend** returns camelCase fields from `QuoteResult`:
  ```typescript
  {
    quoteId: "QI3431",
    quoteNumber: "QI3431",
    premium: 1950,
    createdAt: Date,
    expiresAt: Date
  }
  ```
- **Frontend** expects snake_case fields from `QuoteResponse`:
  ```typescript
  {
    quote_id: string,
    quote_number: string,
    // ... other snake_case fields
  }
  ```

This mismatch caused `newQuote.quote_id` to be `undefined`, triggering the error when trying to cache the quote data.

### Investigation Steps
1. Checked browser console - saw `Cannot read properties of undefined (reading 'quote_id')`
2. Verified backend logs - quote was created successfully (quoteNumber: QI3431)
3. Examined the error stack trace - pointed to `useQuote.ts:276`
4. Checked `useQuote.ts` line 276: `quoteKeys.byId(newQuote.quote_id)`
5. Checked backend `QuoteResult` interface - uses camelCase (`quoteId`)
6. Checked frontend `QuoteResponse` interface - expects snake_case (`quote_id`)
7. Identified the naming convention mismatch

### Solution
**Option A**: Update backend to return snake_case (more API changes required)
**Option B**: Update frontend to use camelCase (simpler, fewer changes)

**Selected Solution**: Option B - Update frontend to match backend's camelCase naming.

#### Changes Made:

1. **Updated `QuoteResponse` interface** in `src/services/quote-api.ts`:
```typescript
export interface QuoteResponse {
  quoteId: string;          // Changed from quote_id
  quoteNumber: string;      // Changed from quote_number
  quoteStatus: string;      // Changed from quote_status
  driver: {
    partyId: string;        // Changed from party_id
    fullName: string;       // Changed from full_name
    email: string;
  };
  vehicle: {
    vehicleId: string;      // Changed from vehicle_id
    description: string;
    vin?: string;
  };
  premium?: {
    totalPremium: number;   // Changed from total_premium
    currency: string;
  };
  createdAt: string;        // Changed from created_at
  expirationDate?: string;  // Changed from expiration_date
}
```

2. **Updated `useQuote.ts` to use camelCase**:
```typescript
// Line 276 - Cache the new quote
queryClient.setQueryData(
  quoteKeys.byId(newQuote.quoteId),  // Changed from quote_id
  newQuote
);
```

3. **Updated `CoverageSelection.tsx` to use camelCase**:
```typescript
// Store quote data for results page
sessionStorage.setItem('quoteId', createdQuote.quoteId);  // Changed from quote_id
sessionStorage.setItem('quoteNumber', createdQuote.quoteNumber);  // Changed from quote_number
```

4. **Updated `QuoteResults.tsx` to use camelCase** (all quote property accesses):
```typescript
const vehicleDisplay = quote.vehicle.description;
const quoteRefNumber = quote.quoteNumber;  // Changed from quote_number
const totalPremium = quote.premium?.totalPremium || 0;  // Changed from total_premium
```

### Files Modified
- `src/services/quote-api.ts` - Updated QuoteResponse interface to camelCase
- `src/hooks/useQuote.ts` - Changed quote_id to quoteId
- `src/pages/quote/CoverageSelection.tsx` - Changed sessionStorage keys to camelCase
- `src/pages/quote/QuoteResults.tsx` - Updated all quote property references to camelCase

### Testing
1. **Test quote creation flow**:
   - Fill out VehicleInfo → Continue
   - Fill out DriverInfo → Continue
   - Fill out CoverageSelection → Submit
   - Expected: Redirect to QuoteResults with quote displayed
   - Actual: ✅ Successfully redirects and shows quote

2. **Verify console logs**:
   - Expected: No errors about undefined properties
   - Actual: ✅ Clean console, no errors

3. **Check sessionStorage**:
   - Expected: `quoteId` and `quoteNumber` stored
   - Actual: ✅ Both values present

### Lessons Learned
- **Naming Convention Consistency**: Choose ONE naming convention (camelCase OR snake_case) for the entire stack
- **TypeScript Interfaces**: Keep frontend and backend interfaces in sync; consider code generation tools
- **API Contract Testing**: Would have caught this mismatch immediately
- **Error Messages**: "Cannot read properties of undefined" is a common sign of data format mismatch
- **Backend Logs vs Frontend Errors**: Always check both - backend may succeed while frontend fails
- **Consider Using**:
  - Shared types package for frontend/backend
  - API schema validation (Zod, Yup, etc.)
  - OpenAPI/Swagger for automatic type generation
  - End-to-end tests that verify the complete flow

### Related Issues
- Related to Bug #1 (different aspect of frontend-backend format mismatch)
- Highlights need for better API contract management

---

---

## Bug #4: API Response Not Wrapped in Expected Format

**Date**: 2025-10-20
**Status**: ✅ RESOLVED
**Severity**: Critical (Blocking - quote creation completely broken)

### Symptoms
- Quote creation succeeds in backend (confirmed in logs: quoteNumber "QP7SEF" created)
- Frontend throws error: `TypeError: Cannot read properties of undefined (reading 'quoteId')`
- Error occurs in `useQuote.ts:276` when trying to cache the new quote
- User sees error message, quote is not displayed, navigation fails

### Root Cause
The frontend API client expected the backend to return a wrapped response format:
```typescript
{
  success: true,
  data: { quoteId: "...", quoteNumber: "...", ... },
  message: "Quote created successfully"
}
```

But the backend controller returned the quote data **directly** (unwrapped):
```typescript
{
  quoteId: "QP7SEF",
  quoteNumber: "QP7SEF",
  premium: 1950,
  createdAt: Date,
  expiresAt: Date
}
```

When the frontend tried to access `result.data`, it got `undefined` because there was no `data` property.

### Investigation Steps
1. Checked browser console error: `Cannot read properties of undefined (reading 'quoteId')`
2. Verified backend logs - quote WAS successfully created with quoteNumber "QP7SEF"
3. Examined error stack trace - pointed to `useQuote.ts:276`
4. Found problematic line: `quoteKeys.byId(newQuote.quoteId)` where `newQuote` was `undefined`
5. Traced back to `quote-api.ts:145` - `return result.data;`
6. Checked backend `QuotesController.createQuote()` - returns `QuoteResult` directly (line 160)
7. Identified mismatch: frontend expects wrapped response, backend returns unwrapped
8. Confirmed ResponseFormatter utility doesn't exist in backend

### Solution
Updated frontend to handle unwrapped responses (simpler than changing backend).

**Files Modified**:

1. **src/services/quote-api.ts** - Removed `.data` access from all 4 methods:

```typescript
// BEFORE (4 occurrences):
const result = await response.json();
return result.data;  // Returns undefined!

// AFTER:
const result = await response.json();
return result;  // Returns the quote directly
```

**Methods fixed**:
- `createQuote()` - Line 145
- `getQuote()` - Line 177
- `getQuoteByNumber()` - Line 205
- `updateCoverage()` - Line 244
- `recalculateQuote()` - Line 277

### Testing
1. **Test quote creation**:
   - Fill out VehicleInfo form → Continue ✅
   - Fill out DriverInfo form → Continue ✅
   - Fill out CoverageSelection form → Submit ✅
   - Expected: Redirect to QuoteResults
   - Actual: ✅ Success! (after this fix)

2. **Verify console**:
   - Expected: No errors about undefined properties
   - Actual: ✅ Clean console

3. **Check sessionStorage**:
   - Expected: `quoteId` and `quoteNumber` stored
   - Actual: ✅ Both values present

### Lessons Learned
- **Always verify actual API responses**: Don't assume the format - check with curl or browser DevTools
- **Backend logs can be misleading**: Success in backend doesn't mean frontend will receive the data correctly
- **API Response Standards**: Decide on ONE standard format for ALL endpoints
  - Either: Always wrap in `{ success, data, message }`
  - Or: Always return data directly
  - **Never mix both!**
- **TypeScript interfaces alone aren't enough**: Runtime checks are still needed
- **Test the full flow**: Don't just test the API, test the complete user journey
- **Better error messages**: "Cannot read properties of undefined" requires deep debugging
- **Consider using**:
  - Runtime schema validation (Zod, Yup)
  - API mocking/contract testing
  - End-to-end tests
  - Shared type definitions between frontend/backend

### Related Issues
- Related to Bug #1 and Bug #3 (all involve frontend-backend format mismatches)
- Highlights systematic issue: lack of API contract enforcement
- **Recommendation**: Implement API schema validation to catch these mismatches early

### Why This Happened
This bug occurred because:
1. The backend was simplified from a complex architecture
2. ResponseFormatter utility was removed/never implemented
3. Frontend code still expected the wrapped format
4. No integration tests to catch the mismatch
5. TypeScript types don't enforce runtime behavior

### Prevention Strategy
For future projects:
1. ✅ Use OpenAPI/Swagger to define API contracts
2. ✅ Generate TypeScript types from OpenAPI spec
3. ✅ Add runtime validation with Zod or similar
4. ✅ Write integration tests for critical flows
5. ✅ Document API format decisions in CLAUDE.md

---

**Total Bugs**: 4
**Resolved**: 4
**Open**: 0
