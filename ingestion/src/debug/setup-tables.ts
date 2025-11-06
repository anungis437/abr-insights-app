import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function setupTables() {
  console.log('🔧 Setting up ingestion pipeline tables...\n');
  
  const supabase = createClient(url, key);
  
  // Test connection by checking if tables exist
  console.log('1. Checking ingestion_jobs...');
  const { error: jobsError } = await supabase.from('ingestion_jobs').select('id').limit(0);
  
  console.log('2. Checking tribunal_cases_raw...');
  const { error: casesError } = await supabase.from('tribunal_cases_raw').select('id').limit(0);
  
  console.log('3. Checking ingestion_errors...');
  const { error: errorsError } = await supabase.from('ingestion_errors').select('id').limit(0);
  
  if (!jobsError && !casesError && !errorsError) {
    console.log('\n✅ All tables already exist!\n');
    console.log('Ready to run:');
    console.log('  npx tsx --env-file=.env.local ingestion\\src\\debug\\test-storage-integration.ts\n');
    return true;
  }
  
  console.log('\n❌ Tables missing. They need to be created via SQL Editor.\n');
  console.log('Steps to create tables:');
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new\n');
  console.log('2. Copy and paste this SQL:\n');
  console.log('---START SQL---');
  console.log(migrationSQL);
  console.log('---END SQL---\n');
  console.log('3. Click "Run" button\n');
  console.log('4. Then run this script again to verify\n');
  
  return false;
}

const migrationSQL = `
-- Create ingestion_jobs table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    source_config JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
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
    triggered_by UUID,
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
    language VARCHAR(10),
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
    promotion_status VARCHAR(50) DEFAULT 'pending',
    promoted_case_id UUID,
    promoted_at TIMESTAMPTZ,
    promoted_by UUID,
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
    error_stage VARCHAR(50) NOT NULL,
    error_type VARCHAR(100),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    source_url TEXT,
    request_payload JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    severity VARCHAR(50) DEFAULT 'error',
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
`;

setupTables().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
