-- Risk Score History Tracking
-- Stores daily snapshots of department and organization risk scores for trend analysis

-- Department risk score history
CREATE TABLE IF NOT EXISTS risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  location TEXT,
  
  -- Risk metrics
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Contributing factors
  total_users INTEGER NOT NULL DEFAULT 0,
  training_completion_rate NUMERIC(5,4) NOT NULL CHECK (training_completion_rate >= 0 AND training_completion_rate <= 1),
  avg_quiz_score NUMERIC(5,2) NOT NULL CHECK (avg_quiz_score >= 0 AND avg_quiz_score <= 100),
  days_since_last_training INTEGER NOT NULL DEFAULT 0,
  pending_users INTEGER NOT NULL DEFAULT 0,
  at_risk_users INTEGER NOT NULL DEFAULT 0,
  
  -- Snapshot metadata
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one snapshot per department per day
  UNIQUE(organization_id, department, snapshot_date)
);

-- Organization-wide risk score history
CREATE TABLE IF NOT EXISTS organization_risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Overall risk metrics
  overall_risk_level TEXT NOT NULL CHECK (overall_risk_level IN ('low', 'medium', 'high', 'critical')),
  overall_risk_score NUMERIC(5,2) NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  
  -- Aggregated statistics
  total_departments INTEGER NOT NULL DEFAULT 0,
  high_risk_departments INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  compliant_users INTEGER NOT NULL DEFAULT 0,
  at_risk_users INTEGER NOT NULL DEFAULT 0,
  
  -- Snapshot metadata
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one snapshot per organization per day
  UNIQUE(organization_id, snapshot_date)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_risk_score_history_org_date 
  ON risk_score_history(organization_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_risk_score_history_dept 
  ON risk_score_history(organization_id, department, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_organization_risk_history_org_date 
  ON organization_risk_history(organization_id, snapshot_date DESC);

-- RLS Policies
ALTER TABLE risk_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_risk_history ENABLE ROW LEVEL SECURITY;

-- Users can view risk history for their organization
CREATE POLICY "Users can view risk history for their organization"
  ON risk_score_history
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view org risk history for their organization"
  ON organization_risk_history
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- System can insert risk history snapshots
CREATE POLICY "System can insert risk history"
  ON risk_score_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert org risk history"
  ON organization_risk_history
  FOR INSERT
  WITH CHECK (true);

-- Function to capture daily risk snapshot
CREATE OR REPLACE FUNCTION capture_daily_risk_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function would be called by a scheduled job (pg_cron or external)
  -- to capture daily risk scores for all organizations
  
  -- Implementation would call the risk calculation logic
  -- and insert snapshots into risk_score_history and organization_risk_history
  
  RAISE NOTICE 'Risk snapshot capture should be implemented via application logic';
END;
$$;

COMMENT ON TABLE risk_score_history IS 'Daily snapshots of department-level risk scores for trend analysis';
COMMENT ON TABLE organization_risk_history IS 'Daily snapshots of organization-wide risk metrics for trend analysis';
COMMENT ON FUNCTION capture_daily_risk_snapshot() IS 'Placeholder for daily risk snapshot capture - implement via application scheduler';
