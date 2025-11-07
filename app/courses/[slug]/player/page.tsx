'use client'

/**
 * Course Player Page - Dynamic Route
 * Replaces legacy CoursePlayer.jsx (425 lines)
 * Route: /courses/[slug]/player
 * Features: Lesson navigation, video player, quiz system, progress tracking
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  FileText
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

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

export default function CoursePlayerPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const supabase = createClient()
  
  // State
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

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push(`/auth/login?redirect=/courses/${params.slug}/player`)
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth, params.slug, router])

  // Load course and lessons
  useEffect(() => {
    if (!user) return

    const loadCourse = async () => {
      try {
        // Get course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', params.slug)
          .eq('is_published', true)
          .is('deleted_at', null)
          .single()

        if (courseError || !courseData) {
          router.push('/training')
          return
        }

        setCourse(courseData)

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
        let { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .single()

        if (enrollmentError && enrollmentError.code !== 'PGRST116') throw enrollmentError

        if (!enrollmentData) {
          // Create enrollment
          const { data: newEnrollment, error: createError } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              course_id: courseData.id,
              organization_id: user.user_metadata?.organization_id || '00000000-0000-0000-0000-000000000000',
              status: 'active',
              progress_percentage: 0
            })
            .select()
            .single()

          if (createError) throw createError
          enrollmentData = newEnrollment
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
          const currentIndex = lessonsData.findIndex(l => l.id === enrollmentData.current_lesson_id)
          if (currentIndex >= 0) {
            setCurrentLessonIndex(currentIndex)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading course:', error)
        router.push('/training')
      }
    }

    loadCourse()
  }, [user, params.slug, supabase, router])

  // Helper functions
  const currentLesson = lessons[currentLessonIndex]
  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(p => p.lesson_id === lessonId && p.status === 'completed')
  }
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lesson_id === lessonId)
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
            updated_at: new Date().toISOString()
          })
          .eq('id', progress.id)
      } else {
        await supabase
          .from('lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: currentLesson.id,
            course_id: course!.id,
            enrollment_id: enrollment.id,
            status: 'completed',
            progress_percentage: 100,
            completed_at: new Date().toISOString()
          })
      }

      // Update enrollment progress
      const completedCount = lessonProgress.filter(p => p.status === 'completed').length + 1
      const newProgress = (completedCount / lessons.length) * 100

      await supabase
        .from('enrollments')
        .update({
          progress_percentage: newProgress,
          last_accessed_at: new Date().toISOString(),
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
          current_lesson_id: currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1].id : currentLesson.id
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
      console.error('Error completing lesson:', error)
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
          updated_at: new Date().toISOString()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Available</h2>
          <p className="text-gray-600 mb-6">This course could not be found or is not yet published.</p>
          <Link href="/training">
            <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all">
              Back to Training Hub
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const completedLessons = lessonProgress.filter(p => p.status === 'completed').length
  const progressPercentage = (completedLessons / lessons.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col fixed lg:relative h-[calc(100vh-4rem)] z-40 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{course.title}</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-teal-600 font-semibold">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-500"
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
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        current
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                          : completed
                          ? 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                          : locked
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : locked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              current ? 'border-white' : 'border-gray-300'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium mb-1 ${current ? 'text-teal-100' : 'text-gray-500'}`}>
                            Lesson {lesson.lesson_number}
                          </div>
                          <div className="text-sm font-semibold line-clamp-2">
                            {lesson.title}
                          </div>
                          {lesson.video_duration_seconds && (
                            <div className={`text-xs mt-1 flex items-center gap-1 ${current ? 'text-teal-100' : 'text-gray-500'}`}>
                              <Clock className="w-3 h-3" />
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

            <div className="p-4 border-t border-gray-200 space-y-2">
              <Link href="/training">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all">
                  <Home className="w-4 h-4" />
                  Back to Courses
                </button>
              </Link>
              {progressPercentage === 100 && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Award className="w-4 h-4" />
                  View Certificate
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                )}
                <div>
                  <div className="text-sm text-teal-600 font-medium mb-1">
                    Lesson {currentLesson.lesson_number} of {lessons.length}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentLesson.title}
                  </h1>
                </div>
              </div>
              {isLessonCompleted(currentLesson.id) && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto">
            {showQuiz ? (
              <div className="max-w-3xl mx-auto p-6 lg:p-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz</h2>
                  <p className="text-gray-600 mb-8">Test your knowledge from this lesson</p>

                  {(currentLesson.content_data?.quiz_questions as QuizQuestion[] || []).map((question, qIndex) => (
                    <div key={qIndex} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {qIndex + 1}
                        </div>
                        <p className="text-lg font-semibold text-gray-900 flex-1">
                          {question.question}
                        </p>
                      </div>

                      <div className="space-y-3 ml-11">
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
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
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
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  showFeedback && isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : showFeedback && isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : isSelected
                                    ? 'border-teal-500 bg-teal-500'
                                    : 'border-gray-300'
                                }`}>
                                  {(showFeedback && isCorrect) || (isSelected && !showFeedback) ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : showFeedback && isSelected && !isCorrect ? (
                                    <X className="w-4 h-4 text-white" />
                                  ) : null}
                                </div>
                                <span className="flex-1">{option}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {quizSubmitted && question.explanation && (
                        <div className="ml-11 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {quizSubmitted && quizScore !== null && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-teal-600 mb-2">{quizScore}%</div>
                        <p className="text-gray-700 mb-4">
                          {quizScore >= 80 ? 'Great job! 🎉' : quizScore >= 60 ? 'Good effort! 👍' : 'Keep learning! 📚'}
                        </p>
                        <button
                          onClick={handleLessonComplete}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                        >
                          {currentLessonIndex < lessons.length - 1 ? 'Continue to Next Lesson' : 'Complete Course'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!quizSubmitted && (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.includes(-1)}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto p-6 lg:p-12">
                {/* Video Player */}
                {currentLesson.content_type === 'video' && currentLesson.content_url && (
                  <div className="mb-8 bg-black rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-video">
                      {currentLesson.content_url.includes('youtube.com') || currentLesson.content_url.includes('youtu.be') ? (
                        <iframe
                          src={currentLesson.content_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : currentLesson.content_url.includes('vimeo.com') ? (
                        <iframe
                          src={currentLesson.content_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={currentLesson.content_url} controls className="w-full h-full">
                          Your browser does not support video playback.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                  {currentLesson.description && (
                    <p className="text-gray-600 mb-6">{currentLesson.description}</p>
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
          <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePreviousLesson}
                disabled={currentLessonIndex === 0 || showQuiz}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {!showQuiz && !isLessonCompleted(currentLesson.id) && (
                <button
                  onClick={handleLessonComplete}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {currentLesson.content_data?.quiz_questions ? 'Take Quiz' : 'Mark Complete'}
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleNextLesson}
                disabled={currentLessonIndex === lessons.length - 1 || !isLessonCompleted(currentLesson.id) || showQuiz}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
