# Phase 12 — Offline Queue: Implementation Plan

> Companion to [`12-offline-queue.md`](12-offline-queue.md) (the spec). This is the
> concrete build plan for the remaining offline-specific work. The durable queue,
> resume, and queued-card UX already exist from Phase 10B (heavy video); Phase 12
> generalizes that machinery to **all** memory types and wires in real
> connectivity detection.

## Goal

When a partner creates a memory while offline (or the upload fails for network
reasons), the memory is persisted as a local queued draft, shown on the timeline
as a queued card, and automatically uploaded + inserted when connectivity
returns — surviving app restart. This must work for **photo, letter, and ticket**
memories (heavy video already queues via Phase 10B; normal-size video uploads
inline).

## Current State (verified)

What already exists and is reusable:

- **Durable SQLite queue** — `src/features/queue/db.ts`. Table `upload_queue` in
  `daemi-queue.db` already carries every field needed for any memory type
  (`type`, `title`, `body`, `local_media_uri`, `poster_uri`, `thumbnail_key`,
  `mime_type`, `date_happened`, `tags`, `place_name`, `latitude`, `longitude`,
  `status`, `retry_count`, plus multipart fields). **No schema migration needed.**
- **Queue processor** — `src/features/queue/queue-processor.ts`.
  `startQueueProcessor(spaceId, userId)` is booted once from
  `app/_layout.tsx:32` (`QueueBoot`). It drains on launch and re-drains on
  `AppState` → `active`, and resets stuck `uploading` rows.
- **Queue hook + merge** — `useUploadQueue` (`use-upload-queue.ts`) +
  `useMemoriesWithQueue` (`use-memories-with-queue.ts`) already prepend queued
  items onto the timeline. Refresh is driven by a module-level
  `refreshQueue()` listener registry + a 2s poll while any row is `uploading`.
- **Queued card** — `src/components/memory/queued-memory-card.tsx`, dispatched by
  `memory-card.tsx:82` via `isQueuedMemory()`.
- **Inline upload** — `src/features/media/upload-memory-image.ts` (single-PUT,
  abortable, exponential-backoff retry on `status 0`).

### Gaps Phase 12 must close

1. **No connectivity detection.** `@react-native-community/netinfo` is **not
   installed**; nothing anywhere knows online/offline state.
2. **`processRow` only handles video.** `queue-processor.ts:111` is a single
   `if (type === 'video' …)` branch. A queued `photo`/`letter`/`ticket` row would
   be flipped to `uploading` and then fall through with no insert and no delete —
   it stays `uploading` forever (reset to `queued` on next launch → silent
   infinite loop). Non-video types must be handled.
3. **Offline create is not routed to the queue.** `useCreateMemory`
   (`use-create-memory.ts`) does the upload + insert inline for photo/letter/
   ticket/normal-video. When offline these **throw** and the create fails; nothing
   is persisted.
4. **No reconnect trigger.** The processor drains only on launch and on
   `AppState` active. A device that regains connectivity while the app is
   foregrounded never re-drains.
5. **`QueuedMemory` type excludes `letter`** (`use-upload-queue.ts:13`) and the
   queued card is video-centric (assumes a poster image; copy says "The video
   upload will be cancelled").
6. **No offline banner.** DESIGN §6.7 calls for a yellow banner with retry + queue
   count, and desaturated "queued" cards.

## Design Decisions

- **Library: `@react-native-community/netinfo`.** It's the de-facto Expo-supported
  connectivity API, exposes `isConnected` + `isInternetReachable` + an event
  subscription. `expo-network` is also absent and lacks a reliable change event.
  TanStack Query's `onlineManager` is available (RQ 5.100) but in React Native it
  **still needs NetInfo as its event source** — so NetInfo is required regardless.
  **Decision:** add NetInfo and wire it *into* `onlineManager`
  (`onlineManager.setEventListener`) so query retries benefit too, and expose the
  same subscription to the queue processor — rather than a fully parallel
  hand-rolled subscription.
- **Enqueue strategy: up-front check *plus* an error fallback (revised per audit).**
  In `useCreateMemory`, check connectivity up front (`getIsOnline()`); if offline,
  write a queued row for all types and return `{ _queued: true }` (mirroring
  `use-create-memory.ts:139`). **But** the up-front check alone misses
  *online→offline mid-upload*: if the inline upload starts online and the
  connection drops, the inline path exhausts its retries and throws, and today the
  composer's `onError` (`add/index.tsx:160` etc.) only clears progress — the memory
  is lost. So the inline path must **also** catch network-class errors and enqueue
  as a fallback before surfacing failure. Net: up-front check handles "offline at
  start"; the catch handles "dropped mid-flight". `memoryId` is pre-generated in
  both paths, so neither double-inserts.
- **Drain immediately after enqueue (audit fix #2).** `startQueueProcessor` runs
  once at boot; a row enqueued afterward otherwise waits for the next
  AppState-active/relaunch. Both the offline-create path and the existing
  heavy-video path must call a `triggerDrain()` after `insertQueueRow` when online.
- **Single drain lock (audit fix #1).** `drainQueue` currently has **no mutex**;
  with launch + AppState triggers two concurrent drains can already double-pick a
  `queued` row before it flips to `uploading`. Adding a 3rd (reconnect) trigger
  makes double-upload/double-insert likely. Add a module-level `_draining` guard so
  only one drain runs at a time; later triggers no-op (or set a "rerun" flag).
- **Generalize, don't fork, the processor.** Extend `processRow` with per-type
  branches sharing the existing status/retry/insert/delete scaffolding.
- **Idempotent inserts everywhere (audit fix #4).** Use
  `.upsert(buildMemoryInsert(row, key), { onConflict: 'id', ignoreDuplicates: true })`
  in **all** processor branches — including replacing the existing video
  `.insert()` at `queue-processor.ts:130` — so a retry after "upload OK, insert
  failed" cannot duplicate the memory. RLS already permits this insert.

## Prerequisites

- **EAS dev-build rebuild (audit #5).** `@react-native-community/netinfo` is a
  native module — adding it requires a new dev client build before the offline
  path can be exercised on-device. This is the same gate already blocking the
  10B background-upload task and 11B map verification; batch the rebuild with them.

## Implementation Steps

### Step 1 — Connectivity module
- Add dep `@react-native-community/netinfo` (Expo-compatible; rebuild dev client).
- New `src/features/network/use-online-status.ts`:
  - `useOnlineStatus(): boolean` — subscribes to `NetInfo.addEventListener`,
    returns `state.isConnected && state.isInternetReachable !== false`.
  - `getIsOnline(): Promise<boolean>` — one-shot `NetInfo.fetch()` for use inside
    the create mutation (non-hook context).
  - A module-level subscription that calls a registered "came online" callback
    (debounced) — consumed by the processor (`triggerDrain`).
- Wire the same NetInfo state into TanStack Query:
  `onlineManager.setEventListener(setOnline => NetInfo.addEventListener(...))` in
  the query client setup, so RQ pauses/resumes its own retries with connectivity
  (free win, single source of truth).
- Export via `src/features/network/index.ts`.

### Step 2 — Generalize the queue processor (`queue-processor.ts`)
- **Add a drain lock first (audit #1).** Introduce a module-level
  `let _draining = false`; `drainQueue` returns early if already draining and sets
  a `_rerun` flag so a trigger that arrives mid-drain causes exactly one more pass.
  This must land *before* the reconnect trigger is added.
- Refactor `processRow` into a `switch (type)`:
  - **`video`** — existing multipart path, but swap the `.insert()` at
    `queue-processor.ts:130` for the shared idempotent upsert (audit #4).
  - **`photo` / `ticket`** — if `localMediaUri` present, `await uploadMemoryImage(...)`
    (single-PUT, already abortable + retrying) to get `storageKey`; ticket may
    have no media (note-only) → `storageKey = null`. Then insert.
  - **`letter`** — no upload; insert directly from row fields.
- Extract `buildMemoryInsert(row, storageKey)` (generalizing the video insert at
  `queue-processor.ts:130`) used by all branches via
  `.upsert(..., { onConflict: 'id', ignoreDuplicates: true })` (audit #4).
- Register the non-video single-PUT handle in `_activeHandles` too, so the queued
  card's cancel/abort works for photo/ticket, not just video.
- On success: `deleteQueueRow` + `refreshQueue` + `_onComplete` (unchanged).
- Export a `triggerDrain()` (audit #2) that the create path calls after enqueue.
- Register `triggerDrain` as the network "came online" callback from Step 1
  (inside `startQueueProcessor`), so regaining connectivity foreground re-drains.
  Keep the existing `AppState` + launch triggers. All three now funnel through the
  drain lock.

### Step 3 — Route offline creates into the queue (`use-create-memory.ts`)
- Extract an `enqueueDraft(input, memoryId)` helper that writes a `status:'queued'`
  row for any type (photo/letter/ticket/normal-video), then `refreshQueue()` +
  `triggerDrain()` (audit #2), and returns `{ id: memoryId, type, _queued: true }`.
  - For photo/ticket, persist `localMediaUri` + `mimeType` so the processor can
    upload later. For photo, also set `posterUri = imageUri` so the queued card
    has a thumbnail. Letters carry only text fields.
- At the top of `mutationFn`, `const online = await getIsOnline();` — if `!online`,
  return `enqueueDraft(...)` immediately.
- If `online`, keep the existing inline path **but wrap the upload+insert in a
  try/catch** (audit #3): on a network-class error (the `status 0` / "network
  error" / timeout signatures already classified in `upload-memory-image.ts:42-49`),
  fall back to `enqueueDraft(...)` instead of rethrowing, so an online→offline
  drop mid-upload is not lost. Non-network errors still throw.
- Leave the existing >4.5 GB heavy-video queue branch (`use-create-memory.ts:95`)
  intact, but route it through the same `enqueueDraft` helper so it also gets the
  post-enqueue `triggerDrain()`.
- Composer (`app/(tabs)/add/index.tsx`) already navigates away on success via
  `onSuccess: resetForm` → `router.replace` (confirmed `add/index.tsx:128,160`);
  the `_queued` sentinel returns without throwing, so it is treated as success.
  No composer change required for the offline path.

### Step 4 — Queue type + card generalization
- `use-upload-queue.ts`: widen `QueuedMemory.type` to include `'letter'`; map all
  four types.
- `queued-memory-card.tsx`: render per type — letter shows a paper/letter
  placeholder with the body snippet (no poster); photo/ticket show the local
  image; copy becomes generic ("This upload will be cancelled / removed"). Apply
  a desaturated/"queued" treatment per DESIGN §6.7.
  - **Progress UX (audit #6):** non-video single-PUT uploads don't track bytes
    (`uploadMemoryImage` reports percent, not byte counts, so `bytes_total`
    stays 0). Show an indeterminate spinner / "Queued" label for non-video rows
    instead of the 0%-stuck byte progress bar; keep the byte bar only for video.

### Step 5 — Offline banner
- New `src/components/system/offline-banner.tsx`: subscribes to
  `useOnlineStatus()` + `useUploadQueue()` count. Shows a warm-yellow
  (`colors.highlight`) banner "You're offline — N memories will sync when you're
  back" with a manual **Retry** that calls `refreshQueue()`/triggers a drain.
- Mount it in the timeline screen (`app/(tabs)/timeline/index.tsx`) above the
  list (and optionally globally in `_layout.tsx`).

### Step 6 — Edge cases & polish
- **Cancel offline draft** — queued card cancel path already sets `status:'failed'`;
  for a never-uploaded offline draft, allow outright delete (`deleteQueueRow`).
- **Failed → manual retry** — banner/card retry resets `retry_count`/`status` to
  `queued` and triggers a drain.
- **Auth/space guard** — processor already filters by `userId`; ensure offline
  rows created before space resolves are not orphaned.
- **No duplicate timeline entry** — after a queued row inserts and is deleted, the
  realtime/`invalidateQueries(['memories'])` refresh shows the real row; confirm
  no flash of both (queued list is keyed by `localId`, real by `id`).

## Files Touched

| File | Change |
|---|---|
| `package.json` | add `@react-native-community/netinfo` |
| `src/features/network/use-online-status.ts` | **new** — connectivity hook + one-shot + came-online callback |
| `src/features/network/index.ts` | **new** — barrel |
| `src/features/queue/queue-processor.ts` | generalize `processRow` to all types; register reconnect drain |
| `src/features/queue/use-upload-queue.ts` | widen `QueuedMemory.type` to include `letter` |
| `src/features/memories/use-create-memory.ts` | offline branch → enqueue all types |
| `src/components/memory/queued-memory-card.tsx` | per-type rendering + generic copy + queued styling |
| `src/components/system/offline-banner.tsx` | **new** — offline + queue-count banner |
| `app/(tabs)/timeline/index.tsx` | mount banner |
| `docs/architecture/12-offline-queue.md` | flip status to "in progress / Phase 12" |
| `docs/architecture/15-implementation-phases.md` | update Phase 12 status |

No SQLite migration and no edge-function changes are required.

## Sequencing / Independent ship units

Steps can land as separate PRs, lowest-risk first:

1. **Step 2 alone** (generalize `processRow` + drain lock + idempotent upsert) is
   shippable independently and is a *pre-existing bug fix* — it makes any non-video
   queued row drain correctly, before any offline-create wiring exists.
2. **Step 1** (NetInfo module + `onlineManager` wiring) — no behavior change on its
   own beyond RQ retry pausing; safe to land next.
3. **Step 3** (offline create → enqueue) depends on Steps 1 + 2.
4. **Steps 4–5** (card generalization + banner) are UI-only and can land last or in
   parallel once the type union is widened.

Do **not** add the reconnect drain trigger (Step 2's `triggerDrain` registration)
until the drain lock is in place — that ordering is load-bearing.

## Testing / Verification

1. **Offline create, per type** — enable airplane mode, create photo/letter/ticket
   → queued card appears, no crash, mutation resolves.
2. **Reconnect drain** — disable airplane mode → rows upload + insert, queued cards
   replaced by real cards, queue empties.
3. **Restart survival** — create offline, kill app, relaunch offline (card still
   there), go online (drains).
4. **Mixed** — offline photo + heavy video queued together drain correctly.
5. **Idempotency** — force a failure after upload but before insert; retry must not
   create a duplicate memory.
6. **Banner** — toggles with connectivity; count matches queued rows; manual retry
   works.
7. `npx tsc --noEmit` clean.

## Out of Scope (deferred)

- Conflict resolution for edits made offline (only *creates* are queued).
- Reordering queued items by `date_happened` (current behavior prepends).
- Background upload while app is killed (that's the Phase 10B native-task ship
  item, tracked separately).
</content>
</invoke>
