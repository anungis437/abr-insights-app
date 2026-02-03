# Container Deployment Security Controls

> **Status**: Active (Azure Container Apps deployment)  
> **Replaces**: Azure Static Web Apps staticwebapp.config.json  
> **Last Updated**: February 2, 2026

## Overview

This document outlines the security controls for the containerized deployment on Azure Container Apps. Unlike Azure Static Web Apps, which provided edge-level security via `staticwebapp.config.json`, container deployments require **runtime security enforcement** at the application and gateway layers.

## Architecture

```
Internet → Azure Front Door (optional) → Container Apps → Next.js App (proxy.ts)
           └─ WAF policies              └─ Ingress rules   └─ Runtime security
```

## Security Layers

### Layer 1: Application Runtime (Next.js proxy.ts)

**Location**: `proxy.ts` (repo root)  
**Execution**: Every HTTP request in Node.js server runtime  
**Status**: ✅ Active

**Controls**:

1. **Content Security Policy (CSP)**
   - Nonce-based script/style protection
   - No `unsafe-inline` directives
   - Generated dynamically per request via Web Crypto API
   - Headers: `Content-Security-Policy`, `x-nonce`

2. **Route Protection**
   - `/_dev/*` routes: Hard 404 in production
   - `/api/_dev/*` routes: Hard 404 in production
   - Admin routes: RBAC enforcement at layout level

3. **Request Correlation**
   - `x-correlation-id` header injection
   - Request tracing across services
   - Log aggregation support

4. **Session Management**
   - Supabase session refresh via middleware
   - Automatic token rotation
   - Cookie security (httpOnly, secure, sameSite)

**Code Reference**:

```typescript
// proxy.ts - Security header injection
export default async function proxy(request: NextRequest) {
  // Block dev routes in production
  if (pathname.startsWith('/_dev') && process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 })
  }

  // Generate CSP nonce
  const nonce = generateNonce() // Web Crypto API

  // Inject security headers
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  response.headers.set('x-correlation-id', correlationId)

  return response
}
```

### Layer 2: Container Platform (Azure Container Apps)

**Location**: Azure Container Apps configuration  
**Execution**: Container ingress layer  
**Status**: ✅ Active

**Controls**:

1. **Ingress Configuration**
   - External ingress with HTTPS enforcement
   - Target port: 3000 (Next.js server)
   - Auto-scaling: 0-10 replicas (consumption-based)

2. **Secret Management**
   - Azure Key Vault integration (planned)
   - Environment variables via Container Apps secrets
   - ACR credentials stored securely

3. **Network Isolation**
   - Managed environment with Log Analytics
   - Outbound IP restrictions (configurable)
   - Private VNET support (future)

**Current Configuration**:

```yaml
# Container Apps settings
minReplicas: 0 # Scale to zero when idle
maxReplicas: 10
cpu: 1.0
memory: 2.0Gi
ingress:
  external: true
  targetPort: 3000
  allowInsecure: false
```

### Layer 3: Gateway/WAF (Optional - Recommended for World-Class)

**Status**: ⏳ Planned (Phase 2)

**Recommended Options**:

1. **Azure Application Gateway + WAF**
   - Layer 7 load balancing
   - OWASP Top 10 protection
   - Bot mitigation
   - Path-based routing rules

2. **Azure Front Door**
   - Global CDN with edge caching
   - WAF at the edge
   - DDoS protection (Azure DDoS Standard)
   - Custom domain + SSL management

3. **Azure API Management**
   - API gateway with policies
   - Rate limiting at gateway level
   - OAuth/JWT validation
   - Request transformation

**When to Add Gateway Layer**:

- ✅ Production deployment with custom domain
- ✅ Need bot protection or advanced WAF
- ✅ Multi-region traffic management
- ✅ Centralized rate limiting across services

### Layer 4: Rate Limiting

**Status**: ✅ Active (Redis-backed)

**Implementation**:

- **Location**: `lib/security/redisRateLimit.ts`
- **Backend**: Upstash Redis (serverless)
- **Strategy**: Token bucket algorithm
- **Presets**: API routes, auth endpoints, AI features

**Rate Limits**:

```typescript
// Per-IP rate limits
/api/ai/*        → 10 req/min
/api/auth/*      → 5 req/min
/api/webhooks/*  → 50 req/min
default          → 100 req/min
```

**Enforcement**: Fail-closed (errors block requests)

### Layer 5: Secrets Management

**Current**: Environment variables via GitHub Actions secrets  
**Status**: ✅ Active  
**Planned**: Azure Key Vault integration

**Secret Categories**:

1. **Authentication**
   - Supabase service role key
   - JWT signing secrets

2. **Payment Processing**
   - Stripe API keys
   - Webhook secrets

3. **Infrastructure**
   - Redis connection credentials
   - ACR registry passwords
   - Azure service principal

4. **AI/ML** (future)
   - OpenAI API keys
   - Azure OpenAI endpoints

**GitHub Secrets** (configured):

- `AZURE_CREDENTIALS` (service principal JSON)
- `ACR_USERNAME`, `ACR_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `REDIS_URL`, `REDIS_TOKEN`

### Layer 6: Observability

**Current**: Application Insights (planned)  
**Status**: ⏳ Planned

**Planned Integrations**:

1. **Application Insights**
   - Request telemetry
   - Dependency tracking
   - Exception logging
   - Custom metrics

2. **Log Analytics**
   - Container logs (stdout/stderr)
   - Performance metrics
   - Query-based alerting

3. **OpenTelemetry** (future)
   - Distributed tracing
   - Cross-service correlation
   - Standard instrumentation

## Validation Requirements

To claim "world-class" security, we need **runtime evidence**:

### 1. HTTP Response Headers

Capture headers from deployed container for multiple routes:

```bash
# Test routes
curl -I https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io/
curl -I https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io/pricing
curl -I https://abr-insights-app.thankfulsea-568c2dd6.eastus.azurecontainerapps.io/dashboard
```

**Expected Headers**:

- ✅ `Content-Security-Policy` with nonces
- ✅ `x-nonce` header present
- ✅ `x-correlation-id` header present
- ✅ No `unsafe-inline` in CSP
- ✅ Nonce changes per request

### 2. Dev Route Protection

```bash
# Should return 404 in production
curl -I https://<app-url>/_dev/test-checkout
curl -I https://<app-url>/api/_dev/create-checkout-session
```

**Expected**: HTTP 404 status

### 3. Rate Limiting

```bash
# Rapid requests to rate-limited endpoint
for i in {1..15}; do curl https://<app-url>/api/ai/chat -X POST; done
```

**Expected**: HTTP 429 after threshold

### 4. Nonce Uniqueness

```bash
# Capture nonces from multiple requests
for i in {1..5}; do curl -I https://<app-url>/ | grep x-nonce; done
```

**Expected**: Different nonce values per request

## Migration from Azure Static Web Apps

### What Changed

| Control                 | Azure SWA                 | Azure Container Apps         |
| ----------------------- | ------------------------- | ---------------------------- |
| **Security Headers**    | staticwebapp.config.json  | proxy.ts (runtime)           |
| **Route Protection**    | allowedRoles in config    | proxy.ts + layout.tsx        |
| **CSP**                 | Static header (no nonces) | Dynamic nonces (per req)     |
| **Rate Limiting**       | Not available             | Redis-backed (app-level)     |
| **Auto-scaling**        | Not configurable          | 0-10 replicas (configurable) |
| **Cost Model**          | Fixed $9/mo (Free tier)   | Consumption ($0-50/mo)       |
| **Runtime Environment** | Static pre-rendered HTML  | Node.js server runtime       |
| **Deployment**          | Oryx build (automatic)    | Docker container (custom)    |

### What to Remove

1. ~~`staticwebapp.config.json` globalHeaders~~ → Moved to proxy.ts
2. ~~`staticwebapp.config.json` routes~~ → Moved to proxy.ts + layouts
3. ~~SWA-specific claims in security docs~~ → Updated to container model

### What to Keep

1. ✅ RBAC enforcement at layout level (`app/admin/layout.tsx`)
2. ✅ Environment variable management (now via Container Apps secrets)
3. ✅ Redis rate limiting (unchanged)
4. ✅ Supabase authentication (unchanged)

## Deployment Process

### CI/CD Pipeline

**Location**: `.github/workflows/azure-container-apps.yml`  
**Trigger**: Push to `main` branch  
**Status**: ✅ Active

**Steps**:

1. Checkout code
2. Azure login (service principal)
3. Docker build with BuildKit caching
4. Push to ACR (abrinsightsacr.azurecr.io)
5. Deploy to Container Apps with environment variables
6. Output deployment URL

**Build Command**:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }} \
  --tag abrinsightsacr.azurecr.io/abr-insights-app:${{ github.sha }} \
  .
```

### Manual Deployment

```bash
# Build Docker image
docker build -t abrinsightsacr.azurecr.io/abr-insights-app:latest .

# Push to ACR
az acr login --name abrinsightsacr
docker push abrinsightsacr.azurecr.io/abr-insights-app:latest

# Update Container App
az containerapp update \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --image abrinsightsacr.azurecr.io/abr-insights-app:latest
```

## Security Checklist

### Pre-Deployment

- [x] proxy.ts injects CSP headers with nonces
- [x] `_dev` routes blocked in production
- [x] Admin layouts enforce RBAC
- [x] Redis rate limiting configured
- [x] Environment variables secured in GitHub secrets
- [x] Docker image uses distroless/Alpine base
- [x] No secrets in container image layers

### Post-Deployment

- [ ] Capture HTTP headers from deployed container (all routes)
- [ ] Verify nonces change per request
- [ ] Confirm dev routes return 404
- [ ] Test rate limiting thresholds
- [ ] Validate session management (login/logout)
- [ ] Check correlation ID propagation in logs
- [ ] Review Log Analytics for errors

### Phase 2 (Optional - World-Class)

- [ ] Add Azure Front Door with WAF
- [ ] Integrate Azure Key Vault for secrets
- [ ] Enable Application Insights telemetry
- [ ] Add custom domain with SSL
- [ ] Configure DDoS Standard protection
- [ ] Set up Azure Monitor alerts

## Related Documentation

- **CSP Implementation**: [CSP_HARDENING_ROADMAP.md](CSP_HARDENING_ROADMAP.md)
- **Deployment Guide**: [AZURE_CONTAINER_APPS_DEPLOYMENT.md](AZURE_CONTAINER_APPS_DEPLOYMENT.md)
- **Validation Proof**: [CSP_VALIDATION_PROOF.md](CSP_VALIDATION_PROOF.md)
- **Legacy SWA Config**: [staticwebapp.config.json](../staticwebapp.config.json) (deprecated)

## FAQ

### Why not use NGINX for CSP?

Next.js middleware (proxy.ts) is the cleanest approach because:

- Nonce generation is tightly coupled with app rendering
- No coordination needed between proxy and app
- Next.js already has server runtime
- Easier to test and validate locally

### Do we still need staticwebapp.config.json?

No, but we keep it for:

- Historical reference
- If we need to revert to Azure SWA
- Documentation of previous approach

The file is marked as **deprecated** and not used by Container Apps.

### How does auto-scaling work?

Container Apps uses HTTP request queue depth and CPU metrics:

- Min replicas: 0 (scale to zero when idle)
- Max replicas: 10 (burst capacity)
- Cold start: ~5-10 seconds from zero
- Cost: Only pay for active replicas

### What about bot protection?

Current: App-level rate limiting (Redis)  
Recommended: Add Azure Front Door WAF for:

- Bot detection and mitigation
- CAPTCHA challenges
- IP reputation filtering
- Geo-blocking (if needed)

### Can we use Kubernetes instead?

Yes, same security model applies to AKS:

- proxy.ts still handles CSP + headers
- K8s ingress controller replaces Container Apps ingress
- Consider service mesh (Istio/Linkerd) for advanced controls

## Maintenance

- **Review Frequency**: Monthly
- **Responsibility**: Security team + DevOps
- **Escalation**: For changes to CSP directives or new secrets

## Change Log

| Date       | Change                                    | Author |
| ---------- | ----------------------------------------- | ------ |
| 2026-02-02 | Initial container security controls       | System |
| 2026-02-02 | Added `_dev` route protection to proxy.ts | System |
