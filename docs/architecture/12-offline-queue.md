# Offline Queue Architecture

## MVP Status

Offline queue is deferred.

MVP should only handle:

- upload loading state
- upload error state
- retry button if upload fails before navigation

## Merge with Heavy Video Upload (Phase 10B)

The durable queue is built in Phase 10B because heavy video (multipart, possibly
multi-hour) needs the same machinery the offline queue would: a restart-surviving
local store, resume, and queued/uploading cards on the timeline. The two are
implemented together rather than as separate efforts.

Heavy-upload-specific additions to the queue shape below:

- `uploadId` — R2 multipart upload ID
- `parts[]` — `{ partNumber, etag, status }` so resume re-signs only failed parts
- `bytesUploaded` / `bytesTotal` — for per-file progress
- background execution via a native upload module (requires an EAS dev build) so
  uploads continue when the app is locked/backgrounded

## Later Offline Goals

If user creates a memory offline:

- save local queued draft
- show queued card on timeline
- retry when online
- preserve queue across app restart

## Storage Options

MVP:

- AsyncStorage for simple failed drafts

Phase 10B / Later:

- Expo SQLite for the durable local queue (required for multipart part-tracking
  and resume across app restarts)

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
