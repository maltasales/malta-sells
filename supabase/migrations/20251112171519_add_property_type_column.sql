/*
  # Add property_type column to properties table
  
  1. Changes
    - Add property_type column to properties table
    - This column stores the type of property (Apartment, Villa, Studio, etc.)
    - Default to 'Apartment' for existing records
  
  2. Notes
    - This is a required field for property listings
    - Common values: Apartment, Studio, Penthouse, Villa, Townhouse, Maisonette, Loft
*/

-- Add property_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'property_type'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_type text NOT NULL DEFAULT 'Apartment';
    COMMENT ON COLUMN properties.property_type IS 'Type of property (Apartment, Villa, Studio, etc.)';
  END IF;
END $$;
