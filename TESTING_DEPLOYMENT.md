# Testing Your Vercel Deployment

This guide shows you how to test your deployed full-stack app to make sure everything works.

## Step 1: Get Your Vercel URL

### From Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your project: `auto-prototype-master`
3. You'll see your deployment URL (e.g., `https://auto-prototype-master.vercel.app`)
4. Click "Visit" or copy the URL

### From Git Push Output
After `git push`, Vercel comments on your commit with the preview URL.

## Step 2: Test the Frontend (1 minute)

### A. Homepage Loads
```
Visit: https://your-app.vercel.app
Expected: See homepage with "Get Started" button
```

**✅ Success**: Homepage loads
**❌ Fail**: Shows Vercel error page → Check build logs

### B. Navigation Works
```
Click: "Get Started" button
Expected: Navigate to /quote/vehicle-info
```

**✅ Success**: Form page loads
**❌ Fail**: 404 error → Check vercel.json rewrites

## Step 3: Test the Backend API (2 minutes)

### A. Test API Endpoint Directly

Open your browser DevTools (F12) → Console tab, then run:

```javascript
// Test quote creation API
fetch('https://your-app.vercel.app/api/v1/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    drivers: [{
      first_name: "Test",
      last_name: "User",
      birth_date: "1990-01-01",
      email: "test@example.com",
      phone: "555-0123",
      is_primary: true
    }],
    vehicles: [{
      year: 2020,
      make: "Toyota",
      model: "Camry"
    }],
    address_line_1: "123 Main St",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94102"
  })
})
.then(r => r.json())
.then(data => console.log('✅ API Response:', data))
.catch(err => console.error('❌ API Error:', err));
```

**Expected Response**:
```json
{
  "quoteId": "DZXXXXXXXX",
  "quoteNumber": "DZXXXXXXXX",
  "premium": 1000,
  "createdAt": "2025-10-23T...",
  "expiresAt": "2025-11-22T..."
}
```

**✅ Success**: JSON response with quote data
**❌ Fail - 405**: API function didn't deploy → Check Functions tab in Vercel
**❌ Fail - 500**: Database error → Check DATABASE_URL env var
**❌ Fail - Network error**: CORS issue or function timeout

### B. Test via Command Line (Alternative)

```bash
curl -X POST https://your-app.vercel.app/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "drivers": [{"first_name":"Test","last_name":"User","birth_date":"1990-01-01","email":"test@example.com","phone":"555-0123","is_primary":true}],
    "vehicles": [{"year":2020,"make":"Toyota","model":"Camry"}],
    "address_line_1":"123 Main St",
    "address_city":"San Francisco",
    "address_state":"CA",
    "address_zip":"94102"
  }'
```

## Step 4: Test Complete Quote Flow (3 minutes)

### Full User Journey

1. **Go to homepage**
   ```
   https://your-app.vercel.app
   ```

2. **Click "Get Started"**
   - Should navigate to vehicle info page
   - Form should be empty and ready

3. **Fill out Vehicle Info**
   - Year: 2020
   - Make: Toyota
   - Model: Camry
   - VIN: (optional)
   - Annual Mileage: 12000
   - Click "Continue"

4. **Fill out Driver Info**
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: 555-0123
   - Birth Date: 01/15/1990
   - Address: 123 Main St, San Francisco, CA 94102
   - Click "Continue"

5. **Select Coverage**
   - Choose coverage options
   - Click "Get Quote"

6. **Check Quote Results** ✅
   - Should see quote number (e.g., "DZ7OYBGS4D")
   - Should see premium amount
   - Should NOT see 405 error
   - Should NOT see "Failed to create quote" error

**✅ Success**: Quote created and displayed
**❌ Fail**: Error message → Check browser console and Vercel function logs

## Step 5: Test Portal Access (1 minute)

### Get a Policy Number

First, you need a policy number from your database. You can:

**Option A**: Use the quote number from Step 4 (if it's been bound to a policy)

**Option B**: Create a test policy in your database

**Option C**: Use this test URL with a known policy number:
```
https://your-app.vercel.app/portal/DZQV87Z4FH/overview
```

### Test Portal Pages

```
1. Dashboard:    /portal/DZQV87Z4FH/overview
2. Policy:       /portal/DZQV87Z4FH/policy
3. Billing:      /portal/DZQV87Z4FH/billing
4. Claims:       /portal/DZQV87Z4FH/claims
```

**✅ Success**: Portal pages load with data
**❌ Fail - 404**: Portal routes not configured
**❌ Fail - API error**: Backend can't fetch portal data

## Step 6: Check Browser DevTools (2 minutes)

### Open DevTools (F12) → Network Tab

**While testing the quote flow, watch for**:

1. **POST /api/v1/quotes**
   - Status: 200 OK ✅
   - Response: JSON with quote data
   - Time: < 5 seconds (first request may be slower)

2. **No CORS errors** ✅
   - Should see green checkmarks
   - No red errors about "Access-Control-Allow-Origin"

3. **No 405 errors** ✅
   - All API calls return 200
   - No "Method Not Allowed"

### Console Tab

**Should NOT see**:
- ❌ "Failed to create quote"
- ❌ "SyntaxError: Unexpected end of JSON input"
- ❌ "405 Method Not Allowed"
- ❌ CORS policy errors

**Should see**:
- ✅ "[QuoteAPI] Creating quote..."
- ✅ Quote response data logged

## Step 7: Check Vercel Dashboard (1 minute)

### Deployment Status

1. Go to Vercel Dashboard → Your Project
2. Check deployment status:
   - **Ready** ✅ (green checkmark)
   - **Building** 🟡 (wait a bit)
   - **Error** ❌ (check logs)

### Function Logs

1. Click on your deployment
2. Click "Functions" tab
3. Look for `/api/index.ts` or `/api/index.js`
4. Should show:
   - Invocations: > 0
   - Duration: 1-3 seconds typical
   - Status: 200 (success)

### View Real-Time Logs

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Login
vercel login

# Watch logs in real-time
vercel logs your-app-url --follow

# Or just function logs
vercel logs your-app-url --function api/index
```

## Step 8: Performance Check (Optional)

### Test Cold Start Time

1. **Wait 10 minutes** (function goes to sleep)
2. **Make a request** to `/api/v1/quotes`
3. **Measure response time**
   - First request (cold start): 5-15 seconds
   - Subsequent requests (warm): 1-3 seconds

This is normal for serverless functions on free tier.

### Test Multiple Requests

Run this in browser console:
```javascript
// Test 5 requests in a row
for (let i = 0; i < 5; i++) {
  fetch('https://your-app.vercel.app/api/v1/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      drivers: [{first_name:"Test",last_name:"User",birth_date:"1990-01-01",email:"test@example.com",phone:"555-0123",is_primary:true}],
      vehicles: [{year:2020,make:"Toyota",model:"Camry"}],
      address_line_1:"123 Main St",
      address_city:"San Francisco",
      address_state:"CA",
      address_zip:"94102"
    })
  })
  .then(r => r.json())
  .then(data => console.log(`Request ${i+1}:`, data.quoteNumber));
}
```

**✅ Success**: All 5 requests return different quote numbers
**❌ Fail**: Errors or timeouts → Function may be overloaded

## Troubleshooting Guide

### Error: 405 Method Not Allowed

**Cause**: Backend API function didn't deploy
**Fix**:
1. Check Vercel Dashboard → Functions tab
2. Look for `api/index` function
3. If missing, check build logs for errors
4. Verify `vercel.json` rewrites are correct

### Error: 500 Internal Server Error

**Cause**: Backend function crashed
**Fix**:
1. Check Vercel function logs: `vercel logs --function api/index`
2. Look for error messages
3. Common issues:
   - DATABASE_URL not set → Add in env vars
   - Database connection failed → Check Neon is running
   - Missing dependency → Check package.json

### Error: Network Error / Timeout

**Cause**: Function took too long (>10 seconds)
**Fix**:
1. Optimize database queries
2. Check database connection pooling
3. May need to upgrade Vercel plan for longer timeout

### Error: CORS Policy

**Cause**: Frontend and backend on different domains
**Fix**: They should be on same domain! Check:
1. Frontend URL: `https://your-app.vercel.app`
2. API URL: `https://your-app.vercel.app/api/v1/*`
3. If different, there's a configuration issue

### Frontend Loads, But API Fails

**Checklist**:
- [ ] `GITHUB_TOKEN` env var set in Vercel
- [ ] `DATABASE_URL` env var set in Vercel
- [ ] Database migrations ran (see VERCEL_DEPLOYMENT.md)
- [ ] Backend build succeeded (check build logs)
- [ ] API function deployed (check Functions tab)

## Success Checklist

Before considering deployment successful, verify:

- [ ] Homepage loads without errors
- [ ] Navigation works (all routes)
- [ ] API endpoint responds (POST /api/v1/quotes)
- [ ] Quote flow completes end-to-end
- [ ] Quote number is generated
- [ ] Premium amount is displayed
- [ ] No 405 errors in console
- [ ] No CORS errors in console
- [ ] Portal pages load (with valid policy number)
- [ ] Function logs show successful invocations
- [ ] Response times are acceptable (< 5 seconds)

## Next Steps After Successful Testing

1. **Share your URL** with others for feedback
2. **Monitor usage** in Vercel Analytics
3. **Set up alerts** for errors (optional)
4. **Add custom domain** (optional)
5. **Run Lighthouse audit** for performance (optional)

## Getting Help

If tests fail:

1. **Check build logs** in Vercel
2. **Check function logs**: `vercel logs --function api/index`
3. **Check browser console** for errors
4. **Review deployment docs**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
5. **Check environment variables** in Vercel settings

---

## Quick Test Commands

Copy and paste these into browser console for quick testing:

```javascript
// 1. Test API health
fetch('https://YOUR-APP.vercel.app/api/v1/quotes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    drivers:[{first_name:"Test",last_name:"User",birth_date:"1990-01-01",email:"test@example.com",phone:"555-0123",is_primary:true}],
    vehicles:[{year:2020,make:"Toyota",model:"Camry"}],
    address_line_1:"123 Main St",address_city:"San Francisco",address_state:"CA",address_zip:"94102"
  })
}).then(r=>r.json()).then(d=>console.log('✅ API works!',d)).catch(e=>console.error('❌ API failed:',e));

// 2. Test multiple quotes
for(let i=0;i<3;i++){
  fetch('https://YOUR-APP.vercel.app/api/v1/quotes',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      drivers:[{first_name:"Test",last_name:"User",birth_date:"1990-01-01",email:"test@example.com",phone:"555-0123",is_primary:true}],
      vehicles:[{year:2020,make:"Toyota",model:"Camry"}],
      address_line_1:"123 Main St",address_city:"San Francisco",address_state:"CA",address_zip:"94102"
    })
  }).then(r=>r.json()).then(d=>console.log(`Quote ${i+1}:`,d.quoteNumber));
}
```

Replace `YOUR-APP` with your actual Vercel subdomain.

---

**Happy Testing!** 🚀

If everything passes, your full-stack app is successfully deployed to Vercel!
