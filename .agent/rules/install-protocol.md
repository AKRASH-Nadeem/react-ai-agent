---
trigger: model_decision
description: Load when installing/upgrading packages, skill activates with non-empty requires:, "module not found" errors, package.json changed, peer dependency warnings, or new project scaffolding. Skip for bug fixes, refactors, styling, code reviews.
---

# install-protocol.md

> NOTE: The "search before installing" rule is enforced by Context7 MCP (core.md §21). Call Context7 for current install commands — never use training memory for setup steps.

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
| Not installed | 🔍 Search via Context7 → install |

### Step 3 — Install missing packages via Context7

Never copy install commands from a skill's prose or from memory. Search Context7 for current setup steps. Use version ranges from `versions.lock.md`.

```bash
# Confirm install succeeded before writing any code
npm list [package-name]
```

### Step 4 — Only write code after confirming the package is installed

If a package fails to install: **stop and report the exact error to the user**. Never write code that imports an unconfirmed package.

### Step 5 — Verify imports resolve after writing code

After writing any file that imports from `@/components/ui/` or a third-party package:

```bash
# Check every @/components/ui import resolves to a real file
grep -rh "from '@/components/ui/" src/ \
  | grep -oP "(?<=ui/)[^'\"]*" \
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

3. **Search the migration guide via Context7:** `[package] v[N] migration guide`

4. **Assess the blast radius** — activate **react-error-handling** skill ERR4:
   - Straightforward (few usages, no breaking changes in used APIs) → upgrade and note what changed
   - Affects many files → stop and present the proposal to the user before touching anything

5. **Alternatively, adapt the skill's examples** to the installed version. Always state which version the adapted code targets.

---

## IP4. Project Setup Order

When initialising a new project, install and configure in this exact order. Each step must complete and verify before the next begins.

```
1. Base scaffold     Search Context7: "vite react typescript setup" → follow docs
2. TypeScript        Confirm tsconfig.json exists, "strict": true is set
3. Tailwind          Search Context7: "tailwindcss v4 vite installation" → follow docs exactly
4. shadcn            npx shadcn@latest init (never write components.json by hand)
5. Core runtime      TanStack Query, React Router, Zod — search each via Context7 before installing
6. Feature libs      Install only what activated skills require
7. Dev tooling       ESLint, Prettier, Husky (optional)
8. Verify            npm run build — must succeed with zero errors before any feature work
```

**Never skip step 8.** A green build after scaffolding is the non-negotiable baseline. Fix any build errors before starting feature work.

---

## IP5. When to Re-Run the Pre-Check

Run IP2 again whenever:
- A new skill is activated mid-project
- `package.json` is pulled from git with new or updated dependencies
- A peer dependency warning appears during any `npm install`
- A "module not found" or "cannot resolve" error appears

---

## Packages Where Setup Changed Significantly Between Major Versions

| Package | What changed |
|---------|-------------|
| `tailwindcss` v3 → v4 | No `tailwind.config.ts`. Config in CSS. `@tailwind` directives replaced by `@import "tailwindcss"`. |
| `msw` v1 → v2 | `rest.*` replaced by `http.*`. `ctx.*` helpers replaced by `HttpResponse`. Worker init changed. |
| `framer-motion` → `motion` | Package renamed. Import from `motion/react` not `framer-motion`. |
| `@sentry/react` v7 → v8 | Init API changed. `BrowserTracing` import path moved. |
| `@tanstack/react-query` v4 → v5 | `cacheTime` → `gcTime`. `onSuccess/onError` removed from `useQuery`. |
| `shadcn/ui` | CLI-driven — always `npx shadcn@latest init`. Never hand-write `components.json`. |