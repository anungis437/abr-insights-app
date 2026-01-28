/**
 * Azure AD B2C OAuth Callback API Route
 * 
 * Handles OAuth 2.0 authorization code callback from Azure AD B2C
 * Exchanges code for tokens, validates, and provisions/logs in user
 * 
 * @route GET /api/auth/azure/callback
 * @access Public (callback from Azure AD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAzureADService } from '@/lib/auth/azure-ad'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Check for errors from Azure AD
    if (error) {
      console.error('[Azure AD Callback] Error from Azure AD:', error, errorDescription)
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
          request.url
        )
      )
    }

    // Validate parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=missing_parameters', request.url)
      )
    }

    // Validate state (CSRF protection)
    const cookieStore = await cookies()
    const storedState = cookieStore.get('azure_ad_state')?.value

    if (!storedState || storedState !== state.split('|')[0]) {
      console.error('[Azure AD Callback] State mismatch - possible CSRF attack')
      return NextResponse.redirect(
        new URL('/login?error=invalid_state', request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete('azure_ad_state')

    // Extract organization slug from state
    const organizationSlug = state.split('|')[1]

    if (!organizationSlug) {
      return NextResponse.redirect(
        new URL('/login?error=missing_organization', request.url)
      )
    }

    // Get organization using admin client (user not authenticated yet)
    const adminSupabase = createAdminClient()
    const { data: organization } = await adminSupabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .single()

    if (!organization) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_organization', request.url)
      )
    }

    // Initialize Azure AD service
    const azureADService = await getAzureADService(organizationSlug)

    // Get redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/azure/callback`

    // Get client IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let ssoProviderId: string | undefined

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await azureADService.acquireTokenByCode(code, redirectUri)

      // Validate and decode ID token
      const claims = azureADService.validateIdToken(tokenResponse.idToken!)

      // Get SSO provider ID (we need it for logging)
      const { data: ssoProvider } = await supabase
        .from('sso_providers')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('provider_type', 'azure_ad_b2c')
        .eq('status', 'active')
        .single()

      ssoProviderId = ssoProvider?.id

      if (!ssoProviderId) {
        throw new Error('SSO provider not found')
      }

      // Provision or get existing user
      const userId = await azureADService.provisionUser(claims, organization.id)

      // Create enterprise session
      await azureADService.createSession({
        userId,
        organizationId: organization.id,
        ssoProviderId,
        tokenResponse,
        claims,
        ipAddress,
        userAgent,
      })

      // Create Supabase auth session using service role
      // For SSO users, we create a session directly as they're already authenticated by Azure AD
      const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { last_sso_login: new Date().toISOString() } }
      )

      if (authError) {
        console.error('[Azure AD Callback] Auth update error:', authError)
        // Non-fatal - continue with login
      }

      // Note: The actual session is managed by Supabase's middleware
      // The enterprise_sessions table tracks SSO-specific session data

      // Log successful login
      await azureADService.logLoginAttempt(
        organization.id,
        ssoProviderId,
        'success',
        claims,
        userId,
        ipAddress,
        userAgent
      )

      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (provisionError) {
      console.error('[Azure AD Callback] Provisioning error:', provisionError)

      // Log failed login
      if (ssoProviderId) {
        await azureADService.logLoginAttempt(
          organization.id,
          ssoProviderId,
          'failed',
          undefined,
          undefined,
          ipAddress,
          userAgent,
          provisionError instanceof Error ? provisionError.message : 'Unknown error',
          'PROVISIONING_ERROR'
        )
      }

      return NextResponse.redirect(
        new URL(
          `/login?error=provisioning_failed&details=${encodeURIComponent(provisionError instanceof Error ? provisionError.message : 'Unknown error')}`,
          request.url
        )
      )
    }
  } catch (error) {
    console.error('[Azure AD Callback] Error:', error)

    return NextResponse.redirect(
      new URL(
        `/login?error=callback_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`,
        request.url
      )
    )
  }
}
