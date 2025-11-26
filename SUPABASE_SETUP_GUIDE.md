# Complete Supabase Authentication Setup Guide

This guide will walk you through setting up Supabase authentication with Email/Password, Google OAuth, and Facebook OAuth.

## Step 1: Create Supabase Project

1. **Go to Supabase**
   - Visit [https://supabase.com](https://supabase.com)
   - Click **"Start your project"** or **"Sign In"** if you have an account

2. **Sign Up / Sign In**
   - Create a new account or sign in with GitHub
   - Verify your email if required

3. **Create New Project**
   - Click **"New Project"** button
   - Fill in the details:
     - **Name**: MediGuardia (or any name you prefer)
     - **Database Password**: Create a strong password (save it securely!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Free tier is fine for development
   - Click **"Create new project"**
   - Wait 2-3 minutes for project to initialize

---

## Step 2: Get Your Supabase Credentials

1. **Navigate to Project Settings**
   - In your Supabase dashboard, click on **Settings** (gear icon) in the left sidebar
   - Click on **"API"** in the settings menu

2. **Copy Your Credentials**
   - **Project URL**: Copy the "Project URL" (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key**: Copy the "anon public" key (long string starting with `eyJ...`)

3. **Save These Credentials**
   - You'll need these for your `.env.local` file

---

## Step 3: Enable Email/Password Authentication

Email/Password is **enabled by default** in Supabase! No setup needed.

However, you can configure it:

1. **Go to Authentication Settings**
   - Click **"Authentication"** in the left sidebar
   - Click **"Providers"** tab

2. **Email Provider Settings**
   - **Email** should already be enabled (toggle is ON)
   - You can configure:
     - **Confirm email**: Toggle ON if you want users to verify email
     - **Secure email change**: Toggle ON for security
     - **Enable email signup**: Should be ON

3. **Email Templates (Optional)**
   - Go to **"Email Templates"** tab
   - Customize welcome emails, password reset emails, etc.

---

## Step 4: Enable Google OAuth

### Part A: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click **"New Project"**
   - **Project name**: MediGuardia (or any name)
   - Click **"Create"**
   - Wait for project creation, then select it

3. **Enable Google+ API**
   - Go to **"APIs & Services"** → **"Library"**
   - Search for **"Google+ API"** or **"People API"**
   - Click on it and click **"Enable"**

4. **Create OAuth Consent Screen**
   - Go to **"APIs & Services"** → **"OAuth consent screen"**
   - Choose **"External"** (unless you have Google Workspace)
   - Click **"Create"**
   - Fill in the required information:
     - **App name**: MediGuardia
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Click **"Save and Continue"**
   - **Scopes**: Click **"Save and Continue"** (default scopes are fine)
   - **Test users**: Add your email, click **"Save and Continue"**
   - **Summary**: Review and click **"Back to Dashboard"**

5. **Create OAuth Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - **Application type**: Choose **"Web application"**
   - **Name**: MediGuardia Web Client
   - **Authorized JavaScript origins**:
     - Add: `https://your-project-id.supabase.co`
     - Add: `http://localhost:3000` (for local development)
   - **Authorized redirect URIs**:
     - Add: `https://your-project-id.supabase.co/auth/v1/callback`
     - Add: `http://localhost:3000/auth/callback` (for local development)
   - Click **"Create"**
   - **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately!
     - Client ID: `xxxxxxxxxxxxx.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-xxxxxxxxxxxxx`

### Part B: Configure Google in Supabase

1. **Go to Supabase Dashboard**
   - Click **"Authentication"** → **"Providers"**

2. **Enable Google Provider**
   - Find **"Google"** in the providers list
   - Toggle it **ON**

3. **Add Google Credentials**
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
   - Click **"Save"**

4. **Test Google Login**
   - The Google provider should now show as **"Enabled"**

---

## Step 5: Enable Facebook OAuth

### Part A: Get Facebook App Credentials

1. **Go to Facebook Developers**
   - Visit [https://developers.facebook.com](https://developers.facebook.com)
   - Sign in with your Facebook account

2. **Create a New App**
   - Click **"My Apps"** → **"Create App"**
   - Choose **"Consumer"** or **"Business"** type
   - Click **"Next"**
   - Fill in:
     - **App Name**: MediGuardia
     - **App Contact Email**: Your email
   - Click **"Create App"**

3. **Add Facebook Login Product**
   - In your app dashboard, find **"Add Product"**
   - Click **"Set Up"** on **"Facebook Login"**
   - Choose **"Web"** platform
   - **Site URL**: 
     - Add: `https://your-project-id.supabase.co`
     - Add: `http://localhost:3000` (for local development)

4. **Configure OAuth Settings**
   - Go to **"Settings"** → **"Basic"**
   - **App ID**: Copy this (you'll need it)
   - **App Secret**: Click **"Show"** and copy (you'll need it)
   - **App Domains**: Add `supabase.co` and `localhost`
   - Click **"Save Changes"**

5. **Configure Valid OAuth Redirect URIs**
   - Go to **"Settings"** → **"Basic"** → Scroll to **"Facebook Login"** settings
   - **Valid OAuth Redirect URIs**:
     - Add: `https://your-project-id.supabase.co/auth/v1/callback`
     - Add: `http://localhost:3000/auth/callback` (for local development)
   - Click **"Save Changes"**

6. **Make App Public (for testing)**
   - Go to **"App Review"** → **"Permissions and Features"**
   - Toggle **"Make your app public"** to ON (for development/testing)
   - Or add test users in **"Roles"** → **"Test Users"**

### Part B: Configure Facebook in Supabase

1. **Go to Supabase Dashboard**
   - Click **"Authentication"** → **"Providers"**

2. **Enable Facebook Provider**
   - Find **"Facebook"** in the providers list
   - Toggle it **ON**

3. **Add Facebook Credentials**
   - **Client ID (for OAuth)**: Paste your Facebook App ID
   - **Client Secret (for OAuth)**: Paste your Facebook App Secret
   - Click **"Save"**

4. **Test Facebook Login**
   - The Facebook provider should now show as **"Enabled"**

---

## Step 6: Configure Redirect URLs in Supabase

1. **Go to Authentication Settings**
   - Click **"Authentication"** → **"URL Configuration"**

2. **Add Site URL**
   - **Site URL**: 
     - For local: `http://localhost:3000`
     - For production: `https://your-domain.com`

3. **Add Redirect URLs**
   - Click **"Add URL"** and add:
     - `http://localhost:3000/auth/callback` (local development)
     - `https://your-domain.com/auth/callback` (production)
     - `https://your-project-id.supabase.co/auth/v1/callback` (Supabase default)

4. **Save Changes**
   - Click **"Save"**

---

## Step 7: Set Up Environment Variables

1. **Create `.env.local` file**
   - In your project root, create a file named `.env.local`

2. **Add Your Credentials**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Gemini API Key (if you're using it)
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Replace Placeholders**
   - Replace `your-project-id` with your actual Supabase project ID
   - Replace `your-anon-key-here` with your actual anon key
   - Replace `your-gemini-api-key` with your Gemini API key (if using)

4. **For Vercel Deployment**
   - Go to your Vercel project settings
   - Add these as **Environment Variables**:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `GEMINI_API_KEY`

---

## Step 8: Test Your Authentication

1. **Start Your Development Server**
   ```bash
   npm run dev
   ```

2. **Test Email/Password**
   - Go to signup page
   - Create an account with email and password
   - Check your email for verification (if enabled)
   - Try logging in

3. **Test Google OAuth**
   - Click "Sign in with Google"
   - Should redirect to Google login
   - After authorization, should redirect back and log you in

4. **Test Facebook OAuth**
   - Click "Sign in with Facebook"
   - Should redirect to Facebook login
   - After authorization, should redirect back and log you in

---

## Troubleshooting

### Google OAuth Not Working
- ✅ Check that redirect URI matches exactly in Google Console
- ✅ Verify Client ID and Secret are correct in Supabase
- ✅ Make sure Google+ API is enabled
- ✅ Check browser console for errors

### Facebook OAuth Not Working
- ✅ Verify App ID and Secret are correct
- ✅ Check redirect URIs match exactly
- ✅ Make sure app is in development mode or add test users
- ✅ Verify app domain is set correctly

### Email/Password Not Working
- ✅ Check Supabase logs in dashboard
- ✅ Verify email provider is enabled
- ✅ Check spam folder for verification emails
- ✅ Try resetting password

### General Issues
- ✅ Check Supabase project is active (not paused)
- ✅ Verify environment variables are set correctly
- ✅ Check browser console for errors
- ✅ Review Supabase logs in dashboard

---

## Quick Reference: Where to Find Everything

### Supabase
- **Dashboard**: [https://app.supabase.com](https://app.supabase.com)
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → anon public key
- **Auth Providers**: Authentication → Providers
- **Redirect URLs**: Authentication → URL Configuration

### Google Cloud Console
- **Dashboard**: [https://console.cloud.google.com](https://console.cloud.google.com)
- **OAuth Credentials**: APIs & Services → Credentials
- **Client ID & Secret**: In OAuth 2.0 Client IDs section

### Facebook Developers
- **Dashboard**: [https://developers.facebook.com](https://developers.facebook.com)
- **App ID & Secret**: Settings → Basic
- **OAuth Settings**: Settings → Basic → Facebook Login

---

## Security Best Practices

1. **Never commit `.env.local` to git** (it's already in .gitignore)
2. **Use environment variables** in production (Vercel, etc.)
3. **Rotate secrets** if they're ever exposed
4. **Use HTTPS** in production
5. **Enable email verification** for production apps
6. **Set up proper CORS** policies in Supabase

---

## Next Steps

Once authentication is working:
1. ✅ Test all three methods (Email, Google, Facebook)
2. ✅ Set up user profiles in Supabase
3. ✅ Configure email templates
4. ✅ Set up production redirect URLs
5. ✅ Deploy to Vercel with environment variables

---

**Need Help?**
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Google OAuth Docs: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- Facebook Login Docs: [https://developers.facebook.com/docs/facebook-login](https://developers.facebook.com/docs/facebook-login)

