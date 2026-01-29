'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Global error boundary
 * Catches errors in any route and provides a recovery option
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Error icon */}
        <div className="bg-destructive/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            className="text-destructive h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error message */}
        <h2 className="mb-2 text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg border px-6 py-3 font-medium transition-colors"
          >
            Go home
          </Link>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-8 text-left">
            <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
              Error details (dev only)
            </summary>
            <pre className="bg-muted mt-2 overflow-auto rounded-lg p-4 text-xs">{error.stack}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
