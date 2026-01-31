import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { randomUUID } from 'crypto'

/**
 * Global Middleware
 * Handles:
 * - Session management (Supabase)
 * - Request correlation IDs (observability)
 * - Route redirects
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate correlation ID for request tracing (P0 observability)
  const correlationId = request.headers.get('x-correlation-id') || randomUUID()

  // Redirect /team to pricing page (enterprise feature marketing)
  if (pathname === '/team' || pathname.startsWith('/team/')) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  // Let admin routes pass through (they have their own auth checks)
  // but could add additional protection here if needed

  const response = await updateSession(request)

  // Inject correlation ID into response headers (P0 observability)
  // This allows clients to trace requests through logs
  response.headers.set('x-correlation-id', correlationId)

  // Make correlation ID available to API routes via request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-correlation-id', correlationId)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
