// components/EmptyState.tsx
// Use on every component that renders a list, table, or data set.
// Never render an empty array without an explicit empty state.
//
// Usage:
//   {data.length === 0 && (
//     <EmptyState
//       icon={FileSearch}
//       title="No users found"
//       description="Try adjusting your search or filter to find what you're looking for."
//       action={{ label: "Clear filters", onClick: clearFilters }}
//     />
//   )}

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
  /** Defaults to "default" */
  variant?: "default" | "outline" | "ghost";
};

type EmptyStateProps = {
  /** Lucide icon — import from lucide-react and pass the component */
  icon: LucideIcon;
  /** What is empty — e.g., "No users found", "No results" */
  title: string;
  /** Why it might be empty and what the user can do */
  description: string;
  /** Optional call-to-action button */
  action?: EmptyStateAction;
  /** Defaults to "md". Use "sm" inside cards or sidebars. */
  size?: "sm" | "md" | "lg";
};

const SIZE_CONFIG = {
  sm: { wrapper: "py-8",  icon: "size-10", iconInner: "size-5", title: "text-sm",    desc: "text-xs" },
  md: { wrapper: "py-16", icon: "size-14", iconInner: "size-7", title: "text-sm",    desc: "text-sm" },
  lg: { wrapper: "py-24", icon: "size-20", iconInner: "size-9", title: "text-base",  desc: "text-sm" },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
}: EmptyStateProps) {
  const s = SIZE_CONFIG[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center ${s.wrapper}`}
      role="status"
      aria-label={title}
    >
      <div
        className={`flex items-center justify-center rounded-full bg-muted ${s.icon}`}
      >
        <Icon className={`text-muted-foreground ${s.iconInner}`} aria-hidden="true" />
      </div>

      <div className="space-y-1 max-w-xs">
        <p className={`font-semibold ${s.title}`}>{title}</p>
        <p className={`text-muted-foreground ${s.desc}`}>{description}</p>
      </div>

      {action && (
        <Button
          size="sm"
          variant={action.variant ?? "default"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
