# Production Readiness Baseline Findings

**Date:** January 13, 2026  
**Scope:** Security, RBAC, Multi-tenancy, AI Governance  
**Status:** 🔴 Critical Issues Identified

---

## Executive Summary

This baseline assessment identifies critical security, authorization, and architectural issues that must be addressed before production deployment. The application currently has **27 API route handlers**, multiple authentication patterns, and inconsistent RBAC enforcement.

**Risk Level:** HIGH - Multiple attack vectors and data isolation concerns exist.

---

## 1. Sensitive API Routes & Protection Status

### 1.1 Unprotected/Weak Routes ❌

| Route                            | Auth Status | Org Context | Permission Check | Rate Limited | Risk Level  |
| -------------------------------- | ----------- | ----------- | ---------------- | ------------ | ----------- |
| `/api/ai/chat`                   | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 CRITICAL |
| `/api/ai/coach`                  | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 CRITICAL |
| `/api/ai/feedback`               | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 HIGH     |
| `/api/ai/automation`             | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 CRITICAL |
| `/api/ai/training-jobs`          | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 CRITICAL |
| `/api/embeddings/generate`       | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🔴 CRITICAL |
| `/api/embeddings/search-cases`   | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🟡 MEDIUM   |
| `/api/embeddings/search-courses` | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🟡 MEDIUM   |
| `/api/newsletter`                | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🟡 MEDIUM   |
| `/api/contact`                   | ❌ None     | ❌ No       | ❌ No            | ❌ No        | 🟡 MEDIUM   |
| `/api/codespring`                | ⚠️ Partial  | ❌ No       | ❌ No            | ❌ No        | 🟡 MEDIUM   |

### 1.2 Protected Routes ✅

| Route                  | Auth Status  | Org Context | Permission Check | Rate Limited |
| ---------------------- | ------------ | ----------- | ---------------- | ------------ |
| `/api/stripe/checkout` | ✅ Session   | ⚠️ Partial  | ❌ No            | ❌ No        |
| `/api/stripe/portal`   | ✅ Session   | ⚠️ Partial  | ❌ No            | ❌ No        |
| `/api/webhooks/stripe` | ✅ Signature | ❌ N/A      | ❌ N/A           | ⚠️ Partial   |

### 1.3 Auth Routes (Framework Handled)

- `/api/auth/azure/*` - Microsoft SSO (handled by framework)
- `/api/auth/saml/*` - SAML SSO (handled by framework)

---

## 2. RBAC Mechanisms Detected

### 2.1 Split-Brain Problem ⚠️

**Three Different RBAC Systems Found:**

#### A) `profiles.role` Column (Legacy Pattern)

```sql
-- Found in: supabase/migrations/014_add_role_to_profiles.sql
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'learner';
-- Values: super_admin, org_admin, instructor, learner, guest
```

**Used in:**

- `supabase/migrations/015_ai_training_system.sql` (10+ RLS policies)
- Direct checks: `profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')`

#### B) RBAC Tables (Correct Pattern)

```sql
-- Found in: supabase/migrations/001_initial_schema.sql
- roles (id, name, slug, description)
- permissions (id, name, slug, description)
- role_permissions (role_id, permission_id)
- user_roles (user_id, role_id, organization_id)
```

**RLS Policies:**

- `supabase/migrations/002_rls_policies.sql` has policies for `user_roles`
- Function: `user_organization_id()` to get user's org

#### C) No Unified Permission Check Function ❌

- **MISSING:** `check_user_permission(user_id, org_id, permission_slug)` RPC
- No server-side permission resolution layer
- Each route must implement authorization from scratch

### 2.2 Current RBAC Usage Patterns

**In RLS Policies:**

```sql
-- Pattern 1: Direct role check (profiles.role)
AND profiles.role IN ('super_admin', 'org_admin')

-- Pattern 2: Org membership check
WHERE organization_id = public.user_organization_id()

-- Pattern 3: Admin check
AND public.is_org_admin()  -- Function exists ✅
```

**In Application Code:**

```typescript
// ❌ PROBLEMATIC: No consistent pattern found
// Most routes have NO authorization checks at all
```

---

## 3. Service Role Key Usage

### 3.1 Server-Side Usage (Appropriate) ✅

**Build-time/Script Context:**

- `scripts/*.ts` - Migration and setup scripts (22 files)
- These are appropriate uses (server-side only, not bundled)

### 3.2 Critical Issue: Server Component Usage ⚠️

**File:** `app/cases/[id]/page.tsx`

```typescript
// Lines 30, 60: Service role key in Server Component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ RISKY but acceptable in Server Component
)
```

**Assessment:** This is acceptable IF it's truly a Server Component that never hydrates client-side, but should use dedicated server client pattern instead.

### 3.3 Service Usage in Libraries ⚠️

**File:** `lib/services/embedding-service.ts`

```typescript
// Line 40: Service role key in service layer
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Assessment:** Acceptable IF only called from server-side contexts (API routes, Server Components). Requires audit trail.

### 3.4 Client Exposure Risk: LOW ✅

**No evidence found of:**

- Service role key in client components
- Service role key in browser bundle
- Client-accessible config files with service key

**Recommendation:** Formalize server-only clients with type safety.

---

## 4. Multi-Tenant Isolation Status

### 4.1 Organization-Scoped Tables ✅

**Core tables WITH `organization_id`:**

```sql
- enrollments
- user_achievements
- user_points
- user_roles
- organizations
```

**RLS Policies Verified:**

- ✅ Most tables have `organization_id = user_organization_id()` checks
- ✅ Helper function `user_organization_id()` exists
- ✅ Helper function `is_org_admin()` exists

### 4.2 Potential Isolation Gaps ⚠️

**Tables Without Clear Org Scoping:**

- `profiles` - Has `organization_id` ✅
- `courses` - **MISSING** `organization_id` ❌
- `lessons` - **MISSING** `organization_id` ❌
- `cases` - **MISSING** `organization_id` ❌ (likely intentional - shared resource)
- `course_categories` - **MISSING** `organization_id` ❌

**Risk:**

- Courses/lessons may be shared OR need org isolation
- Need business requirement clarification
- If org-isolated, missing RLS policies

### 4.3 Tenant Boundary Tests

**Status:** ❌ **NOT FOUND**

- No Playwright/Vitest tests for cross-tenant access
- No automated verification of RLS enforcement
- No test suite for authorization boundaries

---

## 5. AI Endpoint Concerns

### 5.1 Cost Control ❌

**Azure OpenAI Usage:**

- **No rate limiting** on any AI route
- **No cost tracking** per user/org
- **No usage quotas** enforced
- **No request size limits** on input

**Estimated Risk:**

- Malicious user could drain OpenAI credits
- No alerting on unusual usage patterns
- No budget thresholds

### 5.2 Governance & Audit ❌

**Missing:**

- AI request logging (who, what, when, cost)
- Citation tracking for AI responses
- Hallucination detection/flagging
- User feedback loop on AI quality
- Compliance audit trail

### 5.3 AI Endpoint Details

**File:** `app/api/ai/chat/route.ts`

```typescript
// ❌ No authentication
// ❌ No rate limiting
// ❌ No cost tracking
// ⚠️ Direct Azure OpenAI API calls (no abstraction layer)
```

**File:** `app/api/ai/coach/route.ts`

```typescript
// ❌ Same issues as chat route
// ⚠️ Reads context from request (no validation)
```

**File:** `app/api/embeddings/generate/route.ts`

```typescript
// ❌ No authentication
// ⚠️ Can trigger expensive batch operations
// maxDuration: 300 seconds (!)
```

---

## 6. Pricing & Stripe Configuration

### 6.1 Stripe Products

**Environment Variables:**

```bash
STRIPE_PRICE_ID_PROFESSIONAL=price_1Sp59T3z6DvwO4gqzNWixvRf
STRIPE_PRICE_ID_ENTERPRISE=price_1Sp59U3z6DvwO4gq6DSElFdw
```

**Products:**

- Professional: $29.99/month
- Enterprise: $99.99/month

### 6.2 Pricing Page Status

**File Search Result:** No `pricing` page found in `app/` directory.

**Issues:**

- ⚠️ No public pricing page in Next.js app
- ⚠️ No documentation of plan features/limits
- ⚠️ Stripe products exist but no UI to purchase
- ❌ No mapping of plan → features → permissions

### 6.3 Subscription → Permission Mapping

**Status:** ❌ **NOT IMPLEMENTED**

**Missing:**

- No `subscriptions` table linking user → plan
- No enforcement of plan-based limits (API calls, users, etc.)
- Stripe webhook exists but only updates `profiles` table
- No RBAC integration with subscription tiers

---

## 7. Internationalization (i18n)

### 7.1 Current Status

**Search Result:** No `LanguageContext` or translation files found in codebase.

**Assessment:**

- ❌ No i18n implementation detected
- ❌ No English/French bilingual support (despite Canadian market)
- ❌ Hardcoded English strings throughout

**Risk:** Regulatory compliance issue for Canadian government/public sector customers.

---

## 8. Priority Remediation Matrix

| Issue                 | Severity    | Impact               | Effort | Priority |
| --------------------- | ----------- | -------------------- | ------ | -------- |
| Unprotected AI routes | 🔴 Critical | Revenue loss, abuse  | Medium | **P0**   |
| No rate limiting      | 🔴 Critical | Cost blowup          | Low    | **P0**   |
| Split-brain RBAC      | 🔴 High     | Authorization bypass | High   | **P0**   |
| Missing tenant tests  | 🔴 High     | Data leakage         | Medium | **P1**   |
| No AI audit logging   | 🟡 Medium   | Compliance           | Medium | **P1**   |
| No pricing page       | 🟡 Medium   | Revenue blocking     | Low    | **P1**   |
| Subscription mapping  | 🟡 Medium   | Feature enforcement  | High   | **P2**   |
| No i18n support       | 🟡 Medium   | Market limitation    | High   | **P2**   |

---

## 9. Recommended Action Plan

### Phase 1: Immediate Security Fixes (P0)

1. **Create server auth utilities** (`lib/auth/serverAuth.ts`)
2. **Implement route guards** (`lib/api/guard.ts`)
3. **Apply guards to all sensitive routes** (27 routes)
4. **Add rate limiting middleware** (AI first, then public forms)
5. **Create API protection matrix** (documentation)

### Phase 2: RBAC Unification (P0)

1. **Implement `check_user_permission()` RPC** in Supabase
2. **Migrate all `profiles.role` checks** to permission-based
3. **Create effective permissions cache** (60s TTL)
4. **Add `useCapabilities()` hook** for client-side gating

### Phase 3: Multi-Tenancy Validation (P1)

1. **Audit all tables for `organization_id`** requirements
2. **Add missing RLS policies** (additive migrations)
3. **Create tenant boundary tests** (Playwright)
4. **Add automated RLS verification** (CI/CD)

### Phase 4: AI Productionization (P1)

1. **Add AI request logging** table + middleware
2. **Implement cost tracking** per user/org
3. **Add citation extraction** from AI responses
4. **Create AI usage dashboard** (admin view)

### Phase 5: Pricing & Packaging (P1)

1. **Create `/app/pricing/page.tsx`** with plan comparison
2. **Map subscriptions → permissions** in RBAC system
3. **Enforce plan limits** in API middleware
4. **Add subscription upgrade flow**

### Phase 6: Production Gate Checklist (P2)

1. **Security audit** (all items in this doc resolved)
2. **Performance testing** (load, stress)
3. **Disaster recovery** (backup, restore procedures)
4. **Monitoring/alerting** (errors, costs, security events)

---

## 10. Metrics to Track

**Before Implementation:**

- ❌ 0% of API routes protected with authentication
- ❌ 0% of AI routes have rate limiting
- ❌ 0% tenant isolation test coverage
- ❌ 0% AI audit trail coverage

**Success Criteria:**

- ✅ 100% of sensitive routes protected
- ✅ 100% of AI/public routes rate-limited
- ✅ 100% tenant boundary test pass rate
- ✅ 100% AI requests logged with cost attribution

---

## 11. References

**Migration Files:**

- `supabase/migrations/001_initial_schema.sql` - RBAC tables
- `supabase/migrations/002_rls_policies.sql` - RLS policies + helper functions
- `supabase/migrations/014_add_role_to_profiles.sql` - Legacy role column
- `supabase/migrations/015_ai_training_system.sql` - AI system (uses legacy roles)

**Key Files:**

- `lib/supabase/server.ts` - Server Supabase client (anon key)
- `lib/supabase/client.ts` - Browser Supabase client (anon key)
- `lib/services/embedding-service.ts` - Service role usage
- `app/api/**/route.ts` - 27 API route handlers

---

**Next Steps:** Proceed to Phase 1 implementation.
