-- ============================================================================
-- Increase case_number field length
-- Migration: 20260205000001_increase_case_number_length.sql
-- Purpose: Fix "value too long" errors for case_number field
-- Date: February 5, 2026
-- ============================================================================

-- Increase case_number from VARCHAR(100) to VARCHAR(255)
-- This fixes errors like: "value too long for type character varying(100)"
-- Some tribunal case numbers exceed 100 characters

ALTER TABLE tribunal_cases_raw 
  ALTER COLUMN case_number TYPE VARCHAR(255);

-- Also update the main tribunal_cases table if it exists
ALTER TABLE tribunal_cases 
  ALTER COLUMN case_number TYPE VARCHAR(255);

-- Add index on case_number if not exists (for better query performance)
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_case_number 
  ON tribunal_cases_raw(case_number);

CREATE INDEX IF NOT EXISTS idx_tribunal_cases_case_number 
  ON tribunal_cases(case_number);
