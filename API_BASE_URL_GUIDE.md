# API Base URL Configuration Guide

This guide explains how to get and configure the API base URL for your MediGuardia backend.

## 🏠 Local Development

### Backend URL (Local)

When running the backend locally:

```bash
cd backend
npm run dev
```

**API Base URL:** `http://localhost:3001`

### Frontend Configuration

Add to your `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

1. **Deploy Backend to Vercel:**
   ```bash
   cd backend
   vercel
   ```

2. **Get Your Vercel URL:**
   - After deployment, Vercel provides a URL like:
   - `https://mediguardia-backend.vercel.app`
   - Or your custom domain: `https://api.mediguardia.com`

3. **Set Environment Variable:**
   - In Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL=https://your-backend-url.vercel.app`

### Option 2: Railway

1. **Deploy to Railway:**
   - Connect your GitHub repo
   - Railway auto-deploys

2. **Get Your Railway URL:**
   - Railway provides: `https://your-app.railway.app`
   - Or custom domain if configured

3. **Set Environment Variable:**
   - Railway Dashboard → Variables
   - Add: `VITE_API_BASE_URL=https://your-app.railway.app`

### Option 3: Render

1. **Deploy to Render:**
   - Create new Web Service
   - Connect GitHub repo

2. **Get Your Render URL:**
   - Render provides: `https://your-app.onrender.com`

3. **Set Environment Variable:**
   - Render Dashboard → Environment
   - Add: `VITE_API_BASE_URL=https://your-app.onrender.com`

### Option 4: Heroku

1. **Deploy to Heroku:**
   ```bash
   heroku create mediguardia-backend
   git push heroku main
   ```

2. **Get Your Heroku URL:**
   - Heroku provides: `https://mediguardia-backend.herokuapp.com`

3. **Set Environment Variable:**
   ```bash
   heroku config:set VITE_API_BASE_URL=https://mediguardia-backend.herokuapp.com
   ```

## 📝 Step-by-Step: Getting Your API Base URL

### Step 1: Deploy Backend

Choose a platform and deploy:

**Vercel (Easiest):**
```bash
cd backend
npm install -g vercel
vercel
# Follow prompts
```

**Railway:**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select your repo → backend folder

**Render:**
1. Go to render.com
2. New Web Service
3. Connect GitHub → Select backend folder

### Step 2: Get the URL

After deployment, you'll get a URL like:
- `https://mediguardia-backend-abc123.vercel.app`
- `https://your-app.railway.app`
- `https://your-app.onrender.com`

**This is your API Base URL!**

### Step 3: Configure Frontend

#### For Local Development:

Create/update `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
```

#### For Production:

**Option A: Vercel Environment Variables**
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.vercel.app`
   - Environment: Production, Preview, Development

**Option B: Build-time Variable**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || 'http://localhost:3001'
    ),
  },
});
```

## 🔍 How to Find Your Current API Base URL

### Check Environment Variables

```bash
# In frontend directory
cat .env.local | grep VITE_API_BASE_URL

# Or check Vercel
vercel env ls
```

### Check in Code

The service file uses:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

### Test the URL

```bash
# Test if backend is accessible
curl https://your-backend-url.vercel.app/health

# Should return:
# {"status":"ok","message":"MediGuardia Backend API is running"}
```

## 🛠️ Quick Setup Commands

### Local Development

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2: Start Frontend
cd .. # back to root
npm run dev
# Frontend uses http://localhost:3001 from .env.local
```

### Production Setup

```bash
# 1. Deploy Backend
cd backend
vercel --prod

# 2. Copy the URL (e.g., https://mediguardia-backend.vercel.app)

# 3. Set in Frontend Vercel Project
# Go to Vercel Dashboard → Frontend Project → Environment Variables
# Add: VITE_API_BASE_URL = https://mediguardia-backend.vercel.app

# 4. Redeploy Frontend
vercel --prod
```

## 📋 Environment Variable Checklist

### Backend (.env)
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3001  # Local
# OR
VITE_API_BASE_URL=https://your-backend.vercel.app  # Production
```

## 🚨 Common Issues

### Issue: CORS Error
**Solution:** Make sure backend CORS allows your frontend URL:
```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app']
}));
```

### Issue: 404 Not Found
**Solution:** Check the API base URL is correct:
```bash
# Test the endpoint
curl https://your-backend-url.vercel.app/api/hospitals?lat=18.5204&lng=73.8567
```

### Issue: Environment Variable Not Working
**Solution:** 
1. Restart dev server after changing `.env.local`
2. In production, redeploy after adding environment variables
3. Variables must start with `VITE_` to be exposed to frontend

## 📞 Quick Reference

| Environment | API Base URL |
|------------|--------------|
| Local Dev | `http://localhost:3001` |
| Vercel | `https://your-app.vercel.app` |
| Railway | `https://your-app.railway.app` |
| Render | `https://your-app.onrender.com` |
| Heroku | `https://your-app.herokuapp.com` |

## ✅ Verification

Test your API base URL:

```bash
# Health check (no auth)
curl https://your-api-url/health

# Should return:
# {"status":"ok","message":"MediGuardia Backend API is running"}
```

If this works, your API base URL is correct! ✅

