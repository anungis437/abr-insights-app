import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import crypto from 'crypto'

/**
 * Middleware for:
 * 1. Supabase session management and auth redirects
 * 2. CSP nonce generation for inline script/style security
 */
export async function middleware(request: NextRequest) {
  // Generate cryptographic nonce for CSP
  const nonce = crypto.randomBytes(16).toString('base64')

  // Get the Supabase session response (handles auth redirects)
  const supabaseResponse = await updateSession(request)

  // If Supabase middleware returned a redirect, preserve it but add CSP headers
  const response =
    supabaseResponse.status === 307 || supabaseResponse.status === 308
      ? supabaseResponse
      : NextResponse.next({ request })

  // Copy over Supabase cookies if we created a new response
  if (response !== supabaseResponse) {
    const supabaseCookies = supabaseResponse.cookies.getAll()
    supabaseCookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value)
    })
  }

  // Build CSP header with nonce-based security (removes unsafe-inline)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://cdn.jsdelivr.net;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.stripe.com;
    frame-src 'self' https://js.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader)

  // Pass nonce to components via custom header
  response.headers.set('x-nonce', nonce)

  return response
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, icons, manifest, sw.js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js|robots.txt|sitemap.xml).*)',
  ],
}
