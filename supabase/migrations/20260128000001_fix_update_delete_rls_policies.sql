-- Migration: Fix RLS UPDATE/DELETE policies
-- Description: Strengthen policies to prevent unauthorized modifications
-- Date: 2026-01-28
-- Issue: Tests revealed users can update/delete records they shouldn't access

-- ============================================================================
-- FIX 1: ENROLLMENTS - Restrict UPDATE to own records only
-- ============================================================================
-- Problem: Users can update other users' enrollments
-- Solution: Enforce user_id check on both USING and WITH CHECK

DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_with_permission" ON enrollments;

-- Users can only update their own enrollments
CREATE POLICY "enrollments_update_own"
    ON enrollments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins with specific permission can update any enrollment in their org
CREATE POLICY "enrollments_update_admin"
    ON enrollments
    FOR UPDATE
    USING (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.update_any', 'admin.users.manage']
        )
    )
    WITH CHECK (
        organization_id = public.user_organization_id()
        AND public.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['enrollments.update_any', 'admin.users.manage']
        )
    );

-- ============================================================================
-- FIX 2: ORGANIZATIONS - Restrict UPDATE to org admins only
-- ============================================================================
-- Problem: Users can update organizations they don't belong to
-- Solution: Enforce org membership + admin role check

DROP POLICY IF EXISTS "organizations_update_with_permission" ON organizations;

-- Only org owners/admins can update their organization
CREATE POLICY "organizations_update_admin_only"
    ON organizations
    FOR UPDATE
    USING (
        id = public.user_organization_id()
        AND (
            public.has_any_permission(
                auth.uid(), 
                id, 
                ARRAY['organization.configure', 'admin.system.configure']
            )
            OR public.is_admin(auth.uid())
        )
    )
    WITH CHECK (
        id = public.user_organization_id()
        AND (
            public.has_any_permission(
                auth.uid(), 
                id, 
                ARRAY['organization.configure', 'admin.system.configure']
            )
            OR public.is_admin(auth.uid())
        )
    );

-- ============================================================================
-- FIX 3: COURSES - Restrict UPDATE to instructors/creators only
-- ============================================================================
-- Problem: Any authenticated user can update courses
-- Solution: Enforce instructor ownership or explicit permission

DROP POLICY IF EXISTS "courses_update_owner_or_permission" ON courses;

-- Only course creators/instructors or users with explicit permission can update
CREATE POLICY "courses_update_instructor_only"
    ON courses
    FOR UPDATE
    USING (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM course_instructors
            WHERE course_id = courses.id
            AND instructor_id IN (
                SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
            )
        )
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.update', 'courses.manage', 'admin.content.manage']
        )
    )
    WITH CHECK (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM course_instructors
            WHERE course_id = courses.id
            AND instructor_id IN (
                SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
            )
        )
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.update', 'courses.manage', 'admin.content.manage']
        )
    );

-- ============================================================================
-- FIX 4: COURSES - Restrict DELETE to course owners/admins only
-- ============================================================================
-- Problem: Any user can delete courses
-- Solution: Only allow deletion by course owner or admin with permission

DROP POLICY IF EXISTS "courses_delete_with_permission" ON courses;

-- Only course owners or admins with delete permission can delete courses
CREATE POLICY "courses_delete_owner_or_admin"
    ON courses
    FOR DELETE
    USING (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM course_instructors
            WHERE course_id = courses.id
            AND instructor_id IN (
                SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
            )
            AND role = 'lead_instructor'
        )
        OR public.has_any_permission(
            auth.uid(),
            public.user_organization_id(),
            ARRAY['courses.delete', 'admin.content.manage']
        )
        OR public.is_admin(auth.uid())
    );

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================================

-- Test that regular users can't update other enrollments:
-- SELECT * FROM enrollments WHERE user_id != auth.uid();
-- UPDATE enrollments SET progress = 100 WHERE user_id != auth.uid(); -- Should fail

-- Test that regular users can't update organizations:
-- UPDATE organizations SET name = 'Hacked' WHERE id != user_organization_id(); -- Should fail

-- Test that regular users can't update courses:
-- UPDATE courses SET title = 'Hacked' WHERE instructor_id != auth.uid(); -- Should fail

-- Test that regular users can't delete courses:
-- DELETE FROM courses WHERE instructor_id != auth.uid(); -- Should fail
