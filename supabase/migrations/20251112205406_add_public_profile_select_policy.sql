/*
  # Add Public Profile Select Policy

  1. Security Changes
    - Add policy to allow all users (authenticated and anonymous) to view public profile data
    - This is needed for features like public seller profiles and property listings that show seller information
    - Users can still only update their own profiles (existing policy remains)
*/

DO $$ 
BEGIN
  -- Drop the restrictive policy if it exists
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  
  -- Create a new public read policy
  CREATE POLICY "Anyone can view profiles"
    ON profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);
END $$;