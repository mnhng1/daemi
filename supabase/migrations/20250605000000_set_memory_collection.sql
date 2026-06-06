-- Let EITHER couple-space member set/clear a memory's collection_id, while content edits and
-- soft-deletes stay author-only (memories_update is unchanged: member AND creator). This
-- SECURITY DEFINER function bypasses memories_update for the single narrow collection-only write;
-- the in-body is_couple_space_member call is the load-bearing authz guard, and the EXISTS check
-- prevents assigning a memory to a collection in another couple-space.
-- p_collection_id NULL = clear assignment (load-bearing; do NOT add NOT NULL / a default).
create or replace function set_memory_collection(p_memory_id uuid, p_collection_id uuid)
returns setof memories
language sql
volatile                       -- writes: must NOT be stable (sibling readers are stable; do not copy that here)
security definer
set search_path = public
as $$
  update memories m
  set collection_id = p_collection_id
  where m.id = p_memory_id
    and m.deleted_at is null                              -- don't reassign soft-deleted rows
    and is_couple_space_member(m.couple_space_id)         -- SECURITY DEFINER leak guard (load-bearing)
    and (
      p_collection_id is null
      or exists (
        select 1 from collections c
        where c.id = p_collection_id
          and c.couple_space_id = m.couple_space_id        -- same-space collection only
      )
    )
  returning m.*;
$$;

-- SECURITY DEFINER *writer* that bypasses RLS, unlike the repo's stable read-only functions.
-- Restrict execution to authenticated roles; a bare grant does NOT remove the implicit PUBLIC
-- (incl. anon) grant, so the revoke is the important half.
revoke all on function set_memory_collection(uuid, uuid) from public;
grant execute on function set_memory_collection(uuid, uuid) to authenticated;
