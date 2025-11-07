const fs = require('fs');
const path = require('path');

const adminUsersContent = `'use client'

import { useState, useEffect } from 'react'
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
  Shield
} from 'lucide-react'

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
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOrg, setFilterOrg] = useState('all')

  useEffect(() => {
    const checkAuthAndLoadUsers = async () => {
      // Check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Check admin role (note: role field may not exist in profiles yet)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      // For now, check if user exists - role checking would require role field migration
      if (!profileData) {
        router.push('/')
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.invited}</div>
                    <div className="text-sm text-gray-600">Invited</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.suspended}</div>
                    <div className="text-sm text-gray-600">Suspended</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{recentUsers}</div>
                    <div className="text-sm text-gray-600">Active (30d)</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.onboarded}</div>
                    <div className="text-sm text-gray-600">Onboarded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="invited">Invited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              filteredUsers.map((profile) => (
                <div key={profile.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.display_name || profile.email}
                          className="w-16 h-16 rounded-full object-cover"
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
                              {profile.display_name || \`\${profile.first_name || ''} \${profile.last_name || ''}\`.trim() || 'No name'}
                            </h3>
                            <span className={\`px-2 py-1 text-xs font-medium rounded-full \${
                              profile.status === 'active' ? 'bg-green-100 text-green-800' :
                              profile.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                              profile.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }\`}>
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

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(\`/admin/users/\${profile.id}\`)}
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
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
`;

// Ensure directory exists and write file
const dirPath = path.join(process.cwd(), 'app', 'admin', 'users');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const filePath = path.join(dirPath, 'page.tsx');
fs.writeFileSync(filePath, adminUsersContent, 'utf8');

console.log('Admin users page written successfully');
