#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const testAccounts = [
  {
    email: 'super_admin@abr-insights.com',
    password: 'TestPass123!',
    role: 'super_admin',
    first_name: 'Super',
    last_name: 'Admin',
    display_name: 'Super Admin',
  },
  {
    email: 'educator@abr-insights.com',
    password: 'TestPass123!',
    role: 'educator',
    first_name: 'Sarah',
    last_name: 'Teacher',
    display_name: 'Sarah Teacher',
  },
  {
    email: 'learner@abr-insights.com',
    password: 'TestPass123!',
    role: 'learner',
    first_name: 'John',
    last_name: 'Student',
    display_name: 'John Student',
  },
  {
    email: 'org_admin@abr-insights.com',
    password: 'TestPass123!',
    role: 'org_admin',
    first_name: 'Org',
    last_name: 'Admin',
    display_name: 'Org Administrator',
  },
  {
    email: 'compliance@abr-insights.com',
    password: 'TestPass123!',
    role: 'compliance_officer',
    first_name: 'Compliance',
    last_name: 'Officer',
    display_name: 'Compliance Officer',
  },
  {
    email: 'analyst@abr-insights.com',
    password: 'TestPass123!',
    role: 'analyst',
    first_name: 'Data',
    last_name: 'Analyst',
    display_name: 'Data Analyst',
  },
  {
    email: 'investigator@abr-insights.com',
    password: 'TestPass123!',
    role: 'investigator',
    first_name: 'Case',
    last_name: 'Investigator',
    display_name: 'Case Investigator',
  },
  {
    email: 'viewer@abr-insights.com',
    password: 'TestPass123!',
    role: 'viewer',
    first_name: 'Read',
    last_name: 'Only',
    display_name: 'Read Only Viewer',
  },
  {
    email: 'guest@abr-insights.com',
    password: 'TestPass123!',
    role: 'guest',
    first_name: 'Guest',
    last_name: 'User',
    display_name: 'Guest User',
  },
]

console.log('🚀 Creating Test Accounts...\n')

let created = 0
let exists = 0
let failed = 0

for (const account of testAccounts) {
  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', account.email)
      .single()

    if (existingProfile) {
      console.log(`⏭️  ${account.email} - Already exists`)
      exists++
      continue
    }

    console.log(`📝 Creating ${account.email}...`)

    // Create user with Supabase Auth Admin API
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: account.first_name,
        last_name: account.last_name,
        display_name: account.display_name,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⏭️  ${account.email} - Already exists in auth`)
        exists++
        continue
      }
      throw authError
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.user.id,
      email: account.email,
      first_name: account.first_name,
      last_name: account.last_name,
      display_name: account.display_name,
      status: 'active',
      email_verified: true,
    })

    if (profileError) {
      console.error(`   Profile creation failed: ${profileError.message}`)
    }

    // Get role ID
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', account.role)
      .single()

    if (roleData) {
      // Assign role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: user.user.id,
        role_id: roleData.id,
      })

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error(`   Role assignment failed: ${roleError.message}`)
      }
    }

    console.log(`✅ ${account.email} - Created successfully\n`)
    created++
  } catch (error) {
    console.error(`❌ ${account.email} - Failed:`)
    console.error(`   ${error.message}\n`)
    failed++
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 Summary:')
console.log('='.repeat(60))
console.log(`✅ Created: ${created}`)
console.log(`⏭️  Already Exists: ${exists}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📁 Total: ${testAccounts.length}`)
console.log('='.repeat(60) + '\n')

if (created > 0 || exists === testAccounts.length) {
  console.log('🎉 Test accounts are ready!\n')
  console.log('Test account credentials:')
  console.log('  Email: Any of the accounts above')
  console.log('  Password: TestPass123!\n')
}
