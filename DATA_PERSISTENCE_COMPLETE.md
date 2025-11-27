# Complete Data Persistence Guide

This document outlines all the important data that is now stored in Supabase and persists across login sessions.

## ✅ What Gets Stored Automatically

### 1. **Medical Profile** ✅
**Stored in:** `medical_profiles` table

**Data Saved:**
- Full name
- Age
- Gender
- Blood group
- Allergies (array)
- Chronic conditions (array)
- Emergency contact (name + phone)
- Avatar URL

**When Saved:**
- When you complete the medical quiz
- When you update your profile in Settings
- When you edit profile information

**When Loaded:**
- Automatically on login
- When you open Profile screen
- When you access Medical Info

---

### 2. **Medications** ✅
**Stored in:** `medications` table

**Data Saved:**
- Medication name
- Dosage
- Frequency
- Time/Notes
- Start date (optional)
- End date (optional)

**When Saved:**
- When you add a new medication
- When you update an existing medication

**When Loaded:**
- Automatically on login
- When you open Medications screen
- When you view Health History

---

### 3. **Health Logs** ✅
**Stored in:** `health_logs` table

**Data Saved:**
- Symptoms (array)
- Diagnosis
- Severity (Minor/Moderate/Severe)
- Notes/Details
- Timestamp

**When Saved:**
- When you save symptom analysis results
- When you manually add a health log

**When Loaded:**
- Automatically on login
- When you open History screen
- When you view Health Logs

---

### 4. **SOS Logs** ✅
**Stored in:** `sos_logs` table

**Data Saved:**
- Location (latitude, longitude)
- Address
- Emergency category
- Emergency message
- Timestamp
- Status

**When Saved:**
- When you send an SOS alert
- When emergency location is shared

**When Loaded:**
- When you view SOS history
- When you check emergency logs

---

### 5. **Documents** ✅
**Stored in:** `documents` table + Supabase Storage

**Data Saved:**
- Document name
- File type
- File URL (in Supabase Storage)
- File size
- Upload timestamp

**When Saved:**
- When you upload a medical document
- When you add a PDF/image

**When Loaded:**
- Automatically on login
- When you open Documents screen

---

### 6. **Profile Pictures** ✅
**Stored in:** Supabase Storage (`avatars` bucket)

**Data Saved:**
- Avatar image file
- Public URL

**When Saved:**
- When you upload/change profile picture
- When you update avatar

**When Loaded:**
- Automatically on login
- Displayed in header and profile screen

---

## 🔄 How Data Persistence Works

### On Login:
1. ✅ App checks Supabase authentication
2. ✅ Loads medical profile from `medical_profiles` table
3. ✅ Loads all medications from `medications` table
4. ✅ Loads all health logs from `health_logs` table
5. ✅ Loads all documents from `documents` table
6. ✅ Loads avatar from Supabase Storage
7. ✅ All data appears automatically - **no need to re-enter!**

### When You Add/Update Data:
1. ✅ Data is saved immediately to Supabase
2. ✅ Row Level Security (RLS) ensures only you can access your data
3. ✅ Data persists across sessions
4. ✅ Available on all devices (when logged in with same account)

---

## 📊 Database Tables

All data is stored in these Supabase PostgreSQL tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `medical_profiles` | User medical information | name, age, blood_group, allergies, emergency_contact |
| `medications` | Medication tracking | name, dosage, frequency, notes |
| `health_logs` | Health history | symptoms, severity, notes, timestamp |
| `sos_logs` | Emergency SOS records | latitude, longitude, emergency_category, timestamp |
| `documents` | Medical documents metadata | name, type, file_url, file_size |

---

## 🔒 Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only access their own data
- ✅ All queries filtered by `user_id`
- ✅ No data leakage between users
- ✅ Secure file storage with access policies

---

## 🧪 Testing Data Persistence

### Test 1: Medical Profile
1. Login to the app
2. Complete medical quiz or update profile
3. Logout
4. Login again
5. ✅ Your profile should still be there!

### Test 2: Medications
1. Add a medication
2. Logout
3. Login again
4. ✅ Medication should still be in your list!

### Test 3: Health Logs
1. Use symptom checker and save results
2. Logout
3. Login again
4. ✅ Health logs should still be in history!

### Test 4: Documents
1. Upload a document
2. Logout
3. Login again
4. ✅ Document should still be accessible!

---

## 🆘 Troubleshooting

### Data not persisting after login?

**Check:**
1. ✅ Supabase tables are created (see `SUPABASE_QUICK_START.md`)
2. ✅ RLS policies are set up correctly
3. ✅ Environment variables are set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. ✅ User is authenticated (check browser console)

### Can't see my data?

**Check:**
1. ✅ You're logged in with the same account
2. ✅ Check Supabase Dashboard → Table Editor → Verify data exists
3. ✅ Check browser console for errors
4. ✅ Verify RLS policies allow your user to read data

### Data lost after update?

**Check:**
1. ✅ Check Supabase Dashboard → Logs for errors
2. ✅ Verify network connection
3. ✅ Check browser console for error messages
4. ✅ Try refreshing the page

---

## 📝 Migration from Firebase

If you were using Firebase before:

1. **Export data from Firebase** (if needed)
2. **Run Supabase SQL scripts** (see `SUPABASE_QUICK_START.md`)
3. **Import data to Supabase** (optional - manual process)
4. **Update environment variables** to use Supabase
5. **Test all features** to ensure data loads correctly

---

## ✅ Summary

**All important data is now stored in Supabase:**
- ✅ Medical Profile
- ✅ Medications
- ✅ Health Logs
- ✅ SOS Logs
- ✅ Documents
- ✅ Profile Pictures

**Data persists:**
- ✅ Across login sessions
- ✅ Across devices (same account)
- ✅ Automatically loaded on login
- ✅ No need to re-enter information!

**Everything is secure:**
- ✅ Row Level Security (RLS)
- ✅ User-specific access
- ✅ Encrypted connections
- ✅ Secure file storage

