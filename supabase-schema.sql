-- Creator OS Lite — Supabase Schema
-- Run this entire file in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CLIPS (Content Database)
CREATE TABLE clips (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_name         TEXT NOT NULL,
  category          TEXT NOT NULL CHECK (category IN ('Lifestyle','Fashion','Affiliate','Wellness','GRWM','Tutorial','Other')),
  emotional_tags    TEXT[] DEFAULT '{}',
  aesthetic_tags    TEXT[] DEFAULT '{}',
  platform          TEXT DEFAULT 'TikTok',
  post_date         DATE,
  caption           TEXT,
  hook              TEXT,
  sound_used        TEXT,
  hook_style        TEXT,
  visual_style      TEXT,
  pacing            TEXT,
  lighting          TEXT,
  emotional_tone    TEXT,
  -- Tier 1 (Impact)
  saves             INTEGER DEFAULT 0,
  shares            INTEGER DEFAULT 0,
  watch_time_pct    INTEGER DEFAULT 0,
  profile_visits    INTEGER DEFAULT 0,
  -- Tier 2 (Monetization)
  affiliate_clicks  INTEGER DEFAULT 0,
  comments          INTEGER DEFAULT 0,
  reposts           INTEGER DEFAULT 0,
  affiliate_notes   TEXT,
  -- Tier 3 (Reach)
  views             INTEGER DEFAULT 0,
  followers_gained  INTEGER DEFAULT 0,
  -- Meta
  thumbnail_url     TEXT,
  is_repost         BOOLEAN DEFAULT FALSE,
  original_clip_id  UUID REFERENCES clips(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULED POSTS (Content Calendar)
CREATE TABLE scheduled_posts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id       UUID REFERENCES clips(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  platform      TEXT DEFAULT 'TikTok',
  caption       TEXT,
  hook          TEXT,
  status        TEXT DEFAULT 'scheduled' CHECK (status IN ('draft','scheduled','posted','skipped')),
  is_repost     BOOLEAN DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- IDEA VAULT
CREATE TABLE vault_items (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('Hook Idea','Trend Observation','Viral Reference','Competitor Inspiration','Brand Concept')),
  content    TEXT NOT NULL,
  tags       TEXT[] DEFAULT '{}',
  category   TEXT,
  priority   TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  source_url TEXT,
  is_used    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI GENERATION LOG
CREATE TABLE generation_logs (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id          UUID REFERENCES clips(id) ON DELETE SET NULL,
  category         TEXT,
  description      TEXT,
  hooks            JSONB,
  captions         JSONB,
  ctas             JSONB,
  selected_hook    TEXT,
  selected_caption TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE clips          ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own clips"  ON clips          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own posts"  ON scheduled_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own vault"  ON vault_items    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own logs"   ON generation_logs FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on clips
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clips_updated_at
  BEFORE UPDATE ON clips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
