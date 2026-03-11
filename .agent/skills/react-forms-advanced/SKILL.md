---
name: react-forms-advanced
requires:
  - react-hook-form@^7
  - "@hookform/resolvers@^3"
  - zod@^3
description: |
  Use when the project needs complex form patterns beyond a single-page form. Trigger on:
  "multi-step", "wizard", "stepper", "step 1 of 3", "onboarding flow",
  "OTP", "PIN input", "verification code", "6-digit",
  "phone number input", "country code", "international phone",
  "currency input", "money input", "price field", "number format",
  "tag input", "multi-select input", "chips", "pills",
  "drag and drop", "sortable list", "reorder", "dnd-kit", "kanban",
  "auto-save", "save draft", "autosave", file upload within a form.
---

> ⚠️ **Version check required before use.** Call shadcn MCP `get-component field` and `get-component form` to confirm which is available in the installed registry. Examples below cover both — use the one that exists.

# Advanced Forms Standards

## AF0. shadcn Form Wrapper — Version-Dependent

**Before writing any form UI: determine which shadcn form system is installed.**

```bash
# Check what's in your components/ui folder
ls src/components/ui/ | grep -E "^form|^field"
# or call shadcn MCP: get-component field / get-component form
```

### shadcn v2+ — Field family (`@/components/ui/field`)

```tsx
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Controller } from "react-hook-form";

// Wrap every RHF field like this:
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### shadcn pre-v2 — Form family (`@/components/ui/form`)

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Wrap every RHF field like this:
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## AF1. Multi-Step Wizard — Standard Pattern

### Step State in URL

Always store the current step in the URL. Enables back-button navigation and survives page refresh.

```ts
// hooks/useWizardStep.ts
export function useWizardStep({ totalSteps, paramName = "step" }: { totalSteps: number; paramName?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = Math.min(Math.max(Number(searchParams.get(paramName) ?? "1"), 1), totalSteps);

  const goToStep = (step: number) => setSearchParams({ [paramName]: String(step) });
  const nextStep = () => { if (currentStep < totalSteps) goToStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) goToStep(currentStep - 1); };

  return { currentStep, goToStep, nextStep, prevStep, isFirstStep: currentStep === 1, isLastStep: currentStep === totalSteps };
}
```

### Per-Step Zod Schema Validation

Define a Zod schema per step. Validate only the current step's fields on "Next". Validate the merged schema on final submit.

```ts
// features/onboarding/schema.ts
export const step1Schema = z.object({ name: z.string().min(2), email: z.string().email() });
export const step2Schema = z.object({ company: z.string().min(1), role: z.enum(["developer", "designer", "manager", "other"]) });
export const step3Schema = z.object({ plan: z.enum(["starter", "pro", "enterprise"]) });
export const onboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
```

### WizardProgress Component

```tsx
export function WizardProgress({ currentStep, totalSteps, labels }: { currentStep: number; totalSteps: number; labels: string[] }) {
  return (
    <nav aria-label="Form steps">
      <ol className="flex items-center gap-2">
        {labels.map((label, i) => {
          const step = i + 1;
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <li key={step} className="flex items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
              <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-medium",
                isComplete ? "bg-primary text-primary-foreground" :
                isCurrent  ? "border-2 border-primary text-primary" :
                             "border border-muted-foreground text-muted-foreground"
              )}>
                {isComplete ? <Check className="size-4" /> : step}
              </span>
              <span className="hidden text-sm sm:block">{label}</span>
              {step < totalSteps && <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

## AF2. OTP / PIN Input

```bash
npm install input-otp
```

```tsx
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function OTPVerification({ onComplete }: { onComplete: (code: string) => void }) {
  return (
    <InputOTP maxLength={6} onComplete={onComplete}>
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
      </InputOTPGroup>
    </InputOTP>
  );
}
```

---

## AF3. Phone Number Input

```bash
npm install react-phone-number-input
```

```tsx
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Controller } from "react-hook-form";

<Controller
  name="phone"
  control={form.control}
  render={({ field }) => (
    <PhoneInput
      defaultCountry="US"
      value={field.value}
      onChange={field.onChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
    />
  )}
/>
```

---

## AF4. Currency Input

```ts
// hooks/useCurrencyInput.ts
export function useCurrencyInput(initialValue = 0) {
  const [displayValue, setDisplayValue] = useState(() =>
    (initialValue / 100).toFixed(2)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    setDisplayValue(raw);
  };

  const handleBlur = (): void => {
    const parsed = parseFloat(displayValue);
    setDisplayValue(isNaN(parsed) ? "0.00" : parsed.toFixed(2));
  };

  const valueInCents = Math.round(parseFloat(displayValue || "0") * 100);

  return { displayValue, handleChange, handleBlur, valueInCents };
}
```

---

## AF5. Tag / Chip Input

```bash
npm install react-select
```

```tsx
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";

<Controller
  name="tags"
  control={form.control}
  render={({ field }) => (
    <CreatableSelect
      isMulti
      value={field.value?.map((t: string) => ({ value: t, label: t }))}
      onChange={(options) => field.onChange(options.map((o) => o.value))}
      placeholder="Add tags…"
      classNamePrefix="react-select"
    />
  )}
/>
```

---

## AF6. Drag and Drop — dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Rules: always include `KeyboardSensor` — keyboard DnD is required for accessibility. Never use `react-beautiful-dnd`.

```tsx
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

export function SortableList({ items, onReorder }: { items: Item[]; onReorder: (items: Item[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) // REQUIRED
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over?.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => <SortableItem key={item.id} item={item} />)}
      </SortableContext>
    </DndContext>
  );
}
```

For full keyboard + screen reader DnD accessibility, see the **react-accessibility** skill A11Y7.

---

## AF7. Auto-Save — `useAutoSave` Hook

```ts
// hooks/useAutoSave.ts
import { useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

type UseAutoSaveOptions<T> = {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
};

export function useAutoSave<T>({ data, onSave, delay = 1500, enabled = true }: UseAutoSaveOptions<T>) {
  const isFirstRender = useRef(true);

  const save = useDebouncedCallback(async (value: T) => {
    try {
      await onSave(value);
    } catch {
      // Silent — auto-save failures should not interrupt the user
    }
  }, delay);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!enabled) return;
    save(data);
  }, [data, enabled, save]);
}
```

---

## Summary Cheatsheet — Advanced Forms

| Concern | Standard |
|---------|----------|
| Multi-step form | `useWizardStep` hook + URL step param |
| Step validation | Per-step Zod schema |
| Progress indicator | `<WizardProgress>` component |
| OTP / PIN | `input-otp` library |
| Phone number | `react-phone-number-input` |
| Currency | `useCurrencyInput` hook (stores cents) |
| Tags / chips | `react-select` CreatableSelect |
| Drag and drop | `dnd-kit` — always include `KeyboardSensor` |
| Auto-save | `useAutoSave` hook with 1500ms debounce |
| File upload in form | See react-rest-advanced skill API7 |
