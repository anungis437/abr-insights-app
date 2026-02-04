-- Fix enrollment RLS policy - simplify to not rely on helper function
-- Run this in Supabase Dashboard SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;

-- Recreate with simpler logic that doesn't call the helper function
CREATE POLICY "Users can view own enrollments"
ON enrollments FOR SELECT
USING (
  -- Users can see their own enrollments
  user_id = auth.uid()
  OR
  -- OR users can see enrollments in their organization
  (
    organization_id IS NOT NULL 
    AND organization_id = (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual::text as using_expression
FROM pg_policies
WHERE tablename = 'enrollments' 
  AND policyname = 'Users can view own enrollments';
