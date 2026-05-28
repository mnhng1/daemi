# Collections Architecture

## Collection Purpose

Collections are optional groupings for memories.

Examples:

- trips
- anniversaries
- custom scrapbook sections

## MVP Status

Collections are deferred from MVP 0.1.

They should be added after:

- timeline works
- memory creation works
- memory detail works
- search/tags work

## Data Model

```ts
Collection {
  id: string
  couple_space_id: string
  name: string
  type: 'trip' | 'anniversary' | 'custom'
  start_date: string | null
  end_date: string | null
  description: string | null
}
```

## Rules

- A memory may belong to zero or one collection.
- Collections are couple-space scoped.
- Collection cover image can be derived from first photo memory.
- Collection memory count should be derived, not manually stored.

## Screens

```txt
CollectionsListScreen
CollectionDetailScreen
CreateCollectionSheet
CollectionPickerSheet
```
