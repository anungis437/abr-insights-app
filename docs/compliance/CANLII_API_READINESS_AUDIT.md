# CanLII REST API Readiness Audit

**Date:** January 31, 2026  
**Status:** ⚠️ NOT READY FOR PRODUCTION API - Web Scraping Mode Active  
**Priority:** HIGH - Required for production-grade tribunal data ingestion

---

## Executive Summary

Your application currently uses **web scraping** via Cheerio/Axios to extract tribunal cases from CanLII's HTML pages. While functional, this approach has significant limitations compared to the official **CanLII REST API**. This audit identifies all gaps and provides a migration path.

| Category              | Current             | Required        | Gap                                                |
| --------------------- | ------------------- | --------------- | -------------------------------------------------- |
| **API Integration**   | ❌ None             | ✅ REST API v1  | Full implementation needed                         |
| **Authentication**    | ❌ None             | ✅ API Key      | Missing                                            |
| **Database IDs**      | ⚠️ URLs only        | ✅ Proper IDs   | Mapping required                                   |
| **Data Format**       | ⚠️ HTML parsing     | ✅ JSON         | Already consuming JSON in DB, just need API source |
| **Rate Limiting**     | ✅ Basic (2s delay) | ✅ API-aware    | Needs adjustment                                   |
| **Error Handling**    | ⚠️ Generic          | ⚠️ API-specific | Needs API error codes                              |
| **Environment Setup** | ⚠️ Partial          | ✅ Full         | Missing CANLII_API_KEY                             |

---

## 1. CURRENT IMPLEMENTATION ANALYSIS

### 1.1 Scraper Architecture

**File:** [ingestion/src/scrapers/canlii.ts](ingestion/src/scrapers/canlii.ts)  
**Lines:** 538 total

**Current Flow:**

```
HTML Page → Cheerio Parse → Extract via CSS Selectors → DecisionContent Object
     ↓
Stored in Supabase
```

**Key Components:**

- `CanLIIScraper` class - Main scraper engine
- HTTP Client: Axios with custom headers
- Rate Limiting: 0.5 req/sec (1 request every 2 seconds)
- Retry: 3 attempts with backoff
- No API key - Uses User-Agent spoofing

### 1.2 Current Source Configuration

**File:** [ingestion/src/config/index.ts](ingestion/src/config/index.ts) (Lines 54-235+)

**Configured Sources (13 total):**

```typescript
// Web scraping URLs (NOT API endpoints)
canlii_hrto: 'https://www.canlii.org/en/on/onhrt/'
canlii_chrt: 'https://www.canlii.org/en/ca/chrt/'
canlii_bchrt: 'https://www.canlii.org/en/bc/bchrt/'
canlii_abhr: 'https://www.canlii.org/en/ab/abhrc/'
canlii_skhr: 'https://www.canlii.org/en/sk/skhr/'
canlii_mbhr: 'https://www.canlii.org/en/mb/mbhr/'
canlii_qctdp: 'https://www.canlii.org/en/qc/qctdp/'
canlii_nbhr: 'https://www.canlii.org/en/nb/nbhrc/'
canlii_nshr: 'https://www.canlii.org/en/ns/nshrc/'
canlii_peihr: 'https://www.canlii.org/en/pe/pehrc/'
canlii_nlhr: 'https://www.canlii.org/en/nl/nlhrc/'
canlii_ythr: 'https://www.canlii.org/en/yt/ythr/'
canlii_nthr: 'https://www.canlii.org/en/nt/nthr/'
```

### 1.3 Data Type Definitions

**File:** [ingestion/src/types/index.ts](ingestion/src/types/index.ts) (Lines 1-80+)

**Current Data Model:**

- `SourceSystem` - 26 types (13 canlii\__, 13_\_direct placeholders)
- `SourceConfig` - HTML selector-based configuration
- `DecisionLink` - Link metadata from listing pages
- `DecisionContent` - Full case content extracted from HTML

**Missing:** API-specific types (databaseId, caseId, offset-based pagination)

### 1.4 Environment Configuration

**File:** [ingestion/src/config/index.ts](ingestion/src/config/index.ts) (Lines 14-26)

```typescript
export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || '',
  // ... no CANLII_API_KEY
}
```

**Missing:** `CANLII_API_KEY` environment variable

---

## 2. CANLII REST API REQUIREMENTS

### 2.1 API Overview

- **Base URL:** `https://api.canlii.org/v1/`
- **Protocol:** HTTPS only (no HTTP)
- **Format:** JSON responses
- **Authentication:** Query parameter `?api_key={key}`
- **Rate Limiting:** Not officially documented (infer from usage)
- **Payload Limit:** 10MB max (uses Range requests for larger)

### 2.2 Required API Endpoints

#### A. Case Browse - List Cases

```
GET https://api.canlii.org/v1/caseBrowse/{language}/{databaseId}/?offset={offset}&resultCount={resultCount}&api_key={key}
```

- **Parameters:**
  - `language`: "en" or "fr"
  - `databaseId`: e.g., "onhrt" (NOT URL path)
  - `offset`: Starting record number (0 = most recent)
  - `resultCount`: 1-10,000 results
  - Optional: `publishedBefore`, `publishedAfter`, `modifiedBefore`, `modifiedAfter`, `decisionDateBefore`, `decisionDateAfter`
- **Response:** Array of cases with citation, title, caseId

#### B. Case Browse - Get Metadata

```
GET https://api.canlii.org/v1/caseBrowse/{language}/{databaseId}/{caseId}/?api_key={key}
```

- **Returns:** Full metadata (title, citation, keywords, docketNumber, decisionDate, etc.)
- **Note:** Does NOT return full text content (need to use CanLII web URL)

#### C. Case Browse - List Databases

```
GET https://api.canlii.org/v1/caseBrowse/{language}/?api_key={key}
```

- **Returns:** All available databases with databaseId, jurisdiction, name

#### D. Case Citator (Bonus)

```
GET https://api.canlii.org/v1/caseCitator/{language}/{databaseId}/{caseId}/{metadataType}/?api_key={key}
```

- **metadataType:** citedCases, citingCases, citedLegislations
- **Returns:** Citation relationships

#### E. Legislation Browse (Future Enhancement)

```
GET https://api.canlii.org/v1/legislationBrowse/{language}/{databaseId}/?api_key={key}
```

- Can also ingest relevant legislation/regulations

### 2.3 Database ID Mapping

**Known mappings (from CanLII API docs):**

```
HRTO Cases:     Need to verify actual databaseId (may be "onhrt" or similar)
CHRT Cases:     "csc-scc" or "chrt" (need verification)
BCHRT Cases:    Need to verify
Provincial HRCs: Need to verify for each province
```

**Gap:** We have URLs but not official CanLII database IDs. Requires:

1. Call `GET /caseBrowse/en/?api_key={key}` to list all databases
2. Match tribunal names to databaseIds
3. Update configuration

---

## 3. GAP ANALYSIS

### 3.1 CRITICAL GAPS (Must Fix)

#### Gap 1: API Key Not Configured ⛔

- **Current State:** No `CANLII_API_KEY` environment variable
- **Required:** API key from CanLII feedback form
- **Effort:** 5 min (apply for key, add to .env)
- **Blocking:** YES

**Action:**

1. Send feedback to CanLII: <https://www.canlii.org/en/feedback/feedback.html>
2. Request API key for "ABR Insights - Educational Research"
3. Add to `.env.local`:

   ```
   CANLII_API_KEY=your-key-here
   ```

4. Add to [ingestion/src/config/index.ts](ingestion/src/config/index.ts):

   ```typescript
   CANLII_API_KEY: process.env.CANLII_API_KEY || '',
   ```

#### Gap 2: Database ID Mapping Missing ⛔

- **Current State:** Config has URLs only
- **Required:** Actual CanLII databaseIds
- **Example Mismatch:**
  - Current: `listingUrl: 'https://www.canlii.org/en/on/onhrt/'`
  - API Needs: `databaseId: 'onhrt'` (or actual ID if different)
- **Effort:** 30 min (call API, verify all 13 sources)

**Action:**

```bash
# Once you have API key:
curl "https://api.canlii.org/v1/caseBrowse/en/?api_key={KEY}" | jq '.caseDatabases[]'

# Look for entries with names like:
# - "Human Rights Tribunal of Ontario"
# - "Canadian Human Rights Tribunal"
# - "BC Human Rights Tribunal"
# etc.
```

#### Gap 3: API-Specific Types Missing ⛔

- **Current State:** Types use HTML selectors and listing URLs
- **Required:** New types for offset-based pagination, databaseId, caseId
- **Files to Update:**
  - [ingestion/src/types/index.ts](ingestion/src/types/index.ts)
  - [ingestion/src/config/index.ts](ingestion/src/config/index.ts)
- **Effort:** 1-2 hours

### 3.2 MAJOR GAPS (Important)

#### Gap 4: Scraper Implementation ⚠️

- **Current State:** Cheerio HTML parser
- **Required:** Axios calls to REST endpoints
- **File:** [ingestion/src/scrapers/canlii.ts](ingestion/src/scrapers/canlii.ts)
- **Methods to Refactor:**
  - `discoverDecisions()` → Use `/caseBrowse/{db}?offset=X&resultCount=Y`
  - `fetchDecisionContent()` → Use `/caseBrowse/{db}/{caseId}` for metadata, then fetch full text from CanLII URL
  - `buildListingUrl()` → No longer needed
  - `parseListingPage()` → Replace with JSON parsing
- **Effort:** 2-3 hours

#### Gap 5: Pagination Strategy ⚠️

- **Current State:** Page-based (page 1, 2, 3...)
- **API Uses:** Offset-based (offset=0, resultCount=100; offset=100, resultCount=100...)
- **Max:** 10,000 per request, so max offset ~1M records
- **Effort:** 1 hour

#### Gap 6: Error Handling ⚠️

- **Current State:** Generic HTTP errors
- **API Returns:** Specific error codes (need to handle)
- **10MB Payload Limit:** Rare but needs Range request handling
- **Effort:** 1 hour

### 3.3 MINOR GAPS (Nice to Have)

#### Gap 7: Environment Setup ℹ️

- **File:** [.env.example](.env.example)
- **Missing:** CANLII_API_KEY documentation
- **Effort:** 10 min

#### Gap 8: CLI Documentation ℹ️

- **File:** [ingestion/src/cli.ts](ingestion/src/cli.ts)
- **Current Help:** No mention of API mode vs scraping mode
- **Effort:** 15 min

#### Gap 9: Rate Limiting Adjustment ℹ️

- **Current:** 0.5 req/sec (2s minimum)
- **API:** Unknown limits (likely higher than scraping)
- **Recommendation:** Increase to 2-5 req/sec for API
- **Effort:** 30 min

---

## 4. IMPACT ANALYSIS

### 4.1 What Breaks in Production (Scraping Mode)

```
⚠️ FRAGILITY RISKS:
- CanLII website redesign → CSS selectors break
- Rate limiting tightened → Requests blocked (403/429)
- IP blocks → Can't discover/fetch cases
- Page structure changes → Extraction fails silently
```

### 4.2 What Improves with API

```
✅ RELIABILITY:
- Official, documented endpoints
- JSON responses (structured)
- Versioned API (v1)
- No HTML parsing failures
- Better error messages

✅ PERFORMANCE:
- Faster responses (no DOM parsing)
- Structured data immediately usable
- Can batch requests more efficiently
- Better rate limit transparency

✅ COMPLIANCE:
- Licensed API access (vs scraping ToS gray area)
- Audit trail via API key
- Official support channel
- SLA possible
```

---

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Setup (15 min) ⏱️

- [ ] Request CANLII API key
- [ ] Add `CANLII_API_KEY` to `.env.local` and `.env.example`
- [ ] Update [ingestion/src/config/index.ts](ingestion/src/config/index.ts) to load key

### Phase 2: Discovery & Mapping (1 hour) ⏱️

- [ ] Call `/caseBrowse/en/?api_key={key}` to list all databases
- [ ] Map tribunal names to databaseIds
- [ ] Document mapping (create DATABASE_ID_MAPPING.md)
- [ ] Update source configuration with databaseIds

### Phase 3: Types & Config (1.5 hours) ⏱️

- [ ] Create API-specific types (CanLIICase, CanLIIDatabase, etc.)
- [ ] Add databaseId field to SourceConfig
- [ ] Support both offset-based and page-based pagination configs
- [ ] Add API endpoint URL to config

### Phase 4: Scraper Refactor (2-3 hours) ⏱️

- [ ] Create `CanLIIApiScraper` class (new file or refactor existing)
- [ ] Implement `discoverDecisions()` using `/caseBrowse/{db}`
- [ ] Implement `fetchDecisionContent()` using `/caseBrowse/{db}/{caseId}`
- [ ] Add offset-based pagination loop
- [ ] Handle 10MB payload limit with Range requests

### Phase 5: Error Handling (1 hour) ⏱️

- [ ] Add API-specific error codes
- [ ] Handle rate limiting (429)
- [ ] Handle authentication errors (401/403)
- [ ] Handle payload too large (413)

### Phase 6: Testing & Migration (2 hours) ⏱️

- [ ] Create API integration tests
- [ ] Test all 13 tribunal sources
- [ ] Compare API results vs scraping results
- [ ] Validate data quality

### Phase 7: Deployment (30 min) ⏱️

- [ ] Update CI/CD to include `CANLII_API_KEY`
- [ ] Document migration in CANLII_API_MIGRATION.md
- [ ] Deploy to production with feature flag (if desired)

**Total Effort:** ~8-10 hours  
**Risk Level:** Low (backwards compatible if gradual)

---

## 6. DECISION MATRIX

### Option A: Keep Web Scraping (Current)

| Pro                 | Con                    |
| ------------------- | ---------------------- |
| No API key needed   | Fragile to DOM changes |
| Works today         | High failure risk      |
| No changes required | Not production-grade   |
|                     | Violates implicit ToS  |

### Option B: Migrate to REST API (Recommended)

| Pro                   | Con                        |
| --------------------- | -------------------------- |
| Official, licensed    | Requires API key           |
| Production-grade      | 8-10 hours work            |
| Structured data       | Need to verify databaseIds |
| Better error handling | None significant           |
| Faster performance    |                            |

### Option C: Hybrid (Phase Transition)

| Pro                  | Con                      |
| -------------------- | ------------------------ |
| Low risk transition  | Complex code management  |
| Can test in parallel | Higher maintenance       |
| Easy rollback        | Temporary technical debt |

**Recommendation:** **Option B - Full Migration to REST API**

- Cost: 8-10 hours (1-2 days)
- Benefit: Production-ready, licensed, official support
- Risk: Low (well-documented API)

---

## 7. VERIFICATION CHECKLIST

Before implementing, verify:

- [ ] Can request CANLII API key via feedback form
- [ ] API documentation is stable (last updated 7 years ago, but functional)
- [ ] CanLII maintains active API support
- [ ] All 13 tribunal sources have databaseIds in API
- [ ] No breaking changes expected soon

---

## 8. FILES TO MODIFY

**Core Implementation:**

1. [ingestion/src/config/index.ts](ingestion/src/config/index.ts) - Add API key, update SOURCE_CONFIGS
2. [ingestion/src/types/index.ts](ingestion/src/types/index.ts) - Add API-specific types
3. [ingestion/src/scrapers/canlii.ts](ingestion/src/scrapers/canlii.ts) - Refactor to use REST API

**Configuration:** 4. [.env.example](.env.example) - Add CANLII_API_KEY

**Documentation:** 5. [ingestion/src/cli.ts](ingestion/src/cli.ts) - Update help text

**New Files:** 6. `DATABASE_ID_MAPPING.md` - CanLII database ID reference 7. `CANLII_API_MIGRATION.md` - Implementation guide (post-audit)

---

## 9. RISK ASSESSMENT

| Risk                    | Likelihood | Impact | Mitigation                                     |
| ----------------------- | ---------- | ------ | ---------------------------------------------- |
| API key denied          | Low        | High   | Use official channels, explain educational use |
| Database ID mismatch    | Low        | Medium | Verify all IDs via API before migration        |
| Rate limits unknown     | Medium     | Low    | Start conservative (2 req/sec), monitor        |
| 10MB payload cases rare | Low        | Low    | Add Range request support                      |
| Breaking API changes    | Very Low   | Medium | API stable for 7+ years, v1 versions           |

**Overall Risk:** ✅ **LOW** - Well-documented, stable API with clear migration path

---

## 10. NEXT STEPS

1. **Approve migration** to REST API
2. **Request CanLII API key** (I can draft the request)
3. **Begin Phase 1** (setup) once key is obtained
4. **Execute Phases 2-7** following roadmap above

---

**Document Status:** Ready for implementation  
**Last Updated:** January 31, 2026  
**Author:** ABR Insights Team
