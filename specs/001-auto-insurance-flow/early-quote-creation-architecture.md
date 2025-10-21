# Early Quote Creation Architecture

**Date**: 2025-10-20
**Feature**: Progressive Quote Creation with URL-Based Navigation
**Status**: Planning Complete - Ready for Implementation

## Overview

This document outlines the architecture for creating quote shells early in the user flow (after primary driver info) and progressively updating them through PUT requests at each subsequent step.

## Architecture Philosophy

**Quote Creation Strategy:**
- **Create quote shell on PrimaryDriverInfo submission** (email + basic driver info required)
- **Progressive updates** - each step updates the existing quote via PUT requests
- **URL-based navigation** - quote number in URL path from step 2 onwards
- **Email validation** - Format validation only (no verification)
- **Premium calculation** - Calculate internally on each update, but ONLY show on CoverageSelection page
- **Price stability** - Use accurate rating from early steps to minimize variance when user sees price
- **Multiple quotes per user** - Allow users to create multiple quotes (no resume prompt, always create new)
- **INCOMPLETE quotes persist** - Keep for CRM tracking, but don't interrupt user flow

## Flow Architecture

```
1. PrimaryDriverInfo
   - Validate email format (regex)
   - Require: email, firstName, lastName, birthDate, address
   - POST /quotes → ALWAYS creates NEW quote (status: INCOMPLETE)
   - Returns quote number
   → navigate to /quote/additional-drivers/:quoteNumber

2. AdditionalDrivers/:quoteNumber
   - Load existing quote from API (by quoteNumber)
   - User adds/skips additional drivers
   - PUT /quotes/:quoteNumber/drivers → updates quote, recalculates premium internally
   → navigate to /quote/vehicles/:quoteNumber

3. VehiclesList/:quoteNumber
   - Load existing quote from API
   - User adds vehicles
   - PUT /quotes/:quoteNumber/vehicles → updates quote, recalculates premium (major factor)
   → navigate to /quote/vehicle-confirmation/:quoteNumber

4. VehicleConfirmation/:quoteNumber
   - Load existing quote from API
   - Show enriched vehicle data (mileage, safety rating, value)
   - User confirms/edits
   - PUT /quotes/:quoteNumber/vehicles → updates with enrichment, recalculates premium
   → navigate to /quote/coverage-selection/:quoteNumber

5. CoverageSelection/:quoteNumber
   - Load existing quote from API
   - **FIRST TIME user sees premium estimate** (shows base coverage price)
   - User selects coverages → **premium updates in real-time** on page
   - PUT /quotes/:quoteNumber/coverage → finalizes quote, sets status to QUOTED
   → navigate to /quote/results/:quoteNumber

6. QuoteResults/:quoteNumber
   - Show final quote with all details (already implemented ✓)
```

## Benefits

✅ **Immediate tracking** - Quote exists in CRM from first contact
✅ **Progressive saves** - User can abandon and return (via email link)
✅ **Better UX** - No data loss if browser crashes
✅ **CRM integration** - Track user journey from first step
✅ **Shareable URLs** - Every page has quote context
✅ **Edit capability** - Can return to any step via URL
✅ **Multiple quotes allowed** - No resume prompts, always create new

## API Endpoints

### Existing (Modified)
- `POST /api/v1/quotes` - Create shell quote (minimal data required)

### New Endpoints
- `PUT /api/v1/quotes/:quoteNumber/drivers` - Update additional drivers
- `PUT /api/v1/quotes/:quoteNumber/vehicles` - Update vehicles
- `PUT /api/v1/quotes/:quoteNumber/coverage` - Update coverage and finalize

## Email Validation

**Frontend:**
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Backend:**
```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

class CreateQuoteDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  driver_email!: string;
}
```

## Premium Calculation Strategy

### Progressive Internal Calculation
```
Step 1 (PrimaryDriverInfo): $800-1200
- Driver age factor
- Assumed vehicle (mid-range car)
- State minimum coverage

Step 2 (AdditionalDrivers): $900-1400
- All drivers factored in
- Young/senior driver adjustments

Step 3 (VehiclesList): $1000-1600
- MAJOR FACTOR: Real vehicle data
- Biggest premium change happens here

Step 4 (VehicleConfirmation): $1050-1650
- Minor refinements (mileage, safety)

Step 5 (CoverageSelection): USER SEES PREMIUM
- Base premium shown (~$1200-1500)
- Real-time updates as coverage changes
- Final variance within ±10% of base
```

## Quote Status Lifecycle

```
INCOMPLETE → User creating quote (missing vehicles or coverage)
    ↓
QUOTED → Full quote generated (all info provided, 30-day expiration)
    ↓
BOUND → User paid and accepted terms (Phase 4)
    ↓
ACTIVE → Policy in force
    ↓
CANCELLED/EXPIRED → Terminal states
```

## Multiple Quotes Per User

**Business Logic:**
- NO resume prompts
- Allow unlimited quotes per email
- All quotes stored with status tracking

**Example:**
```
User: john@example.com
- Quote Q1A2B3 (INCOMPLETE) - Abandoned at VehiclesList
- Quote Q4C5D6 (INCOMPLETE) - Abandoned at CoverageSelection
- Quote Q7E8F9 (QUOTED) - Completed ✓
- Quote Q0G1H2 (QUOTED) - Completed ✓ (testing different car)

CRM Analysis:
- Conversion rate: 50% (2/4 completed)
- Drop-off points identified
- Price sensitivity analysis available
```

## Database Changes

### Ensure INCOMPLETE Status Exists
```sql
-- PostgreSQL enum
ALTER TYPE policy_status_code ADD VALUE IF NOT EXISTS 'INCOMPLETE';

-- Or varchar field
export const policy = pgTable('policy', {
  status_code: varchar('status_code', { length: 20 })
    .$type<'INCOMPLETE' | 'QUOTED' | 'BOUND' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'>()
    .default('INCOMPLETE'),
});
```

## Backend Implementation

### Modified: createQuote()
- Accept minimal data (no vehicles/coverages required)
- Create Party, Person, Communication Identities
- Skip vehicle creation if not provided
- Calculate rough premium estimate (using assumed vehicle if needed)
- Create policy with status INCOMPLETE
- Return quote number

### New: updateQuoteDrivers()
- Fetch existing quote by quoteNumber
- Update quote_snapshot.additionalDrivers
- Recalculate premium with all drivers
- Update policy and agreement records

### New: updateQuoteVehicles()
- Fetch existing quote
- Create/update vehicle records
- Update quote_snapshot.vehicles
- **Recalculate premium (major impact)**
- Update policy and agreement records

### New: updateQuoteCoverage()
- Fetch existing quote
- Update quote_snapshot.coverages
- Recalculate final premium
- **Change status: INCOMPLETE → QUOTED**
- Set expiration date (30 days)
- Update policy and agreement records

### Enhanced: calculatePremium()
```typescript
private calculatePremium(input: CreateQuoteInput): number {
  let basePremium = 1000;

  // Driver age factor (always calculated)
  const driverFactor = calculateDriverFactor(input.driver.birthDate);

  // Additional drivers factor
  const additionalDriversFactor = calculateAdditionalDriversFactor(input.additionalDrivers);

  // Vehicle factor (use actual if provided, else assume average)
  const vehicleFactor = input.vehicle || input.vehicles?.[0]
    ? calculateVehicleFactor(input.vehicle || input.vehicles[0])
    : 1.0; // Default assumption

  // Coverage factor (use actual if provided, else minimum)
  const coverageFactor = input.coverages
    ? calculateCoverageFactor(input.coverages)
    : 1.0; // Base coverage

  return Math.round(basePremium * driverFactor * additionalDriversFactor * vehicleFactor * coverageFactor);
}
```

## Frontend Implementation

### Route Updates (App.tsx)
```typescript
<Route path="/quote/driver-info" element={<PrimaryDriverInfo />} />
<Route path="/quote/additional-drivers/:quoteNumber" element={<AdditionalDrivers />} />
<Route path="/quote/vehicles/:quoteNumber" element={<VehiclesList />} />
<Route path="/quote/vehicle-confirmation/:quoteNumber" element={<VehicleConfirmation />} />
<Route path="/quote/coverage-selection/:quoteNumber" element={<CoverageSelection />} />
<Route path="/quote/results/:quoteNumber" element={<QuoteResults />} />
```

### API Client (quote-api.ts)
```typescript
export async function updateQuoteDrivers(quoteNumber: string, additionalDrivers: Array<any>): Promise<QuoteResponse>;
export async function updateQuoteVehicles(quoteNumber: string, vehicles: Array<any>): Promise<QuoteResponse>;
export async function updateQuoteCoverage(quoteNumber: string, coverages: any): Promise<QuoteResponse>;
```

### Hooks (useQuote.ts)
```typescript
export function useUpdateDrivers();
export function useUpdateVehicles();
export function useUpdateCoverage();
```

### Page Pattern
```typescript
const SomePage = () => {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const { data: existingQuote } = useQuote(quoteNumber);
  const updateX = useUpdateX();

  // Pre-fill form from existingQuote if returning
  useEffect(() => {
    if (existingQuote?.data) {
      setFormData(existingQuote.data);
    }
  }, [existingQuote]);

  const handleSubmit = async () => {
    await updateX.mutateAsync({ quoteNumber, data: formData });
    navigate(`/quote/next-step/${quoteNumber}`);
  };
};
```

## Files to Modify

### Backend (3 files)
1. `backend/src/api/routes/quotes.controller.ts` - Add PUT endpoints, DTOs, email validation
2. `backend/src/services/quote/quote.service.ts` - Modify createQuote, add 3 update methods
3. `database/schema/policy.schema.ts` - Verify INCOMPLETE status exists

### Frontend (11 files)
4. `src/App.tsx` - Update routes with :quoteNumber
5. `src/services/quote-api.ts` - Add 3 update functions
6. `src/hooks/useQuote.ts` - Add 3 update hooks
7. `src/pages/quote/PrimaryDriverInfo.tsx` - Email validation, create shell
8. `src/pages/quote/AdditionalDrivers.tsx` - Load quote, update drivers
9. `src/pages/quote/VehiclesList.tsx` - Load quote, update vehicles
10. `src/pages/quote/VehicleConfirmation.tsx` - Load quote, update enriched vehicles
11. `src/pages/quote/CoverageSelection.tsx` - Load quote, SHOW PREMIUM, update coverage
12. `src/pages/quote/QuoteResults.tsx` - Already URL-based ✓

## Implementation Order

1. Backend DTOs and validation (quotes.controller.ts)
2. Backend service methods (quote.service.ts)
3. Frontend API client (quote-api.ts, useQuote.ts)
4. Route updates (App.tsx)
5. PrimaryDriverInfo - Create shell quote
6. AdditionalDrivers - Update drivers
7. VehiclesList - Update vehicles
8. VehicleConfirmation - Update enriched vehicles
9. CoverageSelection - Show premium, update coverage
10. Test end-to-end flow

## Testing Checklist

### Email Validation
- [ ] Rejects invalid formats (no @, no domain, no TLD)
- [ ] Accepts valid formats

### Quote Creation
- [ ] PrimaryDriverInfo creates shell → status INCOMPLETE
- [ ] Returns quote number (QXXXXX format)
- [ ] Navigates to additional-drivers/:quoteNumber

### Progressive Updates
- [ ] Each page loads existing quote data
- [ ] PUT requests update quote successfully
- [ ] Premium recalculates at each step
- [ ] Status changes INCOMPLETE → QUOTED on coverage submit

### Premium Display
- [ ] Premium hidden until CoverageSelection
- [ ] Base premium shown (state minimum coverage)
- [ ] Real-time updates as coverage changes
- [ ] Final premium within ±10% of base estimate

### Multiple Quotes
- [ ] Same email can create multiple quotes
- [ ] No resume prompts shown
- [ ] All quotes stored in database

### URL Navigation
- [ ] Direct URL access works
- [ ] Back button works (can edit previous steps)
- [ ] Invalid quote number shows error

## CRM Analytics Queries

### Find Incomplete Quotes
```sql
SELECT
  policy_number,
  driver_email,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_created
FROM policy
WHERE status_code = 'INCOMPLETE'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Conversion Funnel
```sql
SELECT
  driver_email,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN status_code = 'QUOTED' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status_code = 'QUOTED' THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM policy
GROUP BY driver_email
HAVING COUNT(*) > 1
ORDER BY total_attempts DESC;
```

## Price Stability Example

```
User Journey:
Step 1: Internal $1000 (not shown)
Step 2: Internal $1100 (not shown)
Step 3: Internal $1300 (not shown) ← Vehicle added, major change
Step 4: Internal $1280 (not shown) ← Refinement
Step 5: USER SEES $1280 ← First time seeing price
  + Collision: +$300
  + Comprehensive: +$200
  + Uninsured: +$100
  = Final: $1880

User's Mental Model:
"Base is $1280, I added $600 in coverage, final is $1880" ✓
This is EXPECTED and TRANSPARENT
```

## Success Criteria

✅ Quote created after primary driver info
✅ Every page after step 1 has quote number in URL
✅ All updates work via PUT requests
✅ Premium hidden until coverage selection
✅ Premium variance ≤10% when first shown
✅ No resume prompts (allow multiple quotes)
✅ Complete quote data in CRM from first step
✅ Can navigate back and edit any step
✅ Email format validated (not verified)
