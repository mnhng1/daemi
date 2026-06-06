-- Phase 9a: Collections Realtime
-- Add collections table to the supabase_realtime publication so postgres_changes
-- events reach the client. Guarded to avoid 42710 errors on re-run.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'collections'
  ) then
    alter publication supabase_realtime add table collections;
  end if;
end $$;
