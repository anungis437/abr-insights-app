# Testing Strategy - Phase 12

## Current Baseline (Nov 9, 2025)

- **Overall Coverage**: 2.4% (35 tests passing)
- **Ingestion Module**: 63.1% ✅ (classifiers, scrapers, orchestrator)
- **Target**: 80%+ coverage by end of Week 3

## Test Pyramid Distribution

```
        /\
       /E2E\     10% - Critical user flows (Playwright)
      /------\
     /  Int.  \   30% - API routes, database, auth
    /----------\
   /    Unit    \ 60% - Pure functions, utilities, services
  /--------------\
```

## Priority Testing Roadmap (Week 1-3)

### Week 1: Foundation & Critical Paths
**Goal**: Establish infrastructure, test critical business logic

#### P0 - Critical Business Logic (Days 1-2)
- [ ] `lib/services/certificates.ts` - Certificate generation, validation, revocation
- [ ] `lib/services/gamification.ts` - Points, badges, XP calculations
- [ ] `lib/services/quiz.ts` - Quiz scoring, attempt tracking
- [ ] `lib/auth/azure-ad.ts` - Token validation, user claims
- [ ] `lib/auth/saml.ts` - SAML response parsing, signature validation

#### P0 - API Routes (Days 3-5)
- [ ] `app/api/ai/chat/route.ts` - Chat completions, streaming
- [ ] `app/api/ai/coach/route.ts` - Coaching recommendations
- [ ] `app/api/auth/*/route.ts` - All auth endpoints (Azure, SAML, callback)
- [ ] `app/api/embeddings/*/route.ts` - Vector search functionality
- [ ] `app/api/contact/route.ts` - Email sending, validation

### Week 2: Integration & Security
**Goal**: Test API integration, database operations, auth flows

#### P1 - Integration Tests (Days 1-3)
- [ ] Supabase RLS policies (user can only access own data)
- [ ] Auth flows (signup → login → JWT → RLS)
- [ ] Certificate generation → storage → retrieval → verification
- [ ] Course enrollment → progress tracking → completion → badge
- [ ] Quiz attempt → scoring → gamification → leaderboard update

#### P1 - Security Tests (Days 4-5)
- [ ] Input validation (Zod schemas for all API routes)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output sanitization)
- [ ] CSRF protection (SameSite cookies, CORS)
- [ ] Rate limiting (per-user, per-IP)

### Week 3: E2E & Performance
**Goal**: Test critical user journeys, establish performance baselines

#### P1 - E2E Tests (Days 1-3)
- [ ] New user signup → onboarding → first course
- [ ] Course enrollment → lesson completion → quiz → certificate
- [ ] Instructor creates course → publishes → student enrolls
- [ ] Admin uploads tribunal case → AI classification → searchable
- [ ] User searches cases → filters → saves search → downloads PDF

#### P2 - Performance Tests (Days 4-5)
- [ ] API response times (<200ms p95)
- [ ] Database query performance (indexes, N+1 detection)
- [ ] Vector search latency (<500ms)
- [ ] Page load times (<2s LCP)
- [ ] Bundle size (<500KB initial JS)

## Test Infrastructure

### Unit Tests (Vitest)
```bash
npm run test              # Watch mode
npm run test:unit         # Run once with coverage
```

**Configuration**: `vitest.config.ts`
- Environment: Node.js (API routes, services)
- Setup: `vitest.setup.ts` (mocks, env vars)
- Coverage: v8 provider, 80% threshold

### Integration Tests (Vitest + Supabase)
```bash
npm run test:integration  # Separate config
```

**Configuration**: `vitest.integration.config.ts` (to be created)
- Requires: Test Supabase project or local Docker
- Seeds: Test data fixtures
- Cleanup: Transaction rollback or truncate tables

### E2E Tests (Playwright)
```bash
npm run test:e2e         # All E2E tests
npm run test:smoke       # Critical paths only (@smoke tag)
```

**Configuration**: `playwright.config.ts` (to be created)
- Browsers: Chromium, Firefox, Mobile Safari
- Parallelization: 4 workers
- Retries: 2 (flaky test mitigation)

## Testing Patterns

### 1. Unit Test Pattern (Pure Functions)
```typescript
// lib/services/gamification.test.ts
import { describe, it, expect } from 'vitest';
import { calculateXP, awardBadge } from './gamification';

describe('Gamification Service', () => {
  describe('calculateXP', () => {
    it('should award 100 XP for course completion', () => {
      const result = calculateXP('course_complete', { courseId: '1' });
      expect(result).toBe(100);
    });

    it('should award bonus XP for perfect quiz score', () => {
      const result = calculateXP('quiz_complete', { score: 100 });
      expect(result).toBe(150); // 100 base + 50 bonus
    });
  });
});
```

### 2. API Route Test Pattern (Integration)
```typescript
// app/api/ai/chat/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { createMockRequest } from '@/lib/test-utils';

describe('POST /api/ai/chat', () => {
  it('should return streaming response for valid request', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { message: 'Hello', userId: 'user123' }
    });

    const response = await POST(req);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
  });

  it('should return 401 for unauthenticated request', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { message: 'Hello' },
      headers: {} // No auth header
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });
});
```

### 3. E2E Test Pattern (Playwright)
```typescript
// tests/e2e/course-completion.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Completion Flow', () => {
  test('user completes course and receives certificate @smoke', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Enroll in course
    await page.goto('/courses/intro-to-abr');
    await page.click('text=Enroll Now');

    // Complete all lessons
    for (let i = 1; i <= 5; i++) {
      await page.click(`text=Lesson ${i}`);
      await page.waitForSelector('text=Mark Complete');
      await page.click('text=Mark Complete');
    }

    // Pass quiz
    await page.click('text=Final Quiz');
    // ... answer questions ...
    await page.click('text=Submit Quiz');

    // Verify certificate
    await expect(page.locator('text=Certificate Earned')).toBeVisible();
    await page.click('text=View Certificate');
    await expect(page).toHaveURL(/\/certificates\/.+/);
  });
});
```

## Mock Strategy

### Supabase Mocks
```typescript
// vitest.setup.ts
import { vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user' } }, 
        error: null 
      })
    }
  }))
}));
```

### Azure OpenAI Mocks
```typescript
vi.mock('@azure/openai', () => ({
  OpenAIClient: vi.fn(() => ({
    getChatCompletions: vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mocked AI response' } }]
    })
  }))
}));
```

## Coverage Requirements

### Quality Gates (CI/CD)
- **Overall Coverage**: ≥80%
- **Critical Paths**: ≥90% (auth, payments, certificates, gamification)
- **New Code**: ≥85% (PR requirement)

### Coverage Exclusions
- Config files (`*.config.ts`)
- Type definitions (`*.d.ts`)
- Test files (`*.test.ts`, `*.spec.ts`)
- Generated code (`out/`, `.next/`)
- Legacy code (`archive/`)

## CI Integration

### GitHub Actions Workflow (`.github/workflows/test.yml`)
```yaml
name: Test Suite

on: [pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:smoke
```

## Success Metrics

### Week 1 Targets
- [ ] 35% overall coverage (up from 2.4%)
- [ ] All P0 services have ≥80% coverage
- [ ] 15+ API routes tested

### Week 2 Targets
- [ ] 60% overall coverage
- [ ] All auth flows tested (unit + integration)
- [ ] 10+ integration tests passing

### Week 3 Targets
- [ ] 80% overall coverage ✅ GOAL MET
- [ ] 5+ E2E critical paths (@smoke)
- [ ] Performance baselines established

## Resources

- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/
- **Testing Library**: https://testing-library.com/
- **Supabase Testing**: https://supabase.com/docs/guides/local-development

---

*Last Updated: November 9, 2025*
*Owner: Phase 12 Testing Team*
