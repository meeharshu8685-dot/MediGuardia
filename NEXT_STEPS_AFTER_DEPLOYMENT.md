# Next Steps After Backend Deployment

## ✅ Step 1: Get Your Backend URL

After deploying, you'll get a URL like:
- Vercel: `https://mediguardia-backend.vercel.app`
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`

**Copy this URL - this is your API Base URL!**

---

## ✅ Step 2: Test Your Backend

### Test Health Endpoint:
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{"status":"ok","message":"MediGuardia Backend API is running"}
```

### Test Hospitals Endpoint (requires auth):
```bash
# Get your Supabase JWT token first, then:
curl -X GET "https://your-backend-url.com/api/hospitals?lat=18.5204&lng=73.8567&radius=5000" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

---

## ✅ Step 3: Update Frontend Environment Variables

### Create/Update `.env.local`:

```env
# Your Backend API URL (from Step 1)
VITE_API_BASE_URL=https://your-backend-url.vercel.app

# Existing variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
# ... other variables
```

### For Production (Vercel):

1. Go to Vercel Dashboard
2. Select your **frontend** project
3. Settings → Environment Variables
4. Add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.vercel.app`
   - Environment: Production, Preview, Development
5. Redeploy frontend

---

## ✅ Step 4: Verify Integration

### Check Frontend Service:

The `services/hospitalService.ts` has been updated to:
- ✅ Use backend API when `VITE_API_BASE_URL` is set
- ✅ Fall back to mock data if backend unavailable
- ✅ Handle authentication automatically
- ✅ Transform backend response to frontend format

### Test in Browser:

1. Start frontend: `npm run dev`
2. Login to your app
3. Navigate to: **SOS → Hospitals**
4. Check browser console for API calls
5. Verify hospitals load from backend

---

## ✅ Step 5: Update Hospital Locator Screen

The screen has been updated to:
- ✅ Use backend API for real hospital data
- ✅ Show hospitals from OpenStreetMap
- ✅ Display distance, address, and fields
- ✅ "Go There" button opens Google Maps

### What Changed:

- **Before**: Mock hospitals with fake data
- **After**: Real hospitals from OpenStreetMap via backend API

---

## ✅ Step 6: Remove Map (Optional)

Since we're showing a **list only** (no embedded map), you can:

1. **Option A: Keep map** (if you have Google Maps API key)
2. **Option B: Remove map** and show list only

To remove map, update `HospitalLocatorMapScreen.tsx`:
- Remove Google Maps imports
- Replace map section with simple list view
- Keep hospital list functionality

---

## 🧪 Testing Checklist

- [ ] Backend health check works
- [ ] Backend hospitals endpoint works (with auth)
- [ ] Frontend `.env.local` has `VITE_API_BASE_URL`
- [ ] Frontend can fetch hospitals from backend
- [ ] Hospitals display correctly in UI
- [ ] "Go There" buttons work
- [ ] Distance shows correctly
- [ ] Hospital fields/specialties display

---

## 🚨 Troubleshooting

### Issue: "Failed to fetch hospitals"

**Check:**
1. Backend URL is correct in `.env.local`
2. Backend is deployed and running
3. User is logged in (Supabase session exists)
4. CORS is configured in backend

**Solution:**
```bash
# Test backend directly
curl https://your-backend-url.com/health

# Check frontend console for errors
# Verify VITE_API_BASE_URL is set
```

### Issue: "Authentication failed"

**Check:**
1. User is logged in
2. Supabase session is valid
3. Backend has correct Supabase credentials

**Solution:**
- Logout and login again
- Check Supabase credentials in backend

### Issue: "No hospitals found"

**Check:**
1. Coordinates are valid
2. Radius is large enough
3. Backend API is working

**Solution:**
- Increase radius (try 15000 meters)
- Check backend logs
- Test with different coordinates

---

## 📊 What's Working Now

✅ **Backend API** - Deployed and running
✅ **Frontend Integration** - Updated to use backend
✅ **Authentication** - Supabase JWT working
✅ **Real Hospital Data** - From OpenStreetMap
✅ **Distance Calculation** - Accurate distances
✅ **Hospital Classification** - Fields/specialties
✅ **Google Maps Links** - "Go There" buttons

---

## 🎯 Next Steps (Optional)

1. **Add Caching** - Cache hospital results
2. **Add Error Handling** - Better error messages
3. **Add Loading States** - Show loading indicators
4. **Add Retry Logic** - Retry failed requests
5. **Add Offline Support** - Cache for offline use

---

## 📝 Summary

**You're Done!** 🎉

1. ✅ Backend deployed
2. ✅ Frontend updated
3. ✅ Environment variables set
4. ✅ Integration complete

**Test it:**
- Open app → Login → SOS → Hospitals
- See real hospitals from OpenStreetMap!

---

## 🔗 Quick Reference

- **Backend URL**: `https://your-backend-url.com`
- **Health Check**: `/health`
- **Hospitals API**: `/api/hospitals?lat=X&lng=Y&radius=Z`
- **Frontend Config**: `VITE_API_BASE_URL` in `.env.local`

