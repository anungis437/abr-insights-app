-- =====================================================
-- Migration 023: Feature Table RLS Migration (FIXED)
-- Description: Migrate 20 feature tables from role-based to permission-based RLS
-- Phase: 3B - Feature Tables (Medium Priority)
-- Dependencies: 020_comprehensive_permissions_seed.sql, 021_permission_based_rls_functions.sql
-- Tables: Course progress, gamification, CE credits, social features, content authoring
-- NOTE: Fixed to match actual schema - many tables don't have organization_id
-- =====================================================

-- IMPORTANT: Apply migrations 020 and 021 BEFORE running this migration
-- Migration 020: Seeds all permissions
-- Migration 021: Creates permission-based RLS helper functions

-- =====================================================
-- TABLE 1: enrollments (Course Enrollment Management)
-- HAS: organization_id
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can view enrollments in their organization" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "enrollments_select_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_select_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_delete_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_.*_bypass" ON enrollments;

-- Create permission-based policies
CREATE POLICY "enrollments_select_own"
    ON enrollments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "enrollments_select_with_permission"
    ON enrollments FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.view_all', 'courses.manage', 'analytics.view_team']
        )
    );

CREATE POLICY "enrollments_insert_self"
    ON enrollments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "enrollments_insert_with_permission"
    ON enrollments FOR INSERT
    WITH CHECK (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.create', 'courses.manage', 'users.manage']
        )
    );

CREATE POLICY "enrollments_update_own"
    ON enrollments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "enrollments_update_with_permission"
    ON enrollments FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.update_any', 'courses.manage']
        )
    );

CREATE POLICY "enrollments_delete_with_permission"
    ON enrollments FOR DELETE
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), organization_id, 'enrollments.delete')
            OR public.is_admin(auth.uid())
        )
    );

CREATE POLICY "enrollments_.*_bypass"
    ON enrollments USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 2: course_modules (Course Structure)  
-- NO organization_id - must check via courses table
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published modules" ON course_modules;
DROP POLICY IF EXISTS "Instructors can manage course modules" ON course_modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON course_modules;
DROP POLICY IF EXISTS "modules_select_published" ON course_modules;
DROP POLICY IF EXISTS "modules_select_with_permission" ON course_modules;
DROP POLICY IF EXISTS "modules_insert_with_permission" ON course_modules;
DROP POLICY IF EXISTS "modules_update_owner" ON course_modules;
DROP POLICY IF EXISTS "modules_update_with_permission" ON course_modules;
DROP POLICY IF EXISTS "modules_delete_with_permission" ON course_modules;
DROP POLICY IF EXISTS "modules_.*_bypass" ON course_modules;

CREATE POLICY "modules_select_all"
    ON course_modules FOR SELECT
    USING (true);  -- All authenticated users can view modules

CREATE POLICY "modules_insert_with_permission"
    ON course_modules FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.create', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "modules_update_with_permission"
    ON course_modules FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_modules.course_id
            AND courses.instructor_id = auth.uid()
        )
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.update', 'courses.manage']
        )
    );

CREATE POLICY "modules_delete_with_permission"
    ON course_modules FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.delete', 'courses.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "modules_.*_bypass"
    ON course_modules USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 3: lesson_progress (Learning Progress Tracking)
-- NO organization_id - get from enrollment
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Instructors can view student progress" ON lesson_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can create own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON lesson_progress;
DROP POLICY IF EXISTS "progress_select_own" ON lesson_progress;
DROP POLICY IF EXISTS "progress_select_with_permission" ON lesson_progress;
DROP POLICY IF EXISTS "progress_insert_own" ON lesson_progress;
DROP POLICY IF EXISTS "progress_update_own" ON lesson_progress;
DROP POLICY IF EXISTS "progress_update_with_permission" ON lesson_progress;
DROP POLICY IF EXISTS "progress_.*_bypass" ON lesson_progress;

CREATE POLICY "progress_select_own"
    ON lesson_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "progress_select_with_permission"
    ON lesson_progress FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['progress.view_all', 'analytics.view_team', 'instructor.access']
        )
    );

CREATE POLICY "progress_insert_own"
    ON lesson_progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_own"
    ON lesson_progress FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "progress_.*_bypass"
    ON lesson_progress USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 4: quiz_attempts (Assessment History)
-- NO organization_id - get from enrollment
-- =====================================================

DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_select_own" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_select_with_permission" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_insert_own" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_update_own" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_update_with_permission" ON quiz_attempts;
DROP POLICY IF EXISTS "attempts_.*_bypass" ON quiz_attempts;

CREATE POLICY "attempts_select_own"
    ON quiz_attempts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "attempts_select_with_permission"
    ON quiz_attempts FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.review', 'quizzes.manage', 'analytics.view_team', 'instructor.access']
        )
    );

CREATE POLICY "attempts_insert_own"
    ON quiz_attempts FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND public.has_permission(
            auth.uid(),
            public.user_organization_id(),
            'quizzes.take'
        )
    );

CREATE POLICY "attempts_update_own"
    ON quiz_attempts FOR UPDATE
    USING (
        user_id = auth.uid()
        AND status = 'in_progress'
    );

CREATE POLICY "attempts_.*_bypass"
    ON quiz_attempts USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 5: questions (Quiz Questions)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published questions" ON questions;
DROP POLICY IF EXISTS "Instructors can manage questions" ON questions;
DROP POLICY IF EXISTS "Admins can manage all questions" ON questions;
DROP POLICY IF EXISTS "questions_select_public" ON questions;
DROP POLICY IF EXISTS "questions_select_with_permission" ON questions;
DROP POLICY IF EXISTS "questions_insert_with_permission" ON questions;
DROP POLICY IF EXISTS "questions_update_owner" ON questions;
DROP POLICY IF EXISTS "questions_update_with_permission" ON questions;
DROP POLICY IF EXISTS "questions_delete_with_permission" ON questions;
DROP POLICY IF EXISTS "questions_.*_bypass" ON questions;

CREATE POLICY "questions_select_all"
    ON questions FOR SELECT
    USING (true);  -- All authenticated users can view questions

CREATE POLICY "questions_insert_with_permission"
    ON questions FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.create', 'quizzes.manage', 'instructor.access']
        )
    );

CREATE POLICY "questions_update_with_permission"
    ON questions FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.update', 'quizzes.manage']
        )
    );

CREATE POLICY "questions_delete_with_permission"
    ON questions FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.delete', 'quizzes.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "questions_.*_bypass"
    ON questions USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 6: quiz_responses (Individual Answers)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own responses" ON quiz_responses;
DROP POLICY IF EXISTS "Instructors can view student responses" ON quiz_responses;
DROP POLICY IF EXISTS "Users can create responses" ON quiz_responses;
DROP POLICY IF EXISTS "responses_select_own" ON quiz_responses;
DROP POLICY IF EXISTS "responses_select_with_permission" ON quiz_responses;
DROP POLICY IF EXISTS "responses_insert_own" ON quiz_responses;
DROP POLICY IF EXISTS "responses_update_with_permission" ON quiz_responses;
DROP POLICY IF EXISTS "responses_.*_bypass" ON quiz_responses;

CREATE POLICY "responses_select_own"
    ON quiz_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_responses.attempt_id
            AND quiz_attempts.user_id = auth.uid()
        )
    );

CREATE POLICY "responses_select_with_permission"
    ON quiz_responses FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['quizzes.review', 'quizzes.grade', 'quizzes.manage']
        )
    );

CREATE POLICY "responses_insert_own"
    ON quiz_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_attempts
            WHERE quiz_attempts.id = quiz_responses.attempt_id
            AND quiz_attempts.user_id = auth.uid()
            AND quiz_attempts.status = 'in_progress'
        )
    );

CREATE POLICY "responses_.*_bypass"
    ON quiz_responses USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 7: course_achievements (Achievement Definitions)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view achievements" ON course_achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON course_achievements;
DROP POLICY IF EXISTS "achievements_select_active" ON course_achievements;
DROP POLICY IF EXISTS "achievements_select_with_permission" ON course_achievements;
DROP POLICY IF EXISTS "achievements_insert_with_permission" ON course_achievements;
DROP POLICY IF EXISTS "achievements_update_with_permission" ON course_achievements;
DROP POLICY IF EXISTS "achievements_delete_with_permission" ON course_achievements;
DROP POLICY IF EXISTS "achievements_.*_bypass" ON course_achievements;

CREATE POLICY "achievements_select_active"
    ON course_achievements FOR SELECT
    USING (is_active = true);

CREATE POLICY "achievements_insert_with_permission"
    ON course_achievements FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.create', 'achievements.manage', 'gamification.manage']
        )
    );

CREATE POLICY "achievements_update_with_permission"
    ON course_achievements FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.update', 'achievements.manage', 'gamification.manage']
        )
    );

CREATE POLICY "achievements_delete_with_permission"
    ON course_achievements FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'achievements.manage')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "achievements_.*_bypass"
    ON course_achievements USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 8: user_course_achievements (Earned Achievements)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own achievements" ON user_course_achievements;
DROP POLICY IF EXISTS "Anyone can view public achievements" ON user_course_achievements;
DROP POLICY IF EXISTS "Admins can view all achievements" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_select_own" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_select_public" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_select_with_permission" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_insert_with_permission" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_update_own" ON user_course_achievements;
DROP POLICY IF EXISTS "user_achievements_.*_bypass" ON user_course_achievements;

CREATE POLICY "user_achievements_select_own"
    ON user_course_achievements FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "user_achievements_select_public"
    ON user_course_achievements FOR SELECT
    USING (is_public = true);

CREATE POLICY "user_achievements_insert_with_permission"
    ON user_course_achievements FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['achievements.grant', 'gamification.manage']
        )
    );

CREATE POLICY "user_achievements_update_own"
    ON user_course_achievements FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "user_achievements_.*_bypass"
    ON user_course_achievements USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 9: course_achievement_progress (Progress Tracking)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own progress" ON course_achievement_progress;
DROP POLICY IF EXISTS "System can update progress" ON course_achievement_progress;
DROP POLICY IF EXISTS "achievement_progress_select_own" ON course_achievement_progress;
DROP POLICY IF EXISTS "achievement_progress_select_with_permission" ON course_achievement_progress;
DROP POLICY IF EXISTS "achievement_progress_insert_own" ON course_achievement_progress;
DROP POLICY IF EXISTS "achievement_progress_update_own" ON course_achievement_progress;
DROP POLICY IF EXISTS "achievement_progress_.*_bypass" ON course_achievement_progress;

CREATE POLICY "achievement_progress_select_own"
    ON course_achievement_progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "achievement_progress_insert_own"
    ON course_achievement_progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievement_progress_update_own"
    ON course_achievement_progress FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "achievement_progress_.*_bypass"
    ON course_achievement_progress USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 10: course_user_streaks (Learning Streaks)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own streaks" ON course_user_streaks;
DROP POLICY IF EXISTS "Anyone can view streaks" ON course_user_streaks;
DROP POLICY IF EXISTS "streaks_select_own" ON course_user_streaks;
DROP POLICY IF EXISTS "streaks_select_with_permission" ON course_user_streaks;
DROP POLICY IF EXISTS "streaks_insert_own" ON course_user_streaks;
DROP POLICY IF EXISTS "streaks_update_own" ON course_user_streaks;
DROP POLICY IF EXISTS "streaks_.*_bypass" ON course_user_streaks;

CREATE POLICY "streaks_select_own"
    ON course_user_streaks FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "streaks_insert_own"
    ON course_user_streaks FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "streaks_update_own"
    ON course_user_streaks FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "streaks_.*_bypass"
    ON course_user_streaks USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 11: user_course_points (Points System)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own points" ON user_course_points;
DROP POLICY IF EXISTS "Anyone can view points" ON user_course_points;
DROP POLICY IF EXISTS "System can update points" ON user_course_points;
DROP POLICY IF EXISTS "points_select_own" ON user_course_points;
DROP POLICY IF EXISTS "points_select_with_permission" ON user_course_points;
DROP POLICY IF EXISTS "points_insert_with_permission" ON user_course_points;
DROP POLICY IF EXISTS "points_update_with_permission" ON user_course_points;
DROP POLICY IF EXISTS "points_.*_bypass" ON user_course_points;

CREATE POLICY "points_select_own"
    ON user_course_points FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "points_insert_with_permission"
    ON user_course_points FOR INSERT
    WITH CHECK (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "points_update_with_permission"
    ON user_course_points FOR UPDATE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "points_.*_bypass"
    ON user_course_points USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 12: course_points_transactions (Points History)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON course_points_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON course_points_transactions;
DROP POLICY IF EXISTS "transactions_select_own" ON course_points_transactions;
DROP POLICY IF EXISTS "transactions_select_with_permission" ON course_points_transactions;
DROP POLICY IF EXISTS "transactions_insert_with_permission" ON course_points_transactions;
DROP POLICY IF EXISTS "transactions_.*_bypass" ON course_points_transactions;

CREATE POLICY "transactions_select_own"
    ON course_points_transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "transactions_insert_with_permission"
    ON course_points_transactions FOR INSERT
    WITH CHECK (
        public.has_permission(auth.uid(), public.user_organization_id(), 'gamification.manage')
    );

CREATE POLICY "transactions_.*_bypass"
    ON course_points_transactions USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 13: course_leaderboards (Leaderboard Definitions)
-- HAS organization_id
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public leaderboards" ON course_leaderboards;
DROP POLICY IF EXISTS "Admins can manage leaderboards" ON course_leaderboards;
DROP POLICY IF EXISTS "leaderboards_select_active" ON course_leaderboards;
DROP POLICY IF EXISTS "leaderboards_insert_with_permission" ON course_leaderboards;
DROP POLICY IF EXISTS "leaderboards_update_with_permission" ON course_leaderboards;
DROP POLICY IF EXISTS "leaderboards_delete_with_permission" ON course_leaderboards;
DROP POLICY IF EXISTS "leaderboards_.*_bypass" ON course_leaderboards;

CREATE POLICY "leaderboards_select_active"
    ON course_leaderboards FOR SELECT
    USING (is_active = true);

CREATE POLICY "leaderboards_insert_with_permission"
    ON course_leaderboards FOR INSERT
    WITH CHECK (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['gamification.create', 'gamification.manage']
        )
    );

CREATE POLICY "leaderboards_update_with_permission"
    ON course_leaderboards FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['gamification.update', 'gamification.manage']
        )
    );

CREATE POLICY "leaderboards_delete_with_permission"
    ON course_leaderboards FOR DELETE
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), organization_id, 'gamification.manage')
            OR public.is_admin(auth.uid())
        )
    );

CREATE POLICY "leaderboards_.*_bypass"
    ON course_leaderboards USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 14: course_leaderboard_entries (Rankings)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON course_leaderboard_entries;
DROP POLICY IF EXISTS "System can manage entries" ON course_leaderboard_entries;
DROP POLICY IF EXISTS "leaderboard_entries_select_all" ON course_leaderboard_entries;
DROP POLICY IF EXISTS "leaderboard_entries_.*_bypass" ON course_leaderboard_entries;

CREATE POLICY "leaderboard_entries_select_all"
    ON course_leaderboard_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM course_leaderboards
            WHERE course_leaderboards.id = course_leaderboard_entries.leaderboard_id
            AND course_leaderboards.is_active = true
        )
    );

CREATE POLICY "leaderboard_entries_.*_bypass"
    ON course_leaderboard_entries USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 15: course_study_groups (Study Groups)
-- NO organization_id, HAS created_by
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view public groups" ON course_study_groups;
DROP POLICY IF EXISTS "Members can view their groups" ON course_study_groups;
DROP POLICY IF EXISTS "Users can create groups" ON course_study_groups;
DROP POLICY IF EXISTS "groups_select_public" ON course_study_groups;
DROP POLICY IF EXISTS "groups_select_member" ON course_study_groups;
DROP POLICY IF EXISTS "groups_select_with_permission" ON course_study_groups;
DROP POLICY IF EXISTS "groups_insert_with_permission" ON course_study_groups;
DROP POLICY IF EXISTS "groups_update_owner" ON course_study_groups;
DROP POLICY IF EXISTS "groups_update_with_permission" ON course_study_groups;
DROP POLICY IF EXISTS "groups_delete_owner" ON course_study_groups;
DROP POLICY IF EXISTS "groups_delete_with_permission" ON course_study_groups;
DROP POLICY IF EXISTS "groups_.*_bypass" ON course_study_groups;

CREATE POLICY "groups_select_public"
    ON course_study_groups FOR SELECT
    USING (is_public = true);

CREATE POLICY "groups_select_member"
    ON course_study_groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM course_study_group_members
            WHERE course_study_group_members.group_id = course_study_groups.id
            AND course_study_group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "groups_insert_with_permission"
    ON course_study_groups FOR INSERT
    WITH CHECK (
        created_by = auth.uid()
        AND public.has_permission(auth.uid(), public.user_organization_id(), 'social.create_groups')
    );

CREATE POLICY "groups_update_owner"
    ON course_study_groups FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "groups_delete_owner"
    ON course_study_groups FOR DELETE
    USING (
        created_by = auth.uid()
        OR public.has_permission(auth.uid(), public.user_organization_id(), 'social.moderate_groups')
    );

CREATE POLICY "groups_.*_bypass"
    ON course_study_groups USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 16: course_study_group_members (Group Membership)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Members can view group members" ON course_study_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON course_study_group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_select_all" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_insert_self" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_update_moderator" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_delete_self" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_delete_moderator" ON course_study_group_members;
DROP POLICY IF EXISTS "group_members_.*_bypass" ON course_study_group_members;

CREATE POLICY "group_members_select_all"
    ON course_study_group_members FOR SELECT
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
    ON course_study_group_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_delete_self"
    ON course_study_group_members FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "group_members_.*_bypass"
    ON course_study_group_members USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 17: course_user_follows (Social Following)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view follows" ON course_user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON course_user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON course_user_follows;
DROP POLICY IF EXISTS "follows_select_all" ON course_user_follows;
DROP POLICY IF EXISTS "follows_insert_self" ON course_user_follows;
DROP POLICY IF EXISTS "follows_update_self" ON course_user_follows;
DROP POLICY IF EXISTS "follows_delete_self" ON course_user_follows;
DROP POLICY IF EXISTS "follows_.*_bypass" ON course_user_follows;

CREATE POLICY "follows_select_all"
    ON course_user_follows FOR SELECT
    USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
    );

CREATE POLICY "follows_insert_self"
    ON course_user_follows FOR INSERT
    WITH CHECK (follower_id = auth.uid());

CREATE POLICY "follows_delete_self"
    ON course_user_follows FOR DELETE
    USING (follower_id = auth.uid());

CREATE POLICY "follows_.*_bypass"
    ON course_user_follows USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 18: course_peer_reviews (Peer Reviews)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON course_peer_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON course_peer_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_select_all" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_insert_with_permission" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_delete_with_permission" ON course_peer_reviews;
DROP POLICY IF EXISTS "reviews_.*_bypass" ON course_peer_reviews;

CREATE POLICY "reviews_select_all"
    ON course_peer_reviews FOR SELECT
    USING (true);

CREATE POLICY "reviews_insert_with_permission"
    ON course_peer_reviews FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_update_own"
    ON course_peer_reviews FOR UPDATE
    USING (reviewer_id = auth.uid());

CREATE POLICY "reviews_delete_own"
    ON course_peer_reviews FOR DELETE
    USING (
        reviewer_id = auth.uid()
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "reviews_.*_bypass"
    ON course_peer_reviews USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 19: learning_paths (Curated Learning Paths)
-- NO organization_id, HAS created_by, HAS is_published
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published paths" ON learning_paths;
DROP POLICY IF EXISTS "Instructors can manage paths" ON learning_paths;
DROP POLICY IF EXISTS "Admins can manage all paths" ON learning_paths;
DROP POLICY IF EXISTS "paths_select_published" ON learning_paths;
DROP POLICY IF EXISTS "paths_select_with_permission" ON learning_paths;
DROP POLICY IF EXISTS "paths_insert_with_permission" ON learning_paths;
DROP POLICY IF EXISTS "paths_update_owner" ON learning_paths;
DROP POLICY IF EXISTS "paths_update_with_permission" ON learning_paths;
DROP POLICY IF EXISTS "paths_delete_with_permission" ON learning_paths;
DROP POLICY IF EXISTS "paths_.*_bypass" ON learning_paths;

CREATE POLICY "paths_select_published"
    ON learning_paths FOR SELECT
    USING (is_published = true);

CREATE POLICY "paths_select_with_permission"
    ON learning_paths FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.view', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "paths_insert_with_permission"
    ON learning_paths FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.create', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "paths_update_with_permission"
    ON learning_paths FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.update', 'courses.manage', 'instructor.access']
        )
    );

CREATE POLICY "paths_delete_with_permission"
    ON learning_paths FOR DELETE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.delete', 'courses.manage']
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "paths_.*_bypass"
    ON learning_paths USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- TABLE 20: learning_path_enrollments (Path Progress)
-- NO organization_id
-- =====================================================

DROP POLICY IF EXISTS "Users can view own path enrollments" ON learning_path_enrollments;
DROP POLICY IF EXISTS "Users can enroll in paths" ON learning_path_enrollments;
DROP POLICY IF EXISTS "Users can update own path progress" ON learning_path_enrollments;
DROP POLICY IF EXISTS "path_enrollments_select_own" ON learning_path_enrollments;
DROP POLICY IF EXISTS "path_enrollments_select_with_permission" ON learning_path_enrollments;
DROP POLICY IF EXISTS "path_enrollments_insert_self" ON learning_path_enrollments;
DROP POLICY IF EXISTS "path_enrollments_update_own" ON learning_path_enrollments;
DROP POLICY IF EXISTS "path_enrollments_.*_bypass" ON learning_path_enrollments;

CREATE POLICY "path_enrollments_select_own"
    ON learning_path_enrollments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "path_enrollments_insert_self"
    ON learning_path_enrollments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "path_enrollments_update_own"
    ON learning_path_enrollments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "path_enrollments_.*_bypass"
    ON learning_path_enrollments USING (auth.jwt()->>'role' = '.*');

-- =====================================================
-- Migration Complete
-- =====================================================

-- Count policies per table
DO $$
DECLARE
    v_table_name TEXT;
    v_policy_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS Policy Migration Summary';
    RAISE NOTICE '========================================';
    
    FOR v_table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN (
            'enrollments', 'course_modules', 'lesson_progress', 'quiz_attempts',
            'questions', 'quiz_responses', 'course_achievements', 'user_course_achievements',
            'course_achievement_progress', 'course_user_streaks', 'user_course_points',
            'course_points_transactions', 'course_leaderboards', 'course_leaderboard_entries',
            'course_study_groups', 'course_study_group_members', 'course_user_follows',
            'course_peer_reviews', 'learning_paths', 'learning_path_enrollments'
        )
        ORDER BY tablename
    LOOP
        SELECT COUNT(*) INTO v_policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = v_table_name;
        
        RAISE NOTICE '%: % policies', RPAD(v_table_name, 35), v_policy_count;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Phase 3B: 20 feature tables migrated';
    RAISE NOTICE '========================================';
END $$;
