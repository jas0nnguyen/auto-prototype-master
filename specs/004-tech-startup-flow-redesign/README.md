# Feature 004: Tech Startup Flow Redesign (Parallel Variation)

**Status**: Draft / Planning
**Branch**: `004-tech-startup-flow-redesign`
**Created**: 2025-11-09
**Mockup**: [version-4-tech-startup.html](../../mockups/version-4-tech-startup.html)

---

## Overview

Implement a **parallel flow variation** of the auto insurance quote flow with a modern tech-startup aesthetic, while **preserving the existing progressive flow completely unchanged**. This creates two independent user journeys:

### 🔵 Existing Flow (PRESERVED - No Changes)
- **URL namespace**: `/quote/*`
- **Location**: [src/pages/quote/](../../src/pages/quote/)
- **Status**: ✅ Fully functional, untouched
- **Pages**: PrimaryDriverInfo, AdditionalDrivers, VehiclesList, VehicleConfirmation, CoverageSelection, QuoteResults
- **Routes**: 6 screens in progressive multi-step flow

### 🟣 Tech Startup Flow (NEW Implementation)
- **URL namespace**: `/quote-v2/*`
- **Location**: `src/pages/quote-v2/` (new directory)
- **Status**: 🚧 To be built
- **Screens**: 19 screens + 6 modals
- **Features**:
  - Purple/blue gradient branding (#667eea, #764ba2, #f093fb)
  - Inter font typography
  - Card-based layouts with hover effects
  - Real-time price sidebar showing premium calculations
  - Enhanced payment and signature experience
  - Modal-based editing workflows
  - Loading animations with progress indicators

### Shared Infrastructure
Both flows share:
- ✅ Backend APIs (quote service, rating engine, payment)
- ✅ **Mock Services** (VIN decoder, vehicle valuation, safety ratings, insurance history, driver records)
- ✅ Database (same Quote, Policy, Coverage tables)
- ✅ TanStack Query hooks (with extensions for new features)
- ✅ Canary Design System base components

### Mock Service Integration
The tech-startup flow uses **simulated API calls** to populate realistic data:

**Loading Screen #1** triggers:
- 🔍 Insurance history lookup (retrieve prior policies, vehicles, claims)
- 🚗 VIN decoder (populate vehicle make/model/year)
- 💰 Vehicle valuation (market value, replacement cost)
- ⭐ Safety ratings (NHTSA, IIHS scores)
- 💵 Initial premium calculation

**Loading Screen #2** triggers:
- 📋 Driver record check (MVR lookup - violations, accidents)
- 💰 Vehicle valuation confirmation
- 💵 Final premium calculation with user-selected coverages

**Visual feedback**: Loading animations show progress steps with checkmarks (✓), spinners (⟳), and realistic 2-3 second delays per step for authentic experience.

---

## Key Documents

- **[spec.md](./spec.md)** - Full feature specification with user stories, requirements, and success criteria
- **[gap-analysis.md](./gap-analysis.md)** - Detailed screen-by-screen comparison of mockup vs. current implementation
- **plan.md** (TODO) - Implementation plan and architecture decisions
- **tasks.md** (TODO) - Dependency-ordered task list for implementation

---

## Quick Summary

### Scope
- **19 main screens** in the quote-to-policy flow
- **6 modal dialogs** for editing and account creation
- **1 validation screen** for missing required fields
- **3 loading screens** with custom animations
- **Sticky price sidebar** with real-time premium updates
- **Signature canvas** for digital signature capture
- **Payment flow redesign** with method selection and account creation

### Priorities
- **P1**: Core quote generation flow with email collection and price sidebar (7 days)
- **P2**: Payment, signing, and account creation (11 days)
- **P3**: Visual design system updates (8 days)
- **P4**: Polish, modals, and testing (6 days)

### Timeline
**Total**: ~32 days (6-7 weeks) of development work

---

## What Needs to Change

### New Screens Required (8)
1. Screen 2: Effective Date Entry
2. Screen 3: Email Address Collection
3. Screen 4: Loading Animation #1
4. Screen 7: Add-Ons (toggle switches)
5. Screen 8: Loading Animation #2
6. Screen 10: Signing Ceremony
7. Screen 13: Payment Processing
8. Validation Screen (missing info alert)

### Major Redesigns (6)
1. Screen 1: Get Started (visual design)
2. Screen 5: Vehicle & Driver Summary (+ price sidebar + modals)
3. Screen 6: Coverage Selection (+ price sidebar + sliders)
4. Screen 9: Coverage Review (comprehensive format)
5. Screen 11: Checkout (payment method + account check)
6. Screen 14: Confirmation (What's Next section)

### New Components (5)
1. Sticky Price Sidebar
2. Loading Animation (car icon + progress bar + steps)
3. Signature Canvas
4. Screen Progress Indicator ("Screen X of 19")
5. Modal Overlay System

### New Backend Endpoints (5-7)
1. POST /api/v1/communications (save email/phone)
2. POST /api/v1/signatures (save signature)
3. POST /api/v1/user-accounts/check-email
4. POST /api/v1/user-accounts (create account)
5. POST /api/v1/lienholders (optional)

---

## Tech Stack

### Frontend
- React 18
- TypeScript 5.8+
- React Router (already in use)
- TanStack Query (already in use)
- Canary Design System (current)
- Signature library: TBD (react-signature-canvas or react-signature-pad)

### Design
- Google Fonts: Inter
- Color palette: Purple/blue gradients
- Animations: CSS keyframes + transforms

### Backend (Existing)
- NestJS
- Drizzle ORM
- Neon PostgreSQL
- OMG P&C Data Model v1.0

---

## Parallel Flow Architecture

### Route Structure
```
Existing Flow (UNCHANGED):
├── /quote/driver-info/:quoteNumber
├── /quote/additional-drivers/:quoteNumber
├── /quote/vehicles/:quoteNumber
├── /quote/vehicle-confirmation/:quoteNumber
├── /quote/coverage-selection/:quoteNumber
└── /quote/results/:quoteNumber

Tech Startup Flow (NEW):
├── /quote-v2/get-started
├── /quote-v2/effective-date/:quoteNumber
├── /quote-v2/email/:quoteNumber
├── /quote-v2/loading-prefill/:quoteNumber
├── /quote-v2/summary/:quoteNumber
├── /quote-v2/coverage/:quoteNumber
├── /quote-v2/add-ons/:quoteNumber
├── /quote-v2/loading-validation/:quoteNumber
├── /quote-v2/review/:quoteNumber
├── /quote-v2/sign/:quoteNumber
├── /quote-v2/checkout/:quoteNumber
├── /quote-v2/payment/:quoteNumber
├── /quote-v2/processing/:quoteNumber
└── /quote-v2/success/:quoteNumber
```

### Directory Structure
```
src/pages/
├── quote/              (EXISTING - NO CHANGES)
│   ├── PrimaryDriverInfo.tsx
│   ├── AdditionalDrivers.tsx
│   ├── VehiclesList.tsx
│   ├── VehicleConfirmation.tsx
│   ├── CoverageSelection.tsx
│   └── QuoteResults.tsx
│
└── quote-v2/           (NEW DIRECTORY)
    ├── GetStarted.tsx
    ├── EffectiveDate.tsx
    ├── EmailCollection.tsx
    ├── LoadingPrefill.tsx
    ├── Summary.tsx
    ├── Coverage.tsx
    ├── AddOns.tsx
    ├── LoadingValidation.tsx
    ├── Review.tsx
    ├── Sign.tsx
    ├── Checkout.tsx
    ├── Payment.tsx
    ├── Processing.tsx
    ├── Success.tsx
    └── components/
        ├── PriceSidebar.tsx
        ├── LoadingAnimation.tsx
        ├── SignatureCanvas.tsx
        ├── ScreenProgress.tsx
        ├── modals/
        │   ├── EditVehicleModal.tsx
        │   ├── EditDriverModal.tsx
        │   ├── SignatureModal.tsx
        │   └── AccountCreationModal.tsx
        └── shared/
            ├── TechStartupLayout.tsx
            └── TechStartupButton.tsx
```

### What Gets Built (All New)
- ✅ All 19 screens in `/quote-v2/*`
- ✅ All 6 modal components
- ✅ 5 new reusable components (sidebar, animations, signature, etc.)
- ✅ Tech-startup specific styling (scoped to quote-v2 components)
- ✅ New routes in App.tsx for `/quote-v2/*` namespace

### What Stays Unchanged
- ✅ All existing `/quote/*` routes
- ✅ All existing `src/pages/quote/` components
- ✅ Backend APIs (reused by both flows)
- ✅ Database schema (same entities)
- ✅ Existing Canary Design System usage

---

## User Stories

### P1: Streamlined Quote Generation with Email Collection
- Collect email early in the flow
- Show real-time pricing in sticky sidebar
- Modal-based editing for vehicles and drivers
- Smooth loading transitions with animations

### P2: Enhanced Payment & Signing Ceremony
- Professional signature capture with canvas
- Account creation during checkout
- Payment method selection (card vs. bank)
- Payment processing with status updates

### P3: Modern Visual Design & Branding
- Tech-startup aesthetic throughout
- Consistent purple/blue gradient branding
- Card-based layouts with hover effects
- Inter font typography

---

## Design Specifications

### Colors
```css
/* Primary Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 100%);

/* Brand Colors */
--primary: #667eea;
--secondary: #764ba2;
--accent: #f093fb;

/* Neutrals */
--bg-light: #f7fafc;
--border: #e2e8f0;
--text-dark: #1a202c;
--text-medium: #718096;
--text-light: #cbd5e0;
```

### Typography
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Heading Sizes */
h1: 52px / 800 weight;
h2: 36px / 700 weight;
h3: 24px / 700 weight;
h4: 18px / 600 weight;

/* Body */
body: 16px / 400 weight;
subtitle: 18px / 400 weight / #718096 color;
```

### Spacing
```css
/* Screen Padding */
screen: 60px;

/* Card Padding */
card-large: 60px;
card-medium: 32px;
card-small: 28px;

/* Gaps */
card-grid: 20px;
form-grid: 24px;
button-gap: 16px;
```

### Border Radius
```css
screen: 24px;
card: 16px;
button: 12px;
input: 12px;
badge: 20px;
```

---

## Success Criteria

1. All 19 screens match mockup design
2. Price sidebar updates within 500ms
3. Signature pad works on all major browsers
4. Users complete flow in under 8 minutes
5. 90% successful navigation without errors
6. All screens pass visual regression tests

---

## Next Steps

1. ✅ Create feature branch: `004-tech-startup-flow-redesign`
2. ✅ Write specification: `spec.md`
3. ✅ Complete gap analysis: `gap-analysis.md`
4. ⏳ Create implementation plan: `plan.md`
5. ⏳ Generate task list: `tasks.md`
6. ⏳ Begin P1 development (email collection + price sidebar)

---

## Related Work

- **Phase 3** (Quote Flow): Provides base quote generation functionality
- **Phase 4** (Policy Binding): Provides payment processing functionality
- **Phase 5** (Portal): Provides UserAccount entity
- **Mockup**: [version-4-tech-startup.html](../../mockups/version-4-tech-startup.html)

---

## Questions & Decisions

### Open Questions
1. Do we want to implement progressive auto-save of form data?

### Decisions Made
- ✅ **Parallel flow approach** - Existing `/quote/*` flow preserved unchanged
- ✅ **New namespace** - Tech-startup flow uses `/quote-v2/*` routes
- ✅ **Shared backend** - Both flows use same APIs and database
- ✅ **Tech-startup aesthetic** - Purple/blue gradients (#667eea, #764ba2, #f093fb)
- ✅ **19 screens total** - Including modals and loading screens
- ✅ **Email collection early** - Screen 3 in new flow
- ✅ **Real-time premium updates** - Sticky sidebar with live calculations
- ✅ **Canvas-based signature** - react-signature-canvas library
- ✅ **Account creation during checkout** - Integrated into payment flow
- ✅ **Independent flows** - Users can't mix routes between /quote and /quote-v2
- ✅ **Landing page flow selector** - Default to existing /quote/* flow
- ✅ **Payment method** - Credit card only (simpler for demo)
- ✅ **Lienholder information** - Optional collection (fields provided but not required)
- ✅ **Mobile price sidebar** - Fixed bottom bar with "View Details" modal on mobile (<1024px)
