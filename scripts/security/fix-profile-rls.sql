-- Fix infinite recursion in RLS policies
-- Run this in Supabase Dashboard SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can read profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in own org" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in own org" ON profiles;

-- Create simpler policies without recursion
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can read all profiles"
    ON profiles FOR SELECT
    USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
