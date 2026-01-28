-- Use RESTRICTIVE policies to enforce strict access control
-- RESTRICTIVE policies use AND logic, so ALL policies must pass
-- This prevents other permissive policies from bypassing our restrictions

-- ============================================================================
-- ENROLLMENTS: Use RESTRICTIVE to block cross-user updates
-- ============================================================================
DROP POLICY IF EXISTS "enrollments_update_own_only" ON enrollments;

-- RESTRICTIVE policy: blocks all updates except to own enrollments
CREATE POLICY "enrollments_restrict_update_to_own"
    ON enrollments AS RESTRICTIVE
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- ORGANIZATIONS: Use RESTRICTIVE to block cross-org updates
-- ============================================================================
DROP POLICY IF EXISTS "organizations_update_own_org_only" ON organizations;

-- RESTRICTIVE policy: blocks all updates except to own organization
CREATE POLICY "organizations_restrict_update_to_own"
    ON organizations AS RESTRICTIVE
    FOR UPDATE
    USING (id = public.user_organization_id())
    WITH CHECK (id = public.user_organization_id());

-- ============================================================================
-- COURSES: Use RESTRICTIVE to block unauthorized updates/deletes
-- ============================================================================
DROP POLICY IF EXISTS "courses_update_creator_instructor_only" ON courses;
DROP POLICY IF EXISTS "courses_delete_creator_only" ON courses;

-- RESTRICTIVE policy: blocks course updates except for creator/instructor
CREATE POLICY "courses_restrict_update_to_instructor"
    ON courses AS RESTRICTIVE
    FOR UPDATE
    USING (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM instructor_profiles ip
            JOIN course_instructors ci ON ci.instructor_id = ip.id
            WHERE ci.course_id = courses.id
            AND ip.user_id = auth.uid()
        )
    )
    WITH CHECK (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM instructor_profiles ip
            JOIN course_instructors ci ON ci.instructor_id = ip.id
            WHERE ci.course_id = courses.id
            AND ip.user_id = auth.uid()
        )
    );

-- RESTRICTIVE policy: blocks course deletes except for creator
CREATE POLICY "courses_restrict_delete_to_creator"
    ON courses AS RESTRICTIVE
    FOR DELETE
    USING (instructor_id = auth.uid());
