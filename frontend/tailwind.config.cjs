/** @type {import('tailwindcss').Config} */
const theme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1600px",
      },
      colors: {
        text: {
          light: "#D5DBE7",
        },
        neutral: {
          light: "#D5DBE7",
          900: "#1E2227",
          800: "#23272E",
          700: "#31343B",
        },
      },
      dropShadow: {
        timer: "8px 0px 16px rgba(0,0,0,0.3)",
      },
      fontFamily: {
        sans: ["Inter", ...theme.fontFamily.sans],
        pseudoMono: ["IBM Plex Mono", ...theme.fontFamily.mono],
        mono: ["IBM Plex Mono", "Menlo", ...theme.fontFamily.mono],
      },
      gridTemplateColumns: {
        60: "repeat(40, minmax(0,1fr))",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp"), require("@tailwindcss/typography")],
};
