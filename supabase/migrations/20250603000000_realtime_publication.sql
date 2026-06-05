-- Phase 8: Realtime Sync
-- Realtime postgres_changes only emits for tables in the supabase_realtime publication.
-- Without this, the client subscribes cleanly (status SUBSCRIBED) but never receives
-- events — a silent no-op. See src/features/realtime/use-realtime-sync.ts.
--
-- Guarded so re-runs / partial replays don't error with 42710 (already a member).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'memories'
  ) then
    alter publication supabase_realtime add table memories;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'memory_reactions'
  ) then
    alter publication supabase_realtime add table memory_reactions;
  end if;
end $$;

-- Soft delete is the norm (deleted_at — see RLS), so memory deletions reach partners as
-- UPDATE events, which carry all columns and match the couple_space_id filter on the
-- client. REPLICA IDENTITY FULL on memory_reactions makes DELETE events carry the full
-- old row (incl. memory_id) so RLS can authorize them and the client can react to unhearts.
alter table memory_reactions replica identity full;
