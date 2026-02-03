# PR-04: Container Health, Readiness & Metrics

**Status**: ✅ COMPLETE  
**Commit**: TBD (after this commit)  
**Date**: February 3, 2026

## Overview

Implemented production-grade health check endpoints for container orchestration (Azure Container Apps, Kubernetes) with comprehensive environment validation and database connectivity checks. These endpoints enable proper lifecycle management, zero-downtime deployments, and automated failure recovery.

## Objectives

- ✅ Create `/api/healthz` endpoint (liveness probe)
- ✅ Create `/api/readyz` endpoint (readiness probe)
- ✅ Implement environment variable validation
- ✅ Implement database connectivity checks
- ✅ Add CI workflow to validate health endpoints
- ✅ Document health check contracts
- ✅ Enable Azure Container Apps health probes

## Implementation

### 1. Liveness Endpoint (`/api/healthz`)

**Purpose**: Determines if the container process is alive and should be restarted.

**Contract**:

- Always returns 200 if process is running
- No dependency checks (DB, Redis, etc.)
- Minimal computation (< 1ms target)
- Never throws exceptions
- No caching

**Response Format**:

```json
{
  "status": "ok",
  "timestamp": "2026-02-03T10:30:45.123Z",
  "uptime": 12345.67,
  "service": "abr-insights-app"
}
```

**Azure Container Apps Configuration**:

```yaml
livenessProbe:
  httpGet:
    path: /api/healthz
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 1
  failureThreshold: 3
```

**Behavior**:

- Returns 200 immediately (process alive)
- Container restarted after 3 consecutive failures
- 10-second delay before first check
- Checked every 10 seconds

### 2. Readiness Endpoint (`/api/readyz`)

**Purpose**: Determines if the container is ready to accept traffic.

**Contract**:

- Returns 200 if all dependencies are healthy
- Returns 503 if any critical dependency is unavailable
- Performs dependency checks (DB, env vars)
- Response time target: < 500ms
- Handles errors gracefully (never crashes)
- No caching

**Checks Performed**:

1. **Environment Validation** (synchronous):
   - Validates required environment variables present
   - Validates format (URLs, secret lengths)
   - Returns warnings for missing optional vars

2. **Database Connectivity** (async):
   - Tests Supabase connection
   - Executes simple query
   - Handles schema not initialized (warning)
   - Returns unhealthy if connection fails

**Response Format (Ready)**:

```json
{
  "status": "ready",
  "timestamp": "2026-02-03T10:30:45.123Z",
  "checks": [
    {
      "name": "environment",
      "status": "healthy",
      "message": "All required variables configured"
    },
    {
      "name": "database",
      "status": "healthy",
      "message": "Connected",
      "duration_ms": 45
    }
  ],
  "environment": {
    "node_version": "v20.10.0",
    "node_env": "production",
    "platform": "linux",
    "arch": "x64",
    "uptime": 12345.67,
    "memory": {
      "total": 512,
      "used": 256,
      "external": 32
    },
    "has_supabase_url": true,
    "has_supabase_key": true,
    "has_service_role": true,
    "has_nextauth_secret": true,
    "has_nextauth_url": true
  }
}
```

**Response Format (Not Ready)**:

```json
{
  "status": "not_ready",
  "timestamp": "2026-02-03T10:30:45.123Z",
  "checks": [
    {
      "name": "environment",
      "status": "unhealthy",
      "message": "Required environment variables missing or invalid",
      "details": {
        "missing": ["NEXTAUTH_SECRET"],
        "invalid": ["NEXTAUTH_URL (invalid URL format)"]
      }
    },
    {
      "name": "database",
      "status": "unhealthy",
      "message": "Connection timeout",
      "duration_ms": 2000,
      "details": {
        "error_code": "ETIMEDOUT"
      }
    }
  ],
  "environment": { ... }
}
```

**Azure Container Apps Configuration**:

```yaml
readinessProbe:
  httpGet:
    path: /api/readyz
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 2
  successThreshold: 1
  failureThreshold: 3
```

**Behavior**:

- Traffic routed after first successful check
- No traffic sent if check fails 3 times
- 5-second delay before first check
- Checked every 5 seconds
- 2-second timeout per check

### 3. Environment Validator (`lib/utils/env-validator.ts`)

**Purpose**: Validates environment configuration for application readiness.

**Features**:

1. **Required Variables** (fail if missing):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

2. **Validation Rules**:
   - URL format validation (Supabase URL, NextAuth URL)
   - Secret length validation (NEXTAUTH_SECRET >= 32 chars)
   - Value presence checks

3. **Recommended Variables** (warn if missing):
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `AZURE_OPENAI_API_KEY`

**API**:

```typescript
interface EnvValidationResult {
  valid: boolean
  missing: string[]
  invalid: string[]
  warnings: string[]
}

function validateEnvironment(): EnvValidationResult
function getEnvironmentInfo(): EnvironmentInfo
```

**Usage**:

```typescript
import { validateEnvironment } from '@/lib/utils/env-validator'

const validation = validateEnvironment()

if (!validation.valid) {
  console.error('Missing variables:', validation.missing)
  console.error('Invalid variables:', validation.invalid)
}

if (validation.warnings.length > 0) {
  console.warn('Optional variables:', validation.warnings)
}
```

### 4. CI Workflow (`health-checks.yml`)

**Purpose**: Validates health endpoints in CI pipeline.

**Jobs**:

1. **Endpoint Validation**:
   - Checks files exist
   - Validates contracts (dynamic routing, GET handler)
   - Validates required checks (DB, env)

2. **Build & Start**:
   - Builds application
   - Starts server on port 3000
   - Waits for startup (max 60 seconds)

3. **Endpoint Testing**:
   - Tests `/api/healthz` returns 200
   - Tests `/api/readyz` returns 200 or 503
   - Validates response structure
   - Checks required fields present

4. **Performance Testing**:
   - `/api/healthz` must respond < 100ms
   - `/api/readyz` must respond < 2000ms
   - Warns if targets not met

5. **Code Quality**:
   - Validates no console.log in health endpoints
   - Ensures structured logging used

**Triggers**:

- Push to main/develop
- Pull requests to main/develop
- Manual workflow dispatch

## Health Check Decision Tree

```
Container Start
    ↓
Wait initialDelaySeconds (liveness: 10s, readiness: 5s)
    ↓
┌─────────────────────────────────────┐
│   Liveness Check (/api/healthz)    │
│   - Is process alive?               │
│   - Always returns 200              │
└─────────────────────────────────────┘
    ↓
  200 OK? ──NO (3 times)──> Restart Container
    ↓ YES
┌─────────────────────────────────────┐
│   Readiness Check (/api/readyz)    │
│   1. Environment validation         │
│   2. Database connectivity          │
└─────────────────────────────────────┘
    ↓
  200 OK? ──NO (3 times)──> Remove from Load Balancer
    ↓ YES
  Route Traffic to Container
    ↓
  Continue checking every periodSeconds
```

## Zero-Downtime Deployment Flow

1. **New Container Starts**:
   - Liveness check: Wait 10s, then check every 10s
   - Readiness check: Wait 5s, then check every 5s

2. **Readiness Fails Initially** (503):
   - DB not connected yet
   - Environment not loaded
   - No traffic sent to new container

3. **Readiness Succeeds** (200):
   - All checks pass
   - Traffic starts routing to new container
   - Old container receives termination signal

4. **Old Container Drains**:
   - Stops accepting new connections
   - Completes in-flight requests (30s grace period)
   - Shuts down gracefully

5. **Traffic Cutover Complete**:
   - All traffic now on new container
   - Old container terminated
   - Zero downtime achieved

## Testing

### Manual Testing

1. **Test Liveness Endpoint**:

   ```bash
   curl http://localhost:3000/api/healthz
   # Expected: 200 OK, {"status": "ok", ...}
   ```

2. **Test Readiness Endpoint (All Healthy)**:

   ```bash
   curl http://localhost:3000/api/readyz
   # Expected: 200 OK, {"status": "ready", "checks": [...]}
   ```

3. **Test Readiness Endpoint (Missing Env)**:

   ```bash
   unset NEXTAUTH_SECRET
   curl http://localhost:3000/api/readyz
   # Expected: 503 Service Unavailable, {"status": "not_ready", ...}
   ```

4. **Test Readiness Endpoint (DB Down)**:

   ```bash
   # Stop Supabase or set invalid URL
   curl http://localhost:3000/api/readyz
   # Expected: 503 Service Unavailable, database check unhealthy
   ```

### CI Testing

1. ✅ Build application with health endpoints
2. ✅ Start server and wait for readiness
3. ✅ Test `/api/healthz` returns 200
4. ✅ Test `/api/readyz` returns 200 or 503
5. ✅ Validate response structure
6. ✅ Check performance targets
7. ✅ Validate no console.log usage

## Azure Container Apps Integration

### 1. Update Container Configuration

Add to `staticwebapp.config.json` or Azure portal:

```json
{
  "platform": {
    "apiRuntime": "node:20"
  },
  "healthCheck": {
    "path": "/api/healthz",
    "interval": 10,
    "timeout": 1,
    "unhealthyThreshold": 3
  }
}
```

### 2. Configure via Azure CLI

```bash
# Update Container App with health probes
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --set-env-vars \
    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
    SUPABASE_SERVICE_ROLE_KEY=xxx \
    NEXTAUTH_SECRET=xxx \
    NEXTAUTH_URL=https://abrinsights.ca

# Configure liveness probe
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --liveness-probe \
    type=http \
    path=/api/healthz \
    port=3000 \
    initial-delay-seconds=10 \
    period-seconds=10 \
    timeout-seconds=1 \
    failure-threshold=3

# Configure readiness probe
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --readiness-probe \
    type=http \
    path=/api/readyz \
    port=3000 \
    initial-delay-seconds=5 \
    period-seconds=5 \
    timeout-seconds=2 \
    failure-threshold=3
```

### 3. Verify Configuration

```bash
# Check health probe status
az containerapp show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --query "properties.template.containers[0].probes"

# Monitor health check results
az containerapp logs show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --follow
```

## Monitoring & Alerting

### Application Insights Integration

```typescript
// lib/observability/health-metrics.ts
import { logger } from '@/lib/utils/production-logger'

export function trackHealthCheck(
  checkType: 'liveness' | 'readiness',
  status: number,
  duration: number
) {
  logger.info('Health check completed', {
    check_type: checkType,
    status_code: status,
    duration_ms: duration,
    success: status === 200,
  })
}
```

### Recommended Alerts

1. **Liveness Failures**:
   - Alert if > 3 consecutive failures
   - Indicates container crash loop
   - Action: Investigate logs, rollback if needed

2. **Readiness Failures**:
   - Alert if > 5 consecutive failures
   - Indicates dependency issues (DB, env)
   - Action: Check database, environment config

3. **Performance Degradation**:
   - Alert if `/api/healthz` > 100ms
   - Alert if `/api/readyz` > 1000ms
   - Indicates resource contention
   - Action: Scale up, investigate bottlenecks

## Benefits

### Operational Benefits

1. **Zero-Downtime Deployments**:
   - Traffic only routed when ready
   - Old containers drain gracefully
   - No dropped requests

2. **Automated Failure Recovery**:
   - Crashed containers auto-restarted
   - Unhealthy containers removed from pool
   - No manual intervention required

3. **Better Observability**:
   - Real-time health status
   - Dependency checks visible
   - Performance metrics tracked

### Developer Benefits

1. **Fast Feedback**:
   - CI validates health endpoints
   - Catches configuration issues early
   - No production surprises

2. **Clear Contracts**:
   - Documented probe behavior
   - Explicit dependency checks
   - Testable in local environment

3. **Debugging Support**:
   - Detailed error information
   - Environment snapshot included
   - Performance timings visible

## Acceptance Criteria

- ✅ `/api/healthz` endpoint created (liveness probe)
- ✅ `/api/readyz` endpoint created (readiness probe)
- ✅ Environment validator implemented
- ✅ Database connectivity check implemented
- ✅ CI workflow validates health endpoints
- ✅ Performance targets documented (< 100ms liveness, < 500ms readiness)
- ✅ Azure Container Apps configuration documented
- ✅ Zero-downtime deployment flow documented
- ✅ No console.log in health endpoints (uses structured logging)
- ✅ Fail-closed behavior (returns 503 on error, never crashes)

## Next Steps (Post-PR-04)

1. **Application Insights Integration**: Track health check metrics
2. **Custom Metrics**: Add business-specific health checks
3. **Startup Probes**: Add startup probe for slow-starting containers
4. **Graceful Shutdown**: Implement SIGTERM handler for clean shutdowns
5. **Health Dashboard**: Create monitoring dashboard for health status

## Related Documentation

- [PR-03: Structured Logging](./PR_03_STRUCTURED_LOGGING.md)
- [Container Security Controls](./CONTAINER_SECURITY_CONTROLS.md)
- [Azure Container Apps Health Probes](https://learn.microsoft.com/azure/container-apps/health-probes)

## Deployment Notes

- **No Database Changes**: Only code changes
- **New Environment Variables**: None (validates existing vars)
- **Backward Compatible**: Health endpoints are additive
- **CI Required**: Must pass health-checks.yml workflow
- **Azure Configuration**: Update Container App after deployment

---

**PR-04 COMPLETE** ✅  
Next: [PR-05: AI Abuse & Cost Controls](./PR_05_AI_COST_CONTROLS.md)
