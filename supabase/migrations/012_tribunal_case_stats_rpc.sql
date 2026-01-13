-- Migration: Tribunal Case Statistics RPC Function
-- Description: Creates a database function to efficiently calculate case statistics
-- Author: System
-- Date: 2024

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS get_tribunal_case_stats();

-- Create function to get tribunal case statistics
CREATE OR REPLACE FUNCTION get_tribunal_case_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_total_cases INTEGER;
  v_abr_cases INTEGER;
  v_total_courses INTEGER;
BEGIN
  -- Count total tribunal cases (exclude soft-deleted)
  SELECT COUNT(*)
  INTO v_total_cases
  FROM tribunal_cases
  WHERE deleted_at IS NULL;

  -- Count ABR-related cases (cases with 'abr' in title or summary, case-insensitive)
  SELECT COUNT(*)
  INTO v_abr_cases
  FROM tribunal_cases
  WHERE deleted_at IS NULL
    AND (
      LOWER(case_title) LIKE '%abr%'
      OR LOWER(summary) LIKE '%abr%'
      OR LOWER(case_title) LIKE '%anti-black%'
      OR LOWER(summary) LIKE '%anti-black%'
      OR LOWER(case_title) LIKE '%anti black%'
      OR LOWER(summary) LIKE '%anti black%'
    );

  -- Count total published courses (using is_published boolean)
  SELECT COUNT(*)
  INTO v_total_courses
  FROM courses
  WHERE is_published = true
    AND deleted_at IS NULL;

  -- Build JSON result
  result := json_build_object(
    'total_cases', v_total_cases,
    'abr_cases', v_abr_cases,
    'total_courses', v_total_courses,
    'calculated_at', NOW()
  );

  RETURN result;
END;
$$;

-- Add comment
COMMENT ON FUNCTION get_tribunal_case_stats() IS 'Returns statistics about tribunal cases and courses for dashboard display';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tribunal_case_stats() TO authenticated;

-- Grant execute permission to anonymous users (for public home page)
GRANT EXECUTE ON FUNCTION get_tribunal_case_stats() TO anon;



