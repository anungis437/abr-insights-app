/**
 * PR-06: Data Export Download Endpoint
 * 
 * Download data export ZIP file for offboarding request.
 * Super admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/observability/production-logger'
import { createClient } from '@/lib/supabase/server'
import * as fs from 'fs/promises'
import { createReadStream } from 'fs'

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
    logger.warn('Unauthorized download access attempt')
    return { authorized: false, userId: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'super_admin') {
    logger.warn('Non-admin download access attempt', { user_id: user.id })
    return { authorized: false, userId: user.id }
  }
  
  return { authorized: true, userId: user.id }
}

// =====================================================
// GET: Download Export
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const logger = createRequestLogger(request)
  const requestId = params.requestId
  
  try {
    // Verify super admin
    const { authorized, userId } = await verifySuperAdmin(request)
    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    
    const supabase = createClient()
    
    // Get offboarding request
    const { data: offboardingRequest, error } = await supabase
      .from('org_offboarding_requests')
      .select('id, organization_id, export_file_path, export_file_size_bytes, status')
      .eq('id', requestId)
      .single()
    
    if (error || !offboardingRequest) {
      return NextResponse.json(
        { error: 'Offboarding request not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    if (!offboardingRequest.export_file_path) {
      return NextResponse.json(
        { error: 'Export not ready yet', code: 'EXPORT_NOT_READY' },
        { status: 400 }
      )
    }
    
    // Check if file exists
    try {
      await fs.access(offboardingRequest.export_file_path)
    } catch (error) {
      logger.error('Export file not found', {
        request_id: requestId,
        file_path: offboardingRequest.export_file_path,
      })
      
      return NextResponse.json(
        { error: 'Export file not found', code: 'FILE_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Record download
    await supabase
      .from('org_offboarding_requests')
      .update({ export_downloaded_at: new Date().toISOString() })
      .eq('id', requestId)
    
    await supabase.rpc('log_offboarding_action', {
      request_id: requestId,
      action_name: 'export_downloaded',
      action_details: { downloaded_by: userId },
      action_success: true,
      action_error: null,
    })
    
    logger.info('Export downloaded', {
      request_id: requestId,
      organization_id: offboardingRequest.organization_id,
      downloaded_by: userId,
    })
    
    // Stream file
    const fileBuffer = await fs.readFile(offboardingRequest.export_file_path)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="org_${offboardingRequest.organization_id}_export.zip"`,
        'Content-Length': String(offboardingRequest.export_file_size_bytes),
      },
    })
    
  } catch (error) {
    logger.error('Failed to download export', {
      request_id: requestId,
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
