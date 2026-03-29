---
trigger: always_on
---

# React Engineering Philosophy — Configuration & Environment Discipline

> These rules are ALWAYS ACTIVE. They govern how the agent handles
> environment variables, build configuration, and the living app manifest.

---

## Reasoning & Invalidation Log

```
DECISION 1: lib/env.ts as mandatory pattern, not optional example
  Initial: lib.env.ts exists in react-rest-advanced examples — good enough
  Invalidated: An example buried in one skill is invisible to the agent on
               other tasks. Without a rule mandating it, the agent writes
               import.meta.env.VITE_API_URL directly in components — silent
               failures in production when the var is missing or mistyped.
  Solution: Rule mandating lib/env.ts Zod-validated wrapper as the only
            way to access environment variables.

DECISION 2: .env.example discipline
  Initial: Developers handle .env.example manually
  Invalidated: Agent adds VITE_ vars without updating .env.example — the
               next developer cloning the repo gets a silent breakage on
               startup. env.ts throws immediately (good), but .env.example
               is missing the entry (bad — no hint what to set).
  Solution: Every new VITE_ var requires a .env.example entry with a
            comment explaining what it is and what format it expects.

DECISION 3: LIBRARY_LEDGER.md env section vs separate ENV_MANIFEST.md
  Initial: Create a separate ENV_MANIFEST.md like APP_STATE.md in Django
  Invalidated: Another file = another maintenance surface. The project
               already has LIBRARY_LEDGER.md for package context. Env vars
               added alongside library installs belong in the same document.
               Env vars added for feature work belong with the feature.
  Solution: Add a mandatory "Environment Variables" section inside
            LIBRARY_LEDGER.md. No new file needed.

DECISION 4: Environment matrix (dev/staging/prod)
  Initial: Not needed — Vite handles this with mode files
  Invalidated: Vite handles .env.development/.env.production file loading,
               but it doesn't document WHAT DIFFERS between environments.
               The agent silently hardcodes staging URLs, uses the same
               Sentry DSN in dev and prod, or forgets that certain features
               are disabled in production.
  Solution: Rule requiring an explicit environment matrix awareness check
            before any feature that behaves differently per environment.
```

---

## Rule 1 — lib/env.ts Is the Only Way to Access Env Vars

Never use `import.meta.env.VITE_*` directly in components, hooks, or
utilities. Always import from `lib/env.ts`.

**Why**: Direct access silently returns `undefined` if the var is missing.
The Zod schema in `lib/env.ts` throws immediately at app startup with a
clear error naming the missing variable — the right failure mode.

**When creating a new project or first encounter of missing lib/env.ts:**
Create it before writing any code that needs an env var.

```typescript
// src/lib/env.ts  — the canonical pattern
import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url("Must be a full URL"),
  // Add vars below as the project grows
  // VITE_SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
export type Env = z.infer<typeof envSchema>;
```

**Adding a new env var checklist:**
1. Add to `envSchema` in `lib/env.ts`
2. Add to `.env.example` with placeholder + comment
3. Add to LIBRARY_LEDGER.md environment variables section
4. Add to the environment matrix (Rule 3) if it differs per env

---

## Rule 2 — .env.example Is a First-Class Artifact

`.env.example` is committed to git. It is not optional documentation.
It is the only way another developer (or another agent session) knows
what to configure.

**Format:**
```bash
# Required — the backend API base URL (no trailing slash)
VITE_API_BASE_URL=https://api.example.com

# Required — public app URL (used for OAuth redirects)
VITE_APP_URL=https://app.example.com

# Optional — Sentry DSN (leave empty to disable error tracking)
# VITE_SENTRY_DSN=

# Optional — Feature flag: enable experimental dashboard
# VITE_FEATURE_NEW_DASHBOARD=true
```

Rules for `.env.example` entries:
- Required vars: uncommented with realistic placeholder
- Optional vars: commented out — the absence means "disabled"
- Every entry has a one-line comment explaining what it is
- Never real credentials — use `your-value-here` style placeholders
- Agent must update `.env.example` before marking any feature complete
  that adds a new VITE_ variable

---

## Rule 3 — Environment Matrix Awareness

Before implementing any feature that might behave differently across
development, staging, and production, answer these:

```
Does this feature need a different URL per environment?
→ VITE_API_BASE_URL pattern. Never hardcode URLs.

Does this feature need to be disabled in certain environments?
→ VITE_FEATURE_[NAME]=true pattern. Check in lib/env.ts as optional bool.

Does this produce noise (logging, dev overlays) that should not appear in prod?
→ Guard with: if (import.meta.env.DEV) — Vite's built-in, no VITE_ needed.

Does this send data to a third-party service (analytics, error tracking)?
→ Separate VITE_ vars per environment. Never send prod errors to dev Sentry.
```

**Common environment differences to always check:**
- API base URL (dev local, staging API, prod API)
- Error tracking DSN (often disabled in dev, separate project in staging/prod)
- Feature flags (experimental features enabled in dev/staging, off in prod)
- Auth redirect URLs (localhost vs real domain)

---

## Rule 4 — LIBRARY_LEDGER.md Environment Variables Section

Every project's `LIBRARY_LEDGER.md` has an "Environment Variables" section.
The agent creates it at project init and updates it when any VITE_ var is added.

```markdown
## Environment Variables

| Variable | Required | Dev value | Prod value | Purpose |
|----------|----------|-----------|------------|---------|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000` | `https://api.example.com` | Backend API |
| `VITE_APP_URL` | Yes | `http://localhost:5173` | `https://app.example.com` | OAuth redirects |
| `VITE_SENTRY_DSN` | No | _(empty)_ | `https://...@sentry.io/...` | Error tracking |
```

This table is the single place where anyone can see every env var the
project needs, what it's for, and what it looks like per environment.

---

## Rule 5 — No Silent Assumptions About Environment

If the agent doesn't know whether a var exists, it checks `lib/env.ts`
and `.env.example` before writing code that uses it.

If a feature requires a new external service (new API, new third-party),
the agent states this before implementing:

> "This feature requires `VITE_[SERVICE]_URL`. I'll add it to
> `lib/env.ts`, `.env.example`, and `LIBRARY_LEDGER.md`.
> What URL should I use as the example placeholder?"

Never silently hardcode any URL, domain, or service endpoint.
