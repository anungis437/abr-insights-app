/**
 * API Route: Search Similar Cases
 *
 * POST /api/embeddings/search-cases
 *
 * Performs semantic similarity search for tribunal cases using vector embeddings
 *
 * Protected by:
 * - Authentication: Required
 * - AI Usage Quotas: Per-user daily + per-org monthly limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { withRedisRateLimit } from '@/lib/security/redisRateLimit'
import { RateLimitPresets } from '@/lib/security/rateLimitPresets'
import { checkAIQuota } from '@/lib/services/ai-quotas'
import { logger } from '@/lib/utils/production-logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function searchCasesHandler(request: NextRequest, context: GuardedContext) {
  // Check AI usage quotas (embeddings consume tokens)
  const quotaCheck = await checkAIQuota(context.user!.id, context.organizationId!, 'embeddings')
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

  // Lazy load to avoid build-time initialization
  const { searchSimilarCasesByText } = await import('@/lib/services/embedding-service')

  const body = await request.json()
  const {
    query,
    similarityThreshold = 0.7,
    maxResults = 10,
    tribunalName,
    discriminationGrounds,
  } = body

  // Validate query
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query text is required' }, { status: 400 })
  }

  if (query.length > 2000) {
    return NextResponse.json(
      { error: 'Query text too long (max 2000 characters)' },
      { status: 400 }
    )
  }

  // Validate similarity threshold
  if (similarityThreshold < 0 || similarityThreshold > 1) {
    return NextResponse.json(
      { error: 'Similarity threshold must be between 0 and 1' },
      { status: 400 }
    )
  }

  // Validate max results
  if (maxResults < 1 || maxResults > 100) {
    return NextResponse.json({ error: 'Max results must be between 1 and 100' }, { status: 400 })
  }

  // Perform search
  const results = await searchSimilarCasesByText(query, {
    similarityThreshold,
    maxResults,
    tribunalName,
    discriminationGrounds,
  })

  return NextResponse.json({
    success: true,
    query,
    resultsCount: results.length,
    results,
  })
}

export const POST = withRedisRateLimit(
  guardedRoute(searchCasesHandler, {
    requireAuth: true,
    requireOrg: true,
    anyPermissions: ['cases.search', 'embeddings.search'],
  }),
  RateLimitPresets.embeddingsSearch
)
