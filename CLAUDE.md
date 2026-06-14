# Daemi

Private shared scrapbook app for long-distance couples. Expo + React Native + TypeScript + Supabase.

## Commands

- `npx expo start` — start dev server
- `npx tsc --noEmit` — type check
- `npm test` — run tests (not configured yet)

## Architecture

- Architecture docs: `docs/architecture/` (00-16, start with 00-overview.md)
- Design system & product spec: [`DESIGN.md`](DESIGN.md) — color tokens, typography, components, screens, motion, data model
- Routes: `app/` (Expo Router, file-based routing)
- Source: `src/` (components, features, lib, types)
- Feature hooks pattern: UI components call hooks from `src/features/`, never Supabase directly

## Current Phase

Phase 0 (Foundation) — complete. Phase 1 (Database & Auth) — complete. Phase 2 (Auth Flow & Route Guards) — complete. Phase 3 (Timeline Day View) — complete. Phase 4 (Add Photo Memory + R2 Storage) — complete. Phase 5 (Letter Memories) — complete. Phase 6 (Memory Detail & Actions) — complete. Phase 7 (Search and Tags) — complete. Phase 8 (Realtime Sync) — complete. Phase 9 (Collections) — complete. Phase 10A (Video & Ticket baseline) — complete. Phase 11 (Places Lens + coordinates: Google Places autocomplete picker, derived `/places` lens, lat/lng capture) — complete. Phase 11B (Places map via `react-native-maps`, Apple Maps on iOS — no key needed) — code-complete, pending dev-build verification (iOS only; Android not targeted). Phase 10B (Heavy video — SQLite upload queue, multipart R2 upload, queued card UI) — implemented on top of Phase 11, pending ship (native background-upload task, R2 AbortIncompleteMultipartUpload lifecycle rule, on-device verification). Phase 12 (Offline Queue — NetInfo connectivity module, offline create → queue for all types, reconnect drain, offline banner, per-type queued card, retry/delete) — code-complete on `main`, pending EAS dev-build verification (`@react-native-community/netinfo` is native). Deferred: place faves/cities chips, recent-places, `place:` search operator, place_name normalization, map clustering (see plan).
