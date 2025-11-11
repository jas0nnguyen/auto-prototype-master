#!/bin/bash

echo "Testing additional driver license fields..."
echo ""

# Add additional driver with license fields
echo "1. Adding additional driver with license fields..."
curl -s -X PUT http://localhost:3000/api/v1/quotes/DZQV87Z4FH/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "additionalDrivers": [
      {
        "first_name": "Jane",
        "last_name": "Smith",
        "birth_date": "1992-05-15",
        "email": "jane.smith@example.com",
        "phone": "555-987-6543",
        "gender": "F",
        "marital_status": "SINGLE",
        "relationship": "SPOUSE",
        "license_number": "DL987654",
        "license_state": "NY"
      }
    ]
  }' | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'quoteNumber' in data:
    print('✅ Driver added successfully')
    print('Quote Number:', data['quoteNumber'])
else:
    print('❌ Error:', json.dumps(data, indent=2))
"

echo ""
echo "2. Fetching quote to verify license fields saved..."
curl -s http://localhost:3000/api/v1/quotes/reference/DZQV87Z4FH | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'additionalDrivers' in data and len(data['additionalDrivers']) > 0:
    driver = data['additionalDrivers'][0]
    print('✅ Additional driver found:')
    print('  Name:', driver.get('firstName'), driver.get('lastName'))
    print('  License Number:', driver.get('licenseNumber', 'NOT FOUND'))
    print('  License State:', driver.get('licenseState', 'NOT FOUND'))

    if driver.get('licenseNumber') == 'DL987654' and driver.get('licenseState') == 'NY':
        print('')
        print('✅ LICENSE FIELDS SAVED AND PERSISTED SUCCESSFULLY!')
    else:
        print('')
        print('❌ LICENSE FIELDS NOT SAVED CORRECTLY')
else:
    print('❌ No additional drivers found')
"
