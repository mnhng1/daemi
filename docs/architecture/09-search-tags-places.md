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

Derived from memories:

```sql
select place_name, count(*)
from memories
where couple_space_id = ?
and place_name is not null
group by place_name
```

No `places` table in MVP.
