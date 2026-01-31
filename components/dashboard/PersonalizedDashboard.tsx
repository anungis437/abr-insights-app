'use client'

import { logger } from '@/lib/utils/production-logger'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Target,
  Lightbulb,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  analyzeUserSkillProfile,
  generateLearningPathRecommendations,
  generateAdaptiveContentSuggestions,
  predictCompletionTime,
  generateSmartNotifications,
  type LearningPathRecommendation,
  type AdaptiveContentSuggestion,
  type CompletionPrediction,
  type UserSkillProfile,
  type SmartNotification,
} from '@/lib/services/ai-personalization'

export interface PersonalizedDashboardProps {
  userId: string
  currentCourseId?: string
  currentModuleId?: string
}

export default function PersonalizedDashboard({
  userId,
  currentCourseId,
  currentModuleId,
}: PersonalizedDashboardProps) {
  const [skillProfile, setSkillProfile] = useState<UserSkillProfile | null>(null)
  const [recommendations, setRecommendations] = useState<LearningPathRecommendation[]>([])
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState<AdaptiveContentSuggestion[]>([])
  const [completionPrediction, setCompletionPrediction] = useState<CompletionPrediction | null>(
    null
  )
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPersonalizationData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Load all personalization data in parallel
      const [profile, recs, notifs] = await Promise.all([
        analyzeUserSkillProfile(userId),
        generateLearningPathRecommendations(userId, 5),
        generateSmartNotifications(userId),
      ])

      setSkillProfile(profile)
      setRecommendations(recs)
      setNotifications(notifs)

      // Load adaptive suggestions if in a course
      if (currentCourseId && currentModuleId) {
        const suggestions = await generateAdaptiveContentSuggestions(
          userId,
          currentCourseId,
          currentModuleId
        )
        setAdaptiveSuggestions(suggestions)

        // Load completion prediction
        const prediction = await predictCompletionTime(userId, currentCourseId)
        setCompletionPrediction(prediction)
      }
    } catch (error) {
      logger.error('[Personalization] Failed to load data:', {
        error: error,
        context: 'PersonalizedDashboard',
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentCourseId, currentModuleId])

  useEffect(() => {
    loadPersonalizationData()
  }, [loadPersonalizationData])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* ===== Skill Profile Overview ===== */}
      {skillProfile && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="mb-1 text-2xl font-bold">Your Learning Profile</h2>
              <p className="text-blue-100">AI-powered insights based on your progress</p>
            </div>
            <Sparkles className="h-8 w-8 text-yellow-300" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold">Learning Pace</h3>
              </div>
              <p className="text-2xl font-bold capitalize">{skillProfile.learningPace}</p>
              <p className="mt-1 text-sm text-blue-100">
                {skillProfile.averageTimePerModule.toFixed(0)}min per module
              </p>
            </div>

            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-5 w-5" />
                <h3 className="font-semibold">Avg Quiz Score</h3>
              </div>
              <p className="text-2xl font-bold">{skillProfile.averageQuizScore.toFixed(0)}%</p>
              <p className="mt-1 text-sm text-blue-100">
                {skillProfile.averageQuizScore >= 80 ? 'Excellent!' : 'Keep improving'}
              </p>
            </div>

            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Award className="h-5 w-5" />
                <h3 className="font-semibold">Consistency</h3>
              </div>
              <p className="text-2xl font-bold">{skillProfile.consistencyScore.toFixed(0)}%</p>
              <p className="mt-1 text-sm text-blue-100">
                {skillProfile.consistencyScore >= 70 ? 'Great habit!' : 'Stay consistent'}
              </p>
            </div>

            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-semibold">Learning Style</h3>
              </div>
              <p className="text-2xl font-bold capitalize">{skillProfile.preferredLearningStyle}</p>
              <p className="mt-1 text-sm text-blue-100">Preferred method</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {skillProfile.strengths.length > 0 && (
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  Your Strengths
                </h3>
                <ul className="space-y-1">
                  {skillProfile.strengths.slice(0, 3).map((strength) => (
                    <li key={strength.skill} className="text-sm">
                      <span className="font-medium">{strength.skill}</span>
                      {' - '}
                      <span className="text-blue-100">
                        {strength.proficiency.toFixed(0)}% proficiency
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {skillProfile.weaknesses.length > 0 && (
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                  Areas to Improve
                </h3>
                <ul className="space-y-1">
                  {skillProfile.weaknesses.slice(0, 3).map((weakness) => (
                    <li key={weakness.skill} className="text-sm">
                      <span className="font-medium">{weakness.skill}</span>
                      {' - '}
                      <span className="text-blue-100">
                        {weakness.proficiency.toFixed(0)}% proficiency
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Adaptive Suggestions (in-course) ===== */}
      {adaptiveSuggestions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Personalized Suggestions
          </h2>
          <div className="space-y-3">
            {adaptiveSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`rounded-lg border-l-4 p-4 ${
                  suggestion.action === 'skip'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : suggestion.action === 'review'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold capitalize text-gray-900 dark:text-white">
                    {suggestion.action} Content
                  </h3>
                  {suggestion.action === 'skip' && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                      Advanced
                    </span>
                  )}
                  {suggestion.action === 'review' && (
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200">
                      Needs Review
                    </span>
                  )}
                </div>
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{suggestion.reason}</p>

                {/* Supplemental Content */}
                {suggestion.supplementalContent && suggestion.supplementalContent.length > 0 && (
                  <div className="space-y-2">
                    {suggestion.supplementalContent.map((content, idx) => (
                      <Link
                        key={idx}
                        href={content.url}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <ArrowRight className="h-4 w-4" />
                        {content.title} ({content.type})
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Completion Prediction ===== */}
      {completionPrediction && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Clock className="h-6 w-6 text-purple-500" />
            Completion Forecast
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Estimated Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDate(completionPrediction.estimatedCompletionDate)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Confidence Range</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(completionPrediction.confidenceInterval.earliest)}
                {' - '}
                {formatDate(completionPrediction.confidenceInterval.latest)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">Hours Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionPrediction.estimatedHoursRemaining.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={
                  {
                    width: `${Math.min(
                      (completionPrediction.remainingModules /
                        (completionPrediction.remainingModules + 5)) *
                        100,
                      100
                    )}%`,
                  } as React.CSSProperties
                }
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {completionPrediction.remainingModules} modules remaining â€¢{' '}
              {(completionPrediction.confidence * 100).toFixed(0)}% confidence
            </p>
          </div>
        </div>
      )}

      {/* ===== Recommended Learning Paths ===== */}
      {recommendations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Target className="h-6 w-6 text-green-500" />
            Recommended for You
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.courseId}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/courses/${rec.courseId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                    >
                      {rec.courseName}
                    </Link>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="rounded bg-gray-100 px-2 py-1 capitalize dark:bg-gray-800">
                        {rec.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rec.estimatedDuration}h
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {rec.relevanceScore}% match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                {rec.matchReasons.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {rec.matchReasons.slice(0, 2).map((reason, idx) => (
                      <p
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {reason}
                      </p>
                    ))}
                  </div>
                )}

                {/* Potential Skill Gains */}
                {rec.potentialSkillGains.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.potentialSkillGains.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/courses/${rec.courseId}`}
                  className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Course
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Smart Notifications Preview ===== */}
      {notifications.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Upcoming Reminders
          </h2>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <div
                  className={`rounded-lg p-2 ${
                    notif.priority === 'high'
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : notif.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-blue-100 dark:bg-blue-900/20'
                  }`}
                >
                  {notif.type === 'milestone' && <Award className="h-5 w-5 text-yellow-600" />}
                  {notif.type === 'reminder' && <Clock className="h-5 w-5 text-blue-600" />}
                  {notif.type === 'suggestion' && <Lightbulb className="h-5 w-5 text-purple-600" />}
                  {notif.type === 'encouragement' && <Sparkles className="h-5 w-5 text-pink-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Scheduled for {formatDate(notif.scheduledFor)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
