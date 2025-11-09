/**
 * Azure AD B2C Login Initiation API Route
 * 
 * Initiates OAuth 2.0 authorization code flow with Azure AD B2C
 * 
 * @route POST /api/auth/azure/login
 * @access Public
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAzureADService } from '@/lib/auth/azure-ad'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationSlug } = body

    if (!organizationSlug) {
      return NextResponse.json(
        { error: 'Organization slug is required' },
        { status: 400 }
      )
    }

    // Initialize Azure AD service for organization
    const azureADService = await getAzureADService(organizationSlug)

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in cookie for validation in callback
    const cookieStore = await cookies()
    cookieStore.set('azure_ad_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })

    // Get callback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/azure/callback`

    // Get authorization URL
    const authUrl = await azureADService.getAuthorizationUrl(
      redirectUri,
      state,
      organizationSlug
    )

    return NextResponse.json({
      authUrl,
      success: true,
    })
  } catch (error) {
    console.error('[Azure AD Login] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to initiate Azure AD login',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler for direct browser navigation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationSlug = searchParams.get('org')

    if (!organizationSlug) {
      return NextResponse.redirect(new URL('/login?error=missing_organization', request.url))
    }

    // Initialize Azure AD service
    const azureADService = await getAzureADService(organizationSlug)

    // Generate state
    const state = crypto.randomBytes(32).toString('hex')

    // Store state in cookie
    const cookieStore = await cookies()
    cookieStore.set('azure_ad_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    })

    // Get authorization URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/azure/callback`
    const authUrl = await azureADService.getAuthorizationUrl(redirectUri, state, organizationSlug)

    // Redirect to Azure AD
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('[Azure AD Login] Error:', error)

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('azure_ad_error')}`,
        request.url
      )
    )
  }
}
