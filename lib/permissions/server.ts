import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'

/**
 * Server-side permission check utilities
 * Use these in Server Actions and API routes
 */

export interface PermissionCheckResult {
  allowed: boolean
  error?: string
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionName: string): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('has_permission', {
      permission_name: permissionName,
    })

    if (error) {
      logger.error('Permission check error', { error, permissionName })
      return { allowed: false, error: error.message }
    }

    return { allowed: data === true }
  } catch (error) {
    logger.error('Permission check exception', { error, permissionName })
    return { allowed: false, error: 'Permission check failed' }
  }
}

/**
 * Check if current user has ANY of the specified permissions
 */
export async function hasAnyPermission(permissions: string[]): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { allowed: false, error: 'Not authenticated' }
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.organization_id) {
      return { allowed: false, error: 'No organization found' }
    }

    const { data, error } = await supabase.rpc('has_any_permission', {
      user_id: user.id,
      org_id: profile.organization_id,
      permissions: permissions,
    })

    if (error) {
      logger.error('Permission check error', { error, permissions })
      return { allowed: false, error: error.message }
    }

    return { allowed: data === true }
  } catch (error) {
    logger.error('Permission check exception', { error, permissions })
    return { allowed: false, error: 'Permission check failed' }
  }
}

/**
 * Check if current user has ALL of the specified permissions
 */
export async function hasAllPermissions(permissions: string[]): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { allowed: false, error: 'Not authenticated' }
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.organization_id) {
      return { allowed: false, error: 'No organization found' }
    }

    const { data, error } = await supabase.rpc('has_all_permissions', {
      user_id: user.id,
      org_id: profile.organization_id,
      permissions: permissions,
    })

    if (error) {
      logger.error('Permission check error', { error, permissions })
      return { allowed: false, error: error.message }
    }

    return { allowed: data === true }
  } catch (error) {
    logger.error('Permission check exception', { error, permissions })
    return { allowed: false, error: 'Permission check failed' }
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { allowed: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase.rpc('is_admin', {
      user_id: user.id,
    })

    if (error) {
      logger.error('Admin check error', { error })
      return { allowed: false, error: error.message }
    }

    return { allowed: data === true }
  } catch (error) {
    logger.error('Admin check exception', { error })
    return { allowed: false, error: 'Admin check failed' }
  }
}

/**
 * Require permission - throws error if not allowed
 * Use in Server Actions that must have permission
 */
export async function requirePermission(permissionName: string): Promise<void> {
  const result = await hasPermission(permissionName)
  if (!result.allowed) {
    throw new Error(result.error || `Permission denied: ${permissionName}`)
  }
}

/**
 * Require any permission - throws error if none are allowed
 */
export async function requireAnyPermission(permissions: string[]): Promise<void> {
  const result = await hasAnyPermission(permissions)
  if (!result.allowed) {
    throw new Error(
      result.error || `Permission denied: requires one of [${permissions.join(', ')}]`
    )
  }
}

/**
 * Require all permissions - throws error if any are missing
 */
export async function requireAllPermissions(permissions: string[]): Promise<void> {
  const result = await hasAllPermissions(permissions)
  if (!result.allowed) {
    throw new Error(
      result.error || `Permission denied: requires all of [${permissions.join(', ')}]`
    )
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const result = await isAdmin()
  if (!result.allowed) {
    throw new Error(result.error || 'Admin access required')
  }
}
