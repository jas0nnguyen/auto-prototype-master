# Vercel Deployment Quickstart

## TL;DR - Fix Your Deployment in 3 Steps

### Step 1: Create GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `read:packages`
4. Copy the token

### Step 2: Add to Vercel
1. Go to your Vercel project → Settings → Environment Variables
2. Add **GITHUB_TOKEN** = (paste your token)
3. Select all environments: Production, Preview, Development
4. Click Save

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for build to complete

## That's It!

Your app should now deploy successfully.

---

## Optional: Add Database Connection

If you want to use the Neon database:

Add these environment variables in Vercel:

```
DATABASE_URL=postgresql://neondb_owner:npg_V09nkwtJrgYq@ep-patient-surf-afanvlzq-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

VITE_ENABLE_MOCK_SERVICES=true
VITE_MOCK_SCENARIO=realistic
```

---

## Demo App Access

After deployment, access your app via URL:

- Quote flow: `https://your-app.vercel.app/quote`
- View policy: `https://your-app.vercel.app/policy/POL-2025-123456`
- Self-service portal: `https://your-app.vercel.app/portal?policyId={id}`

**No login required** - this is a demo app with URL-based access!

---

**Need more details?** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for the full guide.
