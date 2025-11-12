/*
  # Auto-create profile when Supabase Auth user is created
  
  1. New Functions
    - `handle_new_user()` - Automatically creates a profile when auth.users record is created
  
  2. New Triggers
    - `on_auth_user_created` - Fires after INSERT on auth.users
  
  3. Purpose
    - Ensures every Supabase Auth user automatically gets a profile
    - Extracts role and full_name from user metadata
    - No manual profile creation needed in application code
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    plan_id,
    verified,
    verification_prompt_shown,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'buyer') = 'seller' 
      THEN 'free' 
      ELSE NULL 
    END,
    false,
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a profile when a new auth.users record is created';
