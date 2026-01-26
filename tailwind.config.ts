import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#fc8c31",
        "highlight-blue": "#0c6cfc",
        "buffest-dark": "#1a140f",
        "buffest-orange": "#fc8c31",
        "background-light": "#f6f5f2",
        "background-dark": "#23180f",
        "buffests-text": "#1b202d",
        "buffests-orange": "#f97316",
      },
      fontFamily: {
        display: ["Be Vietnam Pro", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;