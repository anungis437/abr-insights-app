-- Update profiles table to match new auth user UUIDs
-- Run this in Supabase Dashboard SQL Editor

UPDATE profiles SET id = '3f0ce95a-1fe5-476e-b2d2-0272b7a16571' WHERE email = 'super_admin@abr-insights.com';
UPDATE profiles SET id = 'ecc829ca-9479-4cd5-b828-716e8c313071' WHERE email = 'compliance@abr-insights.com';
UPDATE profiles SET id = '136577df-0660-484e-82da-1d543d04e978' WHERE email = 'orgadmin@abr-insights.com';
UPDATE profiles SET id = 'bdd9f78c-6cbf-49c3-b988-afc8c6e67747' WHERE email = 'analyst@abr-insights.com';
UPDATE profiles SET id = '12ce83db-17e8-4bf1-b7f9-4d4eae0351fd' WHERE email = 'investigator@abr-insights.com';
UPDATE profiles SET id = 'c1222a0c-1bd3-419f-a1c1-af3dff4e0beb' WHERE email = 'educator@abr-insights.com';
UPDATE profiles SET id = '7ae13300-1fc1-4962-ad81-48c5012a2575' WHERE email = 'learner@abr-insights.com';
UPDATE profiles SET id = '835cd4c7-d635-4117-a4e2-d42ce8c0c32b' WHERE email = 'viewer@abr-insights.com';
UPDATE profiles SET id = '5c9993e8-e6e5-48e4-bd4b-1747811f2191' WHERE email = 'guest@abr-insights.com';

-- Verify the updates
SELECT p.id, p.email, p.role, u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email LIKE '%@abr-insights.com'
ORDER BY p.email;
