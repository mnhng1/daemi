-- Fix: couple_spaces SELECT policy blocks INSERT...RETURNING
--
-- The create-space flow does INSERT INTO couple_spaces ... RETURNING *.
-- PostgREST requires the returned row to also pass the SELECT policy.
-- The original policy only allows is_couple_space_member(id), but the
-- couple_members row hasn't been inserted yet at that point.
-- Adding OR auth.uid() = created_by_user_id lets the creator read back
-- the row they just inserted.

DROP POLICY "couple_spaces_select" ON couple_spaces;

CREATE POLICY "couple_spaces_select"
  ON couple_spaces FOR SELECT
  USING (
    is_couple_space_member(id)
    OR auth.uid() = created_by_user_id
  );
