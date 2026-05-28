# Realtime Sync Architecture

## Goal

When one partner adds or edits a memory, the other partner should see it without manual refresh.

## Provider

Use Supabase Realtime.

## MVP Realtime Scope

Subscribe to changes on:

```txt
memories
memory_reactions
collections later
```

## Behavior

When a memory insert/update/delete event is received:

1. Verify event belongs to current couple space.
2. Invalidate relevant TanStack Query keys.
3. Refetch timeline/detail/search as needed.

## Query Keys

```ts
['memories', coupleSpaceId]
['memory', memoryId]
['search', coupleSpaceId, query]
['collections', coupleSpaceId]
```

## Do Not Overbuild

Realtime does not need:

- live cursors
- typing indicators
- presence
- chat semantics

Daemi is not a chat app.
