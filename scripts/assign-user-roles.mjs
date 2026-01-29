#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

const roleMapping = {
  'super_admin@abr-insights.com': 'Super Admin',
  'educator@abr-insights.com': 'Instructor',
  'learner@abr-insights.com': 'Learner',
  'org_admin@abr-insights.com': 'Admin',
  'compliance@abr-insights.com': 'Manager',
  'analyst@abr-insights.com': 'Analyst',
  'investigator@abr-insights.com': 'Analyst',
  'viewer@abr-insights.com': 'Learner',
  'guest@abr-insights.com': 'Guest',
}

console.log('🔧 Assigning roles to test accounts...\n')

// Get all roles
const { data: roles } = await supabase.from('roles').select('id, name')

const roleMap = {}
roles.forEach((r) => {
  roleMap[r.name] = r.id
})

let assigned = 0
let errors = 0

for (const [email, roleName] of Object.entries(roleMapping)) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      console.error(`❌ ${email} - Profile not found`)
      errors++
      continue
    }

    const roleId = roleMap[roleName]
    if (!roleId) {
      console.error(`❌ ${email} - Role "${roleName}" not found`)
      errors++
      continue
    }

    // Check if role already assigned
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', profile.id)
      .eq('role_id', roleId)
      .single()

    if (existing) {
      console.log(`⏭️  ${email} → ${roleName} (already assigned)`)
      continue
    }

    // Assign role
    const { error: assignError } = await supabase.from('user_roles').insert({
      user_id: profile.id,
      role_id: roleId,
    })

    if (assignError) {
      console.error(`❌ ${email} - Failed to assign role: ${assignError.message}`)
      errors++
    } else {
      console.log(`✅ ${email} → ${roleName}`)
      assigned++
    }
  } catch (error) {
    console.error(`❌ ${email} - Error: ${error.message}`)
    errors++
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 Summary:')
console.log('='.repeat(60))
console.log(`✅ Assigned: ${assigned}`)
console.log(`❌ Errors: ${errors}`)
console.log(`📁 Total: ${Object.keys(roleMapping).length}`)
console.log('='.repeat(60) + '\n')

if (errors === 0) {
  console.log('🎉 All roles assigned successfully!\n')
}
