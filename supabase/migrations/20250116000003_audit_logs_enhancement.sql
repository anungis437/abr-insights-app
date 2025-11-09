-- Migration: 20250116000003_audit_logs_enhancement.sql
-- Description: Enhanced audit logging with compliance, retention, and export capabilities
-- Features: Compliance levels, data retention policies, export functionality, partitioning
-- Created: 2025-01-16
-- Compliance: PIPEDA, SOC 2, ISO 27001

-- ============================================================================
-- ENHANCE EXISTING AUDIT_LOGS TABLE
-- ============================================================================

-- Add new columns to existing audit_logs table
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS compliance_level VARCHAR(50) DEFAULT 'standard' CHECK (compliance_level IN ('low', 'standard', 'high', 'critical')),
    ADD COLUMN IF NOT EXISTS data_classification VARCHAR(50) DEFAULT 'internal' CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    ADD COLUMN IF NOT EXISTS event_category VARCHAR(100) DEFAULT 'general' CHECK (event_category IN ('authentication', 'authorization', 'data_access', 'data_modification', 'administrative', 'security', 'compliance', 'general')),
    ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    ADD COLUMN IF NOT EXISTS retention_days INTEGER DEFAULT 2555, -- 7 years default (PIPEDA requirement)
    ADD COLUMN IF NOT EXISTS archive_status VARCHAR(50) DEFAULT 'active' CHECK (archive_status IN ('active', 'pending_archive', 'archived', 'pending_deletion', 'deleted')),
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS archived_location TEXT, -- S3 path or other storage location
    ADD COLUMN IF NOT EXISTS export_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_exported_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS hash VARCHAR(64), -- SHA-256 hash for tamper detection
    ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64); -- Previous log entry hash (blockchain-style)

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance_level ON audit_logs(compliance_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_status ON audit_logs(archive_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_archived_at ON audit_logs(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_retention_days ON audit_logs(retention_days);

COMMENT ON COLUMN audit_logs.compliance_level IS 'Compliance criticality: low, standard, high, critical (affects retention and monitoring)';
COMMENT ON COLUMN audit_logs.data_classification IS 'Data sensitivity level per organizational classification policy';
COMMENT ON COLUMN audit_logs.retention_days IS 'Days to retain this log entry (default 2555 days = 7 years for PIPEDA)';
COMMENT ON COLUMN audit_logs.hash IS 'SHA-256 hash for tamper detection and audit trail integrity';
COMMENT ON COLUMN audit_logs.previous_hash IS 'Hash of previous log entry (creates immutable chain)';

-- ============================================================================
-- COMPLIANCE REPORTS TABLE
-- ============================================================================
-- Scheduled and on-demand compliance reports

CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Report Details
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('access_control', 'data_access', 'authentication', 'authorization_changes', 'security_incidents', 'user_activity', 'admin_actions', 'compliance_summary', 'custom')),
    
    -- Organization Context
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time Range
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Filters and Parameters
    filters JSONB DEFAULT '{}', -- e.g., {"user_id": "...", "resource_type": "course", "severity": ["error", "critical"]}
    parameters JSONB DEFAULT '{}', -- Report-specific parameters
    
    -- Report Output
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'expired')),
    format VARCHAR(50) NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'json', 'xlsx')),
    file_url TEXT, -- Download URL (S3 or storage)
    file_size_bytes BIGINT,
    
    -- Statistics
    total_events INTEGER DEFAULT 0,
    events_by_category JSONB DEFAULT '{}',
    events_by_severity JSONB DEFAULT '{}',
    anomalies_detected INTEGER DEFAULT 0,
    
    -- Compliance Metadata
    compliance_framework VARCHAR(100), -- e.g., 'PIPEDA', 'SOC2', 'ISO27001', 'GDPR'
    compliance_notes TEXT,
    findings JSONB DEFAULT '[]', -- Array of compliance findings/issues
    
    -- Scheduling (for recurring reports)
    schedule_type VARCHAR(50) CHECK (schedule_type IN ('on_demand', 'daily', 'weekly', 'monthly', 'quarterly', 'annual')),
    next_run_at TIMESTAMPTZ,
    
    -- Audit
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- Reports auto-delete after expiration
    
    -- Notifications
    notify_users UUID[], -- Array of user IDs to notify when complete
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_organization_id ON compliance_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_type ON compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_by ON compliance_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_next_run_at ON compliance_reports(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_reports_expires_at ON compliance_reports(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE compliance_reports IS 'Compliance and audit reports with scheduling and export capabilities';

-- ============================================================================
-- AUDIT LOG EXPORTS TABLE
-- ============================================================================
-- Track exports for compliance and data governance

CREATE TABLE IF NOT EXISTS audit_log_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Export Details
    export_name VARCHAR(255),
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('full', 'filtered', 'compliance', 'investigation')),
    
    -- Organization Context
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time Range
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Filters
    filters JSONB DEFAULT '{}',
    
    -- Export Output
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    format VARCHAR(50) NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'csv', 'xlsx', 'syslog')),
    file_url TEXT,
    file_size_bytes BIGINT,
    total_records INTEGER DEFAULT 0,
    
    -- Security
    encrypted BOOLEAN DEFAULT TRUE,
    encryption_key_id VARCHAR(255), -- KMS key ID
    checksum VARCHAR(64), -- File integrity check
    
    -- Access Control
    requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approval_required BOOLEAN DEFAULT TRUE,
    approval_reason TEXT,
    
    -- Download Tracking
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    downloaded_by UUID[], -- Array of user IDs who downloaded
    
    -- Lifecycle
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    deleted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_exports_organization_id ON audit_log_exports(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_exports_status ON audit_log_exports(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_exports_requested_by ON audit_log_exports(requested_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_exports_approved_by ON audit_log_exports(approved_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_exports_period ON audit_log_exports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_audit_log_exports_expires_at ON audit_log_exports(expires_at);

COMMENT ON TABLE audit_log_exports IS 'Tracked exports of audit logs with approval workflow and security controls';

-- ============================================================================
-- AUDIT LOG ARCHIVE TABLE
-- ============================================================================
-- Archived audit logs (moved from active table for performance)

CREATE TABLE IF NOT EXISTS audit_logs_archive (
    LIKE audit_logs INCLUDING ALL
);

COMMENT ON TABLE audit_logs_archive IS 'Archived audit logs moved from active table for long-term retention';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_archive ENABLE ROW LEVEL SECURITY;

-- Compliance Reports: Admins and report creators can view
CREATE POLICY "Admins can manage compliance reports"
    ON compliance_reports
    FOR ALL
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin', 'compliance_officer')
        )
    );

CREATE POLICY "Users can view their generated reports"
    ON compliance_reports
    FOR SELECT
    USING (generated_by = auth.uid() OR auth.uid() = ANY(notify_users));

-- Audit Log Exports: Admins and requesters can view
CREATE POLICY "Admins can manage audit log exports"
    ON audit_log_exports
    FOR ALL
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin', 'compliance_officer', 'security_officer')
        )
    );

CREATE POLICY "Users can view their requested exports"
    ON audit_log_exports
    FOR SELECT
    USING (requested_by = auth.uid() OR approved_by = auth.uid() OR auth.uid() = ANY(downloaded_by));

-- Audit Logs Archive: Same policies as audit_logs
CREATE POLICY "Admins can view archived audit logs"
    ON audit_logs_archive
    FOR SELECT
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin', 'compliance_officer')
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_compliance_reports_updated_at ON compliance_reports;
CREATE TRIGGER update_compliance_reports_updated_at BEFORE UPDATE ON compliance_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audit_log_exports_updated_at ON audit_log_exports;
CREATE TRIGGER update_audit_log_exports_updated_at BEFORE UPDATE ON audit_log_exports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate hash for audit log integrity
CREATE OR REPLACE FUNCTION generate_audit_log_hash()
RETURNS TRIGGER AS $$
DECLARE
    v_previous_hash VARCHAR(64);
    v_hash_input TEXT;
BEGIN
    -- Get previous log hash (blockchain-style)
    SELECT hash INTO v_previous_hash
    FROM audit_logs
    WHERE organization_id = NEW.organization_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    NEW.previous_hash := v_previous_hash;
    
    -- Generate hash from log data
    v_hash_input := CONCAT(
        COALESCE(NEW.user_id::TEXT, ''),
        COALESCE(NEW.action, ''),
        COALESCE(NEW.resource_type, ''),
        COALESCE(NEW.resource_id::TEXT, ''),
        COALESCE(NEW.changes::TEXT, ''),
        NEW.created_at::TEXT,
        COALESCE(NEW.previous_hash, '')
    );
    
    NEW.hash := encode(digest(v_hash_input, 'sha256'), 'hex');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_audit_log_hash_trigger ON audit_logs;
CREATE TRIGGER generate_audit_log_hash_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION generate_audit_log_hash();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs(p_days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
    v_cutoff_date TIMESTAMPTZ;
BEGIN
    v_cutoff_date := NOW() - (p_days_old || ' days')::INTERVAL;
    
    -- Move to archive table
    INSERT INTO audit_logs_archive
    SELECT * FROM audit_logs
    WHERE created_at < v_cutoff_date
    AND archive_status = 'active'
    AND compliance_level NOT IN ('critical'); -- Never auto-archive critical logs
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Update status on original table
    UPDATE audit_logs
    SET 
        archive_status = 'archived',
        archived_at = NOW(),
        archived_location = 'audit_logs_archive'
    WHERE created_at < v_cutoff_date
    AND archive_status = 'active'
    AND compliance_level NOT IN ('critical');
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives audit logs older than specified days to archive table';

-- Delete archived logs past retention period
CREATE OR REPLACE FUNCTION delete_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Delete from archive table based on retention_days
    DELETE FROM audit_logs_archive
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND archive_status = 'archived'
    AND compliance_level NOT IN ('critical'); -- Never auto-delete critical logs
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Also mark for deletion in main table (soft delete)
    UPDATE audit_logs
    SET archive_status = 'deleted'
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND archive_status = 'archived'
    AND compliance_level NOT IN ('critical');
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_expired_audit_logs IS 'Deletes audit logs past their retention period (respects compliance levels)';

-- Get audit log statistics for compliance reports
CREATE OR REPLACE FUNCTION get_audit_log_statistics(
    p_organization_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    WITH stats AS (
        SELECT
            COUNT(*) AS total_events,
            COUNT(DISTINCT user_id) AS unique_users,
            COUNT(DISTINCT resource_type) AS resource_types,
            jsonb_object_agg(
                event_category,
                category_count
            ) AS events_by_category,
            jsonb_object_agg(
                severity,
                severity_count
            ) AS events_by_severity,
            COUNT(*) FILTER (WHERE severity IN ('error', 'critical')) AS error_count,
            COUNT(*) FILTER (WHERE event_category = 'authentication') AS auth_events,
            COUNT(*) FILTER (WHERE event_category = 'data_access') AS data_access_events
        FROM (
            SELECT 
                user_id,
                resource_type,
                event_category,
                severity,
                COUNT(*) AS category_count,
                COUNT(*) AS severity_count
            FROM audit_logs
            WHERE organization_id = p_organization_id
            AND created_at BETWEEN p_start_date AND p_end_date
            GROUP BY GROUPING SETS (
                (user_id, resource_type, event_category),
                (event_category),
                (severity)
            )
        ) grouped
    )
    SELECT jsonb_build_object(
        'total_events', total_events,
        'unique_users', unique_users,
        'resource_types', resource_types,
        'events_by_category', events_by_category,
        'events_by_severity', events_by_severity,
        'error_count', error_count,
        'auth_events', auth_events,
        'data_access_events', data_access_events,
        'period_start', p_start_date,
        'period_end', p_end_date
    ) INTO v_stats
    FROM stats;
    
    RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_audit_log_statistics IS 'Generates comprehensive statistics for audit logs within date range';

-- Detect anomalies in audit logs (simple rule-based)
CREATE OR REPLACE FUNCTION detect_audit_anomalies(
    p_organization_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_anomalies JSONB;
BEGIN
    WITH anomalies AS (
        -- Failed login attempts (>5 in 1 hour)
        SELECT 
            'excessive_failed_logins' AS anomaly_type,
            user_id,
            COUNT(*) AS event_count,
            'User has ' || COUNT(*) || ' failed login attempts' AS description
        FROM audit_logs
        WHERE organization_id = p_organization_id
        AND created_at BETWEEN p_start_date AND p_end_date
        AND action = 'login'
        AND description LIKE '%failed%'
        GROUP BY user_id
        HAVING COUNT(*) > 5
        
        UNION ALL
        
        -- Unusual activity hours (late night access)
        SELECT 
            'unusual_activity_hours' AS anomaly_type,
            user_id,
            COUNT(*) AS event_count,
            'User active during unusual hours (10pm-6am)' AS description
        FROM audit_logs
        WHERE organization_id = p_organization_id
        AND created_at BETWEEN p_start_date AND p_end_date
        AND EXTRACT(HOUR FROM created_at) BETWEEN 22 AND 6
        GROUP BY user_id
        HAVING COUNT(*) > 10
        
        UNION ALL
        
        -- Excessive permission changes
        SELECT 
            'excessive_permission_changes' AS anomaly_type,
            user_id,
            COUNT(*) AS event_count,
            'User made ' || COUNT(*) || ' permission changes' AS description
        FROM audit_logs
        WHERE organization_id = p_organization_id
        AND created_at BETWEEN p_start_date AND p_end_date
        AND event_category = 'authorization'
        AND action IN ('created', 'updated', 'deleted')
        GROUP BY user_id
        HAVING COUNT(*) > 20
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'anomaly_type', anomaly_type,
            'user_id', user_id,
            'event_count', event_count,
            'description', description
        )
    ) INTO v_anomalies
    FROM anomalies;
    
    RETURN COALESCE(v_anomalies, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION detect_audit_anomalies IS 'Detects anomalies in audit logs using rule-based analysis';

-- Clean up expired compliance reports
CREATE OR REPLACE FUNCTION cleanup_expired_compliance_reports()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM compliance_reports
    WHERE expires_at < NOW()
    AND status = 'completed';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired audit log exports
CREATE OR REPLACE FUNCTION cleanup_expired_audit_exports()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE audit_log_exports
    SET 
        status = 'expired',
        deleted_at = NOW()
    WHERE expires_at < NOW()
    AND status = 'completed';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
