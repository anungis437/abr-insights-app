'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PermissionGate } from '@/components/shared/PermissionGate'
import { 
  Shield, 
  Search, 
  Plus,
  Trash2,
  CheckCircle,
  Users,
  Building
} from 'lucide-react'

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
        .select(`
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
        `)
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
    const { error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: selectedUserId,
        permission_id: selectedPermissionId,
        organization_id: null
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
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('id', permissionId)

    if (error) {
      console.error('Error revoking permission:', error)
      alert('Failed to revoke permission')
    } else {
      loadData()
    }
  }

  const filteredPermissions = userPermissions.filter((up) => {
    const matchesSearch = !searchQuery || 
      up.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.permissions?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || up.permissions?.category === filterCategory

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(allPermissions.map(p => p.category)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate 
      permissions={['permissions.manage', 'users.manage']}
      deniedFallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage user permissions.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Permissions</h1>
                  <p className="text-gray-600 mt-1">Manage individual user permission assignments</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignDialog(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Assign Permission
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userPermissions.length}</div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{allPermissions.length}</div>
                    <div className="text-sm text-gray-600">Available Permissions</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by user or permission..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-4">
            {filteredPermissions.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No user permissions found</p>
              </div>
            ) : (
              filteredPermissions.map((up) => (
                <div key={up.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
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
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-900">{up.permissions?.name}</span>
                        </div>
                        {up.permissions?.description && (
                          <p className="text-sm text-gray-600">{up.permissions.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {up.permissions?.category}
                          </span>
                          {up.organization_id && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              Organization Scoped
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokePermission(up.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Permission to User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  placeholder="Enter user UUID"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permission</label>
                <select
                  value={selectedPermissionId}
                  onChange={(e) => setSelectedPermissionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select permission...</option>
                  {allPermissions.map((perm) => (
                    <option key={perm.id} value={perm.id}>
                      {perm.category} - {perm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPermission}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
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
