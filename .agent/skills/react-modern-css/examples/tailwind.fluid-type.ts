// tailwind.fluid-type.ts
// Fluid typography scale using clamp().
// Merge the `fontSize` block into your tailwind.config.ts theme.extend.
//
// These sizes scale smoothly between mobile and desktop without discrete
// breakpoint class stacks. Use for headings and display text.
// Use fixed Tailwind sizes (text-sm, text-base, etc.) for body and UI labels.
//
// How clamp() works:
//   clamp(MIN, PREFERRED, MAX)
//   PREFERRED = a vw-based value that grows with the viewport
//   Browser picks the value within the MIN–MAX range

export const fluidTypography = {
  fontSize: {
    // Body
    "fluid-sm":   ["clamp(0.8rem,  0.7rem + 0.4vw,  0.9rem)",  { lineHeight: "1.6" }], // 12.8–14.4px
    "fluid-base": ["clamp(0.9rem,  0.8rem + 0.5vw,  1rem)",    { lineHeight: "1.6" }], // 14.4–16px
    "fluid-lg":   ["clamp(1rem,    0.9rem + 0.6vw,  1.125rem)",{ lineHeight: "1.5" }], // 16–18px

    // Headings
    "fluid-xl":   ["clamp(1.125rem, 1rem   + 0.75vw, 1.5rem)", { lineHeight: "1.4" }], // 18–24px
    "fluid-2xl":  ["clamp(1.5rem,   1.2rem + 1.5vw,  2.25rem)",{ lineHeight: "1.3" }], // 24–36px
    "fluid-3xl":  ["clamp(2rem,     1.5rem + 2.5vw,  3rem)",   { lineHeight: "1.2" }], // 32–48px

    // Display
    "fluid-4xl":  ["clamp(2.5rem,   1.8rem + 3.5vw,  4rem)",   { lineHeight: "1.1" }], // 40–64px
    "fluid-5xl":  ["clamp(3rem,     2rem   + 5vw,    5.5rem)", { lineHeight: "1.0" }], // 48–88px
  },
} as const;

// Usage in tailwind.config.ts:
//
//   import { fluidTypography } from "./tailwind.fluid-type";
//
//   export default {
//     theme: {
//       extend: {
//         ...fluidTypography,
//       },
//     },
//   };
//
// Usage in components:
//
//   <h1 className="text-fluid-4xl font-bold text-balance">Hero heading</h1>
//   <h2 className="text-fluid-2xl font-semibold">Section heading</h2>
//   <p  className="text-fluid-base">Body text</p>
