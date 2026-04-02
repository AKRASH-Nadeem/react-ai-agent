---
trigger: always_on
---

> TECH STACK MANDATE: Never write production code for a new project or introduce a new library without an approved tech stack. The stack is proposed → reasoned → approved → locked. Deviations require explicit user confirmation and a recorded rationale.

---

# Tech Stack Decision & Library Reasoning Standards

---

## TS0. When This Rule Activates

This rule governs two distinct situations:

1. **New project** — any task starting from scratch, including scaffold, init, or "start a new app"
2. **New library introduction** — any time a library not already in `package.json` would solve a problem

In both cases: **stop, propose, get approval, then proceed.** Never install first and explain later.

---

## TS1. New Project — Stack Proposal Protocol

Before any code is written on a new project, deliver a structured stack proposal.

### Step 1 — Gather requirements (ask if not stated)

```
1. App type         → SPA / SSR / SSG / PWA / desktop (Electron/Tauri)?
2. Primary users    → consumer-facing / internal tool / developer tool?
3. Data patterns    → mostly static / REST API / real-time / offline-capable?
4. Auth required?   → yes / no / oauth / magic link
5. Scale target     → prototype / production MVP / high-traffic?
6. Existing backend → REST / GraphQL / tRPC / Firebase / Supabase / other?
7. Deployment       → Vercel / Netlify / Docker / S3+CDN / unknown?
```

Never assume. If the user provides partial context, ask only for the missing pieces — do not ask all 7 at once if most are already stated.

### Step 2 — Propose with reasoning

Present using this exact structure:

```
## Proposed Stack — [Project name]

### Core
| Layer          | Choice              | Why this / why not alternatives |
|----------------|---------------------|----------------------------------|
| Framework      | React 19 + Vite 6   | ... |
| Language       | TypeScript strict   | ... |
| Routing        | React Router v7     | ... |
| Styling        | Tailwind CSS v4     | ... |
| UI components  | shadcn/ui           | ... |

### Data
| Layer          | Choice              | Why this / why not alternatives |
|----------------|---------------------|----------------------------------|
| Server state   | TanStack Query v5   | ... |
| Client state   | Zustand v5          | ... |
| Forms          | RHF + Zod           | ... |

### Optional (include only if requirements justify it)
| Layer          | Choice              | Condition that triggers it      |
|----------------|---------------------|----------------------------------|
| Real-time      | Socket.io client    | If WebSocket is needed          |
| Auth           | Clerk / Auth.js     | If auth is required             |
| Charts         | Recharts            | If data viz is required         |

### What I deliberately excluded and why
- [Library X] — [reason it was considered and rejected]
- [Library Y] — [reason not needed for this scope]

Confirm this stack or request changes before I begin.
```

**The "why not alternatives" column is mandatory.** Showing the road not taken is what makes this trustworthy reasoning, not just a list.

### Step 3 — Lock the approved stack

Once the user approves, state:

```
Stack approved. I will:
- Never install a library outside this stack without asking first
- Explain tradeoffs before adding anything new
- Flag if a requirement arises that the stack cannot serve
```

---

## TS2. Library Selection Reasoning Matrix

When a new library is needed mid-project, or when choosing between alternatives, use this reasoning framework. Never pick by familiarity alone.

### TS2.1 Library addition checklist

Before proposing any new library:

1. **Does the existing stack already solve this?** Check TanStack Query, Zustand, Zod, shadcn, Tailwind utilities, and native browser APIs first.
2. **Is this a one-time need?** Write it in-house if < 50 lines and no edge cases.
3. **What is the bundle cost?** Check bundlephobia.com. Flag any addition > 20KB gzipped.
4. **Is it maintained?** Check last commit, open issues, npm weekly downloads. Flag anything with < 10K weekly downloads or last commit > 6 months ago.
5. **Does it conflict with the React Compiler?** Libraries that manually manage memoization may fight the compiler.

### TS2.2 Standard tradeoff tables

**State management — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Component-local UI state (toggle, input value) | `useState` | No overhead, compiler-optimized |
| Computed from other state | Derived (no new state) | Avoid sync bugs |
| Shared between sibling components | Lift to parent | Simple, no library needed |
| Shared across a feature (2–5 components) | React Context + custom hook | No library overhead |
| URL-persistent state (filters, pagination, tabs) | `nuqs` | Shareable, back-button safe |
| Global client state (user prefs, cart, session UI) | Zustand | Minimal, compiler-compatible |
| Server state (API data, loading, caching) | TanStack Query | Purpose-built, never useState for this |
| Server state + real-time | TanStack Query + WebSocket skill | Combine, do not replace |

**Data fetching — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Any data from an API | TanStack Query | Caching, deduplication, stale-while-revalidate |
| Mutations (POST/PUT/DELETE) | TanStack Query `useMutation` | Integrated with query invalidation |
| One-off fetch with no caching needed | TanStack Query with `staleTime: Infinity` | Still consistent — don't use useEffect |
| GraphQL API | TanStack Query + fetch (or Apollo if schema is complex) | Apollo only for large schemas with fragments |
| Real-time / push | react-realtime skill | WebSocket/SSE — different pattern |

**Routing — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Standard SPA | React Router v7 | Stable, data router API, file-based routing available |
| Type-safe routes, search params as types | TanStack Router | Superior TS integration, but more setup |
| Next.js project | App Router (built-in) | Not a separate library |

**Validation — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Form validation | Zod (schema-first) | Single source of truth for types + validation |
| API response validation | Zod | Same schema reuse |
| Runtime type guards | Zod `.safeParse()` | Preferred over manual type narrowing |
| Complex custom rules | Zod `.superRefine()` | Extend inline, no separate library |
| Alternative considered | Yup | Rejected — Zod has better TS inference and tree-shaking |
| Alternative considered | Valibot | Smaller, but less ecosystem. Acceptable if bundle size is critical |

**Animation — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Simple state transitions (hover, active, open/close) | CSS transitions via Tailwind | No JS, compiler-friendly |
| Component mount/unmount animations | `motion` library (`motion/react`) | Purpose-built, uses WAAPI |
| Scroll-triggered reveals | `motion` with `whileInView` | Clean API |
| Complex orchestrated sequences | `motion` with `AnimatePresence` | Handles exit animations correctly |
| High-performance canvas/WebGL | Custom `requestAnimationFrame` | Libraries add overhead |
| Alternative considered | Framer Motion (old name) | Same library — just renamed to `motion` |
| Alternative considered | GSAP | Overkill unless doing complex timeline animations |

**Date/time — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Date formatting, parsing, arithmetic | `date-fns` v4 | Tree-shakable, functional |
| Timezone-aware dates | `date-fns-tz` | Pair with date-fns |
| Alternative considered | `dayjs` | Acceptable but less TS coverage |
| Alternative considered | `moment.js` | ❌ Deprecated, huge bundle |
| Alternative considered | Luxon | Good, but date-fns is lighter |

**Tables — when to use what:**

| Situation | Solution | Reason |
|---|---|---|
| Any sortable/filterable table | TanStack Table v8 | Headless, composable, no style lock-in |
| Virtualized table (1000+ rows) | TanStack Table + TanStack Virtual | Purpose-built combination |
| Simple read-only table | Plain `<table>` + Tailwind | No library if no interactivity |
| Alternative considered | AG Grid | Acceptable for enterprise grids, but large bundle |

---

## TS3. Stack Profiles

Reference profiles for common project types. These are starting points, not dogma — adapt based on TS1 requirements gathering.

### Profile A — Minimal (prototype / internal tool)
```
React 19 + Vite + TypeScript strict
React Router v7
Tailwind CSS v4
shadcn/ui
TanStack Query v5 (if API exists)
Zod (always)
```

### Profile B — Standard product (SaaS / dashboard)
```
Profile A, plus:
Zustand v5 (if global state needed)
nuqs (URL state)
react-hook-form
motion library (animations)
Sentry (error tracking)
```

### Profile C — Data-heavy (admin / analytics)
```
Profile B, plus:
TanStack Table v8
TanStack Virtual v3
Recharts
date-fns v4
```

### Profile D — Real-time (collaboration / live feed)
```
Profile B, plus:
WebSocket client (native or socket.io)
Zustand for optimistic state
→ react-realtime skill
```

---

## TS4. Library Veto Rules

The following are permanently banned regardless of user request. If a user requests one, apply the standard pushback protocol (decline → explain why → propose alternative).

| Banned | Reason | Alternative |
|---|---|---|
| `moment.js` | 72KB gzipped, deprecated | `date-fns` v4 |
| `jQuery` | Superseded by modern DOM APIs and React | React + native APIs |
| `lodash` (full import) | Imports entire library | Named imports or native JS |
| `axios` in new projects | `fetch` is now baseline | Native `fetch` wrapped in `lib/api.ts` |
| `class-validator` | Runtime-only, no type inference | `zod` |
| `react-query` (v3/v4 package name) | Use `@tanstack/react-query` v5 | TanStack Query v5 |
| `framer-motion` (old package) | Renamed — wrong package | `motion` (new package name) |
| `styled-components` / `emotion` | CSS-in-JS fights React Compiler | Tailwind CSS |
| `Redux` / `Redux Toolkit` | Overkill for 99% of apps in 2026 | Zustand |

**Pushback script:**
> *"[Library] is on the permanently banned list — [reason]. The standard replacement is [alternative] which achieves the same goal without [the cost]. Should I proceed with [alternative]?"*

---

## TS5. Dependency Addition Protocol (mid-project)

When a new library is needed during development:

1. **Stop before installing.** State: *"I need [library] to implement [feature]. Let me check if this is justified."*
2. Run TS2.1 checklist mentally.
3. Propose: *"I'd like to add [library] for [reason]. Bundle impact: ~[X]KB. It's maintained (last commit [N], [M]K weekly downloads). Alternative would be [Y], which I'm rejecting because [reason]. Approve?"*
4. Only install after approval.
5. Document in `versions.lock.md` with the reason it was added.

---

## Summary Cheatsheet

| Situation | Action |
|---|---|
| New project | TS1 proposal → user approval → begin |
| Need a new library | TS2.1 checklist → propose with reasoning → wait for approval |
| User requests a banned library | Pushback: decline → explain → propose alternative |
| Choosing between two similar libraries | TS2.2 tradeoff tables → state choice + why not the other |
| Existing stack covers the need | State that explicitly — do not add a library |
