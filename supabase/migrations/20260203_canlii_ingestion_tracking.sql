-- =====================================================
-- PR-07: CanLII Ingestion Run Tracking Schema
-- =====================================================
-- Purpose: Track CanLII API usage and ingestion runs for compliance monitoring
-- Date: February 3, 2026
-- Author: Production Readiness Framework
-- =====================================================

-- =====================================================
-- Table: canlii_ingestion_runs
-- =====================================================
-- Tracks each CanLII ingestion run with rate limit compliance metrics

CREATE TABLE IF NOT EXISTS canlii_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Run metadata
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN (
        'running',
        'completed',
        'failed',
        'rate_limited',
        'killed' -- Kill switch activated
    )) DEFAULT 'running',
    
    -- Ingestion scope
    case_ids TEXT[], -- Specific case IDs requested (null = full sync)
    date_from DATE, -- Date range start
    date_to DATE, -- Date range end
    
    -- Rate limit compliance metrics
    total_requests INT NOT NULL DEFAULT 0,
    successful_requests INT NOT NULL DEFAULT 0,
    failed_requests INT NOT NULL DEFAULT 0,
    rate_limited_requests INT NOT NULL DEFAULT 0,
    
    -- Timing metrics (milliseconds)
    min_request_duration_ms INT,
    max_request_duration_ms INT,
    avg_request_duration_ms INT,
    total_duration_ms INT,
    
    -- Data metrics
    cases_fetched INT NOT NULL DEFAULT 0,
    cases_updated INT NOT NULL DEFAULT 0,
    cases_created INT NOT NULL DEFAULT 0,
    cases_skipped INT NOT NULL DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_occurred_at TIMESTAMPTZ,
    
    -- Compliance flags
    exceeded_daily_limit BOOLEAN DEFAULT false,
    exceeded_rate_limit BOOLEAN DEFAULT false,
    kill_switch_active BOOLEAN DEFAULT false,
    
    -- Audit
    triggered_by UUID REFERENCES auth.users(id),
    trigger_source TEXT, -- 'manual', 'scheduled', 'webhook', 'api'
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Table: canlii_api_requests
-- =====================================================
-- Detailed log of individual CanLII API requests (for debugging and compliance audits)

CREATE TABLE IF NOT EXISTS canlii_api_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_run_id UUID REFERENCES canlii_ingestion_runs(id) ON DELETE CASCADE,
    
    -- Request details
    endpoint TEXT NOT NULL, -- '/v1/caseBrowse', '/v1/caseId', etc.
    case_id TEXT, -- CanLII case ID (if applicable)
    method TEXT NOT NULL DEFAULT 'GET',
    
    -- Rate limit state at time of request
    tokens_available DECIMAL(5,2), -- Tokens in bucket before request
    concurrent_requests INT, -- Concurrent requests at time
    daily_requests_used INT, -- Daily count before request
    
    -- Response details
    status_code INT,
    response_time_ms INT,
    success BOOLEAN DEFAULT false,
    rate_limited BOOLEAN DEFAULT false,
    
    -- Error details (if any)
    error_type TEXT, -- 'rate_limit', 'timeout', 'server_error', 'network_error'
    error_message TEXT,
    
    -- Retry information
    retry_count INT DEFAULT 0,
    retry_after_seconds INT, -- If rate limited, suggested retry delay
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Table: canlii_daily_quotas
-- =====================================================
-- Daily quota tracking for compliance reporting

CREATE TABLE IF NOT EXISTS canlii_daily_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    
    -- Usage metrics
    total_requests INT NOT NULL DEFAULT 0,
    successful_requests INT NOT NULL DEFAULT 0,
    failed_requests INT NOT NULL DEFAULT 0,
    rate_limited_requests INT NOT NULL DEFAULT 0,
    
    -- Limit tracking
    daily_limit INT NOT NULL DEFAULT 5000,
    limit_exceeded BOOLEAN DEFAULT false,
    limit_exceeded_at TIMESTAMPTZ,
    
    -- Peak usage
    peak_concurrent INT NOT NULL DEFAULT 0,
    peak_requests_per_second DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Ingestion runs
    total_runs INT NOT NULL DEFAULT 0,
    successful_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Ingestion runs by status (for monitoring active runs)
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status 
    ON canlii_ingestion_runs(status) 
    WHERE status IN ('running', 'rate_limited');

-- Ingestion runs by date (for reporting)
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_date 
    ON canlii_ingestion_runs(started_at DESC);

-- API requests by run (for debugging specific runs)
CREATE INDEX IF NOT EXISTS idx_api_requests_run_id 
    ON canlii_api_requests(ingestion_run_id);

-- API requests by date (for compliance audits)
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at 
    ON canlii_api_requests(created_at DESC);

-- API requests by rate limit status
CREATE INDEX IF NOT EXISTS idx_api_requests_rate_limited 
    ON canlii_api_requests(rate_limited) 
    WHERE rate_limited = true;

-- Daily quotas by date
CREATE INDEX IF NOT EXISTS idx_daily_quotas_date 
    ON canlii_daily_quotas(date DESC);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE canlii_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE canlii_api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE canlii_daily_quotas ENABLE ROW LEVEL SECURITY;

-- Ingestion runs: Super admins can view all
CREATE POLICY ingestion_runs_super_admin_view 
    ON canlii_ingestion_runs 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- API requests: Super admins can view all
CREATE POLICY api_requests_super_admin_view 
    ON canlii_api_requests 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Daily quotas: Super admins can view all
CREATE POLICY daily_quotas_super_admin_view 
    ON canlii_daily_quotas 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- =====================================================
-- Functions
-- =====================================================

-- Function: Get current daily quota usage
CREATE OR REPLACE FUNCTION get_canlii_daily_quota()
RETURNS TABLE (
    date DATE,
    total_requests INT,
    daily_limit INT,
    remaining_requests INT,
    limit_exceeded BOOLEAN,
    peak_concurrent INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dq.date,
        dq.total_requests,
        dq.daily_limit,
        (dq.daily_limit - dq.total_requests) AS remaining_requests,
        dq.limit_exceeded,
        dq.peak_concurrent
    FROM canlii_daily_quotas dq
    WHERE dq.date = CURRENT_DATE
    LIMIT 1;
    
    -- Return default if no record exists
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            CURRENT_DATE AS date,
            0 AS total_requests,
            5000 AS daily_limit,
            5000 AS remaining_requests,
            false AS limit_exceeded,
            0 AS peak_concurrent;
    END IF;
END;
$$;

-- Function: Record API request (called by ingestion service)
CREATE OR REPLACE FUNCTION record_canlii_request(
    run_id UUID,
    endpoint_path TEXT,
    case_identifier TEXT DEFAULT NULL,
    response_code INT DEFAULT NULL,
    response_time INT DEFAULT NULL,
    was_successful BOOLEAN DEFAULT false,
    was_rate_limited BOOLEAN DEFAULT false,
    error_msg TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    request_id UUID;
    today DATE := CURRENT_DATE;
BEGIN
    -- Insert API request record
    INSERT INTO canlii_api_requests (
        ingestion_run_id,
        endpoint,
        case_id,
        status_code,
        response_time_ms,
        success,
        rate_limited,
        error_message
    ) VALUES (
        run_id,
        endpoint_path,
        case_identifier,
        response_code,
        response_time,
        was_successful,
        was_rate_limited,
        error_msg
    ) RETURNING id INTO request_id;
    
    -- Update daily quota (upsert)
    INSERT INTO canlii_daily_quotas (
        date,
        total_requests,
        successful_requests,
        failed_requests,
        rate_limited_requests
    ) VALUES (
        today,
        1,
        CASE WHEN was_successful THEN 1 ELSE 0 END,
        CASE WHEN NOT was_successful AND NOT was_rate_limited THEN 1 ELSE 0 END,
        CASE WHEN was_rate_limited THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO UPDATE SET
        total_requests = canlii_daily_quotas.total_requests + 1,
        successful_requests = canlii_daily_quotas.successful_requests + 
            CASE WHEN was_successful THEN 1 ELSE 0 END,
        failed_requests = canlii_daily_quotas.failed_requests + 
            CASE WHEN NOT was_successful AND NOT was_rate_limited THEN 1 ELSE 0 END,
        rate_limited_requests = canlii_daily_quotas.rate_limited_requests + 
            CASE WHEN was_rate_limited THEN 1 ELSE 0 END,
        limit_exceeded = (canlii_daily_quotas.total_requests + 1) >= canlii_daily_quotas.daily_limit,
        limit_exceeded_at = CASE 
            WHEN (canlii_daily_quotas.total_requests + 1) >= canlii_daily_quotas.daily_limit 
                AND canlii_daily_quotas.limit_exceeded_at IS NULL
            THEN NOW()
            ELSE canlii_daily_quotas.limit_exceeded_at
        END,
        updated_at = NOW();
    
    -- Update ingestion run metrics
    UPDATE canlii_ingestion_runs SET
        total_requests = total_requests + 1,
        successful_requests = successful_requests + CASE WHEN was_successful THEN 1 ELSE 0 END,
        failed_requests = failed_requests + CASE WHEN NOT was_successful AND NOT was_rate_limited THEN 1 ELSE 0 END,
        rate_limited_requests = rate_limited_requests + CASE WHEN was_rate_limited THEN 1 ELSE 0 END,
        exceeded_rate_limit = exceeded_rate_limit OR was_rate_limited,
        updated_at = NOW()
    WHERE id = run_id;
    
    RETURN request_id;
END;
$$;

-- Function: Update ingestion run status
CREATE OR REPLACE FUNCTION update_ingestion_run_status(
    run_id UUID,
    new_status TEXT,
    error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE canlii_ingestion_runs SET
        status = new_status,
        completed_at = CASE 
            WHEN new_status IN ('completed', 'failed', 'killed') THEN NOW()
            ELSE completed_at
        END,
        error_message = error_msg,
        error_occurred_at = CASE 
            WHEN error_msg IS NOT NULL THEN NOW()
            ELSE error_occurred_at
        END,
        updated_at = NOW()
    WHERE id = run_id;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_canlii_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ingestion_runs_updated_at
    BEFORE UPDATE ON canlii_ingestion_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_canlii_updated_at();

CREATE TRIGGER trigger_daily_quotas_updated_at
    BEFORE UPDATE ON canlii_daily_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_canlii_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE canlii_ingestion_runs IS 
    'Tracks CanLII API ingestion runs with rate limit compliance metrics. Critical for monitoring API usage and avoiding CanLII terms violations.';

COMMENT ON TABLE canlii_api_requests IS 
    'Detailed log of individual CanLII API requests for debugging and compliance audits. Includes rate limit state at time of request.';

COMMENT ON TABLE canlii_daily_quotas IS 
    'Daily aggregated metrics for CanLII API usage. Used for compliance reporting and quota monitoring.';

COMMENT ON FUNCTION get_canlii_daily_quota() IS 
    'Returns current daily quota usage for CanLII API. Used by rate limiter to enforce 5000 requests/day limit.';

COMMENT ON FUNCTION record_canlii_request(UUID, TEXT, TEXT, INT, INT, BOOLEAN, BOOLEAN, TEXT) IS 
    'Records a CanLII API request and updates daily quota. Called by ingestion service after each request.';

COMMENT ON FUNCTION update_ingestion_run_status(UUID, TEXT, TEXT) IS 
    'Updates status of a CanLII ingestion run. Used to track run lifecycle from running to completed/failed.';
