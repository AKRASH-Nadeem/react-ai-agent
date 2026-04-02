---
name: react-tailwind
description: |
  MANDATORY — load before every UI task without exception.
  Covers all Tailwind CSS usage: version detection, config setup, theme tokens,
  dark mode, class patterns, container queries, and version-specific differences.
  Trigger on: any styling, layout, color, theme, CSS, or component work.
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
| **Config file** | `src/index.css` only | `tailwind.config.ts` |
| **Entry directive** | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| **Dark mode** | `@custom-variant dark (&:is(.dark, .dark *))` in CSS | `darkMode: 'class'` in `tailwind.config.ts` |
| **Theme extension** | `@theme { --color-brand: hsl(...); }` in CSS | `extend: { colors: { brand: '...' } }` in config |
| **Container queries** | Native — no plugin | `@tailwindcss/container-queries` plugin required |
| **CSS variables** | `@layer base { :root { --primary: 210 100% 50%; } }` | Same, but file is `globals.css` with `@tailwind` |

When unsure about a specific feature: call Context7 with the exact version — `tailwindcss v4 dark mode` not just `tailwindcss dark mode`.

---

## TW1. v4 — Full Setup Pattern

```css
/* src/index.css */
@import "tailwindcss";

/* Dark mode via class toggle on <html> */
@custom-variant dark (&:is(.dark, .dark *));

/* Semantic token values */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 4%;
    --card: 0 0% 100%;
    --border: 240 6% 90%;
    --primary: 243 75% 58%;
    --primary-foreground: 0 0% 100%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;
    --destructive: 0 84% 60%;
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
  }
  .dark {
    --background: 240 10% 4%;
    --foreground: 0 0% 98%;
    --card: 240 8% 7%;
    --border: 240 8% 16%;
    --primary: 243 75% 64%;
    --primary-foreground: 0 0% 100%;
    --muted: 240 6% 12%;
    --muted-foreground: 240 5% 55%;
    --destructive: 0 72% 52%;
    --success: 142 60% 42%;
    --warning: 38 90% 52%;
  }
}

/* Map tokens → Tailwind utility classes */
@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-border: hsl(var(--border));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
}
```

Dark mode toggle (TypeScript):
```ts
// lib/theme.ts
export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
}
```

Call `initTheme()` in `main.tsx` before `ReactDOM.createRoot(...)`.

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
  plugins: [],
} satisfies Config;
```

```css
/* src/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { /* same HSL vars as v4 */ }
  .dark { /* same dark vars as v4 */ }
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

## TW5. Cheatsheet

| Concern | v4 | v3 |
|---|---|---|
| Entry | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| Dark mode setup | `@custom-variant dark (...)` in CSS | `darkMode: 'class'` in config |
| Token definition | `@layer base { :root { --x: ... } }` | Same |
| Token → utility | `@theme { --color-x: hsl(var(--x)); }` | `extend.colors.x: 'hsl(var(--x) / <alpha>)'` |
| Container queries | Native | Plugin required |
| Config file | CSS only | `tailwind.config.ts` |
