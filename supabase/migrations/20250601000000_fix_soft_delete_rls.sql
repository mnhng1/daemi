-- Fix 42501 "new row violates row-level security policy for table memories" on soft-delete.
--
-- use-delete-memory.ts soft-deletes a row with .update({ deleted_at: <timestamp> }). PostgREST
-- issues that UPDATE with a RETURNING clause (it needs it even for return=minimal, to count
-- affected rows), and PostgreSQL applies SELECT policies to RETURNING rows. The old
-- memories_select policy required `deleted_at IS NULL`, so the freshly soft-deleted row failed
-- that read-back and PostgreSQL raised the generic RLS check error (42501).
--
-- This is why edits via use-update-memory.ts succeed but deletes fail: an edit leaves
-- deleted_at NULL (row stays SELECT-visible), whereas a soft-delete sets deleted_at non-null and
-- the row drops out of the SELECT policy mid-statement. The UPDATE policy's WITH CHECK is NOT the
-- culprit -- it only inspects couple_space_id / created_by_user_id, which neither path changes.
--
-- Fix: make memories_select an authorization-only policy (couple-space membership). The
-- deleted_at IS NULL visibility filter is redundant in RLS -- use-memory.ts and use-memories.ts
-- already apply `.is("deleted_at", null)` in the query, so soft-deleted rows stay hidden from
-- normal reads while the soft-delete UPDATE's RETURNING row now passes the SELECT policy.

DROP POLICY IF EXISTS "memories_select" ON memories;

CREATE POLICY "memories_select"
  ON memories FOR SELECT
  USING (
    is_couple_space_member(couple_space_id)
  );

-- Also give memories_update an explicit WITH CHECK (it previously defaulted to USING). No
-- behavioural change for the columns we mutate, but it makes the update policy's intent explicit
-- and avoids surprises if USING and the allowed post-update state ever need to diverge.
DROP POLICY IF EXISTS "memories_update" ON memories;

CREATE POLICY "memories_update"
  ON memories FOR UPDATE
  USING (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  )
  WITH CHECK (
    is_couple_space_member(couple_space_id)
    AND auth.uid() = created_by_user_id
  );
