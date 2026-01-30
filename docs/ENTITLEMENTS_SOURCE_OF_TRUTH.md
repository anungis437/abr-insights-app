# Entitlements Source of Truth Strategy

## Problem Statement

**Production Blocker #2**: Entitlement data is currently duplicated across three locations, creating potential inconsistency and confusion about which data to trust:

1. **profiles.subscription_tier** - Legacy individual subscription field
2. **organizations.subscription_tier + organizations.max_users** - Organization-level subscription fields
3. **organization_subscriptions table** - New comprehensive subscription management system (Phase 5)

This duplication creates:

- **Data Integrity Risks**: Updates to one location may not propagate to others
- **Query Confusion**: Developers unsure which field to check for entitlements
- **Billing Accuracy Issues**: Inconsistent seat counts across tables
- **Audit Trail Gaps**: Changes not tracked uniformly

## Recommendation: organization_subscriptions as Canonical Source

### Decision

**Make `organization_subscriptions` table the single source of truth for all organization-level subscriptions.**

### Rationale

1. **Comprehensive Data Model**: Tracks Stripe subscription ID, billing details, seat allocations, invoices
2. **Audit Trail**: Full history via `seat_allocations` and `subscription_invoices` tables
3. **Real-time Stripe Sync**: Webhook handlers directly update this table
4. **Seat Enforcement**: Built-in seat counting and allocation tracking
5. **Tax Compliance**: Supports tax IDs, billing addresses, tax breakdowns
6. **Grace Periods**: Handles subscription lifecycle (trial, active, past_due, grace period)

### Implementation Strategy

#### Phase 1: Consolidation (Immediate)

**Option A: Remove Redundant Fields (RECOMMENDED)**

```sql
-- Migration: Remove redundant subscription fields from profiles and organizations
-- Run AFTER migrating existing data to organization_subscriptions

-- 1. Migrate profiles.subscription_tier to organization_subscriptions if not already done
-- 2. Migrate organizations.subscription_tier/max_users to organization_subscriptions
-- 3. Remove redundant columns

ALTER TABLE profiles
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_customer_id;

ALTER TABLE organizations
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS max_users;

-- 4. Update RLS policies to reference organization_subscriptions instead
```

**Option B: Keep as Cached Mirror (Alternative)**

If removing fields breaks too many existing queries, keep them as cached/denormalized views:

```sql
-- Create materialized view for backward compatibility
CREATE MATERIALIZED VIEW org_subscription_cache AS
SELECT
  o.id as organization_id,
  COALESCE(os.tier, 'FREE') as subscription_tier,
  COALESCE(os.seat_count, 1) as max_users,
  COALESCE(os.status, 'active') as subscription_status
FROM organizations o
LEFT JOIN organization_subscriptions os ON os.organization_id = o.id
WHERE os.status IN ('active', 'trialing', 'past_due');

-- Refresh on subscription changes (via webhook or trigger)
CREATE OR REPLACE FUNCTION refresh_org_subscription_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW org_subscription_cache;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_cache_on_subscription_change
AFTER INSERT OR UPDATE OR DELETE ON organization_subscriptions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_org_subscription_cache();
```

#### Phase 2: Update All Entitlement Checks (Immediate)

**Standardize all entitlement queries to use organization_subscriptions:**

```typescript
// lib/services/entitlements.ts (NEW FILE)

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface UserEntitlements {
  organizationId: string
  tier: 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  seatCount: number
  seatsUsed: number
  seatsAvailable: number
  hasSeat: boolean
  inGracePeriod: boolean
  gracePeriodEndsAt: string | null
  features: {
    maxCoursesAuthored: number
    maxStudentsPerCourse: number
    aiAssistantAccess: boolean
    aiCoachAccess: boolean
    advancedAnalytics: boolean
    customBranding: boolean
    ssoEnabled: boolean
    prioritySupport: boolean
  }
}

/**
 * Get user's organization entitlements
 * CANONICAL ENTITLEMENT CHECK - USE THIS FOR ALL ENTITLEMENT QUERIES
 */
export async function getUserEntitlements(
  userId: string,
  client?: SupabaseClient
): Promise<UserEntitlements | null> {
  const supabase = client || (await createClient())

  // 1. Get user's organization membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .single()

  if (!membership) {
    return null // User not in any org
  }

  // 2. Get organization subscription (SINGLE SOURCE OF TRUTH)
  const { data: subscription } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .single()

  if (!subscription) {
    // No subscription = FREE tier
    return {
      organizationId: membership.organization_id,
      tier: 'FREE',
      status: 'active',
      seatCount: 1,
      seatsUsed: 0,
      seatsAvailable: 1,
      hasSeat: true,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      features: getTierFeatures('FREE'),
    }
  }

  // 3. Check if user has allocated seat
  const { data: seat } = await supabase
    .from('seat_allocations')
    .select('status')
    .eq('subscription_id', subscription.id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return {
    organizationId: membership.organization_id,
    tier: subscription.tier,
    status: subscription.status,
    seatCount: subscription.seat_count,
    seatsUsed: subscription.seats_used,
    seatsAvailable: subscription.seat_count - subscription.seats_used,
    hasSeat: !!seat || subscription.tier === 'FREE',
    inGracePeriod: !!subscription.grace_period_ends_at,
    gracePeriodEndsAt: subscription.grace_period_ends_at,
    features: getTierFeatures(subscription.tier),
  }
}

function getTierFeatures(tier: string) {
  const features = {
    FREE: {
      maxCoursesAuthored: 1,
      maxStudentsPerCourse: 10,
      aiAssistantAccess: false,
      aiCoachAccess: false,
      advancedAnalytics: false,
      customBranding: false,
      ssoEnabled: false,
      prioritySupport: false,
    },
    PROFESSIONAL: {
      maxCoursesAuthored: 10,
      maxStudentsPerCourse: 100,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: false,
      ssoEnabled: false,
      prioritySupport: false,
    },
    BUSINESS: {
      maxCoursesAuthored: 50,
      maxStudentsPerCourse: 500,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
    },
    BUSINESS_PLUS: {
      maxCoursesAuthored: 200,
      maxStudentsPerCourse: 2000,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
    },
    ENTERPRISE: {
      maxCoursesAuthored: -1, // unlimited
      maxStudentsPerCourse: -1, // unlimited
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
    },
  }

  return features[tier as keyof typeof features] || features.FREE
}

/**
 * Check if user has specific feature access
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof UserEntitlements['features'],
  client?: SupabaseClient
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId, client)
  if (!entitlements) return false

  return entitlements.features[feature] as boolean
}
```

#### Phase 3: Update Webhook Handlers (Immediate)

**Ensure Stripe webhooks update ONLY organization_subscriptions:**

```typescript
// app/api/webhooks/stripe/route.ts
// Already updated in blocker #1 fix - NO CHANGES NEEDED
// ✅ handleCheckoutCompleted: creates organization_subscriptions record
// ✅ handleSubscriptionUpdate: updates organization_subscriptions
// ✅ handleSubscriptionDeleted: marks organization_subscriptions as canceled
// ✅ handleInvoicePaid: records invoice in subscription_invoices
```

#### Phase 4: Update UI Components (High Priority)

**Replace all UI entitlement checks with new service:**

```typescript
// OLD (DEPRECATED - DO NOT USE)
import { useUser } from '@/lib/hooks/use-user'

const { user } = useUser()
const canAccess = user?.subscription_tier === 'PROFESSIONAL' // ❌ WRONG

// NEW (CORRECT)
import { getUserEntitlements, hasFeatureAccess } from '@/lib/services/entitlements'

const entitlements = await getUserEntitlements(user.id)
const canAccess = entitlements?.tier === 'PROFESSIONAL' // ✅ CORRECT

// Or for specific features:
const hasAI = await hasFeatureAccess(user.id, 'aiAssistantAccess') // ✅ CORRECT
```

#### Phase 5: Migration Script (Run Once)

**Migrate existing profiles/organizations data to organization_subscriptions:**

```typescript
// scripts/migrate-entitlements-to-org-subscriptions.ts

import { createAdminClient } from '@/lib/supabase/admin'

async function migrateEntitlements() {
  const supabase = createAdminClient()

  // 1. Migrate individual subscriptions from profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, subscription_tier, stripe_customer_id, stripe_subscription_id')
    .not('stripe_subscription_id', 'is', null)

  for (const profile of profiles || []) {
    // Find user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', profile.id)
      .single()

    if (!membership) continue

    // Check if already migrated
    const { data: existing } = await supabase
      .from('organization_subscriptions')
      .select('id')
      .eq('organization_id', membership.organization_id)
      .single()

    if (existing) continue // Already migrated

    // Create organization subscription
    await supabase.from('organization_subscriptions').insert({
      organization_id: membership.organization_id,
      stripe_subscription_id: profile.stripe_subscription_id,
      stripe_customer_id: profile.stripe_customer_id,
      tier: profile.subscription_tier.toUpperCase(),
      status: 'active',
      seat_count: 1,
      seats_used: 1,
      amount_cents: 0, // Unknown, will be updated by next webhook
      currency: 'CAD',
      billing_interval: 'month',
    })

    // Allocate seat to user
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select('id')
      .eq('organization_id', membership.organization_id)
      .single()

    if (subscription) {
      await supabase.from('seat_allocations').insert({
        subscription_id: subscription.id,
        user_id: profile.id,
        allocated_by: profile.id,
        role_in_org: 'admin',
        status: 'active',
      })
    }
  }

  // 2. Migrate organization subscriptions from organizations table
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, subscription_tier, max_users')
    .not('subscription_tier', 'is', null)

  for (const org of orgs || []) {
    // Check if already migrated
    const { data: existing } = await supabase
      .from('organization_subscriptions')
      .select('id')
      .eq('organization_id', org.id)
      .single()

    if (existing) continue

    await supabase.from('organization_subscriptions').insert({
      organization_id: org.id,
      stripe_subscription_id: `legacy_${org.id}`, // Placeholder
      stripe_customer_id: `legacy_${org.id}`,
      tier: org.subscription_tier.toUpperCase(),
      status: 'active',
      seat_count: org.max_users || 1,
      seats_used: 0,
      amount_cents: 0,
      currency: 'CAD',
      billing_interval: 'month',
    })
  }

  console.log('Migration complete!')
}

migrateEntitlements()
```

## Implementation Checklist

- [x] **Blocker #1**: Fix webhook RLS by passing admin client
- [ ] **Blocker #2 - Phase 1**: Run migration script to consolidate data
- [ ] **Blocker #2 - Phase 2**: Create `lib/services/entitlements.ts` service
- [ ] **Blocker #2 - Phase 3**: Verify webhook handlers (already done)
- [ ] **Blocker #2 - Phase 4**: Update UI components to use new service
- [ ] **Blocker #2 - Phase 5**: Remove or deprecate redundant fields
- [ ] **Blocker #3**: Remove console.log statements (Phase 11 polish)

## Testing Strategy

1. **Unit Tests**: Test `getUserEntitlements()` with various scenarios
2. **Integration Tests**: Verify Stripe webhook updates organization_subscriptions correctly
3. **E2E Tests**: Validate seat allocation/revocation flows
4. **Manual Testing**:
   - Create org subscription via Stripe checkout
   - Verify seat allocation
   - Update subscription in Stripe dashboard
   - Verify webhook updates organization_subscriptions
   - Test grace period behavior
   - Test seat enforcement on user invites

## Rollout Plan

### Week 1: Foundation

- Day 1-2: Create entitlements service
- Day 3-4: Run migration script in staging
- Day 5: Validate data integrity

### Week 2: Implementation

- Day 1-3: Update all UI components
- Day 4-5: Update API routes and server actions

### Week 3: Testing & Cleanup

- Day 1-2: Integration testing
- Day 3-4: Remove redundant fields (if Option A chosen)
- Day 5: Production deployment

## Monitoring & Alerts

**Add monitoring for:**

- Mismatches between organization_subscriptions and Stripe API
- Seat allocation failures
- Grace period expirations
- Invoice recording failures

## Documentation Updates Required

- [ ] Update API documentation with new entitlements endpoints
- [ ] Update developer guide with entitlement checking patterns
- [ ] Create ADR (Architecture Decision Record) for this change
- [ ] Update onboarding documentation

## Backward Compatibility

**Deprecation Period**: 30 days

During transition:

1. Keep old fields in database but mark as deprecated in code comments
2. Log warnings when old fields are accessed
3. After 30 days, remove fields and legacy queries

## Success Metrics

- ✅ Zero data inconsistencies between organization_subscriptions and Stripe
- ✅ 100% of entitlement checks use new service
- ✅ All webhook events successfully update organization_subscriptions
- ✅ Zero RLS errors in production logs
- ✅ Seat enforcement working correctly (no over-allocation)

---

**Status**: Phase 1 planned, pending approval to proceed
**Owner**: Development Team
**Priority**: P0 - Production Blocker
**Target Completion**: Week of [TBD]
