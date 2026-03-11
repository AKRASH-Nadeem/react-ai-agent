// types/realtime.ts
// Single source of truth for connection state across SSE and WebSocket hooks.
// Import this type wherever useSSE or useWebSocket are used.

export type ConnectionState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "reconnecting"; attempt: number }
  | { status: "disconnected"; reason?: string }
  | { status: "error"; error: string };
