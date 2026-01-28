/**
 * Rate Limiting Infrastructure
 * 
 * Implements token bucket algorithm with multiple limit keys:
 * - IP-based: For public endpoints (contact, newsletter)
 * - User-based: For authenticated user actions (AI chat, search)
 * - Org-based: For organization-level limits (batch operations)
 * 
 * ⚠️ PRODUCTION WARNING ⚠️
 * Current implementation uses in-memory storage (Map) which is NOT production-safe:
 * - Breaks across horizontal scaling (multiple instances)
 * - Resets on serverless cold starts
 * - Not shared across Azure Static Web Apps nodes
 * 
 * REQUIRED FOR PRODUCTION:
 * - Migrate to Redis (recommended: Upstash Redis for serverless)
 * - Alternative: Azure Cache for Redis
 * - See: https://upstash.com/ or https://azure.microsoft.com/en-us/services/cache/
 * 
 * TODO: Implement Redis-based rate limiting before production deployment
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  requests: number;
  /** Time window in seconds */
  window: number;
  /** Key type for rate limiting */
  keyType: 'ip' | 'user' | 'org' | 'custom';
  /** Custom key generator (if keyType is 'custom') */
  keyGenerator?: (request: NextRequest, context?: any) => string;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per second
}

// In-memory storage (use Redis for production)
const buckets = new Map<string, TokenBucket>();
const MAX_BUCKETS = 10000; // Prevent memory exhaustion

/**
 * Clean old buckets when limit exceeded
 */
function cleanOldBuckets() {
  if (buckets.size < MAX_BUCKETS) return;
  
  const now = Date.now();
  const cutoff = now - 3600000; // 1 hour
  
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key);
    }
  }
  
  // If still over limit, remove oldest 10%
  if (buckets.size >= MAX_BUCKETS) {
    const sortedKeys = Array.from(buckets.entries())
      .sort((a, b) => a[1].lastRefill - b[1].lastRefill)
      .slice(0, Math.floor(MAX_BUCKETS * 0.1))
      .map(([key]) => key);
    
    sortedKeys.forEach(key => buckets.delete(key));
  }
}

/**
 * Get or create token bucket for a key
 */
function getBucket(key: string, config: RateLimitConfig): TokenBucket {
  cleanOldBuckets();
  
  let bucket = buckets.get(key);
  
  if (!bucket) {
    bucket = {
      tokens: config.requests,
      lastRefill: Date.now(),
      maxTokens: config.requests,
      refillRate: config.requests / config.window
    };
    buckets.set(key, bucket);
  }
  
  return bucket;
}

/**
 * Refill tokens based on elapsed time
 */
function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000; // Convert to seconds
  
  const tokensToAdd = elapsed * bucket.refillRate;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;
}

/**
 * Consume a token from the bucket
 * @returns true if request allowed, false if rate limited
 */
function consumeToken(bucket: TokenBucket): boolean {
  refillBucket(bucket);
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }
  
  return false;
}

/**
 * Get rate limit key based on configuration
 */
export function getRateLimitKey(
  request: NextRequest,
  config: RateLimitConfig,
  context?: any
): string {
  switch (config.keyType) {
    case 'ip':
      return `ip:${getClientIP(request)}`;
    
    case 'user':
      if (!context?.user?.id) {
        throw new Error('User context required for user-based rate limiting');
      }
      return `user:${context.user.id}`;
    
    case 'org':
      if (!context?.organizationId) {
        throw new Error('Organization context required for org-based rate limiting');
      }
      return `org:${context.organizationId}`;
    
    case 'custom':
      if (!config.keyGenerator) {
        throw new Error('Custom key generator required for custom rate limiting');
      }
      return config.keyGenerator(request, context);
    
    default:
      throw new Error(`Unknown rate limit key type: ${config.keyType}`);
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback (not reliable in production)
  return 'unknown';
}

/**
 * Check if request should be rate limited
 * @returns RateLimitResult with allowed status and headers
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds until retry
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  context?: any
): Promise<RateLimitResult> {
  const key = getRateLimitKey(request, config, context);
  const bucket = getBucket(key, config);
  
  const allowed = consumeToken(bucket);
  const remaining = Math.floor(bucket.tokens);
  const reset = Math.ceil(bucket.lastRefill / 1000 + config.window);
  
  const result: RateLimitResult = {
    allowed,
    limit: config.requests,
    remaining: Math.max(0, remaining),
    reset
  };
  
  if (!allowed) {
    // Calculate retry after (when 1 token will be available)
    const tokensNeeded = 1 - bucket.tokens;
    result.retryAfter = Math.ceil(tokensNeeded / bucket.refillRate);
  }
  
  return result;
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  };
  
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
}

/**
 * Create 429 rate limit exceeded response
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter
    },
    {
      status: 429,
      headers: createRateLimitHeaders(result)
    }
  );
}

/**
 * Higher-order function to apply rate limiting to a handler
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const result = await checkRateLimit(request, config, context);
    
    if (!result.allowed) {
      return createRateLimitResponse(result);
    }
    
    // Add rate limit headers to successful response
    const response = await Promise.resolve(handler(request, context));
    const headers = createRateLimitHeaders(result);
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    
    return response;
  };
}

/**
 * Composeable rate limiter with multiple limits
 * Checks all limits and fails if any exceed
 */
export function withMultipleRateLimits(
  configs: RateLimitConfig[],
  handler: (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Check all rate limits
    for (const config of configs) {
      const result = await checkRateLimit(request, config, context);
      
      if (!result.allowed) {
        return createRateLimitResponse(result);
      }
    }
    
    // All limits passed, execute handler
    const response = await Promise.resolve(handler(request, context));
    
    // Add most restrictive limit headers
    const results = await Promise.all(
      configs.map(config => checkRateLimit(request, config, context))
    );
    
    const mostRestrictive = results.reduce((prev, curr) => 
      curr.remaining < prev.remaining ? curr : prev
    );
    
    const headers = createRateLimitHeaders(mostRestrictive);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    
    return response;
  };
}

/**
 * Reset rate limit for a specific key (admin use only)
 */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): TokenBucket | null {
  return buckets.get(key) || null;
}

/**
 * Clear all rate limit buckets (testing/admin use only)
 */
export function clearAllRateLimits(): void {
  buckets.clear();
}

/**
 * Get statistics about rate limiting
 */
export function getRateLimitStats() {
  return {
    totalBuckets: buckets.size,
    maxBuckets: MAX_BUCKETS,
    memoryUsage: `${(buckets.size * 64 / 1024).toFixed(2)} KB` // Approximate
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // AI endpoints - moderate limits per user
  aiChat: {
    requests: 30,
    window: 60,
    keyType: 'user' as const
  },
  
  aiCoach: {
    requests: 20,
    window: 60,
    keyType: 'user' as const
  },
  
  // AI endpoints - org-level limits
  aiChatOrg: {
    requests: 120,
    window: 60,
    keyType: 'org' as const
  },
  
  aiCoachOrg: {
    requests: 80,
    window: 60,
    keyType: 'org' as const
  },
  
  // Expensive operations - very low limits
  embeddingsGenerate: {
    requests: 2,
    window: 3600, // 1 hour
    keyType: 'org' as const
  },
  
  // Search operations - higher limits
  embeddingsSearch: {
    requests: 60,
    window: 60,
    keyType: 'user' as const
  },
  
  // Public forms - IP-based limits
  contactForm: {
    requests: 5,
    window: 60,
    keyType: 'ip' as const
  },
  
  newsletter: {
    requests: 3,
    window: 60,
    keyType: 'ip' as const
  }
};
