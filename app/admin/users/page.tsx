'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { PermissionGate } from '@/components/shared/PermissionGate'
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
  AlertCircle,
} from 'lucide-react'

function AccessDenied({ message = "You don't have permission to access this feature" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <UserX className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Shield className="mr-2 inline h-5 w-5" />
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOrg, setFilterOrg] = useState('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [roleUpdating, setRoleUpdating] = useState(false)

  useEffect(() => {
    const checkAuthAndLoadUsers = async () => {
      const supabase = createClient()
      // Check auth
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      logger.auth('Current user check', { userId: currentUser?.id, email: currentUser?.email })
      if (!currentUser) {
        logger.auth('No user found, redirecting to login')
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
      // Get full profile (with role)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      logger.db('Profile lookup', 'profiles', { userId: currentUser.id, hasData: !!profileData })
      if (profileError) {
        logger.error('Profile fetch error', profileError)
      }
      if (!profileData) {
        logger.auth('No profile found, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      // Only allow admins/super admins/compliance officers
      const role = profileData.role
      logger.auth('User role check', { role })
      if (role !== 'super_admin' && role !== 'org_admin' && role !== 'compliance_officer') {
        logger.warn('Unauthorized role, redirecting to dashboard', { role })
        router.push('/dashboard')
        return
      }

      logger.auth('Authorization successful, loading users')
      setProfile(profileData)

      // Load users
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (!error && usersData) {
        setUsers(usersData)
      }
      setIsLoading(false)
    }
    checkAuthAndLoadUsers()
  }, [router])

  // Apply filters with useMemo (derived state)
  const filteredUsers = useMemo(() => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((u) => u.status === filterStatus)
    }

    // Organization filter
    if (filterOrg !== 'all') {
      filtered = filtered.filter((u) => u.organization_id === filterOrg)
    }

    return filtered
  }, [searchQuery, filterStatus, filterOrg, users])

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))
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
    const supabase = createClient()
    const updates: any = { role_name: newRole }
    if (newRole === 'Super Admin' || newRole === 'Admin') {
      updates.role = 'admin'
    } else {
      updates.role = 'user'
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', selectedUser.id)
    if (!error) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updates } : u)))
      setShowEditDialog(false)
    }
    setRoleUpdating(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const organizations = [...new Set(users.map((u) => u.organization_id))].filter(Boolean)
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    invited: users.filter((u) => u.status === 'invited').length,
    onboarded: users.filter((u) => u.onboarding_completed).length,
  }

  // Get last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentUsers = users.filter(
    (u) => u.last_login_at && new Date(u.last_login_at) >= thirtyDaysAgo
  ).length

  // Permission summary helper
  function getPermissionSummary(roleName: string) {
    // Simplified permission summary - actual permissions are managed via RBAC
    const rolePermissionCounts: Record<string, { granted: number; total: number }> = {
      super_admin: { granted: 50, total: 50 },
      admin: { granted: 40, total: 50 },
      manager: { granted: 25, total: 50 },
      instructor: { granted: 15, total: 50 },
      user: { granted: 5, total: 50 },
    }
    return rolePermissionCounts[roleName] || { total: 0, granted: 0 }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {' '}
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="mt-1 text-gray-600">Manage platform users and permissions</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-3">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Onboarded</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.onboarded}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-100 p-3">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active (30d)</p>
                    <p className="text-2xl font-bold text-gray-900">{recentUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search by name, email, or job title..."
                      className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    title="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Users List with Role Edit */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              filteredUsers.map((profile) => {
                const userRole =
                  profile.role_name || (profile.role === 'admin' ? 'Admin' : 'Viewer')
                const { granted, total } = getPermissionSummary(userRole as string)
                return (
                  <div
                    key={profile.id}
                    className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.display_name || profile.email}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full object-cover"
                            priority
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
                            <Users className="h-8 w-8 text-purple-600" />
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <Link
                                href={`/admin/users/${profile.id}`}
                                className="text-xl font-semibold text-gray-900 transition-colors hover:text-purple-600"
                              >
                                {profile.display_name ||
                                  `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                                  'No name'}
                              </Link>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  profile.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : profile.status === 'invited'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : profile.status === 'suspended'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {profile.status}
                              </span>
                              {profile.onboarding_completed && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                  Onboarded
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              {profile.email}
                            </p>
                          </div>
                          {/* Edit Role Button (hide for self) */}
                          <PermissionGate permission={['roles.update', 'users.manage']} requireAny>
                            {profile.id !== user?.id && (
                              <button
                                onClick={() => handleEditRole(profile)}
                                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-purple-100"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Role
                              </button>
                            )}
                          </PermissionGate>
                        </div>
                        {/* Meta Info */}
                        <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
                          {profile.job_title && (
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {profile.job_title}
                            </span>
                          )}
                          {profile.department && <span>{profile.department}</span>}
                          {profile.last_login_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Last login: {new Date(profile.last_login_at).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            Joined: {new Date(profile.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Permission Progress */}
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
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
                                  className={`h-2 rounded-full bg-teal-600 transition-all duration-300 ${widthClass}`}
                                />
                              )
                            })()}
                          </div>
                          <span className="text-xs text-gray-600">
                            {granted}/{total} permissions
                          </span>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push(`/admin/users/${profile.id}`)}
                            className="flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2 text-purple-700 transition-colors hover:bg-purple-200"
                          >
                            <Users className="h-4 w-4" />
                            View Details
                          </button>
                          <PermissionGate permission={['users.manage', 'roles.update']} requireAny>
                            {profile.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(profile.id, 'suspended')}
                                className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
                              >
                                <UserX className="h-4 w-4" />
                                Suspend
                              </button>
                            )}
                            {profile.status === 'suspended' && (
                              <button
                                onClick={() => handleStatusChange(profile.id, 'active')}
                                className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200"
                              >
                                <UserCheck className="h-4 w-4" />
                                Activate
                              </button>
                            )}
                          </PermissionGate>
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
              <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
                <button
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowEditDialog(false)}
                >
                  ×
                </button>
                <h2 className="mb-2 text-xl font-bold">Edit User Role</h2>
                <p className="mb-4 text-gray-600">
                  Change the role for{' '}
                  <span className="font-semibold">
                    {selectedUser.display_name || selectedUser.email}
                  </span>
                </p>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-900">
                      {newRole} Permissions Preview
                    </h4>
                    <div className="text-xs text-gray-700">
                      {getPermissionSummary(newRole).granted} permissions will be granted out of{' '}
                      {getPermissionSummary(newRole).total} total.
                    </div>
                  </div>
                )}
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  The user will be logged out and need to sign in again for changes to take effect.
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowEditDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                    onClick={handleSaveRole}
                    disabled={roleUpdating}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {roleUpdating ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>{' '}
    </div>
  )
}
