---
trigger: always_on
---

# Skill Dispatcher — Mandatory Task Pre-Flight

> **THIS STEP IS NON-NEGOTIABLE.** Run it before Phase 0, before any reasoning, before writing
> a single line of code. Skipping it produces incomplete, non-compliant output.

---

## STEP 0 — Skill Selection (runs before everything else)

### 0.1 — Always load these two first (mandatory on every UI task)

```
READ: .agents/skills/react-tailwind/SKILL.md
READ: .agents/skills/react-shadcn/SKILL.md
```

### 0.2 — Scan the registry below. For every row where the task matches, READ that skill NOW.

| Skill file | Load when the task involves... |
|---|---|
| `.agents/skills/react-accessibility/SKILL.md` | WCAG, a11y, screen reader, focus trap, aria, keyboard navigation, reduced motion, axe, jest-axe |
| `.agents/skills/react-animations/SKILL.md` | animation, transition, motion, fade, slide, hover effect, skeleton, spinner, loader, parallax, stagger, scroll reveal |
| `.agents/skills/react-auth-lifecycle/SKILL.md` | login, logout, sign in, auth, protected route, JWT, access token, refresh token, session, RBAC, permission, Clerk |
| `.agents/skills/react-component-patterns/SKILL.md` | compound component, reusable component, too many props, prop drilling, render prop, headless component, polymorphic, slot |
| `.agents/skills/react-data-display/SKILL.md` | table, sorting, filtering, chart, bar chart, line chart, graph, visualization, virtual list, large dataset, empty state, date-fns |
| `.agents/skills/react-edge-case-testing/SKILL.md` | new feature implementation, write tests, edge case, failure scenario, what could go wrong, implement |
| `.agents/skills/react-error-handling/SKILL.md` | error, bug, broken, TypeError, cannot read, crash, not working, fix this, module not found, version mismatch, 401, 500, CORS |
| `.agents/skills/react-forms-advanced/SKILL.md` | multi-step form, wizard, stepper, OTP, PIN input, phone number input, currency input, tag input, drag and drop, auto-save |
| `.agents/skills/react-git-workflow/SKILL.md` | commit, git, pull request, PR, branch, merge, conventional commits, Husky, commitlint, changelog |
| `.agents/skills/react-modern-css/SKILL.md` | container query, @container, fluid typography, clamp(), RTL, scroll snap, glassmorphism, backdrop blur, :has(), CSS nesting |
| `.agents/skills/react-performance/SKILL.md` | performance, Core Web Vitals, LCP, INP, CLS, bundle size, lazy loading, Lighthouse, Sentry, image optimization |
| `.agents/skills/react-realtime/SKILL.md` | WebSocket, SSE, Server-Sent Events, real-time, live, chat, streaming, EventSource, reconnect, exponential backoff |
| `.agents/skills/react-rest-advanced/SKILL.md` | token refresh, 401 interceptor, optimistic update, infinite scroll, file upload, upload progress, debounced search, retry |
| `.agents/skills/react-security/SKILL.md` | XSS, dangerouslySetInnerHTML, CSP, Content Security Policy, API key, secret management, clipboard, user-generated content |
| `.agents/skills/react-storage-utilities/SKILL.md` | localStorage, sessionStorage, persist, dark mode persistence, countdown timer, download file, CSV export, keyboard shortcut, Web Share API |
| `.agents/skills/react-testing/SKILL.md` | test, Vitest, Testing Library, MSW, Playwright, coverage, unit test, integration test, E2E |
| `.agents/skills/react-troubleshooting/SKILL.md` | not working, weird behavior, useEffect running twice, stale closure, too many re-renders, hydration error, white screen, layout shift |
| `.agents/skills/ux-interaction/SKILL.md` | user flow, onboarding, empty state, navigation, information architecture, modal, toast, confirmation, dashboard layout, UX review |

### 0.3 — Announce loaded skills before proceeding

After reading, state on one line:

```
Active skills: react-tailwind + react-shadcn + [any others loaded]
```

Then proceed to Phase 0 of the reasoning protocol.

---

## Why this step exists

Skills are not loaded by the platform automatically — **you** are the dispatcher.
The `description` fields in each skill's YAML are the matching criteria.
This registry is the compact, scannable version of those descriptions.

A task that proceeds without the right skills loaded will:
- Miss version-specific API patterns (Context7 check in skill)
- Produce components that skip required states (loading/error/empty)
- Generate code that doesn't follow established project patterns
- Fail the validation gates in `core.md` §23

**The 5-second scan of this table is the cheapest insurance in the entire pipeline.**
