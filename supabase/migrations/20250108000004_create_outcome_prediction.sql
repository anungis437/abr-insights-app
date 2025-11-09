-- Outcome prediction tables and functions
-- Migration: 20250108000004_create_outcome_prediction.sql
-- Description: Creates tables and functions for tribunal case outcome prediction ML model

-- =====================================================
-- Case Outcomes Table (Training Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS case_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  
  -- Outcome classification
  outcome_type VARCHAR(100) NOT NULL, -- 'upheld', 'dismissed', 'partially_upheld', 'settled', 'withdrawn'
  outcome_confidence FLOAT, -- Confidence in outcome classification (0-1)
  
  -- Remedies awarded
  remedies_awarded JSONB, -- {monetary: true, non_monetary: true, reinstatement: false, ...}
  monetary_amount DECIMAL(12, 2),
  
  -- Case characteristics (features for ML model)
  discrimination_grounds TEXT[],
  case_complexity VARCHAR(50), -- 'simple', 'moderate', 'complex'
  evidence_strength VARCHAR(50), -- 'weak', 'moderate', 'strong'
  legal_representation BOOLEAN,
  respondent_type VARCHAR(100), -- 'employer', 'landlord', 'service_provider', etc.
  
  -- Metadata
  decision_date DATE,
  tribunal_name VARCHAR(255),
  adjudicator_name VARCHAR(255),
  
  -- ML features (engineered)
  features JSONB, -- Additional computed features for ML model
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(case_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS case_outcomes_outcome_type_idx ON case_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS case_outcomes_tribunal_name_idx ON case_outcomes(tribunal_name);
CREATE INDEX IF NOT EXISTS case_outcomes_decision_date_idx ON case_outcomes(decision_date DESC);
CREATE INDEX IF NOT EXISTS case_outcomes_discrimination_grounds_idx ON case_outcomes USING GIN(discrimination_grounds);

-- Enable RLS
ALTER TABLE case_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "case_outcomes_select_policy" 
ON case_outcomes FOR SELECT 
USING (true); -- Public read

CREATE POLICY "case_outcomes_insert_policy" 
ON case_outcomes FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "case_outcomes_update_policy" 
ON case_outcomes FOR UPDATE 
USING (auth.role() = '.*');

-- =====================================================
-- Outcome Predictions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS outcome_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  
  -- Prediction results
  predicted_outcome VARCHAR(100) NOT NULL, -- 'upheld', 'dismissed', etc.
  confidence_score FLOAT NOT NULL, -- Overall confidence (0-1)
  
  -- Probability distribution across outcomes
  outcome_probabilities JSONB NOT NULL, -- {upheld: 0.65, dismissed: 0.25, ...}
  
  -- Remedy predictions
  predicted_remedies JSONB, -- {monetary: 0.8, reinstatement: 0.3, ...}
  estimated_monetary_range JSONB, -- {min: 5000, max: 25000, median: 12000}
  
  -- Model information
  model_version VARCHAR(50) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'statistical', 'ensemble', 'neural_network'
  
  -- Features used
  input_features JSONB,
  feature_importance JSONB, -- Which features most influenced prediction
  
  -- Explanation
  explanation TEXT, -- Human-readable explanation of prediction
  similar_cases JSONB, -- Array of similar case IDs used as precedents
  
  -- Validation
  actual_outcome VARCHAR(100), -- Filled in after case decision
  prediction_accuracy FLOAT, -- How accurate was prediction
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  
  UNIQUE(case_id, model_version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS outcome_predictions_case_id_idx ON outcome_predictions(case_id);
CREATE INDEX IF NOT EXISTS outcome_predictions_predicted_outcome_idx ON outcome_predictions(predicted_outcome);
CREATE INDEX IF NOT EXISTS outcome_predictions_confidence_score_idx ON outcome_predictions(confidence_score DESC);
CREATE INDEX IF NOT EXISTS outcome_predictions_model_version_idx ON outcome_predictions(model_version);
CREATE INDEX IF NOT EXISTS outcome_predictions_created_at_idx ON outcome_predictions(created_at DESC);

-- Enable RLS
ALTER TABLE outcome_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "outcome_predictions_select_policy" 
ON outcome_predictions FOR SELECT 
USING (true);

CREATE POLICY "outcome_predictions_insert_policy" 
ON outcome_predictions FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "outcome_predictions_update_policy" 
ON outcome_predictions FOR UPDATE 
USING (auth.role() = '.*');

-- =====================================================
-- Prediction Models Table (Model Registry)
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Model details
  model_version VARCHAR(50) NOT NULL UNIQUE,
  model_name VARCHAR(255) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'statistical', 'ensemble', 'neural_network'
  
  -- Training information
  training_data_size INTEGER,
  training_date TIMESTAMPTZ,
  training_duration_seconds INTEGER,
  
  -- Performance metrics
  accuracy FLOAT,
  precision_score FLOAT,  -- Renamed from 'precision' to avoid SQL keyword conflict
  recall FLOAT,
  f1_score FLOAT,
  auc_roc FLOAT,
  
  -- Cross-validation results
  cv_scores JSONB, -- {fold_1: 0.85, fold_2: 0.87, ...}
  
  -- Confusion matrix
  confusion_matrix JSONB,
  
  -- Feature importance
  feature_weights JSONB,
  
  -- Model configuration
  hyperparameters JSONB,
  features_used TEXT[],
  
  -- Deployment status
  is_deployed BOOLEAN DEFAULT false,
  deployed_at TIMESTAMPTZ,
  deployment_notes TEXT,
  
  -- Model artifacts
  model_storage_path TEXT, -- Path to saved model file
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS prediction_models_model_version_idx ON prediction_models(model_version);
CREATE INDEX IF NOT EXISTS prediction_models_is_deployed_idx ON prediction_models(is_deployed);
CREATE INDEX IF NOT EXISTS prediction_models_accuracy_idx ON prediction_models(accuracy DESC);

-- Enable RLS
ALTER TABLE prediction_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "prediction_models_select_policy" 
ON prediction_models FOR SELECT 
USING (true);

CREATE POLICY "prediction_models_insert_policy" 
ON prediction_models FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "prediction_models_update_policy" 
ON prediction_models FOR UPDATE 
USING (auth.role() = '.*');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Get outcome statistics by tribunal
CREATE OR REPLACE FUNCTION get_outcome_statistics_by_tribunal(
  tribunal_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  tribunal_name TEXT,
  total_cases BIGINT,
  upheld_count BIGINT,
  dismissed_count BIGINT,
  partially_upheld_count BIGINT,
  settled_count BIGINT,
  upheld_percentage NUMERIC,
  avg_monetary_award NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    co.tribunal_name,
    COUNT(*) AS total_cases,
    COUNT(*) FILTER (WHERE co.outcome_type = 'upheld') AS upheld_count,
    COUNT(*) FILTER (WHERE co.outcome_type = 'dismissed') AS dismissed_count,
    COUNT(*) FILTER (WHERE co.outcome_type = 'partially_upheld') AS partially_upheld_count,
    COUNT(*) FILTER (WHERE co.outcome_type = 'settled') AS settled_count,
    ROUND((COUNT(*) FILTER (WHERE co.outcome_type = 'upheld')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS upheld_percentage,
    ROUND(AVG(co.monetary_amount) FILTER (WHERE co.monetary_amount IS NOT NULL), 2) AS avg_monetary_award
  FROM case_outcomes co
  WHERE tribunal_filter IS NULL OR co.tribunal_name = tribunal_filter
  GROUP BY co.tribunal_name
  ORDER BY total_cases DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get outcome statistics by discrimination ground
CREATE OR REPLACE FUNCTION get_outcome_statistics_by_ground()
RETURNS TABLE (
  discrimination_ground TEXT,
  total_cases BIGINT,
  upheld_count BIGINT,
  success_rate NUMERIC,
  avg_monetary_award NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(co.discrimination_grounds) AS discrimination_ground,
    COUNT(*) AS total_cases,
    COUNT(*) FILTER (WHERE co.outcome_type IN ('upheld', 'partially_upheld')) AS upheld_count,
    ROUND((COUNT(*) FILTER (WHERE co.outcome_type IN ('upheld', 'partially_upheld'))::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) AS success_rate,
    ROUND(AVG(co.monetary_amount) FILTER (WHERE co.monetary_amount IS NOT NULL), 2) AS avg_monetary_award
  FROM case_outcomes co
  GROUP BY discrimination_ground
  ORDER BY total_cases DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get prediction model performance comparison
CREATE OR REPLACE FUNCTION compare_prediction_models()
RETURNS TABLE (
  model_version TEXT,
  model_type TEXT,
  accuracy FLOAT,
  precision_score FLOAT,  -- Renamed to avoid SQL keyword conflict
  recall FLOAT,
  f1_score FLOAT,
  training_data_size INTEGER,
  is_deployed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.model_version::TEXT,
    pm.model_type::TEXT,
    pm.accuracy,
    pm.precision_score,
    pm.recall,
    pm.f1_score,
    pm.training_data_size,
    pm.is_deployed
  FROM prediction_models pm
  ORDER BY pm.accuracy DESC NULLS LAST, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Validate predictions against actual outcomes
CREATE OR REPLACE FUNCTION validate_predictions_accuracy()
RETURNS TABLE (
  model_version TEXT,
  total_predictions BIGINT,
  validated_predictions BIGINT,
  correct_predictions BIGINT,
  accuracy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.model_version::TEXT,
    COUNT(*) AS total_predictions,
    COUNT(*) FILTER (WHERE op.actual_outcome IS NOT NULL) AS validated_predictions,
    COUNT(*) FILTER (WHERE op.predicted_outcome = op.actual_outcome) AS correct_predictions,
    ROUND((COUNT(*) FILTER (WHERE op.predicted_outcome = op.actual_outcome)::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE op.actual_outcome IS NOT NULL), 0)) * 100, 2) AS accuracy_rate
  FROM outcome_predictions op
  GROUP BY op.model_version
  ORDER BY accuracy_rate DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Triggers
-- =====================================================

CREATE TRIGGER case_outcomes_updated_at_trigger
BEFORE UPDATE ON case_outcomes
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE case_outcomes IS 'Historical tribunal case outcomes used as training data for prediction models';
COMMENT ON TABLE outcome_predictions IS 'ML model predictions for tribunal case outcomes with confidence scores';
COMMENT ON TABLE prediction_models IS 'Registry of outcome prediction models with performance metrics';
COMMENT ON FUNCTION get_outcome_statistics_by_tribunal IS 'Returns outcome statistics aggregated by tribunal';
COMMENT ON FUNCTION get_outcome_statistics_by_ground IS 'Returns outcome statistics aggregated by discrimination ground';
COMMENT ON FUNCTION compare_prediction_models IS 'Compares performance metrics across different prediction models';
COMMENT ON FUNCTION validate_predictions_accuracy IS 'Validates prediction accuracy against actual case outcomes';
