/**
 * Server Initialization
 *
 * Runs once when the server starts (runtime, not build time).
 * Validates environment and sets up global configurations.
 *
 * This module is imported by API routes and middleware to ensure
 * validation happens before processing requests.
 */

import { failFastEnvValidation } from '@/lib/utils/env-validator'
import { logger } from '@/lib/utils/production-logger'

// Track if initialization has already run
let initialized = false

/**
 * Initialize server runtime
 *
 * Safe to call multiple times - initialization only runs once.
 */
export function initializeServer() {
  if (initialized) {
    return
  }

  try {
    logger.info('Initializing server runtime...')

    // Validate environment variables (fail-fast in production)
    failFastEnvValidation()

    // Additional initialization can go here
    // - Database connection pools
    // - Redis clients
    // - External service health checks

    initialized = true
    logger.info('Server runtime initialized successfully')
  } catch (error) {
    logger.error('Server initialization failed', { error })
    throw error
  }
}

/**
 * Reset initialization state (for testing only)
 */
export function resetInitialization() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetInitialization can only be called in test environment')
  }
  initialized = false
}
