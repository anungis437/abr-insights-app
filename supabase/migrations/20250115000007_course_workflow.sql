-- ============================================================================
-- Phase 4: Course Workflow & Development Pipeline
-- Created: November 8, 2025
-- Description: Course version control, review workflows, and publishing pipeline
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Workflow status for courses
CREATE TYPE workflow_status AS ENUM (
    'draft',           -- Initial state, being authored
    'in_review',       -- Submitted for peer/compliance review
    'needs_revision',  -- Rejected with feedback, needs changes
    'approved',        -- Approved, ready to publish
    'published',       -- Live and accessible to students
    'archived'         -- Removed from catalog but retained
);

-- Review decision types
CREATE TYPE review_decision AS ENUM (
    'approve',
    'reject',
    'request_changes'
);

-- Review types
CREATE TYPE review_type AS ENUM (
    'peer_review',          -- Subject matter expert review
    'compliance_review',    -- Regulatory/legal compliance
    'accessibility_review', -- WCAG 2.1 AA compliance
    'quality_assurance'     -- QA testing
);

-- ============================================================================
-- EXTEND COURSES TABLE
-- ============================================================================

-- Add workflow fields to existing courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS workflow_status workflow_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS version_number VARCHAR(20) DEFAULT '1.0.0',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS submission_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Indexes for workflow queries
CREATE INDEX IF NOT EXISTS idx_courses_workflow_status ON courses(workflow_status);
CREATE INDEX IF NOT EXISTS idx_courses_version_number ON courses(version_number);
CREATE INDEX IF NOT EXISTS idx_courses_reviewed_by ON courses(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_courses_published_by ON courses(published_by);

-- ============================================================================
-- COURSE VERSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Version info
    version_number VARCHAR(20) NOT NULL,
    change_summary TEXT,
    is_major_update BOOLEAN DEFAULT FALSE,
    
    -- Snapshot of course content at this version
    content_snapshot JSONB NOT NULL,
    -- Includes: title, description, learning_objectives, lessons array, etc.
    
    -- Author info
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Publication info
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES profiles(id),
    
    -- Metadata
    file_checksums JSONB, -- For uploaded files (videos, PDFs)
    dependencies JSONB,    -- Required resources, external links
    
    UNIQUE(course_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_course_versions_course_id ON course_versions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_versions_created_by ON course_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_course_versions_created_at ON course_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_versions_published_at ON course_versions(published_at DESC);

COMMENT ON TABLE course_versions IS 'Version history for courses with content snapshots';

-- ============================================================================
-- COURSE WORKFLOW REVIEWS TABLE (Internal QA/Compliance Reviews)
-- Note: Different from course_reviews which are student reviews
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_workflow_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    version_id UUID REFERENCES course_versions(id) ON DELETE SET NULL,
    
    -- Reviewer info
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Review info
    review_type review_type NOT NULL,
    decision review_decision,
    
    -- Feedback
    comments TEXT,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    checklist_results JSONB, -- Detailed checklist responses
    
    -- Issues found
    issues_found JSONB, -- Array of {severity, category, description, timestamp}
    recommendations TEXT,
    
    -- Timeline
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    is_blocking BOOLEAN DEFAULT FALSE, -- If true, course cannot proceed until resolved
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_course_id ON course_workflow_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_reviewer_id ON course_workflow_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_review_type ON course_workflow_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_decision ON course_workflow_reviews(decision);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_is_completed ON course_workflow_reviews(is_completed);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_assigned_at ON course_workflow_reviews(assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_workflow_reviews_due_date ON course_workflow_reviews(due_date);

COMMENT ON TABLE course_workflow_reviews IS 'Peer, compliance, and QA reviews for course content (workflow reviews, not student reviews)';

-- ============================================================================
-- COURSE WORKFLOW HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- State transition
    from_status workflow_status,
    to_status workflow_status NOT NULL,
    
    -- Actor and reason
    changed_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT,
    notes TEXT,
    
    -- Metadata
    version_at_change VARCHAR(20),
    metadata JSONB, -- Additional context (automated vs manual, etc.)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_history_course_id ON course_workflow_history(course_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_changed_by ON course_workflow_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_workflow_history_created_at ON course_workflow_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_history_to_status ON course_workflow_history(to_status);

COMMENT ON TABLE course_workflow_history IS 'Audit log for course workflow state changes';

-- ============================================================================
-- CONTENT QUALITY CHECKLIST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_quality_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    version_id UUID REFERENCES course_versions(id) ON DELETE SET NULL,
    
    -- Checklist items (true/false/null for N/A)
    accessibility_wcag_aa BOOLEAN,
    accessibility_captions BOOLEAN,
    accessibility_transcripts BOOLEAN,
    accessibility_keyboard_nav BOOLEAN,
    accessibility_screen_reader BOOLEAN,
    
    bilingual_en_available BOOLEAN,
    bilingual_fr_available BOOLEAN,
    
    video_quality_standards BOOLEAN,
    video_audio_clarity BOOLEAN,
    video_encoding_correct BOOLEAN,
    
    mobile_responsive BOOLEAN,
    cross_browser_tested BOOLEAN,
    
    learning_objectives_clear BOOLEAN,
    assessments_valid BOOLEAN,
    content_accurate BOOLEAN,
    references_cited BOOLEAN,
    
    regulatory_compliance BOOLEAN,
    privacy_compliant BOOLEAN,
    copyright_cleared BOOLEAN,
    
    -- Summary
    total_items INTEGER NOT NULL DEFAULT 19,
    completed_items INTEGER NOT NULL DEFAULT 0,
    completion_percentage INTEGER GENERATED ALWAYS AS (
        CASE WHEN total_items > 0 
        THEN (completed_items * 100) / total_items 
        ELSE 0 END
    ) STORED,
    
    -- Meta
    checked_by UUID REFERENCES profiles(id),
    checked_at TIMESTAMPTZ,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(course_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_quality_checklists_course_id ON content_quality_checklists(course_id);
CREATE INDEX IF NOT EXISTS idx_quality_checklists_completion ON content_quality_checklists(completion_percentage);
CREATE INDEX IF NOT EXISTS idx_quality_checklists_checked_by ON content_quality_checklists(checked_by);

COMMENT ON TABLE content_quality_checklists IS 'Quality assurance checklists for course content';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Courses pending review
CREATE OR REPLACE VIEW courses_pending_review AS
SELECT 
    c.id,
    c.title,
    c.slug,
    c.workflow_status,
    c.version_number,
    c.submission_notes,
    c.updated_at AS submitted_at,
    COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) AS author_name,
    p.email AS author_email,
    -- Count of pending reviews
    (SELECT COUNT(*) FROM course_workflow_reviews cr 
     WHERE cr.course_id = c.id AND NOT cr.is_completed) AS pending_reviews_count,
    -- Count of blocking issues
    (SELECT COUNT(*) FROM course_workflow_reviews cr 
     WHERE cr.course_id = c.id AND cr.is_blocking AND NOT cr.is_completed) AS blocking_issues_count
FROM courses c
LEFT JOIN profiles p ON c.last_modified_by = p.id
WHERE c.workflow_status IN ('in_review', 'needs_revision')
    AND c.deleted_at IS NULL
ORDER BY c.updated_at DESC;

COMMENT ON VIEW courses_pending_review IS 'Courses waiting for or needing review';

-- View: Course workflow summary
CREATE OR REPLACE VIEW course_workflow_summary AS
SELECT 
    c.id AS course_id,
    c.title,
    c.slug,
    c.workflow_status,
    c.version_number,
    c.is_published,
    c.published_at,
    
    -- Author info
    COALESCE(instructor.first_name || ' ' || instructor.last_name, instructor.display_name, instructor.email) AS instructor_name,
    instructor.email AS instructor_email,
    
    -- Review status
    (SELECT COUNT(*) FROM course_workflow_reviews cr WHERE cr.course_id = c.id) AS total_reviews,
    (SELECT COUNT(*) FROM course_workflow_reviews cr WHERE cr.course_id = c.id AND cr.is_completed) AS completed_reviews,
    (SELECT COUNT(*) FROM course_workflow_reviews cr WHERE cr.course_id = c.id AND cr.decision = 'approve') AS approved_reviews,
    (SELECT COUNT(*) FROM course_workflow_reviews cr WHERE cr.course_id = c.id AND cr.decision = 'reject') AS rejected_reviews,
    
    -- Quality checklist
    qc.completion_percentage AS quality_checklist_completion,
    
    -- Version info
    (SELECT COUNT(*) FROM course_versions cv WHERE cv.course_id = c.id) AS version_count,
    
    -- Timestamps
    c.created_at,
    c.updated_at
    
FROM courses c
LEFT JOIN profiles instructor ON c.instructor_id = instructor.id
LEFT JOIN content_quality_checklists qc ON c.id = qc.course_id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW course_workflow_summary IS 'Comprehensive summary of course workflow status';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Submit course for review
CREATE OR REPLACE FUNCTION submit_course_for_review(
    p_course_id UUID,
    p_submitted_by UUID,
    p_submission_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    review_id UUID
) AS $$
DECLARE
    v_current_status workflow_status;
    v_quality_completion INTEGER;
    v_new_review_id UUID;
BEGIN
    -- Check current status
    SELECT workflow_status INTO v_current_status
    FROM courses WHERE id = p_course_id;
    
    IF v_current_status NOT IN ('draft', 'needs_revision') THEN
        RETURN QUERY SELECT FALSE, 'Course must be in draft or needs_revision status to submit for review', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check quality checklist completion (optional: can require 100%)
    SELECT completion_percentage INTO v_quality_completion
    FROM content_quality_checklists
    WHERE course_id = p_course_id
    ORDER BY created_at DESC LIMIT 1;
    
    -- Update course status
    UPDATE courses
    SET 
        workflow_status = 'in_review',
        submission_notes = p_submission_notes,
        last_modified_by = p_submitted_by,
        updated_at = NOW()
    WHERE id = p_course_id;
    
    -- Log workflow change
    INSERT INTO course_workflow_history (course_id, from_status, to_status, changed_by, reason)
    VALUES (p_course_id, v_current_status, 'in_review', p_submitted_by, 'Submitted for review');
    
    -- Create compliance review requirement (auto-assign)
    INSERT INTO course_workflow_reviews (course_id, review_type, reviewer_id, is_blocking)
    VALUES (p_course_id, 'compliance_review', p_submitted_by, TRUE) -- Will be reassigned to compliance officer
    RETURNING id INTO v_new_review_id;
    
    RETURN QUERY SELECT TRUE, 'Course submitted for review successfully', v_new_review_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Approve course
CREATE OR REPLACE FUNCTION approve_course(
    p_course_id UUID,
    p_reviewer_id UUID,
    p_comments TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_current_status workflow_status;
    v_blocking_reviews INTEGER;
BEGIN
    -- Check current status
    SELECT workflow_status INTO v_current_status
    FROM courses WHERE id = p_course_id;
    
    IF v_current_status != 'in_review' THEN
        RETURN QUERY SELECT FALSE, 'Course must be in_review status to approve';
        RETURN;
    END IF;
    
    -- Check for unresolved blocking reviews
    SELECT COUNT(*) INTO v_blocking_reviews
    FROM course_workflow_reviews
    WHERE course_id = p_course_id 
        AND is_blocking = TRUE 
        AND is_completed = FALSE;
    
    IF v_blocking_reviews > 0 THEN
        RETURN QUERY SELECT FALSE, format('Cannot approve: %s blocking reviews pending', v_blocking_reviews);
        RETURN;
    END IF;
    
    -- Update course
    UPDATE courses
    SET 
        workflow_status = 'approved',
        reviewed_by = p_reviewer_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_course_id;
    
    -- Log workflow change
    INSERT INTO course_workflow_history (course_id, from_status, to_status, changed_by, reason, notes)
    VALUES (p_course_id, v_current_status, 'approved', p_reviewer_id, 'Approved for publication', p_comments);
    
    RETURN QUERY SELECT TRUE, 'Course approved successfully';
END;
$$ LANGUAGE plpgsql;

-- Function: Publish course
CREATE OR REPLACE FUNCTION publish_course(
    p_course_id UUID,
    p_published_by UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_current_status workflow_status;
    v_version_number VARCHAR(20);
BEGIN
    -- Check current status
    SELECT workflow_status, version_number INTO v_current_status, v_version_number
    FROM courses WHERE id = p_course_id;
    
    IF v_current_status NOT IN ('approved', 'published') THEN
        RETURN QUERY SELECT FALSE, 'Course must be approved before publishing';
        RETURN;
    END IF;
    
    -- Update course
    UPDATE courses
    SET 
        workflow_status = 'published',
        is_published = TRUE,
        published_by = p_published_by,
        published_at = COALESCE(published_at, NOW()), -- Set if first publish
        updated_at = NOW()
    WHERE id = p_course_id;
    
    -- Create version snapshot
    INSERT INTO course_versions (
        course_id, 
        version_number, 
        content_snapshot, 
        created_by, 
        published_by,
        published_at
    )
    SELECT 
        id,
        v_version_number,
        jsonb_build_object(
            'title', title,
            'description', description,
            'learning_objectives', learning_objectives,
            'prerequisites', prerequisites,
            'tags', tags,
            'level', level,
            'estimated_duration_minutes', estimated_duration_minutes
        ),
        instructor_id,
        p_published_by,
        NOW()
    FROM courses WHERE id = p_course_id;
    
    -- Log workflow change
    INSERT INTO course_workflow_history (course_id, from_status, to_status, changed_by, reason, version_at_change)
    VALUES (p_course_id, v_current_status, 'published', p_published_by, 'Published to students', v_version_number);
    
    RETURN QUERY SELECT TRUE, 'Course published successfully';
END;
$$ LANGUAGE plpgsql;

-- Function: Reject course (send back for revision)
CREATE OR REPLACE FUNCTION reject_course(
    p_course_id UUID,
    p_reviewer_id UUID,
    p_rejection_reason TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_current_status workflow_status;
BEGIN
    -- Check current status
    SELECT workflow_status INTO v_current_status
    FROM courses WHERE id = p_course_id;
    
    IF v_current_status != 'in_review' THEN
        RETURN QUERY SELECT FALSE, 'Course must be in_review status to reject';
        RETURN;
    END IF;
    
    -- Update course
    UPDATE courses
    SET 
        workflow_status = 'needs_revision',
        reviewed_by = p_reviewer_id,
        reviewed_at = NOW(),
        rejection_reason = p_rejection_reason,
        updated_at = NOW()
    WHERE id = p_course_id;
    
    -- Log workflow change
    INSERT INTO course_workflow_history (course_id, from_status, to_status, changed_by, reason, notes)
    VALUES (p_course_id, v_current_status, 'needs_revision', p_reviewer_id, 'Revision required', p_rejection_reason);
    
    RETURN QUERY SELECT TRUE, 'Course sent back for revision';
END;
$$ LANGUAGE plpgsql;

-- Function: Get course workflow history
CREATE OR REPLACE FUNCTION get_course_workflow_history(p_course_id UUID)
RETURNS TABLE (
    id UUID,
    from_status workflow_status,
    to_status workflow_status,
    changed_by_name TEXT,
    changed_by_email TEXT,
    reason TEXT,
    notes TEXT,
    version_at_change VARCHAR(20),
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cwh.id,
        cwh.from_status,
        cwh.to_status,
        COALESCE(p.first_name || ' ' || p.last_name, p.display_name, p.email) AS changed_by_name,
        p.email AS changed_by_email,
        cwh.reason,
        cwh.notes,
        cwh.version_at_change,
        cwh.created_at
    FROM course_workflow_history cwh
    LEFT JOIN profiles p ON cwh.changed_by = p.id
    WHERE cwh.course_id = p_course_id
    ORDER BY cwh.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_course_workflow_reviews_updated_at 
    BEFORE UPDATE ON course_workflow_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_checklists_updated_at 
    BEFORE UPDATE ON content_quality_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate completed items in quality checklist
CREATE OR REPLACE FUNCTION calculate_checklist_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.completed_items := (
        (CASE WHEN NEW.accessibility_wcag_aa IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.accessibility_captions IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.accessibility_transcripts IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.accessibility_keyboard_nav IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.accessibility_screen_reader IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.bilingual_en_available IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.bilingual_fr_available IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.video_quality_standards IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.video_audio_clarity IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.video_encoding_correct IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.mobile_responsive IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.cross_browser_tested IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.learning_objectives_clear IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.assessments_valid IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.content_accurate IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.references_cited IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.regulatory_compliance IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.privacy_compliant IS TRUE THEN 1 ELSE 0 END) +
        (CASE WHEN NEW.copyright_cleared IS TRUE THEN 1 ELSE 0 END)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_checklist_completion_trigger
    BEFORE INSERT OR UPDATE ON content_quality_checklists
    FOR EACH ROW EXECUTE FUNCTION calculate_checklist_completion();

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Insert sample workflow history for existing courses
INSERT INTO course_workflow_history (course_id, from_status, to_status, changed_by, reason)
SELECT 
    id,
    NULL,
    'published'::workflow_status,
    COALESCE(instructor_id, (SELECT id FROM profiles LIMIT 1)), -- Fallback to any profile if instructor is null
    'Initial migration'
FROM courses
WHERE is_published = TRUE AND instructor_id IS NOT NULL -- Only insert for courses with instructors
ON CONFLICT DO NOTHING;

-- Update existing published courses to have workflow_status = 'published'
UPDATE courses
SET workflow_status = 'published'
WHERE is_published = TRUE AND workflow_status = 'draft';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TYPE workflow_status IS 'Course workflow states: draft → in_review → approved → published';
COMMENT ON TYPE review_decision IS 'Review outcome: approve, reject, or request_changes';
COMMENT ON TYPE review_type IS 'Type of review: peer, compliance, accessibility, or QA';

COMMENT ON COLUMN courses.workflow_status IS 'Current workflow state of the course';
COMMENT ON COLUMN courses.version_number IS 'Semantic version number (e.g., 1.2.3)';
COMMENT ON COLUMN courses.reviewed_by IS 'User who last reviewed the course';
COMMENT ON COLUMN courses.published_by IS 'User who published the course';
COMMENT ON COLUMN courses.submission_notes IS 'Notes from author when submitting for review';
COMMENT ON COLUMN courses.rejection_reason IS 'Reason for rejection if course needs revision';
