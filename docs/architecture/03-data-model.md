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
  media_url: string | null
  thumbnail_url: string | null
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
