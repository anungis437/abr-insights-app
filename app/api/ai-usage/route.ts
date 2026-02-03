/**
 * API: Get Current User's AI Usage
 *
 * GET /api/ai-usage
 *
 * Returns AI usage statistics for the current user's organization.
 * Available to all authenticated users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/observability/logger'
import { createClient } from '@/lib/supabase/server'
import { aiQuota } from '@/lib/services/ai-quota'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request)

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: 'Organization not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Get quota config and usage
    const [config, usage] = await Promise.all([
      aiQuota.getQuotaConfig(profile.organization_id),
      aiQuota.getUsage(profile.organization_id),
    ])

    if (!config) {
      return NextResponse.json(
        { error: 'Failed to fetch quota config', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }

    logger.info('AI usage retrieved', { organizationId: profile.organization_id, userId: user.id })

    return NextResponse.json({
      quota: {
        dailyGpt4Limit: config.dailyGpt4Limit,
        dailyGpt35Limit: config.dailyGpt35Limit,
        dailyClaudeLimit: config.dailyClaudeLimit,
        dailyEmbeddingLimit: config.dailyEmbeddingLimit,
        monthlyCostLimitCents: config.monthlyCostLimitCents,
        monthlyCostWarningCents: config.monthlyCostWarningCents,
      },
      usage: usage || {
        totalRequests: 0,
        totalCostCents: 0,
        gpt4Requests: 0,
        gpt35Requests: 0,
        claudeRequests: 0,
        embeddingRequests: 0,
      },
    })
  } catch (error) {
    logger.error('Failed to get AI usage', { error })
    return NextResponse.json(
      { error: 'Failed to retrieve AI usage', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
