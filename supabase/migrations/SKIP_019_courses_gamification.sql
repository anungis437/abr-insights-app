-- =====================================================
-- Migration 019: Courses Gamification & Engagement
-- Phase 5: Achievement System, Points, Social Learning
-- =====================================================

-- Course-specific achievement categories
CREATE TABLE IF NOT EXISTS course_achievement_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🏆',
    color TEXT DEFAULT '#FFD700',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course achievements
CREATE TABLE IF NOT EXISTS course_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES course_achievement_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT '🎖️',
    tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
    requirement_type TEXT NOT NULL, -- 'course_completion', 'skill_mastery', 'streak', 'engagement', 'speed', 'perfection'
    requirement_config JSONB DEFAULT '{}', -- Flexible config for different requirements
    points_awarded INTEGER DEFAULT 0,
    badge_image_url TEXT,
    is_secret BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User course achievements
CREATE TABLE IF NOT EXISTS user_course_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES course_achievements(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress_at_earning JSONB, -- Snapshot of progress when earned
    context_data JSONB, -- Additional context (speed, score, etc.)
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id, course_id)
);

-- Achievement progress tracking
CREATE TABLE IF NOT EXISTS course_achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES course_achievements(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    current_value DECIMAL(10, 2) DEFAULT 0,
    target_value DECIMAL(10, 2) NOT NULL,
    progress_percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN target_value > 0 THEN LEAST(100, ROUND((current_value / target_value * 100)::numeric, 0))
            ELSE 0
        END
    ) STORED,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id, course_id)
);

-- Course learning streaks
CREATE TABLE IF NOT EXISTS course_user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    streak_type TEXT DEFAULT 'daily_learning', -- 'daily_learning', 'consecutive_completions', 'weekly_activity'
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    freeze_days_available INTEGER DEFAULT 2,
    freeze_days_used INTEGER DEFAULT 0,
    streak_start_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, streak_type)
);

-- Course points sources
CREATE TABLE IF NOT EXISTS course_points_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    points_amount INTEGER NOT NULL,
    category TEXT DEFAULT 'learning', -- 'learning', 'social', 'achievement', 'contribution'
    max_daily_occurrences INTEGER,
    cooldown_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User course points
CREATE TABLE IF NOT EXISTS user_course_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    current_balance INTEGER DEFAULT 0,
    points_this_week INTEGER DEFAULT 0,
    points_this_month INTEGER DEFAULT 0,
    points_this_year INTEGER DEFAULT 0,
    lifetime_earnings INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 100,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Points transaction history
CREATE TABLE IF NOT EXISTS course_points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    source_id UUID REFERENCES course_points_sources(id) ON DELETE SET NULL,
    transaction_type TEXT CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty', 'refund')) NOT NULL,
    points_amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for transaction queries
CREATE INDEX idx_course_points_transactions_user_course ON course_points_transactions(user_id, course_id, created_at DESC);
CREATE INDEX idx_course_points_transactions_created ON course_points_transactions(created_at DESC);

-- Course leaderboards
CREATE TABLE IF NOT EXISTS course_leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    leaderboard_type TEXT CHECK (leaderboard_type IN ('global', 'organization', 'course', 'cohort')) NOT NULL,
    time_period TEXT CHECK (time_period IN ('all_time', 'yearly', 'monthly', 'weekly', 'daily')) NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('points', 'completions', 'streak', 'speed', 'accuracy')) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, organization_id, leaderboard_type, time_period, metric_type)
);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS course_leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES course_leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score DECIMAL(10, 2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(leaderboard_id, user_id)
);

CREATE INDEX idx_leaderboard_entries_rank ON course_leaderboard_entries(leaderboard_id, rank);

-- Course social follows
CREATE TABLE IF NOT EXISTS course_user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT true,
    CHECK (follower_id != following_id),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_course_follows_follower ON course_user_follows(follower_id);
CREATE INDEX idx_course_follows_following ON course_user_follows(following_id);

-- Course study groups
CREATE TABLE IF NOT EXISTS course_study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    max_members INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group members
CREATE TABLE IF NOT EXISTS course_study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES course_study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'moderator', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group challenges
CREATE TABLE IF NOT EXISTS course_group_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES course_study_groups(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT CHECK (challenge_type IN ('completion_race', 'points_competition', 'streak_challenge', 'accuracy_challenge')) NOT NULL,
    target_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    prize_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS course_challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES course_group_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_progress DECIMAL(10, 2) DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Peer reviews for course content
CREATE TABLE IF NOT EXISTS course_peer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_peer_reviews_course ON course_peer_reviews(course_id);
CREATE INDEX idx_peer_reviews_reviewer ON course_peer_reviews(reviewer_id);

-- =====================================================
-- Insert Default Data
-- =====================================================

-- Achievement categories
INSERT INTO course_achievement_categories (name, slug, description, icon, color, sort_order) VALUES
('Course Completion', 'course-completion', 'Complete courses to earn these badges', '🎓', '#4CAF50', 1),
('Skill Mastery', 'skill-mastery', 'Master specific skills and topics', '⚡', '#2196F3', 2),
('Engagement', 'engagement', 'Active participation and contribution', '💬', '#FF9800', 3),
('Streak', 'streak', 'Consistent learning habits', '🔥', '#F44336', 4),
('Speed', 'speed', 'Fast completion with quality', '⚡', '#9C27B0', 5),
('Perfection', 'perfection', 'Perfect scores and flawless execution', '💎', '#FFD700', 6);

-- Course achievements
INSERT INTO course_achievements (category_id, name, slug, description, icon, tier, requirement_type, requirement_config, points_awarded) VALUES
-- Course Completion
((SELECT id FROM course_achievement_categories WHERE slug = 'course-completion'), 'First Steps', 'first-course', 'Complete your first course', '🎯', 'bronze', 'course_completion', '{"count": 1}', 50),
((SELECT id FROM course_achievement_categories WHERE slug = 'course-completion'), 'Learning Explorer', 'five-courses', 'Complete 5 courses', '🗺️', 'silver', 'course_completion', '{"count": 5}', 250),
((SELECT id FROM course_achievement_categories WHERE slug = 'course-completion'), 'Knowledge Seeker', 'ten-courses', 'Complete 10 courses', '📚', 'gold', 'course_completion', '{"count": 10}', 500),
((SELECT id FROM course_achievement_categories WHERE slug = 'course-completion'), 'Master Learner', 'twenty-courses', 'Complete 20 courses', '🏆', 'platinum', 'course_completion', '{"count": 20}', 1000),
((SELECT id FROM course_achievement_categories WHERE slug = 'course-completion'), 'Elite Scholar', 'fifty-courses', 'Complete 50 courses', '👑', 'diamond', 'course_completion', '{"count": 50}', 2500),

-- Skill Mastery
((SELECT id FROM course_achievement_categories WHERE slug = 'skill-mastery'), 'Skill Apprentice', 'skill-bronze', 'Achieve mastery in one skill', '🥉', 'bronze', 'skill_mastery', '{"skills": 1, "mastery_level": 80}', 100),
((SELECT id FROM course_achievement_categories WHERE slug = 'skill-mastery'), 'Skill Expert', 'skill-silver', 'Achieve mastery in 3 skills', '🥈', 'silver', 'skill_mastery', '{"skills": 3, "mastery_level": 80}', 300),
((SELECT id FROM course_achievement_categories WHERE slug = 'skill-mastery'), 'Skill Master', 'skill-gold', 'Achieve mastery in 5 skills', '🥇', 'gold', 'skill_mastery', '{"skills": 5, "mastery_level": 80}', 600),
((SELECT id FROM course_achievement_categories WHERE slug = 'skill-mastery'), 'Polymath', 'skill-platinum', 'Achieve mastery in 10 skills', '🌟', 'platinum', 'skill_mastery', '{"skills": 10, "mastery_level": 80}', 1200),

-- Engagement
((SELECT id FROM course_achievement_categories WHERE slug = 'engagement'), 'Helpful Hand', 'helpful-bronze', 'Help 5 fellow learners', '🤝', 'bronze', 'engagement', '{"helps": 5}', 75),
((SELECT id FROM course_achievement_categories WHERE slug = 'engagement'), 'Community Champion', 'helpful-silver', 'Help 25 fellow learners', '💪', 'silver', 'engagement', '{"helps": 25}', 200),
((SELECT id FROM course_achievement_categories WHERE slug = 'engagement'), 'Mentor', 'helpful-gold', 'Help 50 fellow learners', '🎖️', 'gold', 'engagement', '{"helps": 50}', 400),
((SELECT id FROM course_achievement_categories WHERE slug = 'engagement'), 'Discussion Leader', 'discussions-platinum', 'Start 20 meaningful discussions', '💡', 'platinum', 'engagement', '{"discussions": 20, "min_replies": 5}', 800),

-- Streak
((SELECT id FROM course_achievement_categories WHERE slug = 'streak'), 'Week Warrior', 'streak-7', 'Maintain a 7-day learning streak', '🔥', 'bronze', 'streak', '{"days": 7}', 100),
((SELECT id FROM course_achievement_categories WHERE slug = 'streak'), 'Month Master', 'streak-30', 'Maintain a 30-day learning streak', '💥', 'silver', 'streak', '{"days": 30}', 400),
((SELECT id FROM course_achievement_categories WHERE slug = 'streak'), 'Consistency King', 'streak-90', 'Maintain a 90-day learning streak', '⚡', 'gold', 'streak', '{"days": 90}', 1000),
((SELECT id FROM course_achievement_categories WHERE slug = 'streak'), 'Unstoppable', 'streak-365', 'Maintain a 365-day learning streak', '🏆', 'platinum', 'streak', '{"days": 365}', 5000),

-- Speed
((SELECT id FROM course_achievement_categories WHERE slug = 'speed'), 'Quick Learner', 'speed-bronze', 'Complete a course in 50% of average time', '⚡', 'bronze', 'speed', '{"percentage": 50}', 150),
((SELECT id FROM course_achievement_categories WHERE slug = 'speed'), 'Speed Demon', 'speed-silver', 'Complete 5 courses in 50% of average time', '🚀', 'silver', 'speed', '{"count": 5, "percentage": 50}', 500),
((SELECT id FROM course_achievement_categories WHERE slug = 'speed'), 'Lightning Fast', 'speed-gold', 'Complete 10 courses in 40% of average time', '⚡', 'gold', 'speed', '{"count": 10, "percentage": 40}', 1000),

-- Perfection
((SELECT id FROM course_achievement_categories WHERE slug = 'perfection'), 'Perfect Score', 'perfect-one', 'Achieve 100% on a course assessment', '💎', 'bronze', 'perfection', '{"score": 100, "count": 1}', 200),
((SELECT id FROM course_achievement_categories WHERE slug = 'perfection'), 'Perfectionist', 'perfect-five', 'Achieve 100% on 5 assessments', '🌟', 'silver', 'perfection', '{"score": 100, "count": 5}', 750),
((SELECT id FROM course_achievement_categories WHERE slug = 'perfection'), 'Flawless', 'perfect-ten', 'Achieve 100% on 10 assessments', '👑', 'gold', 'perfection', '{"score": 100, "count": 10}', 1500);

-- Points sources
INSERT INTO course_points_sources (name, slug, description, points_amount, category, max_daily_occurrences) VALUES
-- Learning
('Course Completion', 'course-complete', 'Complete a full course', 500, 'learning', NULL),
('Module Completion', 'module-complete', 'Complete a course module', 50, 'learning', NULL),
('Lesson Completion', 'lesson-complete', 'Complete a lesson', 10, 'learning', NULL),
('Quiz Pass', 'quiz-pass', 'Pass a quiz (70%+)', 25, 'learning', NULL),
('Quiz Excellence', 'quiz-excellent', 'Score 90%+ on a quiz', 50, 'learning', NULL),
('Quiz Perfect', 'quiz-perfect', 'Score 100% on a quiz', 100, 'learning', NULL),
('First Attempt Success', 'first-try', 'Pass quiz on first attempt', 30, 'learning', NULL),
('Fast Completion', 'fast-complete', 'Complete module faster than average', 40, 'learning', NULL),

-- Social
('Daily Login', 'daily-login', 'Log in and engage with learning', 5, 'social', 1),
('Study Buddy Match', 'study-buddy', 'Connect with a study buddy', 20, 'social', NULL),
('Help Peer', 'help-peer', 'Help a fellow learner', 15, 'social', 5),
('Discussion Post', 'discussion-post', 'Start a discussion', 10, 'social', 3),
('Discussion Reply', 'discussion-reply', 'Reply to a discussion', 5, 'social', 10),
('Helpful Vote', 'helpful-vote', 'Receive a helpful vote', 3, 'social', NULL),
('Group Challenge Join', 'challenge-join', 'Join a group challenge', 25, 'social', NULL),
('Group Challenge Win', 'challenge-win', 'Win a group challenge', 200, 'social', NULL),

-- Achievement
('Achievement Unlock', 'achievement', 'Unlock an achievement', 0, 'achievement', NULL), -- Points from achievement itself
('Streak Milestone', 'streak-milestone', 'Reach a streak milestone', 50, 'achievement', NULL),
('Level Up', 'level-up', 'Reach a new level', 100, 'achievement', NULL),

-- Contribution
('Content Review', 'content-review', 'Review course content', 30, 'contribution', 2),
('Bug Report', 'bug-report', 'Report a bug or issue', 50, 'contribution', NULL),
('Feature Suggestion', 'feature-suggest', 'Suggest a feature', 25, 'contribution', NULL);

-- =====================================================
-- Functions
-- =====================================================

-- Award course points
CREATE OR REPLACE FUNCTION award_course_points(
    p_user_id UUID,
    p_course_id UUID,
    p_source_slug TEXT,
    p_points_amount INTEGER DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_source course_points_sources;
    v_points_to_award INTEGER;
    v_user_points user_course_points;
    v_new_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Get points source
    SELECT * INTO v_source FROM course_points_sources WHERE slug = p_source_slug AND is_active = true;
    
    IF v_source IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive points source');
    END IF;
    
    -- Use provided amount or source default
    v_points_to_award := COALESCE(p_points_amount, v_source.points_amount);
    
    -- Get or create user points record
    INSERT INTO user_course_points (user_id, course_id, total_earned, current_balance, lifetime_earnings)
    VALUES (p_user_id, p_course_id, 0, 0, 0)
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    SELECT * INTO v_user_points FROM user_course_points WHERE user_id = p_user_id AND course_id = p_course_id;
    
    -- Calculate new balance
    v_new_balance := v_user_points.current_balance + v_points_to_award;
    
    -- Update user points
    UPDATE user_course_points SET
        total_earned = total_earned + v_points_to_award,
        current_balance = v_new_balance,
        lifetime_earnings = lifetime_earnings + v_points_to_award,
        updated_at = NOW()
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    -- Record transaction
    INSERT INTO course_points_transactions (user_id, course_id, source_id, transaction_type, points_amount, balance_after, reason, metadata)
    VALUES (p_user_id, p_course_id, v_source.id, 'earned', v_points_to_award, v_new_balance, p_reason, p_metadata)
    RETURNING id INTO v_transaction_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', v_points_to_award,
        'new_balance', v_new_balance,
        'transaction_id', v_transaction_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update course streak
CREATE OR REPLACE FUNCTION update_course_streak(
    p_user_id UUID,
    p_course_id UUID,
    p_streak_type TEXT DEFAULT 'daily_learning'
)
RETURNS JSONB AS $$
DECLARE
    v_streak course_user_streaks;
    v_days_diff INTEGER;
    v_streak_broken BOOLEAN := false;
BEGIN
    -- Get existing streak
    SELECT * INTO v_streak FROM course_user_streaks 
    WHERE user_id = p_user_id AND course_id = p_course_id AND streak_type = p_streak_type;
    
    IF v_streak IS NULL THEN
        -- Create new streak
        INSERT INTO course_user_streaks (user_id, course_id, streak_type, current_streak, longest_streak, last_activity_date, streak_start_date)
        VALUES (p_user_id, p_course_id, p_streak_type, 1, 1, CURRENT_DATE, CURRENT_DATE)
        RETURNING * INTO v_streak;
        
        RETURN jsonb_build_object('success', true, 'current_streak', 1, 'is_new', true);
    END IF;
    
    -- Calculate days since last activity
    v_days_diff := CURRENT_DATE - v_streak.last_activity_date;
    
    IF v_days_diff = 0 THEN
        -- Same day, no update needed
        RETURN jsonb_build_object('success', true, 'current_streak', v_streak.current_streak, 'same_day', true);
    ELSIF v_days_diff = 1 THEN
        -- Consecutive day, increment streak
        UPDATE course_user_streaks SET
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = v_streak.id;
        
        RETURN jsonb_build_object('success', true, 'current_streak', v_streak.current_streak + 1, 'continued', true);
    ELSIF v_days_diff = 2 AND v_streak.freeze_days_available > v_streak.freeze_days_used THEN
        -- One day missed but can use freeze
        UPDATE course_user_streaks SET
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = CURRENT_DATE,
            freeze_days_used = freeze_days_used + 1,
            updated_at = NOW()
        WHERE id = v_streak.id;
        
        RETURN jsonb_build_object('success', true, 'current_streak', v_streak.current_streak + 1, 'freeze_used', true);
    ELSE
        -- Streak broken
        UPDATE course_user_streaks SET
            current_streak = 1,
            last_activity_date = CURRENT_DATE,
            streak_start_date = CURRENT_DATE,
            freeze_days_used = 0,
            updated_at = NOW()
        WHERE id = v_streak.id;
        
        RETURN jsonb_build_object('success', true, 'current_streak', 1, 'streak_broken', true, 'previous_streak', v_streak.current_streak);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and award achievements
CREATE OR REPLACE FUNCTION check_course_achievements(
    p_user_id UUID,
    p_course_id UUID,
    p_achievement_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_achievement course_achievements;
    v_progress course_achievement_progress;
    v_new_achievements JSONB := '[]'::jsonb;
    v_requirement JSONB;
    v_current_value DECIMAL;
    v_target_value DECIMAL;
    v_earned BOOLEAN;
BEGIN
    -- Loop through relevant achievements
    FOR v_achievement IN 
        SELECT * FROM course_achievements 
        WHERE is_active = true 
        AND (p_achievement_type IS NULL OR requirement_type = p_achievement_type)
    LOOP
        -- Check if already earned
        IF EXISTS (SELECT 1 FROM user_course_achievements WHERE user_id = p_user_id AND achievement_id = v_achievement.id AND course_id = p_course_id) THEN
            CONTINUE;
        END IF;
        
        v_requirement := v_achievement.requirement_config;
        v_earned := false;
        
        -- Check different requirement types
        CASE v_achievement.requirement_type
            WHEN 'course_completion' THEN
                SELECT COUNT(*) INTO v_current_value FROM course_user_progress 
                WHERE user_id = p_user_id AND completion_percentage = 100;
                v_target_value := (v_requirement->>'count')::decimal;
                v_earned := v_current_value >= v_target_value;
                
            WHEN 'skill_mastery' THEN
                -- Check skill mastery (simplified - would need skill tracking)
                v_current_value := 0;
                v_target_value := (v_requirement->>'skills')::decimal;
                
            WHEN 'streak' THEN
                SELECT MAX(current_streak) INTO v_current_value FROM course_user_streaks 
                WHERE user_id = p_user_id;
                v_target_value := (v_requirement->>'days')::decimal;
                v_earned := v_current_value >= v_target_value;
                
            WHEN 'perfection' THEN
                SELECT COUNT(*) INTO v_current_value FROM quiz_attempts 
                WHERE user_id = p_user_id AND score >= 100 AND status = 'passed';
                v_target_value := (v_requirement->>'count')::decimal;
                v_earned := v_current_value >= v_target_value;
                
            ELSE
                v_current_value := 0;
                v_target_value := 1;
        END CASE;
        
        -- Update or create progress
        INSERT INTO course_achievement_progress (user_id, achievement_id, course_id, current_value, target_value)
        VALUES (p_user_id, v_achievement.id, p_course_id, v_current_value, v_target_value)
        ON CONFLICT (user_id, achievement_id, course_id) 
        DO UPDATE SET current_value = EXCLUDED.current_value, last_updated = NOW();
        
        -- Award achievement if earned
        IF v_earned THEN
            INSERT INTO user_course_achievements (user_id, achievement_id, course_id, earned_at)
            VALUES (p_user_id, v_achievement.id, p_course_id, NOW())
            ON CONFLICT (user_id, achievement_id, course_id) DO NOTHING;
            
            -- Award points
            PERFORM award_course_points(p_user_id, p_course_id, 'achievement', v_achievement.points_awarded, 
                'Achievement: ' || v_achievement.name, jsonb_build_object('achievement_id', v_achievement.id));
            
            v_new_achievements := v_new_achievements || jsonb_build_object(
                'id', v_achievement.id,
                'name', v_achievement.name,
                'tier', v_achievement.tier,
                'points', v_achievement.points_awarded
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object('success', true, 'new_achievements', v_new_achievements);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate course leaderboard
CREATE OR REPLACE FUNCTION calculate_course_leaderboard(
    p_leaderboard_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_leaderboard course_leaderboards;
    v_entry RECORD;
    v_rank INTEGER := 0;
BEGIN
    SELECT * INTO v_leaderboard FROM course_leaderboards WHERE id = p_leaderboard_id;
    
    IF v_leaderboard IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Leaderboard not found');
    END IF;
    
    -- Clear existing entries
    DELETE FROM course_leaderboard_entries WHERE leaderboard_id = p_leaderboard_id;
    
    -- Calculate based on metric type
    CASE v_leaderboard.metric_type
        WHEN 'points' THEN
            FOR v_entry IN
                SELECT 
                    user_id,
                    SUM(current_balance) as score
                FROM user_course_points
                WHERE (v_leaderboard.course_id IS NULL OR course_id = v_leaderboard.course_id)
                GROUP BY user_id
                ORDER BY score DESC
                LIMIT 100
            LOOP
                v_rank := v_rank + 1;
                INSERT INTO course_leaderboard_entries (leaderboard_id, user_id, rank, score)
                VALUES (p_leaderboard_id, v_entry.user_id, v_rank, v_entry.score);
            END LOOP;
            
        WHEN 'completions' THEN
            FOR v_entry IN
                SELECT 
                    user_id,
                    COUNT(*) as score
                FROM course_user_progress
                WHERE completion_percentage = 100
                AND (v_leaderboard.course_id IS NULL OR course_id = v_leaderboard.course_id)
                GROUP BY user_id
                ORDER BY score DESC
                LIMIT 100
            LOOP
                v_rank := v_rank + 1;
                INSERT INTO course_leaderboard_entries (leaderboard_id, user_id, rank, score)
                VALUES (p_leaderboard_id, v_entry.user_id, v_rank, v_entry.score);
            END LOOP;
            
        WHEN 'streak' THEN
            FOR v_entry IN
                SELECT 
                    user_id,
                    MAX(current_streak) as score
                FROM course_user_streaks
                WHERE (v_leaderboard.course_id IS NULL OR course_id = v_leaderboard.course_id)
                GROUP BY user_id
                ORDER BY score DESC
                LIMIT 100
            LOOP
                v_rank := v_rank + 1;
                INSERT INTO course_leaderboard_entries (leaderboard_id, user_id, rank, score)
                VALUES (p_leaderboard_id, v_entry.user_id, v_rank, v_entry.score);
            END LOOP;
    END CASE;
    
    RETURN jsonb_build_object('success', true, 'entries_calculated', v_rank);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_user_course_achievements_user ON user_course_achievements(user_id);
CREATE INDEX idx_user_course_achievements_achievement ON user_course_achievements(achievement_id);
CREATE INDEX idx_user_course_achievements_course ON user_course_achievements(course_id);

CREATE INDEX idx_course_achievement_progress_user ON course_achievement_progress(user_id);
CREATE INDEX idx_course_achievement_progress_achievement ON course_achievement_progress(achievement_id);

CREATE INDEX idx_course_user_streaks_user_course ON course_user_streaks(user_id, course_id);
CREATE INDEX idx_course_user_streaks_type ON course_user_streaks(streak_type);

CREATE INDEX idx_user_course_points_user_course ON user_course_points(user_id, course_id);
CREATE INDEX idx_user_course_points_balance ON user_course_points(current_balance DESC);

CREATE INDEX idx_course_study_groups_course ON course_study_groups(course_id);
CREATE INDEX idx_course_study_group_members_group ON course_study_group_members(group_id);
CREATE INDEX idx_course_study_group_members_user ON course_study_group_members(user_id);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE course_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_peer_reviews ENABLE ROW LEVEL SECURITY;

-- Public read for active achievements
CREATE POLICY "Anyone can view active achievements" ON course_achievements FOR SELECT USING (is_active = true AND is_secret = false);

-- Users can view their own data
CREATE POLICY "Users can view own achievements" ON user_course_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON course_achievement_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own streaks" ON course_user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own points" ON user_course_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON course_points_transactions FOR SELECT USING (auth.uid() = user_id);

-- Public leaderboards
CREATE POLICY "Anyone can view leaderboards" ON course_leaderboards FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view leaderboard entries" ON course_leaderboard_entries FOR SELECT USING (true);

-- Social features
CREATE POLICY "Users can manage own follows" ON course_user_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can view public follows" ON course_user_follows FOR SELECT USING (true);

-- Study groups
CREATE POLICY "Anyone can view public groups" ON course_study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view private groups" ON course_study_groups FOR SELECT USING (
    id IN (SELECT group_id FROM course_study_group_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON course_study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view group membership" ON course_study_group_members FOR SELECT USING (
    group_id IN (SELECT group_id FROM course_study_group_members WHERE user_id = auth.uid())
);

-- Peer reviews
CREATE POLICY "Users can create reviews" ON course_peer_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can view course reviews" ON course_peer_reviews FOR SELECT USING (true);
CREATE POLICY "Users can update own reviews" ON course_peer_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

COMMENT ON TABLE course_achievements IS 'Course-specific achievements and badges';
COMMENT ON TABLE user_course_achievements IS 'User earned achievements for courses';
COMMENT ON TABLE course_user_streaks IS 'User learning streaks per course';
COMMENT ON TABLE user_course_points IS 'User points balance per course';
COMMENT ON TABLE course_leaderboards IS 'Course and organization leaderboards';
COMMENT ON TABLE course_study_groups IS 'Student study groups for courses';
COMMENT ON TABLE course_peer_reviews IS 'Peer reviews of course content';
