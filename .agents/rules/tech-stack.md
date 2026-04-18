---
trigger: always_on
---

> TECH STACK MANDATE: Never write production code for a new project or introduce a new library without an approved tech stack. The stack is proposed → reasoned → approved → locked. Deviations require explicit user confirmation and a recorded rationale.

---

# Tech Stack Decision & Library Reasoning Standards

---

## TS0. When This Rule Activates

1. **New project** — any task starting from scratch, including scaffold, init, or "start a new app"
2. **New library introduction** — any time a library not already in `package.json` would solve a problem

In both cases: **stop, propose, get approval, then proceed.** Never install first and explain later.

---

## TS1. New Project — Stack Proposal Protocol

### Step 1 — Gather requirements (ask only for what's missing)

```
1. App type         → SPA / SSR / SSG / PWA / desktop?
2. Primary users    → consumer / internal tool / developer tool?
3. Data patterns    → static / REST / real-time / offline?
4. Auth required?   → yes / no / oauth / magic link
5. Scale target     → prototype / MVP / high-traffic?
6. Existing backend → REST / GraphQL / tRPC / Firebase / other?
7. Deployment       → Vercel / Netlify / Docker / S3+CDN / unknown?
8. Architecture     → Feature-Based (default) or Type-Based (Atomic/Layered)?
                      Feature-Based: group by domain (features/users/, features/billing/)
                      Type-Based: group by layer (atoms/, molecules/, organisms/, services/)
                      Recommend Feature-Based for apps with 3+ distinct domains.
                      Recommend Type-Based for UI component libraries or small utilities.
```

### Step 2 — Propose with reasoning

```
## Proposed Stack — [Project name]

### Core
| Layer          | Choice              | Why this / why not alternatives |
|----------------|---------------------|----------------------------------|
| Framework      | React 19 + Vite 6   | ... |
| Language       | TypeScript strict   | ... |
| Architecture   | [Feature-Based / Type-Based] | [reason based on item 8] |
| Routing        | React Router v7     | ... |
| Styling        | Tailwind CSS v4     | ... |
| UI components  | shadcn/ui           | ... |

### Data
| Layer          | Choice              | Why this / why not alternatives |
|----------------|---------------------|----------------------------------|
| Server state   | TanStack Query v5   | ... |
| Client state   | Zustand v5          | ... |
| Forms          | RHF + Zod           | ... |

### Optional (only if requirements justify)
| Layer          | Choice              | Condition |
|----------------|---------------------|-----------|
| Real-time      | Socket.io client    | If WebSocket needed |
| Auth           | Clerk / Auth.js     | If auth required |
| Charts         | Recharts            | If data viz required |
| Component dev  | Storybook + addon-mcp | Opt-in only |

### What I deliberately excluded and why
- [Library X] — [reason considered and rejected]

Confirm this stack or request changes before I begin.
```

### Step 3 — Lock the approved stack

Once approved, state:
```
Stack approved. Architecture: [Feature-Based | Type-Based]. I will:
- Never install a library outside this stack without asking first
- Explain tradeoffs before adding anything new
- Flag if a requirement arises the stack cannot serve
- Create AGENTS.md now with the approved structure
```

Create `AGENTS.md` immediately after approval using the template in `core.md` §2.A.

---

## TS2. Library Selection Reasoning Matrix

### TS2.1 Library addition checklist

Before proposing any new library:

1. **Does the existing stack already solve this?** Check TanStack Query, Zustand, Zod, shadcn, Tailwind, native browser APIs first.
2. **Is this a one-time need?** Write it in-house if < 50 lines and no edge cases.
3. **Bundle cost?** Check bundlephobia.com. Flag > 20KB gzipped.
4. **Maintained?** Last commit, open issues, weekly downloads. Flag < 10K weekly or last commit > 6 months.
5. **React Compiler compatible?** Libraries that manually manage memoization may conflict.

### TS2.2 Standard tradeoff tables

**State management:**

| Situation | Solution | Reason |
|---|---|---|
| Component-local UI state | `useState` | No overhead |
| Computed from other state | Derived | Avoid sync bugs |
| Shared between siblings | Lift to parent | No library |
| Shared across a feature (2–5 components) | React Context + custom hook | No library overhead |
| URL-persistent state | `nuqs` | Shareable, back-button safe |
| Global client state | Zustand | Minimal, compiler-compatible |
| Server state | TanStack Query | Purpose-built, never useState |
| Server state + real-time | TanStack Query + WebSocket skill | Combine, not replace |

**Data fetching:**

| Situation | Solution |
|---|---|
| Any API data | TanStack Query |
| Mutations | TanStack Query `useMutation` |
| One-off, no caching | TanStack Query `staleTime: Infinity` |
| GraphQL | TanStack Query + fetch (Apollo only for large schemas) |
| Real-time | react-realtime skill |

**Routing:**

| Situation | Solution |
|---|---|
| Standard SPA | React Router v7 |
| Type-safe routes + search params | TanStack Router |
| Next.js | App Router (built-in) |

**Validation:** Zod always. `z.infer<typeof schema>` as type source of truth. Yup rejected (weaker TS inference).

**Animation:** CSS transitions for state changes. `motion` library for orchestration. GSAP only for complex timelines.

**Date/time:** `date-fns` v4. Never `moment.js` (deprecated, 72KB).

**Tables:** TanStack Table v8. With virtualization: + TanStack Virtual.

---

## TS3. Stack Profiles

### Profile A — Minimal (prototype / internal tool)
```
React 19 + Vite + TypeScript strict + React Router v7
Tailwind CSS v4 + shadcn/ui + TanStack Query v5 + Zod
Architecture: Type-Based (if small utility) or Feature-Based (if multi-domain)
```

### Profile B — Standard product (SaaS / dashboard)
```
Profile A + Zustand v5 + nuqs + react-hook-form + motion + Sentry
Architecture: Feature-Based (recommended for 3+ domains)
```

### Profile C — Data-heavy (admin / analytics)
```
Profile B + TanStack Table v8 + TanStack Virtual v3 + Recharts + date-fns v4
Architecture: Feature-Based
```

### Profile D — Real-time (collaboration / live feed)
```
Profile B + WebSocket client + Zustand for optimistic state
Architecture: Feature-Based + react-realtime skill
```

---

## TS4. Library Veto Rules

| Banned | Reason | Alternative |
|---|---|---|
| `moment.js` | 72KB, deprecated | `date-fns` v4 |
| `jQuery` | Superseded | React + native APIs |
| `lodash` (full import) | Imports all | Named imports or native JS |
| `axios` | `fetch` is baseline | Native `fetch` in `lib/api.ts` |
| `class-validator` | No type inference | `zod` |
| `react-query` (v3/v4 name) | Wrong package | `@tanstack/react-query` v5 |
| `framer-motion` (old) | Renamed | `motion` package |
| `styled-components` / `emotion` | Fights React Compiler | Tailwind CSS |
| `Redux` / `Redux Toolkit` | Overkill for 99% of 2026 apps | Zustand |

**Pushback script:**
> *"[Library] is permanently banned — [reason]. The replacement is [alternative]. Should I proceed with that?"*

---

## TS5. Dependency Addition Protocol (mid-project)

1. **Stop.** State: *"I need [library] for [feature]. Let me verify this is justified."*
2. Run TS2.1 checklist.
3. Propose: *"Bundle: ~[X]KB. Maintained: yes (last commit [N], [M]K weekly). Alternative [Y] rejected because [reason]. Approve?"*
4. Install only after approval. Document in `LIBRARY_LEDGER.md`.

---

## Summary

| Situation | Action |
|---|---|
| New project | TS1 proposal (incl. architecture choice) → approval → create AGENTS.md → begin |
| New library | TS2.1 checklist → propose → wait for approval |
| Banned library requested | Decline → explain → propose alternative |
| Choosing between two libraries | TS2.2 tables → state choice + why not the other |
| Existing stack covers the need | State explicitly — no new library |
