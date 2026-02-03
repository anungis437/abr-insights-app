# PR-07: CanLII Hard Compliance Enforcement

**Status**: ✅ COMPLETE  
**Commit**: TBD (after this commit)  
**Date**: February 3, 2026

## Overview

Implemented strict CanLII API compliance with global rate limiting, ingestion tracking, and hard enforcement. Includes kill switch for emergency shutoff and explicitly excludes document text storage to comply with CanLII terms of use.

## Objectives

- ✅ Global rate limiter (2 req/sec, 1 concurrent, 5000/day)
- ✅ Fail-closed enforcement (blocks on errors/limits)
- ✅ Redis token bucket algorithm
- ✅ Kill switch (CANLII_INGESTION_ENABLED env var)
- ✅ Ingestion run tracking (metrics, audit logs)
- ✅ NO text/content fields in schema or types
- ✅ Super admin only access to compliance data
- ✅ Structured logging throughout

## CanLII Terms Compliance

**Critical Requirements**:

1. **Rate Limits**: 2 requests/second, 1 concurrent, 5000/day
2. **No Text Storage**: Only metadata (title, citation, URL), NO document content
3. **Fail-Closed**: Block requests when limits exceeded (strict compliance)
4. **Kill Switch**: Emergency shutoff capability

## Implementation

### 1. Rate Limiter (`lib/services/canlii-rate-limiter.ts`)

Global rate limiter using Redis token bucket algorithm.

**Rate Limits**:

- **Requests per second**: 2 (burst capacity)
- **Concurrent requests**: 1 (no parallel calls)
- **Daily limit**: 5000 requests/day

**Redis Keys**:

- `canlii:tokens`: Token bucket (refills at 2/sec)
- `canlii:concurrent`: Concurrent request counter
- `canlii:daily_count`: Daily request count (resets at midnight)
- `canlii:daily_reset`: Timestamp of next reset

**Token Bucket Algorithm**:

```typescript
tokens = min(MAX_TOKENS, currentTokens + elapsed * REFILL_RATE)
if (tokens >= 1) {
  tokens -= 1
  // Allow request
} else {
  retryAfter = ceil((1 - tokens) / REFILL_RATE)
  // Block request
}
```

**Core Functions**:

#### `checkLimit()`

Pre-flight check (does not consume token).

**Checks**:

1. Daily limit (5000/day) - fastest check first
2. Concurrent limit (1) - prevents parallel requests
3. Token bucket (2/sec) - burst control

**Returns**: `{ allowed, reason, retryAfter, currentTokens, dailyUsed, dailyLimit }`

#### `acquireLimit()`

Reserve rate limit before request.

**Actions**:

1. Check all limits
2. Consume 1 token
3. Increment concurrent counter
4. Increment daily counter

Must call `releaseLimit()` after request completes.

#### `releaseLimit()`

Release rate limit after request.

**Actions**:

1. Decrement concurrent counter

#### `getStats()`

Get current rate limit state.

**Returns**:

```typescript
{
  currentTokens: 1.5,
  concurrentRequests: 0,
  dailyUsed: 245,
  dailyLimit: 5000,
  dailyResetAt: "2026-02-04T00:00:00Z"
}
```

**Fail-Closed Behavior**:

- Redis unavailable → Block request
- Rate limit exceeded → Block request
- Check error → Block request
- **NEVER fail open** (strict compliance)

**Helper Function**: `withCanLIIRateLimit()`

```typescript
const result = await withCanLIIRateLimit(async () => {
  return fetch('https://api.canlii.org/...')
})
// Automatically acquires and releases limit
```

### 2. Tracking Schema (`supabase/migrations/20260203_canlii_ingestion_tracking.sql`)

**Tables Created**:

#### `canlii_ingestion_runs`

Tracks ingestion lifecycle and metrics.

**Key Columns**:

- `status`: running, completed, failed, rate_limited, killed
- **Request metrics**: `total_requests`, `successful_requests`, `failed_requests`, `rate_limited_requests`
- **Timing metrics**: `min_request_duration_ms`, `max_request_duration_ms`, `avg_request_duration_ms`
- **Data metrics**: `cases_fetched`, `cases_created`, `cases_updated`, `cases_skipped`
- **Compliance flags**: `exceeded_daily_limit`, `exceeded_rate_limit`, `kill_switch_active`

#### `canlii_api_requests`

Detailed log of individual API requests.

**Columns**:

- Request: `endpoint`, `case_id`, `method`
- Rate limit state: `tokens_available`, `concurrent_requests`, `daily_requests_used`
- Response: `status_code`, `response_time_ms`, `success`, `rate_limited`
- Retry: `retry_count`, `retry_after_seconds`

#### `canlii_daily_quotas`

Daily aggregated metrics.

**Columns**:

- Usage: `total_requests`, `successful_requests`, `failed_requests`, `rate_limited_requests`
- Limits: `daily_limit` (5000), `limit_exceeded`, `limit_exceeded_at`
- Peak: `peak_concurrent`, `peak_requests_per_second`

**Database Functions**:

1. **`get_canlii_daily_quota()`**: Returns current daily usage
2. **`record_canlii_request(run_id, endpoint, case_id, status, ...)`**: Records request and updates quotas
3. **`update_ingestion_run_status(run_id, status, error)`**: Updates run status

**RLS Policies**:

- Super admins: View all compliance data
- Regular users: No access (compliance data is sensitive)

### 3. Ingestion Service (`lib/services/canlii-ingestion.ts`)

Orchestrates CanLII ingestion with compliance enforcement.

**Kill Switch**:

- Environment variable: `CANLII_INGESTION_ENABLED`
- Default: `true` (if API key present)
- Checked: Before run start, before each request
- Effect: Immediate stop, status set to 'killed'

**Type Compliance** (NO TEXT FIELDS):

```typescript
interface CanLIICaseMetadata {
  caseId: string
  databaseId: string
  jurisdiction: string
  court: string
  decisionDate: string
  title?: string
  citation?: string
  url?: string
  judges?: string[]
  keywords?: string[]
  language?: string
  // EXPLICITLY EXCLUDED:
  // NO: content, text, body, full_text, document, html
}
```

**Core Functions**:

#### `startIngestion(options)`

Start ingestion run.

**Checks**:

1. Kill switch active?
2. API key configured?

**Creates**: `canlii_ingestion_runs` record

**Returns**: `IngestionRunResult` (async processing)

#### `executeIngestion(runId, options)`

Execute ingestion (internal).

**Flow**:

1. Get case IDs (from options or API)
2. For each case (sequential):
   - Check kill switch
   - Fetch metadata (rate-limited)
   - Store metadata (NO TEXT)
   - Record request
   - Update metrics
3. Handle rate limit exceeded → stop with status 'rate_limited'
4. Handle kill switch → stop with status 'killed'

#### `fetchCaseMetadata(runId, caseId)`

Fetch case from CanLII (rate-limited).

**Process**:

1. Call `withCanLIIRateLimit()` → acquires limit
2. Fetch from `/caseBrowse/{caseId}`
3. Record request (success/failure)
4. Extract metadata only (NO TEXT)
5. Release limit (automatic)

#### `storeCaseMetadata(caseData)`

Store case metadata (NO TEXT FIELDS).

**Returns**: 'created' | 'updated' | 'skipped'

**Database Operations**:

```typescript
// Insert/Update - NO TEXT FIELDS
{
  ;(case_id,
    database_id,
    jurisdiction,
    court,
    decision_date,
    title,
    citation,
    url,
    judges,
    keywords,
    language)
  // NO: content, text, body, document, html
}
```

### 4. CI Workflow (`.github/workflows/canlii-compliance.yml`)

**Jobs**:

1. **Validate Rate Limiter**:
   - Rate limit constants (2, 1, 5000)
   - Token bucket implementation
   - Fail-closed behavior
   - Required functions present
   - Structured logging

2. **Validate Tracking Schema**:
   - Migration file exists
   - 3 tables defined
   - Required columns present
   - 3 database functions
   - RLS policies configured

3. **Validate Ingestion Service**:
   - Kill switch (CANLII_INGESTION_ENABLED)
   - Rate limiter integration
   - NO text fields in types
   - Tracking integration
   - Core functions present

4. **Validate NO Text Storage**:
   - NO text columns in schema
   - Explicit exclusion comments
   - NO text field assignments
   - Compliance documented

## Usage Patterns

### Pattern 1: Start Ingestion

```typescript
import { canliiIngestion } from '@/lib/services/canlii-ingestion'

// Start ingestion for specific cases
const result = await canliiIngestion.startIngestion({
  caseIds: ['2024onca123', '2024onca456'],
  triggeredBy: userId,
  triggerSource: 'manual',
})

console.log(`Run ID: ${result.runId}`)
console.log(`Status: ${result.status}`)
console.log(`Cases fetched: ${result.casesFetched}`)
```

### Pattern 2: Check Rate Limit Status

```typescript
import { canliiRateLimiter } from '@/lib/services/canlii-rate-limiter'

// Check if request would be allowed
const check = await canliiRateLimiter.checkLimit()

if (!check.allowed) {
  console.log(`Blocked: ${check.reason}`)
  console.log(`Retry after: ${check.retryAfter} seconds`)
  console.log(`Daily used: ${check.dailyUsed}/${check.dailyLimit}`)
}
```

### Pattern 3: Get Ingestion Stats

```typescript
// Get current stats
const stats = await canliiIngestion.getStats()

console.log('Daily Quota:', stats.dailyQuota)
// {
//   date: '2026-02-03',
//   total_requests: 245,
//   daily_limit: 5000,
//   remaining_requests: 4755,
//   limit_exceeded: false
// }

console.log('Rate Limiter:', stats.rateLimiter)
// {
//   currentTokens: 1.5,
//   concurrentRequests: 0,
//   dailyUsed: 245,
//   dailyLimit: 5000,
//   dailyResetAt: '2026-02-04T00:00:00Z'
// }
```

### Pattern 4: Manual Rate Limiting

```typescript
import { withCanLIIRateLimit } from '@/lib/services/canlii-rate-limiter'

// Wrap any CanLII API call
try {
  const response = await withCanLIIRateLimit(async () => {
    return fetch('https://api.canlii.org/v1/caseBrowse/...')
  })

  const data = await response.json()
  // Process data
} catch (error) {
  // Rate limit exceeded or other error
  console.error(error.message) // "CanLII rate limit exceeded"
}
```

### Pattern 5: Emergency Kill Switch

```bash
# Disable all ingestion immediately
export CANLII_INGESTION_ENABLED=false

# Or in .env
CANLII_INGESTION_ENABLED=false

# Re-enable
export CANLII_INGESTION_ENABLED=true
```

## Rate Limit States

### Normal Operation

```
Tokens: 2.0/2.0
Concurrent: 0/1
Daily: 245/5000
Status: ✅ Accepting requests
```

### Burst Depleted

```
Tokens: 0.5/2.0
Concurrent: 0/1
Daily: 248/5000
Status: ⏳ Retry after 0.25 seconds
```

### Concurrent Exceeded

```
Tokens: 1.5/2.0
Concurrent: 1/1
Daily: 250/5000
Status: ⏳ Retry after 1 second (concurrent limit)
```

### Daily Limit Exceeded

```
Tokens: 2.0/2.0
Concurrent: 0/1
Daily: 5000/5000
Status: 🚫 Blocked until midnight (18 hours)
```

## Error Codes

| Code                                                            | Description                 | Action                           |
| --------------------------------------------------------------- | --------------------------- | -------------------------------- |
| `Rate limiter unavailable`                                      | Redis disconnected          | Block all requests (fail-closed) |
| `Daily limit exceeded (5000 requests/day)`                      | Hit daily quota             | Block until midnight             |
| `Concurrent request limit exceeded (max 1)`                     | Already 1 request in flight | Retry after 1 second             |
| `Rate limit exceeded (2 requests/second)`                       | Token bucket depleted       | Retry after calculated delay     |
| `CanLII ingestion is disabled (CANLII_INGESTION_ENABLED=false)` | Kill switch active          | Admin must re-enable             |

## Benefits

### Compliance

1. **CanLII Terms**: Strict adherence to rate limits and content restrictions
2. **Audit Trail**: All requests logged with rate limit state
3. **Fail-Closed**: Never exceeds limits (blocks on errors)
4. **Kill Switch**: Emergency shutoff capability

### Operational

1. **Token Bucket**: Smooth rate limiting with burst capacity
2. **Concurrent Control**: Only 1 request at a time
3. **Daily Quota**: Hard stop at 5000 requests
4. **Tracking**: Comprehensive metrics and logs

### Developer

1. **Simple API**: `withCanLIIRateLimit()` wrapper
2. **Automatic**: Acquire and release handled
3. **Observable**: Real-time stats available
4. **Type-Safe**: NO text fields in types (compiler-enforced)

## Testing

### Manual Testing

1. **Test Rate Limiter (Normal)**:

   ```typescript
   const check = await canliiRateLimiter.checkLimit()
   expect(check.allowed).toBe(true)
   ```

2. **Test Rate Limiter (Burst Depleted)**:

   ```typescript
   // Make 3 rapid requests
   await canliiRateLimiter.acquireLimit()
   await canliiRateLimiter.releaseLimit()

   await canliiRateLimiter.acquireLimit()
   await canliiRateLimiter.releaseLimit()

   const check = await canliiRateLimiter.acquireLimit()
   expect(check.allowed).toBe(false)
   expect(check.reason).toContain('Rate limit exceeded')
   ```

3. **Test Kill Switch**:

   ```bash
   export CANLII_INGESTION_ENABLED=false

   # Try to start ingestion
   await canliiIngestion.startIngestion()
   # Expected: Error "CanLII ingestion is disabled"
   ```

4. **Test NO Text Storage**:

   ```typescript
   // Verify types don't include text fields
   const metadata: CanLIICaseMetadata = {
     caseId: '2024onca123',
     // @ts-expect-error - content field should not exist
     content: 'some text',
   }
   // Expected: TypeScript error
   ```

### CI Testing

1. ✅ Rate limit constants (2, 1, 5000)
2. ✅ Token bucket algorithm
3. ✅ Fail-closed behavior
4. ✅ Kill switch (CANLII_INGESTION_ENABLED)
5. ✅ 3 tracking tables
6. ✅ 3 database functions
7. ✅ RLS policies
8. ✅ NO text fields in types
9. ✅ NO text columns in schema
10. ✅ NO text storage operations
11. ✅ Structured logging

## Acceptance Criteria

- ✅ Rate limiter with 2 req/sec, 1 concurrent, 5000/day
- ✅ Redis token bucket algorithm
- ✅ Fail-closed enforcement (blocks on errors)
- ✅ Kill switch (CANLII_INGESTION_ENABLED)
- ✅ Tracking schema (3 tables, 3 functions)
- ✅ Ingestion service with rate limiting
- ✅ NO text/content fields in types
- ✅ NO text/content columns in schema
- ✅ NO text/content storage
- ✅ Super admin only access to compliance data
- ✅ Structured logging throughout
- ✅ CI workflow validates all compliance rules

## Migration Guide

### 1. Apply Database Migration

```bash
supabase db push

# Or manually
psql $DATABASE_URL -f supabase/migrations/20260203_canlii_ingestion_tracking.sql
```

### 2. Configure Redis

```bash
# .env.local
REDIS_URL=redis://localhost:6379
# Or use cloud Redis (Azure, AWS, etc.)
```

### 3. Configure CanLII API

```bash
# .env.local
CANLII_API_KEY=your_api_key_here
CANLII_INGESTION_ENABLED=true  # Optional, defaults to true
```

### 4. Install Redis Client

```bash
npm install redis
```

### 5. Test Rate Limiter

```typescript
import { canliiRateLimiter } from '@/lib/services/canlii-rate-limiter'

const stats = await canliiRateLimiter.getStats()
console.log(stats) // Should return current state
```

## Environment Variables

| Variable                   | Required | Default | Description               |
| -------------------------- | -------- | ------- | ------------------------- |
| `REDIS_URL`                | Yes      | -       | Redis connection URL      |
| `CANLII_API_KEY`           | Yes      | -       | CanLII API key            |
| `CANLII_INGESTION_ENABLED` | No       | `true`  | Kill switch for ingestion |

## Future Enhancements

1. **Automatic Retry**: Exponential backoff on rate limit errors
2. **Priority Queue**: Prioritize certain case types
3. **Batch Optimization**: Group requests efficiently
4. **Webhooks**: Real-time updates from CanLII
5. **Admin UI**: Dashboard for compliance monitoring

## Related Documentation

- [PR-06: Data Lifecycle](./PR_06_DATA_LIFECYCLE.md)
- [CanLII Terms of Use](https://www.canlii.org/en/info/terms.html)
- [Redis Rate Limiting](https://redis.io/docs/manual/patterns/rate-limiter/)

## Deployment Notes

- **Database Migration Required**: Apply 20260203_canlii_ingestion_tracking.sql
- **Redis Required**: Must have Redis instance
- **Environment Variables**: REDIS_URL, CANLII_API_KEY
- **Kill Switch**: Set CANLII_INGESTION_ENABLED=false to disable
- **CI Required**: Must pass canlii-compliance.yml workflow

---

**PR-07 COMPLETE** ✅  
Next: [PR-08: Procurement & Compliance Pack (FINAL)](./PR_08_COMPLIANCE_PACK.md)
