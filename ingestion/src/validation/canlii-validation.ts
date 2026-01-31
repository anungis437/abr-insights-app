/**
 * CanLII API Error Handling & Validation
 *
 * Comprehensive error handling, validation, and diagnostics for:
 * - API connectivity and authentication
 * - Rate limiting and quota management
 * - Data validation and quality checks
 * - Graceful fallback and recovery
 * - Production logging and monitoring
 */

import { logger } from '../utils/logger'
import { ENV } from '../config'
import { CanLIIApiClient } from '../clients/canlii-api'

// ============================================================================
// ERROR TYPES
// ============================================================================

export class CanLIIError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: Record<string, any>,
    readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'CanLIIError'
  }
}

export const ERROR_CODES = {
  // Configuration errors
  MISSING_API_KEY: 'CANLII_MISSING_API_KEY',
  MISSING_DATABASE_ID: 'CANLII_MISSING_DATABASE_ID',
  INVALID_CONFIG: 'CANLII_INVALID_CONFIG',

  // Authentication errors
  AUTH_FAILED: 'CANLII_AUTH_FAILED',
  UNAUTHORIZED: 'CANLII_UNAUTHORIZED',

  // API errors
  RATE_LIMITED: 'CANLII_RATE_LIMITED',
  SERVER_ERROR: 'CANLII_SERVER_ERROR',
  PAYLOAD_TOO_LARGE: 'CANLII_PAYLOAD_TOO_LARGE',
  NOT_FOUND: 'CANLII_NOT_FOUND',

  // Data errors
  INVALID_DATABASE_ID: 'CANLII_INVALID_DATABASE_ID',
  INVALID_CASE_ID: 'CANLII_INVALID_CASE_ID',
  VALIDATION_FAILED: 'CANLII_VALIDATION_FAILED',

  // Network errors
  CONNECTION_TIMEOUT: 'CANLII_CONNECTION_TIMEOUT',
  CONNECTION_REFUSED: 'CANLII_CONNECTION_REFUSED',

  // Unknown
  UNKNOWN_ERROR: 'CANLII_UNKNOWN_ERROR',
} as const

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validates CanLII API configuration
 */
export function validateApiConfiguration(): {
  valid: boolean
  errors: { code: string; message: string }[]
  warnings: { code: string; message: string }[]
} {
  const errors: { code: string; message: string }[] = []
  const warnings: { code: string; message: string }[] = []

  // Check API key
  if (!ENV.CANLII_API_KEY) {
    warnings.push({
      code: ERROR_CODES.MISSING_API_KEY,
      message: 'CANLII_API_KEY not configured - REST API mode disabled',
    })
  } else if (ENV.CANLII_API_KEY.length < 10) {
    errors.push({
      code: ERROR_CODES.INVALID_CONFIG,
      message: 'CANLII_API_KEY appears invalid (too short)',
    })
  }

  // Check API base URL
  if (!ENV.CANLII_API_BASE_URL) {
    errors.push({
      code: ERROR_CODES.INVALID_CONFIG,
      message: 'CANLII_API_BASE_URL not configured',
    })
  } else if (!ENV.CANLII_API_BASE_URL.startsWith('https://')) {
    errors.push({
      code: ERROR_CODES.INVALID_CONFIG,
      message: 'CANLII_API_BASE_URL must use HTTPS',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates database ID format
 */
export function validateDatabaseId(databaseId: string): boolean {
  if (!databaseId) return false
  // CanLII IDs are typically lowercase alphanumeric with hyphens
  return /^[a-z0-9-]+$/i.test(databaseId) && databaseId.length >= 2 && databaseId.length <= 20
}

/**
 * Validates case ID format
 */
export function validateCaseId(caseId: string): boolean {
  if (!caseId) return false
  // CanLII case IDs are typically alphanumeric with no spaces
  return /^[a-z0-9]+$/i.test(caseId) && caseId.length >= 3 && caseId.length <= 50
}

/**
 * Validates decision date format
 */
export function validateDecisionDate(date: string | Date | null | undefined): boolean {
  if (!date) return true // Optional field
  if (date instanceof Date) return !isNaN(date.getTime())
  if (typeof date === 'string') {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  return false
}

// ============================================================================
// API HEALTH CHECK
// ============================================================================

export interface HealthCheckResult {
  healthy: boolean
  apiKey: {
    configured: boolean
    valid: boolean
  }
  connectivity: {
    reachable: boolean
    responseTime?: number
  }
  authentication: {
    authenticated: boolean
    error?: string
  }
  rateLimit: {
    remaining?: number
    resetAt?: Date
  }
  diagnostics: {
    errors: string[]
    warnings: string[]
  }
}

/**
 * Comprehensive health check of CanLII API
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    healthy: false,
    apiKey: { configured: false, valid: false },
    connectivity: { reachable: false },
    authentication: { authenticated: false },
    rateLimit: {},
    diagnostics: { errors: [], warnings: [] },
  }

  logger.info('Starting CanLII API health check...')

  // Check configuration
  const configValidation = validateApiConfiguration()
  if (!configValidation.valid) {
    result.diagnostics.errors.push(...configValidation.errors.map((e) => e.message))
    logger.warn('Configuration validation failed', configValidation)
    return result
  }

  result.apiKey.configured = !!ENV.CANLII_API_KEY
  result.apiKey.valid = result.apiKey.configured && ENV.CANLII_API_KEY.length > 10

  // Check connectivity
  const startTime = Date.now()
  try {
    const client = new CanLIIApiClient()
    const isConnected = await client.validateConnection()

    result.connectivity.reachable = isConnected
    result.connectivity.responseTime = Date.now() - startTime
    result.authentication.authenticated = isConnected

    if (isConnected) {
      logger.info('CanLII API health check passed', {
        responseTime: result.connectivity.responseTime,
      })
      result.healthy = true
    } else {
      result.diagnostics.errors.push('API validation failed - check API key validity')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    result.diagnostics.errors.push(`Connectivity check failed: ${message}`)
    result.authentication.error = message

    logger.error('CanLII API health check failed', {
      error,
      responseTime: Date.now() - startTime,
    })
  }

  // Add warnings if applicable
  if (configValidation.warnings.length > 0) {
    result.diagnostics.warnings.push(...configValidation.warnings.map((w) => w.message))
  }

  return result
}

// ============================================================================
// ERROR RECOVERY
// ============================================================================

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof CanLIIError) {
    return error.retryable
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('503')
    )
  }

  return false
}

/**
 * Calculates backoff delay for retries
 */
export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000
): number {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attemptNumber), maxDelayMs)
  const jitter = Math.random() * 0.1 * exponentialDelay
  return exponentialDelay + jitter
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error) || attempt === maxAttempts - 1) {
        throw error
      }

      const delayMs = calculateBackoffDelay(attempt, baseDelayMs)
      logger.warn(`Retrying after ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts})`, {
        error: error instanceof Error ? error.message : String(error),
      })

      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

// ============================================================================
// DIAGNOSTICS & LOGGING
// ============================================================================

/**
 * Generate diagnostic report
 */
export async function generateDiagnosticReport(): Promise<string> {
  let report = '# CanLII API Diagnostic Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`

  // Configuration
  report += '## Configuration\n\n'
  const configValidation = validateApiConfiguration()
  report += `- API Key Configured: ${ENV.CANLII_API_KEY ? 'Yes' : 'No'}\n`
  report += `- API Enabled: ${ENV.CANLII_API_ENABLED ? 'Yes' : 'No'}\n`
  report += `- API Base URL: ${ENV.CANLII_API_BASE_URL}\n`
  report += `- Environment: ${ENV.NODE_ENV}\n\n`

  if (!configValidation.valid) {
    report += '### Configuration Errors\n\n'
    for (const error of configValidation.errors) {
      report += `- ❌ ${error.message}\n`
    }
    report += '\n'
  }

  if (configValidation.warnings.length > 0) {
    report += '### Configuration Warnings\n\n'
    for (const warning of configValidation.warnings) {
      report += `- ⚠️ ${warning.message}\n`
    }
    report += '\n'
  }

  // Health Check
  report += '## Health Check\n\n'
  const health = await performHealthCheck()
  report += `- Overall Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}\n`
  report += `- Connectivity: ${health.connectivity.reachable ? '✅ Reachable' : '❌ Unreachable'}\n`
  report += `- Authentication: ${health.authentication.authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}\n`
  if (health.connectivity.responseTime) {
    report += `- Response Time: ${health.connectivity.responseTime}ms\n`
  }
  if (health.authentication.error) {
    report += `- Auth Error: ${health.authentication.error}\n`
  }

  if (health.diagnostics.errors.length > 0) {
    report += '\n### Errors\n\n'
    for (const error of health.diagnostics.errors) {
      report += `- ❌ ${error}\n`
    }
  }

  if (health.diagnostics.warnings.length > 0) {
    report += '\n### Warnings\n\n'
    for (const warning of health.diagnostics.warnings) {
      report += `- ⚠️ ${warning}\n`
    }
  }

  return report
}

// ============================================================================
// EXPORTS (re-export already exported functions above)
// ============================================================================
