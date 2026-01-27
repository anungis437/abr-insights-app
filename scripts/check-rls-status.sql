-- ============================================================================
-- RLS Coverage Check
-- Run this in Supabase SQL Editor to validate Row Level Security
-- ============================================================================

-- Check which tables have RLS enabled and how many policies they have
SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.polname) as policy_count,
  STRING_AGG(p.polname, E'\n    • ') as policies
FROM pg_tables t
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY 
  CASE WHEN t.rowsecurity = false THEN 0 ELSE 1 END,
  t.tablename;

-- ============================================================================
-- Summary Report
-- ============================================================================

DO $$
DECLARE
  unrestricted_count INTEGER;
  no_policies_count INTEGER;
  protected_count INTEGER;
  unrestricted_tables TEXT;
  no_policy_tables TEXT;
BEGIN
  -- Count unrestricted tables (RLS disabled)
  SELECT COUNT(*), STRING_AGG(tablename, ', ')
  INTO unrestricted_count, unrestricted_tables
  FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = false;
  
  -- Count tables with RLS but no policies
  SELECT COUNT(*), STRING_AGG(t.tablename, ', ')
  INTO no_policies_count, no_policy_tables
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
  WHERE t.schemaname = 'public' 
    AND t.rowsecurity = true
  GROUP BY t.rowsecurity
  HAVING COUNT(p.polname) = 0;
  
  -- Count protected tables
  SELECT COUNT(DISTINCT t.tablename)
  INTO protected_count
  FROM pg_tables t
  INNER JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
  WHERE t.schemaname = 'public' AND t.rowsecurity = true;
  
  -- Output summary
  RAISE NOTICE E'\n=============================================================================';
  RAISE NOTICE 'RLS SECURITY SUMMARY';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Protected Tables (RLS enabled + policies):     %', COALESCE(protected_count, 0);
  RAISE NOTICE '⚠️  RLS Enabled but No Policies:                  %', COALESCE(no_policies_count, 0);
  RAISE NOTICE '❌ UNRESTRICTED (RLS disabled):                   %', COALESCE(unrestricted_count, 0);
  RAISE NOTICE '';
  
  IF unrestricted_count > 0 THEN
    RAISE NOTICE '❌ CRITICAL: Tables without RLS protection:';
    RAISE NOTICE '   %', unrestricted_tables;
    RAISE NOTICE '';
  END IF;
  
  IF no_policies_count > 0 THEN
    RAISE NOTICE '⚠️  WARNING: Tables with RLS enabled but no policies:';
    RAISE NOTICE '   %', COALESCE(no_policy_tables, 'None');
    RAISE NOTICE '   (These tables are effectively locked down - no one can access)';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '=============================================================================';
END $$;
