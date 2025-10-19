# Quickstart: Auto Insurance Purchase Flow Development Guide

**Feature**: Auto Insurance Purchase Flow
**Branch**: `001-auto-insurance-flow`
**Created**: 2025-10-17
**Standard**: OMG Property & Casualty Data Model v1.0 Compliant

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Database Migration](#3-database-migration)
4. [Development Workflow](#4-development-workflow)
5. [Project Structure Walkthrough](#5-project-structure-walkthrough)
6. [Common Tasks](#6-common-tasks)
7. [Mock Services Usage](#7-mock-services-usage)
8. [Debugging Tips](#8-debugging-tips)
9. [Troubleshooting](#9-troubleshooting)
10. [Resources](#10-resources)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed and configured:

### 1.1 Required Software

- **Node.js 22.x** (22.0.0 to <25.0.0)
  ```bash
  node --version  # Should output v22.x.x
  ```
  Download from: https://nodejs.org/

- **npm or yarn**
  ```bash
  npm --version   # Should output 10.x.x or higher
  # OR
  yarn --version  # Should output 1.22.x or higher
  ```

- **Git**
  ```bash
  git --version   # Should output 2.x.x or higher
  ```

### 1.2 Required Cloud Services

#### Neon PostgreSQL (Database)
1. Create a free account at https://neon.tech
2. Create a new project named "auto-insurance-demo"
3. Save your connection string (format: `postgresql://user:password@host/database`)
4. Note: Free tier includes:
   - 10 GB storage
   - Unlimited queries
   - Automatic connection pooling

#### Supabase Auth (Authentication)
1. Create a free account at https://supabase.com
2. Create a new project named "auto-insurance-auth"
3. Navigate to Settings > API
4. Save the following:
   - Project URL (e.g., `https://xyz.supabase.co`)
   - `anon` public key
   - `service_role` secret key (for backend)
5. Note: Free tier includes:
   - 50,000 monthly active users
   - Social OAuth providers
   - Email/password auth
   - Row Level Security (RLS)

### 1.3 Recommended Development Tools

- **VS Code** (https://code.visualstudio.com/)

  Recommended Extensions:
  - **ESLint** (`dbaeumer.vscode-eslint`) - Linting for TypeScript/JavaScript
  - **Prettier** (`esbenp.prettier-vscode`) - Code formatting
  - **TypeScript Vue Plugin** (`Vue.volar`) - TypeScript IntelliSense
  - **Path Intellisense** (`christian-kohler.path-intellisense`) - Autocomplete file paths
  - **GitLens** (`eamodio.gitlens`) - Git insights
  - **PostgreSQL** (`ckolkman.vscode-postgres`) - Database management in VS Code
  - **REST Client** (`humao.rest-client`) - Test API endpoints

- **Postman or Insomnia** - API testing (optional, REST Client extension works too)
- **TablePlus or DBeaver** - Database GUI (optional, for visual database management)

---

## 2. Project Setup

### 2.1 Clone the Repository

```bash
# Clone the repository
git clone <repository-url> auto-insurance-demo
cd auto-insurance-demo

# Checkout the feature branch
git checkout 001-auto-insurance-flow

# OR create the branch if it doesn't exist
git checkout -b 001-auto-insurance-flow
```

### 2.2 Install Dependencies

#### Frontend Dependencies (React 18 + Vite)

```bash
# Install root dependencies (frontend)
npm install

# Dependencies installed:
# - React 18.2 + React DOM
# - React Router 7.6.2
# - Canary Design System 3.12.2
# - TypeScript 5.8.3
# - Vite 7.0
```

#### Backend Dependencies (NestJS)

```bash
# Navigate to backend directory (will be created)
mkdir -p backend
cd backend

# Initialize NestJS project
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/swagger
npm install drizzle-orm @neondatabase/serverless
npm install @supabase/supabase-js
npm install class-validator class-transformer
npm install zod

# Install dev dependencies
npm install -D @nestjs/cli @nestjs/testing
npm install -D typescript @types/node
npm install -D vitest @vitest/ui
npm install -D drizzle-kit

# Go back to root
cd ..
```

### 2.3 Environment Variables Setup

#### Frontend Environment Variables

Create `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_MOCK_SERVICES=true
VITE_MOCK_SCENARIO=realistic

# Environment
VITE_ENV=development
```

Create `.env.example` for team reference:

```bash
# Copy example to create your .env
cp .env.example .env
```

#### Backend Environment Variables

Create `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/backend/.env`:

```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DATABASE_POOL_SIZE=20

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# JWT Configuration
JWT_SECRET=your-local-jwt-secret-generate-with-openssl
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Mock Services Configuration
MOCK_SERVICES_ENABLED=true
MOCK_VIN_DECODER_DELAY_MS=800
MOCK_PAYMENT_GATEWAY_DELAY_MS=2000
MOCK_EMAIL_SERVICE_DELAY_MS=300

# Rating Engine
RATING_ENGINE_URL=http://localhost:3001/api/rate
RATING_CACHE_TTL_SECONDS=3600

# Redis (optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Logging
LOG_LEVEL=debug
LOG_PRETTY=true
```

Create `.env.example` for backend:

```bash
cd backend
cp .env.example .env
```

**Generate JWT Secrets:**

```bash
# Generate a secure JWT secret
openssl rand -base64 32

# Paste the output into JWT_SECRET in backend/.env
```

### 2.4 Database Setup (Neon Connection)

#### Configure Neon Connection String

1. Log into Neon (https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the connection string (Pooled connection recommended)
5. Paste into `backend/.env` as `DATABASE_URL`

Example:
```bash
DATABASE_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Test Database Connection

```bash
cd backend
npx drizzle-kit studio

# This should open Drizzle Studio at http://localhost:4983
# If successful, you can connect to your Neon database
```

### 2.5 Supabase Auth Configuration

#### Configure Supabase Client (Frontend)

The frontend uses Supabase for authentication. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`.

#### Configure Supabase Admin (Backend)

The backend uses the service role key for admin operations. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `backend/.env`.

#### Enable Email Authentication

1. Log into Supabase Dashboard
2. Navigate to Authentication > Providers
3. Enable "Email" provider
4. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

#### Set Up Row Level Security (Future Enhancement)

For now, RLS is disabled for development. In production, enable RLS policies to secure data access.

---

## 3. Database Migration

### 3.1 Initialize Drizzle Migrations

Create Drizzle configuration file at `backend/drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/*.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### 3.2 Create OMG P&C Schema Migrations

#### Step 1: Define Entity Schemas

Create schema files in `backend/src/database/schema/`:

**Core Party Entities** (`party.schema.ts`):
- `party` - Central entity for persons/organizations
- `person` - Person subtype
- `communication_identity` - Contact methods
- `geographic_location` - Locations and jurisdictions
- `location_address` - Physical addresses

**Account & Product Entities** (`account.schema.ts`):
- `account` - Customer relationship container
- `product` - Insurance offerings
- `user_account` - Authentication extension

**Policy & Coverage Entities** (`policy.schema.ts`):
- `agreement` - Base contract entity
- `policy` - Insurance policy (subtype)
- `policy_coverage_detail` - Coverage associations
- `policy_limit` - Coverage limits
- `policy_deductible` - Deductibles
- `policy_amount` - Premiums, taxes, fees
- `event` - Base event entity
- `policy_event` - Policy lifecycle events
- `assessment` - Underwriting assessments
- `coverage_part` - Coverage categories
- `coverage_type` - Coverage types
- `coverage_group` - Coverage groupings
- `coverage` - Specific coverages
- `document` - Policy documents

**Insurable Object Entities** (`insurable-object.schema.ts`):
- `insurable_object` - Base entity
- `vehicle` - Automobile subtype

**Rating Engine Entities** (`rating.schema.ts`):
- `rating_factor` - Rating variables
- `rating_table` - Lookup tables
- `discount` - Premium reductions
- `surcharge` - Premium increases
- `premium_calculation` - Calculation audit trail

**Claims Entities** (`claim.schema.ts`):
- `claim` - Claim requests
- `claim_party_role` - Claim participants
- `claim_event` - Claim lifecycle events

**Payment Entities** (`payment.schema.ts`):
- `payment` - Payment transactions

**Reference Data** (`reference.schema.ts`):
- `state` - US states
- `party_role` - Party role codes

#### Step 2: Generate Migration Files

```bash
cd backend

# Generate migration from schema
npx drizzle-kit generate

# This creates migration SQL files in src/database/migrations/
```

#### Step 3: Run Migrations

```bash
# Apply migrations to Neon database
npx drizzle-kit migrate

# Verify migration success
npx drizzle-kit studio
```

### 3.3 Seed Rating Tables

Create seed script at `backend/src/database/seeds/rating-tables.seed.ts`:

```typescript
import { db } from '../connection';
import { ratingTable } from '../schema/rating.schema';

export async function seedRatingTables() {
  console.log('Seeding rating tables...');

  // Seed liability base rates by age group
  await db.insert(ratingTable).values({
    table_name: 'liability_base_rates',
    coverage_part_code: 'LIABILITY',
    state_code: 'CA',
    effective_date: new Date('2025-01-01'),
    expiration_date: new Date('2025-12-31'),
    table_data: {
      age_groups: {
        '16-24': { base_rate: 1800.00, multiplier: 2.5 },
        '25-34': { base_rate: 1200.00, multiplier: 1.5 },
        '35-54': { base_rate: 900.00, multiplier: 1.0 },
        '55-64': { base_rate: 950.00, multiplier: 1.1 },
        '65+': { base_rate: 1100.00, multiplier: 1.3 }
      }
    }
  });

  // Seed collision rates by vehicle symbol
  await db.insert(ratingTable).values({
    table_name: 'collision_vehicle_symbols',
    coverage_part_code: 'COLLISION',
    state_code: 'CA',
    effective_date: new Date('2025-01-01'),
    expiration_date: new Date('2025-12-31'),
    table_data: {
      symbols: {
        '1-10': { multiplier: 0.8 },
        '11-20': { multiplier: 1.0 },
        '21-30': { multiplier: 1.3 },
        '31-40': { multiplier: 1.6 },
        '41-50': { multiplier: 2.0 }
      }
    }
  });

  // Seed territory factors by ZIP code
  await db.insert(ratingTable).values({
    table_name: 'territory_factors',
    coverage_part_code: 'LIABILITY',
    state_code: 'CA',
    effective_date: new Date('2025-01-01'),
    expiration_date: new Date('2025-12-31'),
    table_data: {
      territories: {
        'CA-LA-01': { multiplier: 1.5, description: 'Los Angeles Metro' },
        'CA-SF-01': { multiplier: 1.6, description: 'San Francisco Metro' },
        'CA-SD-01': { multiplier: 1.3, description: 'San Diego Metro' },
        'CA-RURAL-01': { multiplier: 0.9, description: 'Rural California' }
      }
    }
  });

  console.log('Rating tables seeded successfully!');
}

// Run seed
seedRatingTables();
```

Run the seed script:

```bash
cd backend
npx tsx src/database/seeds/rating-tables.seed.ts
```

### 3.4 Seed Mock Vehicle Data

Create seed script at `backend/src/database/seeds/mock-vehicles.seed.ts`:

```typescript
export async function seedMockVehicles() {
  console.log('Seeding mock vehicle data...');

  // Common VINs for testing
  const mockVehicles = [
    {
      vin: '1HGBH41JXMN109186',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      body_style: 'Sedan',
      market_value: 25000,
      iso_symbol: 12,
      safety_rating: 5
    },
    {
      vin: '5UXWX7C5XBA123456',
      make: 'BMW',
      model: 'X3',
      year: 2022,
      body_style: 'SUV',
      market_value: 48000,
      iso_symbol: 25,
      safety_rating: 5
    },
    {
      vin: '1G1ZD5ST4LF123456',
      make: 'Chevrolet',
      model: 'Malibu',
      year: 2021,
      body_style: 'Sedan',
      market_value: 22000,
      iso_symbol: 10,
      safety_rating: 4
    }
  ];

  // Insert mock data (implementation depends on your schema)
  console.log('Mock vehicle data seeded successfully!');
}

seedMockVehicles();
```

### 3.5 Seed Coverage Products

Create seed script at `backend/src/database/seeds/coverage-products.seed.ts`:

```typescript
export async function seedCoverageProducts() {
  console.log('Seeding coverage products...');

  // Create product
  const productId = crypto.randomUUID();
  await db.insert(product).values({
    product_identifier: productId,
    licensed_product_name: 'Personal Auto Insurance',
    product_description: 'Comprehensive auto insurance for personal vehicles',
    line_of_business_identifier: 'PERSONAL_AUTO'
  });

  // Create coverage parts
  const coverageParts = [
    { code: 'LIABILITY', name: 'Liability Coverage' },
    { code: 'COLLISION', name: 'Collision Coverage' },
    { code: 'COMPREHENSIVE', name: 'Comprehensive Coverage' },
    { code: 'PIP', name: 'Personal Injury Protection' },
    { code: 'UM', name: 'Uninsured Motorist' },
    { code: 'UIM', name: 'Underinsured Motorist' }
  ];

  for (const part of coverageParts) {
    await db.insert(coveragePart).values({
      coverage_part_code: part.code,
      coverage_part_name: part.name
    });
  }

  // Create specific coverages
  const coverages = [
    {
      coverage_part_code: 'LIABILITY',
      coverage_name: 'Bodily Injury Liability',
      coverage_description: 'Covers injuries to others in an accident you cause'
    },
    {
      coverage_part_code: 'LIABILITY',
      coverage_name: 'Property Damage Liability',
      coverage_description: 'Covers damage to others\' property in an accident you cause'
    },
    {
      coverage_part_code: 'COLLISION',
      coverage_name: 'Collision',
      coverage_description: 'Covers damage to your vehicle from collisions'
    },
    {
      coverage_part_code: 'COMPREHENSIVE',
      coverage_name: 'Comprehensive',
      coverage_description: 'Covers damage to your vehicle from non-collision events'
    }
  ];

  for (const cov of coverages) {
    await db.insert(coverage).values({
      coverage_identifier: crypto.randomUUID(),
      coverage_part_code: cov.coverage_part_code,
      coverage_type_identifier: crypto.randomUUID(),
      coverage_name: cov.coverage_name,
      coverage_description: cov.coverage_description
    });
  }

  console.log('Coverage products seeded successfully!');
}

seedCoverageProducts();
```

---

## 4. Development Workflow

### 4.1 Start Backend Server (NestJS)

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# The server will start on http://localhost:3000
# API endpoints available at http://localhost:3000/api
```

Verify backend is running:

```bash
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-17T..."}
```

### 4.2 Start Frontend Dev Server (Vite)

```bash
# From project root
npm run dev

# The dev server will start on http://localhost:5173
# Open your browser to http://localhost:5173
```

### 4.3 Access the Application

**Frontend Application:**
- URL: http://localhost:5173
- Hot reload enabled (changes reflect immediately)

**Backend API:**
- URL: http://localhost:3000/api
- Swagger API docs: http://localhost:3000/api/docs

**Database GUI (Drizzle Studio):**
```bash
cd backend
npx drizzle-kit studio

# Opens at http://localhost:4983
```

### 4.4 Development Checklist

When starting development each day:

1. Start backend server: `cd backend && npm run start:dev`
2. Start frontend dev server: `npm run dev` (from root)
3. Open Drizzle Studio (optional): `npx drizzle-kit studio`
4. Open browser to http://localhost:5173
5. Check backend health: http://localhost:3000/api/health

---

## 5. Project Structure Walkthrough

### 5.1 Frontend Structure (`/src/`)

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── quote/          # Quote generation components
│   │   ├── VehicleForm.tsx
│   │   ├── DriverForm.tsx
│   │   └── QuoteDisplay.tsx
│   ├── policy/         # Policy binding components
│   │   ├── PaymentForm.tsx
│   │   └── PolicyConfirmation.tsx
│   └── portal/         # Self-service portal components
│       ├── Dashboard.tsx
│       ├── PolicyDetails.tsx
│       ├── BillingHistory.tsx
│       └── ClaimForm.tsx
│
├── pages/              # Route pages
│   ├── Home.tsx
│   ├── QuotePage.tsx
│   ├── BindPolicyPage.tsx
│   ├── PortalPage.tsx
│   └── LoginPage.tsx
│
├── services/           # API service layer
│   ├── api.ts         # Axios instance configuration
│   ├── quoteService.ts
│   ├── policyService.ts
│   ├── authService.ts
│   └── mockServices/   # Mock service implementations
│       ├── vinDecoder.ts
│       ├── paymentGateway.ts
│       └── emailService.ts
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useQuote.ts
│   ├── usePolicy.ts
│   └── useMockScenario.ts
│
├── types/              # TypeScript type definitions
│   ├── omg/           # OMG entity types
│   │   ├── party.types.ts
│   │   ├── policy.types.ts
│   │   ├── coverage.types.ts
│   │   └── vehicle.types.ts
│   ├── api.types.ts   # API request/response types
│   └── app.types.ts   # Application types
│
├── utils/              # Utility functions
│   ├── validation.ts  # Input validation
│   ├── formatting.ts  # Data formatting
│   └── constants.ts   # App constants
│
├── store/              # State management (TanStack Query)
│   ├── queries/       # React Query queries
│   │   ├── quoteQueries.ts
│   │   └── policyQueries.ts
│   └── mutations/     # React Query mutations
│       ├── quoteMutations.ts
│       └── policyMutations.ts
│
├── App.tsx            # Root component
├── main.tsx           # Application entry point
└── router.tsx         # React Router configuration
```

### 5.2 Backend Structure (`/backend/`)

```
backend/
├── src/
│   ├── main.ts                 # NestJS application entry point
│   ├── app.module.ts           # Root application module
│   │
│   ├── modules/                # Feature modules
│   │   ├── quote/
│   │   │   ├── quote.module.ts
│   │   │   ├── quote.controller.ts
│   │   │   ├── quote.service.ts
│   │   │   └── dto/
│   │   │       ├── create-quote.dto.ts
│   │   │       └── quote-response.dto.ts
│   │   │
│   │   ├── policy/
│   │   │   ├── policy.module.ts
│   │   │   ├── policy.controller.ts
│   │   │   ├── policy.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── rating/             # Rating engine module
│   │   │   ├── rating.module.ts
│   │   │   ├── rating.service.ts
│   │   │   ├── calculator.service.ts
│   │   │   └── factors/
│   │   │       ├── vehicle-factors.ts
│   │   │       ├── driver-factors.ts
│   │   │       └── location-factors.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   │
│   │   ├── portal/
│   │   │   ├── portal.module.ts
│   │   │   ├── portal.controller.ts
│   │   │   └── portal.service.ts
│   │   │
│   │   └── claims/
│   │       ├── claims.module.ts
│   │       ├── claims.controller.ts
│   │       └── claims.service.ts
│   │
│   ├── database/               # Database layer
│   │   ├── connection.ts       # Drizzle database connection
│   │   ├── schema/             # Drizzle schemas (27 OMG core + 6 rating engine = 33 total)
│   │   │   ├── party.schema.ts
│   │   │   ├── account.schema.ts
│   │   │   ├── policy.schema.ts
│   │   │   ├── insurable-object.schema.ts
│   │   │   ├── rating.schema.ts
│   │   │   ├── claim.schema.ts
│   │   │   ├── payment.schema.ts
│   │   │   └── reference.schema.ts
│   │   │
│   │   ├── migrations/         # Generated SQL migrations
│   │   └── seeds/              # Database seed scripts
│   │       ├── rating-tables.seed.ts
│   │       ├── mock-vehicles.seed.ts
│   │       └── coverage-products.seed.ts
│   │
│   ├── mock-services/          # Mock external services
│   │   ├── vin-decoder.service.ts
│   │   ├── payment-gateway.service.ts
│   │   ├── email.service.ts
│   │   └── vehicle-valuation.service.ts
│   │
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/           # Exception filters
│   │   ├── interceptors/      # Request/response interceptors
│   │   └── validators/        # Custom validators
│   │
│   └── config/                 # Configuration
│       ├── database.config.ts
│       ├── supabase.config.ts
│       └── app.config.ts
│
├── test/                       # Test files
│   ├── unit/
│   └── integration/
│
├── drizzle.config.ts           # Drizzle configuration
├── tsconfig.json               # TypeScript configuration
├── package.json
└── .env                        # Environment variables
```

### 5.3 Database Files (`/backend/src/database/`)

Key files to understand:

**Connection Setup** (`connection.ts`):
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

**Schema Organization:**
- Each OMG entity domain has its own schema file
- All schemas export Drizzle table definitions
- Relationships defined using foreign keys
- UUID primary keys for all entities

**Migration Files:**
- Generated automatically from schemas
- Located in `migrations/` directory
- Applied in chronological order
- Never edit manually

### 5.4 Shared Types

Types are shared between frontend and backend using TypeScript:

**Option 1: Monorepo with Shared Package**
```
packages/
├── shared-types/
│   ├── omg/
│   ├── api/
│   └── index.ts
```

**Option 2: Type Generation from Backend**
```bash
# Generate types from Drizzle schema
npx drizzle-kit generate:types

# Copy types to frontend
cp backend/src/database/schema/types.ts src/types/omg/
```

**Option 3: API Contract with OpenAPI**
- Backend exposes OpenAPI spec at `/api/docs-json`
- Generate TypeScript types using `openapi-typescript`

---

## 6. Common Tasks

### 6.1 Adding a New OMG Entity

**Example: Adding `Vehicle Driver` entity**

1. **Define Schema** (`backend/src/database/schema/vehicle-driver.schema.ts`):

```typescript
import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const vehicleDriver = pgTable('vehicle_driver', {
  vehicle_driver_identifier: uuid('vehicle_driver_identifier').primaryKey(),
  vehicle_identifier: uuid('vehicle_identifier').notNull(),
  person_identifier: uuid('person_identifier').notNull(),
  begin_date: timestamp('begin_date').notNull(),
  end_date: timestamp('end_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const vehicleDriverRelations = relations(vehicleDriver, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [vehicleDriver.vehicle_identifier],
    references: [vehicle.insurable_object_identifier]
  }),
  person: one(person, {
    fields: [vehicleDriver.person_identifier],
    references: [person.person_identifier]
  })
}));
```

2. **Generate and Run Migration**:

```bash
cd backend
npx drizzle-kit generate
npx drizzle-kit migrate
```

3. **Create TypeScript Type**:

```typescript
export type VehicleDriver = {
  vehicle_driver_identifier: string;
  vehicle_identifier: string;
  person_identifier: string;
  begin_date: Date;
  end_date?: Date;
};
```

4. **Create Service Methods**:

```typescript
// In vehicle.service.ts
async addDriverToVehicle(
  vehicleId: string,
  personId: string
): Promise<VehicleDriver> {
  return await db.insert(vehicleDriver).values({
    vehicle_driver_identifier: crypto.randomUUID(),
    vehicle_identifier: vehicleId,
    person_identifier: personId,
    begin_date: new Date()
  });
}
```

### 6.2 Creating a New API Endpoint

**Example: GET /api/quotes/:quoteId**

1. **Create DTO** (`backend/src/modules/quote/dto/quote-response.dto.ts`):

```typescript
export class QuoteResponseDto {
  policy_identifier: string;
  policy_number: string;
  status_code: string;
  effective_date: string;
  expiration_date: string;
  premium: {
    total: number;
    breakdown: {
      liability: number;
      collision: number;
      comprehensive: number;
    };
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
}
```

2. **Add Controller Method** (`quote.controller.ts`):

```typescript
@Get(':quoteId')
@ApiOperation({ summary: 'Get quote by ID' })
@ApiResponse({ status: 200, type: QuoteResponseDto })
async getQuote(
  @Param('quoteId') quoteId: string
): Promise<QuoteResponseDto> {
  return this.quoteService.getQuote(quoteId);
}
```

3. **Implement Service Method** (`quote.service.ts`):

```typescript
async getQuote(quoteId: string): Promise<QuoteResponseDto> {
  const quote = await db.query.policy.findFirst({
    where: eq(policy.policy_identifier, quoteId),
    with: {
      coverageDetails: true,
      amounts: true,
      vehicle: true
    }
  });

  if (!quote) {
    throw new NotFoundException(`Quote ${quoteId} not found`);
  }

  return this.mapToDto(quote);
}
```

4. **Test the Endpoint**:

```bash
# Using curl
curl http://localhost:3000/api/quotes/550e8400-e29b-41d4-a716-446655440000

# Using REST Client in VS Code
### Get Quote
GET http://localhost:3000/api/quotes/550e8400-e29b-41d4-a716-446655440000
```

### 6.3 Adding a New Frontend Page

**Example: Adding Policy Details Page**

1. **Create Page Component** (`src/pages/PolicyDetailsPage.tsx`):

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { policyService } from '../services/policyService';

export const PolicyDetailsPage: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => policyService.getPolicyById(policyId!)
  });

  if (isLoading) return <div>Loading...</div>;
  if (!policy) return <div>Policy not found</div>;

  return (
    <div>
      <h1>Policy Details</h1>
      <p>Policy Number: {policy.policy_number}</p>
      <p>Status: {policy.status_code}</p>
      {/* ... more details */}
    </div>
  );
};
```

2. **Add Route** (`src/router.tsx`):

```tsx
import { PolicyDetailsPage } from './pages/PolicyDetailsPage';

const router = createBrowserRouter([
  // ... existing routes
  {
    path: '/portal/policy/:policyId',
    element: <PolicyDetailsPage />
  }
]);
```

3. **Create Service Method** (`src/services/policyService.ts`):

```typescript
export const policyService = {
  async getPolicyById(policyId: string): Promise<Policy> {
    const response = await api.get(`/policies/${policyId}`);
    return response.data;
  }
};
```

### 6.4 Running Tests

#### Backend Tests (Vitest)

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test quote.service.test.ts
```

#### Frontend Tests (Vitest + React Testing Library)

```bash
# From root directory
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 6.5 Building for Production

#### Build Frontend

```bash
# From root
npm run build

# Output: dist/ directory
# Contains optimized static files
```

#### Build Backend

```bash
cd backend

# Build TypeScript to JavaScript
npm run build

# Output: dist/ directory
# Run with: node dist/main.js
```

---

## 7. Mock Services Usage

All external integrations are mocked for demonstration purposes. This section explains how to use and test the mock services.

### 7.1 Test VIN Numbers

Use these VINs for testing the VIN decoder mock service:

**Valid Test VINs:**

```typescript
// Honda Civic 2023 - Standard risk
VIN: '1HGBH41JXMN109186'
Make: Honda
Model: Civic
Year: 2023
ISO Symbol: 12
Safety Rating: 5
Market Value: $25,000

// BMW X3 2022 - Higher risk (luxury)
VIN: '5UXWX7C5XBA123456'
Make: BMW
Model: X3
Year: 2022
ISO Symbol: 25
Safety Rating: 5
Market Value: $48,000

// Chevrolet Malibu 2021 - Standard risk
VIN: '1G1ZD5ST4LF123456'
Make: Chevrolet
Model: Malibu
Year: 2021
ISO Symbol: 10
Safety Rating: 4
Market Value: $22,000
```

**Invalid VIN Scenarios:**

```typescript
// Invalid format (wrong length)
VIN: '1HGBH41JXMN10'
Error: "VIN must be exactly 17 characters"

// Invalid characters (contains I, O, Q)
VIN: '1HGBH41JXMN10918I'
Error: "VIN contains invalid characters (I, O, Q not allowed)"

// VIN not found (triggers manual entry fallback)
VIN: 'UNKNOWNVIN1234567'
Response: { found: false, manual_entry_required: true }
```

### 7.2 Test Payment Cards (Stripe Patterns)

The mock payment gateway uses Stripe's test card patterns:

**Credit Card Tests:**

```typescript
// Success - Visa
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Result: COMPLETED

// Decline - Generic decline
Card: 4000 0000 0000 0002
Result: FAILED (card_declined)

// Insufficient funds
Card: 4000 0000 0000 9995
Result: FAILED (insufficient_funds)

// Expired card
Card: 4000 0000 0000 0069
Result: FAILED (expired_card)

// 3D Secure required
Card: 4000 0025 0000 3155
Result: Requires 3DS authentication (simulated)
```

**ACH/Bank Account Tests:**

```typescript
// Success
Routing Number: 110000000
Account Number: 000123456789
Result: COMPLETED

// Decline
Routing Number: 110000001
Account Number: 000123456789
Result: FAILED (insufficient_funds)
```

### 7.3 Email Preview Access

Emails are not sent externally. Instead, they are displayed in-app or logged:

**Option 1: In-App Email Preview**

Navigate to the debug panel to view all "sent" emails:

```
http://localhost:5173/debug/emails
```

**Option 2: Console Logging**

Check the backend console for email content:

```bash
[EmailService] Email sent to user@example.com
Subject: Welcome to Your Insurance Portal
Body:
  Dear John Doe,

  Your auto insurance policy has been successfully bound!
  Policy Number: POL-2025-123456

  Login to your portal: http://localhost:5173/portal
  Email: user@example.com
  Temporary Password: [generated]
```

**Option 3: Database Email Log**

Query the `email_log` table (if implemented):

```sql
SELECT * FROM email_log ORDER BY created_at DESC LIMIT 10;
```

### 7.4 Error Scenario Testing (URL Parameters)

Control mock service behavior using URL query parameters:

**Mock Scenario Parameter:**

```typescript
// Happy path (all services succeed)
http://localhost:5173/quote?mockScenario=happy-path

// Network issues (30% failure rate)
http://localhost:5173/quote?mockScenario=network-issues

// Validation errors (40% validation failures)
http://localhost:5173/quote?mockScenario=validation-errors

// Server errors (30% 500 errors)
http://localhost:5173/quote?mockScenario=server-errors

// Realistic (5% mixed errors - default)
http://localhost:5173/quote?mockScenario=realistic
```

**Delay Simulation:**

```typescript
// Fast responses (100ms delay)
http://localhost:5173/quote?mockDelay=fast

// Normal responses (500-1000ms delay)
http://localhost:5173/quote?mockDelay=normal

// Slow responses (2000-3000ms delay)
http://localhost:5173/quote?mockDelay=slow
```

**Combine Parameters:**

```
http://localhost:5173/quote?mockScenario=network-issues&mockDelay=slow
```

---

## 8. Debugging Tips

### 8.1 Backend API Logging

**Enable Debug Logging** (backend/.env):

```bash
LOG_LEVEL=debug
LOG_PRETTY=true
```

**View Logs:**

```bash
cd backend
npm run start:dev

# Logs will show:
# [NestJS] Request: POST /api/quotes
# [QuoteService] Calculating premium for vehicle: Honda Civic 2023
# [RatingEngine] Applied factors: vehicle=1.2, driver=1.5, location=1.3
# [NestJS] Response: 200 { policy_identifier: '...', premium: 1248.75 }
```

**Log Specific Service:**

```typescript
import { Logger } from '@nestjs/common';

export class QuoteService {
  private readonly logger = new Logger(QuoteService.name);

  async createQuote(dto: CreateQuoteDto) {
    this.logger.debug(`Creating quote for VIN: ${dto.vin}`);
    // ... service logic
    this.logger.log(`Quote created: ${quote.policy_number}`);
  }
}
```

### 8.2 Frontend DevTools

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props, state, and hooks
- Trace component re-renders

**TanStack Query DevTools:**

Add to `App.tsx`:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

Access at: http://localhost:5173 (bottom-left corner icon)

Features:
- View all queries and mutations
- See cached data
- Trigger refetch manually
- Monitor loading states

**Browser Console:**

Enable verbose logging:

```typescript
// In main.tsx or App.tsx
if (import.meta.env.DEV) {
  localStorage.setItem('debug', 'app:*');
}
```

### 8.3 Database Query Inspection (Drizzle Studio)

**Start Drizzle Studio:**

```bash
cd backend
npx drizzle-kit studio

# Opens at http://localhost:4983
```

**Features:**
- Visual database browser
- View all tables and relationships
- Run custom SQL queries
- Edit data directly (use with caution)
- View entity relationships graph

**Query Examples:**

```sql
-- Find all quotes created today
SELECT * FROM policy
WHERE status_code = 'QUOTED'
AND created_at >= CURRENT_DATE;

-- Get policy with full coverage details
SELECT
  p.policy_number,
  p.status_code,
  pcd.coverage_identifier,
  c.coverage_name,
  pl.limit_value,
  pd.deductible_value
FROM policy p
JOIN policy_coverage_detail pcd ON p.policy_identifier = pcd.policy_identifier
JOIN coverage c ON pcd.coverage_identifier = c.coverage_identifier
LEFT JOIN policy_limit pl ON pcd.policy_coverage_detail_identifier = pl.policy_coverage_detail_identifier
LEFT JOIN policy_deductible pd ON pcd.policy_coverage_detail_identifier = pd.policy_coverage_detail_identifier
WHERE p.policy_number = 'Q-2025-123456';
```

### 8.4 Mock Service Debug Panel

**Access Debug Panel:**

```
http://localhost:5173/debug
```

**Features:**
- View all mock service calls
- See request/response payloads
- Toggle success/failure scenarios
- Adjust response delays
- Clear mock service cache

**Example Debug Panel Implementation:**

```tsx
export const MockServiceDebugPanel = () => {
  const { calls, cache, scenarios } = useMockServiceDebug();

  return (
    <div>
      <h2>Mock Service Debug Panel</h2>

      <section>
        <h3>Recent Calls ({calls.length})</h3>
        {calls.map(call => (
          <div key={call.id}>
            <strong>{call.service}</strong>: {call.method}
            <pre>{JSON.stringify(call.request, null, 2)}</pre>
            <pre>{JSON.stringify(call.response, null, 2)}</pre>
          </div>
        ))}
      </section>

      <section>
        <h3>Cache Status</h3>
        <p>VIN Decoder: {cache.vinDecoder} hits</p>
        <p>Vehicle Valuation: {cache.vehicleValuation} hits</p>
        <button onClick={clearCache}>Clear Cache</button>
      </section>

      <section>
        <h3>Scenarios</h3>
        <select onChange={(e) => setScenario(e.target.value)}>
          <option value="realistic">Realistic (default)</option>
          <option value="happy-path">Happy Path</option>
          <option value="network-issues">Network Issues</option>
          <option value="validation-errors">Validation Errors</option>
        </select>
      </section>
    </div>
  );
};
```

### 8.5 Cache Debug Panel

**View Cache Status:**

```
http://localhost:5173/debug/cache
```

**Features:**
- View TanStack Query cache
- See all cached queries
- Inspect stale/fresh status
- Manually invalidate cache
- View cache size and memory usage

**Invalidate Specific Cache:**

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate all quote queries
queryClient.invalidateQueries({ queryKey: ['quotes'] });

// Invalidate specific quote
queryClient.invalidateQueries({ queryKey: ['quote', quoteId] });

// Clear all cache
queryClient.clear();
```

---

## 9. Troubleshooting

### 9.1 Common Setup Errors

#### Error: "Module not found: @sureapp/canary-design-system"

**Cause:** Canary Design System requires authentication to install from npm registry.

**Solution:**

1. Run the setup script:
```bash
npm run setup-npmrc
```

2. Enter your Canary npm token when prompted

3. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Cannot find module 'drizzle-orm'"

**Cause:** Backend dependencies not installed.

**Solution:**

```bash
cd backend
npm install
```

#### Error: "Port 3000 already in use"

**Cause:** Another process is using port 3000.

**Solution:**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change backend port in backend/.env
PORT=3001
```

### 9.2 Database Connection Issues

#### Error: "Connection refused to Neon database"

**Cause:** Invalid connection string or firewall blocking connection.

**Solution:**

1. Verify connection string in `backend/.env`:
```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

2. Ensure `?sslmode=require` is appended

3. Test connection:
```bash
cd backend
npx drizzle-kit studio
```

4. Check Neon dashboard for database status

#### Error: "SSL connection required"

**Cause:** Neon requires SSL connections.

**Solution:**

Add `?sslmode=require` to your connection string:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### Error: "Too many connections"

**Cause:** Exceeded Neon's connection limit.

**Solution:**

Use the pooled connection string (ends with `-pooler`):

```bash
# Instead of:
DATABASE_URL=postgresql://user:password@ep-name.region.aws.neon.tech/neondb

# Use:
DATABASE_URL=postgresql://user:password@ep-name-pooler.region.aws.neon.tech/neondb
```

### 9.3 Authentication Problems

#### Error: "Supabase client not initialized"

**Cause:** Missing or invalid Supabase environment variables.

**Solution:**

1. Check `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. Verify keys in Supabase Dashboard > Settings > API

3. Restart dev server:
```bash
npm run dev
```

#### Error: "JWT token expired"

**Cause:** Access token expired (default: 1 hour).

**Solution:**

1. Implement token refresh in `authService.ts`:

```typescript
export const refreshAccessToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data.session;
};
```

2. Add interceptor to automatically refresh:

```typescript
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshAccessToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### Error: "User already exists"

**Cause:** Attempting to create duplicate user account.

**Solution:**

1. Check if user exists before creating:

```typescript
const { data: existingUser } = await supabase.auth.admin.listUsers();
const userExists = existingUser?.users.find(u => u.email === email);

if (userExists) {
  // Handle existing user (login instead of signup)
}
```

2. Use Supabase's upsert pattern for user_account table

### 9.4 CORS Errors

#### Error: "Access-Control-Allow-Origin header missing"

**Cause:** Backend not configured to allow frontend origin.

**Solution:**

1. Enable CORS in NestJS (`main.ts`):

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  await app.listen(3000);
}
bootstrap();
```

2. Restart backend server

### 9.5 Missing Environment Variables

#### Error: "process.env.VITE_API_BASE_URL is undefined"

**Cause:** Environment variable not set or not prefixed with `VITE_`.

**Solution:**

1. Ensure all frontend env vars start with `VITE_`:

```bash
# ✅ Correct
VITE_API_BASE_URL=http://localhost:3000/api

# ❌ Wrong (won't be accessible in frontend)
API_BASE_URL=http://localhost:3000/api
```

2. Restart dev server after changing `.env`:

```bash
npm run dev
```

3. Verify env vars are loaded:

```typescript
console.log(import.meta.env.VITE_API_BASE_URL);
```

#### Error: "Cannot read property 'DATABASE_URL' of undefined"

**Cause:** Backend .env file missing or not loaded.

**Solution:**

1. Create `backend/.env` file (see section 2.3)

2. Install dotenv (if not using NestJS ConfigModule):

```bash
cd backend
npm install dotenv
```

3. Load in `main.ts`:

```typescript
import * as dotenv from 'dotenv';
dotenv.config();
```

4. Or use NestJS ConfigModule (recommended):

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    })
  ]
})
export class AppModule {}
```

---

## 10. Resources

### 10.1 Project Documentation

- **Feature Specification**: `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/specs/001-auto-insurance-flow/spec.md`
- **Research Decisions**: `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/specs/001-auto-insurance-flow/research.md`
- **Data Model**: `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/specs/001-auto-insurance-flow/data-model.md`
- **Product Requirements**: `/Users/jasonnguyen/CascadeProjects/auto-prototype-master/Product Requirements`

### 10.2 API Contracts

**OpenAPI/Swagger Documentation:**
- URL: http://localhost:3000/api/docs
- JSON: http://localhost:3000/api/docs-json

**Key Endpoints:**

```
POST   /api/quotes              # Create new quote
GET    /api/quotes/:quoteId     # Get quote by ID
POST   /api/quotes/:quoteId/bind # Bind quote to policy
GET    /api/policies/:policyId  # Get policy details
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # User login
GET    /api/portal/policies     # Get user's policies
POST   /api/portal/claims       # File new claim
GET    /api/portal/billing      # Get billing history
```

### 10.3 OMG P&C Data Model Documentation

**Official OMG Specification:**
- URL: https://www.omg.org/spec/PC/1.0/PDF
- Download: https://www.omg.org/spec/PC/1.0/

**Key OMG Entities Implemented (33 total: 27 OMG core + 6 rating engine):**

| Category | Entities |
|----------|----------|
| **Party** | Party, Person, Communication Identity, Geographic Location, Location Address |
| **Account** | Account, Product, User Account |
| **Policy** | Agreement, Policy, Policy Coverage Detail, Policy Limit, Policy Deductible, Policy Amount, Event, Policy Event, Assessment, Coverage Part, Coverage Type, Coverage Group, Coverage, Document |
| **Insurable Object** | Insurable Object, Vehicle |
| **Rating** | Rating Factor, Rating Table, Discount, Surcharge, Premium Calculation |
| **Claims** | Claim, Claim Party Role, Claim Event |
| **Payment** | Payment |

### 10.4 Technology Stack Documentation

**Frontend:**
- React 18: https://react.dev/
- React Router 7: https://reactrouter.com/
- Canary Design System: https://canary.sureapp.com/
- TanStack Query: https://tanstack.com/query/latest
- Vite: https://vitejs.dev/

**Backend:**
- NestJS: https://docs.nestjs.com/
- Drizzle ORM: https://orm.drizzle.team/
- Neon PostgreSQL: https://neon.tech/docs
- Supabase Auth: https://supabase.com/docs/guides/auth

**Testing:**
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react

**TypeScript:**
- TypeScript Handbook: https://www.typescriptlang.org/docs/

### 10.5 Insurance Industry Standards

**ACORD Standards:**
- Website: https://www.acord.org/
- Auto Insurance Forms: https://www.acord.org/standards-architecture/acord-forms

**ISO Insurance Standards:**
- Commercial Lines Manual (CLM)
- General Liability Manual (GLM)
- Vehicle Symbols and Rating

**State Insurance Regulations:**
- California DOI: https://www.insurance.ca.gov/
- NAIC Model Laws: https://content.naic.org/

### 10.6 Mock Service References

**VIN Decoder Standards:**
- NHTSA VIN Decoder API: https://vpic.nhtsa.dot.gov/api/
- ISO 3779 VIN Standard
- SAE J853 VIN Standard

**Payment Gateway Patterns:**
- Stripe Test Cards: https://stripe.com/docs/testing
- Payment Card Industry (PCI) Standards

**Vehicle Valuation Services:**
- Kelley Blue Book API: https://www.kbb.com/
- NADA Guides API: https://www.nadaguides.com/
- JD Power Vehicle Valuation

**Vehicle Safety Ratings:**
- NHTSA 5-Star Ratings: https://www.nhtsa.gov/ratings
- IIHS Safety Ratings: https://www.iihs.org/ratings

### 10.7 Development Tools

**VS Code Extensions:**
- ESLint: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- Prettier: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
- REST Client: https://marketplace.visualstudio.com/items?itemName=humao.rest-client
- PostgreSQL: https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres

**Database Tools:**
- Drizzle Studio: Built-in (`npx drizzle-kit studio`)
- TablePlus: https://tableplus.com/
- DBeaver: https://dbeaver.io/

**API Testing:**
- Postman: https://www.postman.com/
- Insomnia: https://insomnia.rest/
- REST Client (VS Code): Built-in

### 10.8 Community & Support

**Getting Help:**
- NestJS Discord: https://discord.gg/nestjs
- Drizzle Discord: https://discord.gg/drizzle
- React Discord: https://discord.gg/react
- Supabase Discord: https://discord.supabase.com/

**Stack Overflow Tags:**
- `nestjs`
- `drizzle-orm`
- `neon-database`
- `supabase`
- `react-query`
- `insurance-software`

---

## Appendix A: Quick Reference Commands

### Daily Development Commands

```bash
# Start backend
cd backend && npm run start:dev

# Start frontend
npm run dev

# Open Drizzle Studio
cd backend && npx drizzle-kit studio

# Run tests
npm test                    # Frontend
cd backend && npm test      # Backend

# Build for production
npm run build               # Frontend
cd backend && npm run build # Backend
```

### Database Commands

```bash
cd backend

# Generate migration
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# View database
npx drizzle-kit studio

# Seed database
npx tsx src/database/seeds/rating-tables.seed.ts
```

### Debugging Commands

```bash
# Check backend health
curl http://localhost:3000/api/health

# Check frontend build
npm run build && npm run preview

# View logs
cd backend && npm run start:dev | grep ERROR

# Clear all caches
rm -rf node_modules backend/node_modules
rm -f package-lock.json backend/package-lock.json
npm install && cd backend && npm install
```

---

## Appendix B: Environment Variables Reference

### Frontend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJhbGc...` | Yes |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000/api` | Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000` | No |
| `VITE_ENABLE_MOCK_SERVICES` | Enable mock services | `true` | No |
| `VITE_MOCK_SCENARIO` | Default mock scenario | `realistic` | No |
| `VITE_ENV` | Environment name | `development` | No |

### Backend (backend/.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `development` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://...` | Yes |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` | Yes |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret | `your-jwt-secret` | Yes |
| `JWT_SECRET` | Local JWT secret | Generate with openssl | Yes |
| `JWT_EXPIRATION` | JWT expiration time | `7d` | No |
| `MOCK_SERVICES_ENABLED` | Enable mock services | `true` | No |
| `REDIS_URL` | Redis connection (optional) | `redis://localhost:6379` | No |
| `LOG_LEVEL` | Logging level | `debug` | No |

---

**Document Version**: 1.0
**Last Updated**: 2025-10-17
**Next Review**: Upon feature completion

**Need Help?** Create an issue in the repository or reach out to the development team.
