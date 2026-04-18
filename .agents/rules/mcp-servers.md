---
trigger: always_on
---

> MCP MANDATE: Context7 must be called before generating any code that uses an EXTERNAL library or framework. React built-in hooks (useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer) are exempt — these are stable and do not require live doc lookup. For all other libraries: Context7 is the source of truth. Training memory is a draft. If they conflict, Context7 wins.

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
  Storybook MCP        → check what components already exist in the project
                         (ONLY if @storybook is detected in package.json — see §6)

Step 3 — Design reference:
  Figma MCP            → when design spec or node URL is provided

Step 4 — Project memory (see §5 for full decision logic):
  Hindsight MCP        → if available: recall past decisions and preferences
  DECISION_LOG.md      → fallback if Hindsight MCP is not available

Step 5 — Fallback:
  Fetch MCP            → live changelog or niche docs Context7 doesn't cover
```

### When to use MCP vs skills vs training memory

| Need | Source |
|------|--------|
| React built-in APIs (useState, useEffect, etc.) | Training memory — exempt from Context7 |
| External library method signatures | Context7 (always) |
| shadcn component props / existence | shadcn MCP |
| Bundle size, vulnerabilities, alternatives | npm-tools MCP |
| Animated component already exists? | Magic UI → ReactBits (in that order) |
| Component/story already in project? | Storybook MCP (only if installed) |
| Past decisions, preferences, project history | Hindsight MCP → DECISION_LOG.md (see §8) |
| Live changelogs / niche docs | Fetch MCP |
| Architectural patterns, design philosophy | Skills |
| HTML/CSS basics, TypeScript language | Training memory (OK) |
| Version-specific library code | Context7 with version-specific query |

---

## 1. Context7 — Live Documentation

**Purpose**: Fetches current, version-specific documentation for any external library or framework. Eliminates documentation hallucinations.

**Call before:**
- Any TanStack Query / TanStack Table / TanStack Virtual usage
- Any Tailwind v4 utility, theme variable, or plugin
- Any shadcn/ui component init or usage pattern
- Any `motion` (formerly framer-motion) animation API
- Any Zod schema pattern
- Any Zustand store setup
- Any Vitest configuration
- Any npm package not built into React/TypeScript — no exceptions

**NOT required for:**
- `useState`, `useEffect`, `useRef`, `useContext`, `useMemo`, `useCallback`, `useReducer`, `useId`, `use()` — React core, stable
- TypeScript language features (generics, utility types, etc.) — not a library
- HTML/CSS fundamentals

**Standard query pattern**: `[library] [specific feature]`

**Version-specific query pattern** (when installed major ≠ skill baseline major):
`[library] v[INSTALLED_MAJOR] [specific feature]`

**Version resolution hierarchy:**
1. Check `package.json` for installed version
2. Installed major = skill baseline major → standard query
3. Installed major ≠ skill baseline major → MUST use version-specific query
4. Library not in `versions.lock.md` → version-specific query always

---

## 2. shadcn MCP — Component Registry

**Purpose**: Confirms which components exist in the installed registry. Prevents hallucinated prop names.

**Available tools:**
- `search_items_in_registries` — fuzzy name/description search
- `view_items_in_registries` — full source code + metadata
- `get_item_examples_from_registries` — usage examples with complete code
- `list_items_in_registries` — browse all components
- `get_add_command_for_items` — exact CLI install command
- `get_audit_checklist` — post-creation verification checklist

**Call before:**
- Using any shadcn component not already confirmed in `src/components/ui/`
- Choosing between `field` vs `form` — API changed between shadcn v1 and v2
- Using `input-otp`, `sidebar`, `calendar`, `chart`, `command` — APIs change frequently
- Installing any new component — validate name first

**Workflow:**
1. `search_items_in_registries` → confirm it exists
2. `view_items_in_registries` → get TypeScript props
3. `get_item_examples_from_registries` → get usage patterns
4. Never guess — one MCP call is cheaper than a rewrite

---

## 3. npm-tools MCP — Bundle Size & Package Intelligence

**Purpose**: Live access to bundlephobia data, npm registry metadata, security audits, and package comparisons. Directly executes the TS2.1 checklist from `tech-stack.md`.

**Install:**
```bash
npx @rog0x/mcp-npm-tools
```

**Key tools:**
- `estimate_bundle_size('package-name')` → minified + gzipped size, tree-shaking support
- `compare_packages(['pkg-a', 'pkg-b'])` → bundle, downloads, deps, license side-by-side
- `get_package_info('package-name')` → versions, maintainers, npm quality score
- `analyze_dependencies('./package.json')` → outdated, deprecated, vulnerable

**Activate when:**
- TS2.1 step 3 triggers: "What is the bundle cost? Flag anything > 20KB gzipped"
- Comparing two library candidates before proposing one
- Auditing `package.json` for vulnerabilities before a deploy
- Verifying weekly downloads + last publish date before approving a library

---

## 4. Magic UI MCP — Animated Components

**Purpose**: Checks the Magic UI library for production-ready animated components before building from scratch.

**Available tools:**
- `searchRegistryItems` — search by keyword or use case
- `getRegistryItem` — full source code + examples (`includeSource: true`)
- `listRegistryItems` — browse all components

**Activate before building:**
- Hero sections with animated text or backgrounds
- Shimmer / glow button effects
- Number counting animations  
- Word-by-word or letter-by-letter text reveals
- Device mockups (phone, browser, terminal frames)
- Bento grid layouts with animated cards
- Marquee / infinite scroll carousels

---

## 5. ReactBits MCP — Animated Effects Library

**Purpose**: 135+ animated React components — backgrounds (Aurora, Beams, Particles), text animations (BlurText, CountUp, CircularText), cursors (BlobCursor, SplashCursor), and card effects. Both CSS and Tailwind variants with quality scores.

**Install:**
```bash
npx reactbits-dev-mcp-server
```

**Activate before building:**
- Aurora / particle / beam background effects → check here first
- Animated cursor effects (Blob, Splash, Magnet)
- Text reveals (blur, glitch, letter-by-letter)
- Scroll-triggered section reveals
- Card tilt / hover effects

**Quality scores (use as guidance):**
- Backgrounds: 9.8/10 — production-ready
- Cursor effects: 9.5/10 — production-ready
- Text animations: 9.0/10 — production-ready
- Buttons/Forms: not production-ready — use shadcn for those

**Component discovery order:** Magic UI first → ReactBits second → 21st.dev Magic third → build from scratch using `react-animations` skill

---

## 6. Figma Dev Mode MCP — Design Spec

**Purpose**: Reads live Figma layer hierarchy, design tokens, auto-layout, variants, Code Connect mappings, and asset references as structured data — not screenshots.

**Remote endpoint (preferred):**
```
https://mcp.figma.com/mcp
```

**Desktop server:** Enable in Figma Desktop → Preferences → Enable Dev Mode MCP Server

**Call when:**
- User provides a Figma file URL or node ID
- Building a component that must match a design spec
- Extracting exact token values (color, spacing, typography)

**Key tools:**
- `get_design_context` → React + Tailwind representation of selection
- `get_variable_defs` → token values and code syntax
- `get_screenshot` → visual reference for layout fidelity

---

## 7. Storybook MCP — Project Component Introspection

**Purpose**: When Storybook is running, connects to the project's component library to provide live prop documentation, story listing, and interaction test results. Prevents building components that already exist.

**MANDATORY PRE-CHECK — run before any Storybook MCP call:**
```bash
cat package.json | grep -q "@storybook" && echo "STORYBOOK_AVAILABLE" || echo "STORYBOOK_NOT_INSTALLED"
```

**If `STORYBOOK_NOT_INSTALLED`:**
- Do NOT call Storybook MCP tools
- Do NOT suggest installing Storybook unless the user explicitly asks
- Fall back to: `ls src/components/` + direct file reading for component discovery
- Never produce an error — silently skip this step

**If `STORYBOOK_AVAILABLE`:**
- MCP endpoint: `http://localhost:6006/mcp`
- Requires Storybook 8.3+ with `@storybook/addon-mcp` installed
- Only available while Storybook is running (`npm run storybook`)

**Capabilities when active:**
- Browse all components and their documented props
- List existing stories and their configurations
- Generate new stories for new components
- Run interaction tests and report results

**Call when (project has Storybook):**
- Building a new page — check what components already exist
- Creating a new component — generate a co-located story
- Debugging component state — check its documented prop types
- Verifying design system coverage

---

## 8. Hindsight MCP — Persistent Project Memory (Optional)

**Purpose**: Cross-session memory via PostgreSQL + Knowledge Graph. Stores architectural decisions, past bug resolutions, user preferences, and project mental models across sessions. When available, this replaces `DECISION_LOG.md` as the primary memory source.

**Infrastructure requirement:** Requires a running PostgreSQL instance with `pgvector` extension. Not available in all environments.

### Memory Resolution Protocol (run at session start and before any architectural decision)

```
STEP 1 — Check for Hindsight MCP
  → Attempt: recall from Hindsight memory bank
  → If successful: use recalled context. Skip to STEP 4.
  → If MCP unavailable or returns error: go to STEP 2.

STEP 2 — Check for DECISION_LOG.md
  → Run: ls -la DECISION_LOG.md 2>/dev/null
  → If EXISTS: read it fully. Use as project memory. Skip to STEP 4.
  → If NOT FOUND: go to STEP 3.

STEP 3 — Neither memory source exists. Ask the user:
  > "I don't have a project memory source available. I can:
  > A) Set up Hindsight MCP (persistent cross-session memory via PostgreSQL — requires infrastructure)
  > B) Create a DECISION_LOG.md now by analyzing the existing codebase
  >    (reads package.json, src/ structure, and existing patterns to reconstruct decisions)
  > C) Start fresh — no memory for this session
  > Which would you prefer?"
  
  - If A → provide Hindsight setup instructions (see below)
  - If B → run code analysis: read package.json, scan src/ directory, identify patterns,
            create DECISION_LOG.md with inferred decisions marked as "inferred — unconfirmed"
  - If C → proceed without memory context, note the limitation

STEP 4 — Memory source established. Proceed with task.
```

### Hindsight operations (when MCP is available)

**`retain`** — Store into durable memory:
- Call after: significant architectural decisions, resolved bugs, user preferences, completed migrations
- Example: `retain("chose TanStack Query over SWR because team already knows the API and we need optimistic updates")`

**`recall`** — Retrieve from memory:
- Call at: session start, before any architectural decision, when debugging
- Example: `recall("state management decisions for this project")`

**`reflect`** — Synthesize across memories:
- Call after: completing a multi-feature task, before proposing major changes
- Example: `reflect("what patterns have worked well in this codebase")`

### Hindsight setup (when user selects option A)

```bash
# Requires PostgreSQL with pgvector
docker run -d --name hindsight-db   -e POSTGRES_PASSWORD=hindsight   -p 5432:5432   pgvector/pgvector:pg16

# Install the MCP server
pip install hindsight-mcp
# Configure in your IDE's MCP settings
```

---

## 9. Fetch MCP — Live URL Content

**Purpose**: Fetches live content from any URL — changelogs, migration guides, docs Context7 doesn't cover.

**Install:**
```bash
npx -y @modelcontextprotocol/server-fetch
```

**Activate when:**
- User references a specific documentation URL
- Context7 returns no results for a niche library
- Checking a library CHANGELOG.md for breaking changes before a migration
- Verifying the current version of a package before installing

---

## MCP Failure Handling

If any MCP server is unavailable:

1. State clearly: "MCP server [name] is unavailable."
2. Use the fallback from this table:

| Server unavailable | Fallback |
|---|---|
| Context7 | Fetch MCP → raw docs URL → note limitation to user |
| shadcn MCP | `ls src/components/ui/` + read component source directly |
| npm-tools | `npm view [pkg] dist.unpackedSize` + `npm audit` in CLI |
| Magic UI | ReactBits → build from scratch with `react-animations` skill |
| ReactBits | Build from scratch with `react-animations` skill |
| Storybook | File-system component discovery — treat as not installed |
| Figma | Request design spec via screenshot or spec doc from user |
| Fetch | Web search as last resort |

3. Never silently fall back to training memory when MCP was supposed to validate.
4. Never proceed with code if Context7 or shadcn MCP is unavailable for a task that requires them — state the blocker and ask how to proceed.
