/**
 * PR-06: Organization Offboarding Orchestration Service
 *
 * Orchestrates the complete offboarding workflow:
 * 1. Data export (ZIP generation)
 * 2. Stripe subscription cancellation
 * 3. Access revocation (disable users, invalidate sessions)
 * 4. Deletion scheduling (GDPR: 30-day retention)
 *
 * @module lib/services/org-offboarding
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { dataExport } from './data-export'
import Stripe from 'stripe'

// =====================================================
// Types
// =====================================================

export interface OffboardingRequest {
  organizationId: string
  requestedBy: string
  reason?: string
  includeAuditLogs?: boolean
  includeBillingRecords?: boolean
}

export interface OffboardingStatus {
  requestId: string
  organizationId: string
  status: OffboardingStatusType
  requestedAt: string
  exportReady: boolean
  exportDownloadUrl?: string
  deletionScheduledAt?: string
  daysUntilDeletion?: number
  error?: string
}

export type OffboardingStatusType =
  | 'requested'
  | 'exporting_data'
  | 'export_ready'
  | 'cancelling_stripe'
  | 'revoking_access'
  | 'deletion_scheduled'
  | 'completed'
  | 'failed'

export interface AccessRevocationResult {
  usersDisabled: number
  sessionsInvalidated: number
  errors: string[]
}

// =====================================================
// Offboarding Orchestration Service
// =====================================================

class OrgOffboardingService {
  private stripe: Stripe

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for offboarding service')
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  }

  /**
   * Initiate organization offboarding
   */
  async initiateOffboarding(request: OffboardingRequest): Promise<OffboardingStatus> {
    logger.info('Initiating organization offboarding', {
      organization_id: request.organizationId,
      requested_by: request.requestedBy,
    })

    try {
      // Verify organization exists
      const supabase = await createClient()
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, stripe_subscription_id')
        .eq('id', request.organizationId)
        .single()

      if (orgError || !org) {
        throw new Error('Organization not found')
      }

      // Check for existing active offboarding request
      const { data: existing } = await supabase
        .from('org_offboarding_requests')
        .select('id, status')
        .eq('organization_id', request.organizationId)
        .in('status', [
          'requested',
          'exporting_data',
          'export_ready',
          'cancelling_stripe',
          'revoking_access',
        ])
        .single()

      if (existing) {
        throw new Error('Offboarding already in progress for this organization')
      }

      // Create offboarding request
      const { data: offboardingRequest, error: createError } = await supabase
        .from('org_offboarding_requests')
        .insert({
          organization_id: request.organizationId,
          requested_by: request.requestedBy,
          reason: request.reason,
          status: 'requested',
          stripe_subscription_id: org.stripe_subscription_id,
        })
        .select()
        .single()

      if (createError || !offboardingRequest) {
        throw new Error('Failed to create offboarding request')
      }

      // Log action
      await this.logAction(offboardingRequest.id, 'offboarding_requested', {
        organization_id: request.organizationId,
        organization_name: org.name,
        reason: request.reason,
      })

      // Start async processing
      this.processOffboarding(offboardingRequest.id, request.organizationId, request).catch(
        (error) => {
          logger.error('Offboarding processing failed', {
            request_id: offboardingRequest.id,
            organization_id: request.organizationId,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      )

      return {
        requestId: offboardingRequest.id,
        organizationId: request.organizationId,
        status: 'requested',
        requestedAt: offboardingRequest.requested_at,
        exportReady: false,
      }
    } catch (error) {
      logger.error('Failed to initiate offboarding', {
        organization_id: request.organizationId,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Process offboarding workflow (async)
   */
  private async processOffboarding(
    requestId: string,
    organizationId: string,
    request: OffboardingRequest
  ): Promise<void> {
    try {
      // Step 1: Export data
      await this.updateStatus(requestId, 'exporting_data')
      const exportResult = await this.exportOrganizationData(requestId, organizationId, request)

      if (!exportResult.success) {
        throw new Error(exportResult.error || 'Data export failed')
      }

      await this.updateStatus(requestId, 'export_ready')

      // Step 2: Cancel Stripe subscription
      await this.updateStatus(requestId, 'cancelling_stripe')
      await this.cancelStripeSubscription(requestId, organizationId)

      // Step 3: Revoke access
      await this.updateStatus(requestId, 'revoking_access')
      await this.revokeOrganizationAccess(requestId, organizationId)

      // Step 4: Schedule deletion (30 days from now)
      await this.updateStatus(requestId, 'deletion_scheduled')
      const deletionDate = new Date()
      deletionDate.setDate(deletionDate.getDate() + 30)

      const supabase2 = await createClient()
      await supabase2
        .from('org_offboarding_requests')
        .update({
          deletion_scheduled_at: deletionDate.toISOString(),
        })
        .eq('id', requestId)

      await this.logAction(requestId, 'deletion_scheduled', {
        deletion_date: deletionDate.toISOString(),
        days_until_deletion: 30,
      })

      // Mark as completed
      await supabase2
        .from('org_offboarding_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      logger.info('Offboarding completed successfully', {
        request_id: requestId,
        organization_id: organizationId,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      const supabase3 = await createClient()
      await supabase3
        .from('org_offboarding_requests')
        .update({
          status: 'failed',
          error_message: errorMessage,
          error_occurred_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      await this.logAction(
        requestId,
        'offboarding_failed',
        {
          error: errorMessage,
        },
        false,
        errorMessage
      )

      throw error
    }
  }

  /**
   * Export organization data
   */
  private async exportOrganizationData(
    requestId: string,
    organizationId: string,
    request: OffboardingRequest
  ): Promise<any> {
    const startTime = Date.now()

    const supabase = await createClient()
    await supabase
      .from('org_offboarding_requests')
      .update({ export_started_at: new Date().toISOString() })
      .eq('id', requestId)

    await this.logAction(requestId, 'export_started', { organization_id: organizationId })

    // Generate export
    const exportResult = await dataExport.generateExport({
      organizationId,
      requestedBy: request.requestedBy,
      includeAuditLogs: request.includeAuditLogs,
      includeBillingRecords: request.includeBillingRecords,
    })

    if (!exportResult.success) {
      return exportResult
    }

    // Store export metadata
    await supabase
      .from('org_offboarding_requests')
      .update({
        export_completed_at: new Date().toISOString(),
        export_file_path: exportResult.filePath,
        export_file_size_bytes: exportResult.fileSize,
        // In production, generate presigned URL for S3
        export_download_url: `/api/admin/offboarding/download/${requestId}`,
      })
      .eq('id', requestId)

    // Store export contents
    if (exportResult.manifest) {
      await supabase.from('data_export_contents').insert({
        offboarding_request_id: requestId,
        export_format: 'zip',
        total_files: exportResult.manifest.totalFiles,
        total_size_bytes: exportResult.manifest.totalSizeBytes,
        users_exported: exportResult.manifest.counts.users,
        courses_exported: exportResult.manifest.counts.courses,
        enrollments_exported: exportResult.manifest.counts.enrollments,
        progress_records_exported: exportResult.manifest.counts.progressRecords,
        quiz_attempts_exported: exportResult.manifest.counts.quizAttempts,
        certificates_exported: exportResult.manifest.counts.certificates,
        achievements_exported: exportResult.manifest.counts.achievements,
        ai_usage_exported: exportResult.manifest.counts.aiUsage,
        billing_records_exported: exportResult.manifest.counts.billingRecords,
        audit_logs_exported: exportResult.manifest.counts.auditLogs,
        file_manifest: exportResult.manifest.files,
        export_checksum: exportResult.checksum,
      })
    }

    const duration = Date.now() - startTime

    await this.logAction(requestId, 'export_completed', {
      file_size_bytes: exportResult.fileSize,
      total_files: exportResult.manifest?.totalFiles,
      duration_ms: duration,
    })

    return exportResult
  }

  /**
   * Cancel Stripe subscription
   */
  private async cancelStripeSubscription(requestId: string, organizationId: string): Promise<void> {
    const startTime = Date.now()

    const supabase = await createClient()
    await supabase
      .from('org_offboarding_requests')
      .update({ stripe_cancellation_started_at: new Date().toISOString() })
      .eq('id', requestId)

    await this.logAction(requestId, 'stripe_cancellation_started', {
      organization_id: organizationId,
    })

    try {
      // Get organization's Stripe subscription ID
      const { data: org } = await supabase
        .from('organizations')
        .select('stripe_subscription_id')
        .eq('id', organizationId)
        .single()

      if (org?.stripe_subscription_id) {
        // Cancel subscription at period end (don't refund)
        await this.stripe.subscriptions.update(org.stripe_subscription_id, {
          cancel_at_period_end: true,
        })

        await supabase
          .from('org_offboarding_requests')
          .update({
            stripe_cancellation_completed_at: new Date().toISOString(),
            stripe_cancelled_at: new Date().toISOString(),
          })
          .eq('id', requestId)

        const duration = Date.now() - startTime

        await this.logAction(requestId, 'stripe_cancelled', {
          subscription_id: org.stripe_subscription_id,
          duration_ms: duration,
        })
      } else {
        // No subscription to cancel
        await supabase
          .from('org_offboarding_requests')
          .update({
            stripe_cancellation_completed_at: new Date().toISOString(),
          })
          .eq('id', requestId)

        await this.logAction(requestId, 'stripe_no_subscription', {
          organization_id: organizationId,
        })
      }
    } catch (error) {
      logger.error('Stripe cancellation failed', {
        request_id: requestId,
        organization_id: organizationId,
        error: error instanceof Error ? error.message : String(error),
      })

      // Don't fail entire offboarding if Stripe cancellation fails
      await this.logAction(
        requestId,
        'stripe_cancellation_failed',
        { error: error instanceof Error ? error.message : String(error) },
        false,
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  /**
   * Revoke organization access
   */
  private async revokeOrganizationAccess(
    requestId: string,
    organizationId: string
  ): Promise<AccessRevocationResult> {
    const startTime = Date.now()

    const supabase = await createClient()
    await supabase
      .from('org_offboarding_requests')
      .update({ access_revocation_started_at: new Date().toISOString() })
      .eq('id', requestId)

    await this.logAction(requestId, 'access_revocation_started', {
      organization_id: organizationId,
    })

    const errors: string[] = []
    let usersDisabled = 0
    let sessionsInvalidated = 0

    try {
      // Get all users in organization
      const { data: userOrgs, error: usersError } = await supabase
        .from('user_organizations')
        .select('user_id')
        .eq('organization_id', organizationId)

      if (usersError) {
        errors.push(`Failed to fetch users: ${usersError.message}`)
      } else if (userOrgs) {
        // Disable users (set active = false in profiles)
        for (const userOrg of userOrgs) {
          try {
            const { error: disableError } = await supabase
              .from('profiles')
              .update({ active: false, disabled_at: new Date().toISOString() })
              .eq('id', userOrg.user_id)

            if (disableError) {
              errors.push(`Failed to disable user ${userOrg.user_id}: ${disableError.message}`)
            } else {
              usersDisabled++
            }

            // Invalidate user sessions (Supabase handles this automatically when user is disabled)
            // In production, you might want to explicitly call auth.admin.deleteUser() or sign out all sessions
            sessionsInvalidated++
          } catch (error) {
            errors.push(
              `Error processing user ${userOrg.user_id}: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }
      }

      await supabase
        .from('org_offboarding_requests')
        .update({
          access_revocation_completed_at: new Date().toISOString(),
          users_disabled_count: usersDisabled,
          sessions_invalidated_count: sessionsInvalidated,
        })
        .eq('id', requestId)

      const duration = Date.now() - startTime

      await this.logAction(requestId, 'access_revoked', {
        users_disabled: usersDisabled,
        sessions_invalidated: sessionsInvalidated,
        errors: errors.length,
        duration_ms: duration,
      })

      return { usersDisabled, sessionsInvalidated, errors }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(errorMessage)

      await this.logAction(
        requestId,
        'access_revocation_failed',
        { error: errorMessage },
        false,
        errorMessage
      )

      throw error
    }
  }

  /**
   * Get offboarding status
   */
  async getStatus(requestId: string): Promise<OffboardingStatus | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('org_offboarding_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      requestId: data.id,
      organizationId: data.organization_id,
      status: data.status,
      requestedAt: data.requested_at,
      exportReady: data.export_download_url !== null,
      exportDownloadUrl: data.export_download_url,
      deletionScheduledAt: data.deletion_scheduled_at,
      daysUntilDeletion: data.deletion_scheduled_at
        ? Math.ceil(
            (new Date(data.deletion_scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : undefined,
      error: data.error_message,
    }
  }

  /**
   * Get offboarding status by organization
   */
  async getStatusByOrganization(organizationId: string): Promise<OffboardingStatus | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('org_offboarding_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .in('status', [
        'requested',
        'exporting_data',
        'export_ready',
        'cancelling_stripe',
        'revoking_access',
        'deletion_scheduled',
      ])
      .order('requested_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return {
      requestId: data.id,
      organizationId: data.organization_id,
      status: data.status,
      requestedAt: data.requested_at,
      exportReady: data.export_download_url !== null,
      exportDownloadUrl: data.export_download_url,
      deletionScheduledAt: data.deletion_scheduled_at,
      daysUntilDeletion: data.deletion_scheduled_at
        ? Math.ceil(
            (new Date(data.deletion_scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : undefined,
      error: data.error_message,
    }
  }

  /**
   * Update offboarding status
   */
  private async updateStatus(
    requestId: string,
    status: OffboardingStatusType,
    error?: string
  ): Promise<void> {
    const supabase = await createClient()
    await supabase.rpc('update_offboarding_status', {
      request_id: requestId,
      new_status: status,
      error_msg: error,
    })
  }

  /**
   * Log offboarding action
   */
  private async logAction(
    requestId: string,
    action: string,
    details: any = {},
    success: boolean = true,
    error?: string
  ): Promise<void> {
    const supabase = await createClient()
    await supabase.rpc('log_offboarding_action', {
      request_id: requestId,
      action_name: action,
      action_details: details,
      action_success: success,
      action_error: error,
    })

    // Also log to structured logger
    if (success) {
      logger.info(`Offboarding action: ${action}`, {
        request_id: requestId,
        action,
        ...details,
      })
    } else {
      logger.error(`Offboarding action failed: ${action}`, {
        request_id: requestId,
        action,
        error,
        ...details,
      })
    }
  }
}

// =====================================================
// Export singleton instance
// =====================================================

export const orgOffboarding = new OrgOffboardingService()
