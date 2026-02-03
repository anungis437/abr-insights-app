/**
 * Cancel Tenant Offboarding API
 *
 * POST /api/admin/tenant-offboarding/cancel
 * Restores a soft-deleted organization before hard delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelOffboarding } from '@/lib/services/tenant-offboarding'
import { logAuthorizationEvent } from '@/lib/services/audit-logger'
import { createRequestLogger } from '@/lib/observability/logger'

async function verifySuperAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  return profile?.role === 'super_admin'
}

export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const isSuperAdmin = await verifySuperAdmin(supabase, user.id)
    if (!isSuperAdmin) {
      const { organizationId } = body
      await logAuthorizationEvent(
        organizationId || 'system',
        'cancel_offboarding_denied',
        user.id,
        'organization',
        organizationId,
        { reason: 'Attempted to cancel offboarding without super_admin role' }
      )
      return NextResponse.json({ error: 'Forbidden: super_admin required' }, { status: 403 })
    }
    const { organizationId, reason } = body

    if (!organizationId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, reason' },
        { status: 400 }
      )
    }

    const result = await cancelOffboarding(
      organizationId,
      user.id,
      reason,
      request.headers.get('x-forwarded-for') || undefined
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Cancel offboarding failed', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
