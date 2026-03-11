// lib/api-errors.ts
// Centralised error handlers for REST API responses.
// Use handleMutationError in useMutation onError callbacks.
// Use setFormErrors to map 400/422 field errors back into react-hook-form.

import { AxiosError } from "axios";
import { toast } from "sonner";
import { type FieldValues, type UseFormSetError, type Path } from "react-hook-form";

// ── Mutation Error Handler ────────────────────────────────────────────

export function handleMutationError(error: unknown): void {
  if (!(error instanceof AxiosError)) {
    toast.error("An unexpected error occurred.");
    return;
  }

  const status = error.response?.status;

  switch (status) {
    case 403:
      toast.error("You don't have permission to do this.");
      break;

    case 404:
      toast.error("The requested resource was not found.");
      break;

    case 409:
      toast.error(error.response?.data?.message ?? "A conflict occurred.");
      break;

    case 429: {
      const retryAfter = error.response?.headers["retry-after"];
      toast.error(`Rate limited. Try again${retryAfter ? ` in ${retryAfter}s` : " in a moment"}.`);
      break;
    }

    default:
      if (status && status >= 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error(error.response?.data?.message ?? "Something went wrong.");
      }
  }
}

// ── Form Field Error Mapper ───────────────────────────────────────────
// Maps 400 / 422 field-level API errors back to react-hook-form fields.
//
// Expects the API to return errors in this shape:
//   { errors: { fieldName: "Error message", otherField: "Another message" } }

export function setFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): void {
  if (!(error instanceof AxiosError)) return;

  const errors = error.response?.data?.errors as Record<string, string> | undefined;
  if (!errors) return;

  Object.entries(errors).forEach(([field, message]) => {
    setError(field as Path<T>, { type: "server", message });
  });
}
