'use client'

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
  Zap
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
    completionRate: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const loadUserAndCheckAdmin = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
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

        const completionRate = totalEnrollments && totalEnrollments > 0
          ? Math.round((completedEnrollments || 0) / totalEnrollments * 100)
          : 0

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalCourses: totalCourses || 0,
          totalCases: totalCases || 0,
          totalEnrollments: totalEnrollments || 0,
          completionRate
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }

      // Load recent activity
      try {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            id,
            created_at,
            courses(title),
            profiles(display_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        const activities: RecentActivity[] = (enrollments || []).map((enrollment: any) => ({
          id: enrollment.id,
          type: 'enrollment',
          description: `New enrollment in "${enrollment.courses?.title || 'Unknown Course'}"`,
          timestamp: enrollment.created_at,
          user: enrollment.profiles?.display_name || enrollment.profiles?.email || 'Unknown User'
        }))

        setRecentActivity(activities)
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }
    }

    loadUserAndCheckAdmin()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Platform management and analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {profile?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600 mt-1">Total Users</div>
              <div className="text-xs text-green-600 mt-2">
                {stats.activeUsers} active (30d)
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
              <div className="text-sm text-gray-600 mt-1">Total Courses</div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.totalEnrollments} enrollments
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-teal-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <Database className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCases}</div>
              <div className="text-sm text-gray-600 mt-1">Total Cases</div>
              <div className="text-xs text-gray-500 mt-2">
                Legal database
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
              <div className="text-xs text-gray-500 mt-2">
                Course completions
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    Quick Actions
                  </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/admin/courses')}
                    className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Courses</div>
                          <div className="text-sm text-gray-600">Create & edit</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/cases')}
                    className="p-4 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-all">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Cases</div>
                          <div className="text-sm text-gray-600">Case library</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/users')}
                    className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Manage Users</div>
                          <div className="text-sm text-gray-600">Roles & access</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/analytics')}
                    className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-all">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">View Analytics</div>
                          <div className="text-sm text-gray-600">Reports & insights</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-all" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-gray-600" />
                    Recent Activity
                  </h2>
                </div>
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            {activity.user && (
                              <p className="text-xs text-gray-600 mt-1">{activity.user}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200 shadow-sm">
                <div className="p-6 border-b border-green-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    System Status
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">API Services</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">AI Services</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Operational
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Tools */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    Admin Tools
                  </h3>
                </div>
                <div className="p-6 space-y-2">
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all text-left"
                  >
                    Platform Settings
                  </button>
                  <button
                    onClick={() => router.push('/admin/audit')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all text-left"
                  >
                    Audit Logs
                  </button>
                  <button
                    onClick={() => router.push('/admin/integrations')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all text-left"
                  >
                    Integrations
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="p-6 border-b border-yellow-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Quick Tips
                  </h3>
                </div>
                <div className="p-6 space-y-3 text-sm text-gray-700">
                  <p>💡 Review pending user registrations regularly</p>
                  <p>📊 Check analytics weekly for trends</p>
                  <p>🔒 Audit access logs monthly</p>
                  <p>📚 Keep course content up to date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>    </div>
  )
}
