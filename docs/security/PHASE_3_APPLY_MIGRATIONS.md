# 🚀 APPLY PHASE 3 MIGRATIONS - Quick Start Guide

**Solution for "permission denied for schema auth" error**

## Problem Fixed ✅

The original migration 021 tried to create functions in the `auth` schema, but Supabase doesn't allow this via the Dashboard.

**Solution:** Created `021_permission_based_rls_functions_v2.sql` that uses the `public` schema instead.

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Go to: **<https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql>**

### 2. Apply Migration 021 V2 (Permission Functions)

**File:** `supabase/migrations/021_permission_based_rls_functions_v2.sql`

1. Open the file in VS Code
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

**Expected Output:**

```
✓ CREATE FUNCTION (x11)
✓ NOTICE: Testing permission functions
✓ NOTICE: has_permission(courses.read): true/false
✓ NOTICE: All permission functions created successfully!
✓ NOTICE: Permission functions created: 11 of 11
```

**Time:** ~5 seconds

---

### 3. Apply Migration 022 (Critical Tables)

**File:** `supabase/migrations/022_migrate_critical_table_rls.sql`

1. Open the file in VS Code
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button

**Expected Output:**

```
✓ ALTER TABLE ... ENABLE ROW LEVEL SECURITY (x10)
✓ DROP POLICY ... (old role-based policies removed)
✓ CREATE POLICY ... (new permission-based policies created)
✓ COMMENT ON POLICY ...
✓ Migration complete
```

**Time:** ~15-20 seconds

**Tables Migrated (10):**

- profiles
- organizations
- user_roles
- courses
- lessons
- tribunal_cases
- quizzes
- certificates
- audit_logs
- ai_usage_logs

---

### 4. Apply Migration 023 (Feature Tables)

**File:** `supabase/migrations/023_migrate_feature_table_rls.sql`

1. Open the file in VS Code
2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button

**Expected Output:**

```
✓ DROP POLICY ... (x140+)
✓ CREATE POLICY ... (x140+)
✓ Migration complete - 20 tables
```

**Time:** ~30-45 seconds (largest migration)

**Tables Migrated (20):**

- enrollments
- lesson_progress
- quiz_attempts
- quiz_responses
- course_achievements
- user_course_achievements
- course_achievement_progress
- course_user_streaks
- user_course_points
- course_points_transactions
- course_leaderboards
- course_leaderboard_entries
- course_study_groups
- course_study_group_members
- course_user_follows
- course_peer_reviews
- course_modules
- questions
- learning_paths
- learning_path_enrollments

---

## Verification

After all migrations are applied, run this in SQL Editor:

```sql
-- 1. Check permission functions (should return 11)
SELECT COUNT(*) as function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'has_permission',
    'has_any_permission',
    'has_all_permissions',
    'has_resource_permission',
    'has_role',
    'has_any_role',
    'is_admin',
    'is_super_admin',
    'user_organization_id',
    'belongs_to_organization',
    'resource_in_user_org'
);
-- Expected: function_count = 11

-- 2. Check permission-based policies (should return 30 tables)
SELECT COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies
WHERE schemaname = 'public'
AND (
    pg_get_expr(polqual, polrelid) LIKE '%public.has_permission%'
    OR pg_get_expr(polqual, polrelid) LIKE '%public.is_admin%'
);
-- Expected: tables_with_policies = 30

-- 3. Test permission check (should work without errors)
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_result BOOLEAN;
BEGIN
    SELECT id, organization_id INTO v_user_id, v_org_id
    FROM profiles
    WHERE organization_id IS NOT NULL
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        v_result := public.has_permission(v_user_id, v_org_id, 'courses.read');
        RAISE NOTICE 'Permission check successful! Result: %', v_result;
    END IF;
END $$;
-- Expected: "Permission check successful! Result: true/false"
```

---

## Troubleshooting

### Error: "function public.has_permission does not exist"

**Cause:** Migration 021_v2 not applied
**Fix:** Apply migration 021_v2 first

### Error: "relation does not exist"

**Cause:** Table referenced in policy doesn't exist
**Fix:** Check table name in error, ensure it exists in your database

### Error: "syntax error at or near..."

**Cause:** Incomplete SQL copied
**Fix:** Ensure you copied the ENTIRE file contents

### Policies created but tests fail

**Cause:** RLS functions not working correctly
**Fix:**

1. Check functions exist: `SELECT proname FROM pg_proc WHERE proname LIKE '%permission%'`
2. Re-run migration 021_v2 if functions missing

---

## What Changed from Original Migration 021?

| Original                      | Fixed (V2)                      |
| ----------------------------- | ------------------------------- |
| `auth.has_permission()`       | `public.has_permission()`       |
| `auth.has_any_permission()`   | `public.has_any_permission()`   |
| `auth.is_admin()`             | `public.is_admin()`             |
| `auth.user_organization_id()` | `public.user_organization_id()` |
| ...                           | ... (all 11 functions)          |

**Security:** Still uses `SECURITY DEFINER STABLE` - same security, different schema!

---

## After Migration Success

### 1. Run Test Suite

```bash
npm run test -- tenant-isolation.test.ts
```

Expected: **29 tests pass** ✅

### 2. Test Permission UI

```bash
npm run dev
```

Visit: **<http://localhost:3000/admin/permissions-management>**

- ✓ Permission matrix loads
- ✓ Search and filter work
- ✓ Toggle permissions
- ✓ Statistics display

### 3. Verify in Production

Check a few key queries:

```sql
-- Can users see only their own organization's data?
SELECT id, organization_id
FROM profiles
WHERE id = auth.uid();

-- Are permission checks working?
SELECT public.has_permission(
    auth.uid(),
    (SELECT organization_id FROM profiles WHERE id = auth.uid()),
    'courses.read'
);
```

---

## Summary

✅ **Migration 020:** Already applied (106 permissions seeded)  
⏳ **Migration 021 V2:** Apply now (11 permission functions)  
⏳ **Migration 022:** Apply now (10 critical tables)  
⏳ **Migration 023:** Apply now (20 feature tables)

**Total Time:** ~1 minute  
**Risk Level:** Low (read-only users unaffected, RLS already enabled)  
**Rollback:** Available via backup

---

## Need Help?

See detailed documentation:

- [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md)
- [PHASE_3_MIGRATION_STATUS.md](./PHASE_3_MIGRATION_STATUS.md)

---

**Ready? Start with Step 1!** 🚀
