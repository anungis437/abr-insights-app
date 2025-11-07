-- Migration 014: Add role field to profiles table
-- This field is required for role-based access control in admin routes
-- Referenced in migrations 005 and 013, but never created in schema

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- Drop existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add CHECK constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'super_admin',        -- Full platform administrator with all permissions
  'compliance_officer', -- Compliance and legal administrator
  'org_admin',          -- Organization administrator
  'analyst',            -- Data analyst with read access
  'investigator',       -- Case investigator with special permissions
  'educator',           -- Course creator and instructor
  'learner',            -- Default role for students/learners
  'viewer',             -- Read-only access
  'guest'               -- Limited guest access
));

-- Set default role for existing users (learner is the default)
UPDATE profiles 
SET role = 'learner' 
WHERE role IS NULL;

-- Make role NOT NULL after setting defaults
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;

-- Set default for future inserts
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'learner';

-- CREATE INDEX IF NOT EXISTS for role-based queries (frequently used in admin routes)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create composite index for organization + role queries
CREATE INDEX IF NOT EXISTS idx_profiles_org_role ON profiles(organization_id, role);

-- Add comment explaining the role system
COMMENT ON COLUMN profiles.role IS 'User role for role-based access control. Determines permissions and access levels throughout the platform.';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Compliance officers can update roles" ON profiles;

-- Update RLS policies to include role-based access
-- Admin users can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Compliance officers can update user roles (except super_admin)
CREATE POLICY "Compliance officers can update roles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Must be an admin to update profiles
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'compliance_officer')
    )
  )
  WITH CHECK (
    -- Must still be an admin after the update
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('super_admin', 'compliance_officer')
    )
    AND
    -- Cannot escalate to super_admin unless you are one
    (role != 'super_admin' OR auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    ))
  );

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 014 completed: Added role field to profiles table';
  RAISE NOTICE 'Set default role to learner for % existing users', (SELECT COUNT(*) FROM profiles WHERE role = 'learner');
END $$;



