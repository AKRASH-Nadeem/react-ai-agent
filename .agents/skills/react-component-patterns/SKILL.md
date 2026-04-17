---
name: react-component-patterns
description: |
  LOAD AUTOMATICALLY for: compound component, reusable component,
  component API design, slot pattern, render prop, children pattern,
  prop drilling, boolean props, too many props, composition,
  forwardRef, displayName, polymorphic component, as prop, asChild,
  custom hook extraction, controlled uncontrolled component,
  component refactoring, component architecture, context pattern,
  how to structure a component, flexible component design,
  React 19 ref, use() hook, async component, provider pattern,
  headless component, composition over configuration.
  Load when designing or refactoring any React component.
---

> **Philosophy:** A component's API is a contract. Design it for the caller, not the implementer. The best components are open for extension and closed for modification.

# Component Design Patterns

---

## CP0. Pattern Selection Guide

The right pattern depends on the flexibility needed. Pick the simplest one that meets the requirements.

| Situation | Pattern | Reason |
|---|---|---|
| Simple, focused component | Plain component with typed props | Simplest — use this first |
| Component with related sub-parts | Compound components | Parent + children share implicit state |
| Component needs custom rendering in slots | Children as function / render prop | Caller controls rendering |
| Behavior without UI | Custom hook | Separates logic from presentation |
| Same logic, different HTML elements | Polymorphic component | Type-safe `as` prop |
| Wrapping a third-party component | Forwardref + display name | Preserve ref forwarding |
| Sharing behavior across unrelated components | HOC (rarely) | Only if hooks can't solve it |

**Start with plain props. Reach for compound components when you find yourself passing state down through multiple levels. Never reach for render props when a hook solves it.**

---

## CP1. Compound Components

Use when: a group of related components needs to share state without prop drilling, and the caller needs control over composition (what renders where).

Classic examples: Tabs, Accordion, Menu, Select, Dialog.

```tsx
// features/tabs/Tabs.tsx

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabsContext must be used within <Tabs>");
  return ctx;
}

// Root — owns state, provides context
function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

// Sub-components — consume context
function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex border-b border-border">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActiveTab(id)}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="py-4">
      {children}
    </div>
  );
}

// Attach sub-components as properties (named namespace)
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export { Tabs };
```

```tsx
// Usage — caller controls the composition
<Tabs defaultTab="overview">
  <Tabs.List>
    <Tabs.Tab id="overview">Overview</Tabs.Tab>
    <Tabs.Tab id="details">Details</Tabs.Tab>
    <Tabs.Tab id="history">History</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="overview"><OverviewContent /></Tabs.Panel>
  <Tabs.Panel id="details"><DetailsContent /></Tabs.Panel>
  <Tabs.Panel id="history"><HistoryContent /></Tabs.Panel>
</Tabs>
```

**Why this beats a boolean-prop API:**
```tsx
// ❌ Boolean prop explosion — one API doing too many jobs
<Tabs
  tabs={[{ id: "a", label: "Overview", content: <Overview /> }]}
  showBorder
  verticalOnMobile
  stickyHeader
  onTabChange={handler}
/>

// ✅ Compound — each concern is a component; the caller decides structure
```

---

## CP2. Slot Pattern (children as named slots)

Use when: a component has multiple distinct regions that the caller should fill independently, without enforcing which component goes where.

```tsx
// components/Card.tsx

type CardSlots = {
  header?: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
};

function Card({ header, body, footer }: CardSlots) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {header && (
        <div className="border-b border-border px-4 py-3 font-medium">{header}</div>
      )}
      <div className="px-4 py-4">{body}</div>
      {footer && (
        <div className="border-t border-border px-4 py-3 bg-muted/30">{footer}</div>
      )}
    </div>
  );
}
```

```tsx
// Usage — caller decides exactly what goes in each slot
<Card
  header={<h2 className="text-base">User Profile</h2>}
  body={<UserForm user={user} />}
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button>Save changes</Button>
    </div>
  }
/>
```

This is lighter than compound components — use when the regions don't need shared state between them.

---

## CP3. Render Prop / Children as Function

Use when: the component needs to provide data to the caller's rendering logic.

**Prefer a custom hook over render props when possible.** Render props are the right choice only when the component controls DOM structure that the caller also needs to render into.

```tsx
// Example: a Virtualizer that provides scroll state to items
function VirtualList<T>({
  items,
  children,
}: {
  items: T[];
  children: (item: T, index: number) => ReactNode;
}) {
  // ... virtualization logic
  return (
    <div className="overflow-y-auto h-full">
      {visibleItems.map((item, i) => children(item, i))}
    </div>
  );
}

// Usage — caller controls item rendering
<VirtualList items={users}>
  {(user) => (
    <UserRow key={user.id} user={user} />
  )}
</VirtualList>
```

**Prefer custom hook when the caller doesn't need to control DOM structure:**
```tsx
// ✅ Better — hook for behavior, caller owns all rendering
const { visibleItems, containerProps } = useVirtualList({ items, itemHeight: 48 });

return (
  <div {...containerProps} className="overflow-y-auto h-full">
    {visibleItems.map((item) => <UserRow key={item.id} user={item} />)}
  </div>
);
```

---

## CP4. Controlled vs Uncontrolled Components

Always support both modes for interactive components. Callers with simple needs use uncontrolled (internal state). Callers that need to sync with external state use controlled.

```tsx
type InputProps = {
  // Controlled: caller owns the value
  value?: string;
  onChange?: (value: string) => void;
  // Uncontrolled: component manages its own state
  defaultValue?: string;
};

function SearchInput({ value, onChange, defaultValue = "" }: InputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <input
      type="search"
      value={currentValue}
      onChange={handleChange}
      className="..."
    />
  );
}
```

**Rule:** If you're building a component that will be used in forms or shared across features, support both modes. If it's a one-off internal component, uncontrolled is fine.

---

## CP5. Polymorphic Components (the `as` prop)

Use when: a component should render different HTML elements depending on context, while keeping its visual style and props.

```tsx
// A Button that can render as <button>, <a>, or any other element
type PolymorphicButtonProps<T extends ElementType> = {
  as?: T;
  variant?: "default" | "ghost" | "destructive";
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "variant">;

function Button<T extends ElementType = "button">({
  as,
  variant = "default",
  children,
  className,
  ...props
}: PolymorphicButtonProps<T>) {
  const Component = as ?? "button";

  return (
    <Component
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}
```

```tsx
// Renders as <button>
<Button onClick={handleSubmit}>Submit</Button>

// Renders as <a> with full anchor props
<Button as="a" href="/dashboard" target="_blank">Dashboard</Button>

// Renders as Next.js Link
<Button as={Link} href="/profile">Profile</Button>
```

**Note:** shadcn already implements this via the `asChild` prop using Radix's `Slot`. Use shadcn components when available — only build polymorphic from scratch for non-shadcn components.

```tsx
// shadcn pattern (prefer this if using shadcn)
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

---

## CP6. Avoiding Boolean Prop Explosion

**The rule:** When a component has 3+ boolean props that modify its appearance, it has too many concerns. Split it or use a variant system.

```tsx
// ❌ Boolean explosion — 4 booleans controlling appearance
<Button primary ghost small loading disabled>Save</Button>

// ❌ Multiple appearance booleans in a type
type ButtonProps = {
  isPrimary?: boolean;
  isGhost?: boolean;
  isDestructive?: boolean;  // Which wins if multiple are true?
  isSmall?: boolean;
  isLarge?: boolean;
};

// ✅ Variant + size as discriminated strings (shadcn's approach)
type ButtonProps = {
  variant?: "default" | "ghost" | "destructive" | "outline" | "link";
  size?: "sm" | "default" | "lg" | "icon";
};

<Button variant="destructive" size="sm">Delete</Button>
```

**Pushback script:**
> *"This component has [N] boolean props controlling appearance. That usually signals the component is doing too many jobs. I'd model this as `variant` and `size` enum props instead — it's explicit, exclusive (can't be both primary and ghost), and matches the shadcn pattern the rest of the codebase uses. Want me to restructure it?"*

---

## CP7. Forwarding Refs

### React 19+ — ref is a regular prop (no forwardRef needed!)

```tsx
// ✅ React 19+ — ref is just a prop, no wrapper needed
function TextInput({ label, error, ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input ref={ref} className={cn("input", error && "border-destructive")} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

### React 18 and below — use forwardRef

```tsx
// ✅ React 18 — still use forwardRef
const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input ref={ref} className={cn("input", error && "border-destructive")} {...props} />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

// Required in React 18: set displayName for React DevTools
TextInput.displayName = "TextInput";
```

**Check your React version:**
```bash
cat package.json | grep '"react"'
```
- React 19+ → ref as prop, skip forwardRef
- React 18 → use forwardRef + displayName

**When to forward refs:**
- Any component that wraps a native HTML element (`input`, `button`, `div`, etc.)
- Any component that third-party libraries might need a ref to (modals, popovers, etc.)
- Never required for purely compositional components that don't wrap an element directly

---

## CP7.1 React 19+ — use() Hook for Async Data

```tsx
// React 19+ — use() can read promises and context in render
import { use, Suspense } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // suspends until resolved
  return <h1>{user.name}</h1>;
}

// Wrap with Suspense at the parent level
<Suspense fallback={<Skeleton />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>
```

> **Note:** `use()` works with Promises and Context. It can be called inside
> conditionals and loops unlike other hooks. Only available in React 19+.

---

## CP8. Custom Hook Extraction — When and How

Extract logic into a custom hook when:
- The same stateful logic is needed in 2+ components
- A component has more than ~30 lines of hooks + handlers
- The logic can be tested independently of the UI

```tsx
// Before: logic tangled in component
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = async (data: UserFormData) => {
    setIsSaving(true);
    try {
      const updated = await updateUser(data);
      setUser(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return <div>...</div>; // component now just renders
}

// After: extracted hook
function useUserProfile(userId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditing(false);
    },
  });

  return {
    user,
    isEditing,
    isSaving: updateMutation.isPending,
    startEditing: () => setIsEditing(true),
    cancelEditing: () => setIsEditing(false),
    save: updateMutation.mutate,
  };
}

// Component: pure rendering
function UserProfile({ userId }: { userId: string }) {
  const { user, isEditing, isSaving, startEditing, cancelEditing, save } = useUserProfile(userId);
  return <div>...</div>;
}
```

---

## CP9. Component Complexity Signals

**Refactor signals — when a component needs decomposition:**

| Signal | What it means | Action |
|---|---|---|
| 5+ props | Component may be doing too much | Consider variant system (CP6) or decomposition |
| 3+ boolean flags | Visual configuration should be variants | Refactor to `variant` / `size` enum props |
| 2+ `useEffect` calls | Multiple side effects = multiple concerns | Extract into custom hooks |
| 150+ lines | Too long to reason about | Split into sub-components + hooks |
| Nested ternaries in JSX | Rendering complexity | Extract conditional renders into named components |
| Props passed 3+ levels down | Prop drilling | Lift to context or restructure with compound components |

---

## CP10. Anti-patterns (never use these)

| Anti-pattern | Why banned | Alternative |
|---|---|---|
| `index.tsx` as the component name | Invisible in DevTools stack traces | Name the file after the component: `UserCard.tsx` |
| Anonymous function as default export | No displayName — invisible in DevTools | Named function + `displayName` set |
| Props named `onXxxClick` | Redundant — `onClick` is clear when context is obvious | `onClick`, `onSelect`, `onChange` — no suffix needed |
| `any` in prop types | Destroys type safety for callers | Use generics if the type is unknown |
| Boolean props that conflict | Caller can accidentally set both | Use a `variant` string enum |
| Direct DOM manipulation inside component | Breaks React's model | Use refs + `useEffect` for DOM interaction |
| Async event handlers without error handling | Silent failures | Always `try/catch` + user feedback in async handlers |
