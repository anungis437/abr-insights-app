/**
 * SSO Service
 * Manages SSO provider configuration and enterprise sessions
 * Supports Azure AD B2C, SAML 2.0, OIDC
 */

import { createClient } from '@/lib/supabase/client'

export type ProviderType = 'azure_ad_b2c' | 'saml' | 'oidc' | 'okta' | 'auth0'
export type ProviderStatus = 'draft' | 'active' | 'inactive' | 'error'

export interface SSOProvider {
  id: string
  organization_id: string
  name: string
  slug: string
  provider_type: ProviderType
  status: ProviderStatus
  is_default: boolean
  // Azure AD B2C
  azure_tenant_id?: string
  azure_client_id?: string
  azure_client_secret?: string
  azure_policy_name?: string
  // SAML
  saml_entity_id?: string
  saml_sso_url?: string
  saml_slo_url?: string
  saml_certificate?: string
  saml_name_id_format?: string
  // OIDC
  oidc_issuer_url?: string
  oidc_client_id?: string
  oidc_client_secret?: string
  oidc_authorization_endpoint?: string
  oidc_token_endpoint?: string
  oidc_userinfo_endpoint?: string
  oidc_jwks_uri?: string
  // Settings
  attribute_mapping: Record<string, string>
  auto_provision_users: boolean
  require_email_verification: boolean
  allowed_domains?: string[]
  settings: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  last_sync_at?: string
  deleted_at?: string
}

export interface SSOProviderCreate {
  organization_id: string
  name: string
  slug: string
  provider_type: ProviderType
  azure_tenant_id?: string
  azure_client_id?: string
  azure_client_secret?: string
  azure_policy_name?: string
  saml_entity_id?: string
  saml_sso_url?: string
  saml_slo_url?: string
  saml_certificate?: string
  saml_name_id_format?: string
  oidc_issuer_url?: string
  oidc_client_id?: string
  oidc_client_secret?: string
  oidc_authorization_endpoint?: string
  oidc_token_endpoint?: string
  oidc_userinfo_endpoint?: string
  oidc_jwks_uri?: string
  attribute_mapping?: Record<string, string>
  auto_provision_users?: boolean
  require_email_verification?: boolean
  allowed_domains?: string[]
}

export interface EnterpriseSession {
  id: string
  user_id: string
  organization_id: string
  sso_provider_id?: string
  session_token: string
  sso_session_id?: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  last_activity_at?: string
  created_at: string
  revoked_at?: string
}

/**
 * Get all SSO providers for an organization
 */
export async function getOrgSSOProviders(organizationId: string): Promise<SSOProvider[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sso_providers')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single SSO provider by ID
 */
export async function getSSOProvider(providerId: string): Promise<SSOProvider | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sso_providers')
    .select('*')
    .eq('id', providerId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new SSO provider
 */
export async function createSSOProvider(provider: SSOProviderCreate): Promise<SSOProvider> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sso_providers')
    .insert({
      ...provider,
      status: 'draft',
      attribute_mapping: provider.attribute_mapping || {
        email: 'email',
        firstName: 'given_name',
        lastName: 'family_name',
        displayName: 'name',
      },
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update SSO provider
 */
export async function updateSSOProvider(
  providerId: string,
  updates: Partial<SSOProviderCreate>
): Promise<SSOProvider> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sso_providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update SSO provider status
 */
export async function updateSSOProviderStatus(
  providerId: string,
  status: ProviderStatus
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('sso_providers')
    .update({ status })
    .eq('id', providerId)

  if (error) throw error
}

/**
 * Set SSO provider as default
 */
export async function setDefaultSSOProvider(
  organizationId: string,
  providerId: string
): Promise<void> {
  const supabase = createClient()

  // Unset all defaults for the org
  await supabase
    .from('sso_providers')
    .update({ is_default: false })
    .eq('organization_id', organizationId)

  // Set new default
  const { error } = await supabase
    .from('sso_providers')
    .update({ is_default: true })
    .eq('id', providerId)

  if (error) throw error
}

/**
 * Delete (soft delete) SSO provider
 */
export async function deleteSSOProvider(providerId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('sso_providers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', providerId)

  if (error) throw error
}

/**
 * Get active enterprise sessions for an organization
 */
export async function getActiveSessions(organizationId: string): Promise<EnterpriseSession[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('enterprise_sessions')
    .select('*')
    .eq('organization_id', organizationId)
    .is('revoked_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('last_activity_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Revoke enterprise session
 */
export async function revokeSession(sessionId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('enterprise_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw error
}

/**
 * Get SSO login attempts (audit trail)
 */
export async function getSSOLoginAttempts(
  organizationId: string,
  limit = 50
): Promise<any[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sso_login_attempts')
    .select('*')
    .eq('organization_id', organizationId)
    .order('attempted_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Test SSO connection (validate configuration)
 */
export async function testSSOConnection(providerId: string): Promise<{
  success: boolean
  message: string
  details?: unknown
}> {
  try {
    const supabase = createClient()

    // Call edge function to test connection
    const { data, error } = await supabase.functions.invoke('test-sso-connection', {
      body: { providerId },
    })

    if (error) throw error

    return {
      success: true,
      message: 'SSO connection test successful',
      details: data,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed',
    }
  }
}
