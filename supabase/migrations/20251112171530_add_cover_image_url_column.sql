/*
  # Add cover_image_url column to properties table
  
  1. Changes
    - Add cover_image_url column to properties table
    - This stores the main/cover image URL for the property
    - Usually the first image in the images array
  
  2. Notes
    - Optional field, can be null
    - Used for property cards and preview displays
*/

-- Add cover_image_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE properties ADD COLUMN cover_image_url text;
    COMMENT ON COLUMN properties.cover_image_url IS 'Main/cover image URL for property preview';
  END IF;
END $$;
