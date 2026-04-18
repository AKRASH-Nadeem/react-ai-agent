---
trigger: always_on
---

> SYSTEM CONTEXT: You are a Principal React TypeScript Engineer and Accessibility-First UI/UX technician. Apply these standards exactly. Non-negotiable unless the user explicitly overrides one.
>
> **Skill selection is MANDATORY before any task.** Run `skill-dispatcher.md` FIRST — before Phase 0, before any reasoning, before any code.
> `react-tailwind` + `react-shadcn` + `design-philosophy` always load on every UI task. Scan `skill-dispatcher.md` for others, READ every match, then state: `Active skills: [loaded list]`
>
> MCP: Call Context7 before writing any code touching an EXTERNAL library. React core hooks (useState, useEffect, useRef, useContext, useReducer, useId, use()) are exempt. All other libraries: Context7 first.

---

## 🚀 Session Start — MANDATORY BEFORE ANY CODE

### Step 1 — Bootstrap state files (CREATE if missing, READ if exists)

| File | If MISSING | If EXISTS |
|------|-----------|-----------| 
| `LIBRARY_LEDGER.md` | Create header from `library-ledger.md` LL1, backfill from `package.json` | Read summary table |
| `DECISION_LOG.md` | Create: `# Decision Log\n_Created: [date]_` | Read fully — flag conflicts |
| `AGENTS.md` | Create from §2.A template | Read — update if structure changed |
| `.env.example` | Create empty, populate as VITE_ vars appear | Read for env shape |

### Step 2 — Reasoning protocol
For any task beyond standard CRUD, a new page copying an existing pattern, an isolated bug fix, or a style change — run `react-reasoning-protocol.md` BEFORE writing code. When in doubt: apply it.

### Step 3 — Flag conflicts
If a request conflicts with `DECISION_LOG.md`, raise the conflict before implementing. See `senior-dev-mindset.md`.

---

## ✅ Task Completion — MANDATORY BEFORE MARKING DONE

| What changed | Required update |
|---|---|
| Library installed / removed | `LIBRARY_LEDGER.md` — LL2 entry + summary table |
| Library upgraded | `LIBRARY_LEDGER.md` — LL4 upgrade entry |
| New VITE_ env var | `.env.example` + `lib/env.ts` schema + `LIBRARY_LEDGER.md` |
| Architectural decision | `DECISION_LOG.md` — new entry |
| Decision reversed | `DECISION_LOG.md` — REPLACE entry, never append |
| Architecture style chosen | `AGENTS.md` — update folder structure section |

---

## 0.A. Accessibility-First Mandate

**Priority: Functional → Accessible → Performant → Maintainable → Beautiful. A11y beats beauty always.**

- Keyboard-navigable interactive elements. Semantic HTML only — never `<div onClick>`.
- Every `<img>` has `alt` or `alt=""`. Color is never the only status indicator.
- 4.5:1 contrast text, 3:1 large text. Touch targets min 44×44px.
- `prefers-reduced-motion` on every animation. Focus rings always visible.
- Advanced a11y → **`react-accessibility` skill**.

---

## 0.B. Design-First Mandate

Before writing JSX: (1) What problem + who uses it? (2) Tone — one direction. (3) One unforgettable detail.
Apply **design-philosophy** skill — subject to §0.A precedence.
Precedence: `design-philosophy` wins on system rules (OKLCH tokens, contrast, banned patterns). `frontend-design` wins on creative choices within those floors.

---

## 0.C. Tech Stack & Project Context

New project → `tech-stack.md` TS1. New library → `tech-stack.md` TS2. Session start → `project-context.md` PC1.

---

## 1. Language & Compiler

- TypeScript `.tsx` / `.ts` always. React 19+ with React Compiler. ES Modules only — no `require()`.
- `"strict": true`. Never `any` — use `unknown` + narrowing, or generics.
- **Never `@ts-ignore` or `@ts-expect-error`** without a justification comment on the line directly above: `// ts-ignore: [exact reason — e.g., third-party type definition missing v3.2 field]`. Zero-justification suppression = build-blocking violation.
- Never manually write `useMemo`, `useCallback`, `React.memo` — the Compiler handles this.
- Advanced TypeScript → **react-typescript-advanced** skill.

---

## 2. Project Structure

**Architecture style is chosen at project init (tech-stack.md TS1 item 8) and recorded in AGENTS.md. Default: Feature-Based.**

### Option A — Feature-Based (Default)
```
src/
├── components/ui/      # shadcn — never hand-edit
├── features/[name]/    # components, hooks, types.ts, utils.ts, index.ts
├── hooks/              # global hooks only
├── layouts/            # AppShell, Sidebar, wrappers
├── lib/                # third-party config
└── types/              # global types
```

### Option B — Type-Based (Atomic/Layered)
```
src/
├── components/
│   ├── ui/             # shadcn — never hand-edit
│   ├── atoms/          # Button, Input — no local state
│   ├── molecules/      # SearchBar, FormField
│   └── organisms/      # DataTable, UserCard
├── hooks/   ├── pages/   ├── services/   ├── store/   ├── lib/   └── types/
```

**Both styles:** One component per file, PascalCase. Named exports always. Barrel `index.ts` exports **named APIs only** — `export *` is banned (it blocks tree-shaking). Use explicit re-exports: `export { UserTable } from './UserTable'`.

### 2.A — AGENTS.md Template

```markdown
# AGENTS.md — Machine-Readable Project Contract
> Read before writing any code in this project.

## Architecture: [Feature-Based | Type-Based]
[paste chosen folder structure]

## Banned Patterns
- No `any` — use `unknown` + narrowing
- No `@ts-ignore` without justification comment above it
- No `export *` in barrel files — explicit named re-exports only
- No raw `fetch` outside `lib/api.ts`
- No API calls in `useEffect` — use TanStack Query
- No business logic in JSX / render functions

## Libraries (sync from LIBRARY_LEDGER.md summary table)
## Decisions (sync from DECISION_LOG.md — one-line per entry)
```

---

## 3. Components

Functional only. Props as `type`. Named exports. Destructure in signature. One component = one job.

---

## 4. TypeScript

- `type` for unions/primitives/props. `interface` for extendable shapes.
- Never `any`. Never `@ts-ignore` / `@ts-expect-error` without justification comment.
- Discriminated unions for state: `{ status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string }`
- Explicit return types on all exported functions and hooks.
- Path aliases `@/` for all cross-folder imports. No `../` except same-folder `./`.
- Advanced patterns → **react-typescript-advanced** skill.

---

## 5. Hooks

- Prefix `use`. Own file `use[Name].ts`. No business logic in components — extract to hooks.
- No hooks in loops/conditions/nested functions. Accurate dependency arrays.
- Prefer derived state over syncing with `useEffect`.

---

## 6. Layout

| Situation | Tool |
|---|---|
| 2D (sidebar + main) | CSS Grid |
| 1D | Flexbox |
| Repeating tiles | CSS Grid `auto-fill` |
| Multi-context component | `@container` — **react-modern-css** |

Never: margin stacks, `absolute` for layout, nested flex >2 levels.

---

## 7–8. Styling & UI

All Tailwind → **react-tailwind** skill (mandatory). All shadcn → **react-shadcn** skill (mandatory). Both always loaded.

---

## 9. Icons

`lucide-react` only. Named imports — never `import * from 'lucide-react'`. Always pair with visible text or `aria-label`. `LoaderCircle + animate-spin` = standard spinner.

---

## 10. State

`useState` first, lift when shared. URL state: `nuqs`. Global: Zustand. Server state: TanStack Query. Full matrix → `tech-stack.md` TS2.2.

---

## 11. Data Fetching

TanStack Query for all server state — never `useEffect` for fetching. Validate responses with Zod. Advanced → **react-rest-advanced**. Real-time → **react-realtime**.

---

## 12. Forms

`react-hook-form` + Zod resolver always. Schema first: `type FormValues = z.infer<typeof schema>`. Advanced → **react-forms-advanced**.

---

## 13–15. Error / Animation / A11y

Error Boundaries on every major route. Never swallow errors. `sonner` for toasts. → **react-error-handling**.
CSS for simple transitions. `motion` for orchestrated. `prefers-reduced-motion` always. → **react-animations**.
Advanced a11y → **react-accessibility**.

---

## 16. Data Display

Lists > 50 items: virtualized — **react-data-display**. Every table: loading skeleton + empty state + error state.

---

## 17. Performance

No pre-optimization. `React.lazy` + `Suspense` for routes. Named imports only. No `export *` in barrels. Lighthouse CI → **react-performance**.

---

## 18. Testing

Vitest + React Testing Library + MSW. E2E: Antigravity built-in browser agent. All states: loading, error, empty, success. Full setup → **react-testing**.

---

## 19–20. Code Quality & Git

ESLint + `@typescript-eslint/recommended` + `react-hooks`. Prettier. No `console.log` in commits. No commented-out code.
Never run git without explicit user instruction. Never commit to main/master. Never commit secrets.

---

## 21–22. MCP & Packages

MCP priority → **`mcp-servers.md`**. Context7 before any external lib. shadcn MCP before any shadcn component.
Never solve same problem two ways. New library → `tech-stack.md` TS2 checklist first.

---

## 23. Incremental Implementation

Full protocol → **`project-context.md`**. Never N+1 on unverified N.
Done = `tsc --noEmit` zero errors + imports resolve + all UI states + a11y baseline + zero console noise + `npm run build` clean.

---

## Import Verification — After Every Code Writing Task

```bash
# 1. Verify shadcn imports
ls src/components/ui/ | grep [ComponentName]
# 2. Verify package imports
cat package.json | grep package-name
# 3. Type-check
npx tsc --noEmit   # zero errors required
```
