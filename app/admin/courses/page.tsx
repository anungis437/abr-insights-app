'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { PermissionGate } from '@/components/shared/PermissionGate'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Users,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string
  level: string
  required_tier: string
  is_published: boolean
  is_featured: boolean
  estimated_duration_minutes: number
  enrollments_count: number
  completions_count: number
  average_rating: number
  created_at: string
  updated_at: string
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const checkAuthAndLoadCourses = async () => {
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

      // Check admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

      logger.db('Profile lookup', 'profiles', { userId: currentUser.id, hasData: !!profileData })
      if (profileError) {
        logger.error('Profile fetch error', profileError)
      }

      const isAdmin =
        profileData?.role === 'super_admin' ||
        profileData?.role === 'org_admin' ||
        profileData?.role === 'educator'

      logger.auth('User role check', { role: profileData?.role, isAdmin })

      if (!isAdmin) {
        logger.warn('Unauthorized, redirecting to dashboard', { role: profileData?.role })
        router.push('/dashboard')
        return
      }

      logger.auth('Authorization successful, loading courses')
      // Load courses
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && coursesData) {
        setCourses(coursesData)
        setFilteredCourses(coursesData)
      }

      setIsLoading(false)
    }

    checkAuthAndLoadCourses()
  }, [router])

  // Apply filters
  useEffect(() => {
    let filtered = [...courses]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter((course) => course.level === filterLevel)
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter((course) => course.required_tier === filterTier)
    }

    // Status filter
    if (filterStatus === 'published') {
      filtered = filtered.filter((course) => course.is_published)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter((course) => !course.is_published)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, filterLevel, filterTier, filterStatus, courses])

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq('id', courseId)

    if (!error) {
      setCourses(
        courses.map((c) => (c.id === courseId ? { ...c, is_published: !currentStatus } : c))
      )
    }
  }

  const handleToggleFeatured = async (courseId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({ is_featured: !currentStatus })
      .eq('id', courseId)

    if (!error) {
      setCourses(
        courses.map((c) => (c.id === courseId ? { ...c, is_featured: !currentStatus } : c))
      )
    }
  }

  const handleDelete = async (courseId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this course? This will also delete all modules and lessons.'
      )
    ) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('courses').delete().eq('id', courseId)

    if (!error) {
      setCourses(courses.filter((c) => c.id !== courseId))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    draft: courses.filter((c) => !c.is_published).length,
    featured: courses.filter((c) => c.is_featured).length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollments_count || 0), 0),
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                  <p className="mt-1 text-gray-600">Manage training courses and learning content</p>
                </div>
              </div>
              <PermissionGate permission={['courses.create', 'courses.manage']} requireAny>
                <button
                  onClick={() => router.push('/admin/courses/create')}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white transition-all hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Create Course
                </button>
              </PermissionGate>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Courses</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <EyeOff className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                    <div className="text-sm text-gray-600">Drafts</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.featured}</div>
                    <div className="text-sm text-gray-600">Featured</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</div>
                    <div className="text-sm text-gray-600">Enrollments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="min-w-[300px] flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Level Filter */}
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter courses by level"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter courses by tier"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Filter courses by status"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No courses found</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          width={128}
                          height={96}
                          className="h-24 w-32 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-gray-200">
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                            {course.is_featured && (
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                Featured
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 ${course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium`}
                            >
                              {course.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm text-gray-600">{course.description}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.estimated_duration_minutes
                            ? `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m`
                            : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrollments_count || 0} enrolled
                        </span>
                        <span className="capitalize">{course.level || 'N/A'}</span>
                        <span className="capitalize">{course.required_tier || 'free'} tier</span>
                        {course.average_rating && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {course.average_rating.toFixed(1)} rating
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <PermissionGate
                          permission={['courses.update', 'courses.manage']}
                          requireAny
                        >
                          <button
                            onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>
                        </PermissionGate>
                        <PermissionGate
                          permission={['courses.publish', 'courses.manage']}
                          requireAny
                        >
                          <button
                            onClick={() => handleTogglePublish(course.id, course.is_published)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                              course.is_published
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {course.is_published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            {course.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="courses.manage">
                          <button
                            onClick={() => handleToggleFeatured(course.id, course.is_featured)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                              course.is_featured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Award className="h-4 w-4" />
                            {course.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                        </PermissionGate>
                        <PermissionGate
                          permission={['courses.delete', 'courses.manage']}
                          requireAny
                        >
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="ml-auto flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>{' '}
    </div>
  )
}
