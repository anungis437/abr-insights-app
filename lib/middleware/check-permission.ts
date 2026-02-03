/**
 * RBAC Middleware - Route Protection with Permission Checks
 *
 * Higher-order function for protecting routes with permission requirements
 *
 * Usage in API routes:
 * ```typescript
 * import { withPermission } from '@/lib/middleware/check-permission'
 *
 * async function handler(request: NextRequest) {
 *   // Your protected logic here
 * }
 *
 * export const GET = withPermission(handler, 'read_content')
 * export const POST = withPermission(handler, 'create_content', 'Course', '123')
 * ```
 *
 * @module lib/middleware/check-permission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/services/rbac'
import { logger } from '@/lib/utils/production-logger'

type RouteHandler = (request: NextRequest) => Promise<NextResponse>

/**
 * Permission check middleware
 *
 * Wraps route handlers to require specific permissions
 * Returns 401 if not authenticated, 403 if permission denied
 */
export function withPermission(
  handler: RouteHandler,
  permissionSlug: string,
  resourceType?: string,
  resourceId?: string
): RouteHandler {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            code: 'UNAUTHENTICATED',
          },
          { status: 401 }
        )
      }

      // Check permission
      const permissionCheck = await checkPermission(
        user.id,
        permissionSlug,
        resourceType,
        resourceId
      )

      if (!permissionCheck.granted) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            code: 'FORBIDDEN',
            required_permission: permissionSlug,
            reason: permissionCheck.reason,
          },
          { status: 403 }
        )
      }

      // Permission granted, proceed to handler
      return await handler(request)
    } catch (error) {
      logger.error('Permission check failed (single permission)', {
        error,
        permission: permissionSlug,
        resourceType,
        resourceId,
      })
      return NextResponse.json(
        {
          error: 'Permission check failed',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Multiple permission check (requires ALL permissions)
 *
 * Use when route requires multiple permissions
 */
export function withPermissions(
  handler: RouteHandler,
  permissions: Array<{
    slug: string
    resourceType?: string
    resourceId?: string
  }>
): RouteHandler {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            code: 'UNAUTHENTICATED',
          },
          { status: 401 }
        )
      }

      // Check all permissions
      for (const perm of permissions) {
        const permissionCheck = await checkPermission(
          user.id,
          perm.slug,
          perm.resourceType,
          perm.resourceId
        )

        if (!permissionCheck.granted) {
          return NextResponse.json(
            {
              error: 'Permission denied',
              code: 'FORBIDDEN',
              required_permissions: permissions.map((p) => p.slug),
              failed_permission: perm.slug,
              reason: permissionCheck.reason,
            },
            { status: 403 }
          )
        }
      }

      // All permissions granted, proceed to handler
      return await handler(request)
    } catch (error) {
      logger.error('Permission check failed (all required)', {
        error,
        permissions: permissions.map((p) => p.slug),
      })
      return NextResponse.json(
        {
          error: 'Permission check failed',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Any permission check (requires ANY ONE permission)
 *
 * Use when route can be accessed with any of several permissions
 */
export function withAnyPermission(
  handler: RouteHandler,
  permissions: Array<{
    slug: string
    resourceType?: string
    resourceId?: string
  }>
): RouteHandler {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            code: 'UNAUTHENTICATED',
          },
          { status: 401 }
        )
      }

      // Check permissions (any one is sufficient)
      let granted = false
      for (const perm of permissions) {
        const permissionCheck = await checkPermission(
          user.id,
          perm.slug,
          perm.resourceType,
          perm.resourceId
        )

        if (permissionCheck.granted) {
          granted = true
          break
        }
      }

      if (!granted) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            code: 'FORBIDDEN',
            required_any_permission: permissions.map((p) => p.slug),
          },
          { status: 403 }
        )
      }

      // At least one permission granted, proceed to handler
      return await handler(request)
    } catch (error) {
      logger.error('Permission check failed (any required)', {
        error,
        permissions: permissions.map((p) => p.slug),
      })
      return NextResponse.json(
        {
          error: 'Permission check failed',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Dynamic permission check (extract resource from request)
 *
 * Use when resource ID comes from request (URL params, body, etc.)
 */
export function withDynamicPermission(
  handler: RouteHandler,
  permissionSlug: string,
  resourceType: string,
  resourceIdExtractor: (request: NextRequest) => Promise<string | null>
): RouteHandler {
  return async (request: NextRequest) => {
    try {
      const supabase = await createClient()

      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            code: 'UNAUTHENTICATED',
          },
          { status: 401 }
        )
      }

      // Extract resource ID from request
      const resourceId = await resourceIdExtractor(request)

      if (!resourceId) {
        return NextResponse.json(
          {
            error: 'Resource not found',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        )
      }

      // Check permission
      const permissionCheck = await checkPermission(
        user.id,
        permissionSlug,
        resourceType,
        resourceId
      )

      if (!permissionCheck.granted) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            code: 'FORBIDDEN',
            required_permission: permissionSlug,
            resource_type: resourceType,
            resource_id: resourceId,
            reason: permissionCheck.reason,
          },
          { status: 403 }
        )
      }

      // Permission granted, proceed to handler
      return await handler(request)
    } catch (error) {
      console.error('[Permission Middleware] Error:', error)
      return NextResponse.json(
        {
          error: 'Permission check failed',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      )
    }
  }
}
