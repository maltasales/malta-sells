/*
  # Fix Security Warnings - Immutable Search Path

  1. Changes
    - Recreate `get_listings_with_current_seller_profile` function with STABLE and SET search_path
    - Recreate `update_updated_at_column` trigger function with SET search_path

  2. Security
    - Prevents search_path manipulation attacks
    - Functions now have immutable search paths
    - Maintains SECURITY DEFINER where needed
*/

-- Drop and recreate get_listings_with_current_seller_profile with immutable search_path
DROP FUNCTION IF EXISTS public.get_listings_with_current_seller_profile();

CREATE OR REPLACE FUNCTION public.get_listings_with_current_seller_profile()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  location text,
  price numeric,
  currency text,
  beds integer,
  baths integer,
  area numeric,
  tags text[],
  images text[],
  video_url text,
  property_type text,
  seller_id uuid,
  seller_name text,
  seller_avatar text,
  seller_phone text,
  seller_plan_id text,
  seller_verified boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.location,
    p.price,
    p.currency,
    p.beds,
    p.baths,
    p.area,
    p.tags,
    p.images,
    p.video_url,
    p.property_type,
    p.seller_id,
    prof.full_name as seller_name,
    prof.avatar_url as seller_avatar,
    prof.phone as seller_phone,
    prof.plan_id as seller_plan_id,
    prof.verified as seller_verified,
    p.created_at
  FROM properties p
  LEFT JOIN profiles prof ON p.seller_id = prof.id
  ORDER BY p.created_at DESC;
END;
$function$;

-- Drop and recreate update_updated_at_column trigger function with immutable search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate triggers that use update_updated_at_column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();