/**
 * PR-07: CanLII Rate Limiter
 * 
 * Global rate limiter for CanLII API compliance:
 * - 2 requests per second (burst)
 * - 1 concurrent request (no parallel calls)
 * - 5000 requests per day (hard limit)
 * 
 * Uses Redis token bucket algorithm for distributed rate limiting.
 * FAIL CLOSED: Blocks requests when limits exceeded (strict compliance).
 * 
 * @module lib/services/canlii-rate-limiter
 */

import { createClient } from 'redis'
import { logger } from '@/lib/observability/production-logger'

// =====================================================
// Configuration
// =====================================================

const RATE_LIMITS = {
  // Requests per second (burst capacity)
  REQUESTS_PER_SECOND: 2,
  
  // Maximum concurrent requests (prevents parallel calls)
  MAX_CONCURRENT: 1,
  
  // Daily request limit
  DAILY_LIMIT: 5000,
  
  // Redis keys
  REDIS_KEY_TOKENS: 'canlii:tokens',
  REDIS_KEY_CONCURRENT: 'canlii:concurrent',
  REDIS_KEY_DAILY_COUNT: 'canlii:daily_count',
  REDIS_KEY_DAILY_RESET: 'canlii:daily_reset',
  
  // Token bucket refill rate (tokens per second)
  REFILL_RATE: 2,
  
  // Maximum tokens in bucket
  MAX_TOKENS: 2,
} as const

// =====================================================
// Types
// =====================================================

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  retryAfter?: number // seconds
  currentTokens?: number
  dailyUsed?: number
  dailyLimit?: number
}

export interface RateLimitStats {
  currentTokens: number
  concurrentRequests: number
  dailyUsed: number
  dailyLimit: number
  dailyResetAt: string
}

// =====================================================
// CanLII Rate Limiter
// =====================================================

class CanLIIRateLimiter {
  private redis: ReturnType<typeof createClient> | null = null
  private redisConnected: boolean = false
  
  constructor() {
    this.initRedis()
  }
  
  /**
   * Initialize Redis connection
   */
  private async initRedis(): Promise<void> {
    try {
      if (!process.env.REDIS_URL) {
        logger.error('REDIS_URL not configured - CanLII rate limiter disabled')
        return
      }
      
      this.redis = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 retries')
              return new Error('Max retries exceeded')
            }
            return Math.min(retries * 100, 3000)
          },
        },
      })
      
      this.redis.on('error', (err) => {
        logger.error('Redis error', { error: err.message })
        this.redisConnected = false
      })
      
      this.redis.on('connect', () => {
        logger.info('Redis connected')
        this.redisConnected = true
      })
      
      this.redis.on('disconnect', () => {
        logger.warn('Redis disconnected')
        this.redisConnected = false
      })
      
      await this.redis.connect()
      
    } catch (error) {
      logger.error('Failed to initialize Redis', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  
  /**
   * Check if request is allowed under rate limits
   * 
   * FAIL CLOSED: Returns false if Redis unavailable or limits exceeded
   */
  async checkLimit(): Promise<RateLimitResult> {
    // FAIL CLOSED: Block if Redis not available
    if (!this.redis || !this.redisConnected) {
      logger.error('CanLII rate limiter unavailable - blocking request (fail closed)')
      return {
        allowed: false,
        reason: 'Rate limiter unavailable',
      }
    }
    
    try {
      // Check daily limit first (fastest check)
      const dailyCheck = await this.checkDailyLimit()
      if (!dailyCheck.allowed) {
        return dailyCheck
      }
      
      // Check concurrent requests
      const concurrentCheck = await this.checkConcurrentLimit()
      if (!concurrentCheck.allowed) {
        return concurrentCheck
      }
      
      // Check token bucket (requests per second)
      const tokenCheck = await this.checkTokenBucket()
      if (!tokenCheck.allowed) {
        return tokenCheck
      }
      
      // All checks passed
      return { allowed: true }
      
    } catch (error) {
      // FAIL CLOSED: Block on errors
      logger.error('Rate limit check failed - blocking request (fail closed)', {
        error: error instanceof Error ? error.message : String(error),
      })
      
      return {
        allowed: false,
        reason: 'Rate limit check error',
      }
    }
  }
  
  /**
   * Acquire rate limit (call before making CanLII request)
   * 
   * This reserves a token and increments concurrent counter.
   * Must call releaseLimit() after request completes.
   */
  async acquireLimit(): Promise<RateLimitResult> {
    const check = await this.checkLimit()
    
    if (!check.allowed) {
      return check
    }
    
    try {
      // Consume token
      await this.consumeToken()
      
      // Increment concurrent counter
      await this.incrementConcurrent()
      
      // Increment daily counter
      await this.incrementDaily()
      
      logger.info('CanLII rate limit acquired', {
        daily_used: check.dailyUsed,
        daily_limit: RATE_LIMITS.DAILY_LIMIT,
      })
      
      return { allowed: true }
      
    } catch (error) {
      logger.error('Failed to acquire rate limit', {
        error: error instanceof Error ? error.message : String(error),
      })
      
      return {
        allowed: false,
        reason: 'Failed to acquire limit',
      }
    }
  }
  
  /**
   * Release rate limit (call after CanLII request completes)
   */
  async releaseLimit(): Promise<void> {
    if (!this.redis || !this.redisConnected) {
      return
    }
    
    try {
      // Decrement concurrent counter
      await this.redis.decr(RATE_LIMITS.REDIS_KEY_CONCURRENT)
      
      logger.info('CanLII rate limit released')
      
    } catch (error) {
      logger.error('Failed to release rate limit', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  
  /**
   * Check daily limit (5000 requests per day)
   */
  private async checkDailyLimit(): Promise<RateLimitResult> {
    if (!this.redis) {
      return { allowed: false, reason: 'Redis unavailable' }
    }
    
    const count = await this.redis.get(RATE_LIMITS.REDIS_KEY_DAILY_COUNT)
    const dailyUsed = count ? parseInt(count, 10) : 0
    
    if (dailyUsed >= RATE_LIMITS.DAILY_LIMIT) {
      // Get reset time
      const resetTime = await this.redis.get(RATE_LIMITS.REDIS_KEY_DAILY_RESET)
      const retryAfter = resetTime
        ? Math.ceil((parseInt(resetTime, 10) - Date.now()) / 1000)
        : 86400 // Default 24 hours
      
      logger.warn('CanLII daily limit exceeded', {
        daily_used: dailyUsed,
        daily_limit: RATE_LIMITS.DAILY_LIMIT,
      })
      
      return {
        allowed: false,
        reason: 'Daily limit exceeded (5000 requests/day)',
        retryAfter,
        dailyUsed,
        dailyLimit: RATE_LIMITS.DAILY_LIMIT,
      }
    }
    
    return {
      allowed: true,
      dailyUsed,
      dailyLimit: RATE_LIMITS.DAILY_LIMIT,
    }
  }
  
  /**
   * Check concurrent request limit (1 concurrent request)
   */
  private async checkConcurrentLimit(): Promise<RateLimitResult> {
    if (!this.redis) {
      return { allowed: false, reason: 'Redis unavailable' }
    }
    
    const concurrent = await this.redis.get(RATE_LIMITS.REDIS_KEY_CONCURRENT)
    const currentConcurrent = concurrent ? parseInt(concurrent, 10) : 0
    
    if (currentConcurrent >= RATE_LIMITS.MAX_CONCURRENT) {
      logger.warn('CanLII concurrent limit exceeded', {
        concurrent_requests: currentConcurrent,
        max_concurrent: RATE_LIMITS.MAX_CONCURRENT,
      })
      
      return {
        allowed: false,
        reason: 'Concurrent request limit exceeded (max 1)',
        retryAfter: 1, // Retry after 1 second
      }
    }
    
    return { allowed: true }
  }
  
  /**
   * Check token bucket (2 requests per second)
   */
  private async checkTokenBucket(): Promise<RateLimitResult> {
    if (!this.redis) {
      return { allowed: false, reason: 'Redis unavailable' }
    }
    
    // Get current tokens
    const tokensStr = await this.redis.get(RATE_LIMITS.REDIS_KEY_TOKENS)
    let tokens = tokensStr ? parseFloat(tokensStr) : RATE_LIMITS.MAX_TOKENS
    
    // Refill tokens based on time elapsed
    const now = Date.now() / 1000 // Unix timestamp in seconds
    const lastRefillKey = `${RATE_LIMITS.REDIS_KEY_TOKENS}:last_refill`
    const lastRefillStr = await this.redis.get(lastRefillKey)
    const lastRefill = lastRefillStr ? parseFloat(lastRefillStr) : now
    
    const elapsed = now - lastRefill
    const refillAmount = elapsed * RATE_LIMITS.REFILL_RATE
    tokens = Math.min(RATE_LIMITS.MAX_TOKENS, tokens + refillAmount)
    
    // Update tokens and last refill time
    await this.redis.set(RATE_LIMITS.REDIS_KEY_TOKENS, tokens.toString())
    await this.redis.set(lastRefillKey, now.toString())
    
    // Check if we have at least 1 token
    if (tokens < 1) {
      const retryAfter = Math.ceil((1 - tokens) / RATE_LIMITS.REFILL_RATE)
      
      logger.warn('CanLII token bucket depleted', {
        current_tokens: tokens,
        retry_after_seconds: retryAfter,
      })
      
      return {
        allowed: false,
        reason: 'Rate limit exceeded (2 requests/second)',
        retryAfter,
        currentTokens: tokens,
      }
    }
    
    return {
      allowed: true,
      currentTokens: tokens,
    }
  }
  
  /**
   * Consume one token from bucket
   */
  private async consumeToken(): Promise<void> {
    if (!this.redis) return
    
    const tokensStr = await this.redis.get(RATE_LIMITS.REDIS_KEY_TOKENS)
    const tokens = tokensStr ? parseFloat(tokensStr) : RATE_LIMITS.MAX_TOKENS
    
    await this.redis.set(RATE_LIMITS.REDIS_KEY_TOKENS, Math.max(0, tokens - 1).toString())
  }
  
  /**
   * Increment concurrent request counter
   */
  private async incrementConcurrent(): Promise<void> {
    if (!this.redis) return
    
    await this.redis.incr(RATE_LIMITS.REDIS_KEY_CONCURRENT)
  }
  
  /**
   * Increment daily request counter
   */
  private async incrementDaily(): Promise<void> {
    if (!this.redis) return
    
    const count = await this.redis.incr(RATE_LIMITS.REDIS_KEY_DAILY_COUNT)
    
    // Set TTL on first request of the day (expires at midnight)
    if (count === 1) {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0) // Next midnight
      const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000)
      
      await this.redis.expire(RATE_LIMITS.REDIS_KEY_DAILY_COUNT, ttl)
      await this.redis.set(RATE_LIMITS.REDIS_KEY_DAILY_RESET, midnight.getTime().toString())
      await this.redis.expire(RATE_LIMITS.REDIS_KEY_DAILY_RESET, ttl)
    }
  }
  
  /**
   * Get current rate limit statistics
   */
  async getStats(): Promise<RateLimitStats | null> {
    if (!this.redis || !this.redisConnected) {
      return null
    }
    
    try {
      const [tokensStr, concurrentStr, dailyStr, resetStr] = await Promise.all([
        this.redis.get(RATE_LIMITS.REDIS_KEY_TOKENS),
        this.redis.get(RATE_LIMITS.REDIS_KEY_CONCURRENT),
        this.redis.get(RATE_LIMITS.REDIS_KEY_DAILY_COUNT),
        this.redis.get(RATE_LIMITS.REDIS_KEY_DAILY_RESET),
      ])
      
      const resetTime = resetStr ? parseInt(resetStr, 10) : Date.now() + 86400000
      
      return {
        currentTokens: tokensStr ? parseFloat(tokensStr) : RATE_LIMITS.MAX_TOKENS,
        concurrentRequests: concurrentStr ? parseInt(concurrentStr, 10) : 0,
        dailyUsed: dailyStr ? parseInt(dailyStr, 10) : 0,
        dailyLimit: RATE_LIMITS.DAILY_LIMIT,
        dailyResetAt: new Date(resetTime).toISOString(),
      }
      
    } catch (error) {
      logger.error('Failed to get rate limit stats', {
        error: error instanceof Error ? error.message : String(error),
      })
      
      return null
    }
  }
  
  /**
   * Reset all rate limits (admin only, for testing)
   */
  async reset(): Promise<void> {
    if (!this.redis || !this.redisConnected) {
      return
    }
    
    try {
      await Promise.all([
        this.redis.del(RATE_LIMITS.REDIS_KEY_TOKENS),
        this.redis.del(`${RATE_LIMITS.REDIS_KEY_TOKENS}:last_refill`),
        this.redis.del(RATE_LIMITS.REDIS_KEY_CONCURRENT),
        this.redis.del(RATE_LIMITS.REDIS_KEY_DAILY_COUNT),
        this.redis.del(RATE_LIMITS.REDIS_KEY_DAILY_RESET),
      ])
      
      logger.info('CanLII rate limits reset')
      
    } catch (error) {
      logger.error('Failed to reset rate limits', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  
  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit()
      this.redis = null
      this.redisConnected = false
    }
  }
}

// =====================================================
// Export singleton instance
// =====================================================

export const canliiRateLimiter = new CanLIIRateLimiter()

// =====================================================
// Helper: Execute CanLII request with rate limiting
// =====================================================

/**
 * Execute a CanLII API request with automatic rate limiting
 * 
 * Usage:
 * ```typescript
 * const result = await withCanLIIRateLimit(async () => {
 *   return fetch('https://api.canlii.org/...')
 * })
 * ```
 */
export async function withCanLIIRateLimit<T>(
  fn: () => Promise<T>
): Promise<T> {
  // Acquire rate limit
  const limit = await canliiRateLimiter.acquireLimit()
  
  if (!limit.allowed) {
    throw new Error(limit.reason || 'CanLII rate limit exceeded')
  }
  
  try {
    // Execute request
    const result = await fn()
    return result
    
  } finally {
    // Always release limit (even on error)
    await canliiRateLimiter.releaseLimit()
  }
}
