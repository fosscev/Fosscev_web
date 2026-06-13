-- ============================================================
-- Open Source Picks — Database Migration Script
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Picks Users (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS picks_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Posts
CREATE TABLE IF NOT EXISTS picks_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL CHECK (char_length(description) <= 300),
    tool_name TEXT NOT NULL,
    flair TEXT NOT NULL CHECK (flair IN ('Development','Design','Sysadmin','Writing','Other','Question')),
    license TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    is_removed BOOLEAN DEFAULT false,
    removed_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Votes (UNIQUE per user per post)
CREATE TABLE IF NOT EXISTS picks_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES picks_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
    value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- 4. Comments (flat, no threading)
CREATE TABLE IF NOT EXISTS picks_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES picks_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) <= 1000),
    is_removed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. User flair affinity scores (for "For You" personalized feed)
CREATE TABLE IF NOT EXISTS picks_user_flair_scores (
    user_id UUID NOT NULL REFERENCES picks_users(id) ON DELETE CASCADE,
    flair TEXT NOT NULL CHECK (flair IN ('Development','Design','Sysadmin','Writing','Other','Question')),
    score INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, flair)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_picks_posts_created ON picks_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_picks_posts_score ON picks_posts(score DESC);
CREATE INDEX IF NOT EXISTS idx_picks_posts_flair ON picks_posts(flair);
CREATE INDEX IF NOT EXISTS idx_picks_posts_removed ON picks_posts(is_removed);
CREATE INDEX IF NOT EXISTS idx_picks_votes_post ON picks_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_picks_votes_user ON picks_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_picks_comments_post ON picks_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_picks_users_auth ON picks_users(auth_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE picks_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks_user_flair_scores ENABLE ROW LEVEL SECURITY;

-- picks_users: Anyone can read, only the user can insert their own profile
CREATE POLICY "Anyone can read picks_users" ON picks_users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON picks_users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- picks_posts: Anyone can read non-removed posts, authenticated users can insert
CREATE POLICY "Anyone can read non-removed posts" ON picks_posts FOR SELECT USING (is_removed = false);
CREATE POLICY "Authenticated users can create posts" ON picks_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role can do anything with posts" ON picks_posts FOR ALL USING (auth.role() = 'service_role');

-- picks_votes: Anyone can read, users can manage their own votes
CREATE POLICY "Anyone can read votes" ON picks_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage own votes" ON picks_votes FOR ALL USING (
    user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
);

-- picks_comments: Anyone can read non-removed comments, users can create
CREATE POLICY "Anyone can read non-removed comments" ON picks_comments FOR SELECT USING (is_removed = false);
CREATE POLICY "Authenticated users can create comments" ON picks_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role can do anything with comments" ON picks_comments FOR ALL USING (auth.role() = 'service_role');

-- picks_user_flair_scores: Users can manage their own scores
CREATE POLICY "Users can read own flair scores" ON picks_user_flair_scores FOR SELECT USING (
    user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can manage own flair scores" ON picks_user_flair_scores FOR ALL USING (
    user_id IN (SELECT id FROM picks_users WHERE auth_id = auth.uid())
);

-- ============================================================
-- Allow service role full access (for admin API operations)
-- ============================================================
CREATE POLICY "Service role full access picks_users" ON picks_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access picks_votes" ON picks_votes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access picks_flair_scores" ON picks_user_flair_scores FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Admin: Allow reading removed posts too (for moderation panel)
-- ============================================================
CREATE POLICY "Service role can read all posts" ON picks_posts FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can read all comments" ON picks_comments FOR SELECT USING (auth.role() = 'service_role');
