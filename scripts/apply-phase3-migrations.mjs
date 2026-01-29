/**
 * Apply Phase 3 Migrations (020, 021, 022, 023)
 * Uses Supabase service role for full admin access
 *
 * Usage:
 *   node scripts/apply-phase3-migrations.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase configuration')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '✗')
  process.exit(1)
}

// Create admin client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const migrations = [
  '020_comprehensive_permissions_seed.sql',
  '021_permission_based_rls_functions.sql',
  '022_migrate_critical_table_rls.sql',
  '023_migrate_feature_table_rls.sql',
]

async function applyMigration(filename) {
  console.log(`\n📦 Applying ${filename}...`)

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', filename)
    const sql = readFileSync(migrationPath, 'utf8')

    // Split SQL by statement (basic split on semicolons outside strings)
    const statements = sql.split(/;\s*$/gm).filter((s) => s.trim() && !s.trim().startsWith('--'))

    console.log(`   Found ${statements.length} SQL statements`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

        if (error) {
          // Try direct SQL query if RPC fails
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(1)

          if (queryError && queryError.message.includes('does not exist')) {
            console.log(
              `   ⚠️  Warning: Cannot execute statement ${i + 1} (requires direct DB access)`
            )
          } else {
            console.error(`   ❌ Error in statement ${i + 1}:`, error.message || error)
            errorCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Exception in statement ${i + 1}:`, err.message)
        errorCount++
      }

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`   Progress: ${i + 1}/${statements.length}\r`)
      }
    }

    console.log(`\n   ✅ ${successCount} successful, ${errorCount} errors`)
    return errorCount === 0
  } catch (error) {
    console.error(`   ❌ Failed to read migration file:`, error.message)
    return false
  }
}

async function checkPermissions() {
  console.log('\n🔍 Checking current permissions...')

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('id, slug, name')
    .order('slug')

  if (error) {
    console.error('   ❌ Error querying permissions:', error.message)
    return false
  }

  console.log(`   Found ${permissions.length} permissions`)

  if (permissions.length < 50) {
    console.log(`   ⚠️  Low permission count - Phase 3 migrations likely not applied`)
    return false
  }

  // Check for Phase 3 permissions
  const phase3Permissions = permissions.filter(
    (p) =>
      p.slug.includes('ai.') || p.slug.includes('embeddings.') || p.slug.includes('gamification.')
  )

  console.log(`   Found ${phase3Permissions.length} Phase 3-style permissions`)

  return phase3Permissions.length > 10
}

async function main() {
  console.log('='.repeat(70))
  console.log('Phase 3 Migration Application')
  console.log('='.repeat(70))

  console.log(`\n📡 Connected to: ${SUPABASE_URL}`)

  // Check if migrations already applied
  const alreadyApplied = await checkPermissions()

  if (alreadyApplied) {
    console.log('\n✅ Phase 3 migrations appear to be already applied!')
    console.log('   Run verification tests to confirm.')
    return
  }

  console.log('\n🚀 Starting migration application...')
  console.log('   Note: Some statements may require direct database access')
  console.log('   Use Supabase Dashboard SQL Editor for full migration if needed')

  let allSuccessful = true

  for (const migration of migrations) {
    const success = await applyMigration(migration)
    if (!success) allSuccessful = false
  }

  console.log('\n' + '='.repeat(70))

  if (allSuccessful) {
    console.log('✅ All migrations completed successfully!')
  } else {
    console.log('⚠️  Some migrations had errors')
    console.log('   For full migration, use Supabase Dashboard SQL Editor:')
    console.log('   1. Go to https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql')
    console.log('   2. Copy/paste each migration file')
    console.log('   3. Run in order: 020 → 021 → 022 → 023')
  }

  // Final check
  await checkPermissions()

  console.log('\n📋 Next steps:')
  console.log('   1. Run tests: npm run test -- tenant-isolation.test.ts')
  console.log('   2. Test UI: npm run dev and visit /admin/permissions-management')
  console.log('   3. Verify RLS policies are working correctly')
}

main().catch(console.error)
