#!/usr/bin/env node
/**
 * Setup Permissions System
 *
 * This script:
 * 1. Applies the advanced RBAC migration (if not already applied)
 * 2. Seeds permissions with comprehensive set
 * 3. Verifies the setup
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
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

async function checkTableExists(tableName) {
  const { data, error } = await supabase.from(tableName).select('id').limit(1)

  return !error || !error.message.includes('does not exist')
}

async function runMigration(filename, description) {
  console.log(`\n📝 ${description}...`)

  const migrationPath = join(__dirname, 'supabase', 'migrations', filename)
  const sql = readFileSync(migrationPath, 'utf-8')

  // Split by statement and run each
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'))

  for (const statement of statements) {
    if (!statement) continue

    const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })

    if (error && !error.message.includes('already exists')) {
      console.error(`   ❌ Error:`, error.message)
      // Continue on error since some statements might fail if already applied
    }
  }

  console.log(`   ✅ ${description} completed`)
}

async function setupPermissions() {
  console.log('🔧 Setting up permissions system...\n')

  // Check if advanced RBAC tables exist
  console.log('1️⃣ Checking for advanced RBAC tables...')
  const hasResourcePerms = await checkTableExists('resource_permissions')
  const hasPermOverrides = await checkTableExists('permission_overrides')
  const hasRoleHierarchy = await checkTableExists('role_hierarchy')

  if (!hasResourcePerms || !hasPermOverrides || !hasRoleHierarchy) {
    console.log('   ⚠️  Advanced RBAC tables not found')
    console.log('   📦 Applying advanced RBAC migration...')

    try {
      await runMigration('20250116000002_advanced_rbac.sql', 'Creating advanced RBAC tables')
    } catch (error) {
      console.error('   ❌ Failed to apply advanced RBAC migration:', error.message)
      console.log('   ℹ️  Continuing with permissions seed...')
    }
  } else {
    console.log('   ✅ Advanced RBAC tables already exist')
  }

  // Check if permissions table has category column
  console.log('\n2️⃣ Checking permissions table schema...')
  const { data: perms, error: permsError } = await supabase
    .from('permissions')
    .select('id, category')
    .limit(1)

  if (permsError && permsError.message.includes('category does not exist')) {
    console.log('   ⚠️  Permissions table missing category column')
    console.log('   📦 Applying permissions seed migration...')

    try {
      await runMigration(
        '020_comprehensive_permissions_seed.sql',
        'Seeding permissions with categories'
      )
    } catch (error) {
      console.error('   ❌ Failed to apply permissions seed:', error.message)
    }
  } else {
    console.log('   ✅ Permissions table schema is up to date')
  }

  // Check permission count
  console.log('\n3️⃣ Verifying permissions data...')
  const { count, error: countError } = await supabase
    .from('permissions')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('   ❌ Error counting permissions:', countError.message)
  } else if (!count || count === 0) {
    console.log('   ⚠️  No permissions found in database')
    console.log('   💡 The permissions seed migration should have created them')
    console.log('   💡 You may need to apply the migration manually via Supabase dashboard')
  } else {
    console.log(`   ✅ Found ${count} permissions in database`)

    // Get sample by category
    const { data: samplePerms } = await supabase.from('permissions').select('category').limit(100)

    if (samplePerms) {
      const categories = [...new Set(samplePerms.map((p) => p.category))].filter(Boolean)
      console.log(`   📋 Categories: ${categories.join(', ')}`)
    }
  }

  // Check role permissions
  console.log('\n4️⃣ Verifying role permissions...')
  const { count: rpCount, error: rpError } = await supabase
    .from('role_permissions')
    .select('*', { count: 'exact', head: true })

  if (rpError) {
    console.error('   ❌ Error counting role permissions:', rpError.message)
  } else {
    console.log(`   ✅ Found ${rpCount} role-permission assignments`)
  }

  console.log('\n✅ Permissions system setup complete!')
  console.log('\n💡 Next steps:')
  console.log('   1. Visit /admin/permissions-management to view the permission matrix')
  console.log('   2. Visit /admin/permissions for advanced permission management')
  console.log(
    '   3. If tables are still empty, you may need to apply migrations via Supabase dashboard'
  )
}

setupPermissions().catch((error) => {
  console.error('\n❌ Setup failed:', error.message)
  process.exit(1)
})
