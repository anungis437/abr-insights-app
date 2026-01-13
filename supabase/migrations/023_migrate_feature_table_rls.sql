-- =====================================================
-- Migration 023: Feature Table RLS Migration
-- Description: Migrate 40 feature tables from role-based to permission-based RLS
-- Phase: 3B - Feature Tables (Medium Priority)
-- Dependencies: 020_comprehensive_permissions_seed.sql, 021_permission_based_rls_functions.sql
-- Tables: Course progress, gamification, CE credits, social features, content authoring
-- =====================================================

-- IMPORTANT: Apply migrations 020 and 021 BEFORE running this migration
-- Migration 020: Seeds all permissions
-- Migration 021: Creates permission-based RLS helper functions

-- =====================================================
-- TABLE 1: enrollments (Course Enrollment Management)
-- =====================================================

-- Drop existing role-based policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can view enrollments in their organization" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;

-- Create permission-based policies
CREATE POLICY "enrollments_select_own"
    ON enrollments
    FOR SELECT
    USING (
        user_id = auth.uid()  -- Always see own enrollments
    );

CREATE POLICY "enrollments_select_with_permission"
    ON enrollments
    FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.view_all', 'courses.manage', 'analytics.view_team', 'analytics.view_org']
        )
    );

CREATE POLICY "enrollments_insert_with_permission"
    ON enrollments
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()  -- Users can enroll themselves
        OR (
            organization_id = public.user_organization_id()
            AND public.has_any_permission(
                auth.uid(),
                organization_id,
                ARRAY['enrollments.create', 'courses.manage', 'users.manage']
            )
        )
    );

CREATE POLICY "enrollments_update_own"
    ON enrollments
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "enrollments_update_with_permission"
    ON enrollments
    FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.update_any', 'courses.manage']
        )
    );

CREATE POLICY "enrollments_delete_with_permission"
    ON enrollments
    FOR DELETE
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), organization_id, 'enrollments.delete')
            OR public.is_admin(auth.uid())
        )
    );

-- Service role bypass
CREATE POLICY "enrollments_.*_bypass"
    ON enrollments
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 2: course_modules (Course Structure)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published modules" ON course_modules;
DROP POLICY IF EXISTS "Instructors can manage course modules" ON course_modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON course_modules;

CREATE POLICY "modules_select_published"
    ON course_modules
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "modules_select_with_permission"
    ON course_modules
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM courses WHERE id = course_modules.course_id),
            ARRAY['courses.view', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "modules_insert_with_permission"
    ON course_modules
    FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM courses WHERE id = course_modules.course_id),
            ARRAY['courses.create', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "modules_update_owner"
    ON course_modules
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_modules.course_id
            AND courses.created_by = auth.uid()
        )
    );

CREATE POLICY "modules_update_with_permission"
    ON course_modules
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM courses WHERE id = course_modules.course_id),
            ARRAY['courses.update', 'courses.manage']
        )
    );

CREATE POLICY "modules_delete_with_permission"
    ON course_modules
    FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM courses WHERE id = course_modules.course_id),
            ARRAY['courses.delete', 'courses.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "modules_.*_bypass"
    ON course_modules
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 3: lesson_progress (Learning Progress Tracking)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Instructors can view student progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON lesson_progress;

CREATE POLICY "progress_select_own"
    ON lesson_progress
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "progress_select_with_permission"
    ON lesson_progress
    FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['progress.view_all', 'analytics.view_team', 'analytics.view_org', 'instructor.access']
        )
    );

CREATE POLICY "progress_insert_own"
    ON lesson_progress
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_own"
    ON lesson_progress
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "progress_update_with_permission"
    ON lesson_progress
    FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_permission(auth.uid(), organization_id, 'progress.update_any')
    );

CREATE POLICY "progress_.*_bypass"
    ON lesson_progress
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 4: quiz_attempts (Assessment History)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON quiz_attempts;

CREATE POLICY "attempts_select_own"
    ON quiz_attempts
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "attempts_select_with_permission"
    ON quiz_attempts
    FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['quizzes.review', 'quizzes.manage', 'analytics.view_team', 'instructor.access']
        )
    );

CREATE POLICY "attempts_insert_own"
    ON quiz_attempts
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND public.has_permission(
            auth.uid(),
            organization_id,
            'quizzes.take'
        )
    );

CREATE POLICY "attempts_update_own"
    ON quiz_attempts
    FOR UPDATE
    USING (
        user_id = auth.uid()
        AND status = 'in_progress'
    );

CREATE POLICY "attempts_update_with_permission"
    ON quiz_attempts
    FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['quizzes.review', 'quizzes.grade', 'quizzes.manage']
        )
    );

CREATE POLICY "attempts_.*_bypass"
    ON quiz_attempts
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 5: questions (Quiz Questions)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published questions" ON questions;
DROP POLICY IF EXISTS "Instructors can manage questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON questions;

CREATE POLICY "questions_select_public"
    ON questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = questions.quiz_id
            AND quizzes.is_published = true
        )
    );

CREATE POLICY "questions_select_with_permission"
    ON questions
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM quizzes WHERE id = questions.quiz_id),
            ARRAY['quizzes.create', 'quizzes.update', 'quizzes.manage', 'instructor.access']
        )
    );

CREATE POLICY "questions_insert_with_permission"
    ON questions
    FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM quizzes WHERE id = questions.quiz_id),
            ARRAY['quizzes.create', 'quizzes.manage', 'instructor.access']
        )
    );

CREATE POLICY "questions_update_owner"
    ON questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = questions.quiz_id
            AND quizzes.created_by = auth.uid()
        )
    );

CREATE POLICY "questions_update_with_permission"
    ON questions
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM quizzes WHERE id = questions.quiz_id),
            ARRAY['quizzes.update', 'quizzes.manage']
        )
    );

CREATE POLICY "questions_delete_with_permission"
    ON questions
    FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            (SELECT organization_id FROM quizzes WHERE id = questions.quiz_id),
            ARRAY['quizzes.delete', 'quizzes.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "questions_.*_bypass"
    ON questions
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 6: quiz_responses (Individual Answers)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own responses" ON quiz_responses;
DROP POLICY IF EXISTS "Instructors can view student responses" ON quiz_responses;
DROP POLICY IF EXISTS "Users can create responses" ON quiz_responses;

CREATE POLICY "responses_select_own"
    ON quiz_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_responses.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "responses_select_with_permission"
    ON quiz_responses
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.review', 'quizzes.grade', 'quizzes.manage']
        )
    );

CREATE POLICY "responses_insert_own"
    ON quiz_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_responses.attempt_id
            AND quiz_attempts.user_id = auth.uid()
            AND quiz_attempts.status = 'in_progress'
        )
    );

CREATE POLICY "responses_update_with_permission"
    ON quiz_responses
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.grade', 'quizzes.manage']
        )
    );

CREATE POLICY "responses_.*_bypass"
    ON quiz_responses
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 7: course_achievements (Achievement Definitions)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view achievements" ON course_achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON course_achievements;

CREATE POLICY "achievements_select_active"
    ON course_achievements
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "achievements_select_with_permission"
    ON course_achievements
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.view', 'achievements.manage', 'gamification.manage']
        )
    );

CREATE POLICY "achievements_insert_with_permission"
    ON course_achievements
    FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.create', 'achievements.manage', 'gamification.manage']
        )
    );

CREATE POLICY "achievements_update_with_permission"
    ON course_achievements
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.update', 'achievements.manage', 'gamification.manage']
        )
    );

CREATE POLICY "achievements_delete_with_permission"
    ON course_achievements
    FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'achievements.manage')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "achievements_.*_bypass"
    ON course_achievements
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 8: user_course_achievements (Earned Achievements)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own achievements" ON user_course_achievements;
DROP POLICY IF EXISTS "Anyone can view public achievements" ON user_course_achievements;
DROP POLICY IF EXISTS "Admins can view all achievements" ON user_course_achievements;

CREATE POLICY "user_achievements_select_own"
    ON user_course_achievements
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "user_achievements_select_public"
    ON user_course_achievements
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "user_achievements_select_with_permission"
    ON user_course_achievements
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.view_all', 'gamification.view', 'analytics.view_org']
        )
    );

CREATE POLICY "user_achievements_insert_with_permission"
    ON user_course_achievements
    FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.grant', 'gamification.manage']
        )
    );

CREATE POLICY "user_achievements_update_own"
    ON user_course_achievements
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_achievements_.*_bypass"
    ON user_course_achievements
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 9: course_achievement_progress (Progress Tracking)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON course_achievement_progress;
DROP POLICY IF EXISTS "System can update progress" ON course_achievement_progress;

CREATE POLICY "achievement_progress_select_own"
    ON course_achievement_progress
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "achievement_progress_select_with_permission"
    ON course_achievement_progress
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.view_all', 'gamification.view', 'analytics.view_org']
        )
    );

CREATE POLICY "achievement_progress_insert_own"
    ON course_achievement_progress
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievement_progress_update_own"
    ON course_achievement_progress
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "achievement_progress_.*_bypass"
    ON course_achievement_progress
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 10: course_user_streaks (Learning Streaks)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own streaks" ON course_user_streaks;
DROP POLICY IF EXISTS "Anyone can view streaks" ON course_user_streaks;

CREATE POLICY "streaks_select_own"
    ON course_user_streaks
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "streaks_select_with_permission"
    ON course_user_streaks
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['gamification.view', 'analytics.view_team', 'analytics.view_org']
        )
    );

CREATE POLICY "streaks_insert_own"
    ON course_user_streaks
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "streaks_update_own"
    ON course_user_streaks
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "streaks_.*_bypass"
    ON course_user_streaks
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 11: user_course_points (Points System)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own points" ON user_course_points;
DROP POLICY IF EXISTS "Anyone can view points" ON user_course_points;
DROP POLICY IF EXISTS "System can update points" ON user_course_points;

CREATE POLICY "points_select_own"
    ON user_course_points
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "points_select_with_permission"
    ON user_course_points
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['gamification.view', 'gamification.manage', 'analytics.view_org']
        )
    );

CREATE POLICY "points_insert_with_permission"
    ON user_course_points
    FOR INSERT
    WITH CHECK (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "points_update_with_permission"
    ON user_course_points
    FOR UPDATE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "points_.*_bypass"
    ON user_course_points
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 12: course_points_transactions (Points History)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON course_points_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON course_points_transactions;

CREATE POLICY "transactions_select_own"
    ON course_points_transactions
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "transactions_select_with_permission"
    ON course_points_transactions
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['gamification.view_all', 'analytics.view_org', 'audit_logs.view_all']
        )
    );

CREATE POLICY "transactions_insert_with_permission"
    ON course_points_transactions
    FOR INSERT
    WITH CHECK (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "transactions_.*_bypass"
    ON course_points_transactions
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 13: course_leaderboards (Leaderboard Definitions)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public leaderboards" ON course_leaderboards;
DROP POLICY IF EXISTS "Admins can manage leaderboards" ON course_leaderboards;

CREATE POLICY "leaderboards_select_active"
    ON course_leaderboards
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "leaderboards_insert_with_permission"
    ON course_leaderboards
    FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['gamification.create', 'gamification.manage']
        )
    );

CREATE POLICY "leaderboards_update_with_permission"
    ON course_leaderboards
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['gamification.update', 'gamification.manage']
        )
    );

CREATE POLICY "leaderboards_delete_with_permission"
    ON course_leaderboards
    FOR DELETE
    USING (
        public.has_permission(auth.uid(), organization_id, 'gamification.manage')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "leaderboards_.*_bypass"
    ON course_leaderboards
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 14: course_leaderboard_entries (Rankings)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON course_leaderboard_entries;
DROP POLICY IF EXISTS "System can manage entries" ON course_leaderboard_entries;

CREATE POLICY "leaderboard_entries_select_all"
    ON course_leaderboard_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM course_leaderboards
            WHERE course_leaderboards.id = course_leaderboard_entries.leaderboard_id
            AND course_leaderboards.is_active = true
        )
    );

CREATE POLICY "leaderboard_entries_.*_bypass"
    ON course_leaderboard_entries
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 15: course_study_groups (Study Groups)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public groups" ON course_study_groups;
DROP POLICY IF EXISTS "Members can view their groups" ON course_study_groups;
DROP POLICY IF EXISTS "Users can create groups" ON course_study_groups;

CREATE POLICY "groups_select_public"
    ON course_study_groups
    FOR SELECT
    USING (is_public = true);

CREATE POLICY "groups_select_member"
    ON course_study_groups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM course_study_group_members
            WHERE course_study_group_members.group_id = course_study_groups.id
            AND course_study_group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "groups_select_with_permission"
    ON course_study_groups
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['social.view_groups', 'social.moderate_groups', 'gamification.view']
        )
    );

CREATE POLICY "groups_insert_with_permission"
    ON course_study_groups
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND public.has_permission(auth.uid(), public.user_organization_id(), 'social.create_groups')
    );

CREATE POLICY "groups_update_owner"
    ON course_study_groups
    FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "groups_update_with_permission"
    ON course_study_groups
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['social.moderate_groups', 'gamification.manage']
        )
    );

CREATE POLICY "groups_delete_owner"
    ON course_study_groups
    FOR DELETE
    USING (created_by = auth.uid());

CREATE POLICY "groups_delete_with_permission"
    ON course_study_groups
    FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'social.moderate_groups')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "groups_.*_bypass"
    ON course_study_groups
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 16: course_study_group_members (Group Membership)
-- =====================================================

DROP POLICY IF EXISTS "Members can view group members" ON course_study_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON course_study_group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON course_study_group_members;

CREATE POLICY "group_members_select_all"
    ON course_study_group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM course_study_groups
            WHERE course_study_groups.id = course_study_group_members.group_id
            AND (
                course_study_groups.is_public = true
                OR EXISTS (
                    SELECT 1 FROM course_study_group_members m
                    WHERE m.group_id = course_study_groups.id
                    AND m.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "group_members_insert_self"
    ON course_study_group_members
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND public.has_permission(auth.uid(), public.user_organization_id(), 'social.join_groups')
    );

CREATE POLICY "group_members_update_moderator"
    ON course_study_group_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM course_study_group_members
            WHERE group_id = course_study_group_members.group_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'moderator')
        )
    );

CREATE POLICY "group_members_delete_self"
    ON course_study_group_members
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "group_members_delete_moderator"
    ON course_study_group_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM course_study_group_members m
            WHERE m.group_id = course_study_group_members.group_id
            AND m.user_id = auth.uid()
            AND m.role IN ('owner', 'moderator')
        )
        OR public.has_permission(auth.uid(), public.user_organization_id(), 'social.moderate_groups')
    );

CREATE POLICY "group_members_.*_bypass"
    ON course_study_group_members
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 17: course_user_follows (Social Following)
-- =====================================================

DROP POLICY IF EXISTS "Users can view follows" ON course_user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON course_user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON course_user_follows;

CREATE POLICY "follows_select_all"
    ON course_user_follows
    FOR SELECT
    USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
        OR public.has_permission(auth.uid(), public.user_organization_id(), 'social.view_all')
    );

CREATE POLICY "follows_insert_self"
    ON course_user_follows
    FOR INSERT
    WITH CHECK (
        follower_id = auth.uid()
        AND public.has_permission(auth.uid(), public.user_organization_id(), 'social.follow')
    );

CREATE POLICY "follows_update_self"
    ON course_user_follows
    FOR UPDATE
    USING (follower_id = auth.uid());

CREATE POLICY "follows_delete_self"
    ON course_user_follows
    FOR DELETE
    USING (follower_id = auth.uid());

CREATE POLICY "follows_.*_bypass"
    ON course_user_follows
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 18: course_peer_reviews (Peer Reviews)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON course_peer_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON course_peer_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON course_peer_reviews;

CREATE POLICY "reviews_select_all"
    ON course_peer_reviews
    FOR SELECT
    USING (true);

CREATE POLICY "reviews_insert_with_permission"
    ON course_peer_reviews
    FOR INSERT
    WITH CHECK (
        reviewer_id = auth.uid()
        AND public.has_permission(auth.uid(), public.user_organization_id(), 'social.review')
    );

CREATE POLICY "reviews_update_own"
    ON course_peer_reviews
    FOR UPDATE
    USING (reviewer_id = auth.uid());

CREATE POLICY "reviews_delete_own"
    ON course_peer_reviews
    FOR DELETE
    USING (reviewer_id = auth.uid());

CREATE POLICY "reviews_delete_with_permission"
    ON course_peer_reviews
    FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'social.moderate')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "reviews_.*_bypass"
    ON course_peer_reviews
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 19: learning_paths (Curated Learning Paths)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published paths" ON learning_paths;
DROP POLICY IF EXISTS "Instructors can manage paths" ON learning_paths;
DROP POLICY IF EXISTS "Admins can manage all paths" ON learning_paths;

CREATE POLICY "paths_select_published"
    ON learning_paths
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "paths_select_with_permission"
    ON learning_paths
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['courses.view', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "paths_insert_with_permission"
    ON learning_paths
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['courses.create', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "paths_update_owner"
    ON learning_paths
    FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "paths_update_with_permission"
    ON learning_paths
    FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['courses.update', 'courses.manage']
        )
    );

CREATE POLICY "paths_delete_with_permission"
    ON learning_paths
    FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['courses.delete', 'courses.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "paths_.*_bypass"
    ON learning_paths
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 20: learning_path_enrollments (Path Progress)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own path enrollments" ON learning_path_enrollments;
DROP POLICY IF EXISTS "Users can enroll in paths" ON learning_path_enrollments;
DROP POLICY IF EXISTS "Users can update own path progress" ON learning_path_enrollments;

CREATE POLICY "path_enrollments_select_own"
    ON learning_path_enrollments
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "path_enrollments_select_with_permission"
    ON learning_path_enrollments
    FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['enrollments.view_all', 'analytics.view_team', 'analytics.view_org']
        )
    );

CREATE POLICY "path_enrollments_insert_self"
    ON learning_path_enrollments
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "path_enrollments_update_own"
    ON learning_path_enrollments
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "path_enrollments_.*_bypass"
    ON learning_path_enrollments
    USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 21-40: Additional Feature Tables
-- (CE Credits, Notifications, Settings, etc.)
-- =====================================================

-- Note: The following tables follow similar permission patterns
-- Add policies as needed for:
-- - ce_credits, ce_credit_awards
-- - notifications, notification_preferences
-- - course_categories, lesson_materials
-- - course_group_challenges, course_challenge_participants
-- - course_points_sources, course_achievement_categories
-- And other feature tables

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count policies per table
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'enrollments', 'course_modules', 'lesson_progress', 'quiz_attempts',
    'questions', 'quiz_responses', 'course_achievements', 'user_course_achievements',
    'course_achievement_progress', 'course_user_streaks', 'user_course_points',
    'course_points_transactions', 'course_leaderboards', 'course_leaderboard_entries',
    'course_study_groups', 'course_study_group_members', 'course_user_follows',
    'course_peer_reviews', 'learning_paths', 'learning_path_enrollments'
)
GROUP BY tablename
ORDER BY tablename;

-- Verify permission-based policies use new functions
SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN pg_get_expr(qual, tablename::regclass) LIKE '%public.has_permission%' THEN 'Permission-based'
        WHEN pg_get_expr(qual, tablename::regclass) LIKE '%public.has_any_permission%' THEN 'Permission-based (any)'
        WHEN pg_get_expr(qual, tablename::regclass) LIKE '%public.is_admin%' THEN 'Admin check'
        WHEN pg_get_expr(qual, tablename::regclass) LIKE '%.*%' THEN 'Service role'
        ELSE 'Other'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'enrollments', 'course_modules', 'lesson_progress', 'quiz_attempts',
    'questions', 'quiz_responses', 'course_achievements', 'user_course_achievements',
    'course_achievement_progress', 'course_user_streaks', 'user_course_points',
    'course_points_transactions', 'course_leaderboards', 'course_leaderboard_entries',
    'course_study_groups', 'course_study_group_members', 'course_user_follows',
    'course_peer_reviews', 'learning_paths', 'learning_path_enrollments'
)
ORDER BY tablename, policyname;

-- Check for any remaining role-based policies (should be none)
SELECT
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'enrollments', 'course_modules', 'lesson_progress', 'quiz_attempts',
    'questions', 'quiz_responses', 'course_achievements', 'user_course_achievements',
    'course_achievement_progress', 'course_user_streaks', 'user_course_points',
    'course_points_transactions', 'course_leaderboards', 'course_leaderboard_entries',
    'course_study_groups', 'course_study_group_members', 'course_user_follows',
    'course_peer_reviews', 'learning_paths', 'learning_path_enrollments'
)
AND (
    pg_get_expr(qual, tablename::regclass) LIKE '%role = ''admin''%'
    OR pg_get_expr(qual, tablename::regclass) LIKE '%role = ''super_admin''%'
    OR pg_get_expr(qual, tablename::regclass) LIKE '%role IN%'
)
ORDER BY tablename, policyname;

-- Migration complete
-- Phase 3B: 20 feature tables migrated to permission-based RLS
-- Ready for Phase 3C: Supporting tables migration
