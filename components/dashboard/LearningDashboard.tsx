'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * Learning Dashboard - Simplified Version
 * Shows hero streak metric + top 2 skills + 3 recent activities
 * Part of Dashboard Simplification (Approach A)
 */

import { useEffect, useState } from 'react'
import { Clock, BookOpen, Flame, Target, Activity, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  getDashboardStats,
  getLearningStreak,
  getSkillProgress,
  getRecentActivity,
} from '@/lib/services/dashboard-analytics'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export interface LearningDashboardProps {
  userId: string
}

export default function LearningDashboard({ userId }: LearningDashboardProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [statsData, streakData, skillsData, activitiesData] = await Promise.all([
          getDashboardStats(userId),
          getLearningStreak(userId),
          getSkillProgress(userId),
          getRecentActivity(userId, 3), // Limit to 3 activities
        ])

        setStats(statsData)
        setStreak(streakData)
        setSkills(skillsData.slice(0, 2)) // Limit to top 2 skills
        setActivities(activitiesData)
      } catch (err) {
        logger.error('Dashboard error:', { error: err, context: 'LearningDashboard' })
        setError(t('errors.loading_dashboard'))
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId, t])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <p className="text-sm text-yellow-800">{error}</p>
      </div>
    )
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getRelativeTime = (date: string): string => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Hero Metric - Learning Streak */}
      {streak && streak.current_streak > 0 ? (
        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Flame className="h-8 w-8" />
                <h2 className="text-3xl font-bold">{streak.current_streak} Day Streak</h2>
              </div>
              <p className="mb-4 text-lg text-orange-100">Keep it going! You&apos;re on fire ðŸ”¥</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold transition-colors hover:bg-white/30"
              >
                <span>Continue Learning</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="text-right">
              <p className="mb-1 text-sm text-orange-100">Longest Streak</p>
              <p className="text-2xl font-bold">{streak.longest_streak} Days</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Target className="h-8 w-8" />
                <h2 className="text-3xl font-bold">Start Your Learning Journey</h2>
              </div>
              <p className="mb-4 text-lg text-blue-100">
                Begin building your streak by completing your first lesson
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold transition-colors hover:bg-white/30"
              >
                <span>Browse Courses</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="text-right">
              <p className="mb-1 text-sm text-blue-100">Your Goal</p>
              <p className="text-2xl font-bold">7 Day Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats - 3 Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Watch Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(stats.total_watch_time)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.total_watch_time === 0
                ? 'Start watching lessons to track your progress'
                : 'Keep learning!'}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">Lessons Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.lessons_completed}</p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.lessons_completed === 0
                ? 'Complete your first lesson today'
                : `${stats.lessons_started} started`}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">Study Notes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.notes_created}</p>
            <p className="mt-1 text-xs text-gray-500">
              {stats.notes_created === 0
                ? 'Create notes while learning to retain knowledge'
                : 'Great note-taking!'}
            </p>
          </div>
        </div>
      )}

      {/* Skills Progress - Top 2 Only */}
      {skills.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Skills</h3>
            </div>
            <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{skill.skill_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {formatDuration(skill.time_spent_seconds)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {skill.lessons_completed}/{skill.total_lessons}
                    </span>
                  </div>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full bg-blue-600 transition-all duration-500 ${
                      skill.completion_percentage === 0
                        ? 'w-0'
                        : skill.completion_percentage < 25
                          ? 'w-1/4'
                          : skill.completion_percentage < 50
                            ? 'w-1/2'
                            : skill.completion_percentage < 75
                              ? 'w-3/4'
                              : 'w-full'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {skill.completion_percentage}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-4">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Build Your Skills</h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-600">
            As you complete lessons, we&apos;ll track your progress across different skills and
            competencies
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <span>Start Learning</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Recent Activity - Limit 3 */}
      {activities.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <Link href="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className={`rounded-lg p-2 ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {activity.lesson_title}
                    </p>
                    <p className="truncate text-xs text-gray-500">{activity.course_title}</p>
                  </div>
                </div>

                <div className="ml-2 text-right">
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(activity.activity_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-100 p-4">
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No Activity Yet</h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-600">
            Your recent learning activity will appear here. Start watching lessons, taking notes,
            and completing courses!
          </p>
          <Link
            href="/training"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <span>Explore Training</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

// Helper Functions

function getActivityColor(type: string): string {
  switch (type) {
    case 'complete':
      return 'bg-green-100 text-green-600'
    case 'watch':
      return 'bg-blue-100 text-blue-600'
    case 'note':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getActivityIcon(type: string): React.ReactNode {
  switch (type) {
    case 'complete':
      return <BookOpen className="h-4 w-4" />
    case 'watch':
      return <Clock className="h-4 w-4" />
    case 'note':
      return <FileText className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}
