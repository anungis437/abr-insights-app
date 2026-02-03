-- AI Usage Tracking Tables
-- Tracks daily AI usage per organization for cost controls and abuse prevention

-- Daily AI usage aggregates
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Request counts by model
  gpt4_requests INTEGER NOT NULL DEFAULT 0,
  gpt35_requests INTEGER NOT NULL DEFAULT 0,
  claude_requests INTEGER NOT NULL DEFAULT 0,
  embedding_requests INTEGER NOT NULL DEFAULT 0,
  
  -- Token usage by model
  gpt4_input_tokens BIGINT NOT NULL DEFAULT 0,
  gpt4_output_tokens BIGINT NOT NULL DEFAULT 0,
  gpt35_input_tokens BIGINT NOT NULL DEFAULT 0,
  gpt35_output_tokens BIGINT NOT NULL DEFAULT 0,
  claude_input_tokens BIGINT NOT NULL DEFAULT 0,
  claude_output_tokens BIGINT NOT NULL DEFAULT 0,
  embedding_tokens BIGINT NOT NULL DEFAULT 0,
  
  -- Estimated costs (in cents)
  gpt4_cost_cents INTEGER NOT NULL DEFAULT 0,
  gpt35_cost_cents INTEGER NOT NULL DEFAULT 0,
  claude_cost_cents INTEGER NOT NULL DEFAULT 0,
  embedding_cost_cents INTEGER NOT NULL DEFAULT 0,
  total_cost_cents INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one row per org per day
  UNIQUE(organization_id, date)
);

-- AI quota configuration per organization
CREATE TABLE IF NOT EXISTS ai_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Daily limits (requests)
  daily_gpt4_limit INTEGER NOT NULL DEFAULT 100,
  daily_gpt35_limit INTEGER NOT NULL DEFAULT 500,
  daily_claude_limit INTEGER NOT NULL DEFAULT 100,
  daily_embedding_limit INTEGER NOT NULL DEFAULT 1000,
  
  -- Monthly limits (cost in cents)
  monthly_cost_limit_cents INTEGER NOT NULL DEFAULT 10000, -- $100 default
  monthly_cost_warning_cents INTEGER NOT NULL DEFAULT 7500, -- $75 warning threshold
  
  -- Enforcement settings
  enforce_limits BOOLEAN NOT NULL DEFAULT true,
  send_warnings BOOLEAN NOT NULL DEFAULT true,
  
  -- Contact for quota alerts
  alert_email TEXT,
  alert_slack_webhook TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- One quota config per org
  UNIQUE(organization_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_org_date 
  ON ai_usage_daily(organization_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_date 
  ON ai_usage_daily(date DESC);

CREATE INDEX IF NOT EXISTS idx_ai_quota_org 
  ON ai_quota(organization_id);

-- Row-level security
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quota ENABLE ROW LEVEL SECURITY;

-- RLS Policies: ai_usage_daily
-- Admins and org owners can view their org's usage
CREATE POLICY "Users can view their org's AI usage"
  ON ai_usage_daily
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Only super admins can insert/update usage (system operation)
CREATE POLICY "Super admins can manage AI usage"
  ON ai_usage_daily
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- RLS Policies: ai_quota
-- Admins and org owners can view their org's quota
CREATE POLICY "Users can view their org's AI quota"
  ON ai_quota
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Only super admins can modify quotas
CREATE POLICY "Super admins can manage AI quotas"
  ON ai_quota
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Function to get current month usage for an org
CREATE OR REPLACE FUNCTION get_monthly_ai_usage(org_id UUID, target_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_requests INTEGER,
  total_cost_cents INTEGER,
  gpt4_requests INTEGER,
  gpt35_requests INTEGER,
  claude_requests INTEGER,
  embedding_requests INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(gpt4_requests + gpt35_requests + claude_requests + embedding_requests), 0)::INTEGER AS total_requests,
    COALESCE(SUM(total_cost_cents), 0)::INTEGER AS total_cost_cents,
    COALESCE(SUM(gpt4_requests), 0)::INTEGER AS gpt4_requests,
    COALESCE(SUM(gpt35_requests), 0)::INTEGER AS gpt35_requests,
    COALESCE(SUM(claude_requests), 0)::INTEGER AS claude_requests,
    COALESCE(SUM(embedding_requests), 0)::INTEGER AS embedding_requests
  FROM ai_usage_daily
  WHERE organization_id = org_id
    AND date >= DATE_TRUNC('month', target_month)
    AND date < DATE_TRUNC('month', target_month) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if org has exceeded quota
CREATE OR REPLACE FUNCTION check_ai_quota(
  org_id UUID,
  model_type TEXT,
  request_count INTEGER DEFAULT 1
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  daily_limit INTEGER,
  daily_used INTEGER,
  monthly_limit_cents INTEGER,
  monthly_used_cents INTEGER
) AS $$
DECLARE
  v_quota RECORD;
  v_today_usage RECORD;
  v_monthly_usage RECORD;
  v_daily_limit INTEGER;
  v_daily_used INTEGER;
BEGIN
  -- Get quota configuration
  SELECT * INTO v_quota
  FROM ai_quota
  WHERE organization_id = org_id;
  
  -- If no quota config, use defaults
  IF v_quota IS NULL THEN
    v_quota := ROW(
      NULL, org_id,
      100, 500, 100, 1000,  -- daily limits
      10000, 7500,          -- monthly limits
      true, true,           -- enforce, warn
      NULL, NULL,           -- alerts
      NOW(), NOW(), NULL, NULL
    )::ai_quota;
  END IF;
  
  -- Get today's usage
  SELECT * INTO v_today_usage
  FROM ai_usage_daily
  WHERE organization_id = org_id
    AND date = CURRENT_DATE;
    
  -- If no usage today, initialize
  IF v_today_usage IS NULL THEN
    v_today_usage := ROW(
      NULL, org_id, CURRENT_DATE,
      0, 0, 0, 0,  -- request counts
      0, 0, 0, 0, 0, 0, 0,  -- token counts
      0, 0, 0, 0, 0,  -- costs
      NOW(), NOW()
    )::ai_usage_daily;
  END IF;
  
  -- Get monthly usage
  SELECT * INTO v_monthly_usage
  FROM get_monthly_ai_usage(org_id);
  
  -- Check daily limits by model type
  CASE model_type
    WHEN 'gpt-4' THEN
      v_daily_limit := v_quota.daily_gpt4_limit;
      v_daily_used := v_today_usage.gpt4_requests;
    WHEN 'gpt-3.5-turbo' THEN
      v_daily_limit := v_quota.daily_gpt35_limit;
      v_daily_used := v_today_usage.gpt35_requests;
    WHEN 'claude' THEN
      v_daily_limit := v_quota.daily_claude_limit;
      v_daily_used := v_today_usage.claude_requests;
    WHEN 'embedding' THEN
      v_daily_limit := v_quota.daily_embedding_limit;
      v_daily_used := v_today_usage.embedding_requests;
    ELSE
      v_daily_limit := 0;
      v_daily_used := 0;
  END CASE;
  
  -- Check if daily limit exceeded
  IF v_quota.enforce_limits AND (v_daily_used + request_count) > v_daily_limit THEN
    RETURN QUERY SELECT 
      false AS allowed,
      format('Daily %s limit exceeded (%s/%s)', model_type, v_daily_used, v_daily_limit) AS reason,
      v_daily_limit,
      v_daily_used,
      v_quota.monthly_cost_limit_cents,
      v_monthly_usage.total_cost_cents;
    RETURN;
  END IF;
  
  -- Check if monthly cost limit exceeded
  IF v_quota.enforce_limits AND v_monthly_usage.total_cost_cents >= v_quota.monthly_cost_limit_cents THEN
    RETURN QUERY SELECT 
      false AS allowed,
      format('Monthly cost limit exceeded ($%s/$%s)', 
        (v_monthly_usage.total_cost_cents::FLOAT / 100)::TEXT, 
        (v_quota.monthly_cost_limit_cents::FLOAT / 100)::TEXT
      ) AS reason,
      v_daily_limit,
      v_daily_used,
      v_quota.monthly_cost_limit_cents,
      v_monthly_usage.total_cost_cents;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true AS allowed,
    NULL::TEXT AS reason,
    v_daily_limit,
    v_daily_used,
    v_quota.monthly_cost_limit_cents,
    v_monthly_usage.total_cost_cents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_usage_daily_updated_at
  BEFORE UPDATE ON ai_usage_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_usage_updated_at();

CREATE TRIGGER ai_quota_updated_at
  BEFORE UPDATE ON ai_quota
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_usage_updated_at();

-- Insert default quotas for existing organizations
INSERT INTO ai_quota (organization_id, created_by)
SELECT id, NULL
FROM organizations
WHERE id NOT IN (SELECT organization_id FROM ai_quota)
ON CONFLICT (organization_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE ai_usage_daily IS 'Daily AI usage aggregates per organization for cost tracking';
COMMENT ON TABLE ai_quota IS 'AI quota configuration and limits per organization';
COMMENT ON FUNCTION get_monthly_ai_usage IS 'Get aggregated AI usage for current month';
COMMENT ON FUNCTION check_ai_quota IS 'Check if organization has exceeded AI quota limits';
