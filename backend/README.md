# Auto Insurance Backend API

**Status**: Phase 1 Complete - Project Structure Initialized ✅

OMG Property & Casualty Data Model v1.0 compliant backend API for the Auto Insurance Purchase Flow demo application.

## Overview

This backend implements a NestJS-based REST API that manages:
- Quote generation with OMG-compliant entities
- Premium calculation with rating engine
- Policy binding and lifecycle management
- Self-service portal access (URL-based, no authentication)
- Mock services for external integrations (VIN decoder, payment gateway, email)

## Tech Stack

- **Framework**: NestJS 10.3+ (TypeScript)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM 0.29+
- **Validation**: class-validator + class-transformer
- **Testing**: Vitest
- **API Docs**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── entities/          # OMG P&C entity definitions (33 entities)
│   │   ├── party/         # Party, Person, Communication Identity
│   │   ├── policy/        # Policy, Agreement, Coverage, Policy Coverage Detail
│   │   ├── vehicle/       # Vehicle, Insurable Object
│   │   ├── rating/        # Rating Factor, Rating Table, Discount, Surcharge
│   │   ├── claim/         # Claim, Claim Party Role, Claim Event
│   │   ├── account/       # Account, User Account, Payment
│   │   └── base/          # Base entity types and interfaces
│   ├── services/          # Business logic services
│   │   ├── quote-service/        # Quote generation and management
│   │   ├── rating-engine/        # Premium calculation engine
│   │   ├── policy-service/       # Policy binding and lifecycle
│   │   ├── portal-service/       # Portal data access
│   │   └── mock-services/        # Simulated external integrations
│   ├── api/               # API routes and controllers
│   │   ├── routes/        # REST endpoints
│   │   ├── middleware/    # CORS, error handling, validation
│   │   └── dto/           # Data Transfer Objects
│   ├── database/          # Database configuration
│   ├── utils/             # Shared utilities
│   ├── main.ts            # Application entry point
│   └── app.module.ts      # Root module
├── tests/
│   ├── unit/              # Service and entity tests
│   └── integration/       # API endpoint tests
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 22.0.0 < 25.0.0
- npm or yarn
- Neon PostgreSQL database (see parent README for setup)

### Installation

```bash
# Install dependencies
cd backend
npm install

# Configure environment variables
cp ../.env.example ../.env
# Edit .env with your Neon database credentials
```

### Development

```bash
# Start development server (with hot reload)
npm run start:dev

# Build for production
npm run build

# Run production server
npm run start:prod
```

### Database Operations

```bash
# Generate Drizzle migration files
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio (GUI)
npm run db:studio

# Seed database with mock data
npm run db:seed
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## API Documentation

Once the server is running, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## Phase 1 Completed Tasks ✅

- [x] T001-T003: Directory structure created (entities, services, api, database, utils)
- [x] T004-T006: Backend package.json with NestJS + Drizzle dependencies
- [x] T007: TypeScript configuration with strict mode and path aliases
- [x] T008: NestJS main entry point with CORS and validation
- [x] T009: App module with ConfigModule setup
- [x] T012: Environment variables template (.env.example)

**Tasks Completed**: 12/12 in Phase 1
**Next Phase**: Phase 2 - Foundational (Database connection, ORM setup, base entities)

## Next Steps (Phase 2)

1. **Setup Neon PostgreSQL connection** (T013)
   - Configure Drizzle ORM client
   - Test database connectivity

2. **Create OMG Entity Interfaces** (T018)
   - Define TypeScript interfaces for all 33 entities
   - Party, Policy, Coverage, Vehicle, Claim, Rating, etc.

3. **Database Module** (T017)
   - NestJS database module with Drizzle provider
   - Connection pooling configuration

4. **Base Infrastructure** (T019-T022)
   - Validation utilities
   - Error handling middleware
   - Response formatters
   - CORS configuration

## Architecture Decisions

### Why NestJS?
- **Enterprise-grade structure**: Modules, controllers, services with dependency injection
- **Perfect for OMG complexity**: Clean separation of 27+ entities across domain modules
- **Type safety**: First-class TypeScript support with decorators
- **Built-in testing**: @nestjs/testing package simplifies mocking
- **Auto documentation**: Swagger generation from decorators

### Why Drizzle ORM?
- **Best type safety**: Infers TypeScript types from schema definitions
- **Performance**: 20-40% faster than Prisma for complex joins
- **Neon optimized**: Native support for Neon's serverless architecture
- **Developer experience**: Drizzle Studio GUI for visualizing entities

### Why No Authentication?
- **Demo simplification**: Focus on insurance business logic, not auth flows
- **URL-based access**: Portal accessible via `/portal/{policyNumber}`
- **Production note**: Real apps would use Supabase Auth, Clerk, or Auth.js

## OMG Compliance Notes

All entities follow OMG Property & Casualty Data Model v1.0 standards:

- **UUID Primary Keys**: All entities use UUID identifiers
- **Temporal Tracking**: begin_date, end_date, effective_date, expiration_date
- **Party Role Pattern**: Flexible many-to-many with role context
- **Subtype Relationships**: Policy extends Agreement, Vehicle extends Insurable Object
- **Naming Conventions**: Standard class words (identifier, code, name, description, date, amount)

See `/specs/001-auto-insurance-flow/data-model.md` for complete entity definitions.

## Performance Targets

- **API Response**: < 500ms (95th percentile)
- **Premium Calculation**: < 5s (complex multi-factor rating)
- **Portal Load**: < 3s (95th percentile)
- **Mock Payment**: < 3s (99th percentile)

## License

MIT

---

**Last Updated**: 2025-10-18
**Phase Status**: Phase 1 Complete ✅ | Phase 2 Pending
