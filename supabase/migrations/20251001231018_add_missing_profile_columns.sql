/*
  # Add Missing Profile Columns

  1. Changes to profiles table
    - Add `role` column (text) - user role (buyer/seller/admin)
    - Add `plan_id` column (text) - subscription plan
    - Add `name` column (text) - alternative name field
    
  2. Notes
    - All columns are optional with sensible defaults
    - Existing data is preserved
*/

-- Add role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'buyer';

-- Add plan_id column  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_id text DEFAULT 'free';

-- Add name column (some code uses 'name' instead of 'full_name')
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name text;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);
