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
  logger.warn('Redis not configured - rate limiting disabled', {
    hint: 'Set UPSTASH_REDIS_REST_URL or REDIS_URL in .env.local',
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

  // Fallback to allowing request if Redis is not available
  if (!client) {
    logger.warn('Rate limiting bypassed - Redis not available', { key })
    return { allowed: true, remaining: config.requests, resetAt: Date.now() + config.window * 1000 }
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
    // Fail open - allow the request if Redis is down
    return { allowed: true, remaining: config.requests, resetAt: now + config.window * 1000 }
  }
}

/**
 * Redis-based rate limiting middleware (production-ready)
 */
export function withRedisRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  config: RateLimitConfig
): T {
  return (async (request: NextRequest, ...args: any[]) => {
    try {
      const key = getRateLimitKey(config, request, args[0])
      const result = await checkRateLimit(key, config)

      // Add rate limit headers
      const response = result.allowed
        ? await handler(request, ...args)
        : NextResponse.json(
            {
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
            },
            { status: 429 }
          )

      response.headers.set('X-RateLimit-Limit', config.requests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetAt.toString())

      if (!result.allowed) {
        response.headers.set('Retry-After', Math.ceil((result.resetAt - Date.now()) / 1000).toString())
      }

      return response
    } catch (error) {
      logger.error('Rate limiting error', { error })
      // Fail open - allow the request if rate limiting fails
      return handler(request, ...args)
    }
  }) as T
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
