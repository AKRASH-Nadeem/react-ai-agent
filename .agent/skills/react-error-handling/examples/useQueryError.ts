// @versions @tanstack/react-query@^5  |  axios@^1.7  |  sonner@^1
// @breaking TanStack Query v5 removed onError from useQuery — use this hook instead
//
// hooks/useQueryError.ts
// Centralised error handler for TanStack Query mutations and queries.
//
// WHY THIS EXISTS:
//   TanStack Query v5 removed onSuccess/onError/onSettled from useQuery options.
//   The recommended pattern is to handle errors in the component via the `error`
//   field, or globally via QueryClient's `defaultOptions`. This hook wraps the
//   global approach so error toasts are consistent and DRY.
//
// SETUP — add this to your QueryClient config in main.tsx:
//
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         retry: (failureCount, error) => {
//           // Don't retry on 4xx errors — they won't magically fix themselves
//           if (error instanceof AxiosError && error.response) {
//             const status = error.response.status;
//             if (status >= 400 && status < 500) return false;
//           }
//           return failureCount < 2;
//         },
//       },
//     },
//   });
//
// FOR MUTATIONS — onError is still available and should be used:
//
//   const mutation = useMutation({
//     mutationFn: saveProfile,
//     onError: handleMutationError,   // from lib/api-errors.ts
//     onSuccess: () => toast.success("Saved"),
//   });

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { logger } from "@/lib/logger";

/**
 * Attach this to the root layout (AppShell) once.
 * It watches for any query error globally and shows a toast.
 *
 * For per-query error handling, use the `error` field from useQuery directly.
 */
export function useGlobalQueryError(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.query.state.status !== "error") return;

      const error = event.query.state.error;
      if (!error) return;

      // Log to Sentry via logger
      logger.error("Query error", error, {
        queryKey: JSON.stringify(event.query.queryKey),
      });

      // 401 is handled by lib/api.ts interceptor (token refresh / redirect to login)
      // Don't show a toast for it — the interceptor will handle the UX
      if (error instanceof AxiosError && error.response?.status === 401) return;

      const message =
        error instanceof AxiosError
          ? (error.response?.data?.message as string | undefined) ??
            `Error ${error.response?.status ?? "unknown"}`
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

      toast.error(message);
    });

    return unsubscribe;
  }, [queryClient]);
}
