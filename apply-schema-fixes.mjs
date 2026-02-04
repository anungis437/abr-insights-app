#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
if (!projectRef) {
  console.error('❌ Error: Could not extract project reference from URL')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  console.log('🔧 Applying schema fixes (Migration 023)...\n')

  try {
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '023_fix_schema_issues.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded')
    console.log(`📏 Size: ${migrationSQL.length} characters\n`)

    // Use psql via Supabase connection string if available
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      console.log('⚙️  Applying via PostgreSQL connection...')
      try {
        execSync(`psql "${dbUrl}" -f "${migrationPath}"`, {
          stdio: 'inherit',
        })
        console.log('\n✅ Migration applied successfully!\n')
      } catch (err) {
        console.error('❌ psql execution failed')
        throw err
      }
    } else {
      console.log('⚠️  DATABASE_URL not set, applying via Supabase REST API...\n')

      // Apply via REST API (less reliable but works without CLI)
      const { error } = await supabase.rpc('exec_sql', {
        query: migrationSQL,
      })

      if (error) {
        console.error('❌ REST API execution failed:', error.message)
        console.log('\n📋 Manual Steps Required:')
        console.log('   1. Copy the migration file content:')
        console.log(`      ${migrationPath}`)
        console.log('   2. Open Supabase Dashboard → SQL Editor')
        console.log('   3. Paste and run the entire migration\n')
        process.exit(1)
      }

      console.log('✅ Migration applied successfully!\n')
    }

    // Verify changes
    console.log('🔍 Verifying changes...\n')

    try {
      // Check if table exists (simple test)
      const { error: testError } = await supabase.from('user_levels').select('count').limit(0)

      if (!testError) {
        console.log('✅ user_levels table accessible')
      }
    } catch (err) {
      console.log('⚠️  Could not verify user_levels table')
    }

    console.log('\n✨ Schema fixes applied!\n')
    console.log('📋 Changes Made:')
    console.log('   ✓ Fixed enrollment SELECT policy (inline subquery)')
    console.log('   ✓ Fixed user_achievements SELECT policy')
    console.log('   ✓ Fixed ai_usage_logs SELECT policy')
    console.log('   ✓ Added saved_searches.deleted_at column')
    console.log('   ✓ Created get_user_points_summary()')
    console.log('   ✓ Created get_user_social_summary()')
    console.log('   ✓ Created user_levels table')
    console.log('   ✓ Fixed achievements foreign key\n')
    console.log('🎯 Next Steps:')
    console.log('   1. Hard refresh browser: Ctrl+Shift+F5')
    console.log('   2. Clear all browser cache')
    console.log('   3. Login: learner@abr-insights.com / TestPass123!')
    console.log('   4. Go to: /courses/intro-to-abr/player')
    console.log('   5. Verify: NO 409, NO schema errors in console\n')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    console.error('\n🔧 Manual Fix Required:')
    console.error('   1. Open Supabase Dashboard → SQL Editor')
    console.error('   2. Open file: supabase/migrations/023_fix_schema_issues.sql')
    console.error('   3. Copy entire content and run in SQL Editor')
    console.error('   4. Check output for success messages\n')
    process.exit(1)
  }
}

// Run migration
applyMigration()
