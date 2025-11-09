'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
  completion_percentage: number
  last_accessed_at: string
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

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
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
      const memberIds = (orgMembers || []).map(m => m.id)

      // Get all progress for organization members
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .in('user_id', memberIds)

      if (progressError) throw progressError
      setAllProgress(progress || [])

      // Get all certificates for organization members
      const { data: certs, error: certsError } = await supabase
        .from('certificates')
        .select(`
          id,
          user_id,
          course_id,
          completion_score,
          issued_at,
          profiles!inner(full_name),
          courses!inner(title)
        `)
        .in('user_id', memberIds)
        .order('issued_at', { ascending: false })

      if (certsError) throw certsError
      
      const formattedCerts = (certs || []).map(cert => ({
        id: cert.id,
        user_id: cert.user_id,
        course_id: cert.course_id,
        completion_score: cert.completion_score,
        issued_at: cert.issued_at,
        user_name: (cert.profiles as any)?.full_name || 'Unknown',
        course_title: (cert.courses as any)?.title || 'Unknown Course',
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
      console.error('Failed to load organization dashboard:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading organization dashboard...</p>
          </div>
        </div>      </>
    )
  }

  if (error) {
    return (
      <>        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>      </>
    )
  }

  if (!organization) {
    return (
      <>        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization Found</h2>
              <p className="text-gray-600 mb-6">
                You&apos;re not part of any organization yet. Contact your administrator or upgrade to Enterprise.
              </p>
              <Link href="/">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>      </>
    )
  }

  // Calculate metrics
  const totalMembers = members.length
  const seatsAvailable = organization.seat_limit - totalMembers
  const completedCourses = allProgress.filter(p => p.completion_percentage === 100).length
  const totalCertificates = certificates.length
  const avgCompletion = allProgress.length > 0
    ? allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length
    : 0

  // Course progress breakdown
  const courseProgress = courses.slice(0, 6).map(course => {
    const courseProgressRecords = allProgress.filter(p => p.course_id === course.id)
    const avgProgress = courseProgressRecords.length > 0
      ? courseProgressRecords.reduce((sum, p) => sum + p.completion_percentage, 0) / courseProgressRecords.length
      : 0
    return {
      name: course.title.substring(0, 25) + (course.title.length > 25 ? '...' : ''),
      progress: avgProgress.toFixed(0),
      enrolled: courseProgressRecords.length,
    }
  })

  // Engagement data
  const activeLearners = allProgress.filter(p => p.completion_percentage > 0).length
  const notStarted = totalMembers - activeLearners

  return (
    <>      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{organization.name}</h1>
                  <p className="text-gray-600">Organization Dashboard</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/team">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </Link>
                <Link href="/admin/org-settings">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Team Members
                </CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalMembers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {seatsAvailable} seats available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Completion
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{avgCompletion.toFixed(0)}%</div>
                <Progress value={avgCompletion} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Courses Completed
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{completedCourses}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Across all team members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Certificates Earned
                </CardTitle>
                <Award className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{totalCertificates}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Team achievements
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Team Progress by Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseProgress.length > 0 ? (
                    <div className="space-y-4">
                      {courseProgress.map((course, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-700">{course.name}</span>
                            <span className="font-semibold text-gray-900">
                              {course.progress}% • {course.enrolled} enrolled
                            </span>
                          </div>
                          <Progress value={Number(course.progress)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No course progress yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-teal-50 rounded-lg">
                      <div className="text-3xl font-bold text-teal-600">{activeLearners}</div>
                      <p className="text-sm text-gray-600 mt-1">Active Learners</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-600">{notStarted}</div>
                      <p className="text-sm text-gray-600 mt-1">Not Started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Recent Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.slice(0, 5).map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{cert.user_name}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">{cert.course_title}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {cert.completion_score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
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
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Team Members
                    </Button>
                  </Link>
                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700">Team Training Completion</span>
                        <span className="font-semibold text-gray-900">{avgCompletion.toFixed(0)}%</span>
                      </div>
                      <Progress value={avgCompletion} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Certified Members</span>
                        <span className="font-semibold text-gray-900">
                          {certificates.length} / {totalMembers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Learners</span>
                        <span className="font-semibold text-gray-900">
                          {activeLearners}
                        </span>
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
                    Our team is here to support your organization&apos;s anti-racism training journey.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
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
      </div>    </>
  )
}
