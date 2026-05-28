# App Architecture

## High-Level Structure

The app is organized around product domains rather than technical layers only.

Recommended structure:

```txt
src/
  app/
    _layout.tsx
    index.tsx
    (auth)/
    (tabs)/
      timeline/
      collections/
      add/
      search/
    memory/
      [id].tsx

  components/
    ui/
    memory/
    timeline/
    forms/
    sheets/

  features/
    auth/
    couple-space/
    memories/
    collections/
    search/
    media/
    realtime/
    offline/

  lib/
    supabase/
    query/
    theme/
    utils/

  types/
    database.ts
    memory.ts
    collection.ts
```

## Architectural Boundaries

### `features/auth`

Responsible for:

- sign in
- sign up
- session state
- auth redirect behavior

### `features/couple-space`

Responsible for:

- current couple space lookup
- create couple space
- join with invite code
- expose `useCurrentCoupleSpace`

### `features/memories`

Responsible for:

- CRUD for memories
- memory type contracts
- memory cards
- memory detail rendering
- memory validation

### `features/media`

Responsible for:

- image picker
- video picker
- upload to Supabase Storage
- future thumbnail generation

### `features/search`

Responsible for:

- basic query search
- tag search
- place filtering

### `features/realtime`

Responsible for:

- subscribing to memory changes
- invalidating TanStack Query cache
- future live partner sync

## Rule

UI components should not directly know Supabase query details. They should call feature hooks such as:

```ts
useMemories()
useCreateMemory()
useMemory(id)
useCurrentCoupleSpace()
```
