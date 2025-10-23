# Deployment Guide

## Current Issue

Your Vercel deployment only includes the **frontend** (React/Vite app), but the app needs a **backend** (NestJS API) to function. This causes the 405 error you're seeing.

## Solutions

### Option 1: Deploy Backend Separately (Recommended for Now)

Since NestJS doesn't run natively on Vercel, you can deploy the backend to a platform that supports Node.js servers:

#### A. Deploy Backend to Render.com (Free Tier)

1. **Create Render account**: https://render.com
2. **Create new Web Service**:
   - Connect your GitHub repo
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`
   - Environment variables:
     - `DATABASE_URL` (from Neon)
     - `FRONTEND_URL=https://auto-prototype-master.vercel.app`
     - `PORT=3000`
3. **Copy the deployed URL** (e.g., `https://your-app.onrender.com`)
4. **Update Vercel environment variables**:
   - Go to Vercel project settings
   - Add: `VITE_API_BASE_URL=https://your-app.onrender.com/api/v1`
   - Redeploy frontend

#### B. Deploy Backend to Railway.app (Free Tier)

Similar process to Render:
1. Create Railway account: https://railway.app
2. Deploy backend service
3. Get deployed URL
4. Set `VITE_API_BASE_URL` in Vercel

### Option 2: Use Local Backend with Tunnel (Quick Testing)

This lets you test the deployed frontend with your local backend:

1. **Install ngrok**: `npm install -g ngrok` or download from https://ngrok.com
2. **Start your backend locally**:
   ```bash
   cd backend
   npm run start:dev
   ```
3. **Create tunnel** (in new terminal):
   ```bash
   ngrok http 3000
   ```
4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
5. **Update Vercel env var**:
   - `VITE_API_BASE_URL=https://abc123.ngrok.io/api/v1`
   - Redeploy frontend

**Note**: ngrok URLs expire when you stop the tunnel. This is only for testing.

### Option 3: Convert Backend to Vercel Serverless Functions (Advanced)

This requires significant refactoring of the NestJS backend. Not recommended for now.

## Quick Fix for Local Testing

To test locally with the updated code:

1. **Create `.env` file** in project root:
   ```bash
   # Use the local backend
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

2. **Start both servers**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend
   npm run dev
   ```

3. **Test the flow**:
   - Visit http://localhost:5173
   - Fill out the quote form
   - Should now work without errors

## Environment Variables Summary

### For Vercel (Frontend)
- `VITE_API_BASE_URL` - Full URL to deployed backend (e.g., `https://your-backend.onrender.com/api/v1`)
- `GITHUB_TOKEN` - For Canary Design System package access

### For Backend (Render/Railway)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)
- `PORT` - Usually 3000 (auto-set on most platforms)
- `NODE_ENV=production`

## Recommended Approach

For a production-ready demo:

1. **Deploy backend to Render.com** (free tier)
2. **Keep frontend on Vercel** (free tier)
3. **Connect them via environment variables**

This gives you:
- ✅ Both services running 24/7
- ✅ Public URLs to share
- ✅ Free hosting for demo purposes
- ✅ Easy to update via Git push

## Testing Checklist

After deployment:
- [ ] Visit frontend URL
- [ ] Click "Get Started"
- [ ] Fill out vehicle info
- [ ] Fill out driver info
- [ ] Select coverage
- [ ] See quote results (no 405 errors)
- [ ] Try portal access with policy number

## Troubleshooting

### Still getting 405 errors?
- Check Vercel env vars are set correctly
- Verify backend is running (visit backend URL directly)
- Check browser console for actual API URL being called

### CORS errors?
- Ensure backend has `FRONTEND_URL` env var set to Vercel URL
- Check CORS config in `backend/src/api/middleware/cors.ts`

### Database connection errors?
- Verify `DATABASE_URL` is set in backend env vars
- Check Neon database is accessible
- Run migrations: `cd backend && npm run db:push`
