---
name: react-edge-case-testing
description: >
  Apply this skill for ALL feature implementation and test writing in React.
  Teaches HOW to think about failure — not what failures to look for.
  Activates alongside react-testing whenever a component, hook, or feature
  is being designed, implemented, or tested.
  Trigger on: any new feature, component, hook, "write tests", "add tests",
  "what could go wrong", "implement this", "how should I test this",
  any form, any API integration, any real-time feature, any auth flow.
---

# React — Failure-First Reasoning & Edge-Case Testing Philosophy

> FIRST: Use Context7 to verify current React Testing Library, Vitest, MSW,
> and Playwright patterns before writing any test infrastructure.

---

## Why This Skill Exists

A React component renders correctly in development with good data,
fast networks, and a logged-in user. None of those conditions are
guaranteed in production.

Edge cases in frontend code are not obscure theoretical problems.
They are the normal conditions of real users: slow 3G connections,
interrupted requests, expired sessions, empty databases, rapid
double-clicks, browser storage disabled, screen readers, and network
failures mid-form. These are not rare — they are the majority
of real usage conditions.

A test suite that only runs against a happy-path MSW handler, a fast
network, and a fresh authenticated session is not testing the
application. It is testing a simulation of the best possible conditions.

---

## The Failure-First Mindset

Before writing any component or hook code, the agent adopts this posture:

> "This feature will fail under some real user condition.
> My job is to discover that condition before it reaches a user,
> build a defence, and prove the defence works."

The adversarial questions below are not a checklist.
They are a thinking process the agent applies to the specific feature
in the specific context, generating concrete scenarios that become tests.

---

## Phase 1 — Adversarial Questioning (before writing code)

### The Connection Question
What if the network is unavailable, slow, or interrupted at the worst
possible moment?

Think about every API call this feature makes. What does the user see
if the request takes 8 seconds? What if it never completes? What if it
fails after the user has already seen partial success feedback? What if
it fails mid-upload, mid-form-submit, or mid-checkout? The question
does not ask "does a loading state exist" — it asks what the full
failure path looks like and whether the user has a recovery action at
the end of it. A spinner that spins forever is not error handling.

### The Staleness Question
What if the data the component is displaying is no longer accurate
by the time the user acts on it?

Think about every piece of data rendered as a basis for action. A
product shown as "in stock" may be out of stock by the time the user
clicks "Add to Cart." A price shown on a checkout page may have changed
since it was fetched. A user's role shown in the UI may have been
revoked. The question surfaces whether the feature re-validates data
at the moment of action, not just at the moment of display. Stale data
and optimistic UI are different design choices — but both must be tested
explicitly, not assumed.

### The Racing Request Question
What if multiple requests are in flight at the same time and they
complete in an unexpected order?

Think about every feature that fires API calls in response to user
actions. A search field fires a request on each keystroke — the third
response can arrive before the second, overwriting the correct results
with stale ones. A user navigates away from a page while a request
is in flight — the response arrives and updates state in a component
that no longer exists. The question surfaces whether request
cancellation, debouncing, or component-unmount cleanup is required.
The absence of any of these is a production bug, not a nice-to-have.

### The Session Boundary Question
What if the user's authentication state changes during their interaction?

Think about what happens to this feature when the session expires,
when the access token is rejected, when the user is logged out in
another tab, or when their permissions are revoked while they are
mid-task. A form that takes 5 minutes to complete can outlive a
15-minute access token. A user who is an admin when they load a page
may not be an admin when they submit the action on it. The question
surfaces whether the feature handles 401 responses gracefully, whether
token refresh is transparent to the user, and whether a session change
in one tab propagates to others.

### The Empty and Zero Question
What if there is no data, or the data is at its minimum possible value?

Think about every list, every count, every fetch result. An empty
array is not the same as a loading state and not the same as an error.
A count of zero is not the same as a missing field. A user with no
orders, no messages, no products, no history is a real user — and they
are the most commonly undertested user in the system. The question
surfaces whether every data-dependent view has a designed and tested
empty state that is distinct from loading and distinct from error.

### The Invalid Input Question
What if the user sends data that is technically submittable but wrong?

Think beyond required-field validation. A valid-looking email that is
not deliverable. A date range where the end is before the start.
A currency amount with 4 decimal places where 2 are expected. A file
that is the right type but too large, or the right size but the wrong
type. A username with valid characters but a length of 300. The
question surfaces whether validation logic handles the specific invalid
conditions that are likely for this feature — not just presence and
format, but semantic validity.

### The Double-Action Question
What if the user triggers the same action twice before the first
completes?

Think about every button, every form submit, every link click. A user
with a slow connection clicks "Place Order" and it appears to do nothing,
so they click again. A user clicks "Delete" and the confirmation dialog
appears, then they click the button again before the dialog renders.
The question surfaces whether actions are disabled during in-flight
requests, whether idempotency is enforced, and whether the UI clearly
communicates that an action is in progress. These are not edge cases —
they are what users do on any latency above 200ms.

### The Browser Environment Question
What if the browser API this feature depends on is unavailable or
behaves differently than expected?

Think about every browser API used. `localStorage` is unavailable in
private browsing on some browsers and throws a `SecurityError` rather
than silently returning null. The `clipboard` API requires explicit
permission. The `share` API is mobile-only. `IntersectionObserver`
requires a polyfill in some contexts. `matchMedia` needs mocking in
tests. The question surfaces whether each browser API usage has a
feature-detection check and a fallback, and whether the test environment
correctly simulates the environments where the feature will run.

### The Accessibility as Edge Case Question
What if the user is not using a mouse on a standard screen?

This is not a separate accessibility concern — it is an edge case in
the standard feature. A dropdown that opens on click but traps focus
with no keyboard escape is broken for keyboard users. A loading state
with no `aria-live` region is invisible to screen readers. A modal that
shifts visual focus but not programmatic focus breaks navigation for
assistive technology users. The question surfaces these as failures of
the feature, not as optional accessibility enhancements, and surfaces
the specific interaction paths that must be verified.

---

## Phase 2 — From Scenarios to Tests

The adversarial questions produce scenarios. A scenario becomes a
test case when it can be stated as:

> "Given [specific application state and MSW handler configuration],
> when [specific user action or event sequence],
> then [specific DOM state must be true and specific wrong state must not]."

If a scenario cannot be expressed this way, it is not concrete enough.
Keep applying the adversarial question until the scenario names
specific UI elements, specific error states, and specific user actions.

The test must fail before the defensive code exists and pass after it.
If it passes with no defensive code, it tests nothing.

---

## Phase 3 — Verifying the Test Tests What It Claims

For every defensive mechanism added to the implementation:

1. Write the test that proves the defence holds
2. Remove or comment out the defensive code (the guard, the cleanup,
   the disabled state, the error boundary, the cancellation)
3. Confirm the test now fails
4. Restore the defence
5. Confirm the test passes again

If removing the defence does not make the test fail, the test is not
testing the defence. This is not a theoretical check — it catches
the majority of tests that appear to cover a scenario but actually
do not because they test the wrong observable or at the wrong timing.

---

## Phase 4 — The Standard for "Tested"

A component's tests are complete when:

- The adversarial questions have been applied to this specific component
- Every question that surfaced a real scenario has a test
- Each test would fail if the defensive code were removed
- The four required states are covered: loading, error, empty, success
- The specific error states — not just "shows an error" but which error
  in which recovery path — are each tested

A custom hook's tests are complete when:

- The hook behaves correctly when its dependencies fail
- The hook cleans up correctly when the component unmounts
- The hook does not cause state updates on unmounted components
- Concurrent calls to the hook produce the expected final state

A user interaction flow's tests are complete when:

- The happy path is verified
- The failure path at every possible failure point is verified
- The double-action path is verified for any stateful action
- The keyboard navigation path is verified for any interactive element
- The screen at each transition point is verified (loading → error,
  loading → empty, loading → success, success → re-fetch)

---

## Phase 5 — Using Context7 During Test Writing

When the adversarial questions produce a scenario the agent does not
know how to test, the right response is to query Context7 for the
current testing pattern rather than guessing or approximating.

This skill generates these types of Context7 queries:

- For testing request cancellation: "react testing library abort controller cancel request"
- For testing token expiry: "msw v2 test 401 response token refresh"
- For testing unmount cleanup: "vitest react testing library component unmount side effects"
- For testing localStorage failure: "vitest stub localStorage SecurityError"
- For testing race conditions: "react testing library concurrent requests order"
- For testing keyboard navigation: "testing library user-event keyboard tab navigation"
- For testing aria-live: "jest-axe testing library aria-live region announcement"

The adversarial questions surface what needs testing.
Context7 provides the current, version-accurate way to write the test.

---

## Phase 6 — MSW as Failure Simulation, Not Just Mocking

MSW is commonly used to simulate a working API. Its more important use
is to simulate a failing API — systematically, at different failure points.

For every API call a feature makes, there must be MSW handler variants
covering at minimum: the success case, the error case (4xx or 5xx),
the network failure case (no response), the slow response case (delays
that reveal whether loading states work correctly), and the empty
success case (200 with an empty array or null body).

The scenario tested is not "MSW returns an error." The scenario is
"the payment endpoint returns 402, and the user sees a specific message
about their card being declined with a link to update payment details."
Specific conditions produce specific UI states. Testing specificity
is what makes tests useful.

---

## Relationship to react-testing

`react-testing`: how to set up Vitest, configure MSW, write test
structure, use renderHook, run Playwright E2E.

`react-edge-case-testing`: what to test and how to think about whether
the right things have been tested.

Both apply on every feature. Neither is optional.
