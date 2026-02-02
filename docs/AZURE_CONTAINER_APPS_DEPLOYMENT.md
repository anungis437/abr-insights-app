# Azure Container Apps Deployment for CSP Enforcement

## Critical Requirement

**proxy.ts requires a Node.js server runtime to execute**. Azure Static Web Apps (SWA) is a static hosting platform that serves pre-rendered HTML and **cannot execute proxy.ts**.

### Platform Compatibility

| Platform | proxy.ts Support | CSP Nonces |
|----------|-----------------|------------|
| Azure Static Web Apps | ❌ No | ❌ No (static hosting only) |
| Azure Container Apps | ✅ Yes | ✅ Yes (full runtime support) |
| Azure App Service | ✅ Yes | ✅ Yes (Node.js server) |
| Docker/Kubernetes | ✅ Yes | ✅ Yes (container runtime) |

**Current deployment**: Azure Static Web Apps (purple-ground-03d2b380f) - **proxy.ts NOT executing**

---

## Migration Path: Azure Static Web Apps → Azure Container Apps

### Why Azure Container Apps?

1. **Runs Next.js as Node.js server** - Full runtime support
2. **Executes proxy.ts** - CSP nonces work
3. **Scalable** - Auto-scales based on load
4. **Cost-effective** - Pay per use, can scale to zero
5. **Integrated** - Works with Azure ecosystem

### Deployment Architecture

```
Client Request
    ↓
Azure Container Apps (Node.js server)
    ↓
proxy.ts executes (generates nonce, sets CSP headers)
    ↓
Next.js renders page with nonce
    ↓
Response with CSP headers + nonce
```

---

## Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG SUPABASE_SERVICE_ROLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## Step 2: Update next.config.js

Add output configuration for standalone build:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  
  // ... rest of your config
}

module.exports = nextConfig
```

---

## Step 3: Create .dockerignore

Create `.dockerignore` in project root:

```
# .dockerignore
node_modules
.next
.git
.github
.vscode
*.md
.env.local
.env.development
.env.test
.DS_Store
Thumbs.db
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
coverage
dist
build
.turbo
.vercel
.docusaurus
docs
scripts
tests
*.log
```

---

## Step 4: Test Docker Build Locally

```bash
# Build the image
docker build -t abr-insights-app:latest .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  abr-insights-app:latest

# Test CSP headers
curl -I http://localhost:3000/
# Should see: Content-Security-Policy and x-nonce headers
```

---

## Step 5: Deploy to Azure Container Apps

### Option A: Azure CLI

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create \
  --name abr-insights-rg \
  --location eastus

# Create Azure Container Registry
az acr create \
  --resource-group abr-insights-rg \
  --name abrinsightsacr \
  --sku Basic

# Login to ACR
az acr login --name abrinsightsacr

# Build and push to ACR
az acr build \
  --registry abrinsightsacr \
  --image abr-insights-app:latest \
  --file Dockerfile .

# Create Container Apps environment
az containerapp env create \
  --name abr-insights-env \
  --resource-group abr-insights-rg \
  --location eastus

# Create Container App
az containerapp create \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --environment abr-insights-env \
  --image abrinsightsacr.azurecr.io/abr-insights-app:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server abrinsightsacr.azurecr.io \
  --env-vars \
    NEXT_PUBLIC_SUPABASE_URL="secretref:supabase-url" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="secretref:supabase-anon-key" \
    NEXT_PUBLIC_APP_URL="https://abr-insights-app.azurecontainerapps.io" \
    SUPABASE_SERVICE_ROLE_KEY="secretref:supabase-service-role-key" \
  --min-replicas 0 \
  --max-replicas 10

# Set secrets
az containerapp secret set \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --secrets \
    supabase-url="your-supabase-url" \
    supabase-anon-key="your-anon-key" \
    supabase-service-role-key="your-service-role-key"
```

### Option B: GitHub Actions (Recommended)

Create `.github/workflows/azure-container-apps.yml`:

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_CONTAINER_APP_NAME: abr-insights-app
  AZURE_RESOURCE_GROUP: abr-insights-rg
  AZURE_CONTAINER_REGISTRY: abrinsightsacr

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to Azure Container Registry
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build and push Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }} \
            --build-arg NEXT_PUBLIC_APP_URL=${{ secrets.NEXT_PUBLIC_APP_URL }} \
            --build-arg SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }} \
            -t ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.AZURE_CONTAINER_APP_NAME }}:${{ github.sha }} \
            -t ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.AZURE_CONTAINER_APP_NAME }}:latest \
            .
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.AZURE_CONTAINER_APP_NAME }}:${{ github.sha }}
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.AZURE_CONTAINER_APP_NAME }}:latest

      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: ${{ env.AZURE_CONTAINER_APP_NAME }}
          resourceGroup: ${{ env.AZURE_RESOURCE_GROUP }}
          imageToDeploy: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.AZURE_CONTAINER_APP_NAME }}:${{ github.sha }}
```

---

## Step 6: Validate CSP Headers

After deployment, test the Container App URL:

```powershell
# PowerShell
.\scripts\validate-csp-headers.ps1 -BaseUrl "https://abr-insights-app.azurecontainerapps.io"
```

```bash
# Bash
./scripts/validate-csp-headers.sh https://abr-insights-app.azurecontainerapps.io
```

**Expected output**:
```
✅ PASS: CSP header present
✅ PASS: x-nonce header present
✅ PASS: Nonce matches
✅ PASS: No unsafe-inline
✅ PASS: Nonces are unique per request
```

---

## Cost Comparison

### Azure Static Web Apps (Current)
- **Cost**: ~$9/month (Standard tier)
- **CSP Support**: ❌ No (static only)
- **Scalability**: Automatic
- **Use Case**: Static sites, pre-rendered content

### Azure Container Apps (Recommended)
- **Cost**: ~$0-50/month (consumption-based)
  - Free: 180,000 vCPU-seconds + 360,000 GiB-seconds per month
  - Can scale to zero (0 replicas when idle)
  - Pay only for actual usage
- **CSP Support**: ✅ Yes (full Node.js runtime)
- **Scalability**: 0-10+ replicas (configurable)
- **Use Case**: Server-side rendering, dynamic content, runtime logic

**Recommendation**: Azure Container Apps is **more cost-effective** for this use case and supports CSP enforcement.

---

## Migration Checklist

- [ ] Create Dockerfile in project root
- [ ] Update next.config.js with `output: 'standalone'`
- [ ] Create .dockerignore
- [ ] Test Docker build locally
- [ ] Verify CSP headers work in local Docker container
- [ ] Create Azure Container Registry
- [ ] Create Azure Container Apps environment
- [ ] Deploy container to Azure Container Apps
- [ ] Set environment variables and secrets
- [ ] Test CSP headers on deployed Container App
- [ ] Update DNS/custom domain (if applicable)
- [ ] Update GitHub Actions workflow
- [ ] Decommission Azure Static Web Apps (optional)
- [ ] Update documentation with new deployment URL

---

## Required GitHub Secrets

Add these secrets to your GitHub repository:

```
AZURE_CREDENTIALS         - Service principal JSON
ACR_USERNAME              - Container Registry username
ACR_PASSWORD              - Container Registry password
NEXT_PUBLIC_SUPABASE_URL  - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon key
NEXT_PUBLIC_APP_URL       - Container Apps URL
SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
STRIPE_SECRET_KEY         - Stripe secret key (if using Stripe)
```

---

## Troubleshooting

### Docker build fails
- Check Dockerfile syntax
- Verify all COPY paths are correct
- Ensure next.config.js has `output: 'standalone'`

### Container starts but crashes
- Check logs: `az containerapp logs show --name abr-insights-app --resource-group abr-insights-rg --tail 50`
- Verify environment variables are set correctly
- Check if PORT=3000 is exposed

### CSP headers still missing
- Verify proxy.ts exists in container: `docker exec <container-id> ls -la proxy.ts`
- Check Next.js is running in server mode (not static export)
- Review container logs for proxy.ts execution errors

### High costs
- Enable scale-to-zero: `--min-replicas 0`
- Set aggressive scale-down: `--scale-down-delay 60`
- Monitor usage in Azure Portal
- Consider reserved capacity for predictable workloads

---

## Next Steps

1. **Create Dockerfile** and test locally
2. **Deploy to Azure Container Apps** using CLI or GitHub Actions
3. **Validate CSP headers** using validation scripts
4. **Update CSP_VALIDATION_PROOF.md** with captured headers
5. **Update deployment documentation** with Container Apps URL

---

## References

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js Docker Deployment](https://nextjs.org/docs/app/guides/self-hosting#docker-image)
- [proxy.ts Runtime Requirements](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#runtime)
