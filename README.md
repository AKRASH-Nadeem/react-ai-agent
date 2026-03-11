# Antigravity Agent Skill Repository

A curated collection of specialized agent instructions, development standards, and modular skills designed for building high-performance, premium React TypeScript applications.

## 🚀 Model Compatibility

This repository is optimized for high-reasoning and agentic AI models.

| Model | Result | Notes |
|---|---|---|
| **Claude 3.5 Sonnet / 3.7 Sonnet (Thinking)** | ✅ **Best** | Exceptional adherence to complex design mandates and multi-step workflows. |
| **Gemini 2.0 Flash / 3 Flash** | ✅ **Best** | Fast, accurate execution of specialized skills and MCP-driven tasks. |
| **Gemini 1.5 Pro / 3.1 Pro (High)** | ⚠️ **Mediocre** | May struggle with strict enforcement of anti-generic design rules or complex state machine logic. |

> [!NOTE]
> This repository has currently only been tested with the models listed above. Results with other models (e.g., GPT-4o, Llama 3) may vary and aren't officially supported yet.

---

## 📂 Repository Structure

The intelligence is split into two primary layers:

### 1. `.agent/rules/` (Global Mandates)
Foundational standards that apply to every interaction.
- **core.md**: The "Constitution". Defines language, structure, component patterns, and mandatory verification protocols.
- **design-philosophy.md**: Non-negotiable aesthetic standards. Includes the "Anti-Generic Rules" to prevent template-like UIs.
- **mcp-servers.md**: Rules for utilizing Model Context Protocol (MCP) servers (Context7, shadcn, Figma, etc.).
- **versions.lock.md**: The source of truth for package versions to prevent API drift.

### 2. `.agent/skills/` (Specialized Capabilities)
Modular instruction sets that activate based on the specific task.
- `react-tailwind` & `react-shadcn`: Mandatory baseline for all UI tasks.
- `react-animations`: orchestrating complex motion via `motion`.
- `react-forms-advanced`: Wizards, OTPs, and complex validation.
- `react-data-display`: Virtualized lists and TanStack Table patterns.
- `react-error-handling`: Diagnostic protocols for React/TS errors.
- ... and many others for Routing, Auth, Performance, and Testing.

---

## 🛠 Usage Guidelines

### For Agents
1. **Load Core Rules**: Always read `.agent/rules/core.md` first.
2. **Contextual Activation**: Detect intent (e.g., "add a chart") and load the relevant skill (e.g., `react-data-display`).
3. **MCP Priority**: Never trust training memory for libraries. Always call `Context7` or relevant MCP servers for live documentation.
4. **Verification**: After every code write, execute the **Import Verification Protocol** defined in `core.md`.

### For Developers
- **Design-First**: Every UI task must answer: Purpose, Tone, Differentiator, and Constraints.
- **Anti-Generic**: Do not use "safe" SaaS palettes or overused fonts like Inter/Roboto.
- **Strict TS**: No `any`, no non-null assertions without comments, and mandatory path aliases.

---

## 💎 Design Mandate
We don't build MVPs; we build memorable experiences. Every component must Orient, Confirm, Guide, or Express. If it looks like a template, it's a failure.
