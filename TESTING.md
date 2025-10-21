# End-to-End Testing Guide: Auto Insurance Quote Flow

**Last Updated**: 2025-10-19
**Status**: Ready for Testing
**Prerequisites**: Phase 3 complete, database migrations run (T046)

---

## Quick Start

### Option 1: Automated Test Script

```bash
# Make script executable
chmod +x test-quote-flow.sh

# Run the test
./test-quote-flow.sh
```

The script will:
1. ✓ Check environment configuration
2. ✓ Verify database connectivity
3. ✓ Install dependencies
4. ✓ Build backend
5. ✓ Start backend server (http://localhost:3000)
6. ✓ Test API endpoints
7. ✓ Start frontend server (http://localhost:5173)
8. ✓ Display manual testing instructions

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run build
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

**Terminal 3 - API Tests:**
```bash
# See "API Testing Examples" section below
```

---

## Testing Checklist

### ✅ Phase 1: Database & Backend Setup

- [ ] `.env` file configured with `DATABASE_URL`
- [ ] Database migrations run successfully (`npm run db:generate && npm run db:migrate`)
- [ ] Backend compiles without errors (`npm run build`)
- [ ] Backend starts successfully (`npm run start:dev`)
- [ ] Backend accessible at `http://localhost:3000`

### ✅ Phase 2: Mock Services

- [ ] **VIN Decoder** - Test with `1HGBH41JXMN109186`
- [ ] **Vehicle Valuation** - Returns realistic pricing
- [ ] **Safety Ratings** - Returns NHTSA/IIHS scores
- [ ] **Delay Simulator** - Adds realistic latency
- [ ] **Vehicle Data Cache** - Speeds up repeat lookups

### ✅ Phase 3: Rating Engine

- [ ] **Vehicle Rating** - Calculates vehicle factor correctly
- [ ] **Driver Rating** - Applies age/experience/violations multipliers
- [ ] **Location Rating** - Uses state/zip code factors
- [ ] **Coverage Rating** - Adjusts for limits/deductibles
- [ ] **Discounts** - Applies eligible discounts (good driver, multi-car, etc.)
- [ ] **Surcharges** - Applies penalties (young driver, violations, etc.)
- [ ] **Premium Calculation** - Final premium in $800-$3000 range
- [ ] **Taxes & Fees** - State-specific taxes calculated

### ✅ Phase 4: Quote Service

- [ ] **Create Quote** - Generates unique quote number (Q-YYYYMMDD-XXXXXX)
- [ ] **Party Creation** - Creates Party and Person entities
- [ ] **Vehicle Enrichment** - Enriches vehicle data from VIN
- [ ] **Policy Creation** - Creates Agreement and Policy with status=QUOTED
- [ ] **Coverage Assignment** - Links coverages to policy
- [ ] **Quote Expiration** - Tracks 30-day expiration

### ✅ Phase 5: API Endpoints

- [ ] `POST /api/v1/mock/vin-decoder` - Decodes VIN
- [ ] `POST /api/v1/mock/vehicle-valuation` - Gets vehicle value
- [ ] `POST /api/v1/mock/safety-ratings` - Gets safety scores
- [ ] `POST /api/v1/rating/calculate` - Calculates premium
- [ ] `POST /api/v1/quotes` - Creates new quote
- [ ] `GET /api/v1/quotes/:id` - Gets quote by ID
- [ ] `GET /api/v1/quotes/reference/:refNumber` - Gets quote by number
- [ ] `PUT /api/v1/quotes/:id/coverage` - Updates coverage
- [ ] `POST /api/v1/quotes/:id/calculate` - Recalculates premium

### ✅ Phase 6: Frontend Pages

- [ ] **Homepage** - Loads successfully
- [ ] **Vehicle Info** - VIN decoder works, manual entry works
- [ ] **Driver Info** - Form validation works
- [ ] **Coverage Selection** - Premium updates in real-time
- [ ] **Quote Results** - Displays complete premium breakdown

---

## API Testing Examples

### 1. Test VIN Decoder

```bash
curl -X POST http://localhost:3000/api/v1/mock/vin-decoder \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186"
  }'
```

**Expected Response:**
```json
{
  "vin": "1HGBH41JXMN109186",
  "make": "Honda",
  "model": "Accord",
  "year": 2020,
  "vehicleType": "SEDAN",
  "engineType": "I4",
  "fuelType": "GASOLINE",
  "isValid": true
}
```

### 2. Test Vehicle Valuation

```bash
curl -X POST http://localhost:3000/api/v1/mock/vehicle-valuation \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2020,
    "make": "Honda",
    "model": "Accord",
    "mileage": 35000,
    "condition": "GOOD"
  }'
```

**Expected Response:**
```json
{
  "tradeInValue": 18500,
  "privatePartyValue": 20500,
  "dealerRetailValue": 23000,
  "replacementCost": 25000
}
```

### 3. Test Premium Calculation

```bash
curl -X POST http://localhost:3000/api/v1/rating/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": {
      "year": 2020,
      "make": "Toyota",
      "model": "Camry",
      "vin": "4T1BF1FK5HU123456",
      "annualMileage": 12000,
      "primaryUse": "COMMUTE"
    },
    "driver": {
      "age": 30,
      "yearsLicensed": 12,
      "violations": [],
      "accidents": [],
      "gender": "M"
    },
    "location": {
      "zipCode": "90210",
      "stateCode": "CA",
      "city": "Beverly Hills"
    },
    "coverages": [
      {
        "coverageCode": "BODILY_INJURY",
        "limits": {
          "perPerson": 100000,
          "perAccident": 300000
        },
        "isSelected": true
      },
      {
        "coverageCode": "PROPERTY_DAMAGE",
        "limits": {
          "perOccurrence": 100000
        },
        "isSelected": true
      },
      {
        "coverageCode": "COLLISION",
        "deductible": 500,
        "isSelected": true
      },
      {
        "coverageCode": "COMPREHENSIVE",
        "deductible": 500,
        "isSelected": true
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "basePremium": 1600.00,
  "vehicleFactor": 0.95,
  "driverFactor": 0.90,
  "locationFactor": 1.20,
  "coverageFactor": 1.00,
  "totalFactorMultiplier": 1.03,
  "adjustedPremium": 1648.00,
  "discounts": [
    {
      "code": "GOOD_DRIVER",
      "name": "Good Driver Discount",
      "percentage": 15,
      "amount": 247.20
    }
  ],
  "surcharges": [],
  "totalDiscountAmount": 247.20,
  "totalSurchargeAmount": 0,
  "premiumAfterAdjustments": 1400.80,
  "premiumTax": 32.92,
  "policyFee": 15.00,
  "dmvFee": 25.00,
  "totalTaxesAndFees": 72.92,
  "totalPremium": 1473.72
}
```

### 4. Test Create Quote (Full Flow)

```bash
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": {
      "vin": "1HGBH41JXMN109186",
      "annualMileage": 12000,
      "primaryUse": "COMMUTE",
      "ownershipType": "OWNED"
    },
    "driver": {
      "firstName": "Jane",
      "lastName": "Smith",
      "birthDate": "1990-05-15",
      "email": "jane.smith@example.com",
      "phone": "555-0100",
      "licenseNumber": "D1234567",
      "licenseState": "CA",
      "yearsLicensed": 12
    },
    "location": {
      "street": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    },
    "coverages": [
      {
        "coverageCode": "BODILY_INJURY",
        "limits": { "perPerson": 100000, "perAccident": 300000 },
        "isSelected": true
      },
      {
        "coverageCode": "PROPERTY_DAMAGE",
        "limits": { "perOccurrence": 100000 },
        "isSelected": true
      },
      {
        "coverageCode": "COLLISION",
        "deductible": 1000,
        "isSelected": true
      }
    ],
    "effectiveDate": "2025-11-01"
  }'
```

**Expected Response:**
```json
{
  "quoteId": "uuid-here",
  "quoteNumber": "Q-20251019-AB12CD",
  "status": "QUOTED",
  "effectiveDate": "2025-11-01",
  "expirationDate": "2026-05-01",
  "quoteExpiresAt": "2025-11-18",
  "totalPremium": 1582.45,
  "premiumBreakdown": {
    "basePremium": 1600.00,
    "discounts": 247.20,
    "surcharges": 0,
    "taxes": 32.92,
    "fees": 40.00
  }
}
```

---

## Frontend User Flow Testing

### Test Scenario 1: Complete Quote Flow (Happy Path)

**Steps:**

1. **Navigate to Homepage**
   - URL: `http://localhost:5173`
   - Click "Get a Quote" button

2. **Vehicle Information Page** (`/quote/vehicle`)
   - Enter VIN: `1HGBH41JXMN109186`
   - Click "Decode VIN"
   - Verify fields auto-populate:
     - Make: Honda
     - Model: Accord
     - Year: 2020
   - Click "Next"

3. **Driver Information Page** (`/quote/driver`)
   - Fill out form:
     - First Name: John
     - Last Name: Doe
     - Birth Date: 01/01/1990
     - Email: john.doe@test.com
     - Phone: 555-0123
   - Click "Next"

4. **Coverage Selection Page** (`/quote/coverage`)
   - Select Bodily Injury (100/300)
   - Select Property Damage (100k)
   - Select Collision ($500 deductible)
   - Select Comprehensive ($500 deductible)
   - **Watch premium update in real-time** ← Key test!
   - Click "Get Quote"

5. **Quote Results Page** (`/quote/results`)
   - Verify premium breakdown displayed:
     - Base premium
     - Vehicle factor
     - Driver factor
     - Location factor
     - Discounts (if any)
     - Surcharges (if any)
     - Taxes
     - Fees
     - **Total Premium**
   - Verify quote number displayed (Q-YYYYMMDD-XXXXXX format)
   - Verify expiration date (30 days from today)

**Expected Result:** Quote created successfully with premium between $800-$3000

---

### Test Scenario 2: Young Driver (High Premium)

**Driver Details:**
- Age: 18
- Years Licensed: 1
- Recent speeding ticket

**Expected Result:** Premium significantly higher due to:
- Young driver surcharge (+50%)
- Inexperienced driver surcharge (+30%)
- Violation surcharge (+15%)

---

### Test Scenario 3: Excellent Driver (Low Premium)

**Driver Details:**
- Age: 45
- Years Licensed: 25
- No violations or accidents
- Low annual mileage (5,000)
- Advanced safety features

**Expected Result:** Premium significantly lower due to:
- Mature driver discount
- Good driver discount (-20%)
- Low mileage discount (-10%)
- Safety features discount (-5%)

---

## Performance Benchmarks

| Operation | Target | Acceptable | Unacceptable |
|-----------|--------|------------|--------------|
| VIN Decode | < 500ms | < 1s | > 2s |
| Vehicle Valuation | < 1s | < 2s | > 3s |
| Premium Calculation | < 2s | < 5s | > 10s |
| Create Quote (full flow) | < 3s | < 5s | > 10s |
| Page Load | < 1s | < 2s | > 3s |

---

## Troubleshooting

### Backend Won't Start

```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Check environment variables
cat .env | grep DATABASE_URL

# Check database connection
cd backend
npm run db:check  # (if this script exists)
```

### Frontend Won't Start

```bash
# Check if port 5173 is in use
lsof -ti:5173 | xargs kill -9

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Returns 500 Errors

Check backend logs for detailed error messages:
```bash
cd backend
npm run start:dev
# Look for error stack traces
```

### Database Connection Errors

```bash
# Verify .env has correct DATABASE_URL
grep DATABASE_URL .env

# Test direct connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Premium Calculation Returns $0

Check that:
- Rating tables are seeded
- All rating services are registered in modules
- Vehicle/driver/location data is valid

---

## Success Criteria

✅ **Phase 3 is complete when:**

1. All mock services return realistic data
2. Rating engine calculates premiums correctly
3. Quote can be created through API
4. Frontend pages load without errors
5. End-to-end flow works from vehicle entry to quote results
6. Premium breakdown shows all factors, discounts, surcharges
7. Quote number generated in correct format
8. Quote expiration tracked correctly

---

## Next Steps After Testing

Once Phase 3 testing is complete:

1. **Fix any bugs discovered**
2. **Document any edge cases found**
3. **Move to Phase 4: Policy Binding & Payment**
   - Payment processing
   - Policy status transitions
   - Document generation
4. **Move to Phase 5: Portal Access**
   - Self-service portal
   - Claims filing
   - Billing history

---

## Support

If you encounter issues:

1. Check `backend/logs/` for error logs
2. Check browser console for frontend errors
3. Review this testing guide
4. Check `CLAUDE.md` for architecture details
5. Review task list in `specs/001-auto-insurance-flow/tasks.md`
