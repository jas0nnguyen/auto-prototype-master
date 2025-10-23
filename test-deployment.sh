#!/bin/bash

# Quick Deployment Test Script
# Usage: ./test-deployment.sh https://your-app.vercel.app

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Vercel URL"
  echo "Usage: ./test-deployment.sh https://your-app.vercel.app"
  exit 1
fi

VERCEL_URL="$1"

echo "🧪 Testing Vercel Deployment: $VERCEL_URL"
echo "================================================"
echo ""

# Test 1: Frontend Homepage
echo "📱 Test 1: Frontend Homepage"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Homepage loads (HTTP $HTTP_CODE)"
else
  echo "❌ Homepage failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Backend API - Create Quote
echo "🔧 Test 2: Backend API - Create Quote"
API_RESPONSE=$(curl -s -X POST "$VERCEL_URL/api/v1/quotes" \
  -H "Content-Type: application/json" \
  -d '{
    "drivers": [{
      "first_name": "Test",
      "last_name": "User",
      "birth_date": "1990-01-01",
      "email": "test@example.com",
      "phone": "555-0123",
      "is_primary": true
    }],
    "vehicles": [{
      "year": 2020,
      "make": "Toyota",
      "model": "Camry"
    }],
    "address_line_1": "123 Main St",
    "address_city": "San Francisco",
    "address_state": "CA",
    "address_zip": "94102"
  }' -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$API_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  QUOTE_NUMBER=$(echo "$RESPONSE_BODY" | grep -o '"quoteNumber":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$QUOTE_NUMBER" ]; then
    echo "✅ API works! Quote created: $QUOTE_NUMBER"
  else
    echo "⚠️  API returned 200 but no quote number found"
    echo "Response: $RESPONSE_BODY"
  fi
elif [ "$HTTP_CODE" = "405" ]; then
  echo "❌ 405 Method Not Allowed - Backend function not deployed"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ 500 Internal Server Error - Backend crashed"
  echo "Check Vercel function logs for details"
else
  echo "❌ API failed (HTTP $HTTP_CODE)"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Summary
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo "Frontend: $([ "$HTTP_CODE" = "200" ] && echo "✅ Working" || echo "❌ Failed")"
echo "Backend:  $([ -n "$QUOTE_NUMBER" ] && echo "✅ Working" || echo "❌ Failed")"
echo ""
echo "🔗 Visit your app: $VERCEL_URL"
echo "📚 View test guide: TESTING_DEPLOYMENT.md"
echo ""

if [ -n "$QUOTE_NUMBER" ]; then
  echo "🎉 Deployment is working! You can now:"
  echo "  1. Visit: $VERCEL_URL"
  echo "  2. Click 'Get Started' and create a quote"
  echo "  3. Test portal: $VERCEL_URL/portal/$QUOTE_NUMBER/overview"
else
  echo "⚠️  Issues detected. Next steps:"
  echo "  1. Check Vercel Dashboard for deployment status"
  echo "  2. View function logs: vercel logs --function api/index"
  echo "  3. Verify environment variables (GITHUB_TOKEN, DATABASE_URL)"
fi
