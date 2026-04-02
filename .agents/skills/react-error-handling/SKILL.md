---
name: react-error-handling
description: |
  Use when an error needs to be diagnosed, traced, or fixed in a React TypeScript project.
  Trigger on: "error", "bug", "broken", "not working", "fix this", "TypeError", "cannot read",
  "undefined is not", "is not a function", "module not found", "cannot find module",
  "type error", "runtime error", "build error", "failed to compile", "unexpected token",
  "property does not exist", "version mismatch", "after upgrade", "after update",
  "something changed", "stopped working", "red underline", "lint error", "ESLint",
  "TypeScript error", "TS2345", "TS2339", "TS2304", "console error", "Sentry alert",
  "white screen", "blank page", "crash", "infinite loop", "memory leak",
  "network error", "401", "403", "404", "500", "CORS".
---

# Error Handling Standards

> **Version-agnostic skill.** No packages are imported. This skill applies to any React TypeScript project  
> regardless of package versions. Cross-reference `versions.lock.md` when diagnosing version-drift errors.

## ERR0. The Diagnostic Protocol — Always Follow This Order

Never guess. Never jump to a fix before tracing. **Never skip a step — even if the fix looks obvious.** Run this sequence every time, for every error, no exceptions:

```
1. CLASSIFY  — What category of error is this?
2. LOCATE    — Where exactly did it originate?
3. TRACE     — Why did it reach here? What called what?
4. ASSESS    — What is the blast radius of the fix? ← MANDATORY. See ERR4.
5. ACT       — Fix (minor) or propose + confirm (major)
```

### ⚠️ ERR4 Is Non-Skippable

Step 4 (blast radius assessment) must be completed before writing a single line of fix code, regardless of how simple the bug appears. A fix that "looks like a one-liner" regularly touches shared types, exported functions, or auth utilities in disguise.

**The blast radius checkpoint — ask all four before touching anything:**

```
□ Does this fix modify a shared type, interface, or discriminated union?
□ Does this change an exported function's signature (params, return type)?
□ Does this touch authentication, session management, or security utilities?
□ Does this affect more than one file?
```

If the answer to **any** of these is yes → **red path: stop and show the proposal template before touching code** (see ERR4).

If the answer to **all** is no → green path: apply and explain briefly.

Skipping this check is never acceptable, even when:
- The user says "just a quick fix"
- The fix appears to be a single null check or type annotation
- You have seen this exact error pattern before
- The component is small or isolated-looking

The sections below map to each step.

---

## ERR1. Classify — Error Categories

Identify the category before doing anything else. Each has a different trace path.

| Category | Examples | Where to look first |
|----------|----------|---------------------|
| **TypeScript compile error** | `TS2345`, `TS2339`, `Property X does not exist` | The exact file + line in the TS error output |
| **Runtime crash** | `TypeError: X is not a function`, `Cannot read properties of undefined` | Browser console stack trace → topmost frame in your code |
| **Build error** | `Module not found`, `Failed to parse`, Vite/Rollup errors | Terminal output — full error message, not just the last line |
| **Network / API error** | `401`, `403`, `404`, `500`, CORS, `ERR_NETWORK` | Browser DevTools → Network tab → the failing request |
| **Version drift** | Errors that appeared after `npm install`, `npm update`, or a dependency bump | `package.json` diff / git blame on `package-lock.json` |
| **Logic / state bug** | Wrong data displayed, stale state, infinite re-render | React DevTools → component tree → state values |
| **Accessibility / test failure** | axe violations, failing RTL assertions | Test output — the exact assertion that failed and why |
| **Environment / config** | Missing env var, wrong base URL, wrong build mode | `lib/env.ts` Zod output, `.env` files, Vite mode |

---

## ERR2. Locate — Finding the Origin

### TypeScript errors
Read the error exactly as TypeScript reports it. Do not skip lines.

```
src/features/auth/LoginForm.tsx:34:18 - error TS2345:
Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
```

The origin is **line 34, column 18 of LoginForm.tsx**. That is where the fix goes — not at the call site unless the call site is wrong.

### Runtime crashes
The browser console stack trace lists frames newest-first. Scan down until you hit a file in `src/` — that is the origin frame in your code. The frames above it are React internals — ignore them.

```
TypeError: Cannot read properties of undefined (reading 'name')
  at UserCard (UserCard.tsx:12:24)       ← origin — your code
  at renderWithHooks (react-dom.js:...)  ← React internals — ignore
```

### Build errors
Vite and TypeScript often report the consequence, not the cause. Read the **first** error in the output, not the last. Subsequent errors are usually cascades from the first.

### Version drift errors
Check if the error appeared after a dependency change:
```bash
git log --oneline package-lock.json   # when did lock file last change?
git diff HEAD~1 package.json          # what changed?
```
Then cross-reference with `versions.lock.md` to identify which packages moved.

---

## ERR3. Trace — Following the Call Chain

Once the origin file and line are identified, trace backwards:

1. **What data reached this line?** Add a `logger.debug()` call immediately before the error line to inspect the value.
   > `logger` is set up in `react-performance` skill (PERF6). Never use `console.log` in committed code — not in components, not in hooks, not in utilities, not in config files.
2. **Where did that data come from?** Follow the prop chain or import chain one level up.
3. **Is this a type narrowing problem?** Check if the value could be `undefined` or `null` and whether the code guards for it.
4. **Is this a timing problem?** Check if the component is rendering before async data has resolved.
5. **Is this a contract violation?** Check if the shape of data from the API matches what the component expects — validate with Zod.

### Useful trace commands
```bash
# Find all usages of a symbol across the project
grep -r "functionName" src/ --include="*.ts" --include="*.tsx"

# Check TypeScript errors across the whole project
npx tsc --noEmit

# Check if a specific package version is installed
cat package.json | grep "package-name"
npm list package-name
```

---

## ERR4. Assess — Blast Radius Classification

**This step is mandatory. It runs before any fix code is written. No exceptions.**

Complete the following four-question checklist. A single "yes" answer routes to the red path.

### Mandatory Blast Radius Checklist

```
□ 1. Shared type / interface / discriminated union — does this fix modify one that
      is used outside the current file?

□ 2. Exported function signature — does a parameter get added, removed, or
      renamed? Does the return type change?

□ 3. Security surface — does this touch authentication, session management,
      token handling, permission checks, or open-redirect guards?

□ 4. File count — does this change require edits to more than one file?
```

If **all four answers are NO** → 🟢 Minor fix (green path).  
If **any answer is YES** → 🔴 Major fix (red path). Do not write code. Show the proposal template first.

---

### 🟢 Minor Fix — Apply Immediately

All four checklist items must be NO:
- The change is contained to **one file**
- No shared types, interfaces, or exported functions are modified
- No auth/security surface touched
- No other component imports the affected code

**Action:** Fix directly. Briefly explain what was wrong and what was changed.

---

### 🟡 Moderate Fix — Apply With Explanation

Any of these is true, but ERR4 checklist items 1, 2, 3 are still NO:
- The change touches **2–4 files**
- A shared utility or hook is modified but its **signature stays the same**
- A type definition is corrected (but not renamed or structurally changed)
- Tests need minor updates to reflect the correct behavior

**Action:** Apply the fix, then clearly state:
- What files were changed and why
- Whether any tests were updated
- Whether any other code was affected

---

### 🔴 Major Fix — Stop and Ask the User First

**Triggered by any YES on the ERR4 checklist. Triggered unconditionally when:**
- ERR4 checklist item 1, 2, or 3 is YES — regardless of file count
- A **package needs to be upgraded** to fix the issue (major version bump)
- The fix requires changes to **5+ files**
- You are **not confident** the fix is correct and want to validate before touching production code

**What to show the user — this exact format:**

```
⚠️ This fix requires a major change.

PROBLEM:
[One sentence: what is broken and why]

ROOT CAUSE:
[What actually caused this — package version, wrong type, missing guard, etc.]

PROPOSED FIX:
[What needs to change and in which files]

FILES AFFECTED:
- src/types/user.ts       — [what changes and why]
- src/features/auth/...   — [what changes and why]
- src/features/admin/...  — [what changes and why]
- N test files            — [what changes and why]

BLAST RADIUS CHECKLIST RESULT:
- Shared type modified:       YES / NO
- Exported signature changed: YES / NO
- Security surface touched:   YES / NO
- Files affected:             [count]

RISKS:
[What could break if this is done wrong, or what to test afterward]

REQUIREMENTS:
[Anything needed before the fix can be applied: backend change, migration, env var, etc.]

Do you want me to proceed?
```

**Do not write a single line of fix code until the user confirms.** If the user says "yes, go ahead", proceed. If the user says "just fix it" without engaging with the checklist result, explain briefly why the checklist matters and ask once more.

---

## ERR5. Common Error Patterns and Their Fixes

### "Cannot read properties of undefined"
**Cause:** A value is `undefined` at render time — usually async data not yet loaded, or a prop that was assumed to always be present.
**Trace:** What is the variable? Where does it come from? Is there a loading state?
**Blast radius check:** Optional chain or null guard → likely green (1 file, no signature change). Type contract fix → run checklist.
**Fix (minor):** Add optional chaining (`user?.name`) or a null guard. Ensure loading state renders a skeleton, not the component.
**Fix (major — ask first):** If the type definition says the value is never undefined but it is, the type contract is wrong. Fixing it means updating the type and every place that depends on it.

---

### "X is not a function"
**Cause:** Usually one of: (a) the import path changed in a package upgrade, (b) a named export was renamed, (c) a default vs named export mismatch.
**Trace:** Check the import statement. Check `versions.lock.md` for the package. Check if the package had a major version bump.
**Blast radius check:** If only the import changes in one file → green. If the function was removed and callers across multiple files need updating → red.
**Fix (minor):** Correct the import path or function name.
**Fix (major — ask first):** If the function was removed and there is no direct replacement, a significant rewrite is needed.

---

### TypeScript "Property X does not exist on type Y"
**Cause:** (a) A type was updated but usage wasn't, (b) package types changed after upgrade, (c) wrong type narrowing.
**Trace:** Where is type `Y` defined? Has it changed recently? Check git blame.
**Blast radius check:** Adding a new property to a local type → likely green. Changing a shared exported type → red.
**Fix (minor):** Add the missing property to the type, or narrow correctly with a type guard.
**Fix (major — ask first):** If the property was intentionally removed from the type and the component relied on it, the component's data contract needs to change.

---

### "Module not found: Can't resolve 'X'"
**Cause:** (a) Package was renamed (e.g., `framer-motion` → `motion`), (b) package not installed, (c) wrong path alias, (d) file was deleted or moved.
**Trace:** Check if the package exists in `node_modules/`. Check `versions.lock.md` for known renames.
**Blast radius check:** Single import path fix → green. Package rename with API change affecting many files → red.
**Fix (minor):** Correct the import path or run `npm install`.
**Fix (major — ask first):** If it's a package rename with a changed API, update imports across the project and verify the new API.

---

### Network / API errors (401, 403, 404, 500, CORS)
**Trace path:**
1. Open DevTools → Network → find the failing request
2. Check the request URL — is the base URL correct? (`lib/env.ts` → `VITE_API_BASE_URL`)
3. Check request headers — is the Authorization header present and correct?
4. Check the response body — does the server say why it failed?

| Status | Most common cause | Where to look |
|--------|------------------|---------------|
| `401` | Token missing, expired, or invalid | `lib/api.ts` interceptors, `features/auth/session.ts` |
| `403` | User lacks the required role | Server RBAC config, `ProtectedRoute` role check |
| `404` | Wrong URL, resource deleted | Request URL in Network tab vs actual API route |
| `500` | Server-side bug | Response body for error message; escalate to backend |
| CORS | Wrong origin, missing header | Server CORS config — a frontend fix will not solve this |

---

### Version drift errors (appeared after `npm install` / upgrade)
**Trace path:**
1. `git diff HEAD~1 package.json` — what changed?
2. Compare changed packages against `versions.lock.md`
3. Check the `@versions` comment in the affected skill example file
4. Search: `[package-name] v[N] breaking changes` or `[package-name] v[N] migration guide`

**Fix (minor):** Import path or renamed function — update the import.
**Fix (major — ask first):** API was restructured, types changed, or behavior changed across many files.

After resolving: update `versions.lock.md` with the new baseline version and date.

---

### Infinite re-render / "Maximum update depth exceeded"
**Cause:** A `useEffect` has a dependency that is a new object/array reference on every render, or state is being set unconditionally inside an effect.
**Trace:** React DevTools Profiler → find the component re-rendering repeatedly. Check its `useEffect` dependency arrays.
**Blast radius check:** Object moved outside component or dep changed to primitive → green (1 file). Shared hook causing cascades → red.
**Fix (minor):** Move the object/array literal **outside the component** (if it's static) or derive it from a primitive value. Do **not** wrap in `useMemo`/`useCallback` — the React Compiler manages memoization per `core.md §1`. If the dep must be derived inside the component, restructure so the effect depends on a primitive (e.g., an ID string) instead of the full object.
**Fix (major — ask first):** If the root cause is in a shared hook used by many components, changes will cascade.

---

### Stale closure in `useEffect`
**Cause:** An effect captures a value at mount time but the value changes later without the effect re-running (missing or incorrect dependency array).
**Trace:** The effect runs but uses outdated state/prop values. Often seen with callbacks or timers.
**Blast radius check:** Dep added to one effect in one file → green. Shared subscription hook → red.
**Fix (minor):** Add the stale value to the effect's dependency array. If intentionally skipping a dep, add a comment exactly explaining why per `core.md §5`.
**Fix (major — ask first):** If the effect is a complex subscription or timer used across many components, the fix should be extracted into a custom hook.

---

### White screen / blank page (no console error)
**Trace path:**
1. Open browser console — is there a React render error that was swallowed?
2. Check if an `ErrorBoundary` caught it silently without showing a fallback UI
3. Check if the root `<App />` is wrapped in a `<ErrorBoundary>` with a visible fallback
4. Check if an env var is missing and Zod threw during `lib/env.ts` validation
5. Check the Network tab — did the JS bundle fail to load?

---

## ERR6. After Every Fix

1. **Verify the fix** — run `npx tsc --noEmit` and the relevant test suite
2. **Check for cascades** — did fixing one thing break something else?
3. **Update the test** — if the fix changes behavior, the test must reflect the correct behavior
4. **If version drift caused this** — update `versions.lock.md` to the new baseline
5. **If a shared type changed** — grep the codebase for all usages and verify each one

```bash
# Final verification checklist
npx tsc --noEmit          # zero TypeScript errors
npx vitest run            # all tests pass
npx eslint src/           # zero lint errors
```

---

## Summary Cheatsheet — Error Handling

| Step | Action |
|------|--------|
| 1. Classify | What category? (TS / runtime / build / network / drift / logic) |
| 2. Locate | Read the exact error line — first error, not last |
| 3. Trace | Follow the call chain; use `logger.debug()` — never `console.log` |
| 4. Assess **(MANDATORY)** | Run the 4-question ERR4 checklist before touching ANY code |
| 4. Green path | All 4 NO → apply directly, explain briefly |
| 4. Red path | Any YES → show structured proposal, wait for user confirmation |
| 5. Minor fix | Apply directly, explain briefly |
| 5. Major fix | Proposal shown and confirmed first — no exceptions |
| After fix | `tsc --noEmit` + tests + lint + update `versions.lock.md` if needed |

### ERR4 Blast Radius Quick Reference

```
□ Shared type / interface changed?      → YES = RED
□ Exported function signature changed?  → YES = RED
□ Auth / security surface touched?      → YES = RED
□ More than one file?                   → YES = RED (unless all others NO → yellow)
All NO                                  → GREEN
```