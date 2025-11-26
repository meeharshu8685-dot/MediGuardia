# Firebase Backend Setup Guide

Complete guide to set up Firebase for MediGuardia authentication and database.

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - **Project name**: MediGuardia (or any name you prefer)
   - Click **"Continue"**
   - **Google Analytics**: Choose to enable or disable (optional)
   - Click **"Create project"**
   - Wait for project creation (30-60 seconds)
   - Click **"Continue"**

---

## Step 2: Register Web App

1. **Add Web App**
   - In your Firebase project dashboard, click the **Web icon** (`</>`)
   - **App nickname**: MediGuardia Web (or any name)
   - **Firebase Hosting**: Check if you want to use hosting (optional)
   - Click **"Register app"**

2. **Copy Firebase Configuration**
   - You'll see your Firebase config object
   - It looks like this:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
     };
     ```
   - **IMPORTANT**: Copy these values - you'll need them for environment variables

---

## Step 3: Enable Authentication Methods

### Enable Email/Password Authentication

1. **Go to Authentication**
   - In Firebase Console, click **"Authentication"** in left sidebar
   - Click **"Get started"** if first time

2. **Enable Email/Password**
   - Click **"Sign-in method"** tab
   - Find **"Email/Password"** in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - Click **"Save"**

### Enable Google Authentication

1. **Enable Google Provider**
   - In **"Sign-in method"** tab, find **"Google"**
   - Click on it
   - Toggle **"Enable"** to ON
   - **Project support email**: Select your email
   - Click **"Save"**

2. **Configure OAuth Consent Screen** (if needed)
   - Google will automatically configure this
   - No additional setup needed for basic Google sign-in

### Enable Facebook Authentication

1. **Get Facebook App Credentials**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create a new app (if you don't have one)
   - Get your **App ID** and **App Secret**

2. **Enable Facebook Provider**
   - In Firebase **"Sign-in method"** tab, find **"Facebook"**
   - Click on it
   - Toggle **"Enable"** to ON
   - **App ID**: Paste your Facebook App ID
   - **App Secret**: Paste your Facebook App Secret
   - **OAuth redirect URI**: Copy the URI shown (you'll need this for Facebook)
   - Click **"Save"**

3. **Configure Facebook OAuth Redirect**
   - Go back to Facebook Developers Console
   - In your app settings, add the OAuth redirect URI from Firebase
   - Save changes

---

## Step 4: Set Up Firestore Database

1. **Create Firestore Database**
   - In Firebase Console, click **"Firestore Database"** in left sidebar
   - Click **"Create database"**

2. **Choose Security Rules**
   - Select **"Start in test mode"** (for development)
   - **Location**: Choose closest to your users
   - Click **"Enable"**

3. **Set Up Security Rules** (Important!)
   - Go to **"Rules"** tab in Firestore
   - Replace with these rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Medical profiles - users can only access their own
         match /medical_profiles/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         
         // Health logs - users can only access their own
         match /health_logs/{logId} {
           allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
         }
         
         // Medications - users can only access their own
         match /medications/{medId} {
           allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
         }
         
         // Documents - users can only access their own
         match /documents/{docId} {
           allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
         }
       }
     }
     ```
   - Click **"Publish"**

---

## Step 5: Set Up Firebase Storage (Optional - for documents)

1. **Create Storage Bucket**
   - Click **"Storage"** in left sidebar
   - Click **"Get started"**
   - **Security rules**: Start in test mode (for development)
   - **Location**: Same as Firestore
   - Click **"Done"**

2. **Set Up Storage Rules**
   - Go to **"Rules"** tab
   - Replace with:
     ```javascript
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /users/{userId}/{allPaths=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```
   - Click **"Publish"**

---

## Step 6: Configure Environment Variables

1. **Create `.env.local` file**
   - In your project root, create `.env.local`

2. **Add Firebase Configuration**
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

   # Gemini API Key (if using)
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Replace with Your Values**
   - Copy each value from Firebase Console → Project Settings → Your apps
   - Replace the placeholders in `.env.local`

---

## Step 7: For Vercel Deployment

1. **Add Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to **"Environment Variables"**
   - Add each Firebase config variable:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `GEMINI_API_KEY` (if using)

2. **Redeploy**
   - After adding variables, trigger a new deployment

---

## Step 8: Test Your Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Email/Password**
   - Try signing up with email and password
   - Check Firebase Console → Authentication → Users to see new user

3. **Test Google Login**
   - Click "Sign in with Google"
   - Should redirect to Google and back

4. **Test Facebook Login**
   - Click "Sign in with Facebook"
   - Should redirect to Facebook and back

5. **Test Profile Creation**
   - After login, go to Profile
   - Fill in medical information
   - Check Firestore → `medical_profiles` collection to see saved data

---

## Firestore Collections Structure

Your app will use these collections:

### `medical_profiles`
- Document ID: User UID
- Fields:
  - `full_name`, `age`, `gender`, `blood_group`
  - `allergies[]`, `chronic_conditions[]`, `existing_medications[]`
  - `emergency_contact_name`, `emergency_contact_phone`
  - `height`, `weight`, `avatar_url`
  - `created_at`, `updated_at`

### `health_logs` (for future)
- Fields: `user_id`, `symptom`, `severity`, `date`, etc.

### `medications` (for future)
- Fields: `user_id`, `name`, `dosage`, `frequency`, etc.

### `documents` (for future)
- Fields: `user_id`, `name`, `type`, `url`, etc.

---

## Troubleshooting

### Authentication Not Working
- ✅ Check Firebase config values are correct
- ✅ Verify authentication methods are enabled
- ✅ Check browser console for errors
- ✅ Verify environment variables are loaded

### Firestore Permission Denied
- ✅ Check security rules are published
- ✅ Verify user is authenticated
- ✅ Check rules match your data structure

### Google/Facebook OAuth Not Working
- ✅ Verify providers are enabled in Firebase
- ✅ Check redirect URIs are configured
- ✅ For Facebook: Verify App ID and Secret are correct

### Environment Variables Not Loading
- ✅ Make sure variables start with `VITE_`
- ✅ Restart dev server after adding variables
- ✅ Check `.env.local` is in project root

---

## Quick Reference

### Firebase Console Links
- **Dashboard**: [https://console.firebase.google.com](https://console.firebase.google.com)
- **Project Settings**: Project Settings → General
- **Authentication**: Authentication → Sign-in method
- **Firestore**: Firestore Database → Data
- **Storage**: Storage → Files

### Get Your Config
1. Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click on your web app
4. Copy the config object values

---

## Security Best Practices

1. **Never commit `.env.local`** (already in .gitignore)
2. **Use environment variables** in production
3. **Review Firestore rules** before production
4. **Enable email verification** for production
5. **Set up proper CORS** if needed
6. **Use HTTPS** in production

---

## Next Steps

After Firebase is set up:
1. ✅ Test all authentication methods
2. ✅ Create medical profile
3. ✅ Verify data saves to Firestore
4. ✅ Set up additional collections as needed
5. ✅ Configure production rules

**Need Help?**
- Firebase Docs: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Firebase Support: [https://firebase.google.com/support](https://firebase.google.com/support)

