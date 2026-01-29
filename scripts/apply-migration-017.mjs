/**
 * Apply Migration 017: Courses Enhancement Phase 1
 * This script applies the database migration directly to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials in environment')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('Applying Migration 017: Courses Enhancement Phase 1')
console.log('====================================================\n')

// Read migration file
const migrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '017_courses_enhancement_phase1.sql'
)
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

console.log(`Migration file loaded: ${migrationSQL.length} characters`)
console.log(`Tables to be created/modified:`)
console.log('  - course_modules (new)')
console.log('  - lessons (enhanced with 8 new columns)')
console.log('  - course_versions (new)')
console.log('  - learning_paths (new)')
console.log('  - course_reviews (new)')
console.log('  - course_discussions (new)')
console.log('  - enrollments (new)')
console.log('  - lesson_progress (new)')
console.log('  - quiz_attempts (new)')
console.log('  - learning_path_enrollments (new)\n')

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  try {
    console.log('Connecting to Supabase...')

    // Execute the migration SQL
    console.log('Executing migration SQL...\n')

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL,
    })

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('exec_sql RPC not found, trying direct execution...')

      // Split by semicolons and execute statements one by one
      const statements = migrationSQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))

      console.log(`Executing ${statements.length} SQL statements...`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';'

        // Skip comments
        if (statement.trim().startsWith('--')) continue

        // Show progress for table creation
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE[^(]+(\w+)/)
          if (match) {
            console.log(`  Creating table: ${match[1]}...`)
          }
        }

        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement,
        })

        if (stmtError) {
          console.error(`\nError executing statement ${i + 1}:`)
          console.error(stmtError.message)
          console.error('\nStatement:', statement.substring(0, 200))
          throw stmtError
        }
      }

      console.log('\nMigration applied successfully!')
    } else {
      console.log('Migration applied successfully!')
    }

    // Verify tables were created
    console.log('\nVerifying tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'course_modules',
        'course_versions',
        'learning_paths',
        'course_reviews',
        'course_discussions',
        'enrollments',
        'lesson_progress',
        'quiz_attempts',
        'learning_path_enrollments',
      ])

    if (tablesError) {
      console.log('Could not verify tables (this is OK)')
    } else if (tables) {
      console.log(`Created ${tables.length} new tables`)
    }

    console.log('\nNext steps:')
    console.log('1. Apply migration 018 for RLS policies')
    console.log('2. Test the new schema')
    console.log('3. Create service layer functions')
    console.log('4. Build UI components\n')

    process.exit(0)
  } catch (error) {
    console.error('\nMigration failed:')
    console.error(error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    if (error.hint) {
      console.error('Hint:', error.hint)
    }
    process.exit(1)
  }
}

applyMigration()
