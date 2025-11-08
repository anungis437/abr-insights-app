-- Create embeddings tables for semantic search
-- Migration: 20250108000002_create_embeddings_tables.sql
-- Description: Creates case_embeddings and course_embeddings tables with HNSW indexes

-- =====================================================
-- Case Embeddings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS case_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  
  -- Embedding vector (1536 dimensions for text-embedding-3-large)
  embedding vector(1536) NOT NULL,
  
  -- Metadata for tracking and debugging
  model_version VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-large',
  embedding_type VARCHAR(50) NOT NULL DEFAULT 'full_text', -- 'full_text', 'summary', 'title_only'
  token_count INTEGER,
  
  -- Source text hash for change detection
  content_hash VARCHAR(64) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one embedding per case per type
  UNIQUE(case_id, embedding_type)
);

-- Create HNSW index for fast approximate nearest neighbor search
-- HNSW parameters:
-- - m: max number of connections per node (16 is default, good balance)
-- - ef_construction: size of dynamic candidate list for construction (64 is default)
CREATE INDEX IF NOT EXISTS case_embeddings_hnsw_idx 
ON case_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Regular indexes for filtering
CREATE INDEX IF NOT EXISTS case_embeddings_case_id_idx ON case_embeddings(case_id);
CREATE INDEX IF NOT EXISTS case_embeddings_model_version_idx ON case_embeddings(model_version);
CREATE INDEX IF NOT EXISTS case_embeddings_created_at_idx ON case_embeddings(created_at DESC);

-- Enable RLS
ALTER TABLE case_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "case_embeddings_select_policy" 
ON case_embeddings FOR SELECT 
USING (true); -- Public read access for similarity search

CREATE POLICY "case_embeddings_insert_policy" 
ON case_embeddings FOR INSERT 
WITH CHECK (auth.role() = '.*'); -- Only service role can insert

CREATE POLICY "case_embeddings_update_policy" 
ON case_embeddings FOR UPDATE 
USING (auth.role() = '.*'); -- Only service role can update

CREATE POLICY "case_embeddings_delete_policy" 
ON case_embeddings FOR DELETE 
USING (auth.role() = '.*'); -- Only service role can delete

-- =====================================================
-- Course Embeddings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS course_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Embedding vector (1536 dimensions for text-embedding-3-large)
  embedding vector(1536) NOT NULL,
  
  -- Metadata
  model_version VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-large',
  embedding_type VARCHAR(50) NOT NULL DEFAULT 'full_content', -- 'full_content', 'description', 'objectives'
  token_count INTEGER,
  
  -- Source content hash
  content_hash VARCHAR(64) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(course_id, embedding_type)
);

-- HNSW index for course similarity search
CREATE INDEX IF NOT EXISTS course_embeddings_hnsw_idx 
ON course_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Regular indexes
CREATE INDEX IF NOT EXISTS course_embeddings_course_id_idx ON course_embeddings(course_id);
CREATE INDEX IF NOT EXISTS course_embeddings_model_version_idx ON course_embeddings(model_version);
CREATE INDEX IF NOT EXISTS course_embeddings_created_at_idx ON course_embeddings(created_at DESC);

-- Enable RLS
ALTER TABLE course_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "course_embeddings_select_policy" 
ON course_embeddings FOR SELECT 
USING (true); -- Public read access

CREATE POLICY "course_embeddings_insert_policy" 
ON course_embeddings FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "course_embeddings_update_policy" 
ON course_embeddings FOR UPDATE 
USING (auth.role() = '.*');

CREATE POLICY "course_embeddings_delete_policy" 
ON course_embeddings FOR DELETE 
USING (auth.role() = '.*');

-- =====================================================
-- Lesson Embeddings Table (for granular content matching)
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Embedding vector
  embedding vector(1536) NOT NULL,
  
  -- Metadata
  model_version VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-large',
  embedding_type VARCHAR(50) NOT NULL DEFAULT 'full_content',
  token_count INTEGER,
  
  -- Source content hash
  content_hash VARCHAR(64) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lesson_id, embedding_type)
);

-- HNSW index
CREATE INDEX IF NOT EXISTS lesson_embeddings_hnsw_idx 
ON lesson_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Regular indexes
CREATE INDEX IF NOT EXISTS lesson_embeddings_lesson_id_idx ON lesson_embeddings(lesson_id);
CREATE INDEX IF NOT EXISTS lesson_embeddings_created_at_idx ON lesson_embeddings(created_at DESC);

-- Enable RLS
ALTER TABLE lesson_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "lesson_embeddings_select_policy" 
ON lesson_embeddings FOR SELECT 
USING (true);

CREATE POLICY "lesson_embeddings_insert_policy" 
ON lesson_embeddings FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "lesson_embeddings_update_policy" 
ON lesson_embeddings FOR UPDATE 
USING (auth.role() = '.*');

CREATE POLICY "lesson_embeddings_delete_policy" 
ON lesson_embeddings FOR DELETE 
USING (auth.role() = '.*');

-- =====================================================
-- Embedding Generation Jobs Table (for tracking batch operations)
-- =====================================================
CREATE TABLE IF NOT EXISTS embedding_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job details
  job_type VARCHAR(50) NOT NULL, -- 'case_embeddings', 'course_embeddings', 'lesson_embeddings'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  
  -- Progress tracking
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  
  -- Configuration
  model_version VARCHAR(50) NOT NULL DEFAULT 'text-embedding-3-large',
  batch_size INTEGER NOT NULL DEFAULT 100,
  
  -- Results
  error_log JSONB,
  metrics JSONB, -- {avg_tokens, total_tokens, duration_seconds, items_per_second}
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS embedding_jobs_status_idx ON embedding_jobs(status);
CREATE INDEX IF NOT EXISTS embedding_jobs_job_type_idx ON embedding_jobs(job_type);
CREATE INDEX IF NOT EXISTS embedding_jobs_created_at_idx ON embedding_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE embedding_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "embedding_jobs_select_policy" 
ON embedding_jobs FOR SELECT 
USING (auth.role() IN ('.*', 'authenticated'));

CREATE POLICY "embedding_jobs_insert_policy" 
ON embedding_jobs FOR INSERT 
WITH CHECK (auth.role() = '.*');

CREATE POLICY "embedding_jobs_update_policy" 
ON embedding_jobs FOR UPDATE 
USING (auth.role() = '.*');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER case_embeddings_updated_at_trigger
BEFORE UPDATE ON case_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

CREATE TRIGGER course_embeddings_updated_at_trigger
BEFORE UPDATE ON course_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

CREATE TRIGGER lesson_embeddings_updated_at_trigger
BEFORE UPDATE ON lesson_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_embeddings_updated_at();

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE case_embeddings IS 'Vector embeddings for tribunal cases enabling semantic similarity search';
COMMENT ON TABLE course_embeddings IS 'Vector embeddings for courses enabling intelligent recommendations';
COMMENT ON TABLE lesson_embeddings IS 'Vector embeddings for individual lessons for granular content matching';
COMMENT ON TABLE embedding_jobs IS 'Tracks batch embedding generation jobs with progress and metrics';
COMMENT ON COLUMN case_embeddings.embedding IS '1536-dimensional vector from Azure OpenAI text-embedding-3-large';
COMMENT ON COLUMN case_embeddings.content_hash IS 'SHA-256 hash of source text for change detection';
COMMENT ON INDEX case_embeddings_hnsw_idx IS 'HNSW index for fast approximate nearest neighbor search using cosine similarity';
