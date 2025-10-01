/*
  # Add Missing Properties Columns

  1. Changes to properties table
    - Add `currency` column (text) - property price currency
    - Add `beds` column (integer) - alias for bedrooms
    - Add `baths` column (integer) - alias for bathrooms
    - Add `video_url` column (text) - property video URL
    - Add `property_type` column (text) - type of property
    - Add `available_from` column (text) - availability date
    - Add `cover_image_url` column (text) - cover image
    
  2. Notes
    - All columns are optional with sensible defaults
    - Existing data is preserved
*/

-- Add currency column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Add beds as alias for bedrooms (for compatibility)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS beds integer;

-- Add baths as alias for bathrooms (for compatibility)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS baths integer;

-- Add video_url
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_url text;

-- Add property_type
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'Property';

-- Add available_from
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS available_from text DEFAULT 'Available Now';

-- Add cover_image_url
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_currency ON properties(currency);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_video_url ON properties(video_url) WHERE video_url IS NOT NULL;

-- Update beds/baths from bedrooms/bathrooms where they exist
UPDATE properties SET beds = bedrooms WHERE beds IS NULL AND bedrooms IS NOT NULL;
UPDATE properties SET baths = bathrooms WHERE baths IS NULL AND bathrooms IS NOT NULL;
