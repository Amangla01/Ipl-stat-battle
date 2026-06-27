/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        game: {
          bg:       "#0B1220",
          surface:  "#111827",
          card:     "#1E293B",
          border:   "#2D3748",
          blue:     "#2563EB",
          "blue-l": "#3B82F6",
          gold:     "#F59E0B",
          "gold-l": "#FACC15",
          danger:   "#EF4444",
          success:  "#22C55E",
        },
      },
      boxShadow: {
        "glow-blue":  "0 0 20px rgba(37,99,235,0.4), 0 0 40px rgba(37,99,235,0.2)",
        "glow-gold":  "0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.25)",
        "glow-red":   "0 0 20px rgba(239,68,68,0.4)",
        "glow-green": "0 0 20px rgba(34,197,94,0.4)",
        "card":       "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        "card-hover": "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
      },
      animation: {
        "glow-pulse":    "glowPulse 2s ease-in-out infinite",
        "gold-pulse":    "goldPulse 1.5s ease-in-out infinite",
        "float":         "float 6s ease-in-out infinite",
        "orb-drift":     "orbDrift 20s ease-in-out infinite",
        "shimmer":       "shimmer 2.5s infinite",
        "slide-up":      "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-in-right":"slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":      "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
        "winner-glow":   "winnerGlow 0.8s ease-in-out infinite alternate",
        "count-up":      "countUp 0.4s ease-out forwards",
        "card-deal":     "cardDeal 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "ticker":        "ticker 1s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 10px rgba(37,99,235,0.3)" },
          "50%":     { boxShadow: "0 0 25px rgba(37,99,235,0.7), 0 0 50px rgba(37,99,235,0.3)" },
        },
        goldPulse: {
          "0%,100%": { boxShadow: "0 0 12px rgba(245,158,11,0.4)" },
          "50%":     { boxShadow: "0 0 30px rgba(245,158,11,0.8), 0 0 60px rgba(245,158,11,0.3)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        orbDrift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "25%":     { transform: "translate(40px,-30px) scale(1.06)" },
          "50%":     { transform: "translate(-20px,20px) scale(0.94)" },
          "75%":     { transform: "translate(20px,30px) scale(1.03)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        winnerGlow: {
          "0%":   { boxShadow: "0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.2)" },
          "100%": { boxShadow: "0 0 40px rgba(245,158,11,0.9), 0 0 80px rgba(245,158,11,0.4)" },
        },
        cardDeal: {
          "0%":   { opacity: "0", transform: "translateY(-60px) rotate(-6deg) scale(0.8)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg) scale(1)" },
        },
        ticker: {
          "0%,100%": { transform: "scale(1)" },
          "50%":     { transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};
