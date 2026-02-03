# Tribunal Case Ingestion System

## Overview

The ingestion system automatically discovers, fetches, classifies, and stores tribunal cases from external sources (primarily CanLII). It uses a combination of rule-based keyword matching and AI-powered classification to identify cases relevant to anti-Black racism and discrimination.

## Architecture

### Components

1. **Scrapers** (`ingestion/src/scrapers/`)
   - Web scrapers for different tribunal sources
   - Currently supports CanLII (HRTO and CHRT)
   - Handles rate limiting, retries, and error recovery

2. **Classifiers** (`ingestion/src/classifiers/`)
   - **Rule-Based**: Keyword matching for discrimination grounds
   - **AI Classifier**: GPT-4o powered semantic analysis
   - **Combined**: Orchestrates both classifiers with weighted scoring

3. **Orchestrator** (`ingestion/src/orchestrator/`)
   - Main pipeline coordinator
   - Manages: discovery → fetch → classify → store workflow
   - Tracks job progress, errors, and metrics
   - Supports dry-run mode and checkpoint/resume

4. **CLI** (`ingestion/src/cli.ts`)
   - Command-line interface for running ingestion jobs
   - Progress reporting and interactive feedback

5. **Admin UI** (`app/admin/ingestion/`)
   - Web dashboard for reviewing ingested cases
   - Approve/reject functionality
   - Classification results display

### Data Flow

```
┌─────────────┐
│   CanLII    │
│  (Source)   │
└──────┬──────┘
       │ Discovery
       ▼
┌─────────────┐
│   Scraper   │  ← Fetch decision pages
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Classifiers │  ← Rule-based + AI analysis
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ tribunal_cases_ │  ← Store in staging table
│      raw        │
└─────────────────┘
       │
       │ Review via Admin UI
       ▼
┌─────────────────┐
│ tribunal_cases  │  ← Promote approved cases
└─────────────────┘
```

## Database Schema

### `tribunal_cases_raw`

Staging table for ingested cases before review:

- `source_url`, `source_system`, `case_title`, `case_number`
- `decision_date`, `full_text`, `html_content`
- `rule_based_confidence`, `ai_confidence`, `final_confidence`
- `ai_category` (anti_black_racism | other_discrimination | non_discrimination)
- `grounds_detected` (array of discrimination grounds)
- `needs_review` (boolean flag for low confidence or disagreement)
- `ingestion_status` (pending_review | approved | rejected)

### `ingestion_jobs`

Tracks ingestion job execution:

- `job_id`, `source_system`, `status`
- `metrics` (discovered, fetched, classified, stored, failed, skipped)
- `checkpoint_data` (for resume capability)
- `error_count`, `started_at`, `completed_at`

### `ingestion_errors`

Logs errors during ingestion:

- `job_id`, `stage`, `severity`, `error_message`
- `context` (additional debugging info)

## Setup

### Prerequisites

1. **Node.js** 18+ and npm 9+
2. **Supabase** project with database access
3. **Azure OpenAI** deployment for GPT-4o (or OpenAI API key)

### Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Azure OpenAI (for AI classifier)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# Or use OpenAI directly
OPENAI_API_KEY=sk-...
```

### Database Migrations

Run migrations to create required tables:

```bash
# Navigate to supabase directory
cd supabase

# Apply migrations (if using Supabase CLI)
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

Migrations to apply:

- `001_initial_schema.sql` - Base tables
- `003_content_tables.sql` - Tribunal cases tables
- Additional ingestion tables (see `docs/architecture/INGESTION_MODULE.md`)

### Install Dependencies

```bash
npm install
```

## Usage

### Running Ingestion Jobs

Basic ingestion from CanLII HRTO:

```bash
npm run ingest -- --source canlii_hrto --limit 10
```

#### CLI Options

- `--source <name>` - Source system (required): `canlii_hrto` or `canlii_chrt`
- `--limit <number>` - Maximum cases to ingest (default: 50)
- `--dry-run` - Test mode, no database writes
- `--resume` - Resume from last checkpoint
- `--help` - Show help message

#### Examples

Test ingestion (dry run):

```bash
npm run ingest -- --source canlii_hrto --limit 5 --dry-run
```

Ingest 100 HRTO cases:

```bash
npm run ingest -- --source canlii_hrto --limit 100
```

Resume interrupted job:

```bash
npm run ingest -- --source canlii_hrto --resume
```

Ingest from CHRT:

```bash
npm run ingest -- --source canlii_chrt --limit 50
```

### Reviewing Cases

1. Navigate to **<http://localhost:3000/admin/ingestion>** (in development)
2. Filter by status: Pending Review | Approved | Rejected | All
3. Click on a case to view details:
   - Classification results (rule-based, AI, combined)
   - Confidence scores
   - Detected discrimination grounds
   - Full decision text
4. Approve or reject pending cases
5. Approved cases are marked for promotion to production table

### Monitoring Jobs

Check job status in Supabase:

```sql
-- Recent jobs
SELECT * FROM ingestion_jobs
ORDER BY started_at DESC
LIMIT 10;

-- Job errors
SELECT * FROM ingestion_errors
WHERE job_id = 'your-job-id'
ORDER BY occurred_at DESC;
```

## Classification Logic

### Rule-Based Classifier

Uses keyword matching to detect:

- **Race-related keywords**: race, racial, racism, anti-Black, Black person, etc.
- **Discrimination indicators**: discrimination, discriminate, prejudice, bias, etc.
- **Black-specific terms**: anti-Black racism, Black employees, Black community

**Confidence calculation**:

- Keyword density × keyword weights
- Adjustments for multiple ground mentions
- French language support (race, racisme, discrimination)

### AI Classifier

Uses GPT-4o to analyze decision text:

- Semantic understanding of discrimination context
- Identifies primary and secondary grounds
- Extracts key issues and remedies
- Provides reasoning for classification
- Higher weight in combined scoring

### Combined Classification

Weighted average:

- **AI classifier**: 60% weight
- **Rule-based**: 40% weight

**Flags for review** when:

- Final confidence < 0.6
- Classifiers disagree significantly
- Edge case detected (ambiguous language)

## Troubleshooting

### Issue: Scraper times out

**Solution**: Increase rate limiting delay in scraper config

```typescript
// ingestion/src/scrapers/canlii.ts
const scraper = new CanLIIScraper({
  requestDelayMs: 2000, // Increase from 1000
  maxRetries: 5,
})
```

### Issue: AI classifier fails

**Check**:

1. Azure OpenAI endpoint and API key are correct
2. Deployment name matches your GPT-4o deployment
3. API version is compatible (2024-08-01-preview)
4. Check Azure OpenAI quota/limits

**Fallback**: Set `AI_CLASSIFIER_ENABLED=false` to use rule-based only

### Issue: Database errors during ingestion

**Common causes**:

1. Missing migrations - Apply all migration files
2. RLS policies blocking inserts - Verify service role key has access
3. Column name mismatches - Check snake_case vs camelCase

**Debug**:

```bash
# Check recent errors
SELECT * FROM ingestion_errors
WHERE occurred_at > NOW() - INTERVAL '1 hour'
ORDER BY occurred_at DESC;
```

### Issue: Cases not appearing in admin UI

**Check**:

1. Cases have `ingestion_status = 'pending_review'`
2. RLS policies allow reading from `tribunal_cases_raw`
3. Browser console for client-side errors

**Verify**:

```sql
SELECT COUNT(*) FROM tribunal_cases_raw WHERE ingestion_status = 'pending_review';
```

### Issue: Resume not working

**Solution**: Ensure job_id is passed correctly:

```bash
# Get last job ID
npm run ingest -- --source canlii_hrto --resume --job-id <last-job-id>
```

Or modify CLI to auto-detect last job.

## Performance

### Metrics

Typical performance:

- **Discovery**: ~2-5 seconds per page (10-20 cases)
- **Fetch**: ~1-2 seconds per case
- **Classification**: ~2-3 seconds per case (includes AI call)
- **Storage**: <100ms per case

**Total**: ~3-5 seconds per case end-to-end

### Optimization Tips

1. **Batch processing**: Process multiple cases in parallel (currently sequential)
2. **Cache AI results**: Store embeddings to avoid re-classification
3. **Rate limiting**: Tune delays based on source server capacity
4. **Database indexing**: Ensure indexes on `source_url`, `ingestion_status`

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# With coverage
npm run test:unit

# Watch mode
npm test -- --watch
```

Test coverage:

- Scraper: Discovery, fetching, retry logic, rate limiting
- Classifiers: Rule-based matching, AI integration, combined orchestration
- Orchestrator: Job tracking, error handling, checkpoint/resume

### Integration Tests

```bash
npm run test:integration
```

Tests full pipeline with:

- Mocked external sources (CanLII)
- Real Supabase test database
- End-to-end workflow validation

## Future Enhancements

### Near-term

1. **Batch promotion**: Approve multiple cases at once
2. **Advanced filters**: Search by ground, confidence, date range
3. **Audit log**: Track who approved/rejected cases
4. **Email notifications**: Alert on high-confidence cases

### Medium-term

1. **Additional sources**: Direct HRTO/CHRT websites, other tribunals
2. **Multi-language**: Enhanced French support
3. **Custom classifiers**: Train domain-specific models
4. **API endpoint**: Expose ingestion as REST API

### Long-term

1. **Real-time ingestion**: Webhook-based updates
2. **ML pipeline**: Continuous learning from reviews
3. **Duplicate detection**: Identify related/duplicate cases
4. **Citation extraction**: Parse legal citations

## Architecture Decisions

See `/docs/architecture/` for detailed documentation:

- `INGESTION_MODULE.md` - System design and rationale
- `DATABASE_SCHEMA.md` - Table structures and relationships
- `AI_ML_ARCHITECTURE.md` - Classification approach

## Contributing

When adding new features:

1. Follow existing code structure (`scrapers/`, `classifiers/`, `orchestrator/`)
2. Add unit tests for new components
3. Update types in `ingestion/src/types/`
4. Document new CLI options and environment variables
5. Test with `--dry-run` before production use

## Support

For issues or questions:

1. Check this documentation
2. Review existing GitHub issues
3. Check Supabase logs for database errors
4. Verify environment variables are set correctly

---

**Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Status**: Production Ready ✅
