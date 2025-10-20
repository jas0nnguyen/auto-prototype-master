# Auto Insurance Prototype

An OMG Property & Casualty Data Model v1.0 compliant insurance purchase platform built with React 18, TypeScript, NestJS, and the Canary Design System. The application enables quote generation, policy binding, and self-service portal access.

## Project Status

**Current Phase**: Phase 3 Complete ✅ (50% overall progress)
- ✅ Phase 1: Project Setup (12/12 tasks)
- ✅ Phase 2: Foundational Infrastructure (10/10 tasks)
- ✅ Phase 3: User Story 1 - Quote Generation (63/63 tasks)
- ⏳ Phase 4: Policy Binding and Payment (22 tasks)
- ⏳ Phase 5: Portal Access (20 tasks)
- ⏳ Phase 6: Polish and Production Features (7 tasks)
- ⏳ Phase 7: Comprehensive Testing (57 tasks)

**Branch**: `001-auto-insurance-flow`

## Getting Started

### Prerequisites

- Node.js >=22.0.0 <25.0.0
- npm or yarn
- PostgreSQL database (Neon recommended)
- GitHub Personal Access Token with `read:packages` permission (for Canary Design System)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd auto-prototype-master
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:3000)
   - Additional settings for mock services, delays, etc.

4. **Run database migrations:**
   ```bash
   cd backend
   npx drizzle-kit push
   cd ..
   ```

5. **Start the development servers:**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application.

## Project Structure

```
auto-prototype-master/
├── src/                      # Frontend React application
│   ├── App.tsx              # Main app with React Router
│   ├── HomePage.tsx         # Landing page
│   ├── main.tsx             # Application entry point
│   ├── global.css           # Minimal global styles
│   ├── components/          # Reusable components
│   │   └── insurance/       # PremiumBreakdown, CoverageCard, VehicleCard
│   ├── pages/               # Page components
│   │   ├── quote/           # VehicleInfo, DriverInfo, CoverageSelection, QuoteResults
│   │   ├── binding/         # Payment and binding flow (Phase 4)
│   │   └── portal/          # Self-service portal (Phase 5)
│   ├── services/            # API client services
│   │   └── quote-api.ts     # Quote API client
│   └── hooks/               # Custom React hooks
│       └── useQuote.ts      # TanStack Query hooks
│
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── main.ts          # NestJS entry point
│   │   ├── app.module.ts    # Root module
│   │   ├── entities/        # OMG-compliant domain entities
│   │   │   └── base/        # Base entity types and enums
│   │   ├── services/        # Business logic
│   │   │   ├── quote-service/      # Quote CRUD, policy creation, coverage assignment
│   │   │   ├── rating-engine/      # Premium calculation (complete)
│   │   │   ├── mock-services/      # VIN decoder, vehicle valuation, safety ratings
│   │   │   ├── policy-service/     # Policy binding (Phase 4)
│   │   │   └── portal-service/     # Portal data access (Phase 5)
│   │   ├── api/             # Controllers and middleware
│   │   │   ├── routes/      # QuotesController, RatingController, MockServicesController
│   │   │   └── middleware/  # CORS, error handling, validation
│   │   ├── database/        # Drizzle ORM configuration
│   │   │   ├── connection.ts       # Neon PostgreSQL connection
│   │   │   ├── drizzle.config.ts   # Drizzle ORM setup
│   │   │   └── database.module.ts  # NestJS database module
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── omg-entities.ts     # All 33 OMG entity interfaces
│   │   └── utils/           # Shared utilities
│   │       ├── validators.ts       # Validation functions
│   │       └── response-formatter.ts # API response formatters
│   └── tests/               # Backend tests (Phase 7)
│
├── database/                # Database schemas, seeds, and migrations
│   ├── schema/              # 27 Drizzle schema definitions (OMG P&C entities)
│   ├── seeds/               # Mock data and rating tables
│   └── migrations/          # Migration history (0000_large_ink.sql)
│
├── learnings/               # Phase-by-phase learning documentation
│   ├── README.md            # Index of all learning documents
│   └── phases/              # Individual phase learning summaries
│       ├── phase-1-project-setup.md
│       ├── phase-2-foundational-infrastructure.md
│       ├── phase-3a-database-migrations.md
│       └── phase-3b-quote-service-frontend.md
│
├── specs/                   # Feature specifications (SpecKit pattern)
│   └── 001-auto-insurance-flow/
│       ├── spec.md          # User stories and acceptance criteria
│       ├── plan.md          # Implementation plan and architecture
│       ├── tasks.md         # Dependency-ordered task list (170 tasks)
│       ├── data-model.md    # Database schema and OMG compliance
│       └── quickstart.md    # Developer onboarding guide
│
├── CLAUDE.md                # Main documentation and project guidance
├── TESTING.md               # Testing guide and checklists
├── test-quote-flow.sh       # Automated testing script
└── api-tests.http           # REST Client API test collection
```

## Features

### ✅ Completed (Phase 1-3)

**Quote Generation (User Story 1)**
- Multi-step quote form with vehicle, driver, and coverage information
- VIN decoding with checksum validation (mock service)
- Vehicle valuation with depreciation curves (mock service)
- Safety ratings from NHTSA/IIHS (mock service)
- Premium calculation with multiplicative rating model:
  - Vehicle rating factors (age, make, model)
  - Driver rating factors (age, experience, violations)
  - Location rating factors (zip code, urban/rural)
  - Coverage rating factors (limits, deductibles)
  - 7 discount types (Good Driver, Multi-Car, Low Mileage, etc.)
  - 8 surcharge types (At-Fault Accident, DUI, Speeding, etc.)
  - State taxes and fees
- Quote expiration tracking (30-day validity)
- Complete OMG P&C Data Model implementation (27 entities)
- In-memory caching with 24-hour TTL
- Realistic API latency simulation (LogNormal distribution)

### 🚧 In Progress (Phase 4-7)

**Policy Binding (User Story 2)** - Phase 4
- Payment processing (mock payment gateway)
- Policy document generation (PDF, ID cards)
- Email notifications
- Policy status transitions (QUOTED → BINDING → BOUND → ACTIVE)

**Portal Access (User Story 3)** - Phase 5
- Self-service portal with policy number access (no authentication)
- Dashboard with policy summary
- Billing history
- Claims filing with document upload

**Production Features** - Phase 6
- API documentation (Swagger/OpenAPI)
- Rate limiting
- Performance optimization
- Comprehensive error handling

**Testing** - Phase 7
- 57 test tasks covering:
  - Backend unit tests (rating engine, services, mock services)
  - API integration tests
  - Frontend component tests
  - E2E tests (optional Playwright)

## Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript 5.8+
- Vite (build tool and dev server)
- React Router (client-side routing)
- TanStack Query (data fetching and caching)
- Canary Design System (UI components)

**Backend:**
- NestJS (Node.js framework)
- Drizzle ORM (type-safe database queries)
- Neon PostgreSQL (serverless database)
- TypeScript (strict mode)

**Data Model:**
- OMG Property & Casualty Data Model v1.0 compliant
- 27 entities with UUID primary keys
- Temporal tracking (begin_date/end_date)
- Party Role pattern for relationships

### Key Principles

1. **Design System First**: Canary Design System components exclusively (no custom CSS)
2. **OMG Compliance**: Strict adherence to OMG P&C Data Model v1.0
3. **Type Safety**: TypeScript strict mode throughout
4. **Demo Mode**: No authentication, mock external services (payment, email, VIN decoder)
5. **Production Patterns**: Error handling, validation, loading states, transactions

## API Endpoints

### Quote Endpoints
- `POST /api/v1/quotes` - Create new quote
- `GET /api/v1/quotes/:id` - Get quote by UUID
- `GET /api/v1/quotes/reference/:refNumber` - Get quote by quote number
- `PUT /api/v1/quotes/:id/coverage` - Update coverage selections
- `POST /api/v1/quotes/:id/calculate` - Recalculate premium

### Rating Engine
- `POST /api/v1/rating/calculate` - Calculate premium for quote

### Mock Services
- `POST /api/v1/mock/vin-decoder` - Decode VIN
- `POST /api/v1/mock/vehicle-valuation` - Get vehicle market value
- `POST /api/v1/mock/safety-ratings` - Get safety ratings

## Testing

### Automated Testing Script

Run the automated test suite:
```bash
chmod +x test-quote-flow.sh
./test-quote-flow.sh
```

The script will:
1. Check environment variables and database connection
2. Build the backend
3. Start development servers
4. Run API tests with curl
5. Provide manual testing instructions

### Manual Testing

See [TESTING.md](./TESTING.md) for:
- Quick start guide
- Phase-by-phase testing checklists
- API test examples (curl commands)
- Frontend user flow scenarios
- Performance benchmarks
- Troubleshooting guide

### API Testing with REST Client

Use the `api-tests.http` file with REST Client extension:
- 15+ API test scenarios
- VIN decoder tests
- Rating engine tests
- Quote creation with multiple coverage scenarios

## Development Workflow

### Adding New Features

1. Review feature specification in `specs/001-auto-insurance-flow/spec.md`
2. Check implementation plan in `specs/001-auto-insurance-flow/plan.md`
3. Follow task order in `specs/001-auto-insurance-flow/tasks.md`
4. Validate against constitution principles in `.specify/memory/constitution.md`

### Using Canary Design System

Import components from the design system:
```tsx
import { Button, Title, Text, Layout } from '@sureapp/canary-design-system';
```

All components follow design system patterns - no custom CSS needed.

### Database Migrations

Generate migration after schema changes:
```bash
cd backend
npx drizzle-kit generate
npx drizzle-kit push
```

### SpecKit Commands

```bash
/speckit.specify         # Create/update feature spec
/speckit.plan            # Generate implementation plan
/speckit.tasks           # Generate task list
/speckit.implement       # Execute tasks
/speckit.analyze         # Cross-artifact consistency check
/speckit.constitution    # View/update project constitution
```

## Learning Resources

This project includes beginner-friendly learning documentation explaining what was built in each phase:

- [Phase 1: Project Setup](./learnings/phases/phase-1-project-setup.md) - Backend structure, dependencies, configuration
- [Phase 2: Foundational Infrastructure](./learnings/phases/phase-2-foundational-infrastructure.md) - Database connection, ORM, entity types, validation
- [Phase 3a: Database Migrations](./learnings/phases/phase-3a-database-migrations.md) - Schema generation and migration execution
- [Phase 3b: Quote Service & Frontend Integration](./learnings/phases/phase-3b-quote-service-frontend.md) - Service layer and React components

Each document includes:
- What we built (with code examples and analogies)
- Files created/modified
- Key concepts learned
- Restaurant analogy for understanding
- Progress tracking

See the [learnings directory](./learnings/README.md) for the complete index.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Main project documentation and guidance for Claude Code
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Vercel deployment with GitHub Package Registry
- **[specs/001-auto-insurance-flow/](./specs/001-auto-insurance-flow/)** - Feature specifications
- **[learnings/](./learnings/)** - Phase-by-phase learning documentation

## Performance Targets

- Quote calculation: < 5 seconds
- Portal load: < 3 seconds
- API responses: < 500ms (95th percentile)

## Browser Support

Modern browsers (latest 2 versions):
- Chrome
- Firefox
- Safari
- Edge

## Contributing

This is a learning project. See [CLAUDE.md](./CLAUDE.md) for architecture principles and development guidelines.

## License

[Add license information here]

## Deployment

### Vercel Deployment

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed instructions.

Quick setup:
1. Set up GitHub Personal Access Token with `read:packages` permission
2. Add `GITHUB_TOKEN` environment variable to Vercel
3. Connect repository and deploy

### Build Commands

```bash
# Frontend build
npm run build
npm run preview

# Backend build
cd backend
npm run build
npm run start:prod
```

## Database

**Provider**: Neon PostgreSQL (serverless)
**ORM**: Drizzle ORM
**Entities**: 27 OMG P&C Data Model v1.0 compliant entities
**Migration Tool**: Drizzle Kit

Current schema includes:
- Party system (Party, Person, Communication Identity, Geographic Location, Location Address)
- Account and Product entities
- Policy and Agreement entities (with subtype pattern)
- Coverage entities (Coverage, Coverage Part, Policy Coverage Detail, Limits, Deductibles)
- Vehicle entities (Insurable Object, Vehicle)
- Rating entities (Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation)
- Relationship tables (Party Roles, Account-Agreement, Assessment)

## Contact

For questions about this project, see the [GitHub issues](https://github.com/[username]/auto-prototype-master/issues).
