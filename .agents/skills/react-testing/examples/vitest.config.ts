// vitest.config.ts
// Place at the project root alongside vite.config.ts.
//
// Key decisions:
//   - environment: "jsdom"  — simulates the browser DOM for React Testing Library
//   - setupFiles             — runs vitest.setup.ts before every test file
//   - coverage.provider: "v8" — faster than babel, no extra config needed
//   - coverage.thresholds    — enforced at CI level, fails the build if not met

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Resolves @/ path aliases in tests
  ],

  test: {
    // Simulate browser APIs (window, document, localStorage, etc.)
    environment: "jsdom",

    // Runs before each test file:
    //   - extends expect with @testing-library/jest-dom matchers
    //   - sets up MSW server lifecycle
    //   - extends expect with jest-axe matchers
    setupFiles: ["./src/tests/vitest.setup.ts"],

    // Allow importing .tsx files in tests without explicit extensions
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Files to measure coverage on
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/types/**",
        "src/components/ui/**", // shadcn generated — not our code to test
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],

      // Fail CI if coverage drops below these thresholds
      thresholds: {
        statements: 70,
        branches:   70,
        functions:  70,
        lines:      70,
      },
    },

    // Test file patterns
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
