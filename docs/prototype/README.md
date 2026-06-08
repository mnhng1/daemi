# "Dear Us" design prototype — decoded source

This folder holds the **readable source** extracted from the standalone design
prototype `Dear Us - Prototype (standalone).html`.

That HTML file is a single-file, browser-runnable hi-fi mockup of the app
(React + Babel, all assets base64-embedded, ~1.8 MB). It is the **design
north-star** for the real Expo/React Native app — not shippable code. The HTML
itself is git-ignored (large, generated); these decoded `.js`/`.jsx` files are
kept in the repo so the design intent is diffable against the real
implementation.

## Files (`src/`)

Listed in the load order they run in the prototype.

| File | What it is |
| --- | --- |
| `00-data.js` | Fictional couple (Alex/Jordan) + ~30 memories, 4 collections, CSS "scene" gradients used in place of real photos, date helpers. Exposed as `window.DU`. |
| `01-tweaks-panel.jsx` | Generic design-tool "Tweaks" dev harness (not app-specific). |
| `02-ui-primitives.js` | Icons, `SceneFill`, phone frame, header, bottom nav, atoms (Chip, Btn, Field, Sticker…). Theme via CSS vars. |
| `03-memory-cards.js` | Per-type cards: photo/video, letter, ticket, day-album cluster. `MemoryCard` dispatches by type. |
| `04-timeline.js` | Home timeline — vertical spine, dated nodes; day / month / year zoom levels; type filters. |
| `05-add-composer.js` | Add-a-memory flow: type picker → composer (photo/video/letter/ticket), place + collection pickers. |
| `06-detail-views.js` | Full-screen memory detail per type + day-gallery masonry. |
| `07-collections.js` | Collections list, detail (grouped by day), create sheet. |
| `08-places-search.js` | Places lens, search, offline/uploading network visuals. |
| `09-app-shell.js` | App shell: state, theming (accents/fonts/dark), routing, overlays, side panel. |

## Re-extracting from the HTML

The HTML embeds these as gzipped base64 blobs in a `__bundler/manifest`
`<script>` tag, keyed by UUID. To regenerate, parse the manifest, base64-decode,
gunzip the `compressed` entries, and write the `application/javascript` /
`text/jsx` ones (skip `font/woff2` and the React/Babel vendor bundles).
