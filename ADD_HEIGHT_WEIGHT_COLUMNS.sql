-- Add height and weight columns to medical_profiles table
-- Run this in Supabase SQL Editor if the columns don't exist

ALTER TABLE medical_profiles 
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS weight TEXT;

