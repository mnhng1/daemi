<div align="center">

# 🐻 Daemi

**A private, shared scrapbook for long-distance couples.**

Two people, one timeline — photos, videos, letters, and tickets saved into a warm, emotionally durable space that belongs only to them.

![Expo SDK 56](https://img.shields.io/badge/Expo-SDK_56-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react&logoColor=black)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_·_Auth_·_Realtime-3FCF8E?logo=supabase&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-media_storage-F38020?logo=cloudflare&logoColor=white)

</div>

> **Note** — Daemi is a solo-built, production-oriented mobile app (iOS-first). It is intentionally *not* a social feed, a public profile, or a chat app. The whole product is one quiet loop: **add a memory → it lands on a shared timeline → your partner sees it.**

---

## Table of contents

- [Why this project is interesting](#why-this-project-is-interesting)
- [Feature highlights](#feature-highlights)
- [Tech stack](#tech-stack)
- [System architecture](#system-architecture)
- [Data model](#data-model)
- [Security model (privacy-first)](#security-model-privacy-first)
- [Media pipeline](#media-pipeline)
- [Offline-first durable queue](#offline-first-durable-queue)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Engineering principles](#engineering-principles)
- [Architecture docs](#architecture-docs)

---

## Why this project is interesting

Daemi is small in surface area but deliberately deep in the parts that are hard to get right on mobile:

| Area | What it demonstrates |
|---|---|
| **Privacy by construction** | Every row is scoped to a *couple space* and enforced at the database with Postgres **Row-Level Security** — not in application code. A user physically cannot read another couple's data. |
| **Media at real scale, cheaply** | Media lives in **Cloudflare R2** (S3-compatible, **zero egress fees**) behind a Supabase **Edge Function** that mints short-lived presigned URLs after verifying JWT + membership. ~$1.50/mo at 100 GB vs ~$25/mo on managed storage. |
| **Large-file uploads** | Photos and small videos take a single presigned `PUT`; multi-GB videos switch to **S3 multipart upload** with per-part tracking and resume. |
| **Offline-first** | Creating a memory with no connection writes a **durable SQLite draft**, shows a queued card, and drains automatically on reconnect — surviving app restarts. |
| **Realtime sync** | Supabase Realtime → targeted **TanStack Query** cache invalidation, so a partner's change appears without a manual refresh (no chat/presence overbuild). |
| **Layered architecture** | UI components never touch Supabase directly; they call typed **feature hooks** (`useMemories`, `useCreateMemory`, …). 142 TS/TSX files organized by product domain. |
| **A real design system** | Two complete, hot-swappable palettes — a warm handwritten *scrapbook* identity and a *monochrome* (Threads-style) reskin — driven by a single reactive token layer. |

---

## Feature highlights

- 🔐 **Auth** — Google Sign-In and email one-time-passcode, with route guards and a session provider.
- 👫 **Couple spaces** — create a space or join your partner's via invite code; all content is scoped to the pair.
- 🗓️ **Timeline** — a scrapbook-style vertical spine with **Day / Month / Year zoom** (segmented control *and* pinch gesture), animated with Reanimated.
- 🖼️ **Four memory types** — photo, video, letter, and ticket, each with its own composer and detail view built from shared primitives.
- ❤️ **Reactions** — one heart per partner per memory.
- 🔎 **Search & tags** — query search plus lowercase tag filtering.
- 📍 **Places lens** — Google Places autocomplete on capture, a derived `/places` browse view, and an Apple Maps view (via `react-native-maps`).
- 📁 **Collections** — group memories into trips, anniversaries, or custom sets.
- 🔄 **Realtime** — partner edits stream in live.
- 📶 **Offline queue** — create anywhere; it uploads when you're back online.
- 🎨 **Appearance toggle** — switch the entire app between scrapbook and monochrome identities at runtime.

---

## Tech stack

| Layer | Choice |
|---|---|
| **App** | Expo SDK 56 · React Native 0.85 · React 19 · TypeScript (strict) |
| **Navigation** | Expo Router (file-based, typed routes) |
| **Server state** | TanStack Query (with `onlineManager` wired to connectivity) |
| **Local / UI state** | Zustand + AsyncStorage |
| **Forms & validation** | React Hook Form + Zod |
| **Styling** | NativeWind (Tailwind) + a centralized reactive design-token layer |
| **Motion & gesture** | Reanimated 4 + Gesture Handler + Worklets |
| **Backend** | Supabase — Postgres, Auth, Realtime, Edge Functions (Deno) |
| **Media storage** | Cloudflare R2 (S3-compatible, private bucket) |
| **Local persistence** | Expo SQLite (durable upload / offline queue) |
| **Maps** | `react-native-maps` (Apple Maps on iOS) |
| **Build** | EAS Build / Submit |

---

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

**The one rule:** UI components don't know Supabase exists. They consume typed feature hooks, which own all data access, caching, and validation. This keeps screens declarative and makes the data layer independently testable and swappable.

---

## Data model

A simple relational core in Postgres; every domain row carries a `couple_space_id`.

```
profiles ──┐
           │   couple_spaces ──< couple_members >── profiles
           │        │
           │        └──< memories >── memory_reactions
           │              │
           │              └── collections
```

- **`memories`** is the central entity: `type` (`photo | video | letter | ticket`), `title` / `body`, `date_happened`, `tags[]`, `place_name` (+ lat/lng), an optional `collection_id`, soft-delete (`deleted_at`), and media columns — `storage_key` (R2 object path), `thumbnail_url`, plus `duration_seconds` / `media_size_bytes` / `media_mime` for video routing.
- **Soft delete** everywhere; **`created_by_user_id`** rather than a hard "A/B" partner flag.
- **12 SQL migrations** under `supabase/migrations/` track the schema, RLS policies, realtime publication, search, places coordinates, and video fields.

---

## Security model (privacy-first)

> The guarantee: *a user can only ever touch data for couple spaces they belong to.*

- **Row-Level Security** on every table. The core predicate:
  ```sql
  exists (
    select 1 from couple_members
    where couple_members.couple_space_id = row.couple_space_id
      and couple_members.user_id = auth.uid()
  )
  ```
- **Writes are author-scoped** — you can update / soft-delete memories you created; reactions are one-per-memory and self-owned.
- **Media is never public.** The R2 bucket has no public access. Every upload / download goes through the `media-presign` Edge Function, which verifies the Supabase JWT, confirms couple-space membership, and returns a short-lived presigned URL. R2 credentials live as Edge Function secrets and never reach the client.
- **Object paths embed the couple-space id** (`couple-spaces/{id}/memories/{id}/…`) for auditability.

---

## Media pipeline

```
pick media → client mints memoryId → media-presign (verify JWT + membership)
           → presigned PUT to R2 → insert memory row with storage_key
display:   → media-presign download action → short-lived GET → render / stream
```

- **Photos & small video (≤ ~5 GB)** — single presigned `PUT`; a poster frame is extracted client-side and stored at the `thumb.*` key.
- **Heavy video (> ~5 GB)** — **S3 multipart upload** (`create-multipart` → `sign-part` → `complete-multipart`, with `abort-multipart` cleanup). Resumable: only failed parts are re-signed and retried.
- **Playback** — `expo-video` streams from a presigned GET; R2 honors HTTP range requests, so playback is progressive (no full download, no transcoding tier).
- **Why R2** — zero egress fees make a media-heavy couples app viable at ~$1.50/mo for 100 GB instead of ~$25/mo on managed storage.

---

## Offline-first durable queue

Creating a memory while offline doesn't fail — it's queued and reconciled later.

- **Connectivity** via `@react-native-community/netinfo`, with TanStack Query's `onlineManager` driven from the same source.
- **`useCreateMemory`** has an offline fast-path (queue immediately) *and* a mid-flight fallback (catch network errors → enqueue draft).
- **Durable store** in Expo SQLite — survives app restarts and tracks multipart part state for resumable heavy-video uploads.
- **Drain** on reconnect with a lock to prevent double-processing; idempotent upserts.
- **UX** — an offline banner on the timeline, per-type queued cards, and retry / delete affordances on failed drafts.

---

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

docs/architecture/   16 numbered architecture documents (see below)
```

---

## Getting started

> Requires Node, the Expo tooling, and a Supabase project. iOS is the primary target; several features (blur, maps, NetInfo, SQLite) are native modules and need a **dev build** rather than Expo Go.

```bash
npm install

# Type-check
npx tsc --noEmit

# Start the dev server
npx expo start

# Build & run a native dev client (needed for native modules)
npx expo run:ios
```

Supabase setup (high level): apply the SQL in `supabase/migrations/`, deploy the `media-presign` and `places-search` Edge Functions, and provide the client / Edge env (Supabase URL + anon key, R2 credentials and bucket, Google Places key) via Expo config and Edge Function secrets.

---

## Engineering principles

- **Mobile-first**, couple-space-scoped, privacy-first.
- **Build the emotional loop before advanced organization** — the timeline came before collections / search.
- **Shared primitives** for all composers and detail screens; memory types stay extensible.
- **UI never imports Supabase** — feature hooks are the seam.
- **Phased delivery** — the product was built in 13 documented phases (foundation → auth → timeline → media → letters → detail → search → realtime → collections → video → places → offline queue → timeline zoom).

---

## Architecture docs

The `docs/architecture/` folder holds the full engineering write-up. Suggested reading order:

1. [`00-overview.md`](docs/architecture/00-overview.md) — product goal & scope
2. [`01-tech-stack.md`](docs/architecture/01-tech-stack.md)
3. [`02-app-architecture.md`](docs/architecture/02-app-architecture.md) — boundaries & the hook rule
4. [`03-data-model.md`](docs/architecture/03-data-model.md)
5. [`04-auth-and-couple-space.md`](docs/architecture/04-auth-and-couple-space.md)
6. [`06-media-storage.md`](docs/architecture/06-media-storage.md) — R2 + presign + multipart
7. [`07-timeline-architecture.md`](docs/architecture/07-timeline-architecture.md)
8. [`11-realtime-sync.md`](docs/architecture/11-realtime-sync.md) · [`12-offline-queue.md`](docs/architecture/12-offline-queue.md)
9. [`14-security-rls.md`](docs/architecture/14-security-rls.md)
10. [`15-implementation-phases.md`](docs/architecture/15-implementation-phases.md)

Design system & product spec live in [`DESIGN.md`](DESIGN.md).

---

<div align="center">
<sub>Built with care as a private space for two people. 🐻</sub>
</div>
