// components/ConnectionIndicator.tsx
// Drop this into your components/ folder and use it on any real-time view.
// Shows a colored dot + label that reflects the current connection state.

import { cn } from "@/lib/utils";
import type { ConnectionState } from "@/types/realtime";

type StatusConfig = {
  label: string;
  dot: string;
};

const STATUS_CONFIG: Record<ConnectionState["status"], StatusConfig> = {
  idle:         { label: "Idle",          dot: "bg-muted-foreground" },
  connecting:   { label: "Connecting…",   dot: "bg-yellow-400 animate-pulse motion-reduce:animate-none" },
  connected:    { label: "Live",          dot: "bg-green-500" },
  reconnecting: { label: "Reconnecting…", dot: "bg-yellow-400 animate-pulse motion-reduce:animate-none" },
  disconnected: { label: "Disconnected",  dot: "bg-red-500" },
  error:        { label: "Error",         dot: "bg-red-600" },
};

type ConnectionIndicatorProps = {
  state: ConnectionState;
  className?: string;
};

export function ConnectionIndicator({ state, className }: ConnectionIndicatorProps) {
  const config = STATUS_CONFIG[state.status];

  const label =
    state.status === "reconnecting"
      ? `${config.label} (attempt ${state.attempt})`
      : state.status === "error"
      ? `${config.label}: ${state.error}`
      : config.label;

  return (
    <div
      className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${label}`}
    >
      <span className={cn("size-2 rounded-full shrink-0", config.dot)} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
