---
name: react-testing
requires:
  - vitest@^2
  - "@testing-library/react@^16"
  - msw@^2
  - "@playwright/test@^1"
description: |
  LOAD AUTOMATICALLY for: test, Vitest, Testing Library, MSW, Mock Service Worker,
  Playwright, coverage, unit test, integration test, E2E, test setup,
  vitest config, test environment, jest-axe, axe, accessibility test,
  write tests for, how do I test, test this component, test this hook.
  Load when the project needs test setup, test writing, or test infrastructure.
---
> **Version check required** — before using any example in this skill:
> `cat package.json | grep "vitest"` → if major differs from `requires:`, run the
> **Version-Aware Skill Protocol** in `versions.lock.md` and query Context7 with your
> installed version before writing code.

---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Testing Standards

> **Works with `react-edge-case-testing` skill.** This skill covers
> test setup, Vitest config, MSW setup, RTL patterns, and Playwright.
> `react-edge-case-testing` covers what to test and how to reason
> about failure scenarios. Both apply on every feature.


## TEST1. Stack

| Layer | Tool |
|---
> **Version check required** — before using any example in this skill:
> `cat package.json | grep "vitest"` → if major differs from `requires:`, run the
> **Version-Aware Skill Protocol** in `versions.lock.md` and query Context7 with your
> installed version before writing code.


----|------|
| Unit (utilities, hooks) | Vitest |
| Component (interactions, states) | Vitest + React Testing Library |
| API mocking | MSW (Mock Service Worker) |
| Accessibility | jest-axe |
| E2E (critical user flows) | Playwright |

```bash
npm install --save-dev vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  msw jest-axe @types/jest-axe

npm install --save-dev @playwright/test
npx playwright install
```

See `examples/vitest.config.ts` and `examples/playwright.config.ts` in this skill.

---



## TEST2. Philosophy

- **Test behavior, not implementation.** Tests break when features break, not when you refactor.
- **Never test internal state.** Test what the user sees and can interact with.
- **Query priority** (highest to lowest):
  1. `getByRole` — semantic element + ARIA role
  2. `getByLabelText` — form fields
  3. `getByText` — visible text
  4. `getByTestId` — last resort only
- **`data-testid` format:** `[feature]-[element]` — e.g., `data-testid="login-submit-button"`
- **Never use `screen.getByClassName` or `container.querySelector`** — they test implementation.

---

## TEST3. File Structure

Co-locate tests with the code they test:

```
src/features/auth/
├── LoginForm.tsx
├── LoginForm.test.tsx    ← component test
├── useAuth.ts
├── useAuth.test.ts       ← hook test
└── utils.ts
└── utils.test.ts         ← utility test

e2e/
├── auth/
│   └── login.spec.ts     ← Playwright E2E
└── checkout/
    └── checkout.spec.ts
```

---

## TEST4. Arrange → Act → Assert Pattern

Always use blank lines to separate the three phases:

```tsx
it("shows error message when login fails", async () => {
  // Arrange
  const user = userEvent.setup();
  render(<LoginForm />);

  // Act
  await user.type(screen.getByLabelText("Email"), "bad@email.com");
  await user.type(screen.getByLabelText("Password"), "wrongpassword");
  await user.click(screen.getByRole("button", { name: "Sign in" }));

  // Assert
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
});
```

---

## TEST5. MSW — Mock Service Worker

Mock the network layer, never Axios or fetch directly. MSW intercepts requests at the network level so your code runs exactly as it would in production.

See `examples/msw/` in this skill for the full setup: `handlers.ts`, `server.ts` (Node, for Vitest), `browser.ts` (browser, for development).

```ts
// Test with a specific handler override
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

it("shows error state when API fails", async () => {
  // Override the default handler for this test only
  server.use(
    http.get("/api/users", () => HttpResponse.json({ message: "Server Error" }, { status: 500 }))
  );

  render(<UserList />);
  expect(await screen.findByText("Failed to load users.")).toBeInTheDocument();
});
```

---

## TEST6. Utility Tests

Pure functions: 100% coverage. No rendering needed.

```ts
// lib/format.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats USD in English locale", () => {
    expect(formatCurrency(1234.56, "en", "USD")).toBe("$1,234.56");
  });

  it("returns $0.00 for zero", () => {
    expect(formatCurrency(0, "en", "USD")).toBe("$0.00");
  });
});
```

---

## TEST7. Hook Tests — `renderHook`

```ts
// hooks/useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "@/hooks/useCounter";

describe("useCounter", () => {
  it("starts at the initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments the count", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => { result.current.increment(); });

    expect(result.current.count).toBe(1);
  });
});
```

For hooks that use TanStack Query or React Router, wrap `renderHook` in the appropriate providers. See `examples/vitest.setup.ts` for the global wrapper.

---

## TEST8. Component Tests — All States Required

Every component test must cover every state the component can be in:

```tsx
// features/users/UserList.test.tsx
describe("UserList", () => {
  it("shows skeleton loaders while loading", () => {
    render(<UserList />);
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
  });

  it("shows empty state when no users returned", async () => {
    server.use(http.get("/api/users", () => HttpResponse.json([])));
    render(<UserList />);
    expect(await screen.findByText("No users found")).toBeInTheDocument();
  });

  it("renders the user list on success", async () => {
    render(<UserList />);
    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("shows error retry button when API fails", async () => {
    server.use(http.get("/api/users", () => HttpResponse.error()));
    render(<UserList />);
    expect(await screen.findByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
```

---

## TEST9. User Interactions — `userEvent`

Always use `@testing-library/user-event`. Never use `fireEvent` — it doesn't simulate real browser events.

```tsx
import userEvent from "@testing-library/user-event";

it("submits the form with valid data", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<ContactForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Name"), "Alice");
  await user.type(screen.getByLabelText("Email"), "alice@example.com");
  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(onSubmit).toHaveBeenCalledWith({ name: "Alice", email: "alice@example.com" });
});

it("shows validation errors with empty fields", async () => {
  const user = userEvent.setup();
  render(<ContactForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(screen.getByText("Name is required")).toBeInTheDocument();
  expect(screen.getByText("Email is required")).toBeInTheDocument();
});
```

---

## TEST10. Accessibility — jest-axe

Run axe on every shared component. Zero violations is the only acceptable result.

```tsx
// components/Button.test.tsx
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("has no accessibility violations", async () => {
  const { container } = render(
    <Button onClick={() => {}}>Submit form</Button>
  );
  expect(await axe(container)).toHaveNoViolations();
});

// Test the disabled state too — it has different a11y semantics
it("has no accessibility violations when disabled", async () => {
  const { container } = render(
    <Button onClick={() => {}} disabled>Submit form</Button>
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

---

## TEST11. Playwright E2E

Write E2E tests for critical user journeys only — login, checkout, core workflow. Not for every component state (that's component tests).

See `examples/tests/e2e/login.spec.ts` in this skill for a full example.

```ts
// e2e/checkout.spec.ts — critical path: add item → checkout → confirm
import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test.beforeEach(async ({ page }) => {
    // Log in via API to skip UI login in every test
    await page.request.post("/api/auth/login", {
      data: { email: "test@example.com", password: "testpass" },
    });
    await page.goto("/products");
  });

  test("completes a purchase end-to-end", async ({ page }) => {
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link",   { name: "Cart" }).click();
    await page.getByRole("button", { name: "Proceed to checkout" }).click();
    await page.getByLabel("Card number").fill("4242424242424242");
    await page.getByRole("button", { name: "Pay now" }).click();
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  });
});
```

---

## TEST12. Coverage Targets

| Target | Minimum |
|--------|---------|
| Utility functions | 100% |
| Custom hooks | 90% |
| Component interactions + states | All key states |
| E2E | 100% of defined critical paths |

```bash
# Run with coverage
npx vitest run --coverage

# View coverage report
open coverage/index.html
```

Coverage thresholds are enforced in `vitest.config.ts`. See `examples/vitest.config.ts`.

---

## Summary Cheatsheet — Testing

| Concern | Standard |
|---------|----------|
| Unit / component | Vitest + React Testing Library |
| API mocking | MSW — never mock fetch or axios directly |
| Query priority | `getByRole` → `getByLabelText` → `getByText` → `getByTestId` |
| User interactions | `userEvent` — never `fireEvent` |
| Hook tests | `renderHook` from `@testing-library/react` |
| Accessibility | `jest-axe` on every shared component |
| E2E | Playwright — critical paths only |
| All states | loading → error → empty → success — always test all four |
| Pattern | Arrange → Act → Assert with blank lines between phases |
| Test files | Co-located with source: `Button.tsx` + `Button.test.tsx` |
| E2E files | `e2e/[feature]/[flow].spec.ts` |
| Coverage | Utilities 100%, hooks 90%+, E2E all critical paths |
