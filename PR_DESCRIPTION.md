# Deploy Full-Stack App to Vercel (Frontend + Backend)

## Summary

This PR adds Vercel serverless deployment support for the NestJS backend, enabling full-stack deployment to Vercel in a single deployment.

**Fixes**: 405 Method Not Allowed errors when accessing `/api/v1/*` endpoints

## Architecture

```
Vercel Deployment
├── Frontend (React + Vite) → Static files served from /dist
├── Backend (NestJS) → Serverless function at /api/v1/*
└── Database (Neon PostgreSQL) → External connection
```

Both frontend and backend run on the same domain, eliminating CORS issues.

## Changes

### 🆕 New Files

**Backend Serverless Adapter:**
- `api/index.ts` - Vercel serverless function adapter for NestJS
- `api/tsconfig.json` - TypeScript configuration for API directory

**Frontend Updates:**
- `src/vite-env.d.ts` - Environment variable type definitions

**Deployment Configuration:**
- `.vercelignore` - Excludes unnecessary files from deployment
- `vercel.json` - Updated with serverless function configuration

**Documentation:**
- `VERCEL_DEPLOYMENT.md` - Comprehensive deployment guide
- `DEPLOYMENT_QUICKSTART.md` - 5-minute quick start guide
- `TESTING_DEPLOYMENT.md` - Testing instructions and troubleshooting
- `test-deployment.sh` - Automated deployment testing script

### ✏️ Modified Files

**Package Configuration:**
- `package.json` - Added NestJS dependencies to root for serverless function

**API Services:**
- `src/services/quote-api.ts` - Updated API URL handling for production
- `src/services/portal-api.ts` - Updated API URL handling for production

## How It Works

### Before (Broken ❌)
```
Vercel: Frontend only
Backend: Missing
Result: 405 Method Not Allowed
```

### After (Working ✅)
```
Vercel: Frontend + Backend
Frontend: https://auto-prototype-master.vercel.app
Backend API: https://auto-prototype-master.vercel.app/api/v1/*
Result: Full-stack app works
```

## Testing

After merging, Vercel will automatically deploy. Test with:

```bash
# Automated test
./test-deployment.sh https://auto-prototype-master.vercel.app

# Manual test
1. Visit https://auto-prototype-master.vercel.app
2. Click "Get Started"
3. Fill out quote form
4. Should see quote number (no 405 errors)
```

## Environment Variables Required

Ensure these are set in Vercel:

**Build:**
- `GITHUB_TOKEN` - For Canary Design System package access

**Runtime:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV=production`

## Breaking Changes

None - this is purely a deployment configuration change.

## Migration Notes

- Frontend code unchanged (except API URL handling)
- Backend code unchanged (runs in serverless mode)
- Database migrations already completed in Phase 5
- No data migration required

## Deployment Process

Once merged:

1. **Install** (~2 min)
   - Frontend dependencies: `npm install`
   - Backend dependencies: `cd backend && npm install`

2. **Build** (~2 min)
   - Frontend: `npm run build` (Vite)
   - Backend: `cd backend && npm run build` (NestJS)

3. **Deploy** (~1 min)
   - Serverless function: `/api/index.ts` → Handles `/api/v1/*`
   - Static files: `/dist` → Serves React app

Total deployment time: **~5 minutes**

## Verification Checklist

After deployment:

- [ ] Frontend loads at https://auto-prototype-master.vercel.app
- [ ] API responds at https://auto-prototype-master.vercel.app/api/v1/quotes
- [ ] Quote flow works end-to-end
- [ ] No 405 errors in browser console
- [ ] No CORS errors
- [ ] Portal pages load correctly

## Performance Notes

- **Cold start**: First request may take 5-15 seconds (function waking up)
- **Warm requests**: 1-3 seconds (function stays warm for ~5 minutes)
- **Free tier**: Sufficient for demo and development

## Documentation

Full deployment guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
Quick start: [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
Testing guide: [TESTING_DEPLOYMENT.md](./TESTING_DEPLOYMENT.md)

## Related Issues

Resolves the 405 error reported when accessing the Vercel deployment.

## Phase Tracking

**Phase 5 Complete**: Self-Service Portal (User Story 3)
**Current**: Deployment optimization and production readiness
**Next**: Optional enhancements and comprehensive testing (Phase 6-7)

---

## Merge Instructions

1. **Review changes** in Files Changed tab
2. **Merge** this PR to master
3. **Wait** ~5 minutes for Vercel deployment
4. **Test** using the automated script or manual flow
5. **Verify** no 405 errors

Questions? See the comprehensive guide in `VERCEL_DEPLOYMENT.md`
