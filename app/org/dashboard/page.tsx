'use client'

import { logger } from '@/lib/utils/production-logger'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEntitlements } from '@/hooks/use-entitlements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  UserPlus,
  Settings,
  BarChart3,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: string
  seat_limit: number
  admin_email: string
}

interface Profile {
  id: string
  email: string
  full_name: string
  organization_id: string
}

interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number // enrollments table uses progress_percentage
  completion_percentage?: number // Keep for backwards compatibility
  last_accessed_at: string
  status: string
  courses?: {
    id: string
    title: string
  }
}

interface Certificate {
  id: string
  user_id: string
  course_id: string
  completion_score: number
  issued_at: string
  user_name: string
  course_title: string
}

interface Course {
  id: string
  title: string
  description: string
}

export default function OrgDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [allProgress, setAllProgress] = useState<CourseProgress[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { entitlements } = useEntitlements()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !currentUser) {
        router.push('/auth/sign-in')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError) throw profileError
      setUser({ ...currentUser, ...profile })

      // Check if user has organization
      if (!profile.organization_id) {
        setError('You are not part of any organization. Please contact your administrator.')
        setLoading(false)
        return
      }

      // Get organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

      if (orgError) throw orgError
      setOrganization(org)

      // Get all organization members
      const { data: orgMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)

      if (membersError) throw membersError
      setMembers(orgMembers || [])

      // Get member IDs for queries
      const memberIds = (orgMembers || []).map((m: any) => m.id)

      // Get all enrollments (course progress) for organization members
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*, courses(id, title)')
        .in('user_id', memberIds)

      if (enrollmentsError) throw enrollmentsError
      setAllProgress(enrollments || [])

      // Get all certificates for organization members
      const { data: certs, error: certsError } = await supabase
        .from('certificates')
        .select(
          `
          id,
          user_id,
          course_id,
          completion_score,
          issued_at,
          recipient_name,
          courses(title)
        `
        )
        .in('user_id', memberIds)
        .order('issued_at', { ascending: false })

      if (certsError) throw certsError

      const formattedCerts = (certs || []).map((cert: any) => ({
        id: cert.id,
        user_id: cert.user_id,
        course_id: cert.course_id,
        completion_score: cert.completion_score,
        issued_at: cert.issued_at,
        user_name: cert.recipient_name || 'Unknown',
        course_title: cert.courses?.title || 'Unknown Course',
      }))
      setCertificates(formattedCerts)

      // Get all courses
      const { data: allCourses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('published', true)

      if (coursesError) throw coursesError
      setCourses(allCourses || [])
    } catch (err: any) {
      logger.error('Failed to load organization dashboard:', {
        error: err,
        context: 'OrgDashboardPage',
      })
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        {' '}
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading organization dashboard...</p>
          </div>
        </div>{' '}
      </>
    )
  }

  if (error) {
    return (
      <>
        {' '}
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Error</h2>
              <p className="mb-6 text-gray-600">{error}</p>
              <Link href="/">
                <Button className="bg-teal-600 text-white hover:bg-teal-700">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>{' '}
      </>
    )
  }

  if (!organization) {
    return (
      <>
        {' '}
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">No Organization Found</h2>
              <p className="mb-6 text-gray-600">
                You&apos;re not part of any organization yet. Contact your administrator or upgrade
                to Enterprise.
              </p>
              <Link href="/">
                <Button className="bg-teal-600 text-white hover:bg-teal-700">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>{' '}
      </>
    )
  }

  // Helper function to get completion percentage (handles both progress_percentage and completion_percentage)
  const getCompletionPercentage = (progress: CourseProgress): number => {
    return progress.progress_percentage ?? progress.completion_percentage ?? 0
  }

  // Calculate metrics
  const totalMembers = members.length
  const seatCount = entitlements?.seatCount ?? organization.seat_limit
  const seatsUsed = entitlements?.seatsUsed ?? totalMembers
  const seatsAvailable = entitlements?.seatsAvailable ?? Math.max(0, seatCount - totalMembers)
  const completedCourses = allProgress.filter((p) => getCompletionPercentage(p) === 100).length
  const totalCertificates = certificates.length
  const avgCompletion =
    allProgress.length > 0
      ? allProgress.reduce((sum, p) => sum + getCompletionPercentage(p), 0) / allProgress.length
      : 0

  // Course progress breakdown
  const courseProgress = courses.slice(0, 6).map((course) => {
    const courseProgressRecords = allProgress.filter((p) => p.course_id === course.id)
    const avgProgress =
      courseProgressRecords.length > 0
        ? courseProgressRecords.reduce((sum, p) => sum + getCompletionPercentage(p), 0) /
          courseProgressRecords.length
        : 0
    return {
      name: course.title.substring(0, 25) + (course.title.length > 25 ? '...' : ''),
      progress: avgProgress.toFixed(0),
      enrolled: courseProgressRecords.length,
    }
  })

  // Engagement data
  const activeLearners = allProgress.filter((p) => getCompletionPercentage(p) > 0).length
  const notStarted = totalMembers - activeLearners

  return (
    <>
      {' '}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{organization.name}</h1>
                  <p className="text-gray-600">Organization Dashboard</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/team">
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                </Link>
                <Link href="/admin/org-settings">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Team Members</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalMembers}</div>
                <p className="mt-1 text-xs text-gray-500">
                  {seatsUsed} / {seatCount === -1 ? 'Unlimited' : seatCount} seats used
                </p>
                {seatsAvailable > 0 && seatCount !== -1 && (
                  <p className="mt-1 text-xs text-green-600">{seatsAvailable} seats available</p>
                )}
                {seatsAvailable === 0 && seatCount !== -1 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No seats available - upgrade to add more
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Completion</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{avgCompletion.toFixed(0)}%</div>
                <Progress value={avgCompletion} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Courses Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{completedCourses}</div>
                <p className="mt-1 text-xs text-gray-500">Across all team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Certificates Earned
                </CardTitle>
                <Award className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalCertificates}</div>
                <p className="mt-1 text-xs text-gray-500">Team achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 width */}
            <div className="space-y-6 lg:col-span-2">
              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Team Progress by Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseProgress.length > 0 ? (
                    <div className="space-y-4">
                      {courseProgress.map((course, index) => (
                        <div key={index}>
                          <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-700">{course.name}</span>
                            <span className="font-semibold text-gray-900">
                              {course.progress}% â€¢ {course.enrolled} enrolled
                            </span>
                          </div>
                          <Progress value={Number(course.progress)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <BarChart3 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">No course progress yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-teal-50 p-4">
                      <div className="text-3xl font-bold text-teal-600">{activeLearners}</div>
                      <p className="mt-1 text-sm text-gray-600">Active Learners</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="text-3xl font-bold text-gray-600">{notStarted}</div>
                      <p className="mt-1 text-sm text-gray-600">Not Started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.slice(0, 5).map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between rounded-lg bg-green-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{cert.user_name}</p>
                              <p className="max-w-xs truncate text-sm text-gray-600">
                                {cert.course_title}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {cert.completion_score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Award className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">No certifications yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/team">
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Team Members
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Full Analytics
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-700">Team Training Completion</span>
                        <span className="font-semibold text-gray-900">
                          {avgCompletion.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={avgCompletion} className="h-2" />
                    </div>
                    <div className="space-y-2 border-t pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Certified Members</span>
                        <span className="font-semibold text-gray-900">
                          {certificates.length} / {totalMembers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Learners</span>
                        <span className="font-semibold text-gray-900">{activeLearners}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    Our team is here to support your organization&apos;s anti-racism training
                    journey.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="outline" className="w-full">
                      View Documentation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>{' '}
    </>
  )
}
