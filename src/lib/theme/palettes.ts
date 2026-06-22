// Dual design palettes for the appearance toggle.
//   • scrapbook  — the original warm, handwritten identity (unchanged values).
//   • monochrome — the "Threads-styled" reskin: white/near-black, system sans,
//     flat (no shadows). The only saturated colour left in the app is real
//     photography (memory media) and the reaction heart.
//
// tokens.ts re-exports `colors` / `fonts` / `cardShadow` / `memoryTypeColors`
// as reactive views over the ACTIVE palette, so the 55 files that already import
// them reskin without changes when the appearance flips.

import type { ViewStyle } from "react-native";

export type Appearance = "scrapbook" | "monochrome";

export interface ColorTokens {
  ink: string;
  ink2: string;
  ink3: string;
  ink4: string;
  surface: string;
  surface2: string;
  letterPaper: string;
  destructive: string;
  paper: string;
  shade: string;
  accent: string;
  accentSoft: string;
  highlight: string;
  line: string;
  accentText: string;
  // The one saturated colour the monochrome chrome keeps: the reaction heart.
  heart: string;
}

export type MemoryTypeColors = Record<"photo" | "video" | "letter" | "ticket", string>;

// `undefined` family → React Native falls back to the system sans, which is
// exactly what the monochrome type ramp wants.
export interface FontTokens {
  display: string | undefined;
  displayRegular: string | undefined;
  ui: string | undefined;
  hand: string | undefined;
  letter: string | undefined;
}

export interface Palette {
  colors: ColorTokens;
  memoryTypeColors: MemoryTypeColors;
  fonts: FontTokens;
  cardShadow: ViewStyle;
}

// ── Scrapbook (original) ──────────────────────────────────────
const scrapbook: Palette = {
  colors: {
    ink: "#2a2520",
    ink2: "#5a4f44",
    ink3: "#9a8e80",
    ink4: "#d6cbb9",
    surface: "#fffdf8",
    surface2: "#efe7d5",
    letterPaper: "#fdf8ea",
    destructive: "#DC2626",
    paper: "#faf6ef",
    shade: "#f1ead9",
    accent: "#8c5a7c",
    accentSoft: "#ead4df",
    highlight: "#f5e6b0",
    line: "rgba(44,38,32,0.13)",
    accentText: "#74506a",
    heart: "#8c5a7c", // scrapbook hearts use the plum accent
  },
  memoryTypeColors: {
    photo: "#9a8e80",
    video: "#5f8a84",
    letter: "#b89aae",
    ticket: "#8c5a7c",
  },
  fonts: {
    display: "Caveat_700Bold",
    displayRegular: "Caveat_400Regular",
    ui: "PatrickHand_400Regular",
    hand: "Caveat_400Regular",
    letter: "CormorantInfant_400Regular_Italic",
  },
  cardShadow: {
    shadowColor: "#46301c",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ── Monochrome ("Threads-styled") ─────────────────────────────
const monochrome: Palette = {
  colors: {
    ink: "#0a0a0a",
    ink2: "#4d4d4d",
    ink3: "#999999",
    ink4: "#dcdcdc",
    surface: "#ffffff",
    surface2: "#f5f5f5",
    letterPaper: "#f5f5f5",
    destructive: "#DC2626",
    paper: "#ffffff",
    shade: "#f0f0f0",
    // No saturated accent in the chrome — active states / the FAB read near-black.
    accent: "#0a0a0a",
    accentSoft: "#f0f0f0",
    highlight: "#ececec",
    line: "rgba(0,0,0,0.10)",
    accentText: "#0a0a0a",
    heart: "#ff3b5c",
  },
  memoryTypeColors: {
    // distinct by lightness so the year-density bars stay legible in mono
    photo: "#999999",
    video: "#5e5e5e",
    letter: "#c2c2c2",
    ticket: "#0a0a0a",
  },
  fonts: {
    display: undefined,
    displayRegular: undefined,
    ui: undefined,
    hand: undefined,
    letter: undefined,
  },
  // Flat: separation comes from hairline dividers, not shadows.
  cardShadow: {},
};

export const PALETTES: Record<Appearance, Palette> = { scrapbook, monochrome };
