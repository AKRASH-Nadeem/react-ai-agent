// src/tests/vitest.setup.ts
// Runs once before each test file via vitest.config.ts setupFiles.
//
// This file:
//   1. Extends `expect` with @testing-library/jest-dom matchers
//      (toBeInTheDocument, toHaveTextContent, toBeVisible, etc.)
//   2. Extends `expect` with jest-axe matchers (toHaveNoViolations)
//   3. Starts and resets the MSW server around each test
//   4. Provides a helper to wrap components in all required providers

import "@testing-library/jest-dom";
import { expect, afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { server } from "./msw/server";

// ── jest-axe ──────────────────────────────────────────────────────────

expect.extend(toHaveNoViolations);

// ── MSW Server Lifecycle ──────────────────────────────────────────────

// Start the MSW server before all tests in the file
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test so overrides don't bleed between tests
afterEach(() => {
  server.resetHandlers();
  cleanup(); // RTL cleanup — unmounts rendered components
});

// Stop the server after all tests in the file
afterAll(() => server.close());

// ── Browser API Mocks ─────────────────────────────────────────────────

// window.matchMedia — needed for components that use useMediaQuery or
// Tailwind's dark mode detection. JSDOM doesn't implement it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver — needed for useInView, lazy-load components,
// and any component that uses IntersectionObserver directly. JSDOM doesn't implement it.
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ResizeObserver — needed for TanStack Virtual, recharts ResponsiveContainer,
// and any component that observes element dimensions. JSDOM doesn't implement it.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
