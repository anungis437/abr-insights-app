-- Enable required PostgreSQL extensions
-- Run this in Supabase SQL Editor if extensions are not enabled

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions  
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Vector similarity search (for AI embeddings)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify extensions
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector');
