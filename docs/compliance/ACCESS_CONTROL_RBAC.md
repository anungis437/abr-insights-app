# Access Control & RBAC

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready

## Executive Summary

ABR Insights App implements Role-Based Access Control (RBAC) with multi-layered enforcement: database-level Row-Level Security (RLS), middleware route protection, and API authorization checks. This document details our access control architecture, role definitions, and permissions matrix for enterprise security audits.

**Security Layers**:
1. **Database RLS**: PostgreSQL row-level security (defense in depth)
2. **Middleware**: Route-based access control (Next.js middleware)
3. **API**: Function-level authorization checks
4. **UI**: Conditional rendering (defense in depth, not security boundary)

## Role Hierarchy

### Role Definitions

```
Super Admin (Platform-wide)
    ├── Organization Admin (Org-scoped)
    │   ├── Instructor (Org-scoped)
    │   └── Student (Org-scoped)
    └── [No Organization] (Platform access only)
```

#### 1. Super Admin

**Scope**: Platform-wide (all organizations)

**Capabilities**:
- ✅ View all organizations
- ✅ View all users across organizations
- ✅ Manage platform settings
- ✅ Access admin dashboard (`/admin`)
- ✅ View audit logs (all tenants)
- ✅ Manage AI quotas (global)
- ✅ Manage CanLII ingestion
- ✅ Create/delete organizations
- ✅ Override organization limits

**Assignment**:
- Manual database insert only (no UI)
- Requires email verification + 2FA
- Limited to core team members (CEO, CTO, Security)

**Audit**:
- All super admin actions logged
- Weekly review of super admin access logs
- Annual access recertification

**Database Policy**:
```sql
CREATE FUNCTION is_super_admin(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
      AND role @> '["super_admin"]'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Super admins see all"
ON organizations
FOR ALL
USING (is_super_admin(auth.uid()));
```

#### 2. Organization Admin

**Scope**: Single organization

**Capabilities**:
- ✅ Manage organization settings
- ✅ Invite/remove users
- ✅ Assign roles (instructor, student)
- ✅ Manage billing (upgrade, downgrade, cancel)
- ✅ View organization audit logs
- ✅ Manage organization courses
- ✅ Export organization data
- ✅ Offboard organization
- ❌ Access other organizations
- ❌ Access platform admin dashboard

**Assignment**:
- First user in organization = auto-assigned org admin
- Existing org admin can promote other users
- Requires email verification

**Database Policy**:
```sql
CREATE POLICY "Org admins see their org"
ON organizations
FOR ALL
USING (
  id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
      AND role @> '["org_admin"]'
  )
);
```

#### 3. Instructor

**Scope**: Single organization

**Capabilities**:
- ✅ Create courses
- ✅ Edit own courses
- ✅ Publish/unpublish courses
- ✅ View course enrollments
- ✅ Grade quiz submissions
- ✅ Issue certificates
- ✅ View student progress
- ❌ Manage organization settings
- ❌ Invite/remove users
- ❌ Manage billing

**Assignment**:
- Org admin promotes student to instructor
- Or invite user directly as instructor

**Database Policy**:
```sql
CREATE POLICY "Instructors manage their courses"
ON courses
FOR ALL
USING (
  instructor_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
      AND role @> '["org_admin"]'
  )
);
```

#### 4. Student

**Scope**: Single organization

**Capabilities**:
- ✅ Browse public courses
- ✅ Enroll in courses
- ✅ View enrolled courses
- ✅ Submit quizzes
- ✅ View own progress
- ✅ Download certificates
- ✅ Export own data
- ✅ Delete own account
- ❌ Access other students' data
- ❌ Create courses
- ❌ Manage organization

**Assignment**:
- Default role for new users
- Auto-assigned on signup

**Database Policy**:
```sql
CREATE POLICY "Students see their own data"
ON enrollments
FOR ALL
USING (
  student_id = auth.uid()
);
```

## Permissions Matrix

### Platform Administration

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| View all organizations | ✅ | ❌ | ❌ | ❌ |
| Create organization | ✅ | ❌ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |
| View platform metrics | ✅ | ❌ | ❌ | ❌ |
| Manage AI quotas (global) | ✅ | ❌ | ❌ | ❌ |
| View audit logs (all) | ✅ | ❌ | ❌ | ❌ |

### Organization Management

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| View org settings | ✅ | ✅ | ❌ | ❌ |
| Edit org settings | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ |
| Remove users | ✅ | ✅ | ❌ | ❌ |
| Assign roles | ✅ | ✅ | ❌ | ❌ |
| View billing | ✅ | ✅ | ❌ | ❌ |
| Manage subscription | ✅ | ✅ | ❌ | ❌ |
| Offboard organization | ✅ | ✅ | ❌ | ❌ |
| Export org data | ✅ | ✅ | ❌ | ❌ |
| View org audit logs | ✅ | ✅ | ❌ | ❌ |

### Course Management

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| Create course | ✅ | ✅ | ✅ | ❌ |
| Edit own course | ✅ | ✅ | ✅ | ❌ |
| Edit others' course | ✅ | ✅ | ❌ | ❌ |
| Delete course | ✅ | ✅ | ✅ (own) | ❌ |
| Publish course | ✅ | ✅ | ✅ (own) | ❌ |
| View enrollments | ✅ | ✅ | ✅ (own course) | ❌ |
| Grade submissions | ✅ | ✅ | ✅ (own course) | ❌ |
| Issue certificates | ✅ | ✅ | ✅ (own course) | ❌ |

### Student Features

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| Browse courses | ✅ | ✅ | ✅ | ✅ |
| Enroll in course | ✅ | ✅ | ✅ | ✅ |
| Submit quiz | ✅ | ✅ | ✅ | ✅ |
| View own progress | ✅ | ✅ | ✅ | ✅ |
| Download certificate | ✅ | ✅ | ✅ | ✅ |
| View others' progress | ✅ | ✅ | ✅ (students in own course) | ❌ |

### Data Management

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| Export own data | ✅ | ✅ | ✅ | ✅ |
| Export org data | ✅ | ✅ | ❌ | ❌ |
| Export all data | ✅ | ❌ | ❌ | ❌ |
| Delete own account | ✅ | ✅ | ✅ | ✅ |
| Delete other account | ✅ | ✅ (org users) | ❌ | ❌ |

### AI Features

| Permission | Super Admin | Org Admin | Instructor | Student |
|------------|-------------|-----------|------------|---------|
| Use AI assistant | ✅ | ✅ | ✅ | ✅ |
| Manage own AI quota | ✅ | ✅ | ✅ | ✅ |
| Manage org AI quota | ✅ | ✅ | ❌ | ❌ |
| Manage global AI quota | ✅ | ❌ | ❌ | ❌ |
| View AI usage stats | ✅ | ✅ (org) | ✅ (own) | ✅ (own) |

## Access Control Implementation

### 1. Database Row-Level Security (RLS)

**Purpose**: Defense in depth (application bugs cannot bypass)

**Implementation**: PostgreSQL RLS policies

**Examples**:

#### Organizations Table
```sql
-- Super admins see all
CREATE POLICY "super_admin_all" ON organizations
FOR ALL USING (is_super_admin(auth.uid()));

-- Org admins see their org
CREATE POLICY "org_admin_own" ON organizations
FOR ALL USING (
  id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role @> '["org_admin"]'
  )
);

-- Students see their org (read-only)
CREATE POLICY "user_own_org" ON organizations
FOR SELECT USING (
  id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
);
```

#### Courses Table
```sql
-- Instructors manage their courses
CREATE POLICY "instructor_own_courses" ON courses
FOR ALL USING (instructor_id = auth.uid());

-- Org admins manage org courses
CREATE POLICY "org_admin_org_courses" ON courses
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role @> '["org_admin"]'
  )
);

-- Students view published courses
CREATE POLICY "students_view_published" ON courses
FOR SELECT USING (status = 'published');
```

#### Enrollments Table
```sql
-- Students manage their enrollments
CREATE POLICY "student_own_enrollments" ON enrollments
FOR ALL USING (student_id = auth.uid());

-- Instructors view enrollments in their courses
CREATE POLICY "instructor_course_enrollments" ON enrollments
FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid())
);
```

#### Audit Logs Table
```sql
-- Super admins see all
CREATE POLICY "super_admin_all_logs" ON audit_log
FOR SELECT USING (is_super_admin(auth.uid()));

-- Org admins see org logs
CREATE POLICY "org_admin_org_logs" ON audit_log
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role @> '["org_admin"]'
  )
);

-- Users see their own logs
CREATE POLICY "user_own_logs" ON audit_log
FOR SELECT USING (user_id = auth.uid());
```

### 2. Middleware Route Protection

**Purpose**: Block unauthorized routes before API handlers execute

**Implementation**: `middleware.ts` (Next.js)

**Protected Routes**:
```typescript
const protectedRoutes = {
  '/admin': ['super_admin'],
  '/admin/*': ['super_admin'],
  
  '/org/settings': ['org_admin'],
  '/org/users': ['org_admin'],
  '/org/billing': ['org_admin'],
  '/org/offboard': ['org_admin'],
  
  '/instructor/courses': ['instructor', 'org_admin'],
  '/instructor/students': ['instructor', 'org_admin'],
  
  '/profile': ['authenticated'], // Any authenticated user
  '/courses': ['authenticated'],
};
```

**Middleware Logic**:
```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user session
  const session = await getSession(request);
  if (!session) {
    return Response.redirect(new URL('/login', request.url));
  }
  
  // Check role for protected routes
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && !hasAnyRole(session.user, requiredRoles)) {
    logger.warn('Unauthorized route access', {
      userId: session.user.id,
      pathname,
      userRoles: session.user.role,
      requiredRoles,
    });
    return Response.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}
```

### 3. API Authorization Checks

**Purpose**: Function-level authorization (granular permissions)

**Implementation**: Authorization helpers in API routes

**Example**:
```typescript
// app/api/org/users/route.ts
export async function GET(request: Request) {
  const session = await getServerSession();
  
  // Check: Is user an org admin?
  if (!hasRole(session.user, 'org_admin')) {
    return Response.json(
      { error: 'Unauthorized: Org admin required' },
      { status: 403 }
    );
  }
  
  // Get user's organization
  const orgId = await getUserOrganization(session.user.id);
  
  // Fetch users (RLS automatically filters to this org)
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', orgId); // Explicit filter (defense in depth)
  
  return Response.json({ users });
}
```

**Authorization Helpers**:
```typescript
// lib/auth/rbac.ts

export function hasRole(user: User, role: Role): boolean {
  return user.role.includes(role);
}

export function hasAnyRole(user: User, roles: Role[]): boolean {
  return roles.some(role => user.role.includes(role));
}

export function isSuperAdmin(user: User): boolean {
  return user.role.includes('super_admin');
}

export function isOrgAdmin(user: User): boolean {
  return user.role.includes('org_admin') || isSuperAdmin(user);
}

export function canManageCourse(user: User, course: Course): boolean {
  // Super admin can manage all
  if (isSuperAdmin(user)) return true;
  
  // Org admin can manage org courses
  if (isOrgAdmin(user) && course.organization_id === user.organization_id) {
    return true;
  }
  
  // Instructor can manage own courses
  if (course.instructor_id === user.id) return true;
  
  return false;
}
```

### 4. UI Conditional Rendering

**Purpose**: User experience (hide unavailable features)

**Not a Security Boundary**: Always enforce server-side

**Example**:
```typescript
// components/CourseCard.tsx
export function CourseCard({ course }: { course: Course }) {
  const { user } = useAuth();
  
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      
      {/* Show edit button only to authorized users */}
      {canManageCourse(user, course) && (
        <Button href={`/instructor/courses/${course.id}/edit`}>
          Edit Course
        </Button>
      )}
      
      {/* Show enroll button to students */}
      {!isInstructor(user) && (
        <Button onClick={() => enrollInCourse(course.id)}>
          Enroll
        </Button>
      )}
    </div>
  );
}
```

## Role Assignment Procedures

### Super Admin Assignment

**Process** (Manual, CEO approval required):
1. **Request**: Email CEO with justification
2. **Approval**: CEO approves via email
3. **Assignment**: Database insert (SQL script):
   ```sql
   UPDATE profiles 
   SET role = role || '["super_admin"]'::jsonb
   WHERE id = '{user_id}';
   ```
4. **Notification**: User notified via email
5. **Audit**: Logged in `role_assignments` table
6. **2FA**: User must enable 2FA within 24 hours

**Revocation**:
- Annual recertification (remove if no longer needed)
- Immediate revocation on employee offboarding
- Audit log review (remove if inactive for 90 days)

### Organization Admin Assignment

**Process** (Self-service):
1. **First User**: Auto-assigned on org creation
2. **Additional Admins**: Existing org admin promotes via `/org/users`
3. **Promotion**:
   ```typescript
   // app/api/org/users/[id]/promote/route.ts
   export async function POST(request: Request, { params }) {
     const session = await getServerSession();
     
     // Check: Is requester an org admin?
     if (!isOrgAdmin(session.user)) {
       return Response.json({ error: 'Unauthorized' }, { status: 403 });
     }
     
     // Promote user
     await supabase
       .from('profiles')
       .update({ role: ['org_admin'] })
       .eq('id', params.id)
       .eq('organization_id', session.user.organization_id); // Prevent cross-org
     
     // Audit log
     await logRoleAssignment({
       userId: params.id,
       role: 'org_admin',
       assignedBy: session.user.id,
       organizationId: session.user.organization_id,
     });
     
     return Response.json({ success: true });
   }
   ```

### Instructor Assignment

**Process** (Org admin):
1. Org admin navigates to `/org/users`
2. Select user, click "Promote to Instructor"
3. User role updated: `['student', 'instructor']`
4. User notified via email
5. User gains access to `/instructor` routes

**Revocation**:
- Org admin clicks "Demote to Student"
- Role updated: `['student']`
- User courses remain (can be reassigned to another instructor)

### Student Assignment

**Process** (Automatic):
1. User signs up via `/signup`
2. Role auto-assigned: `['student']`
3. Organization assigned based on invite link or manual selection

## Access Control Testing

### Unit Tests

**Test Cases**:
1. Super admin can access all organizations
2. Org admin cannot access other organizations
3. Instructor can edit own courses, not others'
4. Student cannot access admin routes
5. Unauthenticated user redirected to login
6. RLS blocks cross-tenant queries

**Example**:
```typescript
// tests/rbac.test.ts
describe('RBAC Middleware', () => {
  it('blocks non-admin from /admin', async () => {
    const student = await createUser({ role: ['student'] });
    const response = await fetch('/admin', {
      headers: { Cookie: `session=${student.session}` },
    });
    expect(response.status).toBe(302); // Redirect to /unauthorized
  });
  
  it('allows org admin to access /org/settings', async () => {
    const orgAdmin = await createUser({ role: ['org_admin'] });
    const response = await fetch('/org/settings', {
      headers: { Cookie: `session=${orgAdmin.session}` },
    });
    expect(response.status).toBe(200);
  });
});
```

### Integration Tests

**Test Cases**:
1. End-to-end role assignment flow
2. Cross-tenant data isolation (try to access other org's data)
3. Privilege escalation attempt (student tries to promote self to admin)
4. Session hijacking (try to use another user's session token)

### Penetration Testing

**Attack Vectors**:
1. **Horizontal Privilege Escalation**: Student A tries to access Student B's data
2. **Vertical Privilege Escalation**: Student tries to access admin routes
3. **Session Fixation**: Attacker sets victim's session ID
4. **CSRF**: Attacker tricks admin into performing actions
5. **SQL Injection**: Bypass RLS via injection

**Testing Schedule**: Annually + after major RBAC changes

## Audit & Compliance

### Role Assignment Audit

**Logged Events**:
- `role.assigned`: User promoted to role
- `role.revoked`: User demoted from role
- `role.changed`: User role modified

**Audit Log Fields**:
```typescript
{
  event: 'role.assigned',
  timestamp: '2026-02-03T10:30:45Z',
  userId: 'user_xyz789',
  role: 'org_admin',
  assignedBy: 'user_abc123',
  organizationId: 'org_nzila',
  reason: 'Promotion to manage users',
}
```

### Access Attempt Audit

**Logged Events**:
- `access.granted`: User accessed protected route
- `access.denied`: User blocked from route
- `access.unauthorized`: Unauthenticated user redirected

**Audit Log Fields**:
```typescript
{
  event: 'access.denied',
  timestamp: '2026-02-03T10:35:12Z',
  userId: 'user_xyz789',
  pathname: '/admin/users',
  userRole: ['student'],
  requiredRole: ['super_admin'],
  reason: 'Insufficient permissions',
}
```

### Compliance Verification

**SOC 2 Requirements**:
- ✅ Documented role definitions
- ✅ Principle of least privilege
- ✅ Role assignment procedures
- ✅ Audit logging (role changes, access attempts)
- ✅ Annual access reviews

**GDPR Requirements**:
- ✅ Data minimization (roles limit data access)
- ✅ Access control (prevent unauthorized access)
- ✅ Audit trail (who accessed what, when)

## Related Documents

- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Overall security architecture
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md): Unauthorized access procedures
- [DATA_RETENTION.md](./DATA_RETENTION.md): Data access and deletion policies

---

**Document History**:
- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
