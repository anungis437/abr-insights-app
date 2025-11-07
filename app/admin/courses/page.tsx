'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Award
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      console.log('[Courses Page] Current user:', currentUser?.id, currentUser?.email)
      if (!currentUser) {
        console.log('[Courses Page] No user found, redirecting to login')
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

      console.log('[Courses Page] Profile data:', profileData)
      console.log('[Courses Page] Profile error:', profileError)

      const isAdmin = 
        profileData?.role === 'super_admin' ||
        profileData?.role === 'org_admin' ||
        profileData?.role === 'educator'

      console.log('[Courses Page] User role:', profileData?.role, 'isAdmin:', isAdmin)

      if (!isAdmin) {
        console.log('[Courses Page] Unauthorized, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      console.log('[Courses Page] Authorization successful, loading courses')
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
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(course => course.level === filterLevel)
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(course => course.required_tier === filterTier)
    }

    // Status filter
    if (filterStatus === 'published') {
      filtered = filtered.filter(course => course.is_published)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(course => !course.is_published)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, filterLevel, filterTier, filterStatus, courses])

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({ 
        is_published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', courseId)

    if (!error) {
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, is_published: !currentStatus }
          : c
      ))
    }
  }

  const handleToggleFeatured = async (courseId: string, currentStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({ is_featured: !currentStatus })
      .eq('id', courseId)

    if (!error) {
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, is_featured: !currentStatus }
          : c
      ))
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all modules and lessons.')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (!error) {
      setCourses(courses.filter(c => c.id !== courseId))
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
  const stats = {
    total: courses.length,
    published: courses.filter(c => c.is_published).length,
    draft: courses.filter(c => !c.is_published).length,
    featured: courses.filter(c => c.is_featured).length,
    totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollments_count || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                  <p className="text-gray-600 mt-1">Manage training courses and learning content</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/courses/create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Courses</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                    <div className="text-sm text-gray-600">Drafts</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.featured}</div>
                    <div className="text-sm text-gray-600">Featured</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</div>
                    <div className="text-sm text-gray-600">Enrollments</div>
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
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Level Filter */}
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                            {course.is_featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-1 ${course.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium rounded-full`}>
                              {course.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.estimated_duration_minutes ? `${Math.floor(course.estimated_duration_minutes / 60)}h ${course.estimated_duration_minutes % 60}m` : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.enrollments_count || 0} enrolled
                        </span>
                        <span className="capitalize">{course.level || 'N/A'}</span>
                        <span className="capitalize">{course.required_tier || 'free'} tier</span>
                        {course.average_rating && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {course.average_rating.toFixed(1)} rating
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.is_published)}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            course.is_published
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(course.id, course.is_featured)}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            course.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Award className="w-4 h-4" />
                          {course.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>    </div>
  )
}
