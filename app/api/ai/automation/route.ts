import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rateLimit'
import {
  getAutomationConfigs,
  createAutomationConfig,
  updateAutomationConfig,
  deleteAutomationConfig
} from '@/lib/ai/training-service'

// GET /api/ai/automation - List all automation configs
async function getAutomationHandler(request: NextRequest, context: GuardedContext) {
  const configs = await getAutomationConfigs()
  return NextResponse.json(configs)
}

// POST /api/ai/automation - Create new automation config
async function postAutomationHandler(request: NextRequest, context: GuardedContext) {
  const body = await request.json()
  const config = await createAutomationConfig({
    ...body,
    created_by: context.user!.id
  })
  return NextResponse.json(config, { status: 201 })
}

// PATCH /api/ai/automation - Update automation config
async function patchAutomationHandler(request: NextRequest, context: GuardedContext) {
  const body = await request.json()
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
  }
  
  const config = await updateAutomationConfig(id, updates)
  return NextResponse.json(config)
}

// DELETE /api/ai/automation?id=xxx - Delete automation config
async function deleteAutomationHandler(request: NextRequest, context: GuardedContext) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
  }
  
  await deleteAutomationConfig(id)
  return NextResponse.json({ success: true })
}

// Apply route guards with rate limiting
export const GET = withRateLimit(
  { requests: 60, window: 60, keyType: 'user' },
  guardedRoute(getAutomationHandler, {
    requireAuth: true,
    requireOrg: false,
    permissions: ['admin.ai.manage']
  })
)

export const POST = withRateLimit(
  { requests: 5, window: 60, keyType: 'user' },
  guardedRoute(postAutomationHandler, {
    requireAuth: true,
    requireOrg: false,
    permissions: ['admin.ai.manage']
  })
)

export const PATCH = withRateLimit(
  { requests: 5, window: 60, keyType: 'user' },
  guardedRoute(patchAutomationHandler, {
    requireAuth: true,
    requireOrg: false,
    permissions: ['admin.ai.manage']
  })
)

export const DELETE = withRateLimit(
  { requests: 5, window: 60, keyType: 'user' },
  guardedRoute(deleteAutomationHandler, {
    requireAuth: true,
    requireOrg: false,
    permissions: ['admin.ai.manage']
  })
)
