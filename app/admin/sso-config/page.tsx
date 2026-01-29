'use client'

/**
 * SSO Configuration Admin Page
 * Route: /admin/sso-config
 * 
 * Features:
 * - SSO provider CRUD (Azure AD B2C, SAML 2.0)
 * - Test connection UI
 * - Domain restrictions
 * - Attribute mapping editor
 * - Provider status management
 * 
 * Uses new enterprise_sso_auth migration tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Settings,
  Key,
  Globe,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface SSOProvider {
  id: string
  organization_id: string
  organization_slug?: string
  name: string // Changed from provider_name
  slug: string
  provider_type: 'azure_ad_b2c' | 'saml' | 'oidc' | 'okta' | 'auth0' // Updated types
  azure_client_id?: string // Changed from client_id
  azure_client_secret?: string // Changed from client_secret
  azure_tenant_id?: string // Changed from tenant_id
  azure_policy_name?: string
  oidc_issuer_url?: string
  oidc_client_id?: string
  oidc_client_secret?: string
  oidc_authorization_endpoint?: string
  oidc_token_endpoint?: string
  oidc_userinfo_endpoint?: string
  oidc_jwks_uri?: string
  saml_entity_id?: string
  saml_sso_url?: string
  saml_slo_url?: string
  saml_certificate?: string
  saml_name_id_format?: string
  attribute_mapping: Record<string, string>
  auto_provision_users: boolean
  allowed_domains: string[]
  status: 'draft' | 'active' | 'inactive' | 'error' // Updated statuses
  is_default: boolean
  settings?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export default function SSOConfigPage() {
  const supabase = createClient()
  
  const [providers, setProviders] = useState<SSOProvider[]>([])
  const [organizations, setOrganizations] = useState<{ id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})

  // Form state
  const [formData, setFormData] = useState<Partial<SSOProvider>>({
    provider_type: 'azure_ad_b2c',
    name: '',
    slug: '',
    azure_client_id: '',
    azure_tenant_id: '',
    azure_policy_name: '',
    attribute_mapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      displayName: 'name',
    },
    auto_provision_users: true,
    allowed_domains: [],
    status: 'draft',
    is_default: false,
  })
  const [domainInput, setDomainInput] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get current user's organization
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }
      
      if (!user) {
        console.warn('No authenticated user found')
        throw new Error('Not authenticated')
      }

      console.log('Current user:', { id: user.id, email: user.email })

      // Check user's profile and organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, organization_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
      } else {
        console.log('User profile:', profile)
      }

      // Get organizations (for super admins)
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name')

      if (orgsError) {
        console.error('Error loading organizations:', {
          message: orgsError.message,
          details: orgsError.details,
          hint: orgsError.hint,
          code: orgsError.code
        })
      } else {
        console.log('Organizations loaded:', orgs?.length || 0)
      }

      setOrganizations(orgs || [])

      // Get SSO providers
      console.log('Attempting to load SSO providers...')
      const { data: ssoData, error: ssoError } = await supabase
        .from('sso_providers')
        .select(`
          *,
          organizations (
            slug
          )
        `)
        .order('created_at', { ascending: false })

      if (ssoError) {
        // Log the full error object to see its structure
        console.error('Error loading SSO providers (full object):', ssoError)
        console.error('Error loading SSO providers (stringified):', JSON.stringify(ssoError, null, 2))
        console.error('Error loading SSO providers (structured):', {
          message: ssoError.message,
          details: ssoError.details,
          hint: ssoError.hint,
          code: ssoError.code,
          statusCode: (ssoError as any).statusCode,
          status: (ssoError as any).status
        })
        
        // Log all enumerable properties
        console.error('Error keys:', Object.keys(ssoError))
        console.error('Error entries:', Object.entries(ssoError))
        
        // If it's a permission error, show helpful message
        if (ssoError.code === 'PGRST116' || ssoError.message?.includes('permission') || ssoError.message?.includes('policy')) {
          console.warn('⚠️  Permission denied accessing SSO providers.')
          console.warn('This user may need:')
          console.warn('  - An admin or super_admin role')
          console.warn('  - To be assigned to an organization')
          console.warn('  - Proper RLS policies to be enabled')
        }
        
        // Don't throw, just log and continue with empty array
        setProviders([])
        setLoading(false)
        return
      }

      console.log('SSO providers loaded:', ssoData?.length || 0)
      // Flatten organization slug
      const flattenedData = ssoData?.map((provider: any) => ({
        ...provider,
        organization_slug: (provider.organizations as unknown as { slug: string })?.slug,
        organizations: undefined,
      })) as SSOProvider[]

      setProviders(flattenedData || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = (error as any)?.details
      const errorCode = (error as any)?.code
      const errorHint = (error as any)?.hint
      
      console.error('Error loading data:', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        hint: errorHint,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSave() {
    try {
      if (selectedProvider) {
        // Update existing
        const updateData: any = {
          name: formData.name,
          slug: formData.slug,
          attribute_mapping: formData.attribute_mapping,
          auto_provision_users: formData.auto_provision_users,
          allowed_domains: formData.allowed_domains,
          status: formData.status,
          is_default: formData.is_default,
        }

        // Add provider-specific fields
        if (formData.provider_type === 'azure_ad_b2c') {
          updateData.azure_tenant_id = formData.azure_tenant_id
          updateData.azure_client_id = formData.azure_client_id
          updateData.azure_policy_name = formData.azure_policy_name
          if (formData.azure_client_secret) {
            updateData.azure_client_secret = formData.azure_client_secret
          }
        } else if (formData.provider_type === 'saml') {
          updateData.saml_entity_id = formData.saml_entity_id
          updateData.saml_sso_url = formData.saml_sso_url
          updateData.saml_slo_url = formData.saml_slo_url
          updateData.saml_certificate = formData.saml_certificate
          updateData.saml_name_id_format = formData.saml_name_id_format
        } else if (formData.provider_type?.startsWith('oidc')) {
          updateData.oidc_issuer_url = formData.oidc_issuer_url
          updateData.oidc_client_id = formData.oidc_client_id
          if (formData.oidc_client_secret) {
            updateData.oidc_client_secret = formData.oidc_client_secret
          }
        }

        const { error } = await supabase
          .from('sso_providers')
          .update(updateData)
          .eq('id', selectedProvider.id)

        if (error) throw error
      } else {
        // Create new
        const insertData: any = {
          organization_id: formData.organization_id,
          provider_type: formData.provider_type,
          name: formData.name,
          slug: formData.slug,
          attribute_mapping: formData.attribute_mapping,
          auto_provision_users: formData.auto_provision_users,
          allowed_domains: formData.allowed_domains,
          status: formData.status,
          is_default: formData.is_default,
        }

        // Add provider-specific fields
        if (formData.provider_type === 'azure_ad_b2c') {
          insertData.azure_tenant_id = formData.azure_tenant_id
          insertData.azure_client_id = formData.azure_client_id
          insertData.azure_client_secret = formData.azure_client_secret
          insertData.azure_policy_name = formData.azure_policy_name
        } else if (formData.provider_type === 'saml') {
          insertData.saml_entity_id = formData.saml_entity_id
          insertData.saml_sso_url = formData.saml_sso_url
          insertData.saml_slo_url = formData.saml_slo_url
          insertData.saml_certificate = formData.saml_certificate
          insertData.saml_name_id_format = formData.saml_name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
        } else if (formData.provider_type?.startsWith('oidc')) {
          insertData.oidc_issuer_url = formData.oidc_issuer_url
          insertData.oidc_client_id = formData.oidc_client_id
          insertData.oidc_client_secret = formData.oidc_client_secret
        }

        const { error } = await supabase.from('sso_providers').insert(insertData)

        if (error) throw error
      }

      await loadData()
      setShowAddModal(false)
      setSelectedProvider(null)
      resetForm()
    } catch (error) {
      console.error('Error saving provider:', error)
      alert('Failed to save SSO provider')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this SSO provider? This cannot be undone.')) return

    try {
      const { error } = await supabase.from('sso_providers').delete().eq('id', id)

      if (error) throw error

      await loadData()
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert('Failed to delete SSO provider')
    }
  }

  async function handleTest(provider: SSOProvider) {
    setTestingProvider(provider.id)
    try {
      // Generate test login URL
      const baseUrl = window.location.origin
      const loginUrl = provider.provider_type === 'azure_ad_b2c'
        ? `${baseUrl}/api/auth/azure/login?org=${provider.organization_slug}`
        : `${baseUrl}/api/auth/saml/login?org=${provider.organization_slug}`

      // Open in new window
      window.open(loginUrl, '_blank', 'width=800,height=600')
      
      setTimeout(() => setTestingProvider(null), 2000)
    } catch (error) {
      console.error('Error testing provider:', error)
      alert('Failed to initiate test')
      setTestingProvider(null)
    }
  }

  function resetForm() {
    setFormData({
      provider_type: 'azure_ad_b2c',
      name: '',
      slug: '',
      azure_client_id: '',
      azure_tenant_id: '',
      azure_policy_name: '',
      attribute_mapping: {
        email: 'email',
        firstName: 'given_name',
        lastName: 'family_name',
        displayName: 'name',
      },
      auto_provision_users: true,
      allowed_domains: [],
      status: 'draft',
      is_default: false,
    })
    setDomainInput('')
  }

  function handleAddDomain() {
    if (domainInput && !formData.allowed_domains?.includes(domainInput)) {
      setFormData({
        ...formData,
        allowed_domains: [...(formData.allowed_domains || []), domainInput],
      })
      setDomainInput('')
    }
  }

  function handleRemoveDomain(domain: string) {
    setFormData({
      ...formData,
      allowed_domains: formData.allowed_domains?.filter((d) => d !== domain) || [],
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container-custom pt-20 pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SSO Configuration</h1>
          <p className="mt-2 text-gray-600">
            Manage enterprise SSO providers (Azure AD B2C, SAML 2.0)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setSelectedProvider(null)
            setShowAddModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SSO Providers</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first SSO provider</p>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="btn-primary"
            >
              Add Provider
            </button>
          </div>
        ) : (
          providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                    {provider.is_default && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        provider.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : provider.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : provider.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {provider.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {provider.provider_type === 'azure_ad_b2c' ? 'Azure AD B2C' : 
                         provider.provider_type === 'saml' ? 'SAML 2.0' :
                         provider.provider_type === 'oidc' ? 'OpenID Connect' :
                         provider.provider_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Organization:</span>
                      <span className="ml-2 font-medium text-gray-900">{provider.organization_slug}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Auto-provision:</span>
                      <span className="ml-2">
                        {provider.auto_provision_users ? (
                          <CheckCircle className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 inline" />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Allowed Domains:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {provider.allowed_domains.length > 0
                          ? provider.allowed_domains.join(', ')
                          : 'All'}
                      </span>
                    </div>
                  </div>

                  {provider.provider_type === 'azure_ad_b2c' && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                      <div className="text-gray-500 mb-1">Redirect URI:</div>
                      <code className="text-gray-900 text-xs">
                        {window.location.origin}/api/auth/azure/callback
                      </code>
                    </div>
                  )}

                  {provider.provider_type === 'saml' && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                      <div className="text-gray-500 mb-1">Metadata URL:</div>
                      <code className="text-gray-900 text-xs">
                        {window.location.origin}/api/auth/saml/metadata?org={provider.organization_slug}
                      </code>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTest(provider)}
                    disabled={testingProvider === provider.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Test Connection"
                  >
                    {testingProvider === provider.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProvider(provider)
                      setFormData(provider)
                      setShowAddModal(true)
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProvider ? 'Edit SSO Provider' : 'Add SSO Provider'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Provider Type */}
              {!selectedProvider && (
                <div>
                  <label htmlFor="provider-type" className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Type
                  </label>
                  <select
                    id="provider-type"
                    value={formData.provider_type}
                    onChange={(e) =>
                      setFormData({ ...formData, provider_type: e.target.value as 'azure_ad_b2c' | 'saml' | 'oidc' | 'okta' | 'auth0' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="azure_ad_b2c">Azure AD B2C</option>
                    <option value="saml">SAML 2.0</option>
                    <option value="oidc">OpenID Connect</option>
                    <option value="okta">Okta</option>
                    <option value="auth0">Auth0</option>
                  </select>
                </div>
              )}

              {/* Organization */}
              {!selectedProvider && (
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <select
                    id="organization"
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select organization...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Provider Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Toronto Police Azure AD"
                  required
                />
              </div>

              {/* Provider Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., toronto-police-azure"
                  required
                />
              </div>

              {/* Azure AD Fields */}
              {formData.provider_type === 'azure_ad_b2c' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID / Application ID
                    </label>
                    <input
                      type="text"
                      value={formData.azure_client_id || ''}
                      onChange={(e) => setFormData({ ...formData, azure_client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00000000-0000-0000-0000-000000000000"
                      required
                    />
                  </div>

                  {!selectedProvider && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret[formData.name || 'new'] ? 'text' : 'password'}
                          value={formData.azure_client_secret || ''}
                          onChange={(e) => setFormData({ ...formData, azure_client_secret: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Client secret value"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecret({
                              ...showSecret,
                              [formData.name || 'new']: !showSecret[formData.name || 'new'],
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecret[formData.name || 'new'] ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      value={formData.azure_tenant_id || ''}
                      onChange={(e) => setFormData({ ...formData, azure_tenant_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contoso.onmicrosoft.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Name (User Flow)
                    </label>
                    <input
                      type="text"
                      value={formData.azure_policy_name || ''}
                      onChange={(e) => setFormData({ ...formData, azure_policy_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="B2C_1_signupsignin"
                    />
                  </div>
                </>
              )}

              {/* SAML Fields */}
              {formData.provider_type === 'saml' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity ID (SP)
                    </label>
                    <input
                      type="text"
                      value={formData.saml_entity_id}
                      onChange={(e) => setFormData({ ...formData, saml_entity_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://abr-insights.com/saml"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SSO URL (IdP)
                    </label>
                    <input
                      type="url"
                      value={formData.saml_sso_url}
                      onChange={(e) => setFormData({ ...formData, saml_sso_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://idp.example.com/sso"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X.509 Certificate (IdP)
                    </label>
                    <textarea
                      value={formData.saml_certificate}
                      onChange={(e) => setFormData({ ...formData, saml_certificate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                      rows={6}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      required
                    />
                  </div>
                </>
              )}

              {/* Allowed Domains */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Email Domains (optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example.com"
                  />
                  <button
                    type="button"
                    onClick={handleAddDomain}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allowed_domains?.map((domain) => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="hover:text-blue-900"
                        aria-label={`Remove domain ${domain}`}
                        title={`Remove domain ${domain}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Auto-provision */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-provision"
                  checked={formData.auto_provision_users}
                  onChange={(e) =>
                    setFormData({ ...formData, auto_provision_users: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto-provision" className="text-sm text-gray-700">
                  Automatically provision new users
                </label>
              </div>

              {/* Default provider */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is-default" className="text-sm text-gray-700">
                  Set as default provider for organization
                </label>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="sso-status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  id="sso-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'draft' | 'active' | 'inactive' | 'error' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedProvider(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.azure_client_id}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedProvider ? 'Save Changes' : 'Add Provider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
