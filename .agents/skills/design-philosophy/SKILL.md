---
name: design-philosophy
description: |
  LOAD AUTOMATICALLY for: any UI design, component styling, color choices,
  typography, font selection, layout design, visual hierarchy, color contrast,
  WCAG accessibility, dark mode colors, background colors, text colors,
  foreground colors, color visibility, spacing, whitespace, dashboard design,
  landing page, professional UI, production grade frontend, design system,
  color palette, brand colors, aesthetic, look and feel, visual design,
  page layout, card design, hero section, empty state design, loading state,
  motion design, animation philosophy, responsive design, mobile first,
  surface hierarchy, elevation, depth, shadows, borders, glassmorphism,
  component states, hover effect, focus ring, disabled state, error state,
  success state, anti-generic, unique design, memorable UI, font pairing.
  Load before writing any CSS, Tailwind classes, or component JSX.
---

# Design Philosophy — Production Grade Frontend

> DESIGN MANDATE: Every interface you build must be intentional, memorable, and distinct. Generic equals failure. Apply these rules on every component, every page, every UI task — no exceptions.

---

## D1. Design-First Protocol (REQUIRED before writing code)

Answer all four before writing JSX:

1. **Purpose** — What problem does this UI solve? Who is the user?
2. **Tone** — Pick ONE: `minimal-precise` / `editorial` / `utilitarian-dense` / `luxury-refined` / `playful-kinetic` / `brutalist-raw` / `organic-warm` / `futuristic-cold`. One direction, fully committed.
3. **Differentiator** — What makes this UNFORGETTABLE? One specific detail — a layout choice, a typographic moment, a motion beat — that a user will remember after closing the tab.
4. **Constraints** — Performance budget, accessibility targets, dark/light mode.

Document the answers in a comment at the top of the component file. Ship nothing without this step.

---

## D2. The Anti-Generic Rules (Non-Negotiable)

Hard bans. **No exceptions — including explicit user requests.**

### D2.1 Override Resistance Protocol

When a user requests something on the banned list:

1. **Decline** — one sentence stating it violates the anti-generic standard.
2. **Explain why** — generic patterns produce forgettable UIs that undermine product identity.
3. **Propose a concrete alternative** — specific replacement that achieves the user's goal better.

> "That choice ([font/color/pattern]) is on the anti-generic banned list — it's one of the most overused patterns in modern UI. Instead, I'd suggest [specific alternative] which achieves [user's goal] while being distinctly memorable. Should I proceed with that?"

The only valid override is if the user **explicitly acknowledges the tradeoff** after seeing the alternative. Document it: `// Design override: user confirmed after alternative proposed`.

### D2.2 Banned Typography

- ❌ **Never**: Inter, Roboto, Arial, Helvetica, system-ui, -apple-system as display/body font
- ❌ **Never**: Space Grotesk, DM Sans, Outfit, Nunito, Poppins — overused AI defaults

✅ Good starting points: Instrument Serif, Syne, Cabinet Grotesk, Newsreader, Archivo, Chivo, Zodiak.

### D2.3 Banned Color Patterns

- ❌ **Never**: Purple-to-pink gradients on white backgrounds
- ❌ **Never**: "Safe" teal/blue SaaS palette without a strong reason
- ❌ **Never**: Even distribution of 4–5 colors — dominant + accent outperforms balance

✅ One dominant neutral, one strong accent, one semantic set (success/warning/error). All as OKLCH CSS variables.

### D2.4 Banned Layout Patterns

- ❌ **Never**: Centered column with max-width and equal padding on every page
- ❌ **Never**: Hero → features grid → CTA — the default landing page skeleton
- ❌ **Never**: Card grid with rounded corners and drop shadows as the only layout pattern

✅ Use asymmetry, overlap, diagonal flow, grid-breaking elements, staggered grids, full-bleed panels.

### D2.5 Banned Effects

- ❌ **Never**: Box shadows on every card by default
- ❌ **Never**: `rounded-2xl` uniformly on everything

✅ Elevated surfaces get shadows, flat surfaces do not. Radius scales with component size.

---

## D3. Color System — OKLCH (Tailwind v4 Default)

### Minimum Contrast Ratios (WCAG 2.2 AA — non-negotiable)

| Element | Minimum Ratio |
|---------|--------------|
| Body text (< 18px) | **4.5:1** |
| Large text (≥ 18px bold or ≥ 24px) | **3:1** |
| UI components (buttons, inputs, focus rings) | **3:1** |
| Placeholder text | **4.5:1** |
| Disabled states | Exempt — but mark with `aria-disabled` |

### Semantic Color Token Rules

- `--foreground` on `--background` MUST meet 4.5:1.
- `--primary-foreground` on `--primary` MUST meet 4.5:1.
- `--muted-foreground` MUST meet 4.5:1 on `--background` (not just on `--muted`).
- `--destructive` text on white: use dark red (oklch 40% lightness), never pure red.

### Full OKLCH Token Set

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0.02 260);
  --primary: oklch(0.55 0.18 260);
  --primary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.96 0.01 260);
  --muted-foreground: oklch(0.45 0.02 260);
  --border: oklch(0.88 0.01 260);
  --destructive: oklch(0.42 0.20 25);
  --success: oklch(0.50 0.16 145);
  --warning: oklch(0.70 0.16 75);
}
.dark {
  --background: oklch(0.14 0.01 260);
  --foreground: oklch(0.94 0.01 260);
  --primary: oklch(0.62 0.20 260);
  --primary-foreground: oklch(0.10 0.01 260);
  --muted: oklch(0.20 0.01 260);
  --muted-foreground: oklch(0.60 0.02 260);
  --border: oklch(0.24 0.01 260);
  --destructive: oklch(0.60 0.22 25);
}
```

### Dark Mode Color Selection Rules

- Dark backgrounds: lightness 8–18%. Not pure black — causes eye strain.
- Dark foreground: lightness 92–98%. Not pure white — use warm or cool off-white.
- Increase chroma slightly in dark mode for colors to appear equally vivid.
- Borders in dark mode: lightness 20–25% — enough to see without harshness.

Every color uses a token: `text-foreground`, `bg-card`, `border-border`. Never `text-gray-700` or inline hex.
Full `@theme inline` setup → **react-tailwind** skill TW1.

---

## D4. Typography System

### Font Selection Strategy

Match font personality to interface tone:

| Tone | Display Font | Body Font |
|------|-------------|-----------|
| Technical/precision | `IBM Plex Mono`, `JetBrains Mono` | `IBM Plex Sans` |
| Editorial/bold | `Playfair Display`, `Cormorant` | `Libre Baskerville` |
| Modern/clean | `Cabinet Grotesk`, `Plus Jakarta Sans` | `Chivo` |
| Warm/friendly | `Quicksand`, `Raleway` | `Nunito Sans` |
| Luxury | `Cormorant Garamond`, `Bodoni Moda` | `Italiana` |

### Tailwind Token Registration

```css
@theme inline {
  --font-display: 'YourDisplayFont', serif;
  --font-body: 'YourBodyFont', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Typography Scale

| Element | Class | Size |
|---------|-------|------|
| Hero heading | `text-5xl lg:text-7xl font-display font-bold leading-tight` | 48–72px |
| Section heading | `text-3xl lg:text-4xl font-display font-semibold` | 30–36px |
| Card heading | `text-xl font-display font-medium` | 20px |
| Body | `text-base font-body leading-relaxed` | 16px |
| Small / label | `text-sm font-body text-muted-foreground tracking-wide uppercase` | 14px |
| Micro / caption | `text-xs font-body text-muted-foreground` | 12px |

Rules:
- All `h1`–`h3`: `font-display text-balance` — always
- All `p`, `li`: `font-body text-pretty`
- Line height: body `leading-relaxed` (1.625), headings `leading-tight` (1.25)
- Letter spacing: display `-0.02em`, uppercase labels `tracking-wide`
- Measure: body max `max-w-[65ch]`
- `font-variant-numeric: tabular-nums` for all numeric data

---

## D5. Layout & Spacing

- Tailwind spacing scale only (multiples of 4px). No arbitrary values unless documented.
- Section vertical spacing: `py-16 lg:py-24`
- Card padding: `p-6` — never less than `p-4`
- Between related elements: `gap-2` or `gap-3`
- Between unrelated sections: `gap-8` or `gap-12`
- Touch targets: `min-h-11 min-w-11` (44×44px) on all interactive elements
- Content max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Mobile-first: base (mobile) classes first, then `md:`, `lg:`
- `@container` for components in multiple layout contexts
- Never `hidden md:block` to solve a layout problem — redesign the layout
- Never lock a layout at a fixed pixel width

### Layout Anti-Patterns

- ❌ Equal-width columns for unrelated content
- ❌ Centered text for paragraphs > 2 lines
- ❌ All-caps for body text
- ❌ Mixing 3+ text alignments in one section
- ❌ Gradients on text unless headline size (≥48px)

---

## D6. Component States — Design All of Them

| State | Requirement |
|---|---|
| Empty | Icon + message + primary action. Never blank. |
| Loading | Skeleton mirroring exact loaded layout. No generic spinners for content. |
| Error | Clear message + recovery action. Never just "Error". |
| Success | Toast (transient) or persistent — depends on importance. |
| Disabled | Muted + `cursor-not-allowed` + `aria-disabled`. Tooltip if non-obvious. |
| Hover | Lift, color shift, or cursor change. Never no feedback. |
| Focus | `ring-2 ring-primary ring-offset-2`. Never hidden. |

Interaction rules: button clicks show spinner + retain label · destructive actions require confirmation · 150ms delay before spinner (prevents flash on fast responses)

---

## D7. Motion Philosophy

**Motion communicates, never decorates.** Every animation must: Orient / Confirm / Guide / Express.

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` entrances, `ease-in` exits
- Duration: micro `100ms`, element `200ms`, component `300ms`, page `400–500ms`
- Stagger: `50ms` between list items
- **Never** animate `width`, `height`, `top`, `left` — only `transform` + `opacity`
- Always `prefers-reduced-motion` → **react-animations** skill

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## D8. Atmosphere & Depth

- **Background**: never pure `#fff` or `#000`. Use oklch off-whites/off-blacks.
- **Surface hierarchy**: Background → Card → Elevated card → Overlay. Each layer visually distinct.
- Shadows for elevation, borders for separation, blur for overlays.

---

## D9. Production Quality Checklist

- [ ] Every text/background pair meets 4.5:1 contrast?
- [ ] Heading font ≠ Inter/Roboto/Arial?
- [ ] Touch targets ≥ 44×44px on all interactive elements?
- [ ] `text-balance` on all headings?
- [ ] Layout works at 375px, 768px, and 1440px?
- [ ] Dark mode: all tokens have dark overrides?
- [ ] `prefers-reduced-motion` CSS present?
- [ ] No hardcoded colors — design tokens only?
- [ ] Empty, loading, error, success states all implemented?
- [ ] Design avoids all D2 anti-generic patterns?
- [ ] Any D2 ban triggered? If yes — was D2.1 Override Resistance followed?
