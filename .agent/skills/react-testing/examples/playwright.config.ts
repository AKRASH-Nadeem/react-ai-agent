// playwright.config.ts
// Playwright E2E test configuration.
// Place at the project root.
//
// Run all E2E tests:   npx playwright test
// Run with UI:         npx playwright test --ui
// Run specific file:   npx playwright test e2e/auth/login.spec.ts
// View last report:    npx playwright show-report

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // E2E tests live in the e2e/ folder, separate from unit/component tests
  testDir: "./e2e",

  // Run tests in parallel (one worker per CPU core by default)
  fullyParallel: true,

  // Fail the CI build immediately on any test failure
  // Set to false locally if you want to see all failures at once
  forbidOnly: !!process.env.CI,

  // Retry failed tests once in CI to reduce flakiness noise
  retries: process.env.CI ? 1 : 0,

  // Limit parallelism in CI to avoid resource contention
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["list"],                                    // Inline output
    ["html", { outputFolder: "playwright-report" }], // Full HTML report
  ],

  use: {
    // Base URL — tests use relative paths: page.goto("/login")
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4173",

    // Attach trace on first retry — invaluable for debugging CI failures
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure — helps understand what happened
    video: "retain-on-failure",
  },

  projects: [
    // Desktop browsers
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox",  use: { ...devices["Desktop Firefox"] } },
    { name: "webkit",   use: { ...devices["Desktop Safari"] } },

    // Mobile viewports
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],

  // Start the preview server before running E2E tests
  // Assumes `npm run build` has already been run in CI
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
