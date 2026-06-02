import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C63FF",
          50: "#EEE EFF",
          100: "#D5D0FF",
          200: "#B3A8FF",
          300: "#9175FF",
          400: "#7B63FF",
          500: "#6C63FF",
          600: "#5A4FE6",
          700: "#4A42CC",
          800: "#3A3499",
          900: "#2A2673",
        },
        accent: {
          DEFAULT: "#00D4FF",
          50: "#E6FAFF",
          100: "#B3F0FF",
          200: "#80E6FF",
          300: "#4DDBFF",
          400: "#1AD1FF",
          500: "#00D4FF",
          600: "#00AACC",
          700: "#008099",
          800: "#005566",
          900: "#002B33",
        },
        dark: {
          DEFAULT: "#0B1020",
          50: "#1A1F35",
          100: "#151A2E",
          200: "#111627",
          300: "#0D1222",
          400: "#0B1020",
          500: "#080C1A",
          600: "#050815",
          700: "#03050F",
          800: "#010308",
          900: "#000104",
        },
        surface: {
          light: "rgba(255,255,255,0.05)",
          dark: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "marquee": "marquee 30s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(108, 99, 255, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(108, 99, 255, 0.6)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;