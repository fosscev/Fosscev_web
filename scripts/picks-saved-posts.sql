-- ============================================================
-- Open Source Picks — Saved Posts Database Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Create Saved Posts Table
CREATE TABLE IF NOT EXISTS picks_saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES picks_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_picks_saved_posts_user ON picks_saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_picks_saved_posts_post ON picks_saved_posts(post_id);

-- 3. Enable RLS
ALTER TABLE picks_saved_posts ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Users can read their own saved posts
DROP POLICY IF EXISTS "Users can read own saved posts" ON picks_saved_posts;
CREATE POLICY "Users can read own saved posts" ON picks_saved_posts 
FOR SELECT USING (
    user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
);

-- Users can manage their own saved posts (insert/delete)
DROP POLICY IF EXISTS "Users can manage own saved posts" ON picks_saved_posts;
CREATE POLICY "Users can manage own saved posts" ON picks_saved_posts 
FOR ALL USING (
    user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
);

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access picks_saved_posts" ON picks_saved_posts;
CREATE POLICY "Service role full access picks_saved_posts" ON picks_saved_posts 
FOR ALL USING (auth.role() = 'service_role');

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, reload schema;
