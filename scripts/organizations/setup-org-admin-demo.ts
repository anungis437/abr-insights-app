import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey)

async function setupOrgAdminWithDemoOrg() {
  console.log('🏢 Setting up Org Admin with Demo Organization')
  console.log('='.repeat(50))
  console.log()

  try {
    // 1. Find or create Demo Organization
    console.log('📋 Step 1: Finding/Creating Demo Organization...')
    let { data: demoOrg, error: findOrgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', 'demo-organization')
      .single()

    if (findOrgError || !demoOrg) {
      console.log('  Creating new Demo Organization...')
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
          name: 'Demo Organization',
          slug: 'demo-organization',
          subscription_tier: 'professional',
          subscription_status: 'active',
          seat_limit: 10,
          storage_limit_gb: 50,
          settings: {
            features: {
              courses: true,
              analytics: true,
              teamManagement: true,
              certificates: true,
            },
          },
        })
        .select()
        .single()

      if (createError) {
        console.error('  ❌ Error creating demo organization:', createError)
        throw createError
      }

      demoOrg = newOrg
      console.log('  ✅ Created Demo Organization')
    } else {
      console.log('  ✅ Found existing Demo Organization')
    }

    console.log(`     ID: ${demoOrg.id}`)
    console.log(`     Name: ${demoOrg.name}`)
    console.log(`     Tier: ${demoOrg.subscription_tier}`)
    console.log(`     Seat Limit: ${demoOrg.seat_limit}`)
    console.log()

    // 2. Find org_admin test user profile
    console.log('👤 Step 2: Finding org_admin test user...')
    const orgAdminEmails = ['org_admin@abr-insights.com', 'orgadmin@abr-insights.com']

    let orgAdminProfile = null
    for (const email of orgAdminEmails) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (profile) {
        orgAdminProfile = profile
        console.log(`  ✅ Found profile: ${email}`)
        break
      }
    }

    if (!orgAdminProfile) {
      console.error('  ❌ org_admin profile not found with any expected email')
      console.log('  Expected emails:', orgAdminEmails)
      console.log('  Please run create-test-users script first')
      return
    }

    console.log(`     ID: ${orgAdminProfile.id}`)
    console.log(`     Email: ${orgAdminProfile.email}`)
    console.log(`     Current Role: ${orgAdminProfile.role}`)
    console.log()

    // 3. Update org_admin profile with demo organization
    console.log('🔄 Step 3: Linking org_admin to Demo Organization...')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        organization_id: demoOrg.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgAdminProfile.id)

    if (updateError) {
      console.error('  ❌ Error updating profile:', updateError)
      throw updateError
    }

    console.log('  ✅ Successfully linked org_admin to Demo Organization')
    console.log()

    // 4. Verify setup
    console.log('✅ Step 4: Verifying setup...')
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('id, email, role, organization_id, organizations(*)')
      .eq('id', orgAdminProfile.id)
      .single()

    if (verifyProfile) {
      console.log('  ✅ Profile verification:')
      console.log(`     Email: ${verifyProfile.email}`)
      console.log(`     Role: ${verifyProfile.role}`)
      console.log(`     Organization ID: ${verifyProfile.organization_id}`)
      if (verifyProfile.organizations && !Array.isArray(verifyProfile.organizations)) {
        const org = verifyProfile.organizations as any
        console.log(`     Organization Name: ${org.name}`)
        console.log(`     Organization Tier: ${org.subscription_tier}`)
        console.log(`     Organization Status: ${org.subscription_status}`)
        console.log(`     Seat Limit: ${org.seat_limit}`)
      }
    }

    console.log()
    console.log('=' .repeat(50))
    console.log('✅ Setup Complete!')
    console.log()
    console.log('Test Login Credentials:')
    console.log('  Email: org_admin@abr-insights.com (or orgadmin@abr-insights.com)')
    console.log('  Password: TestPass123!')
    console.log()
    console.log('org_admin now has access to:')
    console.log('  • Organization Dashboard (/org/dashboard)')
    console.log('  • Team Management')
    console.log('  • User & Role Management')
    console.log('  • Organization Settings')
    console.log('  • Usage Analytics')
    console.log()
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

setupOrgAdminWithDemoOrg().then(() => {
  console.log('✅ Script completed successfully')
  process.exit(0)
})
