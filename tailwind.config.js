/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        hover: "var(--hover-color)",
        text: "var(--text-color)",
        background: "var(--background-color)",
      },
    },
  },
  // other configurations...
};
