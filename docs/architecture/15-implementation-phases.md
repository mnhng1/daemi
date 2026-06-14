# Implementation Phases

## Phase 0 — Foundation

- Create Expo app
- Add TypeScript
- Add Expo Router
- Add NativeWind
- Add Supabase client
- Add TanStack Query
- Add Zustand
- Add base theme tokens
- Add empty tab routes

## Phase 1 — Database and Auth

- Supabase schema
- RLS policies
- Auth screens
- Session provider
- Profile creation

## Phase 2 — Couple Space

- Create couple space
- Join via invite code
- Current couple space hook
- Route guards

## Phase 3 — Timeline Day View

- Fetch memories
- Group by date
- Render timeline
- Add empty state
- Add type filters

## Phase 4 — Photo Memories

- Add Memory sheet
- Photo composer
- Image picker
- Storage upload
- Insert memory
- Timeline refresh

## Phase 5 — Letter Memories

- Letter composer
- Letter card
- Letter detail
- Save letter memory

## Phase 6 — Memory Detail and Actions

- Detail route
- Photo detail
- Letter detail
- Heart reaction
- Edit
- Soft delete

## Phase 7 — Search and Tags

- Search screen
- Tag suggestions
- Filter by tag
- Basic results list

## Phase 8 — Realtime

- Subscribe to memory changes
- Invalidate query cache
- Realtime partner sync

## Phase 9 — Collections

- Collections list
- Collection detail
- Create collection
- Add memory to collection (either partner; see `10-collections.md` Authorization)

## Phase 10 — Video and Ticket

Split into two sub-phases, managed by a single orchestrator. 10A ships the full
four-type experience for normal-sized media; 10B adds unbounded/heavy video.

### Phase 10A — Ticket + Video (baseline)

- Data migration: `duration_seconds`, `media_size_bytes`, `media_mime`
- Un-gate the video + ticket cards in the type picker
- Ticket composer + ticket card + ticket detail
- Video composer (pick clip) for ≤ ~5 GB via single-PUT R2 upload
- Client-side poster-frame extraction → thumbnail
- Video card (poster + duration badge + play glyph) and detail
- Embedded playback via `expo-video` from presigned GET
- Widen `MemoryTypeFilter` and the type-picker `onSelect` to all four types

### Phase 10B — Heavy / unbounded video (merges Phase 12) — implemented, pending ship

Built on top of Phase 11. Status: code-complete on `main`; pending ship items below.

- S3 multipart actions in `media-presign` (create/sign-part/complete/abort) ✅
- Resumable multipart upload client (part tracking, retry failed part) ✅ `src/features/media/upload-multipart.ts`
- Durable Expo SQLite upload queue (survives restart) + retry ✅ `src/features/queue/`
- Queued / uploading cards on the timeline ✅ `queued-memory-card.tsx`
- Places integration: the queue carries `place_name`/`latitude`/`longitude`, so a
  location picked on a heavy video is persisted by the queue processor on the
  deferred memory insert (not just the synchronous Phase 11 path).
- **Pending ship:** native background-upload task (requires an EAS dev build),
  R2 `AbortIncompleteMultipartUpload` lifecycle rule, on-device verification.
- Original risk (resumable S3-multipart in a background native task; R2 is
  S3-multipart, not TUS) was de-risked during the build.

## Phase 11 — Places Lens + coordinates — complete

- Google Places (New) autocomplete picker via the `places-search` edge function
- `LocationPicker` wired into the photo / video / ticket composers + memory edit
- Lat/lng captured on create/edit; `latitude`/`longitude` columns on `memories`
- Derived `/places` lens via `list_space_places(space_id)` RPC (name + count)
- Per-place detail route `app/places/[name].tsx`

### Phase 11B — Places map — code-complete, pending dev-build verification

- `react-native-maps` map with list/map toggle (`places-map.tsx`); Apple Maps on
  iOS needs no API key. iOS only — Android not targeted.

## Phase 12 — Offline Queue — complete, pending dev-build verification

All six steps implemented on `main`. Requires an EAS dev-build before on-device
testing (`@react-native-community/netinfo` native module).

- NetInfo connectivity module + `onlineManager` wiring (`src/features/network/`)
- Queue processor generalised: photo / letter / ticket drain correctly; drain lock;
  idempotent upsert; `triggerDrain` export
- `useCreateMemory` offline fast-path + mid-flight network-error fallback → `enqueueDraft`
- Queued card per-type rendering (letter placeholder, indeterminate spinner for non-video)
- `OfflineBanner` on the timeline (warm-yellow, count, Retry)
- Failed → retry / delete; never-uploaded draft → outright delete

## Phase 13 — Timeline Zoom and Motion — code-complete, pending dev-build verification

- Month view (`TimelineMonthView` — week-bucket SectionList with trip markers and anniversary ring)
- Year view (`TimelineYearView` — month grid with colored density segments per memory type)
- Segmented zoom bar (`TimelineZoomBar` — year / month / day pill control with pinch hint)
- Pinch gesture (discrete snap via `Gesture.Pinch` + `runOnJS`; functional setState avoids stale-closure bug)
- `FadeIn` motion on zoom switch via `Animated.View key={zoom}` (suppressed under reduce-motion)
- Anniversary month wired from `useAnniversaryMonth(spaceId)` into both aggregate views
- Type filter scoped to day view only; month/year always aggregate all types for correct density data
