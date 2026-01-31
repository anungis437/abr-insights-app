-- Evidence Bundle PDFs Table
-- Stores metadata for server-generated PDF evidence bundles with immutable storage
-- Note: Separate from evidence_bundles table which tracks logical evidence collections

CREATE TABLE IF NOT EXISTS evidence_bundle_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit trail
  CONSTRAINT evidence_bundle_pdfs_unique_path UNIQUE(storage_path)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_pdfs_case ON evidence_bundle_pdfs(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_pdfs_creator ON evidence_bundle_pdfs(created_by);
CREATE INDEX IF NOT EXISTS idx_evidence_bundle_pdfs_created_at ON evidence_bundle_pdfs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE evidence_bundle_pdfs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view PDF bundles from their organization
CREATE POLICY "Users can view their org's evidence PDF bundles"
  ON evidence_bundle_pdfs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
        AND p1.organization_id = (
          SELECT p2.organization_id 
          FROM profiles p2 
          WHERE p2.id = evidence_bundle_pdfs.created_by
        )
    )
  );

-- RLS Policy: Authenticated users can create PDF bundles
CREATE POLICY "Authenticated users can create evidence PDF bundles"
  ON evidence_bundle_pdfs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Function to increment access count
CREATE OR REPLACE FUNCTION increment_bundle_pdf_access(bundle_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE evidence_bundle_pdfs
  SET 
    accessed_count = accessed_count + 1,
    last_accessed_at = NOW()
  WHERE id = bundle_id;
END;
$$;

-- Storage bucket configuration (to be created manually in Supabase Dashboard)
-- Bucket name: evidence-bundle-pdfs
-- Public: No
-- File size limit: 50 MB
-- Allowed MIME types: application/pdf, application/zip

COMMENT ON TABLE evidence_bundle_pdfs IS 'Tracks server-generated PDF evidence bundles with immutable storage in Supabase Storage';
COMMENT ON COLUMN evidence_bundle_pdfs.checksum IS 'SHA-256 checksum for integrity verification';
COMMENT ON COLUMN evidence_bundle_pdfs.metadata IS 'Additional metadata: includeAttachments, generationOptions, etc.';
