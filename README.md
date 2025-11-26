<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1isoIEEt1JQlppUZ65ddi6wgy4wVdNR1i

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration (for Authentication)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Firebase Configuration (for Database & Storage)
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Google Maps API Key (for Hospital Locator)
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Backend Setup

This app uses a **hybrid backend approach**:
- **Supabase**: Authentication (Email/Password, Google OAuth, Facebook OAuth)
- **Firebase**: Database (Firestore) and Storage

### Quick Setup Guide

**For Authentication (Supabase):**
👉 See **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)**

**For Database (Firebase):**
👉 See **[FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)** (Database section only)

### Quick Steps:

#### Supabase (Authentication):
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get Project URL and anon key from Settings → API
3. Enable Email/Password, Google, and Facebook in Authentication → Providers
4. Add credentials to `.env.local`

#### Firebase (Database):
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Create Firestore database (test mode for development)
3. Set up security rules (see FIREBASE_SETUP_GUIDE.md)
4. Get Firebase config from Project Settings → Your apps
5. Add Firebase config to `.env.local` (only database config needed, not auth)

## Deploy to Vercel

This project is configured for deployment on Vercel.

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID
   - `GEMINI_API_KEY`: Your Gemini API key
6. Click "Deploy"

### Environment Variables

Make sure to set the following environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_FIREBASE_API_KEY`: Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Your Firebase app ID
- `GEMINI_API_KEY`: Your Gemini API key

The build will automatically use these environment variables during the build process.

## Features

### Authentication (Supabase)
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Session management with auto-refresh
- ✅ Protected routes

### Medical Profile (Firebase Firestore)
- ✅ Medical profile management
- ✅ Profile CRUD operations
- ✅ Emergency contact storage
- ✅ Allergies and conditions tracking
- ✅ Real-time data sync

### Backend Architecture
- ✅ **Supabase**: Authentication only
- ✅ **Firebase Firestore**: Database for medical data
- ✅ **Firebase Storage**: Document storage (optional)

### Emergency Features
- ✅ **Hospital Locator Map**: Interactive map with nearby hospitals
- ✅ **SOS Location Sharing**: Share location via WhatsApp/SMS
- ✅ **Real-time Location**: Get current coordinates and address
- ✅ **Hospital Details**: View hospital info and get directions

### Medical Features
- ✅ **Symptom Checker**: AI-powered symptom analysis
- ✅ **Medical Profile**: Store health information
- ✅ **Health History**: Track symptoms and medications
- ✅ **First Aid Guide**: Step-by-step emergency instructions
