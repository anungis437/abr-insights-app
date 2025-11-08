-- =====================================================
-- Phase 5: Gamification & Engagement - Achievements & Badges
-- Migration: 20250115000009_gamification_achievements.sql
-- =====================================================

-- Achievement Categories
CREATE TABLE achievement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100), -- Icon name/identifier
    color VARCHAR(50), -- Hex color for category
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES achievement_categories(id) ON DELETE SET NULL,
    
    -- Basic Info
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    
    -- Tier/Level (bronze, silver, gold, platinum)
    tier VARCHAR(50) DEFAULT 'bronze',
    tier_level INTEGER DEFAULT 1, -- For ordering within tier
    
    -- Requirements
    requirement_type VARCHAR(100) NOT NULL, -- 'course_completion', 'quiz_score', 'login_streak', etc.
    requirement_config JSONB NOT NULL, -- Flexible config for different requirement types
    -- Example configs:
    -- Course completion: {"courses_count": 5, "difficulty": "intermediate"}
    -- Quiz score: {"average_score": 90, "quiz_count": 10}
    -- Login streak: {"days": 7}
    -- Discussion: {"helpful_answers": 25}
    
    -- Points & Rewards
    points_awarded INTEGER DEFAULT 0,
    unlocks_content BOOLEAN DEFAULT FALSE,
    unlocked_content_ids JSONB, -- Array of course/resource IDs unlocked
    
    -- Badge/Visual
    badge_image_url TEXT,
    badge_svg TEXT, -- Inline SVG for badge
    badge_color VARCHAR(50),
    
    -- Open Badges Standard (IMS Global)
    open_badge_enabled BOOLEAN DEFAULT FALSE,
    open_badge_issuer JSONB, -- Issuer information
    open_badge_criteria TEXT, -- Human-readable criteria
    open_badge_tags TEXT[], -- Array of tags
    
    -- Visibility & Availability
    is_hidden BOOLEAN DEFAULT FALSE, -- Hidden until earned
    is_active BOOLEAN DEFAULT TRUE,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    
    -- Statistics
    times_awarded INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- User Achievements (tracking who earned what)
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Earning Details
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress_percentage INTEGER DEFAULT 100, -- For tracking partial progress
    
    -- Context
    context_type VARCHAR(100), -- 'course', 'quiz', 'discussion', etc.
    context_id UUID, -- Reference to related entity
    context_data JSONB, -- Additional context information
    
    -- Display
    is_featured BOOLEAN DEFAULT FALSE, -- User can feature on profile
    display_order INTEGER,
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    
    -- Sharing
    is_public BOOLEAN DEFAULT TRUE,
    shared_to_social BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id) -- Can only earn each achievement once
);

-- Achievement Progress (for achievements requiring multiple steps)
CREATE TABLE achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    current_value INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL,
    progress_percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN target_value > 0 THEN LEAST(100, (current_value * 100 / target_value))
            ELSE 0 
        END
    ) STORED,
    
    -- Progress Data
    progress_data JSONB, -- Detailed progress information
    last_increment_at TIMESTAMPTZ,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- User Streaks (for tracking consecutive activities)
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Streak Type
    streak_type VARCHAR(100) NOT NULL, -- 'daily_login', 'course_completion', 'quiz_attempts'
    
    -- Streak Data
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Streak Maintenance
    streak_active BOOLEAN DEFAULT TRUE,
    freeze_days_available INTEGER DEFAULT 0, -- Days user can miss without breaking streak
    freeze_days_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, streak_type)
);

-- Indexes for Performance
CREATE INDEX idx_achievements_category ON achievements(category_id);
CREATE INDEX idx_achievements_tier ON achievements(tier, tier_level);
CREATE INDEX idx_achievements_type ON achievements(requirement_type);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);
CREATE INDEX idx_user_achievements_featured ON user_achievements(user_id) WHERE is_featured = TRUE;
CREATE INDEX idx_user_achievements_public ON user_achievements(is_public) WHERE is_public = TRUE;

CREATE INDEX idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_incomplete ON achievement_progress(user_id) WHERE is_completed = FALSE;

CREATE INDEX idx_user_streaks_user_type ON user_streaks(user_id, streak_type);
CREATE INDEX idx_user_streaks_active ON user_streaks(user_id) WHERE streak_active = TRUE;

-- Enable RLS
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Achievement Categories: Public read
CREATE POLICY "Achievement categories are viewable by everyone"
    ON achievement_categories FOR SELECT
    USING (is_active = TRUE);

-- Achievements: Public read for active
CREATE POLICY "Active achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (is_active = TRUE AND (NOT is_hidden OR id IN (
        SELECT achievement_id FROM user_achievements WHERE user_id = auth.uid()
    )));

CREATE POLICY "Admins can manage achievements"
    ON achievements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- User Achievements: Users can view their own and public achievements
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Public achievements are viewable by everyone"
    ON user_achievements FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "System can insert user achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own achievement display settings"
    ON user_achievements FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Achievement Progress: Users can view their own progress
CREATE POLICY "Users can view their own progress"
    ON achievement_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage progress"
    ON achievement_progress FOR ALL
    USING (user_id = auth.uid());

-- User Streaks: Users can view their own streaks
CREATE POLICY "Users can view their own streaks"
    ON user_streaks FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage streaks"
    ON user_streaks FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- Functions
-- =====================================================

-- Function: Award Achievement to User
CREATE OR REPLACE FUNCTION award_achievement(
    p_user_id UUID,
    p_achievement_id UUID,
    p_context_type VARCHAR DEFAULT NULL,
    p_context_id UUID DEFAULT NULL,
    p_context_data JSONB DEFAULT NULL
)
RETURNS user_achievements AS $$
DECLARE
    v_achievement achievements%ROWTYPE;
    v_user_achievement user_achievements%ROWTYPE;
    v_already_earned BOOLEAN;
BEGIN
    -- Get achievement details
    SELECT * INTO v_achievement
    FROM achievements
    WHERE id = p_achievement_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Achievement not found or not active';
    END IF;
    
    -- Check if already earned
    SELECT EXISTS(
        SELECT 1 FROM user_achievements
        WHERE user_id = p_user_id AND achievement_id = p_achievement_id
    ) INTO v_already_earned;
    
    IF v_already_earned THEN
        RAISE EXCEPTION 'Achievement already earned by this user';
    END IF;
    
    -- Insert user achievement
    INSERT INTO user_achievements (
        user_id,
        achievement_id,
        context_type,
        context_id,
        context_data,
        progress_percentage
    ) VALUES (
        p_user_id,
        p_achievement_id,
        p_context_type,
        p_context_id,
        p_context_data,
        100
    ) RETURNING * INTO v_user_achievement;
    
    -- Update achievement statistics
    UPDATE achievements
    SET times_awarded = times_awarded + 1
    WHERE id = p_achievement_id;
    
    -- Award points to user (assuming user_points table exists)
    IF v_achievement.points_awarded > 0 THEN
        -- This will be handled by the points system integration
        PERFORM award_points(p_user_id, v_achievement.points_awarded, 'achievement', p_achievement_id);
    END IF;
    
    -- Mark progress as completed
    UPDATE achievement_progress
    SET 
        is_completed = TRUE,
        completed_at = NOW(),
        current_value = target_value,
        updated_at = NOW()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
    
    RETURN v_user_achievement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Achievement Progress
CREATE OR REPLACE FUNCTION update_achievement_progress(
    p_user_id UUID,
    p_achievement_id UUID,
    p_increment INTEGER DEFAULT 1
)
RETURNS achievement_progress AS $$
DECLARE
    v_progress achievement_progress%ROWTYPE;
    v_achievement achievements%ROWTYPE;
BEGIN
    -- Get achievement details
    SELECT * INTO v_achievement
    FROM achievements
    WHERE id = p_achievement_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Achievement not found or not active';
    END IF;
    
    -- Get or create progress record
    INSERT INTO achievement_progress (user_id, achievement_id, current_value, target_value)
    VALUES (
        p_user_id,
        p_achievement_id,
        0,
        (v_achievement.requirement_config->>'target_value')::INTEGER
    )
    ON CONFLICT (user_id, achievement_id)
    DO NOTHING;
    
    -- Update progress
    UPDATE achievement_progress
    SET 
        current_value = LEAST(current_value + p_increment, target_value),
        last_increment_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
    RETURNING * INTO v_progress;
    
    -- Check if achievement is now complete
    IF v_progress.current_value >= v_progress.target_value AND NOT v_progress.is_completed THEN
        PERFORM award_achievement(p_user_id, p_achievement_id);
    END IF;
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update User Streak
CREATE OR REPLACE FUNCTION update_user_streak(
    p_user_id UUID,
    p_streak_type VARCHAR,
    p_activity_date DATE DEFAULT CURRENT_DATE
)
RETURNS user_streaks AS $$
DECLARE
    v_streak user_streaks%ROWTYPE;
    v_days_since_last INTEGER;
BEGIN
    -- Get or create streak record
    INSERT INTO user_streaks (user_id, streak_type, current_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 0, p_activity_date)
    ON CONFLICT (user_id, streak_type)
    DO NOTHING;
    
    -- Get current streak
    SELECT * INTO v_streak
    FROM user_streaks
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
    
    -- Calculate days since last activity
    v_days_since_last := p_activity_date - v_streak.last_activity_date;
    
    -- Update streak based on days elapsed
    IF v_days_since_last = 0 THEN
        -- Same day, no change
        RETURN v_streak;
    ELSIF v_days_since_last = 1 THEN
        -- Consecutive day, increment streak
        UPDATE user_streaks
        SET 
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = p_activity_date,
            streak_active = TRUE,
            updated_at = NOW()
        WHERE user_id = p_user_id AND streak_type = p_streak_type
        RETURNING * INTO v_streak;
        
        -- Check for streak achievements
        PERFORM check_streak_achievements(p_user_id, p_streak_type, v_streak.current_streak);
    ELSIF v_days_since_last > 1 AND v_streak.freeze_days_available > v_streak.freeze_days_used THEN
        -- Use freeze day
        UPDATE user_streaks
        SET 
            freeze_days_used = freeze_days_used + (v_days_since_last - 1),
            last_activity_date = p_activity_date,
            streak_active = TRUE,
            updated_at = NOW()
        WHERE user_id = p_user_id AND streak_type = p_streak_type
        RETURNING * INTO v_streak;
    ELSE
        -- Streak broken, reset
        UPDATE user_streaks
        SET 
            current_streak = 1,
            last_activity_date = p_activity_date,
            streak_active = TRUE,
            freeze_days_used = 0,
            updated_at = NOW()
        WHERE user_id = p_user_id AND streak_type = p_streak_type
        RETURNING * INTO v_streak;
    END IF;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check for Streak Achievements
CREATE OR REPLACE FUNCTION check_streak_achievements(
    p_user_id UUID,
    p_streak_type VARCHAR,
    p_current_streak INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_achievement RECORD;
BEGIN
    -- Find streak achievements that should be awarded
    FOR v_achievement IN
        SELECT a.id, a.requirement_config
        FROM achievements a
        WHERE a.is_active = TRUE
        AND a.requirement_type = 'streak'
        AND (a.requirement_config->>'streak_type')::VARCHAR = p_streak_type
        AND (a.requirement_config->>'days')::INTEGER <= p_current_streak
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        -- Award the achievement
        PERFORM award_achievement(
            p_user_id,
            v_achievement.id,
            'streak',
            NULL,
            jsonb_build_object('streak_type', p_streak_type, 'days', p_current_streak)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User Achievement Summary
CREATE OR REPLACE FUNCTION get_user_achievement_summary(p_user_id UUID)
RETURNS TABLE (
    total_achievements BIGINT,
    total_points BIGINT,
    achievements_by_tier JSONB,
    achievements_by_category JSONB,
    recent_achievements JSONB,
    featured_achievements JSONB,
    current_streaks JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Total achievements
        (SELECT COUNT(*) FROM user_achievements WHERE user_id = p_user_id)::BIGINT,
        
        -- Total points from achievements
        (SELECT COALESCE(SUM(a.points_awarded), 0)
         FROM user_achievements ua
         JOIN achievements a ON ua.achievement_id = a.id
         WHERE ua.user_id = p_user_id)::BIGINT,
        
        -- Achievements by tier
        (SELECT jsonb_object_agg(a.tier, count)
         FROM (
             SELECT a.tier, COUNT(*)::INTEGER as count
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = p_user_id
             GROUP BY a.tier
         ) a),
        
        -- Achievements by category
        (SELECT jsonb_object_agg(ac.name, count)
         FROM (
             SELECT ac.name, COUNT(*)::INTEGER as count
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             JOIN achievement_categories ac ON a.category_id = ac.id
             WHERE ua.user_id = p_user_id
             GROUP BY ac.name
         ) ac),
        
        -- Recent achievements (last 5)
        (SELECT jsonb_agg(achievement_data ORDER BY earned_at DESC)
         FROM (
             SELECT jsonb_build_object(
                 'id', a.id,
                 'name', a.name,
                 'tier', a.tier,
                 'badge_image_url', a.badge_image_url,
                 'earned_at', ua.earned_at
             ) as achievement_data,
             ua.earned_at
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = p_user_id
             ORDER BY ua.earned_at DESC
             LIMIT 5
         ) recent),
        
        -- Featured achievements
        (SELECT jsonb_agg(achievement_data ORDER BY display_order)
         FROM (
             SELECT jsonb_build_object(
                 'id', a.id,
                 'name', a.name,
                 'tier', a.tier,
                 'badge_image_url', a.badge_image_url,
                 'earned_at', ua.earned_at
             ) as achievement_data,
             ua.display_order
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = p_user_id AND ua.is_featured = TRUE
             ORDER BY ua.display_order
         ) featured),
        
        -- Current active streaks
        (SELECT jsonb_object_agg(streak_type, streak_data)
         FROM (
             SELECT 
                 streak_type,
                 jsonb_build_object(
                     'current_streak', current_streak,
                     'longest_streak', longest_streak,
                     'last_activity_date', last_activity_date
                 ) as streak_data
             FROM user_streaks
             WHERE user_id = p_user_id AND streak_active = TRUE
         ) streaks);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data: Achievement Categories
-- =====================================================

INSERT INTO achievement_categories (name, slug, description, icon, color, sort_order) VALUES
    ('Course Completion', 'course-completion', 'Achievements for completing courses', 'graduation-cap', '#3B82F6', 1),
    ('Skill Mastery', 'skill-mastery', 'Achievements for mastering skills', 'award', '#8B5CF6', 2),
    ('Engagement', 'engagement', 'Achievements for community engagement', 'users', '#10B981', 3),
    ('Streaks', 'streaks', 'Achievements for maintaining learning streaks', 'flame', '#EF4444', 4),
    ('Collaboration', 'collaboration', 'Achievements for helping others', 'handshake', '#F59E0B', 5),
    ('Excellence', 'excellence', 'Achievements for outstanding performance', 'star', '#EC4899', 6);

-- =====================================================
-- Seed Data: Sample Achievements
-- =====================================================

-- Course Completion Achievements
INSERT INTO achievements (category_id, name, slug, description, tier, tier_level, requirement_type, requirement_config, points_awarded, badge_color) VALUES
    ((SELECT id FROM achievement_categories WHERE slug = 'course-completion'),
     'Getting Started', 'first-course', 'Complete your first course', 'bronze', 1, 'course_completion',
     '{"courses_count": 1}'::jsonb, 100, '#CD7F32'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'course-completion'),
     'Dedicated Learner', 'five-courses', 'Complete 5 courses', 'bronze', 2, 'course_completion',
     '{"courses_count": 5}'::jsonb, 500, '#CD7F32'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'course-completion'),
     'Knowledge Seeker', 'ten-courses', 'Complete 10 courses', 'silver', 1, 'course_completion',
     '{"courses_count": 10}'::jsonb, 1000, '#C0C0C0'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'course-completion'),
     'Learning Champion', 'twenty-courses', 'Complete 20 courses', 'gold', 1, 'course_completion',
     '{"courses_count": 20}'::jsonb, 2000, '#FFD700'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'course-completion'),
     'Master Scholar', 'fifty-courses', 'Complete 50 courses', 'platinum', 1, 'course_completion',
     '{"courses_count": 50}'::jsonb, 5000, '#E5E4E2');

-- Streak Achievements
INSERT INTO achievements (category_id, name, slug, description, tier, tier_level, requirement_type, requirement_config, points_awarded, badge_color) VALUES
    ((SELECT id FROM achievement_categories WHERE slug = 'streaks'),
     'Week Warrior', 'seven-day-streak', 'Maintain a 7-day learning streak', 'bronze', 1, 'streak',
     '{"streak_type": "daily_login", "days": 7}'::jsonb, 250, '#CD7F32'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'streaks'),
     'Month Master', 'thirty-day-streak', 'Maintain a 30-day learning streak', 'silver', 1, 'streak',
     '{"streak_type": "daily_login", "days": 30}'::jsonb, 1000, '#C0C0C0'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'streaks'),
     'Hundred Days Hero', 'hundred-day-streak', 'Maintain a 100-day learning streak', 'gold', 1, 'streak',
     '{"streak_type": "daily_login", "days": 100}'::jsonb, 5000, '#FFD700'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'streaks'),
     'Year-Round Learner', 'year-streak', 'Maintain a 365-day learning streak', 'platinum', 1, 'streak',
     '{"streak_type": "daily_login", "days": 365}'::jsonb, 20000, '#E5E4E2');

-- Quiz Performance Achievements
INSERT INTO achievements (category_id, name, slug, description, tier, tier_level, requirement_type, requirement_config, points_awarded, badge_color) VALUES
    ((SELECT id FROM achievement_categories WHERE slug = 'skill-mastery'),
     'Quiz Ace', 'quiz-ace', 'Score 100% on any quiz', 'bronze', 1, 'quiz_score',
     '{"min_score": 100, "count": 1}'::jsonb, 150, '#CD7F32'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'skill-mastery'),
     'Perfect Streak', 'five-perfect-quizzes', 'Score 100% on 5 quizzes', 'silver', 1, 'quiz_score',
     '{"min_score": 100, "count": 5}'::jsonb, 750, '#C0C0C0'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'skill-mastery'),
     'Quiz Master', 'quiz-master', 'Maintain 90%+ average across 10 quizzes', 'gold', 1, 'quiz_score',
     '{"min_average": 90, "count": 10}'::jsonb, 2000, '#FFD700');

-- Engagement Achievements
INSERT INTO achievements (category_id, name, slug, description, tier, tier_level, requirement_type, requirement_config, points_awarded, badge_color) VALUES
    ((SELECT id FROM achievement_categories WHERE slug = 'engagement'),
     'Discussion Starter', 'first-discussion', 'Post your first discussion topic', 'bronze', 1, 'discussion_participation',
     '{"posts_count": 1}'::jsonb, 50, '#CD7F32'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'engagement'),
     'Active Contributor', 'active-contributor', 'Post 25 helpful comments', 'silver', 1, 'discussion_participation',
     '{"helpful_comments": 25}'::jsonb, 500, '#C0C0C0'),
    
    ((SELECT id FROM achievement_categories WHERE slug = 'collaboration'),
     'Helpful Peer', 'helpful-peer', 'Receive 10 helpful votes on your answers', 'silver', 1, 'peer_helping',
     '{"helpful_votes": 10}'::jsonb, 750, '#C0C0C0');

-- Comments
COMMENT ON TABLE achievement_categories IS 'Categories for organizing achievements (Course Completion, Skill Mastery, etc.)';
COMMENT ON TABLE achievements IS 'Definitions of all available achievements with requirements and rewards';
COMMENT ON TABLE user_achievements IS 'Record of achievements earned by users';
COMMENT ON TABLE achievement_progress IS 'Tracks user progress toward multi-step achievements';
COMMENT ON TABLE user_streaks IS 'Tracks user activity streaks (daily login, course completion, etc.)';
COMMENT ON FUNCTION award_achievement IS 'Awards an achievement to a user and grants associated points';
COMMENT ON FUNCTION update_achievement_progress IS 'Updates progress toward an achievement and awards it when complete';
COMMENT ON FUNCTION update_user_streak IS 'Updates a user''s activity streak and checks for streak achievements';
COMMENT ON FUNCTION get_user_achievement_summary IS 'Returns comprehensive achievement summary for a user';
