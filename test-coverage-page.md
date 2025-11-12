# Coverage Page Fixes Test

## Issues Fixed:

### 1. Price Not Showing
**Problem**: Quote data was not being passed to PriceSidebar because `quote.quoteId` was undefined. The API returns `quote_number` (snake_case) but the code expected `quoteId` (camelCase).

**Fix**: Updated [Coverage.tsx:344](src/pages/quote-v2/Coverage.tsx#L344) to use `quote.quote_number || quote.quoteId || quoteNumber` as fallback.

```typescript
// Before:
<QuoteProvider quoteId={quote.quoteId}>

// After:
<QuoteProvider quoteId={quote.quote_number || quote.quoteId || quoteNumber}>
```

### 2. Coverage Dropdown Not Working
**Problem**: The Bodily Injury Liability dropdown was using native HTML `<select>` with `<option>` children and `onChange={(e) => setBiLiability(e.target.value)}`. Canary Design System's Select component uses a different API with `options` prop and value-based `onChange`.

**Fix**: Updated [Coverage.tsx:201-210](src/pages/quote-v2/Coverage.tsx#L201-L210) to use Canary Select API:

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

## Testing:

1. Navigate to: http://localhost:5173/quote-v2/coverage/DZCH74DEZX
2. Verify price sidebar shows premium ($1,955)
3. Verify Bodily Injury Liability dropdown works and shows three options
4. Verify selecting a different coverage option triggers premium recalculation

## Root Cause:

Both issues stem from the same problem - **API response format inconsistency**:
- Backend returns snake_case fields (`quote_number`, `bodily_injury_limit`)
- Frontend expects camelCase fields (`quoteNumber`, `bodilyInjuryLimit`)

The QuoteProvider was failing to initialize because it couldn't find `quote.quoteId`, which prevented the PriceSidebar from receiving quote data via context.

## Files Modified:

1. [src/pages/quote-v2/Coverage.tsx](src/pages/quote-v2/Coverage.tsx)
   - Line 344: Fixed quote ID field reference
   - Lines 201-210: Fixed Select component API usage
