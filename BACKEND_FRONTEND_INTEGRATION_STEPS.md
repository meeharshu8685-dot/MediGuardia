# Backend-Frontend Integration Steps

Complete guide to integrate your deployed backend with the frontend.

## 🔍 Step 1: Check Your Backend URL

First, get your deployed backend URL:

- **Vercel**: `https://your-app.vercel.app`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`

**Test it:**
```bash
curl https://your-backend-url.com/health
```

Should return: `{"status":"ok","message":"MediGuardia Backend API is running"}`

---

## 🔧 Step 2: Set Frontend Environment Variable

### For Local Development:

Create/update `.env.local` in the **root directory** (not in backend folder):

```env
# Backend API URL
VITE_API_BASE_URL=https://your-backend-url.vercel.app

# Existing variables (keep these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other variables
```

**Important:** 
- File must be named `.env.local` (not `.env`)
- Must be in the **root** directory (same level as `package.json`)
- Variable must start with `VITE_` to be accessible in frontend

### For Production (Vercel):

1. Go to Vercel Dashboard
2. Select your **frontend** project
3. Settings → Environment Variables
4. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.vercel.app`
   - **Environment**: Production, Preview, Development
5. Redeploy frontend

---

## ✅ Step 3: Verify Integration Code

The integration code is already in place. Check these files:

### 1. `services/hospitalService.ts`

Should have this code (lines 95-161):

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const getNearbyHospitals = async (
    userLat: number,
    userLon: number,
    radiusKm: number = 10
): Promise<Hospital[]> => {
    try {
        // Try backend API first
        if (API_BASE_URL && API_BASE_URL !== 'http://localhost:3001' || import.meta.env.DEV) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    const radiusMeters = radiusKm * 1000;
                    const response = await fetch(
                        `${API_BASE_URL}/api/hospitals?lat=${userLat}&lng=${userLon}&radius=${radiusMeters}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (response.ok) {
                        const backendHospitals = await response.json();
                        // Transform and return hospitals
                        return backendHospitals.map((h: any) => ({
                            // ... transformation
                        }));
                    }
                }
            } catch (apiError) {
                console.warn('Backend API unavailable, using fallback:', apiError);
            }
        }
        // Fallback to mock data...
    }
};
```

### 2. Check Import

Make sure `hospitalService.ts` imports Supabase:

```typescript
import { supabase } from '../lib/supabase';
```

---

## 🧪 Step 4: Test the Integration

### Test 1: Check Environment Variable

```bash
# In frontend directory
npm run dev
```

Open browser console and check:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

Should show your backend URL.

### Test 2: Test API Call

1. **Login** to your app
2. Go to **SOS → Hospitals**
3. **Open browser console** (F12)
4. Check for:
   - API calls to your backend
   - Any errors
   - Hospital data loading

### Test 3: Check Network Tab

1. Open **Developer Tools** → **Network** tab
2. Navigate to Hospitals
3. Look for request to: `https://your-backend-url.com/api/hospitals`
4. Check:
   - Status: Should be `200 OK`
   - Headers: Should have `Authorization: Bearer ...`
   - Response: Should have hospital data

---

## 🚨 Common Issues & Fixes

### Issue 1: "VITE_API_BASE_URL is undefined"

**Fix:**
1. Check `.env.local` exists in root directory
2. Variable name must be `VITE_API_BASE_URL` (with `VITE_` prefix)
3. Restart dev server after adding variable
4. In production, add to Vercel environment variables

### Issue 2: "Failed to fetch hospitals"

**Check:**
1. Backend is deployed and running
2. Backend URL is correct (test with `/health` endpoint)
3. User is logged in (Supabase session exists)
4. CORS is configured in backend

**Fix CORS in backend:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app'  // Add your frontend URL
  ],
  credentials: true
}));
```

### Issue 3: "401 Unauthorized"

**Fix:**
1. Make sure user is logged in
2. Check Supabase session is valid
3. Verify backend has correct Supabase credentials

### Issue 4: "CORS error"

**Fix:**
1. Add frontend URL to backend CORS origins
2. Redeploy backend
3. Check backend CORS configuration

---

## 📋 Integration Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend `/health` endpoint works
- [ ] `.env.local` file exists in root directory
- [ ] `VITE_API_BASE_URL` is set correctly
- [ ] Frontend dev server restarted after adding env variable
- [ ] User is logged in (Supabase session)
- [ ] Browser console shows API calls
- [ ] Network tab shows successful requests
- [ ] Hospitals are loading from backend

---

## 🔄 Step 5: Verify It's Working

### Signs of Successful Integration:

1. **Browser Console:**
   - No errors about API calls
   - Shows successful fetch requests

2. **Network Tab:**
   - Request to: `https://your-backend-url.com/api/hospitals`
   - Status: `200 OK`
   - Response: JSON array of hospitals

3. **UI:**
   - Hospitals list shows real data
   - Distances are calculated
   - Hospital names/addresses are real (from OpenStreetMap)

4. **Fallback:**
   - If backend fails, shows mock data (this is expected fallback)

---

## 🎯 Quick Integration Command

```bash
# 1. Create .env.local
echo "VITE_API_BASE_URL=https://your-backend-url.vercel.app" > .env.local

# 2. Add other variables (edit .env.local)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 3. Restart dev server
npm run dev
```

---

## 📝 Example .env.local

```env
# Backend API
VITE_API_BASE_URL=https://mediguardia-backend.vercel.app

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Gemini
GEMINI_API_KEY=your_gemini_key

# Google Maps (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## ✅ After Integration

Once integrated:
- ✅ Hospitals load from backend (OpenStreetMap)
- ✅ Real hospital data
- ✅ Accurate distances
- ✅ Hospital classification
- ✅ "Go There" buttons work

If backend is unavailable:
- ✅ Falls back to mock data
- ✅ App still works
- ✅ No errors shown to user

---

## 🆘 Still Not Working?

1. **Check backend logs** (Vercel/Railway dashboard)
2. **Check browser console** for errors
3. **Check network tab** for failed requests
4. **Verify environment variables** are set correctly
5. **Test backend directly** with curl
6. **Check CORS** configuration

---

## 📞 Quick Test

```bash
# Test backend
curl https://your-backend-url.com/health

# Test with auth (get token from browser console)
curl -X GET "https://your-backend-url.com/api/hospitals?lat=18.5204&lng=73.8567&radius=5000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If both work, backend is fine. Check frontend configuration!

