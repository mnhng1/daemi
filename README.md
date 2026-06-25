# Daemi

A private, couple-scoped scrapbook mobile app. Two members share one timeline of photos, videos, letters, and tickets. iOS-first, built with Expo / React Native / TypeScript and a Supabase + Cloudflare R2 backend.

![Expo SDK 56](https://img.shields.io/badge/Expo-SDK_56-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react&logoColor=black)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_·_Auth_·_Realtime-3FCF8E?logo=supabase&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-media_storage-F38020?logo=cloudflare&logoColor=white)

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [System architecture](#system-architecture)
- [Data model](#data-model)
- [Security model](#security-model)
- [Media pipeline](#media-pipeline)
- [Offline queue](#offline-queue)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Architecture docs](#architecture-docs)

## Overview

All content is scoped to a *couple space* — a two-member container. The data model, access control, and realtime fan-out are all keyed on `couple_space_id`. Scope is enforced at the database with Postgres Row-Level Security, not in application code.

Key engineering characteristics:

| Area | Implementation |
|---|---|
| Access control | Postgres Row-Level Security on every table; every row scoped to a couple space. |
| Media storage | Cloudflare R2 (S3-compatible, private bucket, zero egress). Access brokered by a Supabase Edge Function that mints short-lived presigned URLs after verifying JWT + membership. |
| Large uploads | Single presigned `PUT` for photos / small video; S3 multipart with per-part tracking and resume for multi-GB video. |
| Offline writes | Memory creation with no connectivity is persisted to a durable SQLite queue, surfaced as a queued card, and drained on reconnect (survives app restart). |
| Realtime | Supabase Realtime change events mapped to targeted TanStack Query invalidations. |
| Layering | UI components never call Supabase directly; all data access goes through typed feature hooks. 142 TS/TSX files organized by product domain. |
| Theming | Two hot-swappable palettes (scrapbook / monochrome) over a single reactive design-token layer. |

## Features

- Auth: Google Sign-In and email one-time-passcode, with route guards and a session provider.
- Couple spaces: create a space or join via invite code; all content scoped to the pair.
- Timeline: vertical spine layout with Day / Month / Year zoom (segmented control and pinch gesture), animated with Reanimated.
- Four memory types: photo, video, letter, ticket — each with a composer and detail view built from shared primitives.
- Reactions: one heart per member per memory.
- Search and tags: query search plus lowercase tag filtering.
- Places: Google Places autocomplete on capture, a derived `/places` browse view, and an Apple Maps view via `react-native-maps`.
- Collections: group memories into trips, anniversaries, or custom sets.
- Realtime sync of partner edits.
- Offline create-and-queue with retry/delete on failed drafts.
- Runtime appearance toggle between scrapbook and monochrome identities.

## Tech stack

| Layer | Choice |
|---|---|
| App | Expo SDK 56, React Native 0.85, React 19, TypeScript (strict) |
| Navigation | Expo Router (file-based, typed routes) |
| Server state | TanStack Query (`onlineManager` wired to connectivity) |
| Local / UI state | Zustand + AsyncStorage |
| Forms & validation | React Hook Form + Zod |
| Styling | NativeWind (Tailwind) + centralized reactive design tokens |
| Motion & gesture | Reanimated 4 + Gesture Handler + Worklets |
| Backend | Supabase — Postgres, Auth, Realtime, Edge Functions (Deno) |
| Media storage | Cloudflare R2 (S3-compatible, private bucket) |
| Local persistence | Expo SQLite (durable upload / offline queue) |
| Maps | `react-native-maps` (Apple Maps on iOS) |
| Build | EAS Build / Submit |

## System architecture

```
┌──────────────────────────────────────────────────────────────┐
│  app/  — Expo Router routes (UI only)                          │
│  (auth) · (tabs): timeline · add · collections · places ·      │
│  search · settings   +   memory/[id] · album/[date] · onboard  │
└───────────────────────────────┬──────────────────────────────┘
                                 │  calls hooks, never Supabase
┌───────────────────────────────▼──────────────────────────────┐
│  src/features/  — product domains (the only Supabase callers)  │
│  auth · couple-space · memories · media · collections ·        │
│  search · places · realtime · queue · network · profile        │
└───────────────────────────────┬──────────────────────────────┘
                                 │
┌───────────────────────────────▼──────────────────────────────┐
│  src/lib/  — supabase client · query client · theme · utils    │
└───────────────────────────────┬──────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                         ▼
┌───────────────┐      ┌──────────────────┐     ┌───────────────────┐
│ Supabase      │      │ Supabase Edge Fns │     │ Cloudflare R2     │
│ Postgres+RLS  │      │ media-presign     │────▶│ private media     │
│ Auth          │      │ places-search     │     │ (presigned PUT/GET│
│ Realtime      │      │ JWT + membership  │     │  10m up / 1h down)│
└───────────────┘      └──────────────────┘     └───────────────────┘
```

UI components consume typed feature hooks (`useMemories`, `useCreateMemory`, …); those hooks own all data access, caching, and validation. Screens stay declarative and the data layer is independently testable.

## Data model

Relational core in Postgres; every domain row carries a `couple_space_id`.

```
profiles ──┐
           │   couple_spaces ──< couple_members >── profiles
           │        │
           │        └──< memories >── memory_reactions
           │              │
           │              └── collections
```

- `memories` is the central entity: `type` (`photo | video | letter | ticket`), `title` / `body`, `date_happened`, `tags[]`, `place_name` (+ lat/lng), optional `collection_id`, soft-delete (`deleted_at`), and media columns — `storage_key` (R2 object path), `thumbnail_url`, plus `duration_seconds` / `media_size_bytes` / `media_mime` for video routing.
- Soft delete throughout; `created_by_user_id` rather than a hard "A/B" partner flag.
- 12 SQL migrations under `supabase/migrations/` cover schema, RLS policies, realtime publication, search, places coordinates, and video fields.

## Security model

Invariant: a user can only access data for couple spaces they belong to.

- Row-Level Security on every table. Core predicate:
  ```sql
  exists (
    select 1 from couple_members
    where couple_members.couple_space_id = row.couple_space_id
      and couple_members.user_id = auth.uid()
  )
  ```
- Writes are author-scoped: a user updates / soft-deletes memories they created; reactions are one-per-memory and self-owned.
- Media is private. The R2 bucket has no public access. Every upload / download goes through the `media-presign` Edge Function, which verifies the Supabase JWT, confirms couple-space membership, and returns a short-lived presigned URL. R2 credentials are Edge Function secrets and never reach the client.
- Object paths embed the couple-space id (`couple-spaces/{id}/memories/{id}/…`) for auditability.

## Media pipeline

```
upload:  pick media → client mints memoryId → media-presign (verify JWT + membership)
         → presigned PUT to R2 → insert memory row with storage_key
display: media-presign download action → short-lived GET → render / stream
```

- Photos and small video (≤ ~5 GB): single presigned `PUT`. A poster frame is extracted client-side and stored at the `thumb.*` key.
- Heavy video (> ~5 GB): S3 multipart upload (`create-multipart` → `sign-part` → `complete-multipart`, with `abort-multipart` cleanup). Resumable — only failed parts are re-signed and retried.
- Playback: `expo-video` streams from a presigned GET. R2 honors HTTP range requests, so playback is progressive (no full download, no transcoding tier).
- R2's zero egress keeps a media-heavy app cheap: ~$1.50/mo for 100 GB stored vs ~$25/mo on managed storage.

## Offline queue

- Connectivity via `@react-native-community/netinfo`; TanStack Query's `onlineManager` is driven from the same source.
- `useCreateMemory` has an offline fast-path (queue immediately) and a mid-flight fallback (catch network errors → enqueue draft).
- Durable store in Expo SQLite — survives app restarts and tracks multipart part state for resumable heavy-video uploads.
- Drain on reconnect with a lock to prevent double-processing; idempotent upserts.
- UX: offline banner on the timeline, per-type queued cards, retry / delete on failed drafts.

## Repository layout

```
app/                 Expo Router routes (UI only)
  (auth)/            sign-in · email · verify
  (tabs)/            timeline · add · collections · places · search · settings
  memory/[id]/       detail + edit
  onboarding/        create / join a couple space

src/
  components/        ui · memory · timeline · collections · places · navigation · system
  features/          auth · couple-space · memories · media · collections ·
                     search · places · realtime · queue · network · profile
  lib/               supabase · query · theme (tokens + palettes) · store · utils
  types/             database.ts (domain types)

supabase/
  migrations/        12 SQL migrations (schema · RLS · realtime · search · places)
  functions/         media-presign · places-search  (Deno Edge Functions)

docs/architecture/   16 numbered architecture documents
```

## Getting started

Requires Node, the Expo tooling, and a Supabase project. iOS is the primary target; several features (blur, maps, NetInfo, SQLite) are native modules and require a dev build rather than Expo Go.

```bash
npm install

# Type-check
npx tsc --noEmit

# Start the dev server
npx expo start

# Build & run a native dev client (needed for native modules)
npx expo run:ios
```

Backend setup: apply the SQL in `supabase/migrations/`, deploy the `media-presign` and `places-search` Edge Functions, and provide client / Edge env (Supabase URL + anon key, R2 credentials and bucket, Google Places key) via Expo config and Edge Function secrets.

## Architecture docs

Full engineering write-up lives in `docs/architecture/`. Suggested order:

1. [`00-overview.md`](docs/architecture/00-overview.md) — product goal & scope
2. [`01-tech-stack.md`](docs/architecture/01-tech-stack.md)
3. [`02-app-architecture.md`](docs/architecture/02-app-architecture.md) — boundaries & the hook rule
4. [`03-data-model.md`](docs/architecture/03-data-model.md)
5. [`04-auth-and-couple-space.md`](docs/architecture/04-auth-and-couple-space.md)
6. [`06-media-storage.md`](docs/architecture/06-media-storage.md) — R2 + presign + multipart
7. [`07-timeline-architecture.md`](docs/architecture/07-timeline-architecture.md)
8. [`11-realtime-sync.md`](docs/architecture/11-realtime-sync.md), [`12-offline-queue.md`](docs/architecture/12-offline-queue.md)
9. [`14-security-rls.md`](docs/architecture/14-security-rls.md)
10. [`15-implementation-phases.md`](docs/architecture/15-implementation-phases.md)

Design system and product spec: [`DESIGN.md`](DESIGN.md).
