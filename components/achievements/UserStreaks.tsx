'use client'

import { Flame, Snowflake, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserStreak } from '@/lib/services/gamification'

interface UserStreaksProps {
  streaks: UserStreak[]
  className?: string
}

const streakTypeConfig: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  daily_login: {
    label: 'Daily Login',
    icon: Flame,
    color: 'text-orange-600',
  },
  course_engagement: {
    label: 'Course Engagement',
    icon: TrendingUp,
    color: 'text-blue-600',
  },
  lesson_completion: {
    label: 'Lesson Completion',
    icon: TrendingUp,
    color: 'text-green-600',
  },
}

export function UserStreaks({ streaks, className }: UserStreaksProps) {
  if (!streaks || streaks.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <Flame className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500 dark:text-gray-400">No active streaks yet</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Start learning daily to build your streak!
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {streaks.map((streak) => {
        const config = streakTypeConfig[streak.streak_type] || {
          label: streak.streak_type,
          icon: Flame,
          color: 'text-gray-600',
        }
        const Icon = config.icon

        return (
          <div
            key={streak.id}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500" />
            </div>

            {/* Content */}
            <div className="relative">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{config.label}</h4>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {streak.current_streak}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {streak.current_streak === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Current streak</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {streak.longest_streak}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Best streak</p>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <Snowflake className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {streak.freeze_days_available}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Freeze days</p>
                </div>
              </div>

              {/* Last Activity */}
              {streak.last_activity_date && (
                <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Last activity: {new Date(streak.last_activity_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Streak Start */}
              {streak.streak_start_date && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
                  Started {new Date(streak.streak_start_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
