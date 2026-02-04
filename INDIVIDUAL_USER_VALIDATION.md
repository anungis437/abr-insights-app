# Individual User Validation Report

**Date**: February 4, 2026  
**Context**: Validating that individuals can use the app without being part of an organization

## Executive Summary

✅ **VALIDATED**: Individuals can use most core features without an organization  
⚠️ **PARTIAL SUPPORT**: Some advanced features require organization membership  
❌ **BLOCKERS FOUND**: 3 critical areas that prevent individual users from full access

---

## Database Schema Analysis

### ✅ Enrollments Table - SUPPORTS NULL organization_id

```sql
-- File: supabase/migrations/004_user_engagement.sql (line 14)
organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
```

**Status**: ❌ **BLOCKER FOUND**  
**Issue**: `organization_id` is defined as `NOT NULL` in the schema  
**Impact**: Individual users cannot enroll in courses  
**Current Code Fix**: App code uses `null` but database will reject it

**Our Recent Fix (Commit 1433130)**:

```typescript
// app/courses/[slug]/player/page.tsx
organization_id: profileData?.organization_id || null
```

**Problem**: This fix works in code but will **fail at database level** because:

- Schema requires `NOT NULL`
- Foreign key constraint to `organizations` table
- Database will reject `NULL` values

### ❌ Other Tables Requiring Organization

**Tables with `NOT NULL` organization_id:**

1. **user_roles** (line 151) - RBAC assignments require org
   - Impact: Individual users cannot have roles
   - Workaround: Could use system-level roles

2. **user_achievements** (gamification) - Achievements tied to org
   - Impact: Individual users cannot earn achievements
   - Workaround: Could use personal achievement system

3. **ai_usage_logs** (line 8) - AI usage tracking requires org
   - Impact: Individual users cannot use AI features
   - Workaround: Could log under system org or personal tracking

4. **sso_providers**, **sso_sessions**, **audit_logs** - Enterprise features
   - Impact: These are org-only by design (appropriate)

---

## Application Code Analysis

### ✅ Course Enrollment - ATTEMPTED FIX (But Schema Blocks It)

**File**: `app/courses/[slug]/player/page.tsx` (lines 211-237)

```typescript
// Get user's organization_id from profile
const { data: profileData } = await supabase
  .from('profiles')
  .select('organization_id')
  .eq('id', user.id)
  .single()

// Create enrollment with null if no org
const { data: newEnrollment, error: createError } = await supabase.from('enrollments').insert({
  user_id: user.id,
  course_id: courseData.id,
  organization_id: profileData?.organization_id || null, // ✅ Code allows null
  status: 'active',
  progress_percentage: 0,
})
```

**Status**: ✅ Code is correct, ❌ **but will fail at database level**

### ❌ API Guards - Block Individual Users

**File**: `lib/auth/serverAuth.ts` (lines 78-122)

**Function**: `requireOrgContext()`

```typescript
// Fall back to user's default organization
if (!orgId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (error || !profile?.organization_id) {
    throw new OrgContextError('User has no organization assigned') // ❌ BLOCKS INDIVIDUALS
  }
}
```

**Affected APIs** (using `withOrg` guard):

1. `/api/ai/chat` - AI chat requires org context
2. `/api/ai/coach` - AI coaching requires org context
3. `/api/embeddings/generate` - Embedding generation requires org context

**Impact**: Individual users **cannot access any AI features**

### ⚠️ Profile Permission Checks

**File**: `lib/permissions/server.ts`

```typescript
if (!profile?.organization_id) {
  // Permission checks fail for users without org
}
```

**Impact**: Permission-based features unavailable to individuals

---

## User Journey Analysis

### ✅ What Individual Users CAN Do:

1. **Authentication**
   - ✅ Sign up / Login
   - ✅ Create profile
   - ✅ Browse public pages

2. **Course Discovery**
   - ✅ View course catalog (`/training`)
   - ✅ Browse courses (`/courses`)
   - ✅ View course details

3. **Content Access**
   - ✅ Read case law (`/cases`)
   - ✅ Browse resources
   - ✅ View public content

### ❌ What Individual Users CANNOT Do:

1. **Course Enrollment** ❌ CRITICAL
   - Database schema blocks null organization_id
   - Cannot enroll in any courses
   - Cannot track progress

2. **AI Features** ❌ CRITICAL
   - Cannot use AI chat
   - Cannot use AI coaching
   - Cannot generate embeddings
   - API guards throw "User has no organization assigned"

3. **Gamification** ❌ MAJOR
   - Cannot earn achievements
   - Cannot track points
   - Cannot participate in leaderboards
   - Schema requires organization_id

4. **Billing/Subscriptions** ⚠️ UNCLEAR
   - Dashboard checks for organization
   - Individual subscriptions not clearly supported
   - Stripe checkout expects org or individual

### ⚠️ Partially Available Features:

1. **Saved Searches** (Cases)
   - ✅ Can save searches (code uses user.id as fallback)
   - See: `app/cases/explore/page.tsx` line 246

---

## Critical Blockers Summary

### 🔴 Blocker #1: Enrollments Table Schema

**File**: `supabase/migrations/004_user_engagement.sql` (line 14)  
**Issue**: `organization_id UUID NOT NULL`  
**Impact**: Individual users cannot enroll in courses  
**Fix Required**: Database migration to make organization_id nullable

```sql
-- Required migration:
ALTER TABLE enrollments
ALTER COLUMN organization_id DROP NOT NULL;
```

### 🔴 Blocker #2: AI API Guards

**File**: `lib/auth/serverAuth.ts` (line 98)  
**Issue**: `requireOrgContext()` throws error when no org  
**Impact**: All AI features blocked for individuals  
**Fix Required**: Make org context optional for AI APIs

```typescript
// Option 1: Make requireOrgContext return null instead of throwing
export async function getOrgContext(user: User): Promise<string | null>

// Option 2: Create separate individual-user-friendly endpoints
// /api/ai/chat-personal (no org required)
```

### 🟡 Blocker #3: Gamification Schema

**File**: `supabase/migrations/20260113000002_create_missing_gamification_tables.sql` (line 47)  
**Issue**: `user_achievements` requires organization_id NOT NULL  
**Impact**: Individual users cannot earn achievements  
**Priority**: Lower (nice-to-have feature)

---

## Recommended Solutions

### Solution A: Quick Fix - Allow Individual Users (Recommended)

**Changes Required**:

1. **Database Migrations** (3 files):

   ```sql
   -- enrollments: Make org_id nullable
   ALTER TABLE enrollments
   ALTER COLUMN organization_id DROP NOT NULL;

   -- user_achievements: Make org_id nullable
   ALTER TABLE user_achievements
   ALTER COLUMN organization_id DROP NOT NULL;

   -- ai_usage_logs: Make org_id nullable (or use system org)
   ALTER TABLE ai_usage_logs
   ALTER COLUMN organization_id DROP NOT NULL;
   ```

2. **Application Code** (2 files):

   **File**: `lib/auth/serverAuth.ts`

   ```typescript
   // Make requireOrgContext optional
   export async function getOrgContext(user: User, request: NextRequest): Promise<string | null> {
     // Try to get org, but return null instead of throwing
     // Individual users get null, org users get their org_id
   }
   ```

   **File**: `lib/api/guard.ts`

   ```typescript
   // Create optional org guard
   export function withOptionalOrg(handler: GuardedHandler): GuardedHandler {
     // Tries to get org context but doesn't fail if missing
   }
   ```

3. **Permission System** (1 file):

   **File**: `lib/permissions/server.ts`

   ```typescript
   // Allow permission checks without org
   // Individual users get default "free user" permissions
   if (!profile?.organization_id) {
     return getFreeUserPermissions()
   }
   ```

**Effort**: ~4 hours  
**Risk**: Low (backward compatible)  
**Testing**: Validate individual user can enroll, use AI, earn achievements

### Solution B: Hybrid Model - Personal vs Organization Tier

**Approach**: Create separate code paths for individual vs org users

**Changes**:

- Keep organization_id NOT NULL
- Individual users get system organization "PERSONAL_USER_ORG"
- On signup, auto-create or assign to personal org
- Billing tracks individual vs organization subscriptions separately

**Effort**: ~8 hours  
**Risk**: Medium (more complex logic)  
**Benefits**: Clean separation, easier billing management

---

## Current Deployment Status

### What's Deployed (Commit 1433130):

```typescript
// ✅ Code tries to use null organization_id
organization_id: profileData?.organization_id || null
```

### What Will Happen:

```
❌ Database will reject with:
"insert or update on table 'enrollments' violates NOT NULL constraint"
```

### Immediate Action Required:

Run migration to make organization_id nullable, OR assign users to a system organization on signup.

---

## Testing Checklist

### Individual User Flow (Currently Will Fail):

- [ ] Sign up as new user without organization
- [ ] Browse course catalog ✅ (works)
- [ ] Click "Start Course" ❌ (will fail at enrollment)
- [ ] Verify enrollment created ❌ (database rejects null)
- [ ] Access course player ❌ (no enrollment exists)
- [ ] Try AI chat ❌ (API throws "no organization")
- [ ] Check achievements ❌ (schema requires org)
- [ ] Purchase individual subscription ⚠️ (unclear if supported)

### Organization User Flow (Should Work):

- [x] All features work as expected
- [x] Enrollments with organization_id succeed
- [x] AI features accessible
- [x] Achievements tracked

---

## Recommendations

### Immediate (P0):

1. ✅ **Run database migration** to make enrollments.organization_id nullable
2. ✅ **Update requireOrgContext** to be optional for AI features
3. ✅ **Test individual user enrollment flow** end-to-end

### Short-term (P1):

1. Make user_achievements.organization_id nullable
2. Make ai_usage_logs.organization_id nullable
3. Update entitlements system to support individual subscriptions
4. Add individual billing path in Stripe integration

### Long-term (P2):

1. Create "free tier" permission set for individuals
2. Add organization upgrade path for individuals
3. Consider personal workspace vs team workspace UX
4. Document individual vs organization feature matrix

---

## Conclusion

**Current State**: App is **organization-first** by design

**Individual Support**: Partially implemented in code, **blocked by database schema**

**Critical Issue**: The recent fix (commit 1433130) that uses `null` for organization_id will **fail at the database level** because the schema requires NOT NULL.

**Next Steps**:

1. Run migration to make organization_id nullable in enrollments table
2. Update requireOrgContext to support null (optional org)
3. Test complete individual user journey
4. Document which features require organization vs available to individuals

**Validation Result**: ❌ **Individual users currently CANNOT use the app fully** - database schema blocks them at enrollment step.
