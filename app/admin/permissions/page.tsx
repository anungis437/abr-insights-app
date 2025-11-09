'use client'

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

import { useState, useEffect } from 'react'
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
  Loader2
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

  const [activeTab, setActiveTab] = useState<'permissions' | 'overrides' | 'hierarchy'>('permissions')
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

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
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
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPermissions() {
    // Get all permissions
    const { data: permsData } = await supabase
      .from('permissions')
      .select('*')
      .order('category, name')

    setPermissions(permsData || [])

    // Get resource permissions with joined data
    const { data: resPermsData } = await supabase
      .from('resource_permissions')
      .select(`
        *,
        permissions (slug, name),
        profiles (email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    // Flatten joined data
    const flattenedPerms = resPermsData?.map((rp) => ({
      ...rp,
      permission_slug: (rp.permissions as unknown as { slug: string })?.slug,
      scope_name: (rp.profiles as unknown as { email: string })?.email || rp.scope_id,
      permissions: undefined,
      profiles: undefined,
    })) as ResourcePermission[]

    setResourcePermissions(flattenedPerms || [])
  }

  async function loadOverrides() {
    const { data } = await supabase
      .from('permission_overrides')
      .select(`
        *,
        profiles!permission_overrides_user_id_fkey (email),
        requesters:profiles!permission_overrides_requested_by_fkey (email),
        permissions (slug, name)
      `)
      .order('created_at', { ascending: false })

    // Flatten joined data
    const flattenedOverrides = data?.map((o) => ({
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
      .select(`
        depth,
        child_roles:roles!role_hierarchy_child_role_id_fkey (id, name),
        parent_roles:roles!role_hierarchy_parent_role_id_fkey (id, name)
      `)
      .order('depth')

    // Flatten joined data
    const flattenedHierarchy = data?.map((h) => ({
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
      const { data: { user } } = await supabase.auth.getUser()
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
      console.error('Error approving override:', error)
      alert('Failed to approve override')
    }
  }

  async function handleRejectOverride(overrideId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
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
      console.error('Error rejecting override:', error)
      alert('Failed to reject override')
    }
  }

  async function handleDeletePermission(id: string) {
    if (!confirm('Delete this resource permission?')) return

    try {
      const { error } = await supabase.from('resource_permissions').delete().eq('id', id)

      if (error) throw error

      await loadPermissions()
    } catch (error) {
      console.error('Error deleting permission:', error)
      alert('Failed to delete permission')
    }
  }

  // Filter functions
  const filteredResourcePermissions = resourcePermissions.filter((rp) => {
    const matchesSearch =
      !searchQuery ||
      rp.permission_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rp.scope_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesScope = filterScope === 'all' || rp.scope_type === filterScope

    return matchesSearch && matchesScope
  })

  const filteredOverrides = overrides.filter((o) => {
    return filterStatus === 'all' || o.approval_status === filterStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container-custom pt-20 pb-8">
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
            className={`pb-4 border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <span className="font-medium">Resource Permissions</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {resourcePermissions.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`pb-4 border-b-2 transition ${
              activeTab === 'overrides'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Permission Overrides</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {overrides.filter((o) => o.approval_status === 'pending').length} pending
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-4 border-b-2 transition ${
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Scopes</option>
              <option value="user">User</option>
              <option value="role">Role</option>
              <option value="organization">Organization</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Permissions List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            className={`px-2 py-1 text-xs font-medium rounded ${
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                No permission overrides found
              </div>
            ) : (
              filteredOverrides.map((override) => (
                <div key={override.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
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
                          className={`px-2 py-1 text-xs font-medium rounded ${
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

                      <div className="text-sm text-gray-600 space-y-1">
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
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApproveOverride(override.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectOverride(override.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Role Inheritance Tree
            </h2>

            {hierarchy.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No role hierarchy configured</p>
            ) : (
              <div className="space-y-2">
                {hierarchy.map((h, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg"
                    style={{ marginLeft: `${h.depth * 24}px` }}
                  >
                    <div className="flex-1 flex items-center gap-2">
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
