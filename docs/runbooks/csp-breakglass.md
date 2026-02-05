# CSP Break-Glass Procedures

## Overview

This runbook provides procedures for handling Content Security Policy (CSP) issues in production. CSP is a critical security control that prevents XSS attacks, but misconfigurations can break legitimate functionality. This guide helps you diagnose and resolve CSP issues safely.

## When to Use This Runbook

- Users report "blocked by CSP" errors in browser console
- New features fail due to CSP violations
- Third-party integrations are blocked
- Emergency need to relax CSP temporarily

## CSP Quick Reference

Current CSP directives (see [middleware.ts](../../middleware.ts)):

```
default-src 'self'
script-src 'self' 'nonce-{NONCE}' https://js.stripe.com https://cdn.jsdelivr.net
style-src 'self' 'nonce-{NONCE}' 'unsafe-hashes' {HASH} https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' data: https: blob:
connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.stripe.com
worker-src 'self' blob:
frame-src 'self' https://js.stripe.com
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests
```

## CSP Report-Only Mode

**Status**: Currently NOT implemented (Track G - future enhancement)

Once implemented, you can enable report-only mode:

```bash
# Set environment variable
export CSP_REPORT_ONLY=true

# Redeploy application
```

In report-only mode:

- CSP violations are logged but NOT blocked
- Allows testing CSP changes without breaking functionality
- Use for gradual CSP rollout or debugging

## Diagnosing CSP Issues

### 1. Check Browser Console

**Symptoms**:

- "Refused to load the script..."
- "Refused to apply inline style..."
- "Refused to connect to..."

**Steps**:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for CSP violation errors
4. Note the violated directive and blocked resource

**Example violation**:

```
Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self' 'nonce-abc123'".
```

### 2. Check CSP Violation Reports (if enabled)

```bash
# Query Application Insights for CSP violations
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "customEvents | where name == 'csp-violation' | top 50 by timestamp desc"
```

### 3. Verify Nonce Propagation

**Check that nonce is present**:

```bash
# Get nonce from response header
curl -I https://abrinsights.ca | grep -i "x-nonce"

# Check if CSP header contains nonce
curl -I https://abrinsights.ca | grep -i "content-security-policy"
```

**Verify inline scripts use nonce**:

```bash
# Check page HTML for nonce attributes
curl -s https://abrinsights.ca | grep -o 'nonce="[^"]*"' | head -5
```

## Common CSP Issues and Fixes

### Issue 1: Inline Script Blocked

**Symptom**: "Refused to execute inline script because it violates CSP directive"

**Cause**: Inline `<script>` tag without nonce attribute

**Fix**:

```tsx
// ❌ Wrong - no nonce
;<script>console.log('Hello')</script>

// ✅ Correct - with nonce
import { headers } from 'next/headers'

export default function Page() {
  const headersList = headers()
  const nonce = headersList.get('x-nonce') || ''

  return <script nonce={nonce}>console.log('Hello')</script>
}
```

### Issue 2: External Script Blocked

**Symptom**: "Refused to load the script 'https://example.com/script.js'"

**Cause**: External domain not in `script-src` allowlist

**Temporary Fix** (emergency only):

1. Add domain to CSP in `middleware.ts`:

```typescript
const cspHeader = `
  script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://cdn.jsdelivr.net https://example.com;
  // ... rest of CSP
`
```

2. Deploy change
3. Verify it works
4. Create ticket to review if domain should be permanently allowed

**Permanent Fix**:

- Self-host the script if possible
- Use subresource integrity (SRI) if from CDN
- Verify domain is trustworthy before adding

### Issue 3: Inline Styles Blocked

**Symptom**: "Refused to apply inline style because it violates CSP directive"

**Cause**: Inline styles without nonce or not using allowed pattern

**Fix**:

```tsx
// ❌ Wrong - no nonce
<div style={{ color: 'red' }}>Text</div>

// ✅ Correct - use CSS classes instead
<div className="text-red-500">Text</div>

// ✅ Or use nonce for style tag
<style nonce={nonce}>
  .custom { color: red; }
</style>
<div className="custom">Text</div>
```

### Issue 4: API Connection Blocked

**Symptom**: "Refused to connect to 'https://api.example.com' because it violates CSP directive"

**Cause**: API domain not in `connect-src` allowlist

**Fix**:

Add domain to `connect-src` in `middleware.ts`:

```typescript
connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.stripe.com https://api.example.com;
```

### Issue 5: Image Loading Blocked

**Symptom**: Images fail to load from external domains

**Cause**: Domain not in `img-src` allowlist

**Current Policy**: `img-src 'self' data: https: blob:`

This is already permissive (allows all HTTPS images). If images still fail:

1. Check if image URL is HTTP (not HTTPS)
2. Check browser console for actual error
3. Verify image URL is accessible

### Issue 6: Frame/Iframe Blocked

**Symptom**: "Refused to frame 'https://example.com' because it violates CSP directive"

**Cause**: Domain not in `frame-src` allowlist

**Current Policy**: `frame-src 'self' https://js.stripe.com`

**Fix** (only if absolutely necessary):

```typescript
frame-src 'self' https://js.stripe.com https://trusted-domain.com;
```

**Security Warning**: Only add trusted domains. Iframes can be XSS vectors.

## Emergency Break-Glass Procedures

### Option 1: Disable Specific Directive (Safest)

If a single directive is causing issues, relax just that directive:

**Example**: Allow all external scripts (emergency only):

```typescript
// In middleware.ts
script-src 'self' 'nonce-${nonce}' https: 'unsafe-inline';
```

⚠️ **Warning**: `'unsafe-inline'` defeats XSS protection. Use only temporarily.

### Option 2: Report-Only Mode (Recommended)

**Once implemented**, switch to report-only:

```bash
# Set environment variable
az containerapp update \
  --name abr-insights-prod \
  --resource-group rg-abr-prod \
  --set-env-vars CSP_REPORT_ONLY=true

# Violations will be logged but not blocked
```

Monitor violations, fix them, then re-enable enforcement.

### Option 3: Temporarily Disable CSP (Nuclear Option)

**Last resort only**. Do NOT use unless application is completely broken.

```typescript
// In middleware.ts - comment out CSP header
// finalResponse.headers.set('Content-Security-Policy', cspHeader)

// Or use a very permissive policy
const emergencyCSP = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
finalResponse.headers.set('Content-Security-Policy', emergencyCSP)
```

**If you disable CSP**:

1. File critical incident ticket
2. Fix root cause within 24 hours
3. Re-enable CSP ASAP
4. Document in postmortem

## Testing CSP Changes

### 1. Local Testing

```bash
# Run dev server
npm run dev

# Check CSP header
curl -I http://localhost:3000 | grep -i "content-security-policy"

# Test functionality in browser
# Check console for violations
```

### 2. Staging Testing

```bash
# Deploy to staging
# Run release acceptance gate
export BASE_URL=https://staging.abrinsights.ca
./scripts/release-acceptance.sh

# Manual testing:
# - Test all critical flows
# - Check browser console for violations
# - Verify nonce in HTML and headers
```

### 3. Production Verification

```bash
# After deploying CSP changes
# Check CSP header
curl -I https://abrinsights.ca | grep -i "content-security-policy"

# Monitor Application Insights for CSP violations
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "customEvents | where name == 'csp-violation' | top 50 by timestamp desc | project timestamp, violatedDirective, blockedURI"

# Monitor error rates
# Watch for 15-30 minutes after deployment
```

## CSP Monitoring

### Key Metrics

- CSP violation rate (should be near zero)
- Blocked resources by type (script, style, image, etc.)
- Violation sources (which pages/features)

### Alert Thresholds

- **Warning**: > 10 violations per hour
- **Critical**: > 100 violations per hour
- **Emergency**: Core functionality broken

## CSP Best Practices

1. **Always use nonces** for inline scripts/styles
2. **Avoid 'unsafe-inline'** and `'unsafe-eval'`
3. **Minimize external domains** in allowlists
4. **Use SRI** (Subresource Integrity) for CDN resources
5. **Test CSP changes** in staging first
6. **Monitor violations** after deployments
7. **Keep CSP as strict as possible** while maintaining functionality
8. **Document all exceptions** in code comments

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous deployment
az containerapp revision list --name abr-insights-prod --resource-group rg-abr-prod
az containerapp revision activate --name abr-insights-prod --resource-group rg-abr-prod --revision <previous-revision>
```

### Git Rollback

```bash
# Find last working commit
git log --oneline middleware.ts

# Revert CSP changes
git revert <commit-hash>

# Deploy
git push origin main
```

## Post-Incident Actions

After resolving a CSP issue:

1. **Document the fix** in this runbook
2. **Update CSP tests** to catch the issue
3. **Review CSP policy** for other potential issues
4. **Add monitoring** for similar violations
5. **Consider report-only mode** for future changes

## Related Documents

- [Middleware Implementation](../../middleware.ts)
- [CSP Runtime Enforcement](../production-readiness/PR_01_CSP_RUNTIME_ENFORCEMENT.md)
- [Incident Response Runbook](./incident-response.md)
- [MDN CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## CSP Resources

- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **Report URI**: https://report-uri.com/ (CSP reporting service)
- **MDN CSP Docs**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **OWASP CSP Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
