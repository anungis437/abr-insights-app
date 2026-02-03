/**
 * AI Quota Enforcement Service
 * 
 * Provides quota checking and usage tracking for AI model requests.
 * Enforces daily request limits and monthly cost limits per organization.
 * 
 * Features:
 * - Pre-flight quota checking (before making AI request)
 * - Usage recording (after AI request completes)
 * - Cost estimation based on token usage
 * - Automatic quota initialization
 * - Warning threshold detection
 * 
 * Usage:
 * ```typescript
 * import { aiQuota } from '@/lib/services/ai-quota'
 * 
 * // Check quota before making request
 * const check = await aiQuota.checkQuota(orgId, 'gpt-4')
 * if (!check.allowed) {
 *   throw new Error(check.reason)
 * }
 * 
 * // Record usage after request completes
 * await aiQuota.recordUsage(orgId, {
 *   model: 'gpt-4',
 *   inputTokens: 100,
 *   outputTokens: 50,
 * })
 * ```
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'embedding'

export interface QuotaCheck {
  allowed: boolean
  reason?: string
  dailyLimit: number
  dailyUsed: number
  monthlyLimitCents: number
  monthlyUsedCents: number
  warningThreshold?: boolean
}

export interface UsageRecord {
  model: AIModel
  inputTokens: number
  outputTokens: number
  requestCount?: number
}

export interface AIQuotaConfig {
  organizationId: string
  dailyGpt4Limit: number
  dailyGpt35Limit: number
  dailyClaudeLimit: number
  dailyEmbeddingLimit: number
  monthlyCostLimitCents: number
  monthlyCostWarningCents: number
  enforceLimits: boolean
  sendWarnings: boolean
  alertEmail?: string
  alertSlackWebhook?: string
}

/**
 * AI cost estimation (in cents)
 * Based on OpenAI/Anthropic pricing as of Feb 2026
 */
const COST_PER_1K_TOKENS = {
  'gpt-4': {
    input: 3.0, // $0.03 per 1K input tokens
    output: 6.0, // $0.06 per 1K output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.05, // $0.0005 per 1K input tokens
    output: 0.15, // $0.0015 per 1K output tokens
  },
  claude: {
    input: 0.8, // $0.008 per 1K input tokens
    output: 2.4, // $0.024 per 1K output tokens
  },
  embedding: {
    input: 0.01, // $0.0001 per 1K tokens
    output: 0, // Embeddings don't have output tokens
  },
} as const

/**
 * Calculate cost in cents for AI request
 */
function calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
  const pricing = COST_PER_1K_TOKENS[model]
  const inputCost = (inputTokens / 1000) * pricing.input
  const outputCost = (outputTokens / 1000) * pricing.output
  return Math.ceil(inputCost + outputCost)
}

/**
 * Get or create AI quota configuration for organization
 */
async function getQuotaConfig(organizationId: string): Promise<AIQuotaConfig | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ai_quota')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      // If quota doesn't exist, create default
      if (error.code === 'PGRST116') {
        const { data: newQuota, error: insertError } = await supabase
          .from('ai_quota')
          .insert({
            organization_id: organizationId,
            daily_gpt4_limit: 100,
            daily_gpt35_limit: 500,
            daily_claude_limit: 100,
            daily_embedding_limit: 1000,
            monthly_cost_limit_cents: 10000, // $100
            monthly_cost_warning_cents: 7500, // $75
            enforce_limits: true,
            send_warnings: true,
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Failed to create default AI quota', { error: insertError, organizationId })
          return null
        }

        return {
          organizationId: newQuota.organization_id,
          dailyGpt4Limit: newQuota.daily_gpt4_limit,
          dailyGpt35Limit: newQuota.daily_gpt35_limit,
          dailyClaudeLimit: newQuota.daily_claude_limit,
          dailyEmbeddingLimit: newQuota.daily_embedding_limit,
          monthlyCostLimitCents: newQuota.monthly_cost_limit_cents,
          monthlyCostWarningCents: newQuota.monthly_cost_warning_cents,
          enforceLimits: newQuota.enforce_limits,
          sendWarnings: newQuota.send_warnings,
          alertEmail: newQuota.alert_email,
          alertSlackWebhook: newQuota.alert_slack_webhook,
        }
      }

      logger.error('Failed to fetch AI quota', { error, organizationId })
      return null
    }

    return {
      organizationId: data.organization_id,
      dailyGpt4Limit: data.daily_gpt4_limit,
      dailyGpt35Limit: data.daily_gpt35_limit,
      dailyClaudeLimit: data.daily_claude_limit,
      dailyEmbeddingLimit: data.daily_embedding_limit,
      monthlyCostLimitCents: data.monthly_cost_limit_cents,
      monthlyCostWarningCents: data.monthly_cost_warning_cents,
      enforceLimits: data.enforce_limits,
      sendWarnings: data.send_warnings,
      alertEmail: data.alert_email,
      alertSlackWebhook: data.alert_slack_webhook,
    }
  } catch (error) {
    logger.error('AI quota fetch exception', { error, organizationId })
    return null
  }
}

/**
 * Check if organization can make AI request
 */
async function checkQuota(organizationId: string, model: AIModel, requestCount = 1): Promise<QuotaCheck> {
  try {
    const supabase = await createClient()

    // Call database function to check quota
    const { data, error } = await supabase.rpc('check_ai_quota', {
      org_id: organizationId,
      model_type: model,
      request_count: requestCount,
    })

    if (error) {
      logger.error('Quota check failed', { error, organizationId, model })
      
      // Fail open on database errors (don't block AI requests)
      return {
        allowed: true,
        reason: undefined,
        dailyLimit: 0,
        dailyUsed: 0,
        monthlyLimitCents: 0,
        monthlyUsedCents: 0,
      }
    }

    const result = Array.isArray(data) ? data[0] : data

    // Check if approaching warning threshold
    const warningThreshold =
      result.monthly_used_cents >= (result.monthly_limit_cents * 0.75) &&
      result.monthly_used_cents < result.monthly_limit_cents

    return {
      allowed: result.allowed,
      reason: result.reason,
      dailyLimit: result.daily_limit,
      dailyUsed: result.daily_used,
      monthlyLimitCents: result.monthly_limit_cents,
      monthlyUsedCents: result.monthly_used_cents,
      warningThreshold,
    }
  } catch (error) {
    logger.error('Quota check exception', { error, organizationId, model })
    
    // Fail open on exceptions (don't block AI requests)
    return {
      allowed: true,
      reason: undefined,
      dailyLimit: 0,
      dailyUsed: 0,
      monthlyLimitCents: 0,
      monthlyUsedCents: 0,
    }
  }
}

/**
 * Record AI usage after request completes
 */
async function recordUsage(organizationId: string, usage: UsageRecord): Promise<void> {
  try {
    const supabase = await createClient()
    const requestCount = usage.requestCount || 1
    const cost = calculateCost(usage.model, usage.inputTokens, usage.outputTokens)

    // Determine which columns to increment based on model
    const updates: Record<string, number> = {
      total_cost_cents: cost,
    }

    switch (usage.model) {
      case 'gpt-4':
        updates.gpt4_requests = requestCount
        updates.gpt4_input_tokens = usage.inputTokens
        updates.gpt4_output_tokens = usage.outputTokens
        updates.gpt4_cost_cents = cost
        break
      case 'gpt-3.5-turbo':
        updates.gpt35_requests = requestCount
        updates.gpt35_input_tokens = usage.inputTokens
        updates.gpt35_output_tokens = usage.outputTokens
        updates.gpt35_cost_cents = cost
        break
      case 'claude':
        updates.claude_requests = requestCount
        updates.claude_input_tokens = usage.inputTokens
        updates.claude_output_tokens = usage.outputTokens
        updates.claude_cost_cents = cost
        break
      case 'embedding':
        updates.embedding_requests = requestCount
        updates.embedding_tokens = usage.inputTokens
        updates.embedding_cost_cents = cost
        break
    }

    // Upsert usage record (increment if exists, insert if not)
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.rpc('increment_ai_usage', {
      org_id: organizationId,
      usage_date: today,
      updates,
    })

    // If RPC doesn't exist, fall back to manual upsert
    if (error?.code === '42883') {
      const { data: existing } = await supabase
        .from('ai_usage_daily')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('date', today)
        .single()

      if (existing) {
        // Update existing record
        const updateData: Record<string, number> = {}
        for (const [key, value] of Object.entries(updates)) {
          updateData[key] = (existing[key] || 0) + value
        }

        await supabase
          .from('ai_usage_daily')
          .update(updateData)
          .eq('organization_id', organizationId)
          .eq('date', today)
      } else {
        // Insert new record
        await supabase.from('ai_usage_daily').insert({
          organization_id: organizationId,
          date: today,
          ...updates,
        })
      }
    } else if (error) {
      logger.error('Failed to record AI usage', { error, organizationId, model: usage.model })
    }

    logger.info('AI usage recorded', {
      organizationId,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costCents: cost,
    })
  } catch (error) {
    logger.error('AI usage recording exception', { error, organizationId, model: usage.model })
    // Don't throw - usage recording failures should not break AI requests
  }
}

/**
 * Get current usage for organization
 */
async function getUsage(
  organizationId: string,
  month?: Date
): Promise<{
  totalRequests: number
  totalCostCents: number
  gpt4Requests: number
  gpt35Requests: number
  claudeRequests: number
  embeddingRequests: number
} | null> {
  try {
    const supabase = await createClient()
    const targetMonth = month || new Date()

    const { data, error } = await supabase.rpc('get_monthly_ai_usage', {
      org_id: organizationId,
      target_month: targetMonth.toISOString().split('T')[0],
    })

    if (error) {
      logger.error('Failed to get AI usage', { error, organizationId })
      return null
    }

    const result = Array.isArray(data) ? data[0] : data

    return {
      totalRequests: result.total_requests,
      totalCostCents: result.total_cost_cents,
      gpt4Requests: result.gpt4_requests,
      gpt35Requests: result.gpt35_requests,
      claudeRequests: result.claude_requests,
      embeddingRequests: result.embedding_requests,
    }
  } catch (error) {
    logger.error('AI usage fetch exception', { error, organizationId })
    return null
  }
}

/**
 * AI Quota Service
 */
export const aiQuota = {
  checkQuota,
  recordUsage,
  getUsage,
  getQuotaConfig,
  calculateCost,
}
