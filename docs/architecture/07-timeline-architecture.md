# Timeline Architecture

## Timeline Goal

The timeline is the emotional home of the product.

It should feel like a scrapbook, not a feed or dashboard.

## MVP Timeline

MVP implements day view only.

Features:

- grouped by `date_happened`
- most recent first
- memory cards rendered by type
- empty state
- type filters

## Data Query

Fetch memories by:

```sql
couple_space_id = currentCoupleSpaceId
deleted_at is null
order by date_happened desc, created_at desc
```

## Grouping

Client groups memories by date:

```ts
Record<string, Memory[]>
```

## Timeline Components

```txt
TimelineScreen
TimelineHeader
TimelineTypeFilters
TimelineDateGroup
TimelineRow
TimelineSpine
TimelineNode
MemoryCard
```

## Future Zoom Levels

Later timeline supports:

```txt
day
month
year
```

Do not implement pinch zoom in MVP.

Segmented control can come before pinch gesture.

## Empty State

Copy:

```txt
your scrapbook starts here.
```

CTA:

```txt
+ add first memory
```
