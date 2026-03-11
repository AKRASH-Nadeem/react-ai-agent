---
trigger: always_on
---

> DESIGN MANDATE: Every interface you build must be intentional, memorable, and distinct. Generic equals failure. Apply these rules on every component, every page, every UI task — no exceptions.

---

# Frontend Design Philosophy

---

## D1. Design-First Workflow

Answer all four before writing JSX:

1. **Purpose** — What problem does this UI solve? Who is the user?
2. **Tone** — Pick one: `minimal-precise` / `editorial` / `utilitarian-dense` / `luxury-refined` / `playful-kinetic` / `brutalist-raw` / `organic-warm` / `futuristic-cold`. One direction, fully committed.
3. **Differentiator** — What makes this UNFORGETTABLE? One specific detail — a layout choice, a typographic moment, a motion beat — that a user will remember after closing the tab.
4. **Constraints** — Performance budget, accessibility targets, dark/light mode.

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

---

### D2.2 Banned Typography

- ❌ **Never**: Inter, Roboto, Arial, Helvetica, system-ui, -apple-system as display/body font
- ❌ **Never**: Space Grotesk, Outfit, Nunito, Poppins — overused AI defaults

**Pushback**: *"Inter is the most common font in AI-generated UIs — it makes the product blend in. For a [tone] direction, [Syne / Instrument Serif / Cabinet Grotesk] would be far more distinctive. Want me to use that instead?"*

✅ Good starting points: Instrument Serif, Syne, Cabinet Grotesk, Newsreader, Archivo, Chivo, Zodiak — never repeat the same choice twice.

---

### D2.3 Banned Color Patterns

- ❌ **Never**: Purple-to-pink gradients on white backgrounds
- ❌ **Never**: "Safe" teal/blue SaaS palette without a strong reason
- ❌ **Never**: Even distribution of 4–5 colors — dominant + accent outperforms balance

**Pushback**: *"Purple-to-pink on white signals 'AI-generated' immediately. Consider [amber-to-rose / indigo-to-cyan / a strong single-color system with punchy accent]. Which direction sounds right?"*

✅ One dominant neutral, one strong accent, one semantic set (success/warning/error). All as HSL CSS variables.

---

### D2.4 Banned Layout Patterns

- ❌ **Never**: Centered column with max-width and equal padding on every page
- ❌ **Never**: Hero → features grid → CTA — the default landing page skeleton
- ❌ **Never**: Card grid with rounded corners and drop shadows as the only layout pattern

**Pushback**: *"That's the default structure every template produces — visitors pattern-match it as generic instantly. A stronger approach: [editorial split with large type / asymmetric hero / full-bleed panels]. Same content, far more memorable — want me to build that?"*

✅ Use asymmetry, overlap, diagonal flow, grid-breaking elements, staggered grids,horizontal scroll sections, full-bleed panels, editorial column offsets.

---

### D2.5 Banned Effects

- ❌ **Never**: Box shadows on every card by default
- ❌ **Never**: `rounded-2xl` uniformly on everything

**Pushback**: *"Uniform shadows/radius flatten visual hierarchy — every surface looks equally important. Effects signal elevation: only raised surfaces get shadows, radius scales with component size. I'll apply the scale correctly."*

✅ Elevated surfaces get shadows, flat surfaces do not. Radius: small inputs = `rounded`, large cards = `rounded-2xl`.

---

## D3. Typography System

```css
--font-display: 'Instrument Serif', serif;
--font-body: 'Chivo', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

- **Line height**: body `1.6`, headings `1.1–1.2`, labels `1.4`
- **Letter spacing**: display `-0.02em–-0.04em`, body `0`, uppercase labels `0.06em–0.1em`
- **Measure**: body max 65–75 chars (`max-w-[65ch]`)
- `font-variant-numeric: tabular-nums` for all numeric data

---

## D4. Color System

```css
:root {
  --background: 0 0% 100%;    --foreground: 240 10% 4%;
  --muted: 240 5% 96%;        --muted-foreground: 240 4% 46%;
  --card: 0 0% 100%;          --border: 240 6% 90%;
  --primary: /* brand hue */; --primary-foreground: /* contrast */;
  --destructive: 0 84% 60%;   --success: 142 76% 36%;
  --warning: 38 92% 50%;
}
.dark { --background: 240 10% 4%; --foreground: 0 0% 98%; /* full set */ }
```

- Every color uses a token: `text-foreground`, `bg-card`, `border-border`
- Never `text-gray-700` or inline hex
- Contrast: 4.5:1 minimum for text, 3:1 for large text

---

## D5. Spacing & Sizing

- Tailwind spacing scale only. Arbitrary values only if pixel-perfect and documented.
- 4-point grid: all values multiples of 4px
- Density: `compact` (`gap-1 p-2`), `default` (`gap-3 p-4`), `comfortable` (`gap-6 p-6+`)
- Touch targets: min 44×44px (`min-h-11 min-w-11`)

---

## D6. Motion Philosophy

**Motion communicates, never decorates.** Every animation must: Orient / Confirm / Guide / Express.

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` entrances, `ease-in` exits
- Duration: micro `100ms`, element `200ms`, component `300ms`, page `400–500ms`
- Stagger: `50ms` between list items
- **Never** animate `width`, `height`, `top`, `left` — only `transform` + `opacity`
- Always `prefers-reduced-motion` → **react-animations** skill

---

## D7. Component States — Design All of Them

| State | Requirement |
|---|---|
| Empty | Icon + message + primary action. Never blank. |
| Loading | Skeleton mirroring exact loaded layout. No generic spinners for content. |
| Error | Clear message + recovery action. Never just "Error". |
| Success | Toast (transient) or persistent — depends on importance. |
| Disabled | Muted + `cursor-not-allowed` + `aria-disabled`. Tooltip if non-obvious. |
| Hover | Lift, color shift, or cursor change. Never no feedback. |
| Focus | `ring-2 ring-primary ring-offset-2`. Never hidden. |

**Interaction rules**: button clicks show spinner + retain label · destructive actions require confirmation · 150ms delay before spinner (prevents flash on fast responses)

---

## D8. Responsive Design

- Mobile-first. Design at 375px first.
- Breakpoints on the layout parent, not scattered across children.
- `@container` for components appearing in multiple contexts.
- Never `hidden md:block` to solve a layout problem — redesign the layout.

---

## D9. Atmosphere & Depth

- **Background**: never pure `#fff` or `#000`. Use `hsl(0 0% 99%)` light, `hsl(240 10% 4%)` dark.
- **Surface hierarchy**: Background → Card → Elevated card → Overlay. Each layer visually distinct.
- **Depth**: shadows for elevation, borders for separation, blur for overlays.

```css
--shadow-sm: 0 1px 2px hsl(var(--foreground) / 0.04);
--shadow-md: 0 4px 8px hsl(var(--foreground) / 0.08);
--shadow-lg: 0 8px 24px hsl(var(--foreground) / 0.12);
--shadow-xl: 0 16px 48px hsl(var(--foreground) / 0.16);
```

---

## D10. Design Review Checklist

- [ ] Every text/background pair meets 4.5:1 contrast?
- [ ] Visible focus ring on every interactive element?
- [ ] Empty, loading, error, success states all implemented?
- [ ] Layout works at 375px, 768px, and 1440px?
- [ ] `prefers-reduced-motion` disables all decorative animations?
- [ ] Touch targets ≥ 44×44px?
- [ ] No hardcoded colors — design tokens only?
- [ ] Exactly one primary action per screen?
- [ ] Fonts from defined type scale only?
- [ ] Design avoids all D2 anti-generic patterns?
- [ ] Any D2 ban triggered by user request? If yes — was D2.1 Override Resistance followed?