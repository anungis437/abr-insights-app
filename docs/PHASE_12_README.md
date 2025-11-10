# Phase 12 Quick Start Guide

**Version:** 1.0  
**Date:** November 9, 2025

---

## Overview

Phase 12 is ABR Insights' transformation into a world-class, production-ready platform. This guide provides quick-start instructions for developers joining Phase 12 work.

**Primary Objectives:**
- 🛡️ **Production Hardening:** Testing, security, monitoring, CI/CD
- 💰 **Monetization:** Complete Stripe integration
- 🎨 **Product Excellence:** Close UX gaps, competitor parity
- 🚀 **Operational Excellence:** Observability, performance, reliability

**Timeline:** 12 weeks (Nov 2025 - Feb 2026)

---

## Getting Started

### 1. Read the Master Plan

Start by reviewing the comprehensive roadmap:
- **[PHASE_12_PLAN.md](../PHASE_12_PLAN.md)** — Full technical and product roadmap

Key sections to review:
- Critical technical gaps (testing, security, monitoring)
- Product feature gaps (Stripe, onboarding, ingestion, instructor portal)
- Quality gates and success criteria
- Timeline and ownership

### 2. Set Up Your Environment

Ensure you have the development environment ready:

```powershell
# Clone the repository (if not already done)
git clone https://github.com/anungis437/abr-insights-app.git
cd abr-insights-app

# Switch to the phase-12 branch
git checkout phase-12
git pull origin phase-12

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local config

# Run development server
npm run dev
```

**Required tools:**
- Node.js 18+ and npm
- Git
- PowerShell (for automation scripts)
- Azure CLI (for deployment)
- Supabase CLI (for database migrations)

### 3. Understand the Branch Strategy

Phase 12 uses a structured branching model:

```
main (production)
  ↑
  └── phase-12 (integration branch for Phase 12)
        ↑
        ├── feature/testing-infrastructure
        ├── feature/rate-limiting
        ├── feature/stripe-checkout
        ├── feature/onboarding-flow
        └── ... (other feature branches)
```

**Workflow:**
1. Create feature branches from `phase-12` (not `main`)
2. Work on your feature with incremental commits
3. Open PR to merge feature → `phase-12`
4. After review and CI passes, merge to `phase-12`
5. Periodically merge `phase-12` → `main` (with Product Manager approval)

**Branch naming conventions:**
- `feature/` — New features (e.g., `feature/stripe-checkout`)
- `fix/` — Bug fixes (e.g., `fix/rate-limiting-edge-case`)
- `refactor/` — Code refactoring (e.g., `refactor/api-validation`)
- `test/` — Test additions (e.g., `test/auth-unit-tests`)
- `docs/` — Documentation updates (e.g., `docs/api-swagger`)

### 4. Repository Cleanup (Optional)

Before starting Phase 12 work, you may want to clean up legacy files:

```powershell
# Dry-run to see what would be archived
.\scripts\phase12_cleanup.ps1

# Actually perform the cleanup (after reviewing)
.\scripts\phase12_cleanup.ps1 -Run
```

This script safely archives:
- Legacy `write-*.js` scripts
- Old migration files
- Outdated Phase completion markers
- Temporary diagnostic files

Archived files are moved to `archive/phase12_cleanup_TIMESTAMP/` with a manifest.

---

## Development Workflow

### Creating a Feature Branch

```powershell
# Ensure you're on phase-12 and up to date
git checkout phase-12
git pull origin phase-12

# Create your feature branch
git checkout -b feature/your-feature-name

# Make changes, commit frequently
git add .
git commit -m "feat(scope): descriptive commit message"

# Push to remote
git push -u origin feature/your-feature-name
```

### Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <short summary>

<detailed description (optional)>

<footer (optional)>
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `test:` — Adding tests
- `refactor:` — Code refactoring
- `docs:` — Documentation
- `chore:` — Maintenance tasks
- `perf:` — Performance improvement
- `ci:` — CI/CD changes

**Examples:**
```
feat(stripe): implement subscription checkout flow
fix(auth): prevent token expiration edge case
test(api): add unit tests for rate limiting middleware
refactor(courses): extract quiz logic to service layer
docs(api): add OpenAPI schema for user endpoints
```

### Opening a Pull Request

When your feature is ready:

1. **Push your branch** to GitHub
2. **Open PR** targeting `phase-12` (not `main`)
3. **Fill out PR template** with:
   - Description of changes
   - Related issue/ticket number
   - Testing performed
   - Screenshots (for UI changes)
   - Checklist of requirements met

4. **Request reviews** from at least 2 team members
5. **Address feedback** and update PR
6. **Merge** once approved and CI passes

**PR Requirements (must pass):**
- ✅ All CI checks green (lint, type-check, tests)
- ✅ No merge conflicts
- ✅ At least 2 approving reviews
- ✅ Test coverage ≥80% for new code
- ✅ Documentation updated (if needed)

---

## Quality Gates

All code merged to `phase-12` must meet these standards:

### Code Quality
- ✅ **Linting:** `npm run lint` passes
- ✅ **Type checking:** `npm run type-check` passes (TypeScript strict mode)
- ✅ **Formatting:** Code formatted with Prettier
- ✅ **No console logs** in production code (use proper logging)

### Testing
- ✅ **Unit tests:** All business logic covered
- ✅ **Integration tests:** API endpoints tested
- ✅ **E2E tests:** Critical user journeys covered (Playwright)
- ✅ **Test coverage:** ≥80% for new code, ≥70% overall

Run tests:
```powershell
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Security
- ✅ **No vulnerabilities:** `npm audit` shows no high/critical issues
- ✅ **Input validation:** All user inputs validated with Zod
- ✅ **Auth checks:** Protected routes have proper RBAC
- ✅ **Secrets:** No hardcoded secrets or API keys

### Performance
- ✅ **Bundle size:** No significant increase (check CI report)
- ✅ **Lighthouse score:** Performance ≥90 for key pages
- ✅ **API latency:** p95 <200ms for critical endpoints

---

## Common Tasks

### Running the Application Locally

```powershell
# Development mode (hot reload)
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Database Operations

```powershell
# Run migrations
npx supabase db push

# Reset database (CAUTION: deletes all data)
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --local > lib/supabase/database.types.ts

# Seed database with test data
npm run db:seed
```

### Running Scripts

```powershell
# Repository cleanup
.\scripts\phase12_cleanup.ps1           # Dry-run
.\scripts\phase12_cleanup.ps1 -Run      # Execute

# Check AI configuration
npx tsx scripts/check-ai-config.ts

# Validate RBAC setup
npx tsx scripts/validate-rbac.ts

# Apply specific migration
npx tsx scripts/apply-migration.ts <migration-file>
```

---

## Testing Strategy

Phase 12 establishes comprehensive test coverage:

### Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\  Integration Tests (30%)
     /      \  Unit Tests (60%)
    /________\
```

### Test Types

1. **Unit Tests** (`*.test.ts`)
   - Test individual functions/components in isolation
   - Mock external dependencies
   - Fast execution (<1ms per test)
   - Location: Co-located with source files

2. **Integration Tests** (`*.integration.test.ts`)
   - Test API endpoints with real database (test instance)
   - Test service layer interactions
   - Moderate execution time
   - Location: `__tests__/integration/`

3. **E2E Tests** (`*.spec.ts`)
   - Test complete user journeys in browser
   - Use Playwright
   - Slower execution
   - Location: `tests/e2e/`

4. **Visual Regression Tests**
   - Automated screenshot comparison
   - Catch unintended UI changes
   - Location: `tests/visual/`

### Writing Tests

**Example Unit Test:**
```typescript
// lib/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

**Example Integration Test:**
```typescript
// app/api/courses/__tests__/route.integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { testApiHandler } from '@/tests/utils/test-api-handler';
import { GET } from '../route';

describe('GET /api/courses', () => {
  it('should return all courses for authenticated user', async () => {
    const response = await testApiHandler(GET, {
      headers: { Authorization: 'Bearer <test-token>' }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.courses).toBeInstanceOf(Array);
  });
});
```

**Example E2E Test:**
```typescript
// tests/e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test';

test('user can enroll in a course', async ({ page }) => {
  await page.goto('/courses');
  await page.click('text=Enroll in Course');
  await expect(page.locator('.enrollment-success')).toBeVisible();
});
```

---

## Monitoring & Observability

Phase 12 activates comprehensive observability:

### Application Insights

All API routes automatically send telemetry:
- Request/response times
- Error rates and stack traces
- Custom business metrics (course completions, quiz scores)
- User session tracking

**Viewing logs:**
```powershell
# Azure CLI
az monitor app-insights query \
  --app <app-insights-name> \
  --analytics-query "requests | where timestamp > ago(1h)"
```

### Structured Logging

Use the logger utility for consistent logging:
```typescript
import { logger } from '@/lib/utils/logger';

logger.info('User enrolled in course', { 
  userId, 
  courseId, 
  timestamp: new Date() 
});

logger.error('Payment failed', { 
  error, 
  userId, 
  amount,
  correlationId 
});
```

### Alerts

Configured alerts for:
- Error rate >1% over 5 minutes
- API latency p95 >500ms
- Database connection failures
- Payment webhook failures

---

## CI/CD Pipeline

Phase 12 implements automated workflows:

### Pull Request Checks

When you open a PR, GitHub Actions automatically:
1. ✅ Runs linting (`npm run lint`)
2. ✅ Runs type checking (`npm run type-check`)
3. ✅ Runs unit and integration tests (`npm test`)
4. ✅ Runs security scanning (Snyk, Dependabot)
5. ✅ Builds the application (`npm run build`)
6. ✅ Runs E2E tests (`npm run test:e2e`)
7. ✅ Generates coverage report
8. ✅ Checks bundle size impact

All checks must pass before PR can be merged.

### Deployment Pipeline

Merges to `main` trigger:
1. Build for production
2. Deploy to staging environment
3. Run smoke tests
4. Deploy to production (blue-green deployment)
5. Monitor for errors, auto-rollback if needed

---

## Resources

### Documentation
- [PHASE_12_PLAN.md](../PHASE_12_PLAN.md) — Master plan and roadmap
- [README.md](../README.md) — Project overview
- [docs/architecture/](../docs/architecture/) — Architecture documentation
- [docs/deployment/](../docs/deployment/) — Deployment guides
- [docs/RBAC_DOCUMENTATION.md](../docs/RBAC_DOCUMENTATION.md) — Security and auth

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

### Support Channels
- **GitHub Issues:** For bug reports and feature requests
- **Team Slack:** #phase-12-dev channel
- **Weekly Sync:** Thursdays 2 PM (engineering + product)
- **Code Review:** Use PR comments for technical discussions

---

## Troubleshooting

### Common Issues

**Issue:** `npm install` fails
- **Solution:** Delete `node_modules` and `package-lock.json`, then retry
  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```

**Issue:** TypeScript errors after pulling latest
- **Solution:** Regenerate database types
  ```powershell
  npx supabase gen types typescript --local > lib/supabase/database.types.ts
  ```

**Issue:** Tests fail locally but pass in CI
- **Solution:** Check Node.js version matches CI (18+), clear test cache
  ```powershell
  npm run test:clear-cache
  npm test
  ```

**Issue:** Can't push to remote branch
- **Solution:** Ensure you're pushing to the correct remote and have permissions
  ```powershell
  git remote -v  # Check remotes
  git push -u origin feature/your-branch
  ```

### Getting Help

1. Check existing documentation (this guide, PHASE_12_PLAN.md)
2. Search GitHub issues for similar problems
3. Ask in team Slack (#phase-12-dev)
4. Open a GitHub issue with detailed repro steps
5. Request pair programming session with team lead

---

## Quick Reference

### Useful Commands
```powershell
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm start                  # Run production build

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # Check linting
npm run lint:fix           # Fix linting issues
npm run type-check         # TypeScript check
npm run format             # Format with Prettier

# Database
npx supabase db push       # Apply migrations
npx supabase db reset      # Reset database
npm run db:seed            # Seed test data

# Scripts
.\scripts\phase12_cleanup.ps1            # Cleanup repo
.\scripts\create_phase12_branch.ps1      # Branch setup
npx tsx scripts/check-ai-config.ts       # Check AI config
npx tsx scripts/validate-rbac.ts         # Validate RBAC
```

### Environment Variables
Key variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
AZURE_OPENAI_API_KEY=<azure-openai-key>
```

---

**Last Updated:** November 9, 2025  
**Version:** 1.0  
**Maintained by:** Phase 12 Engineering Team

For questions or updates to this guide, open a PR or contact the Phase 12 lead.
