/**
 * Apply Remaining Migrations
 * Applies only migrations that haven't been applied to remote database yet
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Migrations that need to be applied (not yet on remote)
const PENDING_MIGRATIONS = [
  '020_evidence_bundles_tracking.sql',
  '022_support_individual_users.sql',
  '20250129000003_case_alerts.sql',
  '20250129000004_organization_subscriptions.sql',
  '20250130000001_ai_interaction_logs.sql',
  '20260128000005_add_subscription_to_profiles.sql',
  '20260128000006_fix_rls_update_delete_policies.sql',
  '20260128000007_stripe_webhook_idempotency.sql',
  '20260131_atomic_seat_allocation.sql',
  '20260201_fix_ai_log_rpc_authorization.sql',
  '20260201_fix_public_stats_rpc.sql',
  '20260201_fix_seat_rpc_authorization.sql',
  '20260203000001_fix_user_points_rls.sql',
  '20260203_ai_usage_tracking.sql',
  '20260203_canlii_ingestion_tracking.sql',
  '20260203_org_offboarding.sql',
]

async function applyMigration(filename) {
  console.log(`\n📄 Applying migration: ${filename}`)

  const migrationPath = join(__dirname, 'supabase', 'migrations', filename)

  try {
    const sql = readFileSync(migrationPath, 'utf-8')

    // Split into individual statements (basic split on semicolon outside strings)
    const statements = sql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`  Found ${statements.length} statements`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length < 10) continue // Skip very short statements

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';',
        })

        if (error) {
          // Check if error is benign (already exists)
          if (
            error.message?.includes('already exists') ||
            error.code === '42P07' || // duplicate table
            error.code === '42710' || // duplicate object
            error.code === '42P16' // invalid table definition
          ) {
            console.log(`    ⚠️  Statement ${i + 1}: Already exists (skipping)`)
          } else {
            console.error(`    ❌ Statement ${i + 1} failed:`, error.message)
            throw error
          }
        } else {
          console.log(`    ✅ Statement ${i + 1} executed`)
        }
      } catch (err) {
        console.error(`    ❌ Error executing statement ${i + 1}:`, err.message)
        console.error(`    Statement: ${statement.substring(0, 100)}...`)
        throw err
      }
    }

    console.log(`  ✅ Migration ${filename} completed successfully`)
    return true
  } catch (error) {
    console.error(`  ❌ Failed to apply migration ${filename}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting migration application...\n')
  console.log(`Found ${PENDING_MIGRATIONS.length} pending migrations\n`)

  let successCount = 0
  let failCount = 0

  for (const migration of PENDING_MIGRATIONS) {
    const success = await applyMigration(migration)
    if (success) {
      successCount++
    } else {
      failCount++
      console.log('\n⚠️  Stopping at first failure. Fix issues and re-run.\n')
      break
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⏳ Remaining: ${PENDING_MIGRATIONS.length - successCount - failCount}`)
  console.log('='.repeat(60) + '\n')

  if (failCount === 0) {
    console.log('🎉 All migrations applied successfully!\n')

    // Verify critical changes
    console.log('🔍 Verifying critical schema changes...\n')

    const { data: enrollmentsCheck } = await supabase.rpc('exec_sql', {
      sql_query: `SELECT is_nullable FROM information_schema.columns 
                  WHERE table_name = 'enrollments' AND column_name = 'organization_id';`,
    })

    console.log('Enrollments.organization_id nullable:', enrollmentsCheck)

    process.exit(0)
  } else {
    console.log('⚠️  Some migrations failed. Review errors and retry.\n')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
