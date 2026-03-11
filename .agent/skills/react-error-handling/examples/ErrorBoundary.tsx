// @versions react@^19  |  @sentry/react@^8
// @breaking Sentry v8 changed ErrorBoundary import path — verify if using v7
//
// components/ErrorBoundary.tsx
// Wraps any part of the component tree to catch render errors.
// A missing ErrorBoundary means one component crash takes down the whole page.
//
// THREE layers of ErrorBoundary every app needs:
//
//   1. ROOT — wraps <App /> in main.tsx — catches catastrophic failures
//   2. ROUTE — wraps each page route — isolates page-level crashes
//   3. WIDGET — wraps complex async widgets (charts, editors) — isolates feature crashes
//
// Usage:
//   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
//     <ComplexWidget />
//   </ErrorBoundary>
//
//   // With reset capability (e.g., after a data refetch):
//   <ErrorBoundary
//     fallback={({ reset }) => (
//       <ErrorFallback message="Failed to load chart." onRetry={reset} />
//     )}
//   >
//     <RevenueChart />
//   </ErrorBoundary>

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/lib/logger";

type FallbackProps = {
  error: Error;
  reset: () => void;
};

type ErrorBoundaryProps = {
  /**
   * What to render when the boundary catches an error.
   * Pass a ReactNode for a static fallback, or a render function for one
   * that can call reset() to attempt recovery.
   */
  fallback: ReactNode | ((props: FallbackProps) => ReactNode);
  children: ReactNode;
};

type ErrorBoundaryState =
  | { hasError: false }
  | { hasError: true; error: Error };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to Sentry and the project logger.
    // componentDidCatch is the only place to reliably capture render errors.
    logger.error("ErrorBoundary caught a render error", error, {
      componentStack: info.componentStack ?? undefined,
    });
  }

  reset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props;
      return typeof fallback === "function"
        ? fallback({ error: this.state.error, reset: this.reset })
        : fallback;
    }
    return this.props.children;
  }
}
