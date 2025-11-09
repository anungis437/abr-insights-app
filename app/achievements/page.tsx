'use client'

/**
 * Achievements Page
 * Display user badges, points, and achievement progress
 * Part of Phase 5: Authenticated Pages Migration
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Award, Star, Target, TrendingUp, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AchievementsService, type UserPoints } from '@/lib/supabase/services/achievements'

type DbAchievement = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  badge_image_url: string | null
  type: string
  category: string | null
  points_value: number
  rarity: string
  is_secret: boolean
  earned_count: number
}

type DbUserAchievement = {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  points_awarded: number
  achievement: DbAchievement
}

export default function AchievementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [userAchievements, setUserAchievements] = useState<DbUserAchievement[]>([])
  const [allAchievements, setAllAchievements] = useState<DbAchievement[]>([])

  const checkAuth = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/achievements')
      return
    }

    await loadData(user.id)
  }, [router])

  async function loadData(userId: string) {
    try {
      const service = new AchievementsService()

      // Load in parallel
      const [points, earned, all] = await Promise.all([
        service.getUserPoints(userId),
        service.getUserAchievements(userId),
        service.listAchievements()
      ])

      setUserPoints(points)
      setUserAchievements(earned as any)
      setAllAchievements(all as any)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id))
  const earnedCount = userAchievements.length
  const totalCount = allAchievements.length
  const completionPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'epic': return 'text-purple-500 bg-purple-50 border-purple-200'
      case 'rare': return 'text-blue-500 bg-blue-50 border-blue-200'
      case 'uncommon': return 'text-green-500 bg-green-50 border-green-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Trophy className="h-5 w-5" />
      case 'epic': return <Award className="h-5 w-5" />
      case 'rare': return <Star className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container-custom py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-4 text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">      
      <div className="container-custom py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Achievements</h1>
            <p className="mt-2 text-gray-600">
              Track your progress and celebrate your accomplishments
            </p>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            {/* Total Points */}
            <div className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <Trophy className="h-8 w-8" />
                <span className="text-2xl font-bold">{userPoints?.total_points || 0}</span>
              </div>
              <p className="text-sm opacity-90">Total Points</p>
            </div>

            {/* Achievements Earned */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <Award className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">{earnedCount}</span>
              </div>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>

            {/* Completion Rate */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
              </div>
              <p className="text-sm text-gray-600">Completion</p>
            </div>

            {/* Course Points */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <Star className="h-8 w-8 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{userPoints?.course_points || 0}</span>
              </div>
              <p className="text-sm text-gray-600">Course Points</p>
            </div>
          </div>

          {/* Points Breakdown */}
          {userPoints && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Points Breakdown</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Course Completion</span>
                  <span className="font-semibold text-gray-900">{userPoints.course_points} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Engagement</span>
                  <span className="font-semibold text-gray-900">{userPoints.engagement_points} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Achievements</span>
                  <span className="font-semibold text-gray-900">{userPoints.achievement_points} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bonus</span>
                  <span className="font-semibold text-gray-900">{userPoints.bonus_points} pts</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">{userPoints.total_points} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Grid */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              All Achievements ({earnedCount} of {totalCount})
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allAchievements.map((achievement) => {
                const isEarned = earnedAchievementIds.has(achievement.id)
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id)
                const rarityColors = getRarityColor(achievement.rarity)

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-lg border-2 p-6 transition-all ${
                      isEarned
                        ? `${rarityColors} shadow-md`
                        : 'border-gray-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        isEarned ? rarityColors : 'bg-gray-100 text-gray-400'
                      }`}>
                        {achievement.is_secret && !isEarned ? (
                          <Lock className="h-6 w-6" />
                        ) : (
                          getRarityIcon(achievement.rarity)
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold uppercase ${rarityColors}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-2 font-semibold text-gray-900">
                      {achievement.is_secret && !isEarned ? '???' : achievement.name}
                    </h3>
                    
                    <p className="mb-4 text-sm text-gray-600">
                      {achievement.is_secret && !isEarned 
                        ? 'Complete the hidden challenge to unlock this achievement'
                        : achievement.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-600">
                        +{achievement.points_value} pts
                      </span>
                      
                      {isEarned && userAchievement && (
                        <span className="text-xs text-gray-500">
                          Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {achievement.category && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {achievement.category}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {allAchievements.length === 0 && (
              <div className="py-12 text-center">
                <Award className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-600">No achievements available yet</p>
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          {userAchievements.length > 0 && (
            <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Achievements</h2>
              
              <div className="space-y-3">
                {userAchievements.slice(0, 5).map((ua) => (
                  <div key={ua.id} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getRarityColor(ua.achievement.rarity)}`}>
                      {getRarityIcon(ua.achievement.rarity)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{ua.achievement.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ua.earned_at).toLocaleDateString()} • +{ua.points_awarded} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>    </div>
  )
}
