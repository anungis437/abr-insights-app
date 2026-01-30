# Production Polish: Console.log Cleanup (Blocker #3)

## Problem Statement

**Production Blocker #3**: ~30+ console.log occurrences across app/, lib/, components/ affecting production readiness.

## Current State Analysis

### Console Logging Locations

**app/ directory** (17 matches found):
- `app/admin/sso-config/page.tsx`: 5 debug logs (lines 127, 139, 156, 162, 214)
- `app/api/webhooks/stripe/route.ts`: 12 operational logs (lines 45, 56, 84, 116, 158, 187, 209, 248, 258, 292, 327, 336)

**Existing Logger Utility**: ✅ `lib/utils/logger.ts` with environment-aware logging

### Categories

1. **Debug Logs** (SSO config page): Development-time debugging that should be removed
2. **Webhook Operational Logs**: Useful for production monitoring but should use structured logging
3. **CLI Tools** (ingestion/): ✅ Acceptable - CLI tools need console output

## Solution Strategy

### Phase 1: Replace App Console.log with Logger (Immediate)

#### 1.1 SSO Config Page

**File**: `app/admin/sso-config/page.tsx`

```typescript
// BEFORE (5 occurrences)
console.log('Current user:', { id: user.id, email: user.email })
console.log('User profile:', profile)
console.log('Organizations loaded:', orgs?.length || 0)
console.log('Attempting to load SSO providers...')
console.log('SSO providers loaded:', ssoData?.length || 0)

// AFTER
import { logger } from '@/lib/utils/logger'

logger.debug('Current user loaded', { id: user.id, email: user.email })
logger.debug('User profile loaded', { profile })
logger.debug('Organizations loaded', { count: orgs?.length || 0 })
logger.debug('Loading SSO providers')
logger.debug('SSO providers loaded', { count: ssoData?.length || 0 })
```

#### 1.2 Stripe Webhook

**File**: `app/api/webhooks/stripe/route.ts`

These logs are actually valuable for production monitoring. Instead of removing, upgrade to structured logger:

```typescript
// BEFORE (12 occurrences)
console.log(`[Stripe Webhook] Received event: ${event.type}`)
console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`)
console.log(`[Stripe] Checkout completed for user ${userId}`)
// ... etc

// AFTER
import { logger } from '@/lib/utils/logger'

// Keep webhook logs in production but use info level
logger.info('Stripe webhook received', { 
  eventType: event.type, 
  eventId: event.id 
})

logger.info('Stripe webhook event already processed', { 
  eventId: event.id 
})

logger.info('Stripe checkout completed', { 
  userId, 
  subscriptionId: result.subscriptionId 
})
```

### Phase 2: Update Logger for Production Visibility

Current logger suppresses info/debug in production. For webhook monitoring, we need selective production logging:

```typescript
// lib/utils/logger.ts - UPDATED

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  // ... existing methods ...

  /**
   * Log important operational events (all environments)
   * Use for: webhooks, auth events, critical operations
   */
  operational(category: string, message: string, context?: LogContext): void {
    // In production, log to structured logging service (e.g., Datadog, Sentry)
    if (this.isProduction) {
      // TODO: Send to production logging service
      // For now, use console for webhook visibility
      console.log(`[${category.toUpperCase()}] ${message}`, context || '')
    } else {
      console.log(`[${category.toUpperCase()}] ${message}`, context || '')
    }
  }

  /**
   * Webhook-specific logging (all environments)
   */
  webhook(event: string, context?: LogContext): void {
    this.operational('WEBHOOK', event, context)
  }
}
```

### Phase 3: Add ESLint Rule to Prevent Future Console.log

```javascript
// .eslintrc.json - ADD RULE

{
  "rules": {
    "no-console": ["error", {
      "allow": ["error", "warn"]  // Only allow console.error and console.warn
    }]
  }
}
```

**Exceptions**: Add eslint-disable comments for CLI tools:

```typescript
// ingestion/src/**/*.ts
/* eslint-disable no-console */
// CLI output is required here
console.log('Processing...')
```

### Phase 4: Integrate Production Logging Service (Post-Launch)

**Options**:
1. **Sentry** (already planned): Captures errors + breadcrumbs
2. **Datadog** or **New Relic**: Full observability platform
3. **Azure Application Insights**: Native Azure integration
4. **Vercel Logs**: Built-in for Vercel deployments

**Recommended**: Start with Sentry (already in roadmap) + Azure Application Insights for Azure-deployed services.

## Implementation Checklist

### Immediate (Pre-Launch)

- [ ] **Step 1**: Import logger in `app/admin/sso-config/page.tsx`
- [ ] **Step 2**: Replace 5 console.log with logger.debug()
- [ ] **Step 3**: Import logger in `app/api/webhooks/stripe/route.ts`
- [ ] **Step 4**: Replace 12 console.log with logger.info() or logger.webhook()
- [ ] **Step 5**: Update logger.ts to add operational() and webhook() methods
- [ ] **Step 6**: Add eslint no-console rule
- [ ] **Step 7**: Test in development (logs visible)
- [ ] **Step 8**: Test in production preview (webhook logs visible, debug suppressed)
- [ ] **Step 9**: Verify CI passes with new eslint rule
- [ ] **Step 10**: Commit changes

### Post-Launch (Nice-to-Have)

- [ ] Integrate Sentry for structured logging
- [ ] Add Azure Application Insights SDK
- [ ] Configure log aggregation dashboard
- [ ] Set up alerts for webhook failures
- [ ] Add distributed tracing (OpenTelemetry)

## File Changes Summary

```
Modified Files (2):
  app/admin/sso-config/page.tsx      (5 replacements)
  app/api/webhooks/stripe/route.ts  (12 replacements)
  lib/utils/logger.ts               (add webhook() method)
  .eslintrc.json                    (add no-console rule)
```

## Testing Plan

1. **Development Mode**:
   - ✅ logger.debug() output visible
   - ✅ logger.info() output visible
   - ✅ SSO config page logs appear in browser console

2. **Production Preview**:
   - ✅ logger.debug() suppressed (SSO logs invisible)
   - ✅ logger.webhook() output visible (Stripe logs appear in Vercel logs)
   - ✅ No console.log warnings in browser

3. **CI/CD**:
   - ✅ ESLint passes with no-console rule
   - ✅ Type check passes
   - ✅ Build succeeds

4. **Webhook Testing**:
   - ✅ Stripe test webhook triggers logs in Vercel
   - ✅ Logs contain structured context (eventId, userId, etc.)
   - ✅ Production logs searchable/filterable

## Rollout Timeline

- **Day 1 (Today)**: Replace console.log in 2 files (30 minutes)
- **Day 1 (Today)**: Add eslint rule + test (15 minutes)
- **Day 1 (Today)**: Commit + deploy to preview (5 minutes)
- **Day 2**: Monitor webhook logs in production preview
- **Day 3**: Deploy to production after validation

## Success Metrics

- ✅ Zero console.log()/console.info()/console.debug() in app/, lib/, components/ (excluding ingestion/)
- ✅ ESLint no-console rule enforced
- ✅ Webhook events logged in production with structured context
- ✅ Debug logs suppressed in production (no PII leakage)
- ✅ No performance impact from logging overhead

## Long-term Logging Strategy

### Structured Logging Format

```typescript
interface LogEvent {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  category: 'auth' | 'webhook' | 'api' | 'db' | 'billing'
  message: string
  context: {
    userId?: string
    organizationId?: string
    requestId?: string
    [key: string]: unknown
  }
  metadata?: {
    environment: 'development' | 'production'
    version: string
    hostname: string
  }
}
```

### Log Levels

- **debug**: Development-time debugging (suppressed in prod)
- **info**: Informational messages (limited in prod)
- **warn**: Recoverable issues (all environments)
- **error**: Failures requiring attention (all environments)
- **operational**: Business-critical events (all environments)

### Retention Policy

- **Development**: 7 days
- **Production**: 90 days (operational logs), 30 days (debug/info)
- **Compliance**: 7 years (audit logs for financial transactions)

---

**Status**: Implementation in progress
**Blocker**: P2 (Medium priority, required for production polish)
**Estimated Effort**: 1 hour implementation + 30 minutes testing
**Target Completion**: Today
