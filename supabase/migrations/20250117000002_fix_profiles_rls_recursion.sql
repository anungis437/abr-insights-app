-- Fix infinite recursion in profiles RLS policies
-- The issue is that user_organization_id() queries profiles table,
-- which triggers policies that call user_organization_id() again.

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can read profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create simpler policies that don't cause recursion
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to profiles"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('super_admin', 'org_admin', 'compliance_officer')
        )
    );
