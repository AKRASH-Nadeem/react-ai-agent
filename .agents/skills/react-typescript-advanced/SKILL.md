---
name: react-typescript-advanced
description: |
  LOAD AUTOMATICALLY for: TypeScript, type definitions, interfaces, generics,
  type safety, API response types, discriminated unions, type errors,
  tsc errors, type inference, unknown vs any, satisfies operator,
  infer keyword, conditional types, mapped types, template literal types,
  utility types, generic components, typed hooks, module augmentation,
  React.FC alternatives, component prop typing, event types, ref types,
  form types, async types, Promise types, fetch types, axios types,
  Zod inference, z.infer, type narrowing, exhaustive checks, const assertions,
  ComponentPropsWithoutRef, ElementRef, PropsWithChildren.
  Load for any TypeScript code in React projects.
---

# Advanced TypeScript Patterns for React

## TS1. Discriminated Union Types for API Responses

Always use discriminated unions for async state — never `status: string`:

```ts
// types/api.ts
type ApiResult<T> =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Usage in components — TypeScript narrows automatically:
function renderResult<T>(result: ApiResult<T>) {
  switch (result.status) {
    case 'idle':    return null;
    case 'pending': return <Skeleton />;
    case 'success': return <DataView data={result.data} />;  // TS knows .data exists
    case 'error':   return <ErrorDisplay message={result.error} />; // TS knows .error exists
  }
}
```

### Exhaustive check helper (catch missed cases at compile time):

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

// If a new status is added to ApiResult but not handled, TS will error here:
switch (result.status) {
  case 'idle': /* ... */; break;
  case 'pending': /* ... */; break;
  case 'success': /* ... */; break;
  case 'error': /* ... */; break;
  default: assertNever(result); // compile error if a case is missing
}
```

---

## TS2. Generic Typed Components

```tsx
// A generic list component — type-safe for any data shape:
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
};

function List<T>({ items, renderItem, keyExtractor, emptyMessage }: ListProps<T>) {
  if (items.length === 0) return <p className="text-muted-foreground">{emptyMessage ?? 'No items'}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage — T is inferred from the items array:
<List
  items={users}
  keyExtractor={(u) => u.id}     // TypeScript infers u: User
  renderItem={(u) => <UserCard user={u} />}
/>
```

---

## TS3. The `satisfies` Operator

Use `satisfies` to validate a value matches a type WITHOUT widening it:

```ts
// ❌ Type annotation widens — loses literal types
const config: Record<string, { label: string; color: string }> = {
  success: { label: 'Success', color: 'green' },
  error:   { label: 'Error',   color: 'red' },
};
// config.success.color → string (widened — lost 'green')

// ✅ satisfies validates AND preserves literal types
const config = {
  success: { label: 'Success', color: 'green' },
  error:   { label: 'Error',   color: 'red' },
} satisfies Record<string, { label: string; color: string }>;
// config.success.color → 'green' (preserved!)
```

---

## TS4. Proper `unknown` Error Handling

Never use `any` in catch blocks. TypeScript 4.4+ types catch as `unknown`:

```ts
// ❌ NEVER — destroys type safety
try { /* ... */ } catch (error: any) {
  console.log(error.message); // might not exist
}

// ✅ Always narrow unknown
try {
  await api.post('/data', payload);
} catch (error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}

// ✅ With Zod for API error shapes
const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

try { /* ... */ } catch (error: unknown) {
  const parsed = apiErrorSchema.safeParse(error);
  if (parsed.success) {
    toast.error(parsed.data.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

---

## TS5. `const` Assertions for Config Objects

```ts
// ❌ Mutable — types widened to string[]
const ROLES = ['admin', 'editor', 'viewer'];
// typeof ROLES → string[]

// ✅ const assertion — immutable + literal types
const ROLES = ['admin', 'editor', 'viewer'] as const;
// typeof ROLES → readonly ['admin', 'editor', 'viewer']

type Role = typeof ROLES[number]; // 'admin' | 'editor' | 'viewer'
```

---

## TS6. Template Literal Types for API Paths

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiVersion = 'v1' | 'v2';
type Resource = 'users' | 'campaigns' | 'contacts';

type ApiPath = `/${ApiVersion}/${Resource}`;
// "/v1/users" | "/v1/campaigns" | "/v1/contacts" | "/v2/users" | ...

type EndpointConfig = {
  method: HttpMethod;
  path: ApiPath;
};
```

---

## TS7. React-Specific TypeScript Patterns

### Component Props (prefer these over React.FC)

```tsx
// ✅ Named function + explicit props type
type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'default' | 'destructive' | 'outline';
  isLoading?: boolean;
};

function Button({ variant = 'default', isLoading, children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// ✅ Ref forwarding in React 19+ (no forwardRef needed!)
function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  return <input className={cn('...', className)} {...props} />;
}
// In React 19, ref is a regular prop — no forwardRef wrapper needed.
// For React 18 and below, still use forwardRef.
```

### Event Types

```tsx
// Common event types — always use these, never `any`
function handleChange(e: React.ChangeEvent<HTMLInputElement>) { /* ... */ }
function handleSubmit(e: React.FormEvent<HTMLFormElement>) { /* ... */ }
function handleClick(e: React.MouseEvent<HTMLButtonElement>) { /* ... */ }
function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) { /* ... */ }
```

### Typed Hooks

```tsx
// Custom hook with explicit return type
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}

// Custom hook returning object — type the return explicitly for exports
type UseUserReturn = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function useUser(userId: string): UseUserReturn {
  // ... implementation
}
```

---

## TS8. Zod + TypeScript Inference Patterns

```ts
import { z } from 'zod';

// Schema first — types derived
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'editor', 'viewer']),
  createdAt: z.string().datetime(),
});

// Infer the type FROM the schema — single source of truth
type User = z.infer<typeof userSchema>;

// API response validation
const apiResponseSchema = z.object({
  data: userSchema,
  meta: z.object({
    timestamp: z.string().datetime(),
  }),
});

type ApiResponse = z.infer<typeof apiResponseSchema>;

// Usage in fetch wrapper
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const json = await res.json();
  return userSchema.parse(json); // throws if invalid
}
```

---

## TS9. Anti-Patterns (Never Do)

| Anti-Pattern | Why | Fix |
|---|---|---|
| `any` anywhere | Destroys type safety | `unknown` + narrowing, or generics |
| `as` type assertion (except for tests) | Lies to the compiler | Proper type narrowing |
| `// @ts-ignore` or `// @ts-expect-error` without comment | Hides real bugs | Fix the type error properly |
| `React.FC` or `React.FunctionComponent` | Unnecessary, adds implicit `children`, poor generics | Named function + props type |
| `interface` for props | Can't do unions/intersections cleanly | `type` for props, `interface` for extensible shapes |
| Non-null assertion `!` on data | Crash at runtime if assumption wrong | Proper null checks |
| `Object`, `Function`, `{}` as types | Too broad — matches anything | Specific types |
