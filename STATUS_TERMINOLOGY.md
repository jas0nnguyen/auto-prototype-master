# Policy Status Terminology

## Status Flow

The correct policy status progression is:

```
QUOTED → BINDING → BOUND → IN_FORCE
```

## Status Definitions

- **QUOTED**: Quote has been generated but not yet purchased (current implementation ✅)
- **BINDING**: Policy is in the process of being bound (payment processing) (Phase 4 - not yet implemented)
- **BOUND**: Policy has been successfully bound with payment (Phase 4 - not yet implemented)
- **IN_FORCE**: Policy is active and coverage is in effect (Phase 4 - not yet implemented)

**IMPORTANT**: Use "IN_FORCE" NOT "ACTIVE" for policies that are in effect.

## Implementation Notes

### Current Status (Phase 3 Complete)
- ✅ Quotes created with status `QUOTED`
- ✅ Status remains `QUOTED` through the entire quote flow

### Future Implementation (Phase 4 - Policy Binding)
When implementing policy binding:

1. **Status Update in Database**:
   - Update `policy.status_code` column to use `IN_FORCE` instead of `ACTIVE`
   - Ensure migration/schema uses `IN_FORCE`

2. **Backend Service** (`quote.service.ts` or new `policy.service.ts`):
   - Binding endpoint should transition: `QUOTED → BINDING`
   - Payment success should transition: `BINDING → BOUND`
   - Policy activation should transition: `BOUND → IN_FORCE`

3. **Frontend Display**:
   - Show "In Force" in the UI (with proper capitalization)
   - Use status badge with appropriate color (green for in-force)

4. **API Responses**:
   - Return `status_code: "IN_FORCE"` in API responses
   - Frontend should display as "In Force" (human-readable)

## References

- Product Requirements.md: Line 259 mentions `ACTIVE` status (needs update)
- Product Requirements.md: Line 604 shows flow ending in `ACTIVE` (needs update)
- spec.md: Line 205 mentions policy status transitions (needs update)
- spec.md: Line 327 shows SC-021 with status flow (needs update)

## Action Items for Phase 4

- [ ] Update all documentation to use `IN_FORCE` instead of `ACTIVE`
- [ ] Implement status transitions in policy binding service
- [ ] Add status validation (prevent invalid transitions)
- [ ] Update frontend to display "In Force" status
- [ ] Add database migration to update any existing `ACTIVE` statuses to `IN_FORCE`
