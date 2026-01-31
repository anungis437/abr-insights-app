/**
 * Server-side authentication utilities for API routes
 *
 * Usage:
 *   const session = await requireSession(request);
 *   const orgId = await requireOrgContext(session.user.id, request);
 *   await requirePermission(session.user.id, orgId, 'ai.chat.use');
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Session, User } from '@supabase/supabase-js'

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'AUTH_ERROR'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class PermissionError extends AuthError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'PERMISSION_DENIED')
    this.name = 'PermissionError'
  }
}

export class OrgContextError extends AuthError {
  constructor(message: string = 'Invalid organization context') {
    super(message, 403, 'INVALID_ORG_CONTEXT')
    this.name = 'OrgContextError'
  }
}

/**
 * Extract and validate Supabase session from request
 * @throws {AuthError} If session is invalid or missing
 */
export async function requireSession(request: NextRequest): Promise<Session> {
  const supabase = await createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new AuthError('Authentication required', 401, 'NO_SESSION')
  }

  return session
}

/**
 * Get authenticated user from request
 * @throws {AuthError} If user is not authenticated
 */
export async function requireUser(request: NextRequest): Promise<User> {
  const session = await requireSession(request)
  return session.user
}

/**
 * Resolve and validate user's organization context
 * Priority order:
 *   1. Request header: X-Organization-Id
 *   2. Query param: ?organization_id=...
 *   3. User's default organization from profile
 *
 * @throws {OrgContextError} If organization context cannot be resolved or user lacks access
 */
export async function requireOrgContext(user: User, request: NextRequest): Promise<string> {
  const supabase = await createClient()

  // Try header first
  let orgId: string | null = request.headers.get('X-Organization-Id')

  // Try query param
  if (!orgId) {
    const url = new URL(request.url)
    orgId = url.searchParams.get('organization_id')
  }

  // Fall back to user's default organization
  if (!orgId) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (error || !profile?.organization_id) {
      throw new OrgContextError('User has no organization assigned')
    }

    orgId = profile.organization_id
  }

  // At this point, orgId must be non-null or an error was thrown
  if (!orgId) {
    throw new OrgContextError('Organization ID could not be resolved')
  }

  // Verify user has access to this organization
  const { data: membership, error: membershipError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()

  if (membershipError || !membership) {
    throw new OrgContextError(`User does not have access to organization: ${orgId}`)
  }

  return orgId
}

/**
 * Check if user has a specific permission in the given organization
 * Uses the RBAC permission system (roles → permissions)
 *
 * @throws {PermissionError} If user lacks the required permission
 */
export async function requirePermission(
  userId: string,
  organizationId: string,
  permissionSlug: string
): Promise<void> {
  const supabase = await createClient()

  // Call RPC function to check effective permissions
  // This resolves user → roles → permissions in one query
  const { data: hasPermission, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_organization_id: organizationId,
    p_permission_slug: permissionSlug,
  })

  if (error) {
    console.error('Permission check failed:', error)
    throw new AuthError('Permission check failed', 500, 'PERMISSION_CHECK_ERROR')
  }

  if (!hasPermission) {
    throw new PermissionError(`Missing required permission: ${permissionSlug}`)
  }
}

/**
 * Check if user has any of the specified permissions (OR logic)
 * @throws {PermissionError} If user lacks all permissions
 */
export async function requireAnyPermission(
  userId: string,
  organizationId: string,
  permissionSlugs: string[]
): Promise<void> {
  const supabase = await createClient()

  for (const slug of permissionSlugs) {
    const { data: hasPermission } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_organization_id: organizationId,
      p_permission_slug: slug,
    })

    if (hasPermission) {
      return // User has at least one permission
    }
  }

  throw new PermissionError(`Missing any of required permissions: ${permissionSlugs.join(', ')}`)
}

/**
 * Check if user has an admin role (admin, super_admin, org_admin) via RBAC
 * Uses the proper RBAC tables (user_roles / roles) instead of profiles.role
 *
 * @returns boolean - true if user has any admin role
 */
export async function hasAdminRole(userId: string, organizationId?: string): Promise<boolean> {
  const supabase = await createClient()

  // Query user_roles joined with roles to check for admin-level roles
  const query = supabase.from('user_roles').select('roles!inner(slug, level)').eq('user_id', userId)

  // If organization context provided, filter by org
  if (organizationId) {
    query.eq('organization_id', organizationId)
  }

  const { data: userRoles, error } = await query

  if (error) {
    console.error('Failed to check admin role:', error)
    return false
  }

  // Check if user has any admin-level role (level >= 50)
  // super_admin (60), admin (50), org_admin (50)
  return userRoles?.some((ur: any) => ur.roles.level >= 50) ?? false
}

/**
 * Require user to have an admin role via RBAC
 * @throws {PermissionError} If user is not an admin
 */
export async function requireAdminRole(userId: string, organizationId?: string): Promise<void> {
  const isAdmin = await hasAdminRole(userId, organizationId)

  if (!isAdmin) {
    throw new PermissionError('Admin role required')
  }
}

/**
 * Check if user has all specified permissions (AND logic)
 * @throws {PermissionError} If user lacks any permission
 */
export async function requireAllPermissions(
  userId: string,
  organizationId: string,
  permissionSlugs: string[]
): Promise<void> {
  for (const slug of permissionSlugs) {
    await requirePermission(userId, organizationId, slug)
  }
}

/**
 * Check if user is a super admin (bypasses org context)
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  return profile?.role === 'super_admin'
}

/**
 * Get user's effective permissions in an organization (for caching)
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<string[]> {
  const supabase = await createClient()

  const { data: permissions, error } = await supabase.rpc('get_user_permissions', {
    p_user_id: userId,
    p_organization_id: organizationId,
  })

  if (error) {
    console.error('Failed to fetch user permissions:', error)
    return []
  }

  return permissions || []
}
