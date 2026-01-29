/**
 * Validate Supabase Database Schema
 *
 * This script checks the current state of the database to understand:
 * 1. What tables exist
 * 2. What columns exist in key tables (profiles, organizations, etc.)
 * 3. What triggers exist
 * 4. What views exist
 *
 * This helps us fix migration errors by understanding the actual database state.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Validating Supabase Database Schema...\n')
console.log('URL:', supabaseUrl)
console.log('Using key:', supabaseKey.substring(0, 20) + '...\n')

/**
 * Query to get all tables in the public schema
 */
async function getTables() {
  console.log('📊 Fetching tables...')

  // Try known tables approach since RPC might not be available
  const knownTables = [
    'profiles',
    'organizations',
    'roles',
    'permissions',
    'courses',
    'lessons',
    'quizzes',
    'content_categories',
    'enrollments',
    'lesson_progress',
    'quiz_attempts',
    'achievements',
    'user_achievements',
    'bookmarks',
    'tribunal_cases',
    'tribunal_cases_raw',
    'ingestion_jobs',
    'testimonials',
    'newsletter_subscribers',
    'course_reviews',
    'learning_streaks',
    'user_points',
  ]

  const existingTables = []
  for (const table of knownTables) {
    const { error: tableError } = await supabase.from(table).select('id').limit(1)
    if (!tableError || !tableError.message.includes('does not exist')) {
      existingTables.push({ table_name: table })
    }
  }

  return existingTables
}

/**
 * Query to get columns for a specific table
 */
async function getTableColumns(tableName) {
  const query = `
    SELECT 
      column_name, 
      data_type, 
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `

  // Try to query via Supabase REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ sql_query: query }),
  }).catch(() => null)

  if (!response || !response.ok) {
    // Fallback: Describe the table by querying it
    const { data, error } = await supabase.from(tableName).select('*').limit(0)
    if (error) {
      return null
    }
    // Can't get detailed column info, but we know the table exists
    return 'exists'
  }

  const result = await response.json()
  return result
}

/**
 * Check profiles table columns specifically
 */
async function checkProfilesColumns() {
  console.log('\n👤 Checking PROFILES table columns...')

  // Try to select specific columns we're interested in
  const columnsToCheck = [
    'id',
    'email',
    'first_name',
    'last_name',
    'full_name',
    'display_name',
    'role',
    'organization_id',
  ]

  const existingColumns = []

  for (const col of columnsToCheck) {
    const { error } = await supabase.from('profiles').select(col).limit(1)

    if (!error) {
      existingColumns.push(col)
      console.log(`  ✅ ${col}`)
    } else if (error.message.includes('does not exist')) {
      console.log(`  ❌ ${col} - DOES NOT EXIST`)
    }
  }

  return existingColumns
}

/**
 * Check if specific triggers exist
 */
async function checkTriggers() {
  console.log('\n🔧 Checking triggers...')

  // We can't easily query pg_trigger without elevated permissions
  // So we'll just note what we expect based on migrations
  console.log('  ℹ️  Note: Trigger validation requires database admin access')
  console.log('  ℹ️  All migrations now have DROP TRIGGER IF EXISTS statements')

  return true
}

/**
 * Check if specific views exist
 */
async function checkViews() {
  console.log('\n👁️  Checking views...')

  const viewsToCheck = [
    'vw_recent_ingestion_jobs',
    'vw_high_confidence_pending_cases',
    'vw_ingestion_error_summary',
  ]

  for (const view of viewsToCheck) {
    const { error } = await supabase.from(view).select('*').limit(1)

    if (!error) {
      console.log(`  ✅ ${view}`)
    } else if (error.message.includes('does not exist')) {
      console.log(`  ❌ ${view} - DOES NOT EXIST`)
    } else {
      console.log(`  ⚠️  ${view} - ${error.message}`)
    }
  }
}

/**
 * Main validation
 */
async function validate() {
  try {
    // Check tables
    const tables = await getTables()
    console.log(`\n✅ Found ${tables.length} tables in public schema:`)
    tables.forEach((t) => console.log(`  - ${t.table_name}`))

    // Check profiles columns
    const profilesColumns = await checkProfilesColumns()

    // Check if full_name exists
    const hasFullName = profilesColumns.includes('full_name')
    console.log('\n📋 PROFILES TABLE ANALYSIS:')
    console.log(`  Full name column exists: ${hasFullName ? '✅ YES' : '❌ NO'}`)

    if (!hasFullName) {
      console.log('\n⚠️  ISSUE IDENTIFIED:')
      console.log('  The profiles table does NOT have a "full_name" column.')
      console.log('  Migration 005_ingestion_pipeline.sql references "p.full_name"')
      console.log('  in the vw_recent_ingestion_jobs view.')
      console.log('\n💡 SOLUTION:')
      console.log("  Option 1: Use CONCAT(first_name, ' ', last_name) instead")
      console.log('  Option 2: Use display_name if it exists')
      console.log('  Option 3: Add full_name column to profiles table')
    }

    // Check triggers
    await checkTriggers()

    // Check views
    await checkViews()

    console.log('\n✅ Validation complete!\n')
  } catch (error) {
    console.error('\n❌ Validation error:', error.message)
    if (error.details) console.error('Details:', error.details)
    if (error.hint) console.error('Hint:', error.hint)
    process.exit(1)
  }
}

validate()
