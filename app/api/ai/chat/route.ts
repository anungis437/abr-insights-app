import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { withMultipleRedisRateLimits } from '@/lib/security/redisRateLimit'
import { RateLimitPresets } from '@/lib/security/rateLimitPresets'
import {
  validateAIResponse,
  verifyCitations,
  logAIInteraction,
} from '@/lib/services/ai-verification'
import { logger } from '@/lib/utils/production-logger'
import { checkAIQuota } from '@/lib/services/ai-quotas'

/**
 * AI Chat API Endpoint
 * Handles chat requests to Azure OpenAI GPT-4o
 * POST /api/ai/chat
 *
 * Protected by:
 * - Authentication: Required (withAuth)
 * - Organization Context: Required (withOrg)
 * - Permission: 'ai.chat.use' or 'admin.ai.manage'
 * - AI Usage Quotas: Per-user daily + per-org monthly limits
 */

async function chatHandler(request: NextRequest, context: GuardedContext) {
  try {
    const { message, context: chatContext } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Check AI usage quotas (cost control)
    const quotaCheck = await checkAIQuota(context.user!.id, context.organizationId!, 'chat')
    if (!quotaCheck.allowed) {
      logger.warn('AI quota exceeded', {
        userId: context.user!.id,
        organizationId: context.organizationId,
        reason: quotaCheck.reason,
      })
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          quotaExceeded: true,
          usage: {
            userDaily: quotaCheck.userTokensUsed,
            userLimit: quotaCheck.userDailyLimit,
            orgMonthly: quotaCheck.orgTokensUsed,
            orgLimit: quotaCheck.orgMonthlyLimit,
          },
        },
        { status: 429 }
      )
    }

    // Verify Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o'
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'

    if (!endpoint || !apiKey) {
      logger.error('Azure OpenAI misconfigured', new Error('Missing credentials'), {
        hasEndpoint: !!endpoint,
        hasApiKey: !!apiKey,
      })
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Validate input length (rate limit abuse prevention)
    if (message.length > 4000) {
      return NextResponse.json({ error: 'Message too long (max 4000 characters)' }, { status: 400 })
    }

    // Build system prompt with context
    const systemPrompt = `You are an expert AI assistant for the ABR Insights Platform - Canada's leading anti-Black racism education and case law analysis platform.

Your role is to:
1. Provide accurate, actionable guidance on anti-Black racism issues
2. Reference tribunal cases and legal precedents when relevant
3. Recommend appropriate courses for learning
4. Offer practical workplace solutions
5. Be empathetic, professional, and educational

Platform Context:
- ${chatContext?.casesCount || 0} tribunal cases in database covering anti-Black racism decisions
- ${chatContext?.coursesCount || 0} training courses available
- User has completed ${chatContext?.completedCount || 0} courses

Guidelines:
- If asked about CASE LAW: Explain general patterns and principles from Canadian human rights tribunal cases
- If asked about LEARNING: Recommend topics to explore in our course catalog
- If asked about INVESTIGATIONS: Provide step-by-step guidance based on best practices
- If asked about POLICY: Offer evidence-based policy recommendations
- Always be respectful, informative, and action-oriented
- If you don't know something specific, acknowledge limitations and suggest general directions

Respond in a helpful, conversational tone with actionable insights.`

    // Call Azure OpenAI
    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Azure OpenAI API request failed', new Error(errorText), {
        status: response.status,
        userId: context.user?.id,
      })
      throw new Error(`Azure OpenAI API returned ${response.status}`)
    }

    const data = await response.json()
    const rawResponse = data.choices?.[0]?.message?.content || 'Unable to generate response.'

    // Apply AI verification and safety controls
    const verification = validateAIResponse(rawResponse)
    const { citations, verifiedSources, unverifiedSources } = verifyCitations(rawResponse)

    const finalResponse = verification.safe
      ? verification.modifiedResponse
      : verification.modifiedResponse
    const flags = verification.flags

    // Log AI interaction to audit trail
    const supabase = await createClient()
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`

    try {
      await logAIInteraction({
        organization_id: context.organizationId!,
        user_id: context.user!.id,
        session_id: sessionId,
        interaction_type: 'chat',
        prompt: message,
        response: finalResponse,
        model: deployment,
        tokens_used: data.usage?.total_tokens || 0,
        citations,
        flags,
        verified_sources: verifiedSources,
        contains_legal_advice_warning: flags.includes('LEGAL_ADVICE_BLOCKED'),
        human_reviewed: false,
      })
    } catch (err) {
      // Log error but don't fail the request
      logger.warn('Failed to log AI interaction', {
        error: err instanceof Error ? err.message : String(err),
        userId: context.user!.id,
      })
    }

    // Also log to legacy ai_usage_logs for cost tracking
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: context.user!.id,
        organization_id: context.organizationId!,
        endpoint: 'chat',
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        model: deployment,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      logger.warn('Failed to log AI usage', {
        error: err instanceof Error ? err.message : String(err),
        userId: context.user!.id,
      })
    }

    return NextResponse.json({
      response: finalResponse,
      usage: data.usage,
      verification: {
        safe: verification.safe,
        flags,
        citations: citations.length,
        verifiedSources: verifiedSources.length,
        unverifiedSources: unverifiedSources.length,
      },
    })
  } catch (error: any) {
    logger.error('AI chat request failed', error as Error, {
      userId: context.user?.id,
      organizationId: context.organizationId,
      errorMessage: error.message,
    })
    return NextResponse.json(
      {
        error: 'Failed to process AI request',
      },
      { status: 500 }
    )
  }
}

// Apply route guards with rate limiting
export const POST = withMultipleRedisRateLimits(
  guardedRoute(chatHandler, {
    requireAuth: true,
    requireOrg: true,
    anyPermissions: ['ai.chat.use', 'admin.ai.manage'],
  }),
  [RateLimitPresets.aiChat, RateLimitPresets.aiChatOrg]
)
