import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sql = `
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL UNIQUE,
    source_system VARCHAR(100) NOT NULL,
    case_title TEXT,
    case_number VARCHAR(100),
    citation VARCHAR(500),
    tribunal_name VARCHAR(255),
    decision_date DATE,
    applicant TEXT,
    respondent TEXT,
    full_text TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'decision',
    rule_based_classification JSONB DEFAULT '{}',
    ai_classification JSONB DEFAULT '{}',
    combined_confidence DECIMAL(5,2) DEFAULT 0,
    needs_review BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_source_url ON cases(source_url);
CREATE INDEX IF NOT EXISTS idx_cases_decision_date ON cases(decision_date DESC);
CREATE INDEX IF NOT EXISTS idx_cases_source_system ON cases(source_system);
CREATE INDEX IF NOT EXISTS idx_cases_needs_review ON cases(needs_review);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access" ON cases;
CREATE POLICY "Allow anonymous read access" ON cases
    FOR SELECT
    TO anon
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated read access" ON cases;
CREATE POLICY "Allow authenticated read access" ON cases
    FOR SELECT
    TO authenticated
    USING (true);
`;

async function createTable() {
  console.log('Creating cases table...\n');
  
  // Note: Supabase client doesn't support raw SQL execution
  // You need to run this in the Supabase SQL Editor instead
  
  console.log('⚠️  Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('='.repeat(60));
  console.log('\nGo to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
}

createTable();
