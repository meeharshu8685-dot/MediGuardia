# Backend Deployment Guide

Complete guide to deploy the MediGuardia backend API to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Best for:** Serverless functions, automatic deployments

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd backend
   vercel
   ```

4. **Follow Prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name: **mediguardia-backend**
   - Directory: **./**
   - Override settings? **No**

5. **Set Environment Variables:**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add PORT
   ```

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

7. **Get Your URL:**
   - Vercel will show: `https://mediguardia-backend.vercel.app`
   - This is your API base URL!

#### Vercel Configuration

Create `vercel.json` in backend folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Option 2: Railway (Recommended - Simple)

**Best for:** Easy deployment, automatic HTTPS

#### Steps:

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables:**
   - Go to Variables tab
   - Add:
     - `SUPABASE_URL` = your_supabase_url
     - `SUPABASE_ANON_KEY` = your_supabase_key
     - `PORT` = NOT NEEDED (Railway auto-assigns it)

5. **Deploy:**
   - Railway auto-deploys on push
   - Get URL: `https://your-app.railway.app`

---

### Option 3: Render (Free Tier Available)

**Best for:** Free hosting, easy setup

#### Steps:

1. **Go to Render:**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure:**
   - Name: `mediguardia-backend`
   - Region: Choose closest
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables:**
   - Go to Environment tab
   - Add:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `PORT` = NOT NEEDED (Render auto-assigns it)

5. **Deploy:**
   - Click "Create Web Service"
   - Get URL: `https://mediguardia-backend.onrender.com`

---

### Option 4: Heroku

**Best for:** Traditional hosting

#### Steps:

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create App:**
   ```bash
   cd backend
   heroku create mediguardia-backend
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_ANON_KEY=your_supabase_key
   # PORT is NOT needed - Heroku auto-assigns it via process.env.PORT
   ```

5. **Deploy:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a mediguardia-backend
   git push heroku main
   ```

6. **Get URL:**
   - `https://mediguardia-backend.herokuapp.com`

---

### Option 5: AWS Lambda (Serverless)

**Best for:** Serverless, pay-per-use

#### Steps:

1. **Install Serverless Framework:**
   ```bash
   npm install -g serverless
   ```

2. **Create `serverless.yml`:**
   ```yaml
   service: mediguardia-backend

   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       SUPABASE_URL: ${env:SUPABASE_URL}
       SUPABASE_ANON_KEY: ${env:SUPABASE_ANON_KEY}

   functions:
     api:
       handler: dist/server.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
         - http:
             path: /
             method: ANY
   ```

3. **Deploy:**
   ```bash
   serverless deploy
   ```

---

## 📋 Pre-Deployment Checklist

### 1. Build the Project

```bash
cd backend
npm install
npm run build
```

### 2. Test Locally

```bash
npm start
# Test: curl http://localhost:3001/health
```

### 3. Environment Variables

Make sure you have:
- ✅ `SUPABASE_URL` - **REQUIRED**
- ✅ `SUPABASE_ANON_KEY` - **REQUIRED**
- ❌ `PORT` - **NOT NEEDED** (platforms auto-assign it)

### 4. Update CORS

Update `src/server.ts` to allow your frontend domain:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    'https://mediguardia.vercel.app'
  ],
  credentials: true
}));
```

---

## 🔧 Platform-Specific Configurations

### Vercel

**File: `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

**Install Vercel adapter:**
```bash
npm install @vercel/node
```

### Railway

**File: `railway.json` (optional)**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Render

**File: `render.yaml` (optional)**
```yaml
services:
  - type: web
    name: mediguardia-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
```

---

## 🧪 Testing After Deployment

### 1. Health Check

```bash
curl https://your-backend-url.com/health
```

Expected:
```json
{"status":"ok","message":"MediGuardia Backend API is running"}
```

### 2. Test Hospitals Endpoint

```bash
curl -X GET "https://your-backend-url.com/api/hospitals?lat=18.5204&lng=73.8567&radius=5000" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

---

## 🔐 Security Checklist

- ✅ Environment variables set (not in code)
- ✅ CORS configured for your frontend
- ✅ HTTPS enabled (automatic on most platforms)
- ✅ Authentication required for API endpoints
- ✅ Input validation on all endpoints

---

## 📊 Platform Comparison

| Platform | Free Tier | Ease | Auto-Deploy | Best For |
|----------|-----------|------|-------------|----------|
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐⭐ | ✅ Yes | Serverless |
| **Railway** | ✅ Yes | ⭐⭐⭐⭐⭐ | ✅ Yes | Simple |
| **Render** | ✅ Yes | ⭐⭐⭐⭐ | ✅ Yes | Free hosting |
| **Heroku** | ❌ No | ⭐⭐⭐ | ⚠️ Manual | Traditional |
| **AWS Lambda** | ✅ Yes | ⭐⭐ | ⚠️ Manual | Serverless |

---

## 🚨 Troubleshooting

### Issue: Build Fails

**Solution:**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Issue: Environment Variables Not Working

**Solution:**
- Check variable names match exactly
- Restart/redeploy after adding variables
- Verify in platform dashboard

### Issue: CORS Errors

**Solution:**
- Update CORS in `src/server.ts`
- Add your frontend URL to allowed origins
- Redeploy

### Issue: 404 on Routes

**Solution:**
- Check route paths match
- Verify server is running
- Check platform routing configuration

---

## 📝 Quick Deploy Commands

### Vercel (Fastest)
```bash
cd backend
npm install -g vercel
vercel --prod
```

### Railway
```bash
# Just push to GitHub, Railway auto-deploys
git push origin main
```

### Render
```bash
# Connect GitHub repo in Render dashboard
# Auto-deploys on push
```

---

## ✅ Post-Deployment

1. **Get Your URL:**
   - Copy the deployment URL
   - Example: `https://mediguardia-backend.vercel.app`

2. **Update Frontend:**
   - Add to frontend `.env.local`:
     ```env
     VITE_API_BASE_URL=https://mediguardia-backend.vercel.app
     ```

3. **Test Integration:**
   - Test from frontend
   - Check browser console for errors
   - Verify API calls work

---

## 🎯 Recommended: Vercel

**Why Vercel?**
- ✅ Easiest setup
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ Great for Node.js/Express

**Quick Start:**
```bash
cd backend
vercel
# Follow prompts
# Done! 🎉
```

Your backend will be live in under 2 minutes!

