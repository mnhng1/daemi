# Memory Domain Architecture

## Memory Types

Supported by the long-term product:

```ts
type MemoryType = 'photo' | 'video' | 'letter' | 'ticket';
```

MVP enabled types:

```ts
'photo' | 'letter'
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
title = caption
body = optional note
media_url = video URL
thumbnail_url = video poster thumbnail
```

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
- max duration later

Ticket:

- title required
- date_happened required

## Hooks

```ts
useMemories(filters)
useMemory(id)
useCreateMemory()
useUpdateMemory()
useDeleteMemory()
useToggleMemoryReaction()
```
