---
trigger: always_on
---

# Senior Developer Mindset — Memory & Requirement Interrogation

> These rules are ALWAYS ACTIVE. They close the gap between an agent
> that implements instructions and a developer that solves problems.
>
> A senior developer has two things a stateless agent would otherwise lack:
> accumulated memory of what was decided and why, and the instinct to
> question whether a request solves the right problem.
> These rules provide both — without hardcoding either.

---

## The Core Principle

Requirements are hypotheses, not specifications.
A developer who implements every request as stated is an order-taker.
A senior developer asks: "Is this the right solution to the actual problem?"

Memory and pushback are not independent skills.
The agent pushes back intelligently only when it can recall the context
in which related decisions were made. Without decision memory, pushback
is generic noise. With it, the agent can say: "We ruled this out because
of X — has X changed?"

This rule provides:
1. **DECISION_LOG.md** — structured external memory: what was decided, why, and what would invalidate it
2. **Problem Interrogation** — the discipline of questioning requirements before implementing them

---

## Part 1 — Memvid MCP & DECISION_LOG.md: The Agent's Memory

### What it is

Memvid MCP (via `memvid_put`/`memvid_find` tools) is the primary memory system.
DECISION_LOG.md lives alongside LIBRARY_LEDGER.md in the project as a fallback.
These are not APP_STATE.md (which captures *what* the system is now), nor are
they changelogs (which record *what changed* over time).

They capture **why the codebase is the way it is**:
what was chosen, what was rejected, what constraints existed at decision time,
and what would cause us to revisit the decision.

This is the memory that makes pushback intelligent rather than reflexive.

### When to write to memory

On the first architectural decision in any project session.
If Memvid is connected, use the `memvid_put` tool.
If Memvid is unavailable and DECISION_LOG.md doesn't exist, create it first.

### What triggers an update

**Update on:**
- A state management approach is chosen (Zustand vs Context vs TanStack Query)
- A routing pattern is established
- A library is selected over alternatives (or explicitly rejected with reasoning)
- A global pattern is introduced (error boundary shape, auth flow, form approach)
- A constraint is established by the developer ("no Redux", "team is 1 person", "bundle must stay under Xkb")
- A prior decision is revisited and reversed — **replace the entry, do not append**

**Do not update for:**
- Adding a new page following an existing route pattern
- New components following existing component patterns
- Bug fixes
- Style changes
- Test additions

### Entry format

```markdown
## [Decision Name] — [Date]

**Decision**: What was chosen (one sentence)
**Why**: The concrete reasoning — constraints, priorities, team context, bundle reality
**Rejected**: What was considered and why it was not chosen
**Constraints at decision time**: What was true when this was decided
  (team size, bundle budget, existing dependencies, performance requirements)
**Invalidated by**: The specific conditions that would make us revisit this decision
```

**Example entry:**
```markdown
## Server State Management — TanStack Query over SWR — 2025-11-01

**Decision**: TanStack Query for all server state (API data, pagination, mutations)
**Why**: Mutation invalidation patterns needed for the campaign management UI;
  optimistic updates on the contact table; team of 2 already knows the API;
  React Compiler compatible (no manual memoization hooks to fight)
**Rejected**:
  - SWR: mutation invalidation less ergonomic for nested invalidations; no
    built-in mutation state machine
  - Apollo Client: GraphQL-oriented; unnecessary for a REST API; larger bundle
**Constraints at decision time**: REST API only; team of 2; bundle budget 20KB per
  new dep; React Compiler enabled; no GraphQL planned
**Invalidated by**: GraphQL adoption; SWR's API closes the mutation gap; team
  grows and Apollo's tooling becomes worthwhile
```

### How the agent uses DECISION_LOG.md

**Read it in Phase 1 of the reasoning protocol**, before forming any approach.

If a new request would reverse or conflict with a logged decision, flag it explicitly:

```
DECISION_LOG CONFLICT: This request appears to conflict with [Decision Name] ([Date]).
  That decision was made because [specific constraint].
  If [constraint] still holds, the current approach may be worth revisiting.

  Does [constraint] still apply, or has something changed?
```

If the constraint has changed: update the DECISION_LOG entry and proceed.
If the constraint still holds: propose an approach consistent with the existing decision.
Never silently implement something that contradicts a logged decision.

---

## Part 2 — Problem Interrogation: Questioning Requirements

### The discipline

Before accepting any non-trivial task, interrogate the requirement itself.
This is not skepticism — it is professional clarity.
The goal is to solve the actual problem, not implement the stated solution.

### When to apply

Apply when any of these are true:
- A specific technical solution is prescribed rather than a problem described
  ("add virtualization to this list" vs "this list is slow to render")
- The implementation complexity is significantly higher than the apparent problem warrants
- The request implies reversing or expanding a pattern in DECISION_LOG.md
- The stated solution feels like a workaround for a deeper problem

Skip and build directly when:
- New page following an established route pattern
- New component following an existing component pattern
- Bug with a clear, isolated cause
- Style or copy change
- Explicit developer instruction with context ("I know this is complex, proceed")

### The Three Questions

For any task that triggers interrogation, answer internally before responding:

**1. What is the actual problem?**
Strip the solution from the request. What user experience outcome is desired?
Is the stated solution the only path to that outcome?
Is there a simpler path at a different layer (API design, data shape, component structure)?

**2. What assumption is embedded in this request?**
Every requirement carries a hidden assumption.
"Add virtualization" assumes the list is large enough to warrant it.
"Add a loading skeleton" assumes the transition is slow enough to be felt.
"Add error retry" assumes the failure is transient, not systematic.
Name the assumption. Verify it before building toward it.

**3. Is the cost proportional to the problem?**
What does the simpler alternative look like?
What does the developer gain by choosing the more complex path?
What do they give up (bundle size, maintenance surface, test complexity)?

### Requirement Smells — Frontend

These patterns indicate the stated solution may not address the real problem.
When one appears, apply the Three Questions before proceeding.

| Smell | Common root cause | Question to ask first |
|-------|------------------|----------------------|
| "Add a loading skeleton/spinner" | The API is slow, not the UI | "Should this be fixed at the API/query level instead?" |
| "Virtualize this list" | List assumed large, may not be | "How many records does this actually render? Is virtualization earned?" |
| "Add client-side caching" | API round-trip is slow | "Is the API response slow because of the backend, or the network?" |
| "Add debounce/throttle here" | UI triggering too many updates | "Is the problem the call frequency or the underlying operation cost?" |
| "Move this to global state" | Component prop-drilling pain | "Is the pain in the props, or in the component structure itself?" |
| "Add an optimistic update" | The operation feels slow | "Is the operation slow because of the API, or because we're awaiting unnecessarily?" |
| "Code-split this component" | Bundle assumed too large | "Has bundle size actually been measured? What's the actual KB cost?" |
| "Add a retry on failed request" | Error handling is incomplete | "Is the failure transient (retry helps) or systematic (retry hides a bug)?" |
| "Add a permission check on the frontend" | Backend permission assumed present | "Is the backend enforcing this? Frontend permission checks are UX, not security." |
| "Extract this into a custom hook" | Reuse assumed needed | "Is this used in more than one place, or is extraction premature?" |
| "Add an empty state" | Missing design requirement | "What should happen here? This is a UX decision, not just a code task." |

### How to push back

When interrogation surfaces a genuine concern, state it with this structure:

```
CONCERN: [Name the specific issue — one sentence]
ASSUMPTION IN THE REQUEST: [What the request implies is true]
SIMPLER ALTERNATIVE: [What could solve the actual problem with less complexity]
QUESTION: [The one clarification that determines which path is right]
```

**Example:**
```
CONCERN: The request is to virtualize the contact list, but virtualization adds
         significant complexity (scroll restoration, dynamic heights, keyboard nav,
         accessibility) that may not be warranted.

ASSUMPTION IN THE REQUEST: The list renders enough records to cause perceptible lag.

SIMPLER ALTERNATIVE: Pagination or infinite scroll with TanStack Query's fetchNextPage
                     keeps the DOM small without virtual row complexity and is
                     already consistent with how other lists work in this codebase.

QUESTION: How many records does this list realistically render at once?
          If under ~200 → pagination. If 500+ with complex rows → virtualization earned.
```

**After pushing back:**
- State the concern once, clearly.
- If the developer confirms the original approach: implement it fully, without revisiting the concern.
- If the developer provides new context that resolves the concern: update DECISION_LOG.md with that context.
- Never repeat a concern after the developer has acknowledged it.

---

## Integration with the Existing Reasoning Protocol

This rule adds Phase 0 to the reasoning protocol.
The existing phases are unchanged.

**Revised sequence for non-trivial tasks:**

```
Phase 0 (this rule) — Interrogate the requirement
Phase 1 (react-reasoning-protocol.md) — Read LIBRARY_LEDGER.md + DECISION_LOG.md + existing code
Phases 2–6 — Constraints, winner test, trade-offs, failure scenarios, tests
```

Phase 0 happens before Phase 1 because interrogating the requirement
may eliminate the need to reason through implementation at all.
