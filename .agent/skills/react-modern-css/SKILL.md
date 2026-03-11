---
name: react-modern-css
description: |
  Use when the project needs modern CSS features beyond standard Tailwind viewport breakpoints.
  Trigger on: "container query", "component responsive", "@container",
  "RTL", "right-to-left", "Arabic", "Hebrew", "logical properties",
  "fluid typography", "clamp()", "fluid font", "responsive text",
  "scroll snap", "carousel" (CSS-based), "horizontal scroll",
  "frosted glass", "glassmorphism", "backdrop blur",
  ":has()", "parent selector", "CSS nesting",
  "aspect ratio", "responsive image container",
  "text-balance", "text-pretty", "overscroll-behavior",
  "color-scheme", "forced-colors".
---

> ⚠️ **Version check required.** Run `cat package.json | grep tailwindcss` first. v3 and v4 differ significantly in config and available features.

## Tailwind v3 vs v4 — Quick Reference

| Feature | v4 | v3 |
|---|---|---|
| Config file | `src/index.css` only | `tailwind.config.ts` |
| Entry directive | `@import "tailwindcss"` | `@tailwind base/components/utilities` |
| Dark mode | `@custom-variant dark (...)` in CSS | `darkMode: 'class'` in config |
| Theme extension | `@theme { --color-*: ... }` in CSS | `extend: { colors: ... }` in config |
| Container queries | Native — no plugin needed | Requires `@tailwindcss/container-queries` plugin |
| CSS variables | `hsl(var(--primary))` in `@layer base` | Same pattern, but in `globals.css` with `@tailwind` |

When in doubt about a specific feature: `Context7 → tailwindcss v[N] [feature name]`

---

# Modern CSS Standards

## MC1. Container Queries — Component-Level Responsiveness

Use Container Queries when a component's layout should respond to its **container's size**, not the viewport. This is the correct tool for reusable components (cards, widgets, sidebars) that appear in multiple layout contexts.

Use viewport breakpoints (`sm:`, `md:`, `lg:`) only for page-level layout decisions.

```tsx
// Component responds to its container, not the viewport
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-4">
    {items.map((item) => <Card key={item.id} {...item} />)}
  </div>
</div>
```

Decision rule:
- Component always occupies full page width → viewport `sm:`/`md:`/`lg:`
- Component appears in sidebar or variable-width context → `@container` queries
- Component appears in both contexts → **always use `@container`**

Tailwind v4 includes container queries natively. Tailwind v3 requires `@tailwindcss/container-queries` plugin.

---

## MC2. CSS Logical Properties — RTL-Safe Spacing

If the project targets RTL languages (Arabic, Hebrew, Persian) or internationalisation is a goal, all spacing and positioning must use logical properties instead of physical ones.

| Physical (avoid for RTL) | Logical (RTL-safe) |
|--------------------------|-------------------|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `border-l-*` | `border-s-*` |
| `rounded-l-*` | `rounded-s-*` |
| `text-left` | `text-start` |
| `left-0` / `right-0` | `start-0` / `end-0` |

```tsx
// ✅ RTL-safe
<div className="ms-4 pe-6 border-s-2 text-start">

// ❌ Breaks in RTL
<div className="ml-4 pr-6 border-l-2 text-left">
```

To activate RTL on the document:
```html
<!-- Set dir on <html> or per-section -->
<html dir="rtl" lang="ar">
```

```css
/* globals.css — flip layout direction */
[dir="rtl"] {
  direction: rtl;
  unicode-bidi: embed;
}
```

If the project requires full i18n with language switching, string translation, and date/number formatting, fetch the `react-i18next` v15 documentation via Context7 MCP for the complete setup.

---

## MC3. Fluid Typography with `clamp()`

For display text that scales smoothly between breakpoints without discrete class stacks:

```ts
// tailwind.config.ts (v3) or CSS variables (v4)
fontSize: {
  "fluid-sm":  ["clamp(0.875rem, 0.8rem + 0.4vw, 1rem)",    { lineHeight: "1.5" }],
  "fluid-base":["clamp(1rem, 0.9rem + 0.5vw, 1.125rem)",    { lineHeight: "1.6" }],
  "fluid-lg":  ["clamp(1.125rem, 1rem + 0.75vw, 1.5rem)",   { lineHeight: "1.4" }],
  "fluid-xl":  ["clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)",   { lineHeight: "1.2" }],
  "fluid-2xl": ["clamp(2rem, 1.5rem + 2.5vw, 3.5rem)",      { lineHeight: "1.1" }],
  "fluid-3xl": ["clamp(2.5rem, 1.8rem + 3.5vw, 5rem)",      { lineHeight: "1.0" }],
},
```

Use for hero headings, display text, and section titles. Use fixed sizes for body text and UI labels.

---

## MC4. `aspect-ratio`

Always use `aspect-ratio` instead of padding hacks:

```tsx
// ✅ Modern
<div className="aspect-video w-full overflow-hidden rounded-lg">
  <img src={src} alt={alt} className="size-full object-cover" />
</div>

<div className="aspect-square w-16 overflow-hidden rounded-full">
  <img src={avatar} alt={name} className="size-full object-cover" />
</div>
```

Common ratios: `aspect-square` (1:1), `aspect-video` (16:9), `aspect-[4/3]` (4:3), `aspect-[3/2]` (3:2).

---

## MC5. `text-balance` and `text-pretty`

```tsx
// Prevents widows in headings (distributes words evenly across lines)
<h1 className="text-balance">Your long heading that would otherwise orphan one word</h1>

// Prevents orphaned single words at the end of paragraphs
<p className="text-pretty">Your paragraph content here.</p>
```

Rules: `text-balance` on all headings. `text-pretty` on body paragraphs and card descriptions.

---

## MC6. Backdrop Filter — Frosted Glass

```tsx
<header className="sticky top-0 z-drawer backdrop-blur-md bg-background/80 border-b border-border/50">
  <nav>...</nav>
</header>
```

Always combine `backdrop-blur-*` with a semi-transparent background. Pure `backdrop-blur` on a fully transparent element has no visible effect.

---

## MC7. Overscroll Behavior

```tsx
// Prevent scroll chaining (body doesn't scroll when modal/drawer scroll hits end)
<div className="overflow-y-auto overscroll-contain h-full">

// Prevent pull-to-refresh on mobile (for full-screen apps)
<body className="overscroll-none">
```

---

## MC8. `:has()` Parent Selector

```tsx
// Highlight a table row when its checkbox is checked
<tr className="has-[:checked]:bg-primary/5 has-[:checked]:border-l-2 has-[:checked]:border-primary">
  <td><input type="checkbox" /></td>
  <td>Row content</td>
</tr>

// Form field with error — style the label when input is invalid
<div className="has-[:invalid]:text-destructive">
  <label>Email</label>
  <input type="email" required />
</div>
```

---

## MC9. `color-scheme` and Forced Colors

```css
/* globals.css — tell browser the page supports both light and dark */
:root {
  color-scheme: light dark;
}

/* Forced colors (Windows High Contrast mode) */
@media (forced-colors: active) {
  .custom-checkbox {
    forced-color-adjust: none;
    border: 2px solid ButtonText;
  }
}
```

---

## MC10. CSS Nesting

```css
/* globals.css — native CSS nesting (Tailwind v4 / modern browsers) */
.prose {
  color: hsl(var(--foreground));

  & h1, & h2, & h3 {
    font-weight: 700;
    color: hsl(var(--foreground));
  }

  & a {
    color: hsl(var(--primary));
    text-decoration: underline;

    &:hover {
      color: hsl(var(--primary) / 0.8);
    }
  }
}
```

---

## Summary Cheatsheet — Modern CSS

| Concern | Standard |
|---------|----------|
| Component responsive | `@container` queries |
| Page responsive | Tailwind viewport `sm:`/`md:`/`lg:` |
| RTL spacing | Logical properties (`ms-*`, `pe-*`, `border-s-*`) |
| Full i18n | Fetch `react-i18next` v15 docs via Context7 MCP |
| Fluid typography | `clamp()` via Tailwind config |
| Image ratio | `aspect-video` / `aspect-square` |
| Heading orphans | `text-balance` |
| Paragraph orphans | `text-pretty` |
| Sticky header | `backdrop-blur-md bg-background/80` |
| Scroll chaining | `overscroll-contain` |
| Row highlight | `:has()` parent selector |
| Dark mode support | `color-scheme: light dark` |