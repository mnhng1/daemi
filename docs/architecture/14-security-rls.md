# Security and RLS Architecture

## Security Principle

Every row belongs to a couple space.

Users can only access data for couple spaces where they are members.

## Tables Requiring RLS

```txt
profiles
couple_spaces
couple_members
memories
collections
memory_reactions
```

## Core RLS Rule

A user can read a row if:

```sql
exists (
  select 1
  from couple_members
  where couple_members.couple_space_id = row.couple_space_id
  and couple_members.user_id = auth.uid()
)
```

## Memory Rules

Users can:

- read memories in their couple space
- create memories in their couple space
- update memories they created
- soft delete memories they created

Optional later:

- allow both partners to edit any memory in their couple space

## Reaction Rules

Users can:

- read reactions in their couple space
- create one heart reaction per memory
- delete their own reaction

## Storage Security

Media files are private. R2 bucket has no public access.

Access control is enforced by the `media-presign` Supabase Edge Function:

- Verifies Supabase JWT (authentication)
- Queries `couple_members` to confirm user belongs to the couple space (authorization)
- Returns short-lived presigned URLs (10 min upload, 1 hour download)
- R2 API credentials stored as Edge Function secrets, never exposed to client

Storage path convention (`couple-spaces/{coupleSpaceId}/...`) embeds the couple space ID for auditability.

Legacy: Phase 4 MVP uses Supabase Storage RLS policies on `storage.objects` with `is_couple_space_member()`. These are replaced by Edge Function auth after R2 migration.
