/**
 * Azure AD B2C Logout API Route
 *
 * Handles SSO logout by revoking enterprise session and optionally
 * redirecting to Azure AD B2C logout endpoint
 *
 * @route POST /api/auth/azure/logout
 * @access Authenticated
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'
import { sanitizeError } from '@/lib/utils/error-responses'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's profile and organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, metadata')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Revoke all active enterprise sessions for user
    await supabase.rpc('revoke_user_sso_sessions', {
      p_user_id: user.id,
      p_reason: 'user_logout',
    })

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Get Azure AD logout URL (optional - for single logout)
    const body = await request.json().catch(() => ({}))
    const { returnUrl, singleLogout = false } = body

    if (singleLogout) {
      // Get SSO provider for organization
      const { data: ssoProvider } = await supabase
        .from('sso_providers')
        .select('azure_tenant_id, azure_policy_name')
        .eq('organization_id', profile.organization_id)
        .eq('provider_type', 'azure_ad_b2c')
        .eq('status', 'active')
        .single()

      if (ssoProvider) {
        // Build Azure AD B2C logout URL
        const policy = ssoProvider.azure_policy_name || 'B2C_1_signupsignin1'
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const postLogoutRedirectUri = returnUrl || `${baseUrl}/login`

        const logoutUrl = `https://${ssoProvider.azure_tenant_id}.b2clogin.com/${ssoProvider.azure_tenant_id}.onmicrosoft.com/${policy}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`

        return NextResponse.json({
          success: true,
          logoutUrl,
          message: 'SSO session revoked. Redirect to Azure AD logout.',
        })
      }
    }

    // Local logout only
    const redirectUrl = returnUrl || '/login'
    return NextResponse.json({
      success: true,
      redirectUrl,
      message: 'Logged out successfully',
    })
  } catch (error) {
    logger.error('[Azure AD Logout] Error:', { error: error })

    return NextResponse.json(
      {
        error: 'Logout failed',
        details: sanitizeError(error, 'An error occurred'),
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
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Revoke SSO sessions
      await supabase.rpc('revoke_user_sso_sessions', {
        p_user_id: user.id,
        p_reason: 'user_logout',
      })

      // Sign out
      await supabase.auth.signOut()
    }

    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  } catch (error) {
    logger.error('[Azure AD Logout] Error:', { error: error })
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
