/**
 * Validate RBAC Test Accounts
 *
 * Checks:
 * 1. Profiles table has 9 test accounts
 * 2. Auth users exist for each profile
 * 3. Login works with TestPass123!
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, serviceKey)
const supabaseAnon = createClient(supabaseUrl, anonKey)

const TEST_EMAILS = [
  'super_admin@abr-insights.com',
  'compliance@abr-insights.com',
  'orgadmin@abr-insights.com',
  'analyst@abr-insights.com',
  'investigator@abr-insights.com',
  'educator@abr-insights.com',
  'learner@abr-insights.com',
  'viewer@abr-insights.com',
  'guest@abr-insights.com',
]

const EXPECTED_ROLES = [
  'super_admin',
  'compliance_officer',
  'org_admin',
  'analyst',
  'investigator',
  'educator',
  'learner',
  'viewer',
  'guest',
]

async function validateTestAccounts() {
  console.log('🔍 Validating RBAC Test Accounts...\n')

  // Check 1: Profiles
  console.log('1️⃣  Checking profiles table...')
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('email, role, first_name, last_name, display_name')
    .in('email', TEST_EMAILS)
    .order('role')

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message)
    return
  }

  console.log(`   ✅ Found ${profiles.length}/9 profiles`)

  if (profiles.length < 9) {
    console.log('   ⚠️  Missing profiles:')
    const foundEmails = profiles.map((p) => p.email)
    TEST_EMAILS.forEach((email) => {
      if (!foundEmails.includes(email)) {
        console.log(`      - ${email}`)
      }
    })
  }

  // Show role distribution
  const roleCounts: Record<string, number> = {}
  profiles.forEach((p) => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1
  })

  console.log('\n   📊 Role Distribution:')
  EXPECTED_ROLES.forEach((role) => {
    const count = roleCounts[role] || 0
    const icon = count > 0 ? '✅' : '❌'
    console.log(`      ${icon} ${role}: ${count}`)
  })

  // Check 2: Auth Users
  console.log('\n2️⃣  Checking auth.users...')
  const { data: authData } = await supabase.auth.admin.listUsers()
  const authUsers = authData.users.filter((u) => u.email && TEST_EMAILS.includes(u.email))

  console.log(`   ✅ Found ${authUsers.length}/9 auth users`)

  if (authUsers.length < 9) {
    console.log('   ⚠️  Missing auth users:')
    const foundAuthEmails = authUsers.map((u) => u.email)
    TEST_EMAILS.forEach((email) => {
      if (!foundAuthEmails.includes(email)) {
        console.log(`      - ${email}`)
      }
    })

    console.log('\n   💡 Fix: Auth users need to be created via migration 016')
    console.log('      The migration inserts into auth.users and auth.identities')
  }

  // Check 3: Login Test (only if auth users exist)
  if (authUsers.length > 0) {
    console.log('\n3️⃣  Testing login...')
    const testEmail = 'super_admin@abr-insights.com'
    const testPassword = 'TestPass123!'

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (loginError) {
      console.log(`   ❌ Login failed: ${loginError.message}`)
    } else {
      console.log(`   ✅ Login successful: ${loginData.user.email}`)

      // Get profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', loginData.user.id)
        .single()

      if (profile) {
        console.log(`   👤 Role: ${profile.role}`)
        console.log(`   📛 Name: ${profile.display_name}`)
      }

      // Sign out
      await supabaseAnon.auth.signOut()
    }
  } else {
    console.log('\n3️⃣  Skipping login test (no auth users found)')
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 SUMMARY')
  console.log('='.repeat(60))
  console.log(`Profiles: ${profiles.length}/9 ${profiles.length === 9 ? '✅' : '❌'}`)
  console.log(`Auth Users: ${authUsers.length}/9 ${authUsers.length === 9 ? '✅' : '❌'}`)

  if (profiles.length === 9 && authUsers.length === 9) {
    console.log('\n🎉 All test accounts are properly configured!')
    console.log('\n📧 Test Credentials:')
    console.log('   Email: [role]@abr-insights.com')
    console.log('   Password: TestPass123!')
    console.log('\n   Examples:')
    console.log('   - super_admin@abr-insights.com')
    console.log('   - compliance@abr-insights.com')
    console.log('   - learner@abr-insights.com')
  } else {
    console.log('\n⚠️  Test account setup incomplete')
    console.log('   Run migration 016 to create missing accounts')
  }
}

validateTestAccounts().catch(console.error)
