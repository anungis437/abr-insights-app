# Migration CLI Fix Summary

## Problem

When attempting `supabase db push --include-all`, migrations failed due to:

1. Duplicate policy names already existing in database
2. Duplicate migration version numbers (020, 022 exist twice)
3. Indexes without `IF NOT EXISTS` clauses

## Solution Applied

### ✅ Made All Migrations Idempotent (Commit: 1f5d4db)

**Files Fixed:**

1. **020_evidence_bundles_tracking.sql**
   - Added `DROP POLICY IF EXISTS` before CREATE POLICY statements
   - Already had `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`

2. **019_ai_usage_logging.sql**
   - Added `DROP POLICY IF EXISTS` for all 3 policies:
     - `ai_usage_logs_select_own`
     - `ai_usage_logs_select_org_admin`
     - `ai_usage_logs_insert_service`

3. **20250130000001_ai_interaction_logs.sql**
   - Changed `CREATE INDEX` to `CREATE INDEX IF NOT EXISTS` for 7 indexes

4. **20250129000004_organization_subscriptions.sql**
   - Added `IF NOT EXISTS` to 12 indexes across 3 tables

5. **20250116000001_enterprise_sso_auth.sql**
   - Added `DROP POLICY IF EXISTS` for 7 SSO-related policies

6. **022_support_individual_users.sql**
   - Already idempotent (has DROP POLICY IF EXISTS statements)

## Current Status

### ✅ Completed

- All migration files now idempotent
- Can be run multiple times safely
- Changes committed and ready

### ⏳ Pending

- Apply migration 022_support_individual_users.sql to database
- Critical for individual user support

## Recommended Next Steps

### Option 1: Supabase Dashboard (RECOMMENDED)

**Why:** Most reliable, avoids CLI version conflicts, visual confirmation

**Steps:**

1. Go to https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql/new
2. Open `supabase/migrations/022_support_individual_users.sql`
3. Copy entire contents
4. Paste in SQL Editor
5. Click **Run**

**Verification Query:**

```sql
SELECT
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('enrollments', 'user_achievements', 'ai_usage_logs')
  AND column_name = 'organization_id';
```

Expected result: `is_nullable = 'YES'` for all 3 tables

### Option 2: CLI with Sorted Migrations

The duplicate version numbers (020, 022) prevent CLI push. Would need to:

1. Rename duplicate migrations to unique versions
2. Update migration tracking
3. Re-run `supabase db push`

**Not recommended:** More complex, higher risk

## Why This Matters

Migration 022 is **CRITICAL** for individual users:

- Makes `organization_id` nullable in 3 tables
- Updates RLS policies to support individuals
- Creates helper functions for org checks
- Adds performance indexes

**Without it:**

- Individual users cannot enroll in courses
- Individual users cannot earn achievements
- Individual users cannot use AI features

**With it:**

- ✅ Full individual user support
- ✅ Code already deployed (commit 56c860a)
- ✅ Complete feature ready for testing

## Testing After Migration

Once migration 022 is applied:

1. **Hard refresh app** (Ctrl+Shift+R)
2. **Sign up as new user** (without organization)
3. **Browse courses**
4. **Click "Start Course"**
5. **Verify enrollment succeeds** (check browser console)
6. **Access course player**
7. **Verify no errors**

Expected: Complete individual user journey functional!

## Files Reference

- Migration 022: `supabase/migrations/022_support_individual_users.sql`
- Instructions: `MIGRATION_022_INSTRUCTIONS.md`
- This summary: `MIGRATION_CLI_FIX_SUMMARY.md`
- Idempotent fixes commit: `1f5d4db`
- Individual user code commit: `56c860a`
