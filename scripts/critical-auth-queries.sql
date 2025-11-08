-- Critical diagnostic queries - Run these one by one in Supabase SQL Editor

-- Query 1: Count total auth users
SELECT COUNT(*) as total_users FROM auth.users;

-- Query 2: Show all test account users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@abr-insights.com'
ORDER BY email;

-- Query 3: Check specific UUID 001
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Query 4: Check profiles vs auth.users matching
SELECT 
    p.id as profile_id, 
    p.email as profile_email, 
    p.role,
    u.id as auth_user_id,
    u.email as auth_email,
    CASE WHEN u.id IS NOT NULL THEN 'MATCHED' ELSE 'MISSING' END as status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email LIKE '%@abr-insights.com'
ORDER BY p.email;

-- Query 5: Check auth.identities
SELECT user_id, provider, provider_id, created_at
FROM auth.identities
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@abr-insights.com'
)
ORDER BY user_id;
