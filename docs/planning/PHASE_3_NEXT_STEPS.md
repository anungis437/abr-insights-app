# Phase 3 Post-Migration: Next Steps & Action Plan

**Date**: January 13, 2026  
**Status**: Phase 3 Complete ✅ → Moving to Implementation & Testing

---

## Phase 3 Achievement Summary

✅ **All 4 Database Migrations Applied Successfully:**

- Migration 020: 106 permissions seeded
- Migration 021: 13 RLS helper functions created
- Migration 022: 10 critical tables migrated (~60 policies)
- Migration 023: 20 feature tables migrated (~100 policies)

**Total Impact:**

- 30 tables with permission-based access control
- ~160 RLS policies operational
- Multi-tenant isolation enforced
- Fine-grained permission system active

---

## Immediate Next Steps (Phase 3 Implementation)

### 1. Update Backend API Layer (Priority: CRITICAL)

**Estimated Time:** 2-3 days

All server actions and API routes need to respect the new permission system:

#### Files to Update

```
lib/actions/
├── courses.ts           - Add permission checks to course operations
├── enrollments.ts       - Add permission checks to enrollment operations
├── quizzes.ts           - Add permission checks to quiz operations
├── achievements.ts      - Add permission checks to gamification
├── profiles.ts          - Add permission checks to profile operations
├── organizations.ts     - Add permission checks to org operations
└── ai-usage.ts          - Add permission checks to AI operations
```

#### Example Implementation

```typescript
// lib/actions/courses.ts
import { createClient } from '@/lib/supabase/server'

export async function updateCourse(courseId: string, updates: CourseUpdate) {
  const supabase = await createClient()

  // Check permission using RLS function
  const { data: hasPermission } = await supabase.rpc('has_any_permission', {
    permissions: ['courses.update', 'courses.manage'],
  })

  if (!hasPermission) {
    return { error: 'Insufficient permissions' }
  }

  // Update will also be checked by RLS policies
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()

  return { data, error }
}
```

### 2. Create Permission Management Hooks (Priority: HIGH)

**Estimated Time:** 1 day

#### Files to Create

```typescript
// lib/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPermissions() {
      const supabase = await createClient()
      const { data } = await supabase
        .from('user_permissions')
        .select('permissions(name)')
        .eq('user_id', user?.id)

      const perms = new Set(data?.map((p) => p.permissions.name) || [])
      setPermissions(perms)
      setLoading(false)
    }

    if (user) loadPermissions()
  }, [user])

  const hasPermission = useCallback(
    (permission: string) => {
      return permissions.has(permission)
    },
    [permissions]
  )

  const hasAnyPermission = useCallback(
    (perms: string[]) => {
      return perms.some((p) => permissions.has(p))
    },
    [permissions]
  )

  const hasAllPermissions = useCallback(
    (perms: string[]) => {
      return perms.every((p) => permissions.has(p))
    },
    [permissions]
  )

  return {
    permissions: Array.from(permissions),
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}

// lib/hooks/usePermissionCheck.ts
export function usePermissionCheck(permission: string) {
  const { hasPermission, loading } = usePermissions()
  return { allowed: hasPermission(permission), loading }
}
```

### 3. Update UI Components with Permission Checks (Priority: HIGH)

**Estimated Time:** 2-3 days

#### Components to Update

```
components/
├── courses/
│   ├── CourseActions.tsx          - Show/hide edit/delete based on permissions
│   ├── CourseCard.tsx             - Show/hide admin actions
│   └── CourseModuleNav.tsx        - Show/hide instructor tools
├── admin/
│   ├── UserManagement.tsx         - Check users.manage permission
│   ├── PermissionEditor.tsx       - Check permissions.manage permission
│   └── OrganizationSettings.tsx   - Check organizations.manage permission
├── dashboard/
│   └── AdminPanel.tsx             - Check various admin permissions
└── shared/
    └── navigation/
        └── Sidebar.tsx            - Show/hide nav items based on permissions
```

#### Example Implementation

```typescript
// components/courses/CourseActions.tsx
'use client';

import { usePermissions } from '@/lib/hooks/usePermissions';

export function CourseActions({ course }) {
  const { hasAnyPermission, loading } = usePermissions();

  if (loading) return <Skeleton />;

  const canEdit = hasAnyPermission(['courses.update', 'courses.manage'])
    || course.instructor_id === user?.id;
  const canDelete = hasAnyPermission(['courses.delete', 'courses.manage']);

  return (
    <div>
      <ViewButton />
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

### 4. Create Permission Management Admin UI (Priority: MEDIUM)

**Estimated Time:** 2 days

#### New Admin Pages to Create

```
app/admin/
├── permissions/
│   ├── page.tsx                   - List all permissions
│   ├── [id]/page.tsx              - Edit permission details
│   └── assign/page.tsx            - Assign permissions to users/roles
└── roles/
    ├── page.tsx                   - List all roles
    ├── [id]/page.tsx              - Edit role and its permissions
    └── create/page.tsx            - Create new role
```

#### Features to Implement

- **Permission Browser**: View all 106 permissions grouped by category
- **User Permission Assignment**: Assign permissions to specific users
- **Role Permission Management**: Assign permissions to roles
- **Bulk Operations**: Assign multiple permissions at once
- **Permission Search**: Filter permissions by name/category
- **Audit Trail**: Log all permission changes

### 5. Test RLS Policies (Priority: CRITICAL)

**Estimated Time:** 2 days

#### Test Scenarios

**Multi-Tenant Isolation:**

```typescript
// Test: User A in Org 1 cannot see Org 2's enrollments
test('multi-tenant isolation - enrollments', async () => {
  // Login as user from Org 1
  await loginAs(userFromOrg1)

  const { data } = await supabase.from('enrollments').select('*')

  // Should only see Org 1 enrollments
  expect(data?.every((e) => e.organization_id === org1Id)).toBe(true)
})
```

**Permission Checks:**

```typescript
// Test: User with courses.view can read courses
test('permission check - courses.view', async () => {
  // Grant permission
  await grantPermission(userId, orgId, 'courses.view')
  await loginAs(userWithPermission)

  const { data, error } = await supabase.from('courses').select('*')

  expect(error).toBeNull()
  expect(data).toBeDefined()
})

// Test: User without permission cannot read
test('permission check - no permission', async () => {
  await loginAs(userWithoutPermission)

  const { data } = await supabase.from('courses').select('*')

  // Should only see published courses (public policy)
  expect(data?.every((c) => c.status === 'published')).toBe(true)
})
```

**Instructor Ownership:**

```typescript
// Test: Instructor can update own course
test('ownership - instructor can update own course', async () => {
  await loginAs(instructor)

  const { error } = await supabase
    .from('courses')
    .update({ title: 'Updated Title' })
    .eq('id', instructorCourseId)

  expect(error).toBeNull()
})

// Test: Instructor cannot update other instructor's course
test('ownership - instructor cannot update others course', async () => {
  await loginAs(instructor)

  const { error } = await supabase
    .from('courses')
    .update({ title: 'Hacked Title' })
    .eq('id', otherInstructorCourseId)

  expect(error).toBeDefined()
  expect(error.code).toBe('42501') // insufficient_privilege
})
```

#### Test Files to Create

```
tests/integration/
├── permissions/
│   ├── courses.test.ts
│   ├── enrollments.test.ts
│   ├── quizzes.test.ts
│   ├── achievements.test.ts
│   └── multi-tenant.test.ts
└── rls/
    ├── critical-tables.test.ts
    └── feature-tables.test.ts
```

---

## Medium Term Tasks (1-2 Weeks)

### 6. Create Permission Documentation (Priority: MEDIUM)

**Estimated Time:** 1 day

#### Documentation to Create

```markdown
docs/security/
├── PERMISSION_MATRIX.md - What each permission allows
├── PERMISSION_HIERARCHY.md - Permission inheritance (if any)
├── ROLE_PERMISSIONS.md - Default permissions per role
└── PERMISSION_BEST_PRACTICES.md - Guidelines for assigning permissions
```

#### Permission Matrix Example

```markdown
## Courses Permissions

| Permission        | Description              | Allows                           |
| ----------------- | ------------------------ | -------------------------------- |
| courses.view      | View unpublished courses | View drafts, review courses      |
| courses.create    | Create new courses       | Create course, add modules       |
| courses.update    | Update courses           | Edit title, description, content |
| courses.delete    | Delete courses           | Archive or delete courses        |
| courses.manage    | Full course management   | All course operations            |
| courses.publish   | Publish courses          | Change status to published       |
| courses.review    | Review courses           | Approve/reject courses           |
| instructor.access | Instructor tools         | Create and manage own courses    |
```

### 7. Performance Optimization (Priority: MEDIUM)

**Estimated Time:** 1 day

#### Database Indexes to Add

```sql
-- User permission lookups (most frequent)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_composite
  ON user_permissions(user_id, organization_id, permission_id);

-- Permission name lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permissions_name
  ON permissions(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permissions_category
  ON permissions(category);

-- Organization context
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_org_id
  ON profiles(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_org_id
  ON enrollments(organization_id);

-- Ownership checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_instructor
  ON courses(instructor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_groups_creator
  ON course_study_groups(created_by);
```

#### Query Optimization

- Profile permission check queries with EXPLAIN ANALYZE
- Add query result caching where appropriate
- Implement permission check batching for UI rendering

### 8. Monitoring & Observability (Priority: LOW)

**Estimated Time:** 1 day

#### Metrics to Track

- Permission check latency
- Failed permission checks (security events)
- Permission grant/revoke operations
- RLS policy execution time

#### Logging to Add

```typescript
// Log all permission denials
await auditLog({
  action: 'permission_denied',
  user_id: userId,
  permission: 'courses.delete',
  resource_type: 'course',
  resource_id: courseId,
  organization_id: orgId,
})

// Log all permission grants
await auditLog({
  action: 'permission_granted',
  user_id: targetUserId,
  permission: 'courses.manage',
  granted_by: adminUserId,
  organization_id: orgId,
})
```

---

## Long Term Enhancements (Future Phases)

### 9. Advanced Permission Features

- **Permission Groups**: Bundle related permissions (e.g., "Course Manager" = all courses.\* permissions)
- **Resource-Level Permissions**: Per-course or per-case permissions
- **Time-Based Permissions**: Temporary access grants with expiration
- **Permission Inheritance**: Parent → child permission relationships
- **Permission Delegation**: Allow users to grant subset of their permissions

### 10. Migration to Phase 11

Once Phase 3 implementation is complete, proceed with Phase 11 tasks:

**Phase 11 Focus: Production Polish & Quality Assurance**

1. ✅ Fix 1,369 accessibility warnings
2. ✅ Achieve Lighthouse score ≥ 90
3. ✅ Reach 80% code coverage
4. ✅ Complete API documentation
5. ✅ Create deployment runbooks

---

## Success Checklist

### Phase 3 Implementation Complete When

- [ ] All backend actions use permission checks
- [ ] All UI components respect user permissions
- [ ] Permission management UI operational
- [ ] All RLS policies tested and validated
- [ ] Multi-tenant isolation verified
- [ ] Permission documentation complete
- [ ] Performance benchmarks met (<100ms permission checks)
- [ ] Monitoring and logging in place

### Ready for Phase 11 When

- [ ] All Phase 3 implementation checklist items ✅
- [ ] Zero permission-related bugs in staging
- [ ] Load testing confirms system handles permission checks at scale
- [ ] Security audit of RLS policies complete

---

## Rollback Plan

If critical issues discovered:

1. **Disable Specific Policies:**

```sql
-- Disable problematic policy on specific table
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
```

2. **Revert to Role-Based (Emergency Only):**

```sql
-- Drop all permission-based policies
-- Re-enable old role-based policies
-- See PHASE_3_COMPLETE.md for rollback details
```

3. **Gradual Rollout:**

- Test each table's policies independently
- Roll out to subset of users first
- Monitor for issues before full deployment

---

## Resources

- **Migration Files**: `supabase/migrations/020-023_*.sql`
- **Completion Doc**: `PHASE_3_COMPLETE.md`
- **Helper Functions**: Migration 021
- **Permission List**: Migration 020 (106 permissions)
- **Phase 11 Plan**: `docs/planning/PHASE_11_PLAN.md`

---

## Team Communication

### Updates to Share

1. Phase 3 database migrations complete ✅
2. Permission system operational
3. Implementation work starting
4. Estimated 1-2 weeks for full implementation

### Questions for Product/Stakeholders

1. Priority order for permission-protected features?
2. Should we implement permission groups immediately?
3. Do we need resource-level permissions in Phase 3?
4. Timeline expectations for Phase 3 implementation vs Phase 11?

---

**Status**: Ready to begin Phase 3 Implementation  
**Recommended Start**: Backend API updates (highest priority)  
**Estimated Completion**: 1-2 weeks for full implementation
