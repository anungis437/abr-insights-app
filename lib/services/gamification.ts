/**
 * Gamification Service
 * Handles achievements, points, rewards, leaderboards, and leveling
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// =====================================================
// Type Definitions
// =====================================================

export interface AchievementCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface Achievement {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement_type: string;
  requirement_config: Record<string, any>;
  points_awarded: number;
  badge_image_url?: string;
  is_secret: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  category?: AchievementCategory;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress_at_earning?: Record<string, any>;
  context_data?: Record<string, any>;
  is_featured: boolean;
  is_public: boolean;
  display_order: number;
  achievement?: Achievement;
}

export interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  last_updated: string;
  metadata?: Record<string, any>;
  achievement?: Achievement;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  freeze_days_available: number;
  freeze_days_used: number;
  streak_start_date: string;
  updated_at: string;
}

export interface PointsSource {
  id: string;
  name: string;
  slug: string;
  description: string;
  points_amount: number;
  category: string;
  max_daily_occurrences?: number;
  cooldown_minutes?: number;
  is_active: boolean;
}

export interface UserPoints {
  id: string;
  user_id: string;
  total_earned: number;
  total_spent: number;
  current_balance: number;
  points_this_week: number;
  points_this_month: number;
  points_this_year: number;
  current_week: number;
  current_month: number;
  current_year: number;
  current_multiplier: number;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'adjustment' | 'reward' | 'reversal';
  points_amount: number;
  balance_after: number;
  source_type?: string;
  source_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  multiplier_applied?: number;
  related_transaction_id?: string;
  is_reversed: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  points_cost: number;
  reward_type: string;
  reward_value?: string;
  stock_quantity?: number;
  current_stock?: number;
  max_per_user?: number;
  delivery_method: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'refunded';
  delivery_data?: Record<string, any>;
  redeemed_at: string;
  delivered_at?: string;
  expires_at?: string;
  reward?: Reward;
}

export interface Leaderboard {
  id: string;
  name: string;
  slug: string;
  description: string;
  leaderboard_type: 'global' | 'course' | 'organization' | 'skill' | 'custom';
  time_period: 'all_time' | 'yearly' | 'monthly' | 'weekly' | 'daily';
  scope_id?: string;
  is_active: boolean;
  display_order: number;
}

export interface LeaderboardEntry {
  id: string;
  leaderboard_id: string;
  user_id: string;
  rank: number;
  previous_rank?: number;
  rank_change: number;
  score: number;
  previous_score?: number;
  percentile?: number;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  current_xp: number;
  total_xp_earned: number;
  xp_for_next_level: number;
  points_multiplier: number;
  level_up_count: number;
  last_level_up_at?: string;
  updated_at: string;
}

export interface AchievementSummary {
  total_achievements: number;
  total_points: number;
  by_tier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  by_category: Record<string, number>;
  recent_achievements: UserAchievement[];
  featured_achievements: UserAchievement[];
  current_streaks: UserStreak[];
}

export interface PointsSummary {
  current_balance: number;
  total_earned: number;
  total_spent: number;
  points_this_week: number;
  points_this_month: number;
  current_level: number;
  current_xp: number;
  xp_for_next_level: number;
  points_multiplier: number;
  global_rank?: number;
  recent_transactions: PointsTransaction[];
}

// =====================================================
// Gamification Service Class
// =====================================================

export class GamificationService {
  private supabase = createClientComponentClient();

  // =====================================================
  // Achievements
  // =====================================================

  /**
   * Get all achievement categories
   */
  async getAchievementCategories(): Promise<AchievementCategory[]> {
    const { data, error } = await this.supabase
      .from('achievement_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all achievements, optionally filtered by category
   */
  async getAchievements(categoryId?: string, includeSecret = false): Promise<Achievement[]> {
    let query = this.supabase
      .from('achievements')
      .select('*, category:achievement_categories(*)')
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (!includeSecret) {
      query = query.eq('is_secret', false);
    }

    query = query.order('display_order');

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's earned achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*, category:achievement_categories(*))')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's achievement progress
   */
  async getUserAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    const { data, error } = await this.supabase
      .from('achievement_progress')
      .select('*, achievement:achievements(*)')
      .eq('user_id', userId)
      .order('progress_percentage', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Award an achievement to a user
   */
  async awardAchievement(
    userId: string,
    achievementId: string,
    contextData?: Record<string, any>
  ): Promise<UserAchievement> {
    const { data, error } = await this.supabase.rpc('award_achievement', {
      p_user_id: userId,
      p_achievement_id: achievementId,
      p_context: contextData || {}
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    incrementValue: number
  ): Promise<void> {
    const { error } = await this.supabase.rpc('update_achievement_progress', {
      p_user_id: userId,
      p_achievement_id: achievementId,
      p_increment: incrementValue
    });

    if (error) throw error;
  }

  /**
   * Get user's achievement summary
   */
  async getUserAchievementSummary(userId: string): Promise<AchievementSummary> {
    const { data, error } = await this.supabase.rpc('get_user_achievement_summary', {
      p_user_id: userId
    });

    if (error) throw error;
    return data?.[0] || {
      total_achievements: 0,
      total_points: 0,
      by_tier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      by_category: {},
      recent_achievements: [],
      featured_achievements: [],
      current_streaks: []
    };
  }

  /**
   * Update or toggle featured status of an achievement
   */
  async toggleFeaturedAchievement(userAchievementId: string, isFeatured: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('user_achievements')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', userAchievementId);

    if (error) throw error;
  }

  /**
   * Update achievement visibility
   */
  async updateAchievementVisibility(userAchievementId: string, isPublic: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('user_achievements')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', userAchievementId);

    if (error) throw error;
  }

  // =====================================================
  // Streaks
  // =====================================================

  /**
   * Get user's streaks
   */
  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    const { data, error } = await this.supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Update user streak
   */
  async updateUserStreak(
    userId: string,
    streakType: string,
    activityDate?: string
  ): Promise<void> {
    const { error } = await this.supabase.rpc('update_user_streak', {
      p_user_id: userId,
      p_streak_type: streakType,
      p_activity_date: activityDate || new Date().toISOString()
    });

    if (error) throw error;
  }

  // =====================================================
  // Points
  // =====================================================

  /**
   * Get all points sources
   */
  async getPointsSources(): Promise<PointsSource[]> {
    const { data, error } = await this.supabase
      .from('points_sources')
      .select('*')
      .eq('is_active', true)
      .order('category, name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's points balance
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    const { data, error } = await this.supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Award points to a user
   */
  async awardPoints(
    userId: string,
    pointsAmount: number,
    sourceType: string,
    sourceId?: string,
    description?: string,
    contextData?: Record<string, any>
  ): Promise<PointsTransaction> {
    const { data, error } = await this.supabase.rpc('award_points', {
      p_user_id: userId,
      p_points_amount: pointsAmount,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_description: description,
      p_context_data: contextData
    });

    if (error) throw error;
    return data;
  }

  /**
   * Spend points
   */
  async spendPoints(
    userId: string,
    pointsAmount: number,
    sourceType: string,
    sourceId?: string,
    description?: string
  ): Promise<PointsTransaction> {
    const { data, error } = await this.supabase.rpc('spend_points', {
      p_user_id: userId,
      p_points_amount: pointsAmount,
      p_source_type: sourceType,
      p_source_id: sourceId,
      p_description: description
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's points transactions
   */
  async getPointsTransactions(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<PointsTransaction[]> {
    const { data, error } = await this.supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's points summary
   */
  async getUserPointsSummary(userId: string): Promise<PointsSummary> {
    const { data, error } = await this.supabase.rpc('get_user_points_summary', {
      p_user_id: userId
    });

    if (error) throw error;
    return data?.[0] || {
      current_balance: 0,
      total_earned: 0,
      total_spent: 0,
      points_this_week: 0,
      points_this_month: 0,
      current_level: 1,
      current_xp: 0,
      xp_for_next_level: 100,
      points_multiplier: 1.0,
      recent_transactions: []
    };
  }

  // =====================================================
  // Rewards
  // =====================================================

  /**
   * Get all available rewards
   */
  async getRewards(featured = false): Promise<Reward[]> {
    let query = this.supabase
      .from('rewards_catalog')
      .select('*')
      .eq('is_active', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    query = query.order('display_order');

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Redeem a reward
   */
  async redeemReward(userId: string, rewardId: string): Promise<UserReward> {
    const { data, error } = await this.supabase.rpc('redeem_reward', {
      p_user_id: userId,
      p_reward_id: rewardId
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get user's redeemed rewards
   */
  async getUserRewards(userId: string): Promise<UserReward[]> {
    const { data, error } = await this.supabase
      .from('user_rewards')
      .select('*, reward:rewards_catalog(*)')
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Leaderboards
  // =====================================================

  /**
   * Get all leaderboards
   */
  async getLeaderboards(type?: string): Promise<Leaderboard[]> {
    let query = this.supabase
      .from('leaderboards')
      .select('*')
      .eq('is_active', true);

    if (type) {
      query = query.eq('leaderboard_type', type);
    }

    query = query.order('display_order');

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboardEntries(
    leaderboardId: string,
    limit = 100,
    offset = 0
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from('leaderboard_entries')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('leaderboard_id', leaderboardId)
      .order('rank')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's leaderboard entry
   */
  async getUserLeaderboardEntry(
    leaderboardId: string,
    userId: string
  ): Promise<LeaderboardEntry | null> {
    const { data, error } = await this.supabase
      .from('leaderboard_entries')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('leaderboard_id', leaderboardId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboardEntry(
    leaderboardId: string,
    userId: string,
    score: number
  ): Promise<void> {
    const { error } = await this.supabase.rpc('update_leaderboard_entry', {
      p_leaderboard_id: leaderboardId,
      p_user_id: userId,
      p_score: score
    });

    if (error) throw error;
  }

  // =====================================================
  // Levels & XP
  // =====================================================

  /**
   * Get user's level information
   */
  async getUserLevel(userId: string): Promise<UserLevel | null> {
    const { data, error } = await this.supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Add XP to user (handles automatic level ups)
   */
  async addUserXP(userId: string, xpAmount: number): Promise<UserLevel> {
    const { data, error } = await this.supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount
    });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // Helper Methods
  // =====================================================

  /**
   * Check if user can earn points from a source (respects cooldowns and daily limits)
   */
  async canEarnPoints(
    userId: string,
    pointsSourceSlug: string
  ): Promise<{ canEarn: boolean; reason?: string }> {
    // Get the points source
    const { data: source, error: sourceError } = await this.supabase
      .from('points_sources')
      .select('*')
      .eq('slug', pointsSourceSlug)
      .eq('is_active', true)
      .single();

    if (sourceError || !source) {
      return { canEarn: false, reason: 'Points source not found or inactive' };
    }

    // Check daily limit if applicable
    if (source.max_daily_occurrences && source.max_daily_occurrences > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error: countError } = await this.supabase
        .from('points_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('source_type', 'points_source')
        .eq('source_id', source.id)
        .gte('created_at', today.toISOString());

      if (countError) throw countError;

      if (count && count >= source.max_daily_occurrences) {
        return { canEarn: false, reason: 'Daily limit reached' };
      }
    }

    // Check cooldown if applicable
    if (source.cooldown_minutes && source.cooldown_minutes > 0) {
      const cooldownDate = new Date();
      cooldownDate.setMinutes(cooldownDate.getMinutes() - source.cooldown_minutes);

      const { data: recentTransaction, error: transError } = await this.supabase
        .from('points_transactions')
        .select('created_at')
        .eq('user_id', userId)
        .eq('source_type', 'points_source')
        .eq('source_id', source.id)
        .gte('created_at', cooldownDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (transError && transError.code !== 'PGRST116') throw transError;

      if (recentTransaction) {
        return { canEarn: false, reason: 'Cooldown period not yet elapsed' };
      }
    }

    return { canEarn: true };
  }

  /**
   * Get achievement progress percentage
   */
  calculateProgressPercentage(currentValue: number, targetValue: number): number {
    if (targetValue === 0) return 100;
    return Math.min(100, Math.round((currentValue / targetValue) * 100));
  }

  /**
   * Get next level XP requirement
   */
  calculateNextLevelXP(level: number): number {
    // Base XP requirement is 100, increases by 10% per level
    return Math.floor(100 * Math.pow(1.1, level));
  }

  /**
   * Get points multiplier for level
   */
  calculatePointsMultiplier(level: number): number {
    // Base multiplier is 1.0, increases by 2% per level
    return 1.0 + level * 0.02;
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();
