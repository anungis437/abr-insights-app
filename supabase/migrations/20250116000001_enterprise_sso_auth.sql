-- Migration: 20250116000001_enterprise_sso_auth.sql
-- Description: Enterprise SSO authentication infrastructure
-- Supports: Azure AD B2C, SAML 2.0, OIDC
-- Created: 2025-01-16

-- ============================================================================
-- SSO PROVIDERS TABLE
-- ============================================================================
-- Stores configuration for SSO identity providers (multi-tenant support)

CREATE TABLE IF NOT EXISTS sso_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Provider Info
    name VARCHAR(255) NOT NULL, -- e.g., "Acme Corp Azure AD"
    slug VARCHAR(100) NOT NULL, -- e.g., "acme-azure-ad"
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('azure_ad_b2c', 'saml', 'oidc', 'okta', 'auth0')),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'error')),
    is_default BOOLEAN DEFAULT FALSE, -- Default provider for organization
    
    -- Azure AD B2C Configuration
    azure_tenant_id VARCHAR(255),
    azure_client_id VARCHAR(255),
    azure_client_secret TEXT, -- Encrypted in production
    azure_policy_name VARCHAR(255), -- User flow/policy name
    
    -- SAML Configuration
    saml_entity_id VARCHAR(500),
    saml_sso_url TEXT,
    saml_slo_url TEXT, -- Single Logout URL
    saml_certificate TEXT, -- X.509 certificate for signature validation
    saml_name_id_format VARCHAR(255) DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    
    -- OIDC Configuration
    oidc_issuer_url TEXT,
    oidc_client_id VARCHAR(255),
    oidc_client_secret TEXT, -- Encrypted in production
    oidc_authorization_endpoint TEXT,
    oidc_token_endpoint TEXT,
    oidc_userinfo_endpoint TEXT,
    oidc_jwks_uri TEXT,
    
    -- Attribute Mapping (map provider attributes to profile fields)
    attribute_mapping JSONB DEFAULT '{
        "email": "email",
        "firstName": "given_name",
        "lastName": "family_name",
        "displayName": "name"
    }'::jsonb,
    
    -- Advanced Settings
    settings JSONB DEFAULT '{}', -- Provider-specific settings
    auto_provision_users BOOLEAN DEFAULT TRUE, -- Auto-create users on first SSO login
    require_email_verification BOOLEAN DEFAULT FALSE, -- Require email verification after SSO
    allowed_domains TEXT[], -- Restrict to specific email domains
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_sso_providers_organization_id ON sso_providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_providers_slug ON sso_providers(slug);
CREATE INDEX IF NOT EXISTS idx_sso_providers_status ON sso_providers(status);
CREATE INDEX IF NOT EXISTS idx_sso_providers_provider_type ON sso_providers(provider_type);

COMMENT ON TABLE sso_providers IS 'Multi-tenant SSO provider configurations (Azure AD B2C, SAML 2.0, OIDC)';
COMMENT ON COLUMN sso_providers.attribute_mapping IS 'Maps provider attributes to profile fields for user provisioning';

-- ============================================================================
-- ENTERPRISE SESSIONS TABLE
-- ============================================================================
-- Tracks SSO sessions for security and compliance

CREATE TABLE IF NOT EXISTS enterprise_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sso_provider_id UUID REFERENCES sso_providers(id) ON DELETE SET NULL,
    
    -- Session Info
    session_token VARCHAR(500) UNIQUE NOT NULL, -- JWT or session ID
    refresh_token TEXT, -- For token refresh
    
    -- SSO Details
    sso_session_id VARCHAR(500), -- Provider's session ID
    id_token TEXT, -- OIDC ID token
    access_token TEXT, -- OAuth access token
    
    -- Claims and Metadata
    claims JSONB, -- Decoded token claims
    provider_metadata JSONB DEFAULT '{}', -- Provider-specific data
    
    -- Security
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(255),
    
    -- Lifecycle
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoke_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_user_id ON enterprise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_organization_id ON enterprise_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_sso_provider_id ON enterprise_sessions(sso_provider_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_session_token ON enterprise_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_expires_at ON enterprise_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_enterprise_sessions_last_activity_at ON enterprise_sessions(last_activity_at DESC);

COMMENT ON TABLE enterprise_sessions IS 'SSO session tracking for enterprise authentication with token management';

-- ============================================================================
-- IDENTITY PROVIDER MAPPING TABLE
-- ============================================================================
-- Maps external SSO identities to internal user profiles

CREATE TABLE IF NOT EXISTS identity_provider_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sso_provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
    
    -- External Identity
    provider_user_id VARCHAR(500) NOT NULL, -- User ID from SSO provider
    provider_username VARCHAR(255), -- Username from provider (if available)
    provider_email VARCHAR(255), -- Email from provider
    
    -- Identity Claims
    claims JSONB, -- All claims from provider
    
    -- Link Status
    link_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (link_status IN ('active', 'suspended', 'unlinked')),
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unlinked_at TIMESTAMPTZ,
    unlink_reason TEXT,
    
    -- Last Authentication
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(sso_provider_id, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_identity_provider_mapping_user_id ON identity_provider_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_provider_mapping_sso_provider_id ON identity_provider_mapping(sso_provider_id);
CREATE INDEX IF NOT EXISTS idx_identity_provider_mapping_provider_user_id ON identity_provider_mapping(provider_user_id);
CREATE INDEX IF NOT EXISTS idx_identity_provider_mapping_provider_email ON identity_provider_mapping(provider_email);
CREATE INDEX IF NOT EXISTS idx_identity_provider_mapping_link_status ON identity_provider_mapping(link_status);

COMMENT ON TABLE identity_provider_mapping IS 'Links external SSO identities to internal user profiles';

-- ============================================================================
-- SSO LOGIN ATTEMPTS TABLE
-- ============================================================================
-- Security: Track SSO login attempts for monitoring and rate limiting

CREATE TABLE IF NOT EXISTS sso_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Context
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sso_provider_id UUID REFERENCES sso_providers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL if login failed
    
    -- Attempt Details
    provider_user_id VARCHAR(500), -- External ID (even if login fails)
    email VARCHAR(255),
    
    -- Result
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'rejected', 'error')),
    failure_reason TEXT,
    error_code VARCHAR(100),
    
    -- Security Context
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- GeoIP data
    
    -- Timestamps
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_organization_id ON sso_login_attempts(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_sso_provider_id ON sso_login_attempts(sso_provider_id);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_user_id ON sso_login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_email ON sso_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_status ON sso_login_attempts(status);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_attempted_at ON sso_login_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_sso_login_attempts_ip_address ON sso_login_attempts(ip_address);

COMMENT ON TABLE sso_login_attempts IS 'Security audit trail for SSO authentication attempts';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_provider_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_login_attempts ENABLE ROW LEVEL SECURITY;

-- SSO Providers: Admins can manage, others can view their org's providers
CREATE POLICY "Organization admins can manage SSO providers"
    ON sso_providers
    FOR ALL
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view their organization's SSO providers"
    ON sso_providers
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Enterprise Sessions: Users can only access their own sessions
CREATE POLICY "Users can manage their own SSO sessions"
    ON enterprise_sessions
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all organization sessions"
    ON enterprise_sessions
    FOR SELECT
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

-- Identity Provider Mapping: Users can only access their own mappings
CREATE POLICY "Users can view their own identity mappings"
    ON identity_provider_mapping
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage identity mappings"
    ON identity_provider_mapping
    FOR ALL
    USING (true); -- Managed by service layer with service role key

-- SSO Login Attempts: Admins only
CREATE POLICY "Admins can view SSO login attempts"
    ON sso_login_attempts
    FOR SELECT
    USING (
        organization_id IN (
            SELECT p.organization_id 
            FROM profiles p
            JOIN user_roles ur ON ur.user_id = p.id
            JOIN roles r ON r.id = ur.role_id
            WHERE p.id = auth.uid() 
            AND r.slug IN ('admin', 'super_admin')
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_sso_providers_updated_at ON sso_providers;
CREATE TRIGGER update_sso_providers_updated_at BEFORE UPDATE ON sso_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enterprise_sessions_updated_at ON enterprise_sessions;
CREATE TRIGGER update_enterprise_sessions_updated_at BEFORE UPDATE ON enterprise_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_identity_provider_mapping_updated_at ON identity_provider_mapping;
CREATE TRIGGER update_identity_provider_mapping_updated_at BEFORE UPDATE ON identity_provider_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update last_activity_at on enterprise_sessions
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.access_token IS DISTINCT FROM NEW.access_token THEN
        NEW.last_activity_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enterprise_sessions_activity ON enterprise_sessions;
CREATE TRIGGER update_enterprise_sessions_activity BEFORE UPDATE ON enterprise_sessions
    FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get active SSO session for user
CREATE OR REPLACE FUNCTION get_active_sso_session(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    sso_provider_id UUID,
    expires_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        enterprise_sessions.sso_provider_id,
        enterprise_sessions.expires_at,
        enterprise_sessions.last_activity_at
    FROM enterprise_sessions
    WHERE user_id = p_user_id
    AND revoked_at IS NULL
    AND expires_at > NOW()
    ORDER BY last_activity_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke all sessions for user (for logout/security)
CREATE OR REPLACE FUNCTION revoke_user_sso_sessions(p_user_id UUID, p_reason VARCHAR(255) DEFAULT 'user_logout')
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE enterprise_sessions
    SET 
        revoked_at = NOW(),
        revoke_reason = p_reason
    WHERE user_id = p_user_id
    AND revoked_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired sessions (scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE enterprise_sessions
    SET 
        revoked_at = NOW(),
        revoke_reason = 'expired'
    WHERE expires_at < NOW()
    AND revoked_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get SSO provider for organization
CREATE OR REPLACE FUNCTION get_org_sso_provider(p_organization_id UUID, p_provider_slug VARCHAR(100) DEFAULT NULL)
RETURNS TABLE (
    provider_id UUID,
    name VARCHAR(255),
    provider_type VARCHAR(50),
    status VARCHAR(50)
) AS $$
BEGIN
    IF p_provider_slug IS NOT NULL THEN
        RETURN QUERY
        SELECT id, sso_providers.name, sso_providers.provider_type, sso_providers.status
        FROM sso_providers
        WHERE organization_id = p_organization_id
        AND slug = p_provider_slug
        AND status = 'active'
        LIMIT 1;
    ELSE
        RETURN QUERY
        SELECT id, sso_providers.name, sso_providers.provider_type, sso_providers.status
        FROM sso_providers
        WHERE organization_id = p_organization_id
        AND status = 'active'
        AND is_default = TRUE
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
