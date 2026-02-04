-- Test RLS policies for enrollments as authenticated user
-- Run this in Supabase SQL Editor

-- First, check current policies
SELECT 
  policyname,
  cmd,
  qual::text as using_clause
FROM pg_policies
WHERE tablename = 'enrollments' AND cmd = 'SELECT';

-- Test as the learner user
-- This simulates what happens when the frontend queries
SET SESSION AUTHORIZATION authenticated;
SET request.jwt.claims.sub TO 'c0707e9e-85f6-4941-bc1f-d99f70240ec3';

-- Try to select the enrollment
SELECT id, user_id, course_id, organization_id, status
FROM enrollments
WHERE user_id = 'c0707e9e-85f6-4941-bc1f-d99f70240ec3'::uuid
  AND course_id = 'f1663c19-96e6-4734-856e-78bd248e2563'::uuid;

-- Reset
RESET SESSION AUTHORIZATION;
