import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Server-side permission checking utilities
 * Use in API routes and Server Actions
 */

export interface PermissionCheckResult {
  allowed: boolean
  userId?: string
  organizationId?: string
  error?: string
}

/**
 * Check if the current user has a specific permission
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const check = await checkPermission('courses.create');
 *   if (!check.allowed) {
 *     return NextResponse.json({ error: check.error }, { status: 403 });
 *   }
 *   // Proceed with operation
 * }
 * ```
 */
export async function checkPermission(permission: string): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        allowed: false,
        error: 'Not authenticated',
      }
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    // Check if user has the permission through their roles
    const { data: hasPermission, error } = await supabase.rpc('has_permission', {
      p_user_id: user.id,
      p_org_id: profile?.organization_id || null,
      p_permission: permission,
    })

    if (error) {
      console.error('[checkPermission] RPC error:', error)
      return {
        allowed: false,
        userId: user.id,
        organizationId: profile?.organization_id,
        error: 'Permission check failed',
      }
    }

    return {
      allowed: !!hasPermission,
      userId: user.id,
      organizationId: profile?.organization_id,
    }
  } catch (error) {
    console.error('[checkPermission] Error:', error)
    return {
      allowed: false,
      error: 'Internal error',
    }
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function checkAnyPermission(permissions: string[]): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        allowed: false,
        error: 'Not authenticated',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data: hasAny, error } = await supabase.rpc('has_any_permission', {
      p_user_id: user.id,
      p_org_id: profile?.organization_id || null,
      p_permissions: permissions,
    })

    if (error) {
      console.error('[checkAnyPermission] RPC error:', error)
      return {
        allowed: false,
        userId: user.id,
        organizationId: profile?.organization_id,
        error: 'Permission check failed',
      }
    }

    return {
      allowed: !!hasAny,
      userId: user.id,
      organizationId: profile?.organization_id,
    }
  } catch (error) {
    console.error('[checkAnyPermission] Error:', error)
    return {
      allowed: false,
      error: 'Internal error',
    }
  }
}

/**
 * Check if user has all specified permissions
 */
export async function checkAllPermissions(permissions: string[]): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        allowed: false,
        error: 'Not authenticated',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data: hasAll, error } = await supabase.rpc('has_all_permissions', {
      p_user_id: user.id,
      p_org_id: profile?.organization_id || null,
      p_permissions: permissions,
    })

    if (error) {
      console.error('[checkAllPermissions] RPC error:', error)
      return {
        allowed: false,
        userId: user.id,
        organizationId: profile?.organization_id,
        error: 'Permission check failed',
      }
    }

    return {
      allowed: !!hasAll,
      userId: user.id,
      organizationId: profile?.organization_id,
    }
  } catch (error) {
    console.error('[checkAllPermissions] Error:', error)
    return {
      allowed: false,
      error: 'Internal error',
    }
  }
}

/**
 * Middleware helper to require permission
 * Returns 403 response if permission check fails, null otherwise
 */
export async function requirePermission(permission: string): Promise<NextResponse | null> {
  const check = await checkPermission(permission)

  if (!check.allowed) {
    return NextResponse.json({ error: check.error || 'Insufficient permissions' }, { status: 403 })
  }

  return null
}

/**
 * Middleware helper to require any of the permissions
 */
export async function requireAnyPermission(permissions: string[]): Promise<NextResponse | null> {
  const check = await checkAnyPermission(permissions)

  if (!check.allowed) {
    return NextResponse.json({ error: check.error || 'Insufficient permissions' }, { status: 403 })
  }

  return null
}

/**
 * Middleware helper to require all permissions
 */
export async function requireAllPermissions(permissions: string[]): Promise<NextResponse | null> {
  const check = await checkAllPermissions(permissions)

  if (!check.allowed) {
    return NextResponse.json({ error: check.error || 'Insufficient permissions' }, { status: 403 })
  }

  return null
}

/**
 * Get current user context with organization
 */
export async function getCurrentUserContext() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    return {
      user,
      profile,
      organizationId: profile?.organization_id,
    }
  } catch (error) {
    console.error('[getCurrentUserContext] Error:', error)
    return null
  }
}
