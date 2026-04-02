// vite.config.chunks.ts
// Paste the build.rollupOptions block into your vite.config.ts.
// Splits vendor code into named chunks to improve long-term caching
// and give you visibility into bundle composition.
//
// Adjust the chunks to match your actual dependencies.
// Run `npx vite-bundle-visualizer` or `npx rollup-plugin-visualizer` to
// inspect the output and tune the splits.

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Warn when any chunk exceeds this size (KB). Fail CI if it exceeds 2×.
    chunkSizeWarningLimit: 200,

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core — changes only when React itself is updated
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }

          // Routing
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }

          // Data fetching
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-query";
          }

          // Radix UI primitives (shadcn dependency)
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // Charts — heavy, load separately so main bundle stays lean
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts";
          }

          // Animation
          if (id.includes("node_modules/motion")) {
            return "vendor-motion";
          }

          // Forms
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/zod")) {
            return "vendor-forms";
          }

          // i18n — only loaded if the project uses react-i18next
          if (id.includes("node_modules/react-i18next") || id.includes("node_modules/i18next")) {
            return "vendor-i18n";
          }
        },
      },
    },
  },
});
