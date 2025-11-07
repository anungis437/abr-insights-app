'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Eye, Plus, X, BookOpen, Loader2 } from 'lucide-react'

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [originalData, setOriginalData] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    cover_image_url: '',
    category_id: '',
    instructor_id: '',
    level: 'beginner',
    estimated_duration_minutes: 60,
    required_tier: 'free',
    learning_objectives: [''],
    prerequisites: [''],
    tags: [''],
    meta_title: '',
    meta_description: '',
    points_reward: 0,
    is_published: false,
    is_featured: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkAuth()
    loadCategories()
    loadInstructors()
    loadCourse()
  }, [courseId])

  const checkAuth = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

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
      router.push('/')
      return
    }

    setUser(currentUser)
  }

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error) throw error

      if (!data) {
        alert('Course not found')
        router.push('/admin/courses')
        return
      }

      setOriginalData(data)
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        thumbnail_url: data.thumbnail_url || '',
        cover_image_url: data.cover_image_url || '',
        category_id: data.category_id || '',
        instructor_id: data.instructor_id || '',
        level: data.level || 'beginner',
        estimated_duration_minutes: data.estimated_duration_minutes || 60,
        required_tier: data.required_tier || 'free',
        learning_objectives: Array.isArray(data.learning_objectives) && data.learning_objectives.length > 0 ? data.learning_objectives : [''],
        prerequisites: Array.isArray(data.prerequisites) && data.prerequisites.length > 0 ? data.prerequisites : [''],
        tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : [''],
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        points_reward: data.points_reward || 0,
        is_published: data.is_published || false,
        is_featured: data.is_featured || false
      })
    } catch (error: any) {
      alert('Error loading course: ' + error.message)
      router.push('/admin/courses')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('content_categories')
      .select('id, name, slug')
      .order('name', { ascending: true })

    if (data) setCategories(data)
  }

  const loadInstructors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('role', ['admin', 'super_admin', 'educator'])
      .order('display_name', { ascending: true })

    if (data) setInstructors(data)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const addArrayItem = (field: 'learning_objectives' | 'prerequisites' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'learning_objectives' | 'prerequisites' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'learning_objectives' | 'prerequisites' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    if (!formData.instructor_id) newErrors.instructor_id = 'Instructor is required'
    if (formData.estimated_duration_minutes < 1) newErrors.estimated_duration_minutes = 'Duration must be at least 1 minute'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const courseData = {
        ...formData,
        is_published: publish,
        published_at: publish && !originalData?.published_at ? new Date().toISOString() : originalData?.published_at,
        learning_objectives: formData.learning_objectives.filter(obj => obj.trim()),
        prerequisites: formData.prerequisites.filter(pre => pre.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.description,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId)
        .select()
        .single()

      if (error) throw error

      alert(`Course updated successfully!`)
      router.push('/admin/courses')
    } catch (error: any) {
      alert('Error updating course: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            Edit Course
          </h1>
          <p className="text-gray-600 mt-2">Update course details and settings</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Introduction to Administrative Law"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="introduction-to-administrative-law"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Provide a detailed description of the course..."
                />
              </div>

              {/* Category & Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor *
                  </label>
                  <select
                    value={formData.instructor_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor_id: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.instructor_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.display_name || inst.email}</option>
                    ))}
                  </select>
                  {errors.instructor_id && <p className="text-red-500 text-sm mt-1">{errors.instructor_id}</p>}
                </div>
              </div>

              {/* Level, Duration, Tier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.estimated_duration_minutes ? 'border-red-500' : 'border-gray-300'}`}
                    min="1"
                  />
                  {errors.estimated_duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.estimated_duration_minutes}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Tier *
                  </label>
                  <select
                    value={formData.required_tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, required_tier: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="free">Free</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h2>
            <div className="space-y-3">
              {formData.learning_objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => updateArrayItem('learning_objectives', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What will students learn?"
                  />
                  {formData.learning_objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('learning_objectives', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('learning_objectives')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Learning Objective
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
            <div className="space-y-3">
              {formData.prerequisites.map((pre, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={pre}
                    onChange={(e) => updateArrayItem('prerequisites', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What should students know before starting?"
                  />
                  {formData.prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('prerequisites', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('prerequisites')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Prerequisite
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., administrative-law, procedures"
                  />
                  {formData.tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>
          </div>

          {/* Media */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Reward
                </label>
                <input
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  placeholder="0"
                />
                <p className="text-gray-500 text-sm mt-1">Points awarded upon course completion</p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Feature this course</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/courses')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Eye className="w-4 h-4" />
              {formData.is_published ? 'Update & Keep Published' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
