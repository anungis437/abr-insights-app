'use client'

import { logger } from '@/lib/utils/production-logger'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react'
import { getCourseModules, getLessonProgress } from '@/lib/services/courses-enhanced'
import type { CourseModule, Lesson, LessonProgress } from '@/lib/types/courses'

interface CourseModuleNavProps {
  courseId: string
  userId?: string
  currentLessonId?: string
  onLessonSelect?: (lessonId: string) => void
  className?: string
}

interface ModuleWithLessons extends CourseModule {
  lessons: Lesson[]
}

interface LessonWithProgress extends Lesson {
  progress?: LessonProgress
}

export function CourseModuleNav({
  courseId,
  userId,
  currentLessonId,
  onLessonSelect,
  className = '',
}: CourseModuleNavProps) {
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadModulesAndProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load modules with lessons
      const modulesData = await getCourseModules(courseId)

      if (!modulesData) {
        setModules([])
        return
      }

      // Load progress for each lesson if user is logged in
      if (userId) {
        const modulesWithProgress = await Promise.all(
          modulesData.map(async (module) => {
            const lessonsWithProgress = await Promise.all(
              (module.lessons || []).map(async (lesson: Lesson) => {
                const progress = await getLessonProgress(userId, lesson.id)
                return { ...lesson, progress }
              })
            )
            return { ...module, lessons: lessonsWithProgress }
          })
        )
        setModules(modulesWithProgress)
      } else {
        setModules(modulesData)
      }

      // Auto-expand module containing current lesson
      if (currentLessonId) {
        const currentModule = modulesData.find((m) =>
          m.lessons?.some((l: Lesson) => l.id === currentLessonId)
        )
        if (currentModule) {
          setExpandedModules(new Set([currentModule.id]))
        }
      }
    } catch (err) {
      logger.error('Error loading modules:', { error: err, context: 'CourseModuleNav' })
      setError('Failed to load course modules')
    } finally {
      setLoading(false)
    }
  }, [courseId, userId, currentLessonId])

  useEffect(() => {
    loadModulesAndProgress()
  }, [loadModulesAndProgress])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleLessonClick = (lesson: Lesson) => {
    if (onLessonSelect && !isLessonLocked(lesson)) {
      onLessonSelect(lesson.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const isLessonLocked = (lesson: Lesson): boolean => {
    // In a real implementation, you would check prerequisites
    // For now, we'll just check if the lesson is published
    return !lesson.is_published
  }

  const getLessonIcon = (lesson: LessonWithProgress) => {
    if (isLessonLocked(lesson)) {
      return <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
    }

    if (lesson.progress?.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
    }

    if (lesson.progress?.status === 'in_progress') {
      return <PlayCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
    }

    return <Circle className="h-4 w-4 text-gray-300" aria-hidden="true" />
  }

  const getModuleProgress = (module: ModuleWithLessons): number => {
    if (!module.lessons?.length) return 0

    const completedLessons = module.lessons.filter(
      (l) => (l as LessonWithProgress).progress?.status === 'completed'
    ).length

    return Math.round((completedLessons / module.lessons.length) * 100)
  }

  if (loading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-3/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-100"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="text-red-600" role="alert">
          <p className="font-medium">Error loading course content</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!modules.length) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
        <p className="text-center text-gray-500">No course modules available yet.</p>
      </div>
    )
  }

  return (
    <nav
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      aria-label="Course modules navigation"
    >
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id)
          const progress = getModuleProgress(module)
          const hasLessons = module.lessons && module.lessons.length > 0

          return (
            <div key={module.id} className="border-b border-gray-100 last:border-b-0">
              {/* Module Header */}
              <button
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  !hasLessons ? 'cursor-default' : ''
                }`}
                onClick={() => hasLessons && toggleModule(module.id)}
                onKeyDown={(e) => hasLessons && handleKeyDown(e, () => toggleModule(module.id))}
                aria-expanded={isExpanded ? 'true' : 'false'}
                aria-controls={`module-${module.id}-content`}
                disabled={!hasLessons}
              >
                {/* Expand/Collapse Icon */}
                {hasLessons && (
                  <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </span>
                )}

                {/* Module Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Module {module.module_number}
                      </span>
                      <h3 className="mt-1 text-sm font-semibold text-gray-900">{module.title}</h3>
                      {module.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                          {module.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Badge */}
                    {userId && hasLessons && (
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            progress === 100
                              ? 'bg-green-100 text-green-800'
                              : progress > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                          aria-label={`${progress}% complete`}
                        >
                          {progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Module Meta */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    {hasLessons && (
                      <span>
                        {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    )}
                    {module.estimated_duration_minutes && (
                      <span>
                        {Math.floor(module.estimated_duration_minutes / 60)}h{' '}
                        {module.estimated_duration_minutes % 60}m
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Lessons List */}
              {hasLessons && isExpanded && (
                <div
                  id={`module-${module.id}-content`}
                  className="bg-gray-50"
                  role="region"
                  aria-label={`Lessons for ${module.title}`}
                >
                  <ul className="divide-y divide-gray-100">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCurrent = lesson.id === currentLessonId
                      const isLocked = isLessonLocked(lesson)
                      const lessonWithProgress = lesson as LessonWithProgress

                      return (
                        <li key={lesson.id}>
                          <button
                            className={`flex w-full items-start gap-3 px-4 py-3 pl-12 text-left transition-colors ${
                              isCurrent
                                ? 'border-l-4 border-blue-600 bg-blue-50'
                                : isLocked
                                  ? 'cursor-not-allowed opacity-60'
                                  : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleLessonClick(lesson)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleLessonClick(lesson))}
                            disabled={isLocked}
                            aria-current={isCurrent ? 'page' : undefined}
                            aria-disabled={isLocked}
                          >
                            {/* Lesson Icon */}
                            <span className="mt-0.5 flex-shrink-0">
                              {getLessonIcon(lessonWithProgress)}
                            </span>

                            {/* Lesson Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className={`text-sm font-medium ${
                                    isCurrent ? 'text-blue-900' : 'text-gray-900'
                                  }`}
                                >
                                  {lessonIndex + 1}. {lesson.title}
                                </h4>

                                {/* Lesson Duration */}
                                {lesson.video_duration_seconds && (
                                  <span className="flex-shrink-0 text-xs text-gray-500">
                                    {Math.ceil(lesson.video_duration_seconds / 60)} min
                                  </span>
                                )}
                              </div>

                              {/* Lesson Type Badge */}
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                    lesson.content_type === 'video'
                                      ? 'bg-purple-100 text-purple-800'
                                      : lesson.content_type === 'quiz'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : lesson.content_type === 'article'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {lesson.content_type}
                                </span>

                                {/* CE Credits Badge */}
                                {lesson.ce_credits && lesson.ce_credits > 0 && (
                                  <span className="inline-flex items-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                    {lesson.ce_credits} CE
                                  </span>
                                )}

                                {/* Lock Indicator */}
                                {isLocked && <span className="text-xs text-gray-500">Locked</span>}
                              </div>

                              {/* Progress Bar for In-Progress Lessons */}
                              {lessonWithProgress.progress?.status === 'in_progress' &&
                                lessonWithProgress.progress.progress_percentage !== undefined && (
                                  <div className="mt-2">
                                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                                      <div
                                        className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                                        style={{
                                          width: `${Math.min(100, Math.max(0, lessonWithProgress.progress.progress_percentage))}%`,
                                        }}
                                        role="progressbar"
                                        aria-valuenow={Math.min(
                                          100,
                                          Math.max(
                                            0,
                                            lessonWithProgress.progress.progress_percentage
                                          )
                                        )}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`Lesson ${Math.min(100, Math.max(0, lessonWithProgress.progress.progress_percentage))}% complete`}
                                      />
                                    </div>
                                  </div>
                                )}
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
