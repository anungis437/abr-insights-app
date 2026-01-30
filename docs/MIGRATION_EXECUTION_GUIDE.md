# Entitlements Migration Execution Guide

## Prerequisites

Before running the migration, you need:

1. **Supabase Credentials** - Set in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database Backup** - Create before running live migration:
   ```bash
   # Via Supabase Dashboard:
   # Project Settings → Database → Backups → Create Backup
   
   # Or via CLI:
   supabase db dump -f backup-pre-entitlements-$(date +%Y%m%d).sql
   ```

## Migration Steps

### Step 1: Dry Run (Test Mode)

Run without making any changes to preview what would be migrated:

```bash
# Windows PowerShell
cd d:\APPS\abr-insights-app
npx tsx scripts/migrate-entitlements.ts --dry-run

# Expected Output:
# ============================================================
# 🔄 ENTITLEMENTS MIGRATION
# ============================================================
# Mode: 🔍 DRY RUN (no changes)
# 
# Phase 1: Migrating profiles.subscription_tier...
# Would migrate: 15 profiles
# 
# Phase 2: Migrating organizations.subscription_tier...
# Would migrate: 8 organizations
# 
# Summary:
# ✅ Profiles to migrate: 15
# ✅ Organizations to migrate: 8
# ✅ Seats to allocate: 15
# ❌ Errors: 0
```

### Step 2: Review Dry Run Results

Check for:
- **Count of profiles/orgs to migrate**: Should match your database
- **Error messages**: Fix any issues before proceeding
- **Unexpected behavior**: Investigate anomalies

### Step 3: Create Database Backup

**CRITICAL**: Always backup before running live migration:

```bash
# Option A: Supabase Dashboard
# 1. Go to Project Settings
# 2. Navigate to Database → Backups
# 3. Click "Create Backup"
# 4. Wait for confirmation

# Option B: pg_dump (if you have direct access)
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup-pre-entitlements-$(date +%Y%m%d).backup
```

### Step 4: Run Live Migration

Once dry-run looks good and backup is complete:

```bash
# Remove --dry-run flag to execute
npx tsx scripts/migrate-entitlements.ts

# Expected Output:
# ============================================================
# 🔄 ENTITLEMENTS MIGRATION
# ============================================================
# Mode: 🚀 LIVE MODE (will modify data)
# 
# Phase 1: Migrating profiles...
# ✅ Migrated profile: user@example.com (FREE → organization_subscriptions)
# ✅ Migrated profile: premium@example.com (PROFESSIONAL → organization_subscriptions)
# ...
# 
# Phase 2: Migrating organizations...
# ✅ Migrated org: Acme Corp (BUSINESS → organization_subscriptions)
# ...
# 
# Final Summary:
# ✅ Profiles migrated: 15
# ✅ Organizations migrated: 8
# ✅ Seats allocated: 15
# ❌ Errors: 0
# 
# ✅ Migration completed successfully!
```

### Step 5: Verify Data Integrity

Run SQL queries to verify migration success:

```sql
-- 1. Check all subscriptions were created
SELECT 
  os.id,
  os.organization_id,
  os.tier,
  os.status,
  os.seat_count,
  os.seats_used,
  os.stripe_subscription_id
FROM organization_subscriptions os
ORDER BY os.created_at DESC;

-- 2. Verify seat allocations match seats_used
SELECT 
  os.organization_id,
  os.seat_count,
  os.seats_used,
  COUNT(sa.id) as actual_seats_allocated
FROM organization_subscriptions os
LEFT JOIN seat_allocations sa 
  ON sa.subscription_id = os.id 
  AND sa.status = 'active'
GROUP BY os.id
HAVING COUNT(sa.id) != os.seats_used;
-- Should return 0 rows (no discrepancies)

-- 3. Check for users without entitlements
SELECT 
  p.id,
  p.email,
  p.subscription_tier as legacy_tier,
  os.tier as new_tier
FROM profiles p
LEFT JOIN seat_allocations sa ON sa.user_id = p.id AND sa.status = 'active'
LEFT JOIN organization_subscriptions os ON os.id = sa.subscription_id
WHERE p.subscription_tier IS NOT NULL 
  AND os.tier IS NULL;
-- Should return 0 rows (all migrated)

-- 4. Verify organization migrations
SELECT 
  o.id,
  o.name,
  o.subscription_tier as legacy_tier,
  os.tier as new_tier,
  o.max_users as legacy_max_users,
  os.seat_count as new_seat_count
FROM organizations o
LEFT JOIN organization_subscriptions os ON os.organization_id = o.id
WHERE o.subscription_tier IS NOT NULL 
  AND os.tier IS NULL;
-- Should return 0 rows (all migrated)
```

### Step 6: Test Entitlements API

Verify the new service works correctly:

```bash
# Test authenticated API endpoint
curl -X GET http://localhost:3000/api/entitlements \
  -H "Cookie: your-auth-cookie"

# Expected Response:
{
  "entitlements": {
    "tier": "PROFESSIONAL",
    "status": "active",
    "hasSeat": true,
    "organizationId": "uuid",
    "organizationName": "Acme Corp",
    "features": {
      "maxCoursesAuthored": 10,
      "maxStudentsPerCourse": 100,
      "maxOrganizationMembers": 5,
      "aiAssistantAccess": true,
      "aiCoachAccess": true,
      "advancedAnalytics": true,
      "customBranding": false,
      "ssoEnabled": false,
      "prioritySupport": false,
      "exportCapabilities": true,
      "citatoryIntegration": true
    },
    "currentUsage": {
      "coursesAuthored": 3,
      "studentsEnrolled": 45,
      "organizationMembers": 2
    }
  }
}
```

## Rollback Plan

If issues are discovered after migration:

### Option 1: Restore from Backup

```bash
# Via Supabase Dashboard:
# 1. Go to Project Settings → Database → Backups
# 2. Find your pre-migration backup
# 3. Click "Restore" and confirm

# Via pg_restore (if using pg_dump):
pg_restore -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backup-pre-entitlements-YYYYMMDD.backup
```

### Option 2: Manual Rollback (Partial)

If only specific records need reverting:

```sql
-- Rollback specific organization subscription
DELETE FROM seat_allocations 
WHERE subscription_id = 'subscription-uuid';

DELETE FROM organization_subscriptions 
WHERE id = 'subscription-uuid';

-- Verify legacy data still intact
SELECT subscription_tier FROM profiles WHERE id = 'user-uuid';
```

### Option 3: Hybrid Mode (Temporary)

Keep both old and new systems running:

```typescript
// In lib/services/entitlements.ts, add fallback
async function getUserEntitlements(userId: string) {
  try {
    // Try new system first
    const newData = await fetchFromOrgSubscriptions(userId)
    if (newData) return newData
  } catch (error) {
    console.error('New system error, falling back:', error)
  }
  
  // Fallback to legacy
  return await fetchLegacySubscription(userId)
}
```

## Common Issues & Solutions

### Issue 1: "Missing Supabase credentials"

**Cause**: `.env.local` not configured or variables not loaded

**Solution**:
```bash
# Create .env.local from template
cp .env.example .env.local

# Edit with your actual values
# Then restart any running processes
```

### Issue 2: "Subscription already exists for organization"

**Cause**: Migration was run multiple times

**Solution**:
```sql
-- Check for duplicates
SELECT organization_id, COUNT(*) 
FROM organization_subscriptions 
GROUP BY organization_id 
HAVING COUNT(*) > 1;

-- Clean up duplicates (keep most recent)
DELETE FROM organization_subscriptions os1
WHERE os1.id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY organization_id 
      ORDER BY created_at DESC
    ) as rn
    FROM organization_subscriptions
  ) os2 WHERE rn = 1
);
```

### Issue 3: "Seats_used doesn't match actual allocations"

**Cause**: Concurrent modifications during migration

**Solution**:
```sql
-- Recalculate seats_used for all subscriptions
UPDATE organization_subscriptions os
SET seats_used = (
  SELECT COUNT(*)
  FROM seat_allocations sa
  WHERE sa.subscription_id = os.id
    AND sa.status = 'active'
);

-- Verify fix
SELECT * FROM organization_subscriptions
WHERE seats_used != (
  SELECT COUNT(*) FROM seat_allocations 
  WHERE subscription_id = organization_subscriptions.id 
  AND status = 'active'
);
-- Should return 0 rows
```

### Issue 4: Migration script hangs/times out

**Cause**: Large dataset, slow network, or database locks

**Solution**:
```bash
# Option A: Run with smaller batch sizes
# Edit scripts/migrate-entitlements.ts, reduce batch size:
const BATCH_SIZE = 10 // Instead of 100

# Option B: Run during low-traffic period
# Schedule for 2-3 AM when fewest users online

# Option C: Manually migrate in phases
# Phase 1: Migrate just profiles
npx tsx scripts/migrate-profiles-only.ts

# Phase 2: Migrate organizations separately
npx tsx scripts/migrate-orgs-only.ts
```

## Post-Migration Checklist

- [ ] Verify migration summary shows 0 errors
- [ ] Run SQL verification queries (all return 0 rows)
- [ ] Test `/api/entitlements` endpoint returns correct data
- [ ] Test `useEntitlements()` hook in UI
- [ ] Check feature flags work (AI, SSO, exports)
- [ ] Verify seat allocation enforcement
- [ ] Test Stripe webhook creates subscriptions correctly
- [ ] Monitor logs for errors for 24-48 hours
- [ ] Update UI components to use new service
- [ ] Remove legacy `subscription_tier` checks
- [ ] Schedule removal of redundant database fields (after 2 weeks validation)

## Next Steps After Migration

1. **Update UI Components** (Priority: High)
   - Replace `subscription_tier` checks with `useEntitlements()`
   - Use `hasFeature()` for feature gates
   - Use `canPerformAction()` for limit validation

2. **Test Stripe Checkout Flow** (Priority: Critical)
   - Create test checkout → complete → webhook → verify entitlements

3. **Monitor Production** (Priority: Critical)
   - Set up alerts for entitlement API errors
   - Track query performance
   - Monitor Stripe webhook success rate

4. **Clean Up Legacy Fields** (Priority: Low - after 2 weeks)
   - Remove `profiles.subscription_tier`
   - Remove `organizations.subscription_tier`
   - Update RLS policies

## Support

If you encounter issues:

1. **Check migration logs** in terminal output
2. **Review SQL verification queries** for data discrepancies
3. **Check Supabase Dashboard** → Database → Table Editor
4. **Consult documentation**:
   - [ENTITLEMENTS_SOURCE_OF_TRUTH.md](./ENTITLEMENTS_SOURCE_OF_TRUTH.md)
   - [ENTITLEMENTS_IMPLEMENTATION_PROGRESS.md](./ENTITLEMENTS_IMPLEMENTATION_PROGRESS.md)
5. **Rollback if needed** - restore from backup

## Migration Timeline

**Estimated Total Time**: 2-3 hours

- Dry run + review: 30 minutes
- Backup creation: 15 minutes
- Live migration: 10-30 minutes (depends on data size)
- Verification: 30 minutes
- Testing: 30 minutes
- Monitoring: 30 minutes

**Best Time to Run**: During low-traffic period (2-4 AM local time)

**Rollback Window**: Keep backup for 30 days

---

**Status**: Ready to execute
**Prerequisites**: Supabase credentials in `.env.local`
**Next Action**: Run dry-run migration
