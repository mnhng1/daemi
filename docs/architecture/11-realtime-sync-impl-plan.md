# Phase 8 — Realtime Sync — Implementation Plan

Derived from `11-realtime-sync.md` (architecture) and `15-implementation-phases.md` (Phase 8 — Realtime).

## Goal
When one partner adds/edits/deletes a memory or toggles a reaction, the other
partner sees it without a manual refresh. Provider: Supabase Realtime.

## Codebase anchors
- Supabase client: `src/lib/supabase/client.ts` (`supabase`)
- Query client: `src/lib/query/client.ts`
- Providers mount: `app/_layout.tsx` (QueryClientProvider → SessionProvider)
- Authenticated shell: `app/(tabs)/_layout.tsx` (resolves session + couple space)
- Couple space hook: `src/features/couple-space/use-current-couple-space.ts`
  (returns `couple_members` row joined with `couple_spaces`; space id at
  `data.couple_space_id`)
- Logging: `src/lib/utils/log.ts` (`logError(scope, error)`)

## Query keys to invalidate on realtime events
- `["memories", spaceId, typeFilter]` (timeline lists) — covered by prefix `["memories"]`
- `["memories", "detail", memoryId]` (detail) — covered by prefix `["memories"]`
- `["search", spaceId, q]` — invalidate `["search"]`
- `["space-tags", spaceId]` — invalidate `["space-tags"]`

Mirror the existing mutation invalidation set (`use-create-memory.ts`,
`use-update-memory.ts`): `["memories"]`, `["search"]`, `["space-tags"]`.

## Schema facts (verified)
- `memories` has `couple_space_id` → server-side channel filter `couple_space_id=eq.<id>` works.
- `memory_reactions` has only `id, memory_id, user_id, type, created_at` — **no**
  `couple_space_id`. Cannot filter reactions server-side by couple space. Subscribe
  without a couple filter; RLS scopes what the client can read on refetch, and any
  reaction event simply invalidates `["memories"]`. Acceptable for a two-person app.

## Sub-phases
### 8.1 — Subscribe + invalidate (one module)
`src/features/realtime/use-realtime-sync.ts` + `index.ts` barrel.
- `useRealtimeSync(coupleSpaceId: string | undefined)`.
- When `coupleSpaceId` present, open ONE channel (e.g. `realtime:space:<id>`):
  - `postgres_changes` `*` on `public.memories` filter `couple_space_id=eq.<id>` → invalidate memories/search/space-tags.
  - `postgres_changes` `*` on `public.memory_reactions` (no filter) → invalidate `["memories"]`.
- Use `invalidateQueries` (not manual cache replacement) so it composes with the
  optimistic reaction updates in `use-toggle-reaction.ts` and TanStack dedupes refetches.
- Cleanup: `supabase.removeChannel(channel)` in the effect cleanup; re-subscribe when
  `coupleSpaceId` changes. Effect deps: `[coupleSpaceId, queryClient]`.
- No-op when `coupleSpaceId` is undefined.

### 8.2 — Partner sync wiring
Mount `useRealtimeSync(coupleSpaceId)` in `app/(tabs)/_layout.tsx` — the only
authenticated surface that has resolved both session and couple space. Call the hook
unconditionally (rules of hooks); pass `coupleSpaceData?.couple_space_id` so it is a
no-op until the space resolves and tears down on logout/redirect.

## Non-goals (per architecture doc)
No presence, typing indicators, live cursors, or chat semantics.
