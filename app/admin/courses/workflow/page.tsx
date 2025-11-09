'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { courseWorkflowService, type CourseWorkflowSummary } from '@/lib/services/course-workflow'
import { 
  BookOpen, 
  Search, 
  Filter, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  Send,
  Archive,
  TrendingUp
} from 'lucide-react'

type WorkflowStatus = 'draft' | 'in_review' | 'needs_revision' | 'approved' | 'published' | 'archived'

export default function CourseWorkflowPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<CourseWorkflowSummary[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseWorkflowSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | 'all'>('all')
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())

  // Stats
  const [stats, setStats] = useState({
    draft: 0,
    in_review: 0,
    needs_revision: 0,
    approved: 0,
    published: 0,
    archived: 0
  })

  useEffect(() => {
    checkAuthAndLoadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, filterStatus])

  const checkAuthAndLoadCourses = async () => {
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setUser(currentUser)

    // Check admin role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    const isAdmin = 
      profileData?.role === 'super_admin' ||
      profileData?.role === 'org_admin' ||
      profileData?.role === 'educator'

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    await loadCourses()
    setIsLoading(false)
  }

  const loadCourses = async () => {
    try {
      const summaries = await courseWorkflowService.getWorkflowSummary()
      setCourses(summaries)
      
      // Calculate stats
      const statusCounts = summaries.reduce((acc, course) => {
        const status = course.workflow_status as WorkflowStatus
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<WorkflowStatus, number>)
      
      setStats({
        draft: statusCounts.draft || 0,
        in_review: statusCounts.in_review || 0,
        needs_revision: statusCounts.needs_revision || 0,
        approved: statusCounts.approved || 0,
        published: statusCounts.published || 0,
        archived: statusCounts.archived || 0
      })
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.workflow_status === filterStatus)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.instructor_name?.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query)
      )
    }

    setFilteredCourses(filtered)
  }

  const toggleCourseSelection = (courseId: string) => {
    const newSelected = new Set(selectedCourses)
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId)
    } else {
      newSelected.add(courseId)
    }
    setSelectedCourses(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set())
    } else {
      setSelectedCourses(new Set(filteredCourses.map(c => c.course_id)))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedCourses.size === 0) return
    
    if (!confirm(`Approve ${selectedCourses.size} course(s)? This will move them to Approved status.`)) {
      return
    }

    try {
      const promises = Array.from(selectedCourses).map(courseId =>
        courseWorkflowService.approveCourse(courseId, user.id, 'Bulk approval by administrator')
      )
      
      await Promise.all(promises)
      
      alert(`Successfully approved ${selectedCourses.size} course(s)`)
      setSelectedCourses(new Set())
      await loadCourses()
    } catch (error) {
      console.error('Bulk approve failed:', error)
      alert('Failed to approve some courses. Check console for details.')
    }
  }

  const handleBulkArchive = async () => {
    if (selectedCourses.size === 0) return
    
    if (!confirm(`Archive ${selectedCourses.size} course(s)? Archived courses are hidden from students.`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('courses')
        .update({ workflow_status: 'archived', updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedCourses))
      
      if (error) throw error
      
      alert(`Successfully archived ${selectedCourses.size} course(s)`)
      setSelectedCourses(new Set())
      await loadCourses()
    } catch (error) {
      console.error('Bulk archive failed:', error)
      alert('Failed to archive courses')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Draft', color: 'bg-gray-200 text-gray-700', icon: FileText },
      in_review: { label: 'In Review', color: 'bg-blue-200 text-blue-700', icon: Clock },
      needs_revision: { label: 'Needs Revision', color: 'bg-yellow-200 text-yellow-700', icon: AlertCircle },
      approved: { label: 'Approved', color: 'bg-green-200 text-green-700', icon: CheckCircle },
      published: { label: 'Published', color: 'bg-purple-200 text-purple-700', icon: Send },
      archived: { label: 'Archived', color: 'bg-red-200 text-red-700', icon: Archive }
    }
    
    const badge = badges[status as WorkflowStatus] || badges.draft
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const getQualityBadge = (completion: number | null) => {
    if (completion === null) {
      return <span className="text-xs text-gray-500">Not checked</span>
    }
    
    let color = 'text-red-600'
    let bgColor = 'bg-red-100'
    
    if (completion >= 90) {
      color = 'text-green-600'
      bgColor = 'bg-green-100'
    } else if (completion >= 50) {
      color = 'text-yellow-600'
      bgColor = 'bg-yellow-100'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color} ${bgColor}`}>
        {completion}% Complete
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Workflow Management</h1>
        <p className="text-gray-600">Review, approve, and manage courses through the development pipeline</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <button
          onClick={() => setFilterStatus('draft')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'draft' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.draft}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Draft</div>
        </button>

        <button
          onClick={() => setFilterStatus('in_review')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'in_review' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.in_review}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">In Review</div>
        </button>

        <button
          onClick={() => setFilterStatus('needs_revision')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'needs_revision' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.needs_revision}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Needs Revision</div>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'approved' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.approved}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Approved</div>
        </button>

        <button
          onClick={() => setFilterStatus('published')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'published' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Send className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.published}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Published</div>
        </button>

        <button
          onClick={() => setFilterStatus('archived')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filterStatus === 'archived' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Archive className="h-5 w-5 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.archived}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Archived</div>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, instructor, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as WorkflowStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCourses.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Selected
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No courses found matching your filters
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.course_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCourses.has(course.course_id)}
                        onChange={() => toggleCourseSelection(course.course_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">/{course.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{course.instructor_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{course.instructor_email || '—'}</div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(course.workflow_status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">v{course.version_number || '1.0.0'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">
                          {course.total_reviews || 0} total
                        </div>
                        {(course.total_reviews - course.completed_reviews) > 0 && (
                          <div className="text-xs text-blue-600">
                            {course.total_reviews - course.completed_reviews} pending
                          </div>
                        )}
                        {course.rejected_reviews > 0 && (
                          <div className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {course.rejected_reviews} blocked
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getQualityBadge(course.quality_checklist_completion || null)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/courses/${course.course_id}`)}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/courses/workflow/${course.course_id}/review`)}
                          className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded"
                          title="Review Course"
                        >
                          <MessageSquare className="h-4 w-4" />
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

      {/* Results Count */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>
    </div>
  )
}
