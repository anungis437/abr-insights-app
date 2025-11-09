'use client'

import { useEffect, useState, useCallback } from 'react'
import { BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  estimated_duration_minutes: number
  is_published: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function CoursesPage() {
  const supabase = createClient()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const fetchCoursesAndCategories = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch published courses
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      const { data: coursesData, error: coursesError } = await query
      
      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('content_categories')
        .select('id, name, slug')
        .order('name')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCoursesAndCategories()
  }, [fetchCoursesAndCategories])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || course.category_id === selectedCategory
    const matchesLevel = !selectedLevel || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'General'
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'General'
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600">
            Browse {courses.length} available {courses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="card">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700">
                  Search Courses
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description..."
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select 
                  id="category" 
                  className="input-field w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="level" className="mb-2 block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select 
                  id="level" 
                  className="input-field w-full"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                <strong>{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'} {searchQuery || selectedCategory || selectedLevel ? 'match your criteria' : 'available'}
              </p>
            </div>
          </div>
        </div>

        {/* All Courses */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            {searchQuery || selectedCategory || selectedLevel ? 'Search Results' : 'All Courses'}
          </h2>
          
          {filteredCourses.length === 0 ? (
            <div className="card py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Link 
                  key={course.id} 
                  href={`/courses/${course.slug}`}
                  className="card group cursor-pointer transition-all hover:shadow-xl"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      {getCategoryName(course.category_id)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-primary-600">
                    {course.title}
                  </h3>
                  
                  {course.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {course.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(course.estimated_duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>Course</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
