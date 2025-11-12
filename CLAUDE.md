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

### Backend
```
backend/
├── src/
│   ├── main.ts          # NestJS entry point
│   ├── app.module.ts    # Root module
│   ├── entities/        # OMG-compliant domain entities
│   │   ├── base/        # Base entity types and enums
│   │   ├── party/       # Party, Person, Communication Identity
│   │   ├── policy/      # Policy, Agreement, Coverage
│   │   ├── vehicle/     # Vehicle, Insurable Object
│   │   ├── rating/      # Rating Factor, Rating Table, Discount, Surcharge
│   │   ├── claim/       # Claim, Claim Party Role, Claim Event
│   │   └── account/     # Account, User Account, Payment
│   ├── services/        # Business logic and rating engine
│   │   ├── quote-service/       # Quote generation and management
│   │   ├── rating-engine/       # Premium calculation engine
│   │   ├── policy-service/      # Policy binding and lifecycle
│   │   ├── portal-service/      # Portal data access
│   │   └── mock-services/       # Simulated external integrations
│   ├── api/             # Controllers and middleware
│   │   ├── routes/      # REST endpoints
│   │   ├── middleware/  # CORS, error handling, validation
│   │   └── dto/         # Data Transfer Objects
│   ├── database/        # Drizzle ORM configuration
│   │   ├── connection.ts        # Neon PostgreSQL connection
│   │   ├── drizzle.config.ts    # Drizzle ORM setup
│   │   └── database.module.ts   # NestJS database module
│   ├── types/           # TypeScript type definitions
│   │   └── omg-entities.ts      # All 33 OMG entity interfaces
│   └── utils/           # Shared utilities
│       ├── validators.ts        # Validation functions
│       └── response-formatter.ts # API response formatters
├── tests/               # Backend unit and integration tests
│   ├── unit/
│   └── integration/
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # Backend documentation
```

### Database
```
database/
├── schema/              # Drizzle schema definitions (31 OMG-compliant tables)
│   ├── README.md        # Schema documentation
│   ├── _base.schema.ts  # Base schema helpers and types
│   ├── party.schema.ts, person.schema.ts, communication-identity.schema.ts
│   ├── account.schema.ts, product.schema.ts, agreement.schema.ts, policy.schema.ts
│   ├── vehicle.schema.ts, insurable-object.schema.ts
│   ├── coverage*.schema.ts (6 coverage tables)
│   ├── rating-*.schema.ts, discount.schema.ts, surcharge.schema.ts
│   ├── party-roles.schema.ts, assessment.schema.ts
│   ├── payment.schema.ts, event.schema.ts, policy-event.schema.ts, document.schema.ts
│   └── user-account.schema.ts, claim.schema.ts, claim-party-role.schema.ts, claim-event.schema.ts
├── seeds/               # Mock data and rating tables (optional)
│   └── README.md        # Seeds documentation
└── migrations/          # Migration history
    ├── 0000_large_ink.sql  # Initial migration (27 tables, 27 FKs)
    ├── 0001_add_portal_entities.sql  # Portal entities (4 tables)
    └── meta/_journal.json  # Migration tracking
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
- Infrastructure setup blocks user story implementation work until complete

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

## Implementation Status

For current project status and task progress, see:
- **Feature specifications**: `specs/[feature-name]/spec.md`
- **Implementation tasks**: `specs/[feature-name]/tasks.md`
- **Active work**: Check feature branch and latest commits

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

### Bug Tracking
**IMPORTANT**: All bugs encountered during development must be documented in `bugs.md` using the standardized template.

**When to log a bug**:
- Any error that blocks user functionality
- HTTP errors (4xx, 5xx responses)
- Database errors
- Runtime exceptions
- UI/UX issues that prevent task completion
- Integration issues between frontend and backend

**Bug Logging Process**:
1. **Reproduce the bug** - Understand the exact steps that trigger it
2. **Investigate** - Check logs, use debugging tools, trace the error
3. **Document in bugs.md** - Use the standardized template (see bugs.md)
4. **Fix the bug** - Implement the solution
5. **Update the bug entry** - Mark as RESOLVED and document the fix
6. **Write up the solution** - Include code examples and lessons learned

**Template and Examples**:
See `bugs.md` for the complete bug tracking template and examples.

**Benefits of Bug Tracking**:
- Creates a knowledge base of problems and solutions
- Helps avoid repeating mistakes
- Provides learning material for junior developers
- Documents technical debt and system quirks
- Assists with debugging similar issues in the future

## Key Technical Constraints

- **Node.js**: >=22.0.0 <25.0.0 (engine constraint)
- **OMG Compliance**: Strict adherence to OMG P&C Data Model v1.0
- **Demo Mode**: No real external API calls - payment, email, vehicle data must be simulated
- **Performance**: Quote calculation <5s, portal load <3s, API responses <500ms (95th percentile)
- **Database**: Neon PostgreSQL (serverless) with Drizzle ORM
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

## Codebase Navigation & Dependency Visualization

### Dependency Graph Generation

This project uses **dependency-cruiser** to generate visual dependency maps of the codebase. These graphs help understand:
- How files depend on each other
- Module structure and organization
- Import/export relationships
- Potential circular dependencies

**Available Dependency Maps**:
- `codemap-depcruise-3layer.dot` - 3-layer deep dependency graph (current snapshot)
- Generated on-demand for up-to-date analysis

**Generate a new dependency map**:
```bash
# 3-layer deep (recommended for overview)
npx depcruise src backend/src --include-only "^(src|backend/src)" --max-depth 3 --output-type dot > codemap-depcruise-3layer.dot

# Full depth (detailed but large)
npx depcruise src backend/src --include-only "^(src|backend/src)" --output-type dot > codemap-depcruise-full.dot

# Specific directory only
npx depcruise src/pages --max-depth 2 --output-type dot > codemap-pages.dot
```

**Visualize the dependency graph**:
```bash
# Option 1: Online viewer (no installation needed)
# Copy contents of .dot file to: https://dreampuf.github.io/GraphvizOnline

# Option 2: Generate image locally (requires Graphviz)
brew install graphviz                  # Install once
dot -Tsvg codemap-depcruise-3layer.dot -o codemap.svg  # SVG (scalable)
dot -Tpng codemap-depcruise-3layer.dot -o codemap.png  # PNG
```

**Understanding the graph**:
- **Clustered boxes**: Directory structure (subgraphs)
- **Arrows**: Import/dependency relationships
- **Colors**:
  - Light cyan/blue: Normal files with dependencies
  - Green with orange border: Orphaned files (unused)
  - Different arrow styles: Different dependency types (import, re-export, etc.)

**Common use cases**:
- **Onboarding**: Generate and view graph to understand project structure
- **Refactoring**: Identify circular dependencies or tight coupling
- **Impact analysis**: See what files depend on a module before changing it
- **Documentation**: Include graph in architecture docs

**Dependency-cruiser configuration**:
- Configuration file: `.dependency-cruiser.js`
- Customizable rules for validation
- Can enforce architectural constraints

**Tips**:
- Use `--max-depth 3` for manageable graph size
- Filter to specific directories for focused analysis
- Generate SVG format for better zooming/panning
- Update graph after major structural changes

## Documentation References

- `README.md` - Template quickstart and deployment basics
- `VERCEL_SETUP.md` - Vercel deployment with GitHub Package Registry
- `TEMPLATE_USAGE.md` - Original Canary template usage guide
- `bugs.md` - **Bug tracker with all documented issues and solutions**
- `specs/001-auto-insurance-flow/quickstart.md` - Developer onboarding for this feature
- `.specify/memory/constitution.md` - Project constitution (version 1.1.0)
- `.cursorrules` - MCP-first enforcement rules for design system
- `codemap-depcruise-3layer.dot` - **Dependency graph visualization** (3-layer depth)

## Git Workflow

- **Main Branch**: `master`
- Commit messages should reference task IDs from `tasks.md` when applicable
- No force push to main/master
- Feature branches follow naming: `[feature-number]-[feature-name]`

---

## Learning Resources

For detailed phase-by-phase learning summaries with code examples, concepts, and analogies, see the **[learnings/](./learnings/)** directory.
