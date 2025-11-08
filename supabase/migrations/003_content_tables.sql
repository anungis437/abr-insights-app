-- Migration: 003_content_tables.sql
-- Description: Content tables for courses, lessons, tribunal cases
-- Created: 2025-11-05
-- Requires: 001_initial_schema.sql

-- ============================================================================
-- CONTENT CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    parent_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_parent_id ON content_categories(parent_id);

-- ============================================================================
-- COURSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    cover_image_url TEXT,
    
    -- Content
    learning_objectives JSONB DEFAULT '[]', -- Array of strings
    prerequisites JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- Organization
    category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Difficulty & Duration
    level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration_minutes INTEGER,
    
    -- Access Control
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    required_tier VARCHAR(50) DEFAULT 'free' CHECK (required_tier IN ('free', 'professional', 'enterprise')),
    
    -- Gamification
    points_reward INTEGER DEFAULT 0,
    completion_badge_id UUID, -- References achievements table (will be created later)
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Stats (denormalized for performance)
    enrollments_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_required_tier ON courses(required_tier);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN (tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- LESSONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Content
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'interactive', 'assignment')),
    content_url TEXT, -- Video URL, article content, etc.
    content_data JSONB DEFAULT '{}', -- Type-specific data
    
    -- Video-specific
    video_duration_seconds INTEGER,
    video_provider VARCHAR(50), -- 'youtube', 'vimeo', 'azure_media'
    video_id VARCHAR(255),
    thumbnail_url TEXT,
    
    -- Article-specific
    article_body TEXT,
    estimated_read_time_minutes INTEGER,
    
    -- Organization
    module_number INTEGER DEFAULT 1,
    lesson_number INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    
    -- Access
    is_published BOOLEAN DEFAULT FALSE,
    is_preview BOOLEAN DEFAULT FALSE, -- Can be viewed without enrollment
    
    -- Resources
    resources JSONB DEFAULT '[]', -- Array of {title, url, type}
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type);
CREATE INDEX IF NOT EXISTS idx_lessons_is_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons(sort_order);

-- ============================================================================
-- QUIZZES
-- ============================================================================

CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Configuration
    passing_score_percentage INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    randomize_questions BOOLEAN DEFAULT FALSE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    
    -- Questions (stored as JSONB for flexibility)
    questions JSONB NOT NULL DEFAULT '[]', -- Array of question objects
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

-- ============================================================================
-- TRIBUNAL CASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS tribunal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Case Identification
    case_number VARCHAR(100) UNIQUE NOT NULL,
    case_title TEXT NOT NULL,
    citation VARCHAR(500),
    
    -- Tribunal Info
    tribunal_name VARCHAR(255) NOT NULL,
    tribunal_province VARCHAR(50),
    decision_date DATE,
    filing_date DATE,
    
    -- Parties
    applicant TEXT,
    respondent TEXT,
    
    -- Case Content
    summary TEXT,
    full_text TEXT,
    decision TEXT,
    
    -- Classification (AI-powered)
    primary_category VARCHAR(100),
    subcategories JSONB DEFAULT '[]',
    key_issues JSONB DEFAULT '[]',
    remedies JSONB DEFAULT '[]',
    outcomes JSONB DEFAULT '[]',
    
    -- Legal References
    legislation_cited JSONB DEFAULT '[]',
    cases_cited JSONB DEFAULT '[]',
    
    -- AI Analysis
    ai_classification_confidence DECIMAL(3,2),
    ai_key_phrases JSONB DEFAULT '[]',
    ai_sentiment VARCHAR(50), -- 'favorable', 'unfavorable', 'mixed'
    
    -- Metadata
    url TEXT,
    pdf_url TEXT,
    document_type VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'fr')),
    tags JSONB DEFAULT '[]',
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    
    -- Data Ingestion
    source_system VARCHAR(100),
    last_scraped_at TIMESTAMPTZ,
    scraper_version VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tribunal_cases_case_number ON tribunal_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_tribunal_name ON tribunal_cases(tribunal_name);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_decision_date ON tribunal_cases(decision_date DESC);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_primary_category ON tribunal_cases(primary_category);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_tags ON tribunal_cases USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_language ON tribunal_cases(language);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_search ON tribunal_cases USING GIN (
    to_tsvector('english', 
        case_title || ' ' || 
        COALESCE(summary, '') || ' ' || 
        COALESCE(case_number, '')
    )
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tribunal_cases_updated_at ON tribunal_cases;
CREATE TRIGGER update_tribunal_cases_updated_at BEFORE UPDATE ON tribunal_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE courses IS 'Training courses with learning objectives and gamification';
COMMENT ON TABLE lessons IS 'Individual lessons within courses (video, article, quiz, etc.)';
COMMENT ON TABLE quizzes IS 'Assessments with questions and scoring logic';
COMMENT ON TABLE tribunal_cases IS 'Tribunal decisions with AI-powered classification and analysis';



