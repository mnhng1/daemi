-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE couple_spaces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text,
  invite_code       text NOT NULL UNIQUE,
  created_by_user_id uuid NOT NULL REFERENCES profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE couple_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_space_id, user_id),
  UNIQUE (user_id)
);

CREATE TABLE collections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id   uuid NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
  name              text NOT NULL,
  type              text NOT NULL CHECK (type IN ('trip', 'anniversary', 'custom')),
  start_date        date,
  end_date          date,
  description       text,
  created_by_user_id uuid NOT NULL REFERENCES profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memories (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id   uuid NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
  type              text NOT NULL CHECK (type IN ('photo', 'video', 'letter', 'ticket')),
  title             text,
  body              text,
  media_url         text,
  thumbnail_url     text,
  date_happened     date NOT NULL,
  place_name        text,
  tags              text[] NOT NULL DEFAULT '{}',
  collection_id     uuid REFERENCES collections(id) ON DELETE SET NULL,
  created_by_user_id uuid NOT NULL REFERENCES profiles(id),
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memory_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id  uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('heart')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (memory_id, user_id)
);

-- ============================================================
-- Functions
-- ============================================================

CREATE OR REPLACE FUNCTION is_couple_space_member(space_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM couple_members
    WHERE couple_space_id = space_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION lookup_space_by_invite_code(code text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM couple_spaces WHERE invite_code = code LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$;

-- ============================================================
-- Triggers
-- ============================================================

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_couple_spaces_updated_at
  BEFORE UPDATE ON couple_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_spaces   ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_reactions ENABLE ROW LEVEL SECURITY;

-- profiles

CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM couple_members cm1
      JOIN couple_members cm2 ON cm1.couple_space_id = cm2.couple_space_id
      WHERE cm1.user_id = auth.uid()
        AND cm2.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- couple_spaces

CREATE POLICY "couple_spaces_select"
  ON couple_spaces FOR SELECT
  USING (is_couple_space_member(id));

CREATE POLICY "couple_spaces_insert"
  ON couple_spaces FOR INSERT
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "couple_spaces_update"
  ON couple_spaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM couple_members
      WHERE couple_space_id = couple_spaces.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- couple_members

CREATE POLICY "couple_members_select"
  ON couple_members FOR SELECT
  USING (is_couple_space_member(couple_space_id));

CREATE POLICY "couple_members_insert"
  ON couple_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      SELECT COUNT(*)
      FROM couple_members existing
      WHERE existing.couple_space_id = couple_members.couple_space_id
    ) < 2
    AND NOT EXISTS (
      SELECT 1 FROM couple_members existing
      WHERE existing.user_id = auth.uid()
    )
  );

CREATE POLICY "couple_members_delete"
  ON couple_members FOR DELETE
  USING (auth.uid() = user_id);

-- memories

CREATE POLICY "memories_select"
  ON memories FOR SELECT
  USING (
    is_couple_space_member(couple_space_id)
    AND deleted_at IS NULL
  );

CREATE POLICY "memories_insert"
  ON memories FOR INSERT
  WITH CHECK (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  );

CREATE POLICY "memories_update"
  ON memories FOR UPDATE
  USING (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  );

-- collections

CREATE POLICY "collections_select"
  ON collections FOR SELECT
  USING (is_couple_space_member(couple_space_id));

CREATE POLICY "collections_insert"
  ON collections FOR INSERT
  WITH CHECK (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  );

CREATE POLICY "collections_update"
  ON collections FOR UPDATE
  USING (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  );

-- memory_reactions

CREATE POLICY "memory_reactions_select"
  ON memory_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM memories
      WHERE memories.id = memory_reactions.memory_id
        AND is_couple_space_member(memories.couple_space_id)
        AND memories.deleted_at IS NULL
    )
  );

CREATE POLICY "memory_reactions_insert"
  ON memory_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM memories
      WHERE memories.id = memory_reactions.memory_id
        AND is_couple_space_member(memories.couple_space_id)
        AND memories.deleted_at IS NULL
    )
  );

CREATE POLICY "memory_reactions_delete"
  ON memory_reactions FOR DELETE
  USING (auth.uid() = user_id);
