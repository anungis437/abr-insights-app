/**
 * Apply Schema Migrations Directly
 * This script applies the necessary schema migrations for entitlements
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function applyMigrations() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })

  console.log('📋 Applying schema migrations via Supabase Dashboard...\n')
  console.log('⚠️  The Supabase JS client cannot execute DDL statements.')
  console.log('Please run the following SQL in your Supabase Dashboard SQL Editor:\n')
  console.log('Dashboard URL: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql')
  console.log('\n--- COPY THE SQL BELOW ---\n')
  
  const sql = `
-- Migration 1: Add subscription fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Migration 2: Create organization_subscriptions table
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

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_organization ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_stripe_sub ON organization_subscriptions(stripe_subscription_id);

-- Migration 3: Create seat_allocations table
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

CREATE INDEX IF NOT EXISTS idx_seat_allocations_subscription ON seat_allocations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_user ON seat_allocations(user_id);

-- Enable RLS on new tables
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_subscriptions
CREATE POLICY org_subscriptions_select ON organization_subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for seat_allocations  
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
`
  
  console.log(sql)
  console.log('\n--- END SQL ---\n')
  console.log('After running the SQL, press Enter to continue...')
}

applyMigrations().catch(console.error)
