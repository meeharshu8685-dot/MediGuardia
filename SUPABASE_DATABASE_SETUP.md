# Supabase Database Setup Guide

This guide will help you migrate from Firebase Firestore to Supabase PostgreSQL database.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create Supabase Project](#step-1-create-supabase-project)
3. [Step 2: Create Database Tables](#step-2-create-database-tables)
4. [Step 3: Set Up Row Level Security (RLS)](#step-3-set-up-row-level-security-rls)
5. [Step 4: Update Environment Variables](#step-4-update-environment-variables)
6. [Step 5: Update Code to Use Supabase](#step-5-update-code-to-use-supabase)
7. [Migration Checklist](#migration-checklist)

---

## Prerequisites

- ✅ Supabase account (free tier works)
- ✅ Supabase project created
- ✅ Basic knowledge of SQL

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `mediguardia` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to initialize

---

## Step 2: Create Database Tables

### Access SQL Editor

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**

### Create Tables

Copy and paste the following SQL scripts one by one:

#### 1. SOS Logs Table

```sql
-- Create sos_logs table
CREATE TABLE IF NOT EXISTS sos_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    emergency_category TEXT,
    emergency_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'active',
    emergency_contact_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sos_logs_user_id ON sos_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_logs_timestamp ON sos_logs(timestamp DESC);
```

#### 2. Medical Profiles Table

```sql
-- Create medical_profiles table
CREATE TABLE IF NOT EXISTS medical_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact JSONB,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user_id ON medical_profiles(user_id);
```

#### 3. Health Logs Table

```sql
-- Create health_logs table
CREATE TABLE IF NOT EXISTS health_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptoms TEXT[],
    diagnosis TEXT,
    severity TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_timestamp ON health_logs(timestamp DESC);
```

#### 4. Medications Table

```sql
-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
```

#### 5. Documents Table

```sql
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
```

#### 6. Quotes Table (Optional - for motivational quotes)

```sql
-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some default quotes
INSERT INTO quotes (text, author, category) VALUES
('Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.', 'Buddha', 'health'),
('The greatest wealth is health.', 'Virgil', 'health'),
('Take care of your body. It''s the only place you have to live.', 'Jim Rohn', 'motivation'),
('A healthy outside starts from the inside.', 'Robert Urich', 'health'),
('The first wealth is health.', 'Ralph Waldo Emerson', 'health')
ON CONFLICT DO NOTHING;
```

#### 7. Feedback Table (Optional)

```sql
-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
```

---

## Step 3: Set Up Row Level Security (RLS)

RLS ensures users can only access their own data.

### Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- SOS Logs Policies
CREATE POLICY "Users can view their own SOS logs"
    ON sos_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SOS logs"
    ON sos_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS logs"
    ON sos_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Medical Profiles Policies
CREATE POLICY "Users can view their own medical profile"
    ON medical_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical profile"
    ON medical_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical profile"
    ON medical_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Health Logs Policies
CREATE POLICY "Users can view their own health logs"
    ON health_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health logs"
    ON health_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health logs"
    ON health_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Medications Policies
CREATE POLICY "Users can view their own medications"
    ON medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
    ON medications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
    ON medications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
    ON medications FOR DELETE
    USING (auth.uid() = user_id);

-- Documents Policies
CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- Feedback Policies (Allow anonymous feedback)
CREATE POLICY "Anyone can insert feedback"
    ON feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);
```

---

## Step 4: Update Environment Variables

Your `.env.local` file should already have Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Step 5: Update Code to Use Supabase

### Option A: Keep Firebase for Storage Only

If you want to keep Firebase Storage for file uploads:

1. Keep `lib/firebase.ts` for storage only
2. Update all database services to use Supabase
3. See example migration below

### Option B: Full Migration to Supabase

1. Use Supabase Storage instead of Firebase Storage
2. Update all services to use Supabase
3. Remove Firebase dependency (optional)

---

## Migration Checklist

- [ ] Created Supabase project
- [ ] Created all database tables
- [ ] Enabled Row Level Security (RLS)
- [ ] Created RLS policies
- [ ] Updated environment variables
- [ ] Updated `sosService.ts` to use Supabase
- [ ] Updated `medicalProfileService.ts` to use Supabase
- [ ] Updated `healthLogService.ts` to use Supabase
- [ ] Updated `medicationService.ts` to use Supabase
- [ ] Updated `documentService.ts` to use Supabase
- [ ] Updated `quoteService.ts` to use Supabase
- [ ] Tested all CRUD operations
- [ ] Migrated existing data (if any)

---

## Next Steps

1. **Test the connection**: Run your app and test creating/reading data
2. **Migrate existing data**: If you have Firebase data, export and import to Supabase
3. **Update services**: See example code in the next section

---

## Example: Migrating sosService.ts

**Before (Firestore):**
```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const createSOSLog = async (lat: number, lng: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    const sosRef = collection(db, 'sos_logs', user.id, 'logs');
    await addDoc(sosRef, { latitude: lat, longitude: lng });
};
```

**After (Supabase):**
```typescript
import { supabase } from '../../lib/supabase';

export const createSOSLog = async (lat: number, lng: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('sos_logs')
        .insert({ 
            user_id: user.id,
            latitude: lat, 
            longitude: lng 
        });
    return { success: !error, error };
};
```

---

## Need Help?

- 📚 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 Check Supabase Dashboard → Logs for errors

