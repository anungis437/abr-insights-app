'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getOrgSSOProviders,
  updateSSOProviderStatus,
  setDefaultSSOProvider,
  deleteSSOProvider,
  type SSOProvider,
  type ProviderStatus,
} from '@/lib/services/sso'
import {
  Shield,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Star,
  ExternalLink,
} from 'lucide-react'

export default function SSOProvidersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [providers, setProviders] = useState<SSOProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null)

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', currentUser.id)
        .single()

      if (!profile?.organizations?.id) {
        router.push('/dashboard')
        return
      }

      setUser({ ...currentUser, profile })

      // Load SSO providers
      const orgProviders = await getOrgSSOProviders(profile.organizations.id)
      setProviders(orgProviders)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [checkAuthAndLoadData])

  const handleStatusChange = async (providerId: string, status: ProviderStatus) => {
    try {
      await updateSSOProviderStatus(providerId, status)
      await checkAuthAndLoadData()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleSetDefault = async (providerId: string) => {
    try {
      if (!user?.profile?.organizations?.id) return
      await setDefaultSSOProvider(user.profile.organizations.id, providerId)
      await checkAuthAndLoadData()
    } catch (error) {
      console.error('Failed to set default:', error)
    }
  }

  const handleDelete = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this SSO provider?')) return

    try {
      await deleteSSOProvider(providerId)
      await checkAuthAndLoadData()
    } catch (error) {
      console.error('Failed to delete provider:', error)
    }
  }

  const getStatusIcon = (status: ProviderStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'inactive':
        return <Pause className="h-5 w-5 text-gray-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getProviderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      azure_ad_b2c: 'Azure AD B2C',
      saml: 'SAML 2.0',
      oidc: 'OpenID Connect',
      okta: 'Okta',
      auth0: 'Auth0',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading SSO configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">SSO Configuration</h1>
              </div>
              <p className="mt-2 text-gray-600">
                Manage enterprise single sign-on (SSO) providers and authentication settings
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/sso/new')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add SSO Provider
            </button>
          </div>
        </div>

        {/* SSO Providers List */}
        {providers.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No SSO providers configured</h3>
            <p className="mt-2 text-gray-600">
              Get started by adding your first SSO provider to enable enterprise authentication.
            </p>
            <button
              onClick={() => router.push('/admin/sso/new')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add SSO Provider
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                        {provider.is_default && (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            <Star className="h-3 w-3" />
                            Default
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {getProviderTypeLabel(provider.provider_type)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">Slug: {provider.slug}</p>

                      {/* Provider Details */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {provider.provider_type === 'azure_ad_b2c' && (
                          <>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Tenant ID</span>
                              <p className="mt-1 font-mono text-sm text-gray-900">
                                {provider.azure_tenant_id || 'Not configured'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Client ID</span>
                              <p className="mt-1 font-mono text-sm text-gray-900">
                                {provider.azure_client_id || 'Not configured'}
                              </p>
                            </div>
                          </>
                        )}
                        {provider.provider_type === 'saml' && (
                          <>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Entity ID</span>
                              <p className="mt-1 font-mono text-sm text-gray-900">
                                {provider.saml_entity_id || 'Not configured'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">SSO URL</span>
                              <p className="mt-1 truncate font-mono text-sm text-gray-900">
                                {provider.saml_sso_url || 'Not configured'}
                              </p>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Auto-provision Users
                          </span>
                          <p className="mt-1 text-sm text-gray-900">
                            {provider.auto_provision_users ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        {provider.allowed_domains && provider.allowed_domains.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              Allowed Domains
                            </span>
                            <p className="mt-1 text-sm text-gray-900">
                              {provider.allowed_domains.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {provider.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-4">
                    <button
                      onClick={() => router.push(`/admin/sso/${provider.id}`)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </button>

                    {provider.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(provider.id, 'inactive')}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Pause className="h-4 w-4" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(provider.id, 'active')}
                        className="flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        <Play className="h-4 w-4" />
                        Activate
                      </button>
                    )}

                    {!provider.is_default && (
                      <button
                        onClick={() => handleSetDefault(provider.id)}
                        className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                      >
                        <Star className="h-4 w-4" />
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/admin/sso/${provider.id}/sessions`)}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Sessions
                    </button>

                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="ml-auto flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h4 className="font-medium text-blue-900">About Enterprise SSO</h4>
          <p className="mt-2 text-sm text-blue-800">
            Single Sign-On (SSO) allows your organization&apos;s users to authenticate using your
            existing identity provider. We support Azure AD B2C, SAML 2.0, OpenID Connect, Okta, and
            Auth0.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>Automatic user provisioning based on attribute mapping</li>
            <li>Domain restrictions for enhanced security</li>
            <li>Session management and audit trails</li>
            <li>Support for multiple providers per organization</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
