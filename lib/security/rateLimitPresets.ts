/**
 * Rate Limiting Presets for Production
 *
 * Centralized rate limit configurations for different endpoint types.
 * Applied consistently across the application.
 */

import { RateLimitConfig } from './rateLimit'

/**
 * Public endpoints (no authentication required)
 * Conservative limits to prevent abuse
 */
export const PUBLIC_RATE_LIMITS = {
  /** Contact form - prevent spam */
  contact: {
    requests: 5,
    window: 3600, // 1 hour
    keyType: 'ip',
  } as RateLimitConfig,

  /** Newsletter signup - prevent spam */
  newsletter: {
    requests: 3,
    window: 3600, // 1 hour
    keyType: 'ip',
  } as RateLimitConfig,

  /** Badge verification - public but rate limited */
  badges: {
    requests: 100,
    window: 60, // 1 minute
    keyType: 'ip',
  } as RateLimitConfig,
}

/**
 * Authenticated user endpoints
 * More generous limits for logged-in users
 */
export const USER_RATE_LIMITS = {
  /** AI chat/assistant - expensive OpenAI calls */
  aiChat: {
    requests: 20,
    window: 60, // 1 minute (20 messages/minute)
    keyType: 'user',
  } as RateLimitConfig,

  /** AI coach - expensive OpenAI calls */
  aiCoach: {
    requests: 10,
    window: 60, // 1 minute (10 requests/minute)
    keyType: 'user',
  } as RateLimitConfig,

  /** Evidence bundle generation - expensive PDF generation */
  evidenceBundle: {
    requests: 10,
    window: 300, // 5 minutes (10 bundles per 5 min)
    keyType: 'user',
  } as RateLimitConfig,

  /** Search/embeddings - moderate cost */
  search: {
    requests: 30,
    window: 60, // 1 minute (30 searches/minute)
    keyType: 'user',
  } as RateLimitConfig,

  /** General authenticated API */
  general: {
    requests: 100,
    window: 60, // 1 minute
    keyType: 'user',
  } as RateLimitConfig,
}

/**
 * Organization-level endpoints
 * Shared limits across all users in an org
 */
export const ORG_RATE_LIMITS = {
  /** Batch operations */
  batch: {
    requests: 50,
    window: 3600, // 1 hour
    keyType: 'org',
  } as RateLimitConfig,

  /** Data exports */
  exports: {
    requests: 20,
    window: 3600, // 1 hour (20 exports per hour per org)
    keyType: 'org',
  } as RateLimitConfig,

  /** Ingestion operations */
  ingestion: {
    requests: 100,
    window: 3600, // 1 hour (100 cases per hour per org)
    keyType: 'org',
  } as RateLimitConfig,
}

/**
 * Payment/billing endpoints
 * Critical financial operations with strict limits
 */
export const PAYMENT_RATE_LIMITS = {
  /** Stripe checkout session creation */
  checkout: {
    requests: 10,
    window: 3600, // 1 hour (10 checkout attempts per hour)
    keyType: 'user',
  } as RateLimitConfig,

  /** Stripe portal access */
  portal: {
    requests: 20,
    window: 3600, // 1 hour
    keyType: 'user',
  } as RateLimitConfig,
}

/**
 * Admin endpoints
 * High privileges, moderate limits
 */
export const ADMIN_RATE_LIMITS = {
  /** Admin operations */
  admin: {
    requests: 200,
    window: 60, // 1 minute
    keyType: 'user',
  } as RateLimitConfig,
}

/**
 * Webhook endpoints
 * Very high limits for trusted sources (Stripe, GitHub, etc.)
 */
export const WEBHOOK_RATE_LIMITS = {
  /** Stripe webhooks */
  stripe: {
    requests: 1000,
    window: 60, // 1 minute
    keyType: 'ip',
  } as RateLimitConfig,
}

/**
 * Unified rate limit presets (combines all categories)
 * Use this for convenient access to all presets
 */
export const RateLimitPresets = {
  // Public
  contactForm: PUBLIC_RATE_LIMITS.contact,
  newsletter: PUBLIC_RATE_LIMITS.newsletter,
  badges: PUBLIC_RATE_LIMITS.badges,

  // User
  aiChat: USER_RATE_LIMITS.aiChat,
  aiCoach: USER_RATE_LIMITS.aiCoach,
  evidenceBundle: USER_RATE_LIMITS.evidenceBundle,
  embeddingsSearch: USER_RATE_LIMITS.search,
  general: USER_RATE_LIMITS.general,

  // Organization
  aiChatOrg: { ...USER_RATE_LIMITS.aiChat, keyType: 'org' as const },
  aiCoachOrg: { ...USER_RATE_LIMITS.aiCoach, keyType: 'org' as const },
  orgBatch: ORG_RATE_LIMITS.batch,
  orgExports: ORG_RATE_LIMITS.exports,
  orgIngestion: ORG_RATE_LIMITS.ingestion,

  // Payment
  checkout: PAYMENT_RATE_LIMITS.checkout,
  portal: PAYMENT_RATE_LIMITS.portal,

  // Admin
  admin: ADMIN_RATE_LIMITS.admin,

  // Webhooks
  webhook: WEBHOOK_RATE_LIMITS.stripe,
}
