# RouteGuard Manual Verification Tests (T057-T058)

## Test T057: RouteGuard Prevents Mixing Routes

**Purpose**: Verify RouteGuard redirects users who try to mix /quote/* and /quote-v2/* flows

**Steps**:
1. Open browser to http://localhost:5173
2. Click "Modern Flow (New!)" button
3. Browser should navigate to /quote-v2/get-started
4. RouteGuard will redirect to "/" because /quote-v2/get-started doesn't exist yet
5. Open browser console and check for RouteGuard warning
6. Manually navigate to http://localhost:5173/quote/driver-info in URL bar
7. **Expected**: Should be allowed (no active flow set after redirect)

**Alternative Test** (once Phase 3 pages exist):
1. Start /quote-v2 flow, complete Screen 01
2. Manually change URL to /quote/driver-info
3. **Expected**: RouteGuard redirects to "/" with error message

**Status**: ⚠️ Cannot fully test until Phase 3 screens are implemented

---

## Test T058: RouteGuard Allows Same-Flow Navigation

**Purpose**: Verify RouteGuard allows navigation within the same flow

**Steps**:
1. Open browser to http://localhost:5173
2. Click "Modern Flow (New!)" button
3. Browser navigates to /quote-v2/get-started
4. Navigate to /quote-v2/email-collection (once implemented)
5. Navigate to /quote-v2/vehicle-info (once implemented)
6. **Expected**: All navigations within /quote-v2/* should work without redirects

**Status**: ⚠️ Cannot fully test until Phase 3 screens are implemented

---

## Current Verification (What We Can Test Now)

### ✅ T057 Partial: RouteGuard Component Exists and Loads
```bash
# Verify RouteGuard component is imported in App.tsx
grep -n "RouteGuard" src/App.tsx
# Output: Line 43: import { RouteGuard } from './components/RouteGuard';
```

### ✅ T057 Partial: Route Protection is Configured
```bash
# Verify /quote-v2/* routes are wrapped with RouteGuard
grep -A 5 "quote-v2" src/App.tsx
# Output shows RouteGuard with expectedFlow="tech-startup"
```

### ✅ T058 Partial: RouteGuard Logic Implemented
- RouteGuard checks activeFlow vs expectedFlow
- Redirects to "/" if mismatch detected
- Logs warning to console for debugging

---

## Notes

- Full end-to-end testing of RouteGuard requires Phase 3 screens
- Logic is implemented and will work when screens are added
- Tests T057-T058 marked as "verified with limitations" until Phase 3
