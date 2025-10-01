/*
  # Update RPC Function with New Columns

  1. Changes
    - Include video_url from properties table
    - Include currency from properties table
    - Include property_type from properties table
    - Include available_from from properties table
    
  2. Notes
    - Replaces previous version of the function
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
    COALESCE(p.currency, 'EUR') as listing_currency,
    COALESCE(p.beds, p.bedrooms) as listing_beds,
    COALESCE(p.baths, p.bathrooms) as listing_baths,
    p.area as listing_area,
    p.images as listing_images,
    p.video_url as listing_video_url,
    p.status as listing_status,
    p.created_at as listing_created_at,
    s.id as seller_id,
    COALESCE(s.full_name, s.name, 'Property Owner') as seller_name,
    s.avatar_url as seller_avatar_url,
    s.phone as seller_phone,
    s.email as seller_email,
    COALESCE(s.role, 'seller') as seller_role,
    COALESCE(s.plan_id, 'free') as seller_plan_id,
    COALESCE(s.verified, false) as seller_verified,
    COALESCE(p.property_type, 'Property') as property_type,
    COALESCE(p.available_from, 'Available Now') as available_from
  FROM properties p
  LEFT JOIN profiles s ON p.seller_id = s.id
  ORDER BY p.created_at DESC;
END;
$$;
