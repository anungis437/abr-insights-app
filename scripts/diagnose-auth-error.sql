-- Run this in Supabase Dashboard SQL Editor to diagnose auth issues
-- Copy the results and share them

-- Test 1: Can we query auth.users at all?
SELECT 'Test 1: Basic auth.users query' as test;
SELECT COUNT(*) as total_users FROM auth.users;

-- Test 2: Check for users with our test emails
SELECT 'Test 2: Test account emails' as test;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@abr-insights.com'
ORDER BY email;

-- Test 3: Check specific UUID 001
SELECT 'Test 3: UUID 001 check' as test;
SELECT id, email, email_confirmed_at, encrypted_password, created_at
FROM auth.users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Test 4: Check auth.identities
SELECT 'Test 4: Identities for test users' as test;
SELECT i.id, i.user_id, i.provider, i.provider_id, u.email
FROM auth.identities i
LEFT JOIN auth.users u ON i.user_id = u.id
WHERE u.email LIKE '%@abr-insights.com'
ORDER BY u.email;

-- Test 5: Check for any constraint violations
SELECT 'Test 5: Check profiles foreign key' as test;
SELECT p.id, p.email, p.role,
       CASE WHEN u.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as auth_user_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email LIKE '%@abr-insights.com'
ORDER BY p.email;

-- Test 6: Check auth.users structure for any issues
SELECT 'Test 6: Auth users table structure' as test;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;
