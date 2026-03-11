// src/tests/msw/browser.ts
// MSW worker for use in the browser during development.
// Lets you develop UI without a running backend.
//
// Setup:
//   npx msw init public/ --save
//   This copies mockServiceWorker.js into public/ — commit it.
//
// Activate in main.tsx during development:
//
//   if (import.meta.env.DEV) {
//     const { worker } = await import("./tests/msw/browser");
//     await worker.start({ onUnhandledRequest: "bypass" });
//   }
//
//   ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
