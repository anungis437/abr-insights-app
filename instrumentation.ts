import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')

    // Initialize server runtime (env validation, fail-fast in production)
    // This runs exactly once when the Node.js server starts.
    // Does NOT run during build time or in Edge runtime.
    // Safe to call multiple times due to internal idempotency guard.
    const { initializeServer } = await import('./lib/config/server-init')
    initializeServer()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
