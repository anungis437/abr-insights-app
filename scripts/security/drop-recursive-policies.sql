-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Compliance officers can update roles" ON profiles;
DROP POLICY IF EXISTS "Test accounts are viewable by authenticated users" ON profiles;

-- Verify remaining policies
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
