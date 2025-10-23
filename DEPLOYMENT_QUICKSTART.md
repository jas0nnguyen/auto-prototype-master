# Quick Deploy to Vercel - 5 Minutes

This is the **fastest way** to deploy your full-stack auto insurance app to Vercel.

## Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ GitHub token (you already have)
- ✅ Neon database URL (you already have)

## Step-by-Step

### 1. Push to GitHub (30 seconds)
```bash
git add .
git commit -m "Add Vercel serverless backend"
git push origin 001-auto-insurance-flow
```

### 2. Deploy to Vercel (1 minute)

Visit: https://vercel.com/new

1. Click **"Import Project"**
2. Select your GitHub repo: `auto-prototype-master`
3. Click **"Import"**

### 3. Configure (2 minutes)

**Framework Preset**: Vite (auto-detected)

**Environment Variables** - Add these:
```
GITHUB_TOKEN = your_github_token_here
DATABASE_URL = postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
NODE_ENV = production
```

Click **"Deploy"**

### 4. Wait (2-3 minutes)
Vercel will:
- ✅ Install dependencies (frontend + backend)
- ✅ Build frontend (Vite)
- ✅ Build backend (NestJS)
- ✅ Deploy serverless function
- ✅ Deploy static files

### 5. Test (1 minute)

Visit your Vercel URL: `https://your-app-name.vercel.app`

1. Click "Get Started"
2. Fill out quote form
3. Should work without 405 errors! ✅

## What Changed

Your app now deploys **both frontend and backend** to Vercel:

### Before (Caused 405 Error)
```
Vercel: Frontend only ❌
Backend: Missing
Result: 405 Method Not Allowed
```

### After (Works!)
```
Vercel: Frontend + Backend ✅
Frontend: https://your-app.vercel.app
Backend API: https://your-app.vercel.app/api/v1/*
Result: Full-stack app works!
```

## Files Added/Modified

### New Files
- **`api/index.ts`** - Serverless function adapter for NestJS
- **`api/tsconfig.json`** - TypeScript config for API
- **`VERCEL_DEPLOYMENT.md`** - Detailed deployment guide

### Modified Files
- **`vercel.json`** - Added backend function config
- **`package.json`** - Added NestJS dependencies
- **`src/services/quote-api.ts`** - Updated API URL handling
- **`src/services/portal-api.ts`** - Updated API URL handling
- **`src/vite-env.d.ts`** - TypeScript env var definitions

## How It Works

```
User Request → Vercel Router
                 │
                 ├─→ /api/v1/* → Serverless Function (NestJS)
                 │                     ↓
                 │               Neon Database
                 │
                 └─→ /* → Static Files (React)
```

## Troubleshooting

### Build Fails
- **Check**: Environment variables set correctly
- **Fix**: Add `GITHUB_TOKEN` and `DATABASE_URL` in Vercel

### Still Get 405 Errors
- **Check**: Vercel logs (Functions tab)
- **Fix**: Redeploy with correct environment variables

### Database Connection Fails
- **Check**: `DATABASE_URL` format
- **Fix**: Should be the **pooled** connection string from Neon

## Next Steps

1. ✅ Test quote generation flow
2. ✅ Test portal access
3. ✅ Share your Vercel URL
4. (Optional) Add custom domain

## Full Documentation

For detailed info, see:
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Project architecture

## Support

Having issues? Check:
- Vercel deployment logs
- Backend logs: `vercel logs your-app-url --function api/index`
- Frontend console errors

---

**You're ready to deploy!** 🚀

The entire setup is done - just push to GitHub and import to Vercel.
