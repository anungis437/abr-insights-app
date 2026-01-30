/**
 * Migration Script: Consolidate Entitlements to organization_subscriptions
 * 
 * This script migrates existing entitlement data from:
 * - profiles.subscription_tier (legacy individual subscriptions)
 * - organizations.subscription_tier/max_users (organization-level fields)
 * 
 * To the canonical source:
 * - organization_subscriptions table
 * 
 * Run this ONCE before removing redundant fields from profiles/organizations.
 * 
 * Usage:
 *   npx tsx scripts/migrate-entitlements.ts [--dry-run] [--environment=<env>]
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface MigrationStats {
  profilesMigrated: number
  profilesSkipped: number
  organizationsMigrated: number
  organizationsSkipped: number
  seatsAllocated: number
  errors: Array<{ type: string; id: string; error: string }>
}

async function migrateEntitlements(dryRun = false): Promise<MigrationStats> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const stats: MigrationStats = {
    profilesMigrated: 0,
    profilesSkipped: 0,
    organizationsMigrated: 0,
    organizationsSkipped: 0,
    seatsAllocated: 0,
    errors: [],
  }

  console.log('🚀 Starting entitlements migration...')
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be saved)' : 'LIVE MIGRATION'}`)
  console.log('')

  // ========================================
  // PHASE 1: Migrate individual subscriptions from profiles
  // ========================================
  console.log('📋 Phase 1: Migrating individual subscriptions from profiles...')

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, subscription_tier, stripe_customer_id, stripe_subscription_id')
    .not('stripe_subscription_id', 'is', null)

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError)
    throw profilesError
  }

  console.log(`Found ${profiles?.length || 0} profiles with Stripe subscriptions`)

  for (const profile of profiles || []) {
    try {
      // Find user's organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', profile.id)
        .single()

      if (membershipError || !membership) {
        console.log(`⏭️  Skipping profile ${profile.id}: No organization membership`)
        stats.profilesSkipped++
        continue
      }

      // Check if already migrated
      const { data: existing, error: existingError } = await supabase
        .from('organization_subscriptions')
        .select('id')
        .eq('organization_id', membership.organization_id)
        .single()

      if (!existingError && existing) {
        console.log(`⏭️  Skipping profile ${profile.id}: Subscription already exists for org ${membership.organization_id}`)
        stats.profilesSkipped++
        continue
      }

      // Map legacy tier to new tier format
      const tier = mapLegacyTier(profile.subscription_tier)

      if (dryRun) {
        console.log(`🔍 [DRY RUN] Would create subscription for org ${membership.organization_id}:`, {
          tier,
          stripe_subscription_id: profile.stripe_subscription_id,
          stripe_customer_id: profile.stripe_customer_id,
        })
        stats.profilesMigrated++
        continue
      }

      // Create organization subscription
      const { data: newSubscription, error: createError } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: membership.organization_id,
          stripe_subscription_id: profile.stripe_subscription_id,
          stripe_customer_id: profile.stripe_customer_id,
          tier,
          status: 'active',
          seat_count: 1,
          seats_used: 1,
          amount_cents: 0, // Will be updated by next webhook
          currency: 'CAD',
          billing_interval: 'month',
        })
        .select('id')
        .single()

      if (createError) {
        console.error(`❌ Failed to create subscription for profile ${profile.id}:`, createError)
        stats.errors.push({
          type: 'profile',
          id: profile.id,
          error: createError.message,
        })
        continue
      }

      console.log(`✅ Created subscription ${newSubscription.id} for profile ${profile.id}`)
      stats.profilesMigrated++

      // Allocate seat to user
      const { error: seatError } = await supabase.from('seat_allocations').insert({
        subscription_id: newSubscription.id,
        user_id: profile.id,
        allocated_by: profile.id,
        role_in_org: membership.role === 'owner' ? 'admin' : 'member',
        status: 'active',
      })

      if (seatError) {
        console.error(`⚠️  Failed to allocate seat for profile ${profile.id}:`, seatError)
        stats.errors.push({
          type: 'seat',
          id: profile.id,
          error: seatError.message,
        })
      } else {
        console.log(`✅ Allocated seat to user ${profile.id}`)
        stats.seatsAllocated++
      }
    } catch (error) {
      console.error(`❌ Error processing profile ${profile.id}:`, error)
      stats.errors.push({
        type: 'profile',
        id: profile.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  console.log('')

  // ========================================
  // PHASE 2: Migrate organization subscriptions from organizations table
  // ========================================
  console.log('📋 Phase 2: Migrating organization subscriptions from organizations...')

  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('id, name, subscription_tier, max_users')
    .not('subscription_tier', 'is', null)

  if (orgsError) {
    console.error('❌ Error fetching organizations:', orgsError)
    throw orgsError
  }

  console.log(`Found ${orgs?.length || 0} organizations with subscriptions`)

  for (const org of orgs || []) {
    try {
      // Check if already migrated
      const { data: existing, error: existingError } = await supabase
        .from('organization_subscriptions')
        .select('id')
        .eq('organization_id', org.id)
        .single()

      if (!existingError && existing) {
        console.log(`⏭️  Skipping org ${org.name}: Subscription already exists`)
        stats.organizationsSkipped++
        continue
      }

      const tier = mapLegacyTier(org.subscription_tier)
      const seatCount = org.max_users || 1

      if (dryRun) {
        console.log(`🔍 [DRY RUN] Would create subscription for org ${org.name}:`, {
          tier,
          seat_count: seatCount,
        })
        stats.organizationsMigrated++
        continue
      }

      // Create organization subscription
      const { data: newSubscription, error: createError } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: org.id,
          stripe_subscription_id: `legacy_${org.id}`, // Placeholder
          stripe_customer_id: `legacy_${org.id}`,
          tier,
          status: 'active',
          seat_count: seatCount,
          seats_used: 0,
          amount_cents: 0,
          currency: 'CAD',
          billing_interval: 'month',
        })
        .select('id')
        .single()

      if (createError) {
        console.error(`❌ Failed to create subscription for org ${org.name}:`, createError)
        stats.errors.push({
          type: 'organization',
          id: org.id,
          error: createError.message,
        })
        continue
      }

      console.log(`✅ Created subscription ${newSubscription.id} for org ${org.name}`)
      stats.organizationsMigrated++
    } catch (error) {
      console.error(`❌ Error processing organization ${org.name}:`, error)
      stats.errors.push({
        type: 'organization',
        id: org.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  console.log('')
  return stats
}

/**
 * Map legacy subscription tier formats to canonical format
 */
function mapLegacyTier(legacyTier: string | null | undefined): string {
  if (!legacyTier) return 'FREE'

  const normalized = legacyTier.toUpperCase().replace(/[_-]/g, '_')

  const mapping: Record<string, string> = {
    FREE: 'FREE',
    PROFESSIONAL: 'PROFESSIONAL',
    PRO: 'PROFESSIONAL',
    BUSINESS: 'BUSINESS',
    BUSINESS_PLUS: 'BUSINESS_PLUS',
    ENTERPRISE: 'ENTERPRISE',
  }

  return mapping[normalized] || 'FREE'
}

/**
 * Print migration summary
 */
function printSummary(stats: MigrationStats, dryRun: boolean) {
  console.log('='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes saved)' : 'LIVE MIGRATION'}`)
  console.log('')
  console.log('Profiles:')
  console.log(`  Migrated: ${stats.profilesMigrated}`)
  console.log(`  Skipped:  ${stats.profilesSkipped}`)
  console.log('')
  console.log('Organizations:')
  console.log(`  Migrated: ${stats.organizationsMigrated}`)
  console.log(`  Skipped:  ${stats.organizationsSkipped}`)
  console.log('')
  console.log(`Seats Allocated: ${stats.seatsAllocated}`)
  console.log('')

  if (stats.errors.length > 0) {
    console.log(`⚠️  Errors: ${stats.errors.length}`)
    stats.errors.forEach((err) => {
      console.log(`  - [${err.type}] ${err.id}: ${err.error}`)
    })
  } else {
    console.log('✅ No errors')
  }

  console.log('='.repeat(60))
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const environment = args.find((arg) => arg.startsWith('--environment='))?.split('=')[1] || 'production'

  console.log('')
  console.log('='.repeat(60))
  console.log('🔄 ENTITLEMENTS MIGRATION')
  console.log('='.repeat(60))
  console.log(`Environment: ${environment}`)
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '⚠️  LIVE MIGRATION'}`)
  console.log('='.repeat(60))
  console.log('')

  if (!dryRun) {
    console.log('⚠️  WARNING: This will modify your database!')
    console.log('⚠️  Make sure you have a backup before proceeding.')
    console.log('')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log('')
  }

  try {
    const stats = await migrateEntitlements(dryRun)
    printSummary(stats, dryRun)

    if (dryRun) {
      console.log('')
      console.log('💡 To run the actual migration, run without --dry-run:')
      console.log('   npx tsx scripts/migrate-entitlements.ts')
    } else {
      console.log('')
      console.log('✅ Migration complete!')
      console.log('')
      console.log('📝 Next steps:')
      console.log('1. Verify data integrity in organization_subscriptions table')
      console.log('2. Test entitlements service with getUserEntitlements()')
      console.log('3. Update UI components to use new service')
      console.log('4. After validation, remove redundant fields from profiles/organizations')
    }
  } catch (error) {
    console.error('')
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { migrateEntitlements }
