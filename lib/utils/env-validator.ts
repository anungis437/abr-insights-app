/**
 * Environment Variable Validation
 *
 * Validates required environment variables for application readiness.
 * Used by /api/readyz endpoint to verify configuration before accepting traffic.
 * Also provides fail-fast validation at boot time for production deployments.
 */

import { logger } from '@/lib/utils/production-logger'

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
}

/**
 * Critical environment variables required for core functionality (all environments)
 */
const REQUIRED_ENV_VARS_ALL = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

/**
 * Required environment variables for production only
 */
const REQUIRED_ENV_VARS_PRODUCTION = [
  // Add production-specific requirements here
  // Example: 'SENTRY_DSN', 'AZURE_APP_INSIGHTS_KEY'
] as const

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'OPENAI_API_KEY',
  'AZURE_OPENAI_API_KEY',
  'UPSTASH_REDIS_REST_URL', // For production rate limiting
] as const

/**
 * Redact sensitive parts of values for safe logging
 */
function redactForLogging(varName: string, value: string): string {
  const sensitivePatterns = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD']
  const isSensitive = sensitivePatterns.some((pattern) => varName.toUpperCase().includes(pattern))

  if (isSensitive) {
    if (value.length <= 8) {
      return '***'
    }
    return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
  }

  return value
}

/**
 * Validate environment variables for application readiness
 *
 * @param strictMode - If true, fail on warnings as well (for production)
 * @returns Validation result with missing/invalid variables
 */
export function validateEnvironment(strictMode = false): EnvValidationResult {
  const missing: string[] = []
  const invalid: string[] = []
  const warnings: string[] = []

  const isProduction = process.env.NODE_ENV === 'production'
  const requiredVars = [
    ...REQUIRED_ENV_VARS_ALL,
    ...(isProduction ? REQUIRED_ENV_VARS_PRODUCTION : []),
  ]

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName]

    if (!value) {
      missing.push(varName)
      continue
    }

    // Validate format for specific variables
    if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      try {
        const url = new URL(value)
        // Ensure it's https in production
        if (isProduction && url.protocol !== 'https:') {
          invalid.push(`${varName} (must use HTTPS in production)`)
        }
      } catch {
        invalid.push(`${varName} (invalid URL format)`)
      }
    }

    if (varName === 'NEXTAUTH_URL') {
      try {
        const url = new URL(value)
        // Ensure it's https in production (unless localhost for testing)
        if (isProduction && url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
          invalid.push(`${varName} (must use HTTPS in production)`)
        }
      } catch {
        invalid.push(`${varName} (invalid URL format)`)
      }
    }

    if (varName === 'NEXTAUTH_SECRET') {
      if (value.length < 32) {
        invalid.push(`${varName} (must be at least 32 characters)`)
      }
      // Check for common insecure values
      const insecureValues = ['test', 'secret', 'password', 'changeme', 'default']
      if (isProduction && insecureValues.some((v) => value.toLowerCase().includes(v))) {
        invalid.push(`${varName} (appears to be insecure/default value)`)
      }
    }

    if (varName === 'SUPABASE_SERVICE_ROLE_KEY') {
      // Basic JWT format check
      if (!value.startsWith('eyJ')) {
        invalid.push(`${varName} (invalid JWT format)`)
      }
    }
  }

  // Check recommended variables (warnings only, unless strictMode)
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      const message = `${varName} not configured (some features may be unavailable)`
      if (strictMode) {
        invalid.push(message)
      } else {
        warnings.push(message)
      }
    }
  }

  // Production-specific checks
  if (isProduction) {
    // Warn if Redis is not configured (rate limiting will fall back to in-memory)
    if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.REDIS_URL) {
      warnings.push(
        'Redis not configured - rate limiting will use in-memory fallback (not suitable for multi-instance deployments)'
      )
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
  }
}

/**
 * Get environment info (safe for logging, excludes sensitive values)
 */
export function getEnvironmentInfo() {
  return {
    node_version: process.version,
    node_env: process.env.NODE_ENV,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    has_nextauth_url: !!process.env.NEXTAUTH_URL,
  }
}

/**
 * Fail-fast boot validation for production environments
 *
 * Call this early in your server initialization (e.g., in API routes, middleware init, or server setup)
 * to ensure critical environment variables are present before accepting traffic.
 *
 * This function will LOG ERRORS but NOT THROW in non-production environments to allow development.
 * In production, it will THROW to prevent the server from starting with invalid configuration.
 *
 * @throws Error if validation fails in production
 */
export function failFastEnvValidation(): void {
  const isProduction = process.env.NODE_ENV === 'production'
  const result = validateEnvironment()

  if (!result.valid) {
    const errorMessage = [
      '❌ Environment Variable Validation Failed',
      '',
      result.missing.length > 0 ? `Missing variables:\n  - ${result.missing.join('\n  - ')}` : '',
      result.invalid.length > 0 ? `Invalid variables:\n  - ${result.invalid.join('\n  - ')}` : '',
      '',
      'Set these environment variables before starting the server.',
      'See docs/setup/environment-variables.md for configuration guide.',
    ]
      .filter(Boolean)
      .join('\n')

    if (isProduction) {
      // In production, fail immediately
      logger.error('Production environment validation failed', {
        missing: result.missing,
        invalid: result.invalid,
      })
      throw new Error(errorMessage)
    } else {
      // In dev/test, log but allow to continue
      logger.warn('Environment validation failed (non-production)', {
        missing: result.missing,
        invalid: result.invalid,
      })
      console.warn('\n' + errorMessage + '\n')
    }
  } else if (result.warnings.length > 0) {
    // Log warnings but don't fail
    logger.warn('Environment validation warnings', {
      warnings: result.warnings,
    })

    if (!isProduction) {
      console.warn('\n⚠️  Environment Warnings:')
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
      console.warn('')
    }
  } else {
    // Success
    logger.info('Environment validation passed', {
      environment: process.env.NODE_ENV,
    })
  }
}

/**
 * Get safe environment variable summary for diagnostics
 *
 * Returns a summary of environment configuration with sensitive values redacted.
 * Safe to include in logs or diagnostic output.
 */
export function getEnvironmentSummary(): Record<string, string> {
  const allVars = [
    ...REQUIRED_ENV_VARS_ALL,
    ...REQUIRED_ENV_VARS_PRODUCTION,
    ...RECOMMENDED_ENV_VARS,
  ]

  const summary: Record<string, string> = {}

  for (const varName of allVars) {
    const value = process.env[varName]
    if (value) {
      summary[varName] = redactForLogging(varName, value)
    } else {
      summary[varName] = '<not set>'
    }
  }

  return summary
}
