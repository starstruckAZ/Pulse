/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#050508",
          0: "#0a0a10",
          1: "#0f0f18",
          2: "#151520",
          3: "#1c1c2b",
          4: "#24243a",
        },
        accent: {
          DEFAULT: "#ff6b4a",
          end: "#ff3d71",
          soft: "rgba(255,107,74,0.08)",
        },
        brand: {
          DEFAULT: "#6366f1",
          end: "#a78bfa",
          soft: "rgba(99,102,241,0.08)",
        },
        teal: {
          DEFAULT: "#2dd4bf",
          soft: "rgba(45,212,191,0.08)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
        "5xl": "2rem",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      fontSize: {
        "display-xl": ["5rem", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-lg": ["3.75rem", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-md": ["2.5rem", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      animation: {
        "fade-in": "fadeIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
        "slide-in": "slideIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        float: "float 8s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite alternate",
        "spin-slow": "spin 12s linear infinite",
        "gradient-shift": "gradientShift 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(4px) rotate(-1deg)" },
        },
        glow: {
          "0%": { opacity: "0.3" },
          "100%": { opacity: "0.6" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
