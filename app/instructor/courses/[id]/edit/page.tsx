'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Clock,
  History,
  Upload,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Loader2,
} from 'lucide-react'
import QualityChecklist from '@/components/course-authoring/QualityChecklist'
import { courseWorkflowService, type WorkflowStatus } from '@/lib/services/course-workflow'
import { instructorsService } from '@/lib/services/instructors'

type TabType = 'details' | 'content' | 'quality' | 'versions' | 'preview'

export default function InstructorCourseEditPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)
  const [isInstructor, setIsInstructor] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submissionNotes, setSubmissionNotes] = useState('')

  // Course data
  const [course, setCourse] = useState<any>(null)
  const [workflowSummary, setWorkflowSummary] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    cover_image_url: '',
    category_id: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimated_duration_minutes: 60,
    learning_objectives: [''],
    prerequisites: [''],
    tags: [''],
    meta_title: '',
    meta_description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [courseId])

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check authentication
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login?redirect=/instructor/courses')
        return
      }
      setUser(authUser)

      // Check if user is an active instructor
      const instructorCheck = await instructorsService.isInstructor(authUser.id)
      if (!instructorCheck) {
        router.push('/instructor/dashboard?error=not_instructor')
        return
      }
      setIsInstructor(true)

      // Load course data
      await loadCourse()
      await loadCategories()
      await loadWorkflowSummary()
      await loadVersions()
    } catch (error) {
      logger.error('Error in checkAuthAndLoadData:', {
        error: error,
        context: 'InstructorCourseEditPage',
      })
    } finally {
      setIsLoading(false)
    }
  }, [courseId, router])

  useEffect(() => {
    checkAuthAndLoadData()
  }, [checkAuthAndLoadData])

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()

      if (error) throw error
      if (!data) {
        router.push('/instructor/dashboard?error=course_not_found')
        return
      }

      setCourse(data)

      // Populate form
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        thumbnail_url: data.thumbnail_url || '',
        cover_image_url: data.cover_image_url || '',
        category_id: data.category_id || '',
        level: data.level || 'beginner',
        estimated_duration_minutes: data.estimated_duration_minutes || 60,
        learning_objectives: data.learning_objectives || [''],
        prerequisites: data.prerequisites || [''],
        tags: data.tags || [''],
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
      })
    } catch (error) {
      logger.error('Error loading course:', { error: error, context: 'InstructorCourseEditPage' })
      setErrors({ general: 'Failed to load course data' })
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      logger.error('Error loading categories:', {
        error: error,
        context: 'InstructorCourseEditPage',
      })
    }
  }

  const loadWorkflowSummary = async () => {
    try {
      const summary = await courseWorkflowService.getWorkflowSummary(courseId)
      setWorkflowSummary(summary)
    } catch (error) {
      logger.error('Error loading workflow summary:', {
        error: error,
        context: 'InstructorCourseEditPage',
      })
    }
  }

  const loadVersions = async () => {
    try {
      const versionData = await courseWorkflowService.getVersions(courseId)
      setVersions(versionData)
    } catch (error) {
      logger.error('Error loading versions:', { error: error, context: 'InstructorCourseEditPage' })
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrors({})
      setSuccessMessage(null)

      // Validate
      const newErrors: Record<string, string> = {}
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (!formData.category_id) newErrors.category_id = 'Category is required'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Update course
      const { error } = await supabase
        .from('courses')
        .update({
          ...formData,
          last_modified_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId)

      if (error) throw error

      setSuccessMessage('Course saved successfully')
      await loadCourse()
      await loadWorkflowSummary()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      logger.error('Error saving course:', { error: error, context: 'InstructorCourseEditPage' })
      setErrors({ general: 'Failed to save course' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    try {
      setIsSaving(true)
      setErrors({})

      // Check quality checklist completion
      if (workflowSummary?.quality_checklist_completion < 80) {
        setErrors({
          general: 'Quality checklist must be at least 80% complete before submitting for review',
        })
        return
      }

      // Submit for review
      const result = await courseWorkflowService.submitForReview(
        courseId,
        user.id,
        submissionNotes.trim() || undefined
      )

      if (!result.success) {
        setErrors({ general: result.message })
        return
      }

      setSuccessMessage('Course submitted for review successfully')
      setShowSubmitModal(false)
      setSubmissionNotes('')
      await loadCourse()
      await loadWorkflowSummary()

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/instructor/dashboard?success=submitted')
      }, 2000)
    } catch (error) {
      logger.error('Error submitting for review:', {
        error: error,
        context: 'InstructorCourseEditPage',
      })
      setErrors({ general: 'Failed to submit course for review' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    window.open(`/courses/${course?.slug}?preview=true`, '_blank')
  }

  const getStatusBadge = (status: WorkflowStatus) => {
    const config: Record<WorkflowStatus, { label: string; className: string; icon: any }> = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
      in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-800', icon: Clock },
      needs_revision: {
        label: 'Needs Revision',
        className: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      published: {
        label: 'Published',
        className: 'bg-purple-100 text-purple-800',
        icon: CheckCircle,
      },
      archived: { label: 'Archived', className: 'bg-red-100 text-red-800', icon: FileText },
    }

    const { label, className, icon: Icon } = config[status] || config.draft

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${className}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </span>
    )
  }

  const canEdit =
    course?.workflow_status === 'draft' || course?.workflow_status === 'needs_revision'
  const canSubmit = canEdit && workflowSummary?.quality_checklist_completion >= 80

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isInstructor || !course) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/instructor/dashboard')}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Back to dashboard"
                title="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {formData.title || 'Edit Course'}
                </h1>
                <div className="mt-1 flex items-center gap-3">
                  {getStatusBadge(course.workflow_status)}
                  {course.version_number && (
                    <span className="text-sm text-gray-600">Version {course.version_number}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>

              {canEdit && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>

                  {canSubmit && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                      Submit for Review
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-t border-gray-200">
            {[
              { id: 'details', label: 'Course Details', icon: BookOpen },
              { id: 'content', label: 'Content & Upload', icon: Upload },
              { id: 'quality', label: 'Quality Checklist', icon: CheckCircle },
              { id: 'versions', label: 'Version History', icon: History },
              { id: 'preview', label: 'Preview Mode', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <p>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Revision Feedback */}
      {course.workflow_status === 'needs_revision' && course.rejection_reason && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Revision Required</h3>
                <p className="mt-1 text-yellow-800">{course.rejection_reason}</p>
                {course.reviewed_at && (
                  <p className="mt-2 text-sm text-yellow-700">
                    Reviewed on{' '}
                    {new Date(course.reviewed_at).toLocaleDateString('en-CA', {
                      dateStyle: 'long',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Course Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Course Information</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="e.g., Advanced Anti-Racism Training"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="e.g., advanced-anti-racism-training"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="course-category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category *
                </label>
                <select
                  id="course-category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label
                  htmlFor="course-level"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Level
                </label>
                <select
                  id="course-level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="course-duration"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Estimated Duration (minutes)
                </label>
                <input
                  id="course-duration"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_duration_minutes: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  min="0"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!canEdit}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="Provide a detailed description of the course..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="https://..."
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  disabled={!canEdit}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Content & Upload Tab */}
        {activeTab === 'content' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Content Upload & Management</h2>

            <div className="space-y-6">
              {/* Upload Areas */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-500">
                  <Video className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 font-medium text-gray-900">Upload Videos</h3>
                  <p className="text-sm text-gray-600">Drag & drop or click to browse</p>
                </div>

                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-500">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 font-medium text-gray-900">Upload Documents</h3>
                  <p className="text-sm text-gray-600">PDFs, presentations, resources</p>
                </div>

                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-500">
                  <ImageIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <h3 className="mb-1 font-medium text-gray-900">Upload Images</h3>
                  <p className="text-sm text-gray-600">Thumbnails, diagrams, photos</p>
                </div>
              </div>

              {/* Note about content upload */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="text-sm text-blue-900">
                    <p className="mb-1 font-medium">Content Upload System</p>
                    <p>
                      Full content upload wizard integration is coming soon. For now, please contact
                      the admin team to upload course materials. All content must meet quality
                      checklist requirements before submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Checklist Tab */}
        {activeTab === 'quality' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Content Quality Checklist</h2>
              <p className="mt-1 text-sm text-gray-600">
                Complete at least 80% of the checklist to submit your course for review
              </p>
            </div>

            <QualityChecklist
              courseId={courseId}
              onUpdate={(checklist) => {
                loadWorkflowSummary()
              }}
              readOnly={!canEdit}
              showSubmitThreshold={true}
            />
          </div>
        )}

        {/* Version History Tab */}
        {activeTab === 'versions' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Version History</h2>

            {versions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <History className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>No versions yet. Versions are created when your course is published.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900">
                          Version {version.version_number}
                        </span>
                        {version.version_number === course.version_number && (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(version.created_at).toLocaleDateString('en-CA', {
                          dateStyle: 'long',
                        })}
                      </span>
                    </div>
                    {version.change_summary && (
                      <p className="text-sm text-gray-700">{version.change_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preview Mode Tab */}
        {activeTab === 'preview' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Preview Mode</h2>

            <div className="py-12 text-center">
              <Eye className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Preview Your Course</h3>
              <p className="mb-6 text-gray-600">See how students will experience your course</p>
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                <Eye className="h-5 w-5" />
                Open Preview in New Tab
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Submit Course for Review</h3>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Submission Notes (Optional)
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes for the reviewers (e.g., specific areas you'd like feedback on, recent changes made, etc.)"
              />
            </div>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                Your course will be reviewed by our team. You&apos;ll be notified once the review is
                complete. The review typically takes 3-5 business days.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
