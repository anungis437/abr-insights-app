-- Migration: 022_migrate_critical_table_rls.sql
-- Description: Phase 3A - Migrate critical tables to permission-based RLS
-- Replaces role-based RLS policies with permission-based policies
-- Created: 2025-01-13
-- Requires: 021_permission_based_rls_functions.sql

-- ============================================================================
-- TABLE 1: PROFILES (User authentication base)
-- ============================================================================

-- Drop existing role-based policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Permission-based policies
CREATE POLICY "profiles_select_own"
    ON profiles FOR SELECT
    USING (
        id = auth.uid()  -- Always see own profile
    );

CREATE POLICY "profiles_select_with_permission"
    ON profiles FOR SELECT
    USING (
        organization_id IS NOT NULL
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['profiles.view', 'users.read', 'admin.ai.manage']
        )
    );

CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND (
            -- Users can update their own profile within their org
            organization_id = public.user_organization_id()
            OR public.has_permission(auth.uid(), public.user_organization_id(), 'profiles.update_any')
        )
    );

CREATE POLICY "profiles_update_with_permission"
    ON profiles FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['profiles.update_any', 'users.update', 'admin.ai.manage']
        )
    );

CREATE POLICY "profiles_insert_own"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_with_permission"
    ON profiles FOR INSERT
    WITH CHECK (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['users.create', 'users.invite', 'admin.ai.manage']
        )
    );

CREATE POLICY "profiles_delete_with_permission"
    ON profiles FOR DELETE
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), organization_id, 'users.delete')
            OR public.is_admin(auth.uid())
        )
    );

-- Service role bypass
CREATE POLICY "profiles_service_role_full_access"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON POLICY "profiles_select_own" ON profiles IS 'Users can always view their own profile';
COMMENT ON POLICY "profiles_select_with_permission" ON profiles IS 'View profiles with profiles.view or users.read permission';

-- ============================================================================
-- TABLE 2: ORGANIZATIONS (Tenant isolation base)
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update own organization" ON organizations;
DROP POLICY IF EXISTS "Service role has full access to organizations" ON organizations;

-- Permission-based policies
CREATE POLICY "organizations_select_own"
    ON organizations FOR SELECT
    USING (
        id = public.user_organization_id()  -- Users see their own org
    );

CREATE POLICY "organizations_select_with_permission"
    ON organizations FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            id,
            ARRAY['organization.view', 'admin.ai.manage']
        )
    );

CREATE POLICY "organizations_update_with_permission"
    ON organizations FOR UPDATE
    USING (
        id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), id, 'organization.configure')
            OR public.is_admin(auth.uid())
        )
    );

CREATE POLICY "organizations_insert_super_admin"
    ON organizations FOR INSERT
    WITH CHECK (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "organizations_delete_super_admin"
    ON organizations FOR DELETE
    USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "organizations_service_role_full_access"
    ON organizations FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 3: USER_ROLES (RBAC assignment)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role has full access to user_roles" ON user_roles;

-- Permission-based policies
CREATE POLICY "user_roles_select_own"
    ON user_roles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "user_roles_select_with_permission"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = user_id
            AND p.organization_id = public.user_organization_id()
            AND public.has_any_permission(
                auth.uid(),
                p.organization_id,
                ARRAY['roles.read', 'users.read', 'admin.ai.manage']
            )
        )
    );

CREATE POLICY "user_roles_insert_with_permission"
    ON user_roles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = user_id
            AND p.organization_id = public.user_organization_id()
            AND (
                public.has_permission(auth.uid(), p.organization_id, 'roles.assign')
                OR public.is_admin(auth.uid())
            )
        )
    );

CREATE POLICY "user_roles_delete_with_permission"
    ON user_roles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = user_id
            AND p.organization_id = public.user_organization_id()
            AND (
                public.has_permission(auth.uid(), p.organization_id, 'roles.assign')
                OR public.is_admin(auth.uid())
            )
        )
    );

CREATE POLICY "user_roles_service_role_full_access"
    ON user_roles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 4: COURSES (Primary learning content)
-- ============================================================================

-- Note: Courses may not have organization_id, might need adding
-- For now, assume courses have organization_id or use a different isolation method

-- Check if courses table has RLS enabled, enable if not
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
DROP POLICY IF EXISTS "Users can view courses in own org" ON courses;
DROP POLICY IF EXISTS "Instructors can manage own courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "courses_select_all" ON courses;
DROP POLICY IF EXISTS "courses_select_authenticated" ON courses;
DROP POLICY IF EXISTS "courses_select_own" ON courses;
DROP POLICY IF EXISTS "courses_select_own_org" ON courses;
DROP POLICY IF EXISTS "courses_insert_with_permission" ON courses;
DROP POLICY IF EXISTS "courses_update_owner_or_permission" ON courses;
DROP POLICY IF EXISTS "courses_delete_with_permission" ON courses;
DROP POLICY IF EXISTS "courses_service_role_full_access" ON courses;

-- Permission-based policies
CREATE POLICY "courses_select_all"
    ON courses FOR SELECT
    USING (true);  -- All authenticated users can view all courses

CREATE POLICY "courses_insert_with_permission"
    ON courses FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.create', 'instructor.access']
        )
    );

CREATE POLICY "courses_update_owner_or_permission"
    ON courses FOR UPDATE
    USING (
        instructor_id = auth.uid()
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.update', 'courses.publish', 'admin.ai.manage']
        )
    );

CREATE POLICY "courses_delete_with_permission"
    ON courses FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'courses.delete')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "courses_service_role_full_access"
    ON courses FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 5: LESSONS (Course content)
-- ============================================================================

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON lessons;
DROP POLICY IF EXISTS "Instructors can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
DROP POLICY IF EXISTS "lessons_select_all" ON lessons;
DROP POLICY IF EXISTS "lessons_select_authenticated" ON lessons;
DROP POLICY IF EXISTS "lessons_select_with_access" ON lessons;
DROP POLICY IF EXISTS "lessons_insert_with_permission" ON lessons;
DROP POLICY IF EXISTS "lessons_update_with_permission" ON lessons;
DROP POLICY IF EXISTS "lessons_delete_with_permission" ON lessons;
DROP POLICY IF EXISTS "lessons_service_role_full_access" ON lessons;

CREATE POLICY "lessons_select_all"
    ON lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
        )
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.view', 'lessons.create', 'instructor.access']
        )
    );

CREATE POLICY "lessons_insert_with_permission"
    ON lessons FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND public.has_any_permission(
                auth.uid(),
                public.user_organization_id(),
                ARRAY['lessons.create', 'instructor.access']
            )
        )
    );

CREATE POLICY "lessons_update_with_permission"
    ON lessons FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND (
                c.instructor_id = auth.uid()
                OR public.has_any_permission(
                    auth.uid(),
                    public.user_organization_id(),
                    ARRAY['lessons.update', 'lessons.publish']
                )
            )
        )
    );

CREATE POLICY "lessons_delete_with_permission"
    ON lessons FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND (
                public.has_permission(auth.uid(), public.user_organization_id(), 'lessons.delete')
                OR public.is_admin(auth.uid())
            )
        )
    );

CREATE POLICY "lessons_service_role_full_access"
    ON lessons FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 6: TRIBUNAL_CASES (Case law database)
-- ============================================================================

ALTER TABLE tribunal_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view cases" ON tribunal_cases;
DROP POLICY IF EXISTS "Users can view cases" ON tribunal_cases;
DROP POLICY IF EXISTS "Admins can manage cases" ON tribunal_cases;
DROP POLICY IF EXISTS "tribunal_cases_select_with_permission" ON tribunal_cases;
DROP POLICY IF EXISTS "tribunal_cases_insert_with_permission" ON tribunal_cases;
DROP POLICY IF EXISTS "tribunal_cases_update_with_permission" ON tribunal_cases;
DROP POLICY IF EXISTS "tribunal_cases_delete_with_permission" ON tribunal_cases;
DROP POLICY IF EXISTS "tribunal_cases_service_role_full_access" ON tribunal_cases;

CREATE POLICY "tribunal_cases_select_with_permission"
    ON tribunal_cases FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['cases.view', 'cases.read', 'cases.search']
        )
    );

CREATE POLICY "tribunal_cases_insert_with_permission"
    ON tribunal_cases FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['cases.create', 'cases.import', 'admin.ai.manage']
        )
    );

CREATE POLICY "tribunal_cases_update_with_permission"
    ON tribunal_cases FOR UPDATE
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['cases.update', 'cases.annotate', 'admin.ai.manage']
        )
    );

CREATE POLICY "tribunal_cases_delete_with_permission"
    ON tribunal_cases FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'cases.delete')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "tribunal_cases_service_role_full_access"
    ON tribunal_cases FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 7: QUIZZES (Assessment system)
-- ============================================================================

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published quizzes" ON quizzes;
DROP POLICY IF EXISTS "Instructors can manage quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage all quizzes" ON quizzes;
DROP POLICY IF EXISTS "quizzes_select_with_access" ON quizzes;
DROP POLICY IF EXISTS "quizzes_insert_with_permission" ON quizzes;
DROP POLICY IF EXISTS "quizzes_update_with_permission" ON quizzes;
DROP POLICY IF EXISTS "quizzes_delete_with_permission" ON quizzes;
DROP POLICY IF EXISTS "quizzes_service_role_full_access" ON quizzes;

CREATE POLICY "quizzes_select_with_access"
    ON quizzes FOR SELECT
    USING (
        (
            -- Published quizzes
            is_published = true
            AND EXISTS (
                SELECT 1 FROM courses c
                WHERE c.id = course_id
            )
        )
        OR (
            -- Course access with permission
            EXISTS (
                SELECT 1 FROM courses c
                WHERE c.id = course_id
                AND public.has_any_permission(
                    auth.uid(),
                    public.user_organization_id(),
                    ARRAY['quizzes.create', 'quizzes.take', 'instructor.access']
                )
            )
        )
    );

CREATE POLICY "quizzes_insert_with_permission"
    ON quizzes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND public.has_any_permission(
                auth.uid(),
                public.user_organization_id(),
                ARRAY['quizzes.create', 'instructor.access']
            )
        )
    );

CREATE POLICY "quizzes_update_with_permission"
    ON quizzes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND (
                c.instructor_id = auth.uid()
                OR public.has_permission(auth.uid(), public.user_organization_id(), 'quizzes.update')
            )
        )
    );

CREATE POLICY "quizzes_delete_with_permission"
    ON quizzes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_id
            AND (
                public.has_permission(auth.uid(), public.user_organization_id(), 'quizzes.delete')
                OR public.is_admin(auth.uid())
            )
        )
    );

CREATE POLICY "quizzes_service_role_full_access"
    ON quizzes FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 8: CERTIFICATES (Credential issuance)
-- ============================================================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Instructors can issue certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;
DROP POLICY IF EXISTS "certificates_select_own" ON certificates;
DROP POLICY IF EXISTS "certificates_select_with_permission" ON certificates;
DROP POLICY IF EXISTS "certificates_insert_with_permission" ON certificates;
DROP POLICY IF EXISTS "certificates_update_with_permission" ON certificates;
DROP POLICY IF EXISTS "certificates_delete_with_permission" ON certificates;
DROP POLICY IF EXISTS "certificates_service_role_full_access" ON certificates;

CREATE POLICY "certificates_select_own"
    ON certificates FOR SELECT
    USING (
        user_id = auth.uid()
        OR public.has_permission(auth.uid(), public.user_organization_id(), 'certificates.view_own')
    );

CREATE POLICY "certificates_select_with_permission"
    ON certificates FOR SELECT
    USING (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['certificates.view_all', 'instructor.access', 'admin.ai.manage']
        )
    );

CREATE POLICY "certificates_insert_with_permission"
    ON certificates FOR INSERT
    WITH CHECK (
        public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['certificates.issue', 'instructor.access']
        )
    );

CREATE POLICY "certificates_update_with_permission"
    ON certificates FOR UPDATE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'certificates.issue')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "certificates_delete_with_permission"
    ON certificates FOR DELETE
    USING (
        public.has_permission(auth.uid(), public.user_organization_id(), 'certificates.revoke')
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "certificates_service_role_full_access"
    ON certificates FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 9: AUDIT_LOGS (Security audit trail)
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_team" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_all" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_service_only" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_update" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete_super_admin" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_service_role_full_access" ON audit_logs;

CREATE POLICY "audit_logs_select_own"
    ON audit_logs FOR SELECT
    USING (
        user_id = auth.uid()
        OR public.has_permission(auth.uid(), public.user_organization_id(), 'audit_logs.view_own')
    );

CREATE POLICY "audit_logs_select_team"
    ON audit_logs FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND public.has_permission(auth.uid(), organization_id, 'audit_logs.view_team')
    );

CREATE POLICY "audit_logs_select_all"
    ON audit_logs FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_permission(auth.uid(), organization_id, 'audit_logs.view_all')
            OR public.is_admin(auth.uid())
        )
    );

CREATE POLICY "audit_logs_insert_service_only"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "audit_logs_no_update"
    ON audit_logs FOR UPDATE
    USING (false);  -- Audit logs are immutable

CREATE POLICY "audit_logs_delete_super_admin"
    ON audit_logs FOR DELETE
    USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "audit_logs_service_role_full_access"
    ON audit_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TABLE 10: AI_USAGE_LOGS (AI usage tracking)
-- ============================================================================

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view AI usage logs" ON ai_usage_logs;
DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_select_own" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_select_with_permission" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_select_org_admin" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_insert_service_only" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_no_update" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_delete_admin" ON ai_usage_logs;
DROP POLICY IF EXISTS "ai_usage_logs_service_role_full_access" ON ai_usage_logs;

CREATE POLICY "ai_usage_logs_select_own"
    ON ai_usage_logs FOR SELECT
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "ai_usage_logs_select_with_permission"
    ON ai_usage_logs FOR SELECT
    USING (
        organization_id = public.user_organization_id()
        AND (
            public.has_any_permission(
                auth.uid(),
                organization_id,
                ARRAY['ai.usage.view', 'ai.usage.export', 'admin.ai.manage']
            )
            OR public.is_admin(auth.uid())
        )
    );

CREATE POLICY "ai_usage_logs_insert_service_only"
    ON ai_usage_logs FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "ai_usage_logs_no_update"
    ON ai_usage_logs FOR UPDATE
    USING (false);  -- Usage logs are immutable

CREATE POLICY "ai_usage_logs_delete_admin"
    ON ai_usage_logs FOR DELETE
    USING (
        organization_id = public.user_organization_id()
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "ai_usage_logs_service_role_full_access"
    ON ai_usage_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

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
        AND tablename IN ('profiles', 'organizations', 'user_roles', 'courses', 'lessons', 
                         'tribunal_cases', 'quizzes', 'certificates', 'audit_logs', 'ai_usage_logs')
        ORDER BY tablename
    LOOP
        SELECT COUNT(*) INTO v_policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = v_table_name;
        
        RAISE NOTICE '%: % policies', RPAD(v_table_name, 20), v_policy_count;
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;
