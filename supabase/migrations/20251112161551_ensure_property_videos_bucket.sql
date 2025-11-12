/*
  # Ensure Property Videos Storage Bucket Exists
  
  1. Ensures the property-videos bucket is properly configured
  2. Sets correct file size limit and MIME types
  3. Confirms RLS policies are in place
*/

-- Ensure property-videos bucket exists with correct configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-videos',
  'property-videos', 
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'],
  public = true;

-- Ensure RLS policies exist for property-videos
DO $$ 
BEGIN
  -- Upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload property videos'
  ) THEN
    CREATE POLICY "Users can upload property videos" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their property videos'
  ) THEN
    CREATE POLICY "Users can update their property videos"
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their property videos'
  ) THEN
    CREATE POLICY "Users can delete their property videos"
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- Read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Property videos are publicly readable'
  ) THEN
    CREATE POLICY "Property videos are publicly readable"
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'property-videos');
  END IF;
END $$;
