/**
 * Secure Error Response Utilities
 *
 * World-class error handling: never leak internal error details to clients.
 * Log full error internally, return generic message to client.
 *
 * Usage:
 *   import { sanitizeError, toClientError } from '@/lib/utils/error-responses'
 *
 *   try {
 *     // ... operation
 *   } catch (error) {
 *     logger.error('Operation failed', { error, context: 'OperationName' })
 *     return toClientError(error, 'Failed to complete operation')
 *   }
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/production-logger'

/**
 * Generic client-safe error messages by status code
 */
const GENERIC_ERRORS: Record<number, string> = {
  400: 'Invalid request',
  401: 'Authentication required',
  403: 'Access denied',
  404: 'Resource not found',
  409: 'Request conflicts with current state',
  429: 'Too many requests',
  500: 'Internal server error',
  503: 'Service temporarily unavailable',
}

/**
 * Error types that are safe to show to clients
 * (domain-specific business logic errors, not system/infra errors)
 */
const SAFE_ERROR_TYPES = [
  'ValidationError',
  'QuotaExceededError',
  'PermissionError',
  'NotFoundError',
  'ConflictError',
]

/**
 * Sanitize error for client response
 * Returns generic message unless error type is explicitly client-safe
 */
export function sanitizeError(error: unknown, fallbackMessage?: string): string {
  // If it's a safe domain error, return the message
  if (error instanceof Error && SAFE_ERROR_TYPES.includes(error.name)) {
    return error.message
  }

  // Otherwise return generic message
  return fallbackMessage || 'An error occurred'
}

/**
 * Create a client-safe error response
 * Logs full error internally, returns sanitized error to client
 *
 * @param error - The error that occurred
 * @param context - Operation context for logging
 * @param status - HTTP status code (default: 500)
 * @param fallbackMessage - Generic message to show client (optional)
 */
export function toClientError(
  error: unknown,
  context: string,
  status: number = 500,
  fallbackMessage?: string
): NextResponse {
  // Log full error internally with context
  logger.error('API error', {
    error,
    context,
    status,
  })

  // Return sanitized error to client
  const clientMessage = sanitizeError(error, fallbackMessage || GENERIC_ERRORS[status])

  return NextResponse.json(
    {
      error: clientMessage,
    },
    { status }
  )
}

/**
 * Create a redirect URL with a generic error parameter
 * Never puts raw error.message in URL
 */
export function errorRedirect(baseUrl: string, errorCode: string): string {
  const url = new URL(baseUrl, 'http://localhost') // Base doesn't matter, only path
  url.searchParams.set('error', errorCode)
  return url.pathname + url.search
}

/**
 * Common error codes for redirects (client-safe)
 */
export const ErrorCodes = {
  AUTH_FAILED: 'auth_failed',
  INVALID_TOKEN: 'invalid_token',
  PROVISIONING_FAILED: 'provisioning_failed',
  CONFIG_ERROR: 'config_error',
  CALLBACK_ERROR: 'callback_error',
  SESSION_EXPIRED: 'session_expired',
  ACCESS_DENIED: 'access_denied',
} as const
