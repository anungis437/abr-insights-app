'use client'

/**
 * Learning Dashboard - Simplified Version
 * Shows hero streak metric + top 2 skills + 3 recent activities
 * Part of Dashboard Simplification (Approach A)
 */

import { useEffect, useState } from 'react'
import { 
  Clock, 
  BookOpen, 
  Flame, 
  Target,
  Activity,
  FileText,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getLearningStreak, getSkillProgress, getRecentActivity } from '@/lib/services/dashboard-analytics'
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
          getRecentActivity(userId, 3) // Limit to 3 activities
        ])

        setStats(statsData)
        setStreak(streakData)
        setSkills(skillsData.slice(0, 2)) // Limit to top 2 skills
        setActivities(activitiesData)
      } catch (err) {
        console.error('Dashboard error:', err)
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
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
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
      {streak && streak.current_streak > 0 && (
        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Flame className="w-8 h-8" />
                <h2 className="text-3xl font-bold">
                  {streak.current_streak} {t('learning.day_streak')}
                </h2>
              </div>
              <p className="text-orange-100 text-lg mb-4">
                {t('learning.streak_active')}
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold transition-colors hover:bg-white/30"
              >
                <span>{t('learning.continue_learning')}</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100 mb-1">{t('learning.longest_streak')}</p>
              <p className="text-2xl font-bold">{streak.longest_streak} {t('learning.days')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats - 3 Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">{t('learning.watch_time')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(stats.total_watch_time_seconds)}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">{t('learning.lessons_completed')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.lessons_completed}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">{t('learning.notes_created')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.notes_created}
            </p>
          </div>
        </div>
      )}

      {/* Skills Progress - Top 2 Only */}
      {skills.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('learning.top_skills')}</h3>
            </div>
            <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('common.view_all')}
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
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${skill.completion_percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {skill.completion_percentage}% {t('learning.complete')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity - Limit 3 */}
      {activities.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('learning.recent_activity')}</h3>
            </div>
            <Link href="/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('common.view_all')}
            </Link>
          </div>

          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`rounded-lg p-2 ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.lesson_title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.course_title}
                    </p>
                  </div>
                </div>
                
                <div className="text-right ml-2">
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(activity.activity_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
      return <BookOpen className="w-4 h-4" />
    case 'watch':
      return <Clock className="w-4 h-4" />
    case 'note':
      return <FileText className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}
