-- ============================================================
-- Open Source Picks — Add Image & Upload Support Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Add image_url column to picks_posts if it doesn't exist
ALTER TABLE picks_posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Make description column nullable (as image posts might not have text)
ALTER TABLE picks_posts ALTER COLUMN description DROP NOT NULL;

-- 3. Create picks-images storage bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'picks-images', 
    'picks-images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Storage policies for picks-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'picks-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'picks-images'
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'picks-images'
    AND auth.uid() = owner
);

-- 6. Make license column nullable (optional)
ALTER TABLE picks_posts ALTER COLUMN license DROP NOT NULL;

-- 7. Remove the 300 character limit constraint on description
ALTER TABLE picks_posts DROP CONSTRAINT IF EXISTS picks_posts_description_check;
