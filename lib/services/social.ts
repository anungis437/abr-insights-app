/**
 * Social Learning Service
 * Handles follows, study buddies, activity feeds, and social features
 */

import { createBrowserClient } from '@supabase/ssr';

// =====================================================
// Type Definitions
// =====================================================

export interface UserProfileExtended {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  tagline?: string;
  location?: string;
  timezone?: string;
  website_url?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  github_username?: string;
  avatar_url?: string;
  cover_image_url?: string;
  job_title?: string;
  company?: string;
  industry?: string;
  years_of_experience?: number;
  learning_goals?: string[];
  interests?: string[];
  skill_tags?: string[];
  preferred_learning_time?: string;
  study_pace?: string;
  profile_visibility: string;
  show_achievements: boolean;
  show_progress: boolean;
  show_activity: boolean;
  total_courses_completed: number;
  total_lessons_completed: number;
  total_quiz_attempts: number;
  total_study_time_minutes: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  helpful_answers_count: number;
  featured_achievements?: string[];
  custom_badges?: Record<string, any>;
  profile_completed_percentage: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  follow_type: string;
  notify_on_activity: boolean;
  notify_on_achievements: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  follower?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  following?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface StudyBuddy {
  id: string;
  user_id: string;
  buddy_id: string;
  match_score?: number;
  match_criteria?: Record<string, any>;
  matched_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'ended';
  accepted_at?: string;
  ended_at?: string;
  study_schedule?: Record<string, any>;
  shared_goals?: string[];
  target_courses?: string[];
  last_interaction_at?: string;
  sessions_completed: number;
  can_message: boolean;
  created_at: string;
  updated_at: string;
  buddy?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: string;
  activity_title: string;
  activity_description?: string;
  related_type?: string;
  related_id?: string;
  related_data?: Record<string, any>;
  thumbnail_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  is_pinned: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ActivityReaction {
  id: string;
  activity_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  parent_comment_id?: string;
  comment_text: string;
  likes_count: number;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  replies?: ActivityComment[];
}

export interface SocialShare {
  id: string;
  user_id: string;
  content_type: string;
  content_id?: string;
  content_title?: string;
  platform: string;
  share_url?: string;
  clicks_count: number;
  conversions_count: number;
  points_awarded: number;
  created_at: string;
}

export interface GroupChallenge {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  challenge_type: string;
  goal_config: Record<string, any>;
  starts_at: string;
  ends_at: string;
  min_participants: number;
  max_participants?: number;
  current_participants: number;
  reward_config?: Record<string, any>;
  is_public: boolean;
  requires_invitation: boolean;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress_value: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  rank?: number;
  status: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface StudySession {
  id: string;
  user_id: string;
  session_type: string;
  course_id?: string;
  lesson_id?: string;
  participants?: string[];
  buddy_session_id?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  focus_score?: number;
  breaks_taken: number;
  session_notes?: string;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface SocialSummary {
  followers_count: number;
  following_count: number;
  activity_count: number;
  recent_activities: ActivityFeedItem[];
  top_achievements: any[];
  study_buddies: StudyBuddy[];
}

// =====================================================
// Social Learning Service Class
// =====================================================

export class SocialService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // =====================================================
  // User Profiles
  // =====================================================

  /**
   * Get extended profile for a user
   */
  async getUserProfile(userId: string): Promise<UserProfileExtended | null> {
    const { data, error } = await this.supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create or update extended profile
   */
  async upsertUserProfile(profile: Partial<UserProfileExtended>): Promise<UserProfileExtended> {
    const { data, error } = await this.supabase
      .from('user_profiles_extended')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search users by interests, skills, or goals
   */
  async searchUsers(
    query: string,
    filters?: {
      interests?: string[];
      skills?: string[];
      learningPace?: string;
      visibility?: string;
    }
  ): Promise<UserProfileExtended[]> {
    let dbQuery = this.supabase
      .from('user_profiles_extended')
      .select('*');

    if (filters?.visibility) {
      dbQuery = dbQuery.eq('profile_visibility', filters.visibility);
    } else {
      dbQuery = dbQuery.eq('profile_visibility', 'public');
    }

    // Text search
    if (query) {
      dbQuery = dbQuery.or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,tagline.ilike.%${query}%`);
    }

    // Filter by interests
    if (filters?.interests && filters.interests.length > 0) {
      dbQuery = dbQuery.overlaps('interests', filters.interests);
    }

    // Filter by skills
    if (filters?.skills && filters.skills.length > 0) {
      dbQuery = dbQuery.overlaps('skill_tags', filters.skills);
    }

    // Filter by learning pace
    if (filters?.learningPace) {
      dbQuery = dbQuery.eq('study_pace', filters.learningPace);
    }

    dbQuery = dbQuery.limit(50);

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Follows
  // =====================================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<UserFollow> {
    const { data, error } = await this.supabase.rpc('follow_user', {
      p_follower_id: followerId,
      p_following_id: followingId
    });

    if (error) throw error;
    return data;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await this.supabase.rpc('unfollow_user', {
      p_follower_id: followerId,
      p_following_id: followingId
    });

    if (error) throw error;
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit = 50, offset = 0): Promise<UserFollow[]> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select(`
        *,
        follower:profiles!user_follows_follower_id_fkey(id, full_name, avatar_url)
      `)
      .eq('following_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, limit = 50, offset = 0): Promise<UserFollow[]> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select(`
        *,
        following:profiles!user_follows_following_id_fkey(id, full_name, avatar_url)
      `)
      .eq('follower_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // =====================================================
  // Study Buddies
  // =====================================================

  /**
   * Find potential study buddy matches
   */
  async findStudyBuddyMatches(
    userId: string,
    preferences?: {
      targetCourses?: string[];
      learningPace?: string;
      preferredTime?: string;
      minMatchScore?: number;
    }
  ): Promise<UserProfileExtended[]> {
    // Get user's profile
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) return [];

    let query = this.supabase
      .from('user_profiles_extended')
      .select('*')
      .neq('user_id', userId)
      .eq('profile_visibility', 'public');

    // Match learning pace
    if (preferences?.learningPace || userProfile.study_pace) {
      query = query.eq('study_pace', preferences?.learningPace || userProfile.study_pace);
    }

    // Match preferred learning time
    if (preferences?.preferredTime || userProfile.preferred_learning_time) {
      query = query.eq('preferred_learning_time', preferences?.preferredTime || userProfile.preferred_learning_time);
    }

    // Match interests
    if (userProfile.interests && userProfile.interests.length > 0) {
      query = query.overlaps('interests', userProfile.interests);
    }

    query = query.limit(20);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Send study buddy request
   */
  async sendStudyBuddyRequest(
    userId: string,
    buddyId: string,
    sharedGoals?: string[],
    targetCourses?: string[]
  ): Promise<StudyBuddy> {
    const { data, error } = await this.supabase
      .from('study_buddies')
      .insert({
        user_id: userId,
        buddy_id: buddyId,
        shared_goals: sharedGoals,
        target_courses: targetCourses,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Accept study buddy request
   */
  async acceptStudyBuddyRequest(requestId: string): Promise<StudyBuddy> {
    const { data, error } = await this.supabase
      .from('study_buddies')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Decline study buddy request
   */
  async declineStudyBuddyRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase
      .from('study_buddies')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  /**
   * Get user's study buddies
   */
  async getStudyBuddies(userId: string, status = 'accepted'): Promise<StudyBuddy[]> {
    const { data, error } = await this.supabase
      .from('study_buddies')
      .select(`
        *,
        buddy:profiles!study_buddies_buddy_id_fkey(id, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('accepted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending study buddy requests
   */
  async getPendingStudyBuddyRequests(userId: string): Promise<StudyBuddy[]> {
    const { data, error } = await this.supabase
      .from('study_buddies')
      .select(`
        *,
        buddy:profiles!study_buddies_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('buddy_id', userId)
      .eq('status', 'pending')
      .order('matched_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Activity Feed
  // =====================================================

  /**
   * Create activity post
   */
  async createActivityPost(
    userId: string,
    activityType: string,
    activityTitle: string,
    relatedType?: string,
    relatedId?: string,
    visibility = 'public'
  ): Promise<ActivityFeedItem> {
    const { data, error } = await this.supabase.rpc('create_activity_post', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_activity_title: activityTitle,
      p_related_type: relatedType,
      p_related_id: relatedId,
      p_visibility: visibility
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get activity feed (for user's home feed - includes followed users)
   */
  async getActivityFeed(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ActivityFeedItem[]> {
    // Get activities from followed users
    const { data, error } = await this.supabase
      .from('user_activity_feed')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .or(`visibility.eq.public,user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's own activity
   */
  async getUserActivity(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ActivityFeedItem[]> {
    const { data, error } = await this.supabase
      .from('user_activity_feed')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Add reaction to activity
   */
  async addReaction(
    activityId: string,
    userId: string,
    reactionType = 'like'
  ): Promise<ActivityReaction> {
    const { data, error } = await this.supabase
      .from('activity_reactions')
      .insert({
        activity_id: activityId,
        user_id: userId,
        reaction_type: reactionType
      })
      .select()
      .single();

    if (error) throw error;

    // Update reaction count
    await this.supabase.rpc('increment', {
      table_name: 'user_activity_feed',
      row_id: activityId,
      column_name: 'likes_count'
    });

    return data;
  }

  /**
   * Remove reaction from activity
   */
  async removeReaction(activityId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('activity_reactions')
      .delete()
      .eq('activity_id', activityId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update reaction count (decrement, but don't go below 0)
    const { data: activity } = await this.supabase
      .from('user_activity_feed')
      .select('likes_count')
      .eq('id', activityId)
      .single();
    
    if (activity) {
      await this.supabase
        .from('user_activity_feed')
        .update({
          likes_count: Math.max(0, (activity.likes_count || 0) - 1)
        })
        .eq('id', activityId);
    }
  }

  /**
   * Add comment to activity
   */
  async addComment(
    activityId: string,
    userId: string,
    commentText: string,
    parentCommentId?: string
  ): Promise<ActivityComment> {
    const { data, error } = await this.supabase
      .from('activity_comments')
      .insert({
        activity_id: activityId,
        user_id: userId,
        comment_text: commentText,
        parent_comment_id: parentCommentId
      })
      .select()
      .single();

    if (error) throw error;

    // Update comment count (increment)
    const { data: activity } = await this.supabase
      .from('user_activity_feed')
      .select('comments_count')
      .eq('id', activityId)
      .single();
    
    if (activity) {
      await this.supabase
        .from('user_activity_feed')
        .update({
          comments_count: (activity.comments_count || 0) + 1
        })
        .eq('id', activityId);
    }

    return data;
  }

  /**
   * Get comments for activity
   */
  async getActivityComments(activityId: string): Promise<ActivityComment[]> {
    const { data, error } = await this.supabase
      .from('activity_comments')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('activity_id', activityId)
      .is('parent_comment_id', null)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await this.supabase
          .from('activity_comments')
          .select(`
            *,
            user:profiles(id, full_name, avatar_url)
          `)
          .eq('parent_comment_id', comment.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        return { ...comment, replies: replies || [] };
      })
    );

    return commentsWithReplies;
  }

  // =====================================================
  // Social Shares
  // =====================================================

  /**
   * Track social share
   */
  async trackSocialShare(
    userId: string,
    contentType: string,
    contentId: string,
    platform: string,
    contentTitle?: string
  ): Promise<SocialShare> {
    const { data, error } = await this.supabase
      .from('social_shares')
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        content_title: contentTitle,
        platform: platform
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's social shares
   */
  async getUserShares(userId: string): Promise<SocialShare[]> {
    const { data, error } = await this.supabase
      .from('social_shares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Group Challenges
  // =====================================================

  /**
   * Get active group challenges
   */
  async getGroupChallenges(status = 'active'): Promise<GroupChallenge[]> {
    const { data, error } = await this.supabase
      .from('group_challenges')
      .select('*')
      .eq('is_public', true)
      .eq('status', status)
      .order('starts_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    const { data, error } = await this.supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Update participant count (increment)
    const { data: challenge } = await this.supabase
      .from('group_challenges')
      .select('current_participants')
      .eq('id', challengeId)
      .single();
    
    if (challenge) {
      await this.supabase
        .from('group_challenges')
        .update({
          current_participants: (challenge.current_participants || 0) + 1
        })
        .eq('id', challengeId);
    }

    return data;
  }

  /**
   * Get challenge participants
   */
  async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    const { data, error } = await this.supabase
      .from('challenge_participants')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('challenge_id', challengeId)
      .order('rank');

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Study Sessions
  // =====================================================

  /**
   * Start a study session
   */
  async startStudySession(
    userId: string,
    sessionType: string,
    courseId?: string,
    lessonId?: string,
    participants?: string[]
  ): Promise<StudySession> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        course_id: courseId,
        lesson_id: lessonId,
        participants: participants,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * End a study session
   */
  async endStudySession(
    sessionId: string,
    focusScore?: number,
    sessionNotes?: string
  ): Promise<StudySession> {
    const endTime = new Date();
    
    // Get session to calculate duration
    const { data: session } = await this.supabase
      .from('study_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    let durationMinutes = 0;
    if (session) {
      const startTime = new Date(session.started_at);
      durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
    }

    const { data, error } = await this.supabase
      .from('study_sessions')
      .update({
        ended_at: endTime.toISOString(),
        duration_minutes: durationMinutes,
        focus_score: focusScore,
        session_notes: sessionNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's study sessions
   */
  async getUserStudySessions(userId: string, limit = 50): Promise<StudySession[]> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // Social Summary
  // =====================================================

  /**
   * Get user's social summary
   */
  async getUserSocialSummary(userId: string): Promise<SocialSummary> {
    const { data, error } = await this.supabase.rpc('get_user_social_summary', {
      p_user_id: userId
    });

    if (error) throw error;
    return data?.[0] || {
      followers_count: 0,
      following_count: 0,
      activity_count: 0,
      recent_activities: [],
      top_achievements: [],
      study_buddies: []
    };
  }
}

// Export singleton instance
export const socialService = new SocialService();
