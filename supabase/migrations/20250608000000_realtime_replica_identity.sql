-- Phase 8 follow-up: REPLICA IDENTITY FULL for filtered realtime tables
-- Supabase Realtime requires REPLICA IDENTITY FULL on any table where a
-- row-level filter is applied to a postgres_changes subscription. Without it
-- the server cannot evaluate the filter against old-row values and rejects the
-- subscription, causing a CHANNEL_ERROR on the client.
--
-- Affected subscriptions in use-realtime-sync.ts:
--   memories       filter: couple_space_id=eq.<id>
--   collections    filter: couple_space_id=eq.<id>
--
-- memory_reactions has no filter and already has REPLICA IDENTITY FULL
-- (set in 20250603000000_realtime_publication.sql).
alter table memories replica identity full;
alter table collections replica identity full;
