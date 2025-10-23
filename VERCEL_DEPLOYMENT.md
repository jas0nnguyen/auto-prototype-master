# Vercel Deployment Guide - Full Stack (Frontend + Backend)

This project is now configured to deploy **both frontend and backend** to Vercel as a single application.

## Architecture

```
Vercel Deployment
├── Frontend (React + Vite) → Served as static files
├── Backend (NestJS) → Runs as Vercel Serverless Function
└── Database (Neon PostgreSQL) → External serverless database
```

**How it works**:
- Frontend: Built with Vite → Static files served from `/dist`
- Backend: Converted to serverless function → Runs at `/api/*`
- All on same domain → No CORS issues
- Database: External Neon PostgreSQL connection

## Prerequisites

1. **GitHub Account** - Connected to Vercel
2. **Vercel Account** - Free tier works fine
3. **Neon Database** - Already set up ✅
4. **GitHub Token** - For Canary Design System (already have ✅)

## Environment Variables Required

Add these in Vercel Project Settings → Environment Variables:

### Required for Build
```bash
GITHUB_TOKEN=your_github_token_here
```

### Required for Runtime (Backend)
```bash
# Database
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require

# Application
NODE_ENV=production
```

### Optional
```bash
# Logging
LOG_LEVEL=info

# Mock Service Delays (milliseconds)
MOCK_VIN_DECODER_DELAY_MS=500
MOCK_VEHICLE_VALUATION_DELAY_MS=1000
MOCK_PAYMENT_GATEWAY_DELAY_MS=1500
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel serverless backend support"
   git push origin 001-auto-insurance-flow
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build && cd backend && npm run build`
   - **Install Command**: `node scripts/setup-npmrc.js && npm install && cd backend && npm install`
   - **Output Directory**: dist

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add `GITHUB_TOKEN` (for all environments)
   - Add `DATABASE_URL` (for production)
   - Add `NODE_ENV=production` (for production)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Visit your app URL (e.g., `https://your-app.vercel.app`)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set Environment Variables** (first time only):
   ```bash
   vercel env add GITHUB_TOKEN
   vercel env add DATABASE_URL
   vercel env add NODE_ENV
   ```

4. **Deploy**:
   ```bash
   # Deploy to preview (for testing)
   vercel

   # Deploy to production
   vercel --prod
   ```

## What Gets Deployed

### Frontend
- **Location**: `/dist` directory
- **Routes**: All non-API routes (/, /quote/*, /portal/*, etc.)
- **Build**: Vite production build
- **Serving**: Static files via Vercel CDN

### Backend
- **Location**: `/api` directory
- **Routes**: All `/api/v1/*` routes
- **Runtime**: Node.js 22.x serverless function
- **Memory**: 1024 MB
- **Timeout**: 10 seconds (default)

### Configuration Files

- `vercel.json` - Routing, rewrites, function config
- `api/index.ts` - Serverless function entry point
- `api/tsconfig.json` - TypeScript config for API

## Verification Steps

After deployment, test these endpoints:

### 1. Frontend
```bash
# Visit your Vercel URL
https://your-app.vercel.app

# Should see the homepage
```

### 2. Backend API Health Check
```bash
# Test a simple API endpoint
curl https://your-app.vercel.app/api/v1/quotes
```

### 3. Full Quote Flow
1. Go to homepage → Click "Get Started"
2. Fill out vehicle info → Click "Continue"
3. Fill out driver info → Click "Continue"
4. Select coverage → Click "Get Quote"
5. Should see quote results with premium

### 4. Portal Access
```bash
# Use a policy number from your database
https://your-app.vercel.app/portal/DZQV87Z4FH/overview
```

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '@nestjs/core'`
- **Solution**: Make sure root `package.json` has all NestJS dependencies
- Run: `npm install` locally to verify

**Error**: `GITHUB_TOKEN not set`
- **Solution**: Add `GITHUB_TOKEN` environment variable in Vercel

### API Returns 500 Errors

**Error**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is set correctly in Vercel env vars
- Check Neon database is accessible

**Error**: `Cannot read property 'apply' of undefined`
- **Solution**: Check that `reflect-metadata` is imported in `api/index.ts`
- Verify all NestJS modules are in `dependencies` (not `devDependencies`)

### Frontend Can't Reach Backend

**Error**: 404 on `/api/v1/quotes`
- **Solution**: Check `vercel.json` rewrites are correct
- Verify API function deployed (check Vercel Functions tab)

**Error**: CORS errors
- **Solution**: Shouldn't happen since same domain, but if it does:
  - Check `backend/src/api/middleware/cors.ts`
  - Ensure origin check allows same-domain requests

### Slow Response Times

**Issue**: First request takes 10+ seconds
- **Cause**: Cold start - serverless function waking up
- **Solution**: Normal behavior for free tier. Function stays "warm" for ~5 minutes after use.

**Issue**: All requests slow (>5 seconds)
- **Cause**: Database connection issues or inefficient queries
- **Solution**:
  - Check Neon database region (should be near Vercel region)
  - Enable connection pooling in `DATABASE_URL`

## Performance Tips

### 1. Keep Functions Warm
Serverless functions "sleep" after 5 minutes of inactivity. First request after sleep takes longer.

**Options**:
- Upgrade to Pro plan (longer warm time)
- Use a monitoring service to ping your app
- Accept cold starts for demo purposes

### 2. Optimize Database Queries
- Use Neon's pooled connection string
- Add indexes for common queries
- Cache expensive calculations

### 3. Reduce Function Size
Currently bundling entire NestJS app. Future optimizations:
- Split into multiple functions per route
- Use tree-shaking to reduce bundle size
- Lazy-load modules

## Cost Estimate (Free Tier Limits)

| Resource | Free Tier | This App Usage | Safe? |
|----------|-----------|----------------|-------|
| Bandwidth | 100 GB/month | ~1 GB/month (demo) | ✅ Yes |
| Build Time | 6000 minutes/month | ~3 min/build | ✅ Yes |
| Function Invocations | 100 GB-hours/month | ~1 GB-hour/day | ✅ Yes |
| Function Duration | 10s max | 1-3s typical | ✅ Yes |

**Conclusion**: Free tier is perfect for demos and development.

## Monitoring

### Vercel Dashboard
- **Deployments**: See all deployments and logs
- **Functions**: View invocation count, duration, errors
- **Analytics**: Traffic, performance, top pages

### Logs
```bash
# Real-time logs (requires Vercel CLI)
vercel logs your-app-url --follow

# Function logs only
vercel logs your-app-url --function api/index
```

## Updating the Deployment

### Push Updates
```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin 001-auto-insurance-flow

# Vercel auto-deploys on push (if connected to GitHub)
```

### Manual Deploy
```bash
vercel --prod
```

### Rollback
If something breaks:
1. Go to Vercel Dashboard → Deployments
2. Find a working deployment
3. Click "..." → "Promote to Production"

## Database Migrations

**IMPORTANT**: Run migrations manually, NOT in Vercel build process.

```bash
# From your local machine
cd backend
npm run db:push

# Or use Drizzle Kit
npx drizzle-kit push:pg
```

Why not in build?
- Migrations need unpooled connection
- Build environment may not have correct permissions
- Risk of concurrent migrations during auto-deploys

## Production Checklist

Before sharing your Vercel URL:

- [ ] All environment variables set in Vercel
- [ ] Database migrations ran successfully
- [ ] Frontend loads without errors
- [ ] API endpoints return data (not errors)
- [ ] Quote flow works end-to-end
- [ ] Portal access works with policy number
- [ ] Swagger docs accessible (optional: /api/docs)
- [ ] Error messages are user-friendly (no stack traces)

## Next Steps

1. **Custom Domain** (optional):
   - Go to Vercel Project Settings → Domains
   - Add your domain (e.g., `insurance-demo.yourdomain.com`)

2. **Monitoring** (optional):
   - Integrate Sentry for error tracking
   - Add analytics (Vercel Analytics, Google Analytics)

3. **Performance**:
   - Run Lighthouse audit
   - Optimize images
   - Add caching headers

4. **Security**:
   - Review CORS settings
   - Add rate limiting
   - Enable security headers (already configured ✅)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **This Project**: See `CLAUDE.md` for architecture details
