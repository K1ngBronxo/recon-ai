/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070B",
          900: "#0A0A0F",
          850: "#0F0F16",
          800: "#14141D",
          750: "#181824",
          700: "#1E1E2C",
          600: "#2A2A3C",
        },
        gold: {
          200: "#FBE9B7",
          300: "#F3D67A",
          400: "#E8C15A",
          500: "#D4AF37",
          600: "#B8962E",
          700: "#8F7320",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        gold: "0 0 24px rgba(212, 175, 55, 0.25)",
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.35)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212,175,55,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out both",
        pulseGold: "pulseGold 2s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        spinSlow: "spinSlow 8s linear infinite",
      },
    },
  },
  plugins: [],
};
