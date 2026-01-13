-- Migration: Add AI usage logging table
-- Description: Tracks all AI endpoint calls for cost attribution, audit trail, and governance
-- Date: 2026-01-13

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- 'chat', 'coach', 'embeddings-generate', etc.
  session_type TEXT, -- For coach endpoint
  operation_type TEXT, -- For embeddings: 'cases' or 'courses'
  embedding_type TEXT, -- Type of embedding generated
  batch_size INTEGER, -- For batch operations
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  model TEXT, -- Model used (e.g., 'gpt-4o', 'text-embedding-3-large')
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add indexes for common queries
  CONSTRAINT ai_usage_logs_endpoint_check CHECK (
    endpoint IN ('chat', 'coach', 'embeddings-generate', 'embeddings-search', 'feedback', 'automation', 'training-jobs')
  )
);

-- Add indexes for performance
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_organization_id ON public.ai_usage_logs(organization_id);
CREATE INDEX idx_ai_usage_logs_endpoint ON public.ai_usage_logs(endpoint);
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_logs_org_created ON public.ai_usage_logs(organization_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AI usage
CREATE POLICY ai_usage_logs_select_own
  ON public.ai_usage_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Org admins can view all usage in their org
CREATE POLICY ai_usage_logs_select_org_admin
  ON public.ai_usage_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.slug IN ('org_admin', 'super_admin')
    )
  );

-- Policy: System can insert (service role only)
CREATE POLICY ai_usage_logs_insert_service
  ON public.ai_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.ai_usage_logs IS 
  'Tracks all AI endpoint usage for cost attribution, audit trail, and governance';

COMMENT ON COLUMN public.ai_usage_logs.endpoint IS 
  'The AI endpoint called: chat, coach, embeddings-generate, etc.';

COMMENT ON COLUMN public.ai_usage_logs.total_tokens IS 
  'Total tokens consumed (prompt + completion) for cost tracking';

COMMENT ON COLUMN public.ai_usage_logs.model IS 
  'Azure OpenAI model used (e.g., gpt-4o, text-embedding-3-large)';

-- Create view for usage analytics
CREATE OR REPLACE VIEW public.ai_usage_analytics AS
SELECT
  organization_id,
  endpoint,
  DATE(created_at) as usage_date,
  COUNT(*) as request_count,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  SUM(total_tokens) as total_tokens,
  AVG(total_tokens) as avg_tokens_per_request,
  -- Approximate cost calculation (adjust rates as needed)
  -- GPT-4o: $0.01/1K prompt tokens, $0.03/1K completion tokens
  ROUND(
    (SUM(prompt_tokens)::DECIMAL / 1000 * 0.01) +
    (SUM(completion_tokens)::DECIMAL / 1000 * 0.03),
    4
  ) as estimated_cost_usd
FROM public.ai_usage_logs
WHERE model LIKE '%gpt%'
GROUP BY organization_id, endpoint, DATE(created_at)
ORDER BY usage_date DESC, organization_id, endpoint;

COMMENT ON VIEW public.ai_usage_analytics IS 
  'Aggregated AI usage statistics per organization, endpoint, and day with cost estimates';

-- Grant permissions
GRANT SELECT ON public.ai_usage_analytics TO authenticated;
