# Monochrome ("Threads-style") Reskin — Findings & Plan

Companion to [`threads-design-reference.md`](./threads-design-reference.md) (the cited Threads
design-token spec). This doc covers (2) the component-by-component restyle plan, (3) the bug-fix
plan, and (4) the sequenced build order. **No code has been changed yet — this is for review.**

---

## 0. How the appearance system actually works (re-confirmed)

- `src/lib/theme/palettes.ts` — `scrapbook` + `monochrome` palettes (colors / memoryTypeColors /
  fonts / cardShadow). Mono = white/near-black ramp, `fonts.* = undefined` (→ system sans),
  `cardShadow = {}` (flat).
- `src/lib/theme/tokens.ts` — exports `colors` / `fonts` / `cardShadow` / `memoryTypeColors` as
  **reactive views** over `PALETTES[active]`. `getAppearance()` returns the active value;
  `readBootAppearance()` reads `SecureStore.getItem(APPEARANCE_KEY)` **synchronously at module init**.
- `appearance-store.ts` — zustand; `setAppearance()` writes SecureStore (sync) then
  `reloadAppAsync()`. **A toggle is a full JS reload** — nothing needs to re-render reactively.
- `css-vars.ts` — `monochromeVars` = NativeWind `vars()` derived from the mono palette, for the ~16
  `className`-styled files. Applied at the root.
- `tailwind.config.js` + `global.css` — `var(--x, <scrapbook-fallback>)`; scrapbook defaults in
  `:root`.

**Key consequence for structural changes:** because a toggle fully reloads the bundle and the boot
read is synchronous, **structural gating should read `getAppearance()` once (static), NOT subscribe
to the store.** Re-rendering on `appearance` is both unnecessary and the likely cause of Bug 1.

`getAppearance()` is currently used in **zero** components — all reskinning so far is token-only.
This plan introduces the first *structural* gates.

---

## 1. Bug-fix plan

### Bug 1 — Navigation-context crash (highest priority)

**Symptom:** `Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`,
stack at `app/_layout.tsx:81` (the `<View style={[{flex:1}, monochromeVars]}><Slot/></View>` wrapper).

**Diff that introduced it** (`git diff app/_layout.tsx`):
- Added `const appearance = useAppearanceStore((s) => s.appearance);` in `RootLayout`.
- Wrapped `<Slot/>` in `<View style={[{flex:1}, appearance === "monochrome" ? monochromeVars : null]}>`.

**Leading root-cause hypothesis:** subscribing `RootLayout` to the zustand store. `setAppearance`
does `set({appearance})` **then** `reloadAppAsync()`. The `set()` re-renders `RootLayout` *before*
the reload, flipping the wrapper's style between `null` and a `vars()` object. NativeWind's
css-interop treats a component with `vars()` differently from one without, so the wrapper subtree
(including `<Slot/>`) tears down/remounts mid-navigation → a navigation hook fires during teardown
with no navigator mounted → the crash. The frame resolves to line 81 because that's the wrapper.

**Primary fix (low-risk, matches the boot model):** make the root vars **static** — never subscribe.

```tsx
// app/_layout.tsx
import { getAppearance } from "../src/lib/theme/tokens";          // replace useAppearanceStore import
// ...
const monoVars = getAppearance() === "monochrome" ? monochromeVars : null;  // read once, at boot
// ...
<View style={[{ flex: 1 }, monoVars]}>
  <Slot />
</View>
```

Remove the `useAppearanceStore` subscription from `RootLayout` entirely. Toggling still works (the
reload re-reads the persisted value at boot). `RootLayout` no longer re-renders on toggle, so
`<Slot/>` mounts its wrapper exactly once and never remounts → no context teardown.

**Fallback (if the static wrapper still crashes — i.e. the wrapper View itself, not the remount, is
the problem):** apply the vars without an extra wrapper between the navigator and its provider. Move
`monoVars` onto a stable wrapper that is unambiguously a css-interop component and that does not sit
directly between `SafeAreaProvider` and `<Slot/>` — e.g. wrap the contents of each `(tabs)` / `(auth)`
group layout, or apply `vars()` via a `className` on a NativeWind `<View>` whose identity never
changes (always render the same element, vars object always present, empty `vars({})` for scrapbook).
Verify on device which is needed; the static fix is expected to be sufficient.

**Verification:** launch in scrapbook (must render unchanged), toggle to monochrome (must reload into
mono with no crash), toggle back. Confirm navigation (tab switches, push to `/memory/:id`) works in
both.

### Bug 2 — Timeline layout broken in monochrome

**Symptoms:** "weird/overlapping date info" and "no padding around the today date."

**Root causes (structural, not token):**
1. **Date column is sized for the Caveat handwriting font.** `TimelineMemoryRow` renders the date in
   a fixed `DATE_W = 46px` right-aligned column at `fontSize 15 / weight 700`, `fontFamily:
   fonts.display`. In scrapbook that's condensed Caveat; in mono `fonts.display = undefined` → the
   **wider system bold font wraps "Jun 21"** inside 46px → overlapping/"weird date." (`layout.ts:3`,
   `timeline-memory-row.tsx:22-41`.)
2. **The spine hardcodes scrapbook hex.** `timeline-spine-line.tsx:9-13` uses literal plum/taupe
   (`0x8c5a7c`…), ignoring the palette — so in mono a **plum gradient line** runs down a neutral
   feed.
3. **The whole spine + node + dashed-connector + date-column construct is a scrapbook-ism** that the
   locked design says to drop in mono (flat, hairline dividers).

**Fix:** gate the day-view structure on `getAppearance()`. In **monochrome**, render a flat
Threads-style feed (see §2.1); in **scrapbook**, the existing spine layout is untouched.

---

## 2. Component-by-component restyle plan (monochrome)

Legend: **[token]** reskins for free via palette/vars · **[gate]** needs a `getAppearance()` branch ·
**[delete-in-mono]** scrapbook decoration removed when mono.

### 2.1 Timeline — day view (the core change)  **[gate]**

Files: `timeline-day-view.tsx`, `timeline-memory-row.tsx`, `timeline-today-cap.tsx`,
`timeline-month-marker.tsx`, `timeline-spine-line.tsx`, `timeline-node.tsx`, `layout.ts`.

Monochrome day view = a **single-column flat feed**:
- **No spine, no nodes, no dashed connector, no fixed date column.** `TimelineSpineLine` renders
  `null` in mono; rows drop the date/node/connector columns.
- **Date as a left-aligned group header** (Threads has no dates, but Daemi is date-centric — the
  closest Threads idiom is a lightweight section header). One header per day: e.g. `Sat · Jun 21`,
  ~13px Semibold, `ink2`/`ink3`, with comfortable top padding (fixes "no padding around today").
- **`today` cap** → a plain "Today" header (no plum pill, no shadow) at the top with proper padding.
- **`month-marker`** → a larger left-aligned header (system Bold ~20px), no diamond node, no plum
  left-border; a hairline above it instead.
- **Memory rows** → full-width, separated by **1px full-width hairlines** (`colors.line`), ~12px
  vertical padding. No tilt (rotation forced to 0 — see 2.2).
- **`ghost` / `queued`** rows keep their meaning; queued loses the rotated "queued" Sticker → a plain
  muted label.

Scrapbook day view: **unchanged** (all of the above gated behind `getAppearance() === "monochrome"`).

Implementation note: keep `buildDayRows` data shape as-is (it already emits `today` / `month-marker` /
`memory` / `cluster` / `ghost` / `queued`). `rotation` stays in the data but is ignored in mono. The
gate lives in the timeline **components**, not in `buildDayRows`, so the row model is shared.

### 2.2 Memory cards (4 types + day album)

| Card | Scrapbook | Monochrome plan |
|---|---|---|
| `memory-card.tsx` (wrapper) | applies `rotation` tilt on press transform | **[gate]** force `rotation = 0` in mono (`memory-card.tsx:43`) — flat. |
| `photo-memory-card.tsx` | `bg-surface rounded-2xl border border-ink-4/20 shadow-sm`, photo `rounded-xl` 4:3, inner padding | **[gate]** drop card chrome: no `shadow-sm`, no card `border`, photo edge-to-edge at ~12px radius (`rounded-xl`). Photo stays full color (photo-only-color rule). Title/place/meta in system font, `ink`/`ink3`. |
| `video-memory-card.tsx` | same card chrome + play glyph + duration badge | **[gate]** same flattening; keep play glyph + duration badge (functional), neutralize overlay tints to greys. |
| `letter-memory-card.tsx` | `bg-letter-paper`, plum `borderLeft`, ruled hairlines, Cormorant italic | **[gate]** drop ruled lines + plum left-border; system font (not Cormorant); neutral `surface2` background or plain text block; `ink2` body, `ink3` meta. No accent. |
| `ticket-memory-card.tsx` | perforation cutouts, dashed line, stub panel, `shadow-sm` | **[gate]** flatten: drop shadow + card border; **decision needed** on whether to keep a subtle perforation hint or fully flatten to `[stub photo] [title/place]` row (see Questions). |
| `memory-carousel.tsx` (day album) | `bg-surface rounded-2xl border shadow-sm`, 2×2 thumb grid + "day album" pill | **[gate]** drop shadow + card border; keep the thumb grid (photos = color); neutralize the "day album"/place pills to greys; remove press tilt is N/A (no rotation here). |

Mechanism: each card reads `getAppearance()` once and swaps the wrapper `className`/style. To keep
scrapbook byte-identical, prefer a single `const mono = getAppearance() === "monochrome"` then
conditional `className` strings (the className layer already maps tokens via vars). Shadows/borders/
radius are the only structural diffs.

### 2.3 Chrome & other surfaces

| Surface | Plan |
|---|---|
| `bottom-tab-bar.tsx` | **[token]** mostly free (accent→near-black). **[gate]** flatten the FAB: in mono drop the heavy accent `shadow*`/`elevation` (lines 120-124) so the "+" is a flat near-black circle. Active tab tint is already `colors.accent` = near-black in mono. Consider icon-only/heavier weight, but labels can stay. |
| `timeline-header.tsx` | **[token]** "daemi" wordmark uses `fonts.display` → system in mono; size/weight already fine. Hairline `borderBottom` already `colors.line`. |
| `timeline-month-view.tsx` / `timeline-year-view.tsx` | **[gate]** these reuse `TimelineNode` + 46px label columns (`timeline-month-view.tsx:80-100`). Same wrap/spine issues as day view → gate to a flat layout in mono (left-aligned `wk N` / month headers, no node). |
| `sticker.tsx` | **[delete-in-mono]** used by `timeline-empty`, `timeline-memory-row` (queued), `collections`. In mono, callers render a plain label instead of the rotated washi-tape Sticker. |
| `collections/index.tsx`, `sign-in.tsx`, `ticket-detail-view.tsx` | **[gate]** rotated decorative elements (`rotate: -4deg/5deg/18deg/-1deg/0.6deg`) → 0deg in mono. |
| detail views (`photo/letter/ticket/video-detail-view.tsx`) | **[gate]** same family of flattening (ruled letter paper, ticket skeuomorphism, shadows) — lower priority than the feed but in scope for a consistent mono look. |
| `places-map.tsx`, search, add-flow composers, settings | **[token]** mostly reskin via tokens/vars; audit for stray `shadow-*`/rounded-card/accent and flatten where they read as scrapbook cards. |

---

## 3. Hard constraints (carried through every change)

- **Scrapbook stays byte-for-byte visually unchanged** — every structural change sits behind
  `getAppearance() === "monochrome"`; the scrapbook branch is the existing code.
- No data/feature changes (Supabase, realtime, offline queue, R2, search, places, collections, add,
  auth). Keep the 5-tab nav incl. the You tab.
- `npx tsc --noEmit` stays clean.
- Use `getAppearance()` (static, read once) for structural gates — **do not** subscribe to the store
  in render paths that must not re-render (esp. `RootLayout`).
- Watch the known css-interop trap: a wrapped `Pressable` ignores `style={() => …}` (function form) —
  use static object/array styles.

---

## 4. Sequenced build order

1. **Bug 1** — static root vars in `app/_layout.tsx`. Verify scrapbook + mono boot, no crash, nav
   works. *(Unblocks everything; smallest diff.)*
2. **Timeline day view (Bug 2 + 2.1)** — gate spine/node/date-column → flat feed with hairline
   dividers + date group headers + padded Today/month headers. Verify both modes on device.
3. **Memory cards (2.2)** — flatten the 4 types + day album behind the gate. Verify photo-only color.
4. **Month/year views (2.3)** — flat layout in mono.
5. **Chrome polish (2.3)** — tab-bar FAB flatten, Sticker callers, rotated decorations → 0deg.
6. **Detail views + remaining surfaces** — letter/ticket/photo/video detail, add flow, search,
   places, settings audit.
7. **Full pass** — `npx tsc --noEmit`; on-device sweep of every screen in both appearances; confirm
   scrapbook unchanged.

Each step is independently shippable and leaves scrapbook untouched.

---

## 5. Decisions (resolved)

1. **Ticket & letter cards in mono:** **fully flat.** Ticket → `[stub photo][title/place]` row, no
   perforation/cutouts/shadow. Letter → plain neutral text block, system font (drop Cormorant italic),
   no ruled lines, no plum left-border.
2. **Timeline dates in mono:** **minimal — no dates.** The mono day view is a pure continuous feed of
   full-width memories separated by 1px hairlines. Drop the `today` cap and `month-marker` rows
   entirely in mono (they're date headers); keep `ghost`/`queued` semantics as plain muted rows.
3. **Month & year views in mono:** **gallery.** Replace the spine/week/node aggregate layout with a
   photo-grid gallery (square thumbnails, ~3 columns). Month view groups by month with a plain text
   month label; year view is a per-year gallery. Photos are the only color.
4. **Scope:** build **everything** (steps 1–7) this pass.
