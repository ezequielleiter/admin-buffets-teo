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
        // Colores principales (formas grandes)
        primary: "#72a0fd",
        secondary: "#93b6fd",
        "surface-dark": "#1b202d",
        "surface-light": "#f6f5f2",
        
        // Colores de acento (formas medianas/pequeñas)
        "accent-blue": "#0c5cfc",
        "accent-orange": "#fc8d32",
        "accent-orange-intense": "#fc7100",
        
        // Colores de texto
        "text-primary": "#1b202d",
        "text-secondary": "#6b7280",
        
        // Compatibilidad con nombres antiguos
        "buffest-dark": "#1b202d",
        "buffest-orange": "#fc8d32",
        "background-light": "#f6f5f2",
        "background-dark": "#1b202d",
        "buffests-text": "#1b202d",
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