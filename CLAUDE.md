# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Auto Insurance Prototype - An OMG Property & Casualty Data Model v1.0 compliant insurance purchase platform built with React 18, TypeScript, and the Canary Design System. The application enables quote generation, policy binding, and self-service portal access.

**Architecture**: Fullstack web application (React frontend + NestJS backend planned + Neon PostgreSQL)

## Commands

### Development
```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Package Management
```bash
npm install              # Install dependencies (handles GitHub Package Registry)
npm run setup-npmrc      # Configure GitHub package access for CI/CD
```

### GitHub Package Registry Access
This project uses the private `@sureapp/canary-design-system` package from GitHub Package Registry. For local development, ensure you have a `.npmrc` file configured with a GitHub token that has `read:packages` permission. See `VERCEL_SETUP.md` for deployment configuration.

## Project Structure

### Feature Specifications (SpecKit Pattern)
```
specs/[###-feature-name]/
├── spec.md              # Feature specification with user stories
├── plan.md              # Implementation plan and architecture
├── tasks.md             # Dependency-ordered implementation tasks
├── research.md          # Technical research and decisions
├── data-model.md        # Database schema and OMG compliance
├── quickstart.md        # Developer onboarding guide
├── checklists/          # Quality assurance checklists
└── contracts/           # API contracts and type definitions
```

### Source Code
```
src/
├── App.tsx              # Main app with React Router configuration
├── HomePage.tsx         # Landing page
├── main.tsx             # Application entry point
├── global.css           # Minimal global styles (design system first)
├── components/          # Reusable components
│   └── insurance/       # Insurance-specific components
└── pages/               # Page components
    ├── quote/           # Quote generation flow (US1)
    ├── binding/         # Policy binding flow (US2, planned)
    └── portal/          # Self-service portal (US3, planned)
```

### Backend (Phase 1 & 2 Complete ✅)
```
backend/
├── src/
│   ├── main.ts          # NestJS entry point ✅
│   ├── app.module.ts    # Root module ✅
│   ├── entities/        # OMG-compliant domain entities
│   │   ├── base/        # Base entity types and enums ✅
│   │   ├── party/       # Party, Person, Communication Identity (pending Phase 3)
│   │   ├── policy/      # Policy, Agreement, Coverage (pending Phase 3)
│   │   ├── vehicle/     # Vehicle, Insurable Object (pending Phase 3)
│   │   ├── rating/      # Rating Factor, Rating Table, Discount, Surcharge (pending Phase 3)
│   │   ├── claim/       # Claim, Claim Party Role, Claim Event (pending Phase 5)
│   │   └── account/     # Account, User Account, Payment (pending Phase 4)
│   ├── services/        # Business logic and rating engine (pending Phase 3+)
│   │   ├── quote-service/       # Quote generation and management
│   │   ├── rating-engine/       # Premium calculation engine
│   │   ├── policy-service/      # Policy binding and lifecycle
│   │   ├── portal-service/      # Portal data access
│   │   └── mock-services/       # Simulated external integrations
│   ├── api/             # Controllers and middleware
│   │   ├── routes/      # REST endpoints (pending Phase 3+)
│   │   ├── middleware/  # CORS, error handling, validation ✅
│   │   └── dto/         # Data Transfer Objects (pending Phase 3+)
│   ├── database/        # Drizzle ORM configuration ✅
│   │   ├── connection.ts        # Neon PostgreSQL connection ✅
│   │   ├── drizzle.config.ts    # Drizzle ORM setup ✅
│   │   └── database.module.ts   # NestJS database module ✅
│   ├── types/           # TypeScript type definitions ✅
│   │   └── omg-entities.ts      # All 33 OMG entity interfaces ✅
│   └── utils/           # Shared utilities ✅
│       ├── validators.ts        # Validation functions ✅
│       └── response-formatter.ts # API response formatters ✅
├── tests/               # Backend unit and integration tests (pending Phase 7)
│   ├── unit/
│   └── integration/
├── package.json         # Dependencies and scripts ✅
├── tsconfig.json        # TypeScript configuration ✅
└── README.md            # Backend documentation ✅
```

### Database (Phase 2 Complete ✅, Migrations Generated ✅)
```
database/
├── schema/              # Drizzle schema definitions (27 tables defined ✅)
│   ├── README.md        # Schema documentation ✅
│   ├── _base.schema.ts  # Base schema helpers and types ✅
│   ├── party.schema.ts, person.schema.ts, communication-identity.schema.ts ✅
│   ├── account.schema.ts, product.schema.ts, agreement.schema.ts, policy.schema.ts ✅
│   ├── vehicle.schema.ts, insurable-object.schema.ts ✅
│   ├── coverage*.schema.ts (6 coverage tables) ✅
│   ├── rating-*.schema.ts, discount.schema.ts, surcharge.schema.ts ✅
│   └── party-roles.schema.ts, assessment.schema.ts ✅
├── seeds/               # Mock data and rating tables (pending Phase 3)
│   └── README.md        # Seeds documentation ✅
└── migrations/          # Migration history ✅
    ├── 0000_large_ink.sql  # Initial migration (27 tables, 27 FKs) ✅
    └── meta/_journal.json  # Migration tracking ✅
```

## Architecture Principles

### 1. Design System First (NON-NEGOTIABLE)
- **MUST** use Canary Design System components exclusively
- **NO** custom CSS files except `global.css` for layout integration
- **NO** inline styles, className overrides, or style props
- Import: `import { Component } from '@sureapp/canary-design-system'`
- MCP-first workflow: Use MCP tools (`learn_layout_patterns`, `search_components`, `get_component_details`) before implementing UI components

### 2. OMG P&C Data Model Compliance
- All insurance entities (Quote, Policy, Coverage, Claim, Party, etc.) **MUST** follow OMG Property & Casualty Data Model v1.0
- Entity naming, attributes, and relationships defined in `specs/001-auto-insurance-flow/data-model.md`
- 27 entities with UUID primary keys, temporal tracking, and Party Role patterns
- Non-standard extensions require justification and OMG mapping

### 3. Type Safety Throughout
- TypeScript 5.8+ with strict mode enabled
- No `any` types except for justified third-party integrations
- Interfaces for all domain entities, API contracts, and component props
- Drizzle ORM provides compile-time type safety for database queries

### 4. User Story-Driven Development
- Features organized by prioritized user stories (P1, P2, P3)
- Each story independently testable with Given-When-Then scenarios
- Tasks in `tasks.md` organized by user story with clear dependencies
- Phase 2 (Foundational) blocks all user story work - complete infrastructure first

### 5. Demo Mode with Production Patterns
- **Exception**: No authentication - portal access via URL with policy number
- All other patterns production-ready: error handling, validation, loading states, transactions
- Mock services for external integrations (payment, VIN decoder, email) with realistic behavior
- Demo applications must document production migration path

## SpecKit Workflow

This project uses SpecKit for feature planning and implementation. Key slash commands:

```bash
/speckit.specify         # Create/update feature spec from description
/speckit.plan            # Generate implementation plan with architecture
/speckit.tasks           # Generate dependency-ordered task list
/speckit.implement       # Execute tasks from tasks.md
/speckit.analyze         # Cross-artifact consistency analysis
/speckit.constitution    # View/update project constitution
```

Constitution is stored in `.specify/memory/constitution.md` (Version 1.1.0).

## Current Implementation Status

**Feature**: 001-auto-insurance-flow
**Branch**: `001-auto-insurance-flow`
**Status**: Phase 1, 2 & 3 COMPLETE ✅ (85/170 tasks completed - 50%)
**Last Updated**: 2025-10-19

**Completed Phases**:
- ✅ **Phase 1** (12/12 tasks - 100%): Project setup complete - backend structure, dependencies, configuration
- ✅ **Phase 2** (10/10 tasks - 100%): Foundational infrastructure complete - database connection, ORM, entity types, validation, error handling, middleware
- ✅ **Phase 3** (63/63 tasks - 100% COMPLETE):
  - **Database Schemas** (24/24): All OMG P&C entity schemas created (Party, Person, Policy, Coverage, Vehicle, Rating Factor, Discount, Surcharge, Premium Calculation, etc.)
  - **Mock Services** (6/6): VIN decoder, vehicle valuation, safety ratings, delay simulator with LogNormal distribution
  - **Rating Engine** (12/12): All calculators complete - vehicle/driver/location/coverage rating, discount (7 types), surcharge (8 types), premium orchestrator, tax/fee calculator, rating tables seed
  - **Quote Service** (7/7): Complete quote CRUD, policy creation, party creation, vehicle enrichment, coverage assignment, quote expiration tracking, API controller
  - **Frontend** (14/14): Complete quote flow UI - VehicleInfo, DriverInfo, CoverageSelection, QuoteResults pages, reusable components (PremiumBreakdown, CoverageCard, VehicleCard), API client, custom hooks, React Router integration
  - **Testing Infrastructure**: Automated test script, TESTING.md guide, API test collection

**Pending Phases**:
- ⏳ **Phase 4**: Policy binding and payment (US2) - 22 tasks
- ⏳ **Phase 5**: Portal access (US3) - 20 tasks
- ⏳ **Phase 6**: Polish and production features - 7 tasks
- ⏳ **Phase 7**: Comprehensive testing - 57 tasks

**Critical Path**: Phase 3 COMPLETE ✅ (100%) - All foundational work done! Database schemas, rating engine, mock services, quote service, and full frontend flow implemented. Database migrations run successfully ✅. Ready to move to Phase 4 (Policy Binding).

## Working with This Codebase

### Before Starting Implementation
1. Review `specs/001-auto-insurance-flow/spec.md` for user stories and acceptance criteria
2. Consult `specs/001-auto-insurance-flow/plan.md` for architecture decisions
3. Check `specs/001-auto-insurance-flow/tasks.md` for task order and dependencies
4. Validate against constitution principles in `.specify/memory/constitution.md`

### When Building UI Components
1. **MUST** use MCP tools first (`.cursorrules` enforces this):
   - `learn_layout_patterns` - Understand Canary layout patterns
   - `search_components` - Find the right component
   - `get_component_details` - Get props and API info
2. Import only from `@sureapp/canary-design-system`
3. Use component props for styling (size, variant, color)
4. No custom CSS - design system provides all styling

### When Implementing Backend
- NestJS for API layer with TypeScript decorators
- Drizzle ORM for type-safe database queries
- All entities defined in `backend/src/entities/` following OMG model
- Rating engine in `backend/src/services/rating-engine/`
- Mock services in `backend/src/services/mock-services/`

### Quality Gates
- TypeScript must compile without errors (`npm run build`)
- Canary Design System components used exclusively
- OMG data model compliance verified for insurance entities
- Error handling and loading states implemented
- No sensitive data hardcoded

## Key Technical Constraints

- **Node.js**: >=22.0.0 <25.0.0 (engine constraint)
- **OMG Compliance**: Strict adherence to OMG P&C Data Model v1.0
- **Demo Mode**: No real external API calls - payment, email, vehicle data must be simulated
- **Performance**: Quote calculation <5s, portal load <3s, API responses <500ms (95th percentile)
- **Database**: Neon PostgreSQL (serverless) with Drizzle ORM
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

## Documentation References

- `README.md` - Template quickstart and deployment basics
- `VERCEL_SETUP.md` - Vercel deployment with GitHub Package Registry
- `TEMPLATE_USAGE.md` - Original Canary template usage guide
- `specs/001-auto-insurance-flow/quickstart.md` - Developer onboarding for this feature
- `.specify/memory/constitution.md` - Project constitution (version 1.1.0)
- `.cursorrules` - MCP-first enforcement rules for design system

## Git Workflow

- **Main Branch**: `master`
- **Current Feature Branch**: `001-auto-insurance-flow`
- Commit messages should reference task IDs from `tasks.md` when applicable
- No force push to main/master

---

## Phase-by-Phase Learning Summaries

Detailed learning summaries for each completed phase have been moved to the **[learnings/](./learnings/)** directory for better organization.

### Quick Reference

**Completed Phases:**
- **[Phase 1: Project Setup](./learnings/phases/phase-1-project-setup.md)** (T001-T012) - Backend structure, dependencies, configuration
- **[Phase 2: Foundational Infrastructure](./learnings/phases/phase-2-foundational-infrastructure.md)** (T013-T022) - Database connection, ORM, entity types, validation
- **[Phase 3a: Database Migrations](./learnings/phases/phase-3a-database-migrations.md)** (T046) - Schema generation and migration execution
- **[Phase 3b: Quote Service & Frontend Integration](./learnings/phases/phase-3b-quote-service-frontend.md)** (T062-T080, Partial) - Service layer and React components

Each learning document includes:
- What We Built (with code examples and analogies)
- Files Created/Modified
- Key Concepts Learned
- Restaurant Analogy for understanding
- Progress tracking

For full details and beginner-friendly explanations, see the [learnings directory](./learnings/README.md).

### Creating New Learning Documents

**IMPORTANT**: After completing each phase or when the user requests it, create a new learning summary document:

1. **Location**: Save to `learnings/phases/phase-[number]-[name].md`
2. **Naming Convention**:
   - Use lowercase with hyphens
   - Examples: `phase-3c-rating-engine.md`, `phase-4-policy-binding.md`
3. **Required Sections**:
   - Header with phase name, tasks covered, completion date, and goal
   - "What We Built" - Detailed explanations with code examples
   - "Files Created/Modified" - Complete list of file changes
   - "Key Concepts Learned" - Programming fundamentals explained
   - "Restaurant Analogy" - Simple analogy for understanding
   - "Total Progress" - Task completion count (X/170 tasks complete)
4. **Audience**: Write for non-technical beginners learning to code
   - Use analogies to explain complex concepts
   - Include actual code snippets with explanations
   - Explain syntax, methods, and patterns
   - No assumption of prior knowledge
5. **Update learnings/README.md**: Add entry to the completed phases list with:
   - Phase name and link
   - Completion date
   - Brief description
   - Task count

**Example Template**:
```markdown
# Phase X: [Name] (Tasks TXXX-TXXX)

**Completed**: YYYY-MM-DD
**Goal**: [Brief description of what this phase accomplished]

## What We Built

[Detailed explanations with code examples and analogies]

## Files Created/Modified

[Complete list]

## Key Concepts Learned

[Programming fundamentals explained with analogies]

## The Restaurant Analogy

[Simple analogy relating to the restaurant theme]

**Total Progress**: X/170 tasks complete (XX%)
```

**When to Create**:
- ✅ After completing a logical phase of work (e.g., all mock services, rating engine, etc.)
- ✅ When the user explicitly asks to document what was learned
- ✅ After major milestones (completing a user story, finishing infrastructure)
- ❌ NOT after every single task (wait for natural groupings)

---

### ✅ Phase 3 (API/Frontend): Quote Flow Integration (Tasks T069, T077-T080) - Completed 2025-10-19

**Goal**: Establish the API contract between frontend and backend for the quote flow.

**IMPORTANT**: This phase completed the **infrastructure** for quote generation - the frontend pages, API controllers, and service patterns. The **actual business logic** (database operations, rating calculations, mock services) will be implemented in the remaining Phase 3 tasks (T023-T068).

#### What We Built

**1. Quotes API Controller (T069)**
- Created `backend/src/api/routes/quotes.controller.ts` - NestJS REST controller
- **What it does**: Handles HTTP requests for quote operations
- **Endpoints implemented**:
  - POST /api/v1/quotes - Create new quote
  - GET /api/v1/quotes/:id - Get quote by UUID
  - GET /api/v1/quotes/reference/:refNumber - Get quote by quote number
  - PUT /api/v1/quotes/:id/coverage - Update coverage selections
  - POST /api/v1/quotes/:id/calculate - Recalculate premium
- **NestJS decorators explained**:
  - `@Controller('api/v1/quotes')` - Defines base URL path
  - `@Post()` - Handles POST requests (creates resources)
  - `@Get(':id')` - Handles GET requests with URL parameter
  - `@Put(':id/coverage')` - Handles PUT requests (updates resources)
  - `@Body()` - Extracts data from request body
  - `@Param('id')` - Extracts parameter from URL
- **Analogy**: Like a receptionist at a hotel - receives requests, routes them to the right service, returns responses

**2. NestJS Module System (T069 continued)**
- Created `backend/src/services/quote-service/quote.module.ts`
- Created `backend/src/services/rating-engine/rating-engine.module.ts`
- Created `backend/src/services/mock-services/mock-services.module.ts`
- Updated `backend/src/app.module.ts` to import QuoteModule
- **What modules do**:
  - Bundle related services, controllers, and providers together
  - Define dependencies (what this module needs from other modules)
  - Expose exports (what this module provides to other modules)
- **Module properties**:
  - `imports`: Other modules this module depends on
  - `controllers`: HTTP request handlers
  - `providers`: Services and utilities (the "workers")
  - `exports`: What to share with other modules
- **Analogy**: Modules are like departments in a company (HR, Finance, Sales) - each has its own staff and responsibilities, but they work together

**3. Quote API Client Service (T077)**
- Created `src/services/quote-api.ts` - Frontend HTTP client
- **What it does**: Handles all HTTP communication with the backend
- **Methods implemented**:
  - `createQuote(data)` - POST request to create quote
  - `getQuote(id)` - GET request to fetch quote by ID
  - `getQuoteByNumber(quoteNumber)` - GET by quote number
  - `updateCoverage(id, coverages)` - PUT to update coverages
  - `recalculateQuote(id)` - POST to recalculate premium
- **Fetch API explained**:
  - `fetch(url, options)` - Built-in browser function for HTTP requests
  - Returns a Promise (like an IOU for data)
  - `await` pauses until Promise resolves
  - `response.ok` - Boolean indicating success (status 200-299)
  - `response.json()` - Parses JSON response body
- **Error handling pattern**:
  ```typescript
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Request failed');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw for component handling
  }
  ```
- **Analogy**: Like a postal service - you give it a letter (request), it delivers to an address (URL), brings back a reply (response)

**4. TanStack Query Hooks (T078)**
- Created `src/hooks/useQuote.ts` - Custom React hooks for data fetching
- **What TanStack Query does**: Manages API data with automatic caching, loading states, and refetching
- **Hooks created**:
  - `useCreateQuote()` - Mutation for creating quotes
  - `useQuote(id)` - Query for fetching quote by ID
  - `useQuoteByNumber(number)` - Query for fetching by quote number
  - `useUpdateCoverage()` - Mutation for updating coverages
  - `useCalculatePremium()` - Mutation for recalculating premium
- **useQuery vs useMutation**:
  - **useQuery**: For reading data (GET requests)
    - Automatically fetches when component mounts
    - Caches results
    - Provides `data`, `isLoading`, `error`, `refetch`
  - **useMutation**: For changing data (POST/PUT/DELETE requests)
    - Manual triggering (call `mutate()`)
    - Provides `mutate()`, `data`, `isLoading`, `error`
    - Can update cache after success
- **Query keys explained**:
  - Unique identifiers for cached data
  - Arrays that can include parameters
  - Example: `['quotes', 'quote-123']` is different from `['quotes', 'quote-456']`
- **Optimistic updates**:
  - Update UI immediately (before API call completes)
  - Show expected result right away
  - Rollback if API call fails
  - Like paying with credit - you get the item immediately, transaction processes in background
- **Analogy**: TanStack Query is like an auto-refilling water cooler - automatically fills when empty, keeps water fresh, you just grab a cup when needed

**5. React Router Integration (T079)**
- Updated `src/App.tsx` to include quote flow routes
- **Routes added**:
  - `/quote/vehicle-info` → VehicleInfo page
  - `/quote/driver-info` → DriverInfo page
  - `/quote/coverage-selection` → CoverageSelection page
  - `/quote/results` → QuoteResults page
- **QueryClientProvider setup**:
  - Wraps entire app to provide TanStack Query context
  - Configured with default options (stale time, cache time, retry logic)
- **What React Router does**: Maps URLs to React components
- **Analogy**: Like a map that tells you which room (component) to go to based on the address (URL)

**6. Frontend-Backend Integration Pattern (T080)**
- Established data flow architecture:
  1. User fills out VehicleInfo form
  2. Form data stored in sessionStorage
  3. User navigates to DriverInfo
  4. Process repeats through CoverageSelection
  5. On final submit, all data sent to API via `useCreateQuote()`
  6. API returns quote with UUID and quote number
  7. Quote displayed on QuoteResults page
- **Current state**: Frontend uses sessionStorage for demo purposes
- **Production pattern**: Will use API for all data persistence (when database tasks T023-T068 complete)
- **Why sessionStorage for now**: Allows testing UI flow without backend database

#### Files Created/Modified

```
✅ Created Backend:
- backend/src/api/routes/quotes.controller.ts (NestJS controller)
- backend/src/services/quote-service/quote.module.ts (Quote module)
- backend/src/services/rating-engine/rating-engine.module.ts (Rating module)
- backend/src/services/mock-services/mock-services.module.ts (Mock services module)

✅ Created Frontend:
- src/services/quote-api.ts (API client service)
- src/hooks/useQuote.ts (TanStack Query hooks)

✅ Modified:
- backend/src/app.module.ts (Imported QuoteModule)
- src/App.tsx (Already had QueryClientProvider and routes)

✅ Already Existed (from previous work):
- src/pages/quote/VehicleInfo.tsx (T070)
- src/pages/quote/DriverInfo.tsx (T071)
- src/pages/quote/CoverageSelection.tsx (T072)
- src/pages/quote/QuoteResults.tsx (T073)
- src/components/insurance/PremiumBreakdown.tsx (T074)
```

#### Key Concepts Learned

**NestJS Controllers** = Request handlers
- Use decorators to define routes and HTTP methods
- Inject services via constructor (dependency injection)
- Return standardized responses using ResponseFormatter
- Handle errors with try/catch and throw HttpException

**NestJS Modules** = Organization units
- Group related functionality together
- Define what the module needs (imports)
- Define what the module provides (exports)
- Register controllers and services (providers)

**Dependency Injection** = How services get their dependencies
- Services "request" what they need in constructor
- NestJS provides instances automatically
- Makes testing easier (can swap in mocks)
- Ensures single instances (singletons)

**HTTP Client (Fetch API)** = Browser's built-in HTTP library
- `fetch(url, options)` makes HTTP requests
- Returns Promise<Response>
- Must check `response.ok` before parsing
- `response.json()` parses JSON body

**Custom React Hooks** = Reusable logic functions
- Start with "use" prefix
- Can call other hooks
- Extract logic from components
- Make components cleaner

**TanStack Query** = Smart data fetching library
- Automatic caching
- Loading/error states
- Background refetching
- Optimistic updates
- Replaces manual useState/useEffect

#### What We DIDN'T Build Yet

- ❌ Database schema files (T023-T046)
- ❌ Mock services implementations (T047-T052)
- ❌ Rating engine services (T053-T062)
- ❌ Quote service business logic (T066-T068)
- ❌ Actual API integration (currently frontend uses sessionStorage)

#### The Restaurant Analogy Continued

Phase 3 (API/Frontend) is like **designing the restaurant's customer experience and staff workflow**:

✅ **Built the Ordering System**:
- Created order forms (API endpoints)
- Designed menu cards (frontend pages)
- Set up POS system (API client)
- Trained front-of-house staff (React components)
- Established order flow (routing)

✅ **Created Standard Operating Procedures**:
- Order forms everyone uses (DTOs)
- Service flow documented (controller logic)
- Quality checks in place (validation)

✅ **Set Up Customer Experience**:
- Dining room layout (page navigation)
- Order tracking system (TanStack Query)
- Customer communication (loading/error states)

❌ **Haven't Done Yet**:
- Built storage areas (database schemas)
- Stocked ingredients (seed data)
- Trained kitchen staff (rating engine)
- Created recipes (business logic)
- Opened for business (full integration)

**Current State**: You can walk through the restaurant, see the menu, fill out order forms, and they get recorded (in sessionStorage). But the kitchen isn't operational yet - no actual food is being prepared because we haven't built the kitchen systems (database, rating engine, services).

#### Next Steps: Remaining Phase 3 Tasks

To make the quote flow fully functional, we need to:

1. **Database Schemas (T023-T046)**: Create Drizzle schema files for all 33 OMG entities
2. **Run Migrations (T046)**: Apply schema to Neon PostgreSQL database
3. **Mock Services (T047-T052)**: Build VIN decoder, vehicle valuation, safety ratings mocks
4. **Rating Engine (T053-T062)**: Implement premium calculation with all factors, discounts, surcharges
5. **Quote Services (T066-T068)**: Complete policy creation, coverage assignment, expiration tracking
6. **Full Integration (T080 completion)**: Replace sessionStorage with actual API calls

**Why this order matters**:
- Can't save quotes without database (schemas first)
- Can't calculate premiums without rating engine (rating engine second)
- Can't create policies without business logic (services third)
- Can't integrate frontend without working backend (integration last)

**Total Progress**: 32/170 tasks complete (19%)

---

## Learning Resources: Code Examples

### Example 1: How a Request Flows Through the System

```
User clicks "Get Quote" button in CoverageSelection.tsx
  ↓
useCreateQuote() hook called with form data
  ↓
quoteApi.createQuote(data) makes HTTP POST to /api/v1/quotes
  ↓
Vite proxy forwards request to backend (http://localhost:3000)
  ↓
QuotesController.createQuote() receives request
  ↓
QuoteService.createQuote() processes business logic
  ↓
Response returned with quote data
  ↓
TanStack Query caches result
  ↓
useCreateQuote onSuccess callback fires
  ↓
Navigation to QuoteResults page
  ↓
QuoteResults displays cached quote data
```

### Example 2: Dependency Injection in Action

```typescript
// 1. Define a service
@Injectable()
export class QuoteService {
  // This service needs other services to work
  constructor(
    private readonly partyService: PartyCreationService,
    private readonly vehicleService: VehicleEnrichmentService
  ) {}
  
  createQuote(data) {
    // Can use injected services
    this.partyService.createParty();
    this.vehicleService.enrichVehicle();
  }
}

// 2. Register in module
@Module({
  providers: [
    QuoteService,           // NestJS creates instance
    PartyCreationService,   // NestJS creates instance
    VehicleEnrichmentService, // NestJS creates instance
  ]
})

// 3. Inject into controller
@Controller()
export class QuotesController {
  // NestJS automatically provides QuoteService instance
  constructor(private readonly quoteService: QuoteService) {}
  
  @Post()
  createQuote() {
    return this.quoteService.createQuote();
  }
}
```

This is like a restaurant kitchen where:
- QuoteService = Head Chef
- PartyCreationService = Prep Cook
- VehicleEnrichmentService = Sauce Chef

The Head Chef (QuoteService) doesn't hire the prep cook and sauce chef themselves - the restaurant manager (NestJS) assigns them. The Head Chef just says "I need a prep cook and sauce chef" and they're provided.

### Example 3: TanStack Query Cache Management

```typescript
// Query key structure
const quoteKeys = {
  all: ['quotes'],                    // All quotes
  detail: (id) => ['quotes', id],     // Specific quote
}

// Creating a quote
const createQuote = useCreateQuote();
createQuote.mutate(formData, {
  onSuccess: (newQuote) => {
    // Add to cache immediately
    queryClient.setQueryData(
      quoteKeys.detail(newQuote.quote_id),
      newQuote
    );
    
    // Invalidate list (triggers refetch)
    queryClient.invalidateQueries({
      queryKey: quoteKeys.all
    });
  }
});

// Reading a quote
const { data: quote } = useQuote(quoteId);
// If quote is in cache, returns immediately
// If quote is stale, refetches in background
// If quote is fresh, uses cached version
```

This is like a smart filing cabinet:
- When you file a new document (create quote), it's instantly available
- When you ask for a document (get quote), it checks if it already has it
- If the document is old (stale), it gets a fresh copy while showing you the old one
- If you update the filing system (invalidate), it knows to refresh all related documents

---

### ✅ Phase 3: User Story 1 - Quote Generation (Tasks T023-T080) - 100% COMPLETE (2025-10-19)

**Goal**: Build complete auto insurance quote generation system with database, services, and UI.
