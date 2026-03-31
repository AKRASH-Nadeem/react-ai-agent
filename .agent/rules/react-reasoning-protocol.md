---
trigger: always_on
---

# React Reasoning Protocol — Frontend-Aware Thinking Before Building

> These rules are ALWAYS ACTIVE. They govern how the agent reasons
> before implementing non-trivial frontend decisions.

---

## When to Apply

**ALWAYS apply before:**
- Choosing between two valid implementation approaches
- Adding any new UI pattern not already in the codebase
- Any feature with performance implications (virtualization, lazy loading, SSE)
- Any feature that introduces a new global state shape
- Any form or interaction with complex validation or conditional logic

**SKIP only for:**
- Adding a new field to an existing form that exactly mirrors another field
- A new page that is an exact structural copy of an existing page
- A bug with a single-line, isolated fix
- Style or copy changes within an existing component

**When in doubt: apply it.** Skipping costs more than applying.

---

## Phase 0 — Interrogate the Requirement

> Defined in `senior-dev-mindset.md`. Summary:
> Before reasoning about *how* to implement, ask whether *this* is the right solution.

Apply the Three Questions from `senior-dev-mindset.md`:
1. What is the actual problem (stripped of the stated solution)?
2. What assumption is embedded in this request?
3. Is the implementation complexity proportional to the problem?

Check the Frontend Requirement Smells table in `senior-dev-mindset.md`.
If a smell matches, raise the concern before proceeding to Phase 1.

---

## Phase 1 — Read Before Building

Before writing any code, check in this order:

1. **DECISION_LOG.md** — what architectural decisions were made, why, and what would reverse them? If a new request conflicts with a logged decision, flag it before proceeding.
2. **LIBRARY_LEDGER.md** — what is installed? what versions? what was rejected?
3. **Existing components** — does a similar component already exist? `ls src/features/ | grep [feature-name]`
4. **Existing hooks** — does a similar hook exist? `ls src/hooks/` and `ls src/features/*/`
5. **lib/env.ts** — what env vars are configured? Does the feature need one that isn't there?

Only build something new after confirming it doesn't already exist. If it partially exists, extend rather than create a parallel pattern.

---

## Phase 2 — Frontend Constraint Inventory

**Bundle impact:**
- New package? → bundlephobia check (>20KB gzipped = ask)
- Named imports only? → barrel imports bloat the bundle
- Code-split at route level? → heavy features need `React.lazy`

**React Compiler compatibility:**
- Manual `useMemo`, `useCallback`, or `React.memo`? → Remove them. The compiler handles this.
- Mutating props or state in place? → Never. The compiler assumes immutability.

**Accessibility impact:**
- Changes focus management? → keyboard users must not get lost
- Hides/shows content? → `aria-hidden`, `aria-expanded` needed
- Triggers a dynamic change? → `aria-live` region needed

**Loading and state budget:**
- Multiple concurrent spinners? → worse UX than one coordinated skeleton
- Empty state, error state, and success state? → all three must be implemented
- Stale data while refreshing? → document the behaviour in a comment

**Browser compatibility:**
- CSS feature not widely supported? → check caniuse first
- Web API (Clipboard, Share, Notification)? → needs feature detection fallback for Safari
- CSS animation? → wrap with `prefers-reduced-motion`

---

## Phase 3 — Clear Winner Test

Is one approach clearly better given the known constraints?

**YES → build it**, state why in one sentence. Do not present options when there is a professional standard answer.

A genuine trade-off exists when:
- Two approaches have meaningfully different bundle impacts (>5KB delta)
- Two approaches require different global state shapes
- The right choice depends on whether the developer plans to extend this feature
- One approach requires a new library and the other doesn't

**Small team rule**: For 1–3 developers, prefer the approach with lower cognitive overhead — even if a more powerful pattern exists.

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

Max 2 options. Always give a recommendation. If accessibility is the deciding factor, the accessible option wins — this is not a trade-off to present.

---

## Phase 5 — Failure Scenario Inventory (before writing code)

For each question, name the specific component, hook, user action, and outcome for THIS feature — not generically.

**Connection failure** — What does the user see if every API call fails, is slow, or is interrupted? Walk through each network call. Any "spinner that never resolves" means the implementation needs a defence.

**Request race** — What if multiple in-flight requests complete in the wrong order, or a response arrives after the component unmounts? If an answer exists, add cancellation, debouncing, or an `isMounted` guard.

**Session boundary** — What if the user's session expires or permissions change mid-interaction? A form that takes 3 minutes can outlive a token. Name what happens when a 401 arrives.

**Empty and zero** — What does every data-dependent view look like when the API returns an empty array, zero count, or null? Any state identical to the loading state means a missing design requirement.

**Double action** — What if the user triggers the primary action twice before the first response? Name the specific duplicate outcome. If undefined behaviour → needs disabled state or idempotency guard.

**Browser environment** — Name each browser API call (localStorage, clipboard, share, intersection observer). For each, name the failure mode when unavailable.

**Accessibility path** — Walk through the feature using only a keyboard. Name every interactive element that cannot be reached. Name every dynamic state change not announced to a screen reader.

Each failure scenario identified is a test obligation.

---

## Phase 6 — Connect Failures to Tests

For each failure scenario from Phase 5, either:
- Name the MSW handler configuration and assertion that proves the defence holds, OR
- Explain architecturally why this scenario cannot occur

Apply `react-edge-case-testing` skill for the full thinking loop.

---

## Phase 7 — Update DECISION_LOG.md

If this task produced a new architectural decision (library chosen, pattern established, constraint surfaced), update `DECISION_LOG.md`.

Replace changed entries — do not append. If no architectural decision was made, skip.

---

## Anti-Patterns This Protocol Prevents

❌ Creating a new hook that duplicates an existing one → Phase 1 read catches it
❌ Adding a 30KB library for something native fetch does → Phase 2 bundle check catches it
❌ Writing useMemo in a component → Phase 2 Compiler check catches it
❌ Implementing a feature without empty/error/loading states → Phase 2 state budget catches it
❌ Building a complex pattern for a 1-developer project → Phase 3 small team rule catches it
❌ Accepting a requirement that solves the wrong problem → Phase 0 interrogation catches it
❌ Reversing an architectural decision without noticing conflict → Phase 1 DECISION_LOG.md read catches it
❌ Making an architectural choice with no record of why → Phase 7 update prevents it
