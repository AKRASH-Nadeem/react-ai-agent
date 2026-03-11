// lib/logger.ts
// Project-wide logger. Replace every console.* call with this.
//
// Rules:
//   - logger.debug / logger.info  → only print in development (NODE_ENV=development)
//   - logger.warn                 → always prints, reports to Sentry in production
//   - logger.error                → always prints, always reports to Sentry in production
//
// Never use console.log, console.warn, console.error directly in committed code.

import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const logger = {
  /**
   * Verbose diagnostic info — only visible in development.
   * Use for tracing data flow, hook lifecycle, or debugging.
   */
  debug(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * General informational messages — only visible in development.
   * Use for app state milestones (e.g., "Auth initialized").
   */
  info(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Something unexpected but recoverable — always visible.
   * Reported to Sentry in production as a warning.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context);
    if (isProd) {
      Sentry.captureMessage(message, { level: "warning", extra: context });
    }
  },

  /**
   * An error that may affect functionality — always visible.
   * Always reported to Sentry. Pass the original Error object when available.
   */
  error(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    console.error(`[ERROR] ${message}`, error ?? "", context ?? "");
    if (isProd) {
      Sentry.captureException(error ?? new Error(message), {
        extra: { message, ...context },
      });
    }
  },
};
