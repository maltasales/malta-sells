/*
  # Add banner_url and bio columns to profiles table

  1. Changes
    - Add `banner_url` column to profiles table for seller banner images
    - Add `bio` column to profiles table for seller biography/description

  2. Notes
    - These fields are optional and can be NULL
    - Used primarily by sellers for their public profiles
*/

-- Add banner_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;

-- Add bio column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;