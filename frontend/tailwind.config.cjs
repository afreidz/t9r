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
        sans: ["Menlo", ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};
