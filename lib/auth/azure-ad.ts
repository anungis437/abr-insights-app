/**
 * Azure AD B2C SSO Service
 *
 * Enterprise-grade Azure AD B2C integration with multi-tenant support
 *
 * Features:
 * - Azure AD B2C authentication flows
 * - Token validation and refresh
 * - User auto-provisioning
 * - Session management
 * - Multi-tenant configuration support
 *
 * @module lib/auth/azure-ad
 */

import {
  ConfidentialClientApplication,
  type Configuration,
  type AuthorizationCodeRequest,
  type AuthorizationUrlRequest,
  type AuthenticationResult,
} from '@azure/msal-node'
import * as jwt from 'jsonwebtoken'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/production-logger'

// Types for Azure AD user info
interface AzureADUserInfo {
  oid: string // Object ID (unique user ID in Azure AD)
  email: string
  name?: string
  given_name?: string
  family_name?: string
  preferred_username?: string
  [key: string]: unknown
}

// Types for SSO provider config
interface SSOProviderConfig {
  id: string
  organization_id: string
  azure_tenant_id: string
  azure_client_id: string
  azure_client_secret: string
  azure_policy_name?: string
  attribute_mapping: Record<string, string>
  auto_provision_users: boolean
  allowed_domains?: string[]
}

// Types for session creation
interface SessionParams {
  userId: string
  organizationId: string
  ssoProviderId: string
  tokenResponse: AuthenticationResult
  claims: AzureADUserInfo
  ipAddress?: string
  userAgent?: string
}

/**
 * Azure AD B2C Service
 * Handles authentication, token validation, and user provisioning
 */
export class AzureADService {
  private msalClient: ConfidentialClientApplication | null = null
  private config: SSOProviderConfig | null = null

  /**
   * Initialize MSAL client with SSO provider configuration
   */
  async initialize(ssoProviderId: string): Promise<void> {
    const supabase = await createClient()

    // Fetch SSO provider configuration
    const { data: ssoProvider, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('id', ssoProviderId)
      .eq('provider_type', 'azure_ad_b2c')
      .eq('status', 'active')
      .single()

    if (error || !ssoProvider) {
      throw new Error(`SSO provider not found or inactive: ${ssoProviderId}`)
    }

    this.config = ssoProvider as unknown as SSOProviderConfig

    // Build authority URL
    const authority = this.buildAuthorityUrl(
      this.config.azure_tenant_id,
      this.config.azure_policy_name
    )

    // MSAL configuration
    const msalConfig: Configuration = {
      auth: {
        clientId: this.config.azure_client_id,
        authority,
        clientSecret: this.config.azure_client_secret,
        knownAuthorities: [`${this.config.azure_tenant_id}.b2clogin.com`],
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (containsPii) return
            logger.debug(`[MSAL] ${level}: ${message}`)
          },
          piiLoggingEnabled: false,
          logLevel: process.env.NODE_ENV === 'production' ? 3 : 2, // Error in prod, Verbose in dev
        },
      },
    }

    this.msalClient = new ConfidentialClientApplication(msalConfig)
  }

  /**
   * Build Azure AD B2C authority URL
   */
  private buildAuthorityUrl(tenantId: string, policyName?: string): string {
    const policy = policyName || 'B2C_1_signupsignin1' // Default policy
    return `https://${tenantId}.b2clogin.com/${tenantId}.onmicrosoft.com/${policy}`
  }

  /**
   * Get authorization URL for login redirect
   */
  async getAuthorizationUrl(
    redirectUri: string,
    state: string,
    organizationSlug?: string
  ): Promise<string> {
    if (!this.msalClient) {
      throw new Error('Azure AD service not initialized')
    }

    const authCodeUrlParameters: AuthorizationUrlRequest = {
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
      state: state + (organizationSlug ? `|${organizationSlug}` : ''),
      prompt: 'select_account',
    }

    return await this.msalClient.getAuthCodeUrl(authCodeUrlParameters)
  }

  /**
   * Exchange authorization code for tokens
   */
  async acquireTokenByCode(code: string, redirectUri: string): Promise<AuthenticationResult> {
    if (!this.msalClient) {
      throw new Error('Azure AD service not initialized')
    }

    const tokenRequest: AuthorizationCodeRequest = {
      code,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
    }

    try {
      const response = await this.msalClient.acquireTokenByCode(tokenRequest)
      return response
    } catch (error) {
      logger.error('Azure AD token acquisition failed', { error, redirectUri })
      throw new Error('Failed to acquire access token from Azure AD')
    }
  }

  /**
   * Validate and decode ID token
   */
  validateIdToken(idToken: string): AzureADUserInfo {
    try {
      // Decode without verification (MSAL already verified it)
      const decoded = jwt.decode(idToken) as AzureADUserInfo

      if (!decoded || !decoded.oid || !decoded.email) {
        throw new Error('Invalid token: missing required claims')
      }

      return decoded
    } catch (error) {
      logger.error('Azure AD token validation failed', { error })
      throw new Error('Failed to validate ID token')
    }
  }

  /**
   * Provision or update user in database
   */
  async provisionUser(claims: AzureADUserInfo, organizationId: string): Promise<string> {
    if (!this.config) {
      throw new Error('Azure AD service not initialized')
    }

    const supabase = await createClient()

    // Check allowed domains
    if (this.config.allowed_domains && this.config.allowed_domains.length > 0) {
      const emailDomain = claims.email.split('@')[1]
      if (!this.config.allowed_domains.includes(emailDomain)) {
        throw new Error(`Email domain not allowed: ${emailDomain}`)
      }
    }

    // Check if user already has identity mapping
    const { data: existingMapping } = await supabase
      .from('identity_provider_mapping')
      .select('user_id')
      .eq('sso_provider_id', this.config.id)
      .eq('provider_user_id', claims.oid)
      .eq('link_status', 'active')
      .single()

    if (existingMapping) {
      // Update existing mapping
      await supabase
        .from('identity_provider_mapping')
        .update({
          provider_email: claims.email,
          claims: claims as unknown as Record<string, unknown>,
          last_login_at: new Date().toISOString(),
          login_count: supabase.rpc('increment', { row_id: existingMapping.user_id }),
        })
        .eq('sso_provider_id', this.config.id)
        .eq('provider_user_id', claims.oid)

      return existingMapping.user_id
    }

    // Check if profile exists by email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', claims.email)
      .eq('organization_id', organizationId)
      .single()

    if (existingProfile) {
      // Link existing profile to SSO provider
      await supabase.from('identity_provider_mapping').insert({
        user_id: existingProfile.id,
        sso_provider_id: this.config.id,
        provider_user_id: claims.oid,
        provider_email: claims.email,
        claims: claims as unknown as Record<string, unknown>,
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

    // Map attributes using attribute_mapping
    const mapping = this.config.attribute_mapping || {}
    const firstName = (claims[mapping.firstName || 'given_name'] as string) || claims.given_name
    const lastName = (claims[mapping.lastName || 'family_name'] as string) || claims.family_name
    const displayName =
      (claims[mapping.displayName || 'name'] as string) ||
      claims.name ||
      `${firstName} ${lastName}`.trim()

    // Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: claims.email,
      email_confirm: true, // SSO users are pre-verified
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        sso_provider: 'azure_ad_b2c',
        azure_oid: claims.oid,
      },
    })

    if (authError || !authUser.user) {
      logger.error('Azure AD user creation failed', { error: authError, email: claims.email })
      throw new Error('Failed to create user account')
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        organization_id: organizationId,
        email: claims.email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        email_verified: true,
        status: 'active',
        metadata: {
          sso_provider: 'azure_ad_b2c',
          azure_oid: claims.oid,
        },
      })
      .select()
      .single()

    if (profileError || !profile) {
      logger.error('Azure AD profile creation failed', {
        error: profileError,
        email: claims.email,
        organizationId,
      })
      throw new Error('Failed to create user profile')
    }

    // Create identity mapping
    await supabase.from('identity_provider_mapping').insert({
      user_id: profile.id,
      sso_provider_id: this.config.id,
      provider_user_id: claims.oid,
      provider_email: claims.email,
      provider_username: claims.preferred_username,
      claims: claims as unknown as Record<string, unknown>,
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

    // Calculate expiration (from token expiry or default 1 hour)
    const expiresAt = params.tokenResponse.expiresOn || new Date(Date.now() + 3600 * 1000)

    const { data: session, error } = await supabase
      .from('enterprise_sessions')
      .insert({
        user_id: params.userId,
        organization_id: params.organizationId,
        sso_provider_id: params.ssoProviderId,
        session_token: params.tokenResponse.accessToken,
        refresh_token: params.tokenResponse.account?.homeAccountId || null,
        id_token: params.tokenResponse.idToken,
        sso_session_id: params.claims.oid,
        claims: params.claims as unknown as Record<string, unknown>,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error || !session) {
      logger.error('Azure AD session creation failed', {
        error,
        user_id: params.userId,
        org_id: params.organizationId,
      })
      throw new Error('Failed to create SSO session')
    }

    return session.id
  }

  /**
   * Log SSO login attempt
   */
  async logLoginAttempt(
    organizationId: string,
    ssoProviderId: string,
    status: 'success' | 'failed' | 'rejected' | 'error',
    claims?: AzureADUserInfo,
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
      provider_user_id: claims?.oid,
      email: claims?.email,
      status,
      failure_reason: failureReason,
      error_code: errorCode,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }
}

/**
 * Get or create Azure AD service instance for an organization
 */
export async function getAzureADService(organizationSlug: string): Promise<AzureADService> {
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

  // Get active Azure AD provider for organization
  const { data: ssoProvider } = await supabase
    .from('sso_providers')
    .select('id')
    .eq('organization_id', organization.id)
    .eq('provider_type', 'azure_ad_b2c')
    .eq('status', 'active')
    .eq('is_default', true)
    .single()

  if (!ssoProvider) {
    throw new Error(
      `No active Azure AD B2C provider configured for organization: ${organizationSlug}`
    )
  }

  // Initialize service
  const service = new AzureADService()
  await service.initialize(ssoProvider.id)

  return service
}
