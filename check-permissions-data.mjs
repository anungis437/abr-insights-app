#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPermissionsData() {
  console.log('🔍 Checking permissions-related tables...\n')

  // Check permissions table
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name, slug, category')
    .limit(5)

  console.log('📋 Permissions table:')
  console.log(`   Count: ${permissions?.length || 0}`)
  if (permissions && permissions.length > 0) {
    console.log('   Sample:', permissions[0])
  }
  if (permError) console.log('   Error:', permError.message)

  // Check resource_permissions table
  const { data: resourcePerms, error: resError } = await supabase
    .from('resource_permissions')
    .select('*')
    .limit(5)

  console.log('\n📋 Resource Permissions table:')
  console.log(`   Count: ${resourcePerms?.length || 0}`)
  if (resError) console.log('   Error:', resError.message)

  // Check permission_overrides table
  const { data: overrides, error: overError } = await supabase
    .from('permission_overrides')
    .select('*')
    .limit(5)

  console.log('\n📋 Permission Overrides table:')
  console.log(`   Count: ${overrides?.length || 0}`)
  if (overError) console.log('   Error:', overError.message)

  // Check role_hierarchy table
  const { data: hierarchy, error: hierError } = await supabase
    .from('role_hierarchy')
    .select('*')
    .limit(5)

  console.log('\n📋 Role Hierarchy table:')
  console.log(`   Count: ${hierarchy?.length || 0}`)
  if (hierError) console.log('   Error:', hierError.message)

  // Check roles and role_permissions
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, slug, level')
    .order('level', { ascending: false })

  console.log('\n📋 Roles table:')
  console.log(`   Count: ${roles?.length || 0}`)
  if (roles && roles.length > 0) {
    console.log('   Roles:')
    roles.forEach((role) => {
      console.log(`     - ${role.name} (${role.slug}, level: ${role.level})`)
    })
  }
  if (rolesError) console.log('   Error:', rolesError.message)

  const { data: rolePerms, error: rolePermsError } = await supabase
    .from('role_permissions')
    .select('*')
    .limit(5)

  console.log('\n📋 Role Permissions table:')
  console.log(`   Count: ${rolePerms?.length || 0}`)
  if (rolePermsError) console.log('   Error:', rolePermsError.message)
}

checkPermissionsData().catch(console.error)
