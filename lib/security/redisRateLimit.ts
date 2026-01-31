/**
 * Redis-Based Rate Limiting (Production-Ready)
 *
 * Production-safe rate limiting using Redis for distributed deployments.
 * Supports Upstash Redis (serverless) and Azure Cache for Redis.
 *
 * Setup:
 * 1. Upstash Redis (Recommended for serverless):
 *    - Visit https://upstash.com/
 *    - Create a Redis database
 *    - Add to .env.local:
 *      UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
 *      UPSTASH_REDIS_REST_TOKEN=your-token
 *
 * 2. Azure Cache for Redis:
 *    - Create Azure Cache instance
 *    - Add to .env.local:
 *      REDIS_URL=redis://your-cache.redis.cache.windows.net:6380
 *      REDIS_PASSWORD=your-password
 *
 * Usage:
 *   import { withRedisRateLimit } from '@/lib/security/redisRateLimit'
 *   export const POST = withRedisRateLimit(handler, { requests: 10, window: 60 })
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimitConfig } from './rateLimit'
import { withRateLimit } from './rateLimit' // Fallback to in-memory limiter
import { logger } from '@/lib/utils/production-logger'

// Lazy-loaded Redis client
let redisClient: any = null
let redisType: 'upstash' | 'standard' | 'disabled' = 'disabled'

/**
 * Initialize Redis client based on environment variables
 */
async function getRedisClient() {
  if (redisClient) return redisClient

  // Try Upstash Redis first (serverless-friendly)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      redisType = 'upstash'
      logger.info('Redis rate limiting initialized', { type: 'upstash' })
      return redisClient
    } catch (error) {
      logger.error('Failed to initialize Upstash Redis', { error })
    }
  }

  // Try standard Redis (Azure Cache for Redis, etc.)
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import('redis')
      redisClient = createClient({
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
      })
      await redisClient.connect()
      redisType = 'standard'
      logger.info('Redis rate limiting initialized', { type: 'standard' })
      return redisClient
    } catch (error) {
      logger.error('Failed to initialize standard Redis', { error })
    }
  }

  // No Redis configured
  logger.warn('Redis not configured - falling back to in-memory rate limiting', {
    hint: 'Set UPSTASH_REDIS_REST_URL or REDIS_URL in .env.local for production',
  })
  return null
}

/**
 * Get rate limit key for the request
 */
function getRateLimitKey(config: RateLimitConfig, request: NextRequest, context?: any): string {
  const baseKey = 'ratelimit'

  if (config.keyType === 'custom' && config.keyGenerator) {
    return `${baseKey}:${config.keyGenerator(request, context)}`
  }

  if (config.keyType === 'user') {
    const userId = context?.user?.id
    if (!userId) throw new Error('User ID required for user-based rate limiting')
    return `${baseKey}:user:${userId}`
  }

  if (config.keyType === 'org') {
    const orgId = context?.organizationId
    if (!orgId) throw new Error('Organization ID required for org-based rate limiting')
    return `${baseKey}:org:${orgId}`
  }

  // IP-based (default)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `${baseKey}:ip:${ip}`
}

/**
 * Check rate limit using Redis (token bucket algorithm)
 */
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = await getRedisClient()

  // This should not be reached if withRedisRateLimit checks for client first
  if (!client) {
    throw new Error('Redis client not available')
  }

  const now = Date.now()
  const windowStart = now - config.window * 1000

  try {
    if (redisType === 'upstash') {
      // Upstash Redis HTTP-based API
      const multi = client.multi()

      // Remove old entries outside the window
      multi.zremrangebyscore(key, 0, windowStart)

      // Count requests in current window
      multi.zcard(key)

      // Add current request
      multi.zadd(key, { score: now, member: `${now}:${Math.random()}` })

      // Set expiration
      multi.expire(key, config.window)

      const results = await multi.exec()
      const count = results[1] as number

      const allowed = count < config.requests
      const remaining = Math.max(0, config.requests - count - 1)

      return {
        allowed,
        remaining,
        resetAt: now + config.window * 1000,
      }
    } else {
      // Standard Redis client
      const multi = client.multi()

      multi.zRemRangeByScore(key, 0, windowStart)
      multi.zCard(key)
      multi.zAdd(key, { score: now, value: `${now}:${Math.random()}` })
      multi.expire(key, config.window)

      const results = await multi.exec()
      const count = results[1] as number

      const allowed = count < config.requests
      const remaining = Math.max(0, config.requests - count - 1)

      return {
        allowed,
        remaining,
        resetAt: now + config.window * 1000,
      }
    }
  } catch (error) {
    logger.error('Redis rate limit check failed', { error, key })
    // Re-throw to trigger fallback in wrapper function
    throw error
  }
}

/**
 * Redis-based rate limiting middleware with in-memory fallback
 * Falls back to in-memory rate limiting if Redis is not configured or unavailable
 */
export function withRedisRateLimit<
  T extends (...args: any[]) => Promise<NextResponse> | NextResponse,
>(handler: T, config: RateLimitConfig): (...args: any[]) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: any[]) => {
    const client = await getRedisClient()
    
    // Fallback to in-memory rate limiting if Redis not available
    if (!client) {
      logger.warn('Using in-memory rate limiting fallback', {
        hint: 'Configure Redis for production deployments',
      })
      return withRateLimit(config, handler)(request, ...args)
    }

    try {
      const key = getRateLimitKey(config, request, args[0])
      const result = await checkRateLimit(key, config)

      // Add rate limit headers
      const response = result.allowed
        ? await Promise.resolve(handler(request, ...args))
        : NextResponse.json(
            {
              error: config.message || 'Rate limit exceeded',
              retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
            },
            { status: 429 }
          )

      response.headers.set('X-RateLimit-Limit', config.requests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetAt.toString())

      if (!result.allowed) {
        response.headers.set(
          'Retry-After',
          Math.ceil((result.resetAt - Date.now()) / 1000).toString()
        )
      }

      return response
    } catch (error) {
      logger.error('Redis rate limiting failed, falling back to in-memory', { error })
      // Fallback to in-memory rate limiting on error
      return withRateLimit(config, handler)(request, ...args)
    }
  }
}

/**
 * Apply multiple rate limits in sequence with in-memory fallback
 * ALL limits must pass for the request to proceed
 */
export function withMultipleRedisRateLimits<
  T extends (...args: any[]) => Promise<NextResponse> | NextResponse,
>(handler: T, configs: RateLimitConfig[]): (...args: any[]) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: any[]) => {
    const client = await getRedisClient()
    
    // Fallback to in-memory for multiple configs (apply all)
    if (!client) {
      logger.warn('Using in-memory rate limiting fallback for multiple limits', {
        hint: 'Configure Redis for production deployments',
      })
      // Apply all rate limits sequentially using in-memory fallback
      let wrappedHandler: any = handler
      for (const config of configs.reverse()) {
        wrappedHandler = withRateLimit(config, wrappedHandler)
      }
      return wrappedHandler(request, ...args)
    }

    try {
      const results = await Promise.all(
        configs.map((config) => {
          const key = getRateLimitKey(config, request, args[0])
          return checkRateLimit(key, config).then((result) => ({ config, result }))
        })
      )

      // Find the most restrictive limit (first one that's not allowed)
      const blocked = results.find(({ result }) => !result.allowed)

      // All limits passed - execute handler
      if (!blocked) {
        const response = await Promise.resolve(handler(request, ...args))

        // Add headers from the most restrictive limit
        const mostRestrictive = results.reduce((prev, curr) =>
          curr.result.remaining < prev.result.remaining ? curr : prev
        )

        response.headers.set('X-RateLimit-Limit', mostRestrictive.config.requests.toString())
        response.headers.set('X-RateLimit-Remaining', mostRestrictive.result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', mostRestrictive.result.resetAt.toString())

        return response
      }

      // One or more limits exceeded
      const response = NextResponse.json(
        {
          error: blocked.config.message || 'Rate limit exceeded',
          retryAfter: Math.ceil((blocked.result.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      )

      response.headers.set('X-RateLimit-Limit', blocked.config.requests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', blocked.result.resetAt.toString())
      response.headers.set(
        'Retry-After',
        Math.ceil((blocked.result.resetAt - Date.now()) / 1000).toString()
      )

      return response
    } catch (error) {
      logger.error('Multiple Redis rate limiting failed, falling back to in-memory', { error })
      // Fallback to in-memory rate limiting
      let wrappedHandler: any = handler
      for (const config of configs.reverse()) {
        wrappedHandler = withRateLimit(config, wrappedHandler)
      }
      return wrappedHandler(request, ...args)
    }
  }
}

/**
 * Cleanup function for graceful shutdown
 */
export async function closeRedisConnection() {
  if (redisClient && redisType === 'standard') {
    try {
      await redisClient.quit()
      logger.info('Redis connection closed')
    } catch (error) {
      logger.error('Failed to close Redis connection', { error })
    }
  }
}
