#!/bin/bash

# Create a test quote and bind it to get a policy number

echo "Creating quote..."
QUOTE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "effectiveDate": "2025-11-01",
    "primaryDriver": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1985-05-15",
      "gender": "M",
      "maritalStatus": "MARRIED",
      "licenseNumber": "D1234567",
      "licenseState": "CA",
      "licenseStatus": "VALID",
      "yearsLicensed": 15,
      "email": "john.doe@example.com",
      "phone": "555-123-4567",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "US"
      }
    },
    "vehicles": [{
      "vin": "1HGCM82633A123456",
      "year": 2020,
      "make": "Honda",
      "model": "Accord",
      "trim": "EX",
      "primaryUse": "COMMUTE",
      "annualMileage": 12000,
      "garagingAddress": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "US"
      }
    }],
    "coverages": {
      "bodilyInjuryLimit": "100000/300000",
      "propertyDamageLimit": "50000",
      "medicalPaymentsLimit": "5000",
      "uninsuredMotoristLimit": "100000/300000",
      "comprehensiveDeductible": "500",
      "collisionDeductible": "500"
    }
  }')

echo "Quote Response:"
echo "$QUOTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(json.dumps(data, indent=2))"

QUOTE_NUMBER=$(echo "$QUOTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['quoteNumber'])")
TOTAL_PREMIUM=$(echo "$QUOTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['totalPremium'])")

echo ""
echo "✅ Quote Created!"
echo "Quote Number: $QUOTE_NUMBER"
echo "Total Premium: \$$TOTAL_PREMIUM"
echo ""

echo "Now binding quote to create policy..."
POLICY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/policies/bind \
  -H "Content-Type: application/json" \
  -d "{
    \"quoteNumber\": \"$QUOTE_NUMBER\",
    \"paymentMethod\": \"CREDIT_CARD\",
    \"paymentDetails\": {
      \"cardNumber\": \"4532015112830366\",
      \"cardholderName\": \"John Doe\",
      \"expiryMonth\": \"12\",
      \"expiryYear\": \"2026\",
      \"cvv\": \"123\",
      \"billingZip\": \"94102\"
    }
  }")

echo ""
echo "Policy Response:"
echo "$POLICY_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(json.dumps(data, indent=2))"

POLICY_NUMBER=$(echo "$POLICY_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['policyNumber'])")

echo ""
echo "🎉 Policy Created!"
echo "=================="
echo "POLICY NUMBER: $POLICY_NUMBER"
echo "Quote Number: $QUOTE_NUMBER"
echo "Total Premium: \$$TOTAL_PREMIUM"
echo ""
echo "Access the portal at:"
echo "http://localhost:5173/portal/$POLICY_NUMBER/overview"
