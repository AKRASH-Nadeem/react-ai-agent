---
trigger: model_decision
description: Load when installing/upgrading packages, skill activates with non-empty requires:, "module not found" errors, package.json changed, peer dependency warnings, or new project scaffolding. Skip for bug fixes, refactors, styling, code reviews.
---

> **Two sources of truth for libraries:**
> - `versions.lock.md` (in `.agent/`) — baseline versions for skill example code. Agent-internal only.
> - `LIBRARY_LEDGER.md` (in the project root) — every library the agent has installed, why, and what happened. Lives in the codebase, committed to git.
>
> **Context7 is the source of truth for install commands and API usage. Never use training memory.**

---

# Install Protocol

---

## IP1. Context7 — Always First

Before writing any install command or library code, call Context7.

**Why:** Package names, CLI flags, and setup steps change between versions. Training memory may reflect a version that is 6–18 months old. Context7 gives the current docs.

**Exempt from Context7:** React core hooks (useState, useEffect, useRef, useContext, etc.) — these are stable. Only external packages require Context7.

### Query patterns

```
Installation:  "[package] [framework] installation"
               "tailwindcss v4 vite setup"
               "tanstack react-query v5 installation"
               "shadcn ui vite typescript init"

API usage:     "[package] [specific feature]"
               "tanstack react-query v5 useQuery"
               "zustand v5 create store typescript"
               "motion react animate on scroll"

Migration:     "[package] v[N] to v[M] migration"
               "[package] v[N] breaking changes"
```

Record the exact query string — it goes into `LIBRARY_LEDGER.md`.

---

## IP2. Skill Activation Pre-Check

Every skill declares required packages in a `requires:` block in its YAML frontmatter. When a skill with a non-empty `requires:` activates, run this sequence before writing any code:

### Step 1 — Check what is installed
```bash
npm list [package-name]
# or
cat package.json | grep "[package-name]"
```

### Step 2 — Compare against skill's `requires:` list

| Installed state | Action |
|-----------------|--------|
| Installed at matching major | ✅ Proceed |
| Installed at higher minor/patch | ✅ Proceed — semver compatible |
| Installed at different major | ⚠️ Version mismatch — see IP3 |
| Not installed | Call Context7 → install → write ledger entry |

### Step 2.5 — Auto Context7 query on version mismatch

If Step 2 finds **installed major ≠ skill baseline major**, run this
immediately — before any code is written:

```
1. Get exact installed version:
   npm list [package-name] --depth=0

2. Form the Context7 query:
   "[package-name] v[INSTALLED_MAJOR] [the feature being implemented]"

   Examples:
     project has msw@1.x, skill expects msw@2:
     → "msw v1 request handlers rest.get"

     project has @tanstack/react-query@4.x, skill expects v5:
     → "tanstack react-query v4 useQuery options"

     project has zustand@4.x, skill expects v5:
     → "zustand v4 create store typescript"

3. Call Context7 with that exact query string.

4. Replace skill example API calls with Context7 output.

5. When writing code, state: "Adapting to v[X] via Context7 (skill baseline: v[Y])"
```

No user prompt needed to trigger this — it is automatic whenever
installed major ≠ skill `requires:` major.

### Step 2.75 — Pre-install validation (CLI)

Before running `npm install`, run these checks directly:

```bash
# Check bundle size impact
npm view [package-name] dist.unpackedSize

# Check maintenance health (last publish date)
npm view [package-name] time.modified

# Check for known vulnerabilities
npm audit --json
```

**Block install if:** critical vulnerability found OR bundle size > 50KB gzipped for a utility library. Report to user with alternatives.

### Step 3 — Install missing packages via Context7

```
1. Call Context7: "[package] [framework] installation"
2. Follow the docs exactly — never copy from skill prose or memory
3. Use version ranges from `versions.lock.md` as a floor
4. Run the install command
5. Verify: npm list [package-name]
6. Write the ledger entry (see below)
```

```bash
# Confirm install succeeded before writing any code
npm list [package-name]
```

### Step 4 — Write the ledger entry

After every successful install, update `LIBRARY_LEDGER.md` using the LL2 format from `library-ledger.md`:

```markdown
### [package-name]

| Field | Value |
|-------|-------|
| **Installed version** | [exact version from npm list] |
| **Version range in package.json** | [e.g. ^5.62.0] |
| **Date** | [YYYY-MM-DD] |
| **Feature / task** | [current feature being built] |
| **Why this library** | [1-2 sentences] |
| **Alternatives considered** | [what was evaluated, or "none for this install"] |
| **Context7 query used** | `[exact query string]` |
| **Install command** | `[exact command]` |
| **Peer dependencies added** | [list or "none"] |
| **Issues during install** | [warnings, conflicts, workarounds, or "none"] |
| **Status** | Active |
```

Then update the summary table at the top of `LIBRARY_LEDGER.md`.

### Step 5 — Only write code after confirming the package is installed

If a package fails to install: **stop and report the exact error to the user**. Never write code that imports an unconfirmed package.

### Step 6 — Verify imports resolve after writing code

```bash
# Check every @/components/ui import resolves to a real file
grep -rh "from '@/components/ui/" src/ \
  | grep -oP "(?<=ui/)[^'\"]+" \
  | sort -u \
  | while read comp; do
      [ ! -f "src/components/ui/${comp}.tsx" ] && echo "MISSING: ${comp}.tsx"
    done

# Type-check the whole project
npx tsc --noEmit
```

Zero `MISSING` lines and zero `tsc` errors = imports are valid. Any failure stops the task.

---

## IP3. Version Mismatch

If a project has a package at a different major than the skill's `requires:`:

1. **State the mismatch clearly:**
   > "This skill requires `msw@^2` but the project has `msw@^1` installed."

2. **Do not assume the skill's examples are compatible.** The API may have changed significantly.

3. **Search the migration guide via Context7:** `[package] v[N] to v[M] migration`

4. **Assess the blast radius** — activate **react-error-handling** skill ERR4:
   - Straightforward (few usages, no breaking changes in used APIs) → upgrade and note what changed
   - Affects many files → stop and present the proposal to the user before touching anything

5. **Write an upgrade ledger entry** after the migration completes — see `library-ledger.md` LL4.

---

## IP4. Project Setup Order

When initialising a new project, install and configure in this exact order. Each step must complete and verify before the next begins.

```
0. Create LIBRARY_LEDGER.md   Create the file before any installs — see library-ledger.md LL1
1. Base scaffold              Context7: "vite react typescript setup" → follow docs
2. TypeScript                 Confirm tsconfig.json exists, "strict": true is set
3. Tailwind                   Context7: "tailwindcss v4 vite installation" → follow docs exactly
4. shadcn                     npx shadcn@latest init (never write components.json by hand)
5. Core runtime               TanStack Query, React Router, Zod — Context7 each before installing
6. Feature libs               Install only what activated skills require — Context7 each
7. Dev tooling                ESLint, Prettier, Vitest — Context7 each
8. Storybook (opt-in only)    ASK USER → if yes, see IP4.1. If no/silent → skip entirely.
9. Verify                     npm run build — must succeed with zero errors before any feature work
```

Write a ledger entry for every install in steps 1–8. The ledger exists before the first `npm install` runs.

**Never skip step 9.** A green build after scaffolding is the non-negotiable baseline. Fix any build errors before starting feature work.

---

### IP4.1 — Storybook Setup (Step 8 — opt-in only)

**New project — always ask first. Never install without explicit consent:**
> "Would you like me to set up Storybook for component-driven development? It enables isolated component development, visual testing, and the Storybook MCP for AI-assisted component discovery. Dev dependency only — zero production impact. Requires Storybook v8.3+."

- If user says **yes** → proceed with install below
- If user says **no** or **skip** → skip entirely, do not mention again
- If user doesn't respond → **do not install**. Never assume consent.

**Existing project — silent detection:**
```bash
cat package.json | grep -q "@storybook" && echo "FOUND" || echo "NOT_FOUND"
```
- If `FOUND` → Storybook is available. Use Storybook MCP tools when `npm run storybook` is running.
- If `NOT_FOUND` → fall back to file-system introspection. **Do not suggest installing Storybook** unless the user specifically asks about component development tooling.

**Install commands (when user has approved):**
```bash
# Initialize Storybook (auto-detects React + Vite)
npx storybook@latest init

# Install the MCP addon for AI agent integration (requires Storybook v8.3+)
npx storybook add @storybook/addon-mcp
```

**Port configuration:**
Storybook runs on port `6006` by default. The MCP endpoint is at `http://localhost:6006/mcp`.
Verify the scripts exist in `package.json`:
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

**Post-install verification:**
```bash
# Verify Storybook starts without errors (Storybook 8 syntax)
npx storybook dev --smoke-test
```

> ⚠️ Note: The `--smoke-test` flag was introduced in Storybook 8. If the project uses Storybook 7, use `npm run storybook -- --ci` instead.

**Ledger entry required:** Log Storybook and `@storybook/addon-mcp` as dev-only packages using LL2 format with `Status: Dev dependency`.

---

## IP5. When to Re-Run the Pre-Check

Run IP2 again whenever:
- A new skill is activated mid-project
- `package.json` is pulled from git with new or updated dependencies
- A peer dependency warning appears during any `npm install`
- A "module not found" or "cannot resolve" error appears

---

## IP6. Packages Where Setup Changed Significantly Between Major Versions

When working with these, always fetch the migration guide via Context7 — do not rely on training memory:

| Package | What changed |
|---------|-------------|
| `tailwindcss` v3 → v4 | No `tailwind.config.ts`. Config in CSS. `@tailwind` directives replaced by `@import "tailwindcss"`. `tw-animate-css` replaces `tailwindcss-animate`. |
| `msw` v1 → v2 | `rest.*` replaced by `http.*`. `ctx.*` helpers replaced by `HttpResponse`. Worker init changed. |
| `framer-motion` → `motion` | Package renamed. Import from `motion/react` not `framer-motion`. |
| `@sentry/react` v7 → v8 | Init API changed. `BrowserTracing` import path moved. |
| `@tanstack/react-query` v4 → v5 | `cacheTime` → `gcTime`. `onSuccess/onError` removed from `useQuery`. |
| `shadcn/ui` | CLI-driven — always `npx shadcn@latest init`. Never hand-write `components.json`. |

For all of these: `Context7 query: "[package] v[installed] migration"` before touching any code.
