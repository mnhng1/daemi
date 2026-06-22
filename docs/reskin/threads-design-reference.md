# Threads (Meta) — Design-Token Reference

A numbers-dense reference of Meta's Threads app design system, assembled for re-skinning a
React Native / Expo app. Threads uses the **platform system font** — SF Pro on iOS, Roboto on
Android — and relies heavily on iOS **Dynamic Type** text styles, so most type tokens map 1:1 to
Apple's standard text styles. The chrome is essentially **monochrome/neutral**: white-or-black
backgrounds, near-black/near-white text, grey secondary text, thin full-width hairlines, and
flat (card-less, shadow-less) post rows.

> **Sourcing note.** Meta does not publish an official Threads design spec. The hard numbers below
> come from (a) Ahmad Shadeed's two-part teardown of the Threads **web** app CSS (the web app shares
> Meta's "Barcelona" design tokens with the native apps), (b) community Figma teardowns, and
> (c) Apple's Human Interface Guidelines / Dynamic Type tables that the iOS app inherits. Values
> labeled **[measured/observed]** are typical on-device measurements, not published constants —
> treat them as ±1px and verify against a live build if pixel-exactness matters. Where a published
> constant exists it is labeled **[Barcelona]** or **[HIG]**.

---

## 0. Foundations

| Token | Value | Source |
|---|---|---|
| Font family (iOS) | **SF Pro** (system) | Threads uses the system font; iOS default |
| Font family (Android) | **Roboto** (system) | system default |
| Base rem (web) | 16px | CSS findings |
| Color model | Monochrome/neutral chrome; near-zero chromatic accent in feed | observed |
| Surface style | **Flat** — no cards, no shadows, no elevation in the feed | observed |

iOS default body text style is **17pt SF Pro Regular**; iOS secondary is **15pt**. Material's
defaults are **16pt Roboto** / **14pt** secondary. Threads' type scale tracks these. ([learnui /
gendesigns summary][s-fontsize])

---

## 1. Type Scale & Weights

Threads maps onto iOS Dynamic Type text styles at the **Large (default)** content-size category.
Point sizes, weights, and line-heights below are the iOS system values the app inherits ([HIG /
Dynamic Type tables][s-dyntype]); use them as the canonical token set on iOS.

| Role in Threads | iOS text style | Size (pt) | Weight | Line-height (pt) | Letter-spacing |
|---|---|---|---|---|---|
| **Post / body text** | Body | **17** (commonly rendered **15** in compact feed) | Regular (400) | 22 (Body) / ~20 at 15pt | ~0 (system tracking) |
| **Username (bold)** | Subhead/Body, bolded | **15** | **Semibold (600)** | ~20 | system tracking |
| **Timestamp / secondary metadata** | Footnote / Subhead | **13–15** | Regular (400) | 18 (Footnote) | system tracking |
| **Reply count / action labels** | Footnote | **13** | Regular/Medium | 18 | system tracking |
| **Screen header / nav title** (e.g. "Threads" wordmark, "Search") | Headline / Title3 | **17–20** | **Semibold (600) / Bold (700)** | ~22–25 | slightly tight |
| **Large screen titles** (profile name) | Title2/Title1 | **22–28** | Bold (700) | 28–34 | tight |
| **Section headers** (e.g. "Suggested", tab labels) | Footnote/Subhead | **13–15** | Semibold (600) | 18–20 | normal-to-slightly-wide |

Canonical iOS Dynamic Type reference values at default size ([s-dyntype], [s-typesys]):

| Text style | Size (pt) | Weight | Line-height (pt) |
|---|---|---|---|
| Large Title | 34 | Regular | 41 |
| Title 1 | 28 | Regular | 34 |
| Title 2 | 22 | Regular | 28 |
| Title 3 | 20 | Regular | 25 |
| Headline | 17 | **Semibold** | 22 |
| **Body** | **17** | Regular | **22** |
| Callout | 16 | Regular | 21 |
| **Subhead** | **15** | Regular | **20** |
| **Footnote** | **13** | Regular | **18** |
| Caption 1 | 12 | Regular | 16 |
| Caption 2 | 11 | Regular | 13 |

**Practical Threads mapping (recommended tokens):**

- **Post body:** 15px / Regular / lineHeight ≈ 20–21 (≈1.35×). On iOS many measure the feed body at
  15pt rather than the 17pt full Body — Threads runs a slightly compact feed. [measured/observed]
- **Username:** 15px / **Semibold 600** — same size as body, weight is the only differentiator.
- **Timestamp:** 13–15px / Regular / **secondary grey** color (see §5). Right-aligned next to username.
- **Header/wordmark:** ~17–20px / Semibold–Bold, centered.
- **Letter-spacing:** Threads uses **default system tracking** (SF Pro's optical tracking); it does
  not apply custom letter-spacing on body/username. ≈ 0. [observed]

> Notes: Threads supports **Dynamic Type** (system size scaling) but did **not** offer a custom in-app
> font-size control as of 2024 ([Threads staff post][s-camroth]). Native rich-text **bold/italic/
> underline/strikethrough** in post composition shipped Sep 2026 ([s-postformat]).

---

## 2. Spacing & Layout

| Token | Value | Source |
|---|---|---|
| **Horizontal screen padding / gutter** | **16px** each side (feed) | [measured/observed]; web desktop uses `--barcelona-desktop-page-horizontal-padding` |
| **Single-column content max-width** (web/large screen) | ~**600–620px** (`--barcelona-large-screen-max-width`; teardown references a `50% − 615px` centering calc → ~**630px** column) | [Barcelona], [s-css2] |
| **Avatar column width** (threadline) | **48px** (`--barcelona-threadline-column-width`) | [Barcelona], [s-css1] |
| **Gap between avatar and text** | derived from 36px avatar inside 48px column = **~12px** effective gap (achieved via column sizing, not CSS `gap`) | [s-css1] |
| **Post row top grid rows** | `21px` (username/header row) + `19px` (≈ 40px header block) then `max-content max-content` for body + actions | [s-css1], [s-css2] |
| **Vertical rhythm between posts** | one hairline + **~8–12px** padding above/below content per row; rows are contiguous | [measured/observed] |
| **Padding inside a post row (vertical)** | **~12px top / ~8–12px bottom** | [measured/observed] |
| **Mobile header height** | **60px** (`--barcelona-mobile-header-height`) | [Barcelona], [s-css2] |
| **Desktop header height** | **74px** (`--barcelona-desktop-header-height`) | [Barcelona], [s-css2] |
| **Avatar padding-top (fine-tune)** | **4px** (36px avatar + 4px = 40px to align with 2-row header) | [s-css1] |
| **Fixed side menu left offset (desktop)** | **32px** default; `calc(50% − 615px + 19px)` on large screens | [s-css2] |

**Post row grid (web):** a **2-column × 4-row** CSS grid — column 1 = avatar/threadline (48px),
column 2 = content; rows = `21px 19px max-content max-content` (username, handle/meta, body, action
bar). Items are placed with explicit `grid-column`/`grid-row` rather than named areas. ([s-css1])

---

## 3. Media

| Token | Value | Source |
|---|---|---|
| **Avatar shape** | **Circular** (border-radius 50%) | observed |
| **Avatar size — feed row** | **36 × 36px** (sits in a 48px column, +4px top padding) | [s-css1] |
| **Avatar size — profile header** | **~64–84px** (larger; community teardowns commonly use 64–80px) | [measured/observed] |
| **Post image / media corner radius** | **~12px** (rounded rect; community Figma kits use 8–16px, ~12px typical) | [measured/observed] |
| **Media aspect ratio handling** | Preserves source aspect ratio; tall media capped to a max height and cropped/contained within rounded container; multi-image → horizontal carousel | observed |
| **Media width** | Spans the content column (full width minus gutter), left-aligned under text | observed |

---

## 4. Dividers (the hairline between posts)

Threads uses **thin, full-width hairlines** between posts — **not cards**. The separator runs edge to
edge horizontally (full-width, **not inset** under the avatar in the main feed).

| Token | Value | Source |
|---|---|---|
| **Thickness** | **1px** (renders as a sub-pixel hairline on @2x/@3x; `0.5px`/`1px` on web; iOS native ≈ `1 / pixelRatio`) | [measured/observed], [s-css2] |
| **Width / inset** | **Full-width** edge-to-edge in the home feed (no avatar inset); some nested/reply contexts inset by the 48px avatar column | observed |
| **Color — light mode** | Very light grey hairline ≈ **`rgba(0,0,0,0.10–0.15)`** (≈ `#E5E5E5`–`#DBDBDB`); matches iOS system `separator` ≈ `rgba(60,60,67,0.29)` and `opaqueSeparator` `#C6C6C8` | [measured/observed], [HIG] |
| **Color — dark mode** | Near-black hairline ≈ **`rgba(255,255,255,0.10–0.15)`** (≈ `#262626`–`#1F1F1F`) on pure-black bg; matches iOS dark `separator` ≈ `rgba(84,84,88,0.6)` | [measured/observed], [HIG] |
| **Style** | Solid, single hairline; **no shadow, no card border, no rounded card** | observed |

> Recommended RN tokens: light separator `#DBDBDB` (or `rgba(0,0,0,0.12)`), dark separator `#262626`
> (or `rgba(255,255,255,0.12)`), `borderBottomWidth: StyleSheet.hairlineWidth`.

---

## 5. Color

Threads' chrome is **monochrome/neutral**. Brand palette is officially just **black `#000000`** and
**white `#FFFFFF`** ([brandcolorcode][s-brand]). There is no prominent chromatic accent in the feed;
the only color appears in user media, link previews, and the "liked" heart.

### Light mode

| Role | Value | Notes |
|---|---|---|
| **Background** | **`#FFFFFF`** | pure white |
| **Primary text** | **near-black `#000000`** (often softened to `#0A0A0A`/`#101010`) | post body, username |
| **Secondary text** (timestamp, handle, meta, counts) | **grey ≈ `#999999`** (range `#8E8E93`–`#999999`; iOS `secondaryLabel` `rgba(60,60,67,0.6)`) | de-emphasized |
| **Tertiary / placeholder** | **`#C7C7CC`–`#B0B0B0`** | placeholders, disabled |
| **Separator / hairline** | `#DBDBDB` / `rgba(0,0,0,0.12)` | see §4 |
| **Icons (chrome)** | near-black `#000000` | monochrome |

### Dark mode (pure-black)

| Role | Value | Notes |
|---|---|---|
| **Background** | **`#000000`** (true black — OLED) | not the `#121212` Material grey; Threads uses pure black |
| **Primary text** | **near-white `#FFFFFF`** (sometimes `#F5F5F5`) | post body, username |
| **Secondary text** | **grey ≈ `#777777`–`#8E8E93`** | iOS dark `secondaryLabel` `rgba(235,235,245,0.6)` |
| **Elevated surface** (modals, compose sheet) | very dark grey **`#101010`–`#181818`** | slight elevation off pure black |
| **Separator / hairline** | `#262626` / `rgba(255,255,255,0.12)` | see §4 |
| **Icons (chrome)** | near-white `#FFFFFF` | monochrome |

> Dark mode follows the **system appearance** (no in-app toggle on mobile; web has an Appearance
> setting) ([Threads staff posts][s-darkmode]). **Accent usage is minimal** — the like/heart turns
> red (`~#FF3040`) when active; otherwise the UI is grayscale.

---

## 6. Iconography & Tab Bar

| Token | Value | Source |
|---|---|---|
| **Default icon style** | **Outline / stroke** (thin line icons), monochrome | observed |
| **Active/selected style** | Threads keeps the **outline** style and conveys selection via **fill/weight + full-opacity color** (active = solid black/white, inactive = grey), rather than swapping to a colored filled glyph | observed |
| **Tab-bar icon size** | **~28–30px** glyph (iOS tab-bar custom-icon footprint) | [measured/observed], [HIG] |
| **Post action icon size** (heart, reply, repost, share) | **~22–24px** | [measured/observed] |
| **Tab bar items** | **5 tabs**, grid `repeat(5, 20%)`: Home, Search, Compose (center), Activity, Profile | [s-css2] |
| **Tab bar style** | Flat bar, **no labels** (icon-only), monochrome; selected = solid/high-contrast, unselected = grey | observed |
| **Compose button** | Center tab; on mobile a rounded-rect "pencil" icon (visually weightier) | observed |

> iOS HIG convention is that tab bars prefer **filled** SF Symbols tinted with the app **accent color**
> when selected ([HIG tab bars][s-tabbar]). **Threads deliberately diverges**: it uses outline icons and
> monochrome (black/white) selection instead of an accent tint — part of its neutral aesthetic.

---

## 7. Motion

| Transition | Behavior | Source |
|---|---|---|
| **Post / list entrance** | Subtle **fade-in** as content loads | observed, [s-raw] |
| **Tab switching (web/desktop)** | Active-tab indicator **slides** via `translateX` offsets (Home `+52px`, Search `+26px`, Activity `−26px`, Profile `−52px`, symmetric around center compose) | [s-css2] |
| **Like / heart** | Quick scale/pop with color change to red on tap | observed |
| **Pull-to-refresh** | Standard iOS elastic refresh; minimal custom spinner | observed |
| **Overall character** | Restrained, system-native easing; no flashy/long animations — emphasis on a clean, uncluttered feel | [s-raw] |

---

## 8. Post Row Structure (summary)

```
┌──────────────────────────────────────────────────────────┐
│  [avatar 36px]   username (15px, Semibold 600)   · time   │  ← row: avatar left, content right
│   (48px col)     handle/meta (13–15px, grey)              │
│                  post body text (15px, Regular, ~20 lh)   │
│                  [media: full content-width, ~12px radius]│
│                  ♡  💬  🔁  ↗   (action icons ~22–24px)    │
└──────────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────────── ← full-width 1px hairline (#DBDBDB / #262626)
   (next post, contiguous — no card, no shadow, no gap card)
```

Key structural rules:

1. **Avatar left, content right.** Avatar = 36px circle in a 48px column; content fills the rest.
2. **Full-width rows.** Each post spans edge-to-edge with **16px horizontal gutters**; content
   column starts after the 48px avatar column.
3. **Flat — no cards, no shadows, no borders around the post.** Surfaces are flush with the page bg.
4. **Continuous list with hairline separators.** A single **1px full-width** hairline divides each
   post; rows are contiguous (no inter-card spacing).
5. **Monochrome chrome.** Text/icons are black-on-white (light) or white-on-black (dark); the only
   chromatic color comes from user media and the active like-heart.

---

## Sources

- Ahmad Shadeed — *CSS Findings From The Threads App* (Part 1): <https://ishadeed.com/article/threads-app-css/> — `[s-css1]` — avatar 36px / 48px column / 4px padding-top / 21px+19px grid rows / 2-col grid layout.
- Ahmad Shadeed — *CSS Findings From The Threads App: Part 2*: <https://ishadeed.com/article/threads-app-css-part-2/> — `[s-css2]` — Barcelona vars (mobile header 60px, desktop header 74px, threadline column width 48px), `repeat(5,20%)` nav grid, translateX tab offsets, `50% − 615px` centering, 500+ CSS vars.
- Raw.Studio — *Unravelling the UX/UI Magic of Threads App*: <https://raw.studio/blog/unraveling-the-ux-ui-magic-of-threads-app/> — `[s-raw]` — minimalist/white-space principles, fade-in motion, visual hierarchy.
- Apple HIG — *Typography* / Dynamic Type tables (Body 17pt, Subhead 15pt, Footnote 13pt, Headline 17pt Semibold, line-heights): <https://developer.apple.com/design/human-interface-guidelines/typography> — `[s-dyntype]`.
- Typography System Guide (iOS & Android) — Dynamic Type point sizes & line-heights table: <https://alansdead.github.io/typography-system-guide/> — `[s-typesys]`.
- Apple HIG — *Tab bars* (iOS prefers filled, accent-tinted selection — the convention Threads diverges from): <https://developer.apple.com/design/human-interface-guidelines/tab-bars> — `[s-tabbar]`.
- learnui.design / gendesigns — iOS 17pt body / 15pt secondary, Material 16pt / 14pt defaults: <https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html>, <https://gendesigns.ai/blog/app-typography-guide-ios-android> — `[s-fontsize]`.
- BrandColorCode — Threads brand colors (`#000000`, `#FFFFFF`): <https://www.brandcolorcode.com/threads> — `[s-brand]`.
- Threads staff posts — dark mode follows system appearance: <https://www.threads.com/@threads/post/C__boKrxdsx>, <https://www.threads.com/@threads/post/C0uU9m_uGPs> — `[s-darkmode]`.
- Threads staff post — supports Dynamic Type, no custom font-size control (2024): <https://www.threads.com/@camroth/post/C6pw075r8-W> — `[s-camroth]`.
- StoreDropship / aicarousels — native bold/italic/underline/strikethrough in posts (Sep 2026): <https://storedropship.in/blog/threads-post-formatter/> — `[s-postformat]`.
- Community Figma teardowns (avatar/profile sizes, media radius cross-checks): <https://www.figma.com/community/file/1263014802703415507/threads-app-ui-design-12-screens>, <https://www.figma.com/community/file/1258800655010092614/threads-ui-screens>.

> **Caveats:** Threads has **no public design spec**; native-app pixel values are not published.
> `[Barcelona]` constants and grid structure come from the web-app CSS (shared token system).
> `[measured/observed]` values (post-body 15pt, gutters 16px, media radius ~12px, separator rgba,
> profile avatar size, icon sizes) are typical on-device measurements — verify against a live build
> for pixel-exact work.
