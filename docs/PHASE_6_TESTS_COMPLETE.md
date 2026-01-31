# Phase 6: Integration Tests - COMPLETE

## Test Suite Overview

Created three comprehensive test files for CanLII REST API integration:

### 1. **`tests/ingestion-canlii-api.spec.ts`** (500+ lines)
- **CanLIIApiClient Tests**: API client functionality validation
  - ✅ Client initialization
  - ✅ Connection validation
  - ✅ Database discovery
  - ✅ Case discovery with pagination
  - ✅ Error handling for invalid parameters
  
- **CanLIIDatabaseMapper Tests**: Tribunal discovery and mapping
  - ✅ Database discovery from API
  - ✅ Markdown export generation
  - ✅ JSON mapping export
  
- **Validation Tests**: Input and configuration validation
  - ✅ Database ID validation (format, length, characters)
  - ✅ Case ID validation (format, length, characters)
  - ✅ Decision date validation (ISO 8601, Date objects, null/undefined)
  
- **Error Handling Tests**: Error classification and retry logic
  - ✅ Error creation with structured properties
  - ✅ Retryable error identification
  - ✅ Exponential backoff calculation
  - ✅ Retry logic with max attempts
  
- **Error Codes Tests**: Verify all error codes are defined
  - ✅ All 16 error codes present
  - ✅ No duplicate error codes
  
- **Integration Scenarios**:
  - ✅ Complete discovery workflow (config → databases → cases)
  - ✅ Graceful handling of empty result sets

### 2. **`tests/ingestion-scraper-factory.spec.ts`** (450+ lines)
- **Mode Selection Logic**:
  - ✅ REST API mode selection (explicit config)
  - ✅ Web scraper mode selection (explicit config)
  - ✅ Auto-selection based on environment variables
  - ✅ Config priority over environment
  - ✅ Fallback when REST API unavailable
  
- **Scraper Creation**:
  - ✅ Create REST API scraper in REST mode
  - ✅ Create web scraper in scrape mode
  - ✅ Error handling for invalid configurations
  
- **Error Scenarios**:
  - ✅ Missing API key handling
  - ✅ Missing database ID for REST mode
  - ✅ Missing listing URL for web scraper
  
- **Gradual Migration Support**:
  - ✅ Mixed modes (per-tribunal configuration)
  - ✅ Configuration override for testing
  
- **Backwards Compatibility**:
  - ✅ Legacy web scraper config support
  - ✅ New REST API config support

### 3. **`tests/ingestion-validation.spec.ts`** (700+ lines)
- **CanLIIError Class**:
  - ✅ Error creation with all properties
  - ✅ Proper error inheritance
  - ✅ Optional details handling
  
- **Configuration Validation**:
  - ✅ API configuration validation
  - ✅ Missing API key detection
  - ✅ URL format validation
  
- **Database ID Validation**:
  - ✅ Valid ID formats (onhrt, chrt, csc-scc, etc.)
  - ✅ Empty ID rejection
  - ✅ Length validation (2-20 chars)
  - ✅ Invalid character rejection
  - ✅ Hyphen support
  
- **Case ID Validation**:
  - ✅ Valid ID formats (2008scc9, 1999canlii1527, etc.)
  - ✅ Empty ID rejection
  - ✅ Length validation (3-50 chars)
  - ✅ Character validation
  - ✅ Hyphen support
  
- **Decision Date Validation**:
  - ✅ ISO 8601 string validation
  - ✅ Date object validation
  - ✅ Null/undefined support (optional fields)
  - ✅ Invalid format rejection
  
- **Error Classification**:
  - ✅ Timeout classification (retryable)
  - ✅ Rate limit classification (retryable)
  - ✅ Server error classification (retryable)
  - ✅ Auth failure classification (non-retryable)
  - ✅ Invalid config classification (non-retryable)
  - ✅ 404 Not Found classification (non-retryable)
  - ✅ Plain Error object handling
  
- **Exponential Backoff**:
  - ✅ Exponential growth calculation
  - ✅ Maximum delay enforcement
  - ✅ Jitter implementation (randomness)
  - ✅ Base delay respect
  - ✅ Edge case handling
  
- **Retry Logic**:
  - ✅ Success on first attempt
  - ✅ Retry on transient failure
  - ✅ Immediate failure on non-retryable errors
  - ✅ Exhaustion after max attempts
  - ✅ Mixed error type handling
  - ✅ Max attempts parameter respect
  - ✅ Custom base delay support
  
- **Integration Scenarios**:
  - ✅ Complete parameter validation
  - ✅ Invalid combination rejection
  - ✅ Error escalation handling

---

## Test Coverage Matrix

| Module | Test File | Coverage |
|--------|-----------|----------|
| `CanLIIApiClient` | ingestion-canlii-api.spec.ts | ✅ Complete |
| `CanLIIDatabaseMapper` | ingestion-canlii-api.spec.ts | ✅ Complete |
| `Validators` | ingestion-validation.spec.ts | ✅ Complete |
| `Retry Logic` | ingestion-validation.spec.ts | ✅ Complete |
| `Error Handling` | ingestion-validation.spec.ts | ✅ Complete |
| `Factory Selection` | ingestion-scraper-factory.spec.ts | ✅ Complete |
| `Scraper Creation` | ingestion-scraper-factory.spec.ts | ✅ Complete |

---

## Test Execution Strategy

### Running Tests Locally

```bash
# Run all CanLII tests
npm run test:unit tests/ingestion-*.spec.ts

# Run specific test file
npm run test:unit tests/ingestion-canlii-api.spec.ts

# Run with coverage report
npm run test:unit -- --coverage tests/ingestion-*.spec.ts

# Run live API tests (requires CANLII_API_KEY)
CANLII_API_KEY=your-key npm run test:unit tests/ingestion-canlii-api.spec.ts
```

### Test Environments

1. **Unit Tests** (No API Key Required)
   - Validation logic tests
   - Error handling tests
   - Factory selection logic tests
   - All tests use `vi.mock()` for isolation

2. **Live API Tests** (Requires CANLII_API_KEY)
   - Marked with `.skipIf(SKIP_LIVE_TESTS)` decorator
   - Tests actual CanLII API endpoints
   - Requires valid API key in environment
   - Run separately in CI/CD pipeline

### Skip Conditions

Tests are automatically skipped if:
- `CANLII_API_KEY` environment variable is not set
- Live API connectivity is not available
- Tests are run in offline mode

---

## Test Statistics

| Metric | Count |
|--------|-------|
| Total Test Files | 3 |
| Total Test Cases | 60+ |
| Total Lines of Test Code | 1,650+ |
| Unit Tests | 45+ |
| Integration Tests | 8+ |
| Edge Case Tests | 7+ |

---

## Coverage Goals

**Target**: ≥80% code coverage for new modules

| Module | Target Coverage |
|--------|-----------------|
| canlii-api.ts | 85% |
| canlii-database-mapper.ts | 80% |
| canlii-rest-api.ts | 80% |
| canlii-validation.ts | 90% |
| factory.ts | 85% |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# Add to .github/workflows/test.yml
- name: Run CanLII Tests
  run: npm run test:unit tests/ingestion-*.spec.ts -- --coverage
  
- name: Run Live API Tests
  if: secrets.CANLII_API_KEY != ''
  env:
    CANLII_API_KEY: ${{ secrets.CANLII_API_KEY }}
  run: npm run test:unit tests/ingestion-canlii-api.spec.ts
```

---

## Test Data & Fixtures

### Mock Data
- Sample CanLII API responses (JSON fixtures)
- Mock tribunal database objects
- Sample case references and metadata
- Error response samples

### Known Test Databases
- `onhrt` - Ontario Human Rights Tribunal
- `chrt` - Canadian Human Rights Tribunal
- `csc-scc` - Supreme Court of Canada

---

## Known Limitations

1. **Live API Tests Require Key**
   - Skip gracefully if `CANLII_API_KEY` not available
   - Run separately in CI/CD with secrets

2. **Rate Limiting**
   - Live tests respect 2 req/sec CanLII rate limit
   - May take longer on slow connections

3. **Test Isolation**
   - Each test should be independent
   - Database discovery tests may be slow (1-2 minutes)

---

## Quality Assurance Checklist

- ✅ All test files follow Vitest conventions
- ✅ Proper use of `describe()`, `it()`, `beforeEach()`, `afterEach()`
- ✅ Async/await properly handled in tests
- ✅ Error conditions thoroughly tested
- ✅ Edge cases covered
- ✅ Integration scenarios validated
- ✅ No hardcoded values or magic numbers
- ✅ Environment variable mocking implemented
- ✅ Skip conditions for optional API tests
- ✅ Clear test descriptions and comments

---

## Next Steps

1. **Phase 7: Documentation & Deployment**
   - Create `CANLII_API_MIGRATION.md` (implementation guide)
   - Create `CANLII_DATABASE_IDS.md` (database mappings)
   - Create `API_CLIENT_EXAMPLES.md` (usage examples)
   - Create `DEPLOYMENT_CHECKLIST.md` (pre-production steps)

2. **GitHub Actions Setup**
   - Add test execution to CI/CD pipeline
   - Configure secrets for CANLII_API_KEY
   - Add coverage reporting

3. **Production Rollout**
   - Feature flag activation (CANLII_API_ENABLED)
   - Gradual per-tribunal migration
   - Monitoring and alerting setup

---

## Appendix: Test Pattern Examples

### Testing Retryable Errors

```typescript
it('should retry on transient failure', async () => {
  let callCount = 0
  const fn = async () => {
    callCount++
    if (callCount < 2) {
      throw new CanLIIError('Timeout', ERROR_CODES.CONNECTION_TIMEOUT, {}, true)
    }
    return 'success'
  }

  const result = await retryWithBackoff(fn, 3, 10)
  expect(result).toBe('success')
  expect(callCount).toBe(2)
})
```

### Testing Mode Selection

```typescript
it('should select REST API mode when explicitly configured', () => {
  const config: SourceConfig = {
    name: 'Test',
    type: 'canlii',
    apiMode: 'rest',
    databaseId: 'onhrt',
    enabled: true,
  }

  const mode = selectScraperMode(config)
  expect(mode).toBe('rest')
})
```

### Testing Configuration Validation

```typescript
it('should detect missing API key', () => {
  const origApiKey = process.env.CANLII_API_KEY
  delete process.env.CANLII_API_KEY

  try {
    const result = validateApiConfiguration()
    expect(result.errors.some(e => e.includes('API_KEY'))).toBe(true)
  } finally {
    if (origApiKey) process.env.CANLII_API_KEY = origApiKey
  }
})
```

---

**Phase 6 Status**: ✅ COMPLETE  
**Total Test Coverage**: 1,650+ lines of comprehensive tests  
**Ready for Phase 7**: Documentation & Deployment
