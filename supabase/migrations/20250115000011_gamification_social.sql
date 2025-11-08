-- =====================================================
-- Phase 5: Gamification & Engagement - Social Learning
-- Migration: 20250115000011_gamification_social.sql
-- =====================================================

-- Extended User Profiles (social/public profile information)
CREATE TABLE user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Display Information
    display_name VARCHAR(200),
    bio TEXT,
    tagline VARCHAR(300),
    location VARCHAR(200),
    timezone VARCHAR(100),
    
    -- Social Links
    website_url TEXT,
    linkedin_url TEXT,
    twitter_handle VARCHAR(100),
    github_username VARCHAR(100),
    
    -- Profile Images
    avatar_url TEXT,
    cover_image_url TEXT,
    
    -- Professional Information
    job_title VARCHAR(200),
    company VARCHAR(200),
    industry VARCHAR(100),
    years_of_experience INTEGER,
    
    -- Learning Preferences
    learning_goals TEXT[],
    interests TEXT[],
    skill_tags TEXT[],
    preferred_learning_time VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'flexible'
    study_pace VARCHAR(50), -- 'fast', 'moderate', 'slow'
    
    -- Visibility Settings
    profile_visibility VARCHAR(50) DEFAULT 'public', -- 'public', 'connections', 'private'
    show_achievements BOOLEAN DEFAULT TRUE,
    show_progress BOOLEAN DEFAULT TRUE,
    show_activity BOOLEAN DEFAULT TRUE,
    
    -- Activity Stats (denormalized for performance)
    total_courses_completed INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    total_quiz_attempts INTEGER DEFAULT 0,
    total_study_time_minutes BIGINT DEFAULT 0,
    
    -- Social Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    helpful_answers_count INTEGER DEFAULT 0,
    
    -- Badges & Recognition
    featured_achievements UUID[],
    custom_badges JSONB,
    
    -- Metadata
    profile_completed_percentage INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Follows (social following system)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Follow Type
    follow_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'close_friend', 'muted'
    
    -- Notifications
    notify_on_activity BOOLEAN DEFAULT TRUE,
    notify_on_achievements BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Can't follow yourself
);

-- Study Buddies (matched learning partners)
CREATE TABLE study_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Match Information
    match_score INTEGER, -- 0-100 compatibility score
    match_criteria JSONB, -- What criteria matched them
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'ended'
    accepted_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Study Plan
    study_schedule JSONB, -- Agreed upon study times
    shared_goals TEXT[],
    target_courses UUID[], -- Courses they plan to study together
    
    -- Activity
    last_interaction_at TIMESTAMPTZ,
    sessions_completed INTEGER DEFAULT 0,
    
    -- Messages
    can_message BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, buddy_id),
    CHECK (user_id != buddy_id)
);

-- User Activity Feed (social activity stream)
CREATE TABLE user_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL, -- 'course_completed', 'achievement_earned', 'quiz_perfect', 'post_created', etc.
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    
    -- Related Entities
    related_type VARCHAR(100), -- 'course', 'achievement', 'quiz', 'discussion'
    related_id UUID,
    related_data JSONB,
    
    -- Media
    thumbnail_url TEXT,
    
    -- Social Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Visibility
    visibility VARCHAR(50) DEFAULT 'public', -- 'public', 'followers', 'private'
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Reactions (likes, etc.)
CREATE TABLE activity_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES user_activity_feed(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Reaction Type
    reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'celebrate', 'inspire', 'support'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(activity_id, user_id)
);

-- Activity Comments
CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES user_activity_feed(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES activity_comments(id) ON DELETE CASCADE,
    
    -- Comment Content
    comment_text TEXT NOT NULL,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Shares (tracking external shares)
CREATE TABLE social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Shared Content
    content_type VARCHAR(100) NOT NULL, -- 'course', 'achievement', 'progress', 'leaderboard'
    content_id UUID,
    content_title TEXT,
    
    -- Share Details
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'twitter', 'facebook', 'email'
    share_url TEXT,
    
    -- Tracking
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0, -- How many led to enrollments
    
    -- Points Awarded
    points_awarded INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Challenges (collaborative competitions)
CREATE TABLE group_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Challenge Details
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    
    -- Challenge Type
    challenge_type VARCHAR(100) NOT NULL, -- 'course_completion', 'points_earned', 'streak_maintenance', 'quiz_scores'
    
    -- Requirements
    goal_config JSONB NOT NULL, -- What needs to be achieved
    
    -- Time Bounds
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Participation
    min_participants INTEGER DEFAULT 2,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Rewards
    reward_config JSONB, -- Points, badges, etc.
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    requires_invitation BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'cancelled'
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES group_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Progress
    progress_value INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Rank
    rank INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'dropped'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(challenge_id, user_id)
);

-- Challenge Updates (activity feed for challenges)
CREATE TABLE challenge_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES group_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Update Details
    update_type VARCHAR(100) NOT NULL, -- 'progress', 'completed', 'milestone', 'message'
    update_text TEXT,
    update_data JSONB,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Sessions (tracked study time with buddies or alone)
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Session Details
    session_type VARCHAR(50) DEFAULT 'solo', -- 'solo', 'buddy', 'group'
    course_id UUID REFERENCES courses(id),
    lesson_id UUID REFERENCES lessons(id),
    
    -- Participants (for buddy/group sessions)
    participants UUID[],
    buddy_session_id UUID REFERENCES study_buddies(id),
    
    -- Time Tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Focus & Productivity
    focus_score INTEGER, -- 0-100, based on activity
    breaks_taken INTEGER DEFAULT 0,
    
    -- Notes
    session_notes TEXT,
    
    -- Points
    points_earned INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_user_profiles_extended_user ON user_profiles_extended(user_id);
CREATE INDEX idx_user_profiles_extended_visibility ON user_profiles_extended(profile_visibility);
CREATE INDEX idx_user_profiles_extended_interests ON user_profiles_extended USING GIN(interests);
CREATE INDEX idx_user_profiles_extended_skills ON user_profiles_extended USING GIN(skill_tags);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_user_follows_active ON user_follows(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_study_buddies_user ON study_buddies(user_id);
CREATE INDEX idx_study_buddies_buddy ON study_buddies(buddy_id);
CREATE INDEX idx_study_buddies_status ON study_buddies(status);
CREATE INDEX idx_study_buddies_courses ON study_buddies USING GIN(target_courses);

CREATE INDEX idx_activity_feed_user ON user_activity_feed(user_id);
CREATE INDEX idx_activity_feed_type ON user_activity_feed(activity_type);
CREATE INDEX idx_activity_feed_created ON user_activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_visibility ON user_activity_feed(visibility);

CREATE INDEX idx_activity_reactions_activity ON activity_reactions(activity_id);
CREATE INDEX idx_activity_reactions_user ON activity_reactions(user_id);

CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user ON activity_comments(user_id);
CREATE INDEX idx_activity_comments_parent ON activity_comments(parent_comment_id);

CREATE INDEX idx_social_shares_user ON social_shares(user_id);
CREATE INDEX idx_social_shares_content ON social_shares(content_type, content_id);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);

CREATE INDEX idx_group_challenges_status ON group_challenges(status);
CREATE INDEX idx_group_challenges_dates ON group_challenges(starts_at, ends_at);
CREATE INDEX idx_group_challenges_public ON group_challenges(is_public) WHERE is_public = TRUE;

CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_rank ON challenge_participants(challenge_id, rank);

CREATE INDEX idx_challenge_updates_challenge ON challenge_updates(challenge_id);
CREATE INDEX idx_challenge_updates_created ON challenge_updates(created_at DESC);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_dates ON study_sessions(started_at, ended_at);
CREATE INDEX idx_study_sessions_type ON study_sessions(session_type);

-- Enable RLS
ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Extended Profiles: Based on visibility settings
CREATE POLICY "Public profiles are viewable by everyone"
    ON user_profiles_extended FOR SELECT
    USING (profile_visibility = 'public');

CREATE POLICY "Users can view their own profile"
    ON user_profiles_extended FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Connection profiles viewable by followers"
    ON user_profiles_extended FOR SELECT
    USING (
        profile_visibility = 'connections' AND
        EXISTS (
            SELECT 1 FROM user_follows
            WHERE user_follows.following_id = user_profiles_extended.user_id
            AND user_follows.follower_id = auth.uid()
            AND user_follows.is_active = TRUE
        )
    );

CREATE POLICY "Users can update their own profile"
    ON user_profiles_extended FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON user_profiles_extended FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- User Follows: Users manage their own follows
CREATE POLICY "Users can view their follows"
    ON user_follows FOR SELECT
    USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can follow others"
    ON user_follows FOR INSERT
    WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
    ON user_follows FOR UPDATE
    USING (follower_id = auth.uid())
    WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their follows"
    ON user_follows FOR DELETE
    USING (follower_id = auth.uid());

-- Study Buddies: Both users can view and manage
CREATE POLICY "Users can view their study buddy relationships"
    ON study_buddies FOR SELECT
    USING (user_id = auth.uid() OR buddy_id = auth.uid());

CREATE POLICY "Users can create buddy requests"
    ON study_buddies FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update buddy status"
    ON study_buddies FOR UPDATE
    USING (user_id = auth.uid() OR buddy_id = auth.uid())
    WITH CHECK (user_id = auth.uid() OR buddy_id = auth.uid());

-- Activity Feed: Based on visibility
CREATE POLICY "Public activities viewable by everyone"
    ON user_activity_feed FOR SELECT
    USING (visibility = 'public');

CREATE POLICY "Follower activities viewable by followers"
    ON user_activity_feed FOR SELECT
    USING (
        visibility = 'followers' AND
        EXISTS (
            SELECT 1 FROM user_follows
            WHERE user_follows.following_id = user_activity_feed.user_id
            AND user_follows.follower_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own activities"
    ON user_activity_feed FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can create activities"
    ON user_activity_feed FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Activity Reactions: Users can react to visible activities
CREATE POLICY "Users can view reactions on visible activities"
    ON activity_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_activity_feed
            WHERE user_activity_feed.id = activity_reactions.activity_id
            AND (
                user_activity_feed.visibility = 'public' OR
                user_activity_feed.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can add reactions"
    ON activity_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
    ON activity_reactions FOR DELETE
    USING (user_id = auth.uid());

-- Activity Comments: Similar to reactions
CREATE POLICY "Users can view comments on visible activities"
    ON activity_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_activity_feed
            WHERE user_activity_feed.id = activity_comments.activity_id
            AND (
                user_activity_feed.visibility = 'public' OR
                user_activity_feed.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can add comments"
    ON activity_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can edit their comments"
    ON activity_comments FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Social Shares: Users view own
CREATE POLICY "Users can view their own shares"
    ON social_shares FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create shares"
    ON social_shares FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Group Challenges: Public viewable, participants can view private
CREATE POLICY "Public challenges viewable by everyone"
    ON group_challenges FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Participants can view their challenges"
    ON group_challenges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM challenge_participants
            WHERE challenge_participants.challenge_id = group_challenges.id
            AND challenge_participants.user_id = auth.uid()
        )
    );

-- Challenge Participants: View based on challenge visibility
CREATE POLICY "Users can view participants of visible challenges"
    ON challenge_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_challenges
            WHERE group_challenges.id = challenge_participants.challenge_id
            AND (
                group_challenges.is_public = TRUE OR
                group_challenges.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can join challenges"
    ON challenge_participants FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Study Sessions: Users view own
CREATE POLICY "Users can view their own sessions"
    ON study_sessions FOR SELECT
    USING (user_id = auth.uid() OR auth.uid() = ANY(participants));

CREATE POLICY "Users can create sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their sessions"
    ON study_sessions FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Functions
-- =====================================================

-- Function: Follow User
CREATE OR REPLACE FUNCTION follow_user(
    p_follower_id UUID,
    p_following_id UUID
)
RETURNS user_follows AS $$
DECLARE
    v_follow user_follows%ROWTYPE;
BEGIN
    -- Can't follow yourself
    IF p_follower_id = p_following_id THEN
        RAISE EXCEPTION 'Cannot follow yourself';
    END IF;
    
    -- Insert or update follow
    INSERT INTO user_follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id)
    ON CONFLICT (follower_id, following_id)
    DO UPDATE SET
        is_active = TRUE,
        updated_at = NOW()
    RETURNING * INTO v_follow;
    
    -- Update follower counts
    UPDATE user_profiles_extended
    SET 
        following_count = following_count + 1,
        updated_at = NOW()
    WHERE user_id = p_follower_id;
    
    UPDATE user_profiles_extended
    SET 
        followers_count = followers_count + 1,
        updated_at = NOW()
    WHERE user_id = p_following_id;
    
    RETURN v_follow;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Unfollow User
CREATE OR REPLACE FUNCTION unfollow_user(
    p_follower_id UUID,
    p_following_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Update follow to inactive
    UPDATE user_follows
    SET 
        is_active = FALSE,
        updated_at = NOW()
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    
    -- Update follower counts
    UPDATE user_profiles_extended
    SET 
        following_count = GREATEST(0, following_count - 1),
        updated_at = NOW()
    WHERE user_id = p_follower_id;
    
    UPDATE user_profiles_extended
    SET 
        followers_count = GREATEST(0, followers_count - 1),
        updated_at = NOW()
    WHERE user_id = p_following_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create Activity Post
CREATE OR REPLACE FUNCTION create_activity_post(
    p_user_id UUID,
    p_activity_type VARCHAR,
    p_activity_title TEXT,
    p_related_type VARCHAR DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_visibility VARCHAR DEFAULT 'public'
)
RETURNS user_activity_feed AS $$
DECLARE
    v_activity user_activity_feed%ROWTYPE;
BEGIN
    INSERT INTO user_activity_feed (
        user_id,
        activity_type,
        activity_title,
        related_type,
        related_id,
        visibility
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_activity_title,
        p_related_type,
        p_related_id,
        p_visibility
    ) RETURNING * INTO v_activity;
    
    -- Update profile post count
    UPDATE user_profiles_extended
    SET 
        posts_count = posts_count + 1,
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN v_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User Social Summary
CREATE OR REPLACE FUNCTION get_user_social_summary(p_user_id UUID)
RETURNS TABLE (
    followers_count INTEGER,
    following_count INTEGER,
    activity_count BIGINT,
    recent_activities JSONB,
    top_achievements JSONB,
    study_buddies JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.followers_count,
        up.following_count,
        (SELECT COUNT(*) FROM user_activity_feed WHERE user_id = p_user_id)::BIGINT,
        (SELECT jsonb_agg(activity_data ORDER BY created_at DESC)
         FROM (
             SELECT jsonb_build_object(
                 'id', uaf.id,
                 'type', uaf.activity_type,
                 'title', uaf.activity_title,
                 'likes', uaf.likes_count,
                 'created_at', uaf.created_at
             ) as activity_data,
             uaf.created_at
             FROM user_activity_feed uaf
             WHERE uaf.user_id = p_user_id
             ORDER BY uaf.created_at DESC
             LIMIT 10
         ) activities),
        (SELECT jsonb_agg(achievement_data)
         FROM (
             SELECT jsonb_build_object(
                 'id', a.id,
                 'name', a.name,
                 'tier', a.tier,
                 'earned_at', ua.earned_at
             ) as achievement_data
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = p_user_id AND ua.is_featured = TRUE
             LIMIT 5
         ) achievements),
        (SELECT jsonb_agg(buddy_data)
         FROM (
             SELECT jsonb_build_object(
                 'buddy_id', sb.buddy_id,
                 'status', sb.status,
                 'match_score', sb.match_score,
                 'sessions_completed', sb.sessions_completed
             ) as buddy_data
             FROM study_buddies sb
             WHERE sb.user_id = p_user_id AND sb.status = 'accepted'
         ) buddies)
    FROM user_profiles_extended up
    WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE user_profiles_extended IS 'Extended social and public profile information for users';
COMMENT ON TABLE user_follows IS 'Social following relationships between users';
COMMENT ON TABLE study_buddies IS 'Matched learning partners for collaborative study';
COMMENT ON TABLE user_activity_feed IS 'Social activity stream for user achievements and milestones';
COMMENT ON TABLE activity_reactions IS 'Reactions (likes, etc.) on activity posts';
COMMENT ON TABLE activity_comments IS 'Comments on activity feed posts';
COMMENT ON TABLE social_shares IS 'Tracking of content shared to external platforms';
COMMENT ON TABLE group_challenges IS 'Collaborative challenges for groups of users';
COMMENT ON TABLE challenge_participants IS 'Participants in group challenges with progress tracking';
COMMENT ON TABLE study_sessions IS 'Tracked study sessions for analytics and gamification';
COMMENT ON FUNCTION follow_user IS 'Establishes a follow relationship between users';
COMMENT ON FUNCTION unfollow_user IS 'Removes a follow relationship';
COMMENT ON FUNCTION create_activity_post IS 'Creates a new post in user activity feed';
COMMENT ON FUNCTION get_user_social_summary IS 'Returns comprehensive social stats and data for a user';
