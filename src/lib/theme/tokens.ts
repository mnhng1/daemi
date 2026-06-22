// Design tokens — now a REACTIVE view over the active appearance palette.
// Public surface (`colors` / `memoryTypeColors` / `fonts` / `cardShadow`) is
// unchanged, so existing importers keep working; the values they read just track
// whichever palette is active (see palettes.ts and the appearance store).
//
// How reactivity works: each exported object keeps a STABLE reference, but its
// property reads delegate to PALETTES[active]. Components that read a token
// inline during render (e.g. style={{ color: colors.ink }}) pick up the new value
// on their next render — the app remounts the route tree on toggle so that
// happens everywhere at once. Tokens used inside a module-scope StyleSheet.create
// are snapshotted at import and must instead be read dynamically (those few files
// are converted to do so).

import type { ViewStyle } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  PALETTES,
  type Appearance,
  type ColorTokens,
  type FontTokens,
  type MemoryTypeColors,
} from "./palettes";

export const APPEARANCE_KEY = "daemi.appearance";

// Read the persisted appearance SYNCHRONOUSLY at module init, before any screen
// module evaluates its StyleSheet.create. That way module-scope styles snapshot
// the correct palette at boot and no per-file conversion is needed; switching
// appearance persists + reloads the bundle so everything re-evaluates cleanly.
function readBootAppearance(): Appearance {
  try {
    return SecureStore.getItem(APPEARANCE_KEY) === "monochrome" ? "monochrome" : "scrapbook";
  } catch {
    return "scrapbook";
  }
}

let _appearance: Appearance = readBootAppearance();
const listeners = new Set<() => void>();

export function getAppearance(): Appearance {
  return _appearance;
}

/** Swap the active palette. Call before triggering the remount. */
export function setActiveAppearance(a: Appearance): void {
  if (a === _appearance) return;
  _appearance = a;
  listeners.forEach((l) => l());
}

export function subscribeAppearance(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Build a stable object whose enumerable property reads delegate to the active
// palette. Spreading / Object.keys work (descriptors are enumerable).
function reactive<T extends object>(pick: (p: Appearance) => T): T {
  const keys = Object.keys(pick("scrapbook") as Record<string, unknown>);
  const obj: Record<string, unknown> = {};
  for (const k of keys) {
    Object.defineProperty(obj, k, {
      enumerable: true,
      get: () => (pick(_appearance) as Record<string, unknown>)[k],
    });
  }
  return obj as unknown as T;
}

export const colors: ColorTokens = reactive((a) => PALETTES[a].colors);
export const memoryTypeColors: MemoryTypeColors = reactive((a) => PALETTES[a].memoryTypeColors);
export const fonts: FontTokens = reactive((a) => PALETTES[a].fonts);

// cardShadow is spread (`...cardShadow`) into styles, so it must enumerate the
// ACTIVE palette's keys. In monochrome the palette is `{}`, yielding a flat card.
export const cardShadow: ViewStyle = new Proxy({} as ViewStyle, {
  get: (_t, p: string | symbol) => (PALETTES[_appearance].cardShadow as Record<string | symbol, unknown>)[p],
  has: (_t, p) => p in PALETTES[_appearance].cardShadow,
  ownKeys: () => Reflect.ownKeys(PALETTES[_appearance].cardShadow),
  getOwnPropertyDescriptor: (_t, p) => {
    const src = PALETTES[_appearance].cardShadow as Record<string | symbol, unknown>;
    if (!(p in src)) return undefined;
    return { enumerable: true, configurable: true, value: src[p] };
  },
});
