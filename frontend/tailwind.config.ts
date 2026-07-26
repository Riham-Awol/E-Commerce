import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E63946",
          dark: "#C42D3A",
          light: "#F5717C",
        },
        secondary: {
          DEFAULT: "#1D3557",
          dark: "#152742",
          light: "#2E4D77",
        },
        accent: {
          DEFAULT: "#F4A261",
          dark: "#E08A45",
        },
        success: {
          DEFAULT: "#2A9D8F",
          dark: "#218577",
        },
        canvas: "#F8F9FA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(29, 53, 87, 0.08)",
        "card-hover": "0 8px 28px rgba(29, 53, 87, 0.14)",
        pop: "0 12px 40px rgba(29, 53, 87, 0.18)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
