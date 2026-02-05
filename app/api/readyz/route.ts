/**
 * Readiness Check Endpoint
 *
 * Returns 200 if the application is ready to accept traffic.
 * Used by container orchestrators (Azure Container Apps, Kubernetes) to determine
 * when to start sending traffic to the container.
 *
 * CONTRACT:
 * - Returns 200 if all dependencies are healthy
 * - Returns 503 if any critical dependency is unavailable
 * - Checks: Database connection, environment variables
 * - Response time target: < 500ms
 * - Must handle errors gracefully (never crash)
 *
 * Azure Container Apps Configuration:
 * ```yaml
 * readinessProbe:
 *   httpGet:
 *     path: /api/readyz
 *     port: 3000
 *   initialDelaySeconds: 5
 *   periodSeconds: 5
 *   timeoutSeconds: 2
 *   successThreshold: 1
 *   failureThreshold: 3
 * ```
 *
 * Health Check Sequence:
 * 1. Environment validation (required vars present and valid)
 * 2. Database connectivity (Supabase connection test)
 * 3. Service dependencies (optional checks with warnings)
 *
 * @see https://learn.microsoft.com/azure/container-apps/health-probes
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateEnvironment, getEnvironmentInfo } from '@/lib/utils/env-validator'
import { logger } from '@/lib/utils/production-logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'warning'
  message?: string
  duration_ms?: number
  details?: Record<string, unknown>
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready'
  timestamp: string
  checks: HealthCheck[]
  environment: ReturnType<typeof getEnvironmentInfo>
  correlationId: string
}

/**
 * Check database connectivity with timeout
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  const timeout = 2000 // 2 second timeout

  try {
    const supabase = await createClient()

    // Race between query and timeout
    const result = await Promise.race([
      supabase.from('profiles').select('id').limit(1),
      new Promise<{ error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Database check timeout')), timeout)
      ),
    ])

    const duration = Date.now() - startTime

    if (result.error) {
      // Check if it's a "relation does not exist" error (table not found)
      // This is acceptable for readiness (schema might not be initialized yet)
      if (result.error.code === '42P01' || result.error.code === 'PGRST301') {
        return {
          name: 'database',
          status: 'warning',
          message: 'Database connected but schema not initialized',
          duration_ms: duration,
          details: {
            error_code: result.error.code,
          },
        }
      }

      return {
        name: 'database',
        status: 'unhealthy',
        message: result.error.message,
        duration_ms: duration,
        details: {
          error_code: result.error.code,
        },
      }
    }

    return {
      name: 'database',
      status: 'healthy',
      message: 'Connected',
      duration_ms: duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error('Database health check failed', { error })

    return {
      name: 'database',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    }
  }
}

/**
 * Check Redis connectivity (if configured for production rate limiting)
 */
async function checkRedis(): Promise<HealthCheck | null> {
  // Redis is optional - only check if configured
  const isRedisConfigured =
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    process.env.REDIS_URL

  if (!isRedisConfigured) {
    // In production, Redis should be configured for rate limiting
    if (process.env.NODE_ENV === 'production') {
      return {
        name: 'redis',
        status: 'warning',
        message: 'Redis not configured (rate limiting will use in-memory fallback)',
      }
    }
    // In dev/test, Redis is optional
    return null
  }

  const startTime = Date.now()
  const timeout = 1000 // 1 second timeout for Redis

  try {
    // Try to initialize and ping Redis
    let client: any = null

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = await import('@upstash/redis')
      client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })

      // Upstash Redis ping
      const pingResult = await Promise.race([
        client.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), timeout)),
      ])

      const duration = Date.now() - startTime

      if (pingResult === 'PONG') {
        return {
          name: 'redis',
          status: 'healthy',
          message: 'Connected',
          duration_ms: duration,
          details: { type: 'upstash' },
        }
      }
    } else if (process.env.REDIS_URL) {
      const { createClient } = await import('redis')
      client = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
        socket: {
          connectTimeout: timeout,
        },
      })

      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), timeout)),
      ])

      const pingResult = await client.ping()
      await client.quit()

      const duration = Date.now() - startTime

      if (pingResult === 'PONG') {
        return {
          name: 'redis',
          status: 'healthy',
          message: 'Connected',
          duration_ms: duration,
          details: { type: 'standard' },
        }
      }
    }

    const duration = Date.now() - startTime
    return {
      name: 'redis',
      status: 'unhealthy',
      message: 'Redis ping failed',
      duration_ms: duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error('Redis health check failed', { error })

    return {
      name: 'redis',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    }
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment(): HealthCheck {
  const validation = validateEnvironment()

  if (!validation.valid) {
    return {
      name: 'environment',
      status: 'unhealthy',
      message: 'Required environment variables missing or invalid',
      details: {
        missing: validation.missing,
        invalid: validation.invalid,
      },
    }
  }

  if (validation.warnings.length > 0) {
    return {
      name: 'environment',
      status: 'warning',
      message: 'Some optional environment variables not configured',
      details: {
        warnings: validation.warnings,
      },
    }
  }

  return {
    name: 'environment',
    status: 'healthy',
    message: 'All required variables configured',
  }
}

/**
 * Perform all readiness checks
 */
async function performReadinessChecks(): Promise<ReadinessResponse> {
  const checks: HealthCheck[] = []

  // 1. Environment check (synchronous, fast)
  checks.push(checkEnvironment())

  // 2. Database check (async, may take time)
  checks.push(await checkDatabase())

  // 3. Redis check (optional, only if configured)
  const redisCheck = await checkRedis()
  if (redisCheck) {
    checks.push(redisCheck)
  }

  // Determine overall status
  // - Unhealthy checks block readiness
  // - Warnings allow traffic but indicate potential issues
  const hasUnhealthy = checks.some((check) => check.status === 'unhealthy')

  // Include correlation ID in response
  const correlationId = crypto.randomUUID()

  return {
    status: hasUnhealthy ? 'not_ready' : 'ready',
    timestamp: new Date().toISOString(),
    checks,
    environment: getEnvironmentInfo(),
    correlationId,
  }
}

export async function GET() {
  try {
    const result = await performReadinessChecks()

    // Return 503 if not ready, 200 if ready (even with warnings)
    const statusCode = result.status === 'ready' ? 200 : 503

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // Never crash - always return a valid response
    logger.error('Readiness check exception', { error })

    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: [
          {
            name: 'readiness_check',
            status: 'unhealthy',
            message: 'Readiness check threw exception',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        ],
        environment: getEnvironmentInfo(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
