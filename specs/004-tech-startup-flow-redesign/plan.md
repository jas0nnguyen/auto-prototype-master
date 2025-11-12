# Implementation Plan: Tech Startup Flow Redesign (Parallel Variation)

**Branch**: `004-tech-startup-flow-redesign` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-tech-startup-flow-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a parallel flow variation (`/quote-v2/*`) of the auto insurance quote flow with modern tech-startup aesthetic (purple/blue gradients, Inter font, card layouts) while preserving the existing `/quote/*` flow unchanged. The new flow includes 19 screens with mock service integration for realistic data population (insurance history, VIN decoder, vehicle valuation, safety ratings, MVR lookup), sticky price sidebar with real-time premium updates, signature canvas, modal-based editing, and enhanced payment/checkout experience. Shares same backend APIs and database with existing flow.

## Technical Context

**Language/Version**: TypeScript 5.8+ (React 18, Node.js 22.x)
**Primary Dependencies**:
- Frontend: React 18, React Router, TanStack Query, Canary Design System (@sureapp/canary-design-system)
- Signature: react-signature-canvas v1.0+ (TypeScript support, ~15KB gzipped)
- Backend: NestJS, Drizzle ORM (existing - reused)

**Storage**: Neon PostgreSQL (existing - shared with `/quote/*` flow)
**Testing**: Vitest + React Testing Library (existing framework)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend + backend, parallel flow variation)
**Performance Goals**:
- Price sidebar updates <500ms on coverage changes
- Loading screen animations 60fps
- Total quote flow completion <8 minutes (target: 5 minutes)
- API responses <500ms p95

**Constraints**:
- MUST NOT modify existing `/quote/*` routes or components
- MUST NOT modify global Canary Design System styles
- Mock services MUST return realistic data (not random/garbage)
- All 19 screens MUST match mockup design (purple/blue gradients, Inter font)

**Scale/Scope**:
- 19 new screen components
- 6 new modal components
- 5 new reusable components (sidebar, animations, signature, etc.)
- 14 new routes in `/quote-v2/*` namespace
- ~15 new functional requirements for mock service integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Design System First ✅ PASS

**Status**: Compliant
- All new components will use Canary Design System base components
- Tech-startup styling (purple gradients, Inter font) scoped to `/quote-v2/*` components only
- No global CSS modifications
- Component props used for styling variations

**Evidence**: FR-024 to FR-030 specify Canary component usage with tech-startup styling via props

### II. OMG Standards Compliance ✅ PASS

**Status**: Compliant
- Reuses existing OMG P&C entities (Quote, Policy, Coverage, Vehicle, Person, Party)
- New entities (Signature, potentially enhanced Communication) follow OMG patterns
- No changes to existing OMG-compliant data model
- Both flows persist to same database tables

**Evidence**: AR-008 requires same database tables; Key Entities section lists OMG-compliant structures

### III. Production-Ready Patterns ✅ PASS (with Demo Exception)

**Status**: Compliant with documented exception
- **Exception**: No authentication flow (demo application with URL-based policy access in portal)
- Error handling required (FR-053: graceful mock service failures)
- Loading states required (FR-044: visual progress indicators)
- Validation required (FR-033: email format, FR-035: signature validation, FR-038: required fields)
- Sensitive data handling (payment form with masking)
- Database transactions reused from existing flow

**Evidence**: Existing Phase 4 payment flow has production patterns; new flow extends these

**Justification**: Demo exception already approved in constitution v1.1.0 for portal access. Production migration path documented in existing Phase 5 work.

### IV. User Story-Driven Development ✅ PASS

**Status**: Compliant
- 3 prioritized user stories (P1: Quote generation, P2: Payment/signing, P3: Visual design)
- Each story independently testable
- Acceptance scenarios in Given-When-Then format
- Tasks will be organized by user story (Phase 2)

**Evidence**: spec.md has 3 user stories with P1/P2/P3 priorities and 12+ acceptance scenarios

### V. Type Safety ✅ PASS

**Status**: Compliant
- TypeScript 5.8+ strict mode (existing project setting)
- Interfaces required for all new components
- API contracts typed (reusing existing types from Phase 3)
- No `any` types except justified third-party integrations

**Evidence**: Existing codebase uses strict TypeScript; plan specifies interface requirements

### VI. Data Persistence ✅ PASS

**Status**: Compliant
- Reuses existing Quote/Policy/Coverage state transitions
- New Signature entity persists with signature_image_data
- Both flows persist to same Neon database tables (AR-008)
- State management inherited from existing flow

**Evidence**: FR-031 to FR-038 specify persistence requirements; AR-008 mandates shared database

**Overall Gate Status**: ✅ **PASS** - All principles compliant, demo exception documented

## Project Structure

### Documentation (this feature)

```
specs/004-tech-startup-flow-redesign/
├── spec.md              # Feature specification (COMPLETE)
├── gap-analysis.md      # Screen comparison (COMPLETE)
├── README.md            # Quick reference (COMPLETE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (TO BE GENERATED)
├── data-model.md        # Phase 1 output (TO BE GENERATED)
├── quickstart.md        # Phase 1 output (TO BE GENERATED)
├── contracts/           # Phase 1 output (TO BE GENERATED)
│   ├── quote-v2-api.yaml
│   ├── mock-services.yaml
│   └── signature-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Web application structure (frontend + backend)

# NEW - Tech Startup Flow Frontend
src/pages/quote-v2/           # New directory for all 19 screens
├── GetStarted.tsx            # Screen 1: Basic info collection
├── EffectiveDate.tsx         # Screen 2: Policy start date
├── EmailCollection.tsx       # Screen 3: Email + mobile phone
├── LoadingPrefill.tsx        # Screen 4: Loading with mock service calls
├── Summary.tsx               # Screen 5: Vehicle/driver cards + price sidebar
├── Coverage.tsx              # Screen 6: Coverage selection with sliders
├── AddOns.tsx                # Screen 7: Optional coverages (rental, roadside)
├── LoadingValidation.tsx     # Screen 8: MVR lookup + final premium
├── Review.tsx                # Screen 9: Comprehensive coverage review
├── Sign.tsx                  # Screen 10: Signature ceremony
├── Checkout.tsx              # Screen 11: Payment method selection
├── Payment.tsx               # Screen 12: Credit card form
├── Processing.tsx            # Screen 13: Payment processing animation
├── Success.tsx               # Screen 14: Confirmation with policy number
└── components/               # Tech-startup specific components
    ├── PriceSidebar.tsx      # Sticky sidebar with premium breakdown
    ├── LoadingAnimation.tsx  # Car icon + progress bar + steps
    ├── SignatureCanvas.tsx   # Canvas-based signature capture
    ├── ScreenProgress.tsx    # "Screen X of 19" indicator
    ├── modals/
    │   ├── EditVehicleModal.tsx       # Vehicle edit (owned)
    │   ├── EditVehicleFinancedModal.tsx # Vehicle edit (financed/leased)
    │   ├── EditDriverModal.tsx        # Driver edit (primary/additional)
    │   ├── SignatureModal.tsx         # Expanded signature pad
    │   ├── AccountCreationModal.tsx   # New user signup
    │   └── ValidationModal.tsx        # Missing required fields alert
    └── shared/
        ├── TechStartupLayout.tsx   # Gradient background + header wrapper
        └── TechStartupButton.tsx   # Gradient button with hover effects

# EXISTING - Preserved Unchanged
src/pages/quote/              # Original progressive flow (NO CHANGES)
├── PrimaryDriverInfo.tsx
├── AdditionalDrivers.tsx
├── VehiclesList.tsx
├── VehicleConfirmation.tsx
├── CoverageSelection.tsx
└── QuoteResults.tsx

# SHARED - Used by Both Flows
src/services/
├── quote-api.ts              # Quote API client (EXTENDED for quote-v2)
└── mock-api.ts               # Mock service client (EXISTING - reused)

src/hooks/
├── useQuote.ts               # TanStack Query hooks (EXTENDED for quote-v2)
└── useMockServices.ts        # Mock service hooks (NEW for loading screens)

# Backend - EXISTING (Shared by Both Flows)
backend/src/
├── api/routes/
│   ├── quotes.controller.ts          # EXISTING - reused
│   ├── mock-services.controller.ts   # EXISTING - reused
│   └── signatures.controller.ts      # NEW - signature storage
├── services/
│   ├── quote-service/                # EXISTING - reused
│   ├── rating-engine/                # EXISTING - reused
│   ├── mock-services/                # EXISTING - reused
│   │   ├── vin-decoder.service.ts
│   │   ├── vehicle-value.service.ts
│   │   ├── insurance-history.service.ts
│   │   ├── driver-record.service.ts
│   │   └── safety-rating.service.ts
│   └── signature-service/            # NEW - signature CRUD
└── entities/                         # EXISTING - shared OMG entities
    └── signature/                    # NEW - signature entity

# Database - EXISTING (Shared by Both Flows)
database/schema/
└── signature.schema.ts               # NEW - signature table

tests/
├── quote-v2/                         # NEW - tests for new flow
│   ├── unit/
│   │   ├── components/
│   │   └── hooks/
│   └── integration/
│       └── quote-v2-flow.spec.ts
└── quote/                            # EXISTING - unchanged
```

**Structure Decision**: Web application with parallel frontend flows (`/quote/*` and `/quote-v2/*`) sharing the same backend APIs and database. New directory `src/pages/quote-v2/` contains all 19 screens with scoped components. Existing `src/pages/quote/` preserved entirely unchanged. Backend extended minimally (signature service only) with all other services reused.

## Complexity Tracking

*No constitution violations - this section intentionally left empty*

All constitutional principles are satisfied:
- Design System First: Canary components with scoped styling ✅
- OMG Standards: Reuses existing OMG-compliant entities ✅
- Production Patterns: Follows existing patterns with documented demo exception ✅
- User Story-Driven: 3 prioritized stories with acceptance criteria ✅
- Type Safety: TypeScript strict mode throughout ✅
- Data Persistence: Shares existing database with proper state management ✅

## Phase 0: Research & Decisions ✅ COMPLETE

### Research Topics

All 7 technical unknowns have been researched and decisions documented in [research.md](./research.md):

1. **Signature Canvas Library Selection** ✅
   - **Decision**: react-signature-canvas
   - **Rationale**: Best TypeScript support, active maintenance, clean API, lightweight (~15KB)

2. **Inter Font Loading Strategy** ✅
   - **Decision**: Google Fonts CDN with scoped CSS
   - **Rationale**: Zero config, automatic optimization, easy font variant management

3. **Mock Service Response Patterns** ✅
   - **Decision**: Realistic scenario-based responses with edge cases
   - **Rationale**: Demonstrates real-world patterns, enables thorough testing

4. **Loading Animation Performance** ✅
   - **Decision**: CSS transforms + GPU acceleration
   - **Rationale**: 60fps on mobile, no JavaScript overhead, accessibility support

5. **Price Sidebar State Management** ✅
   - **Decision**: TanStack Query cache + React Context
   - **Rationale**: <500ms updates, automatic caching, survives refresh

6. **Modal Accessibility Patterns** ✅
   - **Decision**: Canary Modal + ARIA + react-focus-lock
   - **Rationale**: WCAG 2.1 AA compliant, robust focus management

7. **Route Protection Strategy** ✅
   - **Decision**: Session storage + RouteGuard component
   - **Rationale**: Prevents mixing, per-tab isolation, simple implementation

### Dependencies Analysis

**Existing Dependencies (Verified)**:
- ✅ React 18 - Core framework
- ✅ React Router - Routing (existing routes in /quote/*)
- ✅ TanStack Query - Data fetching (existing hooks in useQuote.ts)
- ✅ Canary Design System - UI components (existing Button, Card, Input, Select, etc.)
- ✅ NestJS - Backend framework (existing quote service, rating engine)
- ✅ Drizzle ORM - Database ORM (existing schemas)
- ✅ Neon PostgreSQL - Database (existing connection)
- ✅ Vitest + React Testing Library - Testing framework

**New Dependencies (Added)** ✅:
- react-signature-canvas (signature capture)
- @types/react-signature-canvas (TypeScript definitions)
- react-focus-lock (modal accessibility)
- Inter font via Google Fonts CDN (typography)

**No Breaking Changes**: All new dependencies added incrementally without affecting existing `/quote/*` flow.

## Phase 1: Design & Contracts ✅ COMPLETE

### Data Model Extensions

**New Entities**:

1. **Signature** (NEW)
   ```typescript
   interface Signature {
     signature_id: UUID;
     quote_id: UUID;  // FK to Quote
     party_id: UUID;  // FK to Party (signer)
     signature_image_data: string; // Base64 encoded PNG/JPEG
     signature_format: 'PNG' | 'JPEG';
     signature_date: Date;
     ip_address: string;
     user_agent: string;
     created_at: Date;
   }
   ```

2. **Communication** (EXISTING - minor extension)
   - Already exists from Phase 3
   - Supports EMAIL and MOBILE communication types
   - No schema changes needed

3. **UserAccount** (EXISTING)
   - Already exists from Phase 5 (portal)
   - Reused for account creation during checkout
   - No schema changes needed

**Existing Entities (Reused)**:
- Quote, Policy, Agreement, Coverage, CoveragePart (Phase 3)
- Vehicle, InsurableObject (Phase 3)
- Party, Person, PartyRole (Phase 3)
- Payment, PaymentMethod (Phase 4)
- All other OMG P&C entities unchanged

### API Contracts

**New Endpoints**:

1. **Signature API** (NEW)
   ```
   POST /api/v1/signatures
   GET  /api/v1/signatures/:quoteId
   ```

2. **Communication Endpoint** (EXISTING - verify usage)
   ```
   POST /api/v1/communications (may already exist)
   ```

**Existing Endpoints (Reused)**:
- `POST /api/v1/quotes` - Create quote
- `GET /api/v1/quotes/:id` - Get quote
- `PUT /api/v1/quotes/:id/coverage` - Update coverage
- `POST /api/v1/quotes/:id/calculate` - Recalculate premium
- `POST /api/v1/mock/*` - All mock service endpoints (VIN decoder, vehicle value, insurance history, MVR, safety ratings)
- `POST /api/v1/policies` - Bind policy (Phase 4)
- `POST /api/v1/payments` - Process payment (Phase 4)

**Contract Files** (Phase 1 Output):
- `contracts/quote-v2-api.yaml` - New signature endpoints
- `contracts/mock-services.yaml` - Document existing mock endpoints with response samples
- `contracts/signature-api.yaml` - Signature CRUD operations

### Quickstart Guide ✅

**Phase 1 Output**: [quickstart.md](./quickstart.md) completed:
1. ✅ Developer onboarding for quote-v2 flow
2. ✅ How to run both flows side-by-side
3. ✅ Environment setup (dependencies, database migration)
4. ✅ Testing strategy (unit tests, integration tests, mock service tests)
5. ✅ Mock service usage guide with code examples
6. ✅ Canary Design System component reference for tech-startup styling
7. ✅ Signature canvas integration guide with implementation patterns
8. ✅ Debugging tips (React DevTools, TanStack Query DevTools, common issues)

**Additional Phase 1 Outputs** ✅:
- [research.md](./research.md) - All 7 research topics with decisions and implementation patterns
- [data-model.md](./data-model.md) - Signature entity schema, Vehicle extension, OMG compliance
- [contracts/signature-api.yaml](./contracts/signature-api.yaml) - Signature API OpenAPI spec
- [contracts/quote-v2-extensions.yaml](./contracts/quote-v2-extensions.yaml) - Communication and UserAccount API extensions

## Next Steps

**Phase 0 & 1 Complete** ✅ - Ready for Task Generation

1. **Run context update script**:
   ```bash
   .specify/scripts/bash/update-agent-context.sh claude
   ```

2. **Generate task list with `/speckit.tasks` command**:
   - Creates dependency-ordered task list organized by user story
   - Identifies foundational infrastructure tasks (Phase 2)
   - Groups implementation by priority (P1, P2, P3)

3. **Begin Implementation** (`/speckit.implement`):
   - Phase 2: Foundational infrastructure (routes, context, base components)
   - P1: Quote generation with email collection and price sidebar (7 days)
   - P2: Payment, signing, and account creation (11 days)
   - P3: Visual design system updates (8 days)

4. **Testing**:
   - Unit tests for all new components
   - Integration test for full quote-v2 flow
   - Visual regression tests against mockup
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)

5. **Documentation**:
   - Update learnings document with implementation insights
   - Document any deviations from plan
   - Create feature-specific learnings for Phase 2

**Estimated Timeline**:
- Phase 0 (Research): ✅ Complete (1 day)
- Phase 1 (Design/Contracts): ✅ Complete (1 day)
- Phase 2 (Implementation): ~26-32 days
  - Foundational: 3-4 days
  - P1 tasks: 7 days
  - P2 tasks: 11 days
  - P3 tasks: 8 days
  - Polish/Testing: 6 days
- **Total**: ~6-7 weeks

**Current Status**: Ready to generate tasks with `/speckit.tasks`
