# Release Acceptance Gate

## Overview

The Release Acceptance Gate is an automated validation suite that ensures deployed applications meet production security and operational requirements before accepting a release. This gate acts as a final checkpoint before promoting code to production environments.

## Purpose

The release gate validates:

1. **Security Posture**: Runtime enforcement of security headers (CSP with nonce, correlation IDs)
2. **Operational Readiness**: Health and readiness endpoints respond correctly
3. **Infrastructure Correctness**: Headers are propagated correctly through redirects and middleware
4. **Compliance**: Security controls remain active and properly configured

## Components

### 1. Release Acceptance Script

**Location**: `scripts/release-acceptance.sh`

A bash script that performs comprehensive validation against a running application instance.

**Key Checks**:

- ✅ Base URL reachability
- ✅ Content-Security-Policy header present and contains `nonce-`
- ✅ `x-nonce` header present on all routes
- ✅ `x-correlation-id` header present on all routes
- ✅ Security headers persist through redirects
- ✅ `/api/healthz` returns 200 (liveness)
- ✅ `/api/readyz` returns 200 or 503 (readiness)
- ✅ Health endpoints return valid JSON with required fields
- ⚠️ CSP nonce is applied to inline scripts/styles in HTML (warning only)

### 2. CI Workflow

**Location**: `.github/workflows/release-acceptance.yml`

Automated CI job that:

1. Builds the application
2. Starts a production server locally
3. Runs the release acceptance script
4. Reports results

**Triggers**:

- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch (with configurable base URL)

## Usage

### Local Development

Run against local dev server:

```bash
# Start your development server
npm run dev

# Run the release gate in another terminal
export BASE_URL=http://localhost:3000
./scripts/release-acceptance.sh
```

Run against production build locally:

```bash
# Build and start production server
npm run build
npm run start

# Run the release gate
export BASE_URL=http://localhost:3000
./scripts/release-acceptance.sh
```

### Staging/Production Validation

Validate a deployed environment:

```bash
export BASE_URL=https://your-app-staging.azurewebsites.net
./scripts/release-acceptance.sh
```

With verbose output:

```bash
export BASE_URL=https://your-app.com
export VERBOSE=true
./scripts/release-acceptance.sh
```

### CI/CD Integration

The workflow runs automatically on pushes and PRs. To run manually:

1. Go to Actions → Release Acceptance Gate
2. Click "Run workflow"
3. Optionally specify a custom base URL
4. View results

## Exit Codes

- `0` - All checks passed (or passed with warnings)
- `1` - One or more critical checks failed

## Configuration

Environment variables:

| Variable   | Description                | Default                 |
| ---------- | -------------------------- | ----------------------- |
| `BASE_URL` | Application URL to test    | `http://localhost:3000` |
| `TIMEOUT`  | Request timeout in seconds | `10`                    |
| `VERBOSE`  | Show detailed output       | `false`                 |

## What Gets Validated

### Security Headers (Critical)

| Header                    | Route           | Requirement           |
| ------------------------- | --------------- | --------------------- |
| `Content-Security-Policy` | All HTML routes | Must contain `nonce-` |
| `x-nonce`                 | All routes      | Must be present       |
| `x-correlation-id`        | All routes      | Must be present       |

These headers are validated on:

- Homepage (`/`)
- Redirects (e.g., `/team` → `/pricing`)

### Health Endpoints (Critical)

#### Liveness - `/api/healthz`

**Purpose**: Container orchestrator liveness probe

**Requirements**:

- ✅ Returns HTTP 200
- ✅ JSON response with `status` field
- ✅ JSON response with `timestamp` field
- ✅ Response time < 100ms

**Sample Response**:

```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "uptime": 42.5,
  "service": "abr-insights-app"
}
```

#### Readiness - `/api/readyz`

**Purpose**: Container orchestrator readiness probe

**Requirements**:

- ✅ Returns HTTP 200 (ready) or 503 (not ready)
- ✅ JSON response with `status` field
- ✅ JSON response with `checks` array
- ✅ Response time < 2000ms

**Sample Response (Ready)**:

```json
{
  "status": "ready",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "checks": [
    {
      "name": "database",
      "status": "healthy",
      "duration_ms": 45
    },
    {
      "name": "environment",
      "status": "healthy"
    }
  ]
}
```

**Sample Response (Not Ready)**:

```json
{
  "status": "not_ready",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "checks": [
    {
      "name": "database",
      "status": "unhealthy",
      "message": "Connection timeout",
      "duration_ms": 2000
    }
  ]
}
```

## Integration with Deployment

### Azure Container Apps

Add a deployment gate in your Azure Pipelines:

```yaml
- task: Bash@3
  displayName: 'Release Acceptance Gate'
  inputs:
    targetType: 'inline'
    script: |
      export BASE_URL=https://$(CONTAINER_APP_URL)
      ./scripts/release-acceptance.sh
  continueOnError: false
```

### GitHub Actions Deployment

```yaml
- name: Validate deployment
  run: |
    export BASE_URL=https://${{ steps.deploy.outputs.url }}
    ./scripts/release-acceptance.sh
```

## Troubleshooting

### Base URL Not Reachable

**Symptom**: "Base URL is not reachable"

**Causes**:

- Application not started
- Firewall blocking requests
- Wrong URL/port

**Resolution**:

```bash
# Verify server is running
curl -I http://localhost:3000

# Check if port is open
netstat -an | grep 3000  # Linux/Mac
netstat -an | findstr 3000  # Windows
```

### Missing Security Headers

**Symptom**: "Header 'Content-Security-Policy' MISSING"

**Causes**:

- Middleware not applied
- Route bypassing middleware
- CSP disabled in configuration

**Resolution**:

1. Check `middleware.ts` is present
2. Verify route matches middleware `config.matcher`
3. Check no middleware exclusions for the route

### CSP Nonce Not in HTML

**Symptom**: "CSP nonce in header but not found in HTML"

**Causes**:

- Static page without inline scripts
- Nonce not passed to components
- Edge case in Next.js rendering

**Resolution**:

- This is a warning, not a failure
- Verify pages with inline scripts have `nonce={nonce}`
- Review `layout.tsx` and `page.tsx` components

### Readiness Returns 503

**Symptom**: "Readiness endpoint /api/readyz - Status 503"

**Causes**:

- Database not accessible
- Environment variables not configured
- Dependencies not ready

**Resolution**:

1. Check environment variables are set
2. Verify database connectivity
3. Review `/api/readyz` response JSON for specific check failures

## Maintenance

### Adding New Checks

To add a new check to the release gate:

1. Add a new function in `scripts/release-acceptance.sh`:

   ```bash
   check_new_feature() {
     log_info "Checking new feature..."
     assert_status "$BASE_URL/api/new-endpoint" "200" "New endpoint"
     log_info "New feature validation complete"
   }
   ```

2. Call it from `main()`:

   ```bash
   check_security_headers
   check_health_endpoints
   check_new_feature  # Add here
   ```

3. Update this documentation

### Updating Timeout Values

Adjust timeouts based on your application:

```bash
# Increase timeout for slow environments
export TIMEOUT=30
./scripts/release-acceptance.sh
```

## References

- [Middleware Implementation](../middleware.ts)
- [Health Check Endpoints](./PR_04_CONTAINER_HEALTH.md)
- [CSP Runtime Enforcement](../docs/production-readiness/PR_01_CSP_RUNTIME_ENFORCEMENT.md)
- [Production Security](../docs/security/production-hardening.md)

## Change Log

| Date       | Version | Changes                                        |
| ---------- | ------- | ---------------------------------------------- |
| 2026-02-04 | 1.0.0   | Initial release acceptance gate implementation |
