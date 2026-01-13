import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute } from '@/lib/api/guard'
import { withRateLimit } from '@/lib/security/rateLimit'
import {
  getTrainingJobs,
  getTrainingJob,
  createTrainingJob,
  updateTrainingJob,
  deployModel,
  getTrainingStatistics
} from '@/lib/ai/training-service'

export const maxDuration = 300

// GET /api/ai/training-jobs - List all training jobs
// GET /api/ai/training-jobs?status=running - Filter by status
export const GET = withRateLimit(
  { limit: 60, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const searchParams = request.nextUrl.searchParams
      const status = searchParams.get('status')
      const getStats = searchParams.get('stats') === 'true'
      
      if (getStats) {
        const stats = await getTrainingStatistics()
        return NextResponse.json(stats)
      }
      
      const jobs = await getTrainingJobs({
        status: status || undefined
      })
      
      return NextResponse.json(jobs)
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)

// POST /api/ai/training-jobs - Create a new training job
export const POST = withRateLimit(
  { limit: 3, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const { user } = context
      const body = await request.json()
      const {
        job_name,
        base_model,
        feedback_ids,
        training_data_url,
        validation_data_url,
        hyperparameters,
        notes,
        version
      } = body
      
      // Validate required fields
      if (!job_name || !base_model || !feedback_ids || !training_data_url) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }
      
      // Create the training job
      const job = await createTrainingJob({
        job_name,
        version,
        status: 'pending',
        provider: 'openai',
        provider_job_id: null,
        base_model,
        fine_tuned_model: null,
        feedback_count: feedback_ids.length,
        feedback_ids,
        training_data_url,
        validation_data_url: validation_data_url || null,
        hyperparameters: hyperparameters || {
          n_epochs: 3,
          batch_size: 8,
          learning_rate_multiplier: 1.0
        },
        started_at: null,
        completed_at: null,
        training_log: [{
          timestamp: new Date().toISOString(),
          event: 'job_created',
          message: 'Training job created and data prepared'
        }],
        training_metrics: {},
        validation_metrics: {},
        is_deployed: false,
        deployed_at: null,
        deployed_by: null,
        created_by: user.id,
        notes: notes || null,
        error_message: null
      })
      
      return NextResponse.json(job, { status: 201 })
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)

// PATCH /api/ai/training-jobs - Update a training job
export const PATCH = withRateLimit(
  { limit: 10, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const body = await request.json()
      const { id, ...updates } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
      }
      
      const job = await updateTrainingJob(id, updates)
      return NextResponse.json(job)
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)
