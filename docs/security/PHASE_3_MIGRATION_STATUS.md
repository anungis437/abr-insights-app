# Phase 3 Migration Status

**Date:** January 13, 2026  
**Status:** Partial - Manual Steps Required

## ✅ Completed

### Migration 020: Comprehensive Permissions Seed
**Status:** ✅ APPLIED SUCCESSFULLY

Applied via direct PostgreSQL connection on January 13, 2026

**Results:**
```
INSERT 0 11   (AI permissions)
INSERT 0 6    (Embeddings)
INSERT 0 18   (Courses - expanded)
INSERT 0 6    (Cases)
INSERT 0 9    (Lessons)
INSERT 0 11   (Quizzes)
INSERT 0 7    (Certificates)
INSERT 0 6    (CE Credits)
INSERT 0 6    (Organization)
INSERT 0 5    (Analytics)
INSERT 0 63   (Role assignments - Super Admin)
INSERT 0 33   (Role assignments - Admin)
INSERT 0 27   (Role assignments - Manager)
INSERT 0 21   (Role assignments - Instructor)
INSERT 0 14   (Role assignments - Learner)
INSERT 0 3    (Role assignments - Guest)
```

**Total Permissions:** 106

**Permissions by Resource:**
- achievements: 3
- admin: 1
- ai: 10
- analytics: 5
- audit_logs: 5
- billing: 2
- blog: 3
- cases: 11
- ce_credits: 3
- certificates: 4
- compliance: 2
- courses: 8
- embeddings: 4
- gamification: 3
- instructor: 5
- lessons: 4
- organization: 4
- profiles: 3
- quizzes: 5
- reports: 3
- resources: 4
- roles: 2
- social: 3
- subscriptions: 1
- teams: 2
- users: 6

**Verification:**
```sql
SELECT COUNT(*) FROM permissions;
-- Result: 106 permissions (was 21 before)
```

## ⚠️ Pending - Requires Manual Application

### Migration 021: Permission-Based RLS Functions
**Status:** ⏳ REQUIRES SUPABASE DASHBOARD

**Issue:** The pooler connection (`aws-1-ca-central-1.pooler.supabase.com`) does not have permission to create functions in the `auth` schema.

**Error:**
```
ERROR: permission denied for schema auth
```

**Solution:** Apply via Supabase Dashboard SQL Editor

#### Manual Steps:

1. **Go to Supabase Dashboard SQL Editor:**
   - URL: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql
   - Login with your Supabase account

2. **Open Migration File:**
   - File: `supabase/migrations/021_permission_based_rls_functions.sql`
   - Copy entire file contents (437 lines)

3. **Paste and Execute:**
   - Paste SQL into SQL Editor
   - Click "Run" button
   - Wait for completion (should take 5-10 seconds)

4. **Verify:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'auth' 
   AND routine_name LIKE '%permission%';
   ```
   
   Expected functions:
   - `has_permission`
   - `has_any_permission`
   - `has_all_permissions`
   - `has_resource_permission`
   - `has_role`
   - `has_any_role`
   - `is_admin`
   - `is_super_admin`
   - `user_organization_id`
   - `belongs_to_organization`
   - `resource_in_user_org`

### Migration 022: Critical Table RLS Migration
**Status:** ⏳ PENDING (depends on 021)

**Affected Tables (10):**
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

**Manual Steps:**

1. **Ensure Migration 021 is applied first**
   - The policies depend on the permission check functions

2. **Apply via Supabase Dashboard:**
   - File: `supabase/migrations/022_migrate_critical_table_rls.sql`
   - Copy/paste into SQL Editor
   - Run (takes 15-30 seconds)

3. **Verify:**
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('profiles', 'courses', 'audit_logs')
   GROUP BY tablename;
   ```
   
   Expected: 5-9 policies per table

### Migration 023: Feature Table RLS Migration
**Status:** ⏳ PENDING (depends on 021)

**Affected Tables (20):**
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

**Manual Steps:**

1. **Ensure Migrations 021 & 022 are applied first**

2. **Apply via Supabase Dashboard:**
   - File: `supabase/migrations/023_migrate_feature_table_rls.sql`
   - Copy/paste into SQL Editor
   - Run (takes 30-60 seconds - largest migration)

3. **Verify:**
   ```sql
   SELECT tablename, COUNT(*) as policy_count
   FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('enrollments', 'course_achievements', 'learning_paths')
   GROUP BY tablename;
   ```
   
   Expected: 4-7 policies per table

## 📋 Complete Migration Checklist

- [x] **Migration 020** - Permissions seeded (106 permissions)
- [ ] **Migration 021** - Permission functions in auth schema
- [ ] **Migration 022** - Critical table RLS policies (10 tables)
- [ ] **Migration 023** - Feature table RLS policies (20 tables)
- [ ] **Test Suite** - Run tenant isolation tests
- [ ] **UI Testing** - Test permission management UI

## 🚀 After Manual Migration Steps

Once you've applied migrations 021, 022, and 023 via the Supabase Dashboard:

### 1. Verify Functions Created
```sql
-- Check all permission functions exist
SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
AND routine_name IN (
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
)
ORDER BY routine_name;
```

Expected: 11 functions

### 2. Verify Policies Created
```sql
-- Count policies by table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
HAVING COUNT(*) > 0
ORDER BY tablename;
```

Expected: 30 tables with 4-9 policies each (~180 total policies)

### 3. Test Permission Check
```sql
-- Test the permission check function
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
    v_has_perm BOOLEAN;
BEGIN
    -- Get first user
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- Get their org
    SELECT organization_id INTO v_org_id 
    FROM profiles 
    WHERE id = v_user_id;
    
    -- Test permission check
    v_has_perm := auth.has_permission(v_user_id, v_org_id, 'courses.read');
    
    RAISE NOTICE 'User % in org % has courses.read: %', v_user_id, v_org_id, v_has_perm;
END $$;
```

### 4. Run Test Suite
```bash
npm run test -- tenant-isolation.test.ts
```

Expected: 29 tests pass

### 5. Test Permission Management UI
```bash
npm run dev
```

Then visit: http://localhost:3000/admin/permissions-management

- Verify permission matrix loads
- Test permission toggling
- Test search and filter
- Verify statistics display

## 🔧 Troubleshooting

### Issue: "permission denied for schema auth"
**Solution:** Must use Supabase Dashboard SQL Editor, not pooler connection

### Issue: "function auth.has_permission does not exist"
**Solution:** Apply Migration 021 first before 022 and 023

### Issue: "relation does not exist"
**Solution:** Ensure table exists before applying policies

### Issue: Test failures
**Solution:** 
1. Verify all migrations applied
2. Check RLS is enabled: `SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=true;`
3. Check service role key is correct in `.env.local`

## 📊 Migration Impact

**Database Changes:**
- ✅ 106 permissions seeded (vs 21 before)
- ⏳ 11 permission functions to be created
- ⏳ ~180 permission-based policies to be created
- ⏳ 30 tables to be migrated

**When Complete:**
- 100% of critical tables secured with PBAC
- Fine-grained permission control
- Tenant isolation guaranteed
- Admin UI for permission management

## 📖 References

- [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md) - Full documentation
- [phase3-progress-summary.md](./phase3-progress-summary.md) - Progress tracking
- Supabase Dashboard: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz

---

**Next Action:** Apply migrations 021, 022, 023 via Supabase Dashboard SQL Editor
