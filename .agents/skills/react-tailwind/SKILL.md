---
name: react-tailwind
description: |
  LOAD AUTOMATICALLY for: Tailwind CSS, tailwind, tw, styling, CSS,
  colors, color tokens, design tokens, background color, text color,
  foreground, theme, dark mode, light mode, theme toggle, CSS variables,
  @theme, @theme inline, @layer, tailwind config, tailwind.config.ts, index.css,
  @import tailwindcss, container queries, responsive design, breakpoints,
  sm: md: lg: xl: prefixes, cn() utility, clsx, class-variance-authority,
  tw-animate-css, tailwindcss-animate, OKLCH, oklch, hsl colors, vite tailwind,
  @tailwindcss/vite, PostCSS, spacing, padding, margin, gap, flex, grid,
  any component styling work, any UI layout work, ThemeProvider, color contrast,
  design tokens, @custom-variant, @variant, color system, surface hierarchy.
  Load before writing any CSS or Tailwind classes.
---

# Tailwind CSS Standards

## TW0. Version Check — Always First

Before writing any Tailwind code or config:

```bash
cat package.json | grep tailwindcss
```

Then follow the correct column:

| | Tailwind v4 | Tailwind v3 |
|---|---|---|
| **Config file** | `src/index.css` only — NO `tailwind.config.ts` | `tailwind.config.ts` |
| **Entry directive** | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| **Vite plugin** | `@tailwindcss/vite` (preferred) or PostCSS | PostCSS with `tailwindcss` plugin |
| **Dark mode** | `@custom-variant dark (&:is(.dark, .dark *))` in CSS | `darkMode: 'class'` in `tailwind.config.ts` |
| **Theme extension** | `@theme inline { --color-x: var(--x); }` in CSS | `extend: { colors: { x: '...' } }` in config |
| **Color format** | OKLCH (default) | HSL |
| **Container queries** | Native — no plugin | `@tailwindcss/container-queries` plugin required |
| **Animation** | `tw-animate-css` (NOT tailwindcss-animate) | `tailwindcss-animate` |
| **components.json** | `tailwind.config` must be `""` (empty string) | Path to `tailwind.config.ts` |

When unsure about a specific feature: call Context7 with the exact version — `tailwindcss v4 dark mode` not just `tailwindcss dark mode`.

> ⚠️ **CRITICAL — Vite Plugin vs PostCSS:**
> In Tailwind v4 with Vite, ALWAYS use `@tailwindcss/vite` plugin (Tier 1).
> PostCSS is fallback only. Check `vite.config.ts` for which is used:
> ```bash
> cat vite.config.ts | grep -E "tailwindcss|postcss"
> ```

---

## TW1. v4 — Full Setup Pattern (OKLCH + @theme inline)

> ⚠️ **CRITICAL BUG PREVENTION:** Use `@theme inline`, NOT bare `@theme`.
> Bare `@theme` bakes values at build time → dark mode CSS variable changes
> happen at runtime → dark mode BREAKS. `@theme inline` preserves the
> `var()` reference so runtime changes work correctly.

```css
/* src/index.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Dark mode via class toggle on <html> */
@custom-variant dark (&:is(.dark, .dark *));

/* Semantic token values in OKLCH (Tailwind v4 default color space) */
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0.02 260);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0.02 260);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0.02 260);
    --primary: oklch(0.55 0.18 260);
    --primary-foreground: oklch(0.98 0 0);
    --secondary: oklch(0.96 0.01 260);
    --secondary-foreground: oklch(0.145 0.02 260);
    --muted: oklch(0.96 0.01 260);
    --muted-foreground: oklch(0.45 0.02 260);
    --accent: oklch(0.96 0.01 260);
    --accent-foreground: oklch(0.145 0.02 260);
    --destructive: oklch(0.42 0.20 25);
    --destructive-foreground: oklch(0.98 0 0);
    --success: oklch(0.50 0.16 145);
    --success-foreground: oklch(0.98 0 0);
    --warning: oklch(0.70 0.16 75);
    --warning-foreground: oklch(0.20 0.02 75);
    --border: oklch(0.88 0.01 260);
    --input: oklch(0.88 0.01 260);
    --ring: oklch(0.55 0.18 260);
    --radius: 0.625rem;
  }
  .dark {
    --background: oklch(0.14 0.01 260);
    --foreground: oklch(0.94 0.01 260);
    --card: oklch(0.17 0.01 260);
    --card-foreground: oklch(0.94 0.01 260);
    --popover: oklch(0.17 0.01 260);
    --popover-foreground: oklch(0.94 0.01 260);
    --primary: oklch(0.62 0.20 260);
    --primary-foreground: oklch(0.10 0.01 260);
    --secondary: oklch(0.20 0.01 260);
    --secondary-foreground: oklch(0.94 0.01 260);
    --muted: oklch(0.20 0.01 260);
    --muted-foreground: oklch(0.60 0.02 260);
    --accent: oklch(0.20 0.01 260);
    --accent-foreground: oklch(0.94 0.01 260);
    --destructive: oklch(0.60 0.22 25);
    --destructive-foreground: oklch(0.98 0 0);
    --success: oklch(0.55 0.18 145);
    --success-foreground: oklch(0.98 0 0);
    --warning: oklch(0.72 0.18 75);
    --warning-foreground: oklch(0.20 0.02 75);
    --border: oklch(0.24 0.01 260);
    --input: oklch(0.24 0.01 260);
    --ring: oklch(0.62 0.20 260);
  }
}

/* Map tokens → Tailwind utility classes via @theme inline */
/* MUST use @theme inline — NOT @theme — to preserve var() references at runtime */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Why `@theme inline` and not `@theme`

```css
/* ❌ WRONG — @theme bakes values at build time */
@theme {
  --color-background: oklch(var(--background)); /* frozen at build */
}
.dark { --background: oklch(0.14 0.01 260); } /* runtime change — too late! */

/* ✅ CORRECT — @theme inline preserves var() references at runtime */
@theme inline {
  --color-background: var(--background); /* re-evaluated when .dark is toggled */
}
.dark { --background: oklch(0.14 0.01 260); } /* runtime change — works! */
```

### Why OKLCH and not HSL

Tailwind CSS v4 defaults to OKLCH. Benefits:
- **Perceptual uniformity** — equal lightness steps look equal to humans
- **Wider gamut** — access to P3 display colors
- **Better dark mode** — slight chroma increase makes colors appear equally vivid
- **Native Tailwind** — all built-in Tailwind v4 colors are OKLCH

If the project already uses HSL: keep it for consistency, but prefer OKLCH for new projects.

---

## TW1.1 v4 — Vite Configuration

```ts
// vite.config.ts — Tailwind v4 with Vite
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
});
```

> ⚠️ Do NOT add `tailwindcss` to `postcss.config.js` when using `@tailwindcss/vite`.
> They are mutually exclusive.

---

## TW1.2 ThemeProvider Pattern (v4)

```tsx
// components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: { children: ReactNode; defaultTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored ?? defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## TW2. v3 — Full Setup Pattern

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

```css
/* src/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { /* HSL vars */ }
  .dark { /* HSL dark vars */ }
}
```

---

## TW3. Class Rules — Both Versions

- `cn()` from `lib/utils.ts` for all conditional classes. Never template literals.
- Design tokens only: `text-foreground`, `bg-background`, `border-border`. Never `text-gray-700` or `#hex`.
- Class order: `layout → position → sizing → spacing → typography → color → border → effects → transitions → responsive/state`
- No arbitrary values `p-[13px]` unless pixel-perfect requirement is documented.
- `text-balance` on all headings. `text-pretty` on body paragraphs.
- Touch targets: `min-h-11 min-w-11` on all interactive elements.

---

## TW4. Container Queries

```tsx
{/* v4 — native */}
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
</div>

{/* v3 — requires plugin: npm install @tailwindcss/container-queries */}
{/* Add to tailwind.config.ts plugins: [require('@tailwindcss/container-queries')] */}
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
</div>
```

Use container queries when a component appears in multiple layout contexts (sidebar, main, modal). Use viewport `sm:`/`md:` only for page-level layout decisions.

---

## TW5. Animation Package Warning

| Version | Animation Package | Install |
|---------|------------------|---------|
| **v4** | `tw-animate-css` | `npm install tw-animate-css` then add `@import "tw-animate-css"` after `@import "tailwindcss"` |
| **v3** | `tailwindcss-animate` | `npm install tailwindcss-animate` then add to `plugins` array in config |

> ⚠️ **CRITICAL:** `tailwindcss-animate` is v3 ONLY. Using it in v4 causes build failures.
> The v4 replacement is `tw-animate-css`. Always check the installed version before using either.

---

## TW6. Cheatsheet

| Concern | v4 | v3 |
|---|---|---|
| Entry | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| Build tool | `@tailwindcss/vite` (preferred) | PostCSS |
| Dark mode setup | `@custom-variant dark (...)` in CSS | `darkMode: 'class'` in config |
| Token definition | `@layer base { :root { --x: oklch(...); } }` | `@layer base { :root { --x: H S% L%; } }` |
| Token → utility | `@theme inline { --color-x: var(--x); }` | `extend.colors.x: 'hsl(var(--x) / <alpha>)'` |
| Color format | OKLCH (default) | HSL |
| Animation | `tw-animate-css` | `tailwindcss-animate` |
| Container queries | Native | Plugin required |
| Config file | CSS only | `tailwind.config.ts` |
| `components.json` tailwind config | `""` (empty string) | Path to config file |
