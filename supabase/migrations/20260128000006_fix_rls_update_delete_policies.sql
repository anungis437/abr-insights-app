-- language: postgresql
-- Migration: Fix RLS UPDATE and DELETE policies for tenant isolation
-- Date: 2026-01-28
-- Description: Add missing UPDATE and DELETE policies identified in tenant-isolation tests

-- =============================================================================
-- ORGANIZATIONS TABLE - UPDATE POLICY
-- =============================================================================
-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "org_admins_update_own_org" ON organizations;

-- Only org admins can update their own organization
CREATE POLICY "org_admins_update_own_org" ON organizations
FOR UPDATE 
USING (
  -- User must be in the organization they're trying to update
  id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  AND (
    -- And must have admin or owner role
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE organization_id = organizations.id
      AND role IN ('owner', 'admin')
    )
    -- Or be an organization admin (legacy check)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND organization_id = organizations.id 
      AND role = 'admin'
    )
  )
);

-- =============================================================================
-- ENROLLMENTS TABLE - UPDATE POLICY
-- =============================================================================
-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "users_update_own_enrollments" ON enrollments;

-- Users can only update their own enrollments
CREATE POLICY "users_update_own_enrollments" ON enrollments
FOR UPDATE 
USING (
  user_id = auth.uid()
);

-- =============================================================================
-- COURSES TABLE - UPDATE POLICY
-- =============================================================================
-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "instructors_update_courses" ON courses;

-- Only course instructors/creators can update courses
CREATE POLICY "instructors_update_courses" ON courses
FOR UPDATE 
USING (
  -- Course creator can update
  created_by = auth.uid()
  OR
  -- Course instructors can update (if course_instructors table exists)
  EXISTS (
    SELECT 1 FROM course_instructors 
    WHERE course_id = courses.id 
    AND user_id = auth.uid()
  )
  OR
  -- Organization admins can update courses
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- =============================================================================
-- COURSES TABLE - DELETE POLICY
-- =============================================================================
-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "instructors_delete_courses" ON courses;

-- Only course instructors/creators can delete courses
CREATE POLICY "instructors_delete_courses" ON courses
FOR DELETE 
USING (
  -- Course creator can delete
  created_by = auth.uid()
  OR
  -- Course instructors can delete (if course_instructors table exists)
  EXISTS (
    SELECT 1 FROM course_instructors 
    WHERE course_id = courses.id 
    AND user_id = auth.uid()
  )
  OR
  -- Organization admins can delete courses
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================
COMMENT ON POLICY "org_admins_update_own_org" ON organizations IS 
  'Only organization admins/owners can update their own organization';

COMMENT ON POLICY "users_update_own_enrollments" ON enrollments IS 
  'Users can only update their own enrollment records';

COMMENT ON POLICY "instructors_update_courses" ON courses IS 
  'Course creators, instructors, and org admins can update courses';

COMMENT ON POLICY "instructors_delete_courses" ON courses IS 
  'Course creators, instructors, and org admins can delete courses';

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- This migration addresses the following test failures:
-- 1. Organizations UPDATE - prevents cross-tenant modification
-- 2. Enrollments UPDATE - prevents users from modifying others' progress
-- 3. Courses UPDATE - prevents unauthorized course modifications
-- 4. Courses DELETE - prevents unauthorized course deletion
--
-- Expected result: All 28/28 tenant-isolation tests should pass
