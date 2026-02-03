#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function createTestUser(userType = 'learner') {
  // Map user type to valid role
  const roleMap = {
    'admin': 'super_admin',
    'learner': 'learner',
    'instructor': 'educator',
    'org_admin': 'org_admin'
  }
  
  const role = roleMap[userType] || userType
  const testEmail = userType === 'admin' ? 'admin@abrinsights.ca' : 'test@abrinsights.ca'
  const testPassword = 'TestPassword123!'

  try {
    console.log(`Creating ${userType} user (role: ${role}): ${testEmail}`)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: userType === 'admin' ? 'Admin' : 'Test',
        last_name: 'User',
      },
    })

    if (authError) {
      if (authError.message.includes('already exists') || authError.code === 'email_exists') {
        console.log(`⚠ Auth user already exists: ${testEmail}`)
        console.log(`Creating missing profile...`)
        
        // Get the existing user ID
        const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers({
          filters: { email: testEmail },
          limit: 1
        })
        
        if (getUserError || !users || users.length === 0) {
          console.error('Could not find existing user:', getUserError)
          return
        }
        
        const existingUserId = users[0].id
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', existingUserId)
          .single()
        
        if (existingProfile) {
          console.log(`✓ Profile already exists, updating role to ${role}`)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', existingUserId)
          
          if (updateError) {
            console.error('Could not update role:', updateError)
          } else {
            console.log(`\n✓ ADMIN user ready:`)
            console.log(`  Email: ${testEmail}`)
            console.log(`  Password: ${testPassword}`)
          }
        } else {
          console.log(`✓ Creating new profile for existing auth user`)
          const { error: insertError } = await supabase.from('profiles').insert({
            id: existingUserId,
            email: testEmail,
            first_name: 'Admin',
            last_name: 'User',
            display_name: 'Admin User',
            role: role,
            language: 'en',
            timezone: 'America/Toronto',
            status: 'active',
            onboarding_completed: true,
            subscription_tier: 'enterprise',
          })
          
          if (insertError) {
            console.error('Could not create profile:', insertError)
          } else {
            console.log(`\n✓ ADMIN user ready:`)
            console.log(`  Email: ${testEmail}`)
            console.log(`  Password: ${testPassword}`)
          }
        }
        return
      }
      console.error('Auth error:', authError)
      return
    }

    const userId = authData.user.id
    console.log(`✓ Auth user created: ${userId}`)

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: testEmail,
      first_name: userType === 'admin' ? 'Admin' : 'Test',
      last_name: 'User',
      display_name: userType === 'admin' ? 'Admin User' : 'Test User',
      role: role,
      language: 'en',
      timezone: 'America/Toronto',
      status: 'active',
      onboarding_completed: true,
      subscription_tier: 'enterprise',
    })

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log(`✓ Profile created with role: ${role}`)
    console.log(`\n${userType.toUpperCase()} user ready:`)
    console.log(`  Email: ${testEmail}`)
    console.log(`  Password: ${testPassword}`)
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUser(process.argv[2] || 'admin')
