name: react-realtime
description: |
  Use when the user needs real-time data, live updates, or persistent connections.
  Trigger on: "WebSocket", "Socket.io", "real-time", "live", "SSE",
  "Server-Sent Events", "chat", "messaging", "notifications" (push or live),
  "presence", "who's online", "live dashboard", "streaming", "collaborative",
  "multiplayer", "deployment logs", "build output", "AI streaming response",
  "EventSource", "ws://", "wss://", "useWebSocket", "useSSE",
  "ConnectionState", "reconnect", "exponential backoff".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Real-Time Communication Standards

## RT1. Protocol Decision Matrix

Choose before writing any code. Never switch protocols mid-project.

| Need | Protocol |
|---

---|----------|
| Server pushes to client only (feed, notifications, logs) | **SSE** — simpler, auto-reconnect, works over HTTP/2 |
| Bidirectional (chat, collaboration, games) | **WebSocket** — full-duplex, lower overhead |
| Infrequent updates (< 1 msg/min) | **Polling** via TanStack Query `refetchInterval` |
| Single long response body (AI streaming) | **SSE** |
| Mixed: server push + occasional client message | **SSE** + REST mutations |

**Never use WebSocket when SSE is sufficient.**

---



## RT2. Connection State — Discriminated Union

All real-time connections must use this exact union:

```ts
// types/realtime.ts
export type ConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "reconnecting"; attempt: number }
  | { status: "disconnected"; reason?: string }
  | { status: "error"; error: string };
```

---

## RT3. SSE — Standard `useSSE` Hook

```ts
// hooks/useSSE.ts
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { ConnectionState } from "@/types/realtime";

type UseSSEOptions<T> = {
  url: string;
  schema: z.ZodType<T>;
  onMessage: (data: T) => void;
  enabled?: boolean;
};

export function useSSE<T>({ url, schema, onMessage, enabled = true }: UseSSEOptions<T>) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function connect() {
      setConnectionState({ status: "connecting" });
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionState({ status: "connected" });
        reconnectAttemptRef.current = 0;
      };

      es.onmessage = (event) => {
        const result = schema.safeParse(JSON.parse(event.data));
        if (result.success) onMessage(result.data);
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        const attempt = ++reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000); // 1s→2s→4s→max 30s
        setConnectionState({ status: "reconnecting", attempt });
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    }

    connect();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      setConnectionState({ status: "disconnected" });
    };
    // Intentionally omitting `onMessage` and `schema` from deps:
    // Both are functions/objects defined inline at the call site and would change
    // reference on every render, causing the connection to tear down and reconnect
    // on every parent render. The connection lifecycle must be tied only to
    // `url` and `enabled` — the stable identity values that signal a real change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled]);

  return { connectionState };
}
```

---

## RT4. SSE — Typed Multi-Event Streams

When the server sends different event types on the same stream, use a discriminated union:

```ts
const sseMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("notification"), title: z.string(), body: z.string() }),
  z.object({ type: z.literal("status"), value: z.enum(["running", "done", "failed"]) }),
]);

// For named events, listen directly:
eventSource.addEventListener("notification", (event) => { /* handle */ });
eventSource.addEventListener("status", (event) => { /* handle */ });
```

---

## RT5. WebSocket — Standard `useWebSocket` Hook

```ts
// hooks/useWebSocket.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import type { ConnectionState } from "@/types/realtime";

type UseWebSocketOptions<TIn, TOut> = {
  url: string;
  incomingSchema: z.ZodType<TIn>;
  onMessage: (data: TIn) => void;
  enabled?: boolean;
};

export function useWebSocket<TIn, TOut>({ url, incomingSchema, onMessage, enabled = true }: UseWebSocketOptions<TIn, TOut>) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "idle" });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const messageQueueRef = useRef<TOut[]>([]);

  const send = useCallback((data: TOut): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      messageQueueRef.current.push(data);
    }
  }, []); // No deps — wsRef is a stable ref, never causes reconnects

  useEffect(() => {
    if (!enabled) return;

    function connect() {
      setConnectionState({ status: "connecting" });
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState({ status: "connected" });
        reconnectAttemptRef.current = 0;
        while (messageQueueRef.current.length > 0) {
          ws.send(JSON.stringify(messageQueueRef.current.shift()));
        }
      };

      ws.onmessage = (event) => {
        const result = incomingSchema.safeParse(JSON.parse(event.data));
        if (result.success) onMessage(result.data);
      };

      ws.onclose = () => {
        const attempt = ++reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000);
        setConnectionState({ status: "reconnecting", attempt });
        setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setConnectionState({ status: "error", error: "WebSocket error" });
        ws.close();
      };
    }

    connect();
    return () => { wsRef.current?.close(); };
    // Intentionally omitting `onMessage` and `incomingSchema` from deps:
    // These are defined inline at the call site and change reference every render.
    // Including them would tear down and reconnect the WebSocket on every parent
    // render, which is never the intended behavior. The connection lifecycle is
    // intentionally scoped to `url` and `enabled` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled]);

  return { connectionState, send };
}
```

---

## RT6. WebSocket Authentication

Never put tokens in the WebSocket URL query string — they appear in server logs.

```ts
// Pattern 1: Authenticate via cookie (preferred — server reads HttpOnly cookie)
const ws = new WebSocket(url); // No token needed if cookie is HttpOnly

// Pattern 2: Send token as first message after connection
ws.onopen = () => {
  ws.send(JSON.stringify({ type: "auth", token: getAccessToken() }));
};
```

---

## RT7. `ConnectionIndicator` Component

Every real-time UI must show connection state:

```tsx
import type { ConnectionState } from "@/types/realtime";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  idle:         { label: "Idle",          dot: "bg-muted-foreground" },
  connecting:   { label: "Connecting…",   dot: "bg-yellow-400 animate-pulse" },
  connected:    { label: "Live",          dot: "bg-green-500" },
  reconnecting: { label: "Reconnecting…", dot: "bg-yellow-400 animate-pulse" },
  disconnected: { label: "Disconnected",  dot: "bg-red-500" },
  error:        { label: "Error",         dot: "bg-red-600" },
} as const;

export function ConnectionIndicator({ state }: { state: ConnectionState }) {
  const config = STATUS_CONFIG[state.status];
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
      <span className={cn("size-2 rounded-full", config.dot)} aria-hidden="true" />
      <span>
        {config.label}
        {state.status === "reconnecting" ? ` (attempt ${state.attempt})` : ""}
      </span>
    </div>
  );
}
```

---

## RT8. Zustand Integration for Live State

For shared live data, store it in Zustand rather than local component state:

```ts
// features/notifications/store.ts
import { create } from "zustand";

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set((s) => ({
    notifications: [n, ...s.notifications].slice(0, 50),
    unreadCount: s.unreadCount + 1,
  })),
  markAllRead: () => set({ unreadCount: 0 }),
}));
```

---

## Summary Cheatsheet — Real-Time

| Concern | Standard |
|---------|----------|
| Server push only | SSE via `useSSE` hook |
| Bidirectional | WebSocket via `useWebSocket` hook |
| Infrequent polls | TanStack Query `refetchInterval` |
| Connection state | `ConnectionState` discriminated union |
| Reconnection | Exponential backoff: 1s→2s→4s→max 30s |
| Message validation | Zod schema on every incoming message |
| WS auth | Cookie (preferred) or first-message token |
| Queued messages | Buffer in `useWebSocket` while disconnected |
| UI feedback | `<ConnectionIndicator>` on every real-time view |
| Shared live state | Zustand store |
| `eslint-disable` deps | Always explain why in the comment above |
