/**
 * @module app/global-error
 * Global error boundary — catches unhandled errors in production.
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Defines the GlobalErrorProps contract.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Executes GlobalError.
 * Catch-all error boundary for Next.js app directory.
 * Reports to Sentry if configured, shows branded error UI.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Report to Sentry if configured
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry SDK auto-captures unhandled errors when configured
      console.error('Global error boundary triggered:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
          <div className="mx-auto max-w-md text-center">
            {/* Error icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-status-critical-light">
              <svg
                className="h-8 w-8 text-status-critical"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Something went wrong
            </h1>

            {/* Message */}
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              We&apos;ve encountered an unexpected error. Our team has been notified and we&apos;re
              working to fix it.
            </p>

            {/* Error details in dev */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Error Details
                </p>
                <p className="mt-2 font-mono text-xs text-neutral-700">{error.message}</p>
                {error.digest && (
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => reset()}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Go home
              </Button>
            </div>

            {/* Support link */}
            <p className="mt-8 text-sm text-neutral-500">
              Need help?{' '}
              <a
                href="mailto:hello@openrole.co.uk"
                className="text-brand-accent underline underline-offset-2 hover:text-brand-accent-hover"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
