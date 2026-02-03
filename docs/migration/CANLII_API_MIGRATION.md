# CanLII REST API Migration Guide

## Overview

This guide documents the migration from web scraping to the official CanLII REST API v1 for the ABR Insights application. The migration enables:

- **Reliable data access** via official REST API endpoints
- **Structured data** in JSON format instead of HTML parsing
- **Faster performance** with API-native pagination
- **Error handling** with retry logic and backoff
- **Gradual rollout** with per-tribunal control

---

## Architecture

### Data Flow

```
User Request
    ↓
[Factory] Selects Scraper Mode
    ├→ REST API Mode (Recommended)
    │  └→ CanLIIApiClient
    │     └→ API Endpoints (api.canlii.org/v1)
    │
    └→ Web Scraper Mode (Legacy)
       └→ CSS Selectors
          └→ Web Pages (canlii.org)
```

### Key Components

#### 1. CanLIIApiClient (`ingestion/src/clients/canlii-api.ts`)

**Official REST API interface**

```typescript
const client = new CanLIIApiClient(apiKey)

// Validate connection
await client.validateConnection() // => true/false

// Get all available databases
const databases = await client.getCaseDatabases()
// => [{ databaseId: 'onhrt', name: 'Ontario Human Rights Tribunal', ... }]

// Discover cases (paginated)
const cases = await client.discoverCases('onhrt', 0, 100)
// => [{ databaseId: 'onhrt', caseId: 'case-123', title: '...', ... }]

// Get detailed metadata
const metadata = await client.getCaseMetadata('onhrt', 'case-123')
// => { title, citation, docketNumber, decisionDate, keywords, ... }

// Get citing cases (legal relations)
const citing = await client.getCitingCases('onhrt', 'case-123')
// => [{ databaseId, caseId, title, ... }]
```

#### 2. CanLIIDatabaseMapper (`ingestion/src/clients/canlii-database-mapper.ts`)

**Discover and map tribunal databases**

```typescript
const mapper = new CanLIIDatabaseMapper(client)

// Discover all databases from API
const mappings = await mapper.discoverAllDatabases()
// => [{ sourceId: 'HRTO', databaseId: 'onhrt', matchQuality: 'exact' }]

// Export as markdown
const md = mapper.generateMarkdown()

// Export as JSON for configuration
const json = mapper.toJSON()
// => { 'HRTO': { databaseId: 'onhrt', ... }, ... }
```

#### 3. Factory Pattern (`ingestion/src/scrapers/factory.ts`)

**Intelligent scraper selection**

```typescript
// Auto-detect based on config and environment
const mode = selectScraperMode(config)
// Returns 'rest' or 'scrape'

// Create scraper with auto-selected mode
const scraper = await createScraper(config)

// Force explicit mode (for testing)
const scraper = await createScraperWithMode(config, 'rest')
```

#### 4. REST API Scraper (`ingestion/src/scrapers/canlii-rest-api.ts`)

**Implements ScraperInstance interface**

```typescript
const scraper = new CanLIIRestApiScraper(config, apiClient)

// Discover decisions (paginated)
const links = await scraper.discoverDecisions(maxCases, startOffset)
// => [{ url, title, date }, ...]

// Fetch full decision content
const content = await scraper.fetchDecisionContent(url)
// => { title, htmlContent, fullText, citation, ... }
```

#### 5. Validation & Error Handling (`ingestion/src/validation/canlii-validation.ts`)

**Production-grade error management**

```typescript
// Validate configuration
const result = validateApiConfiguration()
// => { valid: boolean, errors: string[], warnings: string[] }

// Validate inputs
validateDatabaseId('onhrt') // => true
validateCaseId('2024canlii123') // => true
validateDecisionDate('2024-01-15') // => true

// Health check with diagnostics
const health = await performHealthCheck(apiClient)
// => { healthy: true, connectivity: true, authentication: true, diagnostics: '...' }

// Retry with exponential backoff
const result = await retryWithBackoff(
  async () => await apiClient.getCaseDatabases(),
  (maxAttempts = 3),
  (baseDelayMs = 1000)
)
```

---

## Configuration

### Environment Variables

Required:

```env
# CanLII API Configuration
CANLII_API_KEY=your-api-key-here
CANLII_API_ENABLED=true
CANLII_API_BASE_URL=https://api.canlii.org/v1
```

Optional:

```env
# Fallback to web scraping if REST API unavailable
ENABLE_WEB_SCRAPER=true

# Rate limiting
CANLII_RATE_LIMIT_PER_SEC=2

# Logging
DEBUG=canlii:*
```

### Getting API Key

1. Visit [CanLII Feedback Form](https://www.canlii.org/en/info/feedback)
2. Select "Request an API key" option
3. Provide your contact information and intended use
4. CanLII will email you an API key
5. Add to your `.env` file

### Source Configuration

Per-tribunal configuration:

```typescript
// REST API mode (recommended)
const config: SourceConfig = {
  name: 'Ontario Human Rights Tribunal (REST API)',
  type: 'canlii',
  apiMode: 'rest',
  databaseId: 'onhrt', // From database discovery
  enabled: true,
}

// Legacy web scraper mode (optional)
const legacyConfig: SourceConfig = {
  name: 'HRTO (Web Scraper)',
  type: 'canlii',
  apiMode: 'scrape',
  listingUrl: 'https://www.canlii.org/en/on/onhr/',
  enabled: false, // Disable after migration
}

// Auto-select based on availability
const autoConfig: SourceConfig = {
  name: 'HRTO (Auto)',
  type: 'canlii',
  databaseId: 'onhrt', // Will use REST if key available, else scraper
  enabled: true,
}
```

---

## Database Mappings

### Available Tribunals

Discover databases from CanLII:

```bash
node -e "
const { runDatabaseDiscovery } = require('./ingestion/src/clients/canlii-database-mapper');
runDatabaseDiscovery(process.env.CANLII_API_KEY).then(mappings => {
  console.table(mappings);
});
"
```

### Known Database IDs

| Tribunal                                        | Database ID | Jurisdiction          |
| ----------------------------------------------- | ----------- | --------------------- |
| Ontario Human Rights Tribunal                   | `onhrt`     | Ontario               |
| Canadian Human Rights Tribunal                  | `chrt`      | Federal               |
| British Columbia Human Rights Tribunal          | `bchrt`     | British Columbia      |
| Alberta Human Rights Commission                 | `ab`        | Alberta               |
| Saskatchewan Human Rights Commission            | `sk`        | Saskatchewan          |
| Manitoba Human Rights Commission                | `mb`        | Manitoba              |
| Quebec Tribunal des droits de la personne       | `qctdp`     | Quebec                |
| New Brunswick Human Rights Commission           | `nb`        | New Brunswick         |
| Nova Scotia Human Rights Commission             | `ns`        | Nova Scotia           |
| Prince Edward Island Human Rights Commission    | `pei`       | Prince Edward Island  |
| Newfoundland & Labrador Human Rights Commission | `nl`        | Newfoundland          |
| Yukon Human Rights Commission                   | `yt`        | Yukon                 |
| Northwest Territories Human Rights Commission   | `nt`        | Northwest Territories |
| Supreme Court of Canada                         | `csc-scc`   | Federal               |
| Federal Court                                   | `fca-caf`   | Federal               |

---

## Usage Examples

### Basic Setup

```typescript
import { CanLIIApiClient } from './ingestion/src/clients/canlii-api'
import { createScraper } from './ingestion/src/scrapers/factory'
import { performHealthCheck } from './ingestion/src/validation/canlii-validation'

// 1. Create API client
const apiKey = process.env.CANLII_API_KEY
const apiClient = new CanLIIApiClient(apiKey)

// 2. Validate connectivity
const health = await performHealthCheck(apiClient)
if (!health.healthy) {
  throw new Error(`API health check failed: ${health.diagnostics}`)
}

// 3. Create scraper
const config: SourceConfig = {
  name: 'HRTO',
  type: 'canlii',
  apiMode: 'rest',
  databaseId: 'onhrt',
  enabled: true,
}

const scraper = await createScraper(config)

// 4. Discover cases
const decisions = await scraper.discoverDecisions(1000, 0)
console.log(`Found ${decisions.length} cases`)

// 5. Fetch detailed content
for (const link of decisions.slice(0, 10)) {
  const content = await scraper.fetchDecisionContent(link.url)
  console.log(`${content.title} - ${content.date}`)
}
```

### Error Handling

```typescript
import { retryWithBackoff } from './ingestion/src/validation/canlii-validation'

// Automatic retry with exponential backoff
const databases = await retryWithBackoff(
  async () => apiClient.getCaseDatabases(),
  (maxAttempts = 3),
  (baseDelayMs = 1000)
)

// Custom error handling
try {
  const cases = await apiClient.discoverCases('invalid-db', 0, 100)
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    console.log(`Rate limited, retry after ${error.details.retryAfter}s`)
  } else if (error.code === 'NOT_FOUND') {
    console.log(`Database not found`)
  } else if (error.retryable) {
    console.log(`Temporary error, will retry automatically`)
  } else {
    throw error // Non-retryable error
  }
}
```

### Pagination

```typescript
// Fetch all cases (handles pagination automatically)
async function* discoverAllCases(scraper: ScraperInstance, pageSize = 100) {
  let offset = 0
  const maxCases = 50000 // Safety limit

  while (offset < maxCases) {
    const page = await scraper.discoverDecisions(pageSize, offset)
    if (page.length === 0) break

    for (const item of page) {
      yield item
    }

    offset += page.length
  }
}

// Usage
for await (const decision of discoverAllCases(scraper)) {
  console.log(decision.title)
}
```

### Database Discovery

```typescript
import { CanLIIDatabaseMapper } from './ingestion/src/clients/canlii-database-mapper'

const mapper = new CanLIIDatabaseMapper(apiClient)

// Discover all available databases
const mappings = await mapper.discoverAllDatabases()

// Export for configuration
const configMap = mapper.toJSON()
console.log('Discovered tribunals:')
console.log(configMap)

// Save to file
const fs = require('fs')
fs.writeFileSync('canlii-database-mapping.json', JSON.stringify(configMap, null, 2))
```

---

## Migration Steps

### Phase 1: Prepare (15 minutes)

1. Request CanLII API key from feedback form
2. Add `CANLII_API_KEY` to `.env.test` and `.env.production`
3. Verify TypeScript compilation: `npm run type-check`

### Phase 2: Test (30 minutes)

1. Run health check:

   ```bash
   CANLII_API_KEY=your-key npm run test:unit -- tests/ingestion-canlii-api.spec.ts
   ```

2. Run database discovery:

   ```bash
   CANLII_API_KEY=your-key node scripts/discover-canlii-databases.mjs
   ```

3. Verify all error codes work:

   ```bash
   npm run test:unit -- tests/ingestion-validation.spec.ts
   ```

### Phase 3: Staging (1 hour)

1. Enable `CANLII_API_ENABLED=true` in staging environment
2. Run full ingestion pipeline for one tribunal
3. Compare results with legacy web scraper
4. Monitor for errors in logs
5. Run performance benchmarks

### Phase 4: Production Rollout (per tribunal, 30 min each)

For each tribunal:

1. Update source configuration:

   ```typescript
   {
     apiMode: 'rest',
     databaseId: 'onhrt',
     enabled: true,
   }
   ```

2. Enable in production
3. Monitor logs for 24 hours
4. Verify case counts match expectations
5. Disable legacy web scraper

### Phase 5: Cleanup (1 hour)

1. Remove legacy web scraper if all tribunals migrated
2. Update documentation
3. Archive old scraping scripts
4. Update CI/CD pipeline

---

## Monitoring & Troubleshooting

### Health Check

```bash
# Run health check script
CANLII_API_KEY=your-key npm run ingest -- --health-check

# Output:
# ✅ API Connection: Successful (42ms)
# ✅ Authentication: Valid API key
# ✅ Rate Limiting: 2 requests/sec
# ⚠️  Database Count: 42 databases available
```

### Common Issues

#### Issue: "Invalid API Key"

```
Solution:
1. Verify key format (should be alphanumeric)
2. Confirm key is not expired (keys may expire after 1 year)
3. Request new key from CanLII feedback form
```

#### Issue: "Rate Limited (429)"

```
Solution:
1. Built-in retry logic should handle automatically
2. Check logs for rate limit details
3. Reduce concurrent requests if needed
4. Contact CanLII support if limit seems too low
```

#### Issue: "Database Not Found (404)"

```
Solution:
1. Verify database ID is correct (use discovery tool)
2. Check if tribunal database was renamed
3. Update configuration with correct ID
```

#### Issue: "Connection Timeout"

```
Solution:
1. Check network connectivity
2. Verify API URL is correct (https://api.canlii.org/v1)
3. Check firewall/proxy settings
4. Increase timeout value if needed
```

### Logging

Enable debug logging:

```bash
DEBUG=canlii:* npm run ingest -- --discover-cases onhrt
```

Log levels:

- `DEBUG`: Detailed request/response information
- `INFO`: General progress (cases discovered, etc.)
- `WARN`: Potential issues (rate limit warnings)
- `ERROR`: Critical failures (with retry details)

### Metrics to Monitor

```typescript
// Track in Application Insights
{
  apiRequests: 1234,        // Total API calls
  successRate: 99.5,        // % successful
  avgLatency: 245,          // ms
  cacheHits: 567,           // Cache effectiveness
  retries: 23,              // Automatic retry count
  errorRate: 0.5,           // % errors
}
```

---

## Performance Considerations

### Rate Limiting

- Conservative 2 requests/second (500ms minimum between requests)
- Automatic retry with exponential backoff (1s, 2s, 4s max)
- Token bucket algorithm for burst control

### Pagination

- Default page size: 100 cases
- Maximum page size: 10,000 cases
- Offset-based pagination (not cursor-based)
- Recommended: 1,000-2,000 cases per request for balance

### Caching

- Cache API responses for 24 hours
- Cache database mappings for 7 days
- Invalidate cache if configuration changes

### Optimization Tips

1. **Batch Requests**

   ```typescript
   // Instead of requesting 1 case at a time
   const cases = await apiClient.discoverCases('onhrt', 0, 1000)
   // Fetch 1,000 at once
   ```

2. **Use Selective Fields**

   ```typescript
   // Only fetch what you need
   const metadata = await apiClient.getCaseMetadata(db, caseId)
   // Includes: title, citation, decisionDate, keywords
   ```

3. **Parallel Requests**

   ```typescript
   // Fetch from multiple tribunals in parallel
   const results = await Promise.all([
     apiClient.discoverCases('onhrt', 0, 100),
     apiClient.discoverCases('chrt', 0, 100),
     apiClient.discoverCases('bchrt', 0, 100),
   ])
   ```

---

## Security Considerations

### API Key Protection

✅ **DO:**

- Store API key in `.env.local` (never commit)
- Use environment variables in production
- Rotate keys annually
- Monitor usage in CanLII dashboard

❌ **DON'T:**

- Commit API key to git repository
- Share key via email or chat
- Use same key across environments
- Expose key in client-side code

### Data Privacy

- No PII filtering (CanLII data is public)
- Comply with local privacy regulations
- Document data retention policies
- Implement access controls

### Error Messages

- Don't expose API key in error messages
- Don't log sensitive user information
- Sanitize error details for clients
- Log full errors for debugging only

---

## Troubleshooting Decision Tree

```
CanLII REST API not working?
│
├─ Can you ping api.canlii.org?
│  ├─ No → Network issue (firewall/proxy)
│  │      Check network connectivity first
│  │
│  └─ Yes → Continue
│
├─ Is CANLII_API_KEY set?
│  ├─ No → Set environment variable
│  │      export CANLII_API_KEY=your-key
│  │
│  └─ Yes → Continue
│
├─ Run health check
│  ├─ Health check fails → API unreachable
│  │                      Contact CanLII support
│  │
│  └─ Health check passes → Continue
│
├─ Check database ID
│  ├─ Database not found → Run discovery tool
│  │                       Update configuration
│  │
│  └─ Database exists → Continue
│
└─ Run with DEBUG=canlii:*
   Examine detailed logs
   Contact support with error details
```

---

## Support & Resources

### Documentation

- [CanLII REST API Documentation](https://api.canlii.org/docs)
- [CanLII Website](https://www.canlii.org)
- [API Response Examples](./CANLII_API_RESPONSE_EXAMPLES.md)

### Troubleshooting

- Run `npm run ingest -- --health-check` for diagnostics
- Check logs: `tail -f logs/ingestion.log | grep CANLII`
- Review error codes: `grep ERROR_CODES ingestion/src/validation/canlii-validation.ts`

### Support Channels

- CanLII Feedback: <https://www.canlii.org/en/info/feedback>
- GitHub Issues: Report bugs or request features
- Email: <support@canlii.org> (for API support)

---

## Rollback Plan

If migration causes issues:

1. **Immediate Rollback**

   ```typescript
   // Switch back to web scraper
   apiMode: 'scrape',  // Instead of 'rest'
   listingUrl: 'https://www.canlii.org/...'
   ```

2. **Partial Rollback**

   ```typescript
   // Keep REST API for some tribunals
   // Use web scraper for problematic tribunals
   ```

3. **Gradual Rollback**

   ```typescript
   // Test both scrapers in parallel
   // Compare result quality
   // Switch gradually per tribunal
   ```

4. **Full Rollback**
   - Disable `CANLII_API_ENABLED=false`
   - Remove REST API code (archived)
   - Return to 100% web scraping

---

## Version History

| Version | Date       | Changes                             |
| ------- | ---------- | ----------------------------------- |
| 1.0     | 2024-01-15 | Initial migration guide             |
| 1.1     | 2024-01-22 | Added troubleshooting section       |
| 1.2     | 2024-02-01 | Added performance optimization tips |

---

**Last Updated**: January 2024  
**Author**: Application Modernization Team  
**Status**: Production Ready
