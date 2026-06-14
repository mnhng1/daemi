alter table memories
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(10,6);

comment on column memories.latitude is 'WGS84 latitude from the places picker; null for free-text / legacy place_name.';
comment on column memories.longitude is 'WGS84 longitude from the places picker; null for free-text / legacy place_name.';

-- Distinct places in a space, for the Places list lens (name + memory count).
create or replace function list_space_places(space_id uuid)
returns table (place_name text, memory_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select place_name, count(*) as memory_count
  from memories
  where couple_space_id = space_id
    and deleted_at is null
    and place_name is not null
    and place_name <> ''
    and is_couple_space_member(space_id)   -- SECURITY DEFINER leak guard (load-bearing)
  group by place_name
  order by memory_count desc, place_name asc;
$$;
