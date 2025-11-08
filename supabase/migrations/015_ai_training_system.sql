-- Migration: AI Training System
-- Description: Tables for managing AI model fine-tuning, classification feedback, and automated training
-- Created: 2024-11-07

-- Classification Feedback Table
-- Stores user feedback on AI classification results for model improvement
CREATE TABLE IF NOT EXISTS classification_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Case Information
  case_id UUID REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  case_title TEXT NOT NULL,
  case_text_excerpt TEXT NOT NULL,
  
  -- AI Classification (what the model predicted)
  ai_classification JSONB NOT NULL,
  
  -- Manual Classification (what the human corrected it to)
  manual_classification JSONB NOT NULL,
  
  -- Feedback Metadata
  quality_score INTEGER DEFAULT 3 CHECK (quality_score BETWEEN 1 AND 5),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_date TIMESTAMPTZ DEFAULT now(),
  
  -- Training Status
  used_for_training BOOLEAN DEFAULT false,
  training_batch_id UUID, -- References training_jobs(id), but not a FK to allow deletion
  
  -- Notes
  feedback_notes TEXT
);

-- Training Jobs Table
-- Tracks OpenAI fine-tuning jobs and their status
CREATE TABLE IF NOT EXISTS training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Job Identification
  job_name TEXT NOT NULL,
  version TEXT NOT NULL, -- e.g., v1.0.0, v2.1.0
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'running', 'succeeded', 'failed', 'cancelled')),
  
  -- Provider Information
  provider TEXT DEFAULT 'openai' CHECK (provider IN ('openai', 'anthropic', 'azure')),
  provider_job_id TEXT, -- OpenAI's job ID
  base_model TEXT NOT NULL,
  fine_tuned_model TEXT, -- The resulting model ID after training
  
  -- Training Data
  feedback_count INTEGER NOT NULL,
  feedback_ids UUID[] NOT NULL,
  training_data_url TEXT NOT NULL,
  validation_data_url TEXT,
  
  -- Hyperparameters
  hyperparameters JSONB NOT NULL DEFAULT '{
    "n_epochs": 3,
    "batch_size": 8,
    "learning_rate_multiplier": 1.0
  }'::jsonb,
  
  -- Training Progress
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  training_log JSONB[] DEFAULT ARRAY[]::JSONB[],
  
  -- Metrics
  training_metrics JSONB DEFAULT '{}'::jsonb,
  validation_metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Deployment
  is_deployed BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  deployed_by UUID REFERENCES profiles(id),
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  notes TEXT,
  error_message TEXT
);

-- Automated Training Configuration Table
-- Stores schedules and rules for automatic model retraining
CREATE TABLE IF NOT EXISTS automated_training_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Configuration Name
  config_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Schedule
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'threshold')),
  schedule_day_of_week INTEGER CHECK (schedule_day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  schedule_day_of_month INTEGER CHECK (schedule_day_of_month BETWEEN 1 AND 31),
  schedule_hour INTEGER DEFAULT 2 CHECK (schedule_hour BETWEEN 0 AND 23),
  
  -- Thresholds
  feedback_threshold INTEGER DEFAULT 50, -- Min feedback records before training
  min_quality_score INTEGER DEFAULT 3 CHECK (min_quality_score BETWEEN 1 AND 5),
  
  -- Training Configuration
  base_model TEXT NOT NULL,
  hyperparameters JSONB NOT NULL DEFAULT '{
    "n_epochs": 3,
    "batch_size": 8,
    "learning_rate_multiplier": 1.0
  }'::jsonb,
  
  -- Deployment Options
  auto_deploy BOOLEAN DEFAULT false,
  min_validation_accuracy NUMERIC(5,4) DEFAULT 0.85 CHECK (min_validation_accuracy BETWEEN 0 AND 1),
  
  -- Notifications
  notification_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  last_run_at TIMESTAMPTZ,
  last_run_job_id UUID, -- References training_jobs(id)
  next_run_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classification_feedback_case_id ON classification_feedback(case_id);
CREATE INDEX IF NOT EXISTS idx_classification_feedback_used_for_training ON classification_feedback(used_for_training);
CREATE INDEX IF NOT EXISTS idx_classification_feedback_quality_score ON classification_feedback(quality_score);
CREATE INDEX IF NOT EXISTS idx_classification_feedback_training_batch ON classification_feedback(training_batch_id);

CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created_at ON training_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_jobs_is_deployed ON training_jobs(is_deployed);
CREATE INDEX IF NOT EXISTS idx_training_jobs_provider_job_id ON training_jobs(provider_job_id);

CREATE INDEX IF NOT EXISTS idx_automated_training_is_enabled ON automated_training_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_automated_training_next_run ON automated_training_config(next_run_at);

-- RLS Policies (Admin-only access)
ALTER TABLE classification_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_training_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all classification feedback" ON classification_feedback;
DROP POLICY IF EXISTS "Admins can insert classification feedback" ON classification_feedback;
DROP POLICY IF EXISTS "Admins can update classification feedback" ON classification_feedback;
DROP POLICY IF EXISTS "Admins can view all training jobs" ON training_jobs;
DROP POLICY IF EXISTS "Admins can insert training jobs" ON training_jobs;
DROP POLICY IF EXISTS "Admins can update training jobs" ON training_jobs;
DROP POLICY IF EXISTS "Admins can view all automation configs" ON automated_training_config;
DROP POLICY IF EXISTS "Admins can insert automation configs" ON automated_training_config;
DROP POLICY IF EXISTS "Admins can update automation configs" ON automated_training_config;
DROP POLICY IF EXISTS "Admins can delete automation configs" ON automated_training_config;

-- Only admins can view classification feedback
CREATE POLICY "Admins can view all classification feedback"
  ON classification_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can insert classification feedback
CREATE POLICY "Admins can insert classification feedback"
  ON classification_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can update classification feedback
CREATE POLICY "Admins can update classification feedback"
  ON classification_feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can view training jobs
CREATE POLICY "Admins can view all training jobs"
  ON training_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can insert training jobs
CREATE POLICY "Admins can insert training jobs"
  ON training_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can update training jobs
CREATE POLICY "Admins can update training jobs"
  ON training_jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can view automation configs
CREATE POLICY "Admins can view all automation configs"
  ON automated_training_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can insert automation configs
CREATE POLICY "Admins can insert automation configs"
  ON automated_training_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can update automation configs
CREATE POLICY "Admins can update automation configs"
  ON automated_training_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Only admins can delete automation configs
CREATE POLICY "Admins can delete automation configs"
  ON automated_training_config FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'compliance_officer', 'org_admin')
    )
  );

-- Update triggers
DROP TRIGGER IF EXISTS update_classification_feedback_updated_at ON classification_feedback;
CREATE TRIGGER update_classification_feedback_updated_at
  BEFORE UPDATE ON classification_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_jobs_updated_at ON training_jobs;
CREATE TRIGGER update_training_jobs_updated_at
  BEFORE UPDATE ON training_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automated_training_config_updated_at ON automated_training_config;
CREATE TRIGGER update_automated_training_config_updated_at
  BEFORE UPDATE ON automated_training_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE classification_feedback IS 'User feedback on AI classification results for model improvement';
COMMENT ON TABLE training_jobs IS 'Tracks OpenAI fine-tuning jobs and their status';
COMMENT ON TABLE automated_training_config IS 'Configuration for automated model retraining schedules';



