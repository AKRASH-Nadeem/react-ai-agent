---
name: react-troubleshooting
description: |
  Use when diagnosing or fixing a bug, unexpected behavior, or error.
  Trigger on: any error message, stack trace, or "it's not working" report,
  "TypeError", "ReferenceError", "cannot read properties of undefined",
  "too many re-renders", "infinite loop", "useEffect running twice",
  "state not updating", "component not re-rendering", "stale closure",
  "hydration error", "white screen", "blank page", "flickering",
  "layout shift", "CSS not applying", "Tailwind class not working",
  "TypeScript error I don't understand",
  TanStack Query not fetching / always loading / stale data,
  react-hook-form field not registering / not validating,
  "weird behavior I can't explain", debugging sessions, any performance issue.
---

> ⚠️ **Never guess at the cause of a bug.** Follow the systematic methodology below. Guessing wastes time and introduces regressions.

# React Troubleshooting Standards

---

## TR0. Debugging Methodology — The Five Steps

Every bug diagnosis follows this sequence. Never skip to step 4.

```
1. REPRODUCE   → Can I make it happen consistently?
2. ISOLATE     → What is the smallest change that triggers it?
3. DIAGNOSE    → What is the root cause?
4. FIX         → Apply the minimal change that resolves the root cause
5. VERIFY      → Does it still fail? Did the fix break anything else?
```

**The wrong approach (banned):**
- "Let me try changing X" — without knowing why X would help
- Wrapping the problem in a `try/catch` and swallowing it
- Adding `// @ts-ignore` to make TypeScript stop complaining
- `console.log` every variable hoping the answer will appear

**The right approach:**
Form a hypothesis ("I think this is failing because Y") → test the hypothesis specifically → confirm or reject before moving on.

---

## TR1. Reading the Error

Before anything else, read the entire error message. Most engineers read the first line and stop.

### Error anatomy

```
TypeError: Cannot read properties of undefined (reading 'name')
    at UserCard (UserCard.tsx:24:18)       ← exact file and line
    at renderWithHooks                      ← React internals — ignore
    at mountIndeterminateComponent          ← React internals — ignore
    at updateFunctionComponent              ← React internals — ignore
```

**Read:** the error type + message + the first non-React-internals stack frame. Everything below React internals is noise.

### Error type quick-reference

| Error | Common cause | First thing to check |
|---|---|---|
| `Cannot read properties of undefined` | Accessing property before data loads | Is the data possibly `undefined` on first render? Add optional chaining |
| `Cannot read properties of null` | Same, but explicitly null | Same fix — distinguish `null` vs `undefined` in the Zod schema |
| `Too many re-renders` | Unconditional `setState` in render, or `useEffect` with missing/wrong deps | Find the infinite setState cycle |
| `Warning: Each child in a list should have a unique "key"` | Missing or non-unique key prop | Add a stable, unique `key` — not array index unless list is static |
| `Warning: An update to X inside a test was not wrapped in act(...)` | Async state update in test without awaiting | Use `await act(async () => ...)` around the trigger |
| `Hydration failed` | Server and client render different HTML | Check for browser-only APIs, random values, dates, or `window` access during SSR |
| `Module not found: Can't resolve 'X'` | Wrong import path, missing package, or renamed library | Check `package.json`, check the actual file path |
| `Property 'X' does not exist on type 'Y'` | Type mismatch — the type doesn't include X | Check if the type needs updating or if you're using the wrong property name |

---

## TR2. React-Specific Debugging Patterns

### TR2.1 Infinite re-render (`Too many re-renders`)

**Cause pattern:** Something in the render triggers a state update, which triggers another render, which triggers another state update.

```tsx
// ❌ Pattern 1: setState called unconditionally in render body
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // ← fires on every render → infinite loop
  return <div>{count}</div>;
}

// ❌ Pattern 2: setState called in useEffect with itself as dep
useEffect(() => {
  setValue(computeSomething(value)); // value changes → useEffect fires → value changes
}, [value]);

// ❌ Pattern 3: Object created inline as dependency
useEffect(() => {
  fetchData(options); // options is `{}` created fresh each render
}, [options]); // new object reference every render → always fires

// ✅ Fix for pattern 3: primitive deps or stable reference
const stableOptions = useMemo(() => ({ page, limit }), [page, limit]);
useEffect(() => { fetchData(stableOptions); }, [stableOptions]);
```

**Diagnosis steps:**
1. Open React DevTools → Profiler → Record → trigger the issue
2. Look for the component that renders hundreds of times
3. Find what state is changing on each render
4. Find what is setting that state

### TR2.2 Stale closure

**Cause:** A `useEffect`, `useCallback`, or event handler captured a value from a past render.

```tsx
// ❌ Stale closure — count is captured at mount
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // always logs 0
  }, 1000);
  return () => clearInterval(id);
}, []); // empty deps = captured once

// ✅ Fix option 1: add count to deps
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // fresh value
  }, 1000);
  return () => clearInterval(id);
}, [count]);

// ✅ Fix option 2: use ref for latest value (when you need latest without restarting effect)
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);
useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // always fresh
  }, 1000);
  return () => clearInterval(id);
}, []);
```

**Symptom:** Value is always "stuck" at an old number, the initial value, or an empty array.

### TR2.3 useEffect running twice (React 19 Strict Mode)

**Not a bug.** In Strict Mode + development, React intentionally mounts → unmounts → remounts every component. This exposes cleanup issues.

```tsx
// ❌ Effect without cleanup — runs setup twice, never cleans up
useEffect(() => {
  subscribeToEvents(handler);
}, []);

// ✅ Always return cleanup
useEffect(() => {
  subscribeToEvents(handler);
  return () => unsubscribeFromEvents(handler); // ← required
}, []);
```

If you see a side effect happen twice in dev but once in prod, this is always the cause. Fix the cleanup, not the double-run.

### TR2.4 State update not reflecting in UI

```tsx
// ❌ Mutating state directly — React does not detect this
const [items, setItems] = useState([]);
items.push(newItem); // ← mutation — React has no idea

// ✅ New array reference
setItems(prev => [...prev, newItem]);

// ❌ Mutating nested object
const [user, setUser] = useState({ name: "Alice", settings: { theme: "dark" } });
user.settings.theme = "light"; // ← mutation
setUser(user); // same reference — React bails out

// ✅ New object reference at every level
setUser(prev => ({ ...prev, settings: { ...prev.settings, theme: "light" } }));
```

**Rule:** Never mutate state. Always create a new reference.

### TR2.5 Context value causing all consumers to re-render

```tsx
// ❌ Object created inline — new reference every render → all consumers re-render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}> {/* ← new object every render */}
      {children}
    </UserContext.Provider>
  );
}

// ✅ Memoize the context value
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

---

## TR3. TypeScript Error Patterns

### TR3.1 Quick diagnosis commands

```bash
# Full project check
npx tsc --noEmit

# Check a specific file
npx tsc --noEmit src/features/auth/useAuth.ts

# Find all errors in a category
npx tsc --noEmit 2>&1 | grep "TS2345"

# See the tsconfig being used
npx tsc --showConfig
```

### TR3.2 Common TS errors and fixes

```
TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
→ Your type and the expected type don't match.
   Check: is X a wider type than Y? Narrow it with a type guard or schema.
   Never: cast with `as Y` — that hides the real mismatch.

TS2339: Property 'X' does not exist on type 'Y'
→ You're accessing a property that the type doesn't declare.
   Check: is the type incomplete? Did the API shape change? Is it optional (X | undefined)?

TS2531: Object is possibly 'null'
→ You're using a value that might be null.
   Fix: add a null check, use optional chaining, or narrow with `if (value) {...}`

TS2532: Object is possibly 'undefined'
→ Same as above but for undefined.

TS7006: Parameter 'X' implicitly has an 'any' type
→ Missing type annotation.
   Fix: add explicit type. Check the function signature or the data source type.

TS2304: Cannot find name 'X'
→ Variable/type not in scope.
   Check: is it imported? Is the import path correct? Is it in the right file?
```

### TR3.3 The `any` trap

Never solve a TypeScript error by adding `any` or `@ts-ignore`. These suppress the error without fixing it and create silent runtime bugs.

```tsx
// ❌ Suppressing a real type error
const data = response.data as any; // hides all type safety downstream
const name = (data as any).user.name; // will crash at runtime if shape is wrong

// ✅ Fix the root cause — parse with Zod
const result = userSchema.safeParse(response.data);
if (!result.success) {
  // handle malformed response
  return;
}
const { name } = result.data; // fully typed
```

---

## TR4. TanStack Query Debugging

### TR4.1 Query not fetching

```tsx
// Diagnosis checklist:
// 1. Is the queryKey correct? (it must be an array)
// 2. Is queryFn returning a promise?
// 3. Is the component inside a QueryClientProvider?
// 4. Is `enabled` false?

const { data, status, fetchStatus } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// status: 'pending' | 'error' | 'success'
// fetchStatus: 'fetching' | 'paused' | 'idle'
// A query is loading when: status === 'pending' && fetchStatus === 'fetching'
// A query is paused (offline) when: fetchStatus === 'paused'
```

Open React Query DevTools (`@tanstack/react-query-devtools`) — it shows every query, its state, and its data. This is the first tool to use, not the last.

### TR4.2 Stale data not refreshing

```tsx
// Always check staleTime — default is 0 (immediately stale)
// If you're seeing old data, it may be intentionally cached

// Force a refetch:
const { refetch } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
<button onClick={() => refetch()}>Refresh</button>

// Invalidate from mutation:
useMutation({
  mutationFn: updateUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
```

### TR4.3 v5 breaking change errors

```
// These errors mean you're using v4 patterns on a v5 install:

❌ "cacheTime is not a valid option"      → rename to gcTime
❌ "onSuccess is not a valid option"       → move logic to onSettled or useEffect watching data
❌ "status === 'loading'"                  → rename to 'pending' in v5
❌ "isLoading and isFetching both true"    → isLoading is gone in v5, use isPending
```

---

## TR5. Tailwind CSS Debugging

### TR5.1 Class not applying

```bash
# Check 1: Is the class being purged?
# In dev mode, Tailwind scans for classes. Dynamic class concatenation breaks this:

# ❌ Purged — Tailwind can't detect 'text-red-500' at build time
const color = "red";
<div className={`text-${color}-500`}>

# ✅ Safe — full class name present as a string
const colorClass = "text-red-500";
<div className={colorClass}>

# Check 2: Is there a specificity conflict?
# Inspect in DevTools → Elements → Computed → search for the property
# A struck-through rule means another rule is winning

# Check 3: Is this v3 or v4?
cat package.json | grep tailwindcss
# v4: no tailwind.config.ts — config in CSS
# v3: tailwind.config.ts exists
```

### TR5.2 Dark mode not working

```tsx
// Check: what dark mode strategy is the project using?

// v4 CSS config:
// @custom-variant dark (&:is(.dark, .dark *));
// → .dark class on <html> element

// v3 tailwind.config.ts:
// darkMode: 'class'
// → .dark class on <html> element

// Toggle:
document.documentElement.classList.toggle('dark');

// If dark: classes aren't applying — confirm .dark is on <html>, not <body>
```

---

## TR6. Network & API Debugging

### TR6.1 Chrome DevTools — Network tab checklist

1. Filter by `Fetch/XHR`
2. Check the request: URL correct? Method correct? Headers include auth token?
3. Check the response: status code? Response body?
4. Check timing: is there a waterfall (requests waiting for each other)?

### TR6.2 Request waterfall diagnosis

```tsx
// ❌ Waterfall: B waits for A to complete
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser });
const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user.id),
  enabled: !!user, // B blocked until A resolves
});

// ✅ If B doesn't actually need A's data: parallel queries
const results = useQueries({
  queries: [
    { queryKey: ['user'], queryFn: fetchUser },
    { queryKey: ['posts'], queryFn: fetchAllPosts },
  ],
});
```

### TR6.3 CORS errors

```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

This is a **backend configuration issue**, not a frontend bug. The backend needs to add the correct `Access-Control-Allow-Origin` header. Frontend cannot fix CORS — do not add proxy workarounds to production code.

Development workaround (Vite only, never in production):
```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.example.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

---

## TR7. React DevTools Profiler — Performance Debugging

Use the Profiler to diagnose slow renders. Never optimize without data.

```
1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click "Record"
4. Perform the slow interaction
5. Stop recording
6. Look for:
   - Components with high "self time" (excluding children)
   - Components that render when they shouldn't
   - Components marked with a flame icon (expensive renders)
```

**Interpreting the results:**

| What you see | Root cause | Fix |
|---|---|---|
| Component re-renders on every parent update | No bailout — should be stable | Check if props are new object references each render |
| Suspense boundary triggers often | Data invalidated too aggressively | Increase `staleTime` in TanStack Query |
| Long "self time" on a component | Expensive computation in render | Move to a derived value or a Web Worker |
| Deep component tree all lighting up | Context change propagating everywhere | Split context or memoize the value |

---

## TR8. Debug Checklist (use when stuck)

```
[ ] Read the full error message — not just the first line
[ ] Check the exact file and line number in the stack trace
[ ] Open React DevTools — Components + Profiler
[ ] Open Network tab in DevTools — check the actual HTTP request/response
[ ] Check the browser Console — all tabs (Errors, Warnings, Info)
[ ] Run `npx tsc --noEmit` — are there TypeScript errors hiding the real problem?
[ ] Isolate: comment out code until the bug disappears — that's your culprit
[ ] Search the exact error message — if it's a known React/library error, the docs explain it
[ ] Form a hypothesis and test it once — don't shotgun changes
[ ] After fix: does `npm run build` pass? Does tsc pass? No regressions?
```
