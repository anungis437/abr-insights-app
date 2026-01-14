-- Create missing gamification tables only
-- Based on 004_user_engagement.sql

-- ACHIEVEMENTS TABLE
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
    criteria JSONB NOT NULL DEFAULT '{}',
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

-- USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Context
    earned_from_type VARCHAR(50),
    earned_from_id UUID,
    
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

-- QUIZ ATTEMPTS TABLE (from 20250115000003_quiz_system.sql)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_data JSONB NOT NULL,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER,
    attempt_number INTEGER DEFAULT 1,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session ON quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_question ON quiz_attempts(question_id);

-- QUIZ RESPONSES TABLE (if needed)
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer JSONB,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_attempt ON quiz_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question ON quiz_responses(question_id);
