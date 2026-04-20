---
trigger: always_on
---

> MCP MANDATE: Context7 must be called before generating any code that uses an EXTERNAL library or framework. React built-in hooks are exempt. For all other libraries: Context7 is the source of truth. Training memory is a draft. If they conflict, Context7 wins.

---

# MCP Servers — Frontend Development Stack

---

## Priority Order (run in this sequence per task)

```
Step 1 — Source validation:
  Context7             → before ANY external library code
  shadcn MCP           → before ANY shadcn component usage
  npm-tools MCP        → before ANY new library (TS2.1 bundle check)

Step 2 — Memory (run BEFORE implementation):
  Memvid MCP           → recall past decisions; store after decisions
  DECISION_LOG.md      → fallback if Memvid MCP unavailable

Step 3 — Component discovery:
  Magic UI MCP         → before any animated "wow factor" component
  ReactBits MCP        → before any animated effect or text animation
  Storybook MCP        → existing components (ONLY if @storybook detected)

Step 4 — Design reference:
  Figma MCP            → when design spec or node URL is provided

Step 5 — Fallback:
  Fetch MCP            → live changelog or niche docs Context7 doesn't cover
```

### When to use MCP vs skills vs training memory

| Need | Source |
|------|--------|
| React built-in APIs | Training memory — exempt |
| External library method signatures | Context7 (always) |
| shadcn component props | shadcn MCP |
| Bundle size, vulnerabilities | npm-tools MCP |
| Animated component exists? | Magic UI → ReactBits |
| Component in project already? | Storybook MCP (only if installed) |
| Past decisions | Memvid MCP → DECISION_LOG.md |
| Live changelogs / niche docs | Fetch MCP |
| Architectural patterns | Skills |
| Version-specific library code | Context7 with version-specific query |

---

## 1. Context7 — Live Documentation

**Call before:** Any TanStack Query / Table / Virtual usage; any Tailwind v4 utility; any shadcn component; any `motion` animation API; any Zod schema; any Zustand store; any Vitest config; any npm package not built into React/TypeScript.

**NOT required for:** React core hooks, TypeScript language features, HTML/CSS fundamentals.

**Query patterns:**
```
Standard:         [library] [specific feature]
Version-specific: [library] v[INSTALLED_MAJOR] [specific feature]
Migration:        [library] v[N] to v[M] migration
```

---

## 2. shadcn MCP — Component Registry

**Purpose**: Confirms which components exist. Prevents hallucinated prop names.

**Tools:** `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`

**Always call before:** Using any component not confirmed in `src/components/ui/`; `input-otp`, `sidebar`, `calendar`, `chart`, `command` (APIs change frequently).

---

## 3. npm-tools MCP — Bundle & Package Intelligence

**Tools:** `estimate_bundle_size`, `compare_packages`, `get_package_info`, `analyze_dependencies`

**Activate when:** TS2.1 step 3 triggers (bundle check); comparing library candidates; auditing for vulnerabilities.

---

## 4. Magic UI & ReactBits MCPs

**Magic UI:** Hero sections, shimmer effects, number animations, word reveals, device mockups, bento grids, marquee carousels.

**ReactBits:** 135+ components: Aurora/Particles/Beams backgrounds, BlurText/CountUp text, BlobCursor effects, card tilt/hover. Discovery order: Magic UI → ReactBits → build from scratch with `react-animations` skill.

---

## 5. Figma Dev Mode MCP

Remote endpoint: `https://mcp.figma.com/mcp`

**Call when:** User provides a Figma URL or node ID; building to match a design spec; extracting token values.

---

## 6. Storybook MCP

**MANDATORY PRE-CHECK:**
```bash
cat package.json | grep -q "@storybook" && echo "AVAILABLE" || echo "NOT_INSTALLED"
```

- `NOT_INSTALLED`: Do NOT call Storybook MCP. Fall back to `ls src/components/` + file reading.
- `AVAILABLE`: Endpoint `http://localhost:6006/mcp`. Requires Storybook 8.3+ with `@storybook/addon-mcp`.

---

## 7. Fetch MCP

**Activate when:** User references a specific URL; Context7 returns no results; checking a CHANGELOG before migration.

---

## 8. Memvid MCP — Persistent Memory

**Purpose**: Persistent, cross-session memory for architectural decisions, team conventions,
and project preferences. Uses portable `.mv2` files — no databases, no infrastructure.

> **Load `skills/memvid-docs/SKILL.md`** when troubleshooting Memvid, configuring files,
> or needing the full 40-tool reference. For day-to-day use, this section is sufficient.

### Memory file topology:
```
frontend.mv2  → Frontend agent's PRIVATE memory (component patterns, UI decisions)
backend.mv2   → Backend agent's PRIVATE memory (model conventions, Django patterns)
shared.mv2    → SHARED cross-agent memory (API contracts, auth, error formats)
```

### Session Start — Full Init Sequence

Run at session start (also covered in `core.md` Step 1.5):

```
# 1. Verify files exist (create if missing)
memvid_stats { "file": "shared.mv2" }    → error? → memvid_create { "file": "shared.mv2" }
memvid_stats { "file": "frontend.mv2" }  → error? → memvid_create { "file": "frontend.mv2" }

# 2. Start session
memvid_session { "file": "frontend.mv2", "start": "fe-[YYYYMMDD-HH]" }

# 3. Recall context
memvid_find { "file": "shared.mv2", "query": "project architecture api contracts auth design system", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "component conventions state management decisions", "mode": "hybrid", "limit": 5 }

# 4. First run only
memvid_put_many { "file": "frontend.mv2", "input": "DECISION_LOG.md", "embed": true }
```

### Storing a memory (memvid_put):

```
memvid_put {
  "file": "shared.mv2",
  "input": "[agent:frontend] [type:architectural-decision] [feature:state] [date:2026-04-19]\nDecision: Chose Zustand over Redux for state management.\nWhy: Lightweight, no boilerplate, works with React Compiler.\nRejected: Redux (overkill), Context (re-render issues at scale).\nInvalidated by: Need for middleware, team growth beyond 5.",
  "embed": true
}
```

**Always include:** `"embed": true` · Tag prefix `[agent:frontend]` · Type tag · Date tag `[date:YYYY-MM-DD]`

### Recalling memories:
```
memvid_find { "file": "shared.mv2", "query": "frontend architecture decisions", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "shared.mv2", "query": "backend API contracts and error formats", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "component library conventions", "mode": "hybrid", "limit": 5 }
```

### After storing — enrich knowledge graph:
```
memvid_enrich { "file": "frontend.mv2", "all": false }
```

### Session end:
```
memvid_session { "file": "frontend.mv2", "stop": true }
```

### Resolution protocol:
```
1. memvid_find on shared.mv2 + frontend.mv2 → results found → use them
2. Returns empty → build fresh from DECISION_LOG.md
3. Memvid unavailable → DECISION_LOG.md; cross-agent: SHARED_CONTRACTS.md
4. Neither exist → Ask: A) Setup Memvid  B) Create DECISION_LOG.md  C) Start fresh
5. Never skip recall. Project context overrides training memory.
```

### Conflict resolution:
```
⚠️ MEMORY CONFLICT: shared.mv2 has two contradictory entries:
- [agent:backend, Date]: "[statement 1]"
- [agent:frontend, Date]: "[statement 2]"
Which should I follow?
```
After resolution: `memvid_put` the winner, `memvid_delete` the loser.

### Cross-agent fallback (Memvid unavailable):
1. Check `SHARED_CONTRACTS.md`. If missing, create it.
2. State: "Memvid unavailable. Writing to SHARED_CONTRACTS.md."

### Memory hygiene:
- Decision reversed → `memvid_update` original frame. Never append contradiction.
- Stale memory → `memvid_update` to replace it.
- Periodic: `memvid_ask { "file": "frontend.mv2", "question": "Summarize all active architectural decisions." }`

### Core tool reference:
```
Lifecycle: memvid_create, memvid_open, memvid_stats, memvid_verify, memvid_doctor
Content:   memvid_put, memvid_put_many, memvid_view, memvid_update, memvid_delete, memvid_correct, memvid_api_fetch
Search:    memvid_find, memvid_vec_search, memvid_ask, memvid_timeline, memvid_when
Graph:     memvid_enrich, memvid_memories, memvid_state, memvid_facts, memvid_follow, memvid_who
Session:   memvid_session, memvid_binding, memvid_status, memvid_sketch, memvid_nudge
Analysis:  memvid_audit, memvid_debug_segment, memvid_export, memvid_tables, memvid_schema, memvid_models
Encrypt:   memvid_lock, memvid_unlock
Utility:   memvid_process_queue, memvid_verify_single_file, memvid_config, memvid_version
```

---

## 9. MCP Tool Safety & Circuit Breakers

**Retry limit:** Max 2 retries per tool per task. After 2 failures: state the fallback and use it.

**Retryable:** Network timeout, 503, 429 → retry once (2s backoff, then 4s).
**Non-retryable:** No results, wrong tool name, auth failure → fall back immediately. Same parameters = never retry.

**Context7 no results:** Simplify query → Fetch MCP official URL → training memory with caveat.

---

## MCP Failure Handling

| Server unavailable | Fallback |
|---|---|
| Context7 | Fetch MCP → raw docs URL → note limitation |
| shadcn MCP | `ls src/components/ui/` + read component source |
| npm-tools | `npm view [pkg] dist.unpackedSize` + `npm audit` in CLI |
| Magic UI | ReactBits → build from scratch with `react-animations` |
| ReactBits | Build from scratch with `react-animations` skill |
| Storybook | File-system discovery — treat as not installed |
| Memvid | DECISION_LOG.md; cross-agent: SHARED_CONTRACTS.md |
| Figma | Request design spec via screenshot from user |
| Fetch | Note limitation, use training memory with caveat |
