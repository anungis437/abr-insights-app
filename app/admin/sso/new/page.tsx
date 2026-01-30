'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createSSOProvider,
  type SSOProviderCreate,
  type ProviderType,
} from '@/lib/services/sso'
import { Shield, ArrowLeft, Save, AlertCircle } from 'lucide-react'

export default function NewSSOProviderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  const [formData, setFormData] = useState<SSOProviderCreate>({
    organization_id: '',
    name: '',
    slug: '',
    provider_type: 'azure_ad_b2c',
    auto_provision_users: true,
    require_email_verification: false,
    attribute_mapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      displayName: 'name',
    },
  })

  useEffect(() => {
    async function loadOrgData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single()

      if (!profile?.organizations?.id) {
        router.push('/dashboard')
        return
      }

      setOrganizationId(profile.organizations.id)
      setFormData((prev) => ({
        ...prev,
        organization_id: profile.organizations.id,
      }))
      setIsLoading(false)
    }

    loadOrgData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      // Validate required fields based on provider type
      if (formData.provider_type === 'azure_ad_b2c') {
        if (!formData.azure_tenant_id || !formData.azure_client_id || !formData.azure_client_secret) {
          throw new Error('Azure AD B2C requires Tenant ID, Client ID, and Client Secret')
        }
      } else if (formData.provider_type === 'saml') {
        if (!formData.saml_entity_id || !formData.saml_sso_url || !formData.saml_certificate) {
          throw new Error('SAML requires Entity ID, SSO URL, and Certificate')
        }
      } else if (formData.provider_type === 'oidc') {
        if (!formData.oidc_issuer_url || !formData.oidc_client_id || !formData.oidc_client_secret) {
          throw new Error('OIDC requires Issuer URL, Client ID, and Client Secret')
        }
      }

      await createSSOProvider(formData)
      router.push('/admin/sso')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SSO provider')
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/sso')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to SSO Providers
          </button>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Add SSO Provider</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Configure a new single sign-on provider for your organization
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Error</h3>
                <p className="mt-1 text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Provider Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    updateFormData('name', e.target.value)
                    if (!formData.slug) {
                      updateFormData('slug', generateSlug(e.target.value))
                    }
                  }}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Acme Corp Azure AD"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., acme-azure-ad"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used in SSO login URLs. Lowercase letters, numbers, and hyphens only.
                </p>
              </div>

              <div>
                <label htmlFor="provider_type" className="block text-sm font-medium text-gray-700">
                  Provider Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="provider_type"
                  value={formData.provider_type}
                  onChange={(e) => updateFormData('provider_type', e.target.value as ProviderType)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="azure_ad_b2c">Azure AD B2C</option>
                  <option value="saml">SAML 2.0</option>
                  <option value="oidc">OpenID Connect</option>
                  <option value="okta">Okta</option>
                  <option value="auth0">Auth0</option>
                </select>
              </div>
            </div>
          </div>

          {/* Azure AD B2C Configuration */}
          {formData.provider_type === 'azure_ad_b2c' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Azure AD B2C Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="azure_tenant_id" className="block text-sm font-medium text-gray-700">
                    Tenant ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="azure_tenant_id"
                    value={formData.azure_tenant_id || ''}
                    onChange={(e) => updateFormData('azure_tenant_id', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., contoso.onmicrosoft.com"
                  />
                </div>

                <div>
                  <label htmlFor="azure_client_id" className="block text-sm font-medium text-gray-700">
                    Client ID (Application ID) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="azure_client_id"
                    value={formData.azure_client_id || ''}
                    onChange={(e) => updateFormData('azure_client_id', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="azure_client_secret" className="block text-sm font-medium text-gray-700">
                    Client Secret <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    id="azure_client_secret"
                    value={formData.azure_client_secret || ''}
                    onChange={(e) => updateFormData('azure_client_secret', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="azure_policy_name" className="block text-sm font-medium text-gray-700">
                    Policy/User Flow Name
                  </label>
                  <input
                    type="text"
                    id="azure_policy_name"
                    value={formData.azure_policy_name || ''}
                    onChange={(e) => updateFormData('azure_policy_name', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., B2C_1_signupsignin"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SAML Configuration */}
          {formData.provider_type === 'saml' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">SAML 2.0 Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="saml_entity_id" className="block text-sm font-medium text-gray-700">
                    Entity ID (Issuer) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="saml_entity_id"
                    value={formData.saml_entity_id || ''}
                    onChange={(e) => updateFormData('saml_entity_id', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., https://idp.example.com/saml"
                  />
                </div>

                <div>
                  <label htmlFor="saml_sso_url" className="block text-sm font-medium text-gray-700">
                    SSO URL (Single Sign-On URL) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    id="saml_sso_url"
                    value={formData.saml_sso_url || ''}
                    onChange={(e) => updateFormData('saml_sso_url', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://idp.example.com/saml/sso"
                  />
                </div>

                <div>
                  <label htmlFor="saml_slo_url" className="block text-sm font-medium text-gray-700">
                    SLO URL (Single Logout URL)
                  </label>
                  <input
                    type="url"
                    id="saml_slo_url"
                    value={formData.saml_slo_url || ''}
                    onChange={(e) => updateFormData('saml_slo_url', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://idp.example.com/saml/slo"
                  />
                </div>

                <div>
                  <label htmlFor="saml_certificate" className="block text-sm font-medium text-gray-700">
                    X.509 Certificate <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="saml_certificate"
                    value={formData.saml_certificate || ''}
                    onChange={(e) => updateFormData('saml_certificate', e.target.value)}
                    required
                    rows={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste the Identity Provider&apos;s X.509 certificate (PEM format)
                  </p>
                </div>

                <div>
                  <label htmlFor="saml_name_id_format" className="block text-sm font-medium text-gray-700">
                    NameID Format
                  </label>
                  <select
                    id="saml_name_id_format"
                    value={formData.saml_name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}
                    onChange={(e) => updateFormData('saml_name_id_format', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">Email Address</option>
                    <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">Persistent</option>
                    <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">Transient</option>
                    <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">Unspecified</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* OIDC Configuration */}
          {formData.provider_type === 'oidc' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">OpenID Connect Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="oidc_issuer_url" className="block text-sm font-medium text-gray-700">
                    Issuer URL <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    id="oidc_issuer_url"
                    value={formData.oidc_issuer_url || ''}
                    onChange={(e) => updateFormData('oidc_issuer_url', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://idp.example.com"
                  />
                </div>

                <div>
                  <label htmlFor="oidc_client_id" className="block text-sm font-medium text-gray-700">
                    Client ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="oidc_client_id"
                    value={formData.oidc_client_id || ''}
                    onChange={(e) => updateFormData('oidc_client_id', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="oidc_client_secret" className="block text-sm font-medium text-gray-700">
                    Client Secret <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    id="oidc_client_secret"
                    value={formData.oidc_client_secret || ''}
                    onChange={(e) => updateFormData('oidc_client_secret', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Advanced Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="auto_provision_users"
                  checked={formData.auto_provision_users}
                  onChange={(e) => updateFormData('auto_provision_users', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="auto_provision_users" className="block text-sm font-medium text-gray-900">
                    Auto-provision users
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    Automatically create user accounts on first SSO login
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="require_email_verification"
                  checked={formData.require_email_verification}
                  onChange={(e) => updateFormData('require_email_verification', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="require_email_verification" className="block text-sm font-medium text-gray-900">
                    Require email verification
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    Require users to verify their email after SSO login
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="allowed_domains" className="block text-sm font-medium text-gray-700">
                  Allowed Email Domains
                </label>
                <input
                  type="text"
                  id="allowed_domains"
                  value={formData.allowed_domains?.join(', ') || ''}
                  onChange={(e) => {
                    const domains = e.target.value
                      .split(',')
                      .map(d => d.trim())
                      .filter(Boolean)
                    updateFormData('allowed_domains', domains.length > 0 ? domains : undefined)
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., example.com, company.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated list. Leave empty to allow all domains.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => router.push('/admin/sso')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Creating...' : 'Create SSO Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
