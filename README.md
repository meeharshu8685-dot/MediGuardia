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
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Supabase Setup

This app uses Supabase for authentication (Email/Password, Google OAuth, Facebook OAuth).

### Quick Setup Guide

For a **complete step-by-step guide** with screenshots and detailed instructions, see:
👉 **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)**

### Quick Steps:

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a project
   - Get your **Project URL** and **anon key** from Settings → API

2. **Enable Email/Password** (Already enabled by default)
   - Go to Authentication → Providers
   - Email should already be ON

3. **Enable Google OAuth**
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Add them in Supabase: Authentication → Providers → Google

4. **Enable Facebook OAuth**
   - Get credentials from [Facebook Developers](https://developers.facebook.com/)
   - Add them in Supabase: Authentication → Providers → Facebook

5. **Configure Redirect URLs**
   - In Supabase: Authentication → URL Configuration
   - Add: `http://localhost:3000/auth/callback` (local)
   - Add: `https://your-domain.com/auth/callback` (production)

6. **Set Environment Variables**
   - Create `.env.local` with:
     ```env
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

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
   - `GEMINI_API_KEY`: Your Gemini API key
6. Click "Deploy"

### Environment Variables

Make sure to set the following environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `GEMINI_API_KEY`: Your Gemini API key

The build will automatically use these environment variables during the build process.

## Authentication Features

- ✅ Email/Password authentication
- ✅ Google OAuth (requires Supabase configuration)
- ✅ Facebook OAuth (requires Supabase configuration)
- ✅ Session management with auto-refresh
- ✅ Protected routes
- ✅ User profile management
