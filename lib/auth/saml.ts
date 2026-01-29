/**
 * SAML 2.0 SSO Service
 *
 * Enterprise-grade SAML 2.0 integration with multi-tenant support
 *
 * Features:
 * - SAML 2.0 authentication flows (IdP-initiated and SP-initiated)
 * - Assertion validation and signature verification
 * - User auto-provisioning with attribute mapping
 * - Session management
 * - Multi-tenant SAML configuration support
 * - Metadata generation for Service Provider
 *
 * @module lib/auth/saml
 */

import { SAML, type SamlConfig, type Profile as SamlProfile } from '@node-saml/node-saml'
import { createClient } from '@/lib/supabase/server'

// Types for SAML user attributes
interface SAMLUserAttributes {
  nameID: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  [key: string]: unknown
}

// Types for SSO provider config
interface SAMLProviderConfig {
  id: string
  organization_id: string
  saml_entity_id: string
  saml_sso_url: string
  saml_slo_url?: string
  saml_certificate: string
  saml_name_id_format: string
  attribute_mapping: Record<string, string>
  auto_provision_users: boolean
  allowed_domains?: string[]
}

// Types for session creation
interface SessionParams {
  userId: string
  organizationId: string
  ssoProviderId: string
  attributes: SAMLUserAttributes
  sessionIndex?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * SAML 2.0 Service
 * Handles SAML authentication, assertion validation, and user provisioning
 */
export class SAMLService {
  private samlClient: SAML | null = null
  private config: SAMLProviderConfig | null = null

  /**
   * Initialize SAML client with SSO provider configuration
   */
  async initialize(ssoProviderId: string): Promise<void> {
    const supabase = await createClient()

    // Fetch SSO provider configuration
    const { data: ssoProvider, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('id', ssoProviderId)
      .eq('provider_type', 'saml')
      .eq('status', 'active')
      .single()

    if (error || !ssoProvider) {
      throw new Error(`SSO provider not found or inactive: ${ssoProviderId}`)
    }

    this.config = ssoProvider as unknown as SAMLProviderConfig

    // Get callback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/auth/saml/callback`

    // SAML configuration
    const samlConfig: SamlConfig = {
      // Service Provider (our app)
      issuer: this.config.saml_entity_id,
      callbackUrl,

      // Identity Provider (customer's SAML IdP)
      entryPoint: this.config.saml_sso_url,
      idpCert: this.config.saml_certificate,

      // Logout
      logoutUrl: this.config.saml_slo_url,
      logoutCallbackUrl: `${baseUrl}/api/auth/saml/logout`,

      // Name ID format
      identifierFormat: this.config.saml_name_id_format,

      // Security
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: true,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256',

      // Attribute consumption
      acceptedClockSkewMs: 300000, // 5 minutes

      // Request ID validation settings
      requestIdExpirationPeriodMs: 28800000, // 8 hours
    }

    this.samlClient = new SAML(samlConfig)
  }

  /**
   * Generate SAML authentication request URL
   */
  async getAuthorizationUrl(additionalParams?: Record<string, string>): Promise<string> {
    if (!this.samlClient) {
      throw new Error('SAML service not initialized')
    }

    try {
      const url = await this.samlClient.getAuthorizeUrlAsync('', '', additionalParams || {})
      return url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(`Failed to generate SAML auth URL: ${message}`)
    }
  }

  /**
   * Generate Service Provider metadata XML
   */
  async generateMetadata(): Promise<string> {
    if (!this.samlClient) {
      throw new Error('SAML service not initialized')
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/auth/saml/callback`
    const logoutUrl = `${baseUrl}/api/auth/saml/logout`

    // Note: Metadata generation requires signing certificate which we don't have yet
    // For now, return basic metadata structure
    const metadata = `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                  entityID="${this.config!.saml_entity_id}">
  <SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true"
                   protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>${this.config!.saml_name_id_format}</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                              Location="${callbackUrl}"
                              index="1" />
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                         Location="${logoutUrl}" />
  </SPSSODescriptor>
</EntityDescriptor>`

    return metadata
  }

  /**
   * Validate SAML response and extract user profile
   */
  async validateResponse(samlResponse: string, relayState?: string): Promise<SAMLUserAttributes> {
    if (!this.samlClient) {
      throw new Error('SAML service not initialized')
    }

    try {
      const result = await this.samlClient.validatePostResponseAsync({ SAMLResponse: samlResponse })

      if (!result || !result.profile) {
        throw new Error('No profile returned from SAML assertion')
      }

      // Extract and map attributes
      const attributes = this.extractAttributes(result.profile)
      return attributes
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[SAML] Validation error:', err)
      throw new Error(`SAML assertion validation failed: ${message}`)
    }
  }

  /**
   * Extract user attributes from SAML profile
   */
  private extractAttributes(profile: SamlProfile): SAMLUserAttributes {
    if (!this.config) {
      throw new Error('SAML service not initialized')
    }

    const mapping = this.config.attribute_mapping || {}

    // Get NameID (required)
    const nameID = profile.nameID || profile.email || ''

    if (!nameID) {
      throw new Error('Missing NameID in SAML assertion')
    }

    // Map attributes using configured mapping
    const email = (profile[mapping.email || 'email'] || profile.email || nameID) as string
    const firstName = (profile[mapping.firstName || 'firstName'] ||
      profile.firstName ||
      profile.givenName) as string | undefined
    const lastName = (profile[mapping.lastName || 'lastName'] ||
      profile.lastName ||
      profile.surname) as string | undefined
    const displayName = (profile[mapping.displayName || 'displayName'] ||
      profile.displayName ||
      profile.name) as string | undefined

    return {
      email,
      firstName,
      lastName,
      displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim(),
      nameID: nameID, // Explicit assignment first to avoid spread override
    }
  }

  /**
   * Provision or update user in database
   */
  async provisionUser(attributes: SAMLUserAttributes, organizationId: string): Promise<string> {
    if (!this.config) {
      throw new Error('SAML service not initialized')
    }

    const supabase = await createClient()

    // Check allowed domains
    if (this.config.allowed_domains && this.config.allowed_domains.length > 0) {
      const emailDomain = attributes.email.split('@')[1]
      if (!this.config.allowed_domains.includes(emailDomain)) {
        throw new Error(`Email domain not allowed: ${emailDomain}`)
      }
    }

    // Check if user already has identity mapping
    const { data: existingMapping } = await supabase
      .from('identity_provider_mapping')
      .select('user_id')
      .eq('sso_provider_id', this.config.id)
      .eq('provider_user_id', attributes.nameID)
      .eq('link_status', 'active')
      .single()

    if (existingMapping) {
      // Update existing mapping
      await supabase
        .from('identity_provider_mapping')
        .update({
          provider_email: attributes.email,
          claims: attributes as unknown as Record<string, unknown>,
          last_login_at: new Date().toISOString(),
        })
        .eq('sso_provider_id', this.config.id)
        .eq('provider_user_id', attributes.nameID)

      return existingMapping.user_id
    }

    // Check if profile exists by email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', attributes.email)
      .eq('organization_id', organizationId)
      .single()

    if (existingProfile) {
      // Link existing profile to SSO provider
      await supabase.from('identity_provider_mapping').insert({
        user_id: existingProfile.id,
        sso_provider_id: this.config.id,
        provider_user_id: attributes.nameID,
        provider_email: attributes.email,
        claims: attributes as unknown as Record<string, unknown>,
        link_status: 'active',
        last_login_at: new Date().toISOString(),
        login_count: 1,
      })

      return existingProfile.id
    }

    // Auto-provision new user (if enabled)
    if (!this.config.auto_provision_users) {
      throw new Error('User does not exist and auto-provisioning is disabled')
    }

    // Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: attributes.email,
      email_confirm: true, // SAML users are pre-verified
      user_metadata: {
        first_name: attributes.firstName,
        last_name: attributes.lastName,
        display_name: attributes.displayName,
        sso_provider: 'saml',
        saml_name_id: attributes.nameID,
      },
    })

    if (authError || !authUser.user) {
      console.error('[SAML] User creation error:', authError)
      throw new Error('Failed to create user account')
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        organization_id: organizationId,
        email: attributes.email,
        first_name: attributes.firstName,
        last_name: attributes.lastName,
        display_name: attributes.displayName,
        email_verified: true,
        status: 'active',
        metadata: {
          sso_provider: 'saml',
          saml_name_id: attributes.nameID,
        },
      })
      .select()
      .single()

    if (profileError || !profile) {
      console.error('[SAML] Profile creation error:', profileError)
      throw new Error('Failed to create user profile')
    }

    // Create identity mapping
    await supabase.from('identity_provider_mapping').insert({
      user_id: profile.id,
      sso_provider_id: this.config.id,
      provider_user_id: attributes.nameID,
      provider_email: attributes.email,
      claims: attributes as unknown as Record<string, unknown>,
      link_status: 'active',
      last_login_at: new Date().toISOString(),
      login_count: 1,
    })

    // Assign default learner role
    const { data: learnerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('slug', 'learner')
      .single()

    if (learnerRole) {
      await supabase.from('user_roles').insert({
        user_id: profile.id,
        role_id: learnerRole.id,
        organization_id: organizationId,
        scope_type: 'global',
      })
    }

    return profile.id
  }

  /**
   * Create enterprise SSO session
   */
  async createSession(params: SessionParams): Promise<string> {
    const supabase = await createClient()

    // Default session expiration (8 hours)
    const expiresAt = new Date(Date.now() + 28800 * 1000)

    const { data: session, error } = await supabase
      .from('enterprise_sessions')
      .insert({
        user_id: params.userId,
        organization_id: params.organizationId,
        sso_provider_id: params.ssoProviderId,
        session_token: crypto.randomUUID(), // Generate session token
        sso_session_id: params.sessionIndex || params.attributes.nameID,
        claims: params.attributes as unknown as Record<string, unknown>,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error || !session) {
      console.error('[SAML] Session creation error:', error)
      throw new Error('Failed to create SSO session')
    }

    return session.id
  }

  /**
   * Log SAML login attempt
   */
  async logLoginAttempt(
    organizationId: string,
    ssoProviderId: string,
    status: 'success' | 'failed' | 'rejected' | 'error',
    attributes?: SAMLUserAttributes,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string,
    errorCode?: string
  ): Promise<void> {
    const supabase = await createClient()

    await supabase.from('sso_login_attempts').insert({
      organization_id: organizationId,
      sso_provider_id: ssoProviderId,
      user_id: userId,
      provider_user_id: attributes?.nameID,
      email: attributes?.email,
      status,
      failure_reason: failureReason,
      error_code: errorCode,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }
}

/**
 * Get or create SAML service instance for an organization
 */
export async function getSAMLService(organizationSlug: string): Promise<SAMLService> {
  const supabase = await createClient()

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', organizationSlug)
    .single()

  if (!organization) {
    throw new Error(`Organization not found: ${organizationSlug}`)
  }

  // Get active SAML provider for organization
  const { data: ssoProvider } = await supabase
    .from('sso_providers')
    .select('id')
    .eq('organization_id', organization.id)
    .eq('provider_type', 'saml')
    .eq('status', 'active')
    .eq('is_default', true)
    .single()

  if (!ssoProvider) {
    throw new Error(`No active SAML provider configured for organization: ${organizationSlug}`)
  }

  // Initialize service
  const service = new SAMLService()
  await service.initialize(ssoProvider.id)

  return service
}
