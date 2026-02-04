/**
 * AI Usage Quota Management
 *
 * Implements per-user daily and per-org monthly limits to prevent cost blowup.
 * Fail-closed behavior: deny requests when limits exceeded.
 *
 * Quota Tiers:
 * - User Daily: 100,000 tokens (~$0.30/day at GPT-4o pricing)
 * - Org Monthly by Tier:
 *   - PROFESSIONAL: 1M tokens (~$3/month)
 *   - BUSINESS: 5M tokens (~$15/month)
 *   - BUSINESS_PLUS: 10M tokens (~$30/month)
 *   - ENTERPRISE: 50M tokens (~$150/month)
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export interface QuotaCheckResult {
  allowed: boolean
  reason?: string
  userTokensUsed?: number
  userDailyLimit?: number
  orgTokensUsed?: number
  orgMonthlyLimit?: number
}

// Quota limits
const USER_DAILY_LIMIT = 100000 // 100K tokens per user per day

const ORG_MONTHLY_LIMITS: Record<string, number> = {
  FREE: 10000, // 10K tokens (very limited)
  PROFESSIONAL: 1000000, // 1M tokens (~$3/month)
  BUSINESS: 5000000, // 5M tokens (~$15/month)
  BUSINESS_PLUS: 10000000, // 10M tokens (~$30/month)
  ENTERPRISE: 50000000, // 50M tokens (~$150/month)
}

/**
 * Check if user and organization are within AI usage quotas
 *
 * @param userId - User ID to check
 * @param orgId - Organization ID to check (null for individual users)
 * @param operation - Type of AI operation ('chat' | 'coach' | 'embeddings')
 * @returns QuotaCheckResult with allowed status and usage details
 */
export async function checkAIQuota(
  userId: string,
  orgId: string | null,
  operation: 'chat' | 'coach' | 'embeddings' = 'chat'
): Promise<QuotaCheckResult> {
  const supabase = await createClient()

  try {
    // Calculate date boundaries
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Check user daily limit
    const { data: userUsage, error: userError } = await supabase
      .from('ai_usage_logs')
      .select('total_tokens')
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo.toISOString())

    if (userError) {
      logger.error('Failed to fetch user AI usage', userError, { userId, operation })
      // Fail open on query error (don't block legitimate users)
      return { allowed: true, reason: 'Usage tracking unavailable' }
    }

    const userTokensUsed = userUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

    if (userTokensUsed >= USER_DAILY_LIMIT) {
      logger.warn('User daily AI quota exceeded', {
        userId,
        operation,
        tokensUsed: userTokensUsed,
        limit: USER_DAILY_LIMIT,
      })

      return {
        allowed: false,
        reason: `You've reached your daily AI usage limit (${USER_DAILY_LIMIT.toLocaleString()} tokens). This limit resets in 24 hours. Consider upgrading your plan for higher limits.`,
        userTokensUsed,
        userDailyLimit: USER_DAILY_LIMIT,
      }
    }

    // Check org monthly limit (skip for individual users with no org)
    if (!orgId) {
      // Individual users only have user daily limit, no org limits
      return {
        allowed: true,
        userTokensUsed,
        userDailyLimit: USER_DAILY_LIMIT,
        orgTokensUsed: 0,
        orgMonthlyLimit: 0,
      }
    }

    const { data: subscription, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('tier')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single()

    if (subError) {
      logger.error('Failed to fetch org subscription', subError, { orgId, operation })
      // Default to FREE tier limits if subscription not found
      const tier = 'FREE'
      const orgLimit = ORG_MONTHLY_LIMITS[tier]

      const { data: orgUsage } = await supabase
        .from('ai_usage_logs')
        .select('total_tokens')
        .eq('organization_id', orgId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const orgTokensUsed = orgUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

      if (orgTokensUsed >= orgLimit) {
        return {
          allowed: false,
          reason: `Your organization has reached its monthly AI quota (${orgLimit.toLocaleString()} tokens). Upgrade your plan for higher limits.`,
          orgTokensUsed,
          orgMonthlyLimit: orgLimit,
        }
      }
    }

    const tier = subscription?.tier || 'FREE'
    const orgLimit = ORG_MONTHLY_LIMITS[tier] || ORG_MONTHLY_LIMITS.PROFESSIONAL

    // Get org usage for last 30 days
    const { data: orgUsage, error: orgError } = await supabase
      .from('ai_usage_logs')
      .select('total_tokens')
      .eq('organization_id', orgId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (orgError) {
      logger.error('Failed to fetch org AI usage', orgError, { orgId, operation })
      // Fail open on query error
      return { allowed: true, reason: 'Usage tracking unavailable' }
    }

    const orgTokensUsed = orgUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

    if (orgTokensUsed >= orgLimit) {
      logger.warn('Organization monthly AI quota exceeded', {
        orgId,
        tier,
        operation,
        tokensUsed: orgTokensUsed,
        limit: orgLimit,
      })

      return {
        allowed: false,
        reason: `Your organization has reached its monthly AI quota (${orgLimit.toLocaleString()} tokens for ${tier} tier). Upgrade your plan or wait until next billing cycle. Current usage: ${orgTokensUsed.toLocaleString()} tokens.`,
        orgTokensUsed,
        orgMonthlyLimit: orgLimit,
      }
    }

    // Within limits - allow request
    logger.debug('AI quota check passed', {
      userId,
      orgId,
      operation,
      userTokensUsed,
      userDailyLimit: USER_DAILY_LIMIT,
      orgTokensUsed,
      orgMonthlyLimit: orgLimit,
      tier,
    })

    return {
      allowed: true,
      userTokensUsed,
      userDailyLimit: USER_DAILY_LIMIT,
      orgTokensUsed,
      orgMonthlyLimit: orgLimit,
    }
  } catch (error) {
    logger.error('AI quota check failed', error as Error, { userId, orgId, operation })
    // Fail open on unexpected errors (don't block legitimate users)
    return { allowed: true, reason: 'Quota check failed, proceeding with request' }
  }
}

/**
 * Get current AI usage statistics for a user
 */
export async function getUserAIUsageStats(userId: string): Promise<{
  daily: { used: number; limit: number; percentage: number }
}> {
  const supabase = await createClient()

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { data: userUsage } = await supabase
    .from('ai_usage_logs')
    .select('total_tokens')
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString())

  const used = userUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

  return {
    daily: {
      used,
      limit: USER_DAILY_LIMIT,
      percentage: Math.round((used / USER_DAILY_LIMIT) * 100),
    },
  }
}

/**
 * Get current AI usage statistics for an organization
 */
export async function getOrgAIUsageStats(orgId: string): Promise<{
  monthly: { used: number; limit: number; percentage: number; tier: string }
}> {
  const supabase = await createClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Get org tier
  const { data: subscription } = await supabase
    .from('organization_subscriptions')
    .select('tier')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .single()

  const tier = subscription?.tier || 'FREE'
  const limit = ORG_MONTHLY_LIMITS[tier] || ORG_MONTHLY_LIMITS.PROFESSIONAL

  // Get org usage
  const { data: orgUsage } = await supabase
    .from('ai_usage_logs')
    .select('total_tokens')
    .eq('organization_id', orgId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const used = orgUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

  return {
    monthly: {
      used,
      limit,
      percentage: Math.round((used / limit) * 100),
      tier,
    },
  }
}
