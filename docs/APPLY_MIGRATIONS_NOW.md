# 🚨 CRITICAL: Apply Database Migrations

Your storage layer is **100% ready** but cannot be tested because database tables don't exist yet.

## The Problem

When running the test, you got:
```
Error: Could not find the table 'public.ingestion_jobs' in the schema cache
```

The SQL migration file exists locally (`supabase/migrations/005_ingestion_pipeline.sql`) but hasn't been executed on your Supabase database yet.

## The Solution (Choose One)

### Option 1: Supabase Dashboard SQL Editor (EASIEST - 2 minutes)

1. **Open SQL Editor**: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/editor

2. **Copy the entire migration** from `supabase/migrations/005_ingestion_pipeline.sql` (468 lines)

3. **Paste into SQL Editor** and click **"Run"**

4. **Verify tables created**:
   - Go to Table Editor: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/editor
   - Look for these 3 new tables:
     * `tribunal_cases_raw` (30+ columns)
     * `ingestion_jobs` (job tracking)
     * `ingestion_errors` (error logs)

### Option 2: Supabase CLI (For Developers)

```powershell
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
npx supabase link --project-ref nuywgvbkgdvngrysqdul

# Push migration
npx supabase db push
```

### Option 3: Run Just the Essential SQL (Quick Test)

If you just want to test quickly, open SQL Editor and run this minimal version:

```sql
-- Create ingestion_jobs table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('manual', 'scheduled', 'retry', 'backfill')),
    source_system VARCHAR(100) NOT NULL,
    source_config JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'partial', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    cases_discovered INTEGER DEFAULT 0,
    cases_fetched INTEGER DEFAULT 0,
    cases_classified INTEGER DEFAULT 0,
    cases_stored INTEGER DEFAULT 0,
    cases_failed INTEGER DEFAULT 0,
    avg_confidence_score DECIMAL(3,2),
    high_confidence_count INTEGER DEFAULT 0,
    medium_confidence_count INTEGER DEFAULT 0,
    low_confidence_count INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    execution_environment VARCHAR(50),
    pipeline_version VARCHAR(50),
    last_processed_url TEXT,
    checkpoint_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tribunal_cases_raw table
CREATE TABLE IF NOT EXISTS tribunal_cases_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL UNIQUE,
    source_system VARCHAR(100) NOT NULL,
    source_id VARCHAR(255),
    case_number VARCHAR(100),
    case_title TEXT,
    citation VARCHAR(500),
    tribunal_name VARCHAR(255),
    tribunal_province VARCHAR(50),
    decision_date DATE,
    filing_date DATE,
    applicant TEXT,
    respondent TEXT,
    html_content TEXT,
    full_text TEXT NOT NULL,
    text_length INTEGER,
    document_type VARCHAR(50),
    language VARCHAR(10) CHECK (language IN ('en', 'fr', 'unknown')),
    pdf_url TEXT,
    rule_based_classification JSONB DEFAULT '{}',
    ai_classification JSONB DEFAULT '{}',
    combined_confidence DECIMAL(3,2),
    discrimination_grounds JSONB DEFAULT '[]',
    key_issues JSONB DEFAULT '[]',
    remedies JSONB DEFAULT '[]',
    extraction_quality VARCHAR(50),
    extraction_errors JSONB DEFAULT '[]',
    needs_review BOOLEAN DEFAULT TRUE,
    review_notes TEXT,
    promotion_status VARCHAR(50) DEFAULT 'pending' CHECK (promotion_status IN ('pending', 'approved', 'rejected', 'promoted', 'duplicate')),
    promoted_case_id UUID,
    promoted_at TIMESTAMPTZ,
    promoted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ingestion_job_id UUID REFERENCES ingestion_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Create ingestion_errors table
CREATE TABLE IF NOT EXISTS ingestion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_job_id UUID REFERENCES ingestion_jobs(id) ON DELETE CASCADE,
    raw_case_id UUID REFERENCES tribunal_cases_raw(id) ON DELETE SET NULL,
    error_stage VARCHAR(50) NOT NULL CHECK (error_stage IN ('discovery', 'fetch', 'extraction', 'classification', 'storage')),
    error_type VARCHAR(100),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    source_url TEXT,
    request_payload JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    severity VARCHAR(50) DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
    is_retryable BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 0,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_source_url ON tribunal_cases_raw(source_url);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_job_id ON tribunal_cases_raw(ingestion_job_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
```

## After Migration Applied

Test the storage integration:

```powershell
npx tsx --env-file=.env.local ingestion\src\debug\test-storage-integration.ts
```

Expected output:
```
✓ Step 1: Created ingestion job [job-id]
✓ Step 2: Generated 30 demo cases
✓ Step 3: Classified all cases (100% success)
✓ Step 4: Stored 30 cases to database
✓ Step 5: Updated job metrics
✓ Step 6: Completed job successfully
✓ Step 7: Storage statistics: 30 total, 21 anti-Black, 9 other
✓ Step 8: Found X cases for review
✓ Step 9: Feature breakdown complete
```

## What This Enables

Once migrations are applied and test passes:

1. ✅ **Storage Layer Working** - 30 demo cases in database
2. ➡️ **Create API Endpoints** - `/api/cases`, `/api/cases/[id]`, `/api/cases/stats`
3. ➡️ **Build Frontend** - Cases browser with table/card views
4. ➡️ **Implement Search** - Filter by classification, tribunal, date
5. ➡️ **Analytics Dashboard** - Visualize anti-Black racism patterns

## Need Help?

All storage code is ready:
- `ingestion/src/storage/supabase-storage.ts` (500+ lines)
- `ingestion/src/debug/test-storage-integration.ts` (199 lines)

Just need database tables created via one of the 3 options above.
