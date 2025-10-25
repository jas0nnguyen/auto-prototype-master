# Deployment Troubleshooting - 500 Error

## Current Status
✅ **Deployment Successful** - Frontend and backend deployed to Vercel
❌ **Runtime Error** - Backend returns 500 when creating quotes

## The Error
```
POST /api/v1/quotes → 500 Internal Server Error
Error: An internal server error occurred
```

## Most Likely Causes

### 1. Missing Environment Variables (MOST LIKELY)

**Problem**: `DATABASE_URL` not set in Vercel

**Check**:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Look for `DATABASE_URL`

**Fix**:
```bash
# In Vercel Dashboard, add:
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require

# Also add:
NODE_ENV=production
```

### 2. Module Resolution Issues

**Problem**: Serverless function can't find backend modules

**Check Vercel Function Logs**:
```bash
vercel logs https://auto-prototype-master.vercel.app --since 10m
```

Look for errors like:
- `Cannot find module '../backend/src/app.module'`
- `Module not found: Error: Can't resolve`

**Fix**: Update `api/index.ts` imports to use correct paths

### 3. Database Connection Failed

**Problem**: Can't connect to Neon database

**Symptoms**:
- Logs show: "Connection refused" or "Connection timeout"
- Logs show: "Database connection failed"

**Fix**:
1. Verify DATABASE_URL format is correct
2. Use the **pooled** connection string from Neon
3. Check Neon database is running

### 4. Cold Start Timeout

**Problem**: Function takes too long to initialize

**Symptoms**:
- First request always fails
- Subsequent requests work
- Logs show timeout

**Fix**:
- Increase function timeout in `vercel.json`
- Optimize NestJS bootstrap code

## How to Debug

### Step 1: Check Environment Variables

In Vercel Dashboard:
- Project → Settings → Environment Variables
- Ensure these are set:
  - `GITHUB_TOKEN` (for build)
  - `DATABASE_URL` (for runtime)
  - `NODE_ENV=production`

### Step 2: View Function Logs

```bash
# Real-time logs
vercel logs https://auto-prototype-master.vercel.app --follow

# Last 10 minutes
vercel logs https://auto-prototype-master.vercel.app --since 10m

# Filter for errors
vercel logs https://auto-prototype-master.vercel.app --since 10m | grep -i error
```

### Step 3: Test with Simplified Payload

```bash
# Minimal test
curl -X POST https://auto-prototype-master.vercel.app/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{"drivers":[{"first_name":"Test","last_name":"User","birth_date":"1990-01-01","email":"test@example.com","phone":"555-0123","is_primary":true}],"vehicles":[{"year":2020,"make":"Toyota","model":"Camry"}],"address_line_1":"123 Main St","address_city":"San Francisco","address_state":"CA","address_zip":"94102"}'
```

### Step 4: Check Function in Vercel Dashboard

1. Go to Vercel Dashboard
2. Click on deployment
3. Click "Functions" tab
4. Look for `/api/index`
5. Check:
   - Invocations (should be > 0)
   - Errors (should show error details)
   - Duration (should be < 10s)

## Common Fixes

### Fix 1: Add DATABASE_URL

**In Vercel Dashboard**:
1. Project Settings → Environment Variables
2. Click "Add New"
3. Key: `DATABASE_URL`
4. Value: Your Neon connection string
5. Environments: Production, Preview, Development
6. Save
7. Redeploy: Deployments → Latest → "..." → Redeploy

### Fix 2: Update Module Paths

If logs show "Cannot find module", update `api/index.ts`:

```typescript
// Instead of:
import { AppModule } from '../backend/src/app.module';

// Try:
import { AppModule } from '../backend/dist/backend/src/app.module';
```

### Fix 3: Add Missing Dependencies

If logs show missing packages, add to root `package.json`:

```json
{
  "dependencies": {
    // Ensure all NestJS packages are here
    "@nestjs/core": "^10.3.0",
    "@nestjs/common": "^10.3.0",
    // ... etc
  }
}
```

### Fix 4: Simplify API Handler

If all else fails, add error logging to `api/index.ts`:

```typescript
export default async function handler(req: Request, res: Response) {
  try {
    console.log('🔧 Function invoked:', req.method, req.url);

    const app = await bootstrap();
    console.log('✅ App bootstrapped');

    app(req, res);
  } catch (error) {
    console.error('❌ Function error:', error);
    console.error('Stack:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
```

## Next Steps

1. **Check Vercel Dashboard** → Environment Variables
2. **View Function Logs** to see actual error
3. **Add DATABASE_URL** if missing
4. **Redeploy** after adding env vars
5. **Test again**

## Get Help

If still stuck:
1. Share the function logs (from `vercel logs`)
2. Share environment variables (names only, not values)
3. Check Vercel deployment status page

---

**Most common issue**: Missing `DATABASE_URL` environment variable.

**Quick test**: Add DATABASE_URL in Vercel settings, then redeploy.
