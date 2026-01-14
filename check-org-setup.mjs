#!/usr/bin/env node
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkOrgSetup() {
  console.log('\n🔍 Checking Organization Setup...\n')
  
  // Check organizations
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at')
  
  if (orgsError) {
    console.error('❌ Error fetching organizations:', orgsError)
  } else {
    console.log('📊 Organizations:', orgs?.length || 0)
    orgs?.forEach(org => {
      console.log(`  - ${org.name} (${org.slug})`)
      console.log(`    ID: ${org.id}`)
      console.log(`    Tier: ${org.subscription_tier}`)
      console.log(`    Status: ${org.subscription_status}`)
    })
  }
  
  // Check super_admin profile
  console.log('\n👤 Checking Super Admin Profile...\n')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'super_admin@abr-insights.com')
    .single()
  
  if (profileError) {
    console.error('❌ Error fetching super admin profile:', profileError)
  } else if (profile) {
    console.log('✅ Super Admin Profile Found:')
    console.log(`  Email: ${profile.email}`)
    console.log(`  Role: ${profile.role}`)
    console.log(`  Organization ID: ${profile.organization_id || 'NULL'}`)
    console.log(`  Display Name: ${profile.display_name}`)
    console.log(`  Status: ${profile.status}`)
  } else {
    console.log('❌ Super admin profile not found')
  }
  
  // Check RBAC tables
  console.log('\n🔒 Checking RBAC Setup...\n')
  
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: false })
  
  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError)
  } else {
    console.log(`✅ Roles table: ${roles?.length || 0} roles`)
    roles?.forEach(role => {
      console.log(`  - ${role.name} (${role.slug}) - Level ${role.level}`)
    })
  }
  
  const { data: permissions, error: permsError } = await supabase
    .from('permissions')
    .select('*')
  
  if (permsError) {
    console.error('❌ Error fetching permissions:', permsError)
  } else {
    console.log(`\n✅ Permissions table: ${permissions?.length || 0} permissions`)
  }
  
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('*, profiles(email), roles(name)')
  
  if (userRolesError) {
    console.error('❌ Error fetching user roles:', userRolesError)
  } else {
    console.log(`\n✅ User Roles table: ${userRoles?.length || 0} assignments`)
    userRoles?.forEach(ur => {
      console.log(`  - ${ur.profiles?.email} → ${ur.roles?.name}`)
    })
  }
  
  console.log('\n✅ Check complete!\n')
}

checkOrgSetup()
