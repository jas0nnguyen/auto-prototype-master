# Coverage Page Fixes - Complete Summary

## Issues Fixed

### Issue 1: Price Not Showing in Sidebar ✅
**Root Cause**: The PriceSidebar component was not receiving quote data because:
1. Coverage page wrapper tried to use QuoteProvider with `useQuote(quoteId)`
2. `useQuote` expects a UUID (like from `/api/v1/quotes/:id`)
3. We only have quote number (DZCH74DEZX) not UUID
4. QuoteProvider failed to fetch, so PriceSidebar had no quote data

**Solution**: Pass quote data directly to PriceSidebar as a prop, bypassing QuoteProvider:
```typescript
// Before:
<PriceSidebar /> // No data

// After:
<PriceSidebar quote={quote} isLoading={isLoading} /> // Direct data
```

**Files Modified**:
- [Coverage.tsx:50-60](src/pages/quote-v2/Coverage.tsx#L50-L60) - Added quote prop to CoverageContent
- [Coverage.tsx:329](src/pages/quote-v2/Coverage.tsx#L329) - Pass quote to PriceSidebar
- [Coverage.tsx:344-350](src/pages/quote-v2/Coverage.tsx#L344-L350) - Simplified wrapper to pass quote directly

### Issue 2: Coverage Dropdown Not Working ✅
**Root Cause**: The Bodily Injury Liability Select component was using native HTML `<select>` API:
- Used `onChange={(e) => setBiLiability(e.target.value)}`
- Had `<option>` children
- Canary Design System's Select uses a different API

**Solution**: Convert to Canary Select API:
```typescript
// Before:
<Select
  label="Coverage Limit"
  value={biLiability}
  onChange={(e) => setBiLiability(e.target.value)}
>
  <option value="100000/300000">$100,000 / $300,000</option>
  <option value="300000/500000">$300,000 / $500,000</option>
  <option value="500000/1000000">$500,000 / $1,000,000</option>
</Select>

// After:
<Select
  label="Coverage Limit"
  value={biLiability}
  onChange={(value) => setBiLiability(value)}
  options={[
    { label: '$100,000 / $300,000', value: '100000/300000' },
    { label: '$300,000 / $500,000', value: '300000/500000' },
    { label: '$500,000 / $1,000,000', value: '500000/1000000' }
  ]}
/>
```

**Files Modified**:
- [Coverage.tsx:201-210](src/pages/quote-v2/Coverage.tsx#L201-L210) - Fixed Select component API

## Technical Details

### QuoteProvider vs Direct Props Pattern

**QuoteProvider Pattern** (uses Context):
- Good for: Components deep in tree needing quote data
- Requires: UUID to fetch via `useQuote(uuid)`
- Example: Summary page could use this if we had UUIDs

**Direct Props Pattern** (what we use now):
- Good for: Simple data flow, when you already have the data
- Requires: Nothing, just pass data down
- Example: Coverage and Summary pages use this

### Why QuoteProvider Failed

The QuoteProvider uses this flow:
```typescript
QuoteProvider receives quoteId →
useQuote(quoteId) →
quoteApi.getQuote(id) →
GET /api/v1/quotes/:id (expects UUID)
```

But we have:
```typescript
Quote number (DZCH74DEZX) →
NOT a UUID →
API returns 404 →
PriceSidebar gets undefined
```

### API Response Format (Ongoing Issue)

The backend returns **snake_case** fields:
- `quote_number`, `policy_id`, `effective_date`
- `bodily_injury_limit`, `property_damage_limit`

Frontend expects **camelCase** in many places:
- `quoteNumber`, `policyId`, `effectiveDate`
- `bodilyInjuryLimit`, `propertyDamageLimit`

**Current Workaround**: Use snake_case fields directly where needed, with fallbacks:
```typescript
quote.quote_number || quote.quoteNumber || quoteNumber
```

**Proper Solution** (future work): Add response transformer to convert snake_case to camelCase consistently.

## Testing

To verify the fixes work:

1. **Navigate to**: http://localhost:5173/quote-v2/coverage/DZCH74DEZX

2. **Verify Price Sidebar**:
   - Should show "$1,955" as 6-month premium
   - Should show "Due Today: $325.83"
   - Should show "Then 5 payments of $325.83"

3. **Verify Coverage Dropdown**:
   - Click "Coverage Limit" dropdown under "Bodily Injury Liability"
   - Should show three options
   - Should be able to select different values
   - Should trigger premium recalculation (debounced 300ms)

4. **Check Browser Console**:
   - Should see `[PriceSidebar] Quote:` with quote object
   - Should see `[PriceSidebar] Premium:` with premium object
   - Should NOT see any errors about undefined

## Related Issues Fixed Earlier

Same patterns fixed in:
1. ✅ EditDriverModal - Select components (Gender, Marital Status, License State, Relationship)
2. ✅ EditVehicleModal - Select components (Year, Ownership Status, Primary Use)
3. ✅ Summary page - License field persistence for additional drivers

## Files Changed

1. `src/pages/quote-v2/Coverage.tsx`
   - Lines 50-60: Added CoverageContentProps interface and quote prop handling
   - Line 329: Pass quote and isLoading to PriceSidebar
   - Lines 201-210: Fixed Select component to use Canary API
   - Lines 344-350: Simplified wrapper to pass quote directly (no QuoteProvider)

## Success Criteria

- ✅ Price sidebar displays premium amount
- ✅ Coverage dropdown opens and shows options
- ✅ Selecting coverage triggers recalculation
- ✅ No console errors
- ✅ Quote data flows correctly to PriceSidebar
