// features/auth/session.ts
// In-memory access token storage.
//
// WHY MEMORY INSTEAD OF localStorage:
//   localStorage is readable by any script on your domain — a single XSS
//   vulnerability exposes every user's token. A JS module variable is not
//   accessible to injected scripts.
//
//   The trade-off: the token is lost on page refresh. This is acceptable
//   because the refresh token (stored in an HttpOnly cookie by the server)
//   silently re-authenticates the user on app mount via POST /auth/refresh.
//
// This module is imported by:
//   - lib/api.ts          (attaches token to every request)
//   - features/auth/store (sets/clears on login/logout)

let accessToken: string | null = null;

/** Read the current in-memory access token. Returns null if not authenticated. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Store the access token after a successful login or token refresh. */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/** Clear the access token on logout or when a refresh fails. */
export function clearSession(): void {
  accessToken = null;
}
