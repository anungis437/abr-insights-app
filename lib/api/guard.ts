/**
 * API Route Guards - Higher-order functions for protecting Next.js API routes
 *
 * Usage:
 *   export const POST = withAuth(
 *     withOrg(
 *       withPermission('ai.chat.use', async (request, context) => {
 *         // Your protected handler logic
 *         return NextResponse.json({ success: true });
 *       })
 *     )
 *   );
 *
 * Or composeable:
 *   const handler = async (req, ctx) => { ... };
 *   export const POST = guardedRoute(handler, {
 *     requireAuth: true,
 *     requireOrg: true,
 *     permissions: ['ai.chat.use'],
 *     rateLimit: { requests: 30, window: 60 }
 *   });
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  requireSession,
  requireOrgContext,
  requirePermission,
  requireAnyPermission,
  AuthError,
  PermissionError,
  OrgContextError,
} from '@/lib/auth/serverAuth'
import type { Session, User } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/production-logger'

/**
 * Extended context passed to guarded handlers
 */
export interface GuardedContext {
  session?: Session
  user?: User
  organizationId?: string
  permissions?: string[]
}

/**
 * Handler signature for guarded routes
 */
export type GuardedHandler = (
  request: NextRequest,
  context: GuardedContext
) => Promise<NextResponse> | NextResponse

/**
 * Error response formatter
 */
function errorResponse(error: Error): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Log unexpected errors
  logger.error('[API Guard] Unexpected error', { error })

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Basic authentication guard - ensures user is logged in
 */
export function withAuth(handler: GuardedHandler): GuardedHandler {
  return async (request: NextRequest, context: GuardedContext = {}) => {
    try {
      const session = await requireSession(request)

      return await handler(request, {
        ...context,
        session,
        user: session.user,
      })
    } catch (error) {
      return errorResponse(error as Error)
    }
  }
}

/**
 * Organization context guard - ensures user has valid org context
 * Must be used AFTER withAuth
 */
export function withOrg(handler: GuardedHandler): GuardedHandler {
  return async (request: NextRequest, context: GuardedContext = {}) => {
    try {
      if (!context.user) {
        throw new AuthError('withOrg must be used after withAuth')
      }

      const organizationId = await requireOrgContext(context.user, request)

      return await handler(request, {
        ...context,
        organizationId,
      })
    } catch (error) {
      return errorResponse(error as Error)
    }
  }
}

/**
 * Permission guard - ensures user has a specific permission
 * Must be used AFTER withAuth and withOrg
 */
export function withPermission(permissionSlug: string, handler: GuardedHandler): GuardedHandler {
  return async (request: NextRequest, context: GuardedContext = {}) => {
    try {
      if (!context.user || !context.organizationId) {
        throw new AuthError('withPermission must be used after withAuth and withOrg')
      }

      await requirePermission(context.user.id, context.organizationId, permissionSlug)

      return await handler(request, context)
    } catch (error) {
      return errorResponse(error as Error)
    }
  }
}

/**
 * Multiple permission guard (user must have ANY of the listed permissions)
 */
export function withAnyPermission(
  permissionSlugs: string[],
  handler: GuardedHandler
): GuardedHandler {
  return async (request: NextRequest, context: GuardedContext = {}) => {
    try {
      if (!context.user || !context.organizationId) {
        throw new AuthError('withAnyPermission must be used after withAuth and withOrg')
      }

      await requireAnyPermission(context.user.id, context.organizationId, permissionSlugs)

      return await handler(request, context)
    } catch (error) {
      return errorResponse(error as Error)
    }
  }
}

/**
 * Composeable guard with all options
 *
 * Note: Rate limiting is intentionally NOT included here.
 * Apply rate limits separately using withRateLimit or withMultipleRateLimits
 * from lib/security/rateLimit.ts for better composability.
 */
export interface GuardOptions {
  requireAuth?: boolean
  requireOrg?: boolean
  permissions?: string[]
  anyPermissions?: string[] // OR logic for permissions
}

export function guardedRoute(handler: GuardedHandler, options: GuardOptions = {}): GuardedHandler {
  let guardedHandler = handler

  // Apply guards in reverse order (innermost first)
  if (options.permissions && options.permissions.length > 0) {
    for (const permission of options.permissions) {
      guardedHandler = withPermission(permission, guardedHandler)
    }
  }

  if (options.anyPermissions && options.anyPermissions.length > 0) {
    guardedHandler = withAnyPermission(options.anyPermissions, guardedHandler)
  }

  if (options.requireOrg) {
    guardedHandler = withOrg(guardedHandler)
  }

  if (options.requireAuth) {
    guardedHandler = withAuth(guardedHandler)
  }

  return guardedHandler
}

/**
 * Public route guard - no authentication required, but session is provided if available
 */
export function publicRoute(handler: GuardedHandler): GuardedHandler {
  return async (request: NextRequest, context: GuardedContext = {}) => {
    try {
      // Try to get session, but don't fail if it doesn't exist
      const session = await requireSession(request).catch(() => null)

      if (session) {
        context.session = session
        context.user = session.user
      }

      return await handler(request, context)
    } catch (error) {
      return errorResponse(error as Error)
    }
  }
}
