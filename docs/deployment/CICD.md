# CI/CD Pipeline Documentation

## Overview

This document details the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the ABR Insights application using GitHub Actions and Azure Static Web Apps.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   GitHub (Source Control)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pull Request │  │ Push to Main │  │ Tag Release  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               GitHub Actions (CI/CD Orchestration)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               CI Pipeline (Validation)                │  │
│  │  - Checkout code                                      │  │
│  │  - Install dependencies                               │  │
│  │  - Run linters (ESLint, Prettier)                    │  │
│  │  - Run unit tests (Jest/Vitest)                      │  │
│  │  - Run integration tests                             │  │
│  │  - Build application                                  │  │
│  │  - Run E2E tests (Playwright)                        │  │
│  │  - Security scanning (npm audit, Snyk)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CD Pipeline (Deployment)                 │  │
│  │  - Build production bundle                            │  │
│  │  - Deploy to Azure Static Web Apps                   │  │
│  │  - Run smoke tests                                    │  │
│  │  - Notify team (Slack/Email)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (Hosting)                 │
│  - Staging Environment (develop branch)                      │
│  - Production Environment (main branch)                      │
│  - Preview Environments (pull requests)                      │
└─────────────────────────────────────────────────────────────┘
```

## GitHub Actions Workflows

### 1. CI Workflow (Continuous Integration)

**File:** `.github/workflows/ci.yml`

```yaml
name: CI - Continuous Integration

on:
  pull_request:
    branches:
      - main
      - develop
  push:
    branches:
      - main
      - develop

env:
  NODE_VERSION: '18.x'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier
        run: npm run format:check

      - name: Lint Markdown
        run: npx markdownlint-cli2 "docs/**/*.md"

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: .next/
          retention-days: 7

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: .next/

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 2. CD Workflow (Continuous Deployment)

**File:** `.github/workflows/azure-static-web-apps.yml`

```yaml
name: CD - Deploy to Azure Static Web Apps

on:
  push:
    branches:
      - main
      - develop
  workflow_dispatch:

env:
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
      url: ${{ steps.deploy.outputs.static_web_app_url }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
          NEXT_PUBLIC_ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

      - name: Deploy to Azure Static Web Apps
        id: deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          api_location: 'api'
          output_location: '.next'
          skip_app_build: true

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: ${{ steps.deploy.outputs.static_web_app_url }}

      - name: Notify Slack on success
        if: success() && github.ref == 'refs/heads/main'
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "✅ Deployment to production successful!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Successful*\n\n*Environment:* Production\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*URL:* ${{ steps.deploy.outputs.static_web_app_url }}"
                  }
                }
              ]
            }

      - name: Notify Slack on failure
        if: failure() && github.ref == 'refs/heads/main'
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "❌ Deployment to production failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed*\n\n*Environment:* Production\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*Workflow:* ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

### 3. PR Preview Workflow

**File:** `.github/workflows/pr-preview.yml`

```yaml
name: PR Preview - Deploy Preview Environment

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
      - develop

env:
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy-preview:
    name: Build and Deploy PR Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_ENVIRONMENT: preview

      - name: Deploy to Azure Static Web Apps (Preview)
        id: deploy-preview
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          api_location: 'api'
          output_location: '.next'
          skip_app_build: true
          deployment_environment: 'pr-${{ github.event.pull_request.number }}'

      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Preview Deployment Ready!**\n\n📍 **URL:** ${{ steps.deploy-preview.outputs.static_web_app_url }}\n\n✅ Build completed successfully. Test your changes before merging.`
            })

  close-preview:
    name: Close PR Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    steps:
      - name: Close Azure Static Web Apps Preview
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: 'close'
          deployment_environment: 'pr-${{ github.event.pull_request.number }}'
```

## GitHub Secrets Configuration

### Required Secrets

Navigate to **GitHub Repository → Settings → Secrets and variables → Actions** and add:

#### Azure Secrets

```
AZURE_STATIC_WEB_APPS_API_TOKEN
  - Description: Deployment token for Azure Static Web Apps
  - Source: Azure Portal or Azure CLI
  - Value: Retrieved from Azure SWA resource
```

#### Supabase Secrets

```
NEXT_PUBLIC_SUPABASE_URL
  - Description: Public Supabase project URL
  - Value: https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Description: Public anonymous key for client-side
  - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

TEST_SUPABASE_URL
  - Description: Test/staging Supabase URL
  - Value: https://test-project.supabase.co

TEST_SUPABASE_ANON_KEY
  - Description: Test/staging anonymous key
  - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Site Configuration

```
NEXT_PUBLIC_SITE_URL
  - Description: Production site URL
  - Value: https://app.abrinsights.ca
```

#### External Services

```
CODECOV_TOKEN
  - Description: Code coverage reporting token
  - Source: codecov.io
  - Value: Retrieved from Codecov dashboard

SNYK_TOKEN
  - Description: Security scanning token
  - Source: snyk.io
  - Value: Retrieved from Snyk account settings

SLACK_WEBHOOK_URL
  - Description: Slack webhook for deployment notifications
  - Source: Slack App configuration
  - Value: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
```

### Environment-Specific Secrets

Create separate environments in GitHub:

**Production Environment:**

- Protection rules: Require approval from 1 reviewer
- Secrets: Production Supabase, Stripe live keys

**Staging Environment:**

- Protection rules: None (auto-deploy)
- Secrets: Staging Supabase, Stripe test keys

## Branch Strategy

### Main Branches

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (preview environments)
```

### Branch Protection Rules

**Main Branch:**

- Require pull request reviews (min 1)
- Require status checks to pass:
  - CI - Lint
  - CI - Test
  - CI - Build
  - CI - E2E
  - CI - Security
- Require branches to be up to date
- Require linear history
- Do not allow bypassing the above settings

**Develop Branch:**

- Require pull request reviews (min 1)
- Require status checks to pass (same as main)
- Allow force pushes from admins only

## Deployment Environments

### 1. Development (Local)

- **Branch:** Any feature branch
- **URL:** http://localhost:3000
- **Supabase:** Local or shared dev instance
- **Purpose:** Local development and testing

### 2. Preview (PR Environments)

- **Branch:** Pull request branches
- **URL:** `https://abr-insights-app-pr-{number}.azurestaticapps.net`
- **Supabase:** Test/staging instance
- **Purpose:** Review changes before merging
- **Lifecycle:** Created on PR open, destroyed on PR close

### 3. Staging (Develop Branch)

- **Branch:** develop
- **URL:** https://staging.abrinsights.ca
- **Supabase:** Staging instance
- **Purpose:** Pre-production testing
- **Auto-deploy:** Yes

### 4. Production (Main Branch)

- **Branch:** main
- **URL:** https://app.abrinsights.ca
- **Supabase:** Production instance
- **Purpose:** Live application
- **Auto-deploy:** Yes (with approval gates)

## Rollback Strategy

### Automatic Rollback

If smoke tests fail after deployment:

```yaml
- name: Run smoke tests
  id: smoke-tests
  run: npm run test:smoke
  continue-on-error: true

- name: Rollback on failure
  if: steps.smoke-tests.outcome == 'failure'
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    action: 'close'
```

### Manual Rollback

```bash
# List recent deployments
az staticwebapp show \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --query "repositoryUrl"

# Trigger redeployment of previous commit
git revert HEAD
git push origin main
```

## Monitoring & Alerts

### GitHub Actions Notifications

Configure notifications in `.github/workflows/notify.yml`:

```yaml
- name: Send deployment metrics
  uses: actions/github-script@v6
  with:
    script: |
      const deployment = {
        environment: '${{ github.ref }}',
        status: '${{ job.status }}',
        duration: '${{ steps.deploy.outputs.duration }}',
        commit: '${{ github.sha }}'
      };
      console.log(JSON.stringify(deployment));
```

### Slack Integration

Add Slack webhook URL to secrets and use in workflows:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Deployment notification",
        "blocks": [...]
      }
```

## Performance Optimization

### Build Caching

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Jobs

Run independent jobs in parallel:

```yaml
jobs:
  lint:
    # ...
  test:
    needs: lint # Sequential
  security:
    # Parallel with test
```

## Troubleshooting

### Build Failures

**Check workflow logs:**

```bash
gh run list --workflow=ci.yml
gh run view <run-id> --log
```

**Common issues:**

- Missing environment variables
- Node.js version mismatch
- Dependency conflicts
- Test failures

### Deployment Failures

**Check Azure SWA logs:**

```bash
az staticwebapp logs show \
  --name abr-insights-app \
  --resource-group abr-insights-rg
```

**Common issues:**

- Invalid API token
- Build output location incorrect
- Environment variables not set
- DNS configuration issues

### Secret Management

**Test secrets locally:**

```bash
# Create .env.test
cp .env.example .env.test

# Load secrets from GitHub
gh secret list
gh secret set NEXT_PUBLIC_SUPABASE_URL --env-file .env.test
```

## Best Practices

1. **Atomic Commits:** Each commit should be deployable
2. **Fast Feedback:** Keep CI pipeline under 10 minutes
3. **Fail Fast:** Run linting before tests
4. **Parallel Execution:** Run independent jobs in parallel
5. **Caching:** Cache dependencies and build artifacts
6. **Security:** Scan for vulnerabilities on every commit
7. **Notifications:** Alert team on deployment status
8. **Rollback Plan:** Always have a rollback strategy
9. **Documentation:** Keep CI/CD docs up to date
10. **Monitoring:** Track deployment metrics

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Static Web Apps CI/CD](https://docs.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Codecov GitHub Actions](https://github.com/codecov/codecov-action)

---

**Last Updated:** 2025-11-05
**Maintainer:** Development Team
**Review Cycle:** Monthly
