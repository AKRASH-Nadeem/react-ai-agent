// lib/clipboard.ts
// Safe clipboard utility with fallback for non-HTTPS contexts.
// Used by SecretField, share buttons, and any "copy" action.
//
// Returns true on success, false on failure.
// The caller is responsible for showing feedback (toast, icon change, etc.).

export async function copyToClipboard(text: string): Promise<boolean> {
  // Preferred: modern Clipboard API (requires HTTPS or localhost)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method
    }
  }

  // Legacy fallback: execCommand (deprecated but works in non-secure contexts)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Hide it but keep it in the document so it's selectable
    textarea.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
