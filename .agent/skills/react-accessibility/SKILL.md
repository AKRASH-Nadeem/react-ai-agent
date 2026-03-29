---
name: react-accessibility
description: |
  Use when the project targets WCAG 2.2 compliance, custom interactive widgets,
  or requires advanced screen reader support. Trigger on:
  "WCAG", "a11y", "accessibility audit", "screen reader",
  "focus trap", "focus management", "skip navigation", "skip link",
  "aria-live", "live region", "announce", "screen reader announcement",
  "keyboard navigation", "arrow key navigation", "roving tabindex",
  "axe", "automated accessibility", "jest-axe",
  "prefers-reduced-motion", "reduced motion",
  accessibility for charts, drag-and-drop, data tables, or custom widgets.
---
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Advanced Accessibility Standards

## A11Y1. `prefers-reduced-motion` — Non-Negotiable

Every animation without this protection is a WCAG 2.2 violation.

```css
/* globals.css — required on every project with animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

See the **react-animations** skill A2 for full implementation with Tailwind `motion-reduce:` variants and `useReducedMotion()`.

---





## A11Y2. Focus Trap in Custom Modals

shadcn Dialog handles focus trap automatically via Radix UI. For custom modals, use `focus-trap-react`:

```bash
npm install focus-trap-react
```

```tsx
import FocusTrap from "focus-trap-react";

export function CustomModal({ isOpen, onClose, children }: CustomModalProps) {
  return isOpen ? (
    <FocusTrap focusTrapOptions={{ onDeactivate: onClose, escapeDeactivates: true }}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {children}
      </div>
    </FocusTrap>
  ) : null;
}
```

When modal closes, focus must return to the element that triggered it:

```tsx
export function useModalFocusRestore() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const open = () => { triggerRef.current = document.activeElement as HTMLElement; };
  const close = () => { triggerRef.current?.focus(); triggerRef.current = null; };
  return { open, close };
}
```

---

## A11Y3. Skip Navigation Link

```tsx
// layouts/AppShell.tsx — add as first child of body
export function SkipNavLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  );
}

// In the page layout
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

---

## A11Y4. `useAnnounce` Hook — Screen Reader Announcements

```ts
// hooks/useAnnounce.ts
export function useAnnounce() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const el = document.getElementById(`aria-live-${priority}`);
    if (!el) return;
    el.textContent = "";
    requestAnimationFrame(() => { el.textContent = message; });
  }, []);

  return announce;
}
```

```tsx
// layouts/AppShell.tsx — add these hidden elements once to the root
<div id="aria-live-polite"    aria-live="polite"    aria-atomic="true" className="sr-only" />
<div id="aria-live-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
```

```tsx
// Usage: announce loading states, mutations, errors
const announce = useAnnounce();
useMutation({
  mutationFn: saveProfile,
  onSuccess: () => { announce("Profile saved successfully."); },
  onError: ()   => { announce("Failed to save profile. Please try again.", "assertive"); },
});
```

---

## A11Y5. Loading State Announcements

```tsx
// Announce query loading states to screen readers
const { isLoading, isError, data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

return (
  <section aria-busy={isLoading} aria-label="Users list">
    {isLoading && <span className="sr-only">Loading users…</span>}
    {isError  && <ErrorState description="Failed to load users." />}
    {data     && data.length === 0 && <EmptyState ... />}
    {data     && <UserList users={data} />}
  </section>
);
```

---

## A11Y6. Accessible Data Tables

```tsx
<table aria-label="User list" aria-rowcount={totalRows}>
  <thead>
    <tr>
      <th scope="col"
        aria-sort={sorting[0]?.id === "name" ? (sorting[0].desc ? "descending" : "ascending") : "none"}
      >
        <button onClick={() => column.toggleSorting()}>
          Name
          {sorting[0]?.id === "name" && <ArrowUpDown className="size-4 ms-1" aria-hidden="true" />}
        </button>
      </th>
    </tr>
  </thead>
  <tbody>
    {rows.map((row) => (
      <tr key={row.id} aria-rowindex={row.index + 1}>
        <td>{row.original.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## A11Y7. Drag and Drop — Keyboard + Announcements

Always include `KeyboardSensor` in dnd-kit — see the **react-forms-advanced** skill AF6 for the full setup. Additionally, announce state changes to screen readers:

```tsx
const [announcement, setAnnouncement] = useState("");

// In DndContext:
accessibility={{
  announcements: {
    onDragStart: ({ active }) => `Picked up ${active.data.current?.title}. Use arrow keys to move.`,
    onDragOver:  ({ active, over }) => over ? `Moving ${active.data.current?.title} before ${over.data.current?.title}.` : undefined,
    onDragEnd:   ({ active, over }) => over ? `Dropped ${active.data.current?.title} in new position.` : `Cancelled.`,
    onDragCancel: () => "Drag cancelled.",
  },
  screenReaderInstructions: {
    draggable: "To pick up a draggable item, press space. While dragging, use arrow keys to move the item. Press space again to drop.",
  },
}}
```

---

## A11Y8. Roving Tabindex

For widget groups where arrow keys navigate between items (toolbar, radio group, tab list):

```tsx
export function useRovingTabIndex(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % itemCount);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + itemCount) % itemCount);
    }
    if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); }
    if (e.key === "End")  { e.preventDefault(); setActiveIndex(itemCount - 1); }
  };

  const getTabIndex = (index: number) => index === activeIndex ? 0 : -1;

  return { activeIndex, handleKeyDown, getTabIndex };
}
```

---

## A11Y9. Automated Testing with jest-axe

Run `jest-axe` on every shared component:

```bash
npm install --save-dev jest-axe @types/jest-axe
```

```tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

describe("Button", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Button onClick={() => {}}>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## WCAG 2.2 Compliance Reference

| Criterion | What it requires |
|-----------|-----------------|
| 1.1.1 Non-text Content | All `<img>` have `alt`. Decorative images have `alt=""`. |
| 1.4.3 Contrast | Minimum 4.5:1 for normal text, 3:1 for large text. |
| 1.4.4 Resize Text | UI must work at 200% zoom with no horizontal scroll. |
| 1.4.11 Non-text Contrast | UI components (buttons, inputs) have 3:1 contrast. |
| 2.1.1 Keyboard | All functionality available via keyboard. |
| 2.4.3 Focus Order | Focus order is logical and matches visual order. |
| 2.4.7 Focus Visible | Focus indicator is always visible. |
| 2.5.3 Label in Name | Button labels include their visible text. |
| 3.2.1 On Focus | Focus does not trigger context changes. |
| 4.1.3 Status Messages | Status updates announced via `aria-live` regions. |

---

## Summary Cheatsheet — Accessibility

| Concern | Standard |
|---------|----------|
| Reduced motion | Global CSS + `motion-reduce:` + `useReducedMotion()` |
| Custom modal focus | `focus-trap-react` + focus restore on close |
| Skip link | `<SkipNavLink>` as first element in layout |
| Screen reader announces | `useAnnounce()` + two `aria-live` regions in root |
| Loading states | `aria-busy` + `sr-only` loading text |
| Sortable tables | `aria-sort` on column headers |
| DnD keyboard | `KeyboardSensor` (required) + `accessibility.announcements` |
| Widget navigation | Roving tabindex via `useRovingTabIndex` |
| Automated testing | `jest-axe` on every shared component |
