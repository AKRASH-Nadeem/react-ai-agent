// lib/env.ts
// Validates all client-visible environment variables at app startup.
// If any required variable is missing or malformed, the app throws immediately
// rather than failing silently at runtime.
//
// Import `env` from here everywhere. Never access import.meta.env directly.

import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url("VITE_API_BASE_URL must be a valid URL"),
  VITE_APP_URL:      z.string().url("VITE_APP_URL must be a valid URL"),

  // Optional — add yours below as needed
  // VITE_SENTRY_DSN:           z.string().optional(),
  // VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  // VITE_GRAPHQL_URL:          z.string().url().optional(),
  // VITE_GRAPHQL_WS_URL:       z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);

// TypeScript: extend this type when you add new env vars above
export type Env = z.infer<typeof envSchema>;
