// src/tests/msw/handlers.ts
// Default MSW request handlers.
// These run in every test by default. Override per-test with server.use().
//
// Rules:
//   - Mirror your actual API contract exactly — wrong shapes here = false confidence
//   - Default handlers represent the happy path (200 + valid data)
//   - Override in specific tests for error states, empty states, edge cases
//   - Never mock at the axios/fetch level — always mock at the network level via MSW

import { http, HttpResponse } from "msw";

// ── Auth ──────────────────────────────────────────────────────────────

export const authHandlers = [
  http.post("/api/auth/login", () =>
    HttpResponse.json({
      accessToken: "mock-access-token",
      user: { id: "1", name: "Alice Smith", email: "alice@example.com", role: "member" },
    })
  ),

  http.post("/api/auth/refresh", () =>
    HttpResponse.json({ accessToken: "mock-access-token" })
  ),

  http.post("/api/auth/logout", () =>
    HttpResponse.json({ success: true })
  ),
];

// ── Users ─────────────────────────────────────────────────────────────

export const userHandlers = [
  http.get("/api/users", () =>
    HttpResponse.json([
      { id: "1", name: "Alice Smith", email: "alice@example.com", role: "admin" },
      { id: "2", name: "Bob Jones",   email: "bob@example.com",   role: "member" },
    ])
  ),

  http.get("/api/users/:id", ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    })
  ),

  http.patch("/api/users/:id", async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.delete("/api/users/:id", () =>
    HttpResponse.json({ success: true })
  ),
];

// ── Combine all handlers ──────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  // Add feature handlers here as your app grows
];
