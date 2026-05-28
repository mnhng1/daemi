# Routing Architecture

## Router

Use Expo Router.

## Route Structure

```txt
app/
  _layout.tsx

  (auth)/
    sign-in.tsx
    sign-up.tsx

  onboarding/
    index.tsx
    create-space.tsx
    join-space.tsx

  (tabs)/
    _layout.tsx
    timeline/
      index.tsx
    collections/
      index.tsx
      [id].tsx
    add/
      index.tsx
    search/
      index.tsx

  memory/
    [id].tsx
```

## Navigation Rules

- Unauthenticated users go to auth.
- Authenticated users with no couple space go to onboarding.
- Authenticated users with couple space go to timeline.
- Add tab opens add sheet/type picker.
- Memory cards navigate to `/memory/[id]`.

## Bottom Tabs

```txt
Timeline
Trips
Add
Find
```

The Add tab is the single entry point for memory creation.
