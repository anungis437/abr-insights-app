'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { Shield, Search, Plus, Trash2, CheckCircle, Users, Building } from 'lucide-react'

interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  organization_id: string | null
  profiles?: {
    display_name: string | null
    email: string
  }
  permissions?: {
    name: string
    description: string | null
    category: string
  }
}

interface Permission {
  id: string
  name: string
  description: string | null
  category: string
}

export default function ManageUserPermissionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPermissionId, setSelectedPermissionId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Load user permissions with user and permission details
      const { data: permData, error: permError } = await supabase
        .from('user_permissions')
        .select(
          `
          *,
          profiles!user_permissions_user_id_fkey (
            display_name,
            email
          ),
          permissions!user_permissions_permission_id_fkey (
            name,
            description,
            category
          )
        `
        )
        .order('created_at', { ascending: false })

      if (permError) throw permError
      setUserPermissions(permData || [])

      // Load all available permissions
      const { data: allPerms, error: allPermsError } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name')

      if (allPermsError) throw allPermsError
      setAllPermissions(allPerms || [])
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPermission = async () => {
    if (!selectedUserId || !selectedPermissionId) {
      alert('Please select both user and permission')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('user_permissions').insert({
      user_id: selectedUserId,
      permission_id: selectedPermissionId,
      organization_id: null,
    })

    if (error) {
      console.error('Error assigning permission:', error)
      alert('Failed to assign permission')
    } else {
      setShowAssignDialog(false)
      setSelectedUserId('')
      setSelectedPermissionId('')
      loadData()
    }
  }

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) return

    const supabase = createClient()
    const { error } = await supabase.from('user_permissions').delete().eq('id', permissionId)

    if (error) {
      console.error('Error revoking permission:', error)
      alert('Failed to revoke permission')
    } else {
      loadData()
    }
  }

  const filteredPermissions = userPermissions.filter((up) => {
    const matchesSearch =
      !searchQuery ||
      up.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.permissions?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === 'all' || up.permissions?.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(allPermissions.map((p) => p.category)))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate
      permission={['permissions.manage', 'users.manage']}
      requireAny
      denied={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-red-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">
              You don&apos;t have permission to manage user permissions.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 pb-12 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Permissions</h1>
                  <p className="mt-1 text-gray-600">
                    Manage individual user permission assignments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignDialog(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white transition-all hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Assign Permission
              </button>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userPermissions.length}</div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{allPermissions.length}</div>
                    <div className="text-sm text-gray-600">Available Permissions</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by user or permission..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-4">
            {filteredPermissions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <Shield className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No user permissions found</p>
              </div>
            ) : (
              filteredPermissions.map((up) => (
                <div
                  key={up.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {up.profiles?.display_name || up.profiles?.email}
                          </h3>
                          <p className="text-sm text-gray-600">{up.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="ml-13 space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-gray-900">{up.permissions?.name}</span>
                        </div>
                        {up.permissions?.description && (
                          <p className="text-sm text-gray-600">{up.permissions.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                            {up.permissions?.category}
                          </span>
                          {up.organization_id && (
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              Organization Scoped
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokePermission(up.id)}
                      className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assign Permission Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Assign Permission to User</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter user UUID"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Permission</label>
                <select
                  value={selectedPermissionId}
                  onChange={(e) => setSelectedPermissionId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select permission...</option>
                  {allPermissions.map((perm) => (
                    <option key={perm.id} value={perm.id}>
                      {perm.category} - {perm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPermission}
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white transition-all hover:shadow-lg"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PermissionGate>
  )
}
