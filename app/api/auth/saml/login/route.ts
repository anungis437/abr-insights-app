/**
 * SAML SSO Login Initiation Endpoint
 *
 * Generates SAML AuthnRequest and redirects to IdP
 *
 * Flow:
 * 1. Receive organization slug
 * 2. Get SAML service for organization
 * 3. Generate SAML AuthnRequest URL
 * 4. Store state for callback validation
 * 5. Redirect to IdP
 *
 * Supports:
 * - POST with organizationSlug in body
 * - GET with ?org parameter for direct navigation
 *
 * @route /api/auth/saml/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'
import { cookies } from 'next/headers'
import { logger } from '@/lib/utils/production-logger'
import { sanitizeError } from '@/lib/utils/error-responses'

/**
 * POST handler - API-style login initiation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationSlug } = body

    if (!organizationSlug) {
      return NextResponse.json({ error: 'organizationSlug is required' }, { status: 400 })
    }

    // Get SAML service
    const samlService = await getSAMLService(organizationSlug)

    // Generate SAML AuthnRequest URL
    const relayState = JSON.stringify({
      organizationSlug,
      timestamp: Date.now(),
    })

    const authUrl = await samlService.getAuthorizationUrl({
      RelayState: relayState,
    })

    // Store relay state in cookie for callback validation
    const cookieStore = await cookies()
    cookieStore.set('saml_relay_state', relayState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return NextResponse.json({
      authUrl,
      organizationSlug,
    })
  } catch (error) {
    logger.error('[SAML Login] Error:', { error: error })
    return NextResponse.json(
      {
        error: 'Failed to initiate SAML login',
        details: sanitizeError(error, 'An error occurred'),
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - Direct browser navigation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationSlug = searchParams.get('org')

    if (!organizationSlug) {
      return NextResponse.redirect(new URL('/login?error=missing_organization', request.url))
    }

    // Get SAML service
    const samlService = await getSAMLService(organizationSlug)

    // Generate SAML AuthnRequest URL
    const relayState = JSON.stringify({
      organizationSlug,
      timestamp: Date.now(),
    })

    const authUrl = await samlService.getAuthorizationUrl({
      RelayState: relayState,
    })

    // Store relay state in cookie for callback validation
    const cookieStore = await cookies()
    cookieStore.set('saml_relay_state', relayState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Redirect to IdP
    return NextResponse.redirect(authUrl)
  } catch (error) {
    logger.error('[SAML Login] Error:', { error: error })
    return NextResponse.redirect(
      new URL(
        `/login?error=saml_error&details=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    )
  }
}
