# Implementation Plan: Auto Insurance Purchase Flow

**Branch**: `001-auto-insurance-flow` | **Date**: 2025-10-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auto-insurance-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an OMG Property & Casualty Data Model v1.0 compliant auto insurance purchase platform that enables quote generation, policy binding, and self-service portal access. The system uses React 18 + TypeScript + Canary Design System for the frontend, NestJS + Drizzle ORM for the backend API, and Neon PostgreSQL for data persistence. Portal access is URL-based via policy number (no authentication) to simplify the demo. All external integrations (payment processing, email delivery, vehicle data services) are simulated with production-like behavior.

## Technical Context

**Language/Version**: TypeScript 5.8+ (frontend and backend)
**Primary Dependencies**:
- Frontend: React 18.2, Canary Design System 3.12+, React Router 7.6, Vite 7.0
- Backend: NestJS (Node.js + TypeScript)
- Database: Neon PostgreSQL (serverless), Drizzle ORM
- Authentication: None (demo app uses URL-based policy access via policy number)

**Storage**: Neon PostgreSQL (OMG P&C data model with 27 entities, UUID primary keys, temporal tracking)

**Testing**:
- Frontend: Vitest + React Testing Library
- Backend: Vitest + @nestjs/testing
- E2E: Playwright (optional for demo)

**Target Platform**: Web application (modern browsers - Chrome, Firefox, Safari, Edge latest 2 versions)

**Project Type**: Web (fullstack - React frontend + API backend + PostgreSQL database)

**Performance Goals**:
- Quote calculation: <5 seconds (95th percentile)
- Premium recalculation: <2 seconds (real-time updates)
- Portal page load: <3 seconds (95th percentile)
- API response time: <500ms (95th percentile for database queries)
- Mock payment processing: <3 seconds (99th percentile)
- Simulated vehicle data lookup: <1 second (95th percentile)

**Constraints**:
- OMG P&C Data Model v1.0 strict compliance (entity naming, relationships, temporal tracking)
- Demo mode: No real external API calls (payment, email, vehicle data must be simulated)
- Demo mode: No authentication - policy access via URL with policy number
- Production patterns: Despite being a demo, code must follow production architecture standards (but not auth)
- Database: Must support 100+ concurrent users without degradation
- Premium calculation: Must produce market-realistic rates ($800-$3000 for standard risks)

**Scale/Scope**:
- 3 primary user flows (quote, bind, portal)
- 68 functional requirements
- 27 OMG-compliant entities with full relationships
- 8-12 main screens (quote form, payment, portal dashboard, billing history, claims filing)
- ~100 concurrent users target
- Demo application (not production traffic)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED - All principles satisfied by research and planned architecture

**Constitution Version**: 1.1.0 (Ratified: 2025-10-17, Amended: 2025-10-18)

### Principle Compliance

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| **I. Design System First** | ✅ PASS | Frontend uses Canary Design System 3.12+ exclusively. No custom CSS exceptions planned. |
| **II. OMG Standards Compliance** | ✅ PASS | All 27 entities follow OMG P&C Data Model v1.0. Data model documented in data-model.md with full compliance verification. |
| **III. Production-Ready Patterns** | ✅ PASS (Auth Waived) | No authentication for demo (policy access via URL). Input validation, error handling, mock services mirroring production patterns, transaction management all implemented. |
| **IV. User Story-Driven Development** | ✅ PASS | Spec.md contains 3 prioritized user stories (P1, P2, P3) with Given-When-Then acceptance scenarios. Tasks will be organized by story. |
| **V. Type Safety** | ✅ PASS | TypeScript 5.8+ across full stack. Drizzle ORM provides compile-time type safety. NestJS uses decorators for DTOs. No `any` types in architecture. |
| **VI. Data Persistence** | ✅ PASS | Neon PostgreSQL for all business data. State transitions documented: Quote (draft→active→converted→expired), Policy (pending→active→cancelled→expired), Claim (submitted→under_review→approved/denied→closed). |

### Development Standards Compliance

| Standard | Status | Compliance Notes |
|----------|--------|------------------|
| **Simulated Integrations** | ✅ PASS | Research.md documents mock payment gateway, VIN decoder, vehicle valuation, email preview with realistic latency (LogNormal distribution) and error scenarios. |
| **Code Organization** | ✅ PASS | Plan.md defines frontend (`src/`), backend (`backend/`), database (`database/`) structure with clear separation. |
| **Documentation** | ✅ PASS | Spec.md with user stories ✓, plan.md with structure ✓, research.md ✓, data-model.md ✓. Tasks.md and quickstart.md pending (Phase 2). |

### Quality Gates Status

**Pre-Implementation Gates**:
- [x] Feature spec approved with prioritized user stories (spec.md completed)
- [x] Implementation plan defines structure and constitution compliance (this document)
- [ ] Foundational infrastructure tasks identified (pending tasks.md generation)
- [x] Constitution violations justified (none - all principles satisfied)

**No Violations to Justify**: This architecture fully aligns with all constitutional principles. No complexity tracking entries required.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/                          # Backend API service (to be created)
├── src/
│   ├── entities/                 # OMG P&C entity definitions (27 entities)
│   │   ├── party/                # Party, Person, Communication Identity
│   │   ├── policy/               # Policy, Agreement, Coverage, Policy Coverage Detail
│   │   ├── vehicle/              # Vehicle, Insurable Object
│   │   ├── rating/               # Rating Factor, Rating Table, Discount, Surcharge
│   │   ├── claim/                # Claim, Claim Party Role, Claim Event
│   │   └── account/              # Account, User Account, Payment
│   ├── services/                 # Business logic services
│   │   ├── quote-service/        # Quote generation and management
│   │   ├── rating-engine/        # Premium calculation engine
│   │   ├── policy-service/       # Policy binding and lifecycle
│   │   ├── account-service/      # User account creation and authentication
│   │   ├── portal-service/       # Portal data access
│   │   └── mock-services/        # Simulated external integrations
│   │       ├── payment-gateway/  # Mock payment processing
│   │       ├── vehicle-data/     # Mock VIN decoder, valuation, safety ratings
│   │       └── email-service/    # Mock email delivery
│   ├── api/                      # API routes and controllers
│   │   ├── routes/
│   │   │   ├── quotes.ts
│   │   │   ├── policies.ts
│   │   │   ├── portal.ts
│   │   │   ├── claims.ts
│   │   │   └── auth.ts
│   │   └── middleware/           # Auth, validation, error handling
│   ├── database/                 # Database layer
│   │   ├── migrations/           # SQL migrations for OMG schema
│   │   ├── seeds/                # Mock data for vehicle lookup, rating tables
│   │   └── repositories/         # Data access layer
│   └── utils/                    # Shared utilities
└── tests/
    ├── unit/                     # Service and entity tests
    ├── integration/              # API endpoint tests
    └── e2e/                      # Full workflow tests

src/                              # Frontend React application (existing)
├── pages/                        # Page components (existing structure)
│   ├── quote/                    # Quote generation flow
│   │   ├── VehicleInfo.tsx
│   │   ├── DriverInfo.tsx
│   │   ├── CoverageSelection.tsx
│   │   └── QuoteResults.tsx
│   ├── binding/                  # Policy binding and payment
│   │   ├── PaymentInfo.tsx
│   │   ├── ReviewBind.tsx
│   │   └── Confirmation.tsx
│   ├── portal/                   # Self-service portal
│   │   ├── Dashboard.tsx
│   │   ├── PolicyDetails.tsx
│   │   ├── BillingHistory.tsx
│   │   ├── ClaimsList.tsx
│   │   └── FileClaim.tsx
│   # Note: No authentication pages - portal access is URL-based via policy number
├── components/                   # Shared React components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── insurance/                # Domain-specific components
│       ├── CoverageCard.tsx
│       ├── PremiumBreakdown.tsx
│       └── VehicleCard.tsx
├── services/                     # Frontend API client services
│   ├── api-client.ts             # HTTP client configuration
│   ├── quote-service.ts          # Quote API calls
│   ├── policy-service.ts         # Policy API calls
│   └── portal-service.ts         # Portal API calls (URL-based access)
├── hooks/                        # Custom React hooks
│   ├── useQuote.ts
│   ├── usePolicy.ts
│   └── usePortal.ts              # Portal data access
├── types/                        # TypeScript type definitions
│   ├── omg-entities.ts           # OMG entity types
│   ├── api-types.ts              # API request/response types
│   └── form-types.ts             # Form data types
└── utils/                        # Frontend utilities
    ├── validators.ts             # Form validation
    ├── formatters.ts             # Data formatting
    └── constants.ts              # Constants and enums

database/                         # Database schema and migrations
├── schema/
│   └── omg-p&c-model.sql         # Full OMG P&C DDL (from Product Requirements)
└── seeds/
    ├── rating-tables.sql         # Rating factor lookup tables
    ├── mock-vehicles.sql         # Sample vehicle data
    └── coverage-products.sql     # Product and coverage definitions
```

**Structure Decision**: Web application with separated frontend (React) and backend (API + database). The existing `src/` directory will house the React frontend, and a new `backend/` directory will contain the API service. This separation provides:
1. Clear separation of concerns between presentation and business logic
2. Independent scaling of frontend and backend
3. Easier testing with isolated layers
4. Support for OMG data model complexity in dedicated backend service
5. Flexibility to add future API consumers (mobile apps, integrations)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: ✅ NO VIOLATIONS - All constitutional principles satisfied per v1.1.0 (Principle III auth waiver approved for demo mode). Production migration path documented in quickstart.md.

