-- Case Alerts Migration
-- Notifications and digests for tribunal case updates

-- Saved searches for tribunal cases
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    search_name TEXT NOT NULL,
    search_query TEXT NOT NULL,
    search_filters JSONB NOT NULL DEFAULT '{}',
    alert_enabled BOOLEAN NOT NULL DEFAULT false,
    alert_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly', 'monthly')),
    alert_channels TEXT[] NOT NULL DEFAULT ARRAY['email', 'in_app'],
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case alerts for users
CREATE TABLE IF NOT EXISTS case_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
    tribunal_case_id UUID NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('new_case', 'case_updated', 'related_case', 'digest')),
    alert_title TEXT NOT NULL,
    alert_summary TEXT NOT NULL,
    case_title TEXT NOT NULL,
    decision_date DATE NOT NULL,
    relevance_score DECIMAL(3, 2) NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 1),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case digests for organizations
CREATE TABLE IF NOT EXISTS case_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    digest_period_start TIMESTAMPTZ NOT NULL,
    digest_period_end TIMESTAMPTZ NOT NULL,
    total_cases INTEGER NOT NULL DEFAULT 0,
    high_priority_cases INTEGER NOT NULL DEFAULT 0,
    cases_by_category JSONB NOT NULL DEFAULT '{}',
    key_findings TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, digest_period_start, digest_period_end)
);

-- Alert preferences for users
CREATE TABLE IF NOT EXISTS alert_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    in_app_notifications BOOLEAN NOT NULL DEFAULT true,
    webhook_url TEXT,
    digest_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    notification_grouping BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_org ON saved_searches(organization_id);
CREATE INDEX idx_saved_searches_alert_enabled ON saved_searches(alert_enabled) WHERE alert_enabled = true;

CREATE INDEX idx_case_alerts_search ON case_alerts(saved_search_id);
CREATE INDEX idx_case_alerts_case ON case_alerts(tribunal_case_id);
CREATE INDEX idx_case_alerts_unread ON case_alerts(saved_search_id, read) WHERE read = false;
CREATE INDEX idx_case_alerts_created ON case_alerts(created_at DESC);

CREATE INDEX idx_case_digests_org ON case_digests(organization_id);
CREATE INDEX idx_case_digests_period ON case_digests(digest_period_start, digest_period_end);

-- RLS Policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- Saved searches: Users can only see their own
CREATE POLICY saved_searches_select_own ON saved_searches
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY saved_searches_insert_own ON saved_searches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY saved_searches_update_own ON saved_searches
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY saved_searches_delete_own ON saved_searches
    FOR DELETE
    USING (auth.uid() = user_id);

-- Case alerts: Users can only see alerts from their saved searches
CREATE POLICY case_alerts_select_own ON case_alerts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saved_searches
            WHERE saved_searches.id = case_alerts.saved_search_id
            AND saved_searches.user_id = auth.uid()
        )
    );

CREATE POLICY case_alerts_update_own ON case_alerts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM saved_searches
            WHERE saved_searches.id = case_alerts.saved_search_id
            AND saved_searches.user_id = auth.uid()
        )
    );

-- Case digests: Users can see digests from their organization
CREATE POLICY case_digests_select_org ON case_digests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_organizations
            WHERE user_organizations.organization_id = case_digests.organization_id
            AND user_organizations.user_id = auth.uid()
        )
    );

-- Alert preferences: Users can only manage their own
CREATE POLICY alert_preferences_all_own ON alert_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_preferences_updated_at
    BEFORE UPDATE ON alert_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
