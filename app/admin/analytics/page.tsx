'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Users, BookOpen, Award, Eye, Clock, Target, BarChart3 } from 'lucide-react'

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
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

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

      const userGrowthRate =
        lastMonthUsers && lastMonthUsers > 0
          ? (((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers) * 100
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

      const completionRate =
        totalEnrollments && totalEnrollments > 0
          ? ((completedEnrollments || 0) / totalEnrollments) * 100
          : 0

      // Average rating
      const { data: coursesWithRatings } = await supabase
        .from('courses')
        .select('average_rating')
        .not('average_rating', 'is', null)

      const avgRating =
        coursesWithRatings && coursesWithRatings.length > 0
          ? coursesWithRatings.reduce(
              (sum: number, c: any) => sum + (parseFloat(String(c.average_rating)) || 0),
              0
            ) / coursesWithRatings.length
          : 0

      // Case Metrics
      const { count: totalCases } = await supabase
        .from('tribunal_cases')
        .select('*', { count: 'exact', head: true })

      const { data: casesData } = await supabase
        .from('tribunal_cases')
        .select('views_count, bookmarks_count')

      const totalViews =
        casesData?.reduce((sum: number, c: any) => sum + (c.views_count || 0), 0) || 0
      const totalBookmarks =
        casesData?.reduce((sum: number, c: any) => sum + (c.bookmarks_count || 0), 0) || 0
      const avgViewsPerCase = totalCases && totalCases > 0 ? totalViews / totalCases : 0

      // Top Courses
      const { data: topCoursesData } = await supabase
        .from('courses')
        .select('id, title, enrollments_count, completions_count')
        .order('enrollments_count', { ascending: false })
        .limit(5)

      const topCourses = (topCoursesData || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        enrollments: c.enrollments_count || 0,
        completions: c.completions_count || 0,
        completionRate:
          c.enrollments_count && c.enrollments_count > 0
            ? ((c.completions_count || 0) / c.enrollments_count) * 100
            : 0,
      }))

      // Top Cases
      const { data: topCasesData } = await supabase
        .from('tribunal_cases')
        .select('id, case_number, case_title, views_count')
        .order('views_count', { ascending: false })
        .limit(5)

      const topCases = (topCasesData || []).map((c: any) => ({
        id: c.id,
        case_number: c.case_number,
        case_title: c.case_title,
        views: c.views_count || 0,
      }))

      setAnalytics({
        userGrowth: {
          total: totalUsers || 0,
          thisMonth: thisMonthUsers || 0,
          lastMonth: lastMonthUsers || 0,
          growthRate: userGrowthRate,
        },
        courseMetrics: {
          totalCourses: totalCourses || 0,
          published: publishedCourses || 0,
          totalEnrollments: totalEnrollments || 0,
          completionRate,
          avgRating,
        },
        caseMetrics: {
          totalCases: totalCases || 0,
          totalViews,
          avgViewsPerCase,
          totalBookmarks,
        },
        topCourses,
        topCases,
        recentActivity: [],
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-1 text-gray-600">Platform performance and insights</p>
              </div>
            </div>
          </div>

          {/* User Growth Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">User Growth</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.userGrowth.total}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.userGrowth.thisMonth}
                </div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.userGrowth.lastMonth}
                </div>
                <div className="text-sm text-gray-600">Last Month</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      analytics.userGrowth.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Target
                      className={`h-5 w-5 ${
                        analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    />
                  </div>
                </div>
                <div
                  className={`mb-1 text-3xl font-bold ${
                    analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.userGrowth.growthRate > 0 ? '+' : ''}
                  {analytics.userGrowth.growthRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
            </div>
          </div>

          {/* Course Metrics Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Performance</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.courseMetrics.totalCourses}
                </div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.courseMetrics.published}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.courseMetrics.totalEnrollments}
                </div>
                <div className="text-sm text-gray-600">Enrollments</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.courseMetrics.completionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.courseMetrics.avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Case Metrics Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Case Engagement</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.caseMetrics.totalCases}
                </div>
                <div className="text-sm text-gray-600">Total Cases</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.caseMetrics.totalViews}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {Math.round(analytics.caseMetrics.avgViewsPerCase)}
                </div>
                <div className="text-sm text-gray-600">Avg Views/Case</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">
                  {analytics.caseMetrics.totalBookmarks}
                </div>
                <div className="text-sm text-gray-600">Bookmarks</div>
              </div>
            </div>
          </div>

          {/* Top Content Section */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Top Courses */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Top Courses</h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-200">
                  {analytics.topCourses.map((course, index) => (
                    <div key={course.id} className="p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 font-semibold text-purple-600">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-600">
                            {course.enrollments} enrollments • {course.completions} completed •{' '}
                            {course.completionRate.toFixed(0)}% rate
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
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Top Cases</h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-200">
                  {analytics.topCases.map((tribunalCase, index) => (
                    <div key={tribunalCase.id} className="p-4 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-gray-900">
                            {tribunalCase.case_title}
                          </div>
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
      </main>{' '}
    </div>
  )
}
