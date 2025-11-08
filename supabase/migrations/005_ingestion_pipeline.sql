-- ============================================================================
-- INGESTION PIPELINE TABLES
-- Migration: 005_ingestion_pipeline.sql
-- Purpose: Support automated tribunal case ingestion from CanLII, HRTO, etc.
-- Date: November 6, 2025
-- ============================================================================

-- ============================================================================
-- TRIBUNAL CASES RAW (Staging Table)
-- ============================================================================
-- Purpose: Staging area for newly scraped cases before review/promotion
-- Flow: Scraper → tribunal_cases_raw → Manual Review → tribunal_cases

CREATE TABLE IF NOT EXISTS tribunal_cases_raw (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source Information
    source_url TEXT NOT NULL UNIQUE, -- Prevents duplicate ingestion
    source_system VARCHAR(100) NOT NULL, -- 'canlii', 'hrto_direct', etc.
    source_id VARCHAR(255), -- External system ID if available
    
    -- Case Identification (Extracted)
    case_number VARCHAR(100),
    case_title TEXT,
    citation VARCHAR(500),
    
    -- Tribunal Info
    tribunal_name VARCHAR(255),
    tribunal_province VARCHAR(50),
    decision_date DATE,
    filing_date DATE,
    
    -- Parties (Raw Text)
    applicant TEXT,
    respondent TEXT,
    
    -- Content (Raw Extracted)
    html_content TEXT, -- Original HTML for reference
    full_text TEXT NOT NULL, -- Extracted plain text
    text_length INTEGER, -- Character count for validation
    
    -- Document Metadata
    document_type VARCHAR(50), -- 'decision', 'order', 'ruling'
    language VARCHAR(10) CHECK (language IN ('en', 'fr', 'unknown')),
    pdf_url TEXT,
    
    -- Classification Results (From Pipeline)
    rule_based_classification JSONB DEFAULT '{}', -- {isRaceRelated, isAntiBlackLikely, grounds, confidence}
    ai_classification JSONB DEFAULT '{}', -- {category, confidence, reasoning, key_phrases}
    combined_confidence DECIMAL(3,2), -- Final confidence score (0-1)
    
    -- Detected Attributes
    discrimination_grounds JSONB DEFAULT '[]', -- ['race', 'colour', 'ancestry']
    key_issues JSONB DEFAULT '[]',
    remedies JSONB DEFAULT '[]',
    
    -- Quality Flags
    extraction_quality VARCHAR(50), -- 'high', 'medium', 'low', 'failed'
    extraction_errors JSONB DEFAULT '[]', -- Array of error messages
    needs_review BOOLEAN DEFAULT TRUE,
    review_notes TEXT,
    
    -- Promotion Status
    promotion_status VARCHAR(50) DEFAULT 'pending' CHECK (promotion_status IN (
        'pending',      -- Awaiting review
        'approved',     -- Approved for promotion
        'rejected',     -- Not suitable for production
        'promoted',     -- Successfully moved to tribunal_cases
        'duplicate'     -- Duplicate of existing case
    )),
    promoted_case_id UUID REFERENCES tribunal_cases(id) ON DELETE SET NULL,
    promoted_at TIMESTAMPTZ,
    promoted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Ingestion Job Reference
    ingestion_job_id UUID, -- Foreign key added after ingestion_jobs table created
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_source_url ON tribunal_cases_raw(source_url);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_source_system ON tribunal_cases_raw(source_system);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_promotion_status ON tribunal_cases_raw(promotion_status);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_needs_review ON tribunal_cases_raw(needs_review) WHERE needs_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_created_at ON tribunal_cases_raw(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_job_id ON tribunal_cases_raw(ingestion_job_id);
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_combined_confidence ON tribunal_cases_raw(combined_confidence DESC);

-- Full-text search on raw cases
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_search ON tribunal_cases_raw USING GIN (
    to_tsvector('english', COALESCE(case_title, '') || ' ' || COALESCE(full_text, ''))
);

-- ============================================================================
-- INGESTION JOBS
-- ============================================================================
-- Purpose: Track ingestion job execution, status, and metrics

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Job Configuration
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('manual', 'scheduled', 'retry', 'backfill')),
    source_system VARCHAR(100) NOT NULL,
    source_config JSONB DEFAULT '{}', -- {baseUrl, startDate, endDate, maxCases, filters}
    
    -- Execution
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Queued for execution
        'running',      -- Currently executing
        'completed',    -- Finished successfully
        'partial',      -- Completed with some failures
        'failed',       -- Failed to complete
        'cancelled'     -- Manually cancelled
    )),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER, -- Calculated on completion
    
    -- Metrics
    cases_discovered INTEGER DEFAULT 0, -- URLs found
    cases_fetched INTEGER DEFAULT 0,    -- Content downloaded
    cases_classified INTEGER DEFAULT 0, -- AI/rule classification completed
    cases_stored INTEGER DEFAULT 0,     -- Saved to tribunal_cases_raw
    cases_failed INTEGER DEFAULT 0,     -- Errors during processing
    
    -- Quality Metrics
    avg_confidence_score DECIMAL(3,2),
    high_confidence_count INTEGER DEFAULT 0, -- Confidence >= 0.8
    medium_confidence_count INTEGER DEFAULT 0, -- 0.5 <= Confidence < 0.8
    low_confidence_count INTEGER DEFAULT 0, -- Confidence < 0.5
    
    -- Error Tracking
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    
    -- Execution Context
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for system/scheduled
    execution_environment VARCHAR(50), -- 'local', 'azure_function', 'github_action'
    pipeline_version VARCHAR(50), -- Code version/commit SHA
    
    -- Resume Capability
    last_processed_url TEXT, -- For resume after interruption
    checkpoint_data JSONB DEFAULT '{}', -- State for resuming
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_source_system ON ingestion_jobs(source_system);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started_at ON ingestion_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_triggered_by ON ingestion_jobs(triggered_by);

-- ============================================================================
-- INGESTION ERRORS
-- ============================================================================
-- Purpose: Detailed error logging for troubleshooting and monitoring

CREATE TABLE IF NOT EXISTS ingestion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Job Context
    ingestion_job_id UUID REFERENCES ingestion_jobs(id) ON DELETE CASCADE,
    raw_case_id UUID REFERENCES tribunal_cases_raw(id) ON DELETE SET NULL,
    
    -- Error Details
    error_stage VARCHAR(50) NOT NULL CHECK (error_stage IN (
        'discovery',    -- Failed to fetch listing page
        'fetch',        -- Failed to download case content
        'extraction',   -- Failed to parse HTML/PDF
        'classification', -- AI/rule classifier failed
        'storage'       -- Failed to save to database
    )),
    error_type VARCHAR(100), -- 'network_timeout', 'parse_error', 'api_rate_limit', etc.
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    source_url TEXT,
    request_payload JSONB DEFAULT '{}',
    response_data JSONB DEFAULT '{}',
    
    -- Severity
    severity VARCHAR(50) DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
    is_retryable BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 0,
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_job_id ON ingestion_errors(ingestion_job_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_error_stage ON ingestion_errors(error_stage);
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_severity ON ingestion_errors(severity);
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_resolved ON ingestion_errors(resolved) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_ingestion_errors_created_at ON ingestion_errors(created_at DESC);

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINT (Now that ingestion_jobs exists)
-- ============================================================================

ALTER TABLE tribunal_cases_raw 
ADD CONSTRAINT fk_tribunal_cases_raw_job 
FOREIGN KEY (ingestion_job_id) REFERENCES ingestion_jobs(id) ON DELETE SET NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_tribunal_cases_raw_updated_at ON tribunal_cases_raw;
CREATE TRIGGER update_tribunal_cases_raw_updated_at 
BEFORE UPDATE ON tribunal_cases_raw
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingestion_jobs_updated_at ON ingestion_jobs;
CREATE TRIGGER update_ingestion_jobs_updated_at 
BEFORE UPDATE ON ingestion_jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate job duration on completion
CREATE OR REPLACE FUNCTION calculate_job_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'partial', 'failed') AND OLD.status = 'running' THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_ingestion_job_duration ON ingestion_jobs;
CREATE TRIGGER calculate_ingestion_job_duration
BEFORE UPDATE ON ingestion_jobs
FOR EACH ROW
WHEN (NEW.status IN ('completed', 'partial', 'failed'))
EXECUTE FUNCTION calculate_job_duration();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE tribunal_cases_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins and compliance officers can view all raw cases
CREATE POLICY "Admins can view all raw cases"
ON tribunal_cases_raw FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin', 'analyst')
    )
);

-- Policy: Admins can update raw cases (review/promotion)
CREATE POLICY "Admins can update raw cases"
ON tribunal_cases_raw FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
);

-- Policy: System can insert raw cases (service role)
CREATE POLICY "System can insert raw cases"
ON tribunal_cases_raw FOR INSERT
TO authenticated
WITH CHECK (TRUE); -- Will be called by service role

-- Policy: Admins can view ingestion jobs
CREATE POLICY "Admins can view ingestion jobs"
ON ingestion_jobs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin', 'analyst')
    )
);

-- Policy: Admins can create/update ingestion jobs
CREATE POLICY "Admins can manage ingestion jobs"
ON ingestion_jobs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
);

-- Policy: Admins can view ingestion errors
CREATE POLICY "Admins can view ingestion errors"
ON ingestion_errors FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin', 'analyst')
    )
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Promote raw case to production
CREATE OR REPLACE FUNCTION promote_case_to_production(
    p_raw_case_id UUID,
    p_promoted_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_case_id UUID;
    v_raw_case RECORD;
BEGIN
    -- Get raw case data
    SELECT * INTO v_raw_case
    FROM tribunal_cases_raw
    WHERE id = p_raw_case_id
    AND promotion_status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Raw case not found or not approved for promotion';
    END IF;
    
    -- Insert into production table
    INSERT INTO tribunal_cases (
        case_number,
        case_title,
        citation,
        tribunal_name,
        tribunal_province,
        decision_date,
        filing_date,
        applicant,
        respondent,
        full_text,
        primary_category,
        key_issues,
        remedies,
        ai_classification_confidence,
        ai_key_phrases,
        url,
        pdf_url,
        document_type,
        language,
        tags,
        source_system,
        last_scraped_at,
        scraper_version
    ) VALUES (
        v_raw_case.case_number,
        v_raw_case.case_title,
        v_raw_case.citation,
        v_raw_case.tribunal_name,
        v_raw_case.tribunal_province,
        v_raw_case.decision_date,
        v_raw_case.filing_date,
        v_raw_case.applicant,
        v_raw_case.respondent,
        v_raw_case.full_text,
        (v_raw_case.ai_classification->>'category')::VARCHAR,
        v_raw_case.key_issues,
        v_raw_case.remedies,
        v_raw_case.combined_confidence,
        v_raw_case.ai_classification->'key_phrases',
        v_raw_case.source_url,
        v_raw_case.pdf_url,
        v_raw_case.document_type,
        v_raw_case.language,
        v_raw_case.discrimination_grounds,
        v_raw_case.source_system,
        v_raw_case.created_at,
        (SELECT pipeline_version FROM ingestion_jobs WHERE id = v_raw_case.ingestion_job_id)
    )
    RETURNING id INTO v_case_id;
    
    -- Update raw case status
    UPDATE tribunal_cases_raw
    SET 
        promotion_status = 'promoted',
        promoted_case_id = v_case_id,
        promoted_at = NOW(),
        promoted_by = p_promoted_by
    WHERE id = p_raw_case_id;
    
    RETURN v_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR MONITORING
-- ============================================================================

-- View: Recent ingestion jobs with metrics
CREATE OR REPLACE VIEW vw_recent_ingestion_jobs AS
SELECT 
    j.id,
    j.job_type,
    j.source_system,
    j.status,
    j.started_at,
    j.completed_at,
    j.duration_seconds,
    j.cases_discovered,
    j.cases_stored,
    j.cases_failed,
    ROUND(j.avg_confidence_score, 2) as avg_confidence,
    j.high_confidence_count,
    j.pipeline_version,
    COALESCE(p.display_name, CONCAT(p.first_name, ' ', p.last_name), p.email) as triggered_by_name,
    (SELECT COUNT(*) FROM ingestion_errors WHERE ingestion_job_id = j.id) as error_count
FROM ingestion_jobs j
LEFT JOIN profiles p ON j.triggered_by = p.id
ORDER BY j.created_at DESC
LIMIT 50;

-- View: Cases pending review with high confidence
CREATE OR REPLACE VIEW vw_high_confidence_pending_cases AS
SELECT 
    id,
    case_title,
    tribunal_name,
    decision_date,
    source_system,
    combined_confidence,
    discrimination_grounds,
    ai_classification->>'category' as suggested_category,
    created_at
FROM tribunal_cases_raw
WHERE promotion_status = 'pending'
AND combined_confidence >= 0.8
AND needs_review = TRUE
ORDER BY combined_confidence DESC, created_at DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tribunal_cases_raw IS 'Staging area for scraped tribunal cases before manual review and promotion to production';
COMMENT ON TABLE ingestion_jobs IS 'Tracks execution of tribunal case ingestion jobs with metrics and error tracking';
COMMENT ON TABLE ingestion_errors IS 'Detailed error logging for ingestion pipeline troubleshooting and monitoring';
COMMENT ON FUNCTION promote_case_to_production IS 'Promotes an approved raw case to the production tribunal_cases table';
COMMENT ON VIEW vw_recent_ingestion_jobs IS 'Dashboard view of recent ingestion jobs with key metrics';
COMMENT ON VIEW vw_high_confidence_pending_cases IS 'Cases with high AI confidence awaiting review for quick approval';



