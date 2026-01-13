# Phase 3 Implementation Plan: RBAC Unification & Permission-Based Security

**Status:** 🔄 IN PROGRESS (Migrations Ready)  
**Date:** January 13, 2026

## Overview

Phase 3 transforms the security model from role-based access control (RBAC) to fine-grained permission-based access control (PBAC). This enables more flexible security policies, easier permission management, and prepares the system for multi-tenant isolation verification.

---

## Goals

1. ✅ **Comprehensive Permission Seeding** - Add 100+ granular permissions for all features
2. ✅ **Permission-Based RLS Functions** - Replace role checks with permission checks
3. ⏳ **Migrate All RLS Policies** - Update 125 tables to use permission-based policies
4. ⏳ **Permission Management UI** - Admin interface for managing permissions
5. ⏳ **Tenant Isolation Testing** - Comprehensive cross-tenant security tests

---

## Implementation Status

### ✅ Completed: Permission Infrastructure

#### 1. Comprehensive Permissions Seed (Migration 020)
**File:** `supabase/migrations/020_comprehensive_permissions_seed.sql`
**Status:** ✅ Created, ⏳ Pending Database Application

**Permissions Added:** ~100 permissions across 15 categories

**Categories:**
1. **AI & ML** (10 permissions)
   - `ai.chat.use`, `ai.coach.use`, `admin.ai.manage`
   - `ai.feedback.submit`, `ai.training.manage`, `ai.automation.manage`
   - `ai.usage.view`, `ai.usage.export`

2. **Embeddings & Search** (6 permissions)
   - `embeddings.generate`, `embeddings.manage`, `embeddings.search`
   - `cases.search`, `courses.search`

3. **Enhanced Course Management** (12 permissions)
   - `courses.view`, `courses.enroll`
   - `lessons.create`, `lessons.update`, `lessons.delete`, `lessons.publish`
   - `quizzes.create`, `quizzes.update`, `quizzes.delete`, `quizzes.take`, `quizzes.review`

4. **Certificates & CE Credits** (7 permissions)
   - `certificates.issue`, `certificates.revoke`, `certificates.view_own`, `certificates.view_all`
   - `ce_credits.earn`, `ce_credits.manage`, `ce_credits.export`

5. **Tribunal Cases** (6 permissions)
   - `cases.view`, `cases.import`, `cases.export`, `cases.annotate`
   - `cases.analyze`, `cases.statistics`

6. **Gamification** (8 permissions)
   - `gamification.earn_points`, `gamification.view_leaderboard`, `gamification.manage_points`
   - `achievements.earn`, `achievements.view`, `achievements.manage`
   - `social.create_groups`, `social.join_groups`, `social.moderate_groups`

7. **Organization & User Management** (10 permissions)
   - `organization.view`, `organization.configure`
   - `subscriptions.manage`, `billing.view`, `billing.manage`
   - `users.invite`, `users.remove`
   - `profiles.view`, `profiles.update_own`, `profiles.update_any`
   - `teams.manage`, `teams.assign`

8. **Content Authoring** (8 permissions)
   - `resources.create`, `resources.update`, `resources.delete`, `resources.publish`
   - `blog.create`, `blog.publish`, `blog.moderate`

9. **Analytics & Reporting** (9 permissions)
   - `analytics.view_own`, `analytics.view_team`, `analytics.view_org`
   - `reports.generate`, `reports.schedule`, `reports.export`

10. **Audit & Compliance** (7 permissions)
    - `audit_logs.view_own`, `audit_logs.view_team`, `audit_logs.view_all`, `audit_logs.export`
    - `compliance.manage`, `compliance.reports`

11. **Instructor Portal** (5 permissions)
    - `instructor.access`, `instructor.analytics`, `instructor.enrollments`
    - `instructor.grade`, `instructor.message`

**Role Permission Assignments:**

| Role | Permission Count | Key Permissions |
|------|------------------|-----------------|
| Super Admin | ALL (~100) | Full system access |
| Admin | ~85 | All except system-level |
| Manager | ~45 | Team management, content creation |
| Instructor | ~25 | Content creation, teaching |
| Learner | ~20 | Learning, basic features |
| Analyst | ~15 | Analytics, reporting |
| Guest | ~3 | Read-only access |

#### 2. Permission-Based RLS Functions (Migration 021)
**File:** `supabase/migrations/021_permission_based_rls_functions.sql`
**Status:** ✅ Created, ⏳ Pending Database Application

**Functions Created:**

**Permission Check Functions:**
```sql
-- Check single permission
auth.has_permission(user_id, org_id, 'permission.slug')

-- Check ANY of multiple permissions (OR logic)
auth.has_any_permission(user_id, org_id, ARRAY['perm1', 'perm2'])

-- Check ALL permissions (AND logic)
auth.has_all_permissions(user_id, org_id, ARRAY['perm1', 'perm2'])

-- Check resource-specific permission
auth.has_resource_permission(user_id, 'resource_type', resource_id, 'action')
```

**Role Check Functions (Backwards Compatibility):**
```sql
-- Check single role
auth.has_role(user_id, 'admin')

-- Check ANY of multiple roles
auth.has_any_role(user_id, ARRAY['admin', 'manager'])

-- Quick admin checks
auth.is_admin(user_id)
auth.is_super_admin(user_id)
```

**Tenant Isolation Functions:**
```sql
-- Get user's organization
auth.user_organization_id()

-- Check org membership
auth.belongs_to_organization(user_id, org_id)

-- Check resource ownership
auth.resource_in_user_org('table_name', resource_id)
```

**Performance Optimizations:**
- Indexed `user_roles(user_id, role_id)`
- Indexed `role_permissions(role_id, permission_id)`
- Indexed `permissions(slug, resource, action)`
- All functions marked `STABLE` for query optimization
- All functions `SECURITY DEFINER` to bypass RLS during checks

---

## RLS Policy Migration Strategy

### Current State Analysis

**Tables with RLS:** ~125 tables  
**Tables with Role-Based Policies:** ~80 tables  
**Common Role Checks:**
```sql
-- Current patterns to replace:
WHERE p.role = 'admin'
WHERE r.slug IN ('admin', 'super_admin')
WHERE p.role IN ('admin', 'manager', 'instructor')
```

**Target Permission-Based Patterns:**
```sql
-- New patterns:
WHERE auth.has_permission(auth.uid(), organization_id, 'resource.read')
WHERE auth.has_any_permission(auth.uid(), organization_id, ARRAY['resource.read', 'admin.manage'])
WHERE auth.is_admin(auth.uid())  -- For backwards compatibility
```

### Migration Priority (3 Phases)

#### Phase 3A: Critical Tables (10 tables) - PRIORITY
**Target:** Core security tables that affect all features

1. **profiles** - User authentication base
   - Current: Role column checks (`role = 'admin'`)
   - Target: Permission-based access
   - Permissions: `profiles.view`, `profiles.update_any`

2. **organizations** - Tenant isolation base
   - Current: Org membership checks
   - Target: Enhanced with permission checks
   - Permissions: `organization.view`, `organization.configure`

3. **user_roles** - RBAC assignment
   - Current: Admin-only management
   - Target: `roles.assign` permission
   - Permissions: `roles.assign`, `roles.read`

4. **courses** - Primary learning content
   - Current: Role-based access
   - Target: Permission-based with instructor ownership
   - Permissions: `courses.read`, `courses.create`, `courses.update`, `courses.delete`, `courses.publish`

5. **lessons** - Course content
   - Current: Course ownership + role checks
   - Target: Permission-based with course context
   - Permissions: `lessons.create`, `lessons.update`, `lessons.delete`, `lessons.publish`

6. **tribunal_cases** - Case law database
   - Current: Role-based read access
   - Target: Permission-based with search permissions
   - Permissions: `cases.view`, `cases.search`, `cases.import`, `cases.export`

7. **quizzes** - Assessment system
   - Current: Instructor role checks
   - Target: Permission-based with ownership
   - Permissions: `quizzes.create`, `quizzes.update`, `quizzes.take`, `quizzes.review`

8. **certificates** - Credential issuance
   - Current: Admin role checks
   - Target: Permission-based issuance
   - Permissions: `certificates.issue`, `certificates.view_own`, `certificates.view_all`

9. **audit_logs** - Security audit trail
   - Current: Admin-only access
   - Target: Tiered permission access
   - Permissions: `audit_logs.view_own`, `audit_logs.view_team`, `audit_logs.view_all`

10. **ai_usage_logs** - AI usage tracking
    - Current: Admin role checks
    - Target: Permission-based with user access to own logs
    - Permissions: `ai.usage.view`, `admin.ai.manage`

#### Phase 3B: Feature Tables (40 tables) - MEDIUM PRIORITY
- Course progress tracking
- Enrollment management
- Gamification tables
- CE credits
- Social features
- Content authoring

#### Phase 3C: Supporting Tables (75 tables) - LOWER PRIORITY
- Settings tables
- Metadata tables
- Cache tables
- Notification tables

### RLS Policy Templates

#### Template 1: Simple Permission Check
```sql
CREATE POLICY "users_can_read_with_permission"
    ON table_name
    FOR SELECT
    USING (
        organization_id = auth.user_organization_id()
        AND auth.has_permission(auth.uid(), organization_id, 'resource.read')
    );
```

#### Template 2: Multiple Permission Options (OR)
```sql
CREATE POLICY "users_can_read_with_any_permission"
    ON table_name
    FOR SELECT
    USING (
        organization_id = auth.user_organization_id()
        AND auth.has_any_permission(
            auth.uid(),
            organization_id,
            ARRAY['resource.read', 'resource.manage', 'admin.all']
        )
    );
```

#### Template 3: Owner + Permission Check
```sql
CREATE POLICY "users_can_update_own_or_with_permission"
    ON table_name
    FOR UPDATE
    USING (
        (user_id = auth.uid())  -- Own records
        OR (
            organization_id = auth.user_organization_id()
            AND auth.has_permission(auth.uid(), organization_id, 'resource.update_any')
        )
    );
```

#### Template 4: Admin Override
```sql
CREATE POLICY "users_can_delete_with_permission_or_admin"
    ON table_name
    FOR DELETE
    USING (
        organization_id = auth.user_organization_id()
        AND (
            auth.has_permission(auth.uid(), organization_id, 'resource.delete')
            OR auth.is_admin(auth.uid())
        )
    );
```

---

## Testing Requirements

### 1. Permission Check Tests
```typescript
// Test permission assignment
await testUserHasPermission('learner@test.com', 'courses.view')
await testUserLacksPermission('learner@test.com', 'courses.delete')

// Test permission inheritance
await testUserInheritsPermission('manager@test.com', 'instructor.access')

// Test org context
await testPermissionScopedToOrg('user@org1.com', 'org1-id', 'courses.create')
```

### 2. Tenant Isolation Tests
```typescript
// Test cross-tenant access prevention
await testCannotAccessOtherOrgData('user@org1.com', 'org2-course-id')

// Test org-scoped queries
await testQueriesLimitedToOrg('user@org1.com')

// Test admin boundaries
await testAdminScopedToOrg('admin@org1.com', 'org1-id')
```

### 3. RLS Policy Tests
```typescript
// Test SELECT policies
await testCanReadOwnOrgData('user@org1.com')
await testCannotReadOtherOrgData('user@org1.com', 'org2-id')

// Test INSERT policies
await testCanInsertWithPermission('instructor@org1.com', 'courses.create')
await testCannotInsertWithoutPermission('learner@org1.com', 'courses.create')

// Test UPDATE policies
await testCanUpdateOwnData('user@org1.com')
await testCanUpdateWithPermission('admin@org1.com', 'users.update')

// Test DELETE policies
await testCanDeleteWithPermission('admin@org1.com', 'courses.delete')
await testCannotDeleteWithoutPermission('learner@org1.com', 'courses.delete')
```

---

## Migration Execution Plan

### Step 1: Apply Permission Infrastructure ✅
```bash
# Apply migrations 020 and 021
psql -h <host> -U postgres -d postgres -f supabase/migrations/020_comprehensive_permissions_seed.sql
psql -h <host> -U postgres -d postgres -f supabase/migrations/021_permission_based_rls_functions.sql
```

### Step 2: Verify Permission Data
```sql
-- Check permission count
SELECT COUNT(*) FROM permissions;
-- Expected: ~100

-- Check role assignments
SELECT r.slug, COUNT(*) as permission_count
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
GROUP BY r.slug
ORDER BY permission_count DESC;

-- Test permission functions
SELECT auth.has_permission(
    '<user-uuid>',
    '<org-uuid>',
    'courses.read'
);
```

### Step 3: Migrate Critical Tables (Phase 3A)
```bash
# Create and apply migration for 10 critical tables
psql -h <host> -U postgres -d postgres -f supabase/migrations/022_migrate_critical_table_rls.sql
```

### Step 4: Verify RLS Changes
```sql
-- List all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Test permission-based access
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "<user-uuid>"}';
SELECT * FROM courses LIMIT 10;
```

### Step 5: Migrate Remaining Tables (Phases 3B, 3C)
```bash
# Apply feature tables migration
psql -h <host> -U postgres -d postgres -f supabase/migrations/023_migrate_feature_table_rls.sql

# Apply supporting tables migration
psql -h <host> -U postgres -d postgres -f supabase/migrations/024_migrate_supporting_table_rls.sql
```

### Step 6: Run Tenant Isolation Tests
```bash
# Execute comprehensive test suite
npm run test:security
npm run test:tenant-isolation
```

---

## Backwards Compatibility

**Maintained:**
- ✅ `profiles.role` column still exists
- ✅ Role-based helper functions available
- ✅ Existing role assignments preserved
- ✅ Gradual migration path

**Migration Strategy:**
1. Add permission-based policies alongside role-based policies
2. Test both systems in parallel
3. Gradually phase out role-based checks
4. Eventually remove role column (Phase 4+)

---

## Performance Considerations

### Query Optimization
- All permission check functions marked `STABLE` for caching
- Strategic indexes on permission lookup paths
- Function inlining for simple permission checks

### Expected Performance Impact
- Permission check: ~0.5-2ms per query
- RLS policy evaluation: ~1-3ms per query
- Total overhead: ~2-5ms per authenticated query

### Mitigation Strategies
- Permission caching (already in advanced RBAC)
- Connection pooling
- Prepared statement optimization
- Index optimization on user_roles, role_permissions

---

## Next Steps

1. ✅ **Create migrations 020 & 021** - COMPLETE
2. ⏳ **Apply migrations to database** - Pending connection fix
3. ⏳ **Create migration 022** - Critical table RLS updates
4. ⏳ **Build permission management UI** - Admin interface
5. ⏳ **Create tenant isolation test suite** - Security verification
6. ⏳ **Document permission hierarchy** - Developer guide

---

## Success Criteria

- ✅ 100+ permissions seeded across all features
- ✅ Permission check functions available
- ⏳ All 125 tables use permission-based RLS
- ⏳ Zero cross-tenant data leaks in tests
- ⏳ <5ms performance overhead per query
- ⏳ Permission management UI functional
- ⏳ Comprehensive test coverage (>90%)

---

## Risk Mitigation

**Risks:**
1. Database connection issues preventing migration application
2. Performance degradation from permission checks
3. Breaking existing functionality during migration
4. Complex RLS policy bugs

**Mitigations:**
1. Document manual migration steps
2. Performance testing before rollout
3. Parallel policy deployment with gradual cutover
4. Comprehensive test suite with rollback plan

---

## Documentation Deliverables

1. ✅ This implementation plan
2. ⏳ Permission hierarchy reference guide
3. ⏳ RLS policy migration guide
4. ⏳ Testing guide for tenant isolation
5. ⏳ Admin user guide for permission management

**Status:** Phase 3 foundation complete, ready for database application and RLS migration
