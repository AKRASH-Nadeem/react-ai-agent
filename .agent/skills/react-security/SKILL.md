name: react-security
description: |
  Use when the project handles secrets, renders user-generated content, or needs
  security hardening. Trigger on: "XSS", "dangerouslySetInnerHTML",
  "user-generated content", "HTML injection", "CSRF", "cross-site",
  "Content Security Policy", "CSP", "API key", "secret key", "secret management",
  "environment secret", "private key", "credentials",
  "copy to clipboard", "clipboard API", "open redirect", "redirect validation",
  "npm audit", "dependency vulnerability", "security scan",
  rendering rich text, markdown, or user-controlled HTML.
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Security Standards

## SEC1. Environment Variables — Never Expose Secrets

```
# VITE_ prefix bundles the value into client JS — visible to anyone

# ✅ Safe — intended for client
VITE_API_BASE_URL=https://api.example.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ❌ NEVER — leaks secret to browser
VITE_STRIPE_SECRET_KEY=sk_live_...
VITE_DATABASE_URL=postgres://...
VITE_JWT_SECRET=my-secret-key
```

Always validate client env vars with Zod at startup — see the **react-rest-advanced** skill API3 for the `lib/env.ts` pattern.

---





## SEC2. XSS Prevention

React JSX escapes output by default. `dangerouslySetInnerHTML` is the only XSS entry point.

**Never use `dangerouslySetInnerHTML` without sanitization:**

```ts
// DOMPurify uses a default export — this is a required exception to the named-import rule.
// Its TypeScript types are defined as a default export and cannot be destructured.
import DOMPurify from "dompurify";

// ✅ Safe
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ❌ Never
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

Install: `npm install dompurify @types/dompurify`

When rendering markdown, use `react-markdown` to get a React component tree instead of raw HTML injection. `react-markdown` does not use `dangerouslySetInnerHTML` and is safe by default.

---

## SEC3. Sensitive Data in URLs

Never put sensitive data in query params — they appear in browser history, server logs, and referrer headers.

```
// ❌ Never
/reset-password?token=eyJhbGc...

// ✅ POST the token in the request body
POST /api/auth/reset-password  { token, newPassword }
```

---

## SEC4. CSRF Protection

For cookie-based auth (HttpOnly cookies), attach the CSRF token inside the **existing** request interceptor from the **react-rest-advanced** skill API1. Do not create a separate interceptor — extend the one already defined in `lib/api.ts`:

```ts
// lib/api.ts — CSRF block goes INSIDE the existing API1 request interceptor
api.interceptors.request.use((config) => {
  // Existing API1 logic: attach access token
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // SEC4 addition: attach CSRF token for mutating requests using cookie-based auth
  if (["post", "put", "patch", "delete"].includes(config.method ?? "")) {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];
    if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});
```

If using JWT in the `Authorization` header (stateless auth), CSRF is not applicable — skip this section.

---

## SEC5. Content Security Policy

Define CSP at the server/deployment level. Frontend must not break under it:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self';
  frame-ancestors 'none';
```

Rules: never use `eval()` or `new Function()`. Never inject inline scripts dynamically. If a third-party library requires `unsafe-eval`, find an alternative — do not weaken CSP.

---

## SEC6. Clipboard — `copyToClipboard` Utility

```ts
// lib/clipboard.ts
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts (HTTP)
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
```

---

## SEC7. Secret Fields — Mask Sensitive Input

```tsx
// components/SecretField.tsx
import { useState } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

export function SecretField({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      toast.success("Copied to clipboard.");
    } else {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
        {revealed ? value : "•".repeat(Math.min(value.length, 24))}
      </code>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
      >
        {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`Copy ${label}`}>
        <Copy className="size-4" />
      </Button>
    </div>
  );
}
```

---

## SEC8. Open Redirect Prevention

```ts
// lib/redirect.ts

// List every trusted origin for this app.
// window.location.origin covers the current domain (dev + prod).
// VITE_APP_URL covers cases where the app is served from a secondary origin.
const ALLOWED_ORIGINS = new Set([
  window.location.origin,
  import.meta.env.VITE_APP_URL,
].filter(Boolean)); // filter out undefined if VITE_APP_URL is not set

export function isSafeRedirectUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.origin);
    // Check against the full allowed-origins set — not just window.location.origin
    return ALLOWED_ORIGINS.has(resolved.origin);
  } catch {
    return false; // Malformed URLs are not safe
  }
}
```

Always use this check before any `navigate(from)` call — see the **react-auth-lifecycle** skill AUTH4.

---

## SEC9. Dependency Security

Add to CI pipeline:

```bash
npm audit --audit-level=high
```

Rules:
- Review `npm audit` output on every PR.
- Never merge PRs with high or critical vulnerabilities.
- Run `npm audit fix` for automated fixes. Review manually for breaking changes.
- Use `npm outdated` monthly to stay current on dependencies.

---

## Summary Cheatsheet — Security

| Concern | Standard |
|---------|----------|
| Client env vars | `VITE_` prefix only for public values |
| Server secrets | Never in frontend code or `.env` committed to repo |
| XSS | DOMPurify (default import — required exception) before any `dangerouslySetInnerHTML` |
| Markdown render | `react-markdown` — not raw HTML injection |
| CSRF (cookies) | Attach `X-CSRF-Token` inside the existing API1 request interceptor — do not create a second interceptor |
| Clipboard | `copyToClipboard()` utility with fallback |
| Secret display | `<SecretField>` with reveal toggle + copy |
| Open redirects | `isSafeRedirectUrl()` uses `ALLOWED_ORIGINS` Set — always before any redirect |
| Dependencies | `npm audit --audit-level=high` in CI |
