// lib/download.ts
// Programmatic file download utility.
// Used for exporting blobs from API responses and client-generated content.
//
// Usage:
//   // From API blob response
//   const blob = await api.get("/reports/export", { responseType: "blob" });
//   downloadFile(blob.data, "report-2024-q4.pdf");
//
//   // Client-generated JSON
//   downloadFile(JSON.stringify(data, null, 2), "export.json", "application/json");
//
//   // Client-generated CSV (prefer exportToCsv from lib/csv.ts for real data)
//   downloadFile("col1,col2\nval1,val2", "data.csv", "text/csv;charset=utf-8");

/**
 * Triggers a file download in the browser.
 *
 * @param content  - Blob (from API) or string (client-generated)
 * @param filename - The name the file will have when saved
 * @param mimeType - Required when content is a string; ignored when content is a Blob
 */
export function downloadFile(
  content: Blob | string,
  filename: string,
  mimeType?: string
): void {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: mimeType ?? "text/plain;charset=utf-8" });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Delay revocation to ensure the download has started before the URL is freed.
  // 100ms is the accepted safe window across all browsers.
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
