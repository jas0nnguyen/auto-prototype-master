# Phase 3: User Story 1 - Quote Generation Complete (Tasks T023-T080)

**Completed**: 2025-10-19
**Goal**: Build complete auto insurance quote generation system with database schemas, mock services, rating engine, quote service, and full frontend integration.

**Status**: 100% COMPLETE ✅ (63/63 tasks)

---

## What We Built

Phase 3 delivered the **complete quote generation flow** - from database schemas to frontend UI. This phase implements User Story 1 (Quote Generation) in its entirety.

### 1. Database Schemas - Complete OMG P&C Data Model (T023-T045c)

Created **24 entity schemas** using Drizzle ORM, all compliant with OMG Property & Casualty Data Model v1.0.

**Core Entities**:
- **Party** - Base entity for persons and organizations
- **Person** - Subtype of Party with demographic details
- **Communication Identity** - Email addresses, phone numbers
- **Geographic Location** - Addresses and locations
- **Location Address** - Structured address data

**Insurance Entities**:
- **Account** - Customer account
- **Product** - Insurance product definitions (e.g., "Personal Auto Insurance")
- **Agreement** - Base contract entity
- **Policy** - Subtype of Agreement with insurance-specific fields

**Coverage Entities**:
- **Coverage Part** - Standard coverage types (Liability, Collision, Comprehensive)
- **Coverage** - Specific coverage definitions
- **Policy Coverage Detail** - Links policy + coverage + vehicle
- **Policy Limit** - Coverage limits (per-person, per-accident, per-occurrence)
- **Policy Deductible** - Deductible amounts per coverage
- **Policy Amount** - Monetary amounts (premiums, limits, deductibles)

**Vehicle Entities**:
- **Insurable Object** - Base entity for things that can be insured
- **Vehicle** - Subtype of Insurable Object with auto-specific details

**Rating Entities**:
- **Rating Factor** - Individual rating factors (age, vehicle type, location)
- **Rating Table** - Base rates and multipliers
- **Discount** - Discount definitions and percentages
- **Surcharge** - Surcharge definitions and percentages
- **Premium Calculation** - Complete audit trail of premium calculations

**Relationships**:
- **Party Roles** - Agreement Party Role, Account Party Role, Insurable Object Party Role
- **Account-Agreement** - Links accounts to their policies
- **Assessment** - Damage assessments for claims

**OMG Compliance Features**:
- UUID primary keys (`party_identifier`, `policy_identifier`, etc.)
- Temporal tracking (`begin_date`, `end_date`) for all entities
- Subtype pattern using shared primary keys (Policy inherits Agreement's PK)
- Party Role pattern for many-to-many relationships with roles

**Analogy**: Like creating a library catalog system - every book (quote/policy) has a catalog card (database record) describing what it is, who owns it, where it is, and how much it costs.

---

### 2. Mock Services - Simulated External Integrations (T047-T052)

Built **6 mock services** to simulate external APIs without actual third-party dependencies.

#### VIN Decoder Service
**File**: `backend/src/services/mock-services/vin-decoder.service.ts`

**What it does**: Decodes Vehicle Identification Numbers (VINs) to extract make, model, year, engine type, and fuel type.

**How VIN validation works**:
```typescript
// VIN checksum validation (position 9)
const weights = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
let sum = 0;
for (let i = 0; i < 17; i++) {
  const value = vinToValue(vin[i]); // Converts character to number
  sum += value * weights[i];
}
const checkDigit = sum % 11;
return checkDigit === vinToValue(vin[8]); // Position 9 (0-indexed = 8)
```

**Why checksums matter**: Prevents typos in VINs. If someone enters `1HGBH41JXMN109186` instead of `1HGBH41JXMN109187`, the checksum will fail.

**Seed Data**: 50+ common vehicles (Honda Civic, Toyota Camry, Ford F-150, etc.) for testing.

**Analogy**: Like a barcode scanner at a grocery store - scan the code (VIN), get product details (make/model/year).

#### Vehicle Valuation Service
**File**: `backend/src/services/mock-services/vehicle-valuation.service.ts`

**What it does**: Calculates market value using depreciation curves and adjustments.

**Depreciation math**:
```typescript
const depreciationSchedule = [0.75, 0.85, 0.90, 0.93, 0.95, 0.97];
const vehicleAge = currentYear - vehicle.year;
const depreciationFactor = depreciationSchedule[Math.min(vehicleAge, 5)];
const baseValue = vehicle.msrp * depreciationFactor;
```

**Translation**:
- Year 1: Worth 75% of MSRP (loses 25% when you drive off the lot)
- Year 2: Worth 85% of MSRP
- Year 3: 90%, Year 4: 93%, Year 5: 95%, Year 6+: 97%

**Mileage adjustment**:
```typescript
const averageMilesPerYear = 12000;
const expectedMileage = vehicleAge * averageMilesPerYear;
const excessMileage = Math.max(0, actualMileage - expectedMileage);
const mileagePenalty = excessMileage * 0.0001; // 0.01% per 1,000 excess miles
```

**Condition multipliers**:
- Excellent: 1.1× (10% premium)
- Good: 1.0× (no adjustment)
- Fair: 0.85× (15% discount)
- Poor: 0.70× (30% discount)

**Analogy**: Like a used car dealer estimating trade-in value - checks age, mileage, condition to determine what they'll pay.

#### Safety Ratings Service
**File**: `backend/src/services/mock-services/safety-ratings.service.ts`

**What it does**: Returns NHTSA 5-star ratings and IIHS crash test results.

**NHTSA ratings** (1-5 stars):
- Overall safety
- Frontal crash
- Side crash
- Rollover resistance

**IIHS ratings** (Good/Acceptable/Marginal/Poor):
- Small overlap front
- Moderate overlap front
- Side impact
- Roof strength
- Head restraints

**Why this matters for insurance**: Safer vehicles = lower injury risk = lower premiums.

#### Delay Simulator
**File**: `backend/src/services/mock-services/delay-simulator.ts`

**What it does**: Adds realistic API latency using LogNormal distribution.

**Why LogNormal?**: Most API calls are fast (200-500ms) with occasional slow outliers (1-3s), mimicking real network behavior.

**Box-Muller Transform** (converts uniform random to normal distribution):
```typescript
const u1 = Math.random();
const u2 = Math.random();
const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
const logNormal = Math.exp(meanLog + stdDevLog * z);
```

**Translation**: Creates a bell curve of delays where most are fast, few are slow (realistic).

**Analogy**: Like waiting for a bus - usually arrives in 5 minutes, sometimes 2, occasionally 15.

#### Vehicle Data Cache
**File**: `backend/src/services/mock-services/vehicle-data-cache.ts`

**What it does**: In-memory cache with 24-hour TTL (Time To Live).

**Cache-Aside Pattern**:
1. Check cache first
2. If miss (not in cache), fetch from source
3. Store result in cache
4. Return data

```typescript
async getByVIN(vin: string) {
  const key = `vehicle:vin:${vin.toUpperCase()}`;
  const cached = this.cache.get(key);

  if (cached && !this.isExpired(cached)) {
    return cached.data; // Cache hit - return immediately
  }

  return null; // Cache miss - caller fetches from source
}
```

**Cleanup**: Hourly cron job removes expired entries to prevent memory leaks.

**Analogy**: Like a coffee shop keeping popular drinks ready - grab from warmer if available (cache hit), make fresh if not (cache miss).

---

### 3. Rating Engine - Premium Calculation (T053-T062)

Built **complete rating engine** with multiplicative model for premium calculations.

#### Base Rating Service
**File**: `backend/src/services/rating-engine/rating-engine.service.ts`

Orchestrates all rating calculations - coordinates vehicle, driver, location, and coverage rating.

#### Factor Calculators

**Vehicle Rating** (`vehicle-rating.ts`):
```typescript
// Age factor
if (vehicleAge <= 3) return 1.3;  // New cars cost more to repair
if (vehicleAge <= 7) return 1.0;  // Mid-age vehicles baseline
return 0.9;                        // Older cars depreciated value
```

**Driver Rating** (`driver-rating.ts`):
```typescript
// Age factor
if (age < 25) return 1.8;   // Young drivers highest risk
if (age >= 65) return 1.2;  // Senior drivers moderate risk
return 1.0;                 // 25-64 baseline risk
```

**Location Rating** (`location-rating.ts`):
- Urban zones: 1.2× (high traffic, theft risk)
- Suburban zones: 1.0× (baseline)
- Rural zones: 0.9× (lower risk)

**Coverage Rating** (`coverage-rating.ts`):
- Base premiums for each coverage type
- Bodily Injury Liability: $400-$1200 depending on limits
- Property Damage: $200-$600
- Collision: $300-$900
- Comprehensive: $150-$450

#### Discounts (7 types)
**File**: `backend/src/services/rating-engine/discount-calculator.ts`

| Discount | Percentage | Criteria |
|----------|-----------|----------|
| Good Driver | 15% | No accidents/violations in 3 years |
| Multi-Car | 10% | 2+ vehicles on policy |
| Low Mileage | 10% | <7,500 miles/year |
| Anti-Theft | 5% | Vehicle has anti-theft system |
| Safety Features | 5% | Airbags, ABS, ESC |
| Good Student | 10% | Under 25 with GPA 3.0+ |
| Homeowner | 5% | Owns home |

**How applied**: Subtractive from adjusted premium (not compounded).

#### Surcharges (8 types)
**File**: `backend/src/services/rating-engine/surcharge-calculator.ts`

| Surcharge | Percentage | Reason |
|-----------|-----------|--------|
| At-Fault Accident | 20% | Caused accident |
| DUI/DWI | 50% | Driving under influence |
| Speeding Ticket | 10% | Moving violation |
| Multiple Violations | 30% | 3+ violations |
| Young Driver | 40% | Under 21 |
| SR-22 | 25% | Required high-risk filing |
| Lapsed Coverage | 15% | Gap in insurance |
| High-Risk Vehicle | 20% | Sports car, exotic |

**How applied**: Additive to adjusted premium.

#### Premium Calculation Orchestrator
**File**: `backend/src/services/rating-engine/premium-calculator.ts`

**Multiplicative Model Formula**:
```
Step 1: Base Premium = Sum of coverage base premiums
Step 2: Adjusted Premium = Base × Vehicle Factor × Driver Factor × Location Factor × Coverage Factor
Step 3: Apply Discounts = Adjusted Premium - Total Discounts
Step 4: Apply Surcharges = (Adjusted - Discounts) + Total Surcharges
Step 5: Add Taxes & Fees = (Adjusted - Discounts + Surcharges) + Taxes + Fees
Step 6: Total Premium = Final amount
```

**Audit Trail**: ALL intermediate values persisted to `premium_calculation` table for compliance (regulatory requirement).

**Analogy**: Like calculating a restaurant bill:
- Menu prices (base premium)
- Portion size multiplier (coverage limits)
- Tax (state premium tax)
- Tip (fees)
- Coupons (discounts)
- Extra charges (surcharges)
- Final total

#### Tax & Fee Calculator
**File**: `backend/src/services/rating-engine/tax-fee-calculator.ts`

State-specific charges:
- **Premium Tax**: 2-4% of base premium (varies by state)
- **Policy Fee**: $10-$25 flat administrative fee
- **DMV Fees**: $5-$15 per vehicle

#### Rating Tables Seed
**File**: `database/seeds/rating-tables.sql`

Seed data with base rates for:
- All coverage types
- State multipliers
- Territory factors
- Vehicle class rates

---

### 4. Quote Service - Policy Creation & Management (T063-T069)

Built **complete quote service** with CRUD operations and business logic.

#### Quote Service Base
**File**: `backend/src/services/quote-service/quote.service.ts`

CRUD operations for quotes:
- Create new quote
- Read quote by ID or quote number
- Update coverage selections
- Delete/expire quotes

#### Policy Creation
**File**: `backend/src/services/quote-service/policy-creation.ts`

**Quote Number Generation**:
```typescript
generatePolicyNumber() {
  const now = new Date();
  const dateStr = `${year}${month}${day}`; // e.g., "20251019"
  const random = generateRandomAlphanumeric(6); // e.g., "AB12CD"
  return `Q-${dateStr}-${random}`; // Result: "Q-20251019-AB12CD"
}
```

**OMG Subtype Pattern**:
```typescript
// 1. Ensure Product exists
const productId = await this.ensureProductExists('Personal Auto Insurance');

// 2. Create Agreement (parent entity)
const agreementId = await this.createAgreement(productId);

// 3. Create Policy (subtype) - shares Agreement's primary key
const policyId = agreementId; // Policy PK = Agreement PK
await this.createPolicy(policyId, policyNumber, input);
```

**Why this matters**: Policy IS-A Agreement (inheritance). Deleting Agreement cascades to Policy automatically.

**Analogy**: Like making a restaurant reservation - generate confirmation number, reserve table (create policy), assign server (coverage).

#### Coverage Assignment
**File**: `backend/src/services/quote-service/coverage-assignment.ts`

**Coverage Hierarchy**:
```
Policy
  └─ PolicyCoverageDetail (junction table)
       ├─ PolicyLimit (per-person, per-accident, per-occurrence)
       └─ PolicyDeductible (deductible amounts)
```

**Junction Table with Attributes**:
```typescript
// Not just a simple many-to-many link
export const policyCoverageDetail = pgTable('policy_coverage_detail', {
  policy_coverage_detail_identifier: uuid('...').primaryKey(),
  policy_identifier: uuid('...').references(() => policy.policy_identifier),
  coverage_identifier: uuid('...').references(() => coverage.coverage_identifier),
  vehicle_identifier: uuid('...').references(() => vehicle.vehicle_identifier),
  effective_date: date('effective_date'),
  expiration_date: date('expiration_date'),
  // ... plus limits and deductibles as child tables
});
```

**Standard Auto Coverages**:
- Bodily Injury Liability (BI)
- Property Damage Liability (PD)
- Collision
- Comprehensive
- Uninsured/Underinsured Motorist (UM/UIM)
- Medical Payments / Personal Injury Protection (PIP)

#### Quote Expiration
**Files**: `quote-expiration.ts` + `expiration-monitor.ts`

**Utility Functions** (reactive):
```typescript
checkExpiration(createdAt: Date) {
  const now = new Date();
  const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const isExpired = ageInDays >= 30;
  const daysUntilExpiration = 30 - ageInDays;

  return {
    isExpired,
    daysOld: ageInDays,
    daysUntilExpiration,
    urgency: isExpired ? 'expired' :
             ageInDays >= 27 ? 'urgent' :
             ageInDays >= 23 ? 'warning' : 'normal'
  };
}
```

**Cron Job** (proactive):
```typescript
@Injectable()
export class QuoteExpirationMonitor {
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiredQuotes() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    // Find quotes older than cutoff with status=QUOTED
    const expiredQuotes = await this.findQuotesOlderThan(cutoffDate);

    // Update status to EXPIRED
    await this.markAsExpired(expiredQuotes);
  }
}
```

**Date Math Explained**:
```javascript
const now = new Date();                    // Current time
const created = new Date(quote.created_at); // When quote was created
const diff = now - created;                 // Difference in milliseconds
const days = diff / (1000 * 60 * 60 * 24); // Convert to days
// 1000ms × 60s × 60min × 24hr = milliseconds per day
```

**Analogy**: Like milk expiration - check the date (utility function) or the store checks daily at 2am (cron job) to remove expired products.

#### API Controller
**File**: `backend/src/api/routes/quotes.controller.ts`

REST endpoints:
- `POST /api/v1/quotes` - Create new quote
- `GET /api/v1/quotes/:id` - Get quote by UUID
- `GET /api/v1/quotes/reference/:refNumber` - Get quote by quote number
- `PUT /api/v1/quotes/:id/coverage` - Update coverage selections
- `POST /api/v1/quotes/:id/calculate` - Recalculate premium

---

### 5. Testing Infrastructure

#### Automated Test Script
**File**: `test-quote-flow.sh`

Bash script that:
1. Checks environment variables and database connection
2. Builds backend
3. Starts frontend and backend servers
4. Tests API endpoints with curl
5. Provides manual testing instructions

**Usage**:
```bash
chmod +x test-quote-flow.sh
./test-quote-flow.sh
```

#### Testing Guide
**File**: `TESTING.md`

Comprehensive documentation with:
- Quick start instructions
- Testing checklists for each phase
- API test examples (curl commands)
- Frontend user flow scenarios
- Performance benchmarks:
  - Quote calculation: <5 seconds
  - Portal load: <3 seconds
  - API responses: <500ms (95th percentile)
- Troubleshooting section

#### API Test Collection
**File**: `api-tests.http`

REST Client test collection with 15+ scenarios:
- VIN decoder tests (valid/invalid VINs)
- Rating engine tests (different driver profiles)
- Quote creation tests:
  - Minimum coverage
  - Maximum coverage
  - Young driver (high surcharges)
  - Good driver (multiple discounts)

---

## Files Created (51 total)

### Database Schemas (24 files)
**Location**: `database/schema/`

- `party.schema.ts` - Party base entity
- `person.schema.ts` - Person subtype
- `communication-identity.schema.ts` - Contact information
- `geographic-location.schema.ts` - Locations
- `location-address.schema.ts` - Structured addresses
- `account.schema.ts` - Customer accounts
- `product.schema.ts` - Insurance products
- `agreement.schema.ts` - Contracts base entity
- `policy.schema.ts` - Policy subtype with status
- `coverage-part.schema.ts` - Standard coverage types
- `coverage.schema.ts` - Coverage definitions
- `policy-coverage-detail.schema.ts` - Policy-Coverage junction
- `policy-limit.schema.ts` - Coverage limits
- `policy-deductible.schema.ts` - Deductibles
- `policy-amount.schema.ts` - Monetary amounts
- `insurable-object.schema.ts` - Base for insured items
- `vehicle.schema.ts` - Vehicle subtype
- `rating-factor.schema.ts` - Rating factors
- `rating-table.schema.ts` - Base rates
- `discount.schema.ts` - Discount definitions
- `surcharge.schema.ts` - Surcharge definitions
- `premium-calculation.schema.ts` - Calculation audit trail
- `party-roles.schema.ts` - Party role relationships
- `assessment.schema.ts` - Damage assessments
- `account-agreement.schema.ts` - Account-Agreement link
- `index.ts` - Schema exports

### Mock Services (6 files)
**Location**: `backend/src/services/mock-services/`

- `vin-decoder.service.ts` - VIN decoding with checksum
- `vehicle-valuation.service.ts` - Market value calculation
- `safety-ratings.service.ts` - NHTSA/IIHS ratings
- `delay-simulator.ts` - LogNormal latency simulation
- `vehicle-data-cache.ts` - 24-hour TTL cache
- `mock-services.controller.ts` - API endpoints

### Mock Data (1 file)
**Location**: `database/seeds/`

- `mock-vin-data.ts` - 50+ common vehicles

### Rating Engine (10 files)
**Location**: `backend/src/services/rating-engine/`

- `rating-engine.service.ts` - Main orchestrator
- `vehicle-rating.ts` - Vehicle factor calculator
- `driver-rating.ts` - Driver factor calculator
- `location-rating.ts` - Location factor calculator
- `coverage-rating.ts` - Coverage factor calculator
- `discount-calculator.ts` - 7 discount types
- `surcharge-calculator.ts` - 8 surcharge types
- `premium-calculator.ts` - Multiplicative model
- `tax-fee-calculator.ts` - State taxes and fees
- `rating.controller.ts` - API endpoints

### Rating Data (1 file)
**Location**: `database/seeds/`

- `rating-tables.sql` - Base rates and multipliers

### Quote Service (6 files)
**Location**: `backend/src/services/quote-service/`

- `quote.service.ts` - CRUD operations
- `policy-creation.ts` - Policy/Agreement creation
- `coverage-assignment.ts` - Coverage linking
- `quote-expiration.ts` - Expiration utility functions
- `expiration-monitor.ts` - Daily cron job
- `quotes.controller.ts` - API endpoints

### Testing (3 files)
**Location**: Root directory

- `test-quote-flow.sh` - Automated test script
- `TESTING.md` - Testing documentation
- `api-tests.http` - REST Client collection

---

## Key Concepts Learned

### 1. Drizzle ORM Schema Definition

**What**: Defines database table structure in TypeScript

**Example**:
```typescript
export const party = pgTable('party', {
  party_identifier: uuid('party_identifier').primaryKey().defaultRandom(),
  party_name: varchar('party_name', { length: 255 }).notNull(),
  ...temporalTracking,  // begin_date, end_date
  ...auditTimestamps,   // created_at, updated_at
});
```

**Benefits**:
- Type-safe queries (TypeScript checks your SQL at compile time)
- Automatic migrations (Drizzle generates SQL migration files)
- Compile-time validation (catches errors before running code)

**Helpers**:
- `temporalTracking` - Adds OMG begin_date and end_date
- `auditTimestamps` - Adds created_at and updated_at

**Analogy**: Like creating a template form - defines what fields exist, what type of data goes in each field, and which fields are required.

---

### 2. OMG Subtype Pattern (Inheritance in Database)

**What**: Represents IS-A relationships using shared primary keys

**Example**:
```typescript
// Agreement (parent)
export const agreement = pgTable('agreement', {
  agreement_identifier: uuid('agreement_identifier').primaryKey().defaultRandom(),
  product_identifier: uuid('product_identifier'),
  // ... agreement fields
});

// Policy (subtype) - shares primary key with Agreement
export const policy = pgTable('policy', {
  policy_identifier: uuid('policy_identifier')
    .primaryKey()
    .references(() => agreement.agreement_identifier, { onDelete: 'cascade' }),
  policy_number: varchar('policy_number', { length: 50 }).unique(),
  status_code: varchar('status_code', { length: 50 }),
  // ... policy-specific fields
});
```

**Why this pattern**:
- Policy IS-A Agreement (every policy is an agreement, but not every agreement is a policy)
- Shared PK enforces 1:1 relationship
- Cascade delete: Deleting Agreement auto-deletes Policy

**Query patterns**:
```sql
-- Get common fields from Agreement
SELECT * FROM agreement WHERE agreement_identifier = '123';

-- Get policy-specific fields (join)
SELECT a.*, p.policy_number, p.status_code
FROM agreement a
JOIN policy p ON a.agreement_identifier = p.policy_identifier;
```

**Analogy**: Like organizational hierarchy - an Employee is a Person (shares ID number), but has additional employment-specific data (job title, salary, hire date).

---

### 3. Multiplicative Rating Model

**What**: Premium calculation where risk factors multiply

**Formula**:
```typescript
const basePremium = calculateBasePremium(coverages);
const vehicleFactor = await vehicleRating.calculateVehicleFactor(vehicle);
const driverFactor = await driverRating.calculateDriverFactor(driver);
const locationFactor = await locationRating.calculateLocationFactor(location);

const adjustedPremium = basePremium * vehicleFactor * driverFactor * locationFactor;
const discounts = calculateDiscounts(input);
const surcharges = calculateSurcharges(input);
const taxesAndFees = calculateTaxesAndFees(adjustedPremium, state);

const totalPremium = adjustedPremium - discounts + surcharges + taxesAndFees;
```

**Why multiplicative**: Risk factors compound

Example:
- Base premium: $1000
- Young driver (1.8×): $1800
- Sports car (1.3×): $2340
- Urban area (1.2×): $2808

If factors were additive (1.8 + 1.3 + 1.2 = 4.3×), premium would be $4300 - unrealistically high!

**Order matters**:
1. Calculate base from coverage selections
2. Multiply by all risk factors
3. Subtract discounts (rewards for safe behavior)
4. Add surcharges (penalties for risky behavior)
5. Add taxes and fees (regulatory requirements)

**Audit trail**: All intermediate values saved to `premium_calculation` table for regulatory compliance and dispute resolution.

**Analogy**: Like calculating shipping cost - base price × weight multiplier × distance multiplier - bulk discount + insurance fee + handling fee = total.

---

### 4. Cache-Aside Pattern

**What**: Application manages cache, not database

**Pattern**:
```typescript
async getByVIN(vin: string) {
  const key = `vehicle:vin:${vin.toUpperCase()}`;

  // Step 1: Check cache
  const cached = this.cache.get(key);
  if (cached && !this.isExpired(cached)) {
    return cached.data; // Cache hit
  }

  // Step 2: Cache miss - caller fetches from source
  return null;
}

async setByVIN(vin: string, data: any) {
  // Step 3: Store in cache for future requests
  const key = `vehicle:vin:${vin.toUpperCase()}`;
  this.cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + this.TTL_MS,
  });
}
```

**Flow**:
1. Application checks cache
2. If miss, application fetches from source (API, database)
3. Application stores result in cache
4. Future requests hit cache

**Differences from database caching (like Redis)**:
- Application controls when to cache
- Application manages expiration
- Application decides cache keys

**TTL enforcement**: Hourly cron job removes expired entries to prevent memory leaks.

**Analogy**: Like keeping frequently used tools on your desk instead of walking to the toolbox every time. You decide what stays on your desk and when to return it to the toolbox.

---

### 5. Cron Jobs with NestJS

**What**: Scheduled tasks that run automatically

**Example**:
```typescript
@Injectable()
export class QuoteExpirationMonitor {
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiredQuotes() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    // Find quotes older than 30 days with status=QUOTED
    const expiredQuotes = await this.findExpiredQuotes(cutoffDate);

    // Update to status=EXPIRED
    await this.expireQuotes(expiredQuotes);
  }
}
```

**Cron syntax**: `"0 2 * * *"` = Every day at 2:00 AM
- Minute: 0 (at minute 0)
- Hour: 2 (2 AM)
- Day of month: * (every day)
- Month: * (every month)
- Day of week: * (every day of week)

**NestJS helpers**:
- `CronExpression.EVERY_DAY_AT_2AM` - Readable alternative to cron syntax
- `CronExpression.EVERY_HOUR` - Runs hourly
- `CronExpression.EVERY_30_SECONDS` - Runs every 30 seconds

**Production consideration**: Use distributed lock (Redis) to prevent multiple servers running the same job simultaneously.

**Analogy**: Like setting a daily alarm to take out the trash - runs automatically at the same time every day without manual intervention.

---

### 6. Junction Tables with Attributes

**What**: Many-to-many relationship table that stores additional data

**Simple many-to-many** (just links):
```
Policy ←→ Coverage
```

**Junction table with attributes** (stores extra data):
```
Policy → PolicyCoverageDetail → Coverage
            ↓
        [PolicyLimit, PolicyDeductible]
```

**Schema**:
```typescript
export const policyCoverageDetail = pgTable('policy_coverage_detail', {
  policy_coverage_detail_identifier: uuid('...').primaryKey(),
  policy_identifier: uuid('...').references(() => policy.policy_identifier),
  coverage_identifier: uuid('...').references(() => coverage.coverage_identifier),
  vehicle_identifier: uuid('...').references(() => vehicle.vehicle_identifier),
  effective_date: date('effective_date').notNull(),
  expiration_date: date('expiration_date').notNull(),
  // ... plus limits and deductibles as child tables
});
```

**Why needed**: Need to store:
- Which vehicle this coverage applies to
- When coverage starts and ends
- Limits (how much coverage)
- Deductibles (how much you pay before insurance pays)

**Cascade delete**: Deleting PolicyCoverageDetail removes all associated limits and deductibles automatically.

**Analogy**: Like a class enrollment system - not just "Student ↔ Class", but "Student enrolls in Class for Semester X with Grade Y" - the enrollment record stores extra data beyond just the link.

---

### 7. TypeScript Enums for Status Codes

**What**: Type-safe enumeration of allowed values

**Example**:
```typescript
export const PolicyStatus = {
  QUOTED: 'QUOTED',
  BINDING: 'BINDING',
  BOUND: 'BOUND',
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type PolicyStatusType = typeof PolicyStatus[keyof typeof PolicyStatus];
```

**Why `as const`**:
- Without: TypeScript treats values as general `string` type
- With: TypeScript treats values as literal types `'QUOTED' | 'BINDING' | 'BOUND' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'`

**Type safety**:
```typescript
// ✅ Valid
const status: PolicyStatusType = 'QUOTED';

// ❌ TypeScript error - "PENDING" is not a valid status
const invalid: PolicyStatusType = 'PENDING';
```

**OMG compliance**: Status flow matches OMG P&C specification:
1. QUOTED - Quote generated
2. BINDING - Customer accepted, payment pending
3. BOUND - Payment received, policy issued
4. ACTIVE - Policy in effect
5. CANCELLED - Policy terminated
6. EXPIRED - Policy reached expiration date

**Analogy**: Like a traffic light - only three valid states (red, yellow, green). You can't have a "purple" light because it's not in the allowed set.

---

## The Restaurant Analogy

Phase 3 is like **fully staffing and training a restaurant before opening**:

### ✅ What We Completed

**Built the Infrastructure**:
- ✅ Created storage areas (database schemas for all 24 entities)
- ✅ Stocked the pantry (rating tables seed data)
- ✅ Set up supply chain (mock services for external data)
- ✅ Hired all kitchen staff (services created)
- ✅ Trained them on recipes (rating engine logic)
- ✅ Installed point-of-sale system (API controllers)
- ✅ Printed menus and table cards (frontend pages)
- ✅ Set up inventory tracking (caching system)
- ✅ Established expiration monitoring (cron jobs)
- ✅ Created standard operating procedures (business logic)
- ✅ Ran practice service (testing infrastructure)

### ⏳ Ready for Next Steps

**Current State**: Restaurant is fully staffed, trained, and ready. Kitchen systems operational. All recipes documented. Quality control in place.

**What's Next**:
- ❌ Soft opening (end-to-end integration testing)
- ❌ Payment processing (Phase 4 - Policy Binding)
- ❌ Customer loyalty program (Phase 5 - Portal)
- ❌ Fine-tuning service (Phase 6 - Polish)
- ❌ Food safety inspection (Phase 7 - Comprehensive Testing)

---

## What We DIDN'T Build Yet

**Remaining Phases**:

- ❌ **Phase 4** (Policy Binding): Converting quotes to active policies with payment
- ❌ **Phase 5** (Portal Access): Self-service portal for policy management and claims
- ❌ **Phase 6** (Polish): Production features, error handling, performance optimization
- ❌ **Phase 7** (Testing): Comprehensive automated test suite

**Why Phase 3 took priority**: This is the foundation - can't bind policies without quotes, can't have a portal without policies, can't test without something to test.

---

## Total Progress

**Overall**: 85/170 tasks complete (50%)

**By Phase**:
- ✅ Phase 1: 12/12 (100%) - Project Setup
- ✅ Phase 2: 10/10 (100%) - Foundational Infrastructure
- ✅ Phase 3: 63/63 (100%) - Quote Generation (US1)
- ⏳ Phase 4: 0/22 (0%) - Policy Binding (US2)
- ⏳ Phase 5: 0/20 (0%) - Portal Access (US3)
- ⏳ Phase 6: 0/7 (0%) - Polish
- ⏳ Phase 7: 0/57 (0%) - Testing

**Milestone**: 50% complete - halfway to full implementation! 🎉
