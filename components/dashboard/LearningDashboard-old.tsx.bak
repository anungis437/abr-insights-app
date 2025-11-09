'use client'

/**
 * Learning Dashboard Component
 * Comprehensive analytics dashboard for user learning progress
 * Part of Phase 2 Task 4: Learning Dashboard Enhancement
 * Updated Phase 2 Task 5: Added bilingual support
 */

import { useEffect, useState } from 'react'
import { 
  Clock, 
  TrendingUp, 
  Award, 
  BookOpen, 
  FileText, 
  Flame,
  Target,
  Activity
} from 'lucide-react'
import {
  getDashboardStats,
  getLearningStreak,
  getSkillProgress,
  getRecentActivity,
  formatDuration,
  type DashboardStats,
  type LearningStreak,
  type SkillProgress,
  type RecentActivity
} from '@/lib/services/dashboard-analytics'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface LearningDashboardProps {
  userId: string
}

export default function LearningDashboard({ userId }: LearningDashboardProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [streak, setStreak] = useState<LearningStreak | null>(null)
  const [skills, setSkills] = useState<SkillProgress[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)

        const [statsData, streakData, skillsData, activitiesData] = await Promise.all([
          getDashboardStats(userId),
          getLearningStreak(userId),
          getSkillProgress(userId),
          getRecentActivity(userId, 10)
        ])

        setStats(statsData)
        setStreak(streakData)
        setSkills(skillsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadDashboardData()
    }
  }, [userId])

  // Helper function for relative time with translations
  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('time.just_now')
    if (diffMins < 60) return t('time.minutes_ago', { count: diffMins.toString() })
    if (diffHours < 24) return t('time.hours_ago', { count: diffHours.toString() })
    if (diffDays < 7) return t('time.days_ago', { count: diffDays.toString() })
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
        <p className="text-yellow-800">{t('common.error')}: {t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('learning.analytics')}</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Watch Time */}
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title={t('learning.total_watch_time')}
            value={formatDuration(stats.total_watch_time)}
            subtitle={t('learning.lessons_started', { count: stats.lessons_started.toString() })}
            color="blue"
          />

          {/* Lessons Completed */}
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title={t('learning.lessons_completed')}
            value={stats.lessons_completed.toString()}
            subtitle={t('learning.completion_rate', { rate: stats.average_completion_rate.toString() })}
            color="green"
          />

          {/* Learning Streak */}
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            title={t('learning.current_streak')}
            value={t('learning.streak_days', { count: (streak?.current_streak || 0).toString() })}
            subtitle={t('learning.longest_streak', { days: (streak?.longest_streak || 0).toString() })}
            color="orange"
          />

          {/* CE Credits */}
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title={t('learning.ce_credits')}
            value={stats.ce_credits_earned.toFixed(1)}
            subtitle={t('learning.continuing_education')}
            color="purple"
          />
        </div>
      </div>

      {/* Learning Streak Calendar */}
      {streak && streak.current_streak > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('learning.current_streak')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.current_streak')}</span>
              <span className="text-2xl font-bold text-orange-600">
                {t('learning.streak_days', { count: streak.current_streak.toString() })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.longest_streak', { days: '' }).split(':')[0]}</span>
              <span className="text-lg font-semibold text-gray-900">
                {t('learning.streak_days', { count: streak.longest_streak.toString() })}
              </span>
            </div>

            {streak.last_activity_date && (
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {t('learning.last_activity', { 
                    date: new Date(streak.last_activity_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill Progress */}
      {skills.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('learning.progress_by_skill')}</h3>
          </div>

          <div className="space-y-4">
            {skills.slice(0, 5).map((skill, index) => (
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
                    {skill.completion_percentage}% complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('learning.recent_activity')}</h3>
          </div>

          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className={`mt-1 rounded-lg p-2 ${getActivityColor(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.lesson_title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.course_title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t(`activity.${activity.activity_type === 'complete' ? 'completed' : activity.activity_type === 'watch' ? 'watched' : 'added_note'}`)}
                    </span>
                    {activity.duration_seconds && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDuration(activity.duration_seconds)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {getRelativeTime(activity.activity_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Session Stats */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('learning.session_statistics')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.longest_session')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatDuration(stats.longest_session)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.average_completion')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.average_completion_rate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.total_sessions')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.lessons_started}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Stats */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('learning.note_taking_activity')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.notes_created')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.notes_created}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('learning.notes_per_lesson')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.lessons_started > 0 
                  ? (stats.notes_created / stats.lessons_started).toFixed(1)
                  : '0.0'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className={`inline-flex rounded-lg p-3 ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
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


