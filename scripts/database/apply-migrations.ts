/**
 * Apply Supabase migrations programmatically
 * Run this to set up the ingestion_jobs and tribunal_cases_raw tables
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function applyMigrations() {
  console.log('🔧 Applying Supabase migrations for ingestion pipeline...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Read the ingestion pipeline migration
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '005_ingestion_pipeline.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  console.log(`📄 Reading migration: ${migrationPath}`)
  console.log(`   Size: ${migrationSQL.length} bytes\n`)

  try {
    // Split by statement blocks (simplified - assumes ; at end of statements)
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute\n`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]

      // Skip comments and empty lines
      if (stmt.startsWith('--') || stmt.trim().length === 0) {
        continue
      }

      console.log(`[${i + 1}/${statements.length}] Executing statement...`)

      const { error } = await supabase.rpc('exec_sql', {
        sql: stmt + ';',
      })

      if (error) {
        console.error(`   ❌ Error: ${error.message}`)

        // Try direct execution via from() if rpc doesn't work
        // This won't work for CREATE TABLE, but helps diagnose
        console.log(`   Attempting direct execution...`)

        // For testing purposes, we'll just log the error and continue
        // In production, you'd want to stop on errors
        console.log(`   Statement preview: ${stmt.substring(0, 100)}...`)
      } else {
        console.log(`   ✅ Success`)
      }
    }

    console.log('\n✅ Migration application complete!')
    console.log('\n📊 Verifying tables...')

    // Verify tables exist
    const tables = ['tribunal_cases_raw', 'ingestion_jobs', 'ingestion_errors']

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)

      if (error) {
        console.log(`   ❌ Table '${table}' not accessible: ${error.message}`)
      } else {
        console.log(`   ✅ Table '${table}' exists and is accessible`)
      }
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  }
}

// Note: Supabase doesn't support executing arbitrary SQL via the client library for security.
// You need to either:
// 1. Use the Supabase CLI: npx supabase db push
// 2. Copy/paste SQL into the Supabase SQL Editor dashboard
// 3. Use a direct PostgreSQL connection

console.log('⚠️  Note: Supabase client library cannot execute DDL statements.\n')
console.log('To apply migrations, you have 3 options:\n')
console.log('1. Use Supabase CLI:')
console.log('   npx supabase link --project-ref nuywgvbkgdvngrysqdul')
console.log('   npx supabase db push\n')
console.log('2. Use Supabase Dashboard SQL Editor:')
console.log('   - Go to https://app.supabase.com/project/nuywgvbkgdvngrysqdul/editor')
console.log('   - Copy/paste contents of supabase/migrations/005_ingestion_pipeline.sql')
console.log('   - Click "Run"\n')
console.log('3. Use direct PostgreSQL connection (advanced)')
console.log('   - Get connection string from Supabase dashboard')
console.log('   - Use psql or pg client to execute migration\n')

applyMigrations().catch(console.error)
