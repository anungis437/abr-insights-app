-- Emergency fix: Delete and recreate auth users properly
-- This will fix the "Database error querying schema" issue

-- Step 1: Delete all test auth users (keeps profiles intact)
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@abr-insights.com'
);

DELETE FROM auth.users WHERE email LIKE '%@abr-insights.com';

-- Step 2: Verify deletion
SELECT 'After deletion' as step, COUNT(*) as count FROM auth.users;

-- NOTE: Do NOT run Step 3 here. After running steps 1-2, we need to create users
-- via the Supabase Dashboard UI (Authentication > Users > Invite User) or via Auth API
-- to ensure all triggers fire properly.

-- The profiles table still has all the data with the correct UUIDs (001-009).
-- After creating auth users properly, we'll need to update the profiles.id to match
-- the new randomly-generated auth user UUIDs.
