# Gap Analysis: Current Implementation vs. Tech-Startup Mockup

**Created**: 2025-11-09
**Feature**: 004-tech-startup-flow-redesign
**Mockup Reference**: mockups/version-4-tech-startup.html

---

## Screen-by-Screen Comparison

### Screen 1: Get Started (Basic Info Collection)

**Mockup Fields**:
- first_name, last_name
- line_1_address, line_2_address (optional)
- municipality_name, state_code, postal_code
- birth_date

**Current Implementation**: [PrimaryDriverInfo.tsx](../../src/pages/quote/PrimaryDriverInfo.tsx)
- ✅ Has similar fields
- ❌ Missing tech-startup visual design (purple gradient, Inter font)
- ❌ Missing sticky header with quote ID
- ❌ Different layout (not card-based)
- ❌ Different button styles

**Status**: REDESIGN EXISTING
**Effort**: Medium (2 days - design system changes)

---

### Screen 2: Effective Date Entry

**Mockup**: Standalone screen asking "When do you want coverage to begin?"

**Current Implementation**: NOT STANDALONE
- ❌ Currently part of a different screen or not explicitly separated
- ❌ Need dedicated route /quote/effective-date/:quoteNumber

**Status**: NEW SCREEN REQUIRED
**Effort**: Low (1 day)

---

### Screen 3: Email Address Collection

**Mockup**: Asks for email (required) and mobile phone (optional)

**Current Implementation**: DOES NOT EXIST
- ❌ No dedicated email collection screen
- ❌ Email may be collected elsewhere or not at all
- Communication entity exists in backend but no frontend screen

**Status**: NEW SCREEN REQUIRED (HIGH PRIORITY)
**Effort**: Low-Medium (1 day)

---

### Screen 4: Loading Screen #1 (Data Retrieval)

**Mockup**: 
- Animated car icon moving left-right
- Progress bar
- Loading steps:
  - Verifying insurance history ✓
  - Retrieving vehicle information (active)
  - Calculating premium

**Current Implementation**: DOES NOT EXIST
- ❌ No loading animation between screens
- ❌ No animated car icon
- ❌ No progress indicator

**Status**: NEW SCREEN REQUIRED
**Effort**: Medium (1 day - animations)

---

### Screen 5: Vehicle & Driver Summary

**Mockup**:
- Two-column layout: content + sticky price sidebar
- Vehicle cards with edit links
- Driver cards with edit links
- "Add Another Vehicle/Driver" buttons
- Price sidebar: 6-month term, due today, payment plan, discounts

**Current Implementation**: [VehiclesList.tsx](../../src/pages/quote/VehiclesList.tsx)
- ✅ Lists vehicles
- ✅ Has "Add Vehicle" functionality
- ❌ Missing sticky price sidebar
- ❌ Missing driver cards on same screen
- ❌ Missing edit modals (currently inline editing?)
- ❌ Wrong visual design

**Status**: MAJOR REDESIGN
**Effort**: High (2-3 days - price sidebar + modals)

---

### Screen 6: Coverage Selection

**Mockup**:
- Sticky price sidebar (persistent)
- Sections: Protect Your Assets, Protect Your Vehicles, Protect You & Loved Ones
- BI Liability: Dropdown selector ($100k/$300k, $300k/$500k, $500k/$1M)
- PD Liability: Range slider ($25k - $100k)
- Comprehensive/Collision: Range sliders per vehicle ($250/$500/$1000 deductibles)
- Medical Payments: Range slider ($1k - $10k)

**Current Implementation**: [CoverageSelection.tsx](../../src/pages/quote/CoverageSelection.tsx)
- ✅ Has coverage selection
- ❌ Missing sticky price sidebar
- ❌ Missing range sliders (may have dropdowns?)
- ❌ Missing real-time premium updates
- ❌ Wrong visual design

**Status**: MAJOR REDESIGN
**Effort**: High (2 days - real-time updates + sliders)

---

### Screen 7: Add-Ons (Optional Coverages)

**Mockup**:
- Toggle switches for Rental Reimbursement (per vehicle)
- Toggle switch for Roadside Assistance (always included, disabled)
- Sticky price sidebar showing updated totals

**Current Implementation**: MAYBE PART OF CoverageSelection.tsx
- ❌ Likely not separated into dedicated screen
- ❌ Toggle switches may not exist (checkboxes?)
- ❌ No disabled state for included coverages

**Status**: NEW SCREEN OR MAJOR REDESIGN
**Effort**: Medium (1 day)

---

### Screen 8: Loading Screen #2 (Validation)

**Mockup**:
- Same animated car icon as Loading #1
- Loading steps:
  - Vehicle valuation ✓
  - Driver records check ✓
  - Finalizing premium calculation (active)

**Current Implementation**: DOES NOT EXIST
- ❌ No loading screen between coverage and review

**Status**: NEW SCREEN REQUIRED
**Effort**: Low (1 day - reuse Loading #1 component)

---

### Screen 9: Coverage Review

**Mockup**:
- Comprehensive summary with sections:
  - Drivers (all drivers with license numbers)
  - Vehicles (all vehicles with VINs)
  - Liability Coverage (BI + PD limits)
  - Vehicle Coverage (per vehicle - comprehensive, collision, rental)
- Sticky price sidebar with full discount breakdown
- "Make Changes" vs. "Looks Good! Continue" buttons

**Current Implementation**: [QuoteResults.tsx](../../src/pages/quote/QuoteResults.tsx)
- ✅ Shows quote summary
- ❌ May not have comprehensive breakdown format
- ❌ Missing sticky price sidebar
- ❌ Missing "Make Changes" button
- ❌ Wrong visual design

**Status**: MAJOR REDESIGN
**Effort**: Medium-High (2 days)

---

### Screen 10: Signing Ceremony (Initial)

**Mockup**:
- Collapsed signature pad with "Click to sign" placeholder
- Signature date (readonly, auto-populated)
- "Review Terms" and "Sign & Continue" buttons

**Current Implementation**: DOES NOT EXIST
- ❌ No signing ceremony
- ❌ Signature may be collected in checkout (Phase 4?)

**Status**: NEW SCREEN REQUIRED (HIGH PRIORITY)
**Effort**: Medium-High (1 day for basic, 2 days for canvas)

---

### Screen 11: Checkout Page

**Mockup**:
- Payment method selection: Credit/Debit Card vs. Bank Account
- Account status display:
  - Existing user: Shows email + "Verified" badge
  - New user: Triggers account creation modal
- "Enter Payment Details" button

**Current Implementation**: [Checkout.tsx](../../src/pages/binding/Checkout.tsx) exists from Phase 4
- ✅ Checkout page exists
- ❌ May not have payment method selection UI
- ❌ May not check for existing user accounts
- ❌ Wrong visual design

**Status**: MAJOR REDESIGN
**Effort**: Medium (1-2 days)

---

### Screen 12: Credit Card Details

**Mockup**:
- Cardholder name
- Card number (formatted with spaces)
- Expiration date (MM/YY)
- CVV (3-4 digits)
- Billing ZIP code
- Payment summary box: Today's payment, remaining payments, total cost

**Current Implementation**: LIKELY EXISTS in Checkout.tsx
- ✅ Payment form likely exists (Phase 4)
- ❌ May not match mockup design
- ❌ Missing payment summary box

**Status**: REDESIGN EXISTING
**Effort**: Low-Medium (1 day)

---

### Screen 13: Payment Processing

**Mockup**:
- Same animated car icon
- Loading steps:
  - Payment authorized ✓
  - Binding policy (active)
  - Generating documents

**Current Implementation**: MAY EXIST
- ❓ Phase 4 may have payment processing loading state

**Status**: NEW OR REDESIGN
**Effort**: Low (1 day - reuse Loading component)

---

### Screen 14: Success / Confirmation

**Mockup**:
- Large checkmark icon
- "Congratulations! Your policy is now active."
- Policy number (DZXXXXXXXXX)
- Effective date + coverage term
- What's Next section:
  - Check email (documents sent)
  - Download ID cards (ready now)
  - Access portal (manage policy)
- "Download ID Cards" and "Go to My Policy Portal" buttons

**Current Implementation**: [Confirmation.tsx](../../src/pages/binding/Confirmation.tsx) exists from Phase 4
- ✅ Confirmation page exists
- ❌ May not have "What's Next" section
- ❌ May not have ID card download
- ❌ Wrong visual design

**Status**: MAJOR REDESIGN
**Effort**: Medium (1 day)

---

## Modal/Branch Screens Comparison

### Edit Vehicle Modal (Owned)

**Mockup**: Modal overlay with form for vehicle_year, vehicle_make, vehicle_model, vin, ownership_status, annual_mileage, vehicle_use_code

**Current Implementation**: LIKELY INLINE EDITING
- ❌ No modal overlay system
- ✅ Vehicle editing likely exists in VehicleConfirmation.tsx

**Status**: NEW MODAL REQUIRED
**Effort**: Medium (1 day per modal type)

---

### Edit Vehicle Modal (Financed/Leased)

**Mockup**: Same as owned + lienholder section (name, address, city, state)

**Current Implementation**: MAY NOT EXIST
- ❌ Lienholder fields may not be implemented

**Status**: NEW MODAL REQUIRED
**Effort**: Medium (1 day - conditional fields)

---

### Edit Primary Driver Modal

**Mockup**: Modal for first_name, last_name, birth_date, gender_code, marital_status_code, license_number, license_state, license_date

**Current Implementation**: LIKELY INLINE EDITING
- ✅ Driver editing exists
- ❌ No modal overlay

**Status**: NEW MODAL REQUIRED
**Effort**: Medium (1 day)

---

### Edit Additional Driver Modal

**Mockup**: Same as primary driver + relationship_type

**Current Implementation**: EXISTS in AdditionalDrivers.tsx
- ✅ Additional driver form exists
- ❌ Not in modal format

**Status**: CONVERT TO MODAL
**Effort**: Low-Medium (1 day)

---

### Signature Pad Expanded Modal

**Mockup**: Full-screen modal with large canvas area for drawing signature, "Clear" and "Accept Signature" buttons

**Current Implementation**: DOES NOT EXIST
- ❌ No signature capture functionality

**Status**: NEW MODAL REQUIRED (COMPLEX)
**Effort**: High (2-3 days - canvas implementation)

---

### New Account Setup Modal

**Mockup**: Modal for email, create password, confirm password

**Current Implementation**: DOES NOT EXIST
- ❌ No account creation during checkout
- UserAccount entity exists (Phase 5) but no signup flow

**Status**: NEW MODAL REQUIRED
**Effort**: Medium (1-2 days - password validation)

---

### Validation Screen (Missing Info Alert)

**Mockup**: Alert box listing missing required fields with "Review & Complete" button

**Current Implementation**: DOES NOT EXIST
- ❌ Validation errors likely shown inline or at field level
- ❌ No dedicated validation summary screen

**Status**: NEW SCREEN REQUIRED
**Effort**: Low (0.5 day)

---

## Component Library Gaps

### Existing in Canary Design System (Need Verification)
- ✅ Button
- ✅ Card
- ✅ Input/TextField
- ✅ Select/Dropdown
- ✅ Modal/Dialog
- ✅ Badge
- ✅ Alert

### Need to Check Canary for
- ❓ Toggle/Switch (for rental/roadside)
- ❓ Range Slider (for coverage amounts)
- ❓ Loading Spinner with custom animations
- ❓ Signature Canvas component
- ❓ Progress Bar component

### Custom Components Needed
- ❌ Sticky Price Sidebar (unique to this design)
- ❌ Animated Car Icon (custom animation)
- ❌ Loading Steps Indicator (checkmarks + spinner)
- ❌ Screen Progress Indicator ("Screen X of 19")
- ❌ Signature Pad (canvas-based, may need library like react-signature-canvas)

---

## Backend API Gaps

### Existing Endpoints (From Phase 3-5)
- ✅ POST /api/v1/quotes (create quote)
- ✅ GET /api/v1/quotes/:id (get quote)
- ✅ GET /api/v1/quotes/reference/:quoteNumber (get by quote number)
- ✅ PUT /api/v1/quotes/:id/coverage (update coverage)
- ✅ POST /api/v1/quotes/:id/calculate (recalculate premium)
- ✅ POST /api/v1/policies (bind policy - Phase 4)
- ✅ POST /api/v1/payments (process payment - Phase 4)
- ✅ GET /api/v1/portal/:policyNumber/* (portal APIs - Phase 5)

### New Endpoints Needed
- ❌ POST /api/v1/communications (save email/phone)
- ❌ POST /api/v1/signatures (save signature image)
- ❌ GET /api/v1/signatures/:quoteId (retrieve signature)
- ❌ POST /api/v1/user-accounts/check-email (check if email exists)
- ❌ POST /api/v1/user-accounts (create account)
- ❌ POST /api/v1/lienholders (save lienholder info)
- ❌ GET /api/v1/quotes/:id/validation (get missing fields)

### Existing Entities (No API Changes)
- ✅ Party, Person (Phase 3)
- ✅ Vehicle, InsurableObject (Phase 3)
- ✅ Policy, Agreement (Phase 3)
- ✅ Coverage, CoveragePart (Phase 3)
- ✅ Payment, PaymentMethod (Phase 4)
- ✅ UserAccount (Phase 5)

---

## Visual Design System Gaps

### Colors
**Current**: Unknown (likely different)
**Needed**: 
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 100%)`
- Purple: `#667eea`
- Dark purple: `#764ba2`
- Background: `#f7fafc`
- Border: `#e2e8f0`
- Text dark: `#1a202c`
- Text medium: `#718096`

### Typography
**Current**: Unknown
**Needed**: Inter font from Google Fonts
- H1: 52px / 800 weight
- H2: 36px / 700 weight
- Subtitle: 18px / 400 / #718096

### Spacing
**Current**: Unknown
**Needed**:
- Screen padding: 60px
- Card padding: 32px (coverage items), 28px (toggles), 60px (main screen)
- Gap between cards: 20px
- Gap between form fields: 24px

### Border Radius
**Current**: Likely 12px (Canary default?)
**Needed**: 
- Screens: 24px
- Cards: 16px
- Buttons: 12px
- Inputs: 12px
- Badges: 20px

### Animations
**Current**: None
**Needed**:
- Car driving animation (translateX -40px to +40px, 2s infinite)
- Progress bar animation (width 30% to 80%, 2s infinite)
- Button hover (translateY -2px)
- Card hover (translateY -4px)
- Spinner rotation (360deg, 1s linear infinite)

---

## Summary of Work Required

### New Screens (8)
1. Effective Date Entry (Screen 2)
2. Email Collection (Screen 3)
3. Loading #1 (Screen 4)
4. Add-Ons (Screen 7)
5. Loading #2 (Screen 8)
6. Signing Ceremony (Screen 10)
7. Loading #3 / Payment Processing (Screen 13)
8. Validation Alert (Missing Info)

### Major Redesigns (6)
1. Get Started (Screen 1) - visual design only
2. Vehicle & Driver Summary (Screen 5) - add price sidebar + modals
3. Coverage Selection (Screen 6) - add price sidebar + sliders
4. Coverage Review (Screen 9) - comprehensive summary format
5. Checkout (Screen 11) - payment method selection + account check
6. Confirmation (Screen 14) - What's Next section + visual design

### New Modals (6)
1. Edit Vehicle (Owned)
2. Edit Vehicle (Financed/Leased)
3. Edit Primary Driver
4. Edit Additional Driver
5. Signature Pad Expanded
6. New Account Setup

### Minor Redesigns (1)
1. Payment Form (Screen 12) - payment summary box

### New Components (5)
1. Sticky Price Sidebar
2. Loading Animation (car + progress + steps)
3. Signature Canvas
4. Screen Progress Indicator
5. Modal Overlay System

### Backend Work (7 endpoints)
1. Communications API
2. Signatures API
3. User Account Check Email API
4. Lienholders API
5. Quote Validation API

### Design System Work
1. Color theme updates
2. Typography (Inter font)
3. Component restyling (buttons, cards, inputs)
4. Animation keyframes
5. Spacing/layout adjustments

---

## Estimated Timeline

**P1 - Core Flow (7 days)**:
- Screen 3 (Email): 1 day
- Screen 4 (Loading #1): 1 day
- Screen 5 (Summary redesign): 2 days
- Price sidebar component: 2 days
- Real-time premium updates: 1 day

**P2 - Payment/Signing (11 days)**:
- Screen 10 (Signing): 1 day
- Screen 11 (Checkout): 1 day
- Screen 12 (Payment redesign): 1 day
- Screen 13 (Payment processing): 1 day
- Signature pad component: 3 days
- Account creation flow: 2 days
- Backend APIs (signatures, accounts): 2 days

**P3 - Visual Design (8 days)**:
- Design system updates: 3 days
- Component styling: 2 days
- Modal system: 2 days
- Loading animations: 1 day

**P4 - Polish & Testing (6 days)**:
- Screen 2 (Effective date): 1 day
- Screen 7 (Add-ons): 1 day
- Screen 8 (Loading #2): 0.5 day
- Validation screen: 0.5 day
- All modals: 4 days

**Grand Total**: ~32 days (6-7 weeks)

---

## Risk Assessment

**High Risk**:
- Signature canvas implementation (browser compatibility, touch support)
- Real-time premium calculations (performance with many inputs)
- Modal system (accessibility, keyboard navigation, focus management)

**Medium Risk**:
- Design system migration (breaking existing screens)
- Payment integration testing (ensuring Phase 4 work still functions)
- Animation performance (60fps on older devices)

**Low Risk**:
- Email collection screen (straightforward form)
- Loading screens (mostly CSS animations)
- Visual design updates (CSS-only changes)

---

## Dependencies

1. **Canary Design System** - Need to verify Toggle, Slider, Modal components exist
2. **Phase 4 (Binding)** - Payment flow must remain functional during redesign
3. **Phase 5 (Portal)** - UserAccount entity needed for account creation
4. **Backend** - New endpoints required before frontend can be fully functional
5. **Design Assets** - Need Everest Insurance logo, possibly custom car icon

---

## Recommendations

1. **Start with P1** - Get core quote flow working with new design
2. **Implement design system changes early** - Avoids rework later
3. **Build reusable components first** - Price sidebar, loading animation, modal system
4. **Use feature flags** - Allow toggling between old and new flow during development
5. **Parallel backend work** - Start API development alongside frontend
6. **Incremental testing** - Don't wait until end to test signatures, modals
7. **Document Canary component usage** - Create guide for team on which components to use
