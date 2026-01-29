# Environment Configuration & Variables

**Version**: 1.0.0
**Last Updated**: November 5, 2025
**Status**: Production Ready

---

## Purpose

This document defines all environment variables, configuration management strategies, and secrets handling for the ABR Insights application across development, staging, and production environments.

---

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Required Variables](#required-variables)
3. [Environment-Specific Configs](#environment-specific-configs)
4. [Secrets Management](#secrets-management)
5. [Local Development Setup](#local-development-setup)
6. [Azure Configuration](#azure-configuration)
7. [Security Best Practices](#security-best-practices)

---

## Environment Overview

### Environments

| Environment     | Purpose                | URL                              | Branch      | Auto-Deploy           |
| --------------- | ---------------------- | -------------------------------- | ----------- | --------------------- |
| **Development** | Local development      | `http://localhost:3000`          | `feature/*` | No                    |
| **Staging**     | Pre-production testing | `https://staging.abrinsights.ca` | `develop`   | Yes                   |
| **Production**  | Live application       | `https://app.abrinsights.ca`     | `main`      | Yes (manual approval) |

### Configuration Strategy

- **Local**: `.env.local` (gitignored, developer-specific)
- **Staging/Production**: Azure Key Vault + Azure Static Web Apps configuration
- **CI/CD**: GitHub Secrets for workflow automation
- **Shared**: `.env.example` (committed, no secrets)

---

## Required Variables

### 1. Application Configuration

```bash
# Application
NODE_ENV=development|staging|production
NEXT_PUBLIC_APP_URL=https://app.abrinsights.ca
NEXT_PUBLIC_APP_NAME="ABR Insights"
NEXT_PUBLIC_APP_VERSION=2.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 2. Supabase Configuration

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Database (optional, for direct connections)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

**Usage**:

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - use only in server-side code
- Never commit these values to git

### 3. Azure OpenAI Configuration

```bash
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Embeddings
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=text-embedding-ada-002
AZURE_OPENAI_EMBEDDINGS_DIMENSIONS=1536
```

**Usage**:

- Used by Azure Functions and API routes for AI features
- Never expose API keys to client-side code
- Rotate keys quarterly

### 4. Stripe Configuration

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products & Prices (from Stripe Dashboard)
STRIPE_PRICE_ID_FREE=price_... # Free tier price ID
STRIPE_PRICE_ID_PROFESSIONAL=price_... # Professional tier
STRIPE_PRICE_ID_ENTERPRISE=price_... # Enterprise tier

# Tax
STRIPE_TAX_CALCULATION_ID=txcd_...
```

**Usage**:

- Use test keys in dev/staging, live keys in production
- Webhook secret validates incoming webhook events
- Price IDs must match Stripe Dashboard configuration

### 5. Email Configuration (SendGrid)

```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@abrinsights.ca
SENDGRID_FROM_NAME="ABR Insights"

# Template IDs
SENDGRID_TEMPLATE_WELCOME=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_PASSWORD_RESET=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_COURSE_COMPLETION=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_INVOICE=d-xxxxxxxxxxxxx
```

**Usage**:

- Used by Azure Functions for transactional emails
- Create templates in SendGrid dashboard
- Test with SendGrid sandbox mode in staging

### 6. Azure Storage Configuration

```bash
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=abrstorage
AZURE_STORAGE_ACCOUNT_KEY=your-account-key
AZURE_STORAGE_CONTAINER_UPLOADS=user-uploads
AZURE_STORAGE_CONTAINER_CERTIFICATES=certificates
```

**Usage**:

- Used for large file uploads, certificate generation
- Supabase Storage used for smaller files (images, documents)
- CDN enabled for public assets

### 7. Azure Functions Configuration

```bash
# Azure Functions
AZURE_FUNCTIONS_URL=https://abr-functions.azurewebsites.net
AZURE_FUNCTIONS_KEY=your-function-key

# Specific function endpoints
AZURE_FUNCTION_TRIBUNAL_INGESTION=/api/tribunal-ingestion
AZURE_FUNCTION_AI_CLASSIFICATION=/api/ai-classification
AZURE_FUNCTION_STRIPE_WEBHOOK=/api/stripe-webhook
AZURE_FUNCTION_ANALYTICS=/api/analytics-aggregation
AZURE_FUNCTION_EMAIL=/api/email-sender
AZURE_FUNCTION_CERTIFICATE=/api/certificate-generator
AZURE_FUNCTION_REPORT=/api/report-generator
```

**Usage**:

- Called from API routes for serverless operations
- Function key provides authentication
- Monitor invocations in Azure Portal

### 8. Analytics & Monitoring

```bash
# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATION_KEY=your-key

# Error Tracking (optional)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-auth-token
```

**Usage**:

- Application Insights tracks performance, errors, custom events
- Sentry optional for enhanced error tracking
- Monitor dashboards in Azure Portal

### 9. Authentication (Azure AD B2C)

```bash
# Azure AD B2C (optional SSO)
AZURE_AD_B2C_TENANT_NAME=abrinsights
AZURE_AD_B2C_CLIENT_ID=your-client-id
AZURE_AD_B2C_CLIENT_SECRET=your-client-secret
AZURE_AD_B2C_PRIMARY_USER_FLOW=B2C_1_signupsignin
AZURE_AD_B2C_PASSWORD_RESET_FLOW=B2C_1_password_reset
```

**Usage**:

- Optional: Enable SSO for enterprise customers
- Supabase Auth is primary authentication method
- B2C provides additional enterprise features

### 10. Rate Limiting & Security

```bash
# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars
CORS_ORIGIN=https://app.abrinsights.ca,https://staging.abrinsights.ca

# API Keys for webhook verification
WEBHOOK_SECRET=your-webhook-secret
```

**Usage**:

- Rate limiting protects against abuse
- JWT/encryption keys must be cryptographically strong
- CORS restricts API access to trusted domains

---

## Environment-Specific Configs

### Development (`.env.local`)

```bash
# .env.local (local development)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (use project-specific dev instance)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...dev-service-key...

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Azure OpenAI (shared dev resource)
AZURE_OPENAI_ENDPOINT=https://abr-dev.openai.azure.com
AZURE_OPENAI_API_KEY=dev-api-key

# SendGrid (sandbox mode)
SENDGRID_API_KEY=SG.dev-key

# Feature Flags (enable all for testing)
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Staging (Azure Static Web Apps Config)

```bash
# Staging environment (Azure SWA Configuration)
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.abrinsights.ca

# Supabase (staging instance)
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...staging-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...staging-service-key... # In Key Vault

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... # In Key Vault
STRIPE_WEBHOOK_SECRET=whsec_test_... # In Key Vault

# Azure OpenAI (staging resource)
AZURE_OPENAI_ENDPOINT=https://abr-staging.openai.azure.com
AZURE_OPENAI_API_KEY=staging-api-key # In Key Vault

# Feature Flags (all enabled for QA testing)
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Production (Azure Static Web Apps Config)

```bash
# Production environment (Azure SWA Configuration)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.abrinsights.ca

# Supabase (production instance)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...prod-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...prod-service-key... # In Key Vault

# Stripe (live mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_... # In Key Vault
STRIPE_WEBHOOK_SECRET=whsec_live_... # In Key Vault

# Azure OpenAI (production resource)
AZURE_OPENAI_ENDPOINT=https://abr-prod.openai.azure.com
AZURE_OPENAI_API_KEY=prod-api-key # In Key Vault

# Feature Flags (stable features only)
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Secrets Management

### Azure Key Vault

**Setup**:

1. Create Key Vault in Azure Portal
2. Enable managed identity for Azure Static Web Apps
3. Grant Static Web App access to Key Vault
4. Store secrets in Key Vault

**Key Vault Structure**:

```
abr-insights-keyvault/
├── Secrets
│   ├── supabase-service-role-key
│   ├── stripe-secret-key
│   ├── stripe-webhook-secret
│   ├── azure-openai-api-key
│   ├── sendgrid-api-key
│   ├── azure-storage-connection-string
│   ├── jwt-secret
│   └── encryption-key
```

**Access Secrets in Azure Functions**:

```typescript
// Example: Azure Function accessing Key Vault
import { SecretClient } from '@azure/keyvault-secrets'
import { DefaultAzureCredential } from '@azure/identity'

const credential = new DefaultAzureCredential()
const vaultUrl = `https://abr-insights-keyvault.vault.azure.net`
const client = new SecretClient(vaultUrl, credential)

// Retrieve secret
const secret = await client.getSecret('stripe-secret-key')
const stripeKey = secret.value
```

### GitHub Secrets (CI/CD)

**Required Secrets**:

```
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING
AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION
SUPABASE_ACCESS_TOKEN (for migrations)
AZURE_CREDENTIALS (for Azure CLI)
```

**Setup**:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add repository secrets
3. Reference in `.github/workflows/*.yml`

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/anungis437/abr-insights-app.git
cd abr-insights-app
```

### Step 2: Copy Environment Template

```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

### Step 3: Fill in Local Values

Edit `.env.local` with your development credentials:

```bash
# Get Supabase credentials from: https://app.supabase.com/project/your-project/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get Azure OpenAI keys from: https://portal.azure.com
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run Database Migrations

```bash
# Apply Supabase migrations
npm run db:migrate

# Or manually in Supabase dashboard SQL editor
```

### Step 6: Seed Database (Optional)

```bash
npm run db:seed
```

### Step 7: Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Azure Configuration

### Azure Static Web Apps Configuration

**Location**: `staticwebapp.config.json` (committed to repo)

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/404.html"
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'"
  }
}
```

### Environment Variables in Azure Portal

**Set via Azure Portal**:

1. Go to: Azure Static Web Apps → Configuration → Application settings
2. Add environment variables (non-sensitive only)
3. For secrets, reference Key Vault

**Example**:

```
NEXT_PUBLIC_APP_URL = https://app.abrinsights.ca
NEXT_PUBLIC_SUPABASE_URL = https://prod.supabase.co
SUPABASE_SERVICE_ROLE_KEY = @Microsoft.KeyVault(SecretUri=https://vault.azure.net/secrets/supabase-key/)
```

The `@Microsoft.KeyVault()` syntax references Key Vault secrets.

---

## Security Best Practices

### 1. Never Commit Secrets

**Protect sensitive files**:

```bash
# .gitignore (already configured)
.env.local
.env.*.local
.env.production
*.key
*.pem
```

**Scan for leaked secrets**:

```bash
# Install git-secrets
git secrets --install
git secrets --register-aws
```

### 2. Rotate Secrets Regularly

**Rotation Schedule**:

- Database credentials: Every 90 days
- API keys: Every 90 days
- JWT secrets: Every 180 days
- Encryption keys: Every 365 days

**Document rotation in**:

- Azure Key Vault (expiration dates)
- Team calendar (reminders)

### 3. Principle of Least Privilege

**Access Control**:

- Developers: Read-only access to staging secrets
- CI/CD: Write access only to specific secrets
- Production: Restricted to ops team only

### 4. Audit Logging

**Enable audit logs**:

- Azure Key Vault access logs
- Supabase audit logs
- GitHub Actions logs

**Monitor for**:

- Unusual access patterns
- Failed authentication attempts
- Unauthorized secret retrievals

### 5. Encryption at Rest & Transit

**Requirements**:

- All secrets encrypted in Key Vault (AES-256)
- TLS 1.3 for all API communications
- Database connections use SSL
- Storage accounts use HTTPS only

---

## Environment Variable Reference

### Complete `.env.example` Template

```bash
##############################################
# ABR Insights - Environment Configuration
# Copy to .env.local and fill in your values
##############################################

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="ABR Insights"
NEXT_PUBLIC_APP_VERSION=2.0.0

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=text-embedding-ada-002

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FREE=price_...
STRIPE_PRICE_ID_PROFESSIONAL=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@abrinsights.ca
SENDGRID_FROM_NAME="ABR Insights"
SENDGRID_TEMPLATE_WELCOME=d-xxxxx
SENDGRID_TEMPLATE_PASSWORD_RESET=d-xxxxx
SENDGRID_TEMPLATE_COURSE_COMPLETION=d-xxxxx

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=abrstorage
AZURE_STORAGE_CONTAINER_UPLOADS=user-uploads
AZURE_STORAGE_CONTAINER_CERTIFICATES=certificates

# Azure Functions
AZURE_FUNCTIONS_URL=https://abr-functions.azurewebsites.net
AZURE_FUNCTIONS_KEY=your-function-key

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATION_KEY=your-key

# Security
JWT_SECRET=your-jwt-secret-minimum-32-characters
ENCRYPTION_KEY=your-encryption-key-32-chars
CORS_ORIGIN=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

---

## Troubleshooting

### Common Issues

**1. "Supabase client not initialized"**

**Solution**:

- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Ensure variables start with `NEXT_PUBLIC_` (exposed to browser)
- Restart dev server after changing `.env.local`

**2. "Stripe webhook signature verification failed"**

**Solution**:

- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**3. "Azure OpenAI 401 Unauthorized"**

**Solution**:

- Check `AZURE_OPENAI_API_KEY` is correct
- Verify endpoint URL includes `https://`
- Ensure API key hasn't expired or been rotated

**4. "Environment variables not loading in Azure"**

**Solution**:

- Check Azure Static Web Apps → Configuration → Application settings
- Verify Key Vault references use correct syntax: `@Microsoft.KeyVault(...)`
- Ensure managed identity has Key Vault access

---

## Next Steps

1. **Copy `.env.example` to `.env.local`** and fill in development values
2. **Set up Azure Key Vault** for staging/production secrets
3. **Configure GitHub Secrets** for CI/CD workflows
4. **Test local environment** with `npm run dev`
5. **Deploy to staging** and verify environment variables load correctly

---

**Document Status**: ✅ Complete
**Owner**: DevOps Team
**Last Review**: November 5, 2025
**Next Review**: Quarterly (security audit)
