-- Enable pgvector extension for vector similarity search
-- Migration: 20250108000001_enable_pgvector.sql
-- Description: Enables pgvector extension required for semantic search and embeddings

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
COMMENT ON EXTENSION vector IS 'Vector similarity search extension for embeddings';
