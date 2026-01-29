# Testing Quick Start Guide

## Run Tests

```bash
# Run all tests
npm test

# Run all tests once (no watch)
npm test -- --run

# Run with coverage
npm run test:unit

# Run specific test file
npm test -- permissions.test.ts

# Run with interactive UI
npm test -- --ui

# Run integration tests
npm run test:integration
```

## Test Files Created

1. **permissions.test.ts** (15 tests)
   - Permission check functions
   - Role assignment
   - Permission enforcement
   - Organization isolation
   - Permission inheritance

2. **api-security.test.ts** (25 tests)
   - Authentication requirements
   - Public/Admin routes
   - Rate limiting
   - Input validation
   - Error handling
   - CORS configuration

3. **stripe.test.ts** (30 tests)
   - Checkout session creation
   - Customer portal
   - Webhook processing
   - Subscription tiers
   - Feature flags
   - Price validation

4. **ai-features.test.ts** (35 tests)
   - AI Chat
   - AI Coach
   - Vector Embeddings
   - Semantic Search
   - Prediction Models
   - Content Generation
   - Error Handling

5. **components.test.tsx** (40 tests)
   - Button Component
   - Form Components
   - Card Components
   - Modal/Dialog
   - Loading/Error States
   - Accessibility
   - Responsive Design
   - Theme Support
   - Hooks (useSubscription, useAIChat, useAICoach, useAuth)

6. **integration.test.ts** (25 tests)
   - User Registration Flow
   - Course Enrollment Flow
   - Payment to Subscription Flow
   - AI Chat Session Flow
   - Progress Tracking Flow
   - Certificate Issuance Flow
   - Admin Workflow
   - Multi-Tenant Data Isolation
   - Real-time Updates
   - Search and Discovery

7. **tenant-isolation.test.ts** (28 tests - existing)
   - Cross-tenant profile access
   - Course access
   - Organization access
   - Enrollment isolation
   - Gamification data
   - Audit logs
   - RLS policies

## Total: 198+ Tests

## CI/CD Pipeline

**File**: `.github/workflows/testing.yml`

**Jobs**:

1. unit-tests - Run on Node 18.x and 20.x
2. integration-tests - Run integration suite
3. lint-and-typecheck - ESLint + TypeScript
4. security-scan - Trivy + npm audit
5. build-test - Verify production build

**Triggers**:

- Push to main/develop
- Pull requests to main/develop

## Environment Setup

Create `.env.test` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_test_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_API_KEY=your_key
```

## Next Steps

1. Set up test environment variables
2. Run `npm test -- --run` to verify all tests
3. Configure GitHub secrets for CI/CD
4. Review failing tests in tenant-isolation.test.ts
5. Fix identified RLS policy gaps

## Documentation

- **Complete Guide**: [TESTING_100_COMPLETE.md](TESTING_100_COMPLETE.md)
- **System Overview**: [SYSTEM_100_COMPLETE.md](SYSTEM_100_COMPLETE.md)
- **Test Status**: [tests/README.md](tests/README.md)
