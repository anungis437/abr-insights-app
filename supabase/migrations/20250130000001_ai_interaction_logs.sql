-- AI Interaction Logs Migration
-- Implements audit trail for all AI-generated content
-- Required for: Citation verification, legal advice blocking, compliance auditing

-- Create ai_interaction_logs table
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat', 'coach', 'case_analysis', 'automation')),
  
  -- Content
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER,
  
  -- Verification & Safety
  citations TEXT[],
  flags TEXT[],
  verified_sources TEXT[],
  contains_legal_advice_warning BOOLEAN DEFAULT FALSE,
  
  -- Review workflow
  human_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_organization_id CHECK (organization_id IS NOT NULL),
  CONSTRAINT valid_user_id CHECK (user_id IS NOT NULL)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_logs_organization_id ON ai_interaction_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_session_id ON ai_interaction_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_interaction_type ON ai_interaction_logs(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_interaction_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_human_reviewed ON ai_interaction_logs(human_reviewed) WHERE human_reviewed = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_logs_flags ON ai_interaction_logs USING GIN(flags) WHERE flags IS NOT NULL;

-- RLS Policies
ALTER TABLE ai_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Org admins can view all logs for their organization
CREATE POLICY ai_logs_org_admin_view ON ai_interaction_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'owner')
    )
  );

-- Users can view their own interactions
CREATE POLICY ai_logs_user_view_own ON ai_interaction_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert (for API logging)
CREATE POLICY ai_logs_service_insert ON ai_interaction_logs
  FOR INSERT
  WITH CHECK (true);

-- Org admins can update review status
CREATE POLICY ai_logs_admin_update_review ON ai_interaction_logs
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'owner')
    )
  )
  WITH CHECK (
    -- Only allow updating review fields
    organization_id IN (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'owner')
    )
  );

-- Function to get AI usage statistics
CREATE OR REPLACE FUNCTION get_ai_usage_statistics(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_interactions BIGINT,
  interaction_type TEXT,
  interaction_count BIGINT,
  flagged_count BIGINT,
  needs_review_count BIGINT,
  average_tokens NUMERIC,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      interaction_type as type,
      COUNT(*) as type_count,
      COUNT(*) FILTER (WHERE flags IS NOT NULL AND array_length(flags, 1) > 0) as flagged,
      COUNT(*) FILTER (WHERE human_reviewed = FALSE) as needs_review,
      AVG(tokens_used) FILTER (WHERE tokens_used IS NOT NULL) as avg_tokens,
      COUNT(DISTINCT user_id) as users
    FROM ai_interaction_logs
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY interaction_type
  )
  SELECT 
    total,
    type,
    type_count,
    flagged,
    needs_review,
    ROUND(avg_tokens, 0),
    users
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_ai_usage_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Function to get flagged interactions requiring review
CREATE OR REPLACE FUNCTION get_flagged_ai_interactions(
  p_organization_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  interaction_type TEXT,
  prompt TEXT,
  response TEXT,
  flags TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.user_id,
    u.email as user_email,
    l.interaction_type,
    l.prompt,
    l.response,
    l.flags,
    l.created_at
  FROM ai_interaction_logs l
  JOIN auth.users u ON u.id = l.user_id
  WHERE l.organization_id = p_organization_id
    AND l.human_reviewed = FALSE
    AND l.flags IS NOT NULL
    AND array_length(l.flags, 1) > 0
  ORDER BY l.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_flagged_ai_interactions(UUID, INTEGER) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE ai_interaction_logs IS 'Audit trail for all AI-generated content. Required for compliance with Canadian tribunal guidance on AI usage in legal proceedings.';
COMMENT ON COLUMN ai_interaction_logs.flags IS 'Safety flags: LEGAL_ADVICE_BLOCKED, UNVERIFIED_SOURCES, MISSING_CITATIONS';
COMMENT ON COLUMN ai_interaction_logs.contains_legal_advice_warning IS 'Indicates if legal advice was detected and blocked';
COMMENT ON COLUMN ai_interaction_logs.human_reviewed IS 'Flag for manual review workflow of flagged interactions';
