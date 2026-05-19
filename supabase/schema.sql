-- ============================================================
-- Maina Platform — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles (extends auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        PRIMARY KEY,
  email         TEXT        UNIQUE,
  username      TEXT        UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  role          TEXT        DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  provider      TEXT,
  password_hash TEXT,        -- only for email/password users
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_active   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Playlists ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlists (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id         UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  description      TEXT,
  cover_url        TEXT,
  is_public        BOOLEAN     DEFAULT false,
  is_collaborative BOOLEAN     DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Playlist Collaborators ───────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist_collaborators (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id)  ON DELETE CASCADE,
  can_edit    BOOLEAN     DEFAULT true,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, user_id)
);

-- ── Playlist Tracks ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID        REFERENCES playlists(id) ON DELETE CASCADE,
  track_id    TEXT        NOT NULL,
  track_data  JSONB       NOT NULL,
  added_by    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  position    INTEGER     NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Liked Songs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS liked_songs (
  user_id    UUID  REFERENCES profiles(id) ON DELETE CASCADE,
  track_id   TEXT  NOT NULL,
  track_data JSONB NOT NULL,
  liked_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

-- ── Play History (for trending) ──────────────────────────────
CREATE TABLE IF NOT EXISTS play_history (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  track_id   TEXT        NOT NULL,
  track_data JSONB       NOT NULL,
  played_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INTEGER     CHECK (rating BETWEEN 1 AND 5),
  content    TEXT        NOT NULL,
  is_visible BOOLEAN     DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Feedback / Bug Reports ───────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  type       TEXT        CHECK (type IN ('bug', 'feedback')),
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  status     TEXT        DEFAULT 'new' CHECK (status IN ('new', 'seen', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Song Shares ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS song_shares (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  track_data   JSONB       NOT NULL,
  message      TEXT,
  is_read      BOOLEAN     DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_play_history_track    ON play_history(track_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played   ON play_history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_list  ON playlist_tracks(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_liked_songs_user      ON liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_visible       ON reviews(is_visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_song_shares_to_user   ON song_shares(to_user_id, is_read);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_songs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback              ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_shares           ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update"   ON profiles FOR UPDATE USING (auth.uid()::text = id::text);

-- Liked songs: only own
CREATE POLICY "liked_own"  ON liked_songs FOR ALL USING (auth.uid()::text = user_id::text);

-- Play history: only own
CREATE POLICY "history_own" ON play_history FOR ALL USING (auth.uid()::text = user_id::text);

-- Playlists: owner or collaborator can read; owner can write
CREATE POLICY "playlists_read"   ON playlists FOR SELECT USING (is_public OR auth.uid()::text = owner_id::text);
CREATE POLICY "playlists_write"  ON playlists FOR ALL   USING (auth.uid()::text = owner_id::text);

-- Reviews: visible ones public, own private
CREATE POLICY "reviews_public"   ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "reviews_own"      ON reviews FOR INSERT  WITH CHECK (auth.uid()::text = user_id::text);

-- Feedback: authenticated insert only
CREATE POLICY "feedback_insert"  ON feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Song shares: own
CREATE POLICY "shares_own"  ON song_shares FOR ALL USING (
  auth.uid()::text = from_user_id::text OR auth.uid()::text = to_user_id::text
);

-- ── Trending view ────────────────────────────────────────────
CREATE OR REPLACE VIEW trending_tracks WITH (security_invoker = true) AS
SELECT
  track_id,
  track_data->>'title'     AS title,
  track_data->>'artist'    AS artist,
  track_data->>'thumbnail' AS thumbnail,
  COUNT(*)                 AS play_count,
  COUNT(DISTINCT user_id)  AS unique_listeners
FROM play_history
WHERE played_at > NOW() - INTERVAL '7 days'
GROUP BY track_id, track_data->>'title', track_data->>'artist', track_data->>'thumbnail'
ORDER BY play_count DESC
LIMIT 50;

CREATE OR REPLACE VIEW trending_artists WITH (security_invoker = true) AS
SELECT
  track_data->>'artist' AS artist,
  COUNT(*)              AS play_count,
  COUNT(DISTINCT user_id) AS unique_listeners
FROM play_history
WHERE played_at > NOW() - INTERVAL '7 days'
GROUP BY track_data->>'artist'
ORDER BY play_count DESC
LIMIT 20;

-- ── Set first admin ──────────────────────────────────────────
-- Run this AFTER you create your account:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@maina-offical.vercel.app';
