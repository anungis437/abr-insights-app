-- Fix profiles RLS - remove recursive super admin policies
-- Super admin checks need to happen at application level, not RLS level

-- Drop the policies that cause recursion by querying profiles table
DROP POLICY IF EXISTS "Super admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

-- Note: Basic policies (own profile access, service role) already exist from previous migration
-- Super admin access will be handled at application level by checking the role column 
-- AFTER fetching the user's own profile (which doesn't cause recursion)
