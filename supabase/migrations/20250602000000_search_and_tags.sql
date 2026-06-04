-- Phase 7: Search & Tags
-- Backs every per-space read (timeline, search, suggestions). FK does not auto-index in Postgres.
create index if not exists memories_couple_space_id_idx on memories (couple_space_id);

-- Distinct tags in a space, for the search screen's suggestion chips.
create or replace function list_space_tags(space_id uuid)
returns setof text
language sql
security definer
stable
set search_path = public
as $$
  select distinct unnest(tags)
  from memories
  where couple_space_id = space_id
    and deleted_at is null
    and is_couple_space_member(space_id)   -- SECURITY DEFINER leak guard (load-bearing)
  order by 1;
$$;

-- DEFERRED intentionally: GIN-on-tags and tsvector+GIN. Per-space counts are in the low
-- hundreds; btree + ILIKE / array @> are trivially fast at that scale. Revisit past ~5k/space.
