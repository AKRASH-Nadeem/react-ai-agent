# Memvid — Persistent Memory for AI Agents (Frontend)

> **Load this skill** when: troubleshooting Memvid, configuring `.mv2` files,
> working with knowledge graph tools, session replay, `.mv2e` encryption,
> or any advanced Memvid operation beyond the daily `find/put/ask` workflow.
>
> **Day-to-day recall and storage** is covered in `mcp-servers.md §8` and
> `core.md Step 1.5`. Read those first.

---

## What is Memvid?

Memvid is a **zero-infrastructure, single-file memory layer** for AI agents.
It replaces complex RAG pipelines with a portable `.mv2` file containing data,
embeddings, search indices, and metadata — all in one file.

**Architecture:**
- **Smart Frames**: Immutable, append-only units with timestamps, checksums, metadata
- **Single file**: Everything in one `.mv2` — no `.wal`, `.lock`, `.shm` sidecars
- **Crash safe**: Embedded WAL ensures data integrity
- **Portable**: Copy the file, carry the memory anywhere

**Capabilities:**
- Hybrid search (lexical via Tantivy + semantic via HNSW vectors)
- Knowledge graph (Logic-Mesh NER entity extraction)
- Time-travel debugging (rewind, replay, branch memory states)
- Session recording and replay
- AES-256-GCM encryption
- Sub-5ms local memory access with predictive caching

**MCP Server:** `Tapiocapioca/memvid-mcp` wraps the memvid Rust CLI, exposing 40 tools.
**Default embedding model:** `nomic` (nomic-embed-text-v1.5) — 768 dimensions, local, no API key.

---

## Memory Topology — 3-File Architecture

```
frontend.mv2  → Frontend agent's PRIVATE memory
backend.mv2   → Backend agent's PRIVATE memory
shared.mv2    → SHARED cross-agent memory
```

| Memory type | File | Examples |
|------------|------|----------|
| Frontend-only decisions | `frontend.mv2` | Zustand vs Redux, component folder structure, form validation approach, design tokens |
| Backend-only decisions | `backend.mv2` | Django patterns, Celery, ORM conventions |
| Cross-agent contracts | `shared.mv2` | API endpoint schema, auth token flow, error envelope format, WebSocket events |

**Rule: When in doubt → `shared.mv2`.** Both agents seeing a decision is better than one missing it.

---

## INITIALIZATION PROTOCOL (First Session)

Run once when `.mv2` files do not exist yet:

```
# Step 1: Create all three files
memvid_create { "file": "shared.mv2" }
memvid_create { "file": "frontend.mv2" }
memvid_create { "file": "backend.mv2" }

# Step 2: Verify creation
memvid_stats { "file": "shared.mv2" }
memvid_stats { "file": "frontend.mv2" }

# Step 3: Migrate existing decisions
memvid_put_many { "file": "frontend.mv2", "input": "DECISION_LOG.md", "embed": true }

# Step 4: Seed shared memory with project tech stack
memvid_put {
  "file": "shared.mv2",
  "input": "[agent:frontend] [type:project-context] [date:YYYY-MM-DD]\nFrontend stack: React 19 + TypeScript + Tailwind v4 + shadcn v2 + TanStack Query + Zustand\nDesign system: OKLCH tokens, feature-based architecture\nAPI base URL: [from .env VITE_API_URL]",
  "embed": true
}

# Step 5: Build knowledge graph
memvid_enrich { "file": "frontend.mv2", "all": true }
memvid_enrich { "file": "shared.mv2", "all": true }

# Step 6: Verify embeddings loaded
memvid_stats { "file": "frontend.mv2" }
# Confirm: vector_count > 0. If 0 → re-run put with "embed": true
```

---

## SESSION LIFECYCLE

Every coding session follows this lifecycle:

### Session Start
```
# Already covered in core.md Step 1.5 — shown here for completeness
memvid_stats { "file": "frontend.mv2" }  # confirm file healthy
memvid_session { "file": "frontend.mv2", "start": "fe-[YYYYMMDD-HH]" }
memvid_find { "file": "shared.mv2", "query": "relevant project context api contracts", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "component conventions state management", "mode": "hybrid", "limit": 5 }
```

### During Session — After Each Architectural Decision
```
memvid_put {
  "file": "[frontend.mv2 or shared.mv2]",
  "input": "[agent:frontend] [type:X] [feature:Y] [date:YYYY-MM-DD]\n...",
  "embed": true
}
# Then optionally:
memvid_enrich { "file": "frontend.mv2", "all": false }  # extract new entities
```

### Session End — Consolidation
```
# Synthesize what was decided
memvid_ask {
  "file": "frontend.mv2",
  "question": "What architectural decisions were made in the most recent session?"
}

# Review session timeline
memvid_timeline { "file": "frontend.mv2" }

# Stop session
memvid_session { "file": "frontend.mv2", "stop": true }
```

---

## PROACTIVE STORAGE — WHEN TO WRITE

**Write immediately (do not defer) when:**

| Trigger | File | Tag |
|---------|------|-----|
| State management library chosen | `frontend.mv2` | `[type:architectural-decision]` |
| Component folder architecture confirmed | `frontend.mv2` | `[type:convention]` |
| Design token strategy established | `frontend.mv2` | `[type:convention]` |
| API endpoint schema agreed with backend | `shared.mv2` | `[type:api-contract]` |
| Auth token handling approach decided | `shared.mv2` | `[type:api-contract]` |
| Error response format established | `shared.mv2` | `[type:api-contract]` |
| WebSocket event schema defined | `shared.mv2` | `[type:api-contract]` |
| Developer constraint stated ("no Redux", "bundle < 200KB") | `frontend.mv2` | `[type:constraint]` |
| Decision reversed | Update existing frame with `memvid_update` | Do NOT append |

**Do NOT store:**
- Bug fixes following an already-stored pattern
- New components following established conventions
- Style/copy changes
- Test additions
- Anything that doesn't change how future decisions should be made

---

## MEMORY FORMAT — REQUIRED STRUCTURE

```
memvid_put {
  "file": "shared.mv2 | frontend.mv2",
  "input": "[agent:frontend] [type:TYPE] [feature:FEATURE] [date:YYYY-MM-DD]
Decision: One sentence.
Why: Core reasoning.
Rejected: Alt 1 (reason). Alt 2 (reason).
Invalidated by: The condition that would make this decision wrong.",
  "embed": true
}
```

**Type values:**
- `architectural-decision` — Library/framework choice, pattern establishment
- `api-contract` — Endpoint schema, payload format, auth flow, error envelope
- `convention` — Naming, file structure, coding pattern team has settled on
- `constraint` — Hard limit from developer or infrastructure
- `project-context` — Stack/infrastructure snapshot

**Example — State management decision:**
```
memvid_put {
  "file": "frontend.mv2",
  "input": "[agent:frontend] [type:architectural-decision] [feature:state] [date:2026-04-19]
Decision: Chose Zustand over Redux Toolkit for global state management.
Why: Team of 2, no middleware needed, React Compiler compatible, 4x less boilerplate.
Rejected: Redux Toolkit (middleware overkill), Jotai (unfamiliar to team), Context (re-render perf at scale).
Invalidated by: Team grows past 5, DevTools time-travel required for debugging, server-state sync needed.",
  "embed": true
}
```

**Example — API contract with backend:**
```
memvid_put {
  "file": "shared.mv2",
  "input": "[agent:frontend] [type:api-contract] [feature:auth] [date:2026-04-19]
Contract: JWT access + refresh token flow.
Access token: 15min TTL, stored in memory (not localStorage).
Refresh token: 7d TTL, httpOnly cookie.
Refresh endpoint: POST /api/v1/auth/token/refresh/
Error format: { error: string, code: string, detail?: string }
Invalidated by: Switch to session-based auth, OAuth provider change.",
  "embed": true
}
```

---

## KNOWLEDGE GRAPH WORKFLOW

```
# After storing multiple related memories:
memvid_enrich { "file": "frontend.mv2", "all": true }

# Look up a specific entity
memvid_who { "file": "frontend.mv2", "query": "AuthStore" }

# Follow entity relationships (2 hops)
memvid_follow { "file": "frontend.mv2", "entity": "ZustandStore", "hops": 2 }

# List all known facts
memvid_facts { "file": "frontend.mv2" }

# Current memory state
memvid_state { "file": "frontend.mv2" }
```

---

## CROSS-AGENT COMMUNICATION VIA shared.mv2

**How frontend discovers backend API contracts:**
```
memvid_find { "file": "shared.mv2", "query": "backend api endpoint schema error format auth", "mode": "hybrid", "limit": 5 }
```

**How backend discovers frontend requirements:**
```
memvid_find { "file": "shared.mv2", "query": "frontend state management component conventions api expectations", "mode": "hybrid", "limit": 5 }
```

**Write sequencing:** Each agent writes to its private file first, then to `shared.mv2`. Never write to `shared.mv2` from both agents simultaneously for the same contract.

**Conflict protocol:**
```
⚠️ MEMORY CONFLICT: shared.mv2 has two contradictory entries:
- [agent:backend, Date]: "[statement 1]"
- [agent:frontend, Date]: "[statement 2]"
Which should I follow?
```
After user resolves: `memvid_put` winner, `memvid_delete` loser. Never silently pick one.

---

## ADVANCED OPERATIONS

### Audit report (with citations)
```
memvid_audit { "file": "frontend.mv2", "query": "state management decisions", "include_snippets": true }
```

### Temporal search
```
memvid_when { "file": "frontend.mv2", "query": "when was Zustand chosen?" }
```

### Timeline view
```
memvid_timeline { "file": "frontend.mv2" }
```

### Export for backup
```
memvid_export { "file": "frontend.mv2", "output": "frontend-backup.json", "format": "json" }
```

### Encryption
```
memvid_lock { "file": "frontend.mv2", "output": "frontend.mv2e", "password": "your-password" }
memvid_unlock { "file": "frontend.mv2e", "output": "frontend.mv2", "password": "your-password" }
```

### Bulk import (ingesting architecture docs)
```
memvid_put_many { "file": "frontend.mv2", "input": "./docs/frontend", "recursive": true, "embed": true }
```

### Fetch and store from URL
```
memvid_api_fetch { "file": "frontend.mv2", "url": "https://tanstack.com/query/latest/docs/..." }
```

---

## MEMORY HYGIENE

### Stale memory
```
memvid_update { "file": "frontend.mv2", "frame_id": [ID], "input": "SUPERSEDED: [original]\nSuperseded by: [new decision] on [date]." }
```

### Pruning genuine conflicts
```
memvid_delete { "file": "frontend.mv2", "frame_id": [ID] }
```

### Periodic consolidation
```
memvid_ask { "file": "frontend.mv2", "question": "Which decisions are still active? Which are stale?" }
```

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|---------|
| `memvid_find` returns no results | `memvid_stats` — is `vector_count > 0`? If 0: re-put with `"embed": true` |
| Slow search | Use `"mode": "lex"` for keyword-only; `"sem"` for semantic-only |
| Memory file too large | `memvid_export` to backup, create fresh with curated memories |
| Model not found | `memvid_models {}` — ensure nomic is installed |
| MCP server won't start | Node.js 18+: `node --version`; `memvid --version`; check `MEMVID_PATH` env var |
| `memvid_put` text not stored | Use raw text in `"input"` field. Ensure `"embed": true`. |
| Session not recording | `memvid_status { "file": "frontend.mv2" }` — check active session |
| Cross-agent conflict | Surface to user with `⚠️ MEMORY CONFLICT:` — never silently resolve |

---

## Full Tool Catalog (40 Tools)

### Lifecycle (5)
`memvid_create` · `memvid_open` · `memvid_stats` · `memvid_verify` · `memvid_doctor`

### Content (7)
`memvid_put` · `memvid_put_many` · `memvid_view` · `memvid_update` · `memvid_delete` · `memvid_correct` · `memvid_api_fetch`

### Search (5)
`memvid_find` · `memvid_vec_search` · `memvid_ask` · `memvid_timeline` · `memvid_when`

### Knowledge Graph (6)
`memvid_enrich` · `memvid_memories` · `memvid_state` · `memvid_facts` · `memvid_follow` · `memvid_who`

### Session (5)
`memvid_session` · `memvid_binding` · `memvid_status` · `memvid_sketch` · `memvid_nudge`

### Analysis (6)
`memvid_audit` · `memvid_debug_segment` · `memvid_export` · `memvid_tables` · `memvid_schema` · `memvid_models`

### Encryption (2)
`memvid_lock` · `memvid_unlock`

### Utility (4)
`memvid_process_queue` · `memvid_verify_single_file` · `memvid_config` · `memvid_version`
