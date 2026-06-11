# Search, Tags, and Places Architecture

## Search Goal

Help users rediscover memories without building heavy organization in MVP.

## MVP Search

Search over:

- title
- body
- place_name
- tags

## Query Types

Supported in MVP:

```txt
plain text
#tag
```

Later:

```txt
place:Lucia's
type:photo
collection:NYC
```

## Tags

Tags are stored as lowercase tokens.

Rules:

- lowercase
- trim whitespace
- remove duplicates
- max 5 per memory in UI
- database can store more but UI should guide toward fewer

## Places

Places are metadata only.

MVP:

- plain text `place_name`

Later:

- autocomplete provider
- static map preview
- recent places
- derived Places browse lens

## Places Browse

Derived from memories — no `places` table. Exposed as the `list_space_places(space_id)`
RPC (security definer + member guard + soft-delete filter), consumed by the `/places`
lens via `useSpacePlaces`:

```sql
select place_name, count(*)
from memories
where couple_space_id = ?
  and deleted_at is null
  and place_name is not null and place_name <> ''
group by place_name
order by count(*) desc, place_name asc
```

Coordinates: `memories.latitude` / `memories.longitude` are captured by the Google
Places picker (Phase 11) and drive the Places map (Phase 11B). Null for free-text /
legacy `place_name`. A location picked on a heavy video is carried through the upload
queue so it survives the deferred insert (see Phase 10B).
