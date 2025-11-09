'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  Mail,
  Building,
  Calendar,
  Clock,
  Shield,
  Activity,
  ArrowLeft,
  Edit,
  CheckCircle,
  Award,
  BookOpen,
  Target,
  TrendingUp
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
  role?: string | null
  role_name?: string | null
}

interface Organization {
  id: string
  name: string
  slug: string
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    coursesInProgress: 0,
    casesReviewed: 0,
    achievements: 0
  })

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const userId = params.id as string
        const supabaseClient = createClient()

        // Load user profile
        const { data: userData, error: userError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (userError) throw userError
        setUser(userData)

        // Load organization if user has one
        if (userData.organization_id) {
          const { data: orgData } = await supabaseClient
            .from('organizations')
            .select('id, name, slug')
            .eq('id', userData.organization_id)
            .single()
          
          if (orgData) setOrganization(orgData)
        }

        // Load user stats (mock for now - replace with actual queries)
        // TODO: Query actual course progress, case reviews, achievements
        setStats({
          coursesCompleted: 0,
          coursesInProgress: 0,
          casesReviewed: 0,
          achievements: 0
        })
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [params.id])

  if (loading) {
    return (
      <div className="container-custom pt-20 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading user...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-custom pt-20 pb-8">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
          <p className="mt-1 text-sm text-gray-500">The user you&apos;re looking for doesn&apos;t exist.</p>
          <div className="mt-6">
            <Link href="/admin/users" className="btn-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayName = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'
  const roleName = user.role_name || (user.role === 'super_admin' ? 'Super Admin' : user.role === 'org_admin' ? 'Admin' : user.role === 'analyst' ? 'Analyst' : 'User')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-purple-600" />
                  </div>
                )}

                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      {roleName}
                    </span>
                    {user.onboarding_completed && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Onboarded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                    {user.job_title && (
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {user.job_title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Courses Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.coursesInProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cases Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.casesReviewed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-3">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.achievements}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="mt-1 text-gray-900">{user.first_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="mt-1 text-gray-900">{user.last_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Name</label>
                  <p className="mt-1 text-gray-900">{user.display_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <p className="mt-1 text-gray-900">{user.job_title || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-gray-900">{user.department || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Organization</label>
                  <p className="mt-1">
                    {organization ? (
                      <Link 
                        href={`/admin/organizations/${organization.id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {organization.name}
                      </Link>
                    ) : (
                      <span className="text-gray-900">No organization</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1">
                    <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-sm font-medium text-purple-800">
                      {roleName}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </div>
                  <p className="text-gray-900">{new Date(user.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Clock className="h-4 w-4" />
                    Last Login
                  </div>
                  <p className="text-gray-900">
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleString()
                      : 'Never logged in'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Activity className="h-4 w-4" />
                    Last Activity
                  </div>
                  <p className="text-gray-900">
                    {user.last_activity_at 
                      ? new Date(user.last_activity_at).toLocaleString()
                      : 'No activity'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </div>
                  <p>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
