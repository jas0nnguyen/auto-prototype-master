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

### Backend (Planned - Not Yet Implemented)
```
backend/
├── src/
│   ├── main.ts          # NestJS entry point
│   ├── app.module.ts    # Root module
│   ├── entities/        # OMG-compliant domain entities
│   ├── services/        # Business logic and rating engine
│   ├── api/             # Controllers and middleware
│   └── database/        # Drizzle ORM configuration
└── tests/               # Backend unit and integration tests
```

### Database (Planned - Not Yet Implemented)
```
database/
├── schema/              # Drizzle schema definitions
└── seeds/               # Mock data and rating tables
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
**Status**: Early implementation (5/170 tasks completed)

**Completed**:
- Phase 3 (US1): Frontend quote flow pages (VehicleInfo, DriverInfo, CoverageSelection, QuoteResults, PremiumBreakdown)

**Pending**:
- Phase 1: Project setup (backend initialization, dependencies)
- Phase 2: Foundational infrastructure (database, ORM, base entities) - **BLOCKS ALL USER STORIES**
- Phase 3: Rating engine, mock services, API integration
- Phase 4: Policy binding and payment (US2)
- Phase 5: Portal access (US3)
- Phase 6: Polish and production features
- Phase 7: Comprehensive testing (57 test tasks)

**Critical Path**: Phase 2 must complete before any backend work begins. Frontend quote pages exist but lack API integration.

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
