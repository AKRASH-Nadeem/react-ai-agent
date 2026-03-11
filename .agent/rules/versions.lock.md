---
trigger: always_on
---

# versions.lock.md
#
# Baseline package versions for all active skill examples.
# Before applying any skill example, compare these versions against
# what is installed: cat package.json | grep "package-name"
#
# Last updated: 2025-01

---

## Pre-Task Protocol

Run before any task that touches an external library:

```bash
cat package.json | grep -E '"tailwindcss"|"shadcn"|"react"|"@tanstack|"motion"|"msw"'
```

Compare each result against this file. For every library where:
- **Installed version matches** → use skill examples as patterns, verify API via Context7
- **Installed version differs** → call Context7 `[library] v[installed-version] [feature]` before writing anything
- **Library not in this file** → treat as unknown, call Context7 unconditionally

**Skill examples are patterns, not copy-paste.** They show structural intent. Always verify the exact method names and imports for the installed version via Context7 or shadcn MCP.

---

| Package | Baseline | Notes |
|---------|----------|-------|
| `react` | `^19.0.0` | React Compiler enabled |
| `react-dom` | `^19.0.0` | |
| `typescript` | `^5.7.0` | strict mode |
| `vite` | `^6.0.0` | |
| `@vitejs/plugin-react` | `^4.3.0` | |

---

## Routing & URL State

| Package | Baseline | Notes |
|---------|----------|-------|
| `react-router-dom` | `^7.0.0` | Data router API |
| `nuqs` | `^2.0.0` | URL search param state |

---

## Styling

| Package | Baseline | Notes |
|---------|----------|-------|
| `tailwindcss` | `^4.0.0` (baseline) | v4: config in CSS, `@import "tailwindcss"`, `@custom-variant`, `@theme`. v3: `tailwind.config.ts`, `@tailwind` directives. **Always `cat package.json | grep tailwindcss` before writing config.** |
| `clsx` | `^2.1.0` | |
| `tailwind-merge` | `^2.5.0` | |

> ⚠️ **Tailwind v4 is a major rewrite.** No `tailwind.config.ts` by default. If the project uses v3, do not apply v4 patterns. Check: `cat package.json | grep tailwindcss`

---

## UI Components & Icons

| Package | Baseline | Notes |
|---------|----------|-------|
| `shadcn/ui` (CLI) | `^2.1.0` | Not an npm package — run `npx shadcn@latest init`. v2+: uses `Field` family. Pre-v2: uses `Form` family. Call shadcn MCP to confirm. |
| `lucide-react` | `^0.460.0` | Icon names changed significantly in v0.400+ |
| `sonner` | `^1.0.0` | Toast notifications |

> ⚠️ **Lucide icon renames:** Many icon names changed in v0.400. Check the [Lucide changelog](https://lucide.dev/guide/migration) if icons are missing.

---

## Data Fetching & State

| Package | Baseline | Notes |
|---------|----------|-------|
| `@tanstack/react-query` | `^5.62.0` | v5 — breaking changes from v4 |
| `axios` | `^1.7.0` | |
| `zustand` | `^5.0.0` | |
| `use-debounce` | `^10.0.0` | |

> ⚠️ **TanStack Query v5 breaking changes:** `cacheTime` → `gcTime`, `status: "loading"` → `status: "pending"`, `onSuccess/onError` removed from `useQuery`. Do not apply v5 patterns to a v4 project.

---

## Forms & Validation

| Package | Baseline | Notes |
|---------|----------|-------|
| `react-hook-form` | `^7.53.0` | |
| `zod` | `^3.23.0` | |
| `@hookform/resolvers` | `^3.9.0` | |
| `input-otp` | `^1.4.0` | react-forms-advanced |
| `react-phone-number-input` | `^3.4.0` | react-forms-advanced |
| `react-select` | `^5.8.0` | react-forms-advanced |

---

## Animation

| Package | Baseline | Notes |
|---------|----------|-------|
| `motion` | `^11.12.0` | Formerly `framer-motion` — import from `motion/react` |

> ⚠️ **Breaking rename:** Package is now `motion`. Import: `import { motion } from "motion/react"`. If project still uses `framer-motion`, do not apply `motion` patterns.

---

## Drag and Drop

| Package | Baseline | Notes |
|---------|----------|-------|
| `@dnd-kit/core` | `^6.3.0` | react-forms-advanced |
| `@dnd-kit/sortable` | `^8.0.0` | |
| `@dnd-kit/utilities` | `^3.2.0` | |

---

## Data Display

| Package | Baseline | Notes |
|---------|----------|-------|
| `@tanstack/react-table` | `^8.20.0` | react-data-display |
| `@tanstack/react-virtual` | `^3.10.0` | react-data-display |
| `recharts` | `^2.13.0` | react-data-display |
| `date-fns` | `^4.1.0` | v4 — minor API changes from v3 |

---

## Performance & Monitoring

| Package | Baseline | Notes |
|---------|----------|-------|
| `@sentry/react` | `^8.42.0` | v8 — breaking changes from v7 |
| `@lhci/cli` | `^0.14.0` | react-performance |

> ⚠️ **Sentry v8 breaking changes:** Init API changed, `BrowserTracing` import path moved. If project uses v7, check migration guide.

---

## Testing

| Package | Baseline | Notes |
|---------|----------|-------|
| `vitest` | `^2.1.0` | |
| `@vitest/coverage-v8` | `^2.1.0` | |
| `@testing-library/react` | `^16.0.0` | v16 supports React 19 |
| `@testing-library/user-event` | `^14.5.0` | |
| `@testing-library/jest-dom` | `^6.6.0` | |
| `msw` | `^2.6.0` | v2 — `rest.*` replaced by `http.*` |
| `jest-axe` | `^9.0.0` | |
| `@types/jest-axe` | `^3.5.0` | |
| `@playwright/test` | `^1.49.0` | |

> ⚠️ **MSW v2 breaking changes:** `rest.get/post` replaced by `http.get/post`, `ctx.*` replaced by `HttpResponse`. Do not apply v2 patterns to a v1 project.

---

## Version Drift Warning Signs

When you see these errors, suspect version drift first — activate **react-error-handling** skill:

- `Property 'X' does not exist on type` — API renamed or removed
- `Module not found: Can't resolve 'X'` — package renamed (e.g., `framer-motion` → `motion`)
- `X is not a function` — method signature changed
- Import errors on previously working code — re-exports restructured