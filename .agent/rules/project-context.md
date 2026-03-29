---
trigger: always_on
---

> PROJECT CONTEXT MANDATE: At the start of every session, establish what is being built, what is approved, and what the current state is. Build one feature at a time. Never move to the next feature until the current one passes all validation gates.

---

# Project Context & Incremental Implementation Standards

---

## PC0. Why This Rule Exists

AI agents have no persistent memory between sessions. Without explicit context management:
- The agent forgets what was approved in the previous session
- It reintroduces libraries the user already rejected
- It builds feature N+1 on top of unverified feature N
- The codebase drifts into inconsistency

This rule prevents all of that. It is the operating protocol for every multi-session, multi-feature project.

---

## PC1. Session Start Protocol

At the start of any coding session, state the project context before doing anything else.

### If context was established in a previous session:

```
## Session context — [Project name]

Stack: [approved stack from tech-stack.md TS1]
Last verified state: [what was working at end of last session]
Current feature: [what we are building now]
Pending features: [what comes after]

Starting from: [file / component / route we are working on]
```

If the user does not provide context at session start, ask:

> *"Before we begin — can you confirm the current state? What was the last working feature, and what are we building today?"*

### If this is a new project:

Run the TS1 stack proposal protocol from `tech-stack.md` first. Do not write any code until the stack is approved and the first feature is defined.

---

## PC2. Feature Definition

Before implementing any feature, define it precisely. A feature is too vague to implement if it cannot be described in one sentence with a clear completion condition.

```
Feature: [name]
Description: [one sentence — what it does, from the user's perspective]
Scope:
  - [specific component / route / hook it involves]
  - [API endpoint(s) it calls, if any]
  - [state it reads or writes]
Out of scope for this feature:
  - [things that are tempting but belong in a later feature]
Done when:
  - [verifiable condition 1]
  - [verifiable condition 2]
  - [TypeScript compiles with zero errors]
  - [no console errors or warnings in the browser]
```

If the user's request is ambiguous, clarify before proceeding:

> *"Before I build [feature], I want to confirm scope. Should [ambiguous thing] be included, or is that a separate feature?"*

---

## PC3. Incremental Implementation Protocol

### The core rule

**One feature. Fully complete. Verified. Then the next.**

Never implement features in parallel. Never skip the verification gate. Never start feature N+1 if feature N has unresolved TypeScript errors, missing states (loading/error/empty), or untested interactions.

### Implementation sequence (per feature)

```
1. Define the feature using PC2 structure — confirm with user
2. Identify all files that need to change — list them before touching any
3. Implement in dependency order:
     types.ts → utils.ts → hooks → components → routes → tests
4. After each file: run tsc --noEmit — zero errors required before continuing
5. After all files: run the full import verification from core.md §0
6. Present to user: "Feature [X] is complete. Here's what was built: [summary]"
7. Wait for validation confirmation before starting the next feature
```

### Dependency order rule

Never implement a component before the hook it depends on. Never implement a hook before the type it consumes. The build order is always: data shapes → data access → UI.

```
❌ Wrong order:
   Component (needs hook) → Hook (needs type) → Type

✅ Correct order:
   Type → Hook → Component
```

### The 3+ feature rule

When a task has 3 or more features:

1. List the full implementation sequence in dependency order — get user confirmation on the order before writing any code
2. Implement feature 1 completely through all validation gates
3. Present feature 1 to the user: *"Feature 1 complete and verified. Starting feature 2: [description]. Confirm?"*
4. Only proceed after confirmation
5. Repeat for each feature

---

## PC4. Validation Gates

A feature is not complete until all gates pass. Never mark a feature done with outstanding gates.

### Gate 1 — TypeScript
```bash
npx tsc --noEmit
# Required: zero errors
```

### Gate 2 — Import resolution
```bash
# Every @/components/ui/ import must resolve to a real file
grep -rh "from '@/components/ui/" src/ \
  | grep -oP "(?<=ui/)[^'\"]+" \
  | sort -u \
  | while read comp; do
      [ ! -f "src/components/ui/${comp}.tsx" ] && echo "MISSING: ${comp}.tsx"
    done
# Required: zero MISSING lines
```

### Gate 3 — All states implemented
For every new UI component, verify:
- [ ] Loading state (skeleton or spinner per `ux-interaction` UX3.2)
- [ ] Error state (with recovery action)
- [ ] Empty state (distinct from error — see `ux-interaction` UX4)
- [ ] Success / populated state

### Gate 4 — Accessibility baseline
- [ ] All interactive elements are keyboard-focusable
- [ ] No `<div onClick>` — semantic HTML only
- [ ] All images have `alt` text or `alt=""`
- [ ] Color is not the only status indicator

### Gate 5 — No console noise
- [ ] Zero `console.error` or `console.warn` in the browser
- [ ] No React key warnings
- [ ] No unhandled promise rejections

### Gate 6 — Build passes
```bash
npm run build
# Required: zero errors, zero type errors
```

If any gate fails: fix it before proceeding. Never present an unfinished feature as complete.

---

## PC5. Scope Creep Prevention

During implementation, if you discover that a clean implementation of feature N requires also building what would logically be feature N+1:

1. **Do not silently expand scope.** State: *"To implement [feature N] cleanly, I would also need [feature N+1 thing]. Should I include it now, or stub it and come back?"*
2. If the user says include it: update the feature definition (PC2) and the pending feature list.
3. If the user says stub it: implement a clean interface that can be filled in later — no inline TODOs without a ticket reference.

---

## PC6. Context Refresh After Long Sessions

After 10+ back-and-forth exchanges on a complex feature, proactively re-state the context:

> *"Quick context check: we are building [feature], we have completed [X, Y, Z], and the remaining work is [A, B]. Still correct?"*

This prevents drift where the agent starts solving a slightly different problem than the one originally defined.

---

## PC7. Definition of Done

A project feature is done when — and only when:

| Criterion | How to verify |
|---|---|
| All acceptance criteria from PC2 are met | Review PC2 "Done when" list |
| TypeScript compiles cleanly | `npx tsc --noEmit` — zero errors |
| All UI states implemented | Gate 3 checklist |
| Accessibility baseline met | Gate 4 checklist |
| No console noise | Gate 5 checklist |
| Production build passes | `npm run build` — zero errors |
| User has confirmed it works | Explicit user sign-off |

"It looks right" is not done. "It compiles" is not done. Done is all seven criteria, verified.

---

## Summary

| Situation | Action |
|---|---|
| Session start | State current context — stack, last verified state, current feature |
| New feature request | Define with PC2 structure, confirm scope, then implement |
| 3+ features | List sequence → confirm order → one at a time with gates |
| Gate fails | Fix before proceeding — never move on with broken gates |
| Scope expands | State it explicitly, get approval, update the feature list |
| Feature feels done | Run all 6 gates — if all pass, present to user for sign-off |
