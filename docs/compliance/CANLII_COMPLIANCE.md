# CanLII API Compliance

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready  
**Implementation**: PR-07

## Executive Summary

This document demonstrates ABR Insights App's compliance with CanLII API Terms of Use, including strict rate limiting (2 req/sec, 1 concurrent, 5000/day), fail-closed enforcement, kill switch capability, and prohibition of full-text storage. This compliance is essential to maintain our CanLII API access and avoid account termination.

**Compliance Status**: ✅ Fully Compliant

**Key Measures**:
- ✅ Global rate limiter (Redis token bucket)
- ✅ 2 requests/second (burst capacity)
- ✅ 1 concurrent request (no parallel calls)
- ✅ 5000 requests/day (hard limit)
- ✅ Fail-closed enforcement (blocks on errors)
- ✅ Kill switch (CANLII_INGESTION_ENABLED)
- ✅ NO full-text storage (metadata only)
- ✅ Complete audit trail

## CanLII Terms of Use

### Rate Limit Requirements

**Official Limits** (from CanLII API documentation):
- **Requests per Second**: 2 (burst capacity)
- **Concurrent Requests**: 1 (no parallel calls)
- **Daily Limit**: 5000 requests/day

**Violation Consequences**:
- Temporary suspension (first offense)
- Permanent account termination (repeated violations)
- Legal action (if terms egregiously violated)

### Content Usage Restrictions

**Prohibited**:
- ❌ Storing full case text/content
- ❌ Republishing case content on other platforms
- ❌ Commercial redistribution
- ❌ Modifying case content

**Allowed**:
- ✅ Storing metadata (case ID, title, citation, URL)
- ✅ Linking to CanLII case pages
- ✅ Educational use (non-commercial)
- ✅ Research purposes

## Rate Limiter Implementation

### Architecture

**Type**: Redis token bucket algorithm

**Scope**: Global (all app instances share same limits)

**Implementation**: `lib/services/canlii-rate-limiter.ts`

### Rate Limit Configuration

```typescript
// lib/services/canlii-rate-limiter.ts

// REQUESTS PER SECOND: 2 (burst capacity)
const REQUESTS_PER_SECOND = 2;
const MAX_TOKENS = 2; // Bucket capacity

// CONCURRENT REQUESTS: 1 (no parallel calls)
const MAX_CONCURRENT = 1;

// DAILY LIMIT: 5000 requests/day
const DAILY_LIMIT = 5000;

// Redis keys (shared across all instances)
const REDIS_KEY_TOKENS = 'canlii:tokens';
const REDIS_KEY_CONCURRENT = 'canlii:concurrent';
const REDIS_KEY_DAILY_COUNT = 'canlii:daily_count';
const REDIS_KEY_DAILY_RESET = 'canlii:daily_reset';
```

### Token Bucket Algorithm

**How It Works**:
1. **Bucket** holds 2 tokens (max capacity)
2. **Refill Rate**: 2 tokens/second (0.5 seconds per token)
3. **Request** consumes 1 token
4. **Burst**: Can make 2 requests immediately (if bucket full)
5. **Sustained**: Can make 2 requests/second long-term

**Example Timeline**:
```
Time    Tokens  Action
----    ------  ------
0.0s    2       Request 1 (consume 1 token)
0.1s    1       Request 2 (consume 1 token)
0.2s    0       Request 3 BLOCKED (no tokens)
0.5s    1       Token refilled (0.5s elapsed)
0.5s    0       Request 3 allowed (consume 1 token)
1.0s    1       Token refilled
1.5s    2       Token refilled (bucket full)
```

**Implementation**:
```typescript
async checkTokenBucket(): Promise<RateLimitResult> {
  const now = Date.now();
  
  // Get last request time and token count
  const lastTime = await redis.get(`${REDIS_KEY_TOKENS}:last_time`);
  let tokens = parseFloat(await redis.get(REDIS_KEY_TOKENS) || '2');
  
  if (lastTime) {
    // Calculate tokens to add based on elapsed time
    const elapsed = (now - parseInt(lastTime)) / 1000; // seconds
    tokens = Math.min(MAX_TOKENS, tokens + (elapsed * REFILL_RATE));
  }
  
  // Check if token available
  if (tokens >= 1) {
    return { allowed: true, currentTokens: tokens };
  } else {
    // Calculate retry-after (time until 1 token available)
    const retryAfter = Math.ceil((1 - tokens) / REFILL_RATE);
    return {
      allowed: false,
      reason: 'Rate limit exceeded (2 requests/second)',
      retryAfter,
      currentTokens: tokens,
    };
  }
}
```

### Concurrent Request Limiting

**Purpose**: Enforce max 1 concurrent request (CanLII requirement)

**Implementation**:
```typescript
async checkConcurrentLimit(): Promise<RateLimitResult> {
  const concurrent = parseInt(await redis.get(REDIS_KEY_CONCURRENT) || '0');
  
  if (concurrent >= MAX_CONCURRENT) {
    return {
      allowed: false,
      reason: 'Concurrent request limit exceeded (max 1)',
      retryAfter: 1, // Try again in 1 second
    };
  }
  
  return { allowed: true };
}

async acquireLimit(): Promise<RateLimitResult> {
  // ... (check limits)
  
  // Increment concurrent counter
  await redis.incr(REDIS_KEY_CONCURRENT);
  
  return { allowed: true };
}

async releaseLimit(): Promise<void> {
  // Decrement concurrent counter (after request completes)
  await redis.decr(REDIS_KEY_CONCURRENT);
}
```

**Usage**:
```typescript
// Acquire before request
const limit = await canliiRateLimiter.acquireLimit();
if (!limit.allowed) {
  throw new Error(limit.reason);
}

try {
  // Make API call
  const response = await fetch('https://api.canlii.org/...');
  return response;
} finally {
  // ALWAYS release (even on error)
  await canliiRateLimiter.releaseLimit();
}
```

### Daily Quota Enforcement

**Purpose**: Hard stop at 5000 requests/day

**Implementation**:
```typescript
async checkDailyLimit(): Promise<RateLimitResult> {
  const dailyCount = parseInt(await redis.get(REDIS_KEY_DAILY_COUNT) || '0');
  
  if (dailyCount >= DAILY_LIMIT) {
    // Calculate time until midnight (reset time)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const retryAfter = Math.ceil((midnight.getTime() - now.getTime()) / 1000);
    
    return {
      allowed: false,
      reason: 'Daily limit exceeded (5000 requests/day)',
      retryAfter, // Seconds until midnight
      dailyUsed: dailyCount,
      dailyLimit: DAILY_LIMIT,
    };
  }
  
  return { allowed: true, dailyUsed: dailyCount, dailyLimit: DAILY_LIMIT };
}

async incrementDaily(): Promise<void> {
  const resetTime = await redis.get(REDIS_KEY_DAILY_RESET);
  
  if (!resetTime || Date.now() >= parseInt(resetTime)) {
    // Reset daily counter at midnight
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    await redis.set(REDIS_KEY_DAILY_COUNT, '1');
    await redis.set(REDIS_KEY_DAILY_RESET, midnight.getTime().toString());
  } else {
    // Increment counter
    await redis.incr(REDIS_KEY_DAILY_COUNT);
  }
}
```

### Fail-Closed Enforcement

**Philosophy**: Strict compliance over availability

**Comparison to PR-05** (AI cost controls):
- PR-05 (AI): **Fail-open** (availability priority, cost secondary)
- PR-07 (CanLII): **Fail-closed** (compliance priority, availability secondary)

**Rationale**: CanLII account termination is worse than temporary service unavailability

**Implementation**:
```typescript
async checkLimit(): Promise<RateLimitResult> {
  try {
    // Check all limits
    const dailyCheck = await this.checkDailyLimit();
    if (!dailyCheck.allowed) return dailyCheck;
    
    const concurrentCheck = await this.checkConcurrentLimit();
    if (!concurrentCheck.allowed) return concurrentCheck;
    
    const tokenCheck = await this.checkTokenBucket();
    if (!tokenCheck.allowed) return tokenCheck;
    
    return { allowed: true };
    
  } catch (error) {
    // FAIL CLOSED: Block request on ANY error
    logger.error('Rate limiter error (fail-closed)', { error });
    return {
      allowed: false,
      reason: 'Rate limiter unavailable (fail-closed for compliance)',
      retryAfter: 60, // Retry in 1 minute
    };
  }
}
```

**Error Scenarios** (all block requests):
- ❌ Redis connection failed
- ❌ Redis command timeout
- ❌ Redis authentication error
- ❌ Unexpected exception in rate limiter

## Kill Switch

### Purpose

**Emergency Stop**: Instantly disable all CanLII ingestion

**Use Cases**:
- CanLII reports terms violation
- Rate limiter malfunction detected
- Unexpected high request volume
- Maintenance/debugging

### Implementation

**Environment Variable**:
```bash
# .env
CANLII_INGESTION_ENABLED=false  # Kill switch activated
```

**Default Behavior**:
```typescript
// lib/services/canlii-ingestion.ts

export function isIngestionEnabled(): boolean {
  // Default: enabled if API key present
  if (process.env.CANLII_INGESTION_ENABLED === 'false') {
    return false; // Kill switch activated
  }
  
  // Require API key
  if (!process.env.CANLII_API_KEY) {
    return false; // No API key configured
  }
  
  return true; // Ingestion enabled
}
```

**Check Before Every Request**:
```typescript
async executeIngestion(runId: string, options: IngestionRunOptions) {
  for (const caseId of caseIds) {
    // Check kill switch BEFORE each request
    if (!this.isIngestionEnabled()) {
      logger.warn('CanLII ingestion disabled by kill switch', { runId });
      await this.updateRunStatus(runId, 'killed', 'Ingestion disabled by kill switch');
      return;
    }
    
    // Proceed with request
    await this.fetchCaseMetadata(runId, caseId);
  }
}
```

**Activation Procedure**:
1. Set environment variable: `CANLII_INGESTION_ENABLED=false`
2. Restart container: `az containerapp revision restart`
3. Verify: Check logs for "ingestion disabled by kill switch"
4. In-progress runs: Stopped mid-execution, status set to 'killed'

**Reactivation**:
1. Set environment variable: `CANLII_INGESTION_ENABLED=true`
2. Restart container
3. Monitor: Watch request logs for 1 hour

## Content Compliance (NO Full-Text Storage)

### Type Definitions (Explicitly Exclude Text Fields)

```typescript
// lib/services/canlii-ingestion.ts

interface CanLIICaseMetadata {
  caseId: string;
  databaseId: string;
  jurisdiction: string;
  court: string;
  decisionDate: string;
  title?: string;
  citation?: string;
  url?: string;
  judges?: string[];
  keywords?: string[];
  language?: string;
  
  // EXPLICITLY EXCLUDED (compliance with CanLII terms):
  // NO: content, text, body, full_text, document, html, paragraphs, etc.
}
```

### Database Schema (NO Text Columns)

```sql
-- supabase/migrations/YYYYMMDD_canlii_cases.sql

CREATE TABLE canlii_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadata ONLY
  case_id TEXT NOT NULL UNIQUE,
  database_id TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  court TEXT NOT NULL,
  decision_date DATE NOT NULL,
  title TEXT,
  citation TEXT,
  url TEXT,
  judges TEXT[],
  keywords TEXT[],
  language TEXT DEFAULT 'en',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- EXPLICITLY EXCLUDED TEXT FIELDS (CanLII compliance):
  -- NO: content TEXT, body TEXT, full_text TEXT, document TEXT, html TEXT
);

COMMENT ON TABLE canlii_cases IS 'CanLII case metadata ONLY (no full-text storage per CanLII terms)';
```

### API Response Filtering

```typescript
// lib/services/canlii-ingestion.ts

async fetchCaseMetadata(runId: string, caseId: string): Promise<CanLIICaseMetadata> {
  const response = await withCanLIIRateLimit(async () => {
    return fetch(`https://api.canlii.org/v1/caseBrowse/${caseId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
  });
  
  const data = await response.json();
  
  // Extract metadata ONLY (explicitly exclude text fields)
  const metadata: CanLIICaseMetadata = {
    caseId: data.caseId,
    databaseId: data.databaseId,
    jurisdiction: data.jurisdiction,
    court: data.court,
    decisionDate: data.decisionDate,
    title: data.title,
    citation: data.citation,
    url: data.url,
    judges: data.judges,
    keywords: data.keywords,
    language: data.language,
    
    // EXPLICITLY EXCLUDED:
    // DO NOT store: data.content, data.text, data.body, data.html, data.document
  };
  
  return metadata;
}
```

### CI Validation (NO Text Storage)

**Workflow**: `.github/workflows/canlii-compliance.yml`

**Job**: `validate-no-text-storage`

```yaml
validate-no-text-storage:
  runs-on: ubuntu-latest
  steps:
    - name: Check Schema for Text Columns
      run: |
        if grep -E "(content|text|body|document|full_text)\s+(TEXT|VARCHAR)" supabase/migrations/*.sql | grep -v "COMMENT\|--"; then
          echo "❌ Text storage columns found in schema (violates CanLII terms)"
          exit 1
        fi
        echo "✅ No text storage columns in schema"
    
    - name: Check for Explicit Exclusion Comment
      run: |
        if ! grep -q "EXPLICITLY EXCLUDED.*content.*text.*body" lib/services/canlii-ingestion.ts; then
          echo "❌ Missing explicit exclusion comment for text fields"
          exit 1
        fi
        echo "✅ Explicit exclusion comment found"
    
    - name: Check for Text Field Assignments
      run: |
        if grep -E "(content:|\.content\s*=|text:|\.text\s*=|body:|\.body\s*=)" lib/services/canlii-ingestion.ts | grep -v "//.*NO:"; then
          echo "❌ Text field assignments found (violates CanLII terms)"
          exit 1
        fi
        echo "✅ No text field assignments"
```

## Tracking & Audit Trail

### Database Schema

**Implementation**: `supabase/migrations/20260203_canlii_ingestion_tracking.sql`

**Tables**:
1. `canlii_ingestion_runs`: Run lifecycle tracking
2. `canlii_api_requests`: Per-request audit log
3. `canlii_daily_quotas`: Daily aggregates

### Ingestion Runs Tracking

**Table**: `canlii_ingestion_runs`

**Columns**:
- `id`: Run ID (UUID)
- `status`: running, completed, failed, rate_limited, killed
- `started_at`, `completed_at`: Timestamps
- **Request metrics**: `total_requests`, `successful_requests`, `failed_requests`, `rate_limited_requests`
- **Timing**: `min_request_duration_ms`, `max_request_duration_ms`, `avg_request_duration_ms`
- **Data**: `cases_fetched`, `cases_created`, `cases_updated`, `cases_skipped`
- **Compliance flags**: `exceeded_daily_limit`, `exceeded_rate_limit`, `kill_switch_active`

**Example**:
```sql
SELECT *
FROM canlii_ingestion_runs
WHERE status = 'rate_limited'
ORDER BY started_at DESC
LIMIT 10;
```

### Per-Request Audit Log

**Table**: `canlii_api_requests`

**Columns**:
- `run_id`: Associated ingestion run
- `endpoint`: `/caseBrowse/{caseId}`
- `case_id`: Case being fetched
- **Rate limit state** (at time of request):
  - `tokens_available`: Remaining tokens in bucket
  - `concurrent_requests`: Current concurrent count
  - `daily_requests_used`: Daily quota consumed
- **Response**: `status_code`, `response_time_ms`, `success`, `rate_limited`
- **Error**: `error_type`, `error_message`, `retry_count`

**Example**:
```sql
SELECT case_id, status_code, response_time_ms, tokens_available, daily_requests_used
FROM canlii_api_requests
WHERE run_id = '{run_id}'
ORDER BY created_at;
```

### Daily Quota Aggregates

**Table**: `canlii_daily_quotas`

**Columns**:
- `date`: Date (YYYY-MM-DD)
- `total_requests`, `successful_requests`, `failed_requests`, `rate_limited_requests`
- `daily_limit` (5000), `limit_exceeded`, `limit_exceeded_at`
- `peak_concurrent`, `peak_requests_per_second`
- `total_runs`, `successful_runs`, `failed_runs`

**Example**:
```sql
SELECT date, total_requests, daily_limit, limit_exceeded
FROM canlii_daily_quotas
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

## Compliance Monitoring

### Real-Time Monitoring

**Dashboard**: `/admin/canlii/stats`

**Metrics Displayed**:
- Current daily usage: `245 / 5000 requests`
- Current tokens: `1.5 / 2.0 tokens`
- Concurrent requests: `0 / 1`
- Rate limit exceeded events (last 24h)
- Kill switch status: `ENABLED` or `DISABLED`

**Alerts**:
- Daily quota >80%: Warning email to admin
- Daily quota >95%: Urgent alert (PagerDuty)
- Rate limit exceeded >10/hour: Investigation ticket
- Kill switch activated: Immediate notification

### Weekly Reports

**Automated Report** (Monday 9 AM):
- Total requests last week
- Average requests/day
- Rate limit events
- Failed requests (with error types)
- Compliance summary (any violations)

**Sent To**: engineering@abr-insights.com, compliance@abr-insights.com

### Compliance Verification Checklist

**Monthly Review** (1st of each month):
- [ ] Verify rate limiter constants unchanged (2/1/5000)
- [ ] Check CI workflow still passing
- [ ] Review daily quota logs (no exceeded limits)
- [ ] Verify kill switch functional (test activation)
- [ ] Confirm NO text storage (database schema check)
- [ ] Review audit logs (any anomalies)
- [ ] Update documentation if needed

**Responsible**: Engineering Lead + Compliance Officer

## Testing & Validation

### Rate Limiter Testing

**Test 1: Requests Per Second**
```bash
# Make 3 rapid requests
curl https://abr-insights.com/api/canlii/cases/2024onca123
curl https://abr-insights.com/api/canlii/cases/2024onca124
curl https://abr-insights.com/api/canlii/cases/2024onca125

# Expected: 3rd request blocked (exceeded 2 req/sec)
# Response: 429 Too Many Requests
```

**Test 2: Concurrent Requests**
```bash
# Make 2 parallel requests
curl https://abr-insights.com/api/canlii/cases/2024onca123 &
curl https://abr-insights.com/api/canlii/cases/2024onca124 &

# Expected: 2nd request blocked (max 1 concurrent)
# Response: 429 Too Many Requests
```

**Test 3: Daily Limit**
```bash
# Simulate 5000 requests (use test environment)
for i in {1..5001}; do
  curl https://staging.abr-insights.com/api/canlii/test
done

# Expected: 5001st request blocked
# Response: 429 Too Many Requests ("Daily limit exceeded")
```

**Test 4: Kill Switch**
```bash
# Activate kill switch
export CANLII_INGESTION_ENABLED=false
az containerapp revision restart

# Try ingestion
curl -X POST https://abr-insights.com/api/admin/canlii/ingest

# Expected: 503 Service Unavailable ("Ingestion disabled by kill switch")
```

### Content Compliance Testing

**Test 1: Type Safety**
```typescript
// This should fail TypeScript compilation
const metadata: CanLIICaseMetadata = {
  caseId: '2024onca123',
  // @ts-expect-error - content field should not exist
  content: 'case text here',
};
```

**Test 2: Database Insert**
```sql
-- This should fail (column doesn't exist)
INSERT INTO canlii_cases (case_id, content)
VALUES ('2024onca123', 'case text here');

-- Expected: ERROR: column "content" does not exist
```

## Incident Response

### Rate Limit Violation Detected

**Scenario**: Daily limit exceeded (>5000 requests)

**Actions**:
1. **Immediate**: Kill switch activated (CANLII_INGESTION_ENABLED=false)
2. **Investigation**: Review audit logs (who triggered, why)
3. **Root Cause**: Rate limiter bug? Malicious actor? Misconfiguration?
4. **Fix**: Deploy hotfix if rate limiter bug
5. **Notification**: Email CanLII support (explain situation, apologize)
6. **Reactivation**: Only after root cause fixed

### CanLII Terms Violation Notice

**Scenario**: CanLII emails us about terms violation

**Actions**:
1. **Immediate**: Kill switch activated
2. **Review**: Check audit logs for violation details
3. **Remediation**:
   - If text storage: Delete all stored text, update schema
   - If rate limit: Fix rate limiter, deploy hotfix
   - If other: Address specific issue
4. **Response**: Email CanLII support with remediation details
5. **Reactivation**: Only after CanLII approval

## Related Documents

- [PR-07: CanLII Hard Compliance Enforcement](../PR_07_CANLII_COMPLIANCE.md): Implementation details
- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Overall security architecture
- [RUNBOOK.md](./RUNBOOK.md): Operational procedures

---

**Document History**:
- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
