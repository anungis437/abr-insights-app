-- Run this in Supabase Dashboard SQL Editor to diagnose auth schema issue

-- Check if auth.users table exists and has data
SELECT 'auth.users check' as test, 
       COUNT(*) as count,
       array_agg(email ORDER BY created_at) as emails
FROM auth.users;

-- Check specific UUID
SELECT 'UUID 001 check' as test,
       id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Check all users with @abr-insights.com
SELECT 'All test users' as test,
       id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email LIKE '%@abr-insights.com'
ORDER BY email;

-- Check auth.identities for user 001
SELECT 'Identity check' as test,
       id, user_id, provider, provider_id, created_at
FROM auth.identities
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Check for any auth schema corruption
SELECT 'Schema version' as test,
       version
FROM auth.schema_migrations
ORDER BY version DESC
LIMIT 5;
