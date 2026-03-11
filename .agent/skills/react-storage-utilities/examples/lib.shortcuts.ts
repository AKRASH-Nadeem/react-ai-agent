// lib/shortcuts.ts
// Central registry of all keyboard shortcuts in the application.
//
// Rules:
//   1. Every shortcut MUST be defined here. No useHotkeys() calls elsewhere
//      with hardcoded key strings.
//   2. The ShortcutCheatSheet component reads from this file — adding a
//      shortcut here automatically adds it to the cheat sheet.
//   3. Never override browser defaults: Ctrl+W, Ctrl+T, Ctrl+P, Ctrl+N, F5.
//   4. "mod" maps to ⌘ on Mac and Ctrl on Windows/Linux automatically.
//
// Usage:
//   import { useHotkeys } from "react-hotkeys-hook";
//   import { SHORTCUTS } from "@/lib/shortcuts";
//
//   useHotkeys(SHORTCUTS.openSearch.keys, (e) => {
//     e.preventDefault();
//     openSearchPanel();
//   });

export type ShortcutDefinition = {
  /** The key combination — use "mod" for ⌘/Ctrl, "shift", "alt", "space" */
  keys: string;
  /** Human-readable label shown in the cheat sheet */
  label: string;
  /** Groups shortcuts in the cheat sheet UI */
  group: "Navigation" | "Actions" | "View" | "Selection" | "Help";
};

export const SHORTCUTS = {
  // ── Help ─────────────────────────────────────────────────────────────
  openCheatSheet: {
    keys: "shift+?",
    label: "Show keyboard shortcuts",
    group: "Help",
  },

  // ── Navigation ───────────────────────────────────────────────────────
  openCommandPalette: {
    keys: "mod+k",
    label: "Open command palette",
    group: "Navigation",
  },
  goToDashboard: {
    keys: "g d",
    label: "Go to dashboard",
    group: "Navigation",
  },
  goToSettings: {
    keys: "g s",
    label: "Go to settings",
    group: "Navigation",
  },

  // ── Actions ──────────────────────────────────────────────────────────
  createNew: {
    keys: "c",
    label: "Create new item",
    group: "Actions",
  },
  save: {
    keys: "mod+s",
    label: "Save",
    group: "Actions",
  },
  search: {
    keys: "mod+f",
    label: "Search",
    group: "Actions",
  },

  // ── View ─────────────────────────────────────────────────────────────
  toggleSidebar: {
    keys: "mod+b",
    label: "Toggle sidebar",
    group: "View",
  },

  // ── Selection ────────────────────────────────────────────────────────
  selectAll: {
    keys: "mod+a",
    label: "Select all",
    group: "Selection",
  },
} as const satisfies Record<string, ShortcutDefinition>;

// Type helpers
export type ShortcutKey = keyof typeof SHORTCUTS;

/** Returns all shortcuts grouped by their group name */
export function getShortcutsByGroup(): Record<string, ShortcutDefinition[]> {
  return Object.values(SHORTCUTS).reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.group]) acc[shortcut.group] = [];
      acc[shortcut.group].push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutDefinition[]>
  );
}
