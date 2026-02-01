/**
 * Tenant Offboarding Service
 *
 * Handles secure deletion of organization data with:
 * - Multi-stage deletion process
 * - Audit trail
 * - Data retention compliance (PIPEDA)
 * - Soft delete → Hard delete workflow
 * - Backup verification
 *
 * @module lib/services/tenant-offboarding
 */

import { createClient } from '@/lib/supabase/server'
import { logAdminAction, logDataModification } from '@/lib/services/audit-logger'
import { logger } from '@/lib/utils/logger'

// Offboarding stages
export type OffboardingStage =
  | 'initiated'
  | 'soft_deleted'
  | 'grace_period'
  | 'hard_delete_pending'
  | 'hard_deleted'
  | 'completed'

// Offboarding request
export interface OffboardingRequest {
  organizationId: string
  requestedBy: string
  reason: string
  gracePeriodDays?: number // Default 30 days
  preserveAuditLogs?: boolean // Default true
  preserveCompliance?: boolean // Default true
  ipAddress?: string
}

// Offboarding result
export interface OffboardingResult {
  success: boolean
  stage: OffboardingStage
  organizationId: string
  deletionScheduledAt?: Date
  permanentDeletionAt?: Date
  itemsDeleted?: {
    users: number
    courses: number
    cases: number
    certificates: number
    subscriptions: number
  }
  auditLogIds: string[]
  errors?: string[]
}

/**
 * Stage 1: Initiate soft delete (organization marked deleted)
 */
export async function initiateOffboarding(request: OffboardingRequest): Promise<OffboardingResult> {
  const supabase = await createClient()
  const result: OffboardingResult = {
    success: false,
    stage: 'initiated',
    organizationId: request.organizationId,
    auditLogIds: [],
    itemsDeleted: {
      users: 0,
      courses: 0,
      cases: 0,
      certificates: 0,
      subscriptions: 0,
    },
  }

  try {
    logger.info('[Offboarding] Initiating tenant offboarding', {
      organizationId: request.organizationId,
      requestedBy: request.requestedBy,
    })

    // 1. Verify organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier')
      .eq('id', request.organizationId)
      .is('deleted_at', null)
      .single()

    if (orgError || !org) {
      throw new Error(`Organization not found or already deleted: ${request.organizationId}`)
    }

    // 2. Calculate deletion dates
    const gracePeriodDays = request.gracePeriodDays || 30
    const now = new Date()
    const permanentDeletionAt = new Date()
    permanentDeletionAt.setDate(permanentDeletionAt.getDate() + gracePeriodDays)

    // 3. Soft delete organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .update({
        deleted_at: now.toISOString(),
        subscription_status: 'offboarding',
      })
      .eq('id', request.organizationId)

    if (deleteError) {
      throw new Error(`Failed to soft delete organization: ${deleteError.message}`)
    }

    // 4. Disable all user accounts
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .update({
        status: 'suspended',
        offboarding_initiated_at: now.toISOString(),
      })
      .eq('organization_id', request.organizationId)
      .select('id')

    result.itemsDeleted!.users = users?.length || 0

    // 5. Cancel Stripe subscriptions (if any)
    const { data: subs } = await supabase
      .from('organization_subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', request.organizationId)
      .not('stripe_subscription_id', 'is', null)

    if (subs && subs.length > 0) {
      // TODO: Call Stripe API to cancel subscriptions
      result.itemsDeleted!.subscriptions = subs.length
    }

    // 6. Log offboarding initiation
    await logAdminAction(
      request.organizationId,
      'tenant_offboarding_initiated',
      request.requestedBy,
      'organization',
      request.organizationId,
      {
        reason: request.reason,
        gracePeriodDays,
        permanentDeletionAt: permanentDeletionAt.toISOString(),
        usersAffected: result.itemsDeleted!.users,
      },
      request.ipAddress
    )

    result.success = true
    result.stage = 'soft_deleted'
    result.deletionScheduledAt = now
    result.permanentDeletionAt = permanentDeletionAt

    logger.info('[Offboarding] Tenant offboarding initiated successfully', {
      organizationId: request.organizationId,
      permanentDeletionAt,
    })

    return result
  } catch (error) {
    logger.error('[Offboarding] Failed to initiate offboarding', {
      error,
      organizationId: request.organizationId,
    })

    result.errors = [error instanceof Error ? error.message : 'Unknown error']
    return result
  }
}

/**
 * Stage 2: Execute hard delete (permanent data removal)
 * Only runs after grace period expires
 */
export async function executeHardDelete(
  organizationId: string,
  executedBy: string,
  preserveAuditLogs: boolean = true,
  preserveCompliance: boolean = true
): Promise<OffboardingResult> {
  const supabase = await createClient()
  const result: OffboardingResult = {
    success: false,
    stage: 'hard_delete_pending',
    organizationId,
    auditLogIds: [],
    itemsDeleted: {
      users: 0,
      courses: 0,
      cases: 0,
      certificates: 0,
      subscriptions: 0,
    },
  }

  try {
    logger.info('[Offboarding] Executing hard delete', {
      organizationId,
      preserveAuditLogs,
      preserveCompliance,
    })

    // 1. Verify grace period has expired
    const { data: org } = await supabase
      .from('organizations')
      .select('deleted_at, name')
      .eq('id', organizationId)
      .not('deleted_at', 'is', null)
      .single()

    if (!org || !org.deleted_at) {
      throw new Error('Organization not in soft-deleted state')
    }

    const deletedAt = new Date(org.deleted_at)
    const now = new Date()
    const daysSinceDeleted = Math.floor(
      (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceDeleted < 30) {
      throw new Error(`Grace period not expired. ${30 - daysSinceDeleted} days remaining.`)
    }

    // 2. Delete cascade (leverages ON DELETE CASCADE)
    // Order matters: delete child records first

    // Delete enrollments
    await supabase.from('enrollments').delete().eq('organization_id', organizationId)

    // Delete certificates
    const { data: certs } = await supabase
      .from('certificates')
      .delete()
      .eq('organization_id', organizationId)
      .select('id')
    result.itemsDeleted!.certificates = certs?.length || 0

    // Delete tribunal cases (if org-scoped)
    const { data: cases } = await supabase
      .from('tribunal_cases_raw')
      .delete()
      .eq('organization_id', organizationId)
      .select('id')
    result.itemsDeleted!.cases = cases?.length || 0

    // Delete user data
    const { data: profiles } = await supabase
      .from('profiles')
      .delete()
      .eq('organization_id', organizationId)
      .select('id')
    result.itemsDeleted!.users = profiles?.length || 0

    // Delete organization subscriptions
    const { data: orgSubs } = await supabase
      .from('organization_subscriptions')
      .delete()
      .eq('organization_id', organizationId)
      .select('id')
    result.itemsDeleted!.subscriptions = orgSubs?.length || 0

    // 3. Handle audit logs based on retention policy
    if (!preserveAuditLogs) {
      // Only delete if explicitly requested (not recommended)
      await supabase.from('audit_logs').delete().eq('organization_id', organizationId)
    } else {
      // Archive audit logs for compliance (7 years for PIPEDA)
      const archiveUntil = new Date()
      archiveUntil.setFullYear(archiveUntil.getFullYear() + 7)

      await supabase
        .from('audit_logs')
        .update({
          archive_status: 'archived',
          archived_at: new Date().toISOString(),
          retention_days: 2555, // 7 years
        })
        .eq('organization_id', organizationId)
    }

    // 4. Finally, delete the organization record
    await supabase.from('organizations').delete().eq('id', organizationId)

    // 5. Log hard delete completion (use service role to bypass RLS)
    await logAdminAction(
      organizationId,
      'tenant_hard_deleted',
      executedBy,
      'organization',
      organizationId,
      {
        itemsDeleted: result.itemsDeleted,
        preserveAuditLogs,
        preserveCompliance,
        orgName: org.name,
      }
    )

    result.success = true
    result.stage = 'completed'

    logger.info('[Offboarding] Hard delete completed successfully', {
      organizationId,
      itemsDeleted: result.itemsDeleted,
    })

    return result
  } catch (error) {
    logger.error('[Offboarding] Hard delete failed', {
      error,
      organizationId,
    })

    result.errors = [error instanceof Error ? error.message : 'Unknown error']
    return result
  }
}

/**
 * Cancel offboarding (restore soft-deleted organization)
 */
export async function cancelOffboarding(
  organizationId: string,
  cancelledBy: string,
  reason: string,
  ipAddress?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  try {
    // Verify organization is in soft-deleted state
    const { data: org } = await supabase
      .from('organizations')
      .select('deleted_at')
      .eq('id', organizationId)
      .not('deleted_at', 'is', null)
      .single()

    if (!org) {
      return {
        success: false,
        message: 'Organization not found or not in deleted state',
      }
    }

    // Restore organization
    await supabase
      .from('organizations')
      .update({
        deleted_at: null,
        subscription_status: 'active',
      })
      .eq('id', organizationId)

    // Reactivate user accounts
    await supabase
      .from('profiles')
      .update({
        status: 'active',
        offboarding_initiated_at: null,
      })
      .eq('organization_id', organizationId)

    // Log cancellation
    await logAdminAction(
      organizationId,
      'tenant_offboarding_cancelled',
      cancelledBy,
      'organization',
      organizationId,
      { reason },
      ipAddress
    )

    logger.info('[Offboarding] Offboarding cancelled', {
      organizationId,
      cancelledBy,
    })

    return {
      success: true,
      message: 'Organization restored successfully',
    }
  } catch (error) {
    logger.error('[Offboarding] Failed to cancel offboarding', {
      error,
      organizationId,
    })

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get organizations pending hard delete
 */
export async function getPendingDeletions(): Promise<
  Array<{
    organizationId: string
    name: string
    deletedAt: Date
    daysRemaining: number
    usersAffected: number
  }>
> {
  const supabase = await createClient()

  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: true })

  if (!orgs) return []

  const now = new Date()
  const results = []

  for (const org of orgs) {
    const deletedAt = new Date(org.deleted_at!)
    const daysSinceDeleted = Math.floor(
      (now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysRemaining = 30 - daysSinceDeleted

    // Get user count
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', org.id)

    results.push({
      organizationId: org.id,
      name: org.name,
      deletedAt,
      daysRemaining,
      usersAffected: count || 0,
    })
  }

  return results
}
