-- Drop ALL existing UPDATE/DELETE policies and create new restrictive ones
-- This ensures no old permissive policies remain

-- ============================================================================
-- ENROLLMENTS: Clean slate - drop all UPDATE policies
-- ============================================================================
DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_admin" ON enrollments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollment progress" ON enrollments;

-- Create single restrictive policy: only your own enrollments
CREATE POLICY "enrollments_update_own_only"
    ON enrollments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- ORGANIZATIONS: Clean slate - drop all UPDATE policies  
-- ============================================================================
DROP POLICY IF EXISTS "organizations_update_with_permission" ON organizations;
DROP POLICY IF EXISTS "organizations_update_admin_only" ON organizations;
DROP POLICY IF EXISTS "Enable update for organization admins" ON organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;

-- Create restrictive policy: only org admins of THEIR OWN org
-- Simplified: Check if user has organization_id match (basic membership check)
CREATE POLICY "organizations_update_own_org_only"
    ON organizations
    FOR UPDATE
    USING (id = public.user_organization_id())
    WITH CHECK (id = public.user_organization_id());

-- ============================================================================
-- COURSES: Clean slate - drop all UPDATE/DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "courses_update_owner_or_permission" ON courses;
DROP POLICY IF EXISTS "courses_update_instructor_only" ON courses;
DROP POLICY IF EXISTS "courses_delete_with_permission" ON courses;
DROP POLICY IF EXISTS "courses_delete_owner_or_admin" ON courses;
DROP POLICY IF EXISTS "Enable update for course instructors" ON courses;
DROP POLICY IF EXISTS "Enable delete for course owners" ON courses;

-- Create restrictive UPDATE policy: only course creator or instructor
CREATE POLICY "courses_update_creator_instructor_only"
    ON courses
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

-- Create restrictive DELETE policy: only course creator
CREATE POLICY "courses_delete_creator_only"
    ON courses
    FOR DELETE
    USING (instructor_id = auth.uid());
