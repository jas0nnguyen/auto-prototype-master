# Feature Specification: Tech Startup Flow Redesign (Parallel Variation)

**Feature Branch**: `004-tech-startup-flow-redesign`
**Created**: 2025-11-09
**Status**: Draft
**Input**: User description: "Redesign the flow to mirror the version-4-tech-startup.html mockup. Keep all current functionality and identify any new features needed. This will be a parallel flow variation - the existing progressive flow remains intact."

## Architecture Approach

This feature implements a **parallel flow variation** alongside the existing progressive quote flow:

- **Existing Flow** (`/quote/*`): Progressive multi-step flow (Phase 3 implementation) - **PRESERVED AS-IS**
  - Routes: `/quote/driver-info/:quoteNumber`, `/quote/additional-drivers/:quoteNumber`, etc.
  - Pages: `PrimaryDriverInfo.tsx`, `AdditionalDrivers.tsx`, `VehiclesList.tsx`, etc.
  - No changes to existing implementation

- **Tech Startup Flow** (`/quote-v2/*`): New 19-screen flow with tech-startup aesthetic - **NEW IMPLEMENTATION**
  - Routes: `/quote-v2/get-started`, `/quote-v2/effective-date/:quoteNumber`, etc.
  - Pages: New directory `src/pages/quote-v2/` with all 19 screens
  - Shares same backend APIs (quote service, rating engine, payment)
  - Different URL namespace to avoid conflicts

### Route Strategy

```typescript
// Existing routes (UNCHANGED)
/quote/driver-info/:quoteNumber
/quote/additional-drivers/:quoteNumber
/quote/vehicles/:quoteNumber
/quote/vehicle-confirmation/:quoteNumber
/quote/coverage-selection/:quoteNumber
/quote/results/:quoteNumber

// New tech-startup flow routes
/quote-v2/get-started
/quote-v2/effective-date/:quoteNumber
/quote-v2/email/:quoteNumber
/quote-v2/loading-prefill/:quoteNumber
/quote-v2/summary/:quoteNumber
/quote-v2/coverage/:quoteNumber
/quote-v2/add-ons/:quoteNumber
/quote-v2/loading-validation/:quoteNumber
/quote-v2/review/:quoteNumber
/quote-v2/sign/:quoteNumber
/quote-v2/checkout/:quoteNumber
/quote-v2/payment/:quoteNumber
/quote-v2/processing/:quoteNumber
/quote-v2/success/:quoteNumber
```

### Shared vs. New Components

**Shared (Reusable)**:
- Backend APIs (quote service, rating engine, payment service)
- Mock services (VIN decoder, vehicle valuation, safety ratings, insurance history, driver records)
- Data models (Quote, Policy, Coverage entities)
- TanStack Query hooks (with some additions)
- Base Canary Design System components

**New (Tech Startup Flow Only)**:
- All screens in `src/pages/quote-v2/` directory
- Sticky price sidebar component
- Loading animation component
- Signature canvas component
- Modal overlay system (tech-startup styled)
- Screen progress indicator

### Mock Service Integration

The tech-startup flow will leverage **existing mock services** (from Phase 3) to simulate realistic data population:

**During Loading Screen #1 (Screen 4)** - Simulated calls:
1. **Insurance History Lookup** - Mock API call using driver name/DOB to retrieve:
   - Current policy information (if exists)
   - Prior vehicles insured
   - Coverage history
   - Claims history (for rating purposes)

2. **Vehicle Information Retrieval** - Mock VIN decoder service to populate:
   - Vehicle make, model, year from VIN
   - Vehicle value (market value)
   - Safety ratings (NHTSA, IIHS)
   - Anti-theft features
   - Vehicle use classification

3. **Initial Premium Calculation** - Rating engine mock to determine:
   - Base premium using retrieved data
   - Applicable discounts (multi-car, homeowner, etc.)
   - Initial coverage recommendations

**During Loading Screen #2 (Screen 8)** - Validation calls:
1. **Vehicle Valuation** - Mock service to confirm:
   - Current market value
   - Replacement cost
   - Depreciation schedule

2. **Driver Records Check** - Mock MVR (Motor Vehicle Record) lookup:
   - License verification
   - Driving violations
   - Accident history
   - Driver risk score

3. **Final Premium Calculation** - Rating engine with all user-selected coverages:
   - Apply user-selected coverage limits
   - Calculate final premium with all factors
   - Apply final discounts/surcharges

**Mock Service Endpoints (Already Exist)**:
- `POST /api/v1/mock/vin-decode` - Decode VIN to vehicle details
- `GET /api/v1/mock/vehicle-value/:vin` - Get market value
- `GET /api/v1/mock/safety-rating/:year/:make/:model` - Safety ratings
- `POST /api/v1/mock/insurance-history` - Lookup prior coverage
- `POST /api/v1/mock/driver-record` - MVR lookup
- `GET /api/v1/mock/rating-factors` - Get rating multipliers

**Visual Feedback During Mock Calls**:
- Loading animation shows progress steps with checkmarks
- Step 1: "Verifying insurance history" ✓ (2 seconds)
- Step 2: "Retrieving vehicle information" (active spinner, 3 seconds)
- Step 3: "Calculating premium" (pending)
- Simulated delays create realistic experience (5-8 seconds total per loading screen)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Streamlined Quote Generation with Email Collection (Priority: P1)

Users need a modern, tech-startup aesthetic for the quote flow that collects email early, shows real-time price updates in a sticky sidebar, and provides a smoother step-by-step experience.

**Why this priority**: This is the core user journey that drives all quote creation. The new design improves conversion by collecting contact information earlier and providing better visibility into pricing throughout the flow.

**Independent Test**: Can be fully tested by completing the quote flow from start to finish and verifying all screens match the tech-startup mockup design.

**Acceptance Scenarios**:

1. **Given** a user visits the landing page, **When** they enter their basic information (name, address, DOB), **Then** they should see the tech-startup gradient design with purple/blue branding
2. **Given** a user completes basic info, **When** they proceed to the effective date screen, **Then** they should be prompted to select when coverage begins
3. **Given** a user selects an effective date, **When** they continue, **Then** they should be prompted for email address and optional mobile phone
4. **Given** a user enters email, **When** they submit, **Then** the system should show a loading screen with animated car icon, progress bar, and simulated API calls (insurance history, VIN decode, vehicle valuation, safety ratings)
5. **Given** the loading screen runs, **When** each mock service call completes, **Then** the corresponding step should show a checkmark (✓) and the next step should show a spinner
6. **Given** prefill data is retrieved from mock services, **When** the vehicles/drivers summary screen loads, **Then** they should see populated vehicle cards (make, model, year from VIN decoder) and driver cards (from insurance history)
7. **Given** the summary screen loads, **When** viewing the price sidebar, **Then** they should see initial premium calculated from mock service data with applicable discounts
8. **Given** a user views the summary, **When** they interact with edit buttons, **Then** modal dialogs should open to edit vehicle or driver details
9. **Given** a user has financed/leased vehicles, **When** they edit that vehicle, **Then** they should see lienholder information fields
10. **Given** a user proceeds to coverage selection, **When** they adjust sliders/dropdowns, **Then** the price sidebar should update in real-time
11. **Given** a user completes coverage selection, **When** they proceed, **Then** they should see add-ons screen with toggle switches for rental and roadside assistance
12. **Given** a user completes add-ons, **When** they proceed, **Then** Loading Screen #2 should appear with simulated MVR lookup, vehicle valuation confirmation, and final premium calculation

---

### User Story 2 - Enhanced Payment & Signing Ceremony (Priority: P2)

Users need a more professional payment and signature experience that includes account creation, payment method selection, and an expanded signature pad.

**Why this priority**: Payment is critical for conversion but comes after the quote is generated. The new design adds legitimacy and trust through better UX.

**Independent Test**: Can be tested by completing a quote and proceeding through checkout, payment, and signing flows.

**Acceptance Scenarios**:

1. **Given** a user completes coverage review, **When** they proceed, **Then** they should see a signing ceremony screen with signature pad
2. **Given** a user clicks the signature pad, **When** it expands, **Then** they should be able to draw their signature using mouse/touch
3. **Given** a user signs, **When** they continue, **Then** they should see a checkout page with payment method selection (card vs. bank)
4. **Given** a new user reaches checkout, **When** the system checks their email, **Then** they should be prompted to create an account with password
5. **Given** an existing user reaches checkout, **When** the system recognizes them, **Then** they should see their verified account status
6. **Given** a user selects credit card, **When** they click "Enter Payment Details", **Then** they should see a secure payment form with card fields
7. **Given** a user enters payment details, **When** they submit, **Then** they should see a payment processing screen with loading animation
8. **Given** payment succeeds, **When** policy is bound, **Then** they should see a success screen with policy number and next steps

---

### User Story 3 - Modern Visual Design & Branding (Priority: P3)

Users should experience a cohesive tech-startup aesthetic throughout the entire flow with gradient backgrounds, Inter font, card-based layouts, and purple/blue branding.

**Why this priority**: Visual design is important for brand perception but doesn't affect core functionality. Can be implemented after functional flows work.

**Independent Test**: Can be tested by visually inspecting all screens against the mockup design specifications.

**Acceptance Scenarios**:

1. **Given** any page in the quote flow, **When** the page loads, **Then** it should use the purple/blue gradient background (#667eea to #764ba2 to #f093fb)
2. **Given** any page, **When** viewing typography, **Then** headings should use Inter font at 52px/800 weight for h1, 36px/700 for h2
3. **Given** any form input, **When** focused, **Then** it should show a #667eea border with 4px rgba shadow
4. **Given** any primary button, **When** hovered, **Then** it should translateY(-2px) with enhanced shadow
5. **Given** the price sidebar, **When** scrolling, **Then** it should remain sticky at top: 120px
6. **Given** any card component, **When** hovered, **Then** it should show purple border and lift with translateY(-4px)

---

### Edge Cases

- What happens when email is already registered during account creation? (Show login option instead)
- How does system handle invalid signature submissions? (Require user to draw signature before accepting)
- What happens when payment processing fails? (Show error message, allow retry, preserve quote data)
- How does system handle missing required fields during validation? (Show validation screen with specific missing items)
- What happens when user navigates back during checkout? (Preserve all form data in session)
- How does system handle financed vs. owned vehicles differently? (Show lienholder fields conditionally)
- How do users choose between original flow and tech-startup flow? (Landing page displays flow selector with "Classic" and "Modern" options, defaulting to Classic /quote/* for backward compatibility)
- What happens if user tries to access /quote routes while in /quote-v2 flow? (Each flow independent, can't mix routes)

## Requirements *(mandatory)*

### Architectural Requirements

**Parallel Flow Implementation**

- **AR-001**: System MUST preserve all existing `/quote/*` routes and pages unchanged
- **AR-002**: System MUST implement new tech-startup flow under `/quote-v2/*` namespace
- **AR-003**: System MUST create new directory `src/pages/quote-v2/` for all tech-startup screens
- **AR-004**: System MUST reuse existing backend APIs (no duplication of quote service, rating engine, payment APIs)
- **AR-005**: System MUST allow users to complete quotes using either flow independently
- **AR-006**: System MUST NOT allow mixing routes between flows (e.g., starting in /quote and continuing in /quote-v2)
- **AR-007**: System MUST implement landing page flow selector allowing users to choose between "Classic" (/quote/*) or "Modern" (/quote-v2/*) flows, with default navigation to existing /quote/* flow for backward compatibility
- **AR-008**: Both flows MUST persist data to same database tables (Quote, Policy, Coverage entities)
- **AR-009**: Both flows MUST use same TanStack Query hooks (with extensions for new features)
- **AR-010**: Tech-startup flow components MUST NOT modify existing Canary component styles globally

### Functional Requirements

**Tech Startup Flow - New Screens (19 Total in `/quote-v2/*`)**

- **FR-001**: System MUST implement Screen 1 (Get Started) - Collect first_name, last_name, line_1_address, line_2_address, municipality_name, state_code, postal_code, birth_date
- **FR-002**: System MUST implement Screen 2 (Effective Date Entry) - Collect policy effective_date with date picker
- **FR-003**: System MUST implement Screen 3 (Email Address) - NEW - Collect communication_value for EMAIL and optional MOBILE types
- **FR-004**: System MUST implement Screen 4 (Loading Screen #1) - Show animated car icon, progress bar, and loading steps (verifying insurance history, retrieving vehicle info, calculating premium)
- **FR-005**: System MUST implement Screen 5 (Vehicle & Driver Summary) - Display prefilled vehicles and drivers with edit links, "Add Another" buttons, and sticky price sidebar
- **FR-006**: System MUST implement Screen 6 (Coverage Selection) - Sliders/dropdowns for BI_LIABILITY, PD_LIABILITY, COMPREHENSIVE, COLLISION, MED_PAY with real-time price updates
- **FR-007**: System MUST implement Screen 7 (Add-Ons) - Toggle switches for RENTAL and ROADSIDE coverages per vehicle
- **FR-008**: System MUST implement Screen 8 (Loading Screen #2) - Show vehicle valuation, driver records check, finalizing premium
- **FR-009**: System MUST implement Screen 9 (Coverage Review) - Summary cards for drivers, vehicles, liability, vehicle coverage with "Make Changes" and "Continue" buttons
- **FR-010**: System MUST implement Screen 10 (Signing Ceremony Initial) - Signature pad (collapsed) with sign button
- **FR-011**: System MUST implement Screen 11 (Checkout Page) - Payment method selection (card vs. bank), account status display
- **FR-012**: System MUST implement Screen 12 (Credit Card Details) - Secure payment form with cardholder name, card number (masked display XXXX XXXX XXXX 1234), expiration (MM/YY), CVV (3-4 digits), billing ZIP (5 digits); reuses existing Phase 4 payment validation (Luhn algorithm, client-side validation, no plaintext storage)
- **FR-013**: System MUST implement Screen 13 (Payment Processing) - Loading screen showing payment authorized, binding policy, generating documents
- **FR-014**: System MUST implement Screen 14 (Success) - Display policy_number (DZXXXXXXXX format), effective date, coverage term, next steps

**Modal/Branch Screens (5 Total)**

- **FR-015**: System MUST implement Edit Vehicle Modal (Owned) - Fields for vehicle_year, vehicle_make, vehicle_model, vin, ownership_status, annual_mileage, vehicle_use_code
- **FR-016**: System MUST implement Edit Vehicle Modal (Financed/Leased) - All owned fields PLUS optional lienholder_name, lienholder_address, lienholder city/state (fields provided but not required, nullable database columns)
- **FR-017**: System MUST implement Edit Primary Driver Modal - Fields for first_name, last_name, birth_date, gender_code, marital_status_code, license_number, license_state, license_date
- **FR-018**: System MUST implement Edit Additional Driver Modal - All primary driver fields PLUS relationship_type to primary insured
- **FR-019**: System MUST implement Signature Pad Expanded Modal using react-signature-canvas library - Canvas area for drawing signature with Clear and Accept buttons, supporting both mouse and touch input
- **FR-020**: System MUST implement New Account Setup Modal - Fields for email, password (create + confirm) when user email doesn't exist
- **FR-021**: System MUST implement Validation Screen - Display alert box listing missing required information with "Review & Complete" button

**UI/UX Components**

- **FR-022**: System MUST display sticky header with logo (Everest Insurance), quote_id, support phone across all screens
- **FR-023**: System MUST display sticky price sidebar (when applicable) showing 6-month term, due today amount, payment plan, total premium, discount breakdowns - Desktop (≥1024px): sticky right sidebar; Mobile (<1024px): fixed bottom bar with "View Details" button opening full breakdown in modal/drawer
- **FR-024**: System MUST use gradient primary buttons (#667eea to #764ba2) with hover effects (translateY, enhanced shadow)
- **FR-025**: System MUST use card-based layouts with hover states (border color change, shadow, lift animation)
- **FR-026**: System MUST implement screen indicator showing "Screen X of 19" at top of each main flow screen
- **FR-027**: System MUST implement loading animations with car icon, progress bar, and step indicators
- **FR-028**: System MUST implement toggle switches for optional coverages (rental, roadside)
- **FR-029**: System MUST implement range sliders for coverage amount selection with labeled min/mid/max values
- **FR-030**: System MUST implement modal overlays with semi-transparent background and centered content

**Backend Integration**

- **FR-031**: System MUST persist email address as Communication entity with communication_type_code = 'EMAIL'
- **FR-032**: System MUST persist mobile phone as Communication entity with communication_type_code = 'MOBILE' (optional)
- **FR-033**: System MUST validate email format before proceeding to loading screen
- **FR-034**: System MUST create UserAccount entity during checkout if email doesn't exist
- **FR-035**: System MUST validate signature exists before allowing payment submission
- **FR-036**: System MUST display real-time premium calculations in price sidebar as coverage selections change
- **FR-037**: System MUST conditionally show lienholder fields only when ownership_status is 'FINANCED' or 'LEASED'
- **FR-038**: System MUST validate all required fields before proceeding from summary screen to coverage selection

**Mock Service Integration (Simulated Data Population)**

- **FR-039**: System MUST call mock insurance history service during Loading Screen #1 using driver name/DOB
- **FR-040**: System MUST call mock VIN decoder service during Loading Screen #1 to populate vehicle details (make, model, year)
- **FR-041**: System MUST call mock vehicle valuation service during Loading Screen #1 to get market value
- **FR-042**: System MUST call mock safety rating service during Loading Screen #1 to retrieve NHTSA/IIHS ratings
- **FR-043**: System MUST call rating engine during Loading Screen #1 to calculate initial premium with retrieved data
- **FR-044**: System MUST display loading steps with visual progress (checkmarks for completed, spinner for active, pending for queued)
- **FR-045**: System MUST simulate realistic delays for each mock service call (2-3 seconds per step)
- **FR-046**: System MUST call mock driver record (MVR) service during Loading Screen #2 to retrieve violations/accidents
- **FR-047**: System MUST call mock vehicle valuation service again during Loading Screen #2 to confirm replacement cost
- **FR-048**: System MUST call rating engine during Loading Screen #2 with final user-selected coverages
- **FR-049**: System MUST populate vehicle cards on Summary screen with data from mock VIN decoder (make, model, year, VIN)
- **FR-050**: System MUST populate driver cards on Summary screen with data from insurance history lookup
- **FR-051**: System MUST display applicable discounts in price sidebar based on retrieved insurance history (multi-car, homeowner, etc.)
- **FR-052**: Mock services MUST return realistic simulated data (not random/garbage values)
- **FR-053**: System MUST handle mock service failures gracefully (show error state, allow retry)

### Key Entities *(include if feature involves data)*

- **Communication**: Stores email and mobile phone with communication_type_code ('EMAIL', 'MOBILE'), communication_value (actual email/phone)
- **UserAccount**: Represents user login credentials with email (unique), password_hash, created_date, last_login_date (already exists from Phase 5)
- **Signature**: NEW - Stores digital signature with signature_image_data, signature_date, signed_by (party_id)
- **PaymentMethod**: Stores payment method type (CREDIT_CARD, BANK_ACCOUNT), card_last_4, expiration_date, billing_zip (may exist from Phase 4)
- **Lienholder**: Represents financing entity with lienholder_name, lienholder_address (line_1, municipality, state), linked to Vehicle via nullable lienholder_party_id FK (optional collection as PartyRole)

## Clarifications

### Session 2025-11-09

- Q: How should users access the tech-startup flow (/quote-v2/*)? → A: Landing page flow selector with default to existing /quote/*
- Q: Which signature canvas library should be used for the signature pad feature? → A: react-signature-canvas
- Q: Should the payment flow support both credit card and bank account (ACH) payment methods? → A: Credit card only (simpler for demo, most common payment method)
- Q: Should lienholder/lessor information be collected for financed or leased vehicles? → A: Optional collection (provide fields but don't require, allows null values, balances realism with UX simplicity)
- Q: How should the price sidebar behave on mobile devices? → A: Fixed bottom bar (shows condensed premium with "View Details" button, tapping opens full breakdown in modal/drawer, maintains pricing transparency)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete entire quote flow matching all 19 screens in mockup within 8 minutes (target: 5 minutes average)
- **SC-002**: Price sidebar updates within 500ms of coverage selection changes
- **SC-003**: All screens render with correct tech-startup visual design (purple/blue gradient, Inter font, card layouts)
- **SC-004**: Modal dialogs open and close smoothly with overlay animations
- **SC-005**: Email collection screen successfully validates email format with 100% accuracy
- **SC-006**: System correctly identifies existing vs. new users at checkout with 100% accuracy
- **SC-007**: Signature pad captures and displays signatures on all major browsers (Chrome, Firefox, Safari, Edge)
- **SC-008**: Payment processing flow completes successfully for valid test card numbers
- **SC-009**: 90% of users successfully navigate from landing to success screen without errors
- **SC-010**: All 19 screens pass visual regression tests against mockup screenshots
