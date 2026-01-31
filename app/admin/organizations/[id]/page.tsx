'use client'

import { logger } from '@/lib/utils/production-logger'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Users, Settings, Calendar, Globe, Shield, ArrowLeft, Edit } from 'lucide-react'
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

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  organization_id: string
  created_at: string
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrganization() {
      try {
        setLoading(true)
        const orgId = params.id as string

        // Load organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single()

        if (orgError) throw orgError
        setOrganization(orgData)

        // Load members
        const { data: membersData, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })

        if (membersError) throw membersError
        setMembers(membersData || [])
      } catch (error) {
        logger.error('Error loading organization:', { error: error, context: 'OrganizationDetailPage' })
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [params.id])

  if (loading) {
    return (
      <div className="container-custom pb-8 pt-20">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading organization...</p>
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
            The organization you&apos;re looking for doesn&apos;t exist.
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

  const activeMembers = members.filter((m) => m.role !== 'inactive')
  const status = organization.settings?.status || 'active'

  return (
    <div className="container-custom pb-8 pt-20">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/organizations"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organizations
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-sm text-gray-500">/{organization.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/admin/organizations/${organization.id}/settings`)}
              className="btn-secondary flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{activeMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-3">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Domain</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization.domain || <span className="text-sm text-gray-400">No domain</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(organization.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Organization Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-gray-900">{organization.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="mt-1 text-gray-900">/{organization.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Type</label>
            <p className="mt-1">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium capitalize text-gray-800">
                {organization.type || 'N/A'}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : status === 'trial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Domain</label>
            <p className="mt-1 text-gray-900">
              {organization.domain || <span className="text-gray-400">No domain configured</span>}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-gray-900">
              {new Date(organization.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This organization doesn&apos;t have any members.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.full_name || 'Unnamed User'}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-primary-100 px-2 py-1 text-xs font-medium capitalize text-primary-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
