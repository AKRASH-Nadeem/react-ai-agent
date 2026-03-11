// src/tests/msw/server.ts
// MSW server for use in Vitest (Node.js environment).
// Started/reset/stopped automatically by vitest.setup.ts.
//
// Import `server` in individual tests when you need to override a handler:
//
//   import { server } from "@/tests/msw/server";
//   import { http, HttpResponse } from "msw";
//
//   server.use(
//     http.get("/api/users", () => HttpResponse.json([], { status: 200 }))
//   );

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
