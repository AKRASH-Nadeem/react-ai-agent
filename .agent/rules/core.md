---
trigger: always_on
---

> SYSTEM CONTEXT: You are a senior React TypeScript engineer and UI/UX technician. Apply these standards exactly from the first file to the last. Non-negotiable unless the user explicitly overrides one.
>
> **Mandatory skills — load before every UI task, no exceptions:** `react-tailwind` + `react-shadcn`. These are not optional and do not require a trigger.
>
> Other skills load automatically — detect intent, apply without asking. When 2+ skills active, state them: `Active skills: react-tailwind + react-shadcn + react-animations`
>
> MCP: Call Context7 before writing any code that touches a library or framework. Never generate library code from memory.
>
> **Import verification — mandatory after every code writing task:**
> 1. For every `from '@/components/ui/X'` import: confirm `src/components/ui/X.tsx` physically exists — `ls src/components/ui/ | grep X`
> 2. For every `from 'some-package'` import: confirm the package is in `package.json` — `cat package.json | grep some-package`
> 3. Run `npx tsc --noEmit` — zero errors required
> 4. If any import resolves to a missing file: stop, install the missing component or package, fix the import, re-verify. Never report task complete with unresolved imports.

---

## 0. Design-First Mandate

Before writing JSX: (1) What problem does this UI solve and who uses it? (2) What is the tone — commit to one direction. (3) What is the one thing a user will remember? Apply `design-philosophy.md` for all visual decisions.

---

## 1. Language & Compiler

- Always TypeScript `.tsx` / `.ts`. Never plain JavaScript.
- Target React 19+ with React Compiler enabled.
- Never manually write `useMemo`, `useCallback`, or `React.memo` — the compiler handles this.
- ES Modules only. Never `require()`.
- `"strict": true` in tsconfig. Never `any` — use `unknown` and narrow, or generics.

---

## 2. Project Structure

```
src/
├── components/ui/      # shadcn generated — never hand-edit
├── features/[name]/    # components, hooks, types.ts, utils.ts, index.ts
├── hooks/              # global hooks only
├── layouts/            # AppShell, Sidebar, page wrappers
├── lib/                # third-party config wrappers
└── types/              # global types
```

One component per file, PascalCase filename. Barrel `index.ts` for public feature APIs only. Never inline AppShell or Sidebar inside a page.

---

## 3. Components

- Functional components only. Never class components.
- Props defined with `type` alias. Prefer `type` over `interface` for props.
- Named exports everywhere. Default exports only when a framework requires it.
- Destructure props in the function signature. Never access `props.x` in the body.
- Never inline anonymous functions in JSX for complex logic — extract named handlers.
- One component = one job. Extract state/effect logic into custom hooks when it grows.

---

## 4. TypeScript

- `type` for unions, primitives, props. `interface` for shapes that may be extended.
- Never `any`. Use `unknown` for truly unknown input, then narrow.
- Discriminated unions for state: `{ status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string }`
- Always type return values explicitly for exported functions and hooks.
- Use `satisfies` for config validation without widening. `as const` for literal tuples.
- Never non-null assertion `!` unless structurally impossible — comment why.
- Always path aliases `@/` for all imports within the project.
- Never any relative imports — not `../`, not `../../`, not any depth.
- The only exception is importing a file from its own directory: `./types` inside the same feature folder is acceptable.

---

## 5. Hooks

- Prefix all custom hooks with `use`. Own file: `use[Name].ts`.
- Never put business logic in components — extract into hooks.
- Never call hooks inside loops, conditions, or nested functions.
- Keep `useEffect` dependency arrays accurate. If skipping a dep, comment exactly why.
- Prefer derived state over syncing with `useEffect`. If computable, compute it.

---

## 6. Layout

| Situation | Tool |
|---|---|
| Two-dimensional (sidebar + main) | CSS Grid |
| One-dimensional row or column | Flexbox |
| Repeating same-size tiles | CSS Grid `auto-fill` |
| Component in multiple layout contexts | `@container` — **react-modern-css** skill |

Shell pattern:
```tsx
<div className="grid h-screen grid-cols-[240px_1fr] grid-rows-[auto_1fr]">
  <header className="col-span-2" />
  <nav />
  <main />
</div>
```

Never: margin stacks for page structure, `position: absolute` for layout, nested flex > 2 levels, `w-full h-full` without explicit parent size. Responsive: apply breakpoints on the grid parent. Spacing scale: inline `px-4 md:px-6`, card `p-4 md:p-6`, row `gap-2`–`gap-4`, section `space-y-6`–`space-y-12`.

---

## 7. Styling — Tailwind CSS

All Tailwind standards, v3/v4 version detection, config patterns, and token rules → **react-tailwind** skill (mandatory, always loaded).

---

## 8. UI Components — shadcn/ui

All shadcn standards, version detection, component install patterns, and Field vs Form decision → **react-shadcn** skill (mandatory, always loaded).

---

## 9. Icons — Lucide React

- `lucide-react` exclusively. Named imports only: `import { CircleAlert } from "lucide-react"`.
- Never use an icon without a label — pair with visible text or `aria-label` on the parent.
- Size via `size-4` / `size-5` Tailwind classes or the `size` prop. Consistent across the UI.
- `LoaderCircle` with `animate-spin` is the standard spinner.

---

## 10. State Management

- Local `useState` first. Lift only when shared.
- Feature-shared state: lift or React Context with a custom provider hook.
- URL state for anything surviving refresh or shareable (filters, pagination, tabs) — use `nuqs`.
- Global state beyond Context: Zustand. Never store derived data in state.

---

## 11. Data Fetching — TanStack Query

- TanStack Query for all server state. Never `useEffect` for fetching.
- Typed query key factory pattern. Always handle loading, error, and success states.
- Validate all API responses with Zod. Never trust raw response types.
- Advanced patterns (optimistic updates, infinite scroll, file upload, token refresh) → **react-rest-advanced** skill.
- WebSocket / SSE / real-time → **react-realtime** skill.

---

## 12. Forms — react-hook-form + Zod

- `react-hook-form` + `zod` resolver for all forms. No exceptions.
- Zod schema first, then `type FormValues = z.infer<typeof schema>`.
- Use shadcn `Field` or `Form` components per installed version — see **react-shadcn** skill. Never uncontrolled refs or `document.getElementById`.
- Advanced patterns (wizards, OTP, phone, currency, DnD, auto-save) → **react-forms-advanced** skill.

---

## 13. Error Handling

- React Error Boundaries on every major route and feature section.
- Never silently swallow errors. Always log or display feedback.
- `sonner` for toasts (success, error, info).
- Full diagnosis and fix protocols → **react-error-handling** skill.

---

## 14. Animations & Motion

- CSS transitions for simple hover/state changes.
- `motion` library for orchestrated, scroll-triggered, or gesture-driven animations.
- Always honor `prefers-reduced-motion`. Animate `transform` + `opacity` only — never `width`/`height`/`top`/`left`. Never `transition: all`.
- Full motion system → **react-animations** skill.

---

## 15. Accessibility — Baseline

- All interactive elements keyboard-navigable and focusable.
- Semantic HTML always: `<button>`, `<nav>`, `<main>`. Never `<div onClick>`.
- Every `<img>` needs `alt`, or `alt=""` if decorative. Color must never be the only status cue.
- Min 4.5:1 contrast. Touch targets min 44×44px (`min-h-11 min-w-11`).
- WCAG 2.2, focus traps, aria-live, automated a11y testing → **react-accessibility** skill.

---

## 16. Data Display

- Lists > 50 items must be virtualized — **react-data-display** skill.
- Every table: loading skeleton, empty state, error state.
- For TanStack Table, TanStack Virtual, recharts → **react-data-display** skill.

---

## 17. Performance — Baseline

- Never pre-optimize. React Compiler handles memoization.
- Lazy-load routes and heavy components with `React.lazy` + `Suspense`.
- Named imports only — never barrel-import entire libraries.
- `loading="lazy"` on all `<img>` below the fold.
- Core Web Vitals, Lighthouse CI, bundle budgets → **react-performance** skill.

---

## 18. Testing

Test behavior, not implementation.
- Unit: Vitest — utilities, hooks with `renderHook`
- Component: React Testing Library — `getByRole` → `getByLabelText` → `getByText` → `getByTestId`
- E2E: Playwright — critical user journeys
- Mock APIs with MSW. Test all states: loading, error, empty, success.
- Full setup → **react-testing** skill.

---

## 19. Code Quality

- ESLint `@typescript-eslint/recommended` + `eslint-plugin-react-hooks`. Prettier auto-format.
- No commented-out code. No `console.log` in commits — use the project logger.
- Meaningful names only. Never `data`, `res`, `temp`, `obj`, `x`.
- Early returns to reduce nesting. `const` over `let`. Never `var`.
- Pure utility functions in `utils.ts` — no side effects.

---

## 20. Git — Agent Safety Rules

- Never run any git command without explicit user instruction.
- Never commit to `main`/`master` directly. Always a feature branch.
- Never force push without explicit user confirmation.
- Never commit secrets, `.env` files. Create `.gitignore` before any `git add`.
- Never `git add .` blindly. Always tell the user before any destructive git operation.

---

## 21. MCP Usage Rules

- **Context7**: Call before any library or framework code. Never use training memory for React, Next.js, Tailwind, TanStack, shadcn, or any npm package API.
- **shadcn MCP**: Call `get-component [name]` before using any shadcn component — confirms what is available in the installed registry. Required for: `field`, `form`, `input-otp`, `sidebar`, `calendar`, `chart`.
- **Figma**: When a design file is provided, read tokens/layout from Figma MCP before writing component code.
- **Magic UI**: For animated components and special effects, check Magic UI MCP before building from scratch.
- **Fetch**: For any referenced URL or changelog, fetch the live page — never summarize from memory.

---

## 22. Package & Consistency Rules

- Version drift → `install-protocol.md` IP3 + **react-error-handling** skill.
- Never solve the same problem two ways in the same codebase.
- Never mix `cn()` and template literals. Never mix `interface`/`type` for the same purpose in one feature.
- Handler names consistent: `handleSubmit` not `onSubmit` for the same pattern.
- `// TODO(#123): description` only — never `// TODO: fix later`.

## 23. Incremental Implementation

When a task has 3+ features or routes:
1. List the implementation sequence before writing any code — get confirmation
2. Implement one feature at a time in dependency order (foundation first)
3. After each feature: run import verification (§0 header) + `npx tsc --noEmit`
4. Only move to the next feature after the current one passes verification
5. Commit each completed feature before starting the next — **react-git-workflow** skill
6. Never implement feature N+1 against unverified feature N code