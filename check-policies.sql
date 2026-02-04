-- Check RLS policies on enrollments table
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'enrollments'
ORDER BY policyname;
