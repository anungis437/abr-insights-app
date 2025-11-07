-- Migration: 018_courses_enhancement_rls.sql
-- Description: Row Level Security policies for enhanced course tables
-- Created: 2025-11-07
-- Requires: 017_courses_enhancement_phase1.sql

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COURSE MODULES POLICIES
-- ============================================================================

-- Public can view published modules
CREATE POLICY "Public can view published modules" ON course_modules
    FOR SELECT USING (is_published = TRUE);

-- Enrolled users can view all modules (published or not) for enrolled courses
CREATE POLICY "Enrolled users can view all modules" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.course_id = course_modules.course_id
            AND e.user_id = auth.uid()
            AND e.status IN ('active', 'completed')
        )
    );

-- Instructors can manage their course modules
CREATE POLICY "Instructors can manage their modules" ON course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_modules.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admins can manage all modules
CREATE POLICY "Admins can manage all modules" ON course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'educator')
        )
    );

-- ============================================================================
-- LEARNING PATHS POLICIES
-- ============================================================================

-- Public can view published learning paths
CREATE POLICY "Public can view published learning paths" ON learning_paths
    FOR SELECT USING (is_published = TRUE);

-- Enrolled users can view their learning paths
CREATE POLICY "Enrolled users can view their paths" ON learning_paths
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM learning_path_enrollments lpe
            WHERE lpe.learning_path_id = learning_paths.id
            AND lpe.user_id = auth.uid()
        )
    );

-- Admins can manage all learning paths
CREATE POLICY "Admins can manage learning paths" ON learning_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'educator')
        )
    );

-- ============================================================================
-- COURSE VERSIONS POLICIES
-- ============================================================================

-- Instructors can view their course versions
CREATE POLICY "Instructors can view their course versions" ON course_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_versions.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admins can view all course versions
CREATE POLICY "Admins can view all course versions" ON course_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'educator')
        )
    );

-- Only admins and course instructors can create versions
CREATE POLICY "Instructors can create course versions" ON course_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_versions.course_id
            AND c.instructor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'educator')
        )
    );

-- ============================================================================
-- COURSE REVIEWS POLICIES
-- ============================================================================

-- Public can view published reviews
CREATE POLICY "Public can view published reviews" ON course_reviews
    FOR SELECT USING (is_published = TRUE);

-- Users can view their own reviews (even if unpublished)
CREATE POLICY "Users can view own reviews" ON course_reviews
    FOR SELECT USING (user_id = auth.uid());

-- Users can create reviews for courses they've enrolled in
CREATE POLICY "Users can create reviews for enrolled courses" ON course_reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE course_id = course_reviews.course_id
            AND user_id = auth.uid()
        )
    );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON course_reviews
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON course_reviews
    FOR DELETE USING (user_id = auth.uid());

-- Admins can moderate all reviews
CREATE POLICY "Admins can moderate reviews" ON course_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'compliance_officer')
        )
    );

-- ============================================================================
-- COURSE DISCUSSIONS POLICIES
-- ============================================================================

-- Public can view published discussions
CREATE POLICY "Public can view published discussions" ON course_discussions
    FOR SELECT USING (is_published = TRUE AND deleted_at IS NULL);

-- Enrolled users can view all discussions for their courses
CREATE POLICY "Enrolled users can view course discussions" ON course_discussions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.course_id = course_discussions.course_id
            AND e.user_id = auth.uid()
            AND e.status IN ('active', 'completed')
        )
    );

-- Enrolled users can create discussions
CREATE POLICY "Enrolled users can create discussions" ON course_discussions
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.course_id = course_discussions.course_id
            AND e.user_id = auth.uid()
            AND e.status IN ('active', 'completed')
        )
    );

-- Users can update their own discussions
CREATE POLICY "Users can update own discussions" ON course_discussions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own discussions
CREATE POLICY "Users can delete own discussions" ON course_discussions
    FOR DELETE USING (user_id = auth.uid());

-- Instructors can manage discussions in their courses
CREATE POLICY "Instructors can manage course discussions" ON course_discussions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_discussions.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admins can manage all discussions
CREATE POLICY "Admins can manage all discussions" ON course_discussions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'compliance_officer')
        )
    );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own enrollments (for free/accessible courses)
CREATE POLICY "Users can enroll in accessible courses" ON enrollments
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = enrollments.course_id
            AND c.is_published = TRUE
        )
    );

-- Users can update their own enrollments (limited fields)
CREATE POLICY "Users can update own enrollments" ON enrollments
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments" ON enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin')
        )
    );

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments" ON enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = enrollments.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- ============================================================================
-- LESSON PROGRESS POLICIES
-- ============================================================================

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON lesson_progress
    FOR SELECT USING (user_id = auth.uid());

-- Users can create/update their own progress
CREATE POLICY "Users can track own progress" ON lesson_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON lesson_progress
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Instructors can view progress for their courses
CREATE POLICY "Instructors can view course progress" ON lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN courses c ON c.id = l.course_id
            WHERE l.id = lesson_progress.lesson_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" ON lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'analyst')
        )
    );

-- ============================================================================
-- QUIZ ATTEMPTS POLICIES
-- ============================================================================

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own quiz attempts
CREATE POLICY "Users can submit quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM enrollments e
            JOIN quizzes q ON q.course_id = e.course_id
            WHERE q.id = quiz_attempts.quiz_id
            AND e.user_id = auth.uid()
            AND e.status IN ('active', 'completed')
        )
    );

-- Instructors can view attempts for their courses
CREATE POLICY "Instructors can view course quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes q
            JOIN courses c ON c.id = q.course_id
            WHERE q.id = quiz_attempts.quiz_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin', 'analyst')
        )
    );

-- ============================================================================
-- LEARNING PATH ENROLLMENTS POLICIES
-- ============================================================================

-- Users can view their own learning path enrollments
CREATE POLICY "Users can view own path enrollments" ON learning_path_enrollments
    FOR SELECT USING (user_id = auth.uid());

-- Users can enroll in published learning paths
CREATE POLICY "Users can enroll in published paths" ON learning_path_enrollments
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM learning_paths lp
            WHERE lp.id = learning_path_enrollments.learning_path_id
            AND lp.is_published = TRUE
        )
    );

-- Users can update their own enrollments
CREATE POLICY "Users can update own path enrollments" ON learning_path_enrollments
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can manage all learning path enrollments
CREATE POLICY "Admins can manage path enrollments" ON learning_path_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'org_admin')
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences (if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Public can view published modules" ON course_modules IS 'Anyone can view published course modules';
COMMENT ON POLICY "Enrolled users can view all modules" ON course_modules IS 'Enrolled students see all modules including drafts';
COMMENT ON POLICY "Users can view own enrollments" ON enrollments IS 'Users have full access to their enrollment data';
COMMENT ON POLICY "Users can track own progress" ON lesson_progress IS 'Users can record their own learning progress';
COMMENT ON POLICY "Users can submit quiz attempts" ON quiz_attempts IS 'Enrolled users can take quizzes';

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- This migration adds RLS policies for:
-- 1. ✅ course_modules - Public view published, enrolled view all, admins manage
-- 2. ✅ learning_paths - Public view published, admins manage
-- 3. ✅ course_versions - Instructors and admins only
-- 4. ✅ course_reviews - Public view, users manage own, admins moderate
-- 5. ✅ course_discussions - Public view, enrolled participate, admins moderate
-- 6. ✅ enrollments - Users manage own, admins manage all
-- 7. ✅ lesson_progress - Users track own, instructors/admins view
-- 8. ✅ quiz_attempts - Users submit own, instructors/admins view
-- 9. ✅ learning_path_enrollments - Users manage own, admins manage all
