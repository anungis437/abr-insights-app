import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'
import {
  getClassificationFeedback,
  createClassificationFeedback,
  updateClassificationFeedback,
} from '@/lib/ai/training-service'
import { logger } from '@/lib/utils/production-logger'

/**
 * AI Feedback API - Manage classification feedback for AI training
 * Protected: Admin only (admin.ai.manage permission)
 */

// GET /api/ai/feedback - List all classification feedback
async function getFeedbackHandler(request: NextRequest, context: GuardedContext) {
  try {
    const searchParams = request.nextUrl.searchParams
    const usedForTraining = searchParams.get('used')
    const minQualityScore = searchParams.get('minQuality')

    const feedback = await getClassificationFeedback({
      usedForTraining:
        usedForTraining === 'true' ? true : usedForTraining === 'false' ? false : undefined,
      minQualityScore: minQualityScore ? parseInt(minQualityScore) : undefined,
    })

    return NextResponse.json(feedback)
  } catch (error) {
    logger.error('Failed to fetch AI feedback', error as Error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}

// POST /api/ai/feedback - Create new classification feedback
async function createFeedbackHandler(request: NextRequest, context: GuardedContext) {
  try {
    const body = await request.json()
    const feedback = await createClassificationFeedback({
      ...body,
      reviewed_by: context.user!.id,
      reviewed_date: new Date().toISOString(),
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    logger.error('Failed to create AI feedback', error as Error, {
      userId: context.user!.id,
    })
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
}

// PATCH /api/ai/feedback - Update classification feedback
async function updateFeedbackHandler(request: NextRequest, context: GuardedContext) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    const feedback = await updateClassificationFeedback(id, updates)

    return NextResponse.json(feedback)
  } catch (error) {
    logger.error('Failed to update AI feedback', error as Error, {
      userId: context.user!.id,
    })
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}

// Apply route guards with rate limiting (admin only)
export const GET = withRateLimit(
  RateLimitPresets.embeddingsSearch,
  guardedRoute(getFeedbackHandler, {
    requireAuth: true,
    requireOrg: true,
    permissions: ['admin.ai.manage'],
  })
)

export const POST = withRateLimit(
  { requests: 10, window: 60, keyType: 'user' },
  guardedRoute(createFeedbackHandler, {
    requireAuth: true,
    requireOrg: true,
    permissions: ['admin.ai.manage'],
  })
)

export const PATCH = withRateLimit(
  { requests: 10, window: 60, keyType: 'user' },
  guardedRoute(updateFeedbackHandler, {
    requireAuth: true,
    requireOrg: true,
    permissions: ['admin.ai.manage'],
  })
)
