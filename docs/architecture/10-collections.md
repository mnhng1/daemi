# Collections Architecture

## Collection Purpose

Collections are optional groupings for memories.

Examples:

- trips
- anniversaries
- custom scrapbook sections

## MVP Status

Implemented in Phase 9 (after timeline, memory creation, memory detail, and search/tags).

Screens shipped: list (`app/(tabs)/collections/index.tsx`), detail
(`app/collections/[id].tsx`), create sheet, and the picker sheet wired into both
memory detail views. Feature hooks live in `src/features/collections/`.

## Data Model

```ts
Collection {
  id: string
  couple_space_id: string
  name: string
  type: 'trip' | 'anniversary' | 'custom'
  start_date: string | null
  end_date: string | null
  description: string | null
}
```

## Rules

- A memory may belong to zero or one collection.
- Collections are couple-space scoped.
- Collection cover image can be derived from first photo memory.
- Collection memory count should be derived, not manually stored.

## Authorization

- Either partner may create a collection in their space.
- Either partner may set/clear the collection of **any** memory in the space — not
  just memories they authored. Memory content edits and soft-deletes remain
  **author-only** (the `memories_update` RLS policy is member-AND-creator).
- Because `memories_update` is author-only, the collection assignment goes through a
  narrow `SECURITY DEFINER` RPC `set_memory_collection(p_memory_id, p_collection_id)`
  (migration `20250605000000`). It writes only `collection_id`, is guarded by
  `is_couple_space_member`, blocks cross-space collection assignment, and is granted to
  `authenticated` only (revoked from `public`/`anon`). Client: `useSetMemoryCollection`.

## Screens

```txt
CollectionsListScreen
CollectionDetailScreen
CreateCollectionSheet
CollectionPickerSheet
```
