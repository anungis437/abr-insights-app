/**
 * Apply Schema Migrations using native PostgreSQL client
 * This bypasses Supabase JS client limitations with DDL
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL!

async function applyMigrations() {
  const client = new Client({ connectionString: DATABASE_URL })

  try {
    console.log('🔌 Connecting to database...\n')
    await client.connect()
    console.log('✅ Connected!\n')

    console.log('📋 Applying schema migrations...\n')

    // Migration 1: Add subscription fields to profiles
    console.log('1️⃣ Adding subscription fields to profiles table...')
    await client.query(`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
    `)
    console.log('✅ Profiles table updated')

    console.log('\n2️⃣ Creating indexes on profiles...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
    `)
    console.log('✅ Indexes created')

    // Migration 2: Create organization_subscriptions table
    console.log('\n3️⃣ Creating organization_subscriptions table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_subscriptions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        stripe_subscription_id text UNIQUE,
        stripe_customer_id text,
        tier text NOT NULL DEFAULT 'FREE',
        status text NOT NULL DEFAULT 'active',
        seat_count integer NOT NULL DEFAULT 1,
        seats_used integer NOT NULL DEFAULT 0,
        current_period_end timestamptz,
        grace_period_ends_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ organization_subscriptions table created')

    console.log('\n4️⃣ Creating indexes on organization_subscriptions...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_org_subscriptions_organization ON organization_subscriptions(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_subscriptions_stripe_sub ON organization_subscriptions(stripe_subscription_id);
    `)
    console.log('✅ Indexes created')

    // Migration 3: Create seat_allocations table
    console.log('\n5️⃣ Creating seat_allocations table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS seat_allocations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id uuid NOT NULL REFERENCES organization_subscriptions(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        status text NOT NULL DEFAULT 'active',
        allocated_at timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(subscription_id, user_id)
      );
    `)
    console.log('✅ seat_allocations table created')

    console.log('\n6️⃣ Creating indexes on seat_allocations...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_seat_allocations_subscription ON seat_allocations(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_seat_allocations_user ON seat_allocations(user_id);
    `)
    console.log('✅ Indexes created')

    // Enable RLS
    console.log('\n7️⃣ Enabling Row Level Security...')
    await client.query(`
      ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE seat_allocations ENABLE ROW LEVEL SECURITY;
    `)
    console.log('✅ RLS enabled')

    // RLS Policies
    console.log('\n8️⃣ Creating RLS policies...')
    try {
      await client.query(`
        DROP POLICY IF EXISTS org_subscriptions_select ON organization_subscriptions;
        CREATE POLICY org_subscriptions_select ON organization_subscriptions
          FOR SELECT
          USING (
            organization_id IN (
              SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
          );
      `)
    } catch (e: any) {
      if (!e.message.includes('already exists')) throw e
    }

    try {
      await client.query(`
        DROP POLICY IF EXISTS seat_allocations_select ON seat_allocations;
        CREATE POLICY seat_allocations_select ON seat_allocations
          FOR SELECT
          USING (
            user_id = auth.uid() OR
            subscription_id IN (
              SELECT id FROM organization_subscriptions
              WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
              )
            )
          );
      `)
    } catch (e: any) {
      if (!e.message.includes('already exists')) throw e
    }
    console.log('✅ RLS policies created')

    console.log('\n✅ All schema migrations applied successfully!\n')
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await client.end()
    console.log('🔌 Disconnected from database\n')
  }
}

applyMigrations().catch(console.error)
