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

### Phase 10B — Heavy / unbounded video (merges Phase 12)

- S3 multipart actions in `media-presign` (create/sign-part/complete/abort)
- Resumable multipart upload client (part tracking, retry failed part)
- Native background-upload module (requires an EAS dev build)
- Durable Expo SQLite upload queue (survives restart) + retry
- Queued / uploading cards on the timeline
- **Spike first:** resumable S3-multipart inside a background native task on RN
  is the main risk (R2 is S3-multipart, not TUS; off-the-shelf libs don't
  orchestrate per-part background uploads). De-risk before full build.

## Phase 11 — Places Lens

- Derived place list
- Place-filtered results

## Phase 12 — Offline Queue

Largely absorbed into Phase 10B (the durable queue + resume + queued cards are
built there for heavy video). What remains here is offline-specific:

- Detect offline create and persist a local draft
- Retry queued non-video memories when back online
- (Queue store, retry, and queued-card UX are shared with 10B)

## Phase 13 — Timeline Zoom and Motion

- Month view
- Year view
- Segmented zoom
- Optional pinch gesture
- Animation polish
