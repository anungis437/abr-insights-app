/**
 * Tenant Offboarding API
 *
 * Endpoints for managing organization deletion lifecycle:
 * - POST /api/admin/tenant-offboarding (initiate soft delete)
 * - DELETE /api/admin/tenant-offboarding (execute hard delete)
 * - POST /api/admin/tenant-offboarding/cancel (restore soft-deleted org)
 * - GET /api/admin/tenant-offboarding/pending (list pending deletions)
 *
 * @requires super_admin role
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  initiateOffboarding,
  executeHardDelete,
  cancelOffboarding,
  getPendingDeletions,
  type OffboardingRequest,
} from '@/lib/services/tenant-offboarding'
import { logAuthorizationEvent } from '@/lib/services/audit-logger'

/**
 * Verify super_admin role
 */
async function verifySuperAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'super_admin'
}

/**
 * POST: Initiate tenant offboarding (soft delete)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify super_admin
    const isSuperAdmin = await verifySuperAdmin(supabase, user.id)
    if (!isSuperAdmin) {
      await logAuthorizationEvent(
        null,
        'tenant_offboarding_denied',
        user.id,
        false,
        'super_admin',
        'Attempted tenant offboarding without super_admin role'
      )
      return NextResponse.json({ error: 'Forbidden: super_admin required' }, { status: 403 })
    }

    const body = await request.json()
    const { organizationId, reason, gracePeriodDays } = body

    if (!organizationId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, reason' },
        { status: 400 }
      )
    }

    const offboardingRequest: OffboardingRequest = {
      organizationId,
      requestedBy: user.id,
      reason,
      gracePeriodDays: gracePeriodDays || 30,
      preserveAuditLogs: true,
      preserveCompliance: true,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    }

    const result = await initiateOffboarding(offboardingRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Offboarding failed', details: result.errors },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[API] Tenant offboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE: Execute hard delete (permanent removal)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify super_admin
    const isSuperAdmin = await verifySuperAdmin(supabase, user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: super_admin required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const preserveAuditLogs = searchParams.get('preserveAuditLogs') !== 'false'

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId parameter' }, { status: 400 })
    }

    const result = await executeHardDelete(organizationId, user.id, preserveAuditLogs, true)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Hard delete failed', details: result.errors },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[API] Hard delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET: List pending deletions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify super_admin
    const isSuperAdmin = await verifySuperAdmin(supabase, user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: super_admin required' }, { status: 403 })
    }

    const pendingDeletions = await getPendingDeletions()

    return NextResponse.json({
      success: true,
      pendingDeletions,
      count: pendingDeletions.length,
    })
  } catch (error) {
    console.error('[API] Get pending deletions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
