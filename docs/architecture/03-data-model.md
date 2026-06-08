# Data Model

## Core Tables

Daemi uses a relational Postgres model.

Required tables:

```txt
profiles
couple_spaces
couple_members
memories
collections
memory_reactions
```

## profiles

Represents an authenticated app user.

```ts
Profile {
  id: uuid
  display_name: string | null
  avatar_url: string | null
  created_at: timestamptz
  updated_at: timestamptz
}
```

## couple_spaces

Represents one private shared scrapbook.

```ts
CoupleSpace {
  id: uuid
  name: string | null
  invite_code: string
  created_by_user_id: uuid
  created_at: timestamptz
  updated_at: timestamptz
}
```

## couple_members

Joins users to couple spaces.

```ts
CoupleMember {
  id: uuid
  couple_space_id: uuid
  user_id: uuid
  role: 'owner' | 'member'
  joined_at: timestamptz
}
```

## memories

Central domain entity.

```ts
Memory {
  id: uuid
  couple_space_id: uuid
  type: 'photo' | 'video' | 'letter' | 'ticket'
  title: string | null
  body: string | null
  media_url: string | null         // legacy Supabase Storage URL (deprecated)
  storage_key: string | null       // R2 object path for the original media
  thumbnail_url: string | null     // poster/thumbnail (photo, video, ticket)
  duration_seconds: int | null     // video only
  media_size_bytes: bigint | null  // video/photo; drives single-PUT vs multipart routing
  media_mime: string | null        // e.g. 'video/mp4'
  date_happened: date
  place_name: string | null
  tags: string[]
  collection_id: uuid | null
  created_by_user_id: uuid
  deleted_at: timestamptz | null
  created_at: timestamptz
  updated_at: timestamptz
}
```

`storage_key` was added in Phase 4 (R2 migration) but is not reflected above historically; `duration_seconds`, `media_size_bytes`, and `media_mime` are added in Phase 10 for video. All are nullable and only populated for the relevant types.

## collections

Optional organization layer.

```ts
Collection {
  id: uuid
  couple_space_id: uuid
  name: string
  type: 'trip' | 'anniversary' | 'custom'
  start_date: date | null
  end_date: date | null
  description: string | null
  created_by_user_id: uuid
  created_at: timestamptz
  updated_at: timestamptz
}
```

## memory_reactions

For heart reactions.

```ts
MemoryReaction {
  id: uuid
  memory_id: uuid
  user_id: uuid
  type: 'heart'
  created_at: timestamptz
}
```

## Important Decisions

- Use `created_by_user_id`, not `'A' | 'B'`.
- Use soft delete for memories.
- Store `place_name` as text for MVP.
- Do not create a `places` table yet.
- Tags are stored as lowercase string array in MVP.
- Collection is optional.
- A memory belongs to at most one collection.
- Video is stored in R2 only (no external links/embeds). `storage_key` points at the original; playback streams from a presigned GET via `expo-video`.
- Video length is unbounded; files over the single-PUT ceiling (~5 GB) upload via S3 multipart (see `06-media-storage.md`). `media_size_bytes` is used client-side to choose the upload path.
