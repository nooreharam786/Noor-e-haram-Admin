import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          deep: "#0B3D2E",
          light: "#147A5B",
          mist: "#E8F3EE"
        },
        gold: {
          DEFAULT: "#C8A951",
          light: "#E9D891",
          soft: "#F7F0D7"
        },
        cream: "#F7F3EA",
        ink: "#2E2923"
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 8px 30px -8px rgba(46, 41, 35, 0.12)",
        elevated: "0 20px 50px -15px rgba(46, 41, 35, 0.16)",
        emerald: "0 12px 30px -12px rgba(11, 61, 46, 0.45)",
        gold: "0 12px 30px -12px rgba(200, 169, 81, 0.5)"
      }
    }
  },
  plugins: []
} satisfies Config;
