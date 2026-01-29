/**
 * Course Gamification Service
 * World-class gamification system for courses
 * Handles achievements, points, rewards, leaderboards, social learning
 */

import { createBrowserClient } from '@supabase/ssr'

// =====================================================
// Type Definitions
// =====================================================

export interface CourseAchievementCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
}

export interface CourseAchievement {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement_type: string
  requirement_config: Record<string, any>
  points_awarded: number
  badge_image_url?: string
  is_secret: boolean
  is_active: boolean
  display_order: number
  created_at: string
  category?: CourseAchievementCategory
}

export interface UserCourseAchievement {
  id: string
  user_id: string
  achievement_id: string
  course_id: string
  earned_at: string
  progress_at_earning?: Record<string, any>
  context_data?: Record<string, any>
  is_featured: boolean
  is_public: boolean
  display_order: number
  achievement?: CourseAchievement
}

export interface CourseAchievementProgress {
  id: string
  user_id: string
  achievement_id: string
  course_id: string
  current_value: number
  target_value: number
  progress_percentage: number
  last_updated: string
  metadata?: Record<string, any>
  achievement?: CourseAchievement
}

export interface CourseUserStreak {
  id: string
  user_id: string
  course_id: string
  streak_type: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
  freeze_days_available: number
  freeze_days_used: number
  streak_start_date: string
  updated_at: string
}

export interface CoursePointsSource {
  id: string
  name: string
  slug: string
  description: string
  points_amount: number
  category: string
  max_daily_occurrences?: number
  cooldown_minutes?: number
  is_active: boolean
}

export interface UserCoursePoints {
  id: string
  user_id: string
  course_id: string
  total_earned: number
  total_spent: number
  current_balance: number
  points_this_week: number
  points_this_month: number
  points_this_year: number
  lifetime_earnings: number
  level: number
  xp_to_next_level: number
  updated_at: string
}

export interface CoursePointsTransaction {
  id: string
  user_id: string
  course_id: string
  source_id?: string
  transaction_type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund'
  points_amount: number
  balance_after: number
  reason?: string
  metadata?: Record<string, any>
  created_at: string
  source?: CoursePointsSource
}

export interface CourseLeaderboard {
  id: string
  course_id?: string
  organization_id?: string
  leaderboard_type: 'global' | 'organization' | 'course' | 'cohort'
  time_period: 'all_time' | 'yearly' | 'monthly' | 'weekly' | 'daily'
  metric_type: 'points' | 'completions' | 'streak' | 'speed' | 'accuracy'
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
}

export interface CourseLeaderboardEntry {
  id: string
  leaderboard_id: string
  user_id: string
  rank: number
  score: number
  metadata?: Record<string, any>
  calculated_at: string
  user?: {
    display_name: string
    avatar_url?: string
  }
}

export interface CourseUserFollow {
  id: string
  follower_id: string
  following_id: string
  followed_at: string
  notifications_enabled: boolean
}

export interface CourseStudyGroup {
  id: string
  course_id: string
  name: string
  description?: string
  max_members: number
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
}

export interface CourseStudyGroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'moderator' | 'member'
  joined_at: string
  last_active_at: string
}

export interface CourseGroupChallenge {
  id: string
  group_id: string
  course_id: string
  title: string
  description?: string
  challenge_type:
    | 'completion_race'
    | 'points_competition'
    | 'streak_challenge'
    | 'accuracy_challenge'
  target_value: number
  start_date: string
  end_date: string
  prize_config: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface CourseChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  current_progress: number
  rank?: number
  joined_at: string
  last_updated: string
}

export interface CoursePeerReview {
  id: string
  course_id: string
  module_id?: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  review_text?: string
  helpful_count: number
  created_at: string
  updated_at: string
}

// =====================================================
// Course Gamification Service
// =====================================================

export class CourseGamificationService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // =====================================================
  // Achievement Methods
  // =====================================================

  /**
   * Get all achievement categories
   */
  async getAchievementCategories(): Promise<CourseAchievementCategory[]> {
    const { data, error } = await this.supabase
      .from('course_achievement_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  }

  /**
   * Get all achievements
   */
  async getAchievements(categorySlug?: string): Promise<CourseAchievement[]> {
    let query = this.supabase
      .from('course_achievements')
      .select('*, category:course_achievement_categories(*)')
      .eq('is_active', true)
      .order('display_order')

    if (categorySlug) {
      const { data: category } = await this.supabase
        .from('course_achievement_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (category) {
        query = query.eq('category_id', category.id)
      }
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get user's earned achievements for a course
   */
  async getUserCourseAchievements(
    userId: string,
    courseId?: string
  ): Promise<UserCourseAchievement[]> {
    let query = this.supabase
      .from('user_course_achievements')
      .select('*, achievement:course_achievements(*, category:course_achievement_categories(*))')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(
    userId: string,
    courseId?: string
  ): Promise<CourseAchievementProgress[]> {
    let query = this.supabase
      .from('course_achievement_progress')
      .select('*, achievement:course_achievements(*)')
      .eq('user_id', userId)
      .order('progress_percentage', { ascending: false })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Check and award achievements for a user
   */
  async checkAchievements(
    userId: string,
    courseId: string,
    achievementType?: string
  ): Promise<{ success: boolean; new_achievements: any[] }> {
    const { data, error } = await this.supabase.rpc('check_course_achievements', {
      p_user_id: userId,
      p_course_id: courseId,
      p_achievement_type: achievementType,
    })

    if (error) throw error
    return data || { success: false, new_achievements: [] }
  }

  /**
   * Feature an achievement on user profile
   */
  async featureAchievement(achievementId: string, userId: string): Promise<void> {
    // Unfeature all others first
    await this.supabase
      .from('user_course_achievements')
      .update({ is_featured: false })
      .eq('user_id', userId)

    // Feature this one
    const { error } = await this.supabase
      .from('user_course_achievements')
      .update({ is_featured: true })
      .eq('id', achievementId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // =====================================================
  // Points Methods
  // =====================================================

  /**
   * Get user's points for a course
   */
  async getUserCoursePoints(userId: string, courseId: string): Promise<UserCoursePoints | null> {
    const { data, error } = await this.supabase
      .from('user_course_points')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  /**
   * Get all user's course points
   */
  async getAllUserCoursePoints(userId: string): Promise<UserCoursePoints[]> {
    const { data, error } = await this.supabase
      .from('user_course_points')
      .select('*')
      .eq('user_id', userId)
      .order('current_balance', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Award points to a user for a course
   */
  async awardPoints(
    userId: string,
    courseId: string,
    sourceSlug: string,
    customAmount?: number,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; points_awarded: number; new_balance: number }> {
    const { data, error } = await this.supabase.rpc('award_course_points', {
      p_user_id: userId,
      p_course_id: courseId,
      p_source_slug: sourceSlug,
      p_points_amount: customAmount,
      p_reason: reason,
      p_metadata: metadata || {},
    })

    if (error) throw error
    return data || { success: false, points_awarded: 0, new_balance: 0 }
  }

  /**
   * Get points transaction history
   */
  async getPointsTransactions(
    userId: string,
    courseId?: string,
    limit = 50
  ): Promise<CoursePointsTransaction[]> {
    let query = this.supabase
      .from('course_points_transactions')
      .select('*, source:course_points_sources(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get available points sources
   */
  async getPointsSources(): Promise<CoursePointsSource[]> {
    const { data, error } = await this.supabase
      .from('course_points_sources')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) throw error
    return data || []
  }

  // =====================================================
  // Streak Methods
  // =====================================================

  /**
   * Get user's streaks for a course
   */
  async getCourseStreaks(userId: string, courseId: string): Promise<CourseUserStreak[]> {
    const { data, error } = await this.supabase
      .from('course_user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (error) throw error
    return data || []
  }

  /**
   * Update user's learning streak
   */
  async updateStreak(
    userId: string,
    courseId: string,
    streakType = 'daily_learning'
  ): Promise<{ success: boolean; current_streak: number }> {
    const { data, error } = await this.supabase.rpc('update_course_streak', {
      p_user_id: userId,
      p_course_id: courseId,
      p_streak_type: streakType,
    })

    if (error) throw error
    return data || { success: false, current_streak: 0 }
  }

  /**
   * Get user's best streak across all courses
   */
  async getUserBestStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('course_user_streaks')
      .select('longest_streak')
      .eq('user_id', userId)
      .order('longest_streak', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.longest_streak || 0
  }

  // =====================================================
  // Leaderboard Methods
  // =====================================================

  /**
   * Get course leaderboards
   */
  async getLeaderboards(courseId?: string, organizationId?: string): Promise<CourseLeaderboard[]> {
    let query = this.supabase.from('course_leaderboards').select('*').eq('is_active', true)

    if (courseId) query = query.eq('course_id', courseId)
    if (organizationId) query = query.eq('organization_id', organizationId)

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboardEntries(
    leaderboardId: string,
    limit = 100
  ): Promise<CourseLeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from('course_leaderboard_entries')
      .select(
        `
        *,
        user:user_profiles(display_name, avatar_url)
      `
      )
      .eq('leaderboard_id', leaderboardId)
      .order('rank')
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Get user's rank on a leaderboard
   */
  async getUserLeaderboardRank(
    leaderboardId: string,
    userId: string
  ): Promise<CourseLeaderboardEntry | null> {
    const { data, error } = await this.supabase
      .from('course_leaderboard_entries')
      .select('*')
      .eq('leaderboard_id', leaderboardId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  /**
   * Calculate/refresh leaderboard
   */
  async calculateLeaderboard(
    leaderboardId: string
  ): Promise<{ success: boolean; entries: number }> {
    const { data, error } = await this.supabase.rpc('calculate_course_leaderboard', {
      p_leaderboard_id: leaderboardId,
    })

    if (error) throw error
    return data || { success: false, entries: 0 }
  }

  // =====================================================
  // Social Learning Methods
  // =====================================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await this.supabase.from('course_user_follows').insert({
      follower_id: followerId,
      following_id: followingId,
    })

    if (error) throw error

    // Award points for social interaction
    await this.awardPoints(
      followerId,
      'global',
      'study-buddy',
      undefined,
      'Followed a peer learner'
    )
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('course_user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (error) throw error
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string): Promise<CourseUserFollow[]> {
    const { data, error } = await this.supabase
      .from('course_user_follows')
      .select('*')
      .eq('following_id', userId)

    if (error) throw error
    return data || []
  }

  /**
   * Get users that a user is following
   */
  async getUserFollowing(userId: string): Promise<CourseUserFollow[]> {
    const { data, error } = await this.supabase
      .from('course_user_follows')
      .select('*')
      .eq('follower_id', userId)

    if (error) throw error
    return data || []
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('course_user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    return !!data && !error
  }

  // =====================================================
  // Study Group Methods
  // =====================================================

  /**
   * Create a study group
   */
  async createStudyGroup(
    courseId: string,
    name: string,
    description: string,
    createdBy: string,
    isPublic = true,
    maxMembers = 10
  ): Promise<CourseStudyGroup> {
    const { data, error } = await this.supabase
      .from('course_study_groups')
      .insert({
        course_id: courseId,
        name,
        description,
        created_by: createdBy,
        is_public: isPublic,
        max_members: maxMembers,
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as owner
    await this.supabase.from('course_study_group_members').insert({
      group_id: data.id,
      user_id: createdBy,
      role: 'owner',
    })

    return data
  }

  /**
   * Get study groups for a course
   */
  async getCourseStudyGroups(courseId: string): Promise<CourseStudyGroup[]> {
    const { data, error } = await this.supabase
      .from('course_study_groups')
      .select('*, member_count:course_study_group_members(count)')
      .eq('course_id', courseId)
      .eq('is_public', true)

    if (error) throw error
    return data || []
  }

  /**
   * Get user's study groups
   */
  async getUserStudyGroups(userId: string): Promise<CourseStudyGroup[]> {
    const { data: memberships, error: memberError } = await this.supabase
      .from('course_study_group_members')
      .select('group_id')
      .eq('user_id', userId)

    if (memberError) throw memberError

    if (!memberships || memberships.length === 0) return []

    const groupIds = memberships.map((m) => m.group_id)
    const { data, error } = await this.supabase
      .from('course_study_groups')
      .select('*, member_count:course_study_group_members(count)')
      .in('id', groupIds)

    if (error) throw error
    return data || []
  }

  /**
   * Join a study group
   */
  async joinStudyGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from('course_study_group_members').insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    })

    if (error) throw error
  }

  /**
   * Leave a study group
   */
  async leaveStudyGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('course_study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) throw error
  }

  /**
   * Get study group members
   */
  async getStudyGroupMembers(groupId: string): Promise<CourseStudyGroupMember[]> {
    const { data, error } = await this.supabase
      .from('course_study_group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at')

    if (error) throw error
    return data || []
  }

  // =====================================================
  // Group Challenge Methods
  // =====================================================

  /**
   * Create a group challenge
   */
  async createGroupChallenge(
    groupId: string,
    courseId: string,
    title: string,
    description: string,
    challengeType: CourseGroupChallenge['challenge_type'],
    targetValue: number,
    startDate: string,
    endDate: string,
    prizeConfig: Record<string, any>
  ): Promise<CourseGroupChallenge> {
    const { data, error } = await this.supabase
      .from('course_group_challenges')
      .insert({
        group_id: groupId,
        course_id: courseId,
        title,
        description,
        challenge_type: challengeType,
        target_value: targetValue,
        start_date: startDate,
        end_date: endDate,
        prize_config: prizeConfig,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get active challenges for a group
   */
  async getGroupChallenges(groupId: string): Promise<CourseGroupChallenge[]> {
    const { data, error } = await this.supabase
      .from('course_group_challenges')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('start_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from('course_challenge_participants').insert({
      challenge_id: challengeId,
      user_id: userId,
      current_progress: 0,
    })

    if (error) throw error
  }

  /**
   * Get challenge participants
   */
  async getChallengeParticipants(challengeId: string): Promise<CourseChallengeParticipant[]> {
    const { data, error } = await this.supabase
      .from('course_challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('current_progress', { ascending: false })

    if (error) throw error
    return data || []
  }

  // =====================================================
  // Peer Review Methods
  // =====================================================

  /**
   * Submit a peer review
   */
  async submitPeerReview(
    courseId: string,
    moduleId: string | undefined,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    reviewText?: string
  ): Promise<CoursePeerReview> {
    const { data, error } = await this.supabase
      .from('course_peer_reviews')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        review_text: reviewText,
      })
      .select()
      .single()

    if (error) throw error

    // Award points for peer review
    await this.awardPoints(
      reviewerId,
      courseId,
      'content-review',
      undefined,
      'Peer review submitted'
    )

    return data
  }

  /**
   * Get peer reviews for a course
   */
  async getCoursePeerReviews(courseId: string, moduleId?: string): Promise<CoursePeerReview[]> {
    let query = this.supabase
      .from('course_peer_reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get reviews for a user
   */
  async getUserReviews(userId: string, asReviewer = true): Promise<CoursePeerReview[]> {
    const field = asReviewer ? 'reviewer_id' : 'reviewee_id'
    const { data, error } = await this.supabase
      .from('course_peer_reviews')
      .select('*')
      .eq(field, userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment', {
      table_name: 'course_peer_reviews',
      row_id: reviewId,
      column_name: 'helpful_count',
    })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: review } = await this.supabase
        .from('course_peer_reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single()

      if (review) {
        await this.supabase
          .from('course_peer_reviews')
          .update({ helpful_count: review.helpful_count + 1 })
          .eq('id', reviewId)
      }
    }
  }

  // =====================================================
  // Analytics & Insights
  // =====================================================

  /**
   * Get gamification summary for user
   */
  async getGamificationSummary(
    userId: string,
    courseId?: string
  ): Promise<{
    total_achievements: number
    total_points: number
    current_streak: number
    longest_streak: number
    leaderboard_rank?: number
    level: number
  }> {
    // Get achievements count
    let achievementsQuery = this.supabase
      .from('user_course_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (courseId) achievementsQuery = achievementsQuery.eq('course_id', courseId)
    const { count: achievementsCount } = await achievementsQuery

    // Get points
    let pointsData = null
    if (courseId) {
      pointsData = await this.getUserCoursePoints(userId, courseId)
    } else {
      const allPoints = await this.getAllUserCoursePoints(userId)
      const totalPoints = allPoints.reduce((sum, p) => sum + p.current_balance, 0)
      pointsData = {
        current_balance: totalPoints,
        level: Math.max(...allPoints.map((p) => p.level), 1),
      }
    }

    // Get streaks
    let streakQuery = this.supabase
      .from('course_user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .order('current_streak', { ascending: false })
      .limit(1)

    if (courseId) streakQuery = streakQuery.eq('course_id', courseId)
    const { data: streakData } = await streakQuery.single()

    return {
      total_achievements: achievementsCount || 0,
      total_points: pointsData?.current_balance || 0,
      current_streak: streakData?.current_streak || 0,
      longest_streak: streakData?.longest_streak || 0,
      level: pointsData?.level || 1,
    }
  }
}

// Export singleton instance
export const courseGamificationService = new CourseGamificationService()
