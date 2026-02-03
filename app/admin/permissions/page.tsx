'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Permissions Management Admin Page
 * Route: /admin/permissions
 *
 * Features:
 * - Resource-level permission editor
 * - Permission override management with approval workflow
 * - Role hierarchy visualizer
 * - Effective permissions viewer
 *
 * Uses new advanced_rbac migration tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  GitBranch,
  Loader2,
} from 'lucide-react'

interface Permission {
  id: string
  slug: string
  name: string
  description: string
  category: string
}

interface ResourcePermission {
  id: string
  permission_id: string
  permission_slug: string
  scope_type: 'user' | 'role' | 'organization' | 'public'
  scope_id: string
  scope_name?: string
  resource_type?: string
  resource_id?: string
  granted_by: string
  expires_at?: string
  created_at: string
}

interface PermissionOverride {
  id: string
  user_id: string
  user_email: string
  permission_id: string
  permission_slug: string
  override_type: 'grant' | 'deny' | 'elevate'
  approval_status: 'pending' | 'approved' | 'rejected'
  resource_type?: string
  resource_id?: string
  reason: string
  requested_by: string
  requested_by_email?: string
  approved_by?: string
  approved_at?: string
  expires_at?: string
  created_at: string
}

interface RoleHierarchy {
  child_role_id: string
  child_role_name: string
  parent_role_id: string
  parent_role_name: string
  depth: number
}

export default function PermissionsPage() {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'permissions' | 'overrides' | 'hierarchy'>(
    'permissions'
  )
  const [loading, setLoading] = useState(true)

  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [resourcePermissions, setResourcePermissions] = useState<ResourcePermission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<string>('all')

  // Overrides state
  const [overrides, setOverrides] = useState<PermissionOverride[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Hierarchy state
  const [hierarchy, setHierarchy] = useState<RoleHierarchy[]>([])

  // Modal state
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false)
  const [showOverrideDetailModal, setShowOverrideDetailModal] = useState(false)
  const [selectedOverride, setSelectedOverride] = useState<PermissionOverride | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'permissions') {
        await loadPermissions()
      } else if (activeTab === 'overrides') {
        await loadOverrides()
      } else if (activeTab === 'hierarchy') {
        await loadHierarchy()
      }
    } catch (error) {
      logger.error('Error loading data:', { error: error, context: 'PermissionsPage' })
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function loadPermissions() {
    try {
      // Get all permissions
      const permsQuery = supabase.from('permissions').select('*')
      const { data: permsData, error: permsError } = await permsQuery.order('name')

      if (permsError) {
        logger.warn('[Permissions] Error fetching permissions:', {
          permsError,
          context: 'PermissionsPage',
        })
        setPermissions([])
      } else {
        // Add category field if it doesn't exist
        const permsWithCategory = (permsData || []).map((perm) => ({
          ...perm,
          category: perm.category || perm.resource,
        }))
        setPermissions(permsWithCategory)
      }

      // TODO: resource_permissions table doesn't exist yet
      // This feature is planned for future implementation
      setResourcePermissions([])

      // Get resource permissions with joined data
      // const { data: resPermsData, error: resPermsError } = await supabase
      //   .from('resource_permissions')
      //   .select(
      //     `
      //     *,
      //     permissions (slug, name),
      //     profiles (email)
      //   `
      //   )
      //   .order('created_at', { ascending: false })
      //   .limit(100)

      // if (resPermsError) {
      //   logger.warn('[Permissions] Error fetching resource permissions:', {
      //     resPermsError,
      //     context: 'PermissionsPage',
      //   })
      //   setResourcePermissions([])
      //   return
      // }

      // // Flatten joined data
      // const flattenedPerms = resPermsData?.map((rp: any) => ({
      //   ...rp,
      //   permission_slug: (rp.permissions as unknown as { slug: string })?.slug,
      //   scope_name: (rp.profiles as unknown as { email: string })?.email || rp.scope_id,
      //   permissions: undefined,
      //   profiles: undefined,
      // })) as ResourcePermission[]

      // setResourcePermissions(flattenedPerms || [])
    } catch (error) {
      logger.error('[Permissions] Error loading permissions:', {
        error: error,
        context: 'PermissionsPage',
      })
      setPermissions([])
      setResourcePermissions([])
    }
  }

  async function loadOverrides() {
    const { data } = await supabase
      .from('permission_overrides')
      .select(
        `
        *,
        profiles!permission_overrides_user_id_fkey (email),
        requesters:profiles!permission_overrides_requested_by_fkey (email),
        permissions (slug, name)
      `
      )
      .order('created_at', { ascending: false })

    // Flatten joined data
    const flattenedOverrides = data?.map((o: any) => ({
      ...o,
      user_email: (o.profiles as unknown as { email: string })?.email,
      requested_by_email: (o.requesters as unknown as { email: string })?.email,
      permission_slug: (o.permissions as unknown as { slug: string })?.slug,
      profiles: undefined,
      requesters: undefined,
      permissions: undefined,
    })) as PermissionOverride[]

    setOverrides(flattenedOverrides || [])
  }

  async function loadHierarchy() {
    const { data } = await supabase
      .from('role_hierarchy')
      .select(
        `
        depth,
        child_roles:roles!role_hierarchy_child_role_id_fkey (id, name),
        parent_roles:roles!role_hierarchy_parent_role_id_fkey (id, name)
      `
      )
      .order('depth')

    // Flatten joined data
    const flattenedHierarchy = data?.map((h: any) => ({
      child_role_id: (h.child_roles as unknown as { id: string; name: string })?.id,
      child_role_name: (h.child_roles as unknown as { id: string; name: string })?.name,
      parent_role_id: (h.parent_roles as unknown as { id: string; name: string })?.id,
      parent_role_name: (h.parent_roles as unknown as { id: string; name: string })?.name,
      depth: h.depth,
    })) as RoleHierarchy[]

    setHierarchy(flattenedHierarchy || [])
  }

  async function handleApproveOverride(overrideId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('permission_overrides')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', overrideId)

      if (error) throw error

      await loadOverrides()
    } catch (error) {
      logger.error('Error approving override:', { error: error, context: 'PermissionsPage' })
      alert('Failed to approve override')
    }
  }

  async function handleRejectOverride(overrideId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('permission_overrides')
        .update({
          approval_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', overrideId)

      if (error) throw error

      await loadOverrides()
    } catch (error) {
      logger.error('Error rejecting override:', { error: error, context: 'PermissionsPage' })
      alert('Failed to reject override')
    }
  }

  async function handleDeletePermission(id: string) {
    // TODO: resource_permissions table doesn't exist yet
    alert(
      'This feature is not yet implemented. The resource_permissions table needs to be created first.'
    )
    return

    // if (!confirm('Delete this resource permission?')) return

    // try {
    //   const { error } = await supabase.from('resource_permissions').delete().eq('id', id)

    //   if (error) throw error

    //   await loadPermissions()
    // } catch (error) {
    //   logger.error('Error deleting permission:', { error: error, context: 'PermissionsPage' })
    //   alert('Failed to delete permission')
    // }
  }

  // Filter functions
  const filteredResourcePermissions = resourcePermissions.filter((rp: any) => {
    const matchesSearch =
      !searchQuery ||
      rp.permission_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rp.scope_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesScope = filterScope === 'all' || rp.scope_type === filterScope

    return matchesSearch && matchesScope
  })

  const filteredOverrides = overrides.filter((o: any) => {
    return filterStatus === 'all' || o.approval_status === filterStatus
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container-custom pb-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
        <p className="mt-2 text-gray-600">
          Manage resource-level permissions, overrides, and role hierarchy
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`border-b-2 pb-4 transition ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <span className="font-medium">Resource Permissions</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {resourcePermissions.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`border-b-2 pb-4 transition ${
              activeTab === 'overrides'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Permission Overrides</span>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                {overrides.filter((o) => o.approval_status === 'pending').length} pending
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`border-b-2 pb-4 transition ${
              activeTab === 'hierarchy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              <span className="font-medium">Role Hierarchy</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Resource Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by permission scope"
            >
              <option value="all">All Scopes</option>
              <option value="user">User</option>
              <option value="role">Role</option>
              <option value="organization">Organization</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Permissions List */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResourcePermissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No resource permissions found
                    </td>
                  </tr>
                ) : (
                  filteredResourcePermissions.map((rp) => (
                    <tr key={rp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{rp.permission_slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              rp.scope_type === 'user'
                                ? 'bg-blue-100 text-blue-700'
                                : rp.scope_type === 'role'
                                  ? 'bg-purple-100 text-purple-700'
                                  : rp.scope_type === 'organization'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {rp.scope_type}
                          </span>
                          <span className="text-sm text-gray-600">{rp.scope_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {rp.resource_type && rp.resource_id
                          ? `${rp.resource_type} #${rp.resource_id.slice(0, 8)}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {rp.expires_at ? new Date(rp.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePermission(rp.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete permission"
                          title="Delete permission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permission Overrides Tab */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="Filter overrides by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Overrides List */}
          <div className="space-y-3">
            {filteredOverrides.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
                No permission overrides found
              </div>
            ) : (
              filteredOverrides.map((override) => (
                <div key={override.id} className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            override.override_type === 'grant'
                              ? 'bg-green-100 text-green-700'
                              : override.override_type === 'deny'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {override.override_type}
                        </span>
                        <span className="font-medium text-gray-900">
                          {override.permission_slug}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            override.approval_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : override.approval_status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {override.approval_status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">User:</span> {override.user_email}
                        </div>
                        <div>
                          <span className="font-medium">Reason:</span> {override.reason}
                        </div>
                        <div>
                          <span className="font-medium">Requested by:</span>{' '}
                          {override.requested_by_email}
                        </div>
                        {override.resource_type && (
                          <div>
                            <span className="font-medium">Resource:</span> {override.resource_type}
                            {override.resource_id && ` #${override.resource_id.slice(0, 8)}`}
                          </div>
                        )}
                        {override.expires_at && (
                          <div>
                            <span className="font-medium">Expires:</span>{' '}
                            {new Date(override.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {override.approval_status === 'pending' && (
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleApproveOverride(override.id)}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectOverride(override.id)}
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Role Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <GitBranch className="h-5 w-5" />
              Role Inheritance Tree
            </h2>

            {hierarchy.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No role hierarchy configured</p>
            ) : (
              <div className="space-y-2">
                {hierarchy.map((h, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3"
                    style={{ marginLeft: `${h.depth * 24}px` }}
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{h.child_role_name}</span>
                      <span className="text-gray-400">→ inherits from →</span>
                      <span className="font-medium text-blue-600">{h.parent_role_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">Depth: {h.depth}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
