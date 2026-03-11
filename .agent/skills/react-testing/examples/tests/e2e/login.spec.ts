// e2e/auth/login.spec.ts
// Playwright E2E test for the login critical path.
// Demonstrates: page.goto, getByRole/getByLabel, fill, click, expect.toBeVisible,
// API login shortcut (bypass UI for non-auth test setup),
// and page.waitForURL for navigation assertions.
//
// Copy this structure for your own E2E specs.

import { test, expect } from "@playwright/test";

// ── Auth state helpers ────────────────────────────────────────────────
// Save auth state once and reuse it across tests in this file.
// This prevents every test from going through the UI login flow.

test.describe("Login page", () => {
  // ── Happy path ──────────────────────────────────────────────────────

  test("logs in with valid credentials and redirects to dashboard", async ({ page }) => {
    // Arrange
    await page.goto("/login");

    // Act
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Assert — wait for navigation to complete
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  // ── Error states ────────────────────────────────────────────────────

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert")).toContainText("Invalid credentials");
    // Should NOT navigate away
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows validation errors for empty submission", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  // ── Redirect after login ────────────────────────────────────────────

  test("redirects to original destination after login", async ({ page }) => {
    // Navigate to a protected page while logged out
    await page.goto("/dashboard/settings");

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);

    // Log in
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should land on the original destination, not /dashboard
    await page.waitForURL("**/dashboard/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  // ── Accessibility ────────────────────────────────────────────────────

  test("login form is keyboard accessible", async ({ page }) => {
    await page.goto("/login");

    // Tab through the form using only the keyboard
    await page.keyboard.press("Tab"); // Focus email
    await page.keyboard.type("alice@example.com");

    await page.keyboard.press("Tab"); // Focus password
    await page.keyboard.type("password123");

    await page.keyboard.press("Tab");  // Focus submit button
    await page.keyboard.press("Enter"); // Submit

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});

// ── Session persistence ───────────────────────────────────────────────

test.describe("Authenticated session", () => {
  test("stays logged in on page refresh", async ({ page }) => {
    // Log in via API to skip the UI flow
    await page.request.post("/api/auth/login", {
      data: { email: "alice@example.com", password: "password123" },
    });

    await page.goto("/dashboard");
    await page.reload();

    // Should still be on dashboard, not redirected to login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("redirects to login after logout", async ({ page }) => {
    await page.request.post("/api/auth/login", {
      data: { email: "alice@example.com", password: "password123" },
    });

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Log out" }).click();

    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/\/login/);
  });
});
