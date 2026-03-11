// tailwind.animations.ts
// @versions: tailwindcss@3.4.x
// Written for Tailwind v3 config format (tailwind.config.ts + theme.extend).
// ⚠️ Tailwind v4 uses a CSS-based @theme block — this file does NOT apply to v4.
// Merge animationTokens into your tailwind.config.ts theme.extend block.
// Merge this into your tailwind.config.ts theme.extend block

export const animationTokens = {
  transitionDuration: {
    fast:   "150ms",   // hover states, instant feedback
    normal: "300ms",   // most UI transitions
    slow:   "500ms",   // page-level reveals
    crawl:  "1000ms",  // deliberate, dramatic transitions
  },
  transitionTimingFunction: {
    "ease-spring":   "cubic-bezier(0.34, 1.56, 0.64, 1)", // spring overshoot
    "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",     // sharp deceleration
    "ease-in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",     // sharp acceleration
  },
  keyframes: {
    shimmer: {
      "0%":   { backgroundPosition: "-200% 0" },
      "100%": { backgroundPosition: "200% 0" },
    },
    "reveal-up": {
      from: { opacity: "0", transform: "translateY(16px)" },
      to:   { opacity: "1", transform: "translateY(0)" },
    },
    "reveal-down": {
      from: { opacity: "0", transform: "translateY(-16px)" },
      to:   { opacity: "1", transform: "translateY(0)" },
    },
    "fade-in": {
      from: { opacity: "0" },
      to:   { opacity: "1" },
    },
    "scale-in": {
      from: { opacity: "0", transform: "scale(0.95)" },
      to:   { opacity: "1", transform: "scale(1)" },
    },
    "slide-in-from-right": {
      from: { transform: "translateX(100%)" },
      to:   { transform: "translateX(0)" },
    },
    "slide-in-from-left": {
      from: { transform: "translateX(-100%)" },
      to:   { transform: "translateX(0)" },
    },
  },
  animation: {
    shimmer:              "shimmer 1.5s infinite linear",
    "reveal-up":          "reveal-up 0.4s ease-out-expo both",
    "reveal-down":        "reveal-down 0.4s ease-out-expo both",
    "fade-in":            "fade-in 0.3s ease-out both",
    "scale-in":           "scale-in 0.2s ease-out-expo both",
    "slide-in-right":     "slide-in-from-right 0.3s ease-out-expo both",
    "slide-in-left":      "slide-in-from-left 0.3s ease-out-expo both",
  },
} as const;

// Usage in tailwind.config.ts:
// import { animationTokens } from "./tailwind.animations";
// export default { theme: { extend: { ...animationTokens } } }
