'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Admin Dashboard
 * Route: /admin
 * Features: Overview stats, recent activity, quick actions for admins
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Database,
  Zap,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  totalCases: number
  totalEnrollments: number
  completionRate: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalCases: 0,
    totalEnrollments: 0,
    completionRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const loadUserAndCheckAdmin = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Get user profile with role
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

      // Check if user has admin role
      const isAdmin =
        profileData.role === 'super_admin' ||
        profileData.role === 'org_admin' ||
        profileData.role === 'compliance_officer' ||
        profileData.role === 'educator'

      if (!isAdmin) {
        router.push('/')
        return
      }

      setIsLoading(false)

      // Load stats
      try {
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', thirtyDaysAgo.toISOString())

        const { count: totalCourses } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })

        const { count: totalCases } = await supabase
          .from('tribunal_cases')
          .select('*', { count: 'exact', head: true })

        const { count: totalEnrollments } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })

        const { count: completedEnrollments } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')

        const completionRate =
          totalEnrollments && totalEnrollments > 0
            ? Math.round(((completedEnrollments || 0) / totalEnrollments) * 100)
            : 0

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalCourses: totalCourses || 0,
          totalCases: totalCases || 0,
          totalEnrollments: totalEnrollments || 0,
          completionRate,
        })
      } catch (error) {
        logger.error('Error loading stats:', { error: error, context: 'AdminDashboard' })
      }

      // Load recent activity
      try {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(
            `
            id,
            created_at,
            courses(title),
            profiles(display_name, email)
          `
          )
          .order('created_at', { ascending: false })
          .limit(5)

        const activities: RecentActivity[] = (enrollments || []).map((enrollment: any) => ({
          id: enrollment.id,
          type: 'enrollment',
          description: `New enrollment in "${enrollment.courses?.title || 'Unknown Course'}"`,
          timestamp: enrollment.created_at,
          user: enrollment.profiles?.display_name || enrollment.profiles?.email || 'Unknown User',
        }))

        setRecentActivity(activities)
      } catch (error) {
        logger.error('Error loading recent activity:', { error: error, context: 'AdminDashboard' })
      }
    }

    loadUserAndCheckAdmin()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-16">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Platform management and analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                  {profile?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border-2 border-blue-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="mt-1 text-sm text-gray-600">Total Users</div>
              <div className="mt-2 text-xs text-green-600">{stats.activeUsers} active (30d)</div>
            </div>

            <div className="rounded-lg border-2 border-purple-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
              <div className="mt-1 text-sm text-gray-600">Total Courses</div>
              <div className="mt-2 text-xs text-gray-500">{stats.totalEnrollments} enrollments</div>
            </div>

            <div className="rounded-lg border-2 border-teal-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                  <FileText className="h-6 w-6 text-teal-600" />
                </div>
                <Database className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCases}</div>
              <div className="mt-1 text-sm text-gray-600">Total Cases</div>
              <div className="mt-2 text-xs text-gray-500">Legal database</div>
            </div>

            <div className="rounded-lg border-2 border-green-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.completionRate}%</div>
              <div className="mt-1 text-sm text-gray-600">Completion Rate</div>
              <div className="mt-2 text-xs text-gray-500">Course completions</div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Quick Actions */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    Quick Actions
                  </h2>
                </div>
                <div className="grid gap-4 p-6 md:grid-cols-2">
                  <button
                    onClick={() => router.push('/admin/courses')}
                    className="group rounded-lg border-2 border-purple-200 p-4 text-left transition-all hover:border-purple-400 hover:bg-purple-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 transition-all group-hover:bg-purple-200">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Courses</div>
                          <div className="text-sm text-gray-600">Create & edit</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:text-purple-600" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/cases')}
                    className="group rounded-lg border-2 border-teal-200 p-4 text-left transition-all hover:border-teal-400 hover:bg-teal-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 transition-all group-hover:bg-teal-200">
                          <FileText className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Cases</div>
                          <div className="text-sm text-gray-600">Case library</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:text-teal-600" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/users')}
                    className="group rounded-lg border-2 border-blue-200 p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 transition-all group-hover:bg-blue-200">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Users</div>
                          <div className="text-sm text-gray-600">Roles & access</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:text-blue-600" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/analytics')}
                    className="group rounded-lg border-2 border-green-200 p-4 text-left transition-all hover:border-green-400 hover:bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 transition-all group-hover:bg-green-200">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">View Analytics</div>
                          <div className="text-sm text-gray-600">Reports & insights</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:text-green-600" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Clock className="h-6 w-6 text-gray-600" />
                    Recent Activity
                  </h2>
                </div>
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 border-b pb-4 last:border-b-0"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            {activity.user && (
                              <p className="mt-1 text-xs text-gray-600">{activity.user}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm">
                <div className="border-b border-green-100 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    System Status
                  </h3>
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Database</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">API Services</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">AI Services</span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Operational
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Tools */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Admin Tools
                  </h3>
                </div>
                <div className="space-y-2 p-6">
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    Platform Settings
                  </button>
                  <button
                    onClick={() => router.push('/admin/audit')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    Audit Logs
                  </button>
                  <button
                    onClick={() => router.push('/admin/integrations')}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    Integrations
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm">
                <div className="border-b border-yellow-100 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Quick Tips
                  </h3>
                </div>
                <div className="space-y-3 p-6 text-sm text-gray-700">
                  <p>💡 Review pending user registrations regularly</p>
                  <p>📊 Check analytics weekly for trends</p>
                  <p>🔒 Audit access logs monthly</p>
                  <p>📚 Keep course content up to date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>{' '}
    </div>
  )
}
