/**
 * PR-06: Admin Offboarding API Endpoints
 * 
 * Admin endpoints for organization offboarding management:
 * - POST: Initiate offboarding
 * - GET: Get offboarding status
 * - GET: Download data export
 * 
 * Super admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/observability/production-logger'
import { createClient } from '@/lib/supabase/server'
import { orgOffboarding } from '@/lib/services/org-offboarding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// =====================================================
// Helper: Verify Super Admin
// =====================================================

async function verifySuperAdmin(request: NextRequest) {
  const logger = createRequestLogger(request)
  const supabase = createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  if (authError || !user) {
    logger.warn('Unauthorized offboarding access attempt')
    return { authorized: false, userId: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'super_admin') {
    logger.warn('Non-admin offboarding access attempt', { user_id: user.id })
    return { authorized: false, userId: user.id }
  }
  
  return { authorized: true, userId: user.id }
}

// =====================================================
// POST: Initiate Offboarding
// =====================================================

export async function POST(request: NextRequest) {
  const logger = createRequestLogger(request)
  
  try {
    // Verify super admin
    const { authorized, userId } = await verifySuperAdmin(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const {
      organizationId,
      reason,
      includeAuditLogs = true,
      includeBillingRecords = true,
    } = body
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      )
    }
    
    logger.info('Initiating offboarding', {
      organization_id: organizationId,
      requested_by: userId,
    })
    
    // Initiate offboarding
    const status = await orgOffboarding.initiateOffboarding({
      organizationId,
      requestedBy: userId!,
      reason,
      includeAuditLogs,
      includeBillingRecords,
    })
    
    logger.info('Offboarding initiated', {
      organization_id: organizationId,
      request_id: status.requestId,
    })
    
    return NextResponse.json({
      success: true,
      data: status,
    })
    
  } catch (error) {
    logger.error('Failed to initiate offboarding', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

// =====================================================
// GET: Get Offboarding Status
// =====================================================

export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request)
  
  try {
    // Verify super admin
    const { authorized } = await verifySuperAdmin(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const organizationId = searchParams.get('organizationId')
    
    if (!requestId && !organizationId) {
      return NextResponse.json(
        {
          error: 'Either requestId or organizationId is required',
          code: 'MISSING_PARAMETER',
        },
        { status: 400 }
      )
    }
    
    // Get status
    let status
    if (requestId) {
      status = await orgOffboarding.getStatus(requestId)
    } else {
      status = await orgOffboarding.getStatusByOrganization(organizationId!)
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'Offboarding request not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: status,
    })
    
  } catch (error) {
    logger.error('Failed to get offboarding status', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
