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
  npm-tools MCP        → before ANY new library is proposed (TS2.1 bundle check)

Step 2 — Component discovery:
  Magic UI MCP         → check before building any animated "wow factor" component
  ReactBits MCP        → check before building any animated effect or text animation
  Storybook MCP        → check what components already exist (ONLY if @storybook detected)

Step 3 — Design reference:
  Figma MCP            → when design spec or node URL is provided

Step 4 — Project memory:
  Memvid MCP           → if available: recall past decisions via memvid_find
  DECISION_LOG.md      → fallback if Memvid MCP unavailable

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

**Purpose**: Fetches current, version-specific docs. Eliminates documentation hallucinations.

**Call before:** Any TanStack Query / Table / Virtual usage; any Tailwind v4 utility; any shadcn component; any `motion` animation API; any Zod schema; any Zustand store; any Vitest config; any npm package not built into React/TypeScript.

**NOT required for:** React core hooks, TypeScript language features, HTML/CSS fundamentals.

**Query patterns:**
```
Standard:         [library] [specific feature]
Version-specific: [library] v[INSTALLED_MAJOR] [specific feature]
Migration:        [library] v[N] to v[M] migration
```

**Version resolution:** Check `package.json` for installed version. If installed major ≠ skill baseline → MUST use version-specific query.

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

## 4. Magic UI MCP — Animated Components

**Activate before building:** Hero sections, shimmer effects, number animations, word reveals, device mockups, bento grids, marquee carousels.

---

## 5. ReactBits MCP — Animated Effects

135+ components: Aurora/Particles/Beams backgrounds, BlurText/CountUp text, BlobCursor effects, card tilt/hover. Quality: Backgrounds 9.8/10, Cursors 9.5/10, Text 9.0/10. Buttons/Forms: use shadcn instead.

**Discovery order:** Magic UI → ReactBits → build from scratch with `react-animations` skill.

---

## 6. Figma Dev Mode MCP — Design Spec

Remote endpoint: `https://mcp.figma.com/mcp`

**Call when:** User provides a Figma URL or node ID; building to match a design spec; extracting token values.

---

## 7. Storybook MCP — Project Component Introspection

**MANDATORY PRE-CHECK:**
```bash
cat package.json | grep -q "@storybook" && echo "AVAILABLE" || echo "NOT_INSTALLED"
```

- `NOT_INSTALLED`: Do NOT call Storybook MCP. Fall back to `ls src/components/` + file reading.
- `AVAILABLE`: Endpoint `http://localhost:6006/mcp`. Requires Storybook 8.3+ with `@storybook/addon-mcp`.

**When active:** Browse components/props, list existing stories, generate new stories, run interaction tests.

---

## 8. Memvid MCP — Persistent Memory

**Purpose**: Persistent, cross-session memory for architectural decisions, team conventions,
and project preferences. Uses portable `.mv2` files — no databases, no infrastructure.
Frontend and backend agents share a `shared.mv2` file for cross-agent context awareness.

**When to load the `memvid-docs` skill:** Load `skills/memvid-docs/SKILL.md`
when troubleshooting Memvid, configuring memory files, or needing the full
40-tool reference beyond what this section covers.

### Resolution protocol:
```
1. Attempt memvid_find on shared.mv2 + frontend.mv2 → if results found, use them.
2. memvid_find returns empty/no results → No relevant prior context
   exists for this query. Proceed with DECISION_LOG.md as primary
   context, then build fresh.
3. Memvid MCP is unavailable (connection error, not installed) →
   Fall back to DECISION_LOG.md. If cross-agent memory is needed
   and Memvid is down, note in HANDOFF.md:
   "Memvid was unavailable — cross-agent decisions not synced."
4. If neither DECISION_LOG.md nor any .mv2 files exist →
   Ask user: A) Setup Memvid  B) Create DECISION_LOG.md  C) Start fresh
5. Never skip the recall step. Even if you are confident in your
   training data, memvid_find may surface project-specific context.
```

### Core operations:
```
memvid_put   → after any architectural decision, convention, or contract established
memvid_find  → at session start, before any architectural decision (hybrid search)
memvid_ask   → for complex queries needing RAG synthesis across multiple memories
```

### Memory file topology:
```
frontend.mv2  → Frontend agent's PRIVATE memory (component patterns, UI decisions)
backend.mv2   → Backend agent's PRIVATE memory (model conventions, Django patterns)
shared.mv2    → SHARED cross-agent memory (API contracts, auth, error formats)
```

### Storing a memory (memvid_put):
```
memvid_put {
  "file": "shared.mv2",
  "input": "[agent:frontend] [type:architectural-decision] [feature:state]\nDecision: Chose Zustand over Redux for state management.\nWhy: Team of 2, no middleware needs, simpler DevTools.\nInvalidated by: Need for middleware, team growth beyond 5.",
  "embed": true
}
```

Always include:
- `"embed": true` — enables semantic search via nomic embeddings
- Tag prefix: `[agent:frontend]` or `[agent:backend]`
- Type tag: `[type:architectural-decision]`, `[type:api-contract]`, `[type:convention]`

### Recalling memories (memvid_find):
```
# Session start — recall relevant context
memvid_find { "file": "shared.mv2", "query": "frontend architecture decisions", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "shared.mv2", "query": "backend API contracts and error formats", "mode": "hybrid", "limit": 5 }
memvid_find { "file": "frontend.mv2", "query": "component library conventions", "mode": "hybrid", "limit": 5 }
```

### Conflict resolution for shared memory:

When memvid_find returns contradictory memories (e.g., backend stored
"JWT tokens" but frontend stored "session-based auth"):

1. **Surface the conflict explicitly** to the user:
   ```
   ⚠️ MEMORY CONFLICT: shared.mv2 contains two contradictory entries:
   - [agent:backend, Date]: "[statement 1]"
   - [agent:frontend, Date]: "[statement 2]"
   Which should I follow?
   ```
2. **Do not silently pick one.** Contradictions in shared memory are
   architecture-level issues that need human resolution.
3. After resolution, `memvid_put` the resolved decision and `memvid_delete`
   the contradicting entry so both agents converge.

### Cross-agent fallback (when Memvid is unavailable):

If Memvid is unavailable and the task requires cross-agent knowledge:
1. Check for a `SHARED_CONTRACTS.md` file in the project root.
2. If it doesn't exist, create it with the contract you're defining.
3. Both agents must read `SHARED_CONTRACTS.md` at session start.
4. This file is the manual fallback for Memvid put/find.
5. Explicitly state: "Memvid unavailable. Writing to SHARED_CONTRACTS.md
   so the other agent can pick this up."

### Memory hygiene:
- Use `memvid_ask` after multi-feature implementations to synthesize and
  consolidate memories. Remove superseded entries with `memvid_delete`.
- **Do not store implementation details** (exact code lines, file paths).
  Store architectural decisions and contracts only.
- **Stale memory detection:** If a recalled decision references a library
  version, file, or pattern that no longer exists in the codebase, treat
  it as stale. Note the staleness and proceed with current codebase state.
  After resolution, `memvid_update` the stale entry to replace it.
- Use `memvid_timeline` to review how decisions evolved over time.

### MCP tool names (exact — do not guess):
```
Lifecycle: memvid_create, memvid_open, memvid_stats, memvid_verify, memvid_doctor
Content:   memvid_put, memvid_put_many, memvid_view, memvid_update,
           memvid_delete, memvid_correct, memvid_api_fetch
Search:    memvid_find, memvid_vec_search, memvid_ask, memvid_timeline, memvid_when
Graph:     memvid_enrich, memvid_memories, memvid_state, memvid_facts,
           memvid_follow, memvid_who
Session:   memvid_session, memvid_binding, memvid_status, memvid_sketch, memvid_nudge
Analysis:  memvid_audit, memvid_debug_segment, memvid_export, memvid_tables,
           memvid_schema, memvid_models
Encrypt:   memvid_lock, memvid_unlock
Utility:   memvid_process_queue, memvid_verify_single_file, memvid_config, memvid_version
```

For full tool parameter schemas, load the `memvid-docs` skill.

---

## 9. Fetch MCP — Live URL Content

**Activate when:** User references a specific URL; Context7 returns no results; checking a CHANGELOG before migration.

---

## 10. MCP Tool Safety & Circuit Breakers

### 10.1 — Tool name validation

Before calling any MCP tool, verify the tool name exists in the server's known tool list. Never guess a tool name from training memory.

If unsure of a tool name: call the MCP server's list/describe endpoint first, or state the uncertainty to the user rather than hallucinating a name.

### 10.2 — Per-tool retry limit

Each tool has a **maximum of 2 retries** per task, independent of other tools. Do not use a global retry counter.

After 2 failed calls to the same tool:
1. State clearly: *"[Tool name] has failed twice. Falling back to [fallback from §Failure Handling]."*
2. Use the fallback immediately.
3. Never attempt a third call with the same or slightly modified parameters.

### 10.3 — Retryable vs non-retryable errors

| Error type | Examples | Action |
|---|---|---|
| **Retryable** | Network timeout, server 503, rate limit (429) | Retry once with exponential backoff (wait 2s, then 4s) |
| **Non-retryable** | No results found, wrong tool name, auth failure (401/403), schema mismatch | Do NOT retry — fall back immediately |

**Key rule:** "No results" from Context7 is a non-retryable error. It means the library/feature is unknown to Context7, not that the network failed. Do not retry the same query.

### 10.4 — Same-parameters block

If a tool call failed and you are about to call the same tool with **identical parameters**, stop.

This is always a non-retryable pattern — the same input will produce the same failure. Before retrying, one of these must change:
- The tool name (you got it wrong → find the correct name)
- The query parameters (you asked the wrong question → reformulate)
- The fallback (you should not be retrying → use fallback)

### 10.5 — Context7 query reformulation

If Context7 returns no results on the first call:
1. Simplify the query — remove version specifiers, try just `[library] [feature]`
2. If still no results → use Fetch MCP to retrieve the library's official docs URL directly
3. If Fetch MCP also fails → note the limitation to the user, use training memory with explicit caveat

---

## MCP Failure Handling

If any server is unavailable:

1. State clearly: *"MCP server [name] is unavailable."*
2. Use the fallback:

| Server unavailable | Fallback |
|---|---|
| Context7 | Fetch MCP → raw docs URL → note limitation to user |
| shadcn MCP | `ls src/components/ui/` + read component source directly |
| npm-tools | `npm view [pkg] dist.unpackedSize` + `npm audit` in CLI |
| Magic UI | ReactBits → build from scratch with `react-animations` |
| ReactBits | Build from scratch with `react-animations` skill |
| Storybook | File-system discovery — treat as not installed |
| Memvid | Read DECISION_LOG.md; if cross-agent: SHARED_CONTRACTS.md |
| Figma | Request design spec via screenshot or spec doc from user |
| Fetch | Web search as last resort |

3. Never silently fall back to training memory when MCP was required.
4. Never proceed if Context7 or shadcn MCP is unavailable and required — state the blocker and ask how to proceed.
