# Offline Queue Architecture

## MVP Status

Offline queue is deferred.

MVP should only handle:

- upload loading state
- upload error state
- retry button if upload fails before navigation

## Later Offline Goals

If user creates a memory offline:

- save local queued draft
- show queued card on timeline
- retry when online
- preserve queue across app restart

## Storage Options

MVP:

- AsyncStorage for simple failed drafts

Later:

- Expo SQLite for durable local queue

## Queued Memory Shape

```ts
QueuedMemory {
  localId: string
  coupleSpaceId: string
  type: MemoryType
  title?: string
  body?: string
  localMediaUri?: string
  dateHappened: string
  placeName?: string
  tags: string[]
  createdAt: string
  status: 'queued' | 'uploading' | 'failed'
  error?: string
}
```

## Retry Flow

1. Detect network online.
2. Upload local media if present.
3. Insert memory row.
4. Remove queued draft.
5. Invalidate timeline query.
