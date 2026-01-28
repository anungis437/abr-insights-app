-- Drop ALL old UPDATE/DELETE policies from migrations 018, 022, 023
-- These permissive policies are using OR logic and overriding our restrictive policies

-- Enrollments - Drop ALL old update/delete policies
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_delete_with_permission" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_admin" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update_own_only" ON enrollments;

-- Organizations - Drop ALL old update policies  
DROP POLICY IF EXISTS "organizations_update_with_permission" ON organizations;
DROP POLICY IF EXISTS "organizations_update_own_org" ON organizations;
DROP POLICY IF EXISTS "organizations_update_own_org_only" ON organizations;

-- Courses - Drop ALL old update/delete policies
DROP POLICY IF EXISTS "courses_update_owner_or_permission" ON courses;
DROP POLICY IF EXISTS "courses_delete_with_permission" ON courses;
DROP POLICY IF EXISTS "courses_update_instructor_only" ON courses;
DROP POLICY IF EXISTS "courses_delete_owner_or_admin" ON courses;
DROP POLICY IF EXISTS "courses_update_creator_instructor_only" ON courses;
DROP POLICY IF EXISTS "courses_delete_creator_only" ON courses;

-- Note: RESTRICTIVE policies already exist from migration 20260128000003
-- This migration just cleans up the old PERMISSIVE policies that were
-- using OR logic and allowing unauthorized access
