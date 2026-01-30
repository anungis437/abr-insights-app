-- Evidence Bundle System
-- Comprehensive compliance evidence packages combining tribunal cases, training, policies, and audits

-- Main evidence bundles table
CREATE TABLE IF NOT EXISTS evidence_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bundle_name TEXT NOT NULL,
  bundle_type TEXT NOT NULL CHECK (bundle_type IN ('incident_response', 'audit_compliance', 'policy_review', 'training_validation', 'custom')),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ
);

-- Bundle components (what's included in the bundle)
CREATE TABLE IF NOT EXISTS evidence_bundle_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES evidence_bundles(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK (component_type IN ('tribunal_case', 'training_record', 'policy_document', 'audit_log', 'certificate', 'quiz_result')),
  component_id TEXT NOT NULL,
  component_title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  included_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policy mappings (linking tribunal cases to training and policies)
CREATE TABLE IF NOT EXISTS evidence_bundle_policy_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES evidence_bundles(id) ON DELETE CASCADE,
  tribunal_case_id TEXT,
  tribunal_case_title TEXT,
  related_training_id TEXT,
  related_training_title TEXT,
  policy_reference TEXT NOT NULL,
  policy_title TEXT NOT NULL,
  mapping_rationale TEXT,
  compliance_status TEXT NOT NULL DEFAULT 'under_review' CHECK (compliance_status IN ('compliant', 'non_compliant', 'under_review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timeline events (chain of evidence)
CREATE TABLE IF NOT EXISTS evidence_bundle_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES evidence_bundles(id) ON DELETE CASCADE,
  event_date TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('incident', 'training_completed', 'policy_updated', 'audit_conducted', 'tribunal_decision', 'remediation')),
  event_title TEXT NOT NULL,
  event_description TEXT,
  related_component_id TEXT,
  related_component_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_bundles_org ON evidence_bundles(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_bundles_status ON evidence_bundles(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_components_bundle ON evidence_bundle_components(bundle_id);
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_policy_mappings_bundle ON evidence_bundle_policy_mappings(bundle_id);
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_timeline_bundle ON evidence_bundle_timeline(bundle_id, event_date);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_evidence_bundle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evidence_bundles_updated_at
  BEFORE UPDATE ON evidence_bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_bundle_updated_at();

-- RLS Policies
ALTER TABLE evidence_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_bundle_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_bundle_policy_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_bundle_timeline ENABLE ROW LEVEL SECURITY;

-- Users can view evidence bundles from their organization
CREATE POLICY "Users can view evidence bundles from their organization"
  ON evidence_bundles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create evidence bundles for their organization
CREATE POLICY "Users can create evidence bundles for their organization"
  ON evidence_bundles
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can update their own evidence bundles
CREATE POLICY "Users can update their own evidence bundles"
  ON evidence_bundles
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can delete their own draft evidence bundles
CREATE POLICY "Users can delete their own draft evidence bundles"
  ON evidence_bundles
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
    AND status = 'draft'
  );

-- Component policies (inherit from bundle)
CREATE POLICY "Users can view components from their organization bundles"
  ON evidence_bundle_components
  FOR SELECT
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage components for their bundles"
  ON evidence_bundle_components
  FOR ALL
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles 
      WHERE created_by = auth.uid()
      AND status = 'draft'
    )
  );

-- Policy mapping policies
CREATE POLICY "Users can view policy mappings from their organization bundles"
  ON evidence_bundle_policy_mappings
  FOR SELECT
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage policy mappings for their bundles"
  ON evidence_bundle_policy_mappings
  FOR ALL
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles 
      WHERE created_by = auth.uid()
      AND status = 'draft'
    )
  );

-- Timeline policies
CREATE POLICY "Users can view timeline from their organization bundles"
  ON evidence_bundle_timeline
  FOR SELECT
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage timeline for their bundles"
  ON evidence_bundle_timeline
  FOR ALL
  USING (
    bundle_id IN (
      SELECT id FROM evidence_bundles 
      WHERE created_by = auth.uid()
      AND status = 'draft'
    )
  );

COMMENT ON TABLE evidence_bundles IS 'Comprehensive compliance evidence packages combining cases, training, policies, and audits';
COMMENT ON TABLE evidence_bundle_components IS 'Individual components included in evidence bundles';
COMMENT ON TABLE evidence_bundle_policy_mappings IS 'Mappings between tribunal cases, training, and organizational policies';
COMMENT ON TABLE evidence_bundle_timeline IS 'Chronological chain of evidence events for compliance demonstration';
