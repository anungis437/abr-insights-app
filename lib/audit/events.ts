/**
 * Canonical Audit Event Types
 *
 * Defines standardized audit event types for consistent logging across the application.
 * These types ensure compliance with PIPEDA, SOC2, and ISO27001 requirements.
 */

/**
 * Authentication Events
 */
export enum AuthAuditEvent {
  // Login/Logout
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',

  // SSO/OAuth
  AUTH_SSO_LOGIN = 'AUTH_SSO_LOGIN',
  AUTH_OAUTH_CALLBACK = 'AUTH_OAUTH_CALLBACK',

  // Password Management
  AUTH_PASSWORD_CHANGE = 'AUTH_PASSWORD_CHANGE',
  AUTH_PASSWORD_RESET_REQUEST = 'AUTH_PASSWORD_RESET_REQUEST',
  AUTH_PASSWORD_RESET_COMPLETE = 'AUTH_PASSWORD_RESET_COMPLETE',

  // Token Management
  AUTH_TOKEN_GENERATED = 'AUTH_TOKEN_GENERATED',
  AUTH_TOKEN_REVOKED = 'AUTH_TOKEN_REVOKED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
}

/**
 * Authorization Events (RBAC)
 */
export enum RBACAutitEvent {
  // Permission Checks
  RBAC_PERMISSION_GRANTED = 'RBAC_PERMISSION_GRANTED',
  RBAC_PERMISSION_DENIED = 'RBAC_PERMISSION_DENIED',

  // Role Management
  RBAC_ROLE_ASSIGNED = 'RBAC_ROLE_ASSIGNED',
  RBAC_ROLE_REMOVED = 'RBAC_ROLE_REMOVED',
  RBAC_ROLE_CREATED = 'RBAC_ROLE_CREATED',
  RBAC_ROLE_MODIFIED = 'RBAC_ROLE_MODIFIED',
  RBAC_ROLE_DELETED = 'RBAC_ROLE_DELETED',

  // Permission Management
  RBAC_PERMISSION_CREATED = 'RBAC_PERMISSION_CREATED',
  RBAC_PERMISSION_MODIFIED = 'RBAC_PERMISSION_MODIFIED',
  RBAC_PERMISSION_DELETED = 'RBAC_PERMISSION_DELETED',
}

/**
 * Data Access Events
 */
export enum DataAuditEvent {
  // Data Export (high risk)
  DATA_EXPORT_CSV = 'DATA_EXPORT_CSV',
  DATA_EXPORT_JSON = 'DATA_EXPORT_JSON',
  DATA_EXPORT_PDF = 'DATA_EXPORT_PDF',
  DATA_BULK_DOWNLOAD = 'DATA_BULK_DOWNLOAD',

  // Data Access
  DATA_VIEW = 'DATA_VIEW',
  DATA_SEARCH = 'DATA_SEARCH',
  DATA_QUERY = 'DATA_QUERY',

  // Data Modification
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_BULK_UPDATE = 'DATA_BULK_UPDATE',
  DATA_BULK_DELETE = 'DATA_BULK_DELETE',

  // Data Retention
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  DATA_RESTORE = 'DATA_RESTORE',
  DATA_PURGE = 'DATA_PURGE',
}

/**
 * AI/ML Events
 */
export enum AIAuditEvent {
  // AI Requests
  AI_CHAT_REQUEST = 'AI_CHAT_REQUEST',
  AI_CHAT_RESPONSE = 'AI_CHAT_RESPONSE',
  AI_EMBEDDING_GENERATED = 'AI_EMBEDDING_GENERATED',
  AI_COMPLETION_REQUEST = 'AI_COMPLETION_REQUEST',

  // AI Quota Management
  AI_QUOTA_CHECK = 'AI_QUOTA_CHECK',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_QUOTA_RESET = 'AI_QUOTA_RESET',

  // AI Content Moderation
  AI_CONTENT_FLAGGED = 'AI_CONTENT_FLAGGED',
  AI_CONTENT_BLOCKED = 'AI_CONTENT_BLOCKED',
}

/**
 * Admin/Configuration Events
 */
export enum AdminAuditEvent {
  // Organization Management
  ADMIN_ORG_CREATED = 'ADMIN_ORG_CREATED',
  ADMIN_ORG_UPDATED = 'ADMIN_ORG_UPDATED',
  ADMIN_ORG_DELETED = 'ADMIN_ORG_DELETED',
  ADMIN_ORG_SUSPENDED = 'ADMIN_ORG_SUSPENDED',

  // User Management
  ADMIN_USER_CREATED = 'ADMIN_USER_CREATED',
  ADMIN_USER_UPDATED = 'ADMIN_USER_UPDATED',
  ADMIN_USER_DELETED = 'ADMIN_USER_DELETED',
  ADMIN_USER_SUSPENDED = 'ADMIN_USER_SUSPENDED',
  ADMIN_USER_REACTIVATED = 'ADMIN_USER_REACTIVATED',

  // Configuration Changes
  ADMIN_CONFIG_CHANGED = 'ADMIN_CONFIG_CHANGED',
  ADMIN_FEATURE_FLAG_CHANGED = 'ADMIN_FEATURE_FLAG_CHANGED',
  ADMIN_SETTINGS_UPDATED = 'ADMIN_SETTINGS_UPDATED',

  // Security Configuration
  ADMIN_SECURITY_POLICY_CHANGED = 'ADMIN_SECURITY_POLICY_CHANGED',
  ADMIN_IP_WHITELIST_CHANGED = 'ADMIN_IP_WHITELIST_CHANGED',
  ADMIN_RATE_LIMIT_CHANGED = 'ADMIN_RATE_LIMIT_CHANGED',
}

/**
 * Security Events
 */
export enum SecurityAuditEvent {
  // Anomaly Detection
  SECURITY_ANOMALY_DETECTED = 'SECURITY_ANOMALY_DETECTED',
  SECURITY_SUSPICIOUS_ACTIVITY = 'SECURITY_SUSPICIOUS_ACTIVITY',

  // Rate Limiting
  SECURITY_RATE_LIMIT_EXCEEDED = 'SECURITY_RATE_LIMIT_EXCEEDED',
  SECURITY_QUOTA_EXCEEDED = 'SECURITY_QUOTA_EXCEEDED',

  // Access Control
  SECURITY_ACCESS_DENIED = 'SECURITY_ACCESS_DENIED',
  SECURITY_IP_BLOCKED = 'SECURITY_IP_BLOCKED',

  // Encryption/Keys
  SECURITY_ENCRYPTION_KEY_ROTATED = 'SECURITY_ENCRYPTION_KEY_ROTATED',
  SECURITY_CERTIFICATE_RENEWED = 'SECURITY_CERTIFICATE_RENEWED',
}

/**
 * All audit event types combined
 */
export type AuditEventType =
  | AuthAuditEvent
  | RBACAutitEvent
  | DataAuditEvent
  | AIAuditEvent
  | AdminAuditEvent
  | SecurityAuditEvent

/**
 * Audit event metadata for classification
 */
export interface AuditEventMetadata {
  eventType: AuditEventType
  category:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'data_modification'
    | 'admin_action'
    | 'security_event'
    | 'ai_usage'
  complianceLevel: 'low' | 'standard' | 'high' | 'critical'
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  retentionYears: number // Required retention period
}

/**
 * Get metadata for an audit event type
 *
 * This function provides the classification and retention policy for each event type.
 * Used by audit logger to ensure consistent compliance-level tagging.
 */
export function getAuditEventMetadata(eventType: AuditEventType): AuditEventMetadata {
  // Authentication events
  if (eventType.startsWith('AUTH_')) {
    const isFailure = eventType.includes('FAILURE')
    return {
      eventType,
      category: 'authentication',
      complianceLevel: isFailure ? 'critical' : 'high',
      dataClassification: 'confidential',
      severity: isFailure ? 'warning' : 'info',
      retentionYears: 7, // PIPEDA requirement
    }
  }

  // Authorization/RBAC events
  if (eventType.startsWith('RBAC_')) {
    const isDenial = eventType.includes('DENIED')
    return {
      eventType,
      category: 'authorization',
      complianceLevel: isDenial ? 'high' : 'standard',
      dataClassification: 'confidential',
      severity: isDenial ? 'warning' : 'info',
      retentionYears: 7,
    }
  }

  // Data export events (high risk)
  if (
    eventType === DataAuditEvent.DATA_EXPORT_CSV ||
    eventType === DataAuditEvent.DATA_EXPORT_JSON ||
    eventType === DataAuditEvent.DATA_EXPORT_PDF ||
    eventType === DataAuditEvent.DATA_BULK_DOWNLOAD
  ) {
    return {
      eventType,
      category: 'data_access',
      complianceLevel: 'critical',
      dataClassification: 'restricted',
      severity: 'info',
      retentionYears: 7,
    }
  }

  // Other data modification events
  if (eventType.startsWith('DATA_')) {
    const isDelete = eventType.includes('DELETE') || eventType.includes('PURGE')
    return {
      eventType,
      category: eventType.includes('UPDATE') || isDelete ? 'data_modification' : 'data_access',
      complianceLevel: isDelete ? 'high' : 'standard',
      dataClassification: 'internal',
      severity: 'info',
      retentionYears: isDelete ? 7 : 3,
    }
  }

  // AI events
  if (eventType.startsWith('AI_')) {
    const isQuotaExceeded = eventType.includes('QUOTA_EXCEEDED')
    return {
      eventType,
      category: 'ai_usage',
      complianceLevel: isQuotaExceeded ? 'high' : 'standard',
      dataClassification: 'internal',
      severity: isQuotaExceeded ? 'warning' : 'info',
      retentionYears: 3,
    }
  }

  // Admin events
  if (eventType.startsWith('ADMIN_')) {
    return {
      eventType,
      category: 'admin_action',
      complianceLevel: 'high',
      dataClassification: 'confidential',
      severity: 'info',
      retentionYears: 7,
    }
  }

  // Security events
  if (eventType.startsWith('SECURITY_')) {
    return {
      eventType,
      category: 'security_event',
      complianceLevel: 'critical',
      dataClassification: 'restricted',
      severity: 'warning',
      retentionYears: 7,
    }
  }

  // Default fallback
  return {
    eventType,
    category: 'data_access',
    complianceLevel: 'standard',
    dataClassification: 'internal',
    severity: 'info',
    retentionYears: 3,
  }
}

/**
 * Check if an event type requires immediate alerting
 */
export function requiresImmediateAlert(eventType: AuditEventType): boolean {
  const alertEvents = [
    AuthAuditEvent.AUTH_LOGIN_FAILURE,
    RBACAutitEvent.RBAC_PERMISSION_DENIED,
    AIAuditEvent.AI_QUOTA_EXCEEDED,
    AIAuditEvent.AI_CONTENT_BLOCKED,
    SecurityAuditEvent.SECURITY_ANOMALY_DETECTED,
    SecurityAuditEvent.SECURITY_SUSPICIOUS_ACTIVITY,
    SecurityAuditEvent.SECURITY_ACCESS_DENIED,
    SecurityAuditEvent.SECURITY_IP_BLOCKED,
  ]

  return alertEvents.includes(eventType as any)
}
