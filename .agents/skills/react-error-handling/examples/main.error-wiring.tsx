// @versions react@^19  |  @tanstack/react-query@^5  |  @sentry/react@^8  |  react-router-dom@^7
// @breaking Sentry v8 init API changed from v7 — check migration guide if using v7
//
// main.tsx — annotated wiring example
// Shows the correct order and placement of all error infrastructure.
// This is a reference — adapt to your actual main.tsx, don't replace wholesale.
//
// ERROR INFRASTRUCTURE LAYERS:
//   1. Sentry.init()           — must be FIRST, before any imports that throw
//   2. lib/env.ts              — validates env vars at startup; throws if missing
//   3. QueryClient             — configured with retry logic and global error defaults
//   4. MSW dev worker          — optional, development only
//   5. Root ErrorBoundary      — catches catastrophic render failures
//   6. React strict mode       — double-invokes effects to surface bugs early

import * as Sentry from "@sentry/react";

// ── 1. Sentry must initialise before anything else ────────────────────
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,          // Disable in development
  tracesSampleRate: 0.1,                  // 10% of transactions — adjust per volume
  replaysOnErrorSampleRate: 1.0,          // 100% of sessions with errors
  replaysSessionSampleRate: 0.05,         // 5% of normal sessions
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});

// ── 2. Everything else after Sentry ──────────────────────────────────
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Toaster } from "sonner";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { App } from "@/App";

// lib/env.ts runs Zod validation on import — if an env var is missing,
// it throws here with a clear message rather than silently failing later
import "@/lib/env";

// ── 3. QueryClient — retry and error defaults ─────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Never retry on 4xx — they won't fix themselves
      // Retry up to 2 times on network errors and 5xx
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      // Keep stale data while refetching rather than showing a loading state
      staleTime: 30_000,
    },
  },
});

// ── 4. MSW — development only ─────────────────────────────────────────
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import("./tests/msw/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

// ── 5. Render ─────────────────────────────────────────────────────────
enableMocking().then(() => {
  const root = document.getElementById("root");
  if (!root) throw new Error("#root element not found in index.html");

  createRoot(root).render(
    <StrictMode>
      {/* Root ErrorBoundary — last line of defence for catastrophic failures */}
      <ErrorBoundary
        fallback={({ reset }) => (
          <ErrorFallback
            size="page"
            message="The application encountered a critical error."
            onRetry={() => {
              reset();
              window.location.reload(); // Hard reset for catastrophic failures
            }}
          />
        )}
      >
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
});
