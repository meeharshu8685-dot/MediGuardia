# Supabase Database Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Tables in Supabase

1. Go to your Supabase project → **SQL Editor**
2. Copy and paste this SQL (creates all tables):

```sql
-- Run this entire script in SQL Editor

-- SOS Logs
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Profiles
CREATE TABLE IF NOT EXISTS medical_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    height TEXT,
    weight TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact JSONB,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Logs
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

-- Medications
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    notes TEXT, -- Stores time/notes
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sos_logs_user_id ON sos_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_logs_timestamp ON sos_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_medical_profiles_user_id ON medical_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_timestamp ON health_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
```

### Step 2: Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can manage their own SOS logs"
    ON sos_logs FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medical profiles"
    ON medical_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health logs"
    ON health_logs FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications"
    ON medications FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own documents"
    ON documents FOR ALL
    USING (auth.uid() = user_id);
```

### Step 3: Verify Setup

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all 5 tables listed
3. Click on any table → **Policies** tab → Should see RLS enabled

### Step 4: Test Connection

Your app should already be configured with Supabase credentials in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📝 Next Steps

1. **Update Services**: See `MIGRATION_EXAMPLE.md` for code examples
2. **Use Helper Functions**: Import from `lib/supabaseDb.ts` for common operations
3. **Test**: Create, read, update, delete operations
4. **Migrate Data**: Export from Firebase and import to Supabase (if needed)

## 🔍 Common Commands

### Check if table exists
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'sos_logs';
```

### View all tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'sos_logs';
```

### View table structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sos_logs';
```

## 🆘 Need Help?

- Full guide: `SUPABASE_DATABASE_SETUP.md`
- Code examples: `MIGRATION_EXAMPLE.md`
- Supabase Docs: https://supabase.com/docs

