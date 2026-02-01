# CanLII Scraper Status & Compliance

## Current Status: FAIL-CLOSED ✅

The CanLII web scraper (`ingestion/src/scrapers/canlii.ts`) is **fail-closed by design** at the factory level.

### Enforcement Points

1. **Factory-Level Enforcement** (`ingestion/src/scrapers/factory.ts`)
   - CanLII sources (`canlii_*`) **require** REST API configuration
   - Missing `CANLII_API_KEY` or `CANLII_API_ENABLED=false` → **throws error**
   - No fallback to web scraping for CanLII sources
   - Lines 33-103: `selectScraperMode()` function

2. **API-Only Mode** (`ingestion/src/scrapers/canlii-rest-api.ts`)
   - Default: `CANLII_FETCH_MODE=metadata-only` (compliant)
   - Full-text mode requires **explicit risk acknowledgment**: `CANLII_ALLOW_FULL_TEXT_RISK=true`
   - Without risk flag, full-text mode throws clear error

3. **Web Scraper Status** (`ingestion/src/scrapers/canlii.ts`)
   - **Still exists in codebase** for non-CanLII sources
   - **Cannot be invoked for CanLII sources** (factory blocks it)
   - Used only for non-CanLII tribunals

## Production Readiness Checklist

✅ Factory enforces API-only for CanLII  
✅ Missing API key → fail-closed (error thrown)  
✅ Default mode: metadata-only  
✅ Full-text requires explicit risk flag  
✅ No accidental web scraping for CanLII

## Recommended Production Configuration

```bash
# Required
CANLII_API_ENABLED=true
CANLII_API_KEY=your-api-key-here

# Compliance (default if not set)
CANLII_FETCH_MODE=metadata-only

# Must remain unset/false in production
CANLII_ALLOW_FULL_TEXT_RISK=false
```

## Optional: Remove Web Scraper from Production

If you want **maximum assurance** that the CanLII web scraper cannot be accidentally enabled:

### Option 1: Remove from production builds

Add to `next.config.js`:

```js
webpack: (config, { isServer }) => {
  if (isServer && process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /scrapers\/canlii\.ts$/,
      })
    )
  }
  return config
}
```

### Option 2: Hard-disable in code

Add to `canlii.ts`:

```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error('CanLII web scraper is disabled in production')
}
```

## Verdict

**Current implementation is world-class for CanLII compliance:**

- Factory-level fail-closed enforcement
- No web scraping fallback possible
- Explicit risk acknowledgment required for full-text
- Clear error messages guide developers to compliant configuration

The web scraper file exists but **cannot be used for CanLII sources** without bypassing multiple safety checks. For additional assurance, implement one of the optional removal strategies above.
