/**
 * Admin API: Get AI Quota Configuration
 *
 * GET /api/admin/ai-quota?organizationId=xxx
 *
 * Returns AI quota configuration and current usage for an organization.
 * Super admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/observability/logger'
import { createClient } from '@/lib/supabase/server'
import { aiQuota } from '@/lib/services/ai-quota'

export const dynamic = 'force-dynamic'

async function verifySuperAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    authorized: profile?.role === 'super_admin',
    user,
  }
}

export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request)

  try {
    // Verify super admin
    const { authorized } = await verifySuperAdmin(request)
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized', code: 'FORBIDDEN' }, { status: 403 })
    }

    // Get organization ID from query params
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      )
    }

    // Get quota config
    const config = await aiQuota.getQuotaConfig(organizationId)
    if (!config) {
      return NextResponse.json(
        { error: 'Failed to fetch quota config', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }

    // Get current usage
    const usage = await aiQuota.getUsage(organizationId)

    logger.info('AI quota retrieved', { organizationId })

    return NextResponse.json({
      config,
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
    logger.error('Failed to get AI quota', { error })
    return NextResponse.json(
      { error: 'Failed to retrieve AI quota', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * Admin API: Update AI Quota Configuration
 *
 * PUT /api/admin/ai-quota
 *
 * Updates AI quota configuration for an organization.
 * Super admin only.
 */
export async function PUT(request: NextRequest) {
  const logger = createRequestLogger(request)

  try {
    // Verify super admin
    const { authorized, user } = await verifySuperAdmin(request)
    if (!authorized || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await request.json()
    const {
      organizationId,
      dailyGpt4Limit,
      dailyGpt35Limit,
      dailyClaudeLimit,
      dailyEmbeddingLimit,
      monthlyCostLimitCents,
      monthlyCostWarningCents,
      enforceLimits,
      sendWarnings,
      alertEmail,
      alertSlackWebhook,
    } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      )
    }

    // Update quota config
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_quota')
      .update({
        daily_gpt4_limit: dailyGpt4Limit,
        daily_gpt35_limit: dailyGpt35Limit,
        daily_claude_limit: dailyClaudeLimit,
        daily_embedding_limit: dailyEmbeddingLimit,
        monthly_cost_limit_cents: monthlyCostLimitCents,
        monthly_cost_warning_cents: monthlyCostWarningCents,
        enforce_limits: enforceLimits,
        send_warnings: sendWarnings,
        alert_email: alertEmail,
        alert_slack_webhook: alertSlackWebhook,
        updated_by: user.id,
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update AI quota', { error, organizationId })
      return NextResponse.json(
        { error: 'Failed to update AI quota', code: 'UPDATE_FAILED' },
        { status: 500 }
      )
    }

    logger.info('AI quota updated', { organizationId, updatedBy: user.id })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('AI quota update failed', { error })
    return NextResponse.json(
      { error: 'Failed to update AI quota', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
