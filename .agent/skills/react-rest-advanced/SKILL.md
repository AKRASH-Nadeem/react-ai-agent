name: react-rest-advanced
description: |
  Use when the project uses REST APIs beyond basic CRUD. Trigger on:
  "token refresh", "401", "interceptor", "auth header", "Bearer token",
  "optimistic update", "optimistic UI", "infinite scroll", "load more",
  "cursor pagination", "useInfiniteQuery", "file upload", "image upload",
  "multipart", "upload progress", "debounce", "search input", "typeahead",
  "autocomplete" (API-backed), "retry", "backoff", "rate limit", "429",
  "environment variable", "VITE_", ".env", "env validation",
  "axios instance", "request interceptor", "cache invalidation",
  "staleTime", "parallel queries", "sequential requests".
---

> ⚠️ **Examples are version-anchored** to `versions.lock.md`. Verify method names and imports for the installed version via Context7 before use.

# Advanced REST API Patterns

## API1. Axios Instance — Standard Setup

Create a single Axios instance. Never import Axios directly in hooks or components.

```ts
// lib/api.ts
import axios from "axios";
import { env } from "@/lib/env";

export const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Request: attach access token from wherever your project stores it
// (localStorage, cookie, in-memory store — match your project's auth strategy)
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // implement per your auth provider
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: token refresh queue — prevents multiple concurrent refresh calls
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken(); // implement per your auth provider
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        clearSession(); // implement per your auth provider
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

**Auth session utilities** (`getAccessToken`, `refreshAccessToken`, `clearSession`) are project-specific and depend on your auth provider (NextAuth, Clerk, Auth0, custom JWT, etc.). Implement them in `features/auth/session.ts` and import from there. Search Context7 MCP for your specific auth provider's token management pattern.

---





## API2. HTTP Status → UI Mapping

| Status | Required UI Response |
|--------|---------------------|
| 400 / 422 | Field errors from response body via `setError` |
| 401 | Token refresh → if fails, redirect to `/login` |
| 403 | Inline "You don't have permission" — do NOT redirect |
| 404 | Not-found state in component — not full page redirect |
| 409 | Inline conflict message |
| 429 | Retry-after countdown toast |
| 500+ | Error boundary or inline retry button. Log to Sentry |

```ts
// lib/api-errors.ts
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function handleMutationError(error: unknown): void {
  if (!(error instanceof AxiosError)) { toast.error("An unexpected error occurred."); return; }
  const status = error.response?.status;
  if (status === 403) { toast.error("You don't have permission to do this."); return; }
  if (status === 409) { toast.error(error.response?.data?.message ?? "A conflict occurred."); return; }
  if (status === 429) { toast.error(`Rate limited. Try again in ${error.response?.headers["retry-after"] ?? "a moment"}.`); return; }
  if (status && status >= 500) { toast.error("Server error. Please try again."); return; }
}

// Map 400/422 field errors to react-hook-form
export function setFormErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): void {
  if (!(error instanceof AxiosError)) return;
  const errors = error.response?.data?.errors as Record<string, string> | undefined;
  if (!errors) return;
  Object.entries(errors).forEach(([field, message]) => {
    setError(field as Path<T>, { type: "server", message });
  });
}
```

---

## API3. Environment Variables — Zod Validation

Validate all environment variables at startup. Never access `import.meta.env` directly in components.

```ts
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_URL: z.string().url(),
  // Add project-specific vars here
  // VITE_SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
```

Rules:
- Import `env` from `lib/env.ts` everywhere — never raw `import.meta.env`
- Only expose to the frontend what the frontend actually needs
- Never put secrets (API keys, private tokens) in `VITE_*` variables — these are bundled into the client JS and publicly visible
- Server-side secrets belong in server environment only (`.env.server`, Edge Functions, backend)

```bash
# .env.example — commit this, never commit .env
VITE_API_BASE_URL=https://api.yourapp.com
VITE_APP_URL=https://yourapp.com
```

---

## API4. Optimistic Updates

```ts
useMutation({
  mutationFn: (id: string) => api.delete(`/tasks/${id}`),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    const previous = queryClient.getQueryData(taskKeys.all);
    queryClient.setQueryData(taskKeys.all, (old: Task[]) => old.filter((t) => t.id !== id));
    return { previous };
  },
  onError: (_err, _id, context) => {
    if (context?.previous) queryClient.setQueryData(taskKeys.all, context.previous);
    toast.error("Failed to delete task.");
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
});
```

---

## API5. Infinite Scroll — `useInfiniteList`

```ts
export function useInfiniteList<T>(endpoint: string, schema: z.ZodType<T[]>) {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get(endpoint, { params: { cursor: pageParam, limit: 20 } });
      return schema.parse(data.items);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (_lastPage, _allPages, _lastPageParam, _allPageParams) => {
      // Return nextCursor from your API response shape
      return undefined;
    },
  });
}
```

---

## API6. Debounced Search

```ts
import { useDebounce } from "use-debounce";

export function useUserSearch(rawQuery: string) {
  const [debouncedQuery] = useDebounce(rawQuery, 300);

  return useQuery({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: () => api.get("/users/search", { params: { q: debouncedQuery } }).then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
  });
}
```

---

## API7. File Upload with Progress

```ts
export function useFileUpload() {
  const [progress, setProgress] = useState(0);

  const { mutate: upload } = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api.post("/uploads", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
    },
    onSuccess: () => { setProgress(0); toast.success("File uploaded."); },
    onError: () => { setProgress(0); toast.error("Upload failed."); },
  });

  return { upload, progress };
}
```

---

## Summary Cheatsheet — REST Advanced

| Concern | Standard |
|---------|----------|
| API client | Single Axios instance in `lib/api.ts` |
| Token injection | Request interceptor — implement `getAccessToken()` per auth provider |
| Token refresh | Response interceptor with refresh queue |
| Auth provider setup | Fetch docs via Context7 MCP for your specific provider |
| Error mapping | `handleMutationError()` per status code |
| Form field errors | `setFormErrors()` maps API errors to react-hook-form |
| Env validation | Zod schema in `lib/env.ts` — never raw `import.meta.env` |
| Never in `VITE_*` | Secrets, private API keys — client-visible only |
| Optimistic updates | `onMutate` → rollback `onError` → revalidate `onSettled` |
| Infinite scroll | `useInfiniteQuery` via `useInfiniteList` |
| Search debounce | `use-debounce` at 300ms, enabled after 2+ chars |
| File upload | `multipart/form-data` + `onUploadProgress` |
