/*
  # Fix Property Videos Storage Bucket
  
  1. Removes and recreates the property-videos bucket properly
  2. Ensures it's registered correctly with Supabase Storage
  3. Sets up all necessary RLS policies
*/

-- Delete the bucket if it exists (this will cascade delete all objects)
DELETE FROM storage.buckets WHERE id = 'property-videos';

-- Recreate the bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-videos',
  'property-videos', 
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mpeg']
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload property videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their property videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their property videos" ON storage.objects;
DROP POLICY IF EXISTS "Property videos are publicly readable" ON storage.objects;

-- Create RLS policies for property-videos bucket
CREATE POLICY "Users can upload property videos" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their property videos"
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their property videos"
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Property videos are publicly readable"
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'property-videos');
