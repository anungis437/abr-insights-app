#!/usr/bin/env node
import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupNzilaOrg() {
  console.log('\n🏢 Setting up Nzila Organization...\n')

  // Check if Nzila org already exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', 'nzila')
    .single()

  let orgId

  if (existingOrg) {
    console.log('✓ Nzila organization already exists')
    orgId = existingOrg.id
  } else {
    // Create Nzila organization
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: 'Nzila',
        slug: 'nzila',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        seat_limit: 9999,
        storage_limit_gb: 1000,
        settings: {
          is_master_org: true,
          description: 'Master organization for platform administration',
        },
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating Nzila organization:', createError)
      return
    }

    orgId = newOrg.id
    console.log('✅ Created Nzila organization')
    console.log(`   ID: ${orgId}`)
  }

  // Get super_admin profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'super_admin@abr-insights.com')
    .single()

  if (profileError || !profile) {
    console.error('❌ Super admin profile not found')
    return
  }

  // Update super_admin to belong to Nzila org
  if (profile.organization_id !== orgId) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        organization_id: orgId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('❌ Error assigning super admin to Nzila:', updateError)
      return
    }

    console.log('✅ Assigned super_admin to Nzila organization')
  } else {
    console.log('✓ Super admin already belongs to Nzila')
  }

  // Verify the setup
  console.log('\n📋 Final Configuration:\n')

  const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single()

  if (org) {
    console.log('Organization:')
    console.log(`  Name: ${org.name}`)
    console.log(`  Slug: ${org.slug}`)
    console.log(`  Tier: ${org.subscription_tier}`)
    console.log(`  Status: ${org.subscription_status}`)
    console.log(`  Seats: ${org.seat_limit}`)
    console.log(`  Storage: ${org.storage_limit_gb}GB`)
  }

  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'super_admin@abr-insights.com')
    .single()

  if (updatedProfile) {
    console.log('\nSuper Admin:')
    console.log(`  Email: ${updatedProfile.email}`)
    console.log(`  Role: ${updatedProfile.role}`)
    console.log(`  Organization: ${org?.name || updatedProfile.organization_id}`)
    console.log(`  Status: ${updatedProfile.status}`)
  }

  console.log('\n✅ Setup complete!\n')
}

setupNzilaOrg()
