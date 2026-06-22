// Monochrome override for the NativeWind className layer. Applied at the app root
// (app/_layout.tsx) when appearance === "monochrome" via NativeWind's vars().
// Values are derived from PALETTES.monochrome so the className layer and the JS
// token layer never drift. Scrapbook defaults live in global.css :root, so no
// override is applied for scrapbook.

import { vars } from "nativewind";
import { PALETTES } from "./palettes";

function hexToTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const c = PALETTES.monochrome.colors;

export const monochromeVars = vars({
  "--paper": c.paper,
  "--ink": c.ink,
  "--ink-2": c.ink2,
  "--ink-3": c.ink3,
  "--ink-4": c.ink4,
  "--surface": c.surface,
  "--surface-2": c.surface2,
  "--letter-paper": c.letterPaper,
  "--destructive": c.destructive,
  "--shade": c.shade,
  "--accent-rgb": hexToTriplet(c.accent),
  "--accent-soft": c.accentSoft,
  "--highlight": c.highlight,
});
