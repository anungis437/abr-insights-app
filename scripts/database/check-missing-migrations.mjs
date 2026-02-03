#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdir } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Checking Database Schema and Missing Migrations...\n')

// Expected tables from migrations
const expectedTables = [
  // From 001_initial_schema.sql
  'profiles',
  'organizations',

  // From 003_content_tables.sql
  'courses',
  'lessons',
  'tribunal_cases',
  'resources',

  // From 004_user_engagement.sql
  'enrollments',
  'lesson_progress',

  // From 011_newsletter_subscribers.sql
  'newsletter_subscribers',

  // From 013_testimonials.sql
  'testimonials',

  // From 015_ai_training_system.sql
  'ai_chat_sessions',
  'ai_chat_messages',

  // From 017_courses_enhancement_phase1.sql
  'course_modules',
  'quiz_questions',
  'quiz_attempts',

  // From 019_courses_gamification.sql
  'user_points',
  'achievements',
  'user_achievements',
  'leaderboard',
  'study_buddies',
  'buddy_requests',

  // From 20250115000002_watch_history.sql
  'watch_history',

  // From 20250115000003_quiz_system.sql
  'quiz_sessions',
  'quiz_responses',

  // From 20250115000004_certificates.sql
  'certificates',

  // From 20250115000005_ce_credit_tracking.sql
  'ce_credits',
  'ce_credit_claims',

  // From 20250115000006_skills_validation.sql
  'skills',
  'user_skills',

  // From 20250116000001_enterprise_sso_auth.sql
  'sso_providers',
  'sso_connections',

  // From 20250116000002_advanced_rbac.sql
  'permissions',
  'roles',
  'role_permissions',
  'user_roles',

  // From 20250116000003_audit_logs_enhancement.sql
  'audit_logs',

  // From 20250116000004_ingestion_pipeline.sql
  'ingestion_jobs',
  'ingestion_sources',

  // From 20250116000006_gamification_social.sql
  'user_activities',
  'comments',
  'reactions',
]

// Expected functions
const expectedFunctions = [
  'get_tribunal_case_stats',
  'search_tribunal_cases',
  'get_user_progress',
  'calculate_user_points',
  'get_leaderboard',
]

try {
  // Get existing tables
  const { data: existingTables, error: tablesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `,
  })

  // If exec_sql doesn't exist, try direct query
  let tables = []
  if (tablesError) {
    // Try using postgrest API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_tables`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      // Fallback: try to query a known table to see what exists
      console.log('⚠️  Cannot query schema directly, checking tables individually...\n')

      for (const table of expectedTables) {
        const { error } = await supabase.from(table).select('*').limit(0)
        if (!error) {
          tables.push(table)
        }
      }
    }
  } else {
    tables = existingTables.map((t) => t.table_name)
  }

  console.log(`✅ Found ${tables.length} tables in database\n`)

  // Check for missing tables
  const missingTables = expectedTables.filter((t) => !tables.includes(t))
  const existingExpectedTables = expectedTables.filter((t) => tables.includes(t))

  if (existingExpectedTables.length > 0) {
    console.log('✅ Existing Tables:')
    existingExpectedTables.forEach((t) => console.log(`   - ${t}`))
    console.log('')
  }

  if (missingTables.length > 0) {
    console.log('❌ Missing Tables:')
    missingTables.forEach((t) => console.log(`   - ${t}`))
    console.log('')
  }

  // Check for functions
  console.log('🔧 Checking Database Functions...\n')

  const missingFunctions = []
  for (const fn of expectedFunctions) {
    const { error } = await supabase.rpc(fn).limit(0)
    if (error && error.code === '42883') {
      // function does not exist
      missingFunctions.push(fn)
    }
  }

  if (missingFunctions.length > 0) {
    console.log('❌ Missing Functions:')
    missingFunctions.forEach((f) => console.log(`   - ${f}()`))
    console.log('')
  }

  // List migration files
  console.log('📁 Available Migration Files:\n')
  const migrationsDir = join(__dirname, 'supabase', 'migrations')
  const files = await readdir(migrationsDir)
  const sqlFiles = files.filter((f) => f.endsWith('.sql') && !f.startsWith('SKIP_')).sort()

  sqlFiles.forEach((file, i) => {
    console.log(`   ${i + 1}. ${file}`)
  })
  console.log('')

  // Map missing tables to likely migrations
  console.log('📋 Suggested Migrations to Run:\n')

  const migrationMap = {
    tribunal_cases: ['003_content_tables.sql', '012_tribunal_case_stats_rpc.sql'],
    courses: ['003_content_tables.sql'],
    lessons: ['003_content_tables.sql'],
    quiz_questions: ['20250115000003_quiz_system.sql'],
    quiz_sessions: ['20250115000003_quiz_system.sql'],
    watch_history: ['20250115000002_watch_history.sql'],
    certificates: ['20250115000004_certificates.sql'],
    ce_credits: ['20250115000005_ce_credit_tracking.sql'],
    skills: ['20250115000006_skills_validation.sql'],
    permissions: ['20250116000002_advanced_rbac.sql'],
    roles: ['20250116000002_advanced_rbac.sql'],
    user_points: ['019_courses_gamification.sql'],
    achievements: ['019_courses_gamification.sql'],
    leaderboard: ['019_courses_gamification.sql'],
    study_buddies: ['020116000006_gamification_social.sql'],
    sso_providers: ['20250116000001_enterprise_sso_auth.sql'],
    audit_logs: ['20250116000003_audit_logs_enhancement.sql'],
  }

  const suggestedMigrations = new Set()
  missingTables.forEach((table) => {
    if (migrationMap[table]) {
      migrationMap[table].forEach((m) => suggestedMigrations.add(m))
    }
  })

  if (suggestedMigrations.size > 0) {
    console.log('   Run these migrations in order:')
    ;[...suggestedMigrations].sort().forEach((m, i) => {
      console.log(`   ${i + 1}. ${m}`)
    })
  } else {
    console.log(
      '   ✅ All core tables exist! Consider running remaining migrations for full features.'
    )
  }

  console.log('\n🌐 Migration Dashboard:')
  console.log(`   https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql\n`)
} catch (err) {
  console.error('❌ Error:', err.message)
  process.exit(1)
}
