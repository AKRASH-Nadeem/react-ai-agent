# React AI Agent — Google Antigravity

> A complete knowledge system that makes an AI agent reason and work like a **Principal React TypeScript Engineer** — with production-grade standards, accessibility-first design, and zero tolerance for generic output.

Built by **Akrash Nadeem** · MIT License

---

## What Is This?

This is an **agent configuration package** for [Google Antigravity](https://deepmind.google/technologies/gemini/). It turns a general-purpose AI agent into a senior frontend engineer who:

- Reasons before building (never jumps straight to code)
- Enforces TypeScript strict mode, React 19, and modern tooling
- Refuses generic design patterns and pushes for distinctive UIs
- Verifies every library import against live documentation (via Context7 MCP)
- Tests failure scenarios before writing implementation code
- Tracks every dependency decision in a `LIBRARY_LEDGER.md`
- Follows accessibility-first standards (WCAG 2.2) on every component

---

## Folder Structure

```
.agent/
├── rules/                        # Always-on rules — loaded into the agent context
│   ├── core.md                   # Master engineering standards (TypeScript, components, hooks, state, testing)
│   ├── design-philosophy.md      # Anti-generic design mandate + typography/color/motion system
│   ├── react-reasoning-protocol.md  # 6-phase reasoning loop before any non-trivial decision
│   ├── react-engineering-philosophy.md  # Environment variable discipline + config patterns
│   ├── mcp-servers.md            # MCP tool priority order and usage rules
│   ├── tech-stack.md             # Library selection + approval protocol + veto list
│   ├── install-protocol.md       # Package install flow + version mismatch handling
│   ├── library-ledger.md         # LIBRARY_LEDGER.md format and maintenance rules
│   ├── project-context.md        # Session start protocol + incremental implementation gates
│   └── versions.lock.md          # Baseline package versions for all skill examples
│
└── skills/                       # Domain skills — loaded on trigger
    ├── react-accessibility/      # WCAG 2.2, focus traps, aria-live, automated a11y testing
    ├── react-animations/         # motion library, CSS transitions, prefers-reduced-motion
    ├── react-auth-lifecycle/     # Auth flows, protected routes, token refresh, session management
    ├── react-component-patterns/ # Compound components, render props, polymorphic, headless
    ├── react-data-display/       # TanStack Table, TanStack Virtual, recharts, empty states
    ├── react-edge-case-testing/  # Failure-first reasoning + adversarial test scenario generation
    ├── react-error-handling/     # Error boundaries, error taxonomy, recovery flows
    ├── react-forms-advanced/     # Wizards, OTP, phone, currency inputs, DnD, auto-save
    ├── react-git-workflow/       # Branch strategy, conventional commits, PR templates
    ├── react-modern-css/         # Container queries, CSS layers, fluid type, cascade
    ├── react-performance/        # Core Web Vitals, Lighthouse CI, bundle budgets, lazy loading
    ├── react-realtime/           # WebSocket, SSE, connection state, reconnection logic
    ├── react-rest-advanced/      # Optimistic updates, infinite scroll, file upload, token refresh
    ├── react-security/           # XSS prevention, CSP, safe redirects, clipboard handling
    ├── react-shadcn/             # shadcn/ui install patterns, Field vs Form, version detection
    ├── react-storage-utilities/  # localStorage, sessionStorage, keyboard shortcuts, downloads
    ├── react-tailwind/           # Tailwind v3/v4 detection, config, tokens, responsive
    ├── react-testing/            # Vitest, React Testing Library, MSW, Playwright setup
    ├── react-troubleshooting/    # Systematic debugging methodology + diagnosis protocols
    └── ux-interaction/           # Information architecture, feedback patterns, loading states
```

---

## How It Works

### Rules vs Skills

**Rules** (`rules/`) are always active. Every session, every task, every file. They define the non-negotiable engineering and design standards.

**Skills** (`skills/`) are domain-specific modules loaded by the agent based on what you're building. For example:
- Building a form? → `react-forms-advanced` activates
- Adding an animation? → `react-animations` activates
- Debugging a crash? → `react-troubleshooting` + `react-error-handling` activate

Two skills are **mandatory on every UI task** regardless of trigger: `react-tailwind` + `react-shadcn`.

### The Reasoning Loop

Before writing any non-trivial code, the agent runs a 6-phase protocol:

1. **Read first** — checks `LIBRARY_LEDGER.md` and existing patterns before introducing anything new
2. **Constraint inventory** — bundle impact, React Compiler compat, accessibility, state budget, browser APIs
3. **Clear winner test** — if one approach is professionally obvious, takes it without asking
4. **Trade-off presentation** — only asks when there's a genuine fork with long-term consequences
5. **Failure scenario inventory** — names specific failure modes for connection, race conditions, session expiry, empty states, double actions, and browser environment
6. **Connect failures to tests** — every identified failure scenario maps to a named MSW handler + assertion

### Version Awareness

All skill examples are written against baseline versions in `versions.lock.md`. Before using any skill example, the agent:
1. Checks the installed version in `package.json`
2. If it matches the baseline major → uses the example as a structural pattern
3. If it differs → queries Context7 with the installed version before writing any code
4. If the library isn't installed → follows `install-protocol.md` (Context7 → install → ledger entry)

---

## Required MCP Servers

These MCP tools must be configured in your Antigravity agent for the rules to function correctly.

| MCP | Required | Purpose |
|-----|----------|---------|
| **Context7** | ✅ Required | Live library documentation — prevents outdated API usage |
| **shadcn MCP** | ✅ Required | Confirms which shadcn components exist before writing code |
| **GitHub MCP** | Recommended | Reads existing codebase patterns before generating new ones |
| **Figma MCP** | Optional | Pixel-accurate code generation from Figma specs |
| **Magic UI MCP** | Optional | Pre-built animated components (hero sections, marquees, etc.) |
| **Fetch MCP** | Optional | Fetches changelogs and niche docs that Context7 doesn't cover |

> **Important:** The agent's core mandate is: *Context7 before any library code. Always.* If Context7 is not connected, the agent will generate code from training memory — which may be 6–18 months out of date.

---

## Priority Order (Within Each Task)

When the agent has access to multiple information sources, it follows this hierarchy:

```
1. GitHub MCP       → What does our codebase already do?
2. shadcn MCP       → Does this component exist in the installed registry?
3. Context7 MCP     → What does the library's current docs say?
4. Figma MCP        → What does the design spec require?
5. Magic UI MCP     → Does this animated component already exist?
6. Fetch MCP        → Is there a live URL to verify against?
```

---

## Design Standards at a Glance

The agent enforces a strict **Anti-Generic Design** mandate. The following are hard-banned (the agent will push back and propose alternatives):

| Category | What's Banned | Why |
|----------|--------------|-----|
| Typography | Inter, Roboto, Space Grotesk, Poppins | Overused AI defaults — products blend in |
| Colors | Purple-to-pink gradients, safe teal/blue SaaS palette | Signals "AI-generated" immediately |
| Layout | Centered column + equal padding, Hero → grid → CTA skeleton | Template-matching — visitors tune it out |
| Effects | Box shadows on every card, `rounded-2xl` on everything uniformly | Flattens visual hierarchy |

The priority order for every design decision: **Functional → Accessible → Performant → Maintainable → Beautiful.**

Accessibility never loses to aesthetics. When they conflict, accessibility wins.

---

## Technology Stack (Defaults)

| Layer | Default Choice |
|-------|---------------|
| Framework | React 19 + Vite 6 |
| Language | TypeScript (strict mode always) |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Forms | react-hook-form + Zod |
| Icons | lucide-react |
| Toasts | sonner |
| Animations | motion (formerly framer-motion) |
| Testing | Vitest + React Testing Library + Playwright + MSW |

**Permanently banned libraries:** `moment.js`, `jQuery`, `lodash` (full import), `axios`, `styled-components`, `emotion`, `Redux`, `framer-motion` (old package), `react-query` (v3/v4 package name).

---

## Key Behavioural Rules

- **Never `useMemo`, `useCallback`, or `React.memo` manually** — React Compiler handles memoization
- **Never `import.meta.env.VITE_*` directly** — always import from `lib/env.ts` (Zod-validated)
- **Never `useEffect` for data fetching** — always TanStack Query
- **Never relative imports** (`../`, `../../`) — always `@/` path aliases
- **Never `any`** — use `unknown` and narrow, or generics
- **Never `<div onClick>`** — semantic HTML only (`<button>`, `<nav>`, etc.)
- **Never proceed with unresolved TypeScript errors** — `tsc --noEmit` must be zero before any feature is "done"
- **Never run git commands without explicit user instruction**
- **Never add a library without the TS2 checklist** in `tech-stack.md`

---

## Project Artifacts the Agent Maintains

| File | Location | Purpose |
|------|----------|---------|
| `LIBRARY_LEDGER.md` | Project root | Every library installed, why, alternatives considered, Context7 query used |
| `lib/env.ts` | `src/lib/` | Zod-validated env var schema — the only place env vars are accessed |
| `.env.example` | Project root | Documents every `VITE_*` variable with placeholder and comment |

---

## Validation Gates (Feature Completion)

A feature is not done until all six gates pass:

1. `npx tsc --noEmit` → zero errors
2. Every `@/components/ui/X` import resolves to a real file
3. Loading, error, empty, and success states all implemented
4. Accessibility baseline: keyboard-focusable, semantic HTML, `alt` text, no color-only status
5. Zero `console.error` / `console.warn` in browser
6. `npm run build` passes cleanly

---

## License

MIT License — see [LICENSE](./LICENSE) for full terms.

Copyright © 2026 Akrash Nadeem
