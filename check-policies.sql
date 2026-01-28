-- Check all UPDATE/DELETE policies on critical tables
SELECT 
  tablename, 
  policyname, 
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('courses', 'organizations', 'enrollments') 
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, cmd, permissive DESC, policyname;
