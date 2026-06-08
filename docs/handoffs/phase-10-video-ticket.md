<!-- Audited by the architecture agent (verdict: sound-with-changes). Blockers
B1 (thumbnail path is net-new), B2 (named deps), B3 (scene-fill decided = solid
for 10A), and important findings I1–I5 have been folded in below. -->

# Handoff — Phase 10 Implementation Plan (Video + Ticket)

**Role:** You are the single orchestrator responsible for producing a detailed,
file-by-file implementation plan for Phase 10 of Daemi. You own both sub-phases
(10A and 10B) end to end — do not split ownership across separate planners. Produce
one cohesive plan with two clearly delineated execution stages and an explicit
gate between them.

**Deliverable:** A written implementation plan (markdown). Do NOT write feature
code in this pass — plan only. The plan will be audited by the architecture agent
before any implementation begins.

---

## Project context

Daemi is a private shared scrapbook app for long-distance couples.
Expo + React Native + TypeScript + Supabase, Cloudflare R2 for media.

- Routes: `app/` (Expo Router, file-based)
- Source: `src/` — `components/`, `features/`, `lib/`, `types/`
- **Pattern (must follow):** UI components call hooks from `src/features/`, never
  Supabase/R2 directly.
- Phases 0–9 are complete. Photo + Letter memory types are fully built; Video +
  Ticket are enum/DB-ready but currently rendered as **disabled** cards in the
  type picker.

### Authoritative specs (read these first — they were just updated for this work)

- `docs/architecture/03-data-model.md` — memory columns incl. new video fields
- `docs/architecture/05-memory-domain.md` — type semantics + validation (video R2-only)
- `docs/architecture/06-media-storage.md` — single-PUT vs multipart, expo-video playback
- `docs/architecture/12-offline-queue.md` — durable queue (merged into 10B)
- `docs/architecture/15-implementation-phases.md` — the 10A / 10B split
- Design reference: `docs/prototype/src/` (03-memory-cards, 05-add-composer,
  06-detail-views show ticket + video UI), and `DESIGN.md`

### Key files the plan must account for (grep/read them; cite exact paths + lines)

- `app/(tabs)/add/index.tsx` — composer host; currently gates to photo|letter
- `src/components/add-memory/memory-type-picker.tsx` — video/ticket are `disabled`
- `src/components/memory/memory-card.tsx` — only branches letter vs photo
- `app/memory/[id]/index.tsx` — detail route; only photo|letter cases
- `src/features/memories/use-create-memory.ts` — union is photo|letter only
- `src/features/memories/types.ts` — `MemoryTypeFilter = "all" | "photo" | "letter"`
- `src/features/media/upload-memory-image.ts` — single XHR PUT, image-only; note `send({uri})` already streams from a file URI (safe for large files)
- `src/types/database.ts` — enum already includes video|ticket
- `src/components/timeline/timeline-type-filters.tsx` — filter chips ALSO hard-coded to all/photo/letter (a second widen site)
- `supabase/functions/media-presign/index.ts` — upload/download actions; **already allows `video/mp4` + `video/quicktime`** (no MIME change needed); upload action only ever emits an `original.{ext}` key (see Blocker B1)
- `src/features/media/get-media-url.ts` / `use-media-url.ts` — presign + cache the **original** `storage_key`; `thumbnail_url` column exists but is never populated or read today
- `src/features/memories/use-delete-memory.ts` — soft-delete only; never deletes the R2 object

---

## Locked product decisions (do not relitigate)

1. **Video is R2-only.** No YouTube/Vimeo/external links/embeds.
2. **Playback is embedded** via `expo-video`, streaming from a presigned R2 GET
   (private bucket, range requests → progressive). No transcoding/HLS for now.
3. **Video length is unbounded.** Files > ~5 GB require S3 multipart (R2 rejects
   single PUT above the limit).
4. **Heavy upload runs in a durable background queue** and uses a native
   background-upload module (an EAS dev build is approved/expected).
5. **Two stages, one orchestrator, with a gate:** 10A ships first and is
   independently shippable; 10B is gated behind a spike.

---

## Stage 10A — Ticket + baseline Video (independently shippable)

Plan must cover, file-by-file:

- **DB migration:** add `duration_seconds int`, `media_size_bytes bigint`,
  `media_mime text` (all nullable) to `memories`; regenerate `src/types/database.ts`.
- **Type picker:** un-gate video + ticket; widen `onSelect` to all four types.
- **Filters:** widen `MemoryTypeFilter` and any timeline filter UI to 4 types.
- **Ticket:** composer (what / when / seat fields, optional stub photo, note),
  card (the "ADMIT ONE" two-column layout), detail. Title required; media optional.
- **Video (≤ ~5 GB):** composer (pick clip via `expo-image-picker` with
  `mediaTypes: "videos"` — verify iOS doesn't silently transcode/downscale the
  original; pass through `videoQuality`), single-PUT upload. Card (poster +
  duration badge + play glyph) + detail.
- **Thumbnail/poster path — NET-NEW WORK, not a reuse (Blocker B1):** the current
  upload action only emits an `original.{ext}` key, and `thumbnail_url` is never
  populated or rendered anywhere. So the plan must, as explicit separately-verified
  items: (a) add a `variant`/`kind:"thumb"` param to the `media-presign` upload
  action so a `thumb.jpg` key can be presigned (the download key-guard is
  prefix-only, so GET of `thumb.*` already works); (b) extract the poster frame
  with `expo-video-thumbnails`; (c) upload it to the thumb key; (d) render the
  card poster from `thumbnail_url`'s key, NOT `storage_key` (else the card streams
  the full original into an `<Image>`).
- **Playback:** `expo-video` player component fed by a presigned GET; wire into
  video detail. See I1 — do NOT silently inherit the photo cache/expiry settings.
- **create-memory:** extend the union with `CreateVideoInput` + `CreateTicketInput`;
  populate `media_size_bytes` (via `expo-file-system`) and `duration_seconds`.
- **Cancel UX (10A, not deferred):** multi-GB single-PUT can take many minutes;
  the composer has no cancel today — add a cancel affordance for in-flight uploads.
- **Card/detail routers:** add video + ticket branches in `memory-card.tsx` and
  `app/memory/[id]/index.tsx`.
- **Scene-fill — DECIDED, do not relitigate in the plan:** 10A cards use the
  **existing solid-color style** (no retrofit of photo/letter cards). The
  prototype's scene-gradient look is filed as a separate post-10A polish pass.

## Stage 10B — Heavy / unbounded video (gated)

- **Spike first (gate):** prove resumable S3-multipart inside a background native
  task on RN. R2 is S3-multipart, NOT TUS; off-the-shelf libs
  (`react-native-background-upload`) do single-file background uploads, not per-part
  S3 multipart orchestration. **Hard go/no-go bar (measurable, adversarial):**
  upload a >5 GB file via multipart, **force-kill the app at ~40%**, and on
  relaunch resume from the last completed part (not from zero) to a valid object
  that plays back — verified on a **physical iOS AND physical Android device**, in
  a **backgrounded/locked** state. Anything softer is a rubber-stamp. State a
  time-box and the named fallback (custom native module via Expo config plugin).
- **R2 multipart footguns to verify in the spike:** `complete-multipart` needs the
  ordered ETag list from each part PUT — the **R2 bucket CORS policy** (separate
  from the Edge Function CORS) must expose `ETag` via `Access-Control-Expose-Headers`
  or the RN client can't read it. Also smoke-test poster extraction + file ops on a
  low-RAM device with a 10 GB source.
- `media-presign` multipart actions: `create-multipart`, `sign-part`,
  `complete-multipart`, `abort-multipart` (all JWT + membership checked).
- Resumable multipart client: part tracking, retry only failed parts.
- Durable **Expo SQLite** upload queue (survives restart) per `12-offline-queue.md`
  shape + the heavy-upload additions (`uploadId`, `parts[]`, byte progress).
- Background execution via the native module (EAS dev build implications called out).
- Queued / uploading cards on the timeline; size-based routing (single-PUT vs
  multipart) keyed off `media_size_bytes`.

---

## Dependencies (pre-named — confirm versions against Expo SDK 56)

None of the video stack is currently installed (verified absent in `package.json`).

- **10A:** `expo-video` (playback — confirm SDK 56 compatibility before committing),
  `expo-video-thumbnails` (poster extraction), `expo-file-system` (file size +
  byte reads).
- **10B:** `expo-sqlite` (durable queue + multipart part-tracking), a native
  background-upload module (or custom config-plugin module per the spike fallback).
  10B requires an **EAS dev build** — it cannot run in Expo Go.

## Cross-cutting concerns the plan MUST address (from architecture audit)

- **I1 — Video presign expiry vs playback:** the photo cache contract is
  `staleTime 50min` against a 60min GET URL; `expo-video` uses one signed URL for
  ALL range requests in a session, so a seek after ~55 min 403s mid-playback. Plan
  a longer video GET expiry and/or a refresh-on-403 wrapper. Verify: seek to the
  end of a multi-GB clip after the URL is >50 min old.
- **I2 — Orphaned objects:** soft-delete never removes the R2 object; for multi-GB
  video this is a real cost/privacy issue, and aborted multipart uploads leave
  billable incomplete parts. Specify a soft-delete cleanup strategy for video
  originals + thumbnails, AND an R2 lifecycle rule to auto-abort incomplete
  multipart uploads after N days. "Deliberately deferred + tracked" is acceptable;
  silence is not.
- **I3 — `media_size_bytes` routing default:** no backfill needed; routing treats
  `NULL`/absent as single-PUT; only new video writes populate the column. State this.
- **I4 — Queued-card / timeline merge:** `useMemories` reads a single Postgres
  source; 10B queued/uploading cards live in SQLite. Specify the composed hook that
  merges them and what invalidates what.

## Required plan structure (output format)

1. **Summary** — what ships in 10A vs 10B, and the gate criteria between them.
2. **Stage 10A** — ordered work items, each with: target file(s), what changes,
   new files to create, dependencies, and a verification step.
3. **Stage 10B** — same, with the spike as item zero and explicit go/no-go criteria.
4. **Data + Edge Function changes** — migration SQL sketch, `media-presign` action
   contracts (request/response shapes).
5. **New dependencies** — packages (`expo-video`, SQLite, native uploader, etc.),
   and the EAS dev-build requirement for 10B.
6. **Risks & open questions** — ranked; include the scene-fill decision and the
   multipart-in-background risk.
7. **Test/verification strategy** — `npx tsc --noEmit`, manual device checks
   (small clip end-to-end; ticket end-to-end; for 10B, a >5 GB upload that survives
   a kill/restart and resumes).

## Constraints

- Honor the `features/` hook boundary — no Supabase/R2 calls from components.
- Match existing code idiom (NativeWind classes, existing composer/card patterns).
- 10A must not depend on any 10B work; the app must be shippable after 10A.
- Cite real file paths and line numbers from the current codebase, not assumptions.
