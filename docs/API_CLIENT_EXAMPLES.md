# CanLII REST API Integration Examples

## Quick Start

### 1. Initialize Client

```typescript
import { CanLIIApiClient } from '@/ingestion/src/clients/canlii-api'

// Create client instance
const client = new CanLIIApiClient(process.env.CANLII_API_KEY)

// Optional: Get singleton instance
import { getCanLIIClient } from '@/ingestion/src/clients/canlii-api'
const sharedClient = getCanLIIClient(process.env.CANLII_API_KEY)
```

### 2. Validate Connection

```typescript
// Check API connectivity and authentication
const isValid = await client.validateConnection()

if (!isValid) {
  throw new Error('Cannot connect to CanLII API. Check API key and network.')
}

console.log('✅ CanLII API connection valid')
```

### 3. Discover Databases

```typescript
// Get all available case databases
const databases = await client.getCaseDatabases()

console.log(`Found ${databases.length} databases:`)
databases.forEach((db) => {
  console.log(`  - ${db.databaseId}: ${db.name}`)
})

// Filter to human rights tribunals
const hrTribunals = databases.filter(
  (db) => db.jurisdiction && db.jurisdiction.toLowerCase().includes('human rights')
)

console.log(`\nHuman Rights Tribunals (${hrTribunals.length}):`)
hrTribunals.forEach((db) => {
  console.log(`  - ${db.databaseId}: ${db.name}`)
})
```

### 4. Discover Cases

```typescript
// Discover cases from Ontario Human Rights Tribunal
const cases = await client.discoverCases('onhrt', 0, 100)

console.log(`Discovered ${cases.length} cases from HRTO:`)
cases.forEach((caseRef) => {
  console.log(`  ${caseRef.caseId}: ${caseRef.title}`)
})
```

### 5. Fetch Case Metadata

```typescript
// Get detailed metadata for specific case
const firstCase = cases[0]

if (firstCase) {
  const metadata = await client.getCaseMetadata(firstCase.databaseId, firstCase.caseId)

  console.log('\nCase Details:')
  console.log(`  Title: ${metadata.title}`)
  console.log(`  Citation: ${metadata.citation}`)
  console.log(`  Decision Date: ${metadata.decisionDate}`)
  console.log(`  Docket Number: ${metadata.docketNumber}`)
  console.log(`  Keywords: ${metadata.keywords?.join(', ') || 'N/A'}`)
}
```

### 6. Get Citing Cases

```typescript
// Find all cases that cite this decision
const citingCases = await client.getCitingCases('onhrt', firstCase.caseId)

console.log(`\nCases citing ${firstCase.caseId} (${citingCases.length}):`)
citingCases.slice(0, 5).forEach((cite) => {
  console.log(`  - ${cite.caseId}: ${cite.title}`)
})
```

---

## Advanced Usage

### Pagination Example

```typescript
async function* discoverAllCases(databaseId: string, pageSize = 100, maxCases = 50000) {
  let offset = 0

  while (offset < maxCases) {
    try {
      const cases = await client.discoverCases(databaseId, offset, pageSize)

      if (cases.length === 0) {
        console.log(`Reached end of results at offset ${offset}`)
        break
      }

      for (const caseRef of cases) {
        yield caseRef
      }

      console.log(`Fetched ${offset + cases.length} cases so far...`)
      offset += cases.length

      // Respect rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        console.warn(`Rate limited, waiting ${error.details.retryAfter}s...`)
        await new Promise((resolve) => setTimeout(resolve, error.details.retryAfter * 1000))
        continue
      }
      throw error
    }
  }
}

// Usage
const allCases = []
for await (const caseRef of discoverAllCases('onhrt', 500)) {
  allCases.push(caseRef)
}

console.log(`Total: ${allCases.length} cases discovered`)
```

### Error Handling Example

```typescript
import {
  retryWithBackoff,
  CanLIIError,
  ERROR_CODES,
} from '@/ingestion/src/validation/canlii-validation'

// Retry with automatic backoff
async function fetchWithRetry(databaseId: string, caseId: string) {
  return retryWithBackoff(
    async () => {
      const metadata = await client.getCaseMetadata(databaseId, caseId)
      return metadata
    },
    (maxAttempts = 3),
    (baseDelayMs = 1000)
  )
}

// Custom error handling
try {
  const cases = await client.discoverCases('onhrt', 0, 100)
} catch (error) {
  if (error instanceof CanLIIError) {
    switch (error.code) {
      case ERROR_CODES.AUTH_FAILED:
        console.error('Invalid API key. Check CANLII_API_KEY environment variable.')
        break

      case ERROR_CODES.RATE_LIMITED:
        console.warn(`Rate limited. Retry after ${error.details.retryAfter}s`)
        break

      case ERROR_CODES.NOT_FOUND:
        console.error(`Database or case not found: ${error.message}`)
        break

      case ERROR_CODES.CONNECTION_TIMEOUT:
        console.error('Connection timeout. Check network connectivity.')
        break

      case ERROR_CODES.SERVER_ERROR:
        console.error('CanLII server error. Will retry automatically.')
        break

      default:
        console.error(`Unknown error: ${error.message}`)
    }

    // Check if error is retryable
    if (error.retryable) {
      console.log('This error will be retried automatically.')
    } else {
      console.log('This error is not retryable. Please fix and retry manually.')
    }
  } else {
    throw error
  }
}
```

### Using the Scraper Factory

```typescript
import { createScraper, selectScraperMode } from '@/ingestion/src/scrapers/factory'
import type { SourceConfig } from '@/ingestion/src/types'

// Configuration for REST API mode
const restApiConfig: SourceConfig = {
  name: 'Ontario Human Rights Tribunal',
  type: 'canlii',
  apiMode: 'rest',
  databaseId: 'onhrt',
  enabled: true,
}

// Configuration for web scraper mode (fallback)
const webScraperConfig: SourceConfig = {
  name: 'HRTO Legacy',
  type: 'canlii',
  apiMode: 'scrape',
  listingUrl: 'https://www.canlii.org/en/on/onhr/',
  enabled: false,
}

// Auto-select mode based on environment
const selectedMode = selectScraperMode(restApiConfig)
console.log(`Selected mode: ${selectedMode}`) // 'rest' or 'scrape'

// Create scraper with selected mode
const scraper = await createScraper(restApiConfig)

// Use scraper
const decisions = await scraper.discoverDecisions(1000, 0)
console.log(`Discovered ${decisions.length} decisions`)

// Fetch detailed content
for (const decision of decisions.slice(0, 10)) {
  const content = await scraper.fetchDecisionContent(decision.url)
  console.log(`${content.title} (${content.date})`)
  console.log(`Text length: ${content.textLength || 'N/A'} bytes`)
  console.log()
}
```

### Database Discovery and Mapping

```typescript
import { CanLIIDatabaseMapper } from '@/ingestion/src/clients/canlii-database-mapper'

const mapper = new CanLIIDatabaseMapper(client)

// Discover all databases from API
const mappings = await mapper.discoverAllDatabases()

console.log('Database Mappings:')
console.table(
  mappings.map((m) => ({
    sourceId: m.sourceId,
    databaseId: m.databaseId,
    tribunalName: m.tribunalName,
    matchQuality: m.matchQuality,
  }))
)

// Export as JSON for configuration file
const configMap = mapper.toJSON()
console.log('\nJSON Export:')
console.log(JSON.stringify(configMap, null, 2))

// Export as markdown table
const markdown = mapper.generateMarkdown()
console.log('\nMarkdown Export:')
console.log(markdown)

// Save to file
import { writeFileSync } from 'fs'
writeFileSync('canlii-databases.json', JSON.stringify(configMap, null, 2))
writeFileSync('canlii-databases.md', markdown)
```

### Health Check and Diagnostics

```typescript
import {
  performHealthCheck,
  generateDiagnosticReport,
} from '@/ingestion/src/validation/canlii-validation'

// Run comprehensive health check
const health = await performHealthCheck(client)

console.log('Health Check Results:')
console.log(`  Overall Status: ${health.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`)
console.log(`  API Key Valid: ${health.apiKey ? '✅ YES' : '❌ NO'}`)
console.log(`  Connectivity: ${health.connectivity ? '✅ YES' : '❌ NO'}`)
console.log(`  Authentication: ${health.authentication ? '✅ YES' : '❌ NO'}`)
console.log()

// Generate detailed diagnostic report
const report = await generateDiagnosticReport(client)
console.log('Diagnostic Report:')
console.log(report)

// Save report to file
writeFileSync('canlii-diagnostics.md', report)
```

### Validation Examples

```typescript
import {
  validateApiConfiguration,
  validateDatabaseId,
  validateCaseId,
  validateDecisionDate,
} from '@/ingestion/src/validation/canlii-validation'

// Validate API configuration
const config = validateApiConfiguration()
if (!config.valid) {
  console.error('Configuration errors:')
  config.errors.forEach((error) => console.error(`  - ${error}`))
}

if (config.warnings.length > 0) {
  console.warn('Configuration warnings:')
  config.warnings.forEach((warning) => console.warn(`  - ${warning}`))
}

// Validate individual inputs
console.log('Validating inputs:')
console.log(`  onhrt: ${validateDatabaseId('onhrt')}`) // true
console.log(`  invalid db: ${validateDatabaseId('invalid db')}`) // false
console.log(`  2024canlii123: ${validateCaseId('2024canlii123')}`) // true
console.log(`  2024-01-15: ${validateDecisionDate('2024-01-15')}`) // true
```

---

## Complete Integration Example

```typescript
import { CanLIIApiClient } from '@/ingestion/src/clients/canlii-api'
import { CanLIIDatabaseMapper } from '@/ingestion/src/clients/canlii-database-mapper'
import {
  performHealthCheck,
  retryWithBackoff,
  generateDiagnosticReport,
} from '@/ingestion/src/validation/canlii-validation'

async function integrateCanLII() {
  // 1. Initialize
  console.log('🚀 Initializing CanLII integration...\n')
  const apiKey = process.env.CANLII_API_KEY
  if (!apiKey) {
    throw new Error('CANLII_API_KEY not set in environment')
  }

  const client = new CanLIIApiClient(apiKey)

  // 2. Health check
  console.log('🔍 Running health check...')
  const health = await performHealthCheck(client)
  if (!health.healthy) {
    console.error('❌ Health check failed:')
    console.error(health.diagnostics)
    throw new Error('CanLII API health check failed')
  }
  console.log('✅ Health check passed\n')

  // 3. Discover databases
  console.log('📚 Discovering databases...')
  const mapper = new CanLIIDatabaseMapper(client)
  const mappings = await mapper.discoverAllDatabases()
  console.log(`✅ Found ${mappings.length} databases\n`)

  // 4. Discover cases
  console.log('🔎 Discovering cases...')
  const cases = await retryWithBackoff(
    async () => await client.discoverCases('onhrt', 0, 100),
    (maxAttempts = 3)
  )
  console.log(`✅ Discovered ${cases.length} cases\n`)

  // 5. Fetch metadata
  console.log('📖 Fetching case metadata...')
  const metadata = await client.getCaseMetadata(cases[0].databaseId, cases[0].caseId)
  console.log(`✅ Case: ${metadata.title}`)
  console.log(`   Citation: ${metadata.citation}`)
  console.log(`   Date: ${metadata.decisionDate}\n`)

  // 6. Get citing cases
  console.log('🔗 Finding citing cases...')
  const citations = await client.getCitingCases(cases[0].databaseId, cases[0].caseId)
  console.log(`✅ Found ${citations.length} citing cases\n`)

  // 7. Generate report
  console.log('📊 Generating diagnostic report...')
  const report = await generateDiagnosticReport(client)
  console.log('✅ Report ready for analysis\n')

  // 8. Summary
  console.log('✨ Integration successful!')
  console.log(`Total databases: ${mappings.length}`)
  console.log(`Cases discovered: ${cases.length}`)
  console.log(`Citations found: ${citations.length}`)
}

// Run integration
integrateCanLII().catch((error) => {
  console.error('❌ Integration failed:', error.message)
  process.exit(1)
})
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('CanLII Integration', () => {
  it('should validate API connection', async () => {
    const client = new CanLIIApiClient(process.env.CANLII_API_KEY)
    const isValid = await client.validateConnection()
    expect(isValid).toBe(true)
  })

  it('should discover databases', async () => {
    const client = new CanLIIApiClient(process.env.CANLII_API_KEY)
    const databases = await client.getCaseDatabases()
    expect(databases.length).toBeGreaterThan(0)
  })

  it('should handle rate limiting', async () => {
    const client = new CanLIIApiClient(process.env.CANLII_API_KEY)
    const promises = []

    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      promises.push(client.getCaseDatabases())
    }

    const results = await Promise.all(promises)
    expect(results.length).toBe(5)
  })
})
```

### Running Tests

```bash
# Run all tests
npm run test:unit tests/ingestion-*.spec.ts

# Run with coverage
npm run test:unit -- --coverage tests/ingestion-*.spec.ts

# Run live API tests
CANLII_API_KEY=your-key npm run test:unit tests/ingestion-canlii-api.spec.ts

# Run with debug logging
DEBUG=canlii:* npm run test:unit tests/ingestion-*.spec.ts
```

---

## Performance Benchmarks

```typescript
// Measure API performance
async function benchmarkAPI() {
  const client = new CanLIIApiClient(process.env.CANLII_API_KEY)

  // Benchmark database discovery
  console.time('Database Discovery')
  await client.getCaseDatabases()
  console.timeEnd('Database Discovery') // ~200-300ms

  // Benchmark case discovery
  console.time('Case Discovery (100 cases)')
  await client.discoverCases('onhrt', 0, 100)
  console.timeEnd('Case Discovery (100 cases)') // ~150-250ms

  // Benchmark metadata retrieval
  console.time('Metadata Retrieval')
  await client.getCaseMetadata('onhrt', '2024canlii12345')
  console.timeEnd('Metadata Retrieval') // ~100-200ms

  // Benchmark citations
  console.time('Citation Discovery')
  await client.getCitingCases('onhrt', '2024canlii12345')
  console.timeEnd('Citation Discovery') // ~150-250ms
}
```

---

## Troubleshooting

### Common Issues

**Issue: "Invalid API key"**

```typescript
// Check if key is set and valid
const client = new CanLIIApiClient(process.env.CANLII_API_KEY)
const isValid = await client.validateConnection()
if (!isValid) {
  console.error('API key is invalid. Request a new key from CanLII.')
}
```

**Issue: "Rate Limited"**

```typescript
// Built-in rate limiting should prevent this
// But if it happens, use retryWithBackoff
const result = await retryWithBackoff(
  async () => await client.getCaseDatabases(),
  (maxAttempts = 5) // Increase max attempts
)
```

**Issue: "Database Not Found"**

```typescript
// First, discover available databases
const databases = await client.getCaseDatabases()
const dbIds = databases.map((db) => db.databaseId)
console.log('Available databases:', dbIds)

// Then use correct database ID
const cases = await client.discoverCases('onhrt', 0, 100)
```

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Production Ready
