-- Recreate profiles for the new auth users
-- Run this in Supabase Dashboard SQL Editor

INSERT INTO profiles (id, email, first_name, last_name, display_name, role, created_at, updated_at)
VALUES
  ('3f0ce95a-1fe5-476e-b2d2-0272b7a16571', 'super_admin@abr-insights.com', 'Super', 'Admin', 'Super Admin', 'super_admin', NOW(), NOW()),
  ('ecc829ca-9479-4cd5-b828-716e8c313071', 'compliance@abr-insights.com', 'Compliance', 'Officer', 'Compliance Officer', 'compliance_officer', NOW(), NOW()),
  ('136577df-0660-484e-82da-1d543d04e978', 'orgadmin@abr-insights.com', 'Org', 'Admin', 'Org Admin', 'org_admin', NOW(), NOW()),
  ('bdd9f78c-6cbf-49c3-b988-afc8c6e67747', 'analyst@abr-insights.com', 'Data', 'Analyst', 'Data Analyst', 'analyst', NOW(), NOW()),
  ('12ce83db-17e8-4bf1-b7f9-4d4eae0351fd', 'investigator@abr-insights.com', 'Case', 'Investigator', 'Case Investigator', 'investigator', NOW(), NOW()),
  ('c1222a0c-1bd3-419f-a1c1-af3dff4e0beb', 'educator@abr-insights.com', 'Training', 'Educator', 'Training Educator', 'educator', NOW(), NOW()),
  ('7ae13300-1fc1-4962-ad81-48c5012a2575', 'learner@abr-insights.com', 'Active', 'Learner', 'Active Learner', 'learner', NOW(), NOW()),
  ('835cd4c7-d635-4117-a4e2-d42ce8c0c32b', 'viewer@abr-insights.com', 'Report', 'Viewer', 'Report Viewer', 'viewer', NOW(), NOW()),
  ('5c9993e8-e6e5-48e4-bd4b-1747811f2191', 'guest@abr-insights.com', 'Guest', 'User', 'Guest User', 'guest', NOW(), NOW());

-- Verify the inserts
SELECT p.id, p.email, p.role, u.email as auth_email, 
       CASE WHEN u.id IS NOT NULL THEN 'MATCHED' ELSE 'MISSING' END as status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email LIKE '%@abr-insights.com'
ORDER BY p.email;
