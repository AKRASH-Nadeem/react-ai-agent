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

This rule prevents all of that.

---

## PC1. Session Start Protocol

State project context before doing anything else.

### If context was established previously:
```
## Session context — [Project name]
Stack: [approved stack from tech-stack.md TS1]
Architecture: [Feature-Based | Type-Based]
Last verified state: [what was working at end of last session]
Current feature: [what we are building now]
Pending features: [what comes after]
Starting from: [file / component / route]
```

If the user does not provide context: *"Before we begin — can you confirm the current state? What was the last working feature, and what are we building today?"*

### If new project: run TS1 stack proposal first. No code until stack is approved.

---

## PC2. Feature Definition

A feature is too vague to implement if it can't be described in one sentence with a clear completion condition.

```
Feature: [name]
Description: [one sentence — what it does, from the user's perspective]
Scope: [components, routes, hooks, API endpoints involved]
Out of scope: [tempting things that belong in a later feature]
Done when:
  - [verifiable condition 1]
  - [TypeScript compiles with zero errors]
  - [no console errors in the browser]
```

---

## PC3. Incremental Implementation Protocol

**One feature. Fully complete. Verified. Then the next.**

Implementation sequence per feature:
```
1. Define with PC2 — confirm with user
2. List all files that need to change before touching any
3. Implement in dependency order: types → utils → hooks → components → routes → tests
4. After each file: run tsc --noEmit — zero errors before continuing
5. After all files: run import verification from core.md
6. Present: "Feature [X] complete. Here's what was built: [summary]"
7. Wait for validation confirmation before starting next feature
```

**Dependency order:** data shapes → data access → UI. Never a component before its hook. Never a hook before its type.

**3+ features:** List full sequence → get confirmation on order → implement one at a time with gates.

---

## PC4. Validation Gates

A feature is **not complete** until ALL applicable gates pass.

### Gate 1 — TypeScript
```bash
npx tsc --noEmit   # zero errors required
```

### Gate 2 — Import resolution
```bash
grep -rh "from '@/components/ui/" src/ \
  | grep -oP "(?<=ui/)[^'\"']+" | sort -u \
  | while read comp; do
      [ ! -f "src/components/ui/${comp}.tsx" ] && echo "MISSING: ${comp}.tsx"
    done
# Required: zero MISSING lines
```

### Gate 3 — All states implemented
- [ ] Loading state (skeleton or spinner per `ux-interaction` UX3.2)
- [ ] Error state (with recovery action)
- [ ] Empty state (distinct from error — see `ux-interaction` UX4)
- [ ] Success / populated state

### Gate 4 — Accessibility baseline
- [ ] All interactive elements keyboard-focusable
- [ ] No `<div onClick>` — semantic HTML only
- [ ] All images have `alt` text or `alt=""`
- [ ] Color is not the only status indicator

### Gate 5 — No console noise
- [ ] Zero `console.error` / `console.warn` in browser
- [ ] No React key warnings. No unhandled promise rejections.

### Gate 6 — Build passes
```bash
npm run build   # zero errors required
```

### Gate 7 — Lighthouse CI (when configured)
```bash
npx lhci autorun   # all thresholds must pass
# LCP < 2.5s | INP < 200ms | CLS < 0.1
```
If Lighthouse CI is not configured yet: record the missing gate in DECISION_LOG.md as a follow-up action.

### Gate 8 — Visual regression (when Storybook is installed)
- [ ] New component has a co-located `.stories.tsx` file with all required variants
- [ ] Chromatic run passes (or visual diff is accepted by user)

If any gate fails: fix before proceeding. Never present an unfinished feature as complete.

---

## PC5. Scope Creep Prevention

If implementing feature N cleanly requires feature N+1:

1. **Do not silently expand scope.** State: *"To implement [N] cleanly, I also need [N+1 thing]. Include now or stub?"*
2. If include: update PC2 definition and pending feature list.
3. If stub: clean interface, no inline TODOs without a ticket reference.

---

## PC6. Context Refresh After Long Sessions

After 10+ exchanges on a complex feature, proactively re-state:

> *"Quick context check: building [feature], completed [X, Y, Z], remaining [A, B]. Still correct?"*

---

## PC7. Definition of Done

| Criterion | How to verify |
|---|---|
| All acceptance criteria from PC2 met | Review "Done when" list |
| TypeScript compiles cleanly | `npx tsc --noEmit` |
| All UI states implemented | Gate 3 checklist |
| Accessibility baseline met | Gate 4 checklist |
| No console noise | Gate 5 checklist |
| Production build passes | `npm run build` |
| Lighthouse CI passes (if configured) | Gate 7 |
| Visual regression passes (if Storybook) | Gate 8 |
| User has confirmed it works | Explicit sign-off |

---

## PC8. Session Handoff & Context Window Protocol

### 8.1 — Context utilisation checkpoint

When a session exceeds **30 tool calls** OR when approaching a long pause, proactively write state to files:

1. Ensure Hindsight `retain` has been called for every architectural decision made this session (or `DECISION_LOG.md` has an entry if Hindsight is unavailable).
2. Update `AGENTS.md` if any banned patterns or conventions were added.
3. State: *"Context checkpoint written. Continuing."*

### 8.2 — 85% context window rule

If you detect (via response quality degradation, difficulty recalling earlier decisions, or explicit context warning) that the context window is approaching capacity:

**STOP immediately and do all of the following before any more code:**

1. Write a handoff document at the project root: `HANDOFF.md`

```markdown
# Session Handoff — [date]

## Status
[In progress | Blocked | Complete — be specific]

## Files Changed This Session
- [file path] — [what changed and why]

## Decisions Made
- [decision] — [rationale] — see DECISION_LOG.md [entry name]

## Blocked On
- [blocker] — [what is needed to unblock]

## Next Steps (in order)
1. [specific next action]
2. [specific next action]

## Danger Zones
- [anything partially implemented that could break if touched wrong]
```

2. Run `tsc --noEmit` — if it fails, note the errors in HANDOFF.md.
3. Tell the user: *"Context window is near capacity. I've written a handoff document at HANDOFF.md. Starting a new session with that document will restore full context. Should I continue or start fresh?"*

### 8.3 — Multi-session resume

At the start of any session on a project with a `HANDOFF.md`:
1. Read `HANDOFF.md` fully before reading any other file.
2. State the status from the handoff before asking what to do next.
3. Delete `HANDOFF.md` after the user confirms the context is correct.

---

## Summary

| Situation | Action |
|---|---|
| Session start | State context — stack, architecture, last verified state, current feature |
| New feature | PC2 define → confirm → implement → all gates |
| 3+ features | List sequence → confirm order → one at a time with gates |
| Gate fails | Fix before proceeding |
| Scope expands | State explicitly, get approval, update feature list |
| 30+ tool calls | Write decisions to files (PC8.1) |
| Context at capacity | Write HANDOFF.md, stop, inform user (PC8.2) |
| Session resumes | Read HANDOFF.md first (PC8.3) |
