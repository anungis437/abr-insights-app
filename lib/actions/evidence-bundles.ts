'use server'

import { createClient } from '@/lib/supabase/server'
import {
  generateEvidencePDF,
  calculateChecksum,
  generateFileName,
  type CaseData,
} from '@/lib/services/pdf-generator-server'
import { logDataModification, logDataAccess } from '@/lib/services/audit-logger'
import { logger } from '@/lib/utils/production-logger'

interface CreateBundleResult {
  success: boolean
  url?: string
  fileName?: string
  expiresAt?: number
  bundleId?: string
  error?: string
}

/**
 * Server action to create an evidence bundle with immutable storage
 */
export async function createEvidenceBundle(
  caseId: string,
  includeAttachments: boolean = false
): Promise<CreateBundleResult> {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized - please log in',
      }
    }

    // 2. Fetch case data (with RLS applied)
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return {
        success: false,
        error: 'Case not found or access denied',
      }
    }

    // Get organization ID for audit logging
    const organizationId = caseData.organization_id || user.user_metadata?.organization_id || ''

    // 3. Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    const generatedBy = profile?.email || user.email || 'Unknown'

    // 4. Generate PDF server-side (deterministic)
    const timestamp = new Date().toISOString()
    const pdfBuffer = await generateEvidencePDF(
      {
        id: caseData.id,
        title: caseData.title || 'Untitled Case',
        description: caseData.description || 'No description provided',
        status: caseData.status || 'pending',
        created_at: caseData.created_at,
        updated_at: caseData.updated_at,
        metadata: caseData.metadata,
      },
      {
        timestamp,
        generatedBy,
        includeSignature: true,
        watermark: 'OFFICIAL',
      }
    )

    // 5. Calculate checksum for integrity
    const checksum = calculateChecksum(pdfBuffer)

    // 6. Generate unique file name
    const fileName = generateFileName(caseId, new Date())

    // 7. Upload to Supabase Storage (immutable)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('evidence-bundle-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '31536000', // 1 year (immutable)
        upsert: false, // Prevent overwrite
      })

    if (uploadError) {
      logger.error('Evidence bundle storage upload failed', uploadError, {
        caseId,
        fileName,
        userId: user.id,
      })
      return {
        success: false,
        error: `Failed to upload: ${uploadError.message}`,
      }
    }

    // 8. Create database record for tracking
    const { data: bundleData, error: bundleError } = await supabase
      .from('evidence_bundle_pdfs')
      .insert({
        case_id: caseId,
        storage_path: uploadData.path,
        file_name: fileName,
        file_size: pdfBuffer.length,
        checksum,
        created_by: user.id,
        metadata: {
          includeAttachments,
          generationTimestamp: timestamp,
          generatedBy,
        },
      })
      .select()
      .single()

    if (bundleError) {
      logger.error('Evidence bundle database insert failed', bundleError, {
        caseId,
        fileName,
        storagePath: uploadData.path,
        userId: user.id,
      })
      // Try to clean up uploaded file
      await supabase.storage.from('evidence-bundle-pdfs').remove([uploadData.path])
      return {
        success: false,
        error: `Failed to create record: ${bundleError.message}`,
      }
    }

    // 9. Log audit event for bundle creation
    await logDataModification(
      organizationId,
      'create',
      'evidence_bundle',
      bundleData.id,
      user.id,
      'restricted', // Evidence bundles contain sensitive legal data
      {
        caseId,
        fileName,
        storagePath: uploadData.path,
        checksum,
        fileSize: pdfBuffer.length,
        includeAttachments,
      }
    )

    // 10. Create signed URL (time-limited, trackable)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('evidence-bundle-pdfs')
      .createSignedUrl(uploadData.path, 3600) // 1 hour

    if (urlError) {
      return {
        success: false,
        error: `Failed to create download URL: ${urlError.message}`,
      }
    }

    return {
      success: true,
      url: urlData.signedUrl,
      fileName,
      expiresAt: Date.now() + 3600000, // 1 hour from now
      bundleId: bundleData.id,
    }
  } catch (error: any) {
    logger.error('Evidence bundle creation failed', error, {
      caseId,
      includeAttachments,
    })
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Track access to an evidence bundle
 */
export async function trackBundleAccess(bundleId: string): Promise<void> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Get bundle data for organization ID
    const { data: bundle } = await supabase
      .from('evidence_bundle_pdfs')
      .select('case_id, cases!inner(organization_id)')
      .eq('id', bundleId)
      .single()

    if (!bundle) return

    // Increment access count
    await supabase.rpc('increment_bundle_pdf_access', {
      bundle_id: bundleId,
    })

    // Log audit event for data access
    const orgId = (bundle.cases as any)?.organization_id || ''
    await logDataAccess(
      orgId,
      'evidence_bundle',
      bundleId,
      user.id,
      'restricted', // Evidence bundles contain sensitive legal data
      {
        caseId: bundle.case_id,
        timestamp: new Date().toISOString(),
      }
    )
  } catch (error) {
    logger.warn('Failed to track bundle access', { bundleId, error })
    // Don't throw - tracking is non-critical
  }
}

/**
 * Get evidence bundles for a case
 */
export async function getEvidenceBundles(caseId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evidence_bundle_pdfs')
      .select('*, profiles!created_by(full_name, email)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch evidence bundles', error, { caseId })
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error fetching evidence bundles', error as Error, { caseId })
    return []
  }
}
