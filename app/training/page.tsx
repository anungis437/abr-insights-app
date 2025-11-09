'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import {
  GraduationCap,
  Clock,
  Award,
  Search,
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  TrendingUp,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  level: string
  duration_minutes: number
  thumbnail_url: string | null
  is_featured: boolean
  tier_required: string
  instructor_name: string | null
  order_index: number
  created_at: string
}

interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string | null
  completion_percentage: number
  quiz_scores: Record<string, number> | null
  time_spent_minutes: number
  certificate_issued: boolean
  last_accessed_at: string
  completed_at: string | null
}

export default function TrainingHubPage() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('order_index', { ascending: true })

        if (error) throw error
        setCourses(data || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  useEffect(() => {
    if (!user) return

    const fetchUserProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)

        if (error) throw error
        setUserProgress(data || [])
      } catch (error) {
        console.error('Error fetching user progress:', error)
      }
    }

    fetchUserProgress()
  }, [user, supabase])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchTerm === '' ||
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, searchTerm, selectedCategory, selectedLevel])

  const getCourseProgress = (courseId: string): number => {
    const progress = userProgress.find((p) => p.course_id === courseId)
    return progress?.completion_percentage || 0
  }

  const getCompletedCount = (): number => {
    return userProgress.filter((p) => p.completion_percentage === 100).length
  }

  const getTotalHours = (): number => {
    return courses.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / 60
  }

  const getCertificateCount = (): number => {
    return userProgress.filter((p) => p.certificate_issued).length
  }

  const getInProgressCourses = () => {
    return userProgress
      .filter((p) => p.completion_percentage > 0 && p.completion_percentage < 100)
      .map((progress) => {
        const course = courses.find((c) => c.id === progress.course_id)
        return course ? { course, progress } : null
      })
      .filter(Boolean)
      .slice(0, 2)
  }

  const canAccessCourse = (course: Course): boolean => {
    if (!user) return course.tier_required === 'free'
    return true
  }

  const categories = useMemo(() => {
    return [...new Set(courses.map((c) => c.category))].sort()
  }, [courses])

  const levels = ['Introductory', 'Intermediate', 'Advanced', 'Specialized']

  const inProgressCourses = getInProgressCourses()

  return (
    <>      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Training Hub</h1>
                <p className="text-gray-600">Evidence-based courses to combat anti-Black racism</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-teal-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Courses</div>
                </div>
                <BookOpen className="w-8 h-8 text-teal-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-green-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{getCompletedCount()}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{getTotalHours().toFixed(0)}h</div>
                  <div className="text-sm text-gray-600 mt-1">Content Hours</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">{getCertificateCount()}</div>
                  <div className="text-sm text-gray-600 mt-1">Certificates</div>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Find Your Course</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                aria-label="Filter by level"
              >
                <option value="all">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {inProgressCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                Continue Learning
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgressCourses.map((item) => {
                  if (!item) return null
                  const { course, progress } = item
                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-teal-200 p-6"
                    >
                      <div className="flex gap-4">
                        {course.thumbnail_url ? (
                          <Image src={course.thumbnail_url} alt={course.title} width={96} height={96} className="w-24 h-24 object-cover rounded-lg" />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress.completion_percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{progress.completion_percentage.toFixed(0)}% Complete</span>
                              <Link href={`/courses/${course.slug}/player`}>
                                <button className="px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 flex items-center gap-1 text-sm">
                                  <Play className="w-4 h-4" />
                                  Continue
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedCategory === 'all' ? 'All Courses' : selectedCategory}</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => {
                  const progress = getCourseProgress(course.id)
                  const hasAccess = canAccessCourse(course)
                  const isCompleted = progress === 100

                  return (
                    <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
                      <div className="relative">
                        {course.thumbnail_url ? (
                          <Image src={course.thumbnail_url} alt={course.title} width={384} height={192} className="w-full h-48 object-cover" />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                            <GraduationCap className="w-20 h-20 text-white opacity-50" />
                          </div>
                        )}
                        {course.is_featured && (
                          <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {isCompleted && (
                          <div className="absolute top-3 left-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {!hasAccess && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded">
                            {course.level}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration_minutes} min
                          </span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description || 'No description available'}</p>

                        {course.instructor_name && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {course.instructor_name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-600">{course.instructor_name}</span>
                          </div>
                        )}

                        {progress > 0 && (
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>
                          </div>
                        )}

                        <Link href={`/courses/${course.slug}/player`}>
                          <button
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              hasAccess
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }`}
                            disabled={!hasAccess}
                          >
                            {!hasAccess ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Upgrade to Access
                              </>
                            ) : progress > 0 ? (
                              <>
                                <Play className="w-4 h-4" />
                                Continue Course
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Start Course
                              </>
                            )}
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>    </>
  )
}

