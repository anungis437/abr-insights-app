/**
 * API Route: Generate Embeddings
 * 
 * POST /api/embeddings/generate
 * GET /api/embeddings/generate?jobId=...
 * 
 * Triggers batch embedding generation for cases or courses
 * 
 * Protected by:
 * - Authentication: Required (withAuth)
 * - Organization Context: Required (withOrg)
 * - Permission: 'admin.ai.manage' (super admin only - expensive operation)
 */

import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'
import {
  generateAllCaseEmbeddings,
  generateAllCourseEmbeddings,
  getEmbeddingJobStatus,
} from '@/lib/services/embedding-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for batch operations

async function generateEmbeddingsHandler(request: NextRequest, context: GuardedContext) {
  try {
    const body = await request.json()
    const { type, embeddingType, batchSize = 100 } = body

    // Validate type
    if (!type || !['cases', 'courses'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "cases" or "courses"' },
        { status: 400 }
      )
    }

    let jobProgress

    if (type === 'cases') {
      // Validate embedding type for cases
      const validCaseTypes = ['full_text', 'summary', 'title_only']
      if (embeddingType && !validCaseTypes.includes(embeddingType)) {
        return NextResponse.json(
          { error: `Embedding type must be one of: ${validCaseTypes.join(', ')}` },
          { status: 400 }
        )
      }

      jobProgress = await generateAllCaseEmbeddings({
        batchSize,
        embeddingType: embeddingType || 'full_text',
      })
    } else {
      // Validate embedding type for courses
      const validCourseTypes = ['full_content', 'description', 'objectives']
      if (embeddingType && !validCourseTypes.includes(embeddingType)) {
        return NextResponse.json(
          { error: `Embedding type must be one of: ${validCourseTypes.join(', ')}` },
          { status: 400 }
        )
      }

      jobProgress = await generateAllCourseEmbeddings({
        batchSize,
        embeddingType: embeddingType || 'full_content',
      })
    }

    // Log expensive AI operation for cost tracking
    const supabase = await createClient()
    await supabase.from('ai_usage_logs').insert({
      user_id: context.user!.id,
      organization_id: context.organizationId!,
      endpoint: 'embeddings-generate',
      operation_type: type,
      embedding_type: embeddingType,
      batch_size: batchSize,
      created_at: new Date().toISOString()
    }).catch(err => {
      console.error('Failed to log embedding generation:', err)
    })

    return NextResponse.json({
      success: true,
      message: `Successfully generated embeddings for ${type}`,
      job: jobProgress,
    })
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function getEmbeddingStatusHandler(request: NextRequest, context: GuardedContext) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const status = await getEmbeddingJobStatus(jobId)

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      job: status,
    })
  } catch (error) {
    console.error('Error getting embedding job status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Apply route guards with rate limiting - POST requires admin permission (expensive operation)
export const POST = withRateLimit(
  RateLimitPresets.embeddingsGenerate,
  guardedRoute(generateEmbeddingsHandler, {
    requireAuth: true,
    requireOrg: true,
    permissions: ['admin.ai.manage']
  })
)

// GET only requires authentication to check job status (higher rate limit)
export const GET = withRateLimit(
  RateLimitPresets.embeddingsSearch,
  guardedRoute(getEmbeddingStatusHandler, {
    requireAuth: true,
    requireOrg: true
  })
)
