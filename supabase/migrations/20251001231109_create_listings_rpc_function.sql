/*
  # Create RPC Function for Listings with Seller Profiles

  1. New Function
    - `get_listings_with_current_seller_profile()` 
    - Returns properties joined with their seller profile data
    - Returns all necessary fields for the frontend
    
  2. Returns
    - listing_id, listing_title, listing_location, listing_price, etc.
    - seller_id, seller_name, seller_avatar_url, seller_phone, etc.
    
  3. Notes
    - Uses LEFT JOIN to include properties even if profile is incomplete
    - Orders by created_at descending (newest first)
*/

CREATE OR REPLACE FUNCTION get_listings_with_current_seller_profile()
RETURNS TABLE (
  listing_id uuid,
  listing_title text,
  listing_description text,
  listing_location text,
  listing_price numeric,
  listing_currency text,
  listing_beds integer,
  listing_baths integer,
  listing_area numeric,
  listing_images jsonb,
  listing_video_url text,
  listing_status text,
  listing_created_at timestamptz,
  seller_id uuid,
  seller_name text,
  seller_avatar_url text,
  seller_phone text,
  seller_email text,
  seller_role text,
  seller_plan_id text,
  seller_verified boolean,
  property_type text,
  available_from text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as listing_id,
    p.title as listing_title,
    p.description as listing_description,
    p.location as listing_location,
    p.price as listing_price,
    'EUR'::text as listing_currency,
    p.bedrooms as listing_beds,
    p.bathrooms as listing_baths,
    p.area as listing_area,
    p.images as listing_images,
    NULL::text as listing_video_url,
    p.status as listing_status,
    p.created_at as listing_created_at,
    s.id as seller_id,
    COALESCE(s.full_name, s.name) as seller_name,
    s.avatar_url as seller_avatar_url,
    s.phone as seller_phone,
    s.email as seller_email,
    s.role as seller_role,
    s.plan_id as seller_plan_id,
    s.verified as seller_verified,
    'Property'::text as property_type,
    'Available Now'::text as available_from
  FROM properties p
  LEFT JOIN profiles s ON p.seller_id = s.id
  ORDER BY p.created_at DESC;
END;
$$;
