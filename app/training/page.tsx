'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEntitlements } from '@/hooks/use-entitlements'
import { useRouter } from 'next/navigation'
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
  category_id: string | null
  level: string
  estimated_duration_minutes: number | null
  thumbnail_url: string | null
  is_featured: boolean
  required_tier: string
  instructor_id: string | null
  created_at: string
}

interface Category {
  id: string
  name: string
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
  const router = useRouter()
  const supabase = createClient()
  const { entitlements, loading: entitlementsLoading } = useEntitlements()
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
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
          .order('created_at', { ascending: false })

        if (error) throw error
        setCourses(data || [])
      } catch (error) {
        logger.error('Error fetching courses:', { error: error, context: 'TrainingHubPage' })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('content_categories')
          .select('id, name')
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        logger.error('Error fetching categories:', {
          error: error,
          context: 'TrainingHubPage',
        })
      }
    }

    fetchCategories()
  }, [supabase])

  useEffect(() => {
    if (!user) return

    const fetchUserProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)

        if (error) throw error
        setUserProgress(data || [])
      } catch (error) {
        logger.error('Error fetching user progress:', { error: error, context: 'TrainingHubPage' })
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

      const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory
      const matchesLevel =
        selectedLevel === 'all' || course.level?.toLowerCase() === selectedLevel.toLowerCase()

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
    return courses.reduce((sum, c) => sum + (c.estimated_duration_minutes || 0), 0) / 60
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
    // Not logged in - only free courses
    if (!user) return course.required_tier === 'free'

    // Waiting for entitlements to load
    if (entitlementsLoading || !entitlements) return false

    const userTier = entitlements.tier.toUpperCase()
    const requiredTier = course.required_tier.toUpperCase()

    // Tier hierarchy: FREE < PROFESSIONAL < BUSINESS < BUSINESS_PLUS < ENTERPRISE
    const tierHierarchy: Record<string, number> = {
      FREE: 0,
      PROFESSIONAL: 1,
      BUSINESS: 2,
      BUSINESS_PLUS: 3,
      ENTERPRISE: 4,
    }

    const userTierLevel = tierHierarchy[userTier] ?? 0
    const requiredTierLevel = tierHierarchy[requiredTier] ?? 0

    // User must have tier >= required tier
    return userTierLevel >= requiredTierLevel
  }

  const handleCourseClick = (course: Course, hasAccess: boolean) => {
    if (hasAccess) {
      logger.info('Navigating to course player', {
        context: 'TrainingHubPage',
        courseSlug: course.slug,
        courseId: course.id,
      })
      router.push(`/courses/${course.slug}/player`)
    } else {
      logger.info('Redirecting to pricing for locked course', {
        context: 'TrainingHubPage',
        courseSlug: course.slug,
        requiredTier: course.required_tier,
      })
      router.push('/pricing')
    }
  }

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const inProgressCourses = getInProgressCourses()

  return (
    <>
      {' '}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Training Hub</h1>
                <p className="text-gray-600">Evidence-based courses to combat anti-Black racism</p>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border-l-4 border-l-teal-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                  <div className="mt-1 text-sm text-gray-600">Total Courses</div>
                </div>
                <BookOpen className="h-8 w-8 text-teal-500" />
              </div>
            </div>

            <div className="rounded-lg border-l-4 border-l-green-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{getCompletedCount()}</div>
                  <div className="mt-1 text-sm text-gray-600">Completed</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border-l-4 border-l-yellow-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {getTotalHours().toFixed(0)}h
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Content Hours</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="rounded-lg border-l-4 border-l-purple-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">{getCertificateCount()}</div>
                  <div className="mt-1 text-sm text-gray-600">Certificates</div>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Find Your Course</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <TrendingUp className="h-6 w-6 text-teal-600" />
                Continue Learning
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {inProgressCourses.map((item) => {
                  if (!item) return null
                  const { course, progress } = item
                  return (
                    <div
                      key={course.id}
                      className="rounded-lg border-2 border-teal-200 bg-white p-6 shadow-md transition-all hover:shadow-xl"
                    >
                      <div className="flex gap-4">
                        {course.thumbnail_url ? (
                          <Image
                            src={course.thumbnail_url}
                            alt={course.title}
                            width={96}
                            height={96}
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-teal-600">
                            <GraduationCap className="h-12 w-12 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">{course.title}</h3>
                          <div className="space-y-2">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-teal-500 transition-all"
                                style={{ width: `${progress.completion_percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {progress.completion_percentage.toFixed(0)}% Complete
                              </span>
                              <Link href={`/courses/${course.slug}/player`}>
                                <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1 text-sm text-white hover:from-teal-600 hover:to-teal-700">
                                  <Play className="h-4 w-4" />
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
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Courses' : selectedCategory}
            </h2>
            {loading ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => {
                  const progress = getCourseProgress(course.id)
                  const hasAccess = canAccessCourse(course)
                  const isCompleted = progress === 100

                  // Don't render card until entitlements are loaded
                  if (entitlementsLoading) {
                    return (
                      <div
                        key={course.id}
                        className="overflow-hidden rounded-lg bg-white shadow-md"
                      >
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200" />
                          <div className="p-6">
                            <div className="mb-2 h-6 rounded bg-gray-200" />
                            <div className="mb-4 h-4 rounded bg-gray-200" />
                            <div className="h-10 rounded bg-gray-200" />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseClick(course, hasAccess)}
                      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl"
                    >
                      <div className="relative">
                        {course.thumbnail_url ? (
                          <Image
                            src={course.thumbnail_url}
                            alt={course.title}
                            width={384}
                            height={192}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600">
                            <GraduationCap className="h-20 w-20 text-white opacity-50" />
                          </div>
                        )}
                        {course.is_featured && (
                          <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 text-xs font-semibold text-gray-900">
                            Featured
                          </span>
                        )}
                        {isCompleted && (
                          <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        )}
                        {!hasAccess && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <Lock className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-start justify-between">
                          <span className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {course.level}
                          </span>
                          <span className="flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            <Clock className="h-3 w-3" />
                            {course.estimated_duration_minutes} min
                          </span>
                        </div>

                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-teal-600">
                          {course.title}
                        </h3>

                        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                          {course.description || 'No description available'}
                        </p>

                        {progress > 0 && (
                          <div className="mb-4">
                            <div className="mb-1 h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-teal-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>
                          </div>
                        )}

                        {hasAccess ? (
                          <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 font-medium text-white transition-colors group-hover:from-teal-600 group-hover:to-teal-700">
                            {progress > 0 ? (
                              <>
                                <Play className="h-4 w-4" />
                                Continue Course
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Start Course
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-600 transition-colors group-hover:bg-gray-400">
                            <Lock className="h-4 w-4" />
                            Upgrade to {course.required_tier.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>{' '}
    </>
  )
}
