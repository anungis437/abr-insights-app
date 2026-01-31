/**
 * CSRF Token Generation Endpoint
 * GET /api/csrf/token
 *
 * Returns a fresh CSRF token for the authenticated user
 * Protected by authentication requirement
 */

import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { generateCSRFToken } from '@/lib/security/csrf'
import { logger } from '@/lib/utils/production-logger'

async function tokenHandler(request: NextRequest, context: GuardedContext) {
  try {
    const token = await generateCSRFToken(context.user!.id)

    return NextResponse.json({
      token,
      expiresIn: 3600, // 1 hour in seconds
    })
  } catch (error) {
    logger.error('Failed to generate CSRF token', error as Error, {
      userId: context.user!.id,
    })
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 })
  }
}

export const GET = guardedRoute(tokenHandler, {
  requireAuth: true,
  requireOrg: false, // CSRF tokens work without org context
  anyPermissions: [], // All authenticated users can get tokens
})
