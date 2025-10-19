# Vercel Deployment Guide

## Quick Summary

Your deployment is failing because `GITHUB_TOKEN` is missing. This token is required to access the Canary Design System package from GitHub Package Registry.

**Note:** This is a demo application with URL-based access (no authentication required).

## Step-by-Step Deployment Instructions

### 1. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: "Vercel Deployment - Canary Design System"
   - **Expiration**: 90 days (or your preference)
   - **Scopes**: Check **`read:packages`** only
4. Click **"Generate token"**
5. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### 2. Add Environment Variables to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (click "Add" for each):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GITHUB_TOKEN` | Your GitHub PAT from step 1 | Production, Preview, Development |
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `VITE_ENABLE_MOCK_SERVICES` | `true` | Production, Preview, Development |
| `VITE_MOCK_SCENARIO` | `realistic` | Production, Preview, Development |

**Optional (if deploying backend):**
| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_BASE_URL` | Your backend API URL | Production, Preview, Development |

5. Click **"Save"** after each variable

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add required environment variables
vercel env add GITHUB_TOKEN
# Paste your token when prompted

vercel env add DATABASE_URL
# Paste your Neon connection string

vercel env add VITE_ENABLE_MOCK_SERVICES
# Enter: true

vercel env add VITE_MOCK_SCENARIO
# Enter: realistic
```

### 3. Redeploy

After adding all environment variables:

1. Go to your Vercel project dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger automatic deployment

### 4. Verify Deployment

Once deployed:

1. Check the deployment logs for any errors
2. Visit your deployed URL
3. Test the application with URL-based access:
   - Example: `https://your-app.vercel.app/policy/POL-2025-123456`
   - Example: `https://your-app.vercel.app/portal?policyId=POL-2025-123456`

## Required Environment Variables Summary

### Critical (Deployment will fail without these):
- `GITHUB_TOKEN` - GitHub Personal Access Token with `read:packages` scope

### Recommended for Demo Mode:
- `DATABASE_URL` - Neon PostgreSQL connection string (for storing demo data)
- `VITE_ENABLE_MOCK_SERVICES` - Set to `true` for demo mode
- `VITE_MOCK_SCENARIO` - Set to `realistic` for realistic demo behavior

### Optional:
- `VITE_API_BASE_URL` - Backend API endpoint (only if backend is deployed)
- All other database parameters (POSTGRES_*, PGHOST, etc.) - Only needed if backend is deployed
- `VITE_API_TIMEOUT` - Defaults to 10000ms

## Troubleshooting

### Still getting GITHUB_TOKEN error?
- Verify the token has `read:packages` scope
- Make sure you saved it to all environments (Production, Preview, Development)
- Check token hasn't expired
- Try regenerating the token and updating Vercel

### Build fails with package errors?
- Clear Vercel build cache: Settings → General → Clear Build Cache
- Redeploy after clearing cache

### Database connection errors?
- Neon connection strings must include `?sslmode=require`
- Use the `-pooler` endpoint for better performance
- Check Neon project is not suspended (free tier limitation)

## Security Best Practices

1. **Rotate exposed credentials**: Since database credentials were shared in chat, consider rotating them:
   - Go to Neon Dashboard → Settings → Reset Password

2. **Never commit .env files**: Already configured in `.gitignore` ✓

3. **Demo app security**:
   - This app uses URL-based access (no authentication)
   - Suitable for demos and prototypes only
   - Not recommended for production use without proper authentication

4. **Token expiration**: Set GitHub tokens to expire and create a reminder to rotate them

## Demo App Access Patterns

This is a demo application designed to mimic production behavior without authentication:

- **Policy Access**: `/policy/{policyNumber}` or `/policy?id={policyId}`
- **Portal Access**: `/portal?policyId={policyId}`
- **Quote Flow**: `/quote` (generates new quote)

Example URLs after deployment:
```
https://your-app.vercel.app/quote
https://your-app.vercel.app/policy/POL-2025-123456
https://your-app.vercel.app/portal?policyId=550e8400-e29b-41d4-a716-446655440000
```

## Next Steps After Successful Deployment

1. Test all demo flows with sample data
2. Set up custom domain (optional)
3. Configure backend deployment (if not using mock services)
4. Set up monitoring and error tracking
5. Configure preview deployments for pull requests

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Neon Database Docs: https://neon.tech/docs
- GitHub PAT Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
