# AI Cost Controls & Quota Management

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready  
**Implementation**: PR-05

## Executive Summary

This document details ABR Insights App's AI cost controls, including per-user and per-organization quotas, real-time tracking, admin management, and fail-open enforcement strategy. These controls prevent AI cost runaway while maintaining high availability for users.

**Cost Control Status**: ✅ Active in Production

**Key Measures**:
- ✅ Per-user daily quotas (100 messages/day)
- ✅ Per-org monthly quotas (10,000 messages/month)
- ✅ Real-time quota tracking (Redis)
- ✅ Admin dashboard for quota management
- ✅ Fail-open enforcement (availability priority)
- ✅ Grace period for quota overages

## AI Usage Quotas

### Default Quotas

#### Per-User Quotas

**Daily Limit**: 100 messages/day

**Rationale**:
- Prevents individual user abuse
- ~3-5 AI conversations per day
- Reasonable for educational use
- Resets at midnight UTC

**Scope**: All users (students, instructors, admins)

#### Per-Organization Quotas

**Monthly Limit**: 10,000 messages/month

**Rationale**:
- Prevents organization-wide cost runaway
- ~50 users × 200 messages/month = 10,000
- Resets on 1st of each month

**Scope**: All organizations (including free tier)

### Subscription-Based Quotas (Future)

**Planned Tiers**:
```
Free Tier:
  - Per User: 50 messages/day
  - Per Org: 1,000 messages/month

Basic ($29/month):
  - Per User: 100 messages/day
  - Per Org: 10,000 messages/month

Pro ($99/month):
  - Per User: 500 messages/day
  - Per Org: 50,000 messages/month

Enterprise (custom):
  - Per User: Unlimited
  - Per Org: Unlimited (with cost alerts)
```

## Quota Tracking Implementation

### Storage Backend

**Primary**: Redis (fast, atomic operations)

**Fallback**: PostgreSQL (if Redis unavailable)

**Keys Structure**:
```
ai_quota:user:{userId}:daily:{YYYY-MM-DD}
ai_quota:org:{orgId}:monthly:{YYYY-MM}
ai_quota:user:{userId}:lock
```

### Real-Time Quota Check

**Implementation**: `lib/services/ai-quota-tracker.ts`

```typescript
export async function checkUserQuota(userId: string): Promise<QuotaCheckResult> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `ai_quota:user:${userId}:daily:${today}`;
    
    // Get current usage (atomic)
    const usage = parseInt(await redis.get(key) || '0');
    const limit = await getUserDailyLimit(userId); // Default: 100
    
    if (usage >= limit) {
      return {
        allowed: false,
        reason: 'Daily AI quota exceeded',
        usage,
        limit,
        resetAt: getNextMidnight(),
      };
    }
    
    return {
      allowed: true,
      usage,
      limit,
      remaining: limit - usage,
    };
  } catch (error) {
    // FAIL OPEN: Allow AI on error (availability priority)
    logger.error('Quota check failed (fail-open)', { userId, error });
    return { allowed: true, failOpen: true };
  }
}

export async function incrementUserQuota(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `ai_quota:user:${userId}:daily:${today}`;
  
  // Increment atomically
  await redis.incr(key);
  
  // Set expiration (auto-delete at midnight)
  const midnight = getNextMidnight();
  await redis.expireAt(key, midnight);
}
```

### Organization Quota Check

```typescript
export async function checkOrgQuota(orgId: string): Promise<QuotaCheckResult> {
  try {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const key = `ai_quota:org:${orgId}:monthly:${month}`;
    
    const usage = parseInt(await redis.get(key) || '0');
    const limit = await getOrgMonthlyLimit(orgId); // Default: 10,000
    
    if (usage >= limit) {
      // Check if grace period active
      const graceKey = `ai_quota:org:${orgId}:grace`;
      const graceActive = await redis.get(graceKey);
      
      if (!graceActive) {
        return {
          allowed: false,
          reason: 'Monthly organization AI quota exceeded',
          usage,
          limit,
          resetAt: getNextMonthStart(),
        };
      }
    }
    
    return { allowed: true, usage, limit, remaining: limit - usage };
  } catch (error) {
    // FAIL OPEN
    logger.error('Org quota check failed (fail-open)', { orgId, error });
    return { allowed: true, failOpen: true };
  }
}
```

### API Integration

**Workflow**:
```
User Request → Quota Check → (Allowed) → OpenAI API → Increment Quota → Response
                         ↓
                    (Blocked) → Error Response (quota exceeded)
```

**Implementation** (`app/api/ai/chat/route.ts`):
```typescript
export async function POST(request: Request) {
  const session = await getServerSession();
  const { message } = await request.json();
  
  // 1. Check user quota
  const userQuota = await checkUserQuota(session.user.id);
  if (!userQuota.allowed) {
    return Response.json(
      {
        error: 'AI quota exceeded',
        details: userQuota.reason,
        resetAt: userQuota.resetAt,
      },
      { status: 429 }
    );
  }
  
  // 2. Check org quota
  const orgQuota = await checkOrgQuota(session.user.organizationId);
  if (!orgQuota.allowed) {
    return Response.json(
      {
        error: 'Organization AI quota exceeded',
        details: orgQuota.reason,
        resetAt: orgQuota.resetAt,
      },
      { status: 429 }
    );
  }
  
  // 3. Call OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
  });
  
  // 4. Increment quotas (async, don't block response)
  incrementUserQuota(session.user.id).catch(err =>
    logger.error('Failed to increment user quota', { err })
  );
  incrementOrgQuota(session.user.organizationId).catch(err =>
    logger.error('Failed to increment org quota', { err })
  );
  
  // 5. Return AI response
  return Response.json({
    message: response.choices[0].message.content,
    usage: {
      user: userQuota,
      org: orgQuota,
    },
  });
}
```

## Fail-Open Strategy

### Design Philosophy

**Comparison to PR-07** (CanLII compliance):
- PR-07 (CanLII): **Fail-closed** (compliance priority, block on errors)
- PR-05 (AI Cost): **Fail-open** (availability priority, allow on errors)

**Rationale**:
- AI features are core user value (high UX impact if unavailable)
- Cost overruns are manageable (monitoring + alerts)
- Temporary quota tracking failures shouldn't block all users
- Better UX: Allow AI access vs. hard block

### Error Scenarios (Fail-Open)

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| Redis connection failed | ✅ Allow AI | Availability > Cost |
| Quota key missing | ✅ Allow AI | Assume fresh user |
| Redis timeout | ✅ Allow AI | Don't block on infra issue |
| Invalid quota value | ✅ Allow AI | Data corruption, allow temporarily |
| PostgreSQL fallback failed | ✅ Allow AI | Last resort, allow + alert |

**Logging**:
```typescript
if (quotaCheck.failOpen) {
  logger.warn('AI request allowed despite quota check failure', {
    userId,
    orgId,
    error: quotaCheck.error,
    decision: 'fail-open',
  });
}
```

**Monitoring**:
- Alert on fail-open events (>10/hour)
- Daily report: Fail-open requests count
- Investigation: If repeated, fix Redis/DB issue

## Admin Dashboard

### Quota Management UI

**URL**: `/admin/ai-quotas`

**Permissions**: Org admin, super admin

**Features**:

#### 1. Current Usage View

```
┌─────────────────────────────────────────────────────┐
│ Organization: Nzila Law Firm                        │
│                                                     │
│ Monthly Quota: 8,456 / 10,000 messages (84.6%)     │
│ [████████████████████████░░░░] 15 days remaining   │
│                                                     │
│ Top Users (This Month):                             │
│ 1. John Doe         1,245 messages                  │
│ 2. Jane Smith       987 messages                    │
│ 3. Bob Johnson      765 messages                    │
│                                                     │
│ Daily Usage (Last 7 Days):                          │
│ Feb 3: 456 ████████                                 │
│ Feb 2: 389 ███████                                  │
│ Feb 1: 512 █████████                                │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

#### 2. Quota Configuration

```
┌─────────────────────────────────────────────────────┐
│ Quota Settings                                      │
│                                                     │
│ Per User Daily Limit:                               │
│ [100] messages/day                 [Update]         │
│                                                     │
│ Organization Monthly Limit:                         │
│ [10,000] messages/month            [Update]         │
│                                                     │
│ Grace Period:                                       │
│ [✓] Enable grace period (allow 10% overage)        │
│ Grace Duration: [3] days                            │
│                                                     │
│ Alerts:                                             │
│ [✓] Email admin at 80% usage                        │
│ [✓] Email admin at 95% usage                        │
│ [✓] Email admin at 100% usage                       │
│                                                     │
│                              [Save Changes]         │
└─────────────────────────────────────────────────────┘
```

#### 3. User Override

```
┌─────────────────────────────────────────────────────┐
│ User Quota Override                                 │
│                                                     │
│ User: john.doe@nzilalaw.com                         │
│ Current Limit: 100 messages/day                     │
│ Today's Usage: 87 / 100 (87%)                       │
│                                                     │
│ Override Daily Limit:                               │
│ [500] messages/day                 [Apply]          │
│                                                     │
│ Override Reason:                                    │
│ [Power user - approved by admin]                    │
│                                                     │
│ Override Duration:                                  │
│ [○] Permanent                                       │
│ [●] Temporary (30 days)                             │
│                                                     │
│                              [Save Override]        │
└─────────────────────────────────────────────────────┘
```

### Admin API Endpoints

#### Get Organization Usage

```typescript
// GET /api/admin/ai-quotas/org/{orgId}

{
  "organization": {
    "id": "org_nzila",
    "name": "Nzila Law Firm",
  },
  "monthly": {
    "usage": 8456,
    "limit": 10000,
    "percentage": 84.56,
    "resetAt": "2026-03-01T00:00:00Z",
  },
  "topUsers": [
    { "userId": "user_123", "name": "John Doe", "usage": 1245 },
    { "userId": "user_456", "name": "Jane Smith", "usage": 987 },
  ],
  "dailyHistory": [
    { "date": "2026-02-03", "usage": 456 },
    { "date": "2026-02-02", "usage": 389 },
  ],
}
```

#### Update Organization Quota

```typescript
// PUT /api/admin/ai-quotas/org/{orgId}

Request:
{
  "monthlyLimit": 15000,
  "gracePeriod": true,
  "graceDuration": 3,
}

Response:
{
  "success": true,
  "newLimit": 15000,
  "effectiveAt": "2026-02-03T10:30:00Z",
}
```

#### Override User Quota

```typescript
// PUT /api/admin/ai-quotas/user/{userId}

Request:
{
  "dailyLimit": 500,
  "reason": "Power user - approved by admin",
  "duration": "temporary", // or "permanent"
  "expiresAt": "2026-03-05T00:00:00Z",
}

Response:
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "oldLimit": 100,
    "newLimit": 500,
  },
}
```

## Grace Period

### Purpose

**Goal**: Avoid abrupt service disruption when quota exceeded

**Use Case**: Organization hits monthly limit mid-month → Grace period allows continued use for 3 days while admin increases quota or waits for monthly reset

### Implementation

```typescript
export async function enableGracePeriod(orgId: string, durationDays: number = 3): Promise<void> {
  const graceKey = `ai_quota:org:${orgId}:grace`;
  const expiresAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
  
  await redis.set(graceKey, 'active');
  await redis.expireAt(graceKey, Math.floor(expiresAt / 1000));
  
  logger.info('Grace period activated', {
    orgId,
    durationDays,
    expiresAt: new Date(expiresAt).toISOString(),
  });
  
  // Notify org admin
  await sendGracePeriodNotification(orgId, expiresAt);
}
```

### Automatic Activation

**Trigger**: Organization exceeds 100% of monthly quota

**Actions**:
1. Enable grace period (3 days default)
2. Email org admin: "AI quota exceeded, grace period active for 3 days"
3. Log event: `ai_quota.grace_period_activated`

**Email Template**:
```
Subject: AI Quota Exceeded - Grace Period Active

Dear [Org Admin],

Your organization has exceeded its monthly AI quota (10,000 messages).

To avoid service disruption, we've activated a 3-day grace period.
During this time, your users can continue using AI features.

Action Required:
- Upgrade subscription (increase quota)
- Wait for monthly reset (March 1st)
- Contact support for temporary quota increase

Current Usage: 10,123 / 10,000 messages
Grace Period Expires: February 6, 2026 at 11:59 PM

Manage Quota: https://abr-insights.com/admin/ai-quotas

Best regards,
ABR Insights Team
```

## Cost Monitoring & Alerts

### Cost Tracking

**OpenAI API Costs** (GPT-4):
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average message: ~500 tokens total → $0.0225 per message

**Estimated Monthly Costs**:
```
10,000 messages × $0.0225 = $225/month per organization
50 organizations × $225 = $11,250/month total
```

### Alert Thresholds

| Threshold | Action | Recipient |
|-----------|--------|-----------|
| 80% quota | Email notification | Org admin |
| 95% quota | Email warning | Org admin |
| 100% quota | Email + grace period | Org admin + platform admin |
| 110% quota (grace) | Email urgent | Org admin + platform admin |
| Cost >$500/day | PagerDuty alert | Platform admin + engineering |

### Cost Dashboard

**URL**: `/admin/ai-costs`

**Metrics**:
- Total API calls (last 30 days)
- Total tokens used (input + output)
- Estimated cost (based on OpenAI pricing)
- Cost per organization (top 10)
- Cost trend (daily)

**Export**: CSV download for accounting

## Quota Bypass (Emergency)

### Super Admin Override

**Use Case**: Critical user needs AI access despite quota exceeded

**Process**:
1. Super admin navigates to `/admin/ai-quotas/user/{userId}`
2. Click "Emergency Override" button
3. Confirm: "This will grant unlimited AI access for 24 hours"
4. User can use AI without quota check (24 hours)
5. Audit log: `ai_quota.emergency_override` event

**Implementation**:
```typescript
export async function checkUserQuota(userId: string): Promise<QuotaCheckResult> {
  // Check for emergency override
  const overrideKey = `ai_quota:user:${userId}:override`;
  const override = await redis.get(overrideKey);
  
  if (override === 'active') {
    logger.warn('User AI quota bypassed (emergency override)', { userId });
    return { allowed: true, override: true };
  }
  
  // Normal quota check
  // ...
}

export async function activateEmergencyOverride(userId: string, durationHours: number = 24): Promise<void> {
  const overrideKey = `ai_quota:user:${userId}:override`;
  await redis.set(overrideKey, 'active');
  await redis.expire(overrideKey, durationHours * 3600);
  
  logger.warn('Emergency override activated', { userId, durationHours });
  
  // Audit log
  await logEvent({
    event: 'ai_quota.emergency_override',
    userId,
    activatedBy: getCurrentAdmin(),
    durationHours,
  });
}
```

## Testing & Validation

### Unit Tests

**Test Cases**:
1. User within quota → AI request allowed
2. User exceeds daily quota → AI request blocked (429)
3. Org exceeds monthly quota → AI request blocked (429)
4. Grace period active → AI request allowed (despite exceeded quota)
5. Redis unavailable → AI request allowed (fail-open)
6. Emergency override active → AI request allowed

**Example**:
```typescript
describe('AI Quota Tracker', () => {
  it('blocks user after daily quota exceeded', async () => {
    const userId = 'user_test_123';
    
    // Simulate 100 messages
    for (let i = 0; i < 100; i++) {
      await incrementUserQuota(userId);
    }
    
    // 101st message should be blocked
    const quota = await checkUserQuota(userId);
    expect(quota.allowed).toBe(false);
    expect(quota.reason).toContain('Daily AI quota exceeded');
  });
});
```

### Load Testing

**Scenario**: 1000 concurrent AI requests

**Goal**: Verify quota tracking accuracy under load

**Metrics**:
- Quota counter accuracy (should be exactly 1000)
- No race conditions (Redis atomic operations)
- No over-quota requests allowed

## Related Documents

- [PR-05: AI Abuse & Cost Controls](../PR_05_AI_COST_CONTROLS.md): Implementation details
- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Overall security architecture
- [RUNBOOK.md](./RUNBOOK.md): Operational procedures

---

**Document History**:
- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
