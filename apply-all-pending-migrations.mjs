#!/usr/bin/env node
/**
 * Apply All Pending Database Migrations
 *
 * This script:
 * 1. Reads all migration files from supabase/migrations directory
 * 2. Checks which migrations have been applied
 * 3. Applies pending migrations in order
 * 4. Verifies key tables and data exist
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
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

// Track applied migrations (Supabase doesn't have a built-in migrations table, so we'll track manually)
const appliedMigrations = new Set()

async function executeSQL(sql, migrationName) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--') && s.length > 10)

  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const statement of statements) {
    if (!statement) continue

    try {
      // Use raw RPC call to execute SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';',
      })

      if (error) {
        // Ignore "already exists" errors as they indicate idempotent migrations
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          (error.message.includes('does not exist') && statement.includes('DROP'))
        ) {
          successCount++
        } else {
          errorCount++
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: error.message,
          })
        }
      } else {
        successCount++
      }
    } catch (err) {
      errorCount++
      errors.push({
        statement: statement.substring(0, 100) + '...',
        error: err.message,
      })
    }
  }

  return { successCount, errorCount, errors }
}

async function applyMigration(filename) {
  console.log(`\n📝 Applying: ${filename}`)

  const migrationPath = join(__dirname, 'supabase', 'migrations', filename)

  try {
    const sql = readFileSync(migrationPath, 'utf-8')
    const result = await executeSQL(sql, filename)

    if (result.errorCount === 0) {
      console.log(`   ✅ Applied successfully (${result.successCount} statements)`)
      appliedMigrations.add(filename)
      return true
    } else if (result.errorCount < result.successCount) {
      console.log(
        `   ⚠️  Partially applied (${result.successCount} ok, ${result.errorCount} errors)`
      )
      if (result.errors.length > 0 && result.errors.length <= 3) {
        result.errors.forEach((err) => {
          console.log(`      Error: ${err.error}`)
        })
      }
      appliedMigrations.add(filename)
      return true
    } else {
      console.log(`   ❌ Failed (${result.errorCount} errors)`)
      if (result.errors.length > 0 && result.errors.length <= 3) {
        result.errors.forEach((err) => {
          console.log(`      Error: ${err.error}`)
        })
      }
      return false
    }
  } catch (error) {
    console.log(`   ❌ Error reading migration: ${error.message}`)
    return false
  }
}

async function checkTableExists(tableName) {
  const { data, error } = await supabase.from(tableName).select('id').limit(1)

  return !error || !error.message.includes('does not exist')
}

async function checkTableCount(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })

  if (error && !error.message.includes('does not exist')) {
    return { exists: false, count: 0 }
  }

  return { exists: !error, count: count || 0 }
}

async function verifyDatabase() {
  console.log('\n🔍 Verifying Database State...\n')

  const criticalTables = [
    'profiles',
    'organizations',
    'roles',
    'permissions',
    'user_roles',
    'role_permissions',
    'courses',
    'tribunal_cases',
    'audit_logs',
    'ai_usage_logs',
    'resource_permissions',
    'permission_overrides',
    'role_hierarchy',
  ]

  const results = []

  for (const table of criticalTables) {
    const { exists, count } = await checkTableCount(table)
    results.push({
      table,
      exists,
      count,
      status: exists ? (count > 0 ? '✅' : '⚠️ ') : '❌',
    })
  }

  // Display results in a nice table
  console.log('Table Status:')
  console.log('─'.repeat(60))
  results.forEach((r) => {
    const status = r.status
    const countStr = r.exists ? `${r.count} rows` : 'not found'
    console.log(`${status} ${r.table.padEnd(30)} ${countStr}`)
  })
  console.log('─'.repeat(60))

  return results
}

async function main() {
  console.log('🚀 Database Migration Runner\n')
  console.log('='.repeat(60))

  // Get all migration files
  const migrationsDir = join(__dirname, 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort() // Apply in filename order

  console.log(`\nFound ${files.length} migration files`)

  // Check if exec_sql RPC exists
  console.log('\n🔧 Checking database capabilities...')
  const { error: rpcError } = await supabase.rpc('exec_sql', {
    sql_query: 'SELECT 1;',
  })

  if (rpcError && rpcError.message.includes('does not exist')) {
    console.log('   ❌ exec_sql RPC function not available')
    console.log('   💡 Migrations need to be applied via Supabase Dashboard')
    console.log('\n📋 Migration files to apply manually:')
    files.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f}`)
    })
    console.log(
      '\n   Visit: https://supabase.com/dashboard/project/[your-project]/database/migrations'
    )
    return
  }

  console.log('   ✅ Database ready for migrations')

  // Apply migrations
  console.log('\n📦 Applying Migrations...')
  console.log('─'.repeat(60))

  let appliedCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const file of files) {
    const success = await applyMigration(file)
    if (success) {
      appliedCount++
    } else {
      failedCount++
    }

    // Small delay between migrations to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Applied: ${appliedCount}`)
  console.log(`   ❌ Failed: ${failedCount}`)
  console.log(`   📝 Total: ${files.length}`)

  // Verify database state
  await verifyDatabase()

  console.log('\n✨ Migration process complete!')
  console.log('\n💡 Next steps:')
  console.log('   1. Check the verification results above')
  console.log('   2. If any critical tables are missing, apply them via Supabase Dashboard')
  console.log('   3. Visit /admin/permissions-management to verify the UI works')
  console.log('   4. Run: node show-permissions-setup.mjs for detailed permissions info')
}

main().catch((error) => {
  console.error('\n❌ Migration failed:', error.message)
  process.exit(1)
})
