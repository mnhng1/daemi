# Memory Domain Architecture

## Memory Types

Supported by the long-term product:

```ts
type MemoryType = 'photo' | 'video' | 'letter' | 'ticket';
```

MVP enabled types (Phases 4–5):

```ts
'photo' | 'letter'
```

Phase 10 enables the remaining two:

```ts
'video' | 'ticket'
```

## Shared Memory Fields

All memory types share:

- date happened
- title
- body
- media URL
- place name
- tags
- collection ID
- created by user
- timestamps

## Type-Specific Meaning

### Photo

```txt
title = caption
body = optional note
media_url = image URL
thumbnail_url = image thumbnail URL if available
```

### Letter

```txt
title = optional letter title
body = full letter content
media_url = null
thumbnail_url = null
```

### Video

```txt
title            = caption
body             = optional note
storage_key      = R2 object path for the original video (no external links/embeds)
thumbnail_url    = poster frame
duration_seconds = clip length
media_size_bytes = original file size (selects upload path)
media_mime       = e.g. 'video/mp4'
```

Video is **R2-only**: no YouTube/Vimeo/external references. Playback is embedded
in-app via `expo-video`, streaming from a short-lived presigned R2 GET URL
(private bucket, HTTP range requests → progressive playback, no full download).

Length is **unbounded**. Upload path is chosen by file size:

- **≤ ~5 GB** — single presigned PUT (extends the existing photo upload path).
- **> ~5 GB** — S3 multipart upload (required; R2 rejects single PUT above the
  limit). Resumable, runs in a durable background queue. See `06-media-storage.md`
  and `12-offline-queue.md`.

### Ticket

```txt
title = event / place / what
body = note or reflection
media_url = ticket scan/photo
thumbnail_url = ticket thumbnail
```

## Memory Creation Flow

1. User opens Add Memory sheet.
2. User selects type.
3. App renders type-specific composer.
4. User fills required fields.
5. Media uploads first if needed.
6. App inserts memory row.
7. Timeline invalidates/refetches.
8. User sees saved memory on timeline.

## Validation

Photo:

- media required
- date_happened required

Letter:

- body required
- date_happened required

Video:

- media required
- date_happened required
- no max duration (unbounded length)

Ticket:

- title required
- date_happened required
- media optional (stub photo/scan is optional)

## Hooks

```ts
useMemories(filters)
useMemory(id)
useCreateMemory()
useUpdateMemory()
useDeleteMemory()
useToggleMemoryReaction()
```
