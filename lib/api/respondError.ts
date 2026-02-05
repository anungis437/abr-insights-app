/**
 * Standard Error Response Helpers
 *
 * Provides consistent error response formatting across all API endpoints.
 * Ensures:
 * - Correlation IDs are always included
 * - Stack traces are never leaked in production
 * - Error codes are standardized
 * - Error messages are safe for client consumption
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/production-logger'

/**
 * Standard error codes
 *
 * These codes should be used consistently across the application.
 * Clients can rely on these codes for programmatic error handling.
 */
export enum ErrorCode {
  // Authentication & Authorization (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Rate Limiting (4xx)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Validation (4xx)
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_PARAMETER = 'INVALID_PARAMETER',

  // Resource Errors (4xx)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Map error codes to HTTP status codes
 */
const ERROR_CODE_TO_HTTP_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_PARAMETER]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.TIMEOUT]: 504,
}

/**
 * Standard error response envelope
 */
export interface ErrorResponse {
  error: {
    code: ErrorCode | string
    message: string
    correlationId: string
  }
  details?: Record<string, any>
}

/**
 * Options for error responses
 */
export interface ErrorResponseOptions {
  /** Error code (required) */
  code: ErrorCode | string
  /** User-facing error message (required) */
  message: string
  /** HTTP status code (optional, derived from code if not provided) */
  statusCode?: number
  /** Additional error details safe for client (optional) */
  details?: Record<string, any>
  /** Internal error object for logging (optional, never sent to client) */
  internalError?: Error | unknown
  /** Request object for correlation ID (optional) */
  request?: NextRequest
  /** Override correlation ID (optional) */
  correlationId?: string
}

/**
 * Get correlation ID from request or generate new one
 */
function getCorrelationId(request?: NextRequest, override?: string): string {
  if (override) {
    return override
  }

  if (request) {
    const headerCorrelationId = request.headers.get('x-correlation-id')
    if (headerCorrelationId) {
      return headerCorrelationId
    }
  }

  return crypto.randomUUID()
}

/**
 * Create a standardized error response
 *
 * This function ensures:
 * - Consistent error format across all endpoints
 * - Correlation IDs are included
 * - Internal errors are logged but not exposed
 * - Safe messages for clients
 *
 * @example
 * ```ts
 * return respondError({
 *   code: ErrorCode.UNAUTHORIZED,
 *   message: 'Authentication required',
 *   request,
 * })
 * ```
 */
export function respondError(options: ErrorResponseOptions): NextResponse<ErrorResponse> {
  const { code, message, statusCode, details, internalError, request, correlationId } = options

  const finalCorrelationId = getCorrelationId(request, correlationId)

  // Determine HTTP status code
  const httpStatus = statusCode || ERROR_CODE_TO_HTTP_STATUS[code as ErrorCode] || 500

  // Log internal error details (never sent to client)
  if (internalError) {
    logger.error('API error occurred', {
      correlationId: finalCorrelationId,
      code,
      message,
      statusCode: httpStatus,
      error: internalError,
      ...(request
        ? {
            method: request.method,
            url: request.url,
            userAgent: request.headers.get('user-agent'),
          }
        : {}),
    })
  }

  // Build safe error response
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      correlationId: finalCorrelationId,
    },
  }

  // Include details if provided (ensure they're safe for client)
  if (details) {
    errorResponse.details = details
  }

  return NextResponse.json(errorResponse, {
    status: httpStatus,
    headers: {
      'Content-Type': 'application/json',
      'x-correlation-id': finalCorrelationId,
    },
  })
}

/**
 * Create an error response from a caught exception
 *
 * Automatically maps common exception types to appropriate error codes.
 * Never leaks stack traces or internal details in production.
 *
 * @example
 * ```ts
 * try {
 *   // ... operation
 * } catch (error) {
 *   return respondErrorFromException(error, { request })
 * }
 * ```
 */
export function respondErrorFromException(
  error: unknown,
  options?: {
    request?: NextRequest
    correlationId?: string
    /** Override the default message */
    message?: string
    /** Additional safe details */
    details?: Record<string, any>
  }
): NextResponse<ErrorResponse> {
  const finalCorrelationId = getCorrelationId(options?.request, options?.correlationId)

  // Log the full error
  logger.error('Unhandled exception in API route', {
    correlationId: finalCorrelationId,
    error,
    ...(options?.request
      ? {
          method: options.request.method,
          url: options.request.url,
        }
      : {}),
  })

  // Determine error code and message based on error type
  let code: ErrorCode = ErrorCode.INTERNAL_ERROR
  let message = options?.message || 'An unexpected error occurred'

  if (error instanceof Error) {
    // Check for common error patterns
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
      code = ErrorCode.UNAUTHORIZED
      message = 'Authentication required'
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
      code = ErrorCode.FORBIDDEN
      message = 'Access denied'
    } else if (errorMessage.includes('not found')) {
      code = ErrorCode.NOT_FOUND
      message = 'Resource not found'
    } else if (errorMessage.includes('timeout')) {
      code = ErrorCode.TIMEOUT
      message = 'Request timeout'
    } else if (errorMessage.includes('rate limit')) {
      code = ErrorCode.RATE_LIMIT_EXCEEDED
      message = 'Rate limit exceeded'
    }

    // In development, include more details
    if (process.env.NODE_ENV !== 'production' && !options?.message) {
      message = error.message
    }
  }

  return respondError({
    code,
    message,
    internalError: error,
    request: options?.request,
    correlationId: finalCorrelationId,
    details: options?.details,
  })
}

/**
 * Quick helper functions for common error types
 */

export function respondUnauthorized(
  message = 'Authentication required',
  request?: NextRequest
): NextResponse<ErrorResponse> {
  return respondError({
    code: ErrorCode.UNAUTHORIZED,
    message,
    request,
  })
}

export function respondForbidden(
  message = 'Access denied',
  request?: NextRequest
): NextResponse<ErrorResponse> {
  return respondError({
    code: ErrorCode.FORBIDDEN,
    message,
    request,
  })
}

export function respondNotFound(
  message = 'Resource not found',
  request?: NextRequest
): NextResponse<ErrorResponse> {
  return respondError({
    code: ErrorCode.NOT_FOUND,
    message,
    request,
  })
}

export function respondValidationError(
  message: string,
  details?: Record<string, any>,
  request?: NextRequest
): NextResponse<ErrorResponse> {
  return respondError({
    code: ErrorCode.VALIDATION_ERROR,
    message,
    details,
    request,
  })
}

export function respondRateLimitExceeded(
  retryAfter?: number,
  request?: NextRequest
): NextResponse<ErrorResponse> {
  const response = respondError({
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded. Please try again later.',
    details: retryAfter ? { retryAfter } : undefined,
    request,
  })

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString())
  }

  return response
}

export function respondInternalError(
  internalError?: Error | unknown,
  request?: NextRequest
): NextResponse<ErrorResponse> {
  return respondError({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'An internal error occurred. Please try again later.',
    internalError,
    request,
  })
}
