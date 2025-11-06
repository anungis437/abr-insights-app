-- Migration: 000_enable_extensions.sql
-- Description: Enable required PostgreSQL extensions
-- Created: 2025-11-06
-- This must run first before any other migrations

-- Enable extensions (these are safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;
