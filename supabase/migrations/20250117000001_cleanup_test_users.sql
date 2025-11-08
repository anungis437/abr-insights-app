-- Clean up manually inserted test users from auth tables
-- This will allow Supabase Auth to work properly

-- Step 1: Delete test user identities
DELETE FROM auth.identities 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@abr-insights.com'
);

-- Step 2: Delete test users from auth.users
DELETE FROM auth.users 
WHERE email LIKE '%@abr-insights.com';

-- Step 3: Delete corresponding profiles
DELETE FROM public.profiles 
WHERE email LIKE '%@abr-insights.com';

-- Verification: Check that test users are gone
SELECT 'Test users remaining:', COUNT(*) as count
FROM auth.users
WHERE email LIKE '%@abr-insights.com';

-- Note: After running this, you can create test users via:
-- 1. Supabase Dashboard (Authentication > Users > Add User)
-- 2. Admin API (scripts/recreate-test-users.ts)
-- 3. Sign up normally through the application
