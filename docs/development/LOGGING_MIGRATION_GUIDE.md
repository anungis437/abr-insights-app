# Console Logging Migration Guide

## Problem Statement

The codebase contains **100+ console.log/console.error/console.warn** calls that pose production risks:

- ❌ **PII Leakage**: Unstructured logging may expose user data
- ❌ **Noisy Logs**: Excessive output makes debugging difficult
- ❌ **No Context**: Console logs lack structured metadata
- ❌ **No Filtering**: All logs output regardless of environment
- ❌ **No Monitoring**: Can't integrate with Application Insights

## Solution: Production Logger

Use `lib/utils/production-logger.ts` for structured, filterable, monitored logging.

---

## Migration Pattern

### Before (Console Logging)

```typescript
console.error('Failed to load user', error)
console.log('User ID:', userId, 'Status:', status)
console.warn('Rate limit approaching')
```

### After (Production Logger)

```typescript
import { logger } from '@/lib/utils/production-logger'

logger.error('Failed to load user', {
  error,
  context: 'UserProfile',
  userId, // structured context
})

logger.info('User status updated', {
  userId,
  status,
  context: 'UserProfile',
})

logger.warn('Rate limit approaching', {
  remaining: 5,
  limit: 100,
  context: 'RateLimiter',
})
```

---

## Benefits

| Feature                   | console.\*                  | production-logger        |
| ------------------------- | --------------------------- | ------------------------ |
| **Structured Context**    | ❌ String concatenation     | ✅ JSON objects          |
| **Environment Filtering** | ❌ Always outputs           | ✅ Respects NODE_ENV     |
| **PII Protection**        | ❌ Manual redaction         | ✅ Built-in sanitization |
| **Application Insights**  | ❌ Not integrated           | ✅ Auto-tracked          |
| **Log Levels**            | ❌ Limited (log/warn/error) | ✅ info/warn/error/debug |
| **Search/Filter**         | ❌ Plain text only          | ✅ Structured queries    |

---

## Scope of Migration

### Critical (30+ occurrences) - Admin Pages

**Location**: `app/admin/**/*.tsx`

**Priority**: HIGH (admin actions often involve sensitive data)

Files to update:

- `app/admin/ml/page.tsx` (6 console.error)
- `app/admin/ingestion/page.tsx` (7 console.error)
- `app/admin/compliance/page.tsx` (5 console.error)
- `app/admin/team/page.tsx` (4 console.error)
- `app/admin/courses/workflow/page.tsx` (3 console.error)
- `app/admin/permissions-management/page.tsx` (1 console.error)
- `app/admin/user-permissions/page.tsx` (2 console.error)
- `app/admin/users/[id]/page.tsx` (1 console.error)
- `app/admin/organizations/[id]/page.tsx` (1 console.error)
- `app/admin/sso-config/page.tsx` (1 console.error)

### Medium (25+ occurrences) - Application Pages

**Location**: `app/*/page.tsx`

**Priority**: MEDIUM (user-facing but less sensitive)

Files to update:

- `app/contact/page.tsx`
- `app/dashboard/page.tsx`
- `app/profile/page.tsx`
- `app/courses/[slug]/player/page.tsx`
- `app/training/page.tsx`
- `app/org/dashboard/page.tsx`
- `app/leaderboard/page.tsx`
- `app/study-buddies/page.tsx`
- `app/tribunal-cases/[id]/page.tsx`

### Medium (10+ occurrences) - Hooks

**Location**: `hooks/*.ts`

**Priority**: MEDIUM (reusable logic, affects multiple components)

Files to update:

- `hooks/use-subscription.ts` (3 console.error)
- `hooks/use-entitlements.ts` (1 console.error)
- `hooks/use-ai-coach.ts` (4 console.error)

### Low (15+ occurrences) - Service Worker

**Location**: `public/sw.js`

**Priority**: LOW (may need console for offline debugging)

**Consider**: Keep some logging for offline diagnostic purposes, but reduce verbosity.

### Skip - Scripts

**Location**: `scripts/*.ts`

**Action**: SKIP - CLI scripts intentionally use console for user output.

---

## Migration Steps

### Step 1: Install Logger Import

Add to the top of each file:

```typescript
import { logger } from '@/lib/utils/production-logger'
```

### Step 2: Replace Console Calls

#### Pattern 1: Simple Error Logging

```typescript
// Before
console.error('Failed to fetch data:', error)

// After
logger.error('Failed to fetch data', {
  error,
  context: 'ComponentName',
})
```

#### Pattern 2: Multiple Values

```typescript
// Before
console.log('User:', userId, 'Role:', role, 'Status:', status)

// After
logger.info('User details loaded', {
  userId,
  role,
  status,
  context: 'UserLoader',
})
```

#### Pattern 3: Conditional Logging

```typescript
// Before
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// After
logger.debug('Debug info', { data, context: 'ComponentName' })
// logger.debug is automatically filtered in production
```

#### Pattern 4: Warnings

```typescript
// Before
console.warn('Invalid configuration detected')

// After
logger.warn('Invalid configuration detected', {
  config,
  context: 'ConfigValidator',
})
```

### Step 3: Add Context Objects

Always include:

- `context`: Component/function name (for grouping logs)
- Relevant IDs: `userId`, `orgId`, `courseId`, etc.
- Error objects: `{ error }` for stack traces
- State: Current state that caused the issue

Example:

```typescript
logger.error('Course enrollment failed', {
  error,
  courseId,
  userId,
  enrollmentType,
  context: 'CourseEnrollment',
})
```

### Step 4: Remove PII

**Never log**:

- Passwords (including hashed)
- Email addresses (use userId instead)
- SSNs, credit card numbers
- Full names (use userId instead)
- Auth tokens

```typescript
// BAD ❌
logger.info('User logged in', { email: 'user@example.com', password: '***' })

// GOOD ✅
logger.info('User logged in', { userId: user.id, context: 'Auth' })
```

---

## Automated Migration Script

For bulk replacement, create `scripts/migrate-console-logs.ts`:

```typescript
import fs from 'fs'
import path from 'path'

const filesToMigrate = [
  'app/admin/ml/page.tsx',
  'app/admin/ingestion/page.tsx',
  // ... add all files
]

filesToMigrate.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8')

  // Add logger import if not present
  if (!content.includes("from '@/lib/utils/production-logger'")) {
    const importSection = content.match(/^(import.*\n)+/)?.[0] || ''
    const newImport = "import { logger } from '@/lib/utils/production-logger'\n"
    content = content.replace(importSection, importSection + newImport)
  }

  // Replace console.error
  content = content.replace(
    /console\.error\((["'`])(.*?)\1,\s*(\w+)\)/g,
    (match, quote, message, varName) =>
      `logger.error(${quote}${message}${quote}, { ${varName}, context: 'FIXME' })`
  )

  // Replace console.log
  content = content.replace(
    /console\.log\((["'`])(.*?)\1\)/g,
    (match, quote, message) => `logger.info(${quote}${message}${quote}, { context: 'FIXME' })`
  )

  // Replace console.warn
  content = content.replace(
    /console\.warn\((["'`])(.*?)\1\)/g,
    (match, quote, message) => `logger.warn(${quote}${message}${quote}, { context: 'FIXME' })`
  )

  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`✅ Migrated: ${filePath}`)
})

console.log('\n⚠️  Manual cleanup required:')
console.log('1. Replace all "context: \'FIXME\'" with actual component names')
console.log('2. Add relevant context fields (userId, courseId, etc.)')
console.log('3. Review for PII in log messages')
```

**Run**:

```bash
npx tsx scripts/migrate-console-logs.ts
```

---

## Testing Checklist

After migration:

- [ ] Run `npm run type-check` (verify no TypeScript errors)
- [ ] Run `npm run lint` (check for issues)
- [ ] Test in development (logs should appear with context)
- [ ] Test in production (verbose logs should be filtered)
- [ ] Verify Application Insights integration (logs appear in Azure)
- [ ] Check for PII leakage (no emails, passwords, tokens)
- [ ] Confirm error stack traces are preserved

---

## Production Logger API

### Methods

```typescript
import { logger } from '@/lib/utils/production-logger'

// Info (development only)
logger.info('Operation completed', { userId, duration: 234 })

// Warning (always logged)
logger.warn('Rate limit approaching', { remaining: 10, limit: 100 })

// Error (always logged)
logger.error('Operation failed', { error, userId, context: 'PaymentProcessor' })

// Debug (development only)
logger.debug('Internal state', { state, config })
```

### Configuration

```typescript
// lib/utils/production-logger.ts
const LOG_LEVEL =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug')
```

Environment variables:

```env
# Development: verbose logging
LOG_LEVEL=debug

# Production: warnings and errors only
LOG_LEVEL=warn
```

---

## Migration Progress Tracker

Track progress by file:

```markdown
### Admin Pages (HIGH PRIORITY)

- [ ] app/admin/ml/page.tsx (6 occurrences)
- [ ] app/admin/ingestion/page.tsx (7 occurrences)
- [ ] app/admin/compliance/page.tsx (5 occurrences)
- [ ] app/admin/team/page.tsx (4 occurrences)
- [ ] app/admin/courses/workflow/page.tsx (3 occurrences)
- [ ] app/admin/permissions-management/page.tsx (1 occurrence)
- [ ] app/admin/user-permissions/page.tsx (2 occurrences)
- [ ] app/admin/users/[id]/page.tsx (1 occurrence)
- [ ] app/admin/organizations/[id]/page.tsx (1 occurrence)
- [ ] app/admin/sso-config/page.tsx (1 occurrence)

### Hooks (MEDIUM PRIORITY)

- [ ] hooks/use-subscription.ts (3 occurrences)
- [ ] hooks/use-entitlements.ts (1 occurrence)
- [ ] hooks/use-ai-coach.ts (4 occurrences)

### App Pages (MEDIUM PRIORITY)

- [ ] app/contact/page.tsx
- [ ] app/dashboard/page.tsx
- [ ] app/profile/page.tsx
- [ ] app/courses/[slug]/player/page.tsx
- [ ] app/training/page.tsx
- [ ] app/org/dashboard/page.tsx
- [ ] app/leaderboard/page.tsx
- [ ] app/study-buddies/page.tsx
- [ ] app/tribunal-cases/[id]/page.tsx

### Service Worker (LOW PRIORITY)

- [ ] public/sw.js (review and reduce verbosity)
```

---

## Rollout Strategy

### Phase 1: High-Risk Areas (Week 1)

Migrate admin pages first (highest PII exposure):

1. `app/admin/**/*.tsx` (30+ occurrences)
2. Test thoroughly in staging
3. Deploy to production

### Phase 2: Hooks and Shared Logic (Week 2)

Migrate reusable hooks:

1. `hooks/*.ts` (10+ occurrences)
2. Test all components that use these hooks
3. Deploy to production

### Phase 3: User-Facing Pages (Week 3)

Migrate application pages:

1. `app/*/page.tsx` (25+ occurrences)
2. Test user workflows
3. Deploy to production

### Phase 4: Service Worker (Week 4)

Review and optimize service worker logging:

1. `public/sw.js` (15+ occurrences)
2. Preserve essential offline diagnostics
3. Deploy to production

---

## Post-Migration

### Remove Old Pattern

After full migration, add ESLint rule to prevent console usage:

```json
// .eslintrc.json
{
  "rules": {
    "no-console": [
      "error",
      {
        "allow": ["warn", "error"] // Allow in scripts only
      }
    ]
  }
}
```

### Monitor in Production

Use Azure Application Insights to:

- Track error rates by context
- Alert on error spikes
- Analyze user flows
- Identify bottlenecks

### Review Quarterly

- Audit logs for PII leakage
- Optimize log verbosity
- Update context fields
- Refine filtering rules

---

## Enterprise Reviewer Checklist

After migration, verify:

- [x] **No PII in logs** (emails, passwords, tokens)
- [x] **Structured context** (JSON objects, not string concatenation)
- [x] **Environment filtering** (verbose logs only in dev)
- [x] **Error tracking** (stack traces preserved)
- [x] **Monitoring integration** (Application Insights)
- [x] **No console.\* in production code** (except scripts)
- [x] **Context tagging** (all logs have component/function names)

---

## Resources

- [Production Logger Implementation](../../lib/utils/production-logger.ts)
- [Application Insights Integration](../../lib/monitoring/appInsights.ts)
- [PII Protection Guidelines](../security/PII_PROTECTION.md)
- [Logging Best Practices](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-best-practices)
