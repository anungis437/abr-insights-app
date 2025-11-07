'use client'


import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Building,
  Activity,
  Shield,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// Permissions config (ported from legacy)
const DEFAULT_PERMISSIONS: Record<string, Record<string, Record<string, boolean>>> = {
  'Super Admin': {
    organization: { manage_users: true, manage_settings: true, view_team: true, invite_members: true },
    // ...other categories omitted for brevity
  },
  'Admin': {
    organization: { manage_users: false, manage_settings: true, view_team: true, invite_members: true },
    // ...other categories omitted for brevity
  },
  'Analyst': {
    organization: { manage_users: false, manage_settings: false, view_team: true, invite_members: false },
    // ...other categories omitted for brevity
  },
  'Viewer': {
    organization: { manage_users: false, manage_settings: false, view_team: true, invite_members: false },
    // ...other categories omitted for brevity
  }
}

function hasPermission(
  user: { role?: string | null; role_name?: string | null } | null,
  category: string,
  action: string
): boolean {
  if (!user || !user.role) return false
  if (user.role === 'admin') {
    return DEFAULT_PERMISSIONS['Admin']?.[category]?.[action] || false
  }
  const userRole = user.role_name || user.role
  return DEFAULT_PERMISSIONS[userRole as string]?.[category]?.[action] || false
}

type PermissionGateProps = {
  user: { role?: string | null; role_name?: string | null } | null
  category: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}
function PermissionGate({ user, category, action, children, fallback = null }: PermissionGateProps) {
  if (hasPermission(user, category, action)) {
    return <>{children}</>
  }
  return fallback
}

function AccessDenied({ message = "You don't have permission to access this feature" }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <Shield className="w-5 h-5 inline mr-2" />
          Contact your administrator if you need access to this feature.
        </div>
      </div>
    </div>
  )
}

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  avatar_url: string | null
  job_title: string | null
  department: string | null
  organization_id: string | null
  status: string
  last_login_at: string | null
  last_activity_at: string | null
  created_at: string
  onboarding_completed: boolean
  role?: string | null
  role_name?: string | null
}


export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOrg, setFilterOrg] = useState('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [roleUpdating, setRoleUpdating] = useState(false)

  useEffect(() => {
    const checkAuthAndLoadUsers = async () => {
      // Check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
      // Get full profile (with role)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      if (!profileData) {
        router.push('/')
        return
      }
      setProfile(profileData)
      // Only allow admins/super admins
      const role = profileData.role_name || profileData.role
      if (role !== 'Super Admin' && role !== 'Admin' && profileData.role !== 'admin') {
        setIsLoading(false)
        setProfile(profileData)
        return
      }
      // Load users
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (!error && usersData) {
        setUsers(usersData)
        setFilteredUsers(usersData)
      }
      setIsLoading(false)
    }
    checkAuthAndLoadUsers()
  }, [router])

  // Apply filters
  useEffect(() => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.status === filterStatus)
    }

    // Organization filter
    if (filterOrg !== 'all') {
      filtered = filtered.filter(u => u.organization_id === filterOrg)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, filterStatus, filterOrg, users])

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)
    if (!error) {
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, status: newStatus }
          : u
      ))
    }
  }

  // Role editing logic
  const handleEditRole = (userToEdit: Profile) => {
    setSelectedUser(userToEdit)
    setNewRole(userToEdit.role_name || userToEdit.role || 'Viewer')
    setShowEditDialog(true)
  }

  const handleSaveRole = async () => {
    if (!selectedUser) return
    setRoleUpdating(true)
    const updates: any = { role_name: newRole }
    if (newRole === 'Super Admin' || newRole === 'Admin') {
      updates.role = 'admin'
    } else {
      updates.role = 'user'
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', selectedUser.id)
    if (!error) {
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...updates }
          : u
      ))
      setShowEditDialog(false)
    }
    setRoleUpdating(false)
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  // Permission check: only admins/super admins can access
  if (profile && !hasPermission(profile, 'organization', 'manage_users')) {
    return <AccessDenied message="You need Super Admin or Admin privileges to manage users" />
  }

  // Calculate stats
  const organizations = [...new Set(users.map(u => u.organization_id))].filter(Boolean)
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    invited: users.filter(u => u.status === 'invited').length,
    onboarded: users.filter(u => u.onboarding_completed).length
  }

  // Get last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentUsers = users.filter(u => 
    u.last_login_at && new Date(u.last_login_at) >= thirtyDaysAgo
  ).length

  // Permission summary helper
  function getPermissionSummary(roleName: string) {
    const perms = DEFAULT_PERMISSIONS[roleName]
    if (!perms) return { total: 0, granted: 0 }
    let total = 0, granted = 0
    Object.values(perms).forEach((category: any) => {
      Object.values(category).forEach((value: any) => {
        total++
        if (value) granted++
      })
    })
    return { total, granted }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600 mt-1">Manage platform users and permissions</p>
                </div>
              </div>
            </div>
            {/* ...existing code... */}
          </div>
          {/* ...existing code... */}
          {/* Users List with Role Edit */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              filteredUsers.map((profile) => {
                const userRole = profile.role_name || (profile.role === 'admin' ? 'Admin' : 'Viewer')
                const { granted, total } = getPermissionSummary(userRole as string)
                return (
                  <div key={profile.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.display_name || profile.email}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover"
                            priority
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-purple-600" />
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name'}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                profile.status === 'active' ? 'bg-green-100 text-green-800' :
                                profile.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                                profile.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {profile.status}
                              </span>
                              {profile.onboarding_completed && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Onboarded
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {profile.email}
                            </p>
                          </div>
                          {/* Edit Role Button (hide for self) */}
                          {profile.id !== user?.id && (
                            <button
                              onClick={() => handleEditRole(profile)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 text-xs"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Role
                            </button>
                          )}
                        </div>
                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                          {profile.job_title && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {profile.job_title}
                            </span>
                          )}
                          {profile.department && (
                            <span>{profile.department}</span>
                          )}
                          {profile.last_login_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Last login: {new Date(profile.last_login_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            Joined: {new Date(profile.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Permission Progress */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            {(() => {
                              // Map percent to closest Tailwind width class
                              const percent = Math.round((granted / total) * 100)
                              let widthClass = 'w-0'
                              if (percent >= 100) widthClass = 'w-full'
                              else if (percent >= 90) widthClass = 'w-11/12'
                              else if (percent >= 83) widthClass = 'w-10/12'
                              else if (percent >= 75) widthClass = 'w-9/12'
                              else if (percent >= 67) widthClass = 'w-8/12'
                              else if (percent >= 58) widthClass = 'w-7/12'
                              else if (percent >= 50) widthClass = 'w-6/12'
                              else if (percent >= 42) widthClass = 'w-5/12'
                              else if (percent >= 33) widthClass = 'w-4/12'
                              else if (percent >= 25) widthClass = 'w-3/12'
                              else if (percent >= 17) widthClass = 'w-2/12'
                              else if (percent >= 8) widthClass = 'w-1/12'
                              return (
                                <div
                                  className={`bg-teal-600 h-2 rounded-full transition-all duration-300 ${widthClass}`}
                                />
                              )
                            })()}
                          </div>
                          <span className="text-xs text-gray-600">{granted}/{total} permissions</span>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push(`/admin/users/${profile.id}`)}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            View Details
                          </button>
                          {profile.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(profile.id, 'suspended')}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" />
                              Suspend
                            </button>
                          )}
                          {profile.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusChange(profile.id, 'active')}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {/* Edit Role Dialog */}
          {showEditDialog && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowEditDialog(false)}>
                  ×
                </button>
                <h2 className="text-xl font-bold mb-2">Edit User Role</h2>
                <p className="text-gray-600 mb-4">Change the role for <span className="font-semibold">{selectedUser.display_name || selectedUser.email}</span></p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Select new role"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                {/* Permission Preview */}
                {newRole && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">{newRole} Permissions Preview</h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(DEFAULT_PERMISSIONS[newRole as keyof typeof DEFAULT_PERMISSIONS] || {}).map(
                        ([category, permissions]: [string, Record<string, boolean>]) => {
                          const granted = Object.values(permissions).filter(Boolean).length
                          const total = Object.values(permissions).length
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                              <span className="font-semibold text-gray-900">{granted}/{total}</span>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  The user will be logged out and need to sign in again for changes to take effect.
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowEditDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
                    onClick={handleSaveRole}
                    disabled={roleUpdating}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {roleUpdating ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
