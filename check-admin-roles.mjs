#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkAdminRoles() {
  // Find admin user
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@abrinsights.ca')

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('❌ Admin user not found')
    return
  }

  const profile = profiles[0]
  console.log('\n=== Admin Profile ===')
  console.log('ID:', profile.id)
  console.log('Email:', profile.email)
  console.log('Role (profile):', profile.role)
  console.log('Organization ID:', profile.organization_id)

  // Check user_roles table
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*, roles(*)')
    .eq('user_id', profile.id)

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError)
    return
  }

  console.log('\n=== User Roles (from user_roles table) ===')
  if (!userRoles || userRoles.length === 0) {
    console.log('❌ No roles found in user_roles table!')
    console.log('This is why hasAdminRole() is returning false')

    // Let's check what roles exist
    const { data: availableRoles } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: false })

    console.log('\n=== Available Roles ===')
    availableRoles?.forEach((role) => {
      console.log(`- ${role.name} (slug: ${role.slug}, level: ${role.level}, id: ${role.id})`)
    })

    // Check if we need to add the role
    const superAdminRole = availableRoles?.find((r) => r.slug === 'super_admin')
    if (superAdminRole) {
      console.log('\n=== Adding super_admin role to user_roles ===')
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: profile.id,
        organization_id: profile.organization_id,
        role_id: superAdminRole.id,
      })

      if (insertError) {
        console.error('❌ Error adding role:', insertError)
      } else {
        console.log('✅ Successfully added super_admin role to user_roles table')
        console.log('\nPlease try logging in again!')
      }
    }
  } else {
    userRoles.forEach((ur) => {
      console.log(`- Role: ${ur.roles.name} (slug: ${ur.roles.slug}, level: ${ur.roles.level})`)
      console.log(`  Organization: ${ur.organization_id}`)
      console.log(`  Is Admin? ${ur.roles.level >= 50 ? '✅ Yes' : '❌ No'}`)
    })
  }
}

checkAdminRoles().catch(console.error)
