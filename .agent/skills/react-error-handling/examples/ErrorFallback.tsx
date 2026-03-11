// @versions lucide-react@^0.460  |  shadcn/ui Button
// @breaking lucide icon names changed in v0.400 — verify AlertTriangle exists in your version
//
// components/ErrorFallback.tsx
// Standard fallback UI used by ErrorBoundary instances.
// Covers three contexts: full page crash, section crash, widget crash.
//
// Usage:
//   // Page-level (route ErrorBoundary)
//   <ErrorBoundary fallback={({ error, reset }) =>
//     <ErrorFallback size="page" message={error.message} onRetry={reset} />
//   }>
//
//   // Widget-level (feature ErrorBoundary)
//   <ErrorBoundary fallback={({ reset }) =>
//     <ErrorFallback size="widget" message="Failed to load chart." onRetry={reset} />
//   }>

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorFallbackProps = {
  /** The error message to show — keep it human-friendly, not the raw Error.message */
  message?: string;
  /** Callback to attempt recovery — triggers ErrorBoundary.reset() */
  onRetry?: () => void;
  /** "page" = full page, "section" = card/panel, "widget" = small inline area */
  size?: "page" | "section" | "widget";
};

const SIZE_CONFIG = {
  page:    { wrapper: "min-h-screen",   icon: "size-16", text: "text-base" },
  section: { wrapper: "min-h-64 py-12", icon: "size-12", text: "text-sm"   },
  widget:  { wrapper: "min-h-24 py-6",  icon: "size-8",  text: "text-xs"   },
};

export function ErrorFallback({
  message = "Something went wrong. Please try again.",
  onRetry,
  size = "section",
}: ErrorFallbackProps) {
  const s = SIZE_CONFIG[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${s.wrapper}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center rounded-full bg-destructive/10 p-3">
        <AlertTriangle className={`text-destructive ${s.icon}`} aria-hidden="true" />
      </div>

      <div className="space-y-1 max-w-sm">
        <p className={`font-semibold text-foreground ${s.text}`}>
          Something went wrong
        </p>
        <p className={`text-muted-foreground ${s.text}`}>{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
