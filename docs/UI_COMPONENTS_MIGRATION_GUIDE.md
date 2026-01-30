# UI Components Migration Guide - useEntitlements

## Overview

This guide shows how to migrate UI components from legacy `subscription_tier` checks to the new `useEntitlements()` hook for feature access and limit validation.

## ✅ Completed Migrations

### app/analytics/page.tsx

**Before:**

```typescript
const { profile } = useAuth()
const userPlan: PlanTier = (profile?.subscription_tier as PlanTier) || 'free'
```

**After:**

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

const { profile } = useAuth()
const { entitlements, loading: entitlementsLoading } = useEntitlements()
const userPlan: PlanTier = (entitlements?.tier.toLowerCase() as PlanTier) || 'free'
const hasAdvancedAnalytics = entitlements?.features.advancedAnalytics || false
```

### app/team/page.tsx

**Before:**

```typescript
const hasPermission =
  profile?.role === 'admin' ||
  profile?.role === 'team_lead' ||
  profile?.subscription_tier === 'enterprise'
```

**After:**

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

const { entitlements, loading: entitlementsLoading } = useEntitlements()

// Check if user has team management features (available on higher tiers)
const hasPermission =
  profile?.role === 'admin' ||
  profile?.role === 'team_lead' ||
  (entitlements?.features.maxOrganizationMembers ?? 1) > 1
```

## 🔄 Pending Migrations

### Priority Components (Immediate)

#### 1. Course Authoring Pages

**Files:**

- `app/instructor/courses/create/page.tsx`
- `app/admin/courses/create/page.tsx`
- `app/instructor/dashboard/page.tsx`

**Add Limit Validation:**

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

function CreateCourseButton() {
  const { canPerformAction, entitlements } = useEntitlements()
  const [courseCount, setCourseCount] = useState(0) // Load from DB

  const handleCreateCourse = async () => {
    // Check if user can create more courses
    const result = await canPerformAction('create_course', courseCount)

    if (!result.allowed) {
      // Show upgrade modal
      showModal({
        title: 'Course Limit Reached',
        message: result.reason,
        upgradeUrl: result.upgradeUrl,
        currentTier: entitlements?.tier,
      })
      return
    }

    // Proceed with course creation
    router.push('/instructor/courses/create')
  }

  return (
    <button onClick={handleCreateCourse}>
      Create Course ({courseCount}/{entitlements?.features.maxCoursesAuthored ?? 0})
    </button>
  )
}
```

#### 2. AI Features Pages

**Files:**

- `app/ai-assistant/page.tsx`
- `app/ai-coach/page.tsx`

**Add Feature Gates:**

```typescript
import { useFeatureAccess } from '@/hooks/use-entitlements'

function AIAssistantPage() {
  const hasAI = useFeatureAccess('aiAssistantAccess')

  if (!hasAI) {
    return (
      <UpgradePrompt
        feature="AI Assistant"
        requiredTier="PROFESSIONAL"
        description="Unlock intelligent case law analysis and learning guidance"
      />
    )
  }

  // Show AI assistant UI
  return <AIAssistantInterface />
}
```

#### 3. Pricing Page

**Files:**

- `app/pricing/page.tsx`

**Show Current Tier:**

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

function PricingPage() {
  const { entitlements } = useEntitlements()
  const currentTier = entitlements?.tier || 'FREE'

  return (
    <div>
      {TIER_PLANS.map(plan => (
        <PricingCard
          key={plan.tier}
          plan={plan}
          isCurrentPlan={plan.tier === currentTier}
          canUpgrade={getTierIndex(currentTier) < getTierIndex(plan.tier)}
        />
      ))}
    </div>
  )
}
```

#### 4. Organization Dashboard

**Files:**

- `app/org/dashboard/page.tsx`

**Remove Legacy Subscription Field:**

```typescript
// BEFORE
interface Organization {
  subscription_tier: string // ❌ Legacy field
  seat_limit: number
}

// AFTER
import { useEntitlements } from '@/hooks/use-entitlements'

function OrgDashboard() {
  const { entitlements } = useEntitlements()

  // Use entitlements instead of organization.subscription_tier
  const seatLimit = entitlements?.seatCount ?? 1
  const seatsUsed = entitlements?.seatsUsed ?? 0
  const seatsAvailable = entitlements?.seatsAvailable ?? 0

  return (
    <div>
      <h2>{entitlements?.tier} Plan</h2>
      <p>Seats: {seatsUsed} / {seatLimit}</p>
      {seatsAvailable === 0 && <UpgradePrompt />}
    </div>
  )
}
```

### Secondary Components (This Week)

#### 5. Export Features

**Files:**

- Any component with PDF/CSV export buttons
- Look for `exportCapabilities` checks

**Add Feature Check:**

```typescript
import { useFeatureAccess } from '@/hooks/use-entitlements'

function ExportButton() {
  const hasExport = useFeatureAccess('exportCapabilities')

  if (!hasExport) {
    return (
      <button disabled title="Upgrade to Professional for exports">
        Export (Professional+)
      </button>
    )
  }

  return <button onClick={handleExport}>Export</button>
}
```

#### 6. SSO Configuration

**Files:**

- `app/admin/sso-config/page.tsx`

**Add Feature Gate:**

```typescript
import { useFeatureAccess } from '@/hooks/use-entitlements'

export default function SSOConfigPage() {
  const hasSSO = useFeatureAccess('ssoEnabled')

  if (!hasSSO) {
    return (
      <FeatureLockedView
        feature="Single Sign-On (SSO)"
        requiredTier="BUSINESS"
        benefits={[
          'Azure AD / Entra ID integration',
          'Automatic user provisioning',
          'Centralized access control',
        ]}
      />
    )
  }

  // Show SSO configuration UI
  return <SSOConfigForm />
}
```

#### 7. Student Enrollment

**Files:**

- Any component that adds students to courses
- `app/instructor/courses/[id]/students/page.tsx`

**Add Limit Validation:**

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

function AddStudentButton({ courseId }: { courseId: string }) {
  const { canPerformAction } = useEntitlements()
  const [studentCount, setStudentCount] = useState(0) // Load from DB

  const handleAddStudent = async () => {
    const result = await canPerformAction('add_student', studentCount)

    if (!result.allowed) {
      showModal({
        title: 'Student Limit Reached',
        message: result.reason,
        upgradeUrl: result.upgradeUrl,
      })
      return
    }

    // Show add student form
    openAddStudentModal()
  }

  return <button onClick={handleAddStudent}>Add Student</button>
}
```

## Migration Patterns

### Pattern 1: Simple Feature Check

**Use Case:** Boolean feature flags (AI, SSO, exports, analytics)

```typescript
import { useFeatureAccess } from '@/hooks/use-entitlements'

function MyComponent() {
  const hasFeature = useFeatureAccess('aiAssistantAccess')

  if (!hasFeature) return <UpgradePrompt />

  return <FeatureContent />
}
```

### Pattern 2: Usage Limit Validation

**Use Case:** Enforce limits (courses, students, members)

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

function MyComponent() {
  const { canPerformAction, entitlements } = useEntitlements()
  const [currentUsage, setCurrentUsage] = useState(0)

  const handleAction = async () => {
    const result = await canPerformAction('create_course', currentUsage)

    if (!result.allowed) {
      // Show upgrade prompt with specific reason
      showUpgradeModal({
        reason: result.reason,
        upgradeUrl: result.upgradeUrl,
        currentLimit: entitlements?.features.maxCoursesAuthored,
        currentUsage,
      })
      return
    }

    // Proceed with action
    await performAction()
  }

  return (
    <button onClick={handleAction}>
      Action ({currentUsage}/{entitlements?.features.maxCoursesAuthored ?? 0})
    </button>
  )
}
```

### Pattern 3: Tier Comparison

**Use Case:** Check if user is on specific tier or higher

```typescript
import { useTierCheck } from '@/hooks/use-entitlements'

function MyComponent() {
  const isProfessionalOrHigher = useTierCheck('PROFESSIONAL')

  if (!isProfessionalOrHigher) {
    return <UpgradePrompt requiredTier="PROFESSIONAL" />
  }

  return <PremiumContent />
}
```

### Pattern 4: Full Entitlements Access

**Use Case:** Complex logic needing multiple entitlement values

```typescript
import { useEntitlements } from '@/hooks/use-entitlements'

function MyComponent() {
  const { entitlements, loading, error, refresh } = useEntitlements()

  if (loading) return <Spinner />
  if (error) return <ErrorView error={error} />
  if (!entitlements) return <NoEntitlementsView />

  return (
    <div>
      <h2>Your Plan: {entitlements.tier}</h2>
      <p>Courses: {entitlements.features.maxCoursesAuthored}</p>
      <p>Students: {entitlements.features.maxStudentsPerCourse}</p>
      <p>Members: {entitlements.features.maxOrganizationMembers}</p>

      {entitlements.inGracePeriod && (
        <Alert>
          Grace period ends {entitlements.gracePeriodEndsAt}
        </Alert>
      )}

      {!entitlements.hasSeat && (
        <Alert>No seat allocated - contact admin</Alert>
      )}
    </div>
  )
}
```

## Server-Side Migration

For server components and API routes, use the service directly:

```typescript
import { getUserEntitlements, hasFeatureAccess } from '@/lib/services/entitlements'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check feature access
  const hasAI = await hasFeatureAccess(user.id, 'aiAssistantAccess', supabase)
  if (!hasAI) {
    return new Response('AI features not available on your plan', { status: 403 })
  }

  // Or get full entitlements
  const entitlements = await getUserEntitlements(user.id, supabase)

  return Response.json({ entitlements })
}
```

## Finding Components to Update

### 1. Search for Subscription Tier Checks

```bash
# Find subscription_tier usage
grep -r "subscription_tier" app/ --include="*.tsx" --include="*.ts"

# Find subscription?.tier patterns
grep -r "subscription\\.tier" app/ --include="*.tsx" --include="*.ts"

# Find tier equality checks
grep -r "=== 'professional'" app/ --include="*.tsx" --include="*.ts"
grep -r "=== 'enterprise'" app/ --include="*.tsx" --include="*.ts"
```

### 2. Search for Feature Keywords

```bash
# Find AI feature usage
grep -r "aiAssistant\|aiCoach\|AI Assistant\|AI Coach" app/ --include="*.tsx"

# Find SSO references
grep -r "sso\|SSO\|single sign-on" app/ --include="*.tsx"

# Find export features
grep -r "export.*pdf\|export.*csv\|exportCapabilities" app/ --include="*.tsx"

# Find analytics features
grep -r "analytics\|advanced.*analytics" app/ --include="*.tsx"
```

### 3. Search for Limit Checks

```bash
# Find course limits
grep -r "max.*course\|course.*limit\|too many courses" app/ --include="*.tsx"

# Find student limits
grep -r "max.*student\|student.*limit" app/ --include="*.tsx"

# Find member limits
grep -r "max.*member\|member.*limit\|seat.*limit" app/ --include="*.tsx"
```

## Testing Checklist

After migrating each component:

- [ ] **Type check passes:** `npm run type-check`
- [ ] **Lint passes:** `npm run lint`
- [ ] **Component loads:** No React errors in console
- [ ] **Loading state:** Shows spinner while fetching entitlements
- [ ] **Error handling:** Gracefully handles entitlements fetch errors
- [ ] **Feature gates work:** Locked features show upgrade prompts
- [ ] **Limit validation works:** Blocks over-limit actions
- [ ] **Upgrade prompts shown:** Correct tier and pricing displayed
- [ ] **Free tier:** Features properly restricted
- [ ] **Professional tier:** Middle-tier features accessible
- [ ] **Enterprise tier:** All features accessible

## Common Gotchas

### 1. Loading State

Always handle the loading state:

```typescript
const { entitlements, loading } = useEntitlements()

if (loading) {
  return <Spinner /> // Don't flash content while loading
}
```

### 2. Null Checks

Entitlements may be null if no subscription:

```typescript
const maxCourses = entitlements?.features.maxCoursesAuthored ?? 1
// Always provide fallback (FREE tier default)
```

### 3. Tier Comparison

Use helper for tier comparisons:

```typescript
// ❌ DON'T: String comparison can fail
if (entitlements?.tier > 'PROFESSIONAL') { ... }

// ✅ DO: Use helper
const isProfessionalOrHigher = useTierCheck('PROFESSIONAL')
```

### 4. Server vs Client

Use correct API for context:

```typescript
// Client-side (React components)
import { useEntitlements } from '@/hooks/use-entitlements'

// Server-side (API routes, server components)
import { getUserEntitlements } from '@/lib/services/entitlements'
```

## Upgrade Prompt Component

Create a reusable upgrade prompt:

```typescript
// components/shared/UpgradePrompt.tsx
import { useEntitlements } from '@/hooks/use-entitlements'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  requiredTier: 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
  description?: string
  benefits?: string[]
}

export function UpgradePrompt({ feature, requiredTier, description, benefits }: UpgradePromptProps) {
  const { entitlements } = useEntitlements()

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-8 text-center">
      <Sparkles className="mx-auto mb-4 h-16 w-16 text-amber-600" />
      <h2 className="mb-2 text-2xl font-bold text-gray-900">{feature}</h2>
      <p className="mb-2 text-lg text-gray-700">{requiredTier}+ Feature</p>
      {description && <p className="mb-6 text-gray-600">{description}</p>}

      {benefits && benefits.length > 0 && (
        <ul className="mb-6 space-y-2 text-left">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-amber-600">✓</span>
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/pricing?upgrade=${requiredTier.toLowerCase()}&from=${entitlements?.tier.toLowerCase()}`}
        className="btn-primary inline-flex items-center gap-2"
      >
        Upgrade to {requiredTier}
        <ArrowRight className="h-5 w-5" />
      </Link>

      <p className="mt-4 text-sm text-gray-500">
        Current plan: {entitlements?.tier || 'FREE'}
      </p>
    </div>
  )
}
```

## Progress Tracking

### Completed (2 components)

- ✅ app/analytics/page.tsx
- ✅ app/team/page.tsx

### High Priority (Next 5)

- ⏳ app/instructor/courses/create/page.tsx
- ⏳ app/instructor/dashboard/page.tsx
- ⏳ app/ai-assistant/page.tsx
- ⏳ app/ai-coach/page.tsx
- ⏳ app/pricing/page.tsx

### Medium Priority (Next 10)

- ⏳ app/org/dashboard/page.tsx
- ⏳ app/admin/courses/create/page.tsx
- ⏳ app/admin/sso-config/page.tsx
- ⏳ app/instructor/courses/[id]/students/page.tsx
- ⏳ All export button components
- ⏳ All analytics dashboard components
- ⏳ Organization settings components
- ⏳ Team management components
- ⏳ Advanced features components
- ⏳ Custom branding components

### Estimated Timeline

- High priority: 4-6 hours
- Medium priority: 1-2 days
- Testing: 4-6 hours
- Total: 2-3 days of focused work

---

**Next Steps:**

1. Start with high-priority components (course creation, AI features)
2. Test each migration thoroughly before moving to next component
3. Create reusable upgrade prompt component
4. Update all components systematically
5. Run full E2E test suite after all migrations complete

**Documentation:**

- [Entitlements Service](../../lib/services/entitlements.ts)
- [useEntitlements Hook](../../hooks/use-entitlements.ts)
- [Migration Guide](./MIGRATION_EXECUTION_GUIDE.md)
- [Implementation Progress](./ENTITLEMENTS_IMPLEMENTATION_PROGRESS.md)
