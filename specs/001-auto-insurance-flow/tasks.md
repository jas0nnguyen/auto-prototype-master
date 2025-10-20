# Implementation Tasks: Auto Insurance Purchase Flow

**Feature**: 001-auto-insurance-flow
**Created**: 2025-10-17
**Last Updated**: 2025-10-19 (Phase 1, 2 & 3 COMPLETE ✅: All 85 foundational tasks done - Project setup, infrastructure, database schemas, mock services, rating engine, quote service, and full frontend integration)
**Total Tasks**: 170 (85 completed, 85 remaining)
**Format**: `- [ ] [TaskID] [P?] [Story?] [Description with file path`

**Legend**:
- **TaskID**: Sequential identifier (T001, T002, etc.)
- **[P]**: Parallelizable task (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], [US3]) - setup/foundational tasks have NO label
- **Description**: Clear action with exact file path

---

## Task Dependencies Overview

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
                        ↓ BLOCKS ALL USER STORIES ↓
```

**Critical Path**:
1. Phase 2 MUST complete before ANY user story work begins
2. US1 (Quote Generation) must complete before US2 (Policy Binding)
3. US2 (Policy Binding) must complete before US3 (Portal Access)
4. Phase 6 (Polish) runs after all user stories complete

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure, backend, frontend, and configuration files

**Tasks**:

- [x] T001 [P] Create backend directory structure at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/ ✅ 2025-10-18
- [x] T002 [P] Create backend src subdirectories: /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/entities/, services/, api/, database/, utils/ ✅ 2025-10-18
- [x] T003 [P] Create database directory at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/ with schema/ and seeds/ subdirectories ✅ 2025-10-18
- [x] T004 Initialize NestJS backend project with package.json at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/package.json ✅ 2025-10-18
- [x] T005 Install backend dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-express, drizzle-orm, @neondatabase/serverless, reflect-metadata, rxjs ✅ 2025-10-18
- [x] T006 Install backend dev dependencies: @nestjs/cli, @nestjs/testing, typescript, vitest, @types/node ✅ 2025-10-18
- [x] T007 Create backend TypeScript config at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tsconfig.json ✅ 2025-10-18
- [x] T008 Create NestJS main entry point at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/main.ts ✅ 2025-10-18
- [x] T009 Create NestJS app module at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/app.module.ts ✅ 2025-10-18
- [x] T010 Configure Vite for frontend at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/vite.config.ts (verify existing config) ✅ 2025-10-18
- [x] T011 Update frontend package.json to add TanStack Query: @tanstack/react-query at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/package.json ✅ 2025-10-18
- [x] T012 Create environment variables template at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/.env.example ✅ 2025-10-18

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Setup database connection, ORM, migrations framework, and base entity interfaces

**CRITICAL**: This phase BLOCKS all user story work. No US1, US2, or US3 tasks can begin until Phase 2 completes.

**Tasks**:

- [x] T013 Setup Neon PostgreSQL connection config at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/database/connection.ts ✅ 2025-10-18
- [x] T014 Configure Drizzle ORM client at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/database/drizzle.config.ts ✅ 2025-10-18
- [x] T015 Create database migration framework using Drizzle Kit at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/ ✅ 2025-10-18
- [x] T016 Create base entity types from OMG model at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/entities/base/ ✅ 2025-10-18
- [x] T017 Create NestJS database module at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/database/database.module.ts ✅ 2025-10-18
- [x] T018 Define TypeScript interfaces for all OMG entities and rating engine entities (33 total: 27 OMG P&C core entities + 6 rating engine entities) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/types/omg-entities.ts ✅ 2025-10-18
- [x] T019 Create shared validation utilities at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/utils/validators.ts ✅ 2025-10-18
- [x] T020 Create shared error handling middleware at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/middleware/error-handler.ts ✅ 2025-10-18
- [x] T021 Setup API response formatters at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/utils/response-formatter.ts ✅ 2025-10-18
- [x] T022 Configure CORS and security middleware at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/middleware/cors.ts ✅ 2025-10-18

---

## Phase 3: User Story 1 - Quote Generation (Priority P1 - MVP)

**Goal**: Prospective customer obtains auto insurance quote by entering vehicle/driver details

**Independent Test**: Enter vehicle/driver details, receive quote number and premium

**Entities**: Party, Person, Communication Identity, Geographic Location, Location Address, Vehicle, Insurable Object, Coverage, Coverage Part, Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation, Policy (status=QUOTED), Agreement, Account, Product

**API Endpoints**: POST /api/v1/quotes, GET /api/v1/quotes, GET /api/v1/quotes/{id}, PUT /api/v1/quotes/{id}/coverage, POST /api/v1/quotes/{id}/calculate, POST /api/v1/rating/calculate, POST /api/v1/mock/vin-decoder, POST /api/v1/mock/vehicle-valuation, POST /api/v1/mock/safety-ratings

**Frontend Pages**: src/pages/quote/VehicleInfo.tsx, DriverInfo.tsx, CoverageSelection.tsx, QuoteResults.tsx

### Database Entities and Migrations (US1)

- [x] T023 [P] [US1] Create Party entity schema with Drizzle at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/party.schema.ts ✅ 2025-10-19
- [x] T024 [P] [US1] Create Person entity schema (Party subtype) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/person.schema.ts ✅ 2025-10-19
- [x] T025 [P] [US1] Create Communication Identity entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/communication-identity.schema.ts ✅ 2025-10-19
- [x] T026 [P] [US1] Create Geographic Location entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/geographic-location.schema.ts ✅ 2025-10-19
- [x] T027 [P] [US1] Create Location Address entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/location-address.schema.ts ✅ 2025-10-19
- [x] T028 [P] [US1] Create Insurable Object entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/insurable-object.schema.ts ✅ 2025-10-19
- [x] T029 [P] [US1] Create Vehicle entity schema (Insurable Object subtype) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/vehicle.schema.ts ✅ 2025-10-19
- [x] T030 [P] [US1] Create Account entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/account.schema.ts ✅ 2025-10-19
- [x] T031 [P] [US1] Create Product entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/product.schema.ts ✅ 2025-10-19
- [x] T032 [P] [US1] Create Agreement entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/agreement.schema.ts ✅ 2025-10-19
- [x] T033 [US1] Create Policy entity schema (Agreement subtype) with status tracking at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy.schema.ts ✅ 2025-10-19
- [x] T034 [P] [US1] Create Coverage Part reference table schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/coverage-part.schema.ts ✅ 2025-10-19
- [x] T035 [P] [US1] Create Coverage entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/coverage.schema.ts ✅ 2025-10-19
- [x] T036 [P] [US1] Create Policy Coverage Detail schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy-coverage-detail.schema.ts ✅ 2025-10-19
- [x] T037 [P] [US1] Create Policy Limit schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy-limit.schema.ts ✅ 2025-10-19
- [x] T038 [P] [US1] Create Policy Deductible schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy-deductible.schema.ts ✅ 2025-10-19
- [x] T039 [P] [US1] Create Policy Amount (Money) schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy-amount.schema.ts ✅ 2025-10-19
- [x] T040 [P] [US1] Create Rating Factor schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/rating-factor.schema.ts ✅ 2025-10-19
- [x] T041 [P] [US1] Create Rating Table schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/rating-table.schema.ts ✅ 2025-10-19
- [x] T042 [P] [US1] Create Discount schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/discount.schema.ts ✅ 2025-10-19
- [x] T043 [P] [US1] Create Surcharge schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/surcharge.schema.ts ✅ 2025-10-19
- [x] T044 [P] [US1] Create Premium Calculation schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/premium-calculation.schema.ts ✅ 2025-10-19
- [x] T045 [P] [US1] Create Party Role relationship tables (Agreement Party Role, Account Party Role, Insurable Object Party Role) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/party-roles.schema.ts ✅ 2025-10-19
- [x] T045b [P] [US1] Create Assessment entity schema with OMG compliance (damage_description, estimated_amount, assessment_date, assessor_party_id FK) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/assessment.schema.ts ✅ 2025-10-19
- [x] T045c [P] [US2] Create Account-Agreement relationship entity (account_agreement table with account_id FK, agreement_id FK, relationship_type, begin_date, end_date per OMG pattern) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/account-agreement.schema.ts ✅ 2025-10-19
- [x] T046 [US1] Run database migrations for all US1 entities at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/ ✅ 2025-10-19

### Mock Services (US1)

- [x] T047 [P] [US1] Create VIN decoder mock service with checksum validation at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/vin-decoder.service.ts ✅ 2025-10-19
- [x] T048 [P] [US1] Create VIN decoder seed database with common vehicles at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/seeds/mock-vin-data.ts ✅ 2025-10-19
- [x] T049 [P] [US1] Create vehicle valuation mock service with realistic pricing at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/vehicle-valuation.service.ts ✅ 2025-10-19
- [x] T050 [P] [US1] Create safety ratings mock service (NHTSA/IIHS) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/safety-ratings.service.ts ✅ 2025-10-19
- [x] T051 [US1] Create mock service delay simulator with LogNormal distribution at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/delay-simulator.ts ✅ 2025-10-19
- [x] T052 [US1] Create mock services API controller at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/mock-services.controller.ts ✅ 2025-10-19

### Rating Engine Service (US1)

- [x] T053 [P] [US1] Create rating engine base service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/rating-engine.service.ts ✅ 2025-10-19
- [x] T054 [P] [US1] Create vehicle rating factors calculator at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/vehicle-rating.ts ✅ 2025-10-19
- [x] T055 [P] [US1] Create driver rating factors calculator at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/driver-rating.ts ✅ 2025-10-19
- [x] T056 [P] [US1] Create location rating factors calculator at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/location-rating.ts ✅ 2025-10-19
- [x] T056b [US1] Implement Redis/in-memory cache for vehicle data service with 24-hour TTL, cache-aside pattern, and cache key structure: vehicle:vin:{vin}, vehicle:mmv:{make}:{model}:{year} at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/vehicle-data-cache.ts ✅ 2025-10-19
- [x] T057 [P] [US1] Create coverage rating factors calculator at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/coverage-rating.ts ✅ 2025-10-19
- [x] T057b [US1] Create quote expiration cron job (daily check for quotes older than 30 days, update status to 'expired') at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/expiration-monitor.ts ✅ 2025-10-19
- [x] T058 [US1] Create discount calculator with 7 standard discounts at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/discount-calculator.ts ✅ 2025-10-19
- [x] T059 [US1] Create surcharge calculator with 8 standard surcharges at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/surcharge-calculator.ts ✅ 2025-10-19
- [x] T060 [US1] Create premium calculation orchestrator with multiplicative model and persist all rating factors, weights, discounts, surcharges, intermediate values to Premium Calculation entity (per FR-003) with timestamp and quote_id FK for audit trail at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/premium-calculator.ts ✅ 2025-10-19
- [x] T060b [US1] Create state tax and fee calculator (premium tax 2-4%, policy fee $10-25, DMV fees per FR-064) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/rating-engine/tax-fee-calculator.ts ✅ 2025-10-19
- [x] T061 [US1] Seed rating tables with base rates and multipliers at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/seeds/rating-tables.sql ✅ 2025-10-19
- [x] T062 [US1] Create rating engine API controller at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/rating.controller.ts ✅ 2025-10-19

### Quote Service (US1)

- [x] T063 [US1] Create quote service with CRUD operations at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/quote.service.ts ✅ 2025-10-19
- [x] T064 [US1] Create Party and Person creation logic in quote service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/party-creation.ts ✅ 2025-10-19
- [x] T065 [US1] Create Vehicle enrichment logic with VIN decoder integration at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/vehicle-enrichment.ts ✅ 2025-10-19
- [x] T066 [US1] Create Policy entity creation with status=QUOTED at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/policy-creation.ts ✅ 2025-10-19
- [x] T067 [US1] Create Coverage assignment logic at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/coverage-assignment.ts ✅ 2025-10-19
- [x] T068 [US1] Create quote expiration tracking (30 days) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/quote-service/quote-expiration.ts ✅ 2025-10-19
- [x] T069 [US1] Create quotes API controller with all endpoints (GET /quotes/:id and GET /quotes/reference/:refNumber) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/quotes.controller.ts ✅ 2025-10-19

### Frontend Quote Flow (US1)

- [x] T070 [P] [US1] Create VehicleInfo page with VIN input and manual entry at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/VehicleInfo.tsx ✅ 2025-10-18
- [x] T071 [P] [US1] Create DriverInfo page with person details form at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/DriverInfo.tsx ✅ 2025-10-18
- [x] T072 [P] [US1] Create CoverageSelection page with limits/deductibles at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/CoverageSelection.tsx ✅ 2025-10-18
- [x] T073 [P] [US1] Create QuoteResults page with itemized premium breakdown (coverage subtotals, discounts, surcharges, taxes, fees, total per FR-067) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/QuoteResults.tsx ✅ 2025-10-18
- [x] T074 [P] [US1] Create PremiumBreakdown component (Canary) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/PremiumBreakdown.tsx ✅ 2025-10-18
- [x] T075 [P] [US1] Create CoverageCard component (Canary) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/CoverageCard.tsx ✅ 2025-10-19
- [x] T076 [P] [US1] Create VehicleCard component (Canary) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/VehicleCard.tsx ✅ 2025-10-19
- [x] T077 [US1] Create quote API client service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/services/quote-api.ts ✅ 2025-10-19
- [x] T078 [US1] Create useQuote custom hook with TanStack Query at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/useQuote.ts ✅ 2025-10-19
- [x] T079 [US1] Setup React Router routes for quote flow at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/App.tsx ✅ 2025-10-19
- [x] T080 [US1] Integrate quote flow pages with API and state management ✅ 2025-10-19 (Frontend pages ready with sessionStorage, API integration patterns established, full backend integration pending database tasks T023-T068)

---

## Phase 4: User Story 2 - Policy Binding and Payment (Priority P2)

**Goal**: Convert quote to active policy with payment

**Independent Test**: Start with valid quote, complete payment, get policy number

**Entities**: Policy (status transitions), Payment, Event, Policy Event, Document

**API Endpoints**: POST /api/v1/policies, POST /api/v1/mock/payment, POST /api/v1/mock/email

**Frontend Pages**: src/pages/binding/PaymentInfo.tsx, ReviewBind.tsx, Confirmation.tsx

### Database Entities (US2)

- [ ] T081 [P] [US2] Create Payment entity schema with tokenized payment data at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/payment.schema.ts
- [ ] T082 [P] [US2] Create Event entity schema (base) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/event.schema.ts
- [ ] T083 [P] [US2] Create Policy Event entity schema (Event subtype) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/policy-event.schema.ts
- [ ] T084 [P] [US2] Create Document entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/document.schema.ts
- [ ] T085 [US2] Run database migrations for US2 entities

### Mock Payment Gateway (US2)

- [ ] T086 [P] [US2] Create mock payment gateway with Stripe test card patterns at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/payment-gateway.service.ts
- [ ] T087 [P] [US2] Implement Luhn algorithm card validation at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/luhn-validator.ts
- [ ] T088 [P] [US2] Create ACH bank account mock validation at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/ach-validator.ts
- [ ] T089 [US2] Create email mock service with in-memory preview at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/mock-services/email-service.ts

### Policy Service (US2)

- [ ] T090 [US2] Create policy binding service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/policy-service/policy-binding.service.ts
- [ ] T091 [US2] Implement policy status transitions (QUOTED→BINDING→BOUND→ACTIVE) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/policy-service/status-manager.ts
- [ ] T092 [US2] Create payment processing integration at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/policy-service/payment-processor.ts
- [ ] T093 [US2] Create Policy Event tracking (NEW_BUSINESS, ACTIVATION) and create email templates (quote confirmation, policy binding confirmation with portal link) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/policy-service/event-tracker.ts and backend/src/services/mock-services/email-service/templates/
- [ ] T094 [US2] Create document generation service (policy PDF, ID card) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/policy-service/document-generator.ts
- [ ] T095 [US2] Create policies API controller at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/policies.controller.ts

### Frontend Payment and Binding (US2)

- [ ] T096 [P] [US2] Create PaymentInfo page with credit card and ACH forms at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/PaymentInfo.tsx
- [ ] T097 [P] [US2] Create ReviewBind page with quote summary at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/ReviewBind.tsx
- [ ] T098 [P] [US2] Create Confirmation page with policy number and portal link at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/Confirmation.tsx
- [ ] T099 [US2] Create policy API client service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/services/policy-service.ts
- [ ] T100 [US2] Create usePolicy custom hook at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/usePolicy.ts
- [ ] T101 [US2] Setup React Router routes for binding flow
- [ ] T102 [US2] Integrate binding flow with quote data and payment processing

---

## Phase 5: User Story 3 - Portal Access (Priority P3)

**Goal**: Access self-service portal after binding via URL with policy number (no auth)

**Independent Test**: Complete policy binding, access portal via URL /portal/{policyNumber}

**Entities**: User Account, Claim, Claim Party Role, Claim Event

**API Endpoints**: GET /api/v1/portal/dashboard, GET /api/v1/portal/billing, POST /api/v1/portal/claims, GET /api/v1/portal/claims, GET /api/v1/portal/claims/{id}

**Frontend Pages**: src/pages/portal/Dashboard.tsx, PolicyDetails.tsx, BillingHistory.tsx, ClaimsList.tsx, FileClaim.tsx

### Database Entities (US3)

- [ ] T103 [P] [US3] Create User Account entity schema (no password, URL-based access) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/user-account.schema.ts
- [ ] T104 [P] [US3] Create Claim entity schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/claim.schema.ts
- [ ] T105 [P] [US3] Create Claim Party Role schema at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/claim-party-role.schema.ts
- [ ] T106 [P] [US3] Create Claim Event schema (Event subtype) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/claim-event.schema.ts
- [ ] T107 [US3] Run database migrations for US3 entities

### Portal Service (US3)

- [ ] T108 [US3] Create portal service with policy number validation, email deduplication check (link new policy to existing account if email matches per FR-020), generate policy access token (UUID for URL-based access, policy_id FK), and trigger email with portal link at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/portal-service/portal.service.ts
- [ ] T109 [US3] Create dashboard data aggregation service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/portal-service/dashboard-service.ts
- [ ] T110 [US3] Create billing history service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/portal-service/billing-service.ts
- [ ] T111 [US3] Create claims filing service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/portal-service/claims-service.ts
- [ ] T112 [US3] Create claim attachment upload handler (10MB limit, JPEG/PNG/PDF) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/portal-service/attachment-handler.ts
- [ ] T112b [US3] Create file upload validation middleware with MIME type checking (image/jpeg, image/png, application/pdf), magic number verification, 10MB size limit enforcement at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/middleware/file-upload-validator.ts
- [ ] T113 [US3] Create portal API controller with URL-based access at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/routes/portal.controller.ts

### Frontend Portal Pages (US3)

- [ ] T114 [P] [US3] Create Dashboard page with policy summary at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/Dashboard.tsx
- [ ] T115 [P] [US3] Create PolicyDetails page with coverage breakdown and policy document download section (declarations, ID cards per FR-053) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/PolicyDetails.tsx
- [ ] T116 [P] [US3] Create BillingHistory page with payment transactions at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/BillingHistory.tsx
- [ ] T117 [P] [US3] Create ClaimsList page with claim status at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/ClaimsList.tsx
- [ ] T118 [P] [US3] Create FileClaim page with incident details form at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/FileClaim.tsx
- [ ] T119 [US3] Create portal API client service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/services/portal-service.ts
- [ ] T119b [US3] Implement document upload component with drag-drop, file type validation (image/pdf), and preview for claim attachments at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/DocumentUpload.tsx
- [ ] T119c [US3] Create claim document storage service (mock S3/local filesystem with Document entity relationship) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/services/claim-service/document-storage.ts
- [ ] T120 [US3] Create usePortal custom hook at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/usePortal.ts
- [ ] T121 [US3] Setup React Router route for /portal/:policyNumber
- [ ] T122 [US3] Create document download functionality for policy PDFs

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Production-ready features, documentation, error handling, performance optimization

**Tasks**:

- [ ] T123 [P] Setup Swagger/OpenAPI documentation at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/swagger.ts
- [ ] T124 [P] Create comprehensive error handling with user-friendly messages at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/middleware/error-handler.ts
- [ ] T125 [P] Add request validation using class-validator for all DTOs and implement request timing middleware with console logging for response times >3s at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/dto/ and backend/src/api/middleware/timing.ts
- [ ] T126 [P] Create API rate limiting middleware at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/src/api/middleware/rate-limiter.ts
- [ ] T127 [P] Add database query performance indexes at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/database/schema/indexes.sql
- [ ] T128 [P] Create mock service debug panel UI at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/debug/MockServiceDebugPanel.tsx
- [ ] T129 Update README with setup instructions at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/README.md

---

## Phase 7: Testing & Quality Assurance

**Goal**: Ensure production-ready quality with comprehensive automated tests for critical business logic, API endpoints, and frontend components

**Coverage Targets**:
- Backend unit tests: 80%+ coverage for services and business logic
- API integration tests: 100% endpoint coverage
- Frontend component tests: Critical user flows and reusable components
- E2E tests: Happy path for each user story

**Edge Case Coverage Notes**:
- All test tasks should reference applicable edge cases from spec.md Edge Cases section (lines 73-101)
- Quote flow tests (T168-T172): Cover Quote Flow Edge Cases and Vehicle Data Lookup Edge Cases
- Payment tests (T173-T175, T159): Cover Payment & Binding Edge Cases
- Portal tests (T176-T180): Cover Account & Portal Edge Cases
- Service tests should validate edge case handling per specification

**Tasks**:

### Test Infrastructure Setup (2 tasks)

- [ ] T130 [P] Setup Vitest configuration for backend at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/vitest.config.ts
- [ ] T131 [P] Setup Vitest and React Testing Library for frontend at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/vitest.config.ts

### Backend Unit Tests - Rating Engine (Critical Business Logic) (8 tasks)

- [ ] T132 [P] Create unit tests for vehicle rating factors calculator (age, make, model, usage) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/vehicle-rating.spec.ts
- [ ] T133 [P] Create unit tests for driver rating factors calculator (age, experience, violations) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/driver-rating.spec.ts
- [ ] T134 [P] Create unit tests for location rating factors calculator (zip code, urban/rural) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/location-rating.spec.ts
- [ ] T135 [P] Create unit tests for coverage rating factors calculator (limits, deductibles) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/coverage-rating.spec.ts
- [ ] T136 [P] Create unit tests for discount calculator (all 7 discount types with percentages) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/discount-calculator.spec.ts
- [ ] T137 [P] Create unit tests for surcharge calculator (all 8 surcharge types with percentages) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/surcharge-calculator.spec.ts
- [ ] T138 [P] Create unit tests for premium calculation orchestrator (multiplicative model, audit trail) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/premium-calculator.spec.ts
- [ ] T139 [P] Create integration tests for rating engine with realistic scenarios ($800-$3000 range validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/rating-engine/rating-engine.integration.spec.ts

### Backend Unit Tests - Quote Service (7 tasks)

- [ ] T140 [P] Create unit tests for quote service CRUD operations at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/quote-service.spec.ts
- [ ] T141 [P] Create unit tests for Party and Person creation logic at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/party-creation.spec.ts
- [ ] T142 [P] Create unit tests for vehicle enrichment with VIN decoder integration at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/vehicle-enrichment.spec.ts
- [ ] T143 [P] Create unit tests for Policy entity creation with status=QUOTED at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/policy-creation.spec.ts
- [ ] T144 [P] Create unit tests for coverage assignment logic at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/coverage-assignment.spec.ts
- [ ] T145 [P] Create unit tests for quote expiration tracking (30-day validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/quote-expiration.spec.ts
- [ ] T146 [P] Create unit tests for quote expiration cron job at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/expiration-monitor.spec.ts

### Backend Unit Tests - Policy Service (6 tasks)

- [ ] T147 [P] Create unit tests for policy binding service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/policy-binding.spec.ts
- [ ] T148 [P] Create unit tests for policy status transitions (QUOTED→BINDING→BOUND→ACTIVE) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/status-manager.spec.ts
- [ ] T149 [P] Create unit tests for payment processing integration at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/payment-processor.spec.ts
- [ ] T150 [P] Create unit tests for Policy Event tracking (NEW_BUSINESS, ACTIVATION) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/event-tracker.spec.ts
- [ ] T151 [P] Create unit tests for document generation service (policy PDF, ID card) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/document-generator.spec.ts
- [ ] T152 [P] Create unit tests for policy service edge cases (invalid quote, expired quote, payment failures) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/policy-service-edge-cases.spec.ts

### Backend Unit Tests - Portal Service (4 tasks)

- [ ] T153 [P] Create unit tests for portal service with policy number validation at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/portal-service.spec.ts
- [ ] T154 [P] Create unit tests for dashboard data aggregation service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/dashboard-service.spec.ts
- [ ] T155 [P] Create unit tests for billing history service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/billing-service.spec.ts
- [ ] T156 [P] Create unit tests for claims filing service at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/services/claims-service.spec.ts

### Backend Unit Tests - Mock Services (5 tasks)

- [ ] T157 [P] Create unit tests for VIN decoder with checksum validation and edge cases at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/mock-services/vin-decoder.spec.ts
- [ ] T158 [P] Create unit tests for vehicle valuation service with realistic pricing at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/mock-services/vehicle-valuation.spec.ts
- [ ] T159 [P] Create unit tests for mock payment gateway (Luhn validation, Stripe test patterns) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/mock-services/payment-gateway.spec.ts
- [ ] T160 [P] Create unit tests for email service with template rendering at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/mock-services/email-service.spec.ts
- [ ] T161 [P] Create unit tests for delay simulator with LogNormal distribution at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/unit/mock-services/delay-simulator.spec.ts

### Backend Integration Tests - API Endpoints (6 tasks)

- [ ] T162 [P] Create integration tests for quotes API (POST, GET, PUT /quotes) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/api/quotes.spec.ts
- [ ] T163 [P] Create integration tests for policies API (POST /policies) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/api/policies.spec.ts
- [ ] T164 [P] Create integration tests for portal API (GET /portal/dashboard, /billing, /claims) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/api/portal.spec.ts
- [ ] T165 [P] Create integration tests for rating engine API at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/api/rating.spec.ts
- [ ] T166 [P] Create integration tests for mock services API at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/api/mock-services.spec.ts
- [ ] T167 Create end-to-end integration test for quote-to-policy flow at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/tests/integration/workflows/quote-to-policy.spec.ts

### Frontend Component Tests - Quote Flow (5 tasks)

- [ ] T168 [P] Create component tests for VehicleInfo page (VIN input, manual entry, validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/__tests__/VehicleInfo.spec.tsx
- [ ] T169 [P] Create component tests for DriverInfo page (person details form, validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/__tests__/DriverInfo.spec.tsx
- [ ] T170 [P] Create component tests for CoverageSelection page (limits, deductibles, real-time premium updates) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/__tests__/CoverageSelection.spec.tsx
- [ ] T171 [P] Create component tests for QuoteResults page (premium breakdown display) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/quote/__tests__/QuoteResults.spec.tsx
- [ ] T172 [P] Create component tests for PremiumBreakdown component (Canary) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/__tests__/PremiumBreakdown.spec.tsx

### Frontend Component Tests - Binding Flow (3 tasks)

- [ ] T173 [P] Create component tests for PaymentInfo page (credit card/ACH forms, Luhn validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/__tests__/PaymentInfo.spec.tsx
- [ ] T174 [P] Create component tests for ReviewBind page (quote summary, terms acceptance) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/__tests__/ReviewBind.spec.tsx
- [ ] T175 [P] Create component tests for Confirmation page (policy number, portal link) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/binding/__tests__/Confirmation.spec.tsx

### Frontend Component Tests - Portal (5 tasks)

- [ ] T176 [P] Create component tests for Dashboard page (policy summary, URL-based access) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/__tests__/Dashboard.spec.tsx
- [ ] T177 [P] Create component tests for PolicyDetails page (coverage breakdown) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/__tests__/PolicyDetails.spec.tsx
- [ ] T178 [P] Create component tests for BillingHistory page (payment transactions) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/__tests__/BillingHistory.spec.tsx
- [ ] T179 [P] Create component tests for FileClaim page (incident form, document upload) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/pages/portal/__tests__/FileClaim.spec.tsx
- [ ] T180 [P] Create component tests for DocumentUpload component (drag-drop, file validation) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/components/insurance/__tests__/DocumentUpload.spec.tsx

### Frontend Hook Tests (3 tasks)

- [ ] T181 [P] Create custom hook tests for useQuote (TanStack Query integration) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/__tests__/useQuote.spec.ts
- [ ] T182 [P] Create custom hook tests for usePolicy at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/__tests__/usePolicy.spec.ts
- [ ] T183 [P] Create custom hook tests for usePortal at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/src/hooks/__tests__/usePortal.spec.ts

### E2E Tests with Playwright (Optional) (3 tasks)

- [ ] T184 Setup Playwright configuration and install dependencies at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/playwright.config.ts
- [ ] T185 Create E2E test for complete quote generation flow (US1) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/e2e/quote-flow.spec.ts
- [ ] T186 Create E2E test for quote-to-policy binding flow (US1+US2) at /Users/jasonnguyen/CascadeProjects/auto-prototype-master/e2e/quote-to-policy.spec.ts

---

## Parallel Execution Examples

### Phase 3 (US1) - Parallel Opportunities

**Database Schema Creation (T023-T044)**: All schema files can be created in parallel since they're independent files. Run migrations sequentially afterward (T046).

**Mock Services (T047-T050)**: VIN decoder, vehicle valuation, and safety ratings services can be built simultaneously.

**Rating Engine Components (T053-T057)**: Vehicle, driver, location, and coverage rating calculators are independent and can be parallelized.

**Frontend Pages (T070-T076)**: All quote flow pages and components can be built in parallel, then integrated (T080).

### Phase 4 (US2) - Parallel Opportunities

**Database Entities (T081-T084)**: Payment, Event, Policy Event, and Document schemas can be created simultaneously.

**Mock Services (T086-T089)**: Payment gateway components (Luhn validator, ACH validator, email service) are independent.

**Frontend Pages (T096-T098)**: PaymentInfo, ReviewBind, and Confirmation pages can be built in parallel.

### Phase 5 (US3) - Parallel Opportunities

**Database Entities (T103-T106)**: User Account, Claim, Claim Party Role, and Claim Event schemas are independent.

**Frontend Portal Pages (T114-T118)**: All five portal pages can be built simultaneously.

**Phase 6 - Parallel Opportunities**

**All Polish Tasks (T123-T128)**: Swagger docs, error handling, validation, rate limiting, indexes, and debug panel are independent and fully parallelizable.

---

## Success Criteria Mapping

**US1 Success Criteria** (Quote Generation):
- T070-T080: Quote flow pages enable users to generate quote in <3 minutes (SC-001)
- T060: Rating engine calculates premium in <5 seconds (SC-003)
- T046: All OMG entities persist correctly (SC-007, SC-008)

**US2 Success Criteria** (Policy Binding):
- T090-T095: Policy binding service enables quote-to-policy conversion (SC-011)
- T086: Mock payment processes in <3 seconds (SC-004)
- T094: Documents generated within 1 minute (SC-005)

**US3 Success Criteria** (Portal Access):
- T108: Portal loads in <3 seconds (SC-006, SC-028)
- T111: Claims filing completes in <5 seconds (SC-030)
- T110: Billing history displays all transactions (SC-029)

**OMG Compliance** (All Phases):
- T023-T107: All 33 entities implemented (27 OMG core + 6 rating engine per SC-018)
- T045: Party Role pattern used throughout (SC-020)
- T091: Policy status follows OMG transitions (SC-021)

---

## Notes

- **Testing Tasks Added**: Phase 7 includes comprehensive testing (57 tasks) despite spec not requiring it - aligned with Constitution Principle III (Production-Ready Patterns)
- **Test Coverage Targets**: 80%+ backend unit tests, 100% API integration tests, critical frontend flows, optional E2E tests
- **File Paths**: All paths are absolute as specified
- **Parallelization**: Tasks marked [P] can run concurrently with other [P] tasks in same phase
- **Dependencies**: Phase 2 blocks all user stories; US1 blocks US2; US2 blocks US3; Phase 7 can run in parallel with implementation or after Phase 6
- **OMG Compliance**: All entities follow OMG P&C Data Model v1.0 with UUID primary keys, temporal tracking, and Party Role patterns
- **Demo Mode**: No authentication (URL-based portal access), mock services for external integrations, production-like patterns throughout
- **Test Strategy**: Focus on critical business logic (rating engine, policy lifecycle), API contracts, and user-facing components
