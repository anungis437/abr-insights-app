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

import { useState, useEffect } from 'react'
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
  provider_type: 'azure_ad' | 'saml' | 'oidc'
  provider_name: string
  client_id: string
  client_secret?: string
  tenant_id?: string
  authority_url?: string
  saml_entity_id?: string
  saml_sso_url?: string
  saml_slo_url?: string
  saml_certificate?: string
  saml_name_id_format?: string
  attribute_mapping: Record<string, string>
  auto_provision_users: boolean
  allowed_domains: string[]
  status: 'active' | 'inactive' | 'testing'
  is_default: boolean
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
    provider_type: 'azure_ad',
    provider_name: '',
    client_id: '',
    tenant_id: '',
    attribute_mapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      displayName: 'name',
    },
    auto_provision_users: true,
    allowed_domains: [],
    status: 'testing',
    is_default: false,
  })
  const [domainInput, setDomainInput] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get organizations (for super admins)
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name')

      setOrganizations(orgs || [])

      // Get SSO providers
      const { data: ssoData, error: ssoError } = await supabase
        .from('sso_providers')
        .select(`
          *,
          organizations (
            slug
          )
        `)
        .order('created_at', { ascending: false })

      if (ssoError) throw ssoError

      // Flatten organization slug
      const flattenedData = ssoData?.map((provider) => ({
        ...provider,
        organization_slug: (provider.organizations as unknown as { slug: string })?.slug,
        organizations: undefined,
      })) as SSOProvider[]

      setProviders(flattenedData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (selectedProvider) {
        // Update existing
        const { error } = await supabase
          .from('sso_providers')
          .update({
            provider_name: formData.provider_name,
            client_id: formData.client_id,
            tenant_id: formData.tenant_id,
            authority_url: formData.authority_url,
            saml_entity_id: formData.saml_entity_id,
            saml_sso_url: formData.saml_sso_url,
            saml_slo_url: formData.saml_slo_url,
            saml_certificate: formData.saml_certificate,
            saml_name_id_format: formData.saml_name_id_format,
            attribute_mapping: formData.attribute_mapping,
            auto_provision_users: formData.auto_provision_users,
            allowed_domains: formData.allowed_domains,
            status: formData.status,
            is_default: formData.is_default,
          })
          .eq('id', selectedProvider.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase.from('sso_providers').insert({
          organization_id: formData.organization_id,
          provider_type: formData.provider_type,
          provider_name: formData.provider_name,
          client_id: formData.client_id,
          client_secret: formData.client_secret,
          tenant_id: formData.tenant_id,
          authority_url: formData.authority_url,
          saml_entity_id: formData.saml_entity_id,
          saml_sso_url: formData.saml_sso_url,
          saml_slo_url: formData.saml_slo_url,
          saml_certificate: formData.saml_certificate,
          saml_name_id_format: formData.saml_name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          attribute_mapping: formData.attribute_mapping,
          auto_provision_users: formData.auto_provision_users,
          allowed_domains: formData.allowed_domains,
          status: formData.status,
          is_default: formData.is_default,
        })

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
      const loginUrl = provider.provider_type === 'azure_ad'
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
      provider_type: 'azure_ad',
      provider_name: '',
      client_id: '',
      tenant_id: '',
      attribute_mapping: {
        email: 'email',
        firstName: 'given_name',
        lastName: 'family_name',
        displayName: 'name',
      },
      auto_provision_users: true,
      allowed_domains: [],
      status: 'testing',
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
                    <h3 className="text-lg font-semibold text-gray-900">{provider.provider_name}</h3>
                    {provider.is_default && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        provider.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : provider.status === 'testing'
                            ? 'bg-yellow-100 text-yellow-700'
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
                        {provider.provider_type === 'azure_ad' ? 'Azure AD B2C' : 'SAML 2.0'}
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

                  {provider.provider_type === 'azure_ad' && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Type
                  </label>
                  <select
                    value={formData.provider_type}
                    onChange={(e) =>
                      setFormData({ ...formData, provider_type: e.target.value as 'azure_ad' | 'saml' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="azure_ad">Azure AD B2C</option>
                    <option value="saml">SAML 2.0</option>
                  </select>
                </div>
              )}

              {/* Organization */}
              {!selectedProvider && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <select
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
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Toronto Police Azure AD"
                  required
                />
              </div>

              {/* Azure AD Fields */}
              {formData.provider_type === 'azure_ad' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID / Application ID
                    </label>
                    <input
                      type="text"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
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
                          type={showSecret[formData.provider_name || 'new'] ? 'text' : 'password'}
                          value={formData.client_secret || ''}
                          onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Client secret value"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecret({
                              ...showSecret,
                              [formData.provider_name || 'new']: !showSecret[formData.provider_name || 'new'],
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecret[formData.provider_name || 'new'] ? (
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
                      value={formData.tenant_id}
                      onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contoso.onmicrosoft.com"
                      required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'testing' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="testing">Testing</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                disabled={!formData.provider_name || !formData.client_id}
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
