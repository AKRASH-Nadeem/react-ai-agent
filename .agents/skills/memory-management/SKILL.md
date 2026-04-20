---
name: memory-management
trigger: always_on
description: |
  LOAD AUTOMATICALLY for: memvid, memory, remember, recall, forget, store decision,
  save context, past decisions, what did we decide, architectural decision, convention,
  api contract, cross-agent, shared memory, frontend memory, memory file, mv2,
  memvid_find, memvid_put, memvid_create, session start, session end, bootstrap memory,
  persistent memory, DECISION_LOG, memory conflict, stale memory, memory hygiene,
  memory not found, memory unavailable, memvid offline, cli fallback, memvid cli,
  what to store, should I store this, store in shared or frontend, memory strategy,
  knowledge graph, entity, enrich, memvid broken, memvid error.
  Load when making or recalling any persistent decision, or when working with memory files.
---

# Memory Management — Persistent Agent Memory

> **MANDATE**: Memvid is the agent's external brain. It is not optional. A stateless agent
> repeats mistakes, reintroduces rejected libraries, and loses the user's context on every
> session. Memory prevents all of that. Speed is not an excuse to skip it — local `.mv2`
> files respond in under 5ms. If MCP tools fail, fall back to CLI. If CLI fails, fall back
> to `DECISION_LOG.md`. Never skip memory entirely.

---

## ARCHITECTURE — 2-File Frontend Topology

```
frontend.mv2  → THIS agent's private memory — decisions, conventions, patterns
shared.mv2    → Cross-agent contracts readable by BOTH frontend AND backend agents
```

> `backend.mv2` is managed by the backend agent only. Never write to it.

---

## DECISION TREE — WHERE TO STORE

```
Is the information relevant to BOTH frontend and backend agents?
  YES → shared.mv2
  NO  → frontend.mv2

Examples that go to shared.mv2:
  - API endpoint paths and schemas      (backend writes, frontend reads)
  - Auth token flow (JWT, cookie, etc.) (both agents must agree)
  - Error envelope format               (both produce/consume)
  - WebSocket event names and payloads  (both sides define)
  - VITE_API_URL or base URL            (frontend needs, backend provides)
  - Environment variable names          (cross-agent contract)
  - Rate limit headers and handling     (both must handle)

Examples that go to frontend.mv2:
  - State management library choice     (Zustand, Redux, Jotai)
  - Component folder architecture       (feature-based vs type-based)
  - Design token strategy               (OKLCH, shadcn tokens)
  - Form validation approach            (RHF + Zod, Formik)
  - Routing approach                    (React Router v7, TanStack Router)
  - Developer constraints               ("no Redux", "bundle < 200KB")
  - UI/UX pattern decisions             (infinite scroll vs pagination)
  - Testing strategy                    (Vitest + RTL + MSW)
  - Animation library choice            (Motion, GSAP)
  - Error boundary strategy             (Sentry, local fallback)
```

---

## WHAT TO STORE vs WHAT NOT TO STORE

### ✅ ALWAYS STORE — architectural decision points

| Trigger | File | Tag |
|---------|------|-----|
| State management library chosen | `frontend.mv2` | `[type:architectural-decision]` |
| Component folder architecture confirmed | `frontend.mv2` | `[type:convention]` |
| Design token strategy established | `frontend.mv2` | `[type:convention]` |
| Form library or validation approach chosen | `frontend.mv2` | `[type:architectural-decision]` |
| Routing library/strategy decided | `frontend.mv2` | `[type:architectural-decision]` |
| Animation library chosen | `frontend.mv2` | `[type:architectural-decision]` |
| Testing stack confirmed | `frontend.mv2` | `[type:architectural-decision]` |
| Developer constraint stated ("no Redux", "< 200KB") | `frontend.mv2` | `[type:constraint]` |
| User explicitly rejects a library or approach | `frontend.mv2` | `[type:constraint]` |
| API endpoint schema agreed with backend | `shared.mv2` | `[type:api-contract]` |
| Auth flow decided (JWT, session, OAuth) | `shared.mv2` | `[type:api-contract]` |
| Error response envelope format established | `shared.mv2` | `[type:api-contract]` |
| WebSocket event schema defined | `shared.mv2` | `[type:api-contract]` |
| Base API URL or environment variable established | `shared.mv2` | `[type:api-contract]` |
| Decision reversed or updated | update existing frame | never append contradiction |

### ❌ NEVER STORE — routine implementation

- Bug fixes following an already-stored pattern
- New components that follow established conventions
- Style or copy changes
- Test additions following established testing patterns
- Refactors that don't change the architectural approach
- Temporary debug logging or scaffolding
- Anything that doesn't change how FUTURE decisions should be made

**The test:** "Would knowing this change what I build next week?" If no → skip.

---

## MEMORY FORMAT — REQUIRED STRUCTURE

Every `memvid_put` call MUST use this format:

```
[agent:frontend] [type:TYPE] [feature:FEATURE] [date:YYYY-MM-DD]
Decision: One sentence — what was chosen.
Why: Core reasoning — what problem this solves.
Rejected: Alt1 (why rejected). Alt2 (why rejected).
Invalidated by: The condition that would make this wrong.
```

**Type values:**
- `architectural-decision` — Library/framework choice, pattern establishment
- `api-contract` — Endpoint schema, payload format, auth flow, error envelope
- `convention` — Naming, file structure, coding patterns the team has settled on
- `constraint` — Hard limit stated by developer or infrastructure
- `project-context` — Stack/infrastructure snapshot at session start

**Example — State management decision:**
```
memvid_put {
  "file": "frontend.mv2",
  "input": "[agent:frontend] [type:architectural-decision] [feature:state] [date:2026-04-20]\nDecision: Chose Zustand over Redux Toolkit for global state management.\nWhy: Team of 2, no middleware needed, React Compiler compatible, 4x less boilerplate.\nRejected: Redux Toolkit (middleware overkill), Jotai (unfamiliar to team), Context (re-render perf at scale).\nInvalidated by: Team grows past 5, DevTools time-travel debugging required.",
  "embed": true
}
```

**Example — API contract:**
```
memvid_put {
  "file": "shared.mv2",
  "input": "[agent:frontend] [type:api-contract] [feature:auth] [date:2026-04-20]\nContract: JWT access + refresh token flow.\nAccess token: 15min TTL, stored in memory (never localStorage).\nRefresh token: 7d TTL, httpOnly cookie.\nRefresh endpoint: POST /api/v1/auth/token/refresh/\nError format: { error: string, code: string, detail?: string }\nInvalidated by: Switch to session-based auth, OAuth provider change.",
  "embed": true
}
```

---

## SESSION LIFECYCLE — MANDATORY SEQUENCE

### Session Start (run in core.md Step 1.5)

```
# 1. Verify or create files
memvid_stats { "file": "shared.mv2" }    → error? → memvid_create { "file": "shared.mv2" }
memvid_stats { "file": "frontend.mv2" }  → error? → memvid_create { "file": "frontend.mv2" }

# 2. Start session tracking
memvid_session { "file": "frontend.mv2", "start": "fe-[YYYYMMDD-HH]" }

# 3. Recall relevant context (ALWAYS run both — task-scoped queries)
memvid_find { "file": "shared.mv2", "query": "api contracts auth error format base url", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "component conventions state design tokens constraints", "mode": "hybrid", "limit": 5 }

# 4. First-run only (both return empty)
memvid_put_many { "file": "frontend.mv2", "input": "DECISION_LOG.md", "embed": true }
```

### During Session — After Each Architectural Decision

```
memvid_put { "file": "[frontend.mv2 | shared.mv2]", "input": "[format above]", "embed": true }
memvid_enrich { "file": "frontend.mv2", "all": false }   # optional: extract entities
```

### Session End

```
memvid_ask { "file": "frontend.mv2", "question": "What architectural decisions were made in the most recent session?" }
memvid_session { "file": "frontend.mv2", "stop": true }
```

---

## CLI FALLBACK — When MCP Tools Are Unavailable

> **Use CLI when:** MCP server not responding, tool call fails twice, or MCP not configured.
> CLI commands map 1:1 to MCP tools. Always try MCP first (2 attempts), then drop to CLI.

### Detecting MCP failure
```
MCP returns error/timeout twice in a row → switch to CLI for this session.
State: "Memvid MCP unavailable — using CLI fallback for this session."
```

### CLI equivalents for core operations

**Create a memory file:**
```bash
memvid create --file frontend.mv2
memvid create --file shared.mv2
```

**Check file health:**
```bash
memvid stats --file frontend.mv2
memvid stats --file shared.mv2
```

**Store a memory:**
```bash
memvid put --file frontend.mv2 --embed --input \
  "[agent:frontend] [type:architectural-decision] [feature:state] [date:2026-04-20]
Decision: Chose Zustand for state management.
Why: Lightweight, React Compiler compatible.
Rejected: Redux (overkill).
Invalidated by: Middleware requirement."
```

**Recall memories (hybrid search):**
```bash
memvid find --file shared.mv2 --query "api contracts auth error format" --mode hybrid --limit 5
memvid find --file frontend.mv2 --query "state management decisions component patterns" --mode hybrid --limit 5
```

**Ask a question:**
```bash
memvid ask --file frontend.mv2 --question "What state management library did we choose and why?"
```

**Update an existing frame:**
```bash
memvid update --file frontend.mv2 --frame-id [ID] --input "SUPERSEDED: [original]\nSuperseded by: [new decision] on [date]."
```

**Start/stop session:**
```bash
memvid session --file frontend.mv2 --start "fe-20260420-10"
memvid session --file frontend.mv2 --stop
```

**Bulk import from decision log:**
```bash
memvid put-many --file frontend.mv2 --input DECISION_LOG.md --embed
```

**Build knowledge graph:**
```bash
memvid enrich --file frontend.mv2 --all
```

**Timeline view:**
```bash
memvid timeline --file frontend.mv2
```

**Export for backup:**
```bash
memvid export --file frontend.mv2 --output frontend-backup.json --format json
```

### CLI failure → DECISION_LOG.md fallback
```
CLI unavailable (memvid not installed / PATH issue) → use DECISION_LOG.md.
State: "Memvid CLI unavailable — writing to DECISION_LOG.md. Cross-agent: SHARED_CONTRACTS.md."
```

---

## READING SHARED MEMORY — What Backend Writes for Frontend

The backend agent writes to `shared.mv2`. Frontend should recall:

```
memvid_find { "file": "shared.mv2", "query": "backend api endpoint schema route", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "shared.mv2", "query": "error format response envelope status codes", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "shared.mv2", "query": "auth token jwt session cookie refresh endpoint", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "shared.mv2", "query": "environment variables base url api vite", "mode": "hybrid", "limit": 5 }
```

**Backend typically writes:**
- `[type:api-contract]` — Every endpoint: method, path, request body schema, response schema
- `[type:api-contract]` — Auth flow: how tokens are issued, stored, refreshed
- `[type:api-contract]` — Error envelope: the exact shape of all error responses
- `[type:api-contract]` — WebSocket events: event names, payload schemas, direction (server→client)
- `[type:project-context]` — Base URL: `VITE_API_URL`, staging vs production values
- `[type:constraint]` — Rate limits, pagination defaults, max upload sizes

**When backend hasn't written yet:** Build against the agreed contract in `SHARED_CONTRACTS.md` or ask the user. Never assume an endpoint shape.

---

## MEMORY HYGIENE

### Update (not append) when a decision is reversed
```
memvid_update { "file": "frontend.mv2", "frame_id": [ID], "input": "SUPERSEDED: [original]\nSuperseded by: [new decision] on [date]." }
```
**Never** store a contradicting frame — always find and update the original.

### Conflict protocol
```
⚠️ MEMORY CONFLICT: shared.mv2 has two contradictory entries:
  - [agent:backend, date]: "[statement 1]"
  - [agent:frontend, date]: "[statement 2]"
  Which should I follow?
```
After user resolves: `memvid_put` the winner, `memvid_delete` the loser.

### Periodic consolidation
```bash
memvid ask --file frontend.mv2 --question "Which decisions are still active? Which are stale or superseded?"
```

---

## ADVANCED OPERATIONS (rarely needed — run on demand)

```bash
# Knowledge graph entity lookup
memvid who --file frontend.mv2 --query "AuthStore"
memvid follow --file frontend.mv2 --entity "ZustandStore" --hops 2
memvid facts --file frontend.mv2

# Temporal search
memvid when --file frontend.mv2 --query "when was Zustand chosen?"

# Audit with citations
memvid audit --file frontend.mv2 --query "state management decisions" --include-snippets

# Fetch and store from URL
memvid api-fetch --file frontend.mv2 --url "https://tanstack.com/query/latest/docs/..."

# Encryption
memvid lock --file frontend.mv2 --output frontend.mv2e --password "your-password"
memvid unlock --file frontend.mv2e --output frontend.mv2 --password "your-password"
```

---

## TROUBLESHOOTING

| Issue | MCP Fix | CLI Fix |
|-------|---------|---------|
| `memvid_find` returns no results | `memvid_stats` — is `vector_count > 0`? If 0: re-put with `"embed": true` | `memvid stats --file frontend.mv2` |
| Slow search | Use `"mode": "lex"` for keywords only | `--mode lex` |
| File not found | `memvid_create { "file": "frontend.mv2" }` | `memvid create --file frontend.mv2` |
| MCP server won't start | Check Node.js 18+ and `MEMVID_PATH` env var | Use CLI directly |
| `put` text not stored | Ensure `"embed": true` in the call | Add `--embed` flag |
| Session not recording | `memvid_status { "file": "frontend.mv2" }` | `memvid status --file frontend.mv2` |
| Cross-agent conflict | Surface `⚠️ MEMORY CONFLICT:` to user — never silently pick | Same — ask user |
| Memory file corrupted | `memvid_doctor { "file": "frontend.mv2" }` | `memvid doctor --file frontend.mv2` |
| Model not found (nomic) | `memvid_models {}` — ensure nomic is installed | `memvid models` |

---

## FULL MCP TOOL REFERENCE

```
Lifecycle:  memvid_create, memvid_open, memvid_stats, memvid_verify, memvid_doctor
Content:    memvid_put, memvid_put_many, memvid_view, memvid_update, memvid_delete, memvid_correct, memvid_api_fetch
Search:     memvid_find, memvid_vec_search, memvid_ask, memvid_timeline, memvid_when
Graph:      memvid_enrich, memvid_memories, memvid_state, memvid_facts, memvid_follow, memvid_who
Session:    memvid_session, memvid_binding, memvid_status, memvid_sketch, memvid_nudge
Analysis:   memvid_audit, memvid_debug_segment, memvid_export, memvid_tables, memvid_schema, memvid_models
Encrypt:    memvid_lock, memvid_unlock
Utility:    memvid_process_queue, memvid_verify_single_file, memvid_config, memvid_version
```
