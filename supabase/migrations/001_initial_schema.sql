-- =============================================
-- Saye Collective - Initial Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('Artist', 'Curator', 'Institution')),
  display_name  text NOT NULL,
  bio           text,
  geography     text,
  discipline    text,
  interests     text[] DEFAULT '{}',
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);

-- ARCHIVE ITEMS TABLE
CREATE TABLE IF NOT EXISTS archive_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('image', 'text', 'link')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- INDEXES (for triple-filter search performance)
CREATE INDEX IF NOT EXISTS idx_profiles_geography   ON profiles (geography);
CREATE INDEX IF NOT EXISTS idx_profiles_discipline  ON profiles (discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles (role);

-- ROW LEVEL SECURITY

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_own_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Archive Items
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archive_public_read"
  ON archive_items FOR SELECT
  USING (true);

CREATE POLICY "archive_own_insert"
  ON archive_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "archive_own_delete"
  ON archive_items FOR DELETE
  USING (auth.uid() = profile_id);
