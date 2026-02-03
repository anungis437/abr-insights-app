# PR-01: Runtime Enforcement of Dynamic Nonce CSP

**Status**: ✅ Ready for Review  
**Date**: February 3, 2026  
**Author**: Staff Engineer  
**Priority**: P0 - Production Blocker

## Scope Summary

Ensure Content Security Policy (CSP) with dynamic nonces executes correctly in production container runtime on every HTTP request.

## Problem Statement

While CSP logic exists in `proxy.ts`, we need to:

1. Verify it executes in production container deployment
2. Ensure nonces are available to client-side if needed
3. Add automated validation for runtime enforcement
4. Document acceptance criteria for world-class compliance

## Implementation Details

### Architecture: Next.js 16 Proxy Pattern

**Critical Note**: Next.js 16 uses `proxy.ts` as the middleware entrypoint (NOT `middleware.ts`). Creating both files causes build error: "Both middleware file and proxy file are detected."

**Current Implementation** (Already Complete):

```typescript
// proxy.ts - Executes on every HTTP request
export default async function proxy(request: NextRequest) {
  // 1. Block _dev routes in production
  if (pathname.startsWith('/_dev') && process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 })
  }

  // 2. Generate cryptographic nonce per request
  const nonceBuffer = new Uint8Array(16)
  crypto.getRandomValues(nonceBuffer)
  const nonce = btoa(String.fromCharCode(...nonceBuffer))

  // 3. Build CSP header with nonce
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.stripe.com ...;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    ...
  `

  // 4. Inject security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  response.headers.set('x-correlation-id', correlationId)

  return response
}
```

**Client-Side Nonce Access** (Already Complete):

```tsx
// app/layout.tsx - Root layout
export default async function RootLayout({ children }) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') || undefined

  return (
    <html>
      <head>{/* Nonce available for inline scripts if needed */}</head>
      <body>{children}</body>
    </html>
  )
}
```

### Files Changed

1. **proxy.ts** - ✅ Already implemented (78 lines)
   - CSP nonce generation
   - Header injection
   - Route protection

2. **app/layout.tsx** - ✅ Already reads nonce (121 lines)
   - Retrieves x-nonce from headers
   - Makes available for future inline scripts

3. **scripts/validate-csp-headers.ps1** - ✅ Already exists (146 lines)
   - Automated validation script
   - Tests multiple routes
   - Verifies nonce uniqueness

4. **docs/CONTAINER_SECURITY_CONTROLS.md** - ✅ Already documented
   - Complete security architecture
   - Validation requirements
   - Runtime proof checklist

### New Files Added (This PR)

1. **scripts/validate-csp-runtime.sh** - Bash validation script
2. **docs/PR_01_CSP_RUNTIME_ENFORCEMENT.md** - This document
3. **.github/workflows/csp-validation.yml** - CI validation job

## Acceptance Criteria

### Automated Tests

- [x] `proxy.ts` exports default function
- [x] CSP header includes nonce placeholders
- [x] x-nonce header is set
- [x] No unsafe-inline or unsafe-eval in CSP
- [x] Matcher config excludes static assets
- [x] layout.tsx reads x-nonce header

### Manual Validation (Required Before Merge)

Run these commands against deployed container:

```bash
BASE_URL="https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io"

# 1. Check CSP header exists
curl -I $BASE_URL/ | grep -i "content-security-policy"

# 2. Check x-nonce header exists
curl -I $BASE_URL/ | grep -i "x-nonce"

# 3. Verify nonce changes per request
curl -I $BASE_URL/ | grep "x-nonce:" > nonce1.txt
curl -I $BASE_URL/ | grep "x-nonce:" > nonce2.txt
diff nonce1.txt nonce2.txt  # Should show different nonces

# 4. Verify no unsafe-inline
curl -I $BASE_URL/ | grep -i "content-security-policy" | grep -v "unsafe-inline"

# 5. Test _dev route protection (should 404)
curl -I $BASE_URL/_dev/test-checkout  # Expected: 404

# 6. Test Stripe integration (should work)
# Visit /pricing in browser, click "Subscribe" - Stripe modal should load
```

### PowerShell Validation (Windows)

```powershell
.\scripts\validate-csp-headers.ps1 -BaseUrl "https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io"
```

**Expected Output**:

```
✅ PASS: CSP header present
✅ PASS: x-nonce header present
✅ PASS: Nonce matches between CSP and x-nonce
✅ PASS: No unsafe-inline detected
✅ PASS: Nonces are unique per request (tested 3 times)
```

### Security Validation Checklist

- [ ] CSP header present on all HTML responses
- [ ] Nonce is 22+ characters (128-bit base64)
- [ ] Nonce differs on consecutive requests
- [ ] No `unsafe-inline` in script-src or style-src
- [ ] No `unsafe-eval` anywhere
- [ ] Stripe checkout still functions (external script-src allowed)
- [ ] Supabase auth still functions (connect-src allowed)
- [ ] Dev routes return 404 in production
- [ ] Correlation ID header present (x-correlation-id)

## Security Implications

### Before This PR

- Code existed but no runtime proof
- Could claim "CSP implemented" but not "CSP enforced"
- Enterprise reviewers would reject claims without evidence

### After This PR

- Runtime validation proves enforcement
- Can claim with evidence: "Dynamic nonce-based CSP on all responses"
- Automated CI checks prevent regression
- Dev routes blocked in production (reduces attack surface)

### Attack Vectors Mitigated

1. **XSS via inline scripts**: Blocked (no unsafe-inline)
2. **XSS via injected styles**: Blocked (nonce-based style-src)
3. **Eval-based attacks**: Blocked (no unsafe-eval)
4. **Dev route exploitation**: Blocked (404 in production)
5. **CSP bypass via static CSP**: Prevented (dynamic per request)

### Compliance Benefits

- **SOC 2**: Input validation + output encoding controls
- **ISO 27001**: Security headers documented and enforced
- **OWASP**: CSP Level 3 compliance (nonce-based)
- **Enterprise Procurement**: Can provide runtime header evidence

## Rollback Strategy

### If CSP Breaks Stripe/Supabase

```typescript
// proxy.ts - Temporarily disable CSP
export default async function proxy(request: NextRequest) {
  const response = await updateSession(request)
  // Comment out CSP logic
  // response.headers.set('Content-Security-Policy', cspHeader)
  return response
}
```

### If CSP Breaks Custom Scripts

1. Identify the script source domain
2. Add to `script-src` directive in proxy.ts
3. Redeploy container

### Emergency Rollback (Complete)

```bash
# Revert to previous container image
az containerapp revision list --name abr-insights-app --resource-group abr-insights-rg
az containerapp revision activate --revision <previous-revision-name> --resource-group abr-insights-rg
```

### Zero-Downtime Rollback

Azure Container Apps supports revision management:

- Old revision remains available
- Traffic can be split between revisions
- Instant rollback by shifting traffic weight

## Testing Strategy

### Local Development

```bash
# 1. Start dev server
npm run dev

# 2. Test CSP headers
curl -I http://localhost:3000/ | grep -i "content-security-policy"

# 3. Test nonce uniqueness
for i in {1..5}; do curl -I http://localhost:3000/ | grep "x-nonce"; done
```

### Staging Validation

```bash
# Run full validation suite
.\scripts\validate-csp-headers.ps1 -BaseUrl "https://staging-url"

# Expected: All checks pass
```

### Production Validation

```bash
# Post-deployment smoke test
.\scripts\validate-csp-headers.ps1 -BaseUrl "https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io"

# Additional manual checks
# 1. Visit /pricing - Stripe should work
# 2. Visit /dashboard - Supabase auth should work
# 3. Visit /_dev/test-checkout - Should 404
# 4. Check browser console - No CSP violations
```

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/csp-validation.yml`:

```yaml
name: CSP Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-csp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check proxy.ts exists
        run: test -f proxy.ts

      - name: Verify no unsafe-inline in CSP
        run: |
          if grep -r "unsafe-inline" proxy.ts; then
            echo "❌ FAIL: unsafe-inline found in CSP"
            exit 1
          fi
          echo "✅ PASS: No unsafe-inline"

      - name: Verify nonce generation
        run: |
          if grep -q "crypto.getRandomValues" proxy.ts; then
            echo "✅ PASS: Cryptographic nonce generation found"
          else
            echo "❌ FAIL: No nonce generation"
            exit 1
          fi

      - name: Check layout.tsx reads nonce
        run: |
          if grep -q "x-nonce" app/layout.tsx; then
            echo "✅ PASS: layout.tsx reads nonce"
          else
            echo "❌ FAIL: layout.tsx doesn't read nonce"
            exit 1
          fi
```

### Post-Deployment Validation

Add to deployment workflow:

```yaml
- name: Validate CSP Runtime
  run: |
    APP_URL="https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io"

    # Check CSP header
    RESPONSE=$(curl -sI $APP_URL/)
    if echo "$RESPONSE" | grep -qi "content-security-policy"; then
      echo "✅ CSP header present"
    else
      echo "❌ CSP header missing"
      exit 1
    fi

    # Check nonce header
    if echo "$RESPONSE" | grep -qi "x-nonce"; then
      echo "✅ x-nonce header present"
    else
      echo "❌ x-nonce header missing"
      exit 1
    fi
```

## Documentation Updates

### Updated Files

1. **CONTAINER_SECURITY_CONTROLS.md** - Already complete
   - Layer 1: Application Runtime (proxy.ts)
   - CSP enforcement documented
   - Validation requirements listed

2. **CSP_VALIDATION_PROOF.md** - Already updated
   - Runtime validation checklist
   - Header capture instructions
   - Enterprise questionnaire evidence

3. **CSP_HARDENING_ROADMAP.md** - Already updated
   - Container deployment status
   - Nonce generation details
   - No unsafe-inline achievement

### New Documentation (This PR)

1. **PR_01_CSP_RUNTIME_ENFORCEMENT.md** - This file
   - Complete implementation guide
   - Acceptance criteria
   - Rollback procedures

## Success Metrics

### Before Merge

- [ ] All automated checks pass
- [ ] Manual validation on deployed container complete
- [ ] Stripe integration tested and working
- [ ] Supabase auth tested and working
- [ ] Dev routes return 404 in production
- [ ] Browser console shows no CSP violations

### Post-Merge

- [ ] CI/CD includes CSP validation
- [ ] Monitoring shows no CSP errors in logs
- [ ] Production headers captured and documented
- [ ] Enterprise questionnaire updated with evidence

## Next Steps (After PR-01 Merge)

1. **PR-02**: CI Guardrails & Repo Hygiene
   - Block secrets in commits
   - Enforce lint/typecheck/build
   - Dependency vulnerability scanning

2. **PR-03**: Structured Logging & Request Correlation
   - Replace console.\* with logger
   - Add request_id to all logs
   - Sanitize error messages

3. **PR-04**: Container Health & Metrics
   - Add /healthz endpoint
   - Add /readyz endpoint
   - OpenTelemetry integration

## Questions & Answers

### Q: Why not use middleware.ts?

**A**: Next.js 16 renamed middleware.ts to proxy.ts. Using both causes build error. proxy.ts IS the middleware.

### Q: How do we know CSP executes?

**A**: Run validation script against deployed container. Headers prove runtime enforcement.

### Q: What if Stripe breaks?

**A**: Stripe domain is already allowed in script-src. If issues occur, check browser console for CSP violations and adjust directive.

### Q: Can we use inline scripts with nonces?

**A**: Yes. Use `<script nonce={nonce}>` in components. Nonce is available from headers in layout.tsx.

### Q: What's the performance impact?

**A**: Negligible. Nonce generation is <1ms. Headers add ~200 bytes per response.

## Related PRs

- **PR-02**: CI Guardrails (blocking secrets, hygiene)
- **PR-03**: Structured Logging (request correlation)
- **PR-07**: CanLII Compliance (rate limiting)

## Sign-Off

**Required Approvals**:

- [ ] Security team (CSP configuration)
- [ ] DevOps team (container deployment)
- [ ] Engineering lead (code review)

**Evidence Required Before Merge**:

- [ ] Screenshot of CSP headers from deployed container
- [ ] Screenshot of passing validation script
- [ ] Screenshot of working Stripe checkout
- [ ] Screenshot of 404 on \_dev route

**Merge Conditions**:

1. All CI checks pass
2. Manual validation complete
3. Evidence documented
4. Sign-offs obtained
