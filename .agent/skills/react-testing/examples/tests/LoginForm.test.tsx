// src/tests/examples/LoginForm.test.tsx
// Example component test demonstrating:
//   - All four states (loading, error, empty, success)
//   - userEvent for interactions
//   - MSW handler overrides
//   - jest-axe accessibility check
//   - Arrange → Act → Assert pattern
//
// Copy this structure for your own component tests.

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { Providers } from "@/tests/Providers";   // See note below *
import { LoginForm } from "@/features/auth/LoginForm";

expect.extend(toHaveNoViolations);

// * Providers.tsx wraps the component in everything it needs:
//   QueryClientProvider, BrowserRouter, etc. Create this once and reuse everywhere.

const renderLoginForm = () =>
  render(<LoginForm />, { wrapper: Providers });

describe("LoginForm", () => {
  // ── Accessibility ──────────────────────────────────────────────────

  it("has no accessibility violations", async () => {
    const { container } = renderLoginForm();
    expect(await axe(container)).toHaveNoViolations();
  });

  // ── Initial render ─────────────────────────────────────────────────

  it("renders email and password fields", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  // ── Validation ─────────────────────────────────────────────────────

  it("shows validation errors when submitting empty fields", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    // Act — submit with no input
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows email format error for invalid email", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    // Act
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.tab(); // Trigger onBlur validation

    // Assert
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
  });

  // ── Loading state ──────────────────────────────────────────────────

  it("disables the submit button while loading", async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Button should be disabled while the request is in flight
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  // ── Success state ──────────────────────────────────────────────────

  it("calls onSuccess and redirects after successful login", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<LoginForm onSuccess={onSuccess} />, { wrapper: Providers });

    // Arrange
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert — wait for async mutation to complete
    expect(await screen.findByText("Welcome back, Alice!")).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  // ── Error state ───────────────────────────────────────────────────

  it("shows error toast when credentials are invalid", async () => {
    // Override the default handler for this test only
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
      )
    );

    const user = userEvent.setup();
    renderLoginForm();

    // Arrange
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");

    // Act
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("shows server error message when API is down", async () => {
    server.use(
      http.post("/api/auth/login", () => HttpResponse.error())
    );

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
  });
});
