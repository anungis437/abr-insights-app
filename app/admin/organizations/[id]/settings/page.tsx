'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  domain: string | null
  settings: any
  created_at: string
  updated_at: string
}

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState('')
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState('active')

  useEffect(() => {
    async function loadOrganization() {
      try {
        setLoading(true)
        const orgId = params.id as string

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single()

        if (error) throw error

        setOrganization(data)
        setName(data.name)
        setSlug(data.slug)
        setType(data.type || '')
        setDomain(data.domain || '')
        setStatus(data.settings?.status || 'active')
      } catch (error) {
        logger.error('Error loading organization:', { error: error, context: 'OrganizationSettingsPage' })
        setMessage({ type: 'error', text: 'Failed to load organization' })
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [params.id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!organization) return

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase
        .from('organizations')
        .update({
          name,
          slug,
          type,
          domain: domain || null,
          settings: {
            ...organization.settings,
            status,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Organization updated successfully' })

      // Reload the organization data
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organization.id)
        .single()

      if (data) setOrganization(data)
    } catch (error) {
      logger.error('Error updating organization:', { error: error, context: 'OrganizationSettingsPage' })
      setMessage({ type: 'error', text: 'Failed to update organization' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-custom pb-8 pt-20">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading organization settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="container-custom pb-8 pt-20">
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Organization not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The organization settings could not be loaded.
          </p>
          <div className="mt-6">
            <Link href="/admin/organizations" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Organizations
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom pb-8 pt-20">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/admin/organizations/${organization.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organization
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-sm text-gray-500">{organization.name}</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form
        onSubmit={handleSave}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-900">General Settings</h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input w-full"
              placeholder="Enter organization name"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium text-gray-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">/</span>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                required
                className="input flex-1"
                placeholder="organization-slug"
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="input w-full"
            >
              <option value="">Select type</option>
              <option value="federal">Federal</option>
              <option value="provincial">Provincial</option>
              <option value="municipal">Municipal</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Domain */}
          <div>
            <label htmlFor="domain" className="mb-2 block text-sm font-medium text-gray-700">
              Email Domain
            </label>
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input w-full"
              placeholder="example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              Users with this email domain can automatically join the organization.
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="input w-full"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 text-sm font-medium text-gray-700">Metadata</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(organization.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {new Date(organization.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push(`/admin/organizations/${organization.id}`)}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
