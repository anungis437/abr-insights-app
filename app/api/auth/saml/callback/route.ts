/**
 * SAML SSO Assertion Consumer Service (ACS) Endpoint
 *
 * Receives and validates SAML assertions from IdP
 *
 * Flow:
 * 1. Receive SAML response from IdP (POST binding)
 * 2. Validate relay state
 * 3. Validate SAML assertion (signature, expiration, etc.)
 * 4. Extract user attributes from assertion
 * 5. Provision or link user account
 * 6. Create enterprise session
 * 7. Update Supabase auth session
 * 8. Log login attempt
 * 9. Redirect to dashboard
 *
 * Security:
 * - Validates SAML signature with X.509 certificate
 * - Validates assertion expiration and conditions
 * - Validates audience restriction
 * - Logs all attempts for audit trail
 *
 * @route /api/auth/saml/callback
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getSAMLService } from '@/lib/auth/saml'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  let organizationSlug = ''
  let samlService: Awaited<ReturnType<typeof getSAMLService>> | null = null
  const adminSupabase = createAdminClient()

  try {
    // Parse form data
    const formData = await request.formData()
    const samlResponse = formData.get('SAMLResponse') as string
    const relayState = formData.get('RelayState') as string

    if (!samlResponse) {
      return NextResponse.redirect(new URL('/login?error=missing_saml_response', request.url))
    }

    // Validate relay state
    const cookieStore = await cookies()
    const storedRelayState = cookieStore.get('saml_relay_state')?.value

    if (!storedRelayState || storedRelayState !== relayState) {
      console.error('[SAML Callback] Relay state mismatch')
      return NextResponse.redirect(new URL('/login?error=invalid_relay_state', request.url))
    }

    // Parse relay state
    const relayStateData = JSON.parse(relayState)
    organizationSlug = relayStateData.organizationSlug

    if (!organizationSlug) {
      return NextResponse.redirect(new URL('/login?error=missing_organization', request.url))
    }

    // Get SAML service
    samlService = await getSAMLService(organizationSlug)

    // Validate SAML response and extract attributes
    const attributes = await samlService.validateResponse(samlResponse, relayState)

    // Use admin client for org and provider lookup (user not authenticated yet)
    const { data: organization } = await adminSupabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationSlug)
      .single()

    if (!organization) {
      throw new Error(`Organization not found: ${organizationSlug}`)
    }

    // Get SSO provider ID
    const { data: ssoProvider } = await adminSupabase
      .from('sso_providers')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('provider_type', 'saml')
      .eq('status', 'active')
      .eq('is_default', true)
      .single()

    if (!ssoProvider) {
      throw new Error('SSO provider not found')
    }

    // Provision or link user
    const userId = await samlService.provisionUser(attributes, organization.id)

    // Create enterprise session
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await samlService.createSession({
      userId,
      organizationId: organization.id,
      ssoProviderId: ssoProvider.id,
      attributes,
      sessionIndex: relayStateData.sessionIndex,
      ipAddress,
      userAgent,
    })

    // Update Supabase auth user metadata
    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        sso_provider: 'saml',
        saml_name_id: attributes.nameID,
        organization_id: organization.id,
        organization_slug: organizationSlug,
        last_saml_login: new Date().toISOString(),
      },
    })

    // Log successful login attempt
    await samlService.logLoginAttempt(
      organization.id,
      ssoProvider.id,
      'success',
      attributes,
      userId,
      ipAddress,
      userAgent
    )

    // Clear relay state cookie
    cookieStore.delete('saml_relay_state')

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('[SAML Callback] Error:', error)

    // Log failed login attempt
    if (samlService && organizationSlug) {
      try {
        const { data: organization } = await adminSupabase
          .from('organizations')
          .select('id')
          .eq('slug', organizationSlug)
          .single()

        if (organization) {
          const { data: ssoProvider } = await adminSupabase
            .from('sso_providers')
            .select('id')
            .eq('organization_id', organization.id)
            .eq('provider_type', 'saml')
            .eq('status', 'active')
            .eq('is_default', true)
            .single()

          if (ssoProvider) {
            const ipAddress =
              request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              'unknown'
            const userAgent = request.headers.get('user-agent') || 'unknown'

            await samlService.logLoginAttempt(
              organization.id,
              ssoProvider.id,
              'error',
              undefined,
              undefined,
              ipAddress,
              userAgent,
              error instanceof Error ? error.message : 'Unknown error',
              'SAML_VALIDATION_ERROR'
            )
          }
        }
      } catch (logError) {
        console.error('[SAML Callback] Failed to log error:', logError)
      }
    }

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

// SAML IdP can also initiate login (IdP-initiated flow)
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/login?error=use_post_binding', request.url))
}
