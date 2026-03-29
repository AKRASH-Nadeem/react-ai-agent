---
trigger: always_on
---

> LIBRARY LEDGER MANDATE: Every project has a `LIBRARY_LEDGER.md` at its root. The agent creates it on project init and updates it on every library add, upgrade, or removal. This file is the project's source of truth for what is installed, why, and what happened. It is committed to version control.

---

# Library Ledger Standards

---

## LL0. What This Is and Why

`versions.lock.md` (in `.agent/`) records the baseline versions for skill example code snippets — it is an agent-internal reference.

`LIBRARY_LEDGER.md` (in the project root) is different. It:
- Lives inside the actual project, committed with the codebase
- Tracks every library the agent has installed, with full context
- Records Context7 queries used so the exact same lookup can be repeated
- Documents why alternatives were rejected
- Captures any peer dep warnings or install issues encountered
- Serves as a handoff document — any developer joining the project can understand every dependency decision without asking

**The agent creates `LIBRARY_LEDGER.md` during project init (IP4 step 1) and treats every install event as a ledger write.**

---

## LL1. Creating the Ledger (new project)

During `install-protocol.md` IP4 step 1 (base scaffold), create the file before installing anything:

```bash
touch LIBRARY_LEDGER.md
```

Write the initial header:

```markdown
# Library Ledger

> Auto-maintained by the AI agent. Updated on every library add, upgrade, or removal.
> Do not edit manually — run changes through the agent so context is preserved.

## Stack profile
[Copy the approved stack profile from tech-stack.md TS3 here]

## Summary table

| Package | Version | Added | Feature | Status |
|---------|---------|-------|---------|--------|

## Full history

[Entries appended below as libraries are installed]
```

---

## LL2. Ledger Entry Format

Every library addition produces one entry. Write it immediately after the install succeeds — never batch entries.

```markdown
### [package-name]

| Field | Value |
|-------|-------|
| **Installed version** | [exact version from `npm list [package]`] |
| **Version range in package.json** | [e.g. `^5.62.0`] |
| **Date** | [YYYY-MM-DD] |
| **Feature / task** | [the feature or task that required this library] |
| **Why this library** | [1-2 sentences — what problem it solves] |
| **Alternatives considered** | [what was evaluated and why rejected] |
| **Context7 query used** | `[exact query string passed to Context7]` |
| **Install command** | `[exact command run]` |
| **Peer dependencies added** | [list any new peer deps, or "none"] |
| **Issues during install** | [any warnings, conflicts, or workarounds, or "none"] |
| **Status** | Active |
```

**Example entry:**

```markdown
### @tanstack/react-query

| Field | Value |
|-------|-------|
| **Installed version** | 5.62.0 |
| **Version range in package.json** | `^5.62.0` |
| **Date** | 2026-03-20 |
| **Feature / task** | Project setup — all server state management |
| **Why this library** | Purpose-built for server state: automatic caching, deduplication, stale-while-revalidate, background refetch. Eliminates all useEffect-for-fetching patterns. |
| **Alternatives considered** | SWR — less feature-rich, no mutations API. RTK Query — requires Redux, too heavy. |
| **Context7 query used** | `tanstack react-query v5 installation setup` |
| **Install command** | `npm install @tanstack/react-query@^5 @tanstack/react-query-devtools` |
| **Peer dependencies added** | none |
| **Issues during install** | none |
| **Status** | Active |
```

---

## LL3. Updating the Summary Table

After every entry, update the summary table at the top of the file:

```bash
# The summary table is updated by the agent — never manually
# Format:
# | Package | Version | Added | Feature | Status |
# | @tanstack/react-query | 5.62.0 | 2026-03-20 | Server state | Active |
```

The table is the quick-scan view. The full history section has the context.

---

## LL4. Upgrade Entries

When a library is upgraded (major or minor), add an upgrade entry below the original entry — do not overwrite it:

```markdown
### [package-name] — upgrade

| Field | Value |
|-------|-------|
| **Previous version** | [old version] |
| **New version** | [new version] |
| **Date** | [YYYY-MM-DD] |
| **Reason for upgrade** | [bug fix / security / feature needed / peer dep requirement] |
| **Breaking changes** | [list API changes that required code updates, or "none"] |
| **Context7 query used** | `[package] v[N] migration guide` |
| **Files changed** | [list files updated for the migration] |
| **Status** | Active |
```

Update the version in the summary table.

---

## LL5. Removal Entries

When a library is removed, do not delete the history entry. Mark it as removed and add context:

```markdown
### [package-name] — removed

| Field | Value |
|-------|-------|
| **Removed version** | [version that was removed] |
| **Date** | [YYYY-MM-DD] |
| **Reason** | [replaced by X / feature removed / no longer needed] |
| **Replaced by** | [new library or approach, or "nothing"] |
| **Files changed** | [list files updated] |
```

Update the summary table status to `Removed`.

---

## LL6. Context7 Integration

Context7 is called for two purposes in the library flow:

### LL6.1 Before installing — get the current install command

Never use training memory for install commands. Package names, CLI flags, and setup steps change between versions.

```
Context7 query pattern for installation:
  "[package-name] installation setup [framework]"

Examples:
  "tanstack react-query v5 installation setup vite"
  "tailwindcss v4 vite setup"
  "shadcn ui init vite typescript"
  "motion library react installation"
  "zustand v5 react setup"
```

Record the exact query string in the ledger entry (`Context7 query used` field). This means the same lookup can be repeated exactly if the install needs to be done again.

### LL6.2 Before writing code — get the current API

Even after installing, call Context7 before writing any code that uses the library.

```
Context7 query pattern for usage:
  "[package-name] [specific feature or API]"

Examples:
  "tanstack react-query v5 useQuery options"
  "zustand v5 create store typescript"
  "motion react animate presence exit animation"
  "zod object schema optional fields"
```

This is separate from the ledger — it happens every time you write code using the library, not just on install.

### LL6.3 For upgrades — get the migration guide

```
Context7 query pattern for migrations:
  "[package-name] v[N] to v[M] migration"
  "[package-name] v[N] breaking changes"

Examples:
  "tanstack react-query v4 to v5 migration"
  "motion framer-motion migration"
  "msw v1 to v2 migration"
```

Record the query in the upgrade ledger entry.

---

## LL7. When the Ledger Doesn't Exist Yet

If a user asks the agent to work on an existing project that has no `LIBRARY_LEDGER.md`:

1. State: *"This project doesn't have a LIBRARY_LEDGER.md yet. I'll create one now and backfill the current dependencies."*
2. Run `cat package.json` to read all current dependencies
3. Create the file with the header (LL1)
4. For each installed dependency, add a backfill entry:

```markdown
### [package-name] — backfilled

| Field | Value |
|-------|-------|
| **Installed version** | [from package.json] |
| **Date** | Unknown (pre-ledger) |
| **Feature / task** | Unknown (pre-ledger) |
| **Why this library** | [agent's best assessment based on what the library does] |
| **Status** | Active |
```

5. Going forward, all new installs use the full LL2 format.

---

## LL8. The Ledger and tech-stack.md

The ledger records what happened. `tech-stack.md` defines what should happen.

When a library is added via the TS5 protocol in `tech-stack.md`:
- TS2.1 checklist answers the question "should we install this?"
- TS5 defines the approval flow
- **LL2 records the result**

The ledger entry is written after approval is received (step 4 of TS5), after the install succeeds, and after `tsc --noEmit` passes.

---

## Summary

| Event | Ledger action |
|---|---|
| New project init | Create `LIBRARY_LEDGER.md` with header before any installs |
| Library installed | Write full LL2 entry + update summary table |
| Library upgraded | Write upgrade entry + update summary table version |
| Library removed | Write removal entry + update summary table status |
| Existing project, no ledger | Backfill from `package.json` using LL7 format |
| Install command needed | Context7 query first — record exact query in ledger |
| Writing code for a library | Context7 query for current API — every time, not just on install |
