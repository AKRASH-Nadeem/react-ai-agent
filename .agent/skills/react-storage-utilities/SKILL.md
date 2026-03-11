name: react-storage-utilities
description: |
  Use when the project needs browser storage, timers, file operations, keyboard shortcuts,
  print styles, or the Web Share API. Trigger on:
  "localStorage", "sessionStorage", "persist", "remember", "store in browser",
  "dark mode" with persistence, "theme persistence",
  "recently viewed", "recent items", "pinned items", "favorites",
  "cookie consent", "GDPR banner",
  "countdown timer", "flash sale timer", "session timer", "useInterval",
  "download file", "export CSV", "download CSV", "export to CSV", "download blob",
  "CSV import", "parse CSV", "upload CSV", "bulk import CSV",
  "keyboard shortcut", "hotkey", "global shortcut", "shortcut cheat sheet",
  "print styles", "print layout", "@media print", "printable report",
  "share button", "Web Share API", "native share", "share this page",
  "cart persistence", "persistent cart".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Storage & Utilities Standards

## SU1. `useLocalStorage` Hook

Never access `localStorage` directly in components. Always use this hook — it parses with Zod to prevent crashes on corrupt or stale stored data.

```ts
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : defaultValue;
    } catch { return defaultValue; }
  }, [key, schema, defaultValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((prev: T) => T)): void => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(newValue) }));
    } catch {} // Quota exceeded — fail silently
  }, [key, storedValue]);

  const removeValue = useCallback((): void => {
    window.localStorage.removeItem(key);
    setStoredValue(defaultValue);
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}
```

**Key naming:** `app:[feature]-[data]` — e.g., `app:theme`, `app:cart`, `app:recent-products`.

**Never store in `localStorage`:** access tokens, passwords, PII. See the **react-auth-lifecycle** skill AUTH1.

Common usages:
```ts
const [theme, setTheme] = useLocalStorage("app:theme", z.enum(["light", "dark", "system"]), "system");
const [cart, setCart] = useLocalStorage("app:cart", z.array(cartItemSchema), []);
const [consent, setConsent] = useLocalStorage("app:cookie-consent", consentSchema.nullable(), null);
```

---





## SU2. `useSessionStorage` Hook

Identical API to `useLocalStorage` but clears when the tab closes. Use for ephemeral UI state: form drafts (if no auto-save), unsaved filter state, one-time session flags.

| `localStorage` | `sessionStorage` |
|----------------|-----------------|
| Dark mode preference | Multi-step form draft |
| Persisted cart | Unsaved filter/sort state |
| Cookie consent | Temporary wizard state |
| Recently viewed | One-time session flags |

```ts
// hooks/useSessionStorage.ts
export function useSessionStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw === null) return defaultValue;
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : defaultValue;
    } catch { return defaultValue; }
  }, [key, schema, defaultValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((prev: T) => T)): void => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      // Note: no StorageEvent dispatch — sessionStorage is tab-scoped by design
    } catch {} // Quota exceeded — fail silently
  }, [key, storedValue]);

  const removeValue = useCallback((): void => {
    window.sessionStorage.removeItem(key);
    setStoredValue(defaultValue);
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}
```

---

## SU3. `useInterval` Hook

Never use raw `setInterval` in components. Always use this hook — it avoids stale closure bugs and cleans up properly.

```ts
// hooks/useInterval.ts
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    if (delay === null) return; // null pauses the interval
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

Pass `null` as delay to pause without unmounting.

For data polling, prefer TanStack Query `refetchInterval` — only use `useInterval` for UI-level timers (countdowns, clocks).

```tsx
// Countdown timer
const [secondsLeft, setSecondsLeft] = useState(300);
const [isRunning, setIsRunning] = useState(true);

useInterval(
  () => setSecondsLeft((s) => { if (s <= 1) setIsRunning(false); return Math.max(0, s - 1); }),
  isRunning ? 1000 : null
);

// Render with <time> element — use aria-live="off" (ticking on aria-live="polite" is disruptive)
<time dateTime={targetDate.toISOString()} aria-live="off">
  {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
</time>
```

---

## SU4. File Download — `downloadFile` Utility

```ts
// lib/download.ts
export function downloadFile(content: Blob | string, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: mimeType ?? "text/plain;charset=utf-8" });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

```ts
// Blob from API
const blob = await api.get("/reports/export", { responseType: "blob" });
downloadFile(blob.data, "report-2024-q4.pdf");

// Client-generated
downloadFile(JSON.stringify(data, null, 2), "export.json", "application/json");
```

---

## SU5. CSV Export and Import — PapaParse

```bash
npm install papaparse @types/papaparse
```

```ts
// lib/csv.ts
import Papa from "papaparse";
import { downloadFile } from "@/lib/download";

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) { toast.warning("No data to export."); return; }
  const exportData = columns
    ? data.map((row) => Object.fromEntries(columns.map(({ key, header }) => [header, row[key]])))
    : data;
  const csv = Papa.unparse(exportData as Record<string, unknown>[]);
  downloadFile(csv, filename.endsWith(".csv") ? filename : `${filename}.csv`, "text/csv;charset=utf-8");
}

export async function parseCsvFile<T>(file: File, schema: z.ZodType<T>): Promise<{ valid: T[]; errors: { row: number; message: string }[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: T[] = [];
        const errors: { row: number; message: string }[] = [];
        results.data.forEach((row, i) => {
          const result = schema.safeParse(row);
          result.success ? valid.push(result.data) : errors.push({ row: i + 2, message: result.error.errors.map((e) => e.message).join(", ") });
        });
        resolve({ valid, errors });
      },
      error: reject,
    });
  });
}
```

Always use the `columns` mapping on export — raw object keys are implementation details. Always validate imported rows with Zod.

---

## SU6. Print Styles

```css
/* globals.css */
@layer base {
  @media print {
    nav, aside, header, footer, [data-print-hide], .no-print { display: none !important; }
    body { background: white !important; color: black !important; font-size: 12pt; }
    article, section, .card, tr { break-inside: avoid; page-break-inside: avoid; }
    a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #555; }
    a[href^="#"]::after, a[href^="javascript:"]::after { content: ""; }
    @page { margin: 1.5cm; }
  }
}
```

```tsx
// Hide in print
<button className="print:hidden">Download</button>

// Show only in print
<p className="hidden print:block">Printed on {new Date().toLocaleDateString()}</p>

// Full-width in print
<aside className="w-64 print:hidden"><Sidebar /></aside>
<main className="ml-64 print:ml-0 print:w-full">{children}</main>
```

Use `data-print-hide` attribute on elements that can't be targeted by class.

---

## SU7. Keyboard Shortcuts — `react-hotkeys-hook`

> `@versions: react-hotkeys-hook@5.x`  
> v5 breaking changes from v4: `enabledScopes` → `activeScopes` on `HotkeysProvider`; key detection is now by physical `code` (not the produced `key` character — use `useKey: true` option to match on character instead); `splitKey` renamed to `delimiter`.

```bash
npm install react-hotkeys-hook
```

All shortcuts defined in one file so the cheat sheet can be generated from the same source:

```ts
// lib/shortcuts.ts
export const SHORTCUTS = {
  openCommandPalette: { keys: "mod+k", label: "Open command palette", group: "Navigation" },
  search:             { keys: "mod+f", label: "Search",               group: "Navigation" },
  newItem:            { keys: "c",     label: "Create new item",      group: "Actions" },
  save:               { keys: "mod+s", label: "Save",                 group: "Actions" },
  goToDashboard:      { keys: "g d",   label: "Go to dashboard",      group: "Navigation" },
} as const satisfies Record<string, { keys: string; label: string; group: string }>;
```

### Basic usage

```tsx
import { useHotkeys } from "react-hotkeys-hook";
import { SHORTCUTS } from "@/lib/shortcuts";

// Simple hotkey — fires when not focused on a form element
useHotkeys(SHORTCUTS.openCommandPalette.keys, (e) => { e.preventDefault(); setOpen(true); });

// enableOnFormTags: true — fires even when user is typing in an input or textarea
// Pass true (v5 shorthand) or an array ["INPUT", "TEXTAREA", "SELECT"] for fine-grained control
useHotkeys(SHORTCUTS.save.keys, handleSave, { enableOnFormTags: true });
```

### Scoped hotkeys (v5 — use when different app sections need isolated shortcut sets)

Wrap the app in `HotkeysProvider` and pass `activeScopes` (renamed from `enabledScopes` in v4):

```tsx
// main.tsx or AppShell.tsx
import { HotkeysProvider } from "react-hotkeys-hook";

<HotkeysProvider initiallyActiveScopes={["global"]}>
  <App />
</HotkeysProvider>
```

```tsx
// Inside a feature component — scope to "editor" when that panel is open
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";

const { activateScope, deactivateScope } = useHotkeysContext();

// Activate scope on mount, deactivate on unmount
useEffect(() => {
  activateScope("editor");
  return () => deactivateScope("editor");
}, [activateScope, deactivateScope]);

// This hotkey only fires when the "editor" scope is active
useHotkeys("mod+z", handleUndo, { scopes: ["editor"] });
```

`mod` maps to ⌘ on Mac and Ctrl on Windows/Linux automatically. Never override browser defaults (`Ctrl+W`, `Ctrl+T`, `Ctrl+P`).

Cheat sheet modal (`Shift+?` to open) is generated automatically from `SHORTCUTS` — add `<ShortcutCheatSheet />` to `AppShell`.

---

## SU8. Web Share API

```ts
// lib/share.ts
import { copyToClipboard } from "@/lib/clipboard"; // From react-security skill SEC6

export async function shareContent(data: { title: string; text?: string; url: string }): Promise<void> {
  if (navigator.share && navigator.canShare(data)) {
    try {
      await navigator.share(data);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") toast.error("Failed to share.");
      // AbortError = user cancelled — not an error
    }
    return;
  }
  const success = await copyToClipboard(data.url);
  toast[success ? "success" : "error"](success ? "Link copied to clipboard." : "Could not copy link.");
}
```

---

## Summary Cheatsheet — Storage & Utilities

| Concern | Standard |
|---------|----------|
| `localStorage` | `useLocalStorage(key, schema, defaultValue)` |
| `sessionStorage` | `useSessionStorage(key, schema, defaultValue)` |
| Key format | `app:[feature]-[data]` |
| Never store | Access tokens, passwords, PII |
| Interval timers | `useInterval(callback, delay)` — pass `null` to pause |
| Data polling | TanStack Query `refetchInterval` — not `useInterval` |
| File download | `downloadFile(content, filename)` |
| CSV export | `exportToCsv(data, filename, columns)` |
| CSV import | `parseCsvFile(file, schema)` — validate every row |
| Print styles | `@media print` in globals.css + Tailwind `print:` |
| Hide in print | `print:hidden` or `data-print-hide` |
| Keyboard shortcuts | `react-hotkeys-hook` + all shortcuts in `lib/shortcuts.ts` |
| Cross-platform modifier | `mod` (⌘ on Mac, Ctrl on Windows) |
| Shortcut cheat sheet | `<ShortcutCheatSheet />` opens with `Shift+?` |
| Web Share | `shareContent()` with clipboard fallback |
