/*
  # Fix profiles table to link with Supabase Auth
  
  1. Changes
    - Add foreign key constraint linking profiles.id to auth.users.id
    - Add CASCADE delete so profile is deleted when auth user is deleted
    - This ensures profiles are properly synced with Supabase Auth users
  
  2. Security
    - Maintains RLS policies
    - Ensures data integrity between auth.users and profiles
*/

-- Drop existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- Add foreign key constraint to auth.users
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT profiles_id_fkey ON profiles IS 
  'Links profile to Supabase Auth user, cascades delete';
