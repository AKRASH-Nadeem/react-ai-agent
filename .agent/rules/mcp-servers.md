---
trigger: always_on
---

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

**Search pattern**: `[library] [specific feature]`
Examples:
- `react tanstack query v5 optimistic updates`
- `tailwindcss v4 container queries`
- `shadcn form field validation`
- `zustand v5 slices pattern`

**Do not use for:** HTML/CSS fundamentals, TypeScript language features, general algorithmic questions.

---

## 2. shadcn MCP — Component Registry

**Purpose**: Confirms which components exist in the installed registry and retrieves current component API before writing code against it.

**Call before:**
- Using any shadcn component not personally confirmed to exist in `src/components/ui/`
- Choosing between `field` vs `form` — these changed between versions
- Using `input-otp`, `sidebar`, `calendar`, `chart`, `command` — APIs change frequently
- Installing any new component — confirm the name is valid first

**Workflow:**
1. `get-component field` — exists? Use Field family
2. `get-component form` — exists? Use Form family
3. Never guess — the answer is one MCP call away

---

## 3. Figma MCP — Design Spec

**Purpose**: Reads live Figma file structure — layers, spacing, typography, color tokens, component variants — for pixel-accurate code generation.

**Call when:**
- User provides a Figma file URL or link
- Building a component that should match a design spec
- Extracting spacing, color, or typography tokens
- Checking component variants before building

**What to extract:**
- Color styles → CSS HSL variables
- Text styles → type scale tokens
- Spacing → Tailwind spacing scale
- Component hierarchy → React component tree
- Auto-layout direction/spacing → Flexbox or Grid

---

## 4. Magic UI MCP — Animated Components

**Purpose**: Checks the Magic UI library for production-ready animated components before building from scratch.

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
1. Check if the component exists in Magic UI
2. If yes — use the provided JSX + install the exact dependency it specifies
3. If no — build from scratch using the **react-animations** skill

---

## 5. GitHub MCP — Codebase Context

**Purpose**: Reads existing project files and patterns before generating new code. Prevents pattern drift.

**Call when:**
- Generating a new component — check existing component patterns first
- Naming a hook or utility — check existing naming conventions
- Adding a new feature — find similar features to follow the same pattern
- Debugging an error — search for where the failing module is used elsewhere

---

## 6. Fetch MCP — Live URL Content

**Purpose**: Fetches live content from any URL — changelogs, migration guides, docs that Context7 doesn't cover.

**Call when:**
- User references a specific documentation URL
- Context7 has no results for a niche library
- Checking a library's CHANGELOG.md for breaking changes
- Verifying the current version of a package before installing

---

## Priority Order

```
1. GitHub MCP       → what does our codebase already do?
2. shadcn MCP       → does this component exist in the installed registry?
3. Context7 MCP     → what does the library's current API say?
4. Figma MCP        → what does the design spec require?
5. Magic UI MCP     → does this animated component already exist?
6. Fetch MCP        → is there a live doc URL to verify against?
```