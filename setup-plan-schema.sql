-- Add plan-related columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Update existing seller profiles to have the free plan
UPDATE profiles 
SET plan_id = 'free' 
WHERE role = 'seller' AND plan_id IS NULL;

-- Create an index on plan_id for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);

-- Create an index on role for better query performance  
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);