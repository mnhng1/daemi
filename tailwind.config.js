/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#2a2520", 2: "#5a4f44", 3: "#9a8e80", 4: "#d6cbb9" },
        paper: "#faf6ef",
        shade: "#f1ead9",
        accent: { DEFAULT: "#8c5a7c", soft: "#ead4df" },
        highlight: "#f5e6b0",
        surface: { DEFAULT: "#fffdf8", 2: "#efe7d5" },
        "letter-paper": "#fdf8ea",
        destructive: "#DC2626",
      },
    },
  },
  plugins: [],
};
