-- Fix: Tribunal Case Statistics RPC - Restrict to Public Content Only
--
-- Issue: get_tribunal_case_stats() was SECURITY DEFINER with GRANT to anon,
-- exposing private catalog sizing (all cases, all courses) without permission checks.
-- This bypasses the RLS model where cases.view/read/search permissions are required.
--
-- World-Class Fix (Option #2): Keep public but only count explicitly public/published rows
-- - Maintains public teaser stats for homepage
-- - Only exposes content intended for public consumption
-- - Uses manually_reviewed + NOT deleted_at as proxy for "published"
-- - Appropriate for premium legal-research product positioning
--
-- Security Context:
-- - SECURITY DEFINER allows bypassing RLS
-- - GRANT to anon means any visitor can call it
-- - Must explicitly filter to only public/published content
-- - Private/draft cases and courses should not be counted in public stats

-- ==============================================================================
-- STEP 1: Add is_published column to tribunal_cases if it doesn't exist
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tribunal_cases' 
    AND column_name = 'is_published'
  ) THEN
    ALTER TABLE tribunal_cases 
    ADD COLUMN is_published BOOLEAN DEFAULT false;
    
    -- Set existing manually_reviewed cases as published
    UPDATE tribunal_cases 
    SET is_published = true 
    WHERE manually_reviewed = true 
    AND deleted_at IS NULL;
  END IF;
END $$;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_tribunal_cases_published 
ON tribunal_cases(is_published) 
WHERE is_published = true AND deleted_at IS NULL;

-- ==============================================================================
-- STEP 2: Update the RPC function to only count published content
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_tribunal_case_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_total_cases INTEGER;
  v_abr_cases INTEGER;
  v_total_courses INTEGER;
BEGIN
  -- Count only PUBLISHED tribunal cases
  -- Respects is_published flag to prevent catalog enumeration of private/draft cases
  SELECT COUNT(*)
  INTO v_total_cases
  FROM tribunal_cases
  WHERE deleted_at IS NULL
    AND is_published = true;  -- NEW: Only count published cases

  -- Count only PUBLISHED ABR-related cases
  -- (cases with 'abr' in title or summary, case-insensitive)
  SELECT COUNT(*)
  INTO v_abr_cases
  FROM tribunal_cases
  WHERE deleted_at IS NULL
    AND is_published = true  -- NEW: Only count published cases
    AND (
      LOWER(case_title) LIKE '%abr%'
      OR LOWER(summary) LIKE '%abr%'
      OR LOWER(case_title) LIKE '%anti-black%'
      OR LOWER(summary) LIKE '%anti-black%'
      OR LOWER(case_title) LIKE '%anti black%'
      OR LOWER(summary) LIKE '%anti black%'
    );

  -- Count total published courses
  -- Already filtered correctly (is_published = true)
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

-- Update comment to reflect public-only nature
COMMENT ON FUNCTION get_tribunal_case_stats() IS 'Returns public statistics about published tribunal cases and courses for homepage teaser. Only counts published/public content to prevent catalog enumeration. SECURITY DEFINER but safe because it explicitly filters to is_published=true.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tribunal_case_stats() TO authenticated;

-- Grant execute permission to anonymous users (for public home page teaser)
-- Safe because function now only exposes published/public counts
GRANT EXECUTE ON FUNCTION get_tribunal_case_stats() TO anon;

-- ==============================================================================
-- Verification Query
-- ==============================================================================
-- Run this query to verify the function only returns public stats:
-- 
-- SELECT get_tribunal_case_stats();
--
-- Expected behavior:
-- - total_cases should only count WHERE is_published = true
-- - abr_cases should only count WHERE is_published = true
-- - total_courses should only count WHERE is_published = true
-- - Private/draft content is NOT included in public stats
--
-- To test: Create a draft case with is_published=false and verify it's NOT counted

