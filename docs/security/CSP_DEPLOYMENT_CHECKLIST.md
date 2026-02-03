# CSP Deployment Validation Checklist

Use this checklist after deploying to verify CSP enforcement is active.

---

## ✅ Pre-Deployment Checklist

- [x] **middleware.ts created** - Next.js entrypoint exists (6 lines)
- [x] **proxy.ts logic intact** - CSP nonce generation + header injection (78 lines)
- [x] **Documentation updated** - CSP_HARDENING_ROADMAP.md, CSP_VALIDATION_PROOF.md
- [x] **Validation scripts created** - bash + PowerShell versions
- [x] **All quality checks pass** - format, lint, type-check
- [x] **Commits pushed** - Ready for deployment

---

## ⏳ Deployment Steps

- [ ] **Deploy to environment** (check one):
  - [ ] Azure Static Web Apps (Production)
  - [ ] Azure Static Web Apps (Preview/Staging)
  - [ ] Local dev server (npm run dev)
  - [ ] Other: **\*\***\_\_\_**\*\***

- [ ] **Note deployment URL**: **\*\***\*\*\*\***\*\***\_**\*\***\*\*\*\***\*\***

- [ ] **Verify deployment success** - Site is accessible

---

## ⏳ Validation Steps

### Step 1: Run Validation Script

**Bash** (Linux/macOS/Git Bash):

```bash
./scripts/validate-csp-headers.sh https://YOUR-DEPLOYMENT-URL
```

**PowerShell** (Windows):

```powershell
.\scripts\validate-csp-headers.ps1 -BaseUrl "https://YOUR-DEPLOYMENT-URL"
```

- [ ] **Script executed successfully**
- [ ] **All tests passed** (see expected output below)

### Step 2: Manual Header Verification

Run curl against key routes:

```bash
curl -I https://YOUR-DEPLOYMENT-URL/
curl -I https://YOUR-DEPLOYMENT-URL/pricing
curl -I https://YOUR-DEPLOYMENT-URL/dashboard
curl -I https://YOUR-DEPLOYMENT-URL/admin
curl -I https://YOUR-DEPLOYMENT-URL/auth/login
```

Verify each response contains:

- [ ] **Content-Security-Policy header present**
- [ ] **x-nonce header present**
- [ ] **Nonce value matches** between CSP and x-nonce
- [ ] **No unsafe-inline** in CSP header

### Step 3: Test Nonce Uniqueness

Run curl twice to the same route:

```bash
curl -I https://YOUR-DEPLOYMENT-URL/ | grep x-nonce
# Wait 1 second
curl -I https://YOUR-DEPLOYMENT-URL/ | grep x-nonce
```

- [ ] **Nonces are different** between requests
- [ ] **Format is correct** (base64-encoded, 16+ bytes)

### Step 4: Browser DevTools Verification

1. Open site in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Click on first document request
6. Check Response Headers

- [ ] **Content-Security-Policy header visible**
- [ ] **x-nonce header visible**
- [ ] **No CSP violations in Console** (no red errors about blocked scripts/styles)

---

## ⏳ Documentation Update

After successful validation:

- [ ] **Capture header output** - Save curl results showing CSP + nonce
- [ ] **Update CSP_VALIDATION_PROOF.md** - Replace "⚠️ VALIDATION REQUIREMENT" with actual evidence
- [ ] **Add header examples** - Include real captured headers in documentation
- [ ] **Update status** - Change "INTENDED architecture" to "PROVEN enforcement"

Example documentation update:

```markdown
## ✅ VALIDATION COMPLETE

**Deployment**: https://purple-ground-03d2b380f.5.azurestaticapps.net
**Date**: [DATE]
**Validator**: [YOUR NAME]

**Evidence**:
```

$ curl -I <https://purple-ground-03d2b380f.5.azurestaticapps.net/>
HTTP/2 200
content-security-policy: default-src 'self'; script-src 'self' 'nonce-ABC123XYZ...' <https://js.stripe.com>; ...
x-nonce: ABC123XYZ...
x-correlation-id: 12345678-1234-1234-1234-123456789abc

```

**Validation Script Output**:
```

✅ ALL TESTS PASSED - CSP enforcement verified!

```

```

---

## ✅ Enterprise Questionnaire Claims

After validation is complete, you can claim:

- [ ] **CSP Header Present**: ✅ YES - Enforced on all HTML responses
- [ ] **No unsafe-inline**: ✅ YES - All scripts/styles use nonces
- [ ] **Per-request nonces**: ✅ YES - Unique nonce per request
- [ ] **Dynamic enforcement**: ✅ YES - Generated at edge runtime
- [ ] **Runtime verified**: ✅ YES - Tested against deployed environment

**Evidence**: See [CSP_VALIDATION_PROOF.md](./docs/CSP_VALIDATION_PROOF.md) Section [X]

---

## ❌ Troubleshooting

### If CSP Header is Missing

**Symptom**: No `Content-Security-Policy` header in response

**Possible Causes**:

1. middleware.ts not deployed (check deployment files)
2. Azure SWA stripping headers (check platform config)
3. Route not matching config (check proxy.ts matcher)

**Debug Steps**:

```bash
# Check if middleware.ts exists in deployment
ls -la middleware.ts

# Check if proxy.ts exists in deployment
ls -la proxy.ts

# Check middleware config
cat middleware.ts

# Check Next.js build output
npm run build 2>&1 | grep -i middleware
```

### If Nonce Doesn't Match

**Symptom**: CSP nonce ≠ x-nonce header value

**Possible Causes**:

1. Multiple middleware interfering
2. Header overwrite somewhere
3. Caching issue

**Debug Steps**:

- Clear browser cache
- Run curl (bypasses browser cache)
- Check for other middleware files
- Verify proxy.ts sets both headers together

### If Nonce Not Unique

**Symptom**: Same nonce across multiple requests

**Possible Causes**:

1. Server-side caching
2. CDN caching
3. Load balancer caching

**Debug Steps**:

- Add `Cache-Control: no-cache` to headers
- Test directly against origin (bypass CDN)
- Check Azure SWA caching settings

### If unsafe-inline Present

**Symptom**: CSP still contains 'unsafe-inline'

**Possible Causes**:

1. Old code deployed
2. Fallback CSP being used
3. Manual override somewhere

**Debug Steps**:

- Verify proxy.ts is the deployed version
- Check for multiple CSP headers (Last-Writer-Wins)
- Search codebase for other CSP definitions

---

## Expected Script Output

### ✅ Success

```
🔍 Validating CSP headers for: https://yourdomain.com
==================================================

Testing: https://yourdomain.com/
---
✅ PASS: CSP header present
✅ PASS: x-nonce header present
✅ PASS: Nonce matches (ABC123XYZ...)
✅ PASS: No unsafe-inline

Testing: https://yourdomain.com/pricing
---
✅ PASS: CSP header present
✅ PASS: x-nonce header present
✅ PASS: Nonce matches (DEF456...)
✅ PASS: No unsafe-inline

[... other routes ...]

==================================================

Testing nonce uniqueness (2 requests to /)...
✅ PASS: Nonces are unique per request
  Request 1: ABC123XYZ...
  Request 2: GHI789...

==================================================
✅ ALL TESTS PASSED - CSP enforcement verified!

You can now claim in enterprise questionnaires:
  ✅ CSP header on every HTML response
  ✅ No unsafe-inline or unsafe-eval
  ✅ Per-request nonces
  ✅ Dynamic enforcement at the edge
```

### ❌ Failure

```
🔍 Validating CSP headers for: https://yourdomain.com
==================================================

Testing: https://yourdomain.com/
---
❌ FAIL: No Content-Security-Policy header

==================================================
❌ VALIDATION FAILED - CSP not properly enforced

Review the errors above and fix the CSP configuration.
```

---

## Timeline

- **Code Complete**: ✅ [DATE]
- **Deployed**: ⏳ [DATE]
- **Validated**: ⏳ [DATE]
- **Documented**: ⏳ [DATE]
- **Enterprise Ready**: ⏳ [DATE]

---

## Sign-Off

**Developer**: **\*\***\*\*\*\***\*\***\_**\*\***\*\*\*\***\*\***  
**Date**: **\*\***\*\*\*\***\*\***\_**\*\***\*\*\*\***\*\***  
**Deployment URL**: **\*\***\*\*\*\***\*\***\_**\*\***\*\*\*\***\*\***  
**Validation Status**: [ ] PASS / [ ] FAIL  
**Notes**: **\*\***\*\*\*\***\*\***\_**\*\***\*\*\*\***\*\***

---

## References

- **Implementation**: [CSP_HARDENING_ROADMAP.md](./CSP_HARDENING_ROADMAP.md)
- **Proof**: [CSP_VALIDATION_PROOF.md](./CSP_VALIDATION_PROOF.md)
- **Summary**: [CSP_WIRING_COMPLETE.md](./CSP_WIRING_COMPLETE.md)
- **Scripts**:
  - [validate-csp-headers.sh](../scripts/validate-csp-headers.sh)
  - [validate-csp-headers.ps1](../scripts/validate-csp-headers.ps1)
