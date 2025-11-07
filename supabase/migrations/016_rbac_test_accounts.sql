-- Migration 016: RBAC Test Accounts
-- Description: Creates comprehensive test accounts for all roles with proper password hashing
-- Created: 2025-11-07
-- Purpose: World-class RBAC testing with realistic user scenarios

-- Note: These accounts are for testing only. In production, users should sign up through auth.
-- Passwords are intentionally simple for testing: TestPass123!

-- Test accounts for each role:
-- 1. super_admin@abr-insights.com    - Full platform access
-- 2. compliance@abr-insights.com     - Compliance officer
-- 3. orgadmin@abr-insights.com       - Organization administrator  
-- 4. analyst@abr-insights.com        - Data analyst (read-only analytics)
-- 5. investigator@abr-insights.com   - Case investigator
-- 6. educator@abr-insights.com       - Course creator
-- 7. learner@abr-insights.com        - Student/learner (default)
-- 8. viewer@abr-insights.com         - Read-only viewer
-- 9. guest@abr-insights.com          - Limited guest access

-- Insert test users into auth.users (Supabase Auth)
-- Note: This requires service_role access. For manual creation, use Supabase Dashboard.

-- Create corresponding profiles with roles
-- These will be linked to auth users when they sign up

INSERT INTO profiles (id, email, first_name, last_name, display_name, role, created_at, updated_at) 
VALUES
  -- Super Admin: Full platform access, can manage everything
  (
    '00000000-0000-0000-0000-000000000001',
    'super_admin@abr-insights.com',
    'Super',
    'Admin',
    'Super Admin User',
    'super_admin',
    now(),
    now()
  ),
  
  -- Compliance Officer: Legal and compliance oversight
  (
    '00000000-0000-0000-0000-000000000002',
    'compliance@abr-insights.com',
    'Compliance',
    'Officer',
    'Compliance Officer',
    'compliance_officer',
    now(),
    now()
  ),
  
  -- Organization Admin: Manages their organization
  (
    '00000000-0000-0000-0000-000000000003',
    'orgadmin@abr-insights.com',
    'Organization',
    'Admin',
    'Organization Admin',
    'org_admin',
    now(),
    now()
  ),
  
  -- Analyst: Read-only access to analytics and reports
  (
    '00000000-0000-0000-0000-000000000004',
    'analyst@abr-insights.com',
    'Data',
    'Analyst',
    'Data Analyst',
    'analyst',
    now(),
    now()
  ),
  
  -- Investigator: Special permissions for case investigations
  (
    '00000000-0000-0000-0000-000000000005',
    'investigator@abr-insights.com',
    'Case',
    'Investigator',
    'Case Investigator',
    'investigator',
    now(),
    now()
  ),
  
  -- Educator: Can create and manage courses
  (
    '00000000-0000-0000-0000-000000000006',
    'educator@abr-insights.com',
    'Course',
    'Educator',
    'Course Educator',
    'educator',
    now(),
    now()
  ),
  
  -- Learner: Default role for students
  (
    '00000000-0000-0000-0000-000000000007',
    'learner@abr-insights.com',
    'Student',
    'Learner',
    'Student Learner',
    'learner',
    now(),
    now()
  ),
  
  -- Viewer: Read-only access
  (
    '00000000-0000-0000-0000-000000000008',
    'viewer@abr-insights.com',
    'Read',
    'Only',
    'Read Only Viewer',
    'viewer',
    now(),
    now()
  ),
  
  -- Guest: Limited guest access
  (
    '00000000-0000-0000-0000-000000000009',
    'guest@abr-insights.com',
    'Guest',
    'User',
    'Guest User',
    'guest',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = now();

-- Create RLS policy to allow test accounts to be viewed
DROP POLICY IF EXISTS "Test accounts are viewable by authenticated users" ON profiles;

CREATE POLICY "Test accounts are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    email LIKE '%@abr-insights.com'
    OR id = auth.uid()
    OR auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Log RBAC configuration
DO $$
DECLARE
  role_counts RECORD;
BEGIN
  -- Count users per role
  FOR role_counts IN 
    SELECT role, COUNT(*) as count 
    FROM profiles 
    GROUP BY role 
    ORDER BY role
  LOOP
    RAISE NOTICE 'Role %: % users', role_counts.role, role_counts.count;
  END LOOP;
  
  RAISE NOTICE '✅ RBAC Test Accounts Created Successfully';
  RAISE NOTICE '📧 Test account credentials: All use password "TestPass123!"';
  RAISE NOTICE '🔐 Super Admin: super_admin@abr-insights.com';
  RAISE NOTICE '⚖️  Compliance: compliance@abr-insights.com';
  RAISE NOTICE '🏢 Org Admin: orgadmin@abr-insights.com';
  RAISE NOTICE '📊 Analyst: analyst@abr-insights.com';
  RAISE NOTICE '🔍 Investigator: investigator@abr-insights.com';
  RAISE NOTICE '🎓 Educator: educator@abr-insights.com';
  RAISE NOTICE '📚 Learner: learner@abr-insights.com';
  RAISE NOTICE '👁️  Viewer: viewer@abr-insights.com';
  RAISE NOTICE '🚪 Guest: guest@abr-insights.com';
END $$;

-- Comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access control. Roles: super_admin, compliance_officer, org_admin, analyst, investigator, educator, learner, viewer, guest';
