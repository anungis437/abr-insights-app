# CanLII API Setup Guide

## ✅ Setup Complete

Your CanLII API connection has been validated and is ready to use!

## Configuration Status

| Component | Status | Location |
|-----------|--------|----------|
| API Key | ✅ Configured | GitHub Secrets & Local .env |
| Database Access | ✅ 406 databases | https://api.canlii.org/v1 |
| Rate Limiting | ✅ Enforced | 2 requests/second |
| Validation Script | ✅ Available | `scripts/validate-canlii-connection.mjs` |

## Validation Results

**Last Validated:** February 5, 2026

- ✅ **API Authentication:** Working
- ✅ **Database Listing:** 406 case databases accessible
- ✅ **Case Browsing:** Successfully retrieved recent cases
- ✅ **Rate Limiting:** Properly enforced (429 on rapid requests)
- ✅ **Most Recent Case:** 2026 HRTO 173 (CanLII)

## Available Tribunal Databases

Key tribunals accessible via API:

- `onhrt` - Human Rights Tribunal of Ontario
- `bcest` - British Columbia Employment Standards Tribunal
- `qctp` - Professions Tribunal (Quebec)
- `nuwcat` - NWT/Nunavut Workers' Compensation Appeals Tribunal
- `nbsec` - Financial and Consumer Services Tribunal
- `bchprb` - Health Professions Review Board of British Columbia
- `nsawab` - Nova Scotia Animal Welfare Appeal Board
- `onset` - Ontario Special Education Tribunal
- `qcbdrvm` - Tribunal administratif des marchés financiers
- `eptc` - Environmental Protection Tribunal of Canada

**Total:** 406 case databases available

## Usage

### 1. Validate Connection

Run the validation script to test your API connection:

```bash
node scripts/validate-canlii-connection.mjs
```

### 2. Use in Code

The API client is available at `ingestion/src/clients/canlii-api.ts`:

```typescript
import { CanLIIApiClient } from './clients/canlii-api'

const client = new CanLIIApiClient()

// List all databases
const databases = await client.listCaseDatabases('en')

// Browse cases from a specific tribunal
const cases = await client.browseCases('en', 'onhrt', { 
  offset: 0, 
  resultCount: 50 
})

// Get case metadata
const metadata = await client.getCaseMetadata('en', 'onhrt', 'someCase')
```

### 3. Environment Variables

**Local Development (.env file):**
```env
CANLII_API_KEY=your-api-key-here
CANLII_API_ENABLED=true
CANLII_FETCH_MODE=metadata-only
CANLII_ALLOW_FULL_TEXT_RISK=false
```

**GitHub Actions (Secrets):**
- `CANLII_API_KEY` - Set via `gh secret set CANLII_API_KEY`
- Available in workflows as `${{ secrets.CANLII_API_KEY }}`

## API Limits & Best Practices

### Rate Limiting

- **Limit:** 2 requests per second (500ms between requests)
- **Enforcement:** Server returns 429 if exceeded
- **Implementation:** Use built-in `RateLimiter` from `utils`

```typescript
import { RateLimiter } from './utils'

const limiter = new RateLimiter({
  requestsPerSecond: 2,
  maxConcurrent: 1,
  maxRequestsPerDay: 5000
})

await limiter.waitForSlot()
// Make API request
```

### Compliance Requirements

1. **Attribution:** Always cite CanLII as the source
2. **Rate Limits:** Respect 2 req/sec limit
3. **Metadata Only:** Default mode fetches metadata only
4. **Full Text:** Requires explicit permission (set `CANLII_ALLOW_FULL_TEXT_RISK=true`)
5. **Terms of Use:** See [CanLII Terms](https://www.canlii.org/en/info/terms.html)

## Troubleshooting

### API Key Not Working

If you get 401/403 errors:

1. Verify API key in `.env`: `CANLII_API_KEY=your-key-here`
2. Verify API key in GitHub Secrets: `gh secret list | grep CANLII`
3. Request new key: https://www.canlii.org/en/feedback/feedback.html

### Rate Limiting Errors (429)

This is normal and expected! The validation script tests this intentionally.

To handle in code:
```typescript
try {
  await client.browseCases('en', 'onhrt')
} catch (error) {
  if (error.response?.status === 429) {
    // Wait and retry
    await sleep(1000)
    // Retry request
  }
}
```

### Database Not Found (404)

Some tribunals may not have a CanLII database ID. Check available databases:

```bash
node scripts/validate-canlii-connection.mjs
```

Or query the API:
```typescript
const databases = await client.listCaseDatabases('en')
const tribunals = databases.filter(db => 
  db.name.toLowerCase().includes('tribunal')
)
```

## Resources

- **API Documentation:** https://github.com/canlii/API_documentation
- **Request API Key:** https://www.canlii.org/en/feedback/feedback.html
- **Terms of Use:** https://www.canlii.org/en/info/terms.html
- **Validation Script:** `scripts/validate-canlii-connection.mjs`
- **Client Implementation:** `ingestion/src/clients/canlii-api.ts`
- **REST API Scraper:** `ingestion/src/scrapers/canlii-rest-api.ts`

## Next Steps

Your CanLII API is configured and validated. You can now:

1. ✅ Browse case databases programmatically
2. ✅ Fetch case metadata for tribunals
3. ✅ Implement case ingestion workflows
4. ✅ Run CanLII compliance CI/CD checks

For case ingestion, see:
- `docs/features/CASE_INGESTION.md`
- `docs/compliance/CANLII_COMPLIANCE.md`
