-- Migration for Memory Journal v2 
-- Add new fields to posts and create post_images, likes, comments tables

-- 1. Alter posts table to match new models
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE posts RENAME COLUMN image_url TO cover_image_url;
ALTER TABLE posts RENAME COLUMN caption TO description;

-- 2. Create post_images table
CREATE TABLE IF NOT EXISTS post_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  session_identifier text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, session_identifier) -- Prevent double likes from same session
);

-- 4. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for post_images
CREATE POLICY "Public can view post images" ON post_images FOR SELECT USING (true);
CREATE POLICY "Admin can insert post images" ON post_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update post images" ON post_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete post images" ON post_images FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for likes
CREATE POLICY "Public can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Public can insert likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete likes" ON likes FOR DELETE USING (true);

-- Policies for comments
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can delete comments" ON comments FOR DELETE USING (auth.role() = 'authenticated');
