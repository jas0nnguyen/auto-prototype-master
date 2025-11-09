# Phase 3: Quote Service & Frontend Integration (Partial)

**Completed**: 2025-10-19
**Goal**: Build the core quote generation service layer and connect frontend to backend via APIs.

**Note**: This is a PARTIAL completion of Phase 3. Tasks T062-T080 (14 tasks) completed. Database schemas (T023-T045) and remaining rating engine tasks (T047-T061) are still pending.

## What We Built

### 1. Data Transfer Objects (DTOs) - The Contract Between Frontend and Backend

DTOs are like standardized forms that both sides agree on. Think of them like tax forms:
- IRS provides form with specific fields
- You fill it out following the exact format
- IRS processes it because they know the structure

Created `backend/src/api/dto/rating.dto.ts`:
```typescript
export class CalculatePremiumRequestDto {
  vehicle_year: number;        // What you send
  driver_birth_date: Date;
  location_zip_code: string;
  // ... more fields
}

export class CalculatePremiumResponseDto {
  base_premium: number;        // What you get back
  final_premium: number;
  vehicle_factors: Record<string, number>;
  // ... more fields
}
```

**Why DTOs Matter**:
- Frontend knows exactly what to send
- Backend knows exactly what to expect
- TypeScript catches mismatches at compile time
- Self-documenting API contracts

Created `backend/src/api/dto/quote.dto.ts`:
- `CreateQuoteRequestDto` - What frontend sends when creating a quote
- `QuoteResponseDto` - What backend returns with quote data
- `UpdateCoverageRequestDto` - For changing coverage selections

### 2. Rating Engine API Controller (T062)

**What is a Controller?**
A controller is like a restaurant waiter:
- Takes customer orders (HTTP requests)
- Delivers orders to kitchen (services)
- Brings back food (HTTP responses)

Created `backend/src/api/routes/rating.controller.ts`:

**NestJS Decorators Explained** (the @ symbols):
```typescript
@Controller('api/v1/rating')  // Base URL for this controller
@ApiTags('Rating Engine')     // Groups in Swagger docs
export class RatingController {

  @Post('calculate')          // Handles POST to /api/v1/rating/calculate
  @HttpCode(HttpStatus.OK)    // Return 200 OK on success
  @ApiOperation({...})        // Swagger documentation
  async calculatePremium(
    @Body() dto: CalculatePremiumRequestDto  // Extract request body
  ): Promise<any> {
    // ... implementation
  }
}
```

**Decorators are like stickers on a mailbox**:
- Tell the postal service (NestJS) how to handle the mail
- Don't change what's inside the mailbox (the function code)
- Add metadata and behavior

**Mock Implementation**:
Since the rating engine service doesn't exist yet (tasks T053-T061), we created a placeholder that returns realistic mock data:
```typescript
const basePremium = 1200;  // Starting premium

// Mock rating factors (multipliers)
const vehicleFactors = {
  age: 1.05,          // 5% increase for older car
  safety_rating: 0.92, // 8% discount for good safety
};

// Calculate final premium
const finalPremium = basePremium × (all factors) + discounts + surcharges + taxes;
```

### 3. Party Creation Service (T064)

**What is the Party/Person Pattern?**
In insurance, "Party" is anyone who can participate:
- Person (individual human)
- Organization (company)
- Grouping (family, group policy)

It's like:
- Animal (generic) → Dog (specific)
- Party (generic) → Person (specific)

Created `backend/src/services/quote-service/party-creation.ts`:

**Key Method**:
```typescript
async createPartyFromQuoteInput(input: CreatePartyInput) {
  // 1. Validate input (check required fields, formats)
  this.validatePartyInput(input);

  // 2. Create Party entity (the parent)
  const party = this.createPartyEntity(input);

  // 3. Create Person entity (the child/subtype)
  const person = this.createPersonEntity(input, party.party_identifier);

  // 4. Create Communication entities (email, phone)
  const communications = this.createCommunicationEntities(input);

  // 5. Link communications to party
  const links = this.linkCommunicationsToParty(party, communications);

  return { party, person, communications, links };
}
```

**The Subtype Pattern**:
```typescript
// Party table (parent)
{
  party_identifier: "uuid-123",
  party_name: "John Smith",
  party_type_code: "PERSON"
}

// Person table (child)
{
  person_identifier: "uuid-123",  // Same ID as party!
  first_name: "John",
  last_name: "Smith",
  birth_date: "1990-05-15"
}
```

**Why same ID?** The Person IS-A Party. The `person_identifier` is a foreign key pointing to the Party. Think of it like:
- Your passport (Party) = basic info
- Your driver's license (Person) = additional info
- Both have same ID linking them to you

**Communication Pattern**:
Instead of putting email/phone directly on Party:
1. Create separate Communication entities
2. Link them via PartyCommunication table

Benefits:
- Multiple parties can share same email
- Can track when communication was added/removed
- Can mark preferred contact method

### 4. Vehicle Enrichment Service (T065)

**What is "Enrichment"?**
Starting with minimal data and adding more:
- Input: Just a VIN or Make/Model/Year
- Enrich with: Trim, engine, safety ratings, value
- Like ordering a basic pizza then adding toppings

Created `backend/src/services/quote-service/vehicle-enrichment.ts`:

**Service Orchestration**:
```typescript
async enrichVehicleData(input) {
  // Step 1: Decode VIN (if provided)
  const specs = await this.callVINDecoderService(vin);

  // Step 2: Get vehicle value
  const valuation = await this.callVehicleValuationService(make, model, year);

  // Step 3: Get safety ratings
  const safety = await this.callSafetyRatingsService(make, model, year);

  // Step 4: Create InsurableObject entity
  const insurableObject = this.createInsurableObjectEntity(specs);

  // Step 5: Create Vehicle entity (with all enriched data)
  const vehicle = this.createVehicleEntity(specs, valuation, safety);

  return { vehicle, insurableObject, enriched_data };
}
```

**Mock Services**:
Real implementation would call external APIs:
- VIN Decoder: NHTSA API (free, government)
- Valuation: Kelley Blue Book, Edmunds
- Safety: NHTSA crash test database

We mock these to avoid external dependencies:
```typescript
// Simulates calling an API with realistic delay
await this.delay(300);  // Wait 300ms

// Mock VIN database lookup
const mockData = {
  '4T1G11AK5PU123456': {  // VIN as key
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    // ... more specs
  }
};
```

**Depreciation Calculation** (simplified):
```typescript
// New cars lose ~20% in year 1
// Then ~10% per year for years 2-5
let value = baseValue;
if (age === 1) {
  value *= 0.8;  // 20% depreciation
} else if (age <= 5) {
  value *= 0.8 * Math.pow(0.9, age - 1);  // Compound depreciation
}
```

### 5. Main Quote Service (T063)

**What is a "Conductor" Service?**
The main quote service orchestrates (coordinates) calls to other services:
- Party creation service
- Vehicle enrichment service
- Policy creation logic
- Coverage assignment
- Premium calculation

Like a restaurant manager who coordinates:
- Front of house (taking orders)
- Kitchen (preparing food)
- Bar (making drinks)
- Dessert station

Created `backend/src/services/quote-service/quote.service.ts`:

**Main Method**:
```typescript
async createQuote(input) {
  // Step 1: Create the driver as a Party/Person
  const partyResult = await this.partyService.createPartyFromQuoteInput({
    first_name: input.driver_first_name,
    // ...
  });

  // Step 2: Enrich vehicle data
  const vehicleResult = await this.vehicleService.enrichVehicleData({
    vin: input.vehicle_vin,
    // ...
  });

  // Step 3: Create Policy with QUOTED status
  const quoteNumber = this.generateQuoteNumber();  // e.g., "QTE-2025-123456"
  const policy = this.createQuotedPolicy(quoteNumber, partyId, vehicleId);

  // TODO: Steps 4-5 (assign coverages, calculate premium)

  return { quote_id, quote_number, driver, vehicle };
}
```

**Generate Quote Number**:
```typescript
generateQuoteNumber(): string {
  const year = new Date().getFullYear();           // 2025
  const random = Math.floor(Math.random() * 1000000);  // 0-999999
  const padded = random.toString().padStart(6, '0');   // Always 6 digits
  return `QTE-${year}-${padded}`;                  // QTE-2025-123456
}
```

### 6. Frontend React Components

**CoverageCard Component (T075)**

**What is a React Component?**
A reusable UI building block:
```typescript
// Define once
const CoverageCard = (props) => {
  return <Card>{props.coverageName}</Card>;
};

// Use many times
<CoverageCard coverageName="Collision" premium={250} />
<CoverageCard coverageName="Comprehensive" premium={200} />
<CoverageCard coverageName="Liability" premium={150} />
```

Created `src/components/insurance/CoverageCard.tsx`:

**Props Interface**:
```typescript
interface CoverageCardProps {
  coverageName: string;        // "Bodily Injury Liability"
  coverageCode: string;        // "BI_LIABILITY"
  limitAmount?: string;        // "$100,000/$300,000"
  deductibleAmount?: string;   // "$500"
  premiumAmount: number;       // 125.50
  currency?: string;           // "USD"
  isRequired?: boolean;        // true
  onClick?: () => void;        // Function to call when clicked
}
```

**Formatting Helper**:
```typescript
const formatPremium = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',      // Add $ symbol
    currency: 'USD',
    minimumFractionDigits: 2,  // Always show .XX
  }).format(amount);
};

formatPremium(125.5);  // Returns "$125.50"
```

**Conditional Rendering**:
```typescript
{/* Only show badge if coverage is required */}
{isRequired && (
  <Badge color="blue">Required</Badge>
)}

// This is like:
if (isRequired) {
  render <Badge />
} else {
  render nothing
}
```

**VehicleCard Component (T076)**

Similar to CoverageCard but displays vehicle information.

Created `src/components/insurance/VehicleCard.tsx`:
- Shows year, make, model, trim
- VIN in monospace font
- Estimated value formatted as currency
- Annual mileage with thousands separator
- Safety rating as colored badge

### 7. Frontend API Client Service (T077)

**What is an API Client?**
Centralizes all HTTP requests to the backend:

Created `src/services/quote-api.ts`:

**Fetch API Basics**:
```typescript
// Making a POST request
const response = await fetch('/api/v1/quotes', {
  method: 'POST',              // HTTP verb
  headers: {
    'Content-Type': 'application/json',  // We're sending JSON
  },
  body: JSON.stringify(data),  // Convert JS object → JSON string
});

// Check if successful
if (!response.ok) {  // Status code 200-299
  throw new Error('Request failed');
}

// Parse response
const result = await response.json();  // JSON string → JS object
return result.data;
```

**Why Centralize API Calls?**
```typescript
// Without centralization (BAD):
// In ComponentA.tsx
fetch('/api/v1/quotes', { method: 'POST', ... });

// In ComponentB.tsx
fetch('/api/v1/quotes', { method: 'POST', ... });  // Duplicate code!

// With centralization (GOOD):
// In quote-api.ts
class QuoteApiService {
  async createQuote(data) { ... }
}

// In any component
import { quoteApi } from '@/services/quote-api';
quoteApi.createQuote(data);  // Reusable!
```

**Singleton Pattern**:
```typescript
// Create one instance
const quoteApi = new QuoteApiService();

// Export that instance (not the class)
export { quoteApi };

// Everyone uses the same instance
import { quoteApi } from '@/services/quote-api';
quoteApi.createQuote(data);
```

### 8. TanStack Query Hook (T078)

**What is TanStack Query?**
A library that manages server state (data from APIs):
- Automatic caching
- Background refetching
- Loading/error states
- Optimistic updates

Created `src/hooks/useQuote.ts`:

**Without TanStack Query** (manual approach):
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/quotes/123')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, []);

// Lots of boilerplate code!
```

**With TanStack Query** (simple):
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['quotes', quoteId],    // Cache key
  queryFn: () => quoteApi.getQuoteById(quoteId),  // How to fetch
});

// Much cleaner!
```

**Query Keys** (like cache labels):
```typescript
export const quoteKeys = {
  all: ['quotes'],                    // All quotes
  byId: (id) => ['quotes', id],       // Specific quote by ID
  byNumber: (num) => ['quotes', 'number', num],  // By quote number
};

// Use in hooks
useQuery({ queryKey: quoteKeys.byId('123'), ... });
```

**useMutation** (for creating/updating data):
```typescript
const createQuote = useMutation({
  mutationFn: (data) => quoteApi.createQuote(data),

  // After successful creation
  onSuccess: (newQuote) => {
    // Invalidate the quotes list (mark as stale)
    queryClient.invalidateQueries({ queryKey: quoteKeys.all });

    // Add new quote to cache
    queryClient.setQueryData(quoteKeys.byId(newQuote.quote_id), newQuote);
  },
});

// Use in component
const handleSubmit = async () => {
  await createQuote.mutateAsync(formData);
};
```

**Cache Invalidation**:
```typescript
// After creating a quote
queryClient.invalidateQueries({ queryKey: ['quotes'] });

// This tells TanStack Query:
// "The quotes list is now stale (outdated). Refetch it next time someone needs it."

// It's like putting a "SPOILED" sticker on food in your fridge
```

### 9. React Router Setup (T079)

**What is React Router?**
Library that maps URLs to React components:
- `/` → HomePage
- `/quote/vehicle-info` → VehicleInfo component
- `/quote/results` → QuoteResults component

Updated `src/App.tsx`:

**Added TanStack Query Provider**:
```typescript
// Create query client (manages cache)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // Data fresh for 5 minutes
      cacheTime: 10 * 60 * 1000,  // Keep in cache for 10 minutes
    },
  },
});

// Wrap app in provider (makes client available to all components)
<QueryClientProvider client={queryClient}>
  <Router>
    <Routes>...</Routes>
  </Router>
</QueryClientProvider>
```

**Added Quote Flow Routes**:
```typescript
<Route path="/quote/vehicle-info" element={<VehicleInfo />} />
<Route path="/quote/driver-info" element={<DriverInfo />} />
<Route path="/quote/coverage-selection" element={<CoverageSelection />} />
<Route path="/quote/results" element={<QuoteResults />} />
```

## Key Concepts Learned

### 1. DEPENDENCY INJECTION (NestJS)

Instead of creating your own dependencies:
```typescript
// BAD: Manual creation
class QuoteService {
  private partyService = new PartyCreationService();  // Hard to test!
}
```

Let NestJS inject them:
```typescript
// GOOD: Dependency injection
@Injectable()
class QuoteService {
  constructor(
    private partyService: PartyCreationService  // NestJS provides this
  ) {}
}
```

Benefits:
- Easy to swap implementations (testing, mocking)
- Singleton management (one instance shared)
- Circular dependency detection

### 2. DTO PATTERN

Data Transfer Objects separate internal models from API contracts:

```typescript
// Internal model (database entity)
interface Party {
  party_identifier: string;
  begin_date: Date;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date;
  // ... lots of internal fields
}

// DTO (what API returns)
interface PartyDto {
  party_id: string;      // Renamed for API
  full_name: string;     // Computed field
  email: string;         // Joined from CommunicationIdentity
  // ... only fields frontend needs
}
```

Benefits:
- Internal changes don't break API
- Can hide sensitive fields
- Can compute derived fields

### 3. SERVICE ORCHESTRATION

Main service coordinates multiple sub-services:

```typescript
class QuoteService {
  constructor(
    private partyService: PartyCreationService,
    private vehicleService: VehicleEnrichmentService,
    private policyService: PolicyCreationService,
  ) {}

  async createQuote(input) {
    // Orchestrate calls in correct order
    const party = await this.partyService.create(input);
    const vehicle = await this.vehicleService.enrich(input);
    const policy = await this.policyService.create(party, vehicle);
    return { party, vehicle, policy };
  }
}
```

Each service has one responsibility:
- PartyCreationService: Only creates parties
- VehicleEnrichmentService: Only enriches vehicles
- QuoteService: Coordinates them

### 4. ASYNC/AWAIT (Promises)

```typescript
// Without async/await (callback hell):
fetch('/api/quotes')
  .then(res => res.json())
  .then(data => {
    fetch(`/api/parties/${data.party_id}`)
      .then(res => res.json())
      .then(party => {
        // Finally have both!
      });
  });

// With async/await (clean):
const quote = await fetch('/api/quotes').then(r => r.json());
const party = await fetch(`/api/parties/${quote.party_id}`).then(r => r.json());
// Much easier to read!
```

**async** = This function returns a Promise
**await** = Wait for this Promise to resolve

### 5. REACT HOOKS

Hooks let you use state and other React features in function components:

```typescript
// useState: Store component state
const [count, setCount] = useState(0);  // Initial value: 0
setCount(count + 1);  // Update state

// useEffect: Run side effects
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);  // Empty array = run once

// useQuery: Fetch and cache data
const { data, isLoading } = useQuery(queryKey, fetchFn);

// useMutation: Modify data
const createMutation = useMutation(createFn);
createMutation.mutate(newData);
```

## Files Created

**Backend (8 files)**:
```
backend/src/api/dto/rating.dto.ts               # Request/Response types for rating
backend/src/api/dto/quote.dto.ts                # Request/Response types for quotes
backend/src/api/routes/rating.controller.ts     # Rating API controller
backend/src/services/quote-service/quote.service.ts         # Main quote service
backend/src/services/quote-service/party-creation.ts        # Party creation logic
backend/src/services/quote-service/vehicle-enrichment.ts    # Vehicle enrichment logic
```

**Frontend (4 files)**:
```
src/components/insurance/CoverageCard.tsx       # Coverage display component
src/components/insurance/VehicleCard.tsx        # Vehicle display component
src/services/quote-api.ts                       # API client service
src/hooks/useQuote.ts                           # TanStack Query hooks
```

**Modified (1 file)**:
```
src/App.tsx                                     # Added routes and QueryClient
```

## What We DIDN'T Build Yet

Phase 3 is PARTIALLY complete. Still pending:

**Database Layer** (T023-T045):
- ❌ Drizzle schema definitions for all entities
- ❌ Database migrations to create tables
- ❌ Actual database queries (currently mock data)

**Rating Engine** (T047-T061):
- ❌ Mock VIN decoder service
- ❌ Mock vehicle valuation service
- ❌ Vehicle/driver/location/coverage rating calculators
- ❌ Discount/surcharge calculators
- ❌ Premium calculation orchestrator
- ❌ Rating tables seed data

**Remaining Quote Services** (T066-T069):
- ❌ Policy creation service (partially in quote.service.ts)
- ❌ Coverage assignment logic
- ❌ Quote expiration tracking
- ❌ Quotes API controller

**Full Integration** (T080):
- ❌ Connect frontend pages to actual backend APIs
- ❌ Replace sessionStorage with real API calls
- ❌ End-to-end quote flow working

## Why This Phase Was Important

Phase 3 (partial) built the **service layer architecture**:

1. ✅ **API Contracts** (DTOs)
   - Frontend and backend agree on data shapes
   - Type safety across the stack
   - Self-documenting APIs

2. ✅ **Business Logic Services**
   - Party creation (handling driver data)
   - Vehicle enrichment (augmenting vehicle data)
   - Service orchestration pattern

3. ✅ **Frontend Infrastructure**
   - API client for HTTP communication
   - TanStack Query for state management
   - Reusable UI components
   - Routing configured

4. ✅ **Design Patterns**
   - Dependency injection (NestJS)
   - Service orchestration
   - DTO pattern
   - Singleton pattern
   - Custom React hooks

**Without this work**, we couldn't:
- Make API calls (no API client)
- Manage server state (no TanStack Query)
- Display coverage/vehicle info (no components)
- Navigate between pages (no routes)
- Create quotes (no services)

## The Restaurant Analogy Continued

Phase 3 (partial) was **hiring the staff and setting up workflows**:

✅ **Hired Key Staff**:
- Head Chef (QuoteService) who coordinates everything
- Sous Chef (PartyCreationService) who prepares driver info
- Line Cook (VehicleEnrichmentService) who handles vehicle data
- Waiters (API Controllers) who take orders and deliver food

✅ **Created Standard Operating Procedures**:
- Order forms (DTOs) everyone uses
- Service flow (orchestration) documented
- Quality checks (validation) in place

✅ **Set Up Front of House**:
- Menu displays (React components)
- Order system (API client)
- Customer tracking (TanStack Query cache)
- Table layout (React routes)

❌ **Haven't Done Yet**:
- Built the storage areas (database schemas)
- Stocked the ingredients (seed data)
- Trained all staff (rating engine services)
- Opened for customers (full integration)

**Next Steps**: Complete database schemas (T023-T045), build rating engine (T047-T061), create API endpoints (T069), then integrate everything (T080).

**Total Progress**: 36/170 tasks complete (21%)
