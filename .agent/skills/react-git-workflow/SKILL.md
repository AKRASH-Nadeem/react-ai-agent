---
name: react-git-workflow
description: |
  Use when the user is managing git, making commits, working with branches, setting up
  a repository, or configuring CI. Trigger on: "commit", "git commit", "push",
  "pull request", "PR", "merge", "branch", "git workflow", "branching strategy",
  "conventional commits", "semantic versioning", "Husky", "lint-staged", "commitlint",
  "git hooks", ".gitignore", "semver", "changelog", "release".
  Also activate automatically whenever the react-project-init skill activates —
  every new project needs git workflow from the start.
---

# Git Workflow Standards

> The agent safety rules in core Section 19 are always active. This skill adds the full workflow standards on top of them.

## GIT1. Branching — Trunk-Based Development

Default for all projects: trunk-based with short-lived feature branches. Use GitFlow only if explicitly requested.

```
main                          # Production. Always deployable. Protected.
├── feat/user-authentication  # Feature branch — merged and deleted when done
├── fix/login-redirect-loop
├── chore/update-dependencies
└── docs/update-readme
```

### Default branch is always `main` — never `master`

**New project — set before the first commit:**
```bash
git init
git checkout -b main
```

Or configure git globally so every new repo defaults to `main`:
```bash
git config --global init.defaultBranch main
```

**Existing project still on `master` — rename it:**
```bash
# Rename locally
git branch -m master main

# If already pushed to a remote (GitHub/GitLab):
git push origin main
git push origin --delete master

# Update the remote's default branch in the UI (GitHub: Settings → Branches → Default branch)
# Then update any local clones:
git fetch origin
git branch --set-upstream-to=origin/main main
```

**When to rename vs leave:**
- Project not yet started or no features committed → rename unconditionally
- Existing project with CI/CD pointing at `master` → rename but update pipeline refs first
- Shared repo you do not own → ask the team before renaming

**Branch naming:** `[type]/[short-description-in-kebab-case]`

| Type | When |
|------|------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `chore/` | Deps, config, refactor with no behavior change |
| `docs/` | Documentation only |
| `test/` | Adding or fixing tests |
| `perf/` | Performance improvement |
| `hotfix/` | Emergency production fix |

Rules: lowercase kebab-case only. Never branch off another feature branch. Delete branches immediately after merge.

---

## GIT2. Commit Messages — Conventional Commits

Format: `<type>(<scope>): <short summary>`

```
feat(auth): add Google OAuth login
fix(checkout): correct tax calculation for EU users
chore(deps): upgrade TanStack Query to v5
test(user-profile): add missing error state tests
```

**Types:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `revert`

Summary line rules:
- Imperative mood — "add" not "added" or "adds"
- Lowercase, no period at end
- Max 72 characters
- Must complete: "If applied, this commit will → [your summary]"

Breaking changes: add `!` after type, or `BREAKING CHANGE:` footer.

```
feat(api)!: change authentication endpoint to /v2/auth

BREAKING CHANGE: /v1/auth is no longer supported
```

---

## GIT3. Atomic Commits

One logical change per commit. Never bundle unrelated changes together.

```
# ✅ Atomic — one concern per commit
git add src/features/auth/LoginForm.tsx
git commit -m "feat(auth): add email validation to login form"

git add src/features/auth/LoginForm.test.tsx
git commit -m "test(auth): add tests for login form email validation"

# ❌ Mixed — unrelated changes in one commit
git add .
git commit -m "feat: login form + fix header padding + update deps"
```

When reviewing code, ask: "Can this commit be reverted cleanly without affecting other behavior?" If no, split it.

---

## GIT4. `.gitignore` Template

Use `examples/gitignore.template` in the **react-project-init** skill as the base. Always create `.gitignore` before the first `git add`. Critical rules:

- Never commit `.env` — commit `.env.example` instead
- Never commit `node_modules/`, `dist/`, `.next/`
- Never commit editor files (`.idea/`, `.vscode/` except shared settings)
- Never commit OS files (`.DS_Store`, `Thumbs.db`)

---

## GIT5. Husky + lint-staged + commitlint

Set up before the first real commit. See `examples/` in this skill for config files.

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

**`.husky/pre-commit`** (lint and type-check staged files):
```bash
#!/usr/bin/env sh
npx lint-staged
```

> ⚠️ **Husky v9 note:** Do NOT add `. "$(dirname "$0")/_/husky.sh"` — that is the old v8 sourcing line and is deprecated in v9. Husky v9 no longer needs or uses it.

**`.husky/commit-msg`** (enforce Conventional Commits):
```bash
#!/usr/bin/env sh
npx --no -- commitlint --edit "$1"
```

**`package.json` lint-staged config:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,json,md,css}": ["prettier --write"]
  }
}
```

See `examples/commitlint.config.cjs` in this skill for the commitlint configuration.

---

## GIT6. Feature Lifecycle — Branch to Main

A feature does not stay on its branch. Once work is complete it must be merged to
`main` and the branch deleted. The exact flow depends on whether a remote exists.

### Which flow applies?

```bash
git remote -v
```

| Output | Flow |
|--------|------|
| Empty — no remotes listed | **Local-only flow** (see below) |
| Shows `origin` URL | **Remote flow** (see below) |

---

### Local-Only Flow (no remote)

Use this when working solo with no GitHub/GitLab remote yet.
Merge happens locally — no PR, no push.

**Step 1 — Finish and verify on the feature branch**

```bash
# You are on feat/your-feature
git add src/features/your-feature/    # stage deliberately — never git add .
git commit -m "feat(your-feature): describe what this adds"

npm run build && npx tsc --noEmit && npx vitest run   # all must pass
```

**Step 2 — Merge into main locally**

```bash
git checkout main
git merge --squash feat/your-feature
git commit -m "feat(your-feature): describe what this adds"
```

`--squash` collapses all the branch's commits into one clean commit on `main`,
the same result as "Squash and Merge" on GitHub. Do not use plain `git merge`
(creates a merge commit) or `git merge --ff-only` (fails if histories diverged).

**Step 3 — Delete the branch**

```bash
git branch -d feat/your-feature
```

**Step 4 — Verify**

```bash
git log main --oneline -5
```

Your squashed commit should be at the top.

**When you add a remote later:**

```bash
git remote add origin [url]
git push -u origin main
```

All your local history goes up cleanly — no extra steps needed.

---

### Remote Flow (origin exists)

### Step 1 — Finish and verify on the feature branch

```bash
# You are on feat/your-feature
git add src/features/your-feature/    # stage deliberately — never git add .
git commit -m "feat(your-feature): describe what this adds"
```

Verify before pushing:
```bash
npm run build        # must pass
npx tsc --noEmit     # must pass
npx vitest run       # must pass
```

### Step 2 — Sync with main before opening a PR

Always rebase on the latest `main` before pushing. This keeps history linear and
avoids a merge commit caused by drift.

```bash
git fetch origin
git rebase origin/main
```

If there are conflicts, resolve them file by file, then:
```bash
git add [resolved-files]
git rebase --continue
```

### Step 3 — Push the branch and open a PR

```bash
git push origin feat/your-feature
```

Then open a Pull Request on GitHub/GitLab. PR requirements:
- Title follows Conventional Commits: `feat(auth): add Google OAuth login`
- Description references the issue: `Closes #123`
- Description explains *why*, not just *what* — the diff already shows what
- At least one reviewer requested before merging
- All CI checks must be green before merge

See `examples/pr-description-template.md` in this skill for the standard template.

### Step 4 — Merge strategy

Use **Squash and Merge** for feature branches — collapses all work-in-progress
commits into one clean commit on `main`:

```
main ← "feat(auth): add Google OAuth login (#42)"
```

Use **Rebase and Merge** only when every commit on the branch is already atomic
and meaningful on its own (rare — usually only for `chore/` or `docs/` branches).

Never use a plain **Merge commit** — it creates noise in `main`'s history.

### Step 5 — Delete the branch after merge

```bash
# Delete remote branch (GitHub does this automatically if configured)
git push origin --delete feat/your-feature

# Delete local branch
git checkout main
git pull origin main
git branch -d feat/your-feature
```

`git branch -d` (lowercase) is safe — it refuses to delete an unmerged branch.
Never use `git branch -D` (uppercase) unless you are intentionally discarding work.

### Step 6 — Verify main is updated

```bash
git log origin/main --oneline -5
```

Your squashed commit should appear at the top. `main` is now ahead of where the
feature branch started.

---

### Emergency: Hotfix to main

If a critical bug is in production and cannot wait for a full PR cycle:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/describe-the-bug

# Fix the bug — single atomic commit
git commit -m "fix(auth): correct token expiry calculation"

# Same verification steps as above, then:
git push origin hotfix/describe-the-bug
# Open PR → merge immediately after review (expedited, still requires one reviewer)
```

Never commit directly to `main` — even for hotfixes. core.md Section 19 applies always.

---

## GIT7. Semantic Versioning

Tag releases using semver: `MAJOR.MINOR.PATCH`

- `PATCH` — bug fixes, no API changes: `1.0.1`
- `MINOR` — new features, backward compatible: `1.1.0`
- `MAJOR` — breaking changes: `2.0.0`

```bash
git tag -a v1.2.0 -m "release: v1.2.0"
git push origin v1.2.0
```

Use `BREAKING CHANGE:` footer in commits to signal a major version bump when using automated changelog tools.

---

## Summary Cheatsheet — Git Workflow

| Concern | Standard |
|---------|----------|
| Default branch | `main` — never `master`. Set via `git checkout -b main` or `git config --global init.defaultBranch main` |
| Branching model | Trunk-based, short-lived feature branches |
| Branch naming | `feat/`, `fix/`, `chore/`, `docs/` + kebab-case |
| Commit format | Conventional Commits — type(scope): summary |
| Commit granularity | Atomic — one logical change per commit |
| Pre-commit hook | Husky + lint-staged (ESLint + Prettier) |
| Commit message hook | commitlint enforcing Conventional Commits |
| Feature lifecycle | branch → commit → rebase on main → PR → review → squash merge → delete branch |
| Merge strategy | Squash and Merge for features, Rebase and Merge for clean chore/docs branches |
| PR title | Must follow Conventional Commits format |
| PR size | Small and focused — one feature/fix per PR |
| Release tagging | Semantic versioning via `git tag` |
| `.gitignore` | Created before first `git add` — never commit `.env` |