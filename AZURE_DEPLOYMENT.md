# Azure Static Web Apps Deployment Guide

## Overview
This guide covers deploying the ABR Insights application to Azure Static Web Apps.

## Prerequisites
- Azure account with active subscription
- GitHub account with repository access
- Node.js 18+ installed locally

## Azure Portal Setup

### 1. Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Static Web App** and select it
4. Click **Create**

### 2. Configure Basic Settings

**Basics Tab:**
- **Subscription**: Select your subscription
- **Resource Group**: Create new or select existing (e.g., `rg-abr-insights`)
- **Name**: `abr-insights-app` (or your preferred name)
- **Plan Type**: Choose **Free** (for testing) or **Standard** (for production)
- **Region**: Select closest to your users (e.g., `Canada Central`, `East US 2`)
- **Deployment Source**: Select **GitHub**

### 3. GitHub Integration

**GitHub Tab:**
- Click **Sign in with GitHub** and authorize Azure
- **Organization**: `anungis437`
- **Repository**: `abr-insights-app`
- **Branch**: `main`

**Build Details:**
- **Build Presets**: Select **Next.js**
- **App location**: `/` (root)
- **Api location**: Leave empty
- **Output location**: `.next`

### 4. Review and Create

- Click **Review + create**
- Review the configuration
- Click **Create**

Azure will:
1. Create the Static Web App resource
2. Add a GitHub Actions workflow to your repository
3. Automatically trigger the first deployment

## GitHub Secrets Configuration

After Azure creates the resource, configure these secrets in your GitHub repository:

### Navigate to Repository Settings
1. Go to `https://github.com/anungis437/abr-insights-app/settings/secrets/actions`
2. Click **New repository secret** for each:

### Required Secrets

#### AZURE_STATIC_WEB_APPS_API_TOKEN
- **Value**: Copy from Azure Portal → Your Static Web App → Overview → "Manage deployment token"
- This is automatically added by Azure, but verify it exists

#### NEXT_PUBLIC_SUPABASE_URL
```
https://nuywgvbkgdvngrysqdul.supabase.co
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNjE0NDksImV4cCI6MjA3NzkzNzQ0OX0.w88Nix_a3IG1Iy3rVIkvC5Fa8Pe79mKtFY00cLtaiSM
```

#### NEXT_PUBLIC_APP_URL
```
https://YOUR-APP-NAME.azurestaticapps.net
```
*Replace with your actual Azure Static Web App URL after creation*

#### SUPABASE_SERVICE_ROLE_KEY (Optional - for server-side operations)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI
```

## Environment Variables in Azure Portal

Configure environment variables in Azure:

1. Go to Azure Portal → Your Static Web App
2. Click **Configuration** in left menu
3. Add Application Settings:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nuywgvbkgdvngrysqdul.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `NEXT_PUBLIC_APP_URL` | Your Azure Static Web App URL |
| `NEXT_PUBLIC_APP_NAME` | `ABR Insights` |
| `NEXT_PUBLIC_APP_VERSION` | `2.0.0` |
| `NODE_ENV` | `production` |

## Deployment Process

### Automatic Deployment

Every push to `main` branch automatically triggers deployment:

1. GitHub Actions workflow runs
2. Installs dependencies (`npm ci`)
3. Builds Next.js app (`npm run build`)
4. Deploys to Azure Static Web Apps

### Manual Deployment

To manually trigger deployment:

```bash
# Commit and push changes
git add .
git commit -m "Deploy to Azure"
git push origin main
```

### Monitor Deployment

1. Go to GitHub → Actions tab
2. View the "Azure Static Web Apps CI/CD" workflow
3. Check build logs for errors

Or in Azure Portal:
1. Go to your Static Web App
2. Click **Environments** → **Production**
3. View deployment history and logs

## Custom Domain Setup (Optional)

### Add Custom Domain

1. In Azure Portal → Your Static Web App
2. Click **Custom domains** in left menu
3. Click **+ Add** → **On Azure DNS** or **On other DNS**
4. Follow the wizard to:
   - Add CNAME record to your DNS provider
   - Validate domain ownership
   - Enable SSL certificate (free, automatic)

Example DNS Configuration:
```
Type: CNAME
Name: www (or @)
Value: YOUR-APP-NAME.azurestaticapps.net
TTL: 3600
```

## Authentication Configuration

Azure Static Web Apps provides built-in authentication:

### Enable Auth Providers

1. In Azure Portal → Your Static Web App
2. Click **Authentication** in left menu
3. Configure providers:
   - **Azure AD**: For organizational accounts
   - **GitHub**: For GitHub users
   - **Twitter**: For social login

### Auth Routes

Built-in routes:
- `/.auth/login/aad` - Azure AD login
- `/.auth/login/github` - GitHub login
- `/.auth/logout` - Logout
- `/.auth/me` - Get current user info

## Post-Deployment Verification

### 1. Check Application Health

Visit your app URL and verify:
- ✅ Home page loads
- ✅ Navigation works
- ✅ Auth pages accessible
- ✅ Protected routes redirect to login
- ✅ API routes respond

### 2. Test Supabase Connection

1. Navigate to `/auth/signup`
2. Create a test account
3. Verify database entry in Supabase dashboard

### 3. Check Console for Errors

Open browser DevTools:
- No JavaScript errors
- No 404s for assets
- Environment variables loaded correctly

## Troubleshooting

### Build Fails

**Error**: "Module not found" or dependency issues
```bash
# Locally, clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Not Working

- Verify secrets are set in GitHub (Settings → Secrets)
- Ensure secret names match exactly (case-sensitive)
- Redeploy after adding secrets

### 404 Errors on Refresh

- Verify `staticwebapp.config.json` has navigation fallback
- Check `output_location` in GitHub Actions workflow matches `.next`

### API Routes Not Working

- Azure Static Web Apps has limitations with Next.js API routes
- Consider using Azure Functions for complex APIs
- Verify `api_location` is empty in workflow if not using managed functions

## Monitoring and Logs

### View Application Logs

```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Get logs
az staticwebapp logs show \
  --name abr-insights-app \
  --resource-group rg-abr-insights
```

### Application Insights (Optional)

1. Create Application Insights resource
2. Link to Static Web App
3. View:
   - Page views
   - Performance metrics
   - Exceptions
   - User analytics

## Cost Optimization

### Free Tier Limits
- 100 GB bandwidth/month
- 0.5 GB storage
- Custom domains: 2
- Staging environments: 3

### Standard Tier Features
- 100 GB bandwidth included
- 10 GB storage
- Unlimited custom domains
- Unlimited staging environments
- SLA: 99.95%

## Staging Environments

Each pull request automatically gets a staging environment:

1. Create a PR on GitHub
2. GitHub Actions creates staging deployment
3. Comment on PR with staging URL
4. Test changes before merging
5. Staging environment deleted when PR closes

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate API keys regularly

### 2. Content Security Policy
Configured in `staticwebapp.config.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection enabled

### 3. HTTPS
- Automatic SSL certificate
- Force HTTPS (enabled by default)

## Rollback Procedure

If deployment fails:

1. Go to Azure Portal → Your Static Web App
2. Click **Environments** → **Production**
3. Select previous successful deployment
4. Click **Promote** to rollback

Or via GitHub:
1. Revert the commit
2. Push to main branch
3. New deployment automatically triggers

## Support Resources

- [Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Documentation](https://supabase.com/docs)

## Next Steps

After successful deployment:

1. ✅ Set up custom domain
2. ✅ Configure Application Insights
3. ✅ Enable Azure AD authentication
4. ✅ Set up automated backups for Supabase
5. ✅ Configure CDN for static assets
6. ✅ Set up monitoring alerts
7. ✅ Create staging environment workflow

---

## Quick Reference

### Deployment URLs
- **Production**: `https://YOUR-APP-NAME.azurestaticapps.net`
- **Staging (PR #123)**: `https://YOUR-APP-NAME-123.azurestaticapps.net`

### Important Files
- `.github/workflows/azure-static-web-apps.yml` - CI/CD workflow
- `staticwebapp.config.json` - Azure configuration
- `next.config.js` - Next.js configuration
- `.env.local` - Local environment variables (not committed)

### Common Commands
```bash
# Build locally
npm run build

# Test production build
npm run start

# Deploy (push to main)
git push origin main

# View deployment logs
az staticwebapp logs show --name abr-insights-app --resource-group rg-abr-insights
```
