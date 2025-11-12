#!/bin/bash

# Test per-vehicle coverage pricing
# This script tests the new per-vehicle deductible pricing

echo "🧪 Testing Per-Vehicle Coverage Pricing"
echo "========================================"
echo ""

QUOTE_NUMBER="DZCH74DEZX"
API_URL="http://localhost:3000/api/v1/quotes"

echo "📝 Step 1: Fetching existing quote ${QUOTE_NUMBER}..."
QUOTE_RESPONSE=$(curl -s "${API_URL}/reference/${QUOTE_NUMBER}")
echo "Response: ${QUOTE_RESPONSE}" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✅ Current Premium: \${data.get('premium', {}).get('total', 'N/A')}\")"
echo ""

echo "📝 Step 2: Updating coverage with per-vehicle deductibles..."
echo "   Vehicle 0: Collision=$500, Comprehensive=$500"
echo "   Vehicle 1: Collision=$1000, Comprehensive=$1000"

UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/${QUOTE_NUMBER}/coverage" \
  -H "Content-Type: application/json" \
  -d '{
    "coverage_bodily_injury_limit": "100/300",
    "coverage_property_damage_limit": "50000",
    "coverage_collision": true,
    "coverage_comprehensive": true,
    "vehicle_coverages": [
      {
        "vehicle_index": 0,
        "collision_deductible": 500,
        "comprehensive_deductible": 500
      },
      {
        "vehicle_index": 1,
        "collision_deductible": 1000,
        "comprehensive_deductible": 1000
      }
    ]
  }')

echo "$UPDATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✅ New Premium (V0:$500/$500, V1:$1000/$1000): \${data.get('premium', 'N/A')}\")"
echo ""

echo "📝 Step 3: Testing different deductibles..."
echo "   Vehicle 0: Collision=$250, Comprehensive=$250 (lower deductible = higher premium)"
echo "   Vehicle 1: Collision=$1000, Comprehensive=$1000"

UPDATE_RESPONSE_2=$(curl -s -X PUT "${API_URL}/${QUOTE_NUMBER}/coverage" \
  -H "Content-Type: application/json" \
  -d '{
    "coverage_bodily_injury_limit": "100/300",
    "coverage_property_damage_limit": "50000",
    "coverage_collision": true,
    "coverage_comprehensive": true,
    "vehicle_coverages": [
      {
        "vehicle_index": 0,
        "collision_deductible": 250,
        "comprehensive_deductible": 250
      },
      {
        "vehicle_index": 1,
        "collision_deductible": 1000,
        "comprehensive_deductible": 1000
      }
    ]
  }')

echo "$UPDATE_RESPONSE_2" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✅ New Premium (V0:$250/$250, V1:$1000/$1000): \${data.get('premium', 'N/A')}\")"
echo ""

echo "📝 Step 4: Testing high deductibles on both vehicles..."
echo "   Vehicle 0: Collision=$1000, Comprehensive=$1000"
echo "   Vehicle 1: Collision=$1000, Comprehensive=$1000"

UPDATE_RESPONSE_3=$(curl -s -X PUT "${API_URL}/${QUOTE_NUMBER}/coverage" \
  -H "Content-Type: application/json" \
  -d '{
    "coverage_bodily_injury_limit": "100/300",
    "coverage_property_damage_limit": "50000",
    "coverage_collision": true,
    "coverage_comprehensive": true,
    "vehicle_coverages": [
      {
        "vehicle_index": 0,
        "collision_deductible": 1000,
        "comprehensive_deductible": 1000
      },
      {
        "vehicle_index": 1,
        "collision_deductible": 1000,
        "comprehensive_deductible": 1000
      }
    ]
  }')

echo "$UPDATE_RESPONSE_3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✅ New Premium (V0:$1000/$1000, V1:$1000/$1000): \${data.get('premium', 'N/A')}\")"
echo ""

echo "✅ Test Complete!"
echo ""
echo "Expected Behavior:"
echo "- Step 2 (mixed): Mid-range premium"
echo "- Step 3 (V0 low deductibles): HIGHER premium (lower deductibles cost more)"
echo "- Step 4 (both high deductibles): LOWER premium (higher deductibles cost less)"
