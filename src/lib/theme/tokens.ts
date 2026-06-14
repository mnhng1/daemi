import type { ViewStyle } from "react-native";

export const colors = {
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
} as const;

// Font families — mirrors the prototype `hand` theme (09-app-shell.js:19):
// head "Caveat" (cursive display), ui "Patrick Hand". Loaded in app/_layout.tsx.
export const fonts = {
  display: "Caveat_700Bold", // headings: title, dates, month markers, today, empty heading
  displayRegular: "Caveat_400Regular",
  ui: "PatrickHand_400Regular", // chips, day-of-week, counts, zoom labels, ghost text, subtitle
  letter: "CormorantInfant_400Regular_Italic",
} as const;

export const cardShadow: ViewStyle = {
  shadowColor: "#46301c",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 3,
};
