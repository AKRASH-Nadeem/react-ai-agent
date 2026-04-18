---
name: react-testing
requires:
  - vitest@^2
  - "@testing-library/react@^16"
  - msw@^2
description: |
  LOAD AUTOMATICALLY for: test, Vitest, Testing Library, MSW, Mock Service Worker,
  coverage, unit test, integration test, test setup,
  vitest config, test environment, jest-axe, axe, accessibility test,
  write tests for, how do I test, test this component, test this hook.
  Load when the project needs test setup, test writing, or test infrastructure.
  Note: E2E browser testing is handled by Antigravity's built-in browser — no Playwright needed.
---
> **Version check required** — before using any example in this skill:
> `cat package.json | grep "vitest"` → if major differs from `requires:`, run the
> **Version-Aware Skill Protocol** in `versions.lock.md` and query Context7 with your
> installed version before writing code.

---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Testing Standards

> **Works with `react-edge-case-testing` skill.** This skill covers
> test setup, Vitest config, MSW setup, and RTL patterns.
> `react-edge-case-testing` covers what to test and how to reason
> about failure scenarios. Both apply on every feature.
>
> **E2E testing:** Handled by Antigravity's built-in browser agent — no additional package required.
> Use Antigravity's browser tools to navigate to `localhost:5173`, interact with the app, and verify critical user flows.

---

## TEST1. Stack

| Layer | Tool |
|---|---|
| Unit (utilities, hooks) | Vitest |
| Component (interactions, states) | Vitest + React Testing Library |
| API mocking | MSW (Mock Service Worker) |
| Accessibility | jest-axe |
| E2E (critical user flows) | Antigravity's built-in browser agent |

```bash
npm install --save-dev vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  msw jest-axe @types/jest-axe
```

See `examples/vitest.config.ts` in this skill.

---

## TEST2. Philosophy

- Test **behaviour**, not implementation details
- Test from the user's perspective: what does the user see and do?
- Never test internal state directly — test what renders
- MSW handles all API mocking — never mock `fetch` or modules directly
- Every component test must cover: loading state, error state, empty state, success state

---

## TEST3. Vitest + React Testing Library Patterns

### Component test structure

```typescript
// src/features/auth/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('shows error when credentials are invalid', async () => {
    server.use(
      http.post('/api/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    )
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i)
  })

  it('shows empty state when no data', async () => {
    server.use(http.get('/api/items', () => HttpResponse.json([])))
    render(<ItemList />)
    expect(await screen.findByText(/no items yet/i)).toBeInTheDocument()
  })
})
```

### Testing async hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserProfile } from './useUserProfile'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

it('fetches user profile', async () => {
  const { result } = renderHook(() => useUserProfile('user-1'), { wrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data?.name).toBe('Test User')
})
```

---

## TEST4. MSW Setup

```typescript
// src/test/msw/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

```typescript
// src/test/msw/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () =>
    HttpResponse.json({ id: '1', name: 'Test User', email: 'test@example.com' })
  ),
  http.post('/api/auth/login', () =>
    HttpResponse.json({ token: 'mock-jwt-token' })
  ),
]
```

```typescript
// src/test/msw/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)
```

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '@/test/msw/server'
import '@testing-library/jest-dom'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## TEST5. Accessibility Testing with jest-axe

Every component test must include an axe check:

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<LoginForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## TEST6. Failure Scenarios to Always Cover

For every feature, the MSW handler set must include all four states:

```typescript
// Happy path
http.get('/api/items', () => HttpResponse.json([...items]))

// Empty state
http.get('/api/items', () => HttpResponse.json([]))

// Error state
http.get('/api/items', () =>
  HttpResponse.json({ message: 'Server error' }, { status: 500 })
)

// 401 — session expired mid-interaction
http.post('/api/action', () =>
  HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
)
```

Each handler corresponds to a named test assertion in `react-edge-case-testing` Phase 5.

---

## TEST7. What NOT to Test

- Internal state variables — test what renders, not how it stores state
- Implementation details (class names, internal hook return shapes)
- Snapshot tests — they break on every style change and provide no signal
- Third-party library internals (MSW, React Router, TanStack Query internals)
- CSS styling directly — test behaviour and rendered content

---

## TEST8. Coverage Targets

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
  include: ['src/**/*.{ts,tsx}'],
  exclude: ['src/**/*.stories.*', 'src/test/**', 'src/types/**', 'src/main.tsx'],
}
```

80% line coverage on new code is the floor. Higher on critical paths (auth, payments, mutations).

---

## TEST9. CI Integration

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage
- name: Upload coverage
  uses: codecov/codecov-action@v4
```

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```
