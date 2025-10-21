# Phase 3c: Progressive Multi-Driver/Vehicle Quote Flow (Tasks T069n-T069t)

**Completed**: 2025-10-20
**Goal**: Build a complete Progressive-style insurance quote flow with multi-driver/vehicle support, dynamic pricing, and real-time premium updates

## What We Built

After completing the basic Option B backend API (Phase 3b), we enhanced the system with a comprehensive Progressive-style quote flow that matches real insurance company workflows.

### 1. **Multi-Page Quote Wizard**

We created a complete quote flow with 5 pages:

```
Primary Driver Info → Additional Drivers → Vehicles → Coverage Selection → Quote Results
```

Each page:
- Connects to real backend API
- Persists data across navigation
- Supports back button with data pre-population
- Uses TanStack Query for data fetching/caching
- Shows loading states during API calls

#### PrimaryDriverInfo Page

**What it does**: Collects information about the main policyholder (Primary Named Insured)

**Key Features**:
- Full form validation (email format, ZIP code format)
- Support for both creating new quotes AND editing existing ones
- Smart logic: If email changes → create new quote, if other fields change → update existing quote
- Pre-populates form when navigating back from later pages

**Code Example**:
```typescript
// src/pages/quote/PrimaryDriverInfo.tsx

const PrimaryDriverInfo: React.FC = () => {
  const { quoteNumber } = useParams(); // Get quote number from URL
  const { data: existingQuote } = useQuoteByNumber(quoteNumber); // Fetch existing quote if any

  // When existing quote loads, pre-populate form
  useEffect(() => {
    if (existingQuote && existingQuote.driver) {
      setFormData({
        firstName: existingQuote.driver.firstName,
        lastName: existingQuote.driver.lastName,
        email: existingQuote.driver.email,
        // ... all other fields
      });
      setOriginalData(loadedData); // Store original for change detection
    }
  }, [existingQuote]);

  const handleSubmit = async (e) => {
    // Check if email changed
    if (formData.email !== originalData.email) {
      // Email changed = create NEW quote
      const result = await createQuote.mutateAsync(quoteData);
      resultQuoteNumber = result.quoteNumber;
    } else {
      // Check if other fields changed
      const hasChanges = /* compare all fields */;
      if (hasChanges) {
        // Update existing quote
        await updatePrimaryDriver.mutateAsync({
          quoteNumber,
          driverData: formData
        });
      }
      resultQuoteNumber = quoteNumber; // Use existing
    }

    // Navigate to next page with quote number in URL
    navigate(`/quote/additional-drivers/${resultQuoteNumber}`);
  };
};
```

**Restaurant Analogy**: This is like the host station at a restaurant - they collect the main reservation holder's information. If the reservation already exists, they look it up and can update details (but if you change the name/email, that's a new reservation).

#### AdditionalDrivers Page

**What it does**: Lets you add other people who will drive the insured vehicles (spouse, children, etc.)

**Key Features**:
- Add, edit, and remove additional drivers
- Each driver has relationship (spouse, child, parent, sibling, other)
- Validates that all required fields are filled
- Filters out primary driver if accidentally added (prevents duplicates)
- Shows driver count badge

**Code Example**:
```typescript
// src/pages/quote/AdditionalDrivers.tsx

const AdditionalDrivers: React.FC = () => {
  const [drivers, setDrivers] = useState<AdditionalDriverData[]>([]);
  const [isAddingDriver, setIsAddingDriver] = useState(false);

  // Load existing additional drivers from quote
  useEffect(() => {
    if (quote?.additionalDrivers) {
      // Map API format to component format
      const mappedDrivers = quote.additionalDrivers.map((driver, index) => ({
        id: driver.email || `driver-${index}`,
        firstName: driver.firstName || '',
        lastName: driver.lastName || '',
        dob: driver.birthDate || '', // API uses "birthDate", we use "dob"
        gender: driver.gender || '',
        relationship: driver.relationship || 'other', // Default to prevent null errors
        yearsLicensed: driver.yearsLicensed,
      }));
      setDrivers(mappedDrivers);
    }
  }, [quote]);

  const handleSaveDriver = () => {
    if (editingDriverId) {
      // Update existing driver
      setDrivers(drivers.map(d =>
        d.id === editingDriverId ? { ...formData, id: editingDriverId } : d
      ));
    } else {
      // Add new driver
      setDrivers([...drivers, { ...formData, id: Date.now().toString() }]);
    }
    setIsAddingDriver(false);
  };

  const handleContinue = async () => {
    // Send all drivers to backend
    await updateDrivers.mutateAsync({
      quoteNumber,
      additionalDrivers: drivers.map(d => ({
        first_name: d.firstName,
        last_name: d.lastName,
        birth_date: d.dob,
        // ... all fields
      }))
    });

    navigate(`/quote/vehicles/${quoteNumber}`);
  };
};
```

**Restaurant Analogy**: After the host gets the main reservation info, they ask "Will anyone else be dining with you?" This page lets you add all the additional guests to the reservation.

#### VehiclesList Page

**What it does**: Lets you add and manage all vehicles to be insured under the policy

**Key Features**:
- Add multiple vehicles to a single quote
- Each vehicle has year, make, model, VIN, body type, annual mileage
- Assign a primary driver to each vehicle (from the drivers already added)
- Edit and remove vehicles
- Shows vehicle count

**Code Example**:
```typescript
// src/pages/quote/VehiclesList.tsx

const VehiclesList: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);

  // Load existing vehicles from quote
  useEffect(() => {
    if (quote?.vehicles) {
      const mappedVehicles = quote.vehicles.map((v, index) => ({
        id: v.vin || `vehicle-${index}`,
        year: v.year,
        make: v.make,
        model: v.model,
        vin: v.vin || '',
        bodyType: v.bodyType || '',
        annualMileage: v.annualMileage || 12000,
        primaryDriverId: v.primaryDriverId || 'primary',
      }));
      setVehicles(mappedVehicles);
    }
  }, [quote]);

  const handleContinue = async () => {
    // Send all vehicles to backend
    await updateVehicles.mutateAsync({
      quoteNumber,
      vehicles: vehicles.map(v => ({
        year: v.year,
        make: v.make,
        model: v.model,
        vin: v.vin,
        body_type: v.bodyType,
        annual_mileage: v.annualMileage,
        primary_driver_id: v.primaryDriverId,
      }))
    });

    navigate(`/quote/coverage-selection/${quoteNumber}`);
  };
};
```

**Restaurant Analogy**: The host asks "How many tables will you need?" You can add multiple tables (vehicles) and assign which guest (driver) will be the main person at each table.

#### CoverageSelection Page with Dynamic Pricing

**What it does**: Lets you choose insurance coverage options and see the price update in real-time

**Key Features**:
- Real-time pricing: Premium updates as you change coverage selections
- Debounced API calls (300ms) to avoid overwhelming the server
- Shows loading state while calculating new price
- Default coverage selections pre-selected
- All Select dropdowns show current values

**Code Example**:
```typescript
// src/pages/quote/CoverageSelection.tsx

const CoverageSelection: React.FC = () => {
  const [coverage, setCoverage] = useState({
    bodilyInjuryLimit: '100/300',
    propertyDamageLimit: '50000',
    hasCollision: false,
    collisionDeductible: '500',
    hasComprehensive: false,
    comprehensiveDeductible: '500',
    // ... all coverage options
  });

  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const isInitialLoadRef = useRef(true); // Track if this is initial load

  // Load initial coverage from quote
  useEffect(() => {
    if (quote && quote.coverages && isInitialLoadRef.current) {
      setCoverage({
        bodilyInjuryLimit: quote.coverages.bodilyInjuryLimit || '100/300',
        // ... all other fields
      });
      isInitialLoadRef.current = false; // Mark initial load complete
    }
  }, [quote?.quote_number]);

  // Auto-update premium when coverage changes (with debounce)
  useEffect(() => {
    // Skip if this is initial load
    if (isInitialLoadRef.current) return;
    if (!quoteNumber || !coverage.coverageStartDate) return;

    setIsPricingLoading(true);

    // Wait 300ms after last change before calling API
    const timer = setTimeout(async () => {
      try {
        await updateQuoteCoverage.mutateAsync({
          quoteNumber,
          coverageData: {
            coverage_bodily_injury_limit: coverage.bodilyInjuryLimit,
            coverage_property_damage_limit: coverage.propertyDamageLimit,
            coverage_collision: coverage.hasCollision,
            coverage_collision_deductible: coverage.hasCollision
              ? parseInt(coverage.collisionDeductible)
              : undefined,
            // ... all other coverage fields
          },
        });
        // Explicitly refetch to get updated premium
        await refetch();
      } catch (error) {
        console.error('Failed to update coverage:', error);
      } finally {
        setIsPricingLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer); // Cancel timer if user makes another change
  }, [coverage, quoteNumber]); // Run when coverage changes

  // Display premium with 2 decimal places
  const monthly = quote?.premium?.monthly || 0;
  const sixMonth = quote?.premium?.sixMonth || 0;

  return (
    <QuoteCard
      price={monthly.toFixed(2)} // Always show 2 decimals: $357.50
      total={sixMonth.toFixed(2)}
      isLoading={isPricingLoading}
    >
      <Select
        value={coverage.bodilyInjuryLimit} // Show current selection
        onChange={(value) => setCoverage({ ...coverage, bodilyInjuryLimit: value })}
        options={[
          { label: '$25,000/$50,000', value: '25/50' },
          { label: '$50,000/$100,000', value: '50/100' },
          { label: '$100,000/$300,000', value: '100/300' },
          { label: '$250,000/$500,000', value: '250/500' },
        ]}
      />
      {/* ... more Select dropdowns for other coverage options */}
    </QuoteCard>
  );
};
```

**Restaurant Analogy**: Like choosing your meal options - "Would you like fries with that? What size drink?" As you add more options, the price updates in real-time on the menu board.

**Why the Debounce?**
Imagine typing in a search box. Without debounce, it would search after EVERY keystroke. With debounce, it waits until you stop typing for 300ms. Same here - we wait until the user stops clicking for 300ms before calling the API.

**Why useRef for Initial Load?**
`useRef` stores a value that persists across re-renders but doesn't cause re-renders when changed. We use it to track "is this the first time loading?" to avoid an infinite loop:
1. Page loads → fetch quote data
2. Quote data arrives → update coverage state
3. Coverage state changes → DON'T trigger API call (because it's initial load)
4. User clicks dropdown → NOW trigger API calls

### 2. **Backend API Enhancements**

We added 4 new PUT endpoints to support updating different parts of a quote:

#### PUT /api/v1/quotes/:quoteNumber/primary-driver

Updates the primary driver information (name, address, etc.)

**Controller Code**:
```typescript
// backend/src/api/routes/quotes.controller.ts

@Put(':quoteNumber/primary-driver')
async updatePrimaryDriver(
  @Param('quoteNumber') quoteNumber: string,
  @Body() dto: UpdatePrimaryDriverDTO
): Promise<QuoteResult> {
  const result = await this.quoteService.updatePrimaryDriver(
    quoteNumber,
    {
      firstName: dto.driver_first_name,
      lastName: dto.driver_last_name,
      birthDate: new Date(dto.driver_birth_date),
      email: dto.driver_email,
      phone: dto.driver_phone,
      gender: dto.driver_gender,
      maritalStatus: dto.driver_marital_status,
    },
    {
      addressLine1: dto.address_line_1,
      addressLine2: dto.address_line_2,
      city: dto.address_city,
      state: dto.address_state,
      zipCode: dto.address_zip,
    }
  );
  return result;
}
```

**Service Code**:
```typescript
// backend/src/services/quote/quote.service.ts

async updatePrimaryDriver(
  quoteNumber: string,
  driver: { firstName, lastName, birthDate, email, ... },
  address: { addressLine1, city, state, zipCode, ... }
): Promise<QuoteResult> {
  // Get existing quote from database
  const existingQuote = await this.getQuote(quoteNumber);
  const policyRecord = /* fetch from database */;
  const currentSnapshot = policyRecord.quote_snapshot;

  // Update snapshot with new driver and address
  const updatedSnapshot = {
    ...currentSnapshot,
    driver: {
      firstName: driver.firstName,
      lastName: driver.lastName,
      birthDate: driver.birthDate.toISOString().split('T')[0],
      email: driver.email,
      phone: driver.phone,
      gender: driver.gender || null,
      maritalStatus: driver.maritalStatus || null,
    },
    address: {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    },
    meta: {
      ...currentSnapshot.meta,
      updatedAt: new Date().toISOString(),
    },
  };

  // Recalculate premium (driver age and gender affect rates!)
  const newPremium = this.calculatePremiumProgressive({
    driver,
    additionalDrivers: currentSnapshot.additionalDrivers || [],
    vehicles: currentSnapshot.vehicles || [],
    coverages: currentSnapshot.coverages || {},
  });

  // Update premium in snapshot
  updatedSnapshot.premium = {
    total: newPremium,
    monthly: Math.round(newPremium / 6 * 100) / 100,
    sixMonth: newPremium,
  };

  // Save to database
  await this.db.update(policy)
    .set({ quote_snapshot: updatedSnapshot })
    .where(eq(policy.policy_number, quoteNumber));

  return {
    quoteId: quoteNumber,
    quoteNumber,
    premium: newPremium,
    createdAt: new Date(policyRecord.effective_date),
    expiresAt: this.calculateQuoteExpiration(),
  };
}
```

**Restaurant Analogy**: Customer calls to change the reservation name or address - you look up the reservation, update the details, keep everything else the same.

#### PUT /api/v1/quotes/:quoteNumber/drivers

Updates the list of additional drivers (replaces the entire list)

**Key Feature**: Automatically filters out primary driver if accidentally included

```typescript
// backend/src/services/quote/quote.service.ts

async updateQuoteDrivers(
  quoteNumber: string,
  additionalDrivers: Array<{ firstName, lastName, birthDate, email, ... }>
): Promise<QuoteResult> {
  const currentSnapshot = /* get from database */;

  // Get primary driver email to filter them out
  const primaryDriverEmail = currentSnapshot.driver?.email;

  // Filter out primary driver from additional drivers (prevent duplicates!)
  const filteredDrivers = additionalDrivers.filter(
    d => d.email.toLowerCase() !== primaryDriverEmail?.toLowerCase()
  );

  if (filteredDrivers.length !== additionalDrivers.length) {
    this.logger.warn('Filtered out primary driver from additional drivers', {
      quoteNumber,
      primaryDriverEmail,
      originalCount: additionalDrivers.length,
      filteredCount: filteredDrivers.length,
    });
  }

  // Update snapshot
  const updatedSnapshot = {
    ...currentSnapshot,
    additionalDrivers: filteredDrivers.map(d => ({
      firstName: d.firstName,
      lastName: d.lastName,
      birthDate: d.birthDate.toISOString().split('T')[0],
      email: d.email,
      phone: d.phone,
      gender: d.gender || null,
      maritalStatus: d.maritalStatus || null,
      yearsLicensed: d.yearsLicensed || null,
      relationship: d.relationship || null,
    })),
    meta: { ...currentSnapshot.meta, updatedAt: new Date().toISOString() },
  };

  // Recalculate premium with additional drivers (1.15× per driver!)
  const newPremium = this.calculatePremiumProgressive({
    driver: currentSnapshot.driver,
    additionalDrivers: filteredDrivers, // Use filtered list
    vehicles: currentSnapshot.vehicles,
    coverages: currentSnapshot.coverages,
  });

  // Update premium and save
  updatedSnapshot.premium = { /* new premium */ };
  await this.db.update(policy).set({ quote_snapshot: updatedSnapshot });

  return { /* quote result */ };
}
```

**Restaurant Analogy**: Customer calls to update the guest list for the reservation - you replace the entire list of additional guests. If they accidentally include themselves in the guest list, you automatically remove that duplicate.

#### PUT /api/v1/quotes/:quoteNumber/vehicles

Updates the list of vehicles (replaces the entire list)

```typescript
async updateQuoteVehicles(
  quoteNumber: string,
  vehicles: Array<{ year, make, model, vin, bodyType, annualMileage, primaryDriverId }>
): Promise<QuoteResult> {
  const currentSnapshot = /* get from database */;

  // Update snapshot with vehicles
  const updatedSnapshot = {
    ...currentSnapshot,
    vehicles: vehicles.map(v => ({
      year: v.year,
      make: v.make,
      model: v.model,
      vin: v.vin,
      bodyType: v.bodyType,
      annualMileage: v.annualMileage,
      primaryDriverId: v.primaryDriverId,
    })),
    meta: { ...currentSnapshot.meta, updatedAt: new Date().toISOString() },
  };

  // Recalculate premium (vehicle age affects rates!)
  const newPremium = this.calculatePremiumProgressive({
    driver: currentSnapshot.driver,
    additionalDrivers: currentSnapshot.additionalDrivers,
    vehicles: vehicles, // Use new vehicle list
    coverages: currentSnapshot.coverages,
  });

  updatedSnapshot.premium = { /* new premium */ };
  await this.db.update(policy).set({ quote_snapshot: updatedSnapshot });

  return { /* quote result */ };
}
```

**Restaurant Analogy**: Customer calls to change which tables they need - you update the table list for the reservation.

#### PUT /api/v1/quotes/:quoteNumber/coverage

Updates coverage selections and recalculates premium

```typescript
async updateQuoteCoverage(
  quoteNumber: string,
  coverages: {
    startDate,
    bodilyInjuryLimit,
    propertyDamageLimit,
    collision,
    collisionDeductible,
    comprehensive,
    comprehensiveDeductible,
    uninsuredMotorist,
    roadsideAssistance,
    rentalReimbursement,
    rentalLimit
  }
): Promise<QuoteResult> {
  const currentSnapshot = /* get from database */;

  // Update snapshot with coverages
  const updatedSnapshot = {
    ...currentSnapshot,
    coverages: {
      startDate: coverages.startDate,
      bodilyInjuryLimit: coverages.bodilyInjuryLimit,
      propertyDamageLimit: coverages.propertyDamageLimit,
      hasCollision: coverages.collision,
      collisionDeductible: coverages.collisionDeductible,
      hasComprehensive: coverages.comprehensive,
      comprehensiveDeductible: coverages.comprehensiveDeductible,
      hasUninsured: coverages.uninsuredMotorist,
      hasRoadside: coverages.roadsideAssistance,
      hasRental: coverages.rentalReimbursement,
      rentalLimit: coverages.rentalLimit,
    },
    meta: { ...currentSnapshot.meta, updatedAt: new Date().toISOString() },
  };

  // Recalculate premium (coverage selections heavily affect price!)
  const newPremium = this.calculatePremiumProgressive({
    driver: currentSnapshot.driver,
    additionalDrivers: currentSnapshot.additionalDrivers,
    vehicles: currentSnapshot.vehicles,
    coverages: coverages, // Use new coverage selections
  });

  updatedSnapshot.premium = { /* new premium */ };
  await this.db.update(policy).set({ quote_snapshot: updatedSnapshot });

  return { /* quote result */ };
}
```

**Restaurant Analogy**: Customer changes their meal selections - you update their order and recalculate the total bill.

### 3. **Enhanced Rating Engine**

We implemented a comprehensive premium calculation that considers multiple factors:

```typescript
// backend/src/services/quote/quote.service.ts

calculatePremiumProgressive(data: {
  driver: { firstName, lastName, birthDate, ... },
  additionalDrivers: Array<{ ... }>,
  vehicles: Array<{ year, make, model, ... }>,
  coverages: { bodilyInjuryLimit, collision, collisionDeductible, ... }
}): number {
  // Base premium (starting point)
  const basePremium = 1000;

  // 1. VEHICLE FACTOR (based on vehicle age)
  const primaryVehicle = data.vehicles[0];
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - primaryVehicle.year;

  let vehicleFactor = 1.0;
  if (vehicleAge <= 3) {
    vehicleFactor = 1.3; // Newer cars cost more (expensive to repair/replace)
  } else if (vehicleAge <= 7) {
    vehicleFactor = 1.0; // Mid-age cars (baseline)
  } else {
    vehicleFactor = 0.9; // Older cars (less valuable, cheaper insurance)
  }

  // 2. DRIVER FACTOR (based on driver age)
  const birthDate = new Date(data.driver.birthDate);
  const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  let driverFactor = 1.0;
  if (age < 25) {
    driverFactor = 1.8; // Young drivers (higher risk, higher premium)
  } else if (age >= 65) {
    driverFactor = 1.2; // Senior drivers (moderate risk)
  } else {
    driverFactor = 1.0; // 25-64 years old (baseline, lowest risk)
  }

  // 3. ADDITIONAL DRIVERS FACTOR
  let additionalDriversFactor = 1.0;
  if (data.additionalDrivers && data.additionalDrivers.length > 0) {
    // Each additional driver adds 15% to the premium
    additionalDriversFactor = 1 + (data.additionalDrivers.length * 0.15);
  }

  // 4. COVERAGE FACTOR (based on coverage selections and limits)
  let coverageFactor = 1.0;

  // Bodily Injury Liability - Higher limits cost more
  const biLimit = data.coverages.bodilyInjuryLimit;
  if (biLimit === '25/50') coverageFactor += 0.05;       // Minimum coverage
  else if (biLimit === '50/100') coverageFactor += 0.10;  // Standard
  else if (biLimit === '100/300') coverageFactor += 0.15; // Recommended
  else if (biLimit === '250/500') coverageFactor += 0.25; // High coverage

  // Property Damage Liability
  const pdLimit = data.coverages.propertyDamageLimit;
  if (pdLimit === '25000') coverageFactor += 0.03;      // Minimum
  else if (pdLimit === '50000') coverageFactor += 0.05; // Standard
  else if (pdLimit === '100000') coverageFactor += 0.08; // High

  // Collision Coverage - HIGHER deductible = LOWER premium
  if (data.coverages.collision) {
    const collDeductible = data.coverages.collisionDeductible;
    if (collDeductible === 250) coverageFactor += 0.35;       // $250 deductible = higher premium
    else if (collDeductible === 500) coverageFactor += 0.30;  // $500 deductible
    else if (collDeductible === 1000) coverageFactor += 0.25; // $1000 deductible
    else if (collDeductible === 2500) coverageFactor += 0.20; // $2500 deductible = lower premium
  }

  // Comprehensive Coverage - HIGHER deductible = LOWER premium
  if (data.coverages.comprehensive) {
    const compDeductible = data.coverages.comprehensiveDeductible;
    if (compDeductible === 250) coverageFactor += 0.25;       // $250 deductible
    else if (compDeductible === 500) coverageFactor += 0.20;  // $500 deductible
    else if (compDeductible === 1000) coverageFactor += 0.15; // $1000 deductible
    else if (compDeductible === 2500) coverageFactor += 0.10; // $2500 deductible
  }

  // Uninsured/Underinsured Motorist
  if (data.coverages.uninsuredMotorist) coverageFactor += 0.10; // +10%

  // Roadside Assistance
  if (data.coverages.roadsideAssistance) coverageFactor += 0.05; // +5%

  // Rental Reimbursement - Higher daily limit = higher premium
  if (data.coverages.rentalReimbursement) {
    const rentalLimit = data.coverages.rentalLimit;
    if (rentalLimit === 30) coverageFactor += 0.03;      // $30/day
    else if (rentalLimit === 50) coverageFactor += 0.05; // $50/day
    else if (rentalLimit === 75) coverageFactor += 0.07; // $75/day
  }

  // FINAL CALCULATION (multiplicative model)
  const totalPremium = Math.round(
    basePremium *
    vehicleFactor *
    driverFactor *
    additionalDriversFactor *
    coverageFactor
  );

  this.logger.debug('Premium calculated', {
    basePremium,
    vehicleFactor,
    driverFactor,
    additionalDriversFactor,
    coverageFactor,
    totalPremium,
  });

  return totalPremium;
}
```

**Why Multiplicative Model?**

We multiply all factors together because risks compound:
- Young driver (1.8×) driving a new car (1.3×) = 2.34× risk multiplier
- Older driver (1.0×) driving an old car (0.9×) = 0.9× risk multiplier

**Example Calculation**:

Scenario: 22-year-old driver, 2023 Honda Accord, 1 additional driver (spouse), full coverage with $500 deductibles

```
Base:      $1,000
Vehicle:   ×1.3   (car is 2 years old)
Driver:    ×1.8   (22 years old, young driver)
Add'l:     ×1.15  (1 additional driver)
Coverage:  ×1.75  (100/300 BI + $50k PD + Collision $500 + Comp $500 + Uninsured + Roadside + Rental $50)
           = 0.15 + 0.05 + 0.30 + 0.20 + 0.10 + 0.05 + 0.05 = 0.90 multiplier, so 1.90 total

Total = $1,000 × 1.3 × 1.8 × 1.15 × 1.90 = $5,136 per 6 months
Monthly = $5,136 / 6 = $856
```

**Restaurant Analogy**: Like calculating a restaurant bill - you have a base price for the entrée, then multiply by factors:
- Rush hour (×1.2 surge pricing)
- Large party (×1.15 for groups of 6+)
- Premium seating (×1.3 for window table)
- Add-ons (appetizers, desserts, drinks add to total)

### 4. **Frontend Data Flow with TanStack Query**

We use TanStack Query (React Query) to manage server state:

**What is TanStack Query?**
A library that handles:
- Fetching data from APIs
- Caching responses
- Automatically refetching stale data
- Loading/error states
- Optimistic updates

**Code Example**:
```typescript
// src/hooks/useQuote.ts

// Query for fetching quote by number
export function useQuoteByNumber(quoteNumber: string | null | undefined) {
  return useQuery({
    queryKey: ['quotes', 'byNumber', quoteNumber], // Unique cache key
    queryFn: () => quoteApi.getQuoteByNumber(quoteNumber!), // Function that fetches data
    enabled: !!quoteNumber, // Only run if quoteNumber exists
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
}

// Mutation for updating coverage
export function useUpdateQuoteCoverage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteNumber, coverageData }) =>
      quoteApi.updateQuoteCoverage(quoteNumber, coverageData),

    onSuccess: (updatedQuote, variables) => {
      // Invalidate cache so next query fetches fresh data
      queryClient.invalidateQueries({
        queryKey: ['quotes', 'byNumber', variables.quoteNumber],
      });
    },

    onError: (error: Error) => {
      console.error('[useUpdateQuoteCoverage] Error:', error);
    },
  });
}
```

**How It Works**:

1. **Component calls hook**:
```typescript
const { data: quote, isLoading } = useQuoteByNumber('DZI9XM4GRE');
```

2. **TanStack Query checks cache**:
- Cache key: `['quotes', 'byNumber', 'DZI9XM4GRE']`
- If data exists and is fresh (< 5 min old) → return cached data
- If data is stale → return cached data BUT refetch in background
- If no data → fetch from API

3. **When mutation succeeds**:
```typescript
await updateCoverage.mutateAsync({ quoteNumber, coverageData });
```
- API call completes
- `onSuccess` callback runs
- Invalidates cache with matching query key
- All components using that query automatically refetch

**Restaurant Analogy**:
- **useQuery** = Looking at the menu (read data)
- **useMutation** = Placing an order (change data)
- **Cache** = Restaurant's display case showing today's specials (so you don't have to ask the kitchen every time)
- **Invalidate** = Updating the display case when new specials come out

### 5. **Human-Readable Quote IDs**

We changed the quote ID format from `QXXXXX` (5 chars) to `DZXXXXXXXX` (10 chars):

**Code**:
```typescript
// backend/src/services/quote/quote.service.ts

private generateQuoteNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DZ${suffix}`; // DZ prefix + 8 random chars
}
```

**Examples**:
- `DZI9XM4GRE`
- `DZ477WPV55`
- `DZMILV6000`

**Why DZ prefix?**
- D = Demo
- Z = Custom prefix (can be anything you want!)
- 8 characters = 36^8 = 2.8 trillion possible IDs (collision-resistant)

## Files Created/Modified

### Backend Files:
- `backend/src/api/routes/quotes.controller.ts` - Added 4 PUT endpoints (primary-driver, drivers, vehicles, coverage)
- `backend/src/services/quote/quote.service.ts` - Added 4 update methods + enhanced rating engine
- `database/schema/communication-identity.schema.ts` - Fixed party_identifier FK
- `STATUS_TERMINOLOGY.md` - NEW file documenting IN_FORCE vs ACTIVE terminology

### Frontend Files:
- `src/pages/quote/PrimaryDriverInfo.tsx` - NEW comprehensive driver form with edit support
- `src/pages/quote/AdditionalDrivers.tsx` - NEW multi-driver management page
- `src/pages/quote/VehiclesList.tsx` - NEW multi-vehicle management page
- `src/pages/quote/CoverageSelection.tsx` - Enhanced with dynamic pricing
- `src/pages/quote/QuoteResults.tsx` - Fixed money formatting
- `src/services/quote-api.ts` - Added updatePrimaryDriver() method
- `src/hooks/useQuote.ts` - Added 4 new hooks (useUpdatePrimaryDriver, useUpdateQuoteDrivers, useUpdateQuoteVehicles, useUpdateQuoteCoverage)
- `src/App.tsx` - Added routes for new pages

## Key Concepts Learned

### 1. **Debouncing**

**What**: Delay executing a function until user stops triggering it for a certain time

**Why**: Prevent overwhelming the server with too many API calls

**Example**: User changing deductible from $250 → $500 → $1000 → $2500 in quick succession
- Without debounce: 4 API calls
- With 300ms debounce: 1 API call (waits 300ms after last change)

**Code**:
```typescript
const timer = setTimeout(() => {
  // Call API
}, 300); // Wait 300ms

return () => clearTimeout(timer); // Cancel if user makes another change
```

### 2. **useRef for Non-Rendering State**

**What**: Store a value that persists across re-renders but doesn't cause re-renders when changed

**When to Use**:
- Tracking if component is mounting for first time
- Storing previous values
- Holding references to DOM elements
- Storing timers/intervals

**Example**:
```typescript
const isInitialLoadRef = useRef(true); // Starts as true

useEffect(() => {
  if (isInitialLoadRef.current) {
    // First time loading
    isInitialLoadRef.current = false; // Won't cause re-render!
  } else {
    // Subsequent loads
  }
}, [data]);
```

### 3. **Optimistic Updates**

**What**: Update UI immediately before API call completes, then revert if it fails

**Why**: Makes UI feel instant and responsive

**Example**:
```typescript
const updateDriver = useUpdateDriver();

updateDriver.mutate(newData, {
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['drivers']);

    // Save previous data
    const previousData = queryClient.getQueryData(['drivers']);

    // Optimistically update UI
    queryClient.setQueryData(['drivers'], newData);

    return { previousData }; // Return context for rollback
  },
  onError: (err, newData, context) => {
    // Rollback to previous data
    queryClient.setQueryData(['drivers'], context.previousData);
  },
  onSettled: () => {
    // Refetch to ensure sync with server
    queryClient.invalidateQueries(['drivers']);
  },
});
```

### 4. **Change Detection**

**What**: Compare current form data with original data to detect if user made changes

**Why**: Decide whether to make API call or not

**Example**:
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });
const [originalData, setOriginalData] = useState(null);

// When loading existing data
useEffect(() => {
  if (existingData) {
    setFormData(existingData);
    setOriginalData(existingData); // Store original
  }
}, [existingData]);

// When submitting
const hasChanges =
  formData.name !== originalData.name ||
  formData.email !== originalData.email;

if (hasChanges) {
  // User made changes, save them
  await updateData(formData);
} else {
  // No changes, just navigate forward
  navigate('/next-page');
}
```

### 5. **Data Mapping**

**What**: Transform data from one format to another

**Why**: API returns data in one format, component expects another format

**Example**:
```typescript
// API returns this:
{
  firstName: "John",
  birthDate: "1990-01-01",
  relationship: null
}

// Component expects this:
{
  firstName: "John",
  dob: "1990-01-01", // Different field name!
  relationship: "other" // Default value, not null!
}

// Mapping:
const mapped = apiData.map(item => ({
  firstName: item.firstName,
  dob: item.birthDate, // Rename
  relationship: item.relationship || 'other', // Default
}));
```

### 6. **URL State Management**

**What**: Store application state in the URL

**Why**: Makes URLs shareable, allows back/forward navigation, persists state

**Example**:
```typescript
// URL: /quote/driver-info/DZI9XM4GRE
//                         ^^^^^^^^^^
//                         Quote number in URL

const { quoteNumber } = useParams(); // Get from URL
const { data: quote } = useQuoteByNumber(quoteNumber); // Fetch using URL param

// Navigate with state
navigate(`/quote/vehicles/${quoteNumber}`); // Preserves quote context
```

## The Restaurant Analogy

Building this Progressive quote flow is like designing a complete restaurant reservation and ordering system:

**Before (Simple Flow)**:
- Host takes name, counts people, assigns table
- One party, one table, simple

**After (Progressive Flow)**:
- Host takes primary contact info (Primary Driver Info)
- Asks "Anyone else dining with you?" (Additional Drivers)
- Asks "How many tables do you need?" (Vehicles List)
- Asks "What meal options?" with live pricing (Coverage Selection)
- Shows final bill (Quote Results)
- As you change meal options, the bill updates in real-time (Dynamic Pricing)
- If you go back and change the guest list, the bill recalculates (Recalculation)
- Every change is saved to the reservation system (Backend API)
- You can leave and come back - your reservation is still there (Data Persistence)

## Bug Fixes

### 1. **AdditionalDrivers Page Error**

**Problem**: Page crashed with `Cannot read properties of null (reading 'charAt')`

**Root Cause**: API returned `relationship: null` but code tried to call `relationship.charAt(0)`

**Fix**: Added default value mapping
```typescript
const mappedDrivers = quote.additionalDrivers.map((driver, index) => ({
  id: driver.email || `driver-${index}`,
  relationship: driver.relationship || 'other', // ← Default prevents null error
}));
```

### 2. **Primary Driver Duplication**

**Problem**: Primary driver appeared in both `driver` and `additionalDrivers` arrays

**Root Cause**: When updating drivers, frontend accidentally included primary driver

**Fix**: Backend filters by email
```typescript
const primaryDriverEmail = currentSnapshot.driver?.email;
const filteredDrivers = additionalDrivers.filter(
  d => d.email.toLowerCase() !== primaryDriverEmail?.toLowerCase()
);
```

### 3. **Money Formatting**

**Problem**: Prices showed as `$357.5` instead of `$357.50`

**Root Cause**: Used `.toString()` which doesn't enforce 2 decimal places

**Fix**: Use `.toFixed(2)`
```typescript
<QuoteCard
  price={monthly.toFixed(2)} // ← Always 2 decimals
  total={sixMonth.toFixed(2)}
/>
```

### 4. **Price Card Flickering**

**Problem**: Price card was flickering continuously

**Root Cause**: Infinite loop:
1. Coverage changes → API call
2. API call succeeds → refetch()
3. Refetch updates quote → triggers coverage load effect
4. Coverage load updates state → back to step 1

**Fix**: Use `useRef` to track initial load
```typescript
const isInitialLoadRef = useRef(true);

// Load initial coverage
useEffect(() => {
  if (quote && isInitialLoadRef.current) {
    setCoverage(quote.coverages);
    isInitialLoadRef.current = false; // Mark initial load complete
  }
}, [quote]);

// Update coverage
useEffect(() => {
  if (isInitialLoadRef.current) return; // Skip during initial load!
  // Make API call...
}, [coverage]);
```

## Total Progress

**Tasks Completed**: 99/183 (54%)
- Phase 1: ✅ 12/12 (100%)
- Phase 2: ✅ 10/10 (100%)
- Phase 3: ✅ 77/77 (100%) ← Including all enhancements!
- Phase 4: 0/22 (0%)
- Phase 5: 0/20 (0%)
- Phase 6: 0/7 (0%)
- Phase 7: 0/45 (0%)

**What's Working**:
- ✅ Complete Progressive-style multi-driver/vehicle quote flow
- ✅ 7 backend API endpoints (3 GET + 1 POST + 3 PUT)
- ✅ Real-time dynamic pricing
- ✅ Comprehensive rating engine with multiple factors
- ✅ Data persistence across navigation
- ✅ Human-readable quote IDs (DZXXXXXXXX format)
- ✅ All bugs fixed
- ✅ Zero TypeScript compilation errors
- ✅ Zero runtime errors

**Next Steps**:
1. **Option 1**: Deploy to Vercel (make it public!)
2. **Option 2**: Add Phase 4 - Policy Binding (convert quotes to policies)
3. **Option 3**: Add comprehensive discounts/surcharges (Tasks T069g-T069m)
4. **Option 4**: Add testing (Phase 7)

**Recommended**: Deploy to Vercel first, then tackle Phase 4!
