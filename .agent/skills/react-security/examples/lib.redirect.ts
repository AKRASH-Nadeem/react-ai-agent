// lib/redirect.ts
// Open redirect prevention utility.
//
// Always call isSafeRedirectUrl() before any navigate(from) call.
// Never trust user-supplied redirect URLs without validation.
//
// Example attack vector (open redirect):
//   /login?from=https://evil.com/steal-credentials
//   If your app does navigate(from) without checking, users get redirected
//   to attacker-controlled pages after login.
//
// This utility only allows redirects to the same origin.

/**
 * Returns true if the URL is safe to redirect to.
 * Safe = same origin as the current page.
 *
 * @example
 *   isSafeRedirectUrl("/dashboard")              // true
 *   isSafeRedirectUrl("https://myapp.com/dash")  // true (same origin)
 *   isSafeRedirectUrl("https://evil.com")        // false
 *   isSafeRedirectUrl("javascript:alert(1)")     // false
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url) return false;

  try {
    // Resolve relative paths against the current origin
    const resolved = new URL(url, window.location.origin);

    // Only allow same-origin redirects
    return resolved.origin === window.location.origin;
  } catch {
    // URL constructor throws for malformed URLs (e.g., "javascript:alert(1)")
    return false;
  }
}

/**
 * Returns the URL if it is safe, otherwise returns the fallback.
 *
 * @example
 *   const destination = safeRedirect(from, "/dashboard");
 *   navigate(destination, { replace: true });
 */
export function safeRedirect(url: string | null | undefined, fallback = "/"): string {
  if (url && isSafeRedirectUrl(url)) return url;
  return fallback;
}
