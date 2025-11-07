-- Migration: 004_user_engagement.sql
-- Description: User progress, enrollments, achievements, and gamification
-- Created: 2025-11-05
-- Requires: 003_content_tables.sql

-- ============================================================================
-- ENROLLMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'expired')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    completion_time_minutes INTEGER, -- Actual time spent
    certificate_url TEXT,
    certificate_issued_at TIMESTAMPTZ,
    
    -- Activity
    last_accessed_at TIMESTAMPTZ,
    current_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    
    -- Assignment (optional)
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    
    -- Timestamps
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_organization_id ON enrollments(organization_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_last_accessed_at ON enrollments(last_accessed_at DESC);

-- ============================================================================
-- LESSON PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Progress
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Video-specific
    video_position_seconds INTEGER DEFAULT 0,
    video_watched_duration_seconds INTEGER DEFAULT 0,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Activity
    first_accessed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    access_count INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

-- ============================================================================
-- QUIZ ATTEMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Attempt Info
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    
    -- Answers
    answers JSONB NOT NULL DEFAULT '{}', -- {question_id: selected_answer_id}
    
    -- Scoring
    score DECIMAL(5,2),
    total_questions INTEGER,
    correct_answers INTEGER,
    passed BOOLEAN,
    
    -- Timing
    time_limit_minutes INTEGER,
    time_spent_seconds INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

-- ============================================================================
-- ACHIEVEMENTS / BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_image_url TEXT,
    
    -- Type
    type VARCHAR(50) NOT NULL CHECK (type IN ('course_completion', 'streak', 'milestone', 'special', 'custom')),
    category VARCHAR(100),
    
    -- Criteria
    criteria JSONB NOT NULL DEFAULT '{}', -- Conditions for earning
    points_value INTEGER DEFAULT 0,
    
    -- Rarity
    rarity VARCHAR(50) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    
    -- Visibility
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    earned_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- ============================================================================
-- USER ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Context
    earned_from_type VARCHAR(50), -- 'course', 'lesson', 'streak', 'manual'
    earned_from_id UUID, -- Reference to course, lesson, etc.
    
    -- Details
    notes TEXT,
    points_awarded INTEGER DEFAULT 0,
    
    -- Timestamps
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_organization_id ON user_achievements(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- ============================================================================
-- USER POINTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Points
    action_type VARCHAR(100) NOT NULL, -- 'course_completed', 'lesson_completed', 'quiz_passed', etc.
    points INTEGER NOT NULL,
    
    -- Context
    reference_type VARCHAR(50), -- 'course', 'lesson', 'quiz', 'achievement'
    reference_id UUID,
    
    -- Multipliers
    multiplier DECIMAL(3,2) DEFAULT 1.00,
    bonus_reason VARCHAR(255),
    
    -- Timestamps
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_organization_id ON user_points(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_points_action_type ON user_points(action_type);
CREATE INDEX IF NOT EXISTS idx_user_points_earned_at ON user_points(earned_at DESC);

-- ============================================================================
-- LEARNING STREAKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_streaks (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Current Streak
    current_streak_days INTEGER DEFAULT 0,
    current_streak_start_date DATE,
    last_activity_date DATE,
    
    -- Longest Streak
    longest_streak_days INTEGER DEFAULT 0,
    longest_streak_start_date DATE,
    longest_streak_end_date DATE,
    
    -- Total
    total_active_days INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- BOOKMARKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Bookmarked Resource
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('course', 'lesson', 'case', 'article')),
    resource_id UUID NOT NULL,
    
    -- Organization
    folder VARCHAR(255),
    notes TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource_type ON bookmarks(resource_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource_id ON bookmarks(resource_id);

-- ============================================================================
-- COURSE REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Review
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Moderation
    is_published BOOLEAN DEFAULT TRUE,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderation_notes TEXT,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_is_published ON course_reviews(is_published);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON quiz_attempts;
CREATE TRIGGER update_quiz_attempts_updated_at BEFORE UPDATE ON quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_streaks_updated_at ON learning_streaks;
CREATE TRIGGER update_learning_streaks_updated_at BEFORE UPDATE ON learning_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmarks_updated_at ON bookmarks;
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_reviews_updated_at ON course_reviews;
CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON course_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE enrollments IS 'User course enrollments with progress tracking';
COMMENT ON TABLE lesson_progress IS 'Detailed progress for each lesson including video position';
COMMENT ON TABLE quiz_attempts IS 'Quiz attempts with answers and scoring';
COMMENT ON TABLE achievements IS 'Badges and achievements available to earn';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
COMMENT ON TABLE user_points IS 'Points earned by users for various actions';
COMMENT ON TABLE learning_streaks IS 'User learning streaks (consecutive active days)';
COMMENT ON TABLE bookmarks IS 'User bookmarks for courses, lessons, cases';
COMMENT ON TABLE course_reviews IS 'User ratings and reviews for courses';



