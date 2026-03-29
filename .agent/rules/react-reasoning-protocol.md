---
trigger: always_on
---

# React Reasoning Protocol — Frontend-Aware Thinking Before Building

> These rules are ALWAYS ACTIVE. They govern how the agent reasons
> before implementing non-trivial frontend decisions.

---

## Reasoning & Invalidation Log

```
DECISION 1: Read before building (same as Django protocol)
  Initial: Agent builds from task description alone
  Invalidated: Agent introduces a new pattern (e.g., a new error boundary
               shape) that conflicts with the one already in the codebase.
               Three sessions later there are two incompatible patterns.
  Solution: Check LIBRARY_LEDGER.md and existing code patterns FIRST.
            Reuse what exists. Introduce new patterns only when existing
            ones genuinely cannot serve.

DECISION 2: Bundle impact check is mandatory, not optional
  Initial: tech-stack.md already has the 20KB rule — no need to repeat
  Invalidated: tech-stack.md gates library ADDITIONS. But bundle impact
               also applies to HOW something is used: barrel imports,
               non-tree-shaken patterns, loading all icons. The reasoning
               protocol catches usage patterns, not just install decisions.
  Solution: Reasoning protocol includes a bundle usage check, separate
            from the library addition check in tech-stack.md.

DECISION 3: React Compiler compatibility is a constraint category
  Initial: Covered by tech-stack.md TS2.1
  Invalidated: TS2.1 is about library selection. But existing code can
               also break Compiler: manual useMemo/useCallback calls,
               mutable objects in props, certain ref patterns. The agent
               needs to check Compiler compatibility when WRITING code,
               not just when SELECTING libraries.
  Solution: Compiler compat is a constraint in the implementation
            reasoning, not just the library selection reasoning.

DECISION 4: "Ask the user" threshold
  Initial: Ask whenever uncertain
  Invalidated: Asking on every decision creates noise. Developers stop
               reading the questions. The real threshold is: when would
               two different developers reasonably make different choices
               that they'd both have to live with long-term?
  Solution: Ask only when: (1) bundle impact >20KB gzipped, or (2) a
            new pattern would conflict with an existing one, or (3) the
            implementation requires infrastructure the agent can't confirm
            exists (new API endpoint, new auth scope, new env var).
```

---

## When to Apply This Protocol

ALWAYS apply before:
- Choosing between two valid implementation approaches
- Adding any new UI pattern that doesn't exist in the codebase yet
- Any feature with performance implications (virtualization, lazy loading, SSE)
- Any feature that introduces a new global state shape
- Any form or interaction with complex validation or conditional logic

SKIP (just build it well):
- Adding a new field to an existing form
- Writing a new page that follows the exact pattern of an existing page
- Fixing a bug with a clear, isolated cause
- Styling changes within an existing component

---

## Phase 1 — Read Before Building

Before writing any code, check in this order:

1. **LIBRARY_LEDGER.md** — what is installed? what versions? what was rejected?
2. **Existing components** — does a similar component already exist?
   `ls src/features/ | grep [feature-name]` — if yes, follow its pattern.
3. **Existing hooks** — does a similar hook exist?
   `ls src/hooks/` and `ls src/features/*/` — don't create a duplicate.
4. **lib/env.ts** — what env vars are configured?
   Does the feature need one that isn't there yet?

Only build something new after confirming it doesn't already exist.
If it partially exists, extend it rather than create a parallel pattern.

---

## Phase 2 — Frontend Constraint Inventory

For each non-trivial decision, work through these constraints:

**Bundle impact:**
- Does this add a new package? → bundlephobia check (>20KB gzipped = ask)
- Does this use named imports only? → barrel imports bloat the bundle
- Does this code-split at the route level? → heavy features need `React.lazy`
- Does this load synchronously on the initial render? → should it be deferred?

**React Compiler compatibility:**
- Does this manually write `useMemo`, `useCallback`, or `React.memo`?
  → Remove them. The compiler handles this. Manual memoization fights the compiler.
- Does this mutate props or state objects in place?
  → Never. The compiler assumes immutability.
- Does this depend on a library that manually manages re-renders?
  → Flag it. May conflict with the compiler.

**Accessibility impact:**
- Does this change focus management? → keyboard users must not get lost
- Does this hide/show content? → `aria-hidden`, `aria-expanded` needed
- Does this trigger a dynamic change? → `aria-live` region needed
- Does this add a new interactive pattern? → check **react-accessibility** skill

**Loading and state budget:**
- How many loading states will the user see at once?
  → Multiple concurrent spinners = worse UX than one coordinated skeleton
- Does this need an empty state, error state, and success state?
  → All three must be implemented. Missing states = incomplete feature.
- Does this show stale data while refreshing?
  → Document the stale-while-revalidate behavior in a comment.

**Browser compatibility:**
- Does this use a CSS feature not widely supported? → check caniuse first
- Does this use a Web API (Clipboard, Share, Notification)?
  → Needs a feature detection fallback for Safari
- Does this use a CSS animation that needs `prefers-reduced-motion`?
  → Wrap every decorative animation

---

## Phase 3 — Clear Winner Test

Is one approach clearly better given the known constraints?

YES → build it, state why in one sentence.
Do not present options when there is a professional standard answer.

Genuine trade-off exists when:
- Two approaches have meaningfully different bundle impacts (>5KB delta)
- Two approaches require different global state shapes (harder to change later)
- The right choice depends on whether the developer plans to extend this feature
- One approach requires a new library and the other doesn't

**Small team rule**: For teams of 1–3 developers, prefer the approach with
lower cognitive overhead and simpler debugging — even if a more powerful
pattern exists. The maintenance cost of clever patterns outweighs their benefits.

---

## Phase 4 — Present Trade-offs (genuine forks only)

```
DECISION NEEDED: [what this is about]

OPTION A — [short name]
  Best when: [scenario]
  Bundle impact: ~[X]KB / none
  Complexity: [low / medium / high]
  Downside: [what it fails at]

OPTION B — [short name]
  Best when: [scenario]
  Bundle impact: ~[X]KB / none
  Complexity: [low / medium / high]
  Downside: [what it fails at]

MY RECOMMENDATION: [A or B] because [one concrete reason].

Which would you like?
```

Rules:
- Maximum 2 options. More = decision paralysis.
- Always give a recommendation. Never "it depends."
- If bundle impact is the deciding factor, state the exact KB difference.
- If accessibility is the deciding factor, the accessible option wins —
  this is not a trade-off to present. Apply it without asking.

---

## Phase 5 — Self-Invalidation (React-Specific Questions)

Before committing to an implementation, ask:

1. "Will this break if the user navigates away mid-operation?"
   → If yes: cancel in-flight requests, clean up effects.

2. "Will this cause a flash of unstyled/incomplete content?"
   → If yes: coordinate loading states, use Suspense boundaries.

3. "Will this cause unnecessary re-renders?"
   → Profile with React DevTools before deciding, not after.

4. "What happens if the API returns an unexpected shape?"
   → Zod `.safeParse()` on every response. Never trust raw types.

5. "What happens in slow network conditions?"
   → Test with Chrome throttling. Is the loading state clear?

6. "What happens if localStorage/sessionStorage is unavailable?"
   → Private browsing, storage full, security restrictions. Always try/catch.

---

## Anti-Patterns This Protocol Prevents

❌ Creating a new hook that duplicates an existing one
   → Phase 1 read catches it

❌ Adding a 30KB library for something native fetch does
   → Phase 2 bundle check catches it

❌ Writing useMemo in a component
   → Phase 2 Compiler check catches it

❌ Implementing a feature without empty/error/loading states
   → Phase 2 state budget catches it

❌ Presenting a trade-off where accessibility is a dimension
   → Accessibility is never a trade-off — Phase 4 removes it from options

❌ Building a complex pattern for a 1-developer project
   → Phase 3 small team rule catches it

❌ Asking the user about a decision with a clear professional answer
   → Phase 3 clear winner test catches it
