-- Create a simplified cases table for the web app
-- This maps from tribunal_cases_raw to a cleaner schema

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_source_url ON cases(source_url);
CREATE INDEX IF NOT EXISTS idx_cases_decision_date ON cases(decision_date DESC);
CREATE INDEX IF NOT EXISTS idx_cases_source_system ON cases(source_system);
CREATE INDEX IF NOT EXISTS idx_cases_needs_review ON cases(needs_review);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access to all cases
CREATE POLICY "Allow anonymous read access" ON cases
    FOR SELECT
    TO anon
    USING (true);

-- Policy: Allow authenticated users to read all cases
CREATE POLICY "Allow authenticated read access" ON cases
    FOR SELECT
    TO authenticated
    USING (true);
