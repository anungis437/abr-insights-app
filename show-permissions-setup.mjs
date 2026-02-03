#!/usr/bin/env node
/**
 * Show Current Permissions Setup
 * Displays what permissions and role assignments currently exist
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function showPermissionsSetup() {
  console.log('📊 Current Permissions Setup\n')
  console.log('='.repeat(60))

  // Show roles
  console.log('\n🎭 ROLES:\n')
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: false })

  if (roles && roles.length > 0) {
    roles.forEach((role) => {
      console.log(`   ${role.name} (${role.slug})`)
      console.log(`      Level: ${role.level}`)
      console.log(`      Description: ${role.description || 'N/A'}`)
      console.log(`      System role: ${role.is_system ? 'Yes' : 'No'}`)
      console.log()
    })
  }

  // Show permissions
  console.log('\n🔑 PERMISSIONS:\n')
  const { data: permissions } = await supabase.from('permissions').select('*').order('name')

  if (!permissions || permissions.length === 0) {
    console.log('   ⚠️  No permissions found in database')
    console.log('   💡 Permissions need to be seeded')
  } else {
    console.log(`   Found ${permissions.length} permissions:`)
    permissions.slice(0, 10).forEach((perm) => {
      console.log(`   - ${perm.name} (${perm.slug})`)
      console.log(`     Resource: ${perm.resource}, Action: ${perm.action}`)
    })
    if (permissions.length > 10) {
      console.log(`   ... and ${permissions.length - 10} more`)
    }
  }

  // Show role-permission assignments
  console.log('\n🔗 ROLE-PERMISSION ASSIGNMENTS:\n')
  const { data: rolePermissions } = await supabase.from('role_permissions').select(`
      *,
      role:roles(name, slug),
      permission:permissions(name, slug, resource, action)
    `)

  if (!rolePermissions || rolePermissions.length === 0) {
    console.log('   ⚠️  No role-permission assignments found')
  } else {
    console.log(`   Found ${rolePermissions.length} assignments:\n`)

    // Group by role
    const byRole = {}
    rolePermissions.forEach((rp) => {
      const roleName = rp.role?.name || 'Unknown'
      if (!byRole[roleName]) byRole[roleName] = []
      byRole[roleName].push(rp.permission)
    })

    Object.entries(byRole).forEach(([roleName, perms]) => {
      console.log(`   ${roleName}:`)
      perms.forEach((perm) => {
        if (perm) {
          console.log(`      - ${perm.name} (${perm.resource}.${perm.action})`)
        }
      })
      console.log()
    })
  }

  // Check for advanced RBAC tables
  console.log('\n🔧 ADVANCED RBAC TABLES:\n')

  const tables = [
    'resource_permissions',
    'permission_overrides',
    'role_hierarchy',
    'permission_cache',
  ]

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1)

    if (error && error.message.includes('does not exist')) {
      console.log(`   ❌ ${table} - NOT CREATED`)
    } else {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      console.log(`   ✅ ${table} - EXISTS (${count || 0} rows)`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n💡 RECOMMENDATIONS:\n')

  if (!permissions || permissions.length === 0) {
    console.log('   1. Apply migration: 020_comprehensive_permissions_seed.sql')
    console.log('      This will create 100+ granular permissions')
  }

  const { data: rpData } = await supabase.from('resource_permissions').select('id').limit(1)

  if (rpData === null) {
    console.log('   2. Apply migration: 20250116000002_advanced_rbac.sql')
    console.log('      This will create advanced RBAC tables')
  }

  console.log('   3. Then visit /admin/permissions-management to manage permissions')
  console.log('\n')
}

showPermissionsSetup().catch(console.error)
