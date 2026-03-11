// hooks/useAnnounce.ts
// Screen reader announcement hook.
// Used to announce dynamic changes that aren't obvious from DOM updates alone.
//
// Setup — add these two hidden elements ONCE to your root layout (AppShell):
//
//   <div id="aria-live-polite"    aria-live="polite"    aria-atomic="true" className="sr-only" />
//   <div id="aria-live-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
//
// Usage:
//   const announce = useAnnounce();
//
//   useMutation({
//     mutationFn: saveProfile,
//     onSuccess: () => announce("Profile saved successfully."),
//     onError:   () => announce("Failed to save profile. Please try again.", "assertive"),
//   });
//
// polite    — waits for the user to finish what they're doing (default, use for most things)
// assertive — interrupts the user immediately (use only for errors and critical warnings)

import { useCallback } from "react";

type AnnouncePriority = "polite" | "assertive";

export function useAnnounce() {
  const announce = useCallback(
    (message: string, priority: AnnouncePriority = "polite"): void => {
      const el = document.getElementById(`aria-live-${priority}`);
      if (!el) {
        console.warn(
          `[useAnnounce] #aria-live-${priority} element not found. ` +
          "Add it to your root layout. See react-accessibility skill A11Y4."
        );
        return;
      }

      // Clear first, then set — some screen readers only announce changes,
      // not when the same string is set twice in a row.
      el.textContent = "";

      requestAnimationFrame(() => {
        el.textContent = message;
      });
    },
    []
  );

  return announce;
}
