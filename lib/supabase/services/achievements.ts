/**
 * Achievements & Gamification Service
 * Replaces: base44.entities.UserAchievement
 * Tables: achievements, user_achievements, custom_badges, user_points
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AchievementType =
  | 'course_completion'
  | 'streak'
  | 'engagement'
  | 'milestone'
  | 'special'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string | null
  type: AchievementType
  points: number
  criteria: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserAchievement = {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress_data: Record<string, any> | null
  created_at: string
}

export type CustomBadge = {
  id: string
  organization_id: string
  name: string
  description: string
  icon: string | null
  criteria: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type UserPoints = {
  id: string
  user_id: string
  total_points: number
  course_points: number
  engagement_points: number
  achievement_points: number
  bonus_points: number
  created_at: string
  updated_at: string
}

export class AchievementsService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get all achievements
   * Replaces: base44.entities.Achievement.list()
   */
  async listAchievements() {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: false })

    if (error) throw error
    return data as Achievement[]
  }

  /**
   * Get user achievements
   * Replaces: base44.entities.UserAchievement.getUserAchievements()
   */
  async getUserAchievements(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_achievements')
        .select(
          `
          *,
          achievement:achievements(*)
        `
        )
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) {
        // Handle table not found gracefully
        if (error.code === 'PGRST301' || error.code === '42P01' || error.code === 'PGRST205') {
          console.warn('[Achievements] user_achievements table not found, returning empty array')
          return []
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('[Achievements] Error fetching user achievements:', error)
      return []
    }
  }

  /**
   * Award achievement to user
   * Replaces: base44.entities.UserAchievement.award()
   */
  async awardAchievement(
    userId: string,
    achievementId: string,
    progressData?: Record<string, any>
  ) {
    // Check if already earned
    const { data: existing } = await this.supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()

    if (existing) {
      return existing as UserAchievement
    }

    // Get achievement details
    const { data: achievement } = await this.supabase
      .from('achievements')
      .select('points')
      .eq('id', achievementId)
      .single()

    // Award achievement
    const { data, error } = await this.supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
        progress_data: progressData,
      })
      .select()
      .single()

    if (error) throw error

    // Update user points
    if (achievement?.points) {
      await this.addPoints(userId, achievement.points, 'achievement_points')
    }

    return data as UserAchievement
  }

  /**
   * Get user points
   * Replaces: base44.entities.UserPoints.get()
   */
  async getUserPoints(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Handle table not found gracefully
        if (
          error.code === 'PGRST301' ||
          error.code === '42P01' ||
          error.code === 'PGRST205' ||
          error.code === 'PGRST204'
        ) {
          console.warn('[Achievements] user_points table not found, returning default')
          return {
            user_id: userId,
            total_points: 0,
            course_points: 0,
            engagement_points: 0,
            achievement_points: 0,
            bonus_points: 0,
          } as UserPoints
        }
        // Create if doesn't exist
        if (error.code === 'PGRST116') {
          return await this.initializeUserPoints(userId)
        }
        throw error
      }

      return data as UserPoints
    } catch (error) {
      console.error('[Achievements] Error fetching user points:', error)
      return {
        user_id: userId,
        total_points: 0,
        course_points: 0,
        engagement_points: 0,
        achievement_points: 0,
        bonus_points: 0,
      } as UserPoints
    }
  }

  /**
   * Initialize user points
   */
  async initializeUserPoints(userId: string) {
    const { data, error } = await this.supabase
      .from('user_points')
      .insert({
        user_id: userId,
        total_points: 0,
        course_points: 0,
        engagement_points: 0,
        achievement_points: 0,
        bonus_points: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data as UserPoints
  }

  /**
   * Add points to user
   * Replaces: base44.entities.UserPoints.add()
   */
  async addPoints(
    userId: string,
    points: number,
    category:
      | 'course_points'
      | 'engagement_points'
      | 'achievement_points'
      | 'bonus_points' = 'engagement_points'
  ) {
    // Get current points
    const current = await this.getUserPoints(userId)

    // Calculate new totals
    const newCategoryPoints = (current[category] || 0) + points
    const newTotalPoints = current.total_points + points

    // Update
    const { data, error } = await this.supabase
      .from('user_points')
      .update({
        [category]: newCategoryPoints,
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as UserPoints
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(organizationId?: string, limit = 10) {
    let query = this.supabase
      .from('user_points')
      .select(
        `
        *,
        profile:profiles(*)
      `
      )
      .order('total_points', { ascending: false })
      .limit(limit)

    if (organizationId) {
      query = query.eq('profile.organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  /**
   * Get user rank
   */
  async getUserRank(userId: string, organizationId?: string) {
    const userPoints = await this.getUserPoints(userId)

    let query = this.supabase
      .from('user_points')
      .select('user_id', { count: 'exact', head: true })
      .gt('total_points', userPoints.total_points)

    if (organizationId) {
      query = query.eq('profiles.organization_id', organizationId)
    }

    const { count, error } = await query

    if (error) throw error
    return (count || 0) + 1
  }

  /**
   * Create custom badge
   * Replaces: base44.entities.CustomBadge.create()
   */
  async createCustomBadge(
    organizationId: string,
    badgeData: Omit<CustomBadge, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    const { data, error } = await this.supabase
      .from('custom_badges')
      .insert({
        ...badgeData,
        organization_id: organizationId,
      })
      .select()
      .single()

    if (error) throw error
    return data as CustomBadge
  }

  /**
   * List custom badges for organization
   */
  async listCustomBadges(organizationId: string) {
    const { data, error } = await this.supabase
      .from('custom_badges')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as CustomBadge[]
  }

  /**
   * Check and award achievements based on activity
   */
  async checkAndAwardAchievements(
    userId: string,
    activityType: string,
    activityData: Record<string, any>
  ) {
    // Get all active achievements
    const achievements = await this.listAchievements()

    // Filter by type and check criteria
    const earnedAchievements: UserAchievement[] = []

    for (const achievement of achievements) {
      if (await this.checkAchievementCriteria(userId, achievement, activityType, activityData)) {
        const earned = await this.awardAchievement(userId, achievement.id, activityData)
        earnedAchievements.push(earned)
      }
    }

    return earnedAchievements
  }

  /**
   * Check if user meets achievement criteria
   */
  private async checkAchievementCriteria(
    userId: string,
    achievement: Achievement,
    activityType: string,
    activityData: Record<string, any>
  ): Promise<boolean> {
    // Check if already earned
    const { data: existing } = await this.supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .single()

    if (existing) return false

    // Check criteria based on achievement type
    const criteria = achievement.criteria

    switch (achievement.type) {
      case 'course_completion':
        if (activityType === 'course_completed' && criteria.course_count) {
          const { count } = await this.supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('completed_at', 'is', null)

          return (count || 0) >= criteria.course_count
        }
        break

      case 'streak':
        if (activityType === 'daily_login' && criteria.days) {
          // Check login streak (implementation depends on login tracking)
          return activityData.current_streak >= criteria.days
        }
        break

      case 'engagement':
        if (criteria.action_count) {
          // Check specific engagement actions
          return activityData.action_count >= criteria.action_count
        }
        break

      case 'milestone':
        if (criteria.milestone_value) {
          return activityData.value >= criteria.milestone_value
        }
        break
    }

    return false
  }
}

// Export singleton instance
export const achievementsService = new AchievementsService()
