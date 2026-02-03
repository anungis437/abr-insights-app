/**
 * Environment Variable Validation
 *
 * Validates required environment variables for application readiness.
 * Used by /api/readyz endpoint to verify configuration before accepting traffic.
 */

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
}

/**
 * Critical environment variables required for core functionality
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'OPENAI_API_KEY',
  'AZURE_OPENAI_API_KEY',
] as const

/**
 * Validate environment variables for application readiness
 *
 * @returns Validation result with missing/invalid variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = []
  const invalid: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]

    if (!value) {
      missing.push(varName)
      continue
    }

    // Validate format for specific variables
    if (varName === 'NEXT_PUBLIC_SUPABASE_URL') {
      try {
        new URL(value)
      } catch {
        invalid.push(`${varName} (invalid URL format)`)
      }
    }

    if (varName === 'NEXTAUTH_URL') {
      try {
        new URL(value)
      } catch {
        invalid.push(`${varName} (invalid URL format)`)
      }
    }

    if (varName === 'NEXTAUTH_SECRET') {
      if (value.length < 32) {
        invalid.push(`${varName} (must be at least 32 characters)`)
      }
    }
  }

  // Check recommended variables (warnings only)
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      warnings.push(`${varName} not configured (some features may be unavailable)`)
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
