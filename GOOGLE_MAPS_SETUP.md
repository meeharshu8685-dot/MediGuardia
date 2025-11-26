# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the Hospital Locator feature.

## Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Select or Create Project**
   - Select your existing project or create a new one
   - If creating new: Click "New Project" → Enter name → Create

3. **Enable Maps JavaScript API**
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Maps JavaScript API"**
   - Click on it and click **"Enable"**

4. **Enable Places API** (Optional but recommended)
   - Go back to **"Library"**
   - Search for **"Places API"**
   - Click **"Enable"**

5. **Create API Key**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"** → **"API key"**
   - Copy the API key (you'll see it in a popup)

6. **Restrict API Key** (Important for security)
   - Click on the API key you just created
   - Under **"API restrictions"**:
     - Select **"Restrict key"**
     - Check: **"Maps JavaScript API"** and **"Places API"** (if enabled)
   - Under **"Application restrictions"**:
     - Select **"HTTP referrers (web sites)"**
     - Add your domains:
       - `http://localhost:3000/*` (for local development)
       - `https://your-domain.com/*` (for production)
       - `https://*.vercel.app/*` (if using Vercel)
   - Click **"Save"**

## Step 2: Add API Key to Environment Variables

1. **Add to `.env.local`**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. **Add to Vercel** (for production)
   - Go to Vercel project settings
   - Add `VITE_GOOGLE_MAPS_API_KEY` environment variable
   - Redeploy

## Step 3: Test the Map

1. Start your dev server: `npm run dev`
2. Navigate to SOS → Hospitals
3. You should see the map with your location and nearby hospitals

## Troubleshooting

### Map Not Loading
- ✅ Check API key is correct
- ✅ Verify Maps JavaScript API is enabled
- ✅ Check browser console for errors
- ✅ Verify API key restrictions allow your domain

### "This page can't load Google Maps correctly"
- ✅ Check API key restrictions
- ✅ Make sure your domain is in the allowed referrers list
- ✅ Verify billing is enabled (Google requires billing for Maps API)

### Location Not Showing
- ✅ Check browser permissions for location access
- ✅ Verify HTTPS (required for geolocation in production)
- ✅ Check browser console for geolocation errors

## Billing Note

Google Maps API requires a billing account, but they provide:
- **$200 free credit per month**
- This covers approximately 28,000 map loads per month
- For most apps, this is more than enough

## Quick Reference

- **Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com)
- **Maps JavaScript API Docs**: [https://developers.google.com/maps/documentation/javascript](https://developers.google.com/maps/documentation/javascript)
- **API Key Management**: APIs & Services → Credentials

