#!/usr/bin/env node
/**
 * Migration Status Check & Application Guide
 *
 * Since Supabase doesn't allow direct SQL execution via API for security,
 * this script checks the database state and provides instructions for
 * applying any missing migrations via Supabase Dashboard or CLI.
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTable(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (error && error.message.includes('does not exist')) {
    return { exists: false, count: 0 }
  }

  return { exists: true, count: count || 0 }
}

async function checkFunction(functionName) {
  try {
    const { error } = await supabase.rpc(functionName)
    // Function exists if we get any response (even if it fails due to missing params)
    return !error || !error.message.includes('does not exist')
  } catch {
    return false
  }
}

async function analyzeDatabase() {
  console.log('🔍 Analyzing Database State...\n')
  console.log('='.repeat(70))

  // Core tables from initial schema
  const coreTables = {
    'Core Identity & Auth': ['profiles', 'organizations'],
    'RBAC System': ['roles', 'permissions', 'user_roles', 'role_permissions'],
    'Advanced RBAC': [
      'resource_permissions',
      'permission_overrides',
      'role_hierarchy',
      'permission_cache',
    ],
    Content: ['courses', 'lessons', 'modules', 'quizzes', 'questions'],
    Cases: ['tribunal_cases', 'case_embeddings', 'case_outcomes'],
    Gamification: ['achievements', 'user_achievements', 'user_points', 'leaderboards'],
    'AI & ML': ['ai_usage_logs', 'ai_training_jobs', 'embeddings', 'outcome_predictions'],
    Engagement: ['certificates', 'ce_credits', 'skills', 'watch_history', 'lesson_notes'],
    Collaboration: ['study_groups', 'group_members', 'discussion_posts'],
    Compliance: ['audit_logs', 'evidence_bundles', 'case_alerts'],
    Enterprise: ['sso_providers', 'sso_sessions', 'organization_subscriptions'],
  }

  const results = {}

  for (const [category, tables] of Object.entries(coreTables)) {
    console.log(`\n📦 ${category}:`)
    results[category] = []

    for (const table of tables) {
      const { exists, count } = await checkTable(table)
      const status = exists ? (count > 0 ? '✅' : '⚠️ ') : '❌'
      const info = exists ? `${count} rows` : 'NOT FOUND'
      console.log(`   ${status} ${table.padEnd(30)} ${info}`)
      results[category].push({ table, exists, count })
    }
  }

  return results
}

async function checkCriticalFeatures() {
  console.log('\n\n🔧 Critical Features Check:\n')
  console.log('='.repeat(70))

  // Check for critical RPC functions
  const functions = [
    'get_user_stats',
    'get_tribunal_case_stats',
    'check_seat_limit',
    'log_ai_usage',
    'has_permission',
  ]

  console.log('\n📋 RPC Functions:')
  for (const fn of functions) {
    const exists = await checkFunction(fn)
    const status = exists ? '✅' : '❌'
    console.log(`   ${status} ${fn}`)
  }

  // Check for extensions
  console.log('\n🔌 Extensions:')
  const { data: extensions } = await supabase
    .from('pg_extension')
    .select('extname')
    .in('extname', ['uuid-ossp', 'pgcrypto', 'vector'])

  const extNames = extensions?.map((e) => e.extname) || []
  const requiredExts = ['uuid-ossp', 'pgcrypto', 'vector']

  for (const ext of requiredExts) {
    const exists = extNames.includes(ext)
    const status = exists ? '✅' : '❌'
    console.log(`   ${status} ${ext}`)
  }
}

function getMigrationRecommendations(results) {
  console.log('\n\n💡 Recommendations:\n')
  console.log('='.repeat(70))

  const missingCategories = Object.entries(results)
    .filter(([_, tables]) => tables.some((t) => !t.exists))
    .map(([category]) => category)

  if (missingCategories.length === 0) {
    console.log('\n✅ All core tables exist! Your database is fully migrated.')
    console.log('\n💡 Next steps:')
    console.log('   1. Visit /admin/permissions-management to manage permissions')
    console.log('   2. Visit /admin/dashboard to see real metrics')
    console.log('   3. Test role-based access with different user accounts')
    return
  }

  console.log(`\n⚠️  Missing tables in ${missingCategories.length} categories:`)
  missingCategories.forEach((cat) => console.log(`   - ${cat}`))

  console.log('\n📝 To apply missing migrations:\n')
  console.log('Option 1: Using Supabase CLI (Recommended)')
  console.log('   1. Install: npm install -g supabase')
  console.log('   2. Link project: supabase link --project-ref [your-project-ref]')
  console.log('   3. Apply migrations: supabase db push')

  console.log('\nOption 2: Using Supabase Dashboard')
  console.log('   1. Go to: https://supabase.com/dashboard/project/[project]/database')
  console.log('   2. Navigate to "Migrations" tab')
  console.log('   3. Click "Create migration" → "From SQL file"')
  console.log('   4. Upload migration files from: ./supabase/migrations/')

  console.log('\nOption 3: Manual SQL Execution')
  console.log('   1. Go to SQL Editor in Supabase Dashboard')
  console.log('   2. Copy contents of migration files')
  console.log('   3. Execute each migration in order')

  // List specific migrations needed
  console.log('\n📋 Priority migrations to check:')
  const priorityMigrations = [
    '020_comprehensive_permissions_seed.sql - Adds category column to permissions',
    '20250116000002_advanced_rbac.sql - Creates advanced RBAC tables',
    '021_permission_based_rls_functions.sql - Adds permission check functions',
    '20250115000003_quiz_system.sql - Creates quiz and question tables',
    '20250116000005_migrate_gamification_schema.sql - Gamification tables',
  ]

  priorityMigrations.forEach((m) => console.log(`   • ${m}`))
}

async function main() {
  console.log('🚀 Database Migration Status Check\n')

  try {
    const results = await analyzeDatabase()
    await checkCriticalFeatures()
    getMigrationRecommendations(results)

    console.log('\n' + '='.repeat(70))
    console.log('\n✨ Analysis complete!')
    console.log('\n💾 Your Supabase project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('📁 Migration files location: ./supabase/migrations/')
    console.log('\n')
  } catch (error) {
    console.error('\n❌ Error analyzing database:', error.message)
    process.exit(1)
  }
}

main()
