import { NextResponse } from 'next/server'
import { guardedRoute } from '@/lib/api/guard'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'
import {
  getAutomationConfigs,
  createAutomationConfig,
  updateAutomationConfig,
  deleteAutomationConfig
} from '@/lib/ai/training-service'

// GET /api/ai/automation - List all automation configs
export const GET = withRateLimit(
  { limit: 60, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const { user } = context
      const configs = await getAutomationConfigs()
      return NextResponse.json(configs)
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)

// POST /api/ai/automation - Create new automation config
export const POST = withRateLimit(
  { limit: 5, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const { user } = context
      const body = await request.json()
      const config = await createAutomationConfig({
        ...body,
        created_by: user.id
      })
      return NextResponse.json(config, { status: 201 })
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)

// PATCH /api/ai/automation - Update automation config
export const PATCH = withRateLimit(
  { limit: 5, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const body = await request.json()
      const { id, ...updates } = body
      
      if (!id) {
        return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
      }
      
      const config = await updateAutomationConfig(id, updates)
      return NextResponse.json(config)
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)

// DELETE /api/ai/automation?id=xxx - Delete automation config
export const DELETE = withRateLimit(
  { limit: 5, windowMs: 60000, keyType: 'user' },
  guardedRoute(
    async (request, context) => {
      const searchParams = request.nextUrl.searchParams
      const id = searchParams.get('id')
      
      if (!id) {
        return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
      }
      
      await deleteAutomationConfig(id)
      return NextResponse.json({ success: true })
    },
    {
      requireAuth: true,
      requireOrg: false,
      requiredPermission: 'admin.ai.manage'
    }
  )
)
