name: react-data-display
description: |
  Use when the project needs data tables, charts, virtual lists, or data visualization.
  Trigger on: "data table", "table with sorting", "filterable table", "paginated table",
  "TanStack Table", "react-table", "chart", "bar chart", "line chart", "pie chart",
  "graph", "visualization", "Recharts", "D3", "virtual list", "virtualized",
  "10,000 rows", "large dataset", "empty state", "no results", "nothing here",
  "z-index", "stacking context", "date format", "date-fns", "relative time", "time ago".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Data Display Standards

## DD1. Data Tables — TanStack Table

`@tanstack/react-table` is the standard for all interactive tables. shadcn's `<Table>` is for static display-only tables only.

Use TanStack Table whenever the user can: sort, filter, paginate, or select rows.

```ts
// features/users/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
    filterFn: "equals",
  },
];
```

**Client-side vs Server-side decision:**

| Use | When |
|---

--|------|
| Client-side sort/filter | Data set < 500 rows, fully loaded |
| Server-side sort/filter | Large data set, API-filtered, or authoritative filtering required |

For server-side tables, always sync state to URL params so sort/page/filter survive refresh.

---



## DD2. Empty States — Required on Every List

**Every component that can render a list MUST have an explicit empty state.** An empty array rendering nothing is never acceptable.

Every empty state must have: a visual element (icon), a title, a description, and an optional CTA.

```tsx
// components/EmptyState.tsx
type EmptyStateProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

---

## DD3. Charts — Recharts

Recharts is the standard charting library. All charts must include an accessible data table fallback (see the **react-accessibility** skill A11Y6).

```bash
npm install recharts
```

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <figure aria-label="Monthly revenue bar chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* Accessible fallback — always include */}
      <details className="sr-only">
        <summary>Chart data table</summary>
        <table>
          <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.month}><td>{d.month}</td><td>${d.revenue.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
```

Always use `hsl(var(--primary))` and design token colors — never hardcode hex values in charts.

---

## DD4. Virtualized Lists — TanStack Virtual

For lists with 500+ items, use `@tanstack/react-virtual`. Never render all rows to the DOM.

```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ position: "absolute", top: virtualItem.start, left: 0, width: "100%", height: virtualItem.size }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## DD5. Z-Index Named Scale

Never use arbitrary `z-[9999]` values. Define a named scale in `tailwind.config.ts` (v3) or as CSS variables (v4):

```ts
zIndex: {
  base:    "0",
  raised:  "10",   // Cards, slightly elevated content
  overlay: "20",   // Overlays, backdrop
  drawer:  "30",   // Drawers, side panels
  modal:   "40",   // Modals, dialogs
  toast:   "50",   // Toast notifications — always on top
  tooltip: "60",   // Tooltips — above modals
}
```

---

## DD6. Date Formatting

- **`date-fns`** for all date manipulation (add, subtract, compare, format).
- **`Intl.DateTimeFormat`** for locale-aware display — use the user's locale from `navigator.language`.
- **Never use `moment.js`.**

```ts
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function formatDisplayDate(date: Date): string {
  if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
  return format(date, "MMM d, yyyy");
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true }); // "3 minutes ago"
}
```

For locale-aware number and date formatting, use the browser's built-in `Intl` API:

```ts
// Locale-aware date display
export function formatLocalDate(date: Date, locale = navigator.language): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "long", day: "numeric",
  }).format(date);
}

// Locale-aware currency
export function formatCurrency(amount: number, locale = navigator.language, currency = "USD"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
```

If the project requires full string translation and language switching, fetch the `react-i18next` v15 documentation via Context7 MCP for the complete setup.

---

## Summary Cheatsheet — Data Display

| Concern | Standard |
|---------|----------|
| Interactive table | TanStack Table |
| Static display table | shadcn `<Table>` |
| Table state (sort/page/filter) | Sync to URL params |
| Empty list state | `<EmptyState>` — always required |
| Charts | Recharts + accessible `<table>` fallback |
| Large lists (500+ items) | TanStack Virtual |
| Z-index management | Named scale in config |
| Date manipulation | `date-fns` |
| Date/number display (locale) | `Intl.DateTimeFormat` / `Intl.NumberFormat` |
| Full i18n | Fetch `react-i18next` v15 docs via Context7 MCP |
| Never | `moment.js`, arbitrary `z-[9999]`, bare array renders |
