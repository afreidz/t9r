/** @type {import('tailwindcss').Config} */
const theme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        text: {
          light: "#D5DBE7",
        },
        neutral: {
          light: "#D5DBE7",
          900: "#1E2227",
          800: "#23272E",
        },
      },
      fontFamily: {
        sans: ["Inter", ...theme.fontFamily.sans],
        pseudoMono: ["Space Grotesk", ...theme.fontFamily.mono],
        mono: ["Space Mono", "Menlo", ...theme.fontFamily.mono],
      },
      gridTemplateColumns: {
        60: "repeat(40, minmax(0,1fr))",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};
