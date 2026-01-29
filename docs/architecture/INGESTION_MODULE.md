# Tribunal Data Ingestion Module

**Status**: 🟡 In Design
**Priority**: P0 (Core Feature)
**Owner**: TBD

## Overview

The Ingestion Module is an automated pipeline that fetches public Canadian tribunal decisions from sources like HRTO, CHRT, CanLII, and others, extracts metadata, classifies cases using AI/rule-based analysis to detect anti-Black racism cases, and stores the results in Supabase.

This is a **prototype-first** approach that will evolve into a production-grade system running on Azure Functions with scheduled execution.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                  Azure Function (Timer Trigger)              │
│                      Runs Daily at 2 AM                      │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Ingestion Orchestrator │
          └────────────┬─────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ Source Discovery│         │  Job Tracking   │
│   (Web Scraper) │         │  (Supabase)     │
└────────┬────────┘         └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Content Fetcher │
│  (HTTP + PDF)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Text Classifier            │
│  ┌──────────┐  ┌──────────────┐ │
│  │   Rule   │  │  AI (GPT-4o) │ │
│  │  Engine  │  │   Analysis   │ │
│  └──────────┘  └──────────────┘ │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│ tribunal_cases  │
│     _raw        │
└─────────────────┘
```

---

## Scope

### Phase 1: Prototype (Current)

**Goal**: Prove the concept with one source (HRTO via CanLII)

**Deliverables**:

- [ ] Ingest 20-50 latest HRTO decisions
- [ ] Extract: title, tribunal, date, URL, full_text, decision_type
- [ ] Classify with rule + AI layer
- [ ] Store in `tribunal_cases_raw` table
- [ ] Simple admin UI to review results

**Timeline**: Weeks 3-4 (Phase 2B of main refactor)

### Phase 2: Production (Future)

**Goal**: Multi-source, scheduled, automated system

**Scope**:

- [ ] Add CHRT, BCHRT, NSHRC sources
- [ ] Azure Function scheduled execution (daily)
- [ ] Error handling, retry logic, monitoring
- [ ] Data quality dashboard
- [ ] Promotion workflow (raw → clean table)
- [ ] Email alerts for high-confidence anti-Black cases

---

## Functional Requirements

### 1. Source Discovery

**Input**: Base URL or HTML listing page

**Output**: Array of decision links with metadata

**Requirements**:

- Fetch listing page (HTML or API)
- Parse decision links using CSS selectors or JSON paths
- Extract: title, date, URL, decision type
- Handle pagination (if listing spans multiple pages)
- Add throttle delay (default: 2000ms between requests)
- Respect robots.txt

**Example (HRTO via CanLII)**:

```typescript
const listing = await fetch('https://www.canlii.org/en/on/onhrt/')
const $ = cheerio.load(await listing.text())

const decisions: DecisionLink[] = []
$('.result-title a').each((i, elem) => {
  decisions.push({
    title: $(elem).text().trim(),
    url: new URL($(elem).attr('href'), 'https://www.canlii.org').href,
    date: $(elem).closest('.result').find('.date').text(),
  })
})
```

### 2. Content Fetcher

**Input**: Decision URL

**Output**: Full text + HTML excerpt

**Requirements**:

- Fetch decision page (HTML or PDF)
- For HTML: extract main content, strip nav/headers/footers
- For PDF: store URL for separate parsing (future: use Azure Document Intelligence)
- Handle errors gracefully (404, timeout, etc.)
- Log failed fetches for review

**Example**:

```typescript
async function fetchContent(url: string): Promise<DecisionContent> {
  await sleep(2000) // Throttle

  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  // Remove noise
  $('nav, header, footer, .sidebar, .ad').remove()

  const fullText = $('.decision-content').text().trim()
  const htmlExcerpt = $('.decision-content').html()?.substring(0, 5000) || ''

  return { fullText, htmlExcerpt }
}
```

### 3. Text Classifier

**Two-Layer Approach**: Rule-based (fast) + AI (accurate)

#### Layer 1: Rule-Based Classifier

**Purpose**: Fast keyword matching to filter obvious non-race cases

**Logic**:

```typescript
function ruleClassifier(text: string) {
  const lower = text.toLowerCase()

  // Keywords
  const raceKeywords = ['race', 'racial', 'colour', 'color', 'ancestry', 'ethnic']
  const blackKeywords = ['black', 'anti-black', 'african', 'caribbean', 'afro-canadian']
  const discriminationKeywords = ['discrimination', 'discriminatory', 'profiling', 'harassment']

  // Detection logic
  const hasRace = raceKeywords.some((kw) => lower.includes(kw))
  const hasDiscrimination = discriminationKeywords.some((kw) => lower.includes(kw))
  const hasBlack = blackKeywords.some((kw) => lower.includes(kw))

  return {
    isRaceRelated: hasRace && hasDiscrimination,
    isAntiBlackLikely: hasBlack && hasRace,
    groundsDetected: detectGrounds(lower),
  }
}

function detectGrounds(text: string): string[] {
  const grounds = []
  if (text.includes('race') || text.includes('racial')) grounds.push('race')
  if (text.includes('colour') || text.includes('color')) grounds.push('colour')
  if (text.includes('ancestry')) grounds.push('ancestry')
  if (text.includes('place of origin')) grounds.push('place_of_origin')
  if (text.includes('ethnic')) grounds.push('ethnic_origin')
  return grounds
}
```

#### Layer 2: AI Classifier (Azure OpenAI GPT-4o)

**Purpose**: Deep analysis for nuanced understanding

**Prompt Template** (stored in `tribunal_sources.classification_prompts`):

```text
You are an expert in Canadian human rights law and anti-Black racism analysis.

Analyze this tribunal decision and provide:

1. Is this decision about discrimination on the basis of race or colour?
2. Does the fact pattern indicate a Black complainant or anti-Black context?
3. What protected grounds under human rights legislation are mentioned?
4. Provide a 2-3 sentence summary of the key allegations and outcome.

Decision excerpt:
{text}

Respond in JSON format:
{
  "is_race_related": true/false,
  "race_confidence": 0.0-1.0,
  "is_anti_black_likely": true/false,
  "anti_black_confidence": 0.0-1.0,
  "grounds_detected": ["race", "colour"],
  "summary": "Brief summary here..."
}
```

**Implementation**:

```typescript
async function aiClassifier(text: string): Promise<ClassificationResult> {
  const prompt = buildPrompt(text.substring(0, 4000)) // Limit tokens

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert in Canadian human rights law.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content)
}
```

**Confidence Thresholds**:

- `race_confidence >= 0.7` → Flag as race-related
- `anti_black_confidence >= 0.6` → Flag as anti-Black likely
- `anti_black_confidence >= 0.8` → Send alert email to admins

### 4. Storage (Prototype)

**Table**: `tribunal_cases_raw`

**Record Structure**:

```typescript
interface TribunalCaseRaw {
  id: string // UUID
  source: 'HRTO' | 'CHRT' | 'CanLII' | 'BCHRT' | 'NSHRC'
  title: string
  date: string // ISO 8601
  url: string // Unique
  decision_type?: string // 'Preliminary', 'Final', 'Costs', etc.
  full_text: string
  html_excerpt: string

  // Classification results
  is_race_related: boolean
  is_anti_black_likely: boolean
  grounds_detected: string[]
  confidence_scores: {
    race_related: number // 0-1
    anti_black: number // 0-1
  }
  ai_summary: string

  // Metadata
  processing_status: 'pending' | 'processing' | 'classified' | 'promoted' | 'rejected' | 'failed'
  processing_error?: string
  ingested_at: string // Timestamp
  processed_at?: string
  promoted_at?: string // When moved to tribunal_cases
}
```

**Promotion Workflow**:

- Admin reviews cases in `tribunal_cases_raw`
- For high-quality, high-confidence cases → "Promote" to `tribunal_cases` (clean table)
- Enriched with additional metadata (case_number, outcome, monetary_award, etc.)
- Link: `tribunal_cases.ingested_from_raw_id → tribunal_cases_raw.id`

### 5. Admin View

**URL**: `/admin/ingestion`

**Features**:

- **List View**: Latest ingested cases (table)
  - Columns: Title, Source, Date, Race-Related?, Anti-Black?, Confidence, Status
  - Filters: Source, Date range, Race-related only, Anti-Black only, Status
  - Sort: By date, confidence score
  - Pagination: 50 per page

- **Detail View**: Individual case
  - Full metadata
  - AI summary
  - Classification results with confidence scores
  - Full text preview (first 1000 chars)
  - Link to original source
  - Actions: Promote, Reject, Re-classify

- **Jobs View**: Ingestion job history
  - Job ID, Source, Status, Started, Completed, Discovered, Classified
  - Filters: Source, Status, Date range
  - View logs for failed jobs

**Mockup**:

```text
┌─────────────────────────────────────────────────────────────┐
│  Ingestion Dashboard                            [Run Job ▼] │
├─────────────────────────────────────────────────────────────┤
│  Filters: [HRTO ▼] [2024-01-01 to 2024-12-31] [Race: Yes]  │
├─────────────────────────────────────────────────────────────┤
│  Title             Source  Date      Race?  Anti-Black?     │
│  ────────────────  ──────  ────────  ─────  ───────────     │
│  Smith v. XYZ      HRTO    2024-11   ✓ 0.92  ✓ 0.87         │
│  Jones v. ABC      HRTO    2024-10   ✓ 0.78  ✗ 0.45         │
│  Brown v. DEF      CHRT    2024-09   ✗ 0.12  ✗ 0.03         │
├─────────────────────────────────────────────────────────────┤
│  Page 1 of 10                              [< Prev | Next >]│
└─────────────────────────────────────────────────────────────┘
```

---

## Non-Functional Requirements

### 1. Performance

- Throttle: Minimum 2000ms between requests (configurable per source)
- Batch size: Default 50 decisions per run (configurable)
- Timeout: 30s per request
- Concurrent scraping: Max 3 sources in parallel (to avoid Azure Function timeout)

### 2. Reliability

- Retry logic: 3 attempts with exponential backoff
- Error handling: Log all errors, continue processing other decisions
- Idempotency: Skip already-ingested URLs (check `tribunal_cases_raw.url`)
- State tracking: Use `ingestion_jobs` table for monitoring

### 3. Monitoring

- Application Insights metrics:
  - `ingestion.decisions.discovered`
  - `ingestion.decisions.classified`
  - `ingestion.decisions.failed`
  - `ingestion.ai.api_calls`
  - `ingestion.duration_ms`

- Alerts:
  - Job failure (3 consecutive failures)
  - High error rate (> 20% failures)
  - No new decisions found (potential scraper breakage)

### 4. Security

- Respect robots.txt for each source
- User-Agent: `ABRInsights-Bot/1.0 (contact@abrinsights.com)`
- Rate limiting: Honor `Retry-After` headers
- API keys: Store in Azure Key Vault (OpenAI, Supabase)

### 5. Scalability

- **Prototype**: Single Azure Function, sequential processing
- **Production**: Azure Durable Functions for orchestration + fan-out pattern
  - Orchestrator: Schedules sources
  - Activity Functions: Fetch + classify individual decisions
  - Sub-orchestrators: Handle pagination, retries

---

## Target Architecture (Production)

### Azure Resources

```yaml
resources:
  - name: func-abr-ingestion
    type: Azure Function App
    plan: Premium (EP1)
    runtime: Node.js 20

  - name: st-abr-ingestion
    type: Storage Account
    purpose: Function storage, queue triggers

  - name: appi-abr-ingestion
    type: Application Insights
    purpose: Monitoring, logging

  - name: kv-abr-secrets
    type: Key Vault
    secrets:
      - SUPABASE_SERVICE_KEY
      - AZURE_OPENAI_API_KEY
```

### Data Flow

```text
Timer Trigger (2 AM daily)
  ↓
[Orchestrator Function]
  ↓
Get active sources from Supabase
  ↓
For each source:
  ↓
  [Activity: Discover Decisions]
    ↓ (returns URLs)
  [Fan-out: Process Each Decision]
    ↓
    [Activity: Fetch Content]
    ↓
    [Activity: Classify (Rule + AI)]
    ↓
    [Activity: Store in Supabase]
  ↓
[Aggregate Results]
  ↓
Update ingestion_jobs table
  ↓
Send notification email
```

### Configuration Table

**`tribunal_sources`** (Supabase):

```sql
INSERT INTO tribunal_sources (name, display_name, base_url, listing_url, scraper_config, classification_prompts)
VALUES
(
  'HRTO',
  'Human Rights Tribunal of Ontario',
  'https://www.canlii.org',
  'https://www.canlii.org/en/on/onhrt/',
  '{
    "selector": ".result-title a",
    "date_selector": ".date",
    "pagination": true,
    "max_pages": 3
  }',
  '{
    "system_prompt": "You are an expert in Ontario human rights law...",
    "user_prompt_template": "Analyze this decision: {text}..."
  }'
);
```

---

## Implementation Checklist

### Phase 1: Prototype (Weeks 3-4)

- [ ] **Database Setup**
  - [ ] Create `tribunal_sources` table with HRTO config
  - [ ] Create `tribunal_cases_raw` table
  - [ ] Create `ingestion_jobs` table
  - [ ] Seed HRTO source configuration

- [ ] **Scraper Module**
  - [ ] Build `ScraperAdapter` interface
  - [ ] Implement `HRTOScraper` class
  - [ ] Add throttling/retry logic
  - [ ] Test with 20 HRTO decisions

- [ ] **Classifier Module**
  - [ ] Build rule-based classifier
  - [ ] Integrate Azure OpenAI API
  - [ ] Create classification prompt template
  - [ ] Test accuracy on sample decisions

- [ ] **Azure Function**
  - [ ] Create timer-triggered function
  - [ ] Implement orchestration logic
  - [ ] Add error handling
  - [ ] Deploy to Azure (dev environment)

- [ ] **Admin UI**
  - [ ] Create `/admin/ingestion` page
  - [ ] List view with filters
  - [ ] Detail view with classification results
  - [ ] "Promote to clean table" action

- [ ] **Testing**
  - [ ] Unit tests for classifier
  - [ ] Integration tests for scraper
  - [ ] End-to-end test (HRTO → storage)
  - [ ] Load test (50 decisions)

### Phase 2: Production (Weeks 9-10)

- [ ] **Multi-Source Support**
  - [ ] Add CHRT scraper
  - [ ] Add CanLII API adapter
  - [ ] Add BCHRT, NSHRC scrapers
  - [ ] Factory pattern for scraper selection

- [ ] **Advanced Features**
  - [ ] PDF parsing (Azure Document Intelligence)
  - [ ] Duplicate detection (fuzzy matching)
  - [ ] Auto-promotion for high-confidence cases
  - [ ] Email alerts for admin review

- [ ] **Monitoring & Ops**
  - [ ] Application Insights dashboards
  - [ ] Azure Monitor alerts
  - [ ] Runbook for troubleshooting
  - [ ] Weekly data quality reports

---

## API Endpoints (Admin)

### 1. Trigger Ingestion Job (Manual)

```http
POST /api/admin/ingestion/trigger
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "source_id": "uuid-of-hrto-source",
  "max_decisions": 50,
  "run_type": "manual"
}

Response 202 Accepted:
{
  "job_id": "uuid",
  "status": "queued",
  "message": "Ingestion job queued successfully"
}
```

### 2. Get Job Status

```http
GET /api/admin/ingestion/jobs/{job_id}
Authorization: Bearer {admin_token}

Response 200 OK:
{
  "id": "uuid",
  "source": "HRTO",
  "status": "completed",
  "started_at": "2024-11-05T02:00:00Z",
  "completed_at": "2024-11-05T02:15:32Z",
  "decisions_discovered": 50,
  "decisions_classified": 48,
  "race_related_found": 12,
  "anti_black_found": 5,
  "error_message": null
}
```

### 3. List Ingested Cases

```http
GET /api/admin/ingestion/cases?source=HRTO&race_related=true&page=1&limit=50
Authorization: Bearer {admin_token}

Response 200 OK:
{
  "data": [
    {
      "id": "uuid",
      "title": "Smith v. XYZ Corp",
      "source": "HRTO",
      "date": "2024-10-15",
      "url": "https://...",
      "is_race_related": true,
      "is_anti_black_likely": true,
      "confidence_scores": {
        "race_related": 0.92,
        "anti_black": 0.87
      },
      "ai_summary": "Complainant alleged racial discrimination...",
      "processing_status": "classified",
      "ingested_at": "2024-11-05T02:05:12Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 248
  }
}
```

### 4. Promote Case to Clean Table

```http
POST /api/admin/ingestion/cases/{case_id}/promote
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "case_number": "2024 HRTO 1234",
  "outcome": "Application dismissed",
  "monetary_award": 15000.00,
  "keywords": ["discrimination", "race", "employment"]
}

Response 200 OK:
{
  "message": "Case promoted successfully",
  "tribunal_case_id": "uuid-in-clean-table"
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/classifier.test.ts
describe('Rule-based Classifier', () => {
  it('should detect race-related keywords', () => {
    const text = 'The complainant alleged racial discrimination based on colour.'
    const result = ruleClassifier(text)
    expect(result.isRaceRelated).toBe(true)
    expect(result.groundsDetected).toContain('race')
    expect(result.groundsDetected).toContain('colour')
  })

  it('should detect anti-Black keywords', () => {
    const text = 'The Black employee faced discrimination and profiling.'
    const result = ruleClassifier(text)
    expect(result.isAntiBlackLikely).toBe(true)
  })

  it('should not flag non-race cases', () => {
    const text = 'The applicant alleged wage theft and unpaid overtime.'
    const result = ruleClassifier(text)
    expect(result.isRaceRelated).toBe(false)
  })
})
```

### Integration Tests

```typescript
// tests/integration/scraper.test.ts
describe('HRTO Scraper', () => {
  it('should discover recent decisions', async () => {
    const scraper = new HRTOScraper()
    const decisions = await scraper.discoverDecisions({
      listing_url: 'https://www.canlii.org/en/on/onhrt/',
      max_decisions_per_run: 10,
    })

    expect(decisions).toHaveLength(10)
    expect(decisions[0]).toHaveProperty('title')
    expect(decisions[0]).toHaveProperty('url')
    expect(decisions[0].url).toMatch(/^https:\/\//)
  })

  it('should fetch decision content', async () => {
    const scraper = new HRTOScraper()
    const content = await scraper.fetchContent('https://www.canlii.org/en/on/onhrt/doc/2024/...')

    expect(content.fullText.length).toBeGreaterThan(100)
    expect(content.htmlExcerpt).toBeTruthy()
  })
})
```

### E2E Test

```typescript
// tests/e2e/ingestion.test.ts
describe('Full Ingestion Pipeline', () => {
  it('should ingest and classify HRTO decisions', async () => {
    // Trigger job
    const job = await triggerIngestionJob('HRTO', 5)

    // Wait for completion (with timeout)
    await waitForJobCompletion(job.id, 120000) // 2 min

    // Verify results
    const cases = await fetchIngestedCases({ source: 'HRTO', job_id: job.id })
    expect(cases.length).toBeGreaterThan(0)

    // Check classification
    const raceRelated = cases.filter((c) => c.is_race_related)
    expect(raceRelated.length).toBeGreaterThanOrEqual(1)

    // Check AI summary exists
    expect(cases[0].ai_summary).toBeTruthy()
    expect(cases[0].confidence_scores.race_related).toBeGreaterThanOrEqual(0)
  })
})
```

---

## Cost Estimate

### Azure OpenAI (GPT-4o)

- **Assumptions**: 50 decisions/day, 4000 tokens/decision, 30 days/month
- **Input Tokens**: 50 × 4000 × 30 = 6M tokens/month
- **Output Tokens**: 50 × 500 × 30 = 750K tokens/month
- **Cost**: $5 per 1M input tokens, $15 per 1M output tokens
- **Monthly**: (6 × $5) + (0.75 × $15) = **$41.25/month**

### Azure Functions

- **Plan**: Premium EP1 (1 vCore, 3.5 GB RAM)
- **Execution**: 1 job/day × 15 min/job = 7.5 hours/month
- **Cost**: ~$0.169/hour
- **Monthly**: 7.5 × $0.169 = **$1.27/month** (within free grant)

### Supabase

- Already included in main Supabase subscription ($25/month Pro tier)
- Storage: ~100 MB/month for raw cases (negligible)

**Total**: ~**$42/month** for ingestion module

---

## Success Metrics

| Metric                     | Target       | Measurement                     |
| -------------------------- | ------------ | ------------------------------- |
| **Decisions Ingested/Day** | 50+          | Ingestion jobs table            |
| **Race-Related Accuracy**  | > 85%        | Manual review sample (50 cases) |
| **Anti-Black Accuracy**    | > 80%        | Manual review sample (50 cases) |
| **Scraper Uptime**         | > 95%        | Failed jobs / Total jobs        |
| **Processing Time**        | < 20 min/job | Azure Function duration         |
| **False Positive Rate**    | < 15%        | Non-race flagged as race        |
| **False Negative Rate**    | < 10%        | Race cases missed               |

---

## Future Enhancements

### Phase 3: Advanced Features

- **Multi-Language Support**: French decisions (Quebec tribunals)
- **OCR for PDFs**: Azure Document Intelligence integration
- **Entity Extraction**: Complainant name, respondent organization, legal counsel
- **Case Clustering**: Group similar cases using embeddings
- **Precedent Linking**: Identify cited cases and build citation graph
- **Sentiment Analysis**: Analyze tone of decisions (pro-complainant vs. pro-respondent)
- **Real-Time Alerts**: WebSocket notifications when high-confidence cases are found

### Phase 4: Data Marketplace

- **Public API**: Allow researchers to query tribunal data
- **Export Tools**: CSV, JSON, Excel downloads
- **Anonymization**: Remove PII for public datasets
- **Citation Attribution**: "Powered by ABR Insights" for derived works

---

## References

- [CanLII API Documentation](https://www.canlii.org/en/info/api.html)
- [HRTO Decisions Database](https://www.canlii.org/en/on/onhrt/)
- [Azure OpenAI Best Practices](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/best-practices)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/)

---

**Document Status**: 📝 Draft
**Last Updated**: November 5, 2025
**Next Review**: Before Phase 2B implementation
**Feedback**: Contact technical lead via Slack #abr-ingestion

---

## Appendix: Sample Data

### Example: tribunal_cases_raw Record

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "source": "HRTO",
  "title": "Smith v. XYZ Corporation, 2024 HRTO 1234",
  "date": "2024-10-15",
  "url": "https://www.canlii.org/en/on/onhrt/doc/2024/2024onhrt1234/2024onhrt1234.html",
  "decision_type": "Final",
  "full_text": "The applicant, a Black employee, alleged that she was subjected to racial discrimination...",
  "html_excerpt": "<div class='decision-content'>The applicant, a Black employee...</div>",
  "is_race_related": true,
  "is_anti_black_likely": true,
  "grounds_detected": ["race", "colour"],
  "confidence_scores": {
    "race_related": 0.92,
    "anti_black": 0.87
  },
  "ai_summary": "The Black complainant alleged racial profiling and discriminatory discipline in the workplace. The Tribunal found the employer failed to provide a non-discriminatory explanation and awarded $15,000 in damages.",
  "processing_status": "classified",
  "ingested_at": "2024-11-05T02:05:12.345Z",
  "processed_at": "2024-11-05T02:06:48.123Z",
  "promoted_at": null
}
```
