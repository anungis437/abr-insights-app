-- ============================================================================
-- Phase 4: Instructor Portal & Management
-- Created: November 8, 2025
-- Description: Instructor profiles, analytics, revenue tracking, communications
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Instructor status
CREATE TYPE instructor_status AS ENUM (
    'pending',     -- Application submitted, not yet approved
    'active',      -- Approved and actively teaching
    'inactive',    -- Temporarily inactive
    'suspended'    -- Suspended due to policy violation
);

-- Instructor specialization areas
CREATE TYPE instructor_specialization AS ENUM (
    'anti_racism',
    'equity_diversity_inclusion',
    'human_rights',
    'workplace_investigations',
    'compliance_training',
    'leadership_development',
    'conflict_resolution',
    'policy_development',
    'other'
);

-- Communication types
CREATE TYPE communication_type AS ENUM (
    'announcement',      -- General announcement to all students
    'course_update',     -- Course content update notification
    'direct_message',    -- Private message to specific student(s)
    'feedback',          -- Feedback on student work
    'reminder'           -- Reminder about deadlines, quizzes, etc.
);

-- ============================================================================
-- INSTRUCTOR PROFILES TABLE
-- ============================================================================

CREATE TABLE instructor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Professional info
    bio TEXT,
    headline VARCHAR(200), -- Short professional tagline
    credentials JSONB DEFAULT '[]', -- Array of {credential, issuer, year}
    specializations instructor_specialization[] DEFAULT '{}',
    
    -- Experience
    years_of_experience INTEGER,
    previous_roles JSONB DEFAULT '[]', -- Array of {title, organization, years}
    certifications JSONB DEFAULT '[]', -- Array of {name, issuer, number, expiry_date}
    
    -- Social links
    linkedin_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    
    -- Teaching
    teaching_philosophy TEXT,
    expertise_areas TEXT[], -- Free-form tags
    languages_spoken VARCHAR(100)[], -- e.g., ['English', 'French']
    
    -- Status
    status instructor_status DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    
    -- Settings
    allow_student_messages BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB DEFAULT '{}',
    
    -- Profile visibility
    is_featured BOOLEAN DEFAULT FALSE,
    display_on_public_profile BOOLEAN DEFAULT TRUE,
    
    -- Media
    profile_image_url TEXT,
    cover_image_url TEXT,
    video_intro_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX idx_instructor_profiles_status ON instructor_profiles(status);
CREATE INDEX idx_instructor_profiles_specializations ON instructor_profiles USING GIN (specializations);
CREATE INDEX idx_instructor_profiles_is_featured ON instructor_profiles(is_featured);
CREATE INDEX idx_instructor_profiles_languages ON instructor_profiles USING GIN (languages_spoken);

COMMENT ON TABLE instructor_profiles IS 'Extended profiles for course instructors with credentials and specializations';

-- ============================================================================
-- COURSE INSTRUCTORS JUNCTION TABLE (Many-to-Many)
-- ============================================================================

CREATE TABLE course_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    
    -- Role in course
    role VARCHAR(50) DEFAULT 'instructor' CHECK (role IN ('lead_instructor', 'instructor', 'teaching_assistant', 'guest_speaker')),
    is_primary BOOLEAN DEFAULT FALSE, -- One primary instructor per course
    
    -- Contribution
    contribution_percentage INTEGER CHECK (contribution_percentage BETWEEN 0 AND 100),
    responsibilities TEXT, -- What this instructor is responsible for
    
    -- Revenue sharing (if applicable)
    revenue_share_percentage DECIMAL(5,2) CHECK (revenue_share_percentage >= 0 AND revenue_share_percentage <= 100),
    
    -- Timeline
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(course_id, instructor_id, role)
);

CREATE INDEX idx_course_instructors_course_id ON course_instructors(course_id);
CREATE INDEX idx_course_instructors_instructor_id ON course_instructors(instructor_id);
CREATE INDEX idx_course_instructors_role ON course_instructors(role);
CREATE INDEX idx_course_instructors_is_primary ON course_instructors(is_primary);

COMMENT ON TABLE course_instructors IS 'Junction table for many-to-many course-instructor relationships';

-- ============================================================================
-- INSTRUCTOR ANALYTICS TABLE
-- ============================================================================

CREATE TABLE instructor_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    
    -- Student metrics
    total_students INTEGER DEFAULT 0,
    new_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0, -- Students who accessed content
    completed_students INTEGER DEFAULT 0,
    
    -- Course metrics
    courses_taught INTEGER DEFAULT 0,
    lessons_delivered INTEGER DEFAULT 0,
    total_watch_minutes INTEGER DEFAULT 0,
    avg_completion_rate DECIMAL(5,2), -- Percentage
    
    -- Engagement
    total_discussions INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(8,2),
    
    -- Performance
    avg_student_rating DECIMAL(3,2), -- 0.00 to 5.00
    total_reviews INTEGER DEFAULT 0,
    certificates_issued INTEGER DEFAULT 0,
    
    -- Revenue (if applicable)
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Calculated fields
    student_satisfaction_score DECIMAL(5,2), -- Composite score
    teaching_effectiveness_score DECIMAL(5,2), -- Based on completion rates, ratings
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(instructor_id, period_start, period_end, period_type)
);

CREATE INDEX idx_instructor_analytics_instructor_id ON instructor_analytics(instructor_id);
CREATE INDEX idx_instructor_analytics_period ON instructor_analytics(period_start, period_end);
CREATE INDEX idx_instructor_analytics_period_type ON instructor_analytics(period_type);

COMMENT ON TABLE instructor_analytics IS 'Time-series analytics for instructor performance and metrics';

-- ============================================================================
-- INSTRUCTOR COMMUNICATIONS TABLE
-- ============================================================================

CREATE TABLE instructor_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    
    -- Communication details
    type communication_type NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    
    -- Recipients
    recipient_ids UUID[], -- Array of user IDs (profiles.id)
    recipient_filter JSONB, -- Dynamic filter for bulk messages, e.g., {enrolled_in: course_id, progress: >50%}
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    is_draft BOOLEAN DEFAULT FALSE,
    
    -- Delivery tracking
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    
    -- Metadata
    attachments JSONB DEFAULT '[]', -- Array of {filename, url, size}
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructor_comms_instructor_id ON instructor_communications(instructor_id);
CREATE INDEX idx_instructor_comms_course_id ON instructor_communications(course_id);
CREATE INDEX idx_instructor_comms_type ON instructor_communications(type);
CREATE INDEX idx_instructor_comms_scheduled_for ON instructor_communications(scheduled_for);
CREATE INDEX idx_instructor_comms_sent_at ON instructor_communications(sent_at);
CREATE INDEX idx_instructor_comms_is_draft ON instructor_communications(is_draft);

COMMENT ON TABLE instructor_communications IS 'Messages and announcements from instructors to students';

-- ============================================================================
-- INSTRUCTOR EARNINGS TABLE (Optional - for paid courses)
-- ============================================================================

CREATE TABLE instructor_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_date DATE NOT NULL,
    enrollment_id UUID, -- Optional reference to specific enrollment
    
    -- Amounts
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Payout status
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'cancelled')),
    payout_date DATE,
    payout_reference VARCHAR(200), -- External payment reference (Stripe, PayPal, etc.)
    
    -- Metadata
    revenue_share_percentage DECIMAL(5,2),
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instructor_earnings_instructor_id ON instructor_earnings(instructor_id);
CREATE INDEX idx_instructor_earnings_course_id ON instructor_earnings(course_id);
CREATE INDEX idx_instructor_earnings_transaction_date ON instructor_earnings(transaction_date DESC);
CREATE INDEX idx_instructor_earnings_payout_status ON instructor_earnings(payout_status);

COMMENT ON TABLE instructor_earnings IS 'Revenue and payout tracking for instructors';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Instructor dashboard summary
CREATE OR REPLACE VIEW instructor_dashboard_summary AS
SELECT 
    ip.id AS instructor_id,
    ip.user_id,
    p.full_name,
    p.email,
    ip.status,
    ip.headline,
    
    -- Course counts
    (SELECT COUNT(*) FROM course_instructors ci 
     WHERE ci.instructor_id = ip.id AND ci.is_active = TRUE) AS total_courses,
    (SELECT COUNT(*) FROM course_instructors ci 
     JOIN courses c ON ci.course_id = c.id
     WHERE ci.instructor_id = ip.id AND c.is_published = TRUE) AS published_courses,
    
    -- Student counts (across all courses)
    (SELECT COALESCE(SUM(c.enrollments_count), 0) 
     FROM course_instructors ci 
     JOIN courses c ON ci.course_id = c.id
     WHERE ci.instructor_id = ip.id) AS total_students,
    
    -- Ratings
    (SELECT COALESCE(AVG(c.average_rating), 0) 
     FROM course_instructors ci 
     JOIN courses c ON ci.course_id = c.id
     WHERE ci.instructor_id = ip.id AND c.average_rating IS NOT NULL) AS avg_course_rating,
    
    -- Revenue (if applicable)
    (SELECT COALESCE(SUM(net_amount), 0) 
     FROM instructor_earnings ie
     WHERE ie.instructor_id = ip.id AND ie.payout_status = 'paid') AS total_earnings_paid,
    (SELECT COALESCE(SUM(net_amount), 0) 
     FROM instructor_earnings ie
     WHERE ie.instructor_id = ip.id AND ie.payout_status = 'pending') AS total_earnings_pending,
    
    ip.created_at,
    ip.updated_at

FROM instructor_profiles ip
JOIN profiles p ON ip.user_id = p.id;

COMMENT ON VIEW instructor_dashboard_summary IS 'Quick overview of instructor performance metrics';

-- View: Active instructors
CREATE OR REPLACE VIEW active_instructors AS
SELECT 
    ip.id AS instructor_id,
    p.id AS user_id,
    p.full_name,
    p.email,
    ip.headline,
    ip.bio,
    ip.specializations,
    ip.years_of_experience,
    ip.profile_image_url,
    ip.is_featured,
    
    -- Stats
    (SELECT COUNT(*) FROM course_instructors ci 
     WHERE ci.instructor_id = ip.id AND ci.is_active = TRUE) AS active_courses_count,
    (SELECT COALESCE(SUM(c.enrollments_count), 0) 
     FROM course_instructors ci 
     JOIN courses c ON ci.course_id = c.id
     WHERE ci.instructor_id = ip.id) AS total_students,
    (SELECT COALESCE(AVG(c.average_rating), 0) 
     FROM course_instructors ci 
     JOIN courses c ON ci.course_id = c.id
     WHERE ci.instructor_id = ip.id) AS avg_rating
    
FROM instructor_profiles ip
JOIN profiles p ON ip.user_id = p.id
WHERE ip.status = 'active' AND ip.display_on_public_profile = TRUE;

COMMENT ON VIEW active_instructors IS 'Publicly visible active instructors with stats';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get instructor analytics summary
CREATE OR REPLACE FUNCTION get_instructor_analytics(
    p_instructor_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_students BIGINT,
    active_students BIGINT,
    completed_students BIGINT,
    total_courses BIGINT,
    avg_rating DECIMAL,
    total_reviews BIGINT,
    total_revenue DECIMAL,
    avg_completion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ia.total_students), 0)::BIGINT AS total_students,
        COALESCE(SUM(ia.active_students), 0)::BIGINT AS active_students,
        COALESCE(SUM(ia.completed_students), 0)::BIGINT AS completed_students,
        COALESCE(MAX(ia.courses_taught), 0)::BIGINT AS total_courses,
        COALESCE(AVG(ia.avg_student_rating), 0)::DECIMAL AS avg_rating,
        COALESCE(SUM(ia.total_reviews), 0)::BIGINT AS total_reviews,
        COALESCE(SUM(ia.total_revenue), 0)::DECIMAL AS total_revenue,
        COALESCE(AVG(ia.avg_completion_rate), 0)::DECIMAL AS avg_completion_rate
    FROM instructor_analytics ia
    WHERE ia.instructor_id = p_instructor_id
        AND (p_start_date IS NULL OR ia.period_start >= p_start_date)
        AND (p_end_date IS NULL OR ia.period_end <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Function: Get instructor courses with stats
CREATE OR REPLACE FUNCTION get_instructor_courses(p_instructor_id UUID)
RETURNS TABLE (
    course_id UUID,
    title VARCHAR,
    slug VARCHAR,
    status workflow_status,
    is_published BOOLEAN,
    role VARCHAR,
    enrollments INTEGER,
    completions INTEGER,
    avg_rating DECIMAL,
    total_reviews INTEGER,
    created_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS course_id,
        c.title,
        c.slug,
        c.workflow_status AS status,
        c.is_published,
        ci.role,
        c.enrollments_count AS enrollments,
        c.completions_count AS completions,
        c.average_rating AS avg_rating,
        c.total_reviews,
        c.created_at,
        c.published_at
    FROM course_instructors ci
    JOIN courses c ON ci.course_id = c.id
    WHERE ci.instructor_id = p_instructor_id
        AND ci.is_active = TRUE
        AND c.deleted_at IS NULL
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Send message to course students
CREATE OR REPLACE FUNCTION send_instructor_message(
    p_instructor_id UUID,
    p_course_id UUID,
    p_type communication_type,
    p_subject VARCHAR,
    p_message TEXT,
    p_recipient_filter JSONB DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message_id UUID,
    recipient_count INTEGER
) AS $$
DECLARE
    v_message_id UUID;
    v_recipient_count INTEGER;
    v_recipient_ids UUID[];
BEGIN
    -- Get recipients based on filter (e.g., all enrolled students)
    IF p_recipient_filter IS NOT NULL THEN
        -- Apply filter logic here (simplified example)
        SELECT ARRAY_AGG(user_id) INTO v_recipient_ids
        FROM enrollments
        WHERE course_id = p_course_id AND status = 'active';
    ELSE
        -- Default: all enrolled students
        SELECT ARRAY_AGG(user_id) INTO v_recipient_ids
        FROM enrollments
        WHERE course_id = p_course_id;
    END IF;
    
    v_recipient_count := COALESCE(array_length(v_recipient_ids, 1), 0);
    
    -- Create communication record
    INSERT INTO instructor_communications (
        instructor_id,
        course_id,
        type,
        subject,
        message,
        recipient_ids,
        recipient_filter,
        total_recipients,
        sent_at
    )
    VALUES (
        p_instructor_id,
        p_course_id,
        p_type,
        p_subject,
        p_message,
        v_recipient_ids,
        p_recipient_filter,
        v_recipient_count,
        NOW()
    )
    RETURNING id INTO v_message_id;
    
    -- Here you would trigger actual email/notification delivery
    -- For now, just return success
    
    RETURN QUERY SELECT TRUE, v_message_id, v_recipient_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate instructor teaching effectiveness score
CREATE OR REPLACE FUNCTION calculate_instructor_effectiveness(p_instructor_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_avg_completion_rate DECIMAL;
    v_avg_rating DECIMAL;
    v_response_quality DECIMAL;
    v_effectiveness_score DECIMAL;
BEGIN
    -- Get average completion rate across all courses
    SELECT COALESCE(AVG(
        CASE WHEN c.enrollments_count > 0 
        THEN (c.completions_count::DECIMAL / c.enrollments_count * 100)
        ELSE 0 END
    ), 0) INTO v_avg_completion_rate
    FROM course_instructors ci
    JOIN courses c ON ci.course_id = c.id
    WHERE ci.instructor_id = p_instructor_id AND c.is_published = TRUE;
    
    -- Get average student rating
    SELECT COALESCE(AVG(c.average_rating), 0) INTO v_avg_rating
    FROM course_instructors ci
    JOIN courses c ON ci.course_id = c.id
    WHERE ci.instructor_id = p_instructor_id AND c.average_rating IS NOT NULL;
    
    -- Get response quality (simplified: based on number of discussions answered)
    SELECT COALESCE(AVG(total_questions_answered), 0) INTO v_response_quality
    FROM instructor_analytics
    WHERE instructor_id = p_instructor_id;
    
    -- Calculate weighted effectiveness score (0-100)
    -- 40% completion rate, 40% rating, 20% engagement
    v_effectiveness_score := (
        (v_avg_completion_rate * 0.4) +
        ((v_avg_rating / 5.0 * 100) * 0.4) +
        (LEAST(v_response_quality / 10, 10) * 2 * 0.2) -- Cap at 10 questions answered = full score
    );
    
    RETURN ROUND(v_effectiveness_score, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_instructor_profiles_updated_at 
    BEFORE UPDATE ON instructor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructor_comms_updated_at 
    BEFORE UPDATE ON instructor_communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one primary instructor per course
CREATE OR REPLACE FUNCTION ensure_single_primary_instructor()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Set all other instructors for this course to not primary
        UPDATE course_instructors
        SET is_primary = FALSE
        WHERE course_id = NEW.course_id 
            AND id != COALESCE(NEW.id, gen_random_uuid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_instructor_trigger
    BEFORE INSERT OR UPDATE ON course_instructors
    FOR EACH ROW
    WHEN (NEW.is_primary = TRUE)
    EXECUTE FUNCTION ensure_single_primary_instructor();

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Create instructor profiles for existing course instructors
INSERT INTO instructor_profiles (
    user_id,
    bio,
    headline,
    status,
    specializations,
    display_on_public_profile
)
SELECT DISTINCT
    c.instructor_id,
    'Experienced professional in anti-racism and workplace equity.' AS bio,
    'Workplace Equity Specialist' AS headline,
    'active'::instructor_status,
    ARRAY['anti_racism', 'equity_diversity_inclusion']::instructor_specialization[],
    TRUE
FROM courses c
WHERE c.instructor_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM instructor_profiles ip WHERE ip.user_id = c.instructor_id
    )
ON CONFLICT (user_id) DO NOTHING;

-- Link existing courses to instructor profiles
INSERT INTO course_instructors (
    course_id,
    instructor_id,
    role,
    is_primary,
    is_active
)
SELECT 
    c.id AS course_id,
    ip.id AS instructor_id,
    'lead_instructor' AS role,
    TRUE AS is_primary,
    TRUE AS is_active
FROM courses c
JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM course_instructors ci 
    WHERE ci.course_id = c.id AND ci.instructor_id = ip.id
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TYPE instructor_status IS 'Instructor approval and active status';
COMMENT ON TYPE instructor_specialization IS 'Areas of expertise for instructors';
COMMENT ON TYPE communication_type IS 'Types of messages instructors can send to students';

COMMENT ON COLUMN instructor_profiles.bio IS 'Instructor biography and background';
COMMENT ON COLUMN instructor_profiles.headline IS 'Short professional tagline (e.g., "Senior HR Consultant")';
COMMENT ON COLUMN instructor_profiles.credentials IS 'Professional credentials and certifications';
COMMENT ON COLUMN instructor_profiles.teaching_philosophy IS 'Instructors teaching approach and philosophy';
