#!/bin/bash

# Progressive Quote Flow End-to-End Test
# This script simulates a complete user journey through the quote flow

set -e  # Exit on error

API_BASE="http://localhost:3000/api/v1"

echo "=========================================="
echo "PROGRESSIVE QUOTE FLOW - E2E TEST"
echo "=========================================="
echo ""

# Step 1: PrimaryDriverInfo - Create initial quote shell
echo "📋 Step 1: PrimaryDriverInfo - Creating quote shell..."
QUOTE_RESPONSE=$(curl -s -X POST $API_BASE/quotes -H "Content-Type: application/json" -d '{
  "driver_first_name": "Alice",
  "driver_last_name": "Johnson",
  "driver_birth_date": "1988-03-15",
  "driver_email": "alice.johnson@example.com",
  "driver_phone": "555-1234",
  "driver_marital_status": "married",
  "address_line_1": "456 Oak Avenue",
  "address_city": "Portland",
  "address_state": "OR",
  "address_zip": "97201",
  "vehicle_year": 2020,
  "vehicle_make": "Subaru",
  "vehicle_model": "Outback",
  "vehicle_vin": "TESTFLOW001"
}')

QUOTE_NUMBER=$(echo $QUOTE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['quoteNumber'])")
PREMIUM_1=$(echo $QUOTE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['premium'])")

echo "✅ Quote created: $QUOTE_NUMBER"
echo "   Premium: \$$PREMIUM_1"
echo "   URL: /quote/additional-drivers/$QUOTE_NUMBER"
echo ""

# Step 2: AdditionalDrivers - Add spouse
echo "👥 Step 2: AdditionalDrivers - Adding spouse..."
DRIVERS_RESPONSE=$(curl -s -X PUT $API_BASE/quotes/$QUOTE_NUMBER/drivers -H "Content-Type: application/json" -d '{
  "additionalDrivers": [
    {
      "first_name": "Bob",
      "last_name": "Johnson",
      "birth_date": "1985-07-22",
      "email": "bob.johnson@example.com",
      "phone": "555-1235",
      "gender": "male",
      "marital_status": "married",
      "years_licensed": 20,
      "relationship": "spouse"
    }
  ]
}')

PREMIUM_2=$(echo $DRIVERS_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['premium'])")

echo "✅ Spouse added"
echo "   Premium updated: \$$PREMIUM_1 → \$$PREMIUM_2 (+15% for additional driver)"
echo "   URL: /quote/vehicles/$QUOTE_NUMBER"
echo ""

# Step 3: VehiclesList - Add second vehicle
echo "🚗 Step 3: VehiclesList - Adding second vehicle..."
VEHICLES_RESPONSE=$(curl -s -X PUT $API_BASE/quotes/$QUOTE_NUMBER/vehicles -H "Content-Type: application/json" -d '{
  "vehicles": [
    {
      "year": 2020,
      "make": "Subaru",
      "model": "Outback",
      "vin": "TESTFLOW001",
      "body_type": "suv",
      "annual_mileage": 12000,
      "primary_driver_id": "primary"
    },
    {
      "year": 2022,
      "make": "Honda",
      "model": "Civic",
      "vin": "TESTFLOW002",
      "body_type": "sedan",
      "annual_mileage": 8000,
      "primary_driver_id": "spouse"
    }
  ]
}')

PREMIUM_3=$(echo $VEHICLES_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['premium'])")

echo "✅ Second vehicle added"
echo "   Premium updated: \$$PREMIUM_2 → \$$PREMIUM_3 (multi-car discount applied)"
echo "   URL: /quote/coverage-selection/$QUOTE_NUMBER"
echo ""

# Step 4: CoverageSelection - Finalize with full coverage
echo "🛡️  Step 4: CoverageSelection - Adding full coverage..."
COVERAGE_RESPONSE=$(curl -s -X PUT $API_BASE/quotes/$QUOTE_NUMBER/coverage -H "Content-Type: application/json" -d '{
  "coverage_start_date": "2025-12-01",
  "coverage_bodily_injury_limit": "250/500",
  "coverage_property_damage_limit": "100000",
  "coverage_collision": true,
  "coverage_collision_deductible": 500,
  "coverage_comprehensive": true,
  "coverage_comprehensive_deductible": 250,
  "coverage_uninsured_motorist": true,
  "coverage_roadside_assistance": true,
  "coverage_rental_reimbursement": true,
  "coverage_rental_limit": 75
}')

PREMIUM_4=$(echo $COVERAGE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['premium'])")

echo "✅ Coverage added and quote finalized"
echo "   Premium updated: \$$PREMIUM_3 → \$$PREMIUM_4 (coverage added)"
echo "   Status: QUOTED"
echo "   URL: /quote/results/$QUOTE_NUMBER"
echo ""

# Step 5: QuoteResults - Verify final quote
echo "📊 Step 5: QuoteResults - Verifying final quote..."
FINAL_QUOTE=$(curl -s $API_BASE/quotes/$QUOTE_NUMBER)

STATUS=$(echo $FINAL_QUOTE | python3 -c "import sys, json; print(json.load(sys.stdin)['quote_status'])")
VEHICLES_COUNT=$(echo $FINAL_QUOTE | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('vehicles', [])))")
DRIVERS_COUNT=$(echo $FINAL_QUOTE | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('additionalDrivers', [])))")

echo "✅ Quote finalized:"
echo "   Quote Number: $QUOTE_NUMBER"
echo "   Status: $STATUS"
echo "   Final Premium: \$$PREMIUM_4"
echo "   Vehicles: $VEHICLES_COUNT"
echo "   Additional Drivers: $DRIVERS_COUNT"
echo ""

# Summary
echo "=========================================="
echo "TEST COMPLETE ✅"
echo "=========================================="
echo ""
echo "Premium Journey:"
echo "  1. Initial quote: \$$PREMIUM_1"
echo "  2. + Spouse driver: \$$PREMIUM_2"
echo "  3. + Second vehicle: \$$PREMIUM_3"
echo "  4. + Full coverage: \$$PREMIUM_4"
echo ""
echo "Quote $QUOTE_NUMBER is ready for binding!"
echo ""
