/*
  # Create Storage Buckets for Media Files

  1. Storage Buckets
    - `profile-images` - For user profile pictures and avatars
    - `banner-images` - For seller profile banner images
    - `property-images` - For property listing images
    - `property-videos` - For property listing videos

  2. Security
    - All buckets are publicly readable
    - Users can upload to their own folders
    - Users can manage their own files
*/

-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create banner-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images', 
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create property-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images', 
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create property-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-videos',
  'property-videos', 
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-images
CREATE POLICY "Users can upload their own profile images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile images are publicly readable"
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

-- Storage policies for banner-images
CREATE POLICY "Users can upload their own banner images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'banner-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banner images"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'banner-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banner images"
ON storage.objects FOR DELETE 
USING (bucket_id = 'banner-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Banner images are publicly readable"
ON storage.objects FOR SELECT 
USING (bucket_id = 'banner-images');

-- Storage policies for property-images
CREATE POLICY "Users can upload property images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their property images"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their property images"
ON storage.objects FOR DELETE 
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Property images are publicly readable"
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

-- Storage policies for property-videos
CREATE POLICY "Users can upload property videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their property videos"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their property videos"
ON storage.objects FOR DELETE 
USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Property videos are publicly readable"
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-videos');