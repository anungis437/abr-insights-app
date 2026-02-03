-- RLS Validation Check
-- This script identifies tables without Row Level Security enabled
-- Run this in Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status,
    CASE 
        WHEN rowsecurity THEN 
            (SELECT COUNT(*) 
             FROM pg_policies 
             WHERE schemaname = t.schemaname 
             AND tablename = t.tablename)
        ELSE 0
    END as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY 
    CASE WHEN rowsecurity THEN 0 ELSE 1 END,
    tablename;

-- List tables WITHOUT RLS (CRITICAL SECURITY ISSUE)
SELECT 
    '⚠️ CRITICAL: Table without RLS' as alert,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
ORDER BY tablename;

-- Show all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
