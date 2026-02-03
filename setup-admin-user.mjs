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

async function setupAdminUser() {
  // Find admin user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@abrinsights.ca')
    .single()

  if (!profiles) {
    console.log('❌ Admin user not found')
    return
  }

  console.log('Found admin user:', profiles.email)

  // Check for existing organizations or create a default one
  let orgId = profiles.organization_id

  if (!orgId) {
    // Look for an existing organization
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)

    if (orgs && orgs.length > 0) {
      orgId = orgs[0].id
      console.log(`Using existing organization: ${orgs[0].name} (${orgId})`)
    } else {
      // Create a default organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'ABR Insights Admin',
          slug: 'abr-insights-admin',
          type: 'enterprise',
          status: 'active',
        })
        .select()
        .single()

      if (orgError) {
        console.error('Error creating organization:', orgError)
        return
      }

      orgId = newOrg.id
      console.log(`✅ Created new organization: ${newOrg.name} (${orgId})`)
    }

    // Update profile with organization_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ organization_id: orgId })
      .eq('id', profiles.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return
    }

    console.log('✅ Updated profile with organization_id')
  }

  // Now add the user_roles entry
  const { data: superAdminRole } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', 'super_admin')
    .single()

  if (!superAdminRole) {
    console.error('❌ super_admin role not found')
    return
  }

  // Check if role already exists
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', profiles.id)
    .eq('role_id', superAdminRole.id)
    .eq('organization_id', orgId)
    .single()

  if (existingRole) {
    console.log('✅ User already has super_admin role in user_roles table')
    return
  }

  // Add role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: profiles.id,
      organization_id: orgId,
      role_id: superAdminRole.id,
    })

  if (roleError) {
    console.error('❌ Error adding role:', roleError)
    return
  }

  console.log('✅ Successfully added super_admin role to user_roles table')
  console.log('\n🎉 Admin user setup complete! You can now log in.')
}

setupAdminUser().catch(console.error)
