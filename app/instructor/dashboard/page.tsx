'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useEntitlements } from '@/hooks/use-entitlements'
import {
  instructorsService,
  type InstructorDashboardSummary,
  type InstructorAnalytics,
  type InstructorCourseWithStats,
} from '@/lib/services/instructors'
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  MessageSquare,
  Plus,
  Eye,
  Edit3,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react'

export default function InstructorDashboardPage() {
  const router = useRouter()
  const { entitlements, canPerformAction } = useEntitlements()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<InstructorDashboardSummary | null>(null)
  const [courses, setCourses] = useState<InstructorCourseWithStats[]>([])
  const [analytics, setAnalytics] = useState<InstructorAnalytics[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [recentStudents, setRecentStudents] = useState<any[]>([])
  const [popularLessons, setPopularLessons] = useState<any[]>([])
  const [recentAnnouncements, setAnnouncements] = useState<any[]>([])

  const loadAnalytics = useCallback(async () => {
    if (!user) return

    try {
      const profile = await instructorsService.getProfile(user.id)
      if (!profile) return

      const analyticsData = await instructorsService.getAnalyticsTimeSeries(
        profile.id,
        selectedPeriod,
        12
      )
      setAnalytics(analyticsData)
    } catch (error) {
      logger.error('Failed to load analytics:', {
        error: error,
        context: 'InstructorDashboardPage',
      })
    }
  }, [user, selectedPeriod])

  const loadDashboardData = useCallback(async (userId: string) => {
    try {
      // Load summary
      const dashboardSummary = await instructorsService.getDashboardSummary(userId)
      setSummary(dashboardSummary)

      // Load instructor profile to get instructor_id
      const profile = await instructorsService.getProfile(userId)
      if (!profile) return

      // Load courses with stats
      const coursesWithStats = await instructorsService.getInstructorCourses(profile.id)
      setCourses(coursesWithStats)
    } catch (error) {
      logger.error('Failed to load dashboard data:', {
        error: error,
        context: 'InstructorDashboardPage',
      })
    }
  }, [])

  const checkAuthAndLoadData = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setUser(currentUser)

    // Check if user is an instructor
    const isInstructor = await instructorsService.isInstructor(currentUser.id)

    if (!isInstructor) {
      alert('You are not registered as an instructor. Please contact an administrator.')
      router.push('/dashboard')
      return
    }

    await loadDashboardData(currentUser.id)
    setIsLoading(false)
  }, [router, loadDashboardData])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [checkAuthAndLoadData])

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, loadAnalytics])

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      draft: { label: 'Draft', color: 'bg-gray-200 text-gray-700' },
      in_review: { label: 'In Review', color: 'bg-blue-200 text-blue-700' },
      needs_revision: { label: 'Needs Revision', color: 'bg-yellow-200 text-yellow-700' },
      approved: { label: 'Approved', color: 'bg-green-200 text-green-700' },
      published: { label: 'Published', color: 'bg-purple-200 text-purple-700' },
      archived: { label: 'Archived', color: 'bg-red-200 text-red-700' },
    }

    const badge = badges[status] || badges.draft

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
      >
        {badge.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount)
  }

  const calculateCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentCourseCount = summary?.total_courses || 0
  const maxCourses = entitlements?.features.maxCoursesAuthored ?? 0
  const canCreateCourse = maxCourses === -1 || currentCourseCount < maxCourses

  const handleCreateCourse = async () => {
    if (!canCreateCourse) {
      alert(
        `You've reached your course creation limit (${maxCourses} courses). Please upgrade your plan to create more courses.`
      )
      router.push('/pricing?feature=course-creation&upgrade=required')
      return
    }

    router.push('/instructor/courses/create')
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s an overview of your teaching activity.
          </p>
          {maxCourses !== -1 && (
            <p className="mt-1 text-sm text-gray-500">
              Courses: {currentCourseCount} / {maxCourses}
            </p>
          )}
        </div>
        <button
          onClick={handleCreateCourse}
          disabled={!canCreateCourse}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors ${
            canCreateCourse
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-400 opacity-60'
          }`}
        >
          <Plus className="h-5 w-5" />
          Create New Course
          {!canCreateCourse && ' (Limit Reached)'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{summary?.total_courses || 0}</div>
              <div className="text-xs text-gray-500">Total Courses</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">{summary?.published_courses || 0} published</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{summary?.total_students || 0}</div>
              <div className="text-xs text-gray-500">Total Students</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">Across all courses</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {summary?.avg_course_rating ? summary.avg_course_rating.toFixed(1) : 'â€”'}
              </div>
              <div className="text-xs text-gray-500">Avg Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= (summary?.avg_course_rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.total_earnings_paid || 0)}
              </div>
              <div className="text-xs text-gray-500">Earnings Paid</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {formatCurrency(summary?.total_earnings_pending || 0)} pending
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('daily')}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                selectedPeriod === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedPeriod('weekly')}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                selectedPeriod === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                selectedPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {analytics.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Student Metrics
              </div>
              {analytics.slice(0, 5).map((period, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(period.period_start).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-gray-900">
                    {period.total_students} students
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle className="h-4 w-4" />
                Completions
              </div>
              {analytics.slice(0, 5).map((period, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(period.period_start).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-gray-900">
                    {period.completed_students} completed
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquare className="h-4 w-4" />
                Engagement
              </div>
              {analytics.slice(0, 5).map((period, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(period.period_start).toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-gray-900">
                    {period.total_questions_answered} answered
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">No analytics data available yet</div>
        )}
      </div>

      {/* My Courses */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mb-4 text-gray-500">
                      You haven&apos;t created any courses yet
                    </div>
                    <button
                      onClick={() => router.push('/instructor/courses/create')}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Course
                    </button>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.course_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-200">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">/{course.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(course.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{course.enrollments}</div>
                      <div className="text-xs text-gray-500">
                        {course.is_published ? 'published' : 'draft'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-green-600 transition-all"
                            style={{
                              width: `${calculateCompletionRate(
                                course.completions,
                                course.enrollments
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {calculateCompletionRate(course.completions, course.enrollments)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.avg_rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {course.avg_rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">({course.total_reviews})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/courses/${course.slug}`)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          title="View Course"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/instructor/courses/${course.course_id}/edit`)
                          }
                          className="rounded p-1 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                          title="Edit Course"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/instructor/courses/${course.course_id}/analytics`)
                          }
                          className="rounded p-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <button
          onClick={() => router.push('/instructor/earnings')}
          className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <DollarSign className="mb-3 h-8 w-8 text-blue-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900">View Earnings</h3>
          <p className="text-sm text-gray-600">Track your revenue and payouts</p>
        </button>

        <button
          onClick={() => router.push('/instructor/messages')}
          className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <MessageSquare className="mb-3 h-8 w-8 text-blue-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900">Student Messages</h3>
          <p className="text-sm text-gray-600">Communicate with your students</p>
        </button>

        <button
          onClick={() => router.push('/instructor/profile')}
          className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Award className="mb-3 h-8 w-8 text-blue-600" />
          <h3 className="mb-1 text-lg font-semibold text-gray-900">Edit Profile</h3>
          <p className="text-sm text-gray-600">Update your instructor information</p>
        </button>
      </div>
    </div>
  )
}
