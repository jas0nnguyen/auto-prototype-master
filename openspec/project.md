# Project Context

## Purpose

Auto Insurance Prototype - A production-grade demonstration of an OMG Property & Casualty Data Model v1.0 compliant insurance purchase platform. The system enables prospective customers to:
1. Generate instant auto insurance quotes with vehicle and driver information
2. Bind policies with payment processing (simulated for demo)
3. Access a self-service portal for policy management, billing history, and claims filing

This prototype serves as a reference implementation showcasing enterprise-grade insurance platform architecture, OMG standards compliance, and modern React/TypeScript best practices.

**Demo Mode**: External integrations (payment processing, email delivery, VIN decoder, vehicle valuation) are simulated with realistic behavior. All other patterns (security, error handling, data model, business logic) are production-ready.

## Tech Stack

### Frontend
- **React 18.2.0** - Component-based UI framework
- **TypeScript 5.8+** - Type-safe development with strict mode
- **Vite 7.0** - Build tool and dev server
- **React Router 7.6** - Client-side routing
- **TanStack Query 5.17** - Server state management
- **Canary Design System 3.12** - Proprietary design system (GitHub Package Registry)

### Backend
- **NestJS 10.3** - TypeScript Node.js framework
- **Node.js >=22.0.0 <25.0.0** - JavaScript runtime
- **Express 4.18** - HTTP server framework
- **Drizzle ORM 0.44** - Type-safe database ORM
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Class Validator/Transformer** - DTO validation and transformation

### Testing
- **Vitest 3.2** - Unit testing framework
- **Playwright 1.56** - E2E testing with browser automation
- **Testing Library** - React component testing utilities

### Development Tools
- **dependency-cruiser 16.10** - Dependency graph visualization
- **Prettier/ESLint** - Code formatting and linting
- **Drizzle Kit** - Database migration management

## Project Conventions

### Code Style

**TypeScript Standards:**
- Strict mode enabled - no `any` types except justified third-party integrations
- All domain entities, API contracts, and component props must have TypeScript interfaces
- Type errors must be resolved before committing code
- Use explicit return types for functions

**Naming Conventions:**
- OMG entity names: PascalCase matching OMG P&C standard (e.g., `Party`, `Agreement`, `Policy`)
- Database columns: snake_case matching OMG specification (e.g., `party_identifier`, `begin_date`)
- React components: PascalCase (e.g., `QuotePage`, `PolicySummary`)
- Functions/variables: camelCase (e.g., `calculatePremium`, `quoteData`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_QUOTE_AGE_DAYS`)

**Import Organization:**
- External packages first
- Internal modules second
- Relative imports last
- Design system imports: `import { Component } from '@sureapp/canary-design-system'`

### Architecture Patterns

**Design System First (NON-NEGOTIABLE):**
- All UI components MUST use Canary Design System exclusively
- NO custom CSS files except `global.css` for layout integration
- NO inline styles, className overrides, or style props
- Use component props for styling (size, variant, color)
- MCP-first workflow: Use MCP tools before implementing UI components

**OMG Standards Compliance:**
- All insurance entities conform to OMG Property & Casualty Data Model v1.0
- 33 total entities: 27 OMG core + 6 rating engine specific
- Entity naming, attributes, and relationships follow OMG specification
- Non-standard extensions require justification and OMG mapping documentation

**Production-Ready Patterns:**
- Comprehensive error handling with user-friendly messages and technical logging
- Loading states and validation feedback for all async operations
- Database transactions ensure data consistency
- Mock services mirror real-world API behavior and error scenarios
- Security best practices: PII masking, input validation, SQL injection prevention

**SpecKit Workflow:**
- Features organized by user stories with priorities (P1, P2, P3)
- Each story independently testable with Given-When-Then scenarios
- Documentation structure: `spec.md` → `plan.md` → `tasks.md`
- Constitution defines non-negotiable principles

**State Management:**
- Quote states: draft, active, converted, expired
- Policy states: pending, active, cancelled, expired
- Claim states: submitted, under_review, approved, denied, closed
- All state transitions validated and logged

### Testing Strategy

**Unit Testing (Vitest):**
- Test business logic in services and utilities
- Test React components with Testing Library
- Aim for >80% coverage on critical paths
- Mock external dependencies

**E2E Testing (Playwright):**
- Test complete user journeys (quote → bind → portal)
- Test across browsers (Chromium, Firefox, WebKit)
- Test responsive layouts (mobile, tablet, desktop)
- Validate accessibility and keyboard navigation

**Quality Gates:**
- TypeScript must compile without errors (`npm run build`)
- All tests must pass before PR merge
- OMG compliance verified for insurance entities
- Design system components used exclusively

### Git Workflow

**Branching:**
- Main branch: `main`
- Feature branches: `[feature-number]-[feature-name]` (e.g., `001-auto-insurance-flow`)
- No force push to main/master

**Commit Messages:**
- Reference task IDs from `tasks.md` when applicable
- Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Example: `feat: implement quote generation with OMG-compliant entities`

**Pull Requests:**
- Require constitution compliance verification
- Must include tests for new functionality
- Code review required before merge

## Domain Context

### Insurance Industry Standards

**OMG Property & Casualty Data Model v1.0:**
- Industry-standard data model for P&C insurance systems
- Ensures interoperability with other insurance platforms
- Encodes decades of insurance best practices
- Supports regulatory compliance and audit requirements

**Key OMG Concepts:**
- **Party**: Central entity for persons and organizations (policyholders, drivers, claimants)
- **Agreement**: Abstract contract - Policy is a subtype of Agreement
- **Party Role Pattern**: Flexible relationship modeling (e.g., Policyholder, Named Insured, Additional Driver)
- **Temporal Validity**: All entities track begin_date/end_date for historical accuracy
- **Coverage Patterns**: Base Coverage → Coverage Category → Coverage Detail hierarchy

**Entity Breakdown (33 total):**
- 5 Core Party Entities (Party, Person, Communication Identity, etc.)
- 3 Account & Product Entities
- 14 Policy & Coverage Entities
- 2 Insurable Object Entities (Vehicle, Insurable Object)
- 5 Rating Engine Entities (Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation)
- 3 Claims Entities (Claim, Claim Party Role, Claim Event)
- 1 Payment Entity

### Business Rules

**Quote Generation:**
- Quotes expire after configurable period (default: 30 days)
- Premium calculated using rating engine with factors: vehicle type, driver age, location, coverage selections
- VIN lookup retrieves vehicle details (make, model, year, safety ratings)
- Validation: minimum driver age (16+), valid zip code, future-dated effective date

**Policy Binding:**
- Requires valid payment method (credit card or bank account)
- Quote must be active (not expired or converted)
- Creates policy with unique policy number
- Automatically creates user account if first policy
- Payment transaction logged with full audit trail

**Portal Access:**
- No authentication required for demo (access via URL with policy number)
- Production migration path documented for OAuth/JWT implementation
- Users can view policies, billing history, file claims, upload documents
- Multiple policies per user account supported

## Important Constraints

### Technical Constraints

- **Node.js Version**: >=22.0.0 <25.0.0 (engine constraint)
- **Browser Support**: Modern browsers only (Chrome, Firefox, Safari, Edge - latest 2 versions)
- **Performance Targets**:
  - Quote calculation: <5 seconds
  - Portal load: <3 seconds
  - API responses: <500ms (95th percentile)

### Business Constraints

- **Demo Mode**: No real external API calls - payment, email, vehicle data must be simulated
- **OMG Compliance**: Strict adherence to OMG P&C Data Model v1.0 (non-negotiable)
- **Design System**: Canary Design System components exclusively (non-negotiable)
- **User Stories**: All features must align with prioritized user stories (P1 → P2 → P3)

### Regulatory Constraints

- **Data Privacy**: Handle PII (personally identifiable information) with encryption and masking
- **Audit Trail**: All state transitions logged with timestamps and user context
- **Geographic Jurisdiction**: Support state-specific requirements via OMG Geographic Location entity
- **Payment Security**: PCI compliance patterns (even for simulated payments)

## External Dependencies

### Private Package Registry

**GitHub Package Registry:**
- `@sureapp/canary-design-system` - Proprietary design system
- Requires GitHub token with `read:packages` permission
- Configuration: `.npmrc` file with `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}`
- Deployment: Vercel environment variable `GITHUB_TOKEN` required

### Database

**Neon PostgreSQL:**
- Serverless PostgreSQL with auto-scaling
- Connection string: `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries
- 31 OMG-compliant tables across 2 migrations

### Simulated External Services

These services are simulated for demo purposes with production-like behavior:

**Payment Gateway:**
- Mock credit card and bank account validation
- Realistic responses: success, declined, validation errors
- Payment transaction logging

**VIN Decoder:**
- Mock vehicle data lookup by VIN
- Returns: make, model, year, trim, safety ratings
- Edge cases: invalid VIN, not found, timeout

**Email Service:**
- In-app preview instead of actual delivery
- Welcome emails, policy confirmations, claim notifications

**Vehicle Valuation:**
- Mock market value estimates
- Fallback logic for missing data

### Development Services

**Vercel:**
- Hosting platform for frontend and backend
- Environment variables for secrets management
- Automatic deployments from main branch

**GitHub:**
- Version control and code collaboration
- Package registry for design system
- Pull request reviews and CI/CD
