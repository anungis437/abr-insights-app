'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Users, Settings, TrendingUp, Shield, Plus, ExternalLink, Eye } from 'lucide-react'
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
  user_count?: number
  active_user_count?: number
}

export default function AdminOrganizationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const loadOrganizations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchQuery || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || org.type === typeFilter
    return matchesSearch && matchesType
  })

  const stats = [
    { label: 'Total Organizations', value: organizations.length.toString(), icon: Building2 },
    { label: 'Active Organizations', value: organizations.filter(o => o.settings?.status !== 'suspended').length.toString(), icon: Shield },
    { label: 'Organization Types', value: new Set(organizations.map(o => o.type)).size.toString(), icon: TrendingUp },
    { label: 'Total Capacity', value: 'N/A', icon: Users },
  ]

  if (loading) {
    return (
      <div className="container-custom pt-20 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom pt-20 pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-2 text-gray-600">
            Manage organizations and their subscriptions
          </p>
        </div>
        <button 
          onClick={() => router.push('/admin/organizations/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Organization
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary-50 p-3">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Search organizations..."
          className="input max-w-xs"
          aria-label="Search organizations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="input max-w-xs" 
          aria-label="Filter organizations by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="federal">Federal</option>
          <option value="provincial">Provincial</option>
          <option value="municipal">Municipal</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Organizations Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredOrganizations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || typeFilter ? 'Try adjusting your filters' : 'Get started by creating a new organization'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Link
                          href={`/admin/organizations/${org.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {org.name}
                        </Link>
                        <p className="text-sm text-gray-500">/{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 capitalize">
                      {org.type || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {org.domain || <span className="text-gray-400">No domain</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        (org.settings?.status || 'active') === 'active'
                          ? 'bg-green-100 text-green-800'
                          : (org.settings?.status || 'active') === 'trial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {org.settings?.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Link>
                      <button
                        onClick={() => router.push(`/admin/organizations/${org.id}/settings`)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-700"
                        aria-label="Organization settings"
                      >
                        <Settings className="inline h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
