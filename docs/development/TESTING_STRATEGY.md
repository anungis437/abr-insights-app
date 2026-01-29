# Testing Strategy

Status: Draft
Last updated: 2025-11-05

## Purpose

This document defines the project's testing strategy across unit, integration, and end-to-end (E2E) tests, plus performance, security, accessibility, and CI/CD automation. The goal is to ensure feature parity during migration from the legacy Base44 codebase to Supabase + Azure, prevent regressions, and provide reproducible verification for all major user journeys (learners, admins, ingestion operators, org admins).

## Contract (inputs / outputs / success criteria)

- Inputs: React components, hooks, utils, Supabase RPC endpoints, Azure Function endpoints, Stripe webhook events.
- Outputs: Test suites (Vitest unit tests, React Testing Library integration tests, Playwright E2E scripts), CI checks that gate merges, and measurable coverage reports.
- Success criteria: Critical paths have green tests in CI. RLS policies are validated. E2E covers signup, subscription checkout, course completion, ingestion job run, AI coaching request, and admin user/role flows.

## Tools & Libraries

- Unit & integration: Vitest + @testing-library/react + @testing-library/jest-dom
- Mocks: msw (Mock Service Worker) for HTTP, @supabase/supabase-js with test helpers or a lightweight test database for integration; also use sinon or vi for spies/mocks
- E2E: Playwright (Chromium, Firefox, WebKit)
- Accessibility: axe-core (Playwright + axe-playwright), Lighthouse CI for perf/a11y
- CI: GitHub Actions (matrix builds), with separate jobs for unit, integration, E2E (run on PR merge to main/staging), and scheduled nightly regression runs
- DB: Test Supabase instance (ephemeral) or Dockerized Postgres for integration tests; use pgTAP or custom test harness for DB-level tests
- Security scanning: snyk/Dependabot for dependencies, static analysis for secrets

## Test Types & Scope

### 1) Unit Tests (fast, isolated)

Scope:

- Pure functions (utils, date calculations, validation schemas)
- Small presentational components (UI wrappers) using shallow rendering
- React hooks (use-mobile, useSubscription) using testing utilities

Guidelines:

- Target: 90% coverage for utils and validation logic; 70-80% for UI components
- Use Vitest with setup file to include `@testing-library/jest-dom` matchers
- Use msw to mock network calls for hooks that call Supabase or Azure Functions
- Use dependency injection for functions that call external clients (e.g., supabase, stripe)

Example (Vitest config snippet):

```js
// vitest.config.ts (excerpt)
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      lines: 80,
    },
  },
})
```

### 2) Integration Tests (component + data)

Scope:

- Page-level component behavior: `TrainingHub`, `CoursePlayer`, `DataExplorer`, `OrgDashboard`, `UserManagement`.
- Interaction with Supabase client: Use either msw to intercept HTTP or a test Supabase DB.
- RLS and permissions: Test that users with different roles see/have access to the correct UI elements and API results.

Guidelines:

- Prefer RTL (React Testing Library) to assert DOM output and user interactions
- Seed minimal test data fixtures for pages (courses, lessons, profiles, permissions)
- Run tests in CI in `node` or `jsdom` environment depending on needs

### 3) E2E Tests (Playwright)

Scope:

- Full user journeys including UI, backend, and external integrations (sandboxed):
  - Learner: Signup → Complete onboarding → Start course → Complete lesson/quiz → Receive certificate
  - Admin: Create course → Publish → Assign to org/team → View org analytics
  - Ingestion operator: Trigger ingestion job → Review AI classification → Approve/Reject cases
  - Payments: Checkout (Stripe test keys) → Webhook processing → Seat assignment
  - AI Coaching: Request coaching session → Validate saved session and feedback

Guidelines:

- Use Playwright Test Runner with project matrix for Chromium/Firefox/WebKit
- Use playwright's network interception to stub third-party APIs (Azure OpenAI, Stripe) during tests, or use official test/sandbox endpoints
- Make tests idempotent; create and tear down entities programmatically
- Use stable selectors (data-testid) and avoid brittle text-based selectors
- Keep no more than 8-12 E2E tests that cover critical flows; run broader suite nightly

Example Playwright config snippet:

```js
// playwright.config.ts (excerpt)
import { defineConfig } from '@playwright/test'
export default defineConfig({
  use: { headless: true, baseURL: process.env.TEST_BASE_URL },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
})
```

### 4) DB & RLS Policy Tests

Scope:

- Validate RLS policies behave as expected for each role (org_admin, analyst, learner, viewer, super_admin)
- Prevent data leakage across orgs
- Validate that row-level inserts/updates/deletes follow constraints and policy

Approach:

- Option A (recommended): Use an ephemeral Supabase project per CI run and run scripted SQL checks (pgTAP or Node.js test scripts using `pg`)
- Option B: Use pgTAP for unit-level DB tests executed in a Dockerized Postgres

Test examples:

- Attempt to read `profiles` from user in another org → expect 0 rows
- Attempt to insert `tribunal_cases` via ingestion lambda user → allowed only for service role
- Attempt to fetch `subscriptions` for non-admin → forbidden

### 5) Security & Compliance Tests

- Automated scans for dependencies and secret detection
- RLS policy coverage tests (see above)
- Static code analysis: ESLint with security rules
- XSS/CSRF tests: Fuzz inputs in forms and assertion for sanitization
- Data retention tests: Audit log retention, deletion behavior

### 6) Performance & Load Tests

Scope:

- Page load core-user flows (TrainingHub, DataExplorer, OrgDashboard)
- API endpoints under load (ingestion webhooks, search queries)

Tools:

- Lighthouse CI for Core Web Vitals
- k6 or Artillery for API load tests
- Azure Application Insights for real-time telemetry in staging

Guidelines:

- Define SLOs for API latency (95th percentile < 500ms for search endpoints) and page load times
- Run smoke performance checks in CI before major releases

### 7) Accessibility Testing

- Use axe in Playwright tests for E2E accessibility checks
- Add automated axe checks in PR runs for critical pages
- Manual WCAG 2.1 AA checks for key flows

### 8) Test Data & Fixtures

- Use factories (e.g., factory-bot or custom JS factories) to create test entities
- Keep fixtures small and focused; teardown after tests
- Provide seed scripts for a local seeded dev DB: `npm run db:seed:test`

### 9) Mocking External Services

- Azure OpenAI: Stub completions/responses with deterministic fixtures
- Stripe: Use Stripe test keys + webhook signature verification; use `stripe-mock` or intercept webhooks in test runner
- SendGrid: Use sandbox mode or intercept with msw
- Storage (Azure Blob / Supabase Storage): Use local emulator or msw to mock signed URLs

### 10) CI/CD Integration

- PR checks:
  - `lint` -> `typecheck` -> `unit test` -> `integration test (fast subset)` -> report coverage
  - E2E: run on `merge to staging` and nightly scheduled runs
- Release pipeline:
  - Run full test battery (unit, integration, E2E, performance smoke)
  - Gate deploy to production on `all green + manual approval`

Sample GitHub Actions job outline:

```yaml
# .github/workflows/ci.yml (summary)
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: install
        run: npm ci
      - name: lint
        run: npm run lint
      - name: unit tests
        run: npm run test:unit
      - name: integration tests (fast)
        run: npm run test:integration:fast
      - name: upload coverage
        run: npm run coverage:upload

# e2e.yml (summary)
on:
  push:
    branches: [staging, main]
  schedule:
    - cron: '0 2 * * *' # nightly
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Playwright tests
        run: npm run test:e2e
```

### 11) Monitoring & Flakiness Strategy

- Keep flaky tests out of PR gating; quarantine/annotate flaky tests
- Use retries for E2E (1-2) and record retry data
- Monitor flaky tests and create tickets for stability work

### 12) Test Ownership & Roadmap

- Assign test ownership by area (ingestion, coaching, courses, payments, admin)
- Short-term (weeks 1-3): Add unit tests for critical utils, seed DB, create Playwright skeleton for critical flows
- Mid-term (weeks 3-8): Increase integration coverage, automate RLS verification, add payment E2E
- Long-term (Ongoing): Continuous performance test automation, test data refresh, regular security scans

## Example Test Matrix (priority -> coverage)

1. Signup + onboarding (E2E) - P0
2. Subscription checkout + seat assignment (E2E + integration) - P0
3. Course start -> complete -> certificate (E2E + integration) - P0
4. Data ingestion run -> AI classification -> human review (E2E + integration) - P0
5. Permissions matrix tests for roles (integration + DB) - P0
6. AI coaching session generation & audit logging (integration + unit) - P1
7. Saved search notifications (integration) - P1
8. Leaderboard & gamification points aggregation (integration) - P1

## Quick Start: Local test commands

```powershell
# Install deps
npm ci

# Run unit tests (watch)
npm run test:unit:watch

# Run fast integration tests
npm run test:integration:fast

# Run E2E locally (Playwright GUI)
npx playwright test --project=chromium --reporter=html
```

## Deliverables

- `tests/` folder with unit, integration, and e2e directories
- `tests/setupTests.ts` and `tests/msw/` mocks
- Github Actions workflows for `ci.yml` and `e2e.yml`
- Seed scripts and factories for test data
- RLS validation scripts (SQL or js) for policy verification

---

If you'd like, I can now:

1. Create the `docs/development/TESTING_STRATEGY.md` file (done),
2. Scaffold `tests/` directory with example tests (unit + integration) and `tests/setupTests.ts`,
3. Add GitHub Actions workflow templates for CI and E2E.

Which of the scaffold items should I add next?
