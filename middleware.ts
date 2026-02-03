import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Global Next.js Middleware
 * Handles:
 * - Session management (Supabase)
 * - CSP nonce generation (security)
 * - Request correlation IDs (observability)
 * - Route redirects
 * - _dev route blocking in production
 *
 * Note: Using Web Crypto API (Edge Runtime compatible)
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block _dev routes in production (P0 security)
  if (pathname.startsWith('/_dev') || pathname.startsWith('/api/_dev')) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(null, { status: 404 })
    }
  }

  // Generate correlation ID for request tracing (P0 observability)
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID()

  // Generate CSP nonce for inline script/style security (world-class hardening)
  const nonceBuffer = new Uint8Array(16)
  crypto.getRandomValues(nonceBuffer)
  const nonce = btoa(String.fromCharCode(...nonceBuffer))

  // Redirect /team to pricing page (enterprise feature marketing)
  if (pathname === '/team' || pathname.startsWith('/team/')) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  // Let admin routes pass through (they have their own auth checks)
  // but could add additional protection here if needed

  const response = await updateSession(request)

  // Build CSP header with nonce-based security
  // Note: Some inline styles may trigger CSP warnings but won't break functionality
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://cdn.jsdelivr.net;
    style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' 'sha256-PW16PFJVsmnH4Rya4FHBjeKOzpeiM93LZcxDHGY6RGI=' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io;
    worker-src 'self' blob:;
    frame-src 'self' https://js.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Make correlation ID and nonce available to server components via request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-correlation-id', correlationId)
  requestHeaders.set('x-nonce', nonce)

  const isRedirect = response.status >= 300 && response.status < 400
  if (isRedirect) {
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
    response.headers.set('x-correlation-id', correlationId)
    return response
  }

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie)
  })

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return
    finalResponse.headers.set(key, value)
  })

  // Set security headers
  finalResponse.headers.set('Content-Security-Policy', cspHeader)
  finalResponse.headers.set('x-nonce', nonce)

  // Inject correlation ID into response headers (P0 observability)
  finalResponse.headers.set('x-correlation-id', correlationId)

  return finalResponse
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
