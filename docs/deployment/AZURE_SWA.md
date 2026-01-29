# Azure Static Web Apps Deployment Guide

## Overview

This document provides comprehensive guidance for deploying the ABR Insights application to Azure Static Web Apps (SWA). Azure SWA is a hosting service optimized for modern web applications with integrated CI/CD from GitHub.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Azure Static Web Apps                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Static Content (Next.js)              │  │
│  │  - Marketing pages (/, /about, /pricing)          │  │
│  │  - Application bundle (/_next/*)                  │  │
│  │  - Public assets (/images/*, /fonts/*)           │  │
│  └───────────────────────────────────────────────────┘  │
│                           ↓                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Routing & API Proxy                   │  │
│  │  - Route fallbacks to /index.html                 │  │
│  │  - API proxying to Azure Functions                │  │
│  │  - Authentication integration                     │  │
│  └───────────────────────────────────────────────────┘  │
│                           ↓                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Azure Functions (API)                 │  │
│  │  - /api/scrape-tribunal-cases                     │  │
│  │  - /api/process-ai-classification                 │  │
│  │  - /api/generate-certificate                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
                  External Services
         (Supabase, Azure OpenAI, Stripe, etc.)
```

## Prerequisites

- Azure subscription with Static Web Apps enabled
- GitHub repository with admin access
- Azure CLI installed: `az --version`
- Node.js 18+ and npm
- Supabase project configured

## Initial Setup

### 1. Create Azure Static Web App

```bash
# Login to Azure
az login

# Set subscription (if multiple)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create resource group
az group create \
  --name abr-insights-rg \
  --location canadacentral

# Create Static Web App (Free tier for development)
az staticwebapp create \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --source https://github.com/YOUR_ORG/abr-insights-app \
  --location canadacentral \
  --branch main \
  --app-location "/" \
  --output-location ".next" \
  --login-with-github

# For production, use Standard tier
az staticwebapp create \
  --name abr-insights-prod \
  --resource-group abr-insights-rg \
  --sku Standard \
  --source https://github.com/YOUR_ORG/abr-insights-app \
  --location canadacentral \
  --branch production \
  --app-location "/" \
  --output-location ".next" \
  --login-with-github
```

### 2. Get Deployment Token

```bash
# Retrieve deployment token
az staticwebapp secrets list \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --query "properties.apiKey" \
  --output tsv
```

**Store this token securely** - it's used in GitHub Actions for deployment.

## Configuration Files

### staticwebapp.config.json

Create `staticwebapp.config.json` in the root directory:

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/dashboard/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/_next/static/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/images/*",
      "headers": {
        "cache-control": "public, max-age=604800"
      }
    },
    {
      "route": "/*",
      "headers": {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
      }
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": [
      "/api/*",
      "/_next/*",
      "/images/*",
      "/fonts/*",
      "*.{css,js,json,ico,png,jpg,jpeg,gif,svg,woff,woff2,ttf,eot}"
    ]
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com",
    "strict-transport-security": "max-age=31536000; includeSubDomains"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/404.html",
      "statusCode": 404
    },
    "500": {
      "rewrite": "/500.html",
      "statusCode": 500
    }
  }
}
```

### Next.js Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Azure SWA
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
    domains: ['YOUR_SUPABASE_PROJECT.supabase.co', 'images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}

module.exports = nextConfig
```

## Environment Variables

### Configure in Azure Portal

1. Navigate to Azure Portal → Static Web Apps → Configuration
2. Add Application Settings:

**Public Variables (Client-side)**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://abr-insights.azurestaticapps.net
NEXT_PUBLIC_ENVIRONMENT=production
```

**Private Variables (Server-side/API)**

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
```

### Configure via Azure CLI

```bash
# Set environment variables
az staticwebapp appsettings set \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --setting-names \
    NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
    SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Custom Domain Setup

### 1. Add Custom Domain

```bash
# Add custom domain
az staticwebapp hostname set \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --hostname app.abrinsights.ca
```

### 2. Configure DNS

Add a CNAME record in your DNS provider:

```
Type:   CNAME
Name:   app
Value:  abr-insights-app.azurestaticapps.net
TTL:    3600
```

For apex domains (abrinsights.ca), use an ALIAS or ANAME record if supported, or use Azure DNS:

```bash
# Create Azure DNS zone
az network dns zone create \
  --resource-group abr-insights-rg \
  --name abrinsights.ca

# Create ALIAS record
az network dns record-set a add-record \
  --resource-group abr-insights-rg \
  --zone-name abrinsights.ca \
  --record-set-name @ \
  --ipv4-address <SWA_IP_ADDRESS>
```

### 3. SSL Certificate

Azure SWA automatically provisions free SSL certificates via Let's Encrypt. Certificate renewal is automatic.

**Verify SSL:**

```bash
# Check certificate
openssl s_client -connect app.abrinsights.ca:443 -servername app.abrinsights.ca
```

## API Integration

### Azure Functions Setup

Azure SWA integrates seamlessly with Azure Functions for API routes.

**Directory Structure:**

```
/api
  ├── scrape-tribunal-cases/
  │   ├── index.js
  │   └── function.json
  ├── process-ai-classification/
  │   ├── index.js
  │   └── function.json
  └── host.json
```

**Example function.json:**

```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "scrape-tribunal-cases"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

**API Base URL:**

- Development: `http://localhost:3000/api`
- Production: `https://app.abrinsights.ca/api`

## Staging Environments

### Create Staging Environment

```bash
# Create staging environment
az staticwebapp environment create \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --environment-name staging \
  --hostname staging.abrinsights.ca
```

### Branch Deployments

Azure SWA automatically creates preview environments for pull requests:

- PR #42 → `https://abr-insights-app-staging-pr42.azurestaticapps.net`
- Branch `develop` → `https://abr-insights-app-develop.azurestaticapps.net`

Configure in GitHub Actions workflow:

```yaml
preview-environments:
  if: github.event_name == 'pull_request'
  runs-on: ubuntu-latest
  steps:
    - uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        action: 'upload'
        deployment_environment: 'pr-${{ github.event.pull_request.number }}'
```

## Security

### Authentication

Azure SWA supports built-in authentication providers:

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0",
          "clientIdSettingName": "AZURE_AD_CLIENT_ID",
          "clientSecretSettingName": "AZURE_AD_CLIENT_SECRET"
        }
      }
    }
  }
}
```

For Supabase authentication, use custom authentication in the application code.

### Role-Based Access Control

Define roles in `staticwebapp.config.json`:

```json
{
  "routes": [
    {
      "route": "/admin/*",
      "allowedRoles": ["admin", "super_admin"]
    }
  ]
}
```

## Monitoring & Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app abr-insights-app \
  --location canadacentral \
  --resource-group abr-insights-rg

# Get instrumentation key
az monitor app-insights component show \
  --app abr-insights-app \
  --resource-group abr-insights-rg \
  --query instrumentationKey \
  --output tsv

# Add to Static Web App
az staticwebapp appsettings set \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --setting-names APPINSIGHTS_INSTRUMENTATIONKEY="YOUR_KEY"
```

### View Logs

```bash
# Stream logs
az staticwebapp logs show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --follow
```

## Performance Optimization

### CDN Configuration

Azure SWA includes a global CDN by default. No additional configuration needed.

**Cache Headers:**

```json
{
  "routes": [
    {
      "route": "/_next/static/*",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

### Compression

Gzip and Brotli compression are enabled by default for:

- `.js`, `.css`, `.html`, `.json`, `.xml`, `.svg`

### Image Optimization

Use Next.js Image component with `unoptimized: true` for static export:

```jsx
import Image from 'next/image'
;<Image src="/images/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

For dynamic images from Supabase Storage, use native `<img>` tags or client-side optimization.

## Troubleshooting

### Build Failures

**Check build logs:**

```bash
az staticwebapp show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --query "buildProperties"
```

**Common issues:**

- Missing environment variables
- Node.js version mismatch
- Dependencies not installed
- Build command incorrect

### Routing Issues

**404 errors on refresh:**

- Ensure `navigationFallback` is configured in `staticwebapp.config.json`
- Verify `trailingSlash: true` in `next.config.js`

**API not accessible:**

- Check function authorization level
- Verify API routes in `staticwebapp.config.json`
- Ensure functions are deployed to `/api` directory

### Environment Variable Issues

**Variables not available:**

- Public variables must start with `NEXT_PUBLIC_`
- Restart deployment after adding variables
- Check spelling and case sensitivity

**Verify variables:**

```bash
az staticwebapp appsettings list \
  --name abr-insights-app \
  --resource-group abr-insights-rg
```

## Cost Optimization

### Free Tier Limits

- 100 GB bandwidth/month
- 0.5 GB storage
- 2 custom domains
- No Azure Functions included

### Standard Tier

- $9/month base
- 100 GB bandwidth included
- $0.20/GB additional bandwidth
- Unlimited custom domains
- Integrated Azure Functions

**Recommendation:** Use Free tier for development/staging, Standard for production.

## Backup & Disaster Recovery

### Application Code

Source code is backed up in GitHub. Ensure:

- Main branch is protected
- Regular backups of GitHub organization
- Disaster recovery procedures documented

### Configuration Backup

Export configuration:

```bash
# Export Static Web App settings
az staticwebapp show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  > swa-config-backup.json

# Export environment variables
az staticwebapp appsettings list \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  > swa-appsettings-backup.json
```

Store backups securely in Azure Key Vault or encrypted storage.

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/staticwebapp)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

---

**Last Updated:** 2025-11-05
**Maintainer:** Development Team
**Review Cycle:** Quarterly
