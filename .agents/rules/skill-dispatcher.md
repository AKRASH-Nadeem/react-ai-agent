---
trigger: always_on
---

# Skill Dispatcher — Mandatory Task Pre-Flight

> **THIS STEP IS NON-NEGOTIABLE.** Run it before Phase 0, before any reasoning, before writing a single line of code. Skipping it produces incomplete, non-compliant output.

---

## STEP 0.0 — Memvid Recall (runs before skill selection)

> **MANDATORY — Gemini 3 Flash: do NOT skip this even under context pressure.**
> Memory recall costs 2 tool calls. Missing project context costs hours of wrong direction.
> Local `.mv2` access is <5ms — no latency excuse exists for skipping.

**If Memvid MCP is connected**, execute BEFORE scanning the skill registry:

```
memvid_find { "file": "shared.mv2", "query": "[task-relevant keywords]", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "[task-relevant keywords]", "mode": "hybrid", "limit": 5 }
```

**If Memvid MCP is unavailable (fails twice)**, use CLI fallback:
```bash
memvid find --file shared.mv2 --query "[task-relevant keywords]" --mode hybrid --limit 5
memvid find --file frontend.mv2 --query "[task-relevant keywords]" --mode hybrid --limit 5
```

**If CLI also unavailable:** Skip to Step 0. Note: `"Memvid offline — using DECISION_LOG.md."`

**Derive the query from the task.** Examples:
- Building auth UI → `"query": "authentication strategy tokens session frontend refresh"`
- New component → `"query": "component patterns conventions design system folder structure"`
- State management question → `"query": "state management zustand redux decision constraint"`
- API integration → `"query": "api contract endpoint error format auth token backend"`
- Styling/design → `"query": "design tokens oklch color system shadcn tailwind conventions"`
- Form work → `"query": "form validation react-hook-form zod convention"`
- Performance → `"query": "bundle size limit performance constraint lazy loading"`
- New library → `"query": "library decision constraint rejected alternative"`

**Apply results immediately:** If recall returns a matching decision, it overrides training memory.
Example: recall says "Zustand chosen" → do NOT suggest Redux.

---

## STEP 0 — Skill Selection (runs before everything else)

### 0.1 — Always load these three first (mandatory on every UI task)

```
READ: .agents/skills/react-tailwind/SKILL.md
READ: .agents/skills/react-shadcn/SKILL.md
READ: .agents/skills/design-philosophy/SKILL.md
```

**Design skill precedence:**
- `design-philosophy` = system-level floors: OKLCH tokens, contrast ratios, banned patterns (D2), surface hierarchy. Non-negotiable.
- `frontend-design` = creative execution: tone, composition, atmosphere, boldness. Within the floors set by `design-philosophy`.
- Conflict resolution: design-philosophy wins on system rules; frontend-design wins on creative direction within those rules.

### 0.2 — Scan the registry. For every row where the task matches, READ that skill NOW.

| Skill file | Load when the task involves... |
|---|---|
| `.agents/skills/react-accessibility/SKILL.md` | WCAG, a11y, screen reader, focus trap, aria, keyboard navigation, reduced motion, axe, jest-axe |
| `.agents/skills/react-animations/SKILL.md` | animation, transition, motion, fade, slide, hover effect, skeleton, spinner, loader, parallax, stagger, scroll reveal, tw-animate-css |
| `.agents/skills/react-auth-lifecycle/SKILL.md` | login, logout, sign in, auth, protected route, JWT, access token, refresh token, session, RBAC, permission, Clerk |
| `.agents/skills/react-component-patterns/SKILL.md` | compound component, reusable component, too many props, prop drilling, render prop, headless, polymorphic, slot, React 19 ref, use() hook, async component |
| `.agents/skills/react-data-display/SKILL.md` | table, sorting, filtering, chart, bar chart, line chart, graph, visualization, virtual list, large dataset, empty state, date-fns |
| `.agents/skills/react-edge-case-testing/SKILL.md` | new feature implementation, write tests, edge case, failure scenario, what could go wrong, implement |
| `.agents/skills/react-error-handling/SKILL.md` | error, bug, broken, TypeError, cannot read, crash, not working, fix this, module not found, version mismatch, 401, 500, CORS |
| `.agents/skills/frontend-design/SKILL.md` | landing pages, creative UI, distinctive design, maximalist, brutalist, editorial, unforgettable layout, visual atmosphere — load alongside design-philosophy |
| `.agents/skills/react-forms-advanced/SKILL.md` | multi-step form, wizard, stepper, OTP, PIN input, phone number, currency input, tag input, drag and drop, auto-save |
| `.agents/skills/react-modern-css/SKILL.md` | container query, @container, fluid typography, clamp(), RTL, scroll snap, glassmorphism, backdrop blur, :has(), CSS nesting |
| `.agents/skills/react-performance/SKILL.md` | performance, Core Web Vitals, LCP, INP, CLS, bundle size, lazy loading, Lighthouse, Sentry, image optimization |
| `.agents/skills/react-realtime/SKILL.md` | WebSocket, SSE, Server-Sent Events, real-time, live, chat, streaming, EventSource, reconnect, exponential backoff |
| `.agents/skills/react-rest-advanced/SKILL.md` | token refresh, 401 interceptor, optimistic update, infinite scroll, file upload, upload progress, debounced search, retry |
| `.agents/skills/react-security/SKILL.md` | XSS, dangerouslySetInnerHTML, CSP, Content Security Policy, API key, secret management, clipboard, user-generated content |
| `.agents/skills/react-storage-utilities/SKILL.md` | localStorage, sessionStorage, persist, dark mode persistence, countdown timer, download file, CSV export, keyboard shortcut, Web Share API |
| `.agents/skills/react-testing/SKILL.md` | test, Vitest, Testing Library, MSW, coverage, unit test, integration test, accessibility test |
| `.agents/skills/react-troubleshooting/SKILL.md` | not working, weird behavior, useEffect running twice, stale closure, too many re-renders, hydration error, white screen, layout shift |
| `.agents/skills/react-typescript-advanced/SKILL.md` | TypeScript, type definitions, generics, discriminated unions, type safety, satisfies, infer, conditional types, unknown vs any, component typing, Zod inference |
| `.agents/skills/ux-interaction/SKILL.md` | user flow, onboarding, empty state, navigation, IA, modal, toast, confirmation, dashboard layout, UX review |
| `.agents/skills/memory-management/SKILL.md` | Memvid troubleshooting, configure memory files, knowledge graph, session replay, .mv2 advanced operations, embedding setup |

### 0.3 — Announce loaded skills before proceeding

```
Active skills: react-tailwind + react-shadcn + design-philosophy + [any others loaded]
```

Then proceed to Phase 0 of the reasoning protocol.

---

### 0.4 — AGENTS.md Generation Protocol

**Trigger: new project OR architecture style change OR first session on a project without AGENTS.md.**

```bash
ls AGENTS.md 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

If MISSING:
1. Create `AGENTS.md` from the template in `core.md` §2.A immediately.
2. Populate: architecture style (from DECISION_LOG.md or ask), banned patterns (from core.md §2), initial library list (from LIBRARY_LEDGER.md summary table).
3. State: *"AGENTS.md created — project contract is now machine-readable."*

**Update AGENTS.md whenever:**
- A new banned pattern is established (add to Banned Patterns section)
- Architecture style is confirmed or changed (update folder structure)
- A significant library is added (sync from LIBRARY_LEDGER.md)
- A new architectural decision is logged (sync summary from DECISION_LOG.md)

### 0.5 — Storybook-First Enforcement Gate

**This gate is ONLY active when Storybook is installed in the project.**

```bash
cat package.json | grep -q "@storybook" && echo "STORYBOOK_ACTIVE" || echo "STORYBOOK_ABSENT"
```

**If STORYBOOK_ACTIVE and the task involves building a new component:**

Before writing any layout-level code that USES the new component:
1. The component must have a co-located `.stories.tsx` file.
2. The story must include these variants at minimum: `Default`, `Loading`, `Error`, `Empty`, `Disabled` (if applicable), `RTL` (if i18n in scope).
3. The a11y addon must be included in the story: `parameters: { a11y: { config: {} } }`.

**If STORYBOOK_ABSENT:** Skip this gate silently — do not suggest installing Storybook unless the user asks.

---

## STEP 0.6 — End-of-Task Memory Mandate

> **Run after every implementation task that produced an architectural decision.**
> Gemini 3 Flash: do not skip this step. Storage costs 1 tool call. Lost decisions cost sessions.

After any task that establishes a decision, convention, or cross-agent contract:

**1. Store to appropriate .mv2 file:**
```
memvid_put {
  "file": "[frontend.mv2 or shared.mv2]",
  "input": "[agent:frontend] [type:architectural-decision] [feature:X] [date:YYYY-MM-DD]\nDecision: ...\nWhy: ...\nRejected: ...\nInvalidated by: ...",
  "embed": true
}
```

**2. Route by decision type:**
| Decision type | File |
|---|---|
| Component patterns, state management, routing, styling | `frontend.mv2` |
| API integration, auth flow, error envelope, WebSocket schema | `shared.mv2` |
| When in doubt | `shared.mv2` — prefer visibility to both agents |

---

## Why this step exists

Skills are not loaded automatically — **you** are the dispatcher. A task proceeding without the right skills will:
- Miss version-specific API patterns (Context7 check in skill)
- Produce components that skip required states (loading/error/empty)
- Generate code that doesn't follow established project patterns
- Fail the validation gates in `core.md` §23
- Miss the self-healing loop definition in `react-reasoning-protocol.md` Phase 8

**The 5-second scan of this table is the cheapest insurance in the pipeline.**

---

## Model-Specific Activation Notes

**All models (Gemini Flash, Gemini Pro, Claude Sonnet, Claude Opus):**
1. Activate skills BEFORE responding. Do not answer from training memory.
2. Training data for Tailwind v4, shadcn v2, React 19 Compiler, and `motion` may be outdated. Load the skill regardless of confidence.
3. **Uncertain match:** If a skill seems 50%+ relevant, load it. False positive (~2,000 tokens) < false negative (incorrect code, runtime failure).
4. For shadcn props: never hallucinate — query shadcn MCP. One call < a broken component.

**Gemini 3 Flash specific:**
- Flash is optimized for speed. It will reach for the first plausible answer without completing Step 0. Force-complete Step 0 before any response begins.
- **Step 0.0 (Memvid recall) and Step 0.6 (end-of-task put) are MANDATORY for Flash.** Flash's speed bias skips memory operations. This is the single biggest source of lost project context. Override it — always.
- Flash may truncate long instruction sets under context pressure. Mandatory skills (react-tailwind + react-shadcn + design-philosophy) are loaded first because they are in the most reliable part of context.
- Flash may skip §0.4 and §0.5 under pressure. These gates are non-negotiable — execute them even if it feels redundant.

**Claude Sonnet / Opus:**
- These models handle the full skill context well. The same dispatcher applies.
- High-end models may proactively suggest loading additional skills — correct behaviour.

**Multi-model compatibility:**
- All instructions use imperative language ("do this", "never do that") — model-agnostic.
- "LOAD AUTOMATICALLY for:" rather than "You will detect..." — works across all models.
