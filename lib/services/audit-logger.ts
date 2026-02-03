/**
 * Audit Logging Service
 *
 * Enterprise-grade audit logging with:
 * - Automatic event classification
 * - Compliance level assignment
 * - Blockchain-style hash chain
 * - Multi-tenant isolation
 * - PIPEDA/SOC2/ISO27001 compliance
 *
 * @module lib/services/audit-logger
 */

import { createClient } from '@/lib/supabase/server'
import { logger as productionLogger } from '@/lib/utils/production-logger'
import { logger } from '@/lib/utils/logger'

// Event categories
type EventCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'configuration_change'
  | 'admin_action'
  | 'user_management'
  | 'security_event'
  | 'compliance_event'
  | 'system_event'

// Compliance levels
type ComplianceLevel = 'low' | 'standard' | 'high' | 'critical'

// Data classification
type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted'

// Severity levels
type Severity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

// Audit log entry
interface AuditLogEntry {
  organizationId: string
  userId?: string
  action: string
  resourceType?: string
  resourceId?: string
  eventCategory: EventCategory
  complianceLevel: ComplianceLevel
  dataClassification: DataClassification
  severity: Severity
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  retentionDays?: number
}

/**
 * Log a generic audit event
 *
 * All audit events flow through this function
 * Automatically generates hash chain for tamper detection
 */
export async function logEvent(entry: AuditLogEntry): Promise<void> {
  const supabase = await createClient()

  try {
    // Get user email if userId provided
    let userEmail: string | undefined
    if (entry.userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', entry.userId)
        .single()

      userEmail = profile?.email
    }

    // Insert audit log (hash generation handled by DB trigger)
    const { error } = await supabase.from('audit_logs').insert({
      organization_id: entry.organizationId,
      user_id: entry.userId,
      user_email: userEmail,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      event_category: entry.eventCategory,
      compliance_level: entry.complianceLevel,
      data_classification: entry.dataClassification,
      severity: entry.severity,
      details: entry.details,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      retention_days: entry.retentionDays || 2555, // 7 years default for PIPEDA
    })

    if (error) {
      productionLogger.error('Audit log write failed', {
        error,
        event: entry.eventType,
        org_id: entry.organizationId,
      })
      // Don't throw - audit logging should not break application flow
    }
  } catch (error) {
    productionLogger.error('Audit logging exception', { error, event: entry.eventType })
    // Don't throw - audit logging should not break application flow
  }
}

/**
 * Log authentication events
 *
 * Tracks login, logout, SSO, password changes, etc.
 */
export async function logAuthEvent(
  organizationId: string,
  action: string,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Authentication events are always high compliance
  const complianceLevel: ComplianceLevel =
    action.includes('failed') || action.includes('unauthorized') ? 'critical' : 'high'

  const severity: Severity =
    action.includes('failed') || action.includes('unauthorized') ? 'warning' : 'info'

  await logEvent({
    organizationId,
    userId,
    action,
    eventCategory: 'authentication',
    complianceLevel,
    dataClassification: 'confidential',
    severity,
    details,
    ipAddress,
    userAgent,
    retentionDays: 2555, // 7 years for authentication events
  })
}

/**
 * Log authorization events
 *
 * Tracks permission checks, role changes, access denials
 */
export async function logAuthorizationEvent(
  organizationId: string,
  action: string,
  userId?: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  // Authorization events are high compliance
  const complianceLevel: ComplianceLevel = action.includes('denied') ? 'critical' : 'high'
  const severity: Severity = action.includes('denied') ? 'warning' : 'info'

  await logEvent({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    eventCategory: 'authorization',
    complianceLevel,
    dataClassification: 'confidential',
    severity,
    details,
    ipAddress,
    retentionDays: 2555, // 7 years for authorization events
  })
}

/**
 * Log data access events
 *
 * Tracks reading of sensitive data
 */
export async function logDataAccess(
  organizationId: string,
  resourceType: string,
  resourceId: string,
  userId?: string,
  dataClassification: DataClassification = 'internal',
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  // Data access compliance level depends on classification
  const complianceLevel: ComplianceLevel =
    dataClassification === 'restricted'
      ? 'critical'
      : dataClassification === 'confidential'
        ? 'high'
        : 'standard'

  await logEvent({
    organizationId,
    userId,
    action: 'data_access',
    resourceType,
    resourceId,
    eventCategory: 'data_access',
    complianceLevel,
    dataClassification,
    severity: 'info',
    details,
    ipAddress,
    retentionDays: dataClassification === 'restricted' ? 3650 : 2555, // 10 years for restricted
  })
}

/**
 * Log data modification events
 *
 * Tracks create, update, delete operations
 */
export async function logDataModification(
  organizationId: string,
  action: 'create' | 'update' | 'delete',
  resourceType: string,
  resourceId: string,
  userId?: string,
  dataClassification: DataClassification = 'internal',
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  // Data modifications are higher compliance
  const complianceLevel: ComplianceLevel =
    dataClassification === 'restricted'
      ? 'critical'
      : dataClassification === 'confidential'
        ? 'high'
        : 'standard'

  const severity: Severity = action === 'delete' ? 'warning' : 'info'

  await logEvent({
    organizationId,
    userId,
    action: `data_${action}`,
    resourceType,
    resourceId,
    eventCategory: 'data_modification',
    complianceLevel,
    dataClassification,
    severity,
    details,
    ipAddress,
    retentionDays: dataClassification === 'restricted' ? 3650 : 2555,
  })
}

/**
 * Log configuration changes
 *
 * Tracks system configuration, settings, feature flags
 */
export async function logConfigurationChange(
  organizationId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    eventCategory: 'configuration_change',
    complianceLevel: 'high',
    dataClassification: 'confidential',
    severity: 'info',
    details,
    ipAddress,
    retentionDays: 2555,
  })
}

/**
 * Log admin actions
 *
 * Tracks privileged operations by administrators
 */
export async function logAdminAction(
  organizationId: string,
  action: string,
  userId: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    eventCategory: 'admin_action',
    complianceLevel: 'critical',
    dataClassification: 'restricted',
    severity: 'info',
    details,
    ipAddress,
    retentionDays: 3650, // 10 years for admin actions
  })
}

/**
 * Log user management events
 *
 * Tracks user creation, updates, role changes, deletions
 */
export async function logUserManagement(
  organizationId: string,
  action: string,
  targetUserId: string,
  performedBy?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    organizationId,
    userId: performedBy,
    action,
    resourceType: 'User',
    resourceId: targetUserId,
    eventCategory: 'user_management',
    complianceLevel: 'high',
    dataClassification: 'confidential',
    severity: 'info',
    details,
    ipAddress,
    retentionDays: 2555,
  })
}

/**
 * Log security events
 *
 * Tracks security incidents, threats, suspicious activities
 */
export async function logSecurityEvent(
  organizationId: string,
  action: string,
  severity: Severity,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    organizationId,
    userId,
    action,
    eventCategory: 'security_event',
    complianceLevel: 'critical',
    dataClassification: 'restricted',
    severity,
    details,
    ipAddress,
    retentionDays: 3650, // 10 years for security events
  })
}

/**
 * Log compliance events
 *
 * Tracks compliance-related actions like audits, reports, exports
 */
export async function logComplianceEvent(
  organizationId: string,
  action: string,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logEvent({
    organizationId,
    userId,
    action,
    eventCategory: 'compliance_event',
    complianceLevel: 'critical',
    dataClassification: 'restricted',
    severity: 'info',
    details,
    ipAddress,
    retentionDays: 3650, // 10 years for compliance events
  })
}

/**
 * Log system events
 *
 * Tracks system-level events like startup, shutdown, errors
 */
export async function logSystemEvent(
  organizationId: string,
  action: string,
  severity: Severity,
  details?: Record<string, unknown>
): Promise<void> {
  await logEvent({
    organizationId,
    action,
    eventCategory: 'system_event',
    complianceLevel: 'standard',
    dataClassification: 'internal',
    severity,
    details,
    retentionDays: 365, // 1 year for system events
  })
}
