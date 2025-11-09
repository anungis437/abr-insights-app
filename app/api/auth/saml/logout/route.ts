/**
 * SAML SSO Logout Endpoint
 * 
 * Handles Single Logout (SLO) for SAML sessions
 * 
 * Flow:
 * 1. Get user ID from session
 * 2. Revoke all SSO sessions for user
 * 3. Sign out from Supabase auth
 * 4. Optionally initiate IdP logout (SLO)
 * 5. Redirect to login page
 * 
 * Supports:
 * - POST with optional single_logout parameter
 * - GET for direct navigation
 * 
 * @route /api/auth/saml/logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST handler - API-style logout
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Revoke all SSO sessions for user
      await supabase.rpc('revoke_user_sso_sessions', {
        p_user_id: user.id,
      })

      // Sign out from Supabase
      await supabase.auth.signOut()
    }

    // Check if single logout is requested
    const body = await request.json().catch(() => ({}))
    const { single_logout = false, organization_slug } = body

    if (single_logout && organization_slug) {
      // Get SAML SLO URL
      const { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', organization_slug)
        .single()

      if (organization) {
        const { data: ssoProvider } = await supabase
          .from('sso_providers')
          .select('saml_slo_url')
          .eq('organization_id', organization.id)
          .eq('provider_type', 'saml')
          .eq('status', 'active')
          .eq('is_default', true)
          .single()

        if (ssoProvider?.saml_slo_url) {
          return NextResponse.json({
            success: true,
            slo_url: ssoProvider.saml_slo_url,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SAML Logout] Error:', error)
    return NextResponse.json(
      {
        error: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error',
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
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Revoke all SSO sessions for user
      await supabase.rpc('revoke_user_sso_sessions', {
        p_user_id: user.id,
      })

      // Sign out from Supabase
      await supabase.auth.signOut()
    }

    // Check if single logout is requested
    const searchParams = request.nextUrl.searchParams
    const singleLogout = searchParams.get('single_logout') === 'true'
    const organizationSlug = searchParams.get('org')

    if (singleLogout && organizationSlug) {
      // Get SAML SLO URL
      const { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', organizationSlug)
        .single()

      if (organization) {
        const { data: ssoProvider } = await supabase
          .from('sso_providers')
          .select('saml_slo_url')
          .eq('organization_id', organization.id)
          .eq('provider_type', 'saml')
          .eq('status', 'active')
          .eq('is_default', true)
          .single()

        if (ssoProvider?.saml_slo_url) {
          // Redirect to IdP SLO endpoint
          return NextResponse.redirect(ssoProvider.saml_slo_url)
        }
      }
    }

    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  } catch (error) {
    console.error('[SAML Logout] Error:', error)
    return NextResponse.redirect(new URL('/login?error=logout_failed', request.url))
  }
}
