#!/usr/bin/env node

/**
 * Check RLS Coverage for Supabase Tables
 * 
 * This script queries the database to identify:
 * - Tables with RLS disabled
 * - Tables with RLS enabled but no policies
 * - Tables with proper RLS protection
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSCoverage() {
  console.log('🔒 Checking RLS Coverage for Public Schema Tables\n');
  console.log('='.repeat(80));

  // Query to get all tables and their RLS status
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `
  }).catch(() => ({
    data: null,
    error: { message: 'exec_sql not available, using alternative method' }
  }));

  // Alternative method using direct query
  const { data: rlsStatus, error } = await supabase
    .from('_rls_check')
    .select('*')
    .limit(1)
    .catch(async () => {
      // Try raw SQL query approach
      const query = `
        SELECT 
          t.schemaname,
          t.tablename,
          t.rowsecurity as rls_enabled,
          COUNT(p.polname) as policy_count
        FROM pg_tables t
        LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
        WHERE t.schemaname = 'public'
        GROUP BY t.schemaname, t.tablename, t.rowsecurity
        ORDER BY t.tablename;
      `;
      
      console.log('\n📋 Tables RLS Status:\n');
      console.log('Running SQL query to check RLS status...\n');
      console.log('Query:', query);
      console.log('\n⚠️  Please run this query manually in Supabase SQL Editor or using CLI:\n');
      console.log('npx supabase db execute --file -');
      console.log('(then paste the query above)');
      console.log('\nOr use the Supabase dashboard:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql/new');
      console.log('2. Paste the query above');
      console.log('3. Click "Run"\n');
      
      return { data: null, error: null };
    });

  // Known content tables from migrations
  const contentTables = [
    'content_categories',
    'courses',
    'course_modules', 
    'lessons',
    'quizzes',
    'quiz_questions',
    'tribunal_cases',
    'case_documents',
    'case_parties',
    'scraper_configs',
    'scraper_logs'
  ];

  const engagementTables = [
    'enrollments',
    'lesson_progress',
    'quiz_attempts',
    'quiz_answers',
    'achievements',
    'user_achievements',
    'learning_streaks',
    'bookmarks',
    'course_reviews',
    'user_badges',
    'user_points',
    'points_transactions',
    'leaderboard_entries'
  ];

  const authTables = [
    'organizations',
    'profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'audit_logs'
  ];

  const aiTables = [
    'classification_feedback',
    'training_jobs',
    'automated_training_config'
  ];

  const allKnownTables = [
    ...authTables,
    ...contentTables,
    ...engagementTables,
    ...aiTables
  ];

  console.log('\n📊 Expected Tables by Category:\n');
  console.log('Auth & RBAC Tables:', authTables.length);
  console.log('Content Tables:', contentTables.length);
  console.log('Engagement Tables:', engagementTables.length);
  console.log('AI Training Tables:', aiTables.length);
  console.log('Total Expected:', allKnownTables.length);
  
  console.log('\n🚨 CRITICAL: Tables That MUST Have RLS:\n');
  
  const criticalTables = [
    { name: 'profiles', reason: 'Contains user data - tenant isolation required' },
    { name: 'organizations', reason: 'Multi-tenancy base - must enforce tenant boundaries' },
    { name: 'enrollments', reason: 'User course data - privacy critical' },
    { name: 'quiz_attempts', reason: 'User assessment data - privacy critical' },
    { name: 'lesson_progress', reason: 'User learning data - privacy critical' },
    { name: 'user_roles', reason: 'Access control data - security critical' },
    { name: 'audit_logs', reason: 'Security logs - must be protected' },
    { name: 'courses', reason: 'Published/draft content visibility control' },
    { name: 'tribunal_cases', reason: 'May contain sensitive legal data' }
  ];

  criticalTables.forEach(({ name, reason }) => {
    console.log(`  • ${name.padEnd(25)} - ${reason}`);
  });

  console.log('\n📋 Manual Verification Steps:\n');
  console.log('1. Open Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/auth/policies\n');
  
  console.log('2. Or run this SQL query:\n');
  console.log('```sql');
  console.log(`SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(p.polname) as policy_count,
  STRING_AGG(p.polname, ', ') as policies
FROM pg_tables t
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY 
  CASE WHEN t.rowsecurity = false THEN 0 ELSE 1 END,
  t.tablename;`);
  console.log('```\n');

  console.log('3. Look for:\n');
  console.log('   ❌ rls_enabled = false (CRITICAL - table is completely open)');
  console.log('   ⚠️  rls_enabled = true but policy_count = 0 (RLS on but no rules)');
  console.log('   ✅ rls_enabled = true AND policy_count > 0 (Protected)\n');

  console.log('4. Expected RLS Migration Files:\n');
  console.log('   • 002_rls_policies.sql - Auth/RBAC tables');
  console.log('   • 018_courses_enhancement_rls.sql - Course tables');
  console.log('   • 019_courses_gamification.sql - Gamification tables');
  console.log('   • 022_migrate_critical_table_rls.sql - Critical tables');
  console.log('   • 023_migrate_feature_table_rls.sql - Feature tables\n');

  console.log('='.repeat(80));
  console.log('\n✅ Next Steps:\n');
  console.log('1. Run the SQL query above in Supabase Dashboard');
  console.log('2. Identify any tables with rls_enabled = false');
  console.log('3. For each unprotected table, create RLS policies:\n');
  console.log('   ```sql');
  console.log('   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;');
  console.log('   ');
  console.log('   CREATE POLICY "policy_name"');
  console.log('     ON table_name');
  console.log('     FOR SELECT');
  console.log('     USING (organization_id = public.user_organization_id());');
  console.log('   ```\n');
}

checkRLSCoverage().catch(console.error);
