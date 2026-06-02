# Dear Us — Design Document

> A private shared scrapbook for two people and the distance between them.
> This document describes the design system and product decisions embodied in
> the interactive prototype (`Dear Us - Prototype.html`).

---

## 1. Product in one line

Two people, no algorithm. A warm, handmade place where a long-distance couple
keeps photos, videos, letters and tickets on a shared timeline — and nothing else.

### Principles
- **Cute, private, warm, scrapbook-like — but clean.** It is not a feed and not a
  CRUD dashboard.
- **Two people, no algorithm.** No ranking, no discovery, no strangers.
- **Time is the spine.** Everything hangs off a single vertical timeline; today is
  always at the top, and you scroll back through the relationship.
- **One accent, lots of paper.** Warm cream surfaces, ink linework, a single
  themeable accent used sparingly for action and affection.
- **Handwriting is the soul.** Letters, captions and dates are rendered in a
  handwritten face even when the chrome turns into a clean sans.

### In scope
Shared timeline (year / month / day zoom) · 4 memory types · per-type detail ·
day albums (many pictures, one day) · collections (trip / anniversary / custom) ·
tags & tag-search · places browse lens · filter by type · empty / loading / offline
states.

### Out of scope (MVP)
Home-screen widget · live camera widget · full map view · bulk import · AI
clustering · notifications / chat / calendar / export · profile & settings tab.

---

## 2. Data model

Two entities. `place` and `collection` are **optional metadata on every memory** —
place is *not* its own type.

### Memory
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | server-generated |
| `coupleSpaceId` | uuid | partition key — both partners share it |
| `type` | `photo \| video \| letter \| ticket` | drives composer & detail view |
| `title` | string? | caption (photo/video), "what" (ticket), usually empty (letter) |
| `body` | string? | full letter body, or note on ticket |
| `scene` | enum | abstract "photo" fill (see §4.4); null for letter |
| `date` | iso date | orders the timeline (NOT createdAt) |
| `place` | string? | resolved label, e.g. "Café Regular · brooklyn" |
| `collection` | uuid? | fk → Collection, nullable |
| `tags` | string[] | lowercase tokens, ~5 max |
| `by` | `A \| B` | which partner authored it |
| `dayTitle` | string? | optional label that names a multi-photo day |
| `reaction` | { by, text }? | a single partner reaction |

### Collection
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | string | "NYC, in the snow" |
| `type` | `trip \| anniversary \| custom` | drives sticker label |
| `start` / `end` | iso date? | nullable for `custom` |
| `desc` | string? | shown on collection detail |
| `cover` | scene | cover fill |

**Why no Place entity** — places repeat, but their canonical form lives in a maps
SDK. We store the resolved string on the memory and group by it for the Places
lens. Promote to a `Place` table only if you later need geo-querying.

---

## 3. Navigation & information architecture

Bottom nav has 4 destinations; the raised centre **+** is the only entry to Add.

| Slot | Routes to | Notes |
|---|---|---|
| Timeline | `/timeline` | default on cold start |
| Trips | `/collections` | list of collections |
| **+** | Add Memory sheet | raised, accent fill; slides up over a dimmed timeline |
| Places | `/places` | derived location lens |
| Find | `/search` | tags + free text |

Detail views and composers are **pushed full-screen routes**; pickers and the Add
type-chooser are **bottom sheets** over a dimmed backdrop.

---

## 4. Visual system

All visuals are driven by CSS custom properties set on the phone root, so accent,
light/dark and font swaps are live and reactive.

### 4.1 Color tokens

**Light (default)**
| Token | Value | Use |
|---|---|---|
| `--ink` | `#2c2620` | primary text, strokes |
| `--ink2` | `#5d5246` | secondary text |
| `--ink3` | `#988b7c` | tertiary / placeholder |
| `--ink4` | `#d6cbb9` | hairlines, ruled lines |
| `--paper` | `#f6efe1` | app background |
| `--surface` | `#fffdf8` | cards |
| `--surface2` | `#efe7d5` | tonal blocks |
| `--line` | `rgba(44,38,32,.13)` | borders |
| `--letterPaper` | `#fdf8ea` | letter backgrounds |
| `--highlight` | `#f6df8c` | stickers, warning bar |

**Dark — "evening"** (warm aubergine night)
| Token | Value |
|---|---|
| `--ink` / `--ink2` / `--ink3` / `--ink4` | `#f0e7da` / `#c4b6a6` / `#8d8073` / `#4c4338` |
| `--paper` / `--surface` / `--surface2` | `#201a24` / `#2b2431` / `#261f2c` |
| `--line` | `rgba(255,255,255,.10)` |
| `--letterPaper` | `#2a2230` |
| `--highlight` | `#b89a4a` |

### 4.2 Accent palettes (themeable)
A single accent drives CTAs, the active state, anniversary markers and affection.
`--accentSoft` tints collection chips & badges; `--accentText` is the readable
on-soft text color (derived via `color-mix`).

| Name | `--accent` | `--accentSoft` |
|---|---|---|
| Plum *(default)* | `#8c5a7c` | `#ecd6e2` |
| Sage | `#5f7e49` | `#dde7cd` |
| Indigo | `#4a6ba8` | `#d4deef` |
| Mustard | `#b07d22` | `#f0e3bb` |
| Terracotta | `#c4623f` | `#f4d9cd` |

### 4.3 Typography
Three roles, swappable as a pair via the "Lettering" tweak:

| Role | Handwritten *(default)* | Clean |
|---|---|---|
| `--font-ui` (chrome, labels, nav) | Patrick Hand | IBM Plex Sans |
| `--font-head` (titles, dates, wordmark) | Caveat | IBM Plex Sans |
| `--font-hand` (letters, captions) | Caveat | **Caveat** (always) |

Letters and captions stay handwritten in both modes — that contrast *is* the brand.

### 4.4 Scene fills — "warm illustrated photos"
Rather than real photography, every photo / video / ticket / cover is a layered,
grainy CSS gradient that reads as an impressionistic photograph: a subject light on
top, a base wash beneath, a vignette and a faint film grain (`SceneFill`). ~16
scenes: `coffee · sky · rain · concert · airport · park · food · pier · night ·
sunset · home · snow · forest · beach · flowers · fireworks · train`. This keeps the
prototype alive and emotional without shipping stock imagery, and makes the data
self-contained.

### 4.5 Shape, depth & motion
- **Radius:** cards 14–18px, tiles 7–12px, pills 7–20px, phone screen 47px.
- **Shadow (`--cardShadow`):** soft, warm, low — `0 5px 16px -8px rgba(70,48,28,.30)`
  in light; deeper in dark. Stickers and the raised + use a tighter drop.
- **Scrapbook tilt:** photo cards rotate ±0–6° based on a per-id hash × a tweakable
  factor (0 = neat, 2 = playful).
- **Motion:** sheet slide-up `.26s`, backdrop fade `.2s`, route push `.24s`, toast
  `.28s`, new-memory "pop" `.5s` (spring), upload progress `1.5s`. Easing
  `cubic-bezier(.16,1,.3,1)`.

### 4.6 Iconography
A single hand-tuned stroke icon set (24-grid, 1.8 weight) — heart, search, plus,
pin, folder, camera, image, film, ticket, tag, calendar, edit, trash, send, sparkle,
etc. No emoji.

---

## 5. Components

**Chrome** — `PhoneFrame` (device + status bar), `AppHeader`, `HeaderBtn`,
`BottomNav` (raised +).

**Memory cards** (dispatched by `MemoryCard`):
- `PhotoCard` / video — framed scene fill, handwritten caption, place + collection
  pills, author avatar, optional reaction heart & sticker.
- `LetterCard` — ruled paper, accent margin line, 3-line snippet, signature + word
  count.
- `TicketCard` — torn-edge stub: scene-tinted left panel, dashed perforation with
  notches, title / sub / vertical side label.
- `ClusterCard` — **day album**: a 2×2 / hero collage of a day's pictures with a
  count badge and "+N" overflow, stacked-paper hint behind.

**Metadata atoms** — `MetaPill` (place / collection), `Sticker` (sticky-note label),
`Chip` (filter / tag), `Avatar` (partner initial).

**Timeline atoms** — `Spine` (gradient vertical line), `Node` (filled/hollow),
`TLRow` (date · node · dashed connector · content), `TLMarker` (month / anniversary
band), `TodayCap`, `ZoomBar`, `FilterRow`.

**Form atoms** — `Field` (tap-to-open), `EField` (editable input/textarea),
`MetaRow` (place + collection pickers), `Btn`, `MediaPicker`.

---

## 6. Screens & flows

### 6.1 Timeline (home)
A vertical hand-drawn spine. Dates anchor on the left, cards branch right via a
dashed connector. "Today" pins the top; scroll back > ~30 days and the header heart
becomes **↑ jump to today**. Three zoom levels:
- **Day** *(default)* — full cards with captions & metadata. Same-day photos collapse
  into a **day album** card.
- **Month** — week rows of compressed thumbnails; tap a thumb to open.
- **Year** — one row per month with a type-segmented density bar, counts, and trip /
  anniversary markers; tap a month to zoom in. Newest month on top.

**Filter** by type collapses non-matching memories into "N hidden by filter" ghost
rows, preserving the time gaps on the spine.

### 6.2 Add a memory
**+** → bottom-sheet type picker (photo · video · letter · ticket) → composer.
Every composer carries the same metadata rows (place, collection, tags) opened as
sub-sheets:
- **Photo / Video** — media chooser (cycles a scene), editable caption, date,
  metadata, tags; video adds a trim scrubber & ≤30s limit.
- **Letter** — full-screen ruled paper, handwritten textarea, live word count, send
  tray (B / I, +place, +collection).
- **Ticket** — auto-cropped stub, what / when / seat, note, metadata.
- **Location Picker** — search + static map + recent places.
- **Collection Picker** — choose existing or create new inline.

**Save** → an *uploading* placeholder card lands on the spine, then a *saved* toast
(with undo) and a spring "pop". Saving while offline queues it instead.

### 6.3 Day album (many pictures, one day)
When a single date holds **2+ photos/videos**, the timeline groups them into one
`ClusterCard` (collage + count). Tapping opens a **gallery**: "N moments", a masonry
of the day's pictures with captions & places; tapping any one opens its full detail.
Days with one picture stay a normal card; letters and tickets always stay separate.

### 6.4 Memory detail
One per type, pushed full-screen. Header (back · title · author · overflow), type-
specific body, and a footer with place / collection pills, tags, and actions
(♥ / edit / delete). Letters render full-bleed on paper with a "sealed" timestamp.

### 6.5 Collections
List (photo-stack thumbnail · sticker tag · count) → detail (cover with overlaid
title · description · day-tab navigation · memories) → create (name · type · dates ·
note bottom sheet).

### 6.6 Places & search
- **Places** — derived lens listing unique places with counts & favorites; chips
  for all / faves / cities; tap → search filtered to that place.
- **Search** — live filtering across captions, letters, places and tags; tag-chip
  suggestions; results as a mixed 2-column grid.

### 6.7 States
- **Save toast** — bottom toast with undo; new node pops in.
- **Uploading** — placeholder card with animated progress overlay.
- **Offline / queued** — yellow banner with retry + queue count; queued memories
  appear desaturated with a "queued" sticker.
- **Empty** — first-run timeline: "your scrapbook starts here." + add CTA.

---

## 7. Tweaks (in-prototype controls)
| Tweak | Options |
|---|---|
| Accent | Plum · Sage · Indigo · Mustard · Terracotta |
| Lettering | Handwritten · Clean |
| Evening (dark) | off · on |
| Scrapbook tilt | 0 → 2 |
| Viewing as | Alex · Jordan |

A side "designer's notes" panel narrates the current screen and exposes **state
controls** (online/offline, simulate upload, jump to anniversary, reset).

---

## 8. Motion reference
| Interaction | Duration | Curve |
|---|---|---|
| Sheet slide-up | 220–260ms | easeOutExpo |
| Backdrop fade | 200ms | ease |
| Route push | 240ms | easeOutExpo |
| Toast appear / auto-dismiss | 280ms / 4.2s | easeOutExpo |
| New memory pop | 500ms | spring `(.2,1.3,.4,1)` |
| Upload progress | 1.5s | easeOut |

---

## 9. Open questions
- Can a memory be edited after save? (assume yes for v1)
- Reactions — one ♥ per partner, or freeform?
- Letters — inline reply, or only a new letter back?
- Anniversary — auto-generated from start date, or user-created collection?
- Couple-space provisioning — invite link vs. pairing code?
- Place autocomplete provider — Google / Mapbox / Apple?

---

*Companion to `Dear Us - Prototype.html`. Tokens and component names in this doc map
1:1 to the prototype source.*
