import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
        ],
      },
    },
  },
  // IMPORTANT: plugin must be here and imported via ESM
  plugins: [daisyui],

  // Optional theme (won't block btn styles if omitted)
  daisyui: {
    themes: [
      {
        mehmet: {
          primary: "#2F6E8E",
          secondary: "#9A6C3A",
          accent: "#6CBE8E",
          neutral: "#2A2A2A",
          "base-100": "#FAFAF9",
          "base-200": "#F1F1EF",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "light",
    ],
  },
};
