'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award,
  Eye,
  Clock,
  Target,
  BarChart3
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
  }
  courseMetrics: {
    totalCourses: number
    published: number
    totalEnrollments: number
    completionRate: number
    avgRating: number
  }
  caseMetrics: {
    totalCases: number
    totalViews: number
    avgViewsPerCase: number
    totalBookmarks: number
  }
  topCourses: Array<{
    id: string
    title: string
    enrollments: number
    completions: number
    completionRate: number
  }>
  topCases: Array<{
    id: string
    case_number: string
    case_title: string
    views: number
  }>
  recentActivity: Array<{
    type: string
    count: number
    date: string
  }>
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  const checkAuthAndLoadAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', currentUser.id)
        .single()

      if (!profileData) {
        router.push('/dashboard')
        return
      }

      // Only allow super_admin, org_admin, and analyst roles
      const hasAccess = 
        profileData.role === 'super_admin' ||
        profileData.role === 'org_admin' ||
        profileData.role === 'analyst'

      if (!hasAccess) {
        router.push('/dashboard')
        return
      }

      await loadAnalyticsData()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuthAndLoadAnalytics()
  }, [checkAuthAndLoadAnalytics])

  const loadAnalyticsData = async () => {
    const supabase = createClient()
    try {
      // User Growth
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      thisMonthStart.setHours(0, 0, 0, 0)

      const lastMonthStart = new Date(thisMonthStart)
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)

      const { count: thisMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonthStart.toISOString())

      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', thisMonthStart.toISOString())

      const userGrowthRate = lastMonthUsers && lastMonthUsers > 0
        ? ((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100
        : 0

      // Course Metrics
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      const { count: publishedCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      const { count: totalEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })

      const { count: completedEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const completionRate = totalEnrollments && totalEnrollments > 0
        ? (completedEnrollments || 0) / totalEnrollments * 100
        : 0

      // Average rating
      const { data: coursesWithRatings } = await supabase
        .from('courses')
        .select('average_rating')
        .not('average_rating', 'is', null)

      const avgRating = coursesWithRatings && coursesWithRatings.length > 0
        ? coursesWithRatings.reduce((sum, c) => sum + (parseFloat(String(c.average_rating)) || 0), 0) / coursesWithRatings.length
        : 0

      // Case Metrics
      const { count: totalCases } = await supabase
        .from('tribunal_cases')
        .select('*', { count: 'exact', head: true })

      const { data: casesData } = await supabase
        .from('tribunal_cases')
        .select('views_count, bookmarks_count')

      const totalViews = casesData?.reduce((sum, c) => sum + (c.views_count || 0), 0) || 0
      const totalBookmarks = casesData?.reduce((sum, c) => sum + (c.bookmarks_count || 0), 0) || 0
      const avgViewsPerCase = totalCases && totalCases > 0 ? totalViews / totalCases : 0

      // Top Courses
      const { data: topCoursesData } = await supabase
        .from('courses')
        .select('id, title, enrollments_count, completions_count')
        .order('enrollments_count', { ascending: false })
        .limit(5)

      const topCourses = (topCoursesData || []).map(c => ({
        id: c.id,
        title: c.title,
        enrollments: c.enrollments_count || 0,
        completions: c.completions_count || 0,
        completionRate: c.enrollments_count && c.enrollments_count > 0
          ? (c.completions_count || 0) / c.enrollments_count * 100
          : 0
      }))

      // Top Cases
      const { data: topCasesData } = await supabase
        .from('tribunal_cases')
        .select('id, case_number, case_title, views_count')
        .order('views_count', { ascending: false })
        .limit(5)

      const topCases = (topCasesData || []).map(c => ({
        id: c.id,
        case_number: c.case_number,
        case_title: c.case_title,
        views: c.views_count || 0
      }))

      setAnalytics({
        userGrowth: {
          total: totalUsers || 0,
          thisMonth: thisMonthUsers || 0,
          lastMonth: lastMonthUsers || 0,
          growthRate: userGrowthRate
        },
        courseMetrics: {
          totalCourses: totalCourses || 0,
          published: publishedCourses || 0,
          totalEnrollments: totalEnrollments || 0,
          completionRate,
          avgRating
        },
        caseMetrics: {
          totalCases: totalCases || 0,
          totalViews,
          avgViewsPerCase,
          totalBookmarks
        },
        topCourses,
        topCases,
        recentActivity: []
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Platform performance and insights</p>
              </div>
            </div>
          </div>

          {/* User Growth Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.userGrowth.total}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.userGrowth.thisMonth}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.userGrowth.lastMonth}</div>
                <div className="text-sm text-gray-600">Last Month</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    analytics.userGrowth.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Target className={`w-5 h-5 ${
                      analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.userGrowth.growthRate > 0 ? '+' : ''}{analytics.userGrowth.growthRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
            </div>
          </div>

          {/* Course Metrics Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.courseMetrics.totalCourses}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.courseMetrics.published}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.courseMetrics.totalEnrollments}</div>
                <div className="text-sm text-gray-600">Enrollments</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.courseMetrics.completionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.courseMetrics.avgRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Case Metrics Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Engagement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.caseMetrics.totalCases}</div>
                <div className="text-sm text-gray-600">Total Cases</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.caseMetrics.totalViews}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(analytics.caseMetrics.avgViewsPerCase)}</div>
                <div className="text-sm text-gray-600">Avg Views/Case</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.caseMetrics.totalBookmarks}</div>
                <div className="text-sm text-gray-600">Bookmarks</div>
              </div>
            </div>
          </div>

          {/* Top Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Courses</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {analytics.topCourses.map((course, index) => (
                    <div key={course.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{course.title}</div>
                          <div className="text-sm text-gray-600">
                            {course.enrollments} enrollments • {course.completions} completed • {course.completionRate.toFixed(0)}% rate
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Cases */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Cases</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {analytics.topCases.map((tribunalCase, index) => (
                    <div key={tribunalCase.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{tribunalCase.case_title}</div>
                          <div className="text-sm text-gray-600">
                            {tribunalCase.case_number} • {tribunalCase.views} views
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>    </div>
  )
}
