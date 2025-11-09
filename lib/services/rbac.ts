/**
 * RBAC Service Layer
 * 
 * Enterprise-grade Role-Based Access Control with:
 * - Resource-level permissions
 * - Role hierarchy with inheritance
 * - User-specific permission overrides
 * - In-memory and database caching
 * - Compliance audit trail
 * 
 * @module lib/services/rbac
 */

import { createClient } from '@/lib/supabase/server'

// Types for permission checking
interface PermissionCheckResult {
  granted: boolean
  source: 'role' | 'override' | 'public' | 'denied'
  reason?: string
}

interface UserPermission {
  id: string
  permission_slug: string
  resource_type?: string
  resource_id?: string
  scope_type: 'user' | 'role' | 'organization' | 'public'
  granted_by?: string
  expires_at?: string
}

interface PermissionOverride {
  permission_slug: string
  resource_type?: string
  resource_id?: string
  override_type: 'grant' | 'deny' | 'elevate'
  approval_status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

// In-memory cache for hot permissions
const permissionCache = new Map<string, { permissions: UserPermission[]; expiresAt: number }>()
const CACHE_TTL_MS = 3600 * 1000 // 1 hour (matches DB cache)

/**
 * Check if user has a specific permission
 * 
 * Evaluates permission considering:
 * - Role-based permissions with inheritance
 * - User-specific overrides (grant/deny/elevate)
 * - Resource-level scoping
 * - Public permissions
 * 
 * Uses database function for authoritative check
 */
export async function checkPermission(
  userId: string,
  permissionSlug: string,
  resourceType?: string,
  resourceId?: string
): Promise<PermissionCheckResult> {
  const supabase = await createClient()

  try {
    // Call database function (handles inheritance + overrides)
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_permission_slug: permissionSlug,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
    })

    if (error) {
      console.error('[RBAC] Permission check error:', error)
      return {
        granted: false,
        source: 'denied',
        reason: 'Permission check failed',
      }
    }

    return {
      granted: data === true,
      source: data === true ? 'role' : 'denied',
    }
  } catch (error) {
    console.error('[RBAC] Permission check exception:', error)
    return {
      granted: false,
      source: 'denied',
      reason: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get all permissions for a user
 * 
 * Returns flattened list of permissions from:
 * - Direct role assignments
 * - Role hierarchy (parent roles)
 * - User overrides
 * - Public permissions
 * 
 * Uses cached results when available
 */
export async function getUserPermissions(
  userId: string,
  useCache = true
): Promise<UserPermission[]> {
  // Check in-memory cache
  if (useCache) {
    const cached = permissionCache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions
    }
  }

  const supabase = await createClient()

  try {
    // Call database function (handles caching internally)
    const { data, error } = await supabase.rpc('get_user_effective_permissions', {
      p_user_id: userId,
    })

    if (error) {
      console.error('[RBAC] Get permissions error:', error)
      return []
    }

    // Store in memory cache
    if (useCache && data) {
      permissionCache.set(userId, {
        permissions: data as UserPermission[],
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    }

    return (data as UserPermission[]) || []
  } catch (error) {
    console.error('[RBAC] Get permissions exception:', error)
    return []
  }
}

/**
 * Get effective permissions with caching
 * 
 * Same as getUserPermissions but explicitly uses cache
 * Use this for hot paths where performance is critical
 */
export async function getEffectivePermissions(userId: string): Promise<UserPermission[]> {
  return getUserPermissions(userId, true)
}

/**
 * Assign a permission to a user or role
 * 
 * Creates a resource_permissions record
 * Automatically invalidates cache
 */
export async function assignPermission(
  grantedBy: string,
  targetType: 'user' | 'role',
  targetId: string,
  permissionSlug: string,
  resourceType?: string,
  resourceId?: string,
  expiresAt?: Date
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if granter has permission to assign permissions
    const canAssign = await checkPermission(grantedBy, 'manage_permissions')
    if (!canAssign.granted) {
      return {
        success: false,
        error: 'You do not have permission to assign permissions',
      }
    }

    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('slug', permissionSlug)
      .single()

    if (!permission) {
      return {
        success: false,
        error: `Permission not found: ${permissionSlug}`,
      }
    }

    // Insert resource permission
    const { error } = await supabase.from('resource_permissions').insert({
      permission_id: permission.id,
      scope_type: targetType,
      scope_id: targetId,
      resource_type: resourceType,
      resource_id: resourceId,
      granted_by: grantedBy,
      expires_at: expiresAt?.toISOString(),
    })

    if (error) {
      console.error('[RBAC] Assign permission error:', error)
      return {
        success: false,
        error: 'Failed to assign permission',
      }
    }

    // Clear cache for user (if assigning to user)
    if (targetType === 'user') {
      permissionCache.delete(targetId)
    }

    return { success: true }
  } catch (error) {
    console.error('[RBAC] Assign permission exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Revoke a permission from a user or role
 * 
 * Deletes resource_permissions record
 * Automatically invalidates cache
 */
export async function revokePermission(
  revokedBy: string,
  targetType: 'user' | 'role',
  targetId: string,
  permissionSlug: string,
  resourceType?: string,
  resourceId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if revoker has permission to revoke permissions
    const canRevoke = await checkPermission(revokedBy, 'manage_permissions')
    if (!canRevoke.granted) {
      return {
        success: false,
        error: 'You do not have permission to revoke permissions',
      }
    }

    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('slug', permissionSlug)
      .single()

    if (!permission) {
      return {
        success: false,
        error: `Permission not found: ${permissionSlug}`,
      }
    }

    // Delete resource permission
    let query = supabase
      .from('resource_permissions')
      .delete()
      .eq('permission_id', permission.id)
      .eq('scope_type', targetType)
      .eq('scope_id', targetId)

    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }
    if (resourceId) {
      query = query.eq('resource_id', resourceId)
    }

    const { error } = await query

    if (error) {
      console.error('[RBAC] Revoke permission error:', error)
      return {
        success: false,
        error: 'Failed to revoke permission',
      }
    }

    // Clear cache for user (if revoking from user)
    if (targetType === 'user') {
      permissionCache.delete(targetId)
    }

    return { success: true }
  } catch (error) {
    console.error('[RBAC] Revoke permission exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a permission override for a user
 * 
 * Allows temporary or exceptional permission grants/denials
 * Requires approval workflow for compliance
 */
export async function createPermissionOverride(
  requestedBy: string,
  userId: string,
  permissionSlug: string,
  overrideType: 'grant' | 'deny' | 'elevate',
  reason: string,
  resourceType?: string,
  resourceId?: string,
  expiresAt?: Date
): Promise<{ success: boolean; overrideId?: string; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if requester has permission to create overrides
    const canCreate = await checkPermission(requestedBy, 'manage_permission_overrides')
    if (!canCreate.granted) {
      return {
        success: false,
        error: 'You do not have permission to create permission overrides',
      }
    }

    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('slug', permissionSlug)
      .single()

    if (!permission) {
      return {
        success: false,
        error: `Permission not found: ${permissionSlug}`,
      }
    }

    // Insert permission override
    const { data: override, error } = await supabase
      .from('permission_overrides')
      .insert({
        user_id: userId,
        permission_id: permission.id,
        override_type: overrideType,
        resource_type: resourceType,
        resource_id: resourceId,
        reason,
        requested_by: requestedBy,
        approval_status: 'pending', // Requires approval
        expires_at: expiresAt?.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[RBAC] Create override error:', error)
      return {
        success: false,
        error: 'Failed to create permission override',
      }
    }

    // Clear cache for user
    permissionCache.delete(userId)

    return {
      success: true,
      overrideId: override.id,
    }
  } catch (error) {
    console.error('[RBAC] Create override exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Approve a permission override
 * 
 * Marks override as approved and activates it
 */
export async function approvePermissionOverride(
  approvedBy: string,
  overrideId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if approver has permission to approve overrides
    const canApprove = await checkPermission(approvedBy, 'approve_permission_overrides')
    if (!canApprove.granted) {
      return {
        success: false,
        error: 'You do not have permission to approve permission overrides',
      }
    }

    // Update override
    const { data: override, error } = await supabase
      .from('permission_overrides')
      .update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', overrideId)
      .select('user_id')
      .single()

    if (error) {
      console.error('[RBAC] Approve override error:', error)
      return {
        success: false,
        error: 'Failed to approve permission override',
      }
    }

    // Clear cache for user
    if (override) {
      permissionCache.delete(override.user_id)
    }

    return { success: true }
  } catch (error) {
    console.error('[RBAC] Approve override exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user roles with inheritance
 * 
 * Returns all roles assigned to user, including parent roles
 */
export async function getUserRolesWithInheritance(userId: string): Promise<string[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_user_roles_with_inheritance', {
      p_user_id: userId,
    })

    if (error) {
      console.error('[RBAC] Get user roles error:', error)
      return []
    }

    return (data as string[]) || []
  } catch (error) {
    console.error('[RBAC] Get user roles exception:', error)
    return []
  }
}

/**
 * Clear permission cache for a user
 * 
 * Forces fresh permission computation on next check
 */
export function clearPermissionCache(userId: string): void {
  permissionCache.delete(userId)
}

/**
 * Clear all permission caches
 * 
 * Use sparingly - invalidates all in-memory caches
 */
export function clearAllPermissionCaches(): void {
  permissionCache.clear()
}
