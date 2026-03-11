---
name: react-shadcn
description: |
  MANDATORY — load before every UI task without exception.
  Covers all shadcn/ui usage: version detection, component install, form patterns
  (Field vs Form), component wrapping rules, and MCP validation workflow.
  Trigger on: any component, form, input, dialog, table, or UI primitive work.
---

# shadcn/ui Standards

## SH0. Pre-Init Check

Before `npx shadcn@latest init`, confirm alias is configured:
```bash
# Must return a paths entry — if empty, shadcn init will fail
cat tsconfig.json | grep -A2 '"paths"'

# Must return the alias resolver — if missing, add it to vite.config.ts
cat vite.config.ts | grep "@"
```

If either is missing — configure alias first, then run shadcn init.

## SH0.1 Version Check — Always First

Before writing any shadcn component code:

```bash
# Step 1 — check what's installed
cat components.json | grep -E '"style"|"rsc"|"tsx"'

# Step 2 — check what form component exists
ls src/components/ui/ | grep -E "^form|^field"

# Step 3 — or use shadcn MCP (fastest)
# get-component field   → exists? use Field family
# get-component form    → exists? use Form family
```

Never assume from memory. One MCP call confirms the truth.

---

## SH1. Core Rules

- shadcn/ui is the primary component library. Always prefer a shadcn component over building a primitive from scratch.
- `src/components/ui/` components are **generated, never hand-edited**. If customization is needed, create a wrapper component in `src/components/` that imports from `src/components/ui/`.
- Always install via CLI — never copy-paste component code manually:
  ```bash
  npx shadcn@latest add [component-name]
  ```
- Never write `components.json` by hand. Always run `npx shadcn@latest init`.
- Verify a component name exists before installing: use shadcn MCP `get-component [name]` — component names change between versions.

---

## SH2. Forms — Version-Dependent Pattern

### shadcn v2+ → Field family

```bash
npx shadcn@latest add field
```

```tsx
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Min 2 characters'),
});
type FormValues = z.infer<typeof schema>;

export function ExampleForm() {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </form>
  );
}
```

### shadcn pre-v2 → Form family

```bash
npx shadcn@latest add form
```

```tsx
import {
  Form, FormField, FormItem,
  FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function ExampleForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

---

## SH3. High-Churn Components — Always Verify via MCP

These components change APIs frequently. Call shadcn MCP before using any of them:

| Component | Why |
|---|---|
| `field` / `form` | Switched between versions — verify which exists |
| `input-otp` | Underlying library changes |
| `sidebar` | Major API overhaul in 2024 |
| `calendar` | Peer dependency changes (react-day-picker) |
| `chart` | Added in 2024, API still evolving |
| `command` | Import path changed |

MCP call: `get-component [name]` — returns the current source and install command.

---

## SH4. Wrapping Pattern

When a shadcn component needs custom behavior or styling, always wrap — never edit the source file in `src/components/ui/`:

```tsx
// src/components/AppButton.tsx  ← your wrapper
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AppButtonProps = ButtonProps & {
  isLoading?: boolean;
};

export function AppButton({ isLoading, children, className, disabled, ...props }: AppButtonProps) {
  return (
    <Button
      className={cn('min-w-24', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {children}
        </span>
      ) : children}
    </Button>
  );
}
```

---

## SH6. Import Verification — Run After Every Form or Component Task

These checks must pass before the task is considered done. Run them in order.

```bash
# 1. Confirm which shadcn UI files actually exist on disk
ls src/components/ui/

# 2. Check for imports from files that do not exist on disk
#    Every file in an import must appear in the ls output above.
#    Anything missing = component was never installed = broken import.

# 3. Shadcn form family check — exactly ONE of these should return results,
#    never both, never neither (if forms are used)
grep -r "from '@/components/ui/form'" src/
grep -r "from '@/components/ui/field'" src/

# 4. Confirm the family you ARE using is installed on disk
ls src/components/ui/ | grep -E "^form\.tsx|^field\.tsx"
# Must return a file. If empty: run `npx shadcn@latest add field` or `add form`

# 5. Scan ALL @/components/ui imports across the project and verify each file exists
grep -rh "from '@/components/ui/" src/ \
  | grep -oP "(?<=ui/)[^'\"]*" \
  | sort -u \
  | while read comp; do
      [ ! -f "src/components/ui/${comp}.tsx" ] && echo "MISSING: src/components/ui/${comp}.tsx"
    done
# Must return zero lines. Any MISSING line = uninstalled component = fix before finishing.

# 6. Type check — must pass clean
npx tsc --noEmit
```

**On any failure:**
- `MISSING: src/components/ui/field.tsx` → `npx shadcn@latest add field`
- `MISSING: src/components/ui/form.tsx` → `npx shadcn@latest add form`
- `MISSING: src/components/ui/X.tsx` → `npx shadcn@latest add X`
- Both `form` and `field` imports found → mixed families, pick one and remove the other
- `tsc --noEmit` errors → fix type errors before reporting task complete

---

## SH5. Cheatsheet

| Concern | Action |
|---|---|
| First setup | `npx shadcn@latest init` — never hand-write `components.json` |
| Install component | `npx shadcn@latest add [name]` |
| Verify component exists | shadcn MCP: `get-component [name]` |
| Forms v2+ | `Field` + `FieldLabel` + `FieldError` from `@/components/ui/field` |
| Forms pre-v2 | `FormField` + `FormItem` + `FormMessage` from `@/components/ui/form` |
| Unsure which version | `ls src/components/ui/` or shadcn MCP |
| Customize a component | Wrap in `src/components/` — never edit `src/components/ui/` |
| High-churn components | Always call shadcn MCP before: `field`, `form`, `sidebar`, `calendar`, `chart` |
