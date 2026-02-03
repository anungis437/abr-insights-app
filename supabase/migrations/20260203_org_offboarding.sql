-- =====================================================
-- PR-06: Data Lifecycle - Organization Offboarding Schema
-- =====================================================
-- Purpose: Track organization offboarding requests, data exports, and deletion schedules
-- Date: February 3, 2026
-- Author: Production Readiness Framework
-- =====================================================

-- =====================================================
-- Table: org_offboarding_requests
-- =====================================================
-- Tracks offboarding lifecycle from request to completion
-- Supports GDPR-compliant data export and deletion workflows

CREATE TABLE IF NOT EXISTS org_offboarding_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Request metadata
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT, -- Optional: Why offboarding (customer feedback)
    
    -- Offboarding status
    status TEXT NOT NULL CHECK (status IN (
        'requested',        -- Initial request submitted
        'exporting_data',   -- Generating data export ZIP
        'export_ready',     -- Export available for download
        'cancelling_stripe',-- Cancelling Stripe subscription
        'revoking_access',  -- Disabling users and sessions
        'deletion_scheduled',-- Scheduled for permanent deletion
        'completed',        -- Offboarding complete
        'failed'           -- Offboarding failed (requires manual intervention)
    )) DEFAULT 'requested',
    
    -- Data export tracking
    export_started_at TIMESTAMPTZ,
    export_completed_at TIMESTAMPTZ,
    export_file_path TEXT, -- S3/storage path to ZIP file
    export_file_size_bytes BIGINT,
    export_download_url TEXT, -- Presigned URL (expires after 7 days)
    export_downloaded_at TIMESTAMPTZ,
    
    -- Stripe cancellation tracking
    stripe_cancellation_started_at TIMESTAMPTZ,
    stripe_cancellation_completed_at TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    stripe_cancelled_at TIMESTAMPTZ, -- When Stripe confirmed cancellation
    
    -- Access revocation tracking
    access_revocation_started_at TIMESTAMPTZ,
    access_revocation_completed_at TIMESTAMPTZ,
    users_disabled_count INT DEFAULT 0,
    sessions_invalidated_count INT DEFAULT 0,
    
    -- Deletion scheduling (GDPR: 30-day retention after export)
    deletion_scheduled_at TIMESTAMPTZ, -- When data will be deleted
    deletion_executed_at TIMESTAMPTZ,  -- When data was actually deleted
    deletion_verified_at TIMESTAMPTZ,  -- When deletion was verified
    
    -- Error tracking
    error_message TEXT,
    error_occurred_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    
    -- Audit
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, requested_at) -- Only one offboarding per org at a time
);

-- =====================================================
-- Table: data_export_contents
-- =====================================================
-- Tracks what data was included in each export (audit trail)

CREATE TABLE IF NOT EXISTS data_export_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offboarding_request_id UUID NOT NULL REFERENCES org_offboarding_requests(id) ON DELETE CASCADE,
    
    -- Export metadata
    export_format TEXT NOT NULL CHECK (export_format IN ('zip', 'csv', 'json')) DEFAULT 'zip',
    total_files INT NOT NULL DEFAULT 0,
    total_size_bytes BIGINT NOT NULL DEFAULT 0,
    
    -- Data included (counts)
    users_exported INT DEFAULT 0,
    courses_exported INT DEFAULT 0,
    enrollments_exported INT DEFAULT 0,
    progress_records_exported INT DEFAULT 0,
    quiz_attempts_exported INT DEFAULT 0,
    certificates_exported INT DEFAULT 0,
    achievements_exported INT DEFAULT 0,
    ai_usage_exported INT DEFAULT 0,
    billing_records_exported INT DEFAULT 0,
    audit_logs_exported INT DEFAULT 0,
    
    -- File manifest (JSON array of filenames)
    file_manifest JSONB DEFAULT '[]'::jsonb,
    
    -- Checksums for verification
    export_checksum TEXT, -- SHA-256 of entire ZIP
    manifest_checksum TEXT, -- SHA-256 of manifest
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Index for quick lookup
    CONSTRAINT fk_offboarding_request FOREIGN KEY (offboarding_request_id) 
        REFERENCES org_offboarding_requests(id) ON DELETE CASCADE
);

-- =====================================================
-- Table: offboarding_audit_log
-- =====================================================
-- Detailed audit log for all offboarding actions

CREATE TABLE IF NOT EXISTS offboarding_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offboarding_request_id UUID NOT NULL REFERENCES org_offboarding_requests(id) ON DELETE CASCADE,
    
    -- Action details
    action TEXT NOT NULL, -- 'export_started', 'stripe_cancelled', 'access_revoked', etc.
    actor_id UUID REFERENCES auth.users(id),
    actor_role TEXT, -- 'super_admin', 'org_admin', 'system'
    
    -- Context
    details JSONB DEFAULT '{}'::jsonb, -- Additional context (e.g., user IDs disabled)
    ip_address INET,
    user_agent TEXT,
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Offboarding requests by organization
CREATE INDEX IF NOT EXISTS idx_offboarding_org_id 
    ON org_offboarding_requests(organization_id);

-- Offboarding requests by status (for processing queue)
CREATE INDEX IF NOT EXISTS idx_offboarding_status 
    ON org_offboarding_requests(status) 
    WHERE status NOT IN ('completed', 'failed');

-- Offboarding requests by deletion schedule (for cleanup job)
CREATE INDEX IF NOT EXISTS idx_offboarding_deletion_scheduled 
    ON org_offboarding_requests(deletion_scheduled_at) 
    WHERE deletion_scheduled_at IS NOT NULL AND deletion_executed_at IS NULL;

-- Export contents by request
CREATE INDEX IF NOT EXISTS idx_export_contents_request_id 
    ON data_export_contents(offboarding_request_id);

-- Audit log by request
CREATE INDEX IF NOT EXISTS idx_audit_log_request_id 
    ON offboarding_audit_log(offboarding_request_id);

-- Audit log by timestamp (for recent activity)
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at 
    ON offboarding_audit_log(created_at DESC);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE org_offboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_audit_log ENABLE ROW LEVEL SECURITY;

-- Offboarding requests: Super admins can view/manage all
CREATE POLICY offboarding_super_admin_all 
    ON org_offboarding_requests 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Offboarding requests: Org admins can view their org's requests
CREATE POLICY offboarding_org_admin_view 
    ON org_offboarding_requests 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN profiles p ON p.id = uo.user_id
            WHERE uo.user_id = auth.uid()
            AND uo.organization_id = org_offboarding_requests.organization_id
            AND p.role IN ('org_admin', 'super_admin')
        )
    );

-- Offboarding requests: Org admins can create requests for their org
CREATE POLICY offboarding_org_admin_create 
    ON org_offboarding_requests 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_organizations uo
            JOIN profiles p ON p.id = uo.user_id
            WHERE uo.user_id = auth.uid()
            AND uo.organization_id = org_offboarding_requests.organization_id
            AND p.role IN ('org_admin', 'super_admin')
        )
    );

-- Export contents: Same as offboarding requests (via FK)
CREATE POLICY export_contents_super_admin_all 
    ON data_export_contents 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY export_contents_org_view 
    ON data_export_contents 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM org_offboarding_requests obr
            JOIN user_organizations uo ON uo.organization_id = obr.organization_id
            WHERE obr.id = data_export_contents.offboarding_request_id
            AND uo.user_id = auth.uid()
        )
    );

-- Audit log: Super admins can view all
CREATE POLICY audit_log_super_admin_view 
    ON offboarding_audit_log 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Audit log: Org admins can view their org's logs
CREATE POLICY audit_log_org_view 
    ON offboarding_audit_log 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM org_offboarding_requests obr
            JOIN user_organizations uo ON uo.organization_id = obr.organization_id
            WHERE obr.id = offboarding_audit_log.offboarding_request_id
            AND uo.user_id = auth.uid()
        )
    );

-- =====================================================
-- Functions
-- =====================================================

-- Function: Get offboarding status for organization
CREATE OR REPLACE FUNCTION get_org_offboarding_status(org_id UUID)
RETURNS TABLE (
    request_id UUID,
    status TEXT,
    requested_at TIMESTAMPTZ,
    export_ready BOOLEAN,
    export_download_url TEXT,
    deletion_scheduled_at TIMESTAMPTZ,
    days_until_deletion INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        obr.id,
        obr.status,
        obr.requested_at,
        (obr.export_download_url IS NOT NULL) AS export_ready,
        obr.export_download_url,
        obr.deletion_scheduled_at,
        CASE 
            WHEN obr.deletion_scheduled_at IS NOT NULL 
            THEN EXTRACT(DAY FROM (obr.deletion_scheduled_at - NOW()))::INT
            ELSE NULL
        END AS days_until_deletion
    FROM org_offboarding_requests obr
    WHERE obr.organization_id = org_id
    AND obr.status NOT IN ('completed', 'failed')
    ORDER BY obr.requested_at DESC
    LIMIT 1;
END;
$$;

-- Function: Log offboarding action
CREATE OR REPLACE FUNCTION log_offboarding_action(
    request_id UUID,
    action_name TEXT,
    action_details JSONB DEFAULT '{}'::jsonb,
    action_success BOOLEAN DEFAULT true,
    action_error TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    log_id UUID;
    actor_role TEXT;
BEGIN
    -- Get actor role
    SELECT role INTO actor_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- Insert audit log
    INSERT INTO offboarding_audit_log (
        offboarding_request_id,
        action,
        actor_id,
        actor_role,
        details,
        success,
        error_message
    ) VALUES (
        request_id,
        action_name,
        auth.uid(),
        actor_role,
        action_details,
        action_success,
        action_error
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Function: Update offboarding status
CREATE OR REPLACE FUNCTION update_offboarding_status(
    request_id UUID,
    new_status TEXT,
    error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Update status
    UPDATE org_offboarding_requests
    SET 
        status = new_status,
        error_message = error_msg,
        error_occurred_at = CASE WHEN error_msg IS NOT NULL THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = request_id;
    
    -- Log action
    PERFORM log_offboarding_action(
        request_id,
        'status_changed',
        jsonb_build_object('new_status', new_status, 'error', error_msg),
        error_msg IS NULL,
        error_msg
    );
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_offboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_offboarding_updated_at
    BEFORE UPDATE ON org_offboarding_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_offboarding_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE org_offboarding_requests IS 
    'Tracks organization offboarding lifecycle from request to deletion. Supports GDPR-compliant export and deletion workflows.';

COMMENT ON TABLE data_export_contents IS 
    'Audit trail of data included in each export. Used for compliance verification and support.';

COMMENT ON TABLE offboarding_audit_log IS 
    'Detailed audit log of all offboarding actions. Critical for compliance and security investigations.';

COMMENT ON FUNCTION get_org_offboarding_status(UUID) IS 
    'Returns current offboarding status for an organization, including export readiness and deletion schedule.';

COMMENT ON FUNCTION log_offboarding_action(UUID, TEXT, JSONB, BOOLEAN, TEXT) IS 
    'Logs an offboarding action to the audit log. Used throughout offboarding process for compliance tracking.';

COMMENT ON FUNCTION update_offboarding_status(UUID, TEXT, TEXT) IS 
    'Updates offboarding status and logs the change. Primary function for status transitions.';
