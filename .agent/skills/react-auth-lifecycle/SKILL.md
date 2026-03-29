---
name: react-auth-lifecycle
requires:
  - react-router-dom@^7
description: |
  Use when the project has user authentication, authorization, or session management.
  Trigger on: "login", "logout", "sign in", "sign out", "authentication",
  "protected route", "private route", "auth guard", "redirect to login",
  "JWT", "access token", "refresh token", "session",
  "role", "permission", "RBAC", "admin vs user", "access control",
  "OAuth", "social login", "Google login", "GitHub login",
  "session expiry", "token expiry", "force logout",
  "user profile", "current user", "useAuth", "auth state",
  "Clerk", "Auth.js", "Supabase Auth", "Firebase Auth".
---
> **Version check required** — before using any example in this skill:
> `cat package.json | grep "react-router-dom"` → if major differs from `requires:`, run the
> **Version-Aware Skill Protocol** in `versions.lock.md` and query Context7 with your
> installed version before writing code.

---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Auth Lifecycle Standards

## AUTH1. Token Storage — Memory Only

**Access tokens go in memory (a JS module variable), never in `localStorage`.**

`localStorage` is accessible to any script on your domain — XSS vulnerability. Memory is wiped on refresh, which is acceptable because the refresh token (HttpOnly cookie set by server) re-authenticates silently.

```ts
// features/auth/session.ts
let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string): void => { accessToken = token; };
export const clearSession = (): void => { accessToken = null; };
```

The Axios request interceptor uses `getAccessToken()` — see the **react-rest-advanced** skill API1.

---





## AUTH2. Auth State — Zustand

```ts
// features/auth/types.ts — export Role from a shared types file so AUTH3/AUTH5 can import it
export type Role = "admin" | "member" | "viewer";
export type User = { id: string; name: string; email: string; role: Role };
```

```ts
// features/auth/store.ts
import { create } from "zustand"; // v5: named import required — no default export
import type { User } from "@/features/auth/types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;  // true on app start — resolves after session check
  setUser: (user: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));
```

On app mount, silently refresh the access token. Call this in `main.tsx` before rendering:

```ts
// features/auth/initializeSession.ts
import { api } from "@/lib/api";
import { setAccessToken } from "@/features/auth/session";
import { useAuthStore } from "@/features/auth/store";
import type { User } from "@/features/auth/types";

export async function initializeSession(): Promise<void> {
  try {
    const { accessToken, user } = await api
      .post<{ accessToken: string; user: User }>("/auth/refresh")
      .then((r) => r.data);
    setAccessToken(accessToken);
    useAuthStore.getState().setUser(user);
  } catch {
    useAuthStore.getState().clearAuth();
  }
}
```

---

## AUTH3. Protected Routes

```tsx
// components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import type { Role } from "@/features/auth/types";
import { FullPageSpinner } from "@/components/FullPageSpinner";

type ProtectedRouteProps = {
  requiredRoles?: Role[]; // array — consistent with PermissionGate in AUTH5
};

export function ProtectedRoute({ requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (requiredRoles && (!user?.role || !requiredRoles.includes(user.role))) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
```

Router usage:
```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    {/* Admin-only section */}
    <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
      <Route path="/admin" element={<AdminPage />} />
    </Route>
    {/* Admin or member — passes an array */}
    <Route element={<ProtectedRoute requiredRoles={["admin", "member"]} />}>
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Route>
</Routes>
```

---

## AUTH4. Post-Login Redirect

After login, redirect to the original intended destination:

```tsx
import { useLocation, useNavigate } from "react-router-dom";
import { setAccessToken } from "@/features/auth/session";
import { useAuthStore } from "@/features/auth/store";
import { isSafeRedirectUrl } from "@/lib/redirect"; // react-security SEC8
import type { User } from "@/features/auth/types";

const location = useLocation();
const navigate = useNavigate();
const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

// Inside useMutation onSuccess:
onSuccess: ({ accessToken, user }: { accessToken: string; user: User }) => {
  setAccessToken(accessToken);
  useAuthStore.getState().setUser(user);
  const safeRedirect = isSafeRedirectUrl(from) ? from : "/dashboard";
  navigate(safeRedirect, { replace: true });
}
```

The `isSafeRedirectUrl()` check comes from the **react-security** skill SEC8.

---

## AUTH5. RBAC — Role-Based Access Control

```tsx
// components/PermissionGate.tsx
import { useAuthStore } from "@/features/auth/store";
import type { Role } from "@/features/auth/types";

export function PermissionGate({ allowedRoles, children, fallback = null }: {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuthStore();
  if (!user || !allowedRoles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
```

```ts
// hooks/usePermission.ts
import { useAuthStore } from "@/features/auth/store";
import type { Role } from "@/features/auth/types";

export function usePermission(allowedRoles: Role[]): boolean {
  const { user } = useAuthStore();
  return user !== null && allowedRoles.includes(user.role);
}
```

Always guard both the UI (hide elements) AND the action (check permission before mutation). Never rely solely on hidden UI:

```tsx
// ✅ Correct: guard both display and action
<PermissionGate allowedRoles={["admin"]}>
  <DeleteButton onClick={handleDelete} />
</PermissionGate>

// In handleDelete — also guard the mutation:
const canDelete = usePermission(["admin"]);
const handleDelete = () => {
  if (!canDelete) return; // redundant but safe
  deleteItem.mutate(id);
};
```

---

## AUTH6. Session Expiry Warning

```ts
// hooks/useSessionExpiry.ts
import { useState, useEffect } from "react";
import { clearSession } from "@/features/auth/session";
import { useAuthStore } from "@/features/auth/store";

export function useSessionExpiry(expiresAt: number | null) {
  const [showWarning, setShowWarning] = useState(false);
  const WARNING_BEFORE_MS = 5 * 60 * 1000; // Warn 5 minutes before expiry

  useEffect(() => {
    if (!expiresAt) return;
    const timeUntilWarning = expiresAt - Date.now() - WARNING_BEFORE_MS;
    const timeUntilExpiry = expiresAt - Date.now();

    // Already within the warning window
    if (timeUntilWarning <= 0) setShowWarning(true);

    const warningTimer = timeUntilWarning > 0
      ? setTimeout(() => setShowWarning(true), timeUntilWarning)
      : null;

    const expiryTimer = setTimeout(() => {
      clearSession();
      useAuthStore.getState().clearAuth();
      // Hard navigation — intentional: clears all React state + React Query cache
      window.location.href = "/login?reason=expired";
    }, timeUntilExpiry);

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
    };
  }, [expiresAt]);

  return { showWarning };
}
```

---

## AUTH7. Logout

```ts
// features/auth/hooks/useLogout.ts
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { clearSession } from "@/features/auth/session";
import { useAuthStore } from "@/features/auth/store";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: () => api.post("/auth/logout"), // Clears refresh token cookie server-side
    onSettled: () => {
      clearSession();
      useAuthStore.getState().clearAuth();
      queryClient.clear(); // Clear cached data — critical on shared devices
      navigate("/login", { replace: true });
    },
  });

  return logout;
}
```

Always call the logout API — the server must clear the HttpOnly refresh token cookie. Always call `queryClient.clear()` to prevent data leaks between sessions.

---

## AUTH8. Social Login

Lucide-react does not include brand icons (removed in v0.263). The only correct approach is to use the official SVG assets from each provider's brand kit.

```
// Place provider SVGs in public/icons/
public/
  icons/
    google.svg    ← from Google Brand Guidelines
    github.svg    ← from GitHub Logos
    microsoft.svg ← from Microsoft Brand Center
```

```tsx
// components/SocialLoginButton.tsx
import { Button } from "@/components/ui/button";

const PROVIDER_CONFIG = {
  google:    { label: "Continue with Google",    icon: "/icons/google.svg" },
  github:    { label: "Continue with GitHub",    icon: "/icons/github.svg" },
  microsoft: { label: "Continue with Microsoft", icon: "/icons/microsoft.svg" },
} satisfies Record<string, { label: string; icon: string }>;

type Provider = keyof typeof PROVIDER_CONFIG;

export function SocialLoginButton({ provider }: { provider: Provider }) {
  const config = PROVIDER_CONFIG[provider];
  const handleClick = () => {
    sessionStorage.setItem("oauth-redirect", window.location.pathname);
    window.location.href = `/api/auth/${provider}`;
  };
  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      {/* Provider brand SVGs are the one acceptable exception to the lucide-react-only rule.
          Use <img> with explicit dimensions — never inline SVG for third-party brand marks. */}
      <img src={config.icon} alt="" aria-hidden="true" width={16} height={16} />
      {config.label}
    </Button>
  );
}
```

> **Note on auth providers**: If using Clerk, Auth0, Supabase Auth, or NextAuth, fetch their current SDK docs via Context7 MCP before implementing — each provider has its own session management pattern that supersedes AUTH1–AUTH7.

---

## Summary Cheatsheet — Auth Lifecycle

| Concern | Standard |
|---------|----------|
| Access token | Memory only — `session.ts` module variable |
| Refresh token | HttpOnly cookie (server-set) |
| Role type | Shared `types.ts` in `features/auth/` — import everywhere |
| Auth state | Zustand `useAuthStore` |
| Session init | `initializeSession()` in `main.tsx` before render |
| Protected routes | `<ProtectedRoute requiredRoles={[...]} />` — always array |
| Post-login redirect | `location.state.from` + `isSafeRedirectUrl()` check |
| RBAC in UI | `<PermissionGate allowedRoles={[...]} />` — array, same API as ProtectedRoute |
| RBAC in logic | `usePermission([...])` hook — always guard the action too |
| Session expiry | `useSessionExpiry` with 5-min warning + hard redirect on expiry |
| Logout | `useLogout()` → clear token + `queryClient.clear()` + navigate |
| Social login | Provider SVGs in `public/icons/` — not lucide-react (no brand icons) |
| 3rd-party providers | Always fetch provider SDK docs via Context7 MCP |
