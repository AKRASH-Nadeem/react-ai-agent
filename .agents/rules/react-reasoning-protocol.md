---
trigger: always_on
---

# React Reasoning Protocol — Frontend-Aware Thinking Before Building

> These rules are ALWAYS ACTIVE. They govern how the agent reasons before implementing non-trivial frontend decisions.

---

## When to Apply

**ALWAYS apply before:**
- Choosing between two valid implementation approaches
- Adding any new UI pattern not already in the codebase
- Any feature with performance implications (virtualization, lazy loading, SSE)
- Any feature that introduces a new global state shape
- Any form or interaction with complex validation or conditional logic

**SKIP only for:**
- New field on an existing form that mirrors another field exactly
- New page that is a structural copy of an existing page
- Bug with a single-line, isolated fix
- Style or copy changes within an existing component

**When in doubt: apply it.**

---

## Phase 0 — Interrogate the Requirement

> Defined in `senior-dev-mindset.md`. Apply the Three Questions before reasoning about *how* to implement.

1. What is the actual problem (stripped of the stated solution)?
2. What assumption is embedded in this request?
3. Is the implementation complexity proportional to the problem?

Check the Frontend Requirement Smells table in `senior-dev-mindset.md`. Raise concerns before Phase 1.

---

## Phase 1 — Read Before Building

1. **AGENTS.md** — read the project contract first. Are there banned patterns? Architecture style?
2. **DECISION_LOG.md** — what was decided and why? Flag conflicts before proceeding.
3. **LIBRARY_LEDGER.md** — what is installed? What was rejected?
4. **Existing components** — does a similar component exist? `ls src/features/` or `ls src/components/`
5. **Existing hooks** — `ls src/hooks/` and `ls src/features/*/`
6. **lib/env.ts** — what env vars are configured?

Only build something new after confirming it doesn't already exist.

---

## Phase 2 — Multi-Perspective Constraint Inventory

Before writing code, evaluate the feature through ALL of these lenses. For each, name the specific impact on THIS feature — not generically.

### Bundle & Performance
- New package? → bundlephobia check (>20KB gzipped = ask)
- Named imports only? → barrel imports bloat bundle
- Code-split at route level? → heavy features need `React.lazy`
- React Compiler compatible? → no manual `useMemo`/`useCallback`/`React.memo`

### Accessibility & UX
- Changes focus management? → keyboard path must be complete
- Hides/shows content? → `aria-hidden`, `aria-expanded` needed
- Triggers dynamic change? → `aria-live` region needed
- Multiple spinners? → coordinate into one skeleton

### State Budget
- All three states implemented: empty, error, success?
- Stale data while refreshing? → document the behaviour

### Browser Compatibility
- CSS feature not widely supported? → caniuse check
- Web API (Clipboard, Share, Notification)? → feature detection for Safari
- CSS animation? → `prefers-reduced-motion` wrapper

### SEO (if public-facing)
- Page has `<title>` and `<meta name="description">`?
- Dynamic routes have unique, descriptive titles?
- Structured data (`<script type="application/ld+json">`) if appropriate?
- No critical content rendered only in JS without SSR/SSG?

### i18n / l10n (if multi-locale scope)
- All user-visible strings extracted to translation keys?
- Date, number, and currency formatting using locale-aware APIs (`Intl`)?
- Layout handles text expansion (German/Finnish ~30% longer than English)?
- RTL layout supported if required? → **react-modern-css** for `dir` handling

### Data Privacy & GDPR/CCPA
- No PII (email, name, ID) in `console.log`, Sentry breadcrumbs, or analytics events?
- User consent gate required before analytics or tracking?
- Data retention: does this feature store personal data in localStorage or a DB?
- Is there a deletion path if the user requests data removal?

### Observability & Analytics
- Are key user actions emitting analytics events (not on every render — on deliberate action)?
- Are errors tagged with context (user ID, route, component name) for Sentry?
- Are custom metrics defined for critical interactions (form submission, payment)?

### Cost Efficiency
- Is this feature triggering unnecessary API calls (e.g., refetch on every render)?
- Are heavy computations memoized by the Compiler, or do they run in render?
- Does this introduce polling? If so, is the interval justified vs a push mechanism?

### AI Failure Mode (new lens)
- Is any business logic embedded in a JSX render function? → Extract to hook/util
- Is validation inline in an event handler? → Move to Zod schema
- Is a permission check in a render condition? → Server must enforce; UI is UX only
- Is API client code inside a useEffect? → Move to TanStack Query

### Context & Session Continuity (new lens)
- Does this feature span multiple sessions or produce architectural decisions?
- If yes: are decisions being stored via Memvid `memvid_put` (or DECISION_LOG.md) before this session ends?
- Does Memvid MCP have relevant prior cross-agent context? → `memvid_find` on shared.mv2 before building (see mcp-servers.md)
- Does this feature require a state handoff format for async work?

---

## Phase 3 — Clear Winner Test

Is one approach clearly better? → **build it**, state why in one sentence.

A genuine trade-off exists when:
- Two approaches have meaningfully different bundle impacts (>5KB delta)
- Two approaches require different global state shapes
- The choice depends on whether the feature will be extended
- One approach requires a new library and the other doesn't

**Small team rule:** For 1–3 developers, prefer the approach with lower cognitive overhead.

---

## Phase 4 — Present Trade-offs (genuine forks only)

```
DECISION NEEDED: [what this is about]

OPTION A — [short name]
  Best when: [scenario]   Bundle impact: ~[X]KB   Complexity: [low/medium/high]
  Downside: [what it fails at]

OPTION B — [short name]
  Best when: [scenario]   Bundle impact: ~[X]KB   Complexity: [low/medium/high]
  Downside: [what it fails at]

MY RECOMMENDATION: [A or B] because [one concrete reason].
```

Max 2 options. Always recommend. If accessibility is the deciding factor, the accessible option wins — not a trade-off.

---

## Phase 5 — Failure Scenario Inventory

For each question, name the specific component, hook, user action, and outcome for THIS feature.

- **Connection failure** — what does the user see if every API call fails, is slow, or is interrupted?
- **Request race** — what if responses arrive out of order, or after component unmounts?
- **Session boundary** — what if the token expires or permissions change mid-interaction?
- **Empty and zero** — what does every data-dependent view show with empty array / null?
- **Double action** — what if the user triggers the primary action twice before response?
- **Browser environment** — which Web APIs are called? What is the failure mode when unavailable?
- **Accessibility path** — walk through the feature using only a keyboard. Name every gap.
- **Privacy path** — what data does this feature expose or store? Name the GDPR implications.

Each failure scenario identified is a test obligation.

---

## Phase 6 — Connect Failures to Tests

For each Phase 5 scenario, name the MSW handler configuration and assertion that proves the defence holds. Apply `react-edge-case-testing` skill for the full thinking loop.

---

## Phase 7 — Retain Memory / Update Records

If this task produced a new architectural decision (library chosen, pattern established, constraint surfaced):
1. **Store** the memory via Memvid MCP (`memvid_put` tool) to the appropriate `.mv2` file.
2. If Memvid is unavailable, update `DECISION_LOG.md` (replace changed entries — do not append).
If no architectural decision was made, skip this phase.

---

## Phase 8 — Agentic Self-Healing Loop

When tests fail after implementation:

```
Iteration 1: Read the exact test error. Identify root cause. Fix the code.
Iteration 2: If still failing — re-read the requirement. Am I solving the right problem?
Iteration 3: If still failing — STOP. Do not patch further.
```

After 3 failed iterations:
1. State: *"I've attempted 3 iterations on [test name] and it's still failing. The root cause appears to be [hypothesis]. This needs human review."*
2. Output: the exact failing assertion, your hypothesis about the root cause, what you tried.
3. Do not attempt a 4th iteration without user direction.

**Why:** Uncapped iteration loops produce patch-over-patch code that passes the test while violating the original design. 3 attempts is the professional signal that the problem is larger than the implementation.

---

## Anti-Patterns This Protocol Prevents

- Creating a hook that duplicates an existing one → Phase 1 read catches it
- Adding a 30KB library for something native fetch does → Phase 2 bundle check catches it
- Writing useMemo manually → Phase 2 Compiler check catches it
- Missing empty/error/loading states → Phase 2 state budget catches it
- PII in logs → Phase 2 data privacy lens catches it
- Missing i18n → Phase 2 i18n lens catches it
- Business logic in JSX → Phase 2 AI failure mode lens catches it
- Accepting a requirement that solves the wrong problem → Phase 0 catches it
- Reversing a decision without noticing → Phase 1 DECISION_LOG.md catches it
- Looping forever on a failing test → Phase 8 iteration ceiling catches it
