/*
  # Create Initial Database Schema for Malta Sells

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `email` (text)
      - `phone` (varchar)
      - `whatsapp` (varchar)
      - `role` (text, default 'buyer')
      - `plan_id` (text, default 'free')
      - `plan_expires_at` (timestamptz)
      - `verified` (boolean, default false)
      - `verification_prompt_shown` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `price` (numeric)
      - `currency` (text, default '€')
      - `beds` (integer)
      - `baths` (integer)
      - `area` (numeric)
      - `tags` (text array)
      - `images` (text array)
      - `video_url` (text)
      - `seller_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `property_id` (uuid, references properties)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to properties

  3. Indexes
    - Add indexes for frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text,
  phone varchar(20),
  whatsapp varchar(20),
  role text DEFAULT 'buyer',
  plan_id text DEFAULT 'free',
  plan_expires_at timestamptz,
  verified boolean DEFAULT false,
  verification_prompt_shown boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT '€',
  beds integer,
  baths integer,
  area numeric,
  tags text[],
  images text[],
  video_url text,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Properties RLS policies
CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Favorites RLS policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function for getting listings with seller profile
CREATE OR REPLACE FUNCTION get_listings_with_current_seller_profile()
RETURNS TABLE (
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
  seller_id uuid,
  seller_name text,
  seller_avatar text,
  seller_phone text,
  seller_plan_id text,
  seller_verified boolean,
  created_at timestamptz
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;