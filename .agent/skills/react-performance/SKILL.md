name: react-performance
description: |
  Use when the project has performance SLAs, Lighthouse targets, error monitoring,
  or needs production observability. Trigger on:
  "Lighthouse", "Core Web Vitals", "LCP", "CLS", "INP", "FCP",
  "performance budget", "bundle size", "code splitting",
  "Sentry", "error monitoring", "error tracking", "crash reporting",
  "lazy load", "dynamic import", "React.lazy",
  "image optimization", "WebP", "AVIF", "next/image",
  "font loading", "FOUT", "font-display", "preload",
  "web vitals", "performance score", "slow page",
  "logger", "logging", "console.log replacement".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Performance & Monitoring Standards

## PERF1. Core Web Vitals Targets

Establish at project start and enforce in CI:

| Metric | Good | Target |
|---

-----|------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Define at project start |
| INP (Interaction to Next Paint) | < 200ms | Define at project start |
| CLS (Cumulative Layout Shift) | < 0.1 | Define at project start |

CLS prevention: always set `width` + `height` on images or use `aspect-ratio` containers. Never inject content above existing content after page load. Reserve space for dynamic content with `min-h-*`.

---



## PERF2. Image Optimization

```tsx
// Below-the-fold images — lazy load
<div className="aspect-video w-full overflow-hidden rounded-lg">
  <img src={src} alt={alt} width={800} height={450}
    loading="lazy" decoding="async" className="size-full object-cover" />
</div>

// LCP hero image — always eager + high priority
<img src={heroSrc} alt={heroAlt} width={1200} height={630}
  loading="eager" fetchPriority="high" decoding="async" />
```

Format rules:
- WebP as default format — provide JPEG fallback via `<picture>`
- AVIF for photography-heavy pages
- Never PNG for photographs
- SVG for icons, logos, illustrations

```tsx
<picture>
  <source srcSet={src.avif} type="image/avif" />
  <source srcSet={src.webp} type="image/webp" />
  <img src={src.jpg} alt={alt} width={800} height={600} loading="lazy" />
</picture>
```

---

## PERF3. Font Loading

**Font selection**: Use Google Fonts, Fontshare, or type foundries as a catalog to discover distinctive fonts that match your `design-philosophy.md` direction. See design-philosophy.md D2 and D3 for font selection rules (banned fonts, pairing strategy, type scale).

**Font delivery**: After selecting a font, download the WOFF2 files and self-host them. **Never load fonts from the Google Fonts CDN (or any external CDN) in production** — external font requests add a DNS lookup, TCP handshake, and TLS negotiation on every page load, and leak user data to third parties.

**How to self-host a Google Font:**
1. Go to [google-webfonts-helper.com](https://gwfh.mranftl.com) or download directly from the Google Fonts GitHub repo
2. Download the WOFF2 file(s) for the weights you use
3. Place in `public/fonts/`
4. Reference via `@font-face` in `globals.css`

```css
/* globals.css */
@font-face {
  font-family: "Instrument Serif";
  src: url("/fonts/instrument-serif-regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Show fallback immediately, swap when loaded */
}

@font-face {
  font-family: "Chivo";
  src: url("/fonts/chivo-variable.woff2") format("woff2-variations");
  font-weight: 100 900; /* Variable font — covers all weights */
  font-style: normal;
  font-display: swap;
}
```

```html
<!-- index.html — preload only fonts used above the fold -->
<link rel="preload" href="/fonts/instrument-serif-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/chivo-variable.woff2" as="font" type="font/woff2" crossorigin>
```

Rules:
- Only preload fonts used above the fold. Preloading all fonts hurts LCP.
- Prefer variable fonts (single file, all weights) over loading multiple weight files.
- `font-display: swap` prevents invisible text during font load (FOIT).
- Use `font-display: optional` for fonts used only in decorative contexts (prevents layout shift if font is slow).

---

## PERF4. Bundle Budgets

Enforce in CI. Exceeding a budget must block the build:

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor:   ["react", "react-dom"],
        ui:       ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        query:    ["@tanstack/react-query"],
        charts:   ["recharts"],
      },
    },
  },
  chunkSizeWarningLimit: 200, // KB — warn if a chunk exceeds this
}
```

Target budget (adjust at project start):
- Initial JS: < 200KB gzipped
- Total JS: < 500KB gzipped
- Any single chunk: < 200KB

---

## PERF5. Sentry — Error Monitoring

```bash
npm install @sentry/react
```

```ts
// lib/monitoring.ts
import * as Sentry from "@sentry/react";
import { env } from "@/lib/env";

export function initMonitoring(): void {
  if (!env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  });
}

// Call in main.tsx before rendering:
// initMonitoring();
// ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

Wrap the app in `Sentry.ErrorBoundary` for automatic error capture.

---

## PERF6. Logger — Replace `console.*`

```ts
// lib/logger.ts
import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error);
    if (import.meta.env.PROD) {
      Sentry.captureException(error, { extra: { message, ...context } });
    }
  },
};
```

Rules: `logger.debug` and `logger.info` only print in development. `logger.warn` and `logger.error` always print and report to Sentry in production. **Never use `console.*` directly in committed code — always use `logger`.**

This logger is referenced by the **react-error-handling** skill (ERR3) for trace debugging.

---

## PERF7. Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

```yaml
# lighthouserc.yml
ci:
  collect:
    url: ["http://localhost:4173"]
    numberOfRuns: 3
  assert:
    assertions:
      categories:performance:    ["error", { minScore: 0.9 }]
      categories:accessibility:  ["error", { minScore: 1.0 }]
      categories:best-practices: ["error", { minScore: 0.9 }]
      categories:seo:            ["error", { minScore: 0.9 }]
  upload:
    target: temporary-public-storage
```

Add to CI pipeline: run `lhci autorun` after `vite build && vite preview`.

---

## Summary Cheatsheet — Performance

| Concern | Standard |
|---------|----------|
| LCP image | `loading="eager" fetchPriority="high"` |
| Below-fold images | `loading="lazy" decoding="async"` |
| Image format | WebP default, AVIF for photos, SVG for icons |
| Image dimensions | Always set `width` + `height` or `aspect-ratio` |
| Font selection | Google Fonts / Fontshare / foundries — see design-philosophy.md D2 |
| Font delivery | Self-hosted WOFF2 in `public/fonts/` — never external CDN |
| Font loading | `font-display: swap`, preload above-fold fonts only |
| Bundle size | < 200KB initial JS gzipped |
| Code splitting | `manualChunks` in Vite config |
| Error monitoring | Sentry with `initMonitoring()` |
| Logging | `logger.ts` — never `console.*` in committed code |
| CI performance gate | Lighthouse CI with score thresholds |
