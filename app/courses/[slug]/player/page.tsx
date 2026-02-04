'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Course Player Page - Dynamic Route
 * Replaces legacy CoursePlayer.jsx (425 lines)
 * Route: /courses/[slug]/player
 * Features: Lesson navigation, video player, quiz system, progress tracking
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEntitlements } from '@/hooks/use-entitlements'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  BookOpen,
  Award,
  Home,
  Menu,
  X,
  Play,
  Clock,
  FileText,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

// Types
interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  level: string
  estimated_duration_minutes: number | null
  is_published: boolean
  required_tier: string
}

interface Lesson {
  id: string
  course_id: string
  title: string
  slug: string
  description: string | null
  content_type: string
  content_url: string | null
  content_data: any
  article_body: string | null
  video_duration_seconds: number | null
  module_number: number
  lesson_number: number
  sort_order: number
  is_published: boolean
  is_preview: boolean
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: string
  progress_percentage: number
  completed_at: string | null
  last_accessed_at: string | null
  current_lesson_id: string | null
}

interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: string
  progress_percentage: number
  completed_at: string | null
  video_position_seconds: number
  time_spent_seconds: number
}

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const { entitlements, loading: entitlementsLoading } = useEntitlements()

  // State
  const [slug, setSlug] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  // Resolve params (Next.js 15+ compatibility)
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setSlug(resolvedParams.slug)
    }
    resolveParams()
  }, [params])

  // Load user
  useEffect(() => {
    if (!slug) return

    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push(`/auth/login?redirect=/courses/${slug}/player`)
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth, slug, router])

  // Load course and lessons
  useEffect(() => {
    if (!user || !slug) return

    const loadCourse = async () => {
      try {
        logger.info('Loading course in player', {
          context: 'CoursePlayerPage',
          slug,
        })

        // Get course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .is('deleted_at', null)
          .single()

        if (courseError || !courseData) {
          router.push('/training')
          return
        }

        setCourse(courseData)

        // Check subscription tier access
        if (!entitlementsLoading && entitlements && courseData.required_tier) {
          const tierHierarchy: Record<string, number> = {
            FREE: 0,
            PROFESSIONAL: 1,
            BUSINESS: 2,
            BUSINESS_PLUS: 3,
            ENTERPRISE: 4,
          }

          const userTierLevel = tierHierarchy[entitlements.tier.toUpperCase()] ?? 0
          const requiredTierLevel = tierHierarchy[courseData.required_tier.toUpperCase()] ?? 0

          if (userTierLevel < requiredTierLevel) {
            setAccessDenied(true)
            setLoading(false)
            return
          }
        }

        // Get lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseData.id)
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true })

        if (lessonsError) throw lessonsError
        setLessons(lessonsData || [])

        // Get or create enrollment
        const { data: initialEnrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle()

        // Handle any errors except "not found" (PGRST116)
        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          logger.error('Error fetching enrollment', {
            context: 'CoursePlayerPage',
            error: enrollmentError,
            userId: user.id,
            courseId: courseData.id,
          })
          throw enrollmentError
        }

        let enrollmentData = initialEnrollmentData

        if (!enrollmentData) {
          // Get user's organization_id from profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

          // Create enrollment (supports both individual and organization users)
          const { data: newEnrollment, error: createError } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              course_id: courseData.id,
              organization_id: profileData?.organization_id || null,
              status: 'active',
              progress_percentage: 0,
            })
            .select()
            .single()

          if (createError) {
            // Handle duplicate key error gracefully
            if (createError.code === '23505') {
              logger.warn('Enrollment already exists, retrying fetch', {
                context: 'CoursePlayerPage',
                userId: user.id,
                courseId: courseData.id,
              })
              // Retry fetching the enrollment
              const { data: retryEnrollment, error: retryError } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', courseData.id)
                .maybeSingle()

              if (retryError || !retryEnrollment) {
                logger.error('Failed to fetch enrollment after duplicate error', {
                  context: 'CoursePlayerPage',
                  error: retryError,
                  userId: user.id,
                  courseId: courseData.id,
                })
                throw retryError || new Error('Enrollment exists but cannot be fetched')
              }
              enrollmentData = retryEnrollment
            } else {
              logger.error('Failed to create enrollment', {
                context: 'CoursePlayerPage',
                error: createError,
                userId: user.id,
                courseId: courseData.id,
              })
              throw createError
            }
          } else {
            enrollmentData = newEnrollment
          }
        }

        setEnrollment(enrollmentData)

        // Get lesson progress
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)

        if (progressError) throw progressError
        setLessonProgress(progressData || [])

        // Set current lesson based on enrollment
        if (enrollmentData.current_lesson_id) {
          const currentIndex = lessonsData.findIndex(
            (l: any) => l.id === enrollmentData.current_lesson_id
          )
          if (currentIndex >= 0) {
            setCurrentLessonIndex(currentIndex)
          }
        }

        setLoading(false)
      } catch (error) {
        logger.error('Error loading course:', { error: error, context: 'CoursePlayerPage' })
        router.push('/training')
      }
    }

    loadCourse()
  }, [user, slug, supabase, router, entitlementsLoading, entitlements])

  // Helper functions
  const currentLesson = lessons[currentLessonIndex]
  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some((p) => p.lesson_id === lessonId && p.status === 'completed')
  }
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find((p) => p.lesson_id === lessonId)
  }

  const handleLessonComplete = async () => {
    if (!currentLesson || !user || !enrollment) return

    try {
      // Check if lesson has quiz
      const quizQuestions = currentLesson.content_data?.quiz_questions as QuizQuestion[] | undefined
      if (quizQuestions && quizQuestions.length > 0 && !showQuiz) {
        setShowQuiz(true)
        setQuizAnswers(new Array(quizQuestions.length).fill(-1))
        setQuizSubmitted(false)
        setQuizScore(null)
        return
      }

      // Mark lesson as complete
      const progress = getLessonProgress(currentLesson.id)

      if (progress) {
        await supabase
          .from('lesson_progress')
          .update({
            status: 'completed',
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', progress.id)
      } else {
        await supabase.from('lesson_progress').insert({
          user_id: user.id,
          lesson_id: currentLesson.id,
          course_id: course!.id,
          enrollment_id: enrollment.id,
          status: 'completed',
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        })
      }

      // Update enrollment progress
      const completedCount = lessonProgress.filter((p) => p.status === 'completed').length + 1
      const newProgress = (completedCount / lessons.length) * 100

      await supabase
        .from('enrollments')
        .update({
          progress_percentage: newProgress,
          last_accessed_at: new Date().toISOString(),
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
          current_lesson_id:
            currentLessonIndex < lessons.length - 1
              ? lessons[currentLessonIndex + 1].id
              : currentLesson.id,
        })
        .eq('id', enrollment.id)

      // Refresh progress
      const { data: updatedProgress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course!.id)

      if (updatedProgress) setLessonProgress(updatedProgress)

      // Move to next lesson
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1)
        setShowQuiz(false)
      }
    } catch (error) {
      logger.error('Error completing lesson:', { error: error, context: 'CoursePlayerPage' })
    }
  }

  const handleQuizSubmit = async () => {
    if (!currentLesson || !user) return

    const quizQuestions = currentLesson.content_data?.quiz_questions as QuizQuestion[]
    let correct = 0
    quizAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct_answer) correct++
    })

    const score = Math.round((correct / quizQuestions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    // Save quiz score
    const progress = getLessonProgress(currentLesson.id)
    if (progress) {
      await supabase
        .from('lesson_progress')
        .update({
          progress_percentage: score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', progress.id)
    }
  }

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setShowQuiz(false)
      setQuizSubmitted(false)
    }
  }

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      setShowQuiz(false)
      setQuizSubmitted(false)
    }
  }

  const canAccessLesson = (index: number) => {
    if (index === 0) return true
    if (lessons[index].is_preview) return true
    return isLessonCompleted(lessons[index - 1]?.id)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-500"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  // Access denied state
  if (accessDenied && course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <Lock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">Upgrade Required</h1>
          <p className="mb-4 text-center text-gray-600">
            This course requires a{' '}
            <strong className="text-gray-900">{course.required_tier.toUpperCase()}</strong>{' '}
            subscription or higher.
          </p>
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-center text-sm text-gray-600">
              Your current plan:{' '}
              <strong className="text-gray-900">
                {entitlements?.tier.toUpperCase() || 'FREE'}
              </strong>
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/pricing">
              <button className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 font-semibold text-white transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-lg">
                View Pricing Plans
              </button>
            </Link>
            <Link href="/training">
              <button className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                Browse Other Courses
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Course Not Available</h2>
          <p className="mb-6 text-gray-600">
            This course could not be found or is not yet published.
          </p>
          <Link href="/training">
            <button className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-white transition-all hover:shadow-lg">
              Back to Training Hub
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const completedLessons = lessonProgress.filter((p) => p.status === 'completed').length
  const progressPercentage = (completedLessons / lessons.length) * 100

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed z-40 flex h-[calc(100vh-4rem)] w-80 flex-col overflow-hidden border-r border-gray-200 bg-white lg:relative">
            <div className="border-b border-gray-200 p-6">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="line-clamp-2 flex-1 text-lg font-bold text-gray-900">
                  {course.title}
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 lg:hidden"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-teal-600">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {completedLessons} of {lessons.length} lessons completed
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const completed = isLessonCompleted(lesson.id)
                  const current = index === currentLessonIndex
                  const locked = !canAccessLesson(index)

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !locked && setCurrentLessonIndex(index)}
                      disabled={locked}
                      className={`w-full rounded-lg p-3 text-left transition-all ${
                        current
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                          : completed
                            ? 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                            : locked
                              ? 'cursor-not-allowed bg-gray-50 text-gray-400'
                              : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : locked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <div
                              className={`h-5 w-5 rounded-full border-2 ${
                                current ? 'border-white' : 'border-gray-300'
                              }`}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`mb-1 text-xs font-medium ${current ? 'text-teal-100' : 'text-gray-500'}`}
                          >
                            Lesson {lesson.lesson_number}
                          </div>
                          <div className="line-clamp-2 text-sm font-semibold">{lesson.title}</div>
                          {lesson.video_duration_seconds && (
                            <div
                              className={`mt-1 flex items-center gap-1 text-xs ${current ? 'text-teal-100' : 'text-gray-500'}`}
                            >
                              <Clock className="h-3 w-3" />
                              {Math.ceil(lesson.video_duration_seconds / 60)} min
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-200 p-4">
              <Link href="/training">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50">
                  <Home className="h-4 w-4" />
                  Back to Courses
                </button>
              </Link>
              {progressPercentage === 100 && (
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-white transition-all hover:shadow-lg">
                  <Award className="h-4 w-4" />
                  View Certificate
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <div className="sticky top-16 z-30 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Open sidebar"
                    title="Open sidebar"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
                <div>
                  <div className="mb-1 text-sm font-medium text-teal-600">
                    Lesson {currentLesson.lesson_number} of {lessons.length}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{currentLesson.title}</h1>
                </div>
              </div>
              {isLessonCompleted(currentLesson.id) && (
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto">
            {showQuiz ? (
              <div className="mx-auto max-w-3xl p-6 lg:p-12">
                <div className="rounded-lg bg-white p-8 shadow-sm">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">Quiz</h2>
                  <p className="mb-8 text-gray-600">Test your knowledge from this lesson</p>

                  {((currentLesson.content_data?.quiz_questions as QuizQuestion[]) || []).map(
                    (question, qIndex) => (
                      <div
                        key={qIndex}
                        className="mb-8 border-b border-gray-200 pb-8 last:border-0"
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-600">
                            {qIndex + 1}
                          </div>
                          <p className="flex-1 text-lg font-semibold text-gray-900">
                            {question.question}
                          </p>
                        </div>

                        <div className="ml-11 space-y-3">
                          {question.options.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex
                            const isCorrect = oIndex === question.correct_answer
                            const showFeedback = quizSubmitted

                            return (
                              <button
                                key={oIndex}
                                onClick={() => {
                                  if (!quizSubmitted) {
                                    const newAnswers = [...quizAnswers]
                                    newAnswers[qIndex] = oIndex
                                    setQuizAnswers(newAnswers)
                                  }
                                }}
                                disabled={quizSubmitted}
                                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                                  showFeedback && isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : showFeedback && isSelected && !isCorrect
                                      ? 'border-red-500 bg-red-50'
                                      : isSelected
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                      showFeedback && isCorrect
                                        ? 'border-green-500 bg-green-500'
                                        : showFeedback && isSelected && !isCorrect
                                          ? 'border-red-500 bg-red-500'
                                          : isSelected
                                            ? 'border-teal-500 bg-teal-500'
                                            : 'border-gray-300'
                                    }`}
                                  >
                                    {(showFeedback && isCorrect) ||
                                    (isSelected && !showFeedback) ? (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    ) : showFeedback && isSelected && !isCorrect ? (
                                      <X className="h-4 w-4 text-white" />
                                    ) : null}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        {quizSubmitted && question.explanation && (
                          <div className="ml-11 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-900">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {quizSubmitted && quizScore !== null && (
                    <div className="mt-8 rounded-lg border border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100 p-6">
                      <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-teal-600">{quizScore}%</div>
                        <p className="mb-4 text-gray-700">
                          {quizScore >= 80
                            ? 'Great job! 🎉'
                            : quizScore >= 60
                              ? 'Good effort! 👍'
                              : 'Keep learning! 📚'}
                        </p>
                        <button
                          onClick={handleLessonComplete}
                          className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-white transition-all hover:shadow-lg"
                        >
                          {currentLessonIndex < lessons.length - 1
                            ? 'Continue to Next Lesson'
                            : 'Complete Course'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!quizSubmitted && (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.includes(-1)}
                      className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl p-6 lg:p-12">
                {/* Video Player */}
                {currentLesson.content_type === 'video' && currentLesson.content_url && (
                  <div className="mb-8 overflow-hidden rounded-lg bg-black shadow-lg">
                    <div className="aspect-video">
                      {currentLesson.content_url.includes('youtube.com') ||
                      currentLesson.content_url.includes('youtu.be') ? (
                        <iframe
                          src={currentLesson.content_url.replace('watch?v=', 'embed/')}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`${currentLesson.title} - Video lesson`}
                        />
                      ) : currentLesson.content_url.includes('vimeo.com') ? (
                        <iframe
                          src={currentLesson.content_url.replace(
                            'vimeo.com/',
                            'player.vimeo.com/video/'
                          )}
                          className="h-full w-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={`${currentLesson.title} - Video lesson`}
                        />
                      ) : (
                        <video src={currentLesson.content_url} controls className="h-full w-full">
                          Your browser does not support video playback.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                <div className="mb-8 rounded-lg bg-white p-8 shadow-sm">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">{currentLesson.title}</h2>
                  {currentLesson.description && (
                    <p className="mb-6 text-gray-600">{currentLesson.description}</p>
                  )}
                  {currentLesson.article_body && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.article_body }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
              <button
                onClick={handlePreviousLesson}
                disabled={currentLessonIndex === 0 || showQuiz}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {!showQuiz && !isLessonCompleted(currentLesson.id) && (
                <button
                  onClick={handleLessonComplete}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2 text-white transition-all hover:shadow-lg"
                >
                  {currentLesson.content_data?.quiz_questions ? 'Take Quiz' : 'Mark Complete'}
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleNextLesson}
                disabled={
                  currentLessonIndex === lessons.length - 1 ||
                  !isLessonCompleted(currentLesson.id) ||
                  showQuiz
                }
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
