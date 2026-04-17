---
name: ux-interaction
description: |
  LOAD AUTOMATICALLY for: user flow, onboarding, empty state, loading state, error state,
  navigation, information architecture, IA, site map, page structure, user journey,
  UX, interaction design, affordance, feedback, confirmation, dialog, modal, toast,
  notification, alert, progressive disclosure, cognitive load, mental model,
  form UX, form UX layer, wizard, multi-step, stepper, search UX, filter UX, pagination UX,
  infinite scroll decision, dashboard layout, data density, table UX, card vs table,
  settings page, profile page, landing page flow, mobile UX, touch interaction, gesture,
  destructive action, undo, optimistic UI, skeleton, tooltip, popover, contextual help,
  feels confusing, where to go, makes no sense, UX review.
  Load when building any user-facing interface or reviewing interactions.
---

> **Scope of this skill:** UX reasoning, interaction patterns, information architecture, and feedback design. Visual implementation → `design-philosophy.md`. Accessibility implementation → `react-accessibility`. Animation mechanics → `react-animations`. Form validation → `react-forms-advanced`.

---

# UX & Interaction Design Standards

---

## UX0. UX-First Workflow

Answer all four before writing a single component:

1. **User goal** — What is the user trying to accomplish? State it as a verb: "find", "purchase", "configure", "recover". Not "view the dashboard".
2. **Path** — What is the shortest sequence of decisions/actions to reach that goal? Every extra step is friction to justify.
3. **Failure modes** — What happens when things go wrong? Empty data, slow network, permission errors, invalid input. Design these before the happy path.
4. **Mental model** — What does the user expect this to work like, based on things they already know? Match it or deliberately break it with clear signposting.

**Never design the success state in isolation.** A UI with a perfect happy path and a broken empty state is a broken UI.

---

## UX1. Information Architecture

### UX1.1 Hierarchy Rules

Every screen has exactly one primary action. Supporting actions are secondary. Destructive actions are tertiary and visually separated.

| Action tier | Visual treatment | Placement |
|---|---|---|
| Primary | Filled button, high contrast | Top-right of content area, or bottom of form |
| Secondary | Outlined or ghost button | Adjacent to primary, lower visual weight |
| Tertiary / Destructive | Ghost or text button, `destructive` variant | Separated by space or divider — never adjacent to primary |
| Global navigation | Persistent sidebar or top nav | Never in-content |

**One H1 per page.** It states what the page is, not what the user should do. The CTA tells the user what to do.

### UX1.2 Navigation Depth

| Depth | Pattern | Max items |
|---|---|---|
| Flat (1 level) | Top nav or icon sidebar | 5–7 items |
| Two-level | Sidebar with nested groups | 4 groups × 5 items |
| Three-level | Sidebar + breadcrumbs | Only for content-heavy apps (docs, CMS) |
| Four+ levels | ❌ Redesign the IA | — |

Never exceed 3 levels of navigation depth. If the content requires it, the IA needs to be restructured — split into separate domains, not deeper nesting.

### UX1.3 Grouping Principle

Group by **user task**, not by technical category. A settings page organized as "Authentication", "Database", "Caching" is organized for engineers. The same settings organized as "Account & Security", "Connections", "Performance" is organized for users.

Pushback script:
> *"This grouping mirrors the technical architecture — users don't think about [authentication/database/etc.] as categories. They think in terms of what they're trying to do. I'd restructure this as [task-oriented groups]. Want me to proceed with that?"*

---

## UX2. Cognitive Load

### UX2.1 The 7±2 Rule (Applied)

Never present more than 7 independent choices in a single view without grouping. This applies to:
- Navigation items
- Filter options
- Table columns
- Form fields on one screen
- Actions in a dropdown

If you count more than 7: group, collapse, or paginate. If forced to exceed 9: the design needs restructuring, not "just one more item".

### UX2.2 Progressive Disclosure

Show only what the user needs at the current step. Reveal complexity on demand.

**Decision table — when to hide vs show:**

| Condition | Pattern |
|---|---|
| Feature used by <20% of users | Collapse behind "Advanced" / "More options" |
| Secondary action available after primary | Reveal on hover or in overflow menu |
| Detail only relevant after choosing an option | Conditional reveal (show field only when X is selected) |
| Settings that rarely change | Separate settings page, not inline |
| Error detail the user can't act on | Collapse behind "Details" — show the recovery action first |

Implementation pattern for conditional reveal:
```tsx
// Show field only when relevant — never unmount, just visually hide
// Unmounting loses validation state and causes layout shift
<div className={cn("space-y-4", !showAdvanced && "hidden")}>
  {/* advanced fields */}
</div>
<button
  type="button"
  onClick={() => setShowAdvanced(v => !v)}
  className="text-sm text-muted-foreground flex items-center gap-1"
>
  <ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
  {showAdvanced ? "Hide advanced" : "Show advanced options"}
</button>
```

### UX2.3 Decision Fatigue Prevention

When a user must make many choices in sequence (e.g. onboarding wizard, configuration flow):
- Default every optional field to the most common choice
- Batch related decisions into one step — don't make the user click "Next" for every single field
- Show progress — users abandon flows with no visible endpoint
- Allow skipping optional steps — never block completion on non-critical choices

**Banned pattern — "forced completeness":**
> Requiring users to fill out every optional field before proceeding.

Pushback script:
> *"Forcing completion of optional fields before the user can proceed will cause abandonment at this step. I'd mark these as optional and allow skipping — you can prompt for them later in the experience when the user has more context. Want me to restructure the flow?"*

---

## UX3. Feedback & System Status

The user must always know: **what happened, what is happening, what will happen next.**

### UX3.1 Feedback Timing

| Latency | User perception | Required feedback |
|---|---|---|
| 0–100ms | Instant | Visual state change (hover, active press) |
| 100–300ms | Slight lag | Button disabled state + spinner after 150ms |
| 300ms–1s | Noticeable | Full loading indicator |
| 1s–3s | Slow | Skeleton screen OR progress indicator |
| 3s+ | Very slow | Progress indicator + estimated time if possible |

**The 150ms spinner rule** — never show a spinner immediately. A spinner that flashes for 80ms is more disorienting than no spinner. Use a delay:
```tsx
// Show spinner only after 150ms — prevents flash on fast responses
const [showSpinner, setShowSpinner] = useState(false);
useEffect(() => {
  if (!isPending) { setShowSpinner(false); return; }
  const id = setTimeout(() => setShowSpinner(true), 150);
  return () => clearTimeout(id);
}, [isPending]);
```

### UX3.2 Skeleton vs Spinner — Decision Rule

| Use skeleton | Use spinner |
|---|---|
| Loading content that will occupy a defined space (card, list, table row) | Loading triggered by a user action (form submit, button click) |
| Page-level content load | Inline action (toggling, saving a field) |
| List of items loading | Global blocking operation |

Skeletons must mirror the exact layout of the loaded content. A skeleton with 2 rows for a list that loads 8 rows is worse than a generic spinner.

### UX3.3 Toast vs Inline vs Modal — Decision Table

| Situation | Pattern | Rationale |
|---|---|---|
| Action succeeded, no further input needed | Toast (auto-dismiss 4s) | Non-blocking, glanceable |
| Action succeeded AND has a follow-up action | Toast with action button | "Item deleted · Undo" |
| Action failed, user can retry immediately | Inline error near the action | Contextual — don't force the user to re-find the field |
| Action failed, requires explanation | Inline error + help link | Toast too brief for instructions |
| Action requires confirmation before proceeding | Modal or Destructive dialog | Never toast for confirmations |
| System status change unrelated to user action | Banner (persistent) or Toast | Banner if it affects the whole session |
| Validation error on a form field | Inline below the field | Never a toast for field-level errors |

**Banned patterns:**
- ❌ Toast for form validation errors
- ❌ Modal for success states that need no action
- ❌ Auto-dismissing toasts for destructive actions ("File deleted" should have an Undo or stay visible)
- ❌ Multiple simultaneous toasts (stack max 3, queue the rest)

### UX3.4 Optimistic UI

Apply optimistic updates when:
- The action has >99% success rate under normal conditions
- The rollback is clean and unambiguous
- The action is reversible

Do NOT apply optimistic updates when:
- The action is irreversible (deletion, financial transaction, send email)
- Success depends on external systems you don't control
- Failure requires user input to resolve

```tsx
// Optimistic pattern with TanStack Query
const deleteMutation = useMutation({
  mutationFn: deleteItem,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['items'] });
    const previous = queryClient.getQueryData(['items']);
    queryClient.setQueryData(['items'], (old: Item[]) =>
      old.filter(item => item.id !== id)
    );
    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(['items'], context?.previous);
    toast.error("Couldn't delete item. It's been restored.");
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
});
```

---

## UX4. Empty States

Every list, table, and data view has three states that must be designed before the happy path: **empty (no data)**, **zero results (search/filter returned nothing)**, and **error**. These are not the same.

| State | Cause | Required elements |
|---|---|---|
| Empty (first use) | No data created yet | Illustration or icon + explanation + primary action |
| Empty (filtered) | Filter/search returned nothing | Explanation of why + clear filter action |
| Empty (no permission) | User can't see the data | Explanation + upgrade/request access action |
| Error | Network/server failure | Error message + retry action + support link if persistent |

**Empty state anatomy:**
```tsx
// Every empty state follows this structure
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="size-12 text-muted-foreground/40 mb-4" />       {/* icon: what's missing */}
  <h3 className="text-base font-medium mb-1">No {entity} yet</h3>   {/* state: what's empty */}
  <p className="text-sm text-muted-foreground mb-6 max-w-[280px]"> {/* why + what to do */}
    {explanation}
  </p>
  <Button onClick={primaryAction}>{actionLabel}</Button>            {/* one action only */}
</div>
```

**Never:**
- Show a blank area with no explanation
- Use generic messages like "No data found" or "Nothing here"
- Show multiple CTAs in an empty state — one primary action only
- Use the same empty state for "no data" and "filtered to zero results"

---

## UX5. Destructive Actions & Confirmation Patterns

### UX5.1 Confirmation Decision Matrix

| Action severity | Recovery possible? | Pattern |
|---|---|---|
| Low (e.g. archive, hide) | Yes, easily | Optimistic + undo toast |
| Medium (e.g. remove from list) | Yes, with effort | Confirmation popover inline |
| High (e.g. permanent delete) | No | Modal dialog with typed confirmation |
| Critical (e.g. delete account, irreversible bulk action) | No | Modal + type the name of the thing |

**Pushback on over-confirming:**
> *"A confirmation modal for [low-severity action] adds friction without safety benefit — users will click through it without reading it (confirmation fatigue). Optimistic UI with an Undo toast is safer and faster. Want me to implement that instead?"*

**Pushback on under-confirming:**
> *"[Action] is irreversible. An optimistic delete here would leave the user with no recovery path. I'd add a confirmation dialog before proceeding — the extra click is justified by the severity."*

### UX5.2 Confirmation Dialog Structure

```tsx
// Destructive action modal — structure is non-negotiable
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>       {/* specific, not "Are you sure?" */}
      <AlertDialogDescription>
        This will permanently delete {itemName} and all associated   {/* say exactly what is lost */}
        data. This cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    {/* For critical actions: require typing the name */}
    {isCritical && (
      <Input
        placeholder={`Type "${itemName}" to confirm`}
        onChange={e => setConfirmText(e.target.value)}
      />
    )}
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>                 {/* always left / first */}
      <AlertDialogAction                                            {/* always right / last */}
        className="bg-destructive hover:bg-destructive/90"
        disabled={isCritical && confirmText !== itemName}
      >
        Delete {itemName}                                           {/* repeat what is being deleted */}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Banned patterns:**
- ❌ "Are you sure?" as dialog title — it's meaningless
- ❌ Destructive button on the left or as the default action
- ❌ Enter key submitting a destructive dialog
- ❌ Autofocus on the destructive button

---

## UX6. Form UX (Beyond Validation)

This section covers the UX layer of forms — field order, labels, hints, error messaging tone. For validation implementation → `react-forms-advanced`.

### UX6.1 Field Order

Order fields by cognitive sequence, not database schema order. The user should never have to jump back.

**Standard ordering:**
1. Identity fields (name, email) before contact fields (phone, address)
2. Required fields before optional fields within a group
3. Free-text before constrained choices (type your city, then pick your country — not the reverse)
4. High-confidence answers before low-confidence (email before "How did you hear about us")

### UX6.2 Label & Hint Writing

| Element | Rule | Example |
|---|---|---|
| Label | Noun, not a question. Never a placeholder. | "Email address" not "Enter your email" |
| Placeholder | Format example only, disappears on focus | "you@example.com" |
| Hint text | When and why, not what | "Used to send your receipt" not "Enter a valid email" |
| Error message | What went wrong + how to fix | "Email already in use — try signing in instead" not "Invalid email" |
| Required indicator | `*` with legend, not just color | Never rely on color alone for required status |

**Banned label patterns:**
- ❌ Placeholder-as-label (field becomes unlabeled once user starts typing)
- ❌ Vague errors like "Invalid input", "Error", "Required"
- ❌ Technical jargon in error messages ("422 Unprocessable Entity")
- ❌ Apologetic errors ("Sorry, that didn't work") — be direct and actionable

Error message formula: **[What failed]** — **[Why]** — **[How to fix]**
> "Couldn't save changes — you're offline. Reconnect and try again."

### UX6.3 Multi-Step Form / Wizard UX

- Show step count and current position always: "Step 2 of 4"
- Allow backward navigation without losing filled data
- Validate on "Next", not on every keystroke for wizard steps
- Name each step — "Account", "Plan", "Payment", "Review" — not "Step 1", "Step 2"
- Show a summary on the final step before submission
- Never put more than 5–7 fields per step
- The final CTA must state exactly what will happen: "Start free trial", not "Continue"

---

## UX7. Navigation & Wayfinding

### UX7.1 Active State Rules

The user always knows where they are. Every navigation item has an unambiguous active state — not just bold text, but a visual anchor (background, border, or indicator).

```tsx
// Always use aria-current alongside visual state
<NavLink
  to={href}
  className={({ isActive }) => cn(
    "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
    isActive
      ? "bg-primary/10 text-primary font-medium"        // visual active state
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  )}
  aria-current={isActive ? "page" : undefined}           // semantic active state
>
```

### UX7.2 Breadcrumbs — When to Use

| Use breadcrumbs | Skip breadcrumbs |
|---|---|
| 3+ levels of navigation depth | Flat nav (1–2 levels) |
| Content pages user navigated to | Wizard/flow steps (use step indicator instead) |
| Search result → detail view | Modal or overlay content |

### UX7.3 Search UX

- Search input must show results as the user types (debounced, 300ms) if the dataset is <10k items
- Always show result count: "12 results" or "No results for 'xyz'"
- Highlight matching terms in results
- Persist the search query in the URL (`?q=`)  → `nuqs` per `core.md §10`
- Empty search state ≠ "no results" state — one shows all items, one shows zero

### UX7.4 Pagination vs Infinite Scroll — Decision Rule

| Use pagination | Use infinite scroll |
|---|---|
| User needs to reach a specific page / item | User is browsing/discovering |
| Items have a meaningful order user tracks | Order is feed-like (newest first) |
| User needs to share a specific position | Deep links not required |
| Table or structured data | Card or image grid |
| Any admin interface | Social feed, activity log |

**Never use infinite scroll in admin interfaces or anywhere the user needs to return to a specific item.** Losing scroll position on navigation is a UX failure.

---

## UX8. Onboarding & First-Use Patterns

### UX8.1 Onboarding Strategy Decision

| User type | Strategy |
|---|---|
| Simple product, obvious value | No onboarding — land on the core feature |
| Product with setup required before value | Checklist (persistent, dismissible) |
| Complex product, many features | Progressive tooltip tour (max 5 steps) |
| B2B with role-specific flows | Role-selection → tailored checklist |
| Product where empty state blocks value | Wizard (mandatory, minimal steps) |

**Banned onboarding patterns:**
- ❌ Full-screen modal tour on first login — blocks the user from seeing the product
- ❌ Non-dismissible onboarding — always provide an "I'll figure it out" escape
- ❌ Onboarding that restarts on every login
- ❌ More than 5 steps in a tooltip tour

### UX8.2 Onboarding Checklist Pattern

```tsx
// Persistent progress checklist — shows value of completion
<Card className="p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-medium">Get started · {completed}/{total}</h3>
    <Progress value={(completed / total) * 100} className="w-24 h-1.5" />
  </div>
  <div className="space-y-2">
    {steps.map(step => (
      <button key={step.id} onClick={step.action}
        className="flex items-center gap-3 w-full text-left text-sm py-1 hover:text-foreground">
        {step.completed
          ? <CheckCircle2 className="size-4 text-green-600 shrink-0" />
          : <Circle className="size-4 text-muted-foreground shrink-0" />}
        <span className={step.completed ? "line-through text-muted-foreground" : ""}>
          {step.label}
        </span>
      </button>
    ))}
  </div>
</Card>
```

---

## UX9. Interaction Affordances

### UX9.1 Cursor & Touch Targets

Every interactive element communicates its interactivity:
- Clickable → `cursor-pointer`
- Disabled → `cursor-not-allowed` + `opacity-50` + `aria-disabled`
- Text selectable → default cursor (never add `cursor-pointer` to non-interactive text)
- Draggable → `cursor-grab` / `cursor-grabbing`
- Resizable → appropriate resize cursor

Touch targets: minimum 44×44px (`min-h-11 min-w-11`). For icon-only buttons, the visible icon can be smaller (16–20px) but the clickable area must be padded to 44px.

```tsx
// Icon button — small visual, full touch target
<button
  aria-label="Delete item"
  className="flex items-center justify-center size-11 rounded hover:bg-muted -m-1.5"  
  // size-11 = 44px, negative margin so it doesn't push layout
>
  <Trash2 className="size-4 text-muted-foreground" />
</button>
```

### UX9.2 Hover vs Click — When to Reveal

| Pattern | Use for |
|---|---|
| Reveal on hover | Secondary actions on list items (edit, delete buttons on table rows) |
| Always visible | Primary actions, actions users need to discover, touch-first interfaces |
| Reveal in overflow menu (⋮) | 3+ secondary actions, or when space is constrained |
| Reveal on long press (mobile) | Context actions — never primary actions |

**Never hide primary actions on hover.** Users on touch devices can't hover.

**Hover reveal implementation:**
```tsx
<tr className="group">
  <td>{item.name}</td>
  <td className="text-right">
    {/* visible on hover only — always visible on mobile */}
    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="ghost" size="sm">Delete</Button>
    </div>
  </td>
</tr>
```

Note `focus-within:opacity-100` — keyboard users can't hover, so the actions must appear on focus.

### UX9.3 Tooltip Rules

Tooltips clarify — they do not compensate for bad labels.

**Use tooltip for:**
- Keyboard shortcuts ("⌘K")
- Truncated text (show full value on hover)
- Icon-only buttons (label the icon)
- Supplemental context that would clutter the UI if always visible

**Do NOT use tooltip for:**
- Primary instruction (the user shouldn't need to hover to know what a button does)
- Error messages (must be always visible)
- Required information to complete a task

```tsx
// Tooltip on icon-only button
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Copy to clipboard">
        <Copy className="size-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Copy to clipboard <kbd>⌘C</kbd></TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## UX10. Mobile & Touch Interaction

### UX10.1 Touch-First Rules

When building for mobile or responsive interfaces:
- **Thumb zone** — primary actions in the bottom 60% of the screen (reachable with one thumb). Navigation and back buttons at the top are a mobile anti-pattern for primary actions.
- **Swipe gestures** — only for supplemental actions (swipe to delete, swipe to archive). Never the only way to perform an action.
- **Pull to refresh** — acceptable for feed-like content. Always provide a manual refresh button as an alternative.
- **Bottom sheet over modal** — for contextual actions on mobile, a bottom sheet (`vaul` or shadcn drawer) is more thumb-friendly than a centered modal.

### UX10.2 Responsive Interaction Patterns

| Desktop pattern | Mobile equivalent |
|---|---|
| Hover to reveal actions | Always-visible actions or tap to expand |
| Dropdown menu | Bottom sheet or full-screen picker |
| Multi-column form | Single-column, stacked |
| Sidebar navigation | Bottom tab bar (≤5 items) or hamburger menu |
| Right-click context menu | Long press or overflow (⋮) button |
| Tooltip on hover | Tap to reveal / inline always-visible hint |

---

## UX11. Content Hierarchy & Data Density

### UX11.1 Card vs Table Decision

| Use cards | Use a table |
|---|---|
| Items have different structures or visual identities | Items are uniform rows of comparable data |
| User browses/discovers | User searches/filters/compares |
| Primary interaction is "open item" | Primary interaction is "select, sort, filter" |
| Mobile-first | Data-dense admin/dashboard |
| ≤20 items typically visible | Potentially 100s of rows |

### UX11.2 Data Density Levels

Match density to user context. Never use comfortable spacing in a power-user dashboard:

| Level | Use for | Row height | Font size |
|---|---|---|---|
| Compact | Admin tables, data grids, code editors | 32–36px | 12–13px |
| Default | Standard product UI, mixed audiences | 40–48px | 14px |
| Comfortable | Marketing pages, consumer apps, onboarding | 56px+ | 15–16px |

Provide a density toggle in data-heavy interfaces. Power users need compact; new users need comfortable.

### UX11.3 Truncation Rules

| Content type | Truncation behaviour |
|---|---|
| Name / title | End-truncate with ellipsis + tooltip showing full value |
| Description / body | Clamp to N lines (`line-clamp-2`) + "Read more" |
| URL | Middle-truncate (`abc...xyz`) — beginning and end are meaningful |
| Number | **Never truncate** — round or use K/M/B suffix |
| Code | Horizontal scroll — never truncate |

```tsx
// End-truncate with full value in tooltip
<Tooltip>
  <TooltipTrigger asChild>
    <span className="truncate max-w-[200px] block">{name}</span>
  </TooltipTrigger>
  <TooltipContent>{name}</TooltipContent>
</Tooltip>
```

---

## UX12. Anti-Patterns (Non-Negotiable Bans)

These patterns damage UX measurably. When a user request requires one, use the pushback protocol below.

### UX12.1 Banned Interaction Patterns

| Pattern | Why banned | Alternative |
|---|---|---|
| Hover-only actions on mobile | Touch users can't hover | Always-visible or tap-to-reveal |
| Autoplaying video/audio | Hijacks the user's context | Play on click only |
| Confirmation modal for every action | Confirmation fatigue → ignored | Undo pattern for reversible actions |
| "Are you sure?" as dialog title | Meaningless — tells user nothing | State specifically what will happen |
| Required fields without `*` legend | Ambiguity | Mark and explain required fields |
| Disable submit until form is valid | User doesn't know why they can't proceed | Show errors on submit, not on disable |
| Inline error that only appears on blur | User doesn't know field is wrong while typing | Validate on blur, but re-validate live after first error |
| Redirect after login to `/dashboard` always | Breaks deep linking | Redirect to intended URL (store pre-auth destination) |
| Infinite scroll with no position persistence | User loses place on back navigation | Store scroll position or use pagination |
| Multi-select with checkboxes that look like radio buttons | Visual lie about behavior | Round = single select, Square = multi-select. Always. |

### UX12.2 Pushback Protocol

When a user requests a banned pattern:

1. **Decline** — one sentence: "That pattern is on the UX anti-pattern list."
2. **Explain** — one sentence on why it damages UX.
3. **Propose alternative** — specific replacement that achieves the user's actual goal.

> *"[Pattern] is a UX anti-pattern — it [specific harm]. The standard approach for this use case is [alternative], which achieves [user's goal] without the cost. Should I build that instead?"*

---

## UX13. UX Review Checklist

Run before marking any UI task complete:

**Flow**
- [ ] Does every screen have exactly one primary action?
- [ ] Is the navigation depth ≤ 3 levels?
- [ ] Can the user recover from every error without losing their work?
- [ ] Are all post-login deep links preserved?

**States**
- [ ] Empty state designed and implemented (not just happy path)?
- [ ] Zero-results state distinct from empty state?
- [ ] Loading state uses skeleton (content) or spinner (action) correctly?
- [ ] Error state has a recovery action — not just a message?

**Feedback**
- [ ] Spinner delayed 150ms (no flash)?
- [ ] Toast vs inline error used correctly per UX3.3?
- [ ] Destructive actions confirmed at appropriate level per UX5.1?
- [ ] Optimistic UI only applied to reversible actions?

**Forms**
- [ ] Fields ordered by cognitive sequence, not schema order?
- [ ] Error messages state what failed + how to fix?
- [ ] No placeholder-as-label?
- [ ] Required fields marked with `*` and legend?

**Navigation**
- [ ] Active state visible and unambiguous on every nav item?
- [ ] Breadcrumbs present for 3+ level depth?
- [ ] Search preserves query in URL?

**Mobile**
- [ ] Primary actions reachable in thumb zone?
- [ ] No hover-only actions?
- [ ] Touch targets ≥ 44×44px?

**Density & Hierarchy**
- [ ] Card vs table chosen by UX11.1 criteria?
- [ ] Data density appropriate for user context?
- [ ] Truncated content has tooltip showing full value?