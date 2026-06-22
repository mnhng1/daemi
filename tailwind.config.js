/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Colours resolve from CSS variables so the appearance toggle (Scrapbook ↔
      // Monochrome) can swap them at runtime. Scrapbook defaults live in
      // global.css :root; the monochrome override is applied at the app root via
      // vars() (see src/lib/theme/css-vars.ts). `accent` is RGB-triplet form so
      // opacity modifiers like `bg-accent/50` still work.
      // Each var() carries the scrapbook value as an inline fallback, so the live
      // app renders correctly even if the runtime doesn't resolve :root — the
      // monochrome vars() override (applied at the root) still wins when present.
      colors: {
        ink: {
          DEFAULT: "var(--ink, #2a2520)",
          2: "var(--ink-2, #5a4f44)",
          3: "var(--ink-3, #9a8e80)",
          4: "var(--ink-4, #d6cbb9)",
        },
        paper: "var(--paper, #faf6ef)",
        shade: "var(--shade, #f1ead9)",
        accent: {
          DEFAULT: "rgb(var(--accent-rgb, 140 90 124) / <alpha-value>)",
          soft: "var(--accent-soft, #ead4df)",
        },
        highlight: "var(--highlight, #f5e6b0)",
        surface: { DEFAULT: "var(--surface, #fffdf8)", 2: "var(--surface-2, #efe7d5)" },
        "letter-paper": "var(--letter-paper, #fdf8ea)",
        destructive: "var(--destructive, #dc2626)",
      },
      fontFamily: {
        letter: ['CormorantInfant_400Regular_Italic'],
        'letter-title': ['CormorantInfant_600SemiBold'],
        display: ['Caveat_700Bold'],
        ui: ['PatrickHand_400Regular'],
      },
    },
  },
  plugins: [],
};
