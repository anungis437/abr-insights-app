-- Migration: 017_courses_enhancement_phase1.sql
-- Description: Phase 1 - Enhanced course structure with modules, versions, learning paths, and engagement features
-- Created: 2025-11-07
-- Requires: 003_content_tables.sql, 014_add_role_to_profiles.sql

-- ============================================================================
-- COURSE MODULES (organize lessons into logical groups)
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Organization
    module_number INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    
    -- Duration
    estimated_duration_minutes INTEGER,
    
    -- Access Control
    is_published BOOLEAN DEFAULT FALSE,
    unlock_requirements JSONB DEFAULT '{}', -- {required_modules: [], required_quiz_score: 70, etc.}
    
    -- Content
    learning_objectives JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]', -- Module-level resources
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, slug),
    UNIQUE(course_id, module_number)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_sort_order ON course_modules(sort_order);
CREATE INDEX IF NOT EXISTS idx_course_modules_is_published ON course_modules(is_published);

COMMENT ON TABLE course_modules IS 'Modules that organize lessons into logical learning units';
COMMENT ON COLUMN course_modules.unlock_requirements IS 'JSON defining prerequisites like completed modules or quiz scores';

-- ============================================================================
-- ENHANCE LESSONS TABLE (add bilingual support and accessibility)
-- ============================================================================

-- Add new columns to existing lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS transcript_en TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS transcript_fr TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS closed_captions_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS accessibility_notes TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ce_credits DECIMAL(3,1) DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS regulatory_body VARCHAR(100);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS completion_required BOOLEAN DEFAULT TRUE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT FALSE;

-- Add index for module lookup
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

COMMENT ON COLUMN lessons.transcript_en IS 'English transcript for video/audio content';
COMMENT ON COLUMN lessons.transcript_fr IS 'French transcript for video/audio content';
COMMENT ON COLUMN lessons.ce_credits IS 'Continuing Education credits awarded (e.g., 0.5, 1.0)';
COMMENT ON COLUMN lessons.regulatory_body IS 'Regulatory body recognizing CE credits (e.g., MFDA, IIROC)';

-- ============================================================================
-- COURSE VERSIONS (track content changes and rollback capability)
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Version Info
    version_number VARCHAR(20) NOT NULL, -- e.g., "1.0", "1.1", "2.0"
    version_name VARCHAR(255), -- e.g., "2024 Regulatory Update"
    change_summary TEXT,
    change_type VARCHAR(50) CHECK (change_type IN ('major', 'minor', 'patch', 'regulatory')),
    
    -- Content Snapshot
    content_snapshot JSONB NOT NULL, -- Complete course structure at this version
    modules_snapshot JSONB, -- Modules at this version
    lessons_snapshot JSONB, -- Lessons at this version
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE, -- Only one active version per course
    
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_course_versions_course_id ON course_versions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_versions_is_active ON course_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_course_versions_published_at ON course_versions(published_at DESC);

COMMENT ON TABLE course_versions IS 'Version history for courses enabling rollback and change tracking';

-- ============================================================================
-- COURSE REVIEWS (ratings and feedback)
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Categories (optional detailed ratings)
    content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
    instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    
    -- Verification
    is_verified_completion BOOLEAN DEFAULT FALSE, -- User completed the course
    completion_date DATE,
    
    -- Moderation
    is_published BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, user_id) -- One review per user per course
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_is_published ON course_reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_course_reviews_created_at ON course_reviews(created_at DESC);

COMMENT ON TABLE course_reviews IS 'User reviews and ratings for courses';

-- ============================================================================
-- COURSE DISCUSSIONS (Q&A and forums)
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES course_discussions(id) ON DELETE CASCADE, -- For threaded replies
    
    -- Author
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(500), -- Only for top-level posts
    content TEXT NOT NULL,
    discussion_type VARCHAR(50) CHECK (discussion_type IN ('question', 'discussion', 'announcement', 'reply')),
    
    -- Question-specific
    is_answered BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_instructor_question BOOLEAN DEFAULT FALSE, -- Posted by instructor
    
    -- Engagement
    upvotes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    
    -- Best Answer (for questions)
    best_answer_id UUID REFERENCES course_discussions(id) ON DELETE SET NULL,
    marked_as_answer_at TIMESTAMPTZ,
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Moderation
    is_published BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- Prevent new replies
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_course_discussions_course_id ON course_discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_lesson_id ON course_discussions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_parent_id ON course_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_user_id ON course_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_course_discussions_type ON course_discussions(discussion_type);
CREATE INDEX IF NOT EXISTS idx_course_discussions_created_at ON course_discussions(created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_course_discussions_search ON course_discussions USING GIN (
    to_tsvector('english', COALESCE(title, '') || ' ' || content)
);

COMMENT ON TABLE course_discussions IS 'Q&A forums and discussions for courses and lessons';

-- ============================================================================
-- LEARNING PATHS (curated course sequences) - MOVED BEFORE ENROLLMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    thumbnail_url TEXT,
    cover_image_url TEXT,
    
    -- Content
    learning_objectives JSONB DEFAULT '[]',
    target_audience TEXT,
    career_outcomes TEXT,
    
    -- Course Sequence
    course_sequence JSONB NOT NULL DEFAULT '[]', -- Ordered array: [{course_id, optional, unlock_after}]
    total_courses INTEGER DEFAULT 0,
    estimated_hours INTEGER,
    
    -- Classification
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'mixed')),
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    
    -- Access Control
    is_published BOOLEAN DEFAULT FALSE,
    required_tier VARCHAR(50) DEFAULT 'free' CHECK (required_tier IN ('free', 'professional', 'enterprise')),
    
    -- Certification
    certificate_name VARCHAR(255),
    certificate_description TEXT,
    ce_credits_total DECIMAL(4,1) DEFAULT 0,
    
    -- Stats
    enrollments_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_learning_paths_is_published ON learning_paths(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty_level ON learning_paths(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_learning_paths_tags ON learning_paths USING GIN (tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_learning_paths_search ON learning_paths USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

COMMENT ON TABLE learning_paths IS 'Curated sequences of courses forming complete learning programs';

-- ============================================================================
-- ENROLLMENTS (enhanced with completion tracking)
-- ============================================================================

-- Check if enrollments table exists and ALTER it, otherwise CREATE it
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
        -- Table exists, add new columns if they don't exist
        RAISE NOTICE 'Enrollments table exists, adding new columns...';
        
        -- Add learning_path_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'learning_path_id') THEN
            ALTER TABLE enrollments ADD COLUMN learning_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added learning_path_id column';
        END IF;
        
        -- Add enrollment_date if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'enrollment_date') THEN
            ALTER TABLE enrollments ADD COLUMN enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
            RAISE NOTICE 'Added enrollment_date column';
        END IF;
        
        -- Add enrollment_source if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'enrollment_source') THEN
            ALTER TABLE enrollments ADD COLUMN enrollment_source VARCHAR(50);
            RAISE NOTICE 'Added enrollment_source column';
        END IF;
        
        -- Add completion_certificate_issued if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'completion_certificate_issued') THEN
            ALTER TABLE enrollments ADD COLUMN completion_certificate_issued BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added completion_certificate_issued column';
        END IF;
        
        -- Add certificate_issued_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'certificate_issued_at') THEN
            ALTER TABLE enrollments ADD COLUMN certificate_issued_at TIMESTAMPTZ;
            RAISE NOTICE 'Added certificate_issued_at column';
        END IF;
        
        -- Add certificate_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'certificate_id') THEN
            ALTER TABLE enrollments ADD COLUMN certificate_id VARCHAR(100) UNIQUE;
            RAISE NOTICE 'Added certificate_id column';
        END IF;
        
        -- Add average_quiz_score if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'average_quiz_score') THEN
            ALTER TABLE enrollments ADD COLUMN average_quiz_score DECIMAL(5,2);
            RAISE NOTICE 'Added average_quiz_score column';
        END IF;
        
        -- Add quizzes_passed if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'quizzes_passed') THEN
            ALTER TABLE enrollments ADD COLUMN quizzes_passed INTEGER DEFAULT 0;
            RAISE NOTICE 'Added quizzes_passed column';
        END IF;
        
        -- Add quizzes_failed if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'quizzes_failed') THEN
            ALTER TABLE enrollments ADD COLUMN quizzes_failed INTEGER DEFAULT 0;
            RAISE NOTICE 'Added quizzes_failed column';
        END IF;
        
        -- Add access_expires_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'access_expires_at') THEN
            ALTER TABLE enrollments ADD COLUMN access_expires_at TIMESTAMPTZ;
            RAISE NOTICE 'Added access_expires_at column';
        END IF;
        
        -- Add is_access_granted if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'is_access_granted') THEN
            ALTER TABLE enrollments ADD COLUMN is_access_granted BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Added is_access_granted column';
        END IF;
        
        -- Add enrollment_metadata if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'enrollments' AND column_name = 'enrollment_metadata') THEN
            ALTER TABLE enrollments ADD COLUMN enrollment_metadata JSONB DEFAULT '{}';
            RAISE NOTICE 'Added enrollment_metadata column';
        END IF;
        
    ELSE
        -- Table doesn't exist, create it with all columns
        RAISE NOTICE 'Creating new enrollments table...';
        
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            learning_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
            
            -- Enrollment Info
            enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            enrollment_source VARCHAR(50), -- 'direct', 'learning_path', 'organization', 'trial'
            
            -- Progress
            status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped', 'expired')),
            progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
            
            -- Completion
            completed_at TIMESTAMPTZ,
            completion_certificate_issued BOOLEAN DEFAULT FALSE,
            certificate_issued_at TIMESTAMPTZ,
            certificate_id VARCHAR(100) UNIQUE, -- Unique certificate identifier
            
            -- Time Tracking
            last_accessed_at TIMESTAMPTZ,
            total_time_spent_minutes INTEGER DEFAULT 0,
            
            -- Performance
            average_quiz_score DECIMAL(5,2),
            quizzes_passed INTEGER DEFAULT 0,
            quizzes_failed INTEGER DEFAULT 0,
            
            -- Access Control
            access_expires_at TIMESTAMPTZ,
            is_access_granted BOOLEAN DEFAULT TRUE,
            
            -- Metadata
            enrollment_metadata JSONB DEFAULT '{}', -- Organization info, payment ref, etc.
            
            -- Timestamps
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            
            UNIQUE(user_id, course_id)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_learning_path_id ON enrollments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Create enrollment_date index only if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'enrollments' AND column_name = 'enrollment_date') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_enrollment_date ON enrollments(enrollment_date DESC);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_enrollments_certificate_id ON enrollments(certificate_id);

COMMENT ON TABLE enrollments IS 'User enrollments in courses with progress and completion tracking';

-- ============================================================================
-- LESSON PROGRESS (detailed tracking per lesson)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    
    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position_seconds INTEGER, -- For video lessons
    
    -- Completion
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Video-specific
    watch_count INTEGER DEFAULT 0,
    playback_speed DECIMAL(2,1) DEFAULT 1.0,
    
    -- Bookmarks and Notes
    bookmarks JSONB DEFAULT '[]', -- [{timestamp, note, created_at}]
    notes TEXT,
    
    -- Timestamps
    first_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

COMMENT ON TABLE lesson_progress IS 'Detailed tracking of user progress through individual lessons';

-- ============================================================================
-- QUIZ ATTEMPTS (assessment history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    
    -- Attempt Info
    attempt_number INTEGER DEFAULT 1,
    
    -- Responses
    answers JSONB NOT NULL, -- User's answers
    score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    
    -- Result
    passed BOOLEAN NOT NULL,
    passing_score_percentage INTEGER NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    
    -- Feedback
    feedback TEXT,
    detailed_results JSONB, -- Question-by-question breakdown
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON quiz_attempts(passed);

-- Create submitted_at index only if column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'quiz_attempts' AND column_name = 'submitted_at') THEN
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_submitted_at ON quiz_attempts(submitted_at DESC);
    END IF;
END $$;

COMMENT ON TABLE quiz_attempts IS 'History of user quiz attempts with scores and feedback';

-- ============================================================================
-- LEARNING PATH ENROLLMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_path_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'dropped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Tracking
    courses_completed INTEGER DEFAULT 0,
    courses_total INTEGER DEFAULT 0,
    current_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id VARCHAR(100) UNIQUE,
    
    -- Timestamps
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, learning_path_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_user_id ON learning_path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_path_id ON learning_path_enrollments(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_enrollments_status ON learning_path_enrollments(status);

COMMENT ON TABLE learning_path_enrollments IS 'User enrollments in learning paths';

-- ============================================================================
-- TRIGGERS (auto-update timestamps)
-- ============================================================================

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at_enhanced ON lessons;
CREATE TRIGGER update_lessons_updated_at_enhanced BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_reviews_updated_at ON course_reviews;
CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON course_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_discussions_updated_at ON course_discussions;
CREATE TRIGGER update_course_discussions_updated_at BEFORE UPDATE ON course_discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON quiz_attempts;
CREATE TRIGGER update_quiz_attempts_updated_at BEFORE UPDATE ON quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_path_enrollments_updated_at ON learning_path_enrollments;
CREATE TRIGGER update_learning_path_enrollments_updated_at BEFORE UPDATE ON learning_path_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate course completion percentage
CREATE OR REPLACE FUNCTION calculate_course_completion(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
BEGIN
    -- Count total required lessons
    SELECT COUNT(*) INTO v_total_lessons
    FROM lessons
    WHERE course_id = p_course_id 
    AND is_published = TRUE 
    AND completion_required = TRUE
    AND deleted_at IS NULL;
    
    -- Count completed lessons
    SELECT COUNT(*) INTO v_completed_lessons
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = p_user_id 
    AND l.course_id = p_course_id
    AND lp.status = 'completed'
    AND l.completion_required = TRUE
    AND l.deleted_at IS NULL;
    
    -- Calculate percentage
    IF v_total_lessons = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((v_completed_lessons::DECIMAL / v_total_lessons::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_course_completion IS 'Calculate completion percentage for a user in a course';

-- Function to update course stats (enrollments, ratings, etc.)
CREATE OR REPLACE FUNCTION update_course_stats(p_course_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE courses
    SET 
        enrollments_count = (
            SELECT COUNT(*) FROM enrollments 
            WHERE course_id = p_course_id AND status != 'dropped'
        ),
        completions_count = (
            SELECT COUNT(*) FROM enrollments 
            WHERE course_id = p_course_id AND status = 'completed'
        ),
        average_rating = (
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM course_reviews 
            WHERE course_id = p_course_id AND is_published = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*) FROM course_reviews 
            WHERE course_id = p_course_id AND is_published = TRUE
        ),
        updated_at = NOW()
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_course_stats IS 'Update denormalized course statistics';

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- This migration adds:
-- 1. ✅ course_modules - Organize lessons into modules
-- 2. ✅ Enhanced lessons - Bilingual support, CE credits, accessibility
-- 3. ✅ course_versions - Version tracking and rollback
-- 4. ✅ learning_paths - Curated course sequences
-- 5. ✅ course_reviews - Ratings and feedback
-- 6. ✅ course_discussions - Q&A forums
-- 7. ✅ enrollments - Enhanced enrollment tracking
-- 8. ✅ lesson_progress - Detailed lesson completion
-- 9. ✅ quiz_attempts - Assessment history
-- 10. ✅ learning_path_enrollments - Learning path progress
-- 11. ✅ Helper functions for calculations
