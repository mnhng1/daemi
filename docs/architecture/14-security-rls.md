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

Media files should be private.

Recommended:

- use signed URLs
- enforce storage path includes couple space ID
- validate access through backend policies or signed URL generation
