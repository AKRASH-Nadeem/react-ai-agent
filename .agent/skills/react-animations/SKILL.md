name: react-animations
description: |
  Use when the user asks about animations, transitions, motion, or visual movement.
  Trigger on: "animation", "transition", "motion", "animate", "fade", "slide",
  "scroll effect", "loading state", "skeleton", "spinner", "loader",
  "hover effect", "micro-interaction", "page transition", "parallax",
  "reveal on scroll", "stagger", "spring", "Framer Motion", "Motion",
  "GSAP", "Lottie", "carousel", "modal open/close", "accordion",
  "prefers-reduced-motion", "View Transitions API",
  "CSS Scroll-Driven Animations", "scroll snap".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Animations & Motion Standards

## A1. Motion Decision Hierarchy

Use this every time you need to animate anything:

```
Simple hover / focus / show-hide?
  → Tailwind transition utilities (CSS only)

Multi-keyframe looping (spinner, shimmer, pulse)?
  → Tailwind animate-* or @keyframes in globals.css

Scroll-triggered reveal, parallax, progress bar?
  → CSS Scroll-Driven Animations (no JS needed in modern browsers)
  → Fall back to useInView hook (see A7) for broader support

Layout animation (items reordering, expanding)?
  → Motion (motion/react) — layout prop + layoutId

Complex sequence, spring physics, gesture-driven?
  → Motion (motion/react)

Page / route transition?
  → CSS View Transitions API first (see A10)
  → Fall back to Motion AnimatePresence if fine-grained control needed
```

**Never use JS-driven animations for something CSS can do alone.**

---





## A2. `prefers-reduced-motion` — MANDATORY

Every animation, transition, and motion effect must respect the user's OS setting. This is WCAG 2.2 SC 2.3.3. No exceptions.

**Global CSS rule — add to `globals.css` on every project with animations:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In Tailwind, always pair motion classes with `motion-reduce:`:
```tsx
<div className="transition-transform duration-300 motion-reduce:transition-none hover:scale-105 motion-reduce:hover:scale-100">
```

For Motion components, always use `useReducedMotion()`:
```tsx
const shouldReduceMotion = useReducedMotion();
<motion.div
  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>
```

See the **react-accessibility** skill A11Y1 for the full accessibility context.

---

## A3. Animation Token System

Never use raw durations or easing values in components. Define them as design tokens.

**Tailwind v4 — define in `globals.css` as CSS custom properties:**

```css
/* globals.css */
:root {
  --duration-fast:   150ms;   /* hover, instant feedback */
  --duration-normal: 300ms;   /* most transitions */
  --duration-slow:   500ms;   /* page-level reveals */
  --duration-crawl:  1000ms;  /* deliberate, dramatic */

  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-expo:  cubic-bezier(0.7, 0, 0.84, 0);
}
```

Then reference in Tailwind v4 via arbitrary values — or register them as Tailwind theme extensions in the CSS:

```css
/* globals.css — Tailwind v4 theme extension */
@theme {
  --transition-duration-fast:   150ms;
  --transition-duration-normal: 300ms;
  --transition-duration-slow:   500ms;
  --transition-duration-crawl:  1000ms;
  --transition-timing-function-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-timing-function-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --transition-timing-function-in-expo:  cubic-bezier(0.7, 0, 0.84, 0);
}
```

**Tailwind v3 — define in `tailwind.config.ts`:**

```ts
transitionDuration: {
  fast:   "150ms",
  normal: "300ms",
  slow:   "500ms",
  crawl:  "1000ms",
},
transitionTimingFunction: {
  "ease-spring":   "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",
},
```

> Check installed version before choosing: `cat package.json | grep tailwindcss`

---

## A4. CSS Transitions — Tailwind Standard

```tsx
// Button hover
<button className="transition-colors duration-fast hover:bg-primary/90 motion-reduce:transition-none">

// Sidebar open/close
<aside className={cn(
  "transition-transform duration-normal ease-out-expo motion-reduce:transition-none",
  isOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

Rules:
- Always `transition-[property]` not `transition-all` — be specific: `transition-colors`, `transition-transform`, `transition-opacity`.
- Never animate `width`, `height`, or `margin` — layout recalculation. Use `transform: scaleX()` or `max-height` with overflow hidden instead.

---

## A5. CSS Keyframes — Standard Pattern

Define keyframes in `globals.css`. In Tailwind v4, animation utilities are also registered in CSS. In Tailwind v3, register the animation name in `tailwind.config.ts`.

```css
/* globals.css — keyframes work the same in v3 and v4 */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Tailwind v4 — register the animation utility in CSS:**
```css
/* globals.css */
@theme {
  --animate-shimmer:    shimmer 2s linear infinite;
  --animate-reveal-up:  reveal-up 0.5s var(--ease-out-expo) both;
}
```

**Tailwind v3 — register in `tailwind.config.ts`:**
```ts
animation: {
  shimmer:    "shimmer 2s linear infinite",
  "reveal-up":"reveal-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
},
```

Usage (same in both versions):
```tsx
<div className="animate-shimmer motion-reduce:animate-none" />
<p className="animate-reveal-up motion-reduce:animate-none" />
```

---

## A6. Skeleton vs Spinner

**Skeleton** for content with known shape. **Spinner** for actions (button submit, page load with unknown shape).

```tsx
// Skeleton
import { Skeleton } from "@/components/ui/skeleton";
export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-4 w-3/4 animate-shimmer motion-reduce:animate-none" />
      <Skeleton className="h-4 w-1/2 animate-shimmer motion-reduce:animate-none" />
      <Skeleton className="h-32 w-full animate-shimmer motion-reduce:animate-none" />
    </div>
  );
}

// Spinner
import { LoaderCircle } from "lucide-react";
<LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
```

---

## A7. Scroll-Triggered Animations — `useInView` Hook

```ts
// hooks/useInView.ts
export function useInView({ threshold = 0.1, rootMargin = "0px", once = true } = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); if (once) observer.disconnect(); }
        else if (!once) { setIsInView(false); }
      },
      { threshold, rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}
```

Usage:
```tsx
const { ref, isInView } = useInView();
<section ref={ref} className={cn(
  "transition-[opacity,transform] duration-slow ease-out-expo motion-reduce:transition-none",
  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
)}>
```

---

## A8. CSS Scroll-Driven Animations

Prefer over JS for parallax and progress indicators — no scroll listeners needed:

```css
/* globals.css */
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.reading-progress {
  animation: grow-progress linear both;
  animation-timeline: scroll();
  transform-origin: left;
}

.reveal-on-scroll {
  opacity: 0; /* fallback */
}
@supports (animation-timeline: scroll()) {
  .reveal-on-scroll {
    opacity: 1;
    animation: reveal-up linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 30%;
  }
}
```

Always add `@supports` fallback — requires Chromium 115+ / Firefox 110+.

---

## A9. Motion (motion/react) — When and How

```bash
npm install motion
```

Approved use cases: layout animations, exit animations (AnimatePresence), spring physics, gesture-driven, staggered sequences.

```tsx
import { motion, AnimatePresence } from "motion/react";

// Exit animation
<AnimatePresence mode="wait">
  <motion.div
    key={routeKey}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

Always use `useReducedMotion()` and adjust values accordingly. Never wrap entire page trees in `motion.div` unnecessarily.

---

## A10. View Transitions API

For route transitions in Chromium 111+:

```ts
// lib/navigate.ts
export function navigateWithTransition(navigate: NavigateFunction, to: string): void {
  if (!document.startViewTransition) { navigate(to); return; }
  document.startViewTransition(() => navigate(to));
}
```

```css
/* globals.css */
::view-transition-old(root) { animation: 200ms ease-in both slide-to-left; }
::view-transition-new(root) { animation: 300ms ease-out both slide-from-right; }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
}
```

---

## A11. CSS Scroll Snap

Always use CSS Scroll Snap over JS carousels:

```tsx
<div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4">
  {items.map((item) => (
    <div key={item.id} className="snap-start shrink-0 w-72"><Card {...item} /></div>
  ))}
</div>
```

---

## A12. Page Load — `PageWrapper`

Define one consistent entry animation project-wide:

```tsx
// layouts/PageWrapper.tsx
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <main className="animate-reveal-up motion-reduce:animate-none">{children}</main>;
}
```

Never apply entry animations per-section arbitrarily. Use `PageWrapper` everywhere. Never animate more than 3–4 elements simultaneously on page load.

---

## Summary Cheatsheet — Animations

| Scenario | Standard |
|----------|----------|
| Hover / focus | Tailwind `transition-*` + `motion-reduce:transition-none` |
| Looping (shimmer, spin) | Tailwind `animate-*` + `motion-reduce:animate-none` |
| Animation tokens | v4: `@theme` in `globals.css` / v3: `tailwind.config.ts` |
| Scroll reveal | `useInView` hook or CSS Scroll-Driven Animations |
| Route transition | CSS View Transitions API → Motion fallback |
| Layout reorder / exit | Motion (motion/react) |
| Carousel | CSS Scroll Snap |
| Skeleton | shadcn `<Skeleton>` + shimmer keyframe |
| Spinner | `<LoaderCircle className="animate-spin motion-reduce:animate-none">` |
| `prefers-reduced-motion` | **MANDATORY on every single animation** |
