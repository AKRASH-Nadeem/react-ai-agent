---
trigger: always_on
---

> MCP MANDATE: Context7 must be called before generating any code that uses an external library. This is non-negotiable. Outdated API usage is never acceptable. Context7 is the source of truth. Training memory is a draft. If they conflict, Context7 wins.

---

# MCP Servers — Frontend Development Stack

---

## 1. Context7 — Live Documentation

**Purpose**: Fetches current, version-accurate documentation for any library or framework.

**Call before:**
- Any code using React, React DOM, or React 19 compiler APIs
- Any Next.js route, layout, or server component
- Any TanStack Query / TanStack Table / TanStack Virtual usage
- Any Tailwind v4 utility, theme variable, or plugin
- Any shadcn/ui component init or usage pattern
- Any `motion` (formerly framer-motion) animation API
- Any Zod schema pattern
- Any Zustand store setup
- Any Playwright or Vitest configuration
- Any npm package — no exceptions. "I know this from training" is not a valid reason to skip Context7.

**Standard query pattern**: `[library] [specific feature]`
Examples:
- `react tanstack query v5 optimistic updates`
- `tailwindcss v4 container queries`
- `shadcn form field validation`
- `zustand v5 slices pattern`

**Version-specific query pattern** — use this when a skill's baseline version
differs from the installed version:

`[library] v[INSTALLED_MAJOR] [specific feature]`

This tells Context7 to return docs for the version actually installed in the
project, not the latest. Always prefer the installed version over "latest" when
writing code for an existing codebase.

Examples of version-specific queries:
```
msw v1 rest handlers setup
msw v2 http HttpResponse json
tanstack react-query v4 useQuery onSuccess
tanstack react-query v5 useQuery gcTime
framer-motion v10 AnimatePresence exit
motion v11 AnimatePresence exit
zustand v4 create store middleware
zustand v5 create store useShallow
tailwindcss v3 config extend theme
tailwindcss v4 theme css variables
react-hook-form v7 useForm register
sentry react v7 init BrowserTracing
sentry react v8 init browserTracingIntegration
```

**Version resolution hierarchy:**
1. Check `package.json` for installed version
2. If installed major = skill baseline major → standard query is fine
3. If installed major ≠ skill baseline major → MUST use version-specific query
4. If library not in `versions.lock.md` → use version-specific query always

**Do not use for:** HTML/CSS fundamentals, TypeScript language features, general algorithmic questions.

---

## 2. shadcn MCP — Component Registry

**Purpose**: Confirms which components exist in the installed registry and retrieves current component API, source code, and examples before writing code against it.

**Available tools:**
- `search_items_in_registries` — Find components by fuzzy name/description search
- `view_items_in_registries` — View detailed component source code and metadata
- `get_item_examples_from_registries` — Find usage examples and demos with complete code
- `list_items_in_registries` — Browse all available components
- `get_add_command_for_items` — Get the exact CLI command to install components
- `get_audit_checklist` — Post-creation verification checklist

**Call before:**
- Using any shadcn component not personally confirmed to exist in `src/components/ui/`
- Choosing between `field` vs `form` — these changed between versions
- Using `input-otp`, `sidebar`, `calendar`, `chart`, `command` — APIs change frequently
- Installing any new component — confirm the name is valid first

**Workflow:**
1. Search for the component: `search_items_in_registries` with `@shadcn`
2. View its details: `view_items_in_registries` with `@shadcn/component-name`
3. Get examples: `get_item_examples_from_registries` with `component-demo`
4. Never guess — the answer is one MCP call away

---

## 3. Magic UI MCP — Animated Components

**Purpose**: Checks the Magic UI library for production-ready animated components before building from scratch.

**Available tools:**
- `searchRegistryItems` — Search by keyword or use case
- `getRegistryItem` — Get detailed component info, source code, and examples
- `listRegistryItems` — Browse all available components

**Call before building:**
- Hero sections with animated text or backgrounds
- Marquee / infinite scroll carousels
- Shimmer/glow button effects
- Number counting animations
- Word-by-word or letter-by-letter text reveals
- Device mockups (phone, browser, terminal frames)
- Bento grid layouts with animated cards
- Any "wow factor" visual component

**Workflow:**
1. Search: `searchRegistryItems` with the desired effect
2. Get details: `getRegistryItem` with `includeSource: true` and `includeExamples: true`
3. If found — use the provided JSX + install the exact dependency it specifies
4. If not found — build from scratch using the **react-animations** skill

---

## 4. Fetch MCP — Live URL Content

**Purpose**: Fetches live content from any URL — changelogs, migration guides, docs that Context7 doesn't cover.

**Call when:**
- User references a specific documentation URL
- Context7 has no results for a niche library
- Checking a library's CHANGELOG.md for breaking changes
- Verifying the current version of a package before installing

---

## Priority Order

```
1. Context7 MCP      → what does the library's current API say?
2. shadcn MCP        → does this component exist in the installed registry?
3. Magic UI MCP      → does this animated component already exist?
4. Fetch MCP         → is there a live doc URL to verify against?
```

### When to Use MCP vs Skills vs Training Memory

| Scenario | Source |
|----------|--------|
| Library API syntax, method signatures | **Context7** (always) |
| Component exists in registry? | **shadcn MCP** |
| Animated component ready to use? | **Magic UI MCP** |
| Live docs/changelog | **Fetch MCP** |
| Architectural patterns, design philosophy | **Skills** |
| HTML/CSS basics, TypeScript language | Training memory (OK) |
| Version-specific library code | **Context7** with version-specific query |

---

## MCP Failure Handling

If an MCP server is unavailable or returns an error:
1. **Do not proceed from memory.** State: "MCP server [name] is unavailable."
2. **Try alternative:** Context7 → Fetch MCP for docs URL → web search
3. **If no MCP works:** State the limitation to the user and ask whether to proceed with best-effort from training or to wait.
4. **Never silently fall back to training memory** when MCP was supposed to validate.