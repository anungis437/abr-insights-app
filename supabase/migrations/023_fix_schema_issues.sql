-- Migration: 023_fix_schema_issues.sql
-- Description: Fix RLS policies and missing schema elements
-- Created: 2026-02-04
-- Purpose: Resolve enrollment policy issues and add missing gamification features

-- ============================================================================
-- FIX ENROLLMENT SELECT POLICY
-- ============================================================================

-- Replace helper function with inline subquery for more reliable evaluation
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;

CREATE POLICY "Users can view own enrollments"
ON enrollments FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  )
);

COMMENT ON POLICY "Users can view own enrollments" ON enrollments IS
'Allow users to view their own enrollments (individual or org members)';

-- ============================================================================
-- FIX USER_ACHIEVEMENTS POLICY
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  )
);

-- ============================================================================
-- FIX AI_USAGE_LOGS POLICY
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_logs;

CREATE POLICY "Users can view own AI usage"
ON ai_usage_logs FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND public.has_permission(auth.uid(), (SELECT organization_id FROM profiles WHERE id = auth.uid()), 'admin.view_analytics')
  )
);

-- ============================================================================
-- ADD MISSING SAVED_SEARCHES COLUMN
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'saved_searches' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE saved_searches ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_saved_searches_deleted_at 
    ON saved_searches(deleted_at) 
    WHERE deleted_at IS NULL;
    
    RAISE NOTICE '✅ Added deleted_at column to saved_searches';
  ELSE
    RAISE NOTICE '⏭️  Column saved_searches.deleted_at already exists';
  END IF;
END $$;

-- ============================================================================
-- CREATE MISSING GAMIFICATION FUNCTIONS
-- ============================================================================

-- Function: get_user_points_summary
CREATE OR REPLACE FUNCTION public.get_user_points_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_points', COALESCE(SUM(points), 0),
    'points_this_week', COALESCE(SUM(CASE 
      WHEN created_at >= date_trunc('week', CURRENT_TIMESTAMP) 
      THEN points ELSE 0 
    END), 0),
    'points_this_month', COALESCE(SUM(CASE 
      WHEN created_at >= date_trunc('month', CURRENT_TIMESTAMP) 
      THEN points ELSE 0 
    END), 0)
  ) INTO v_result
  FROM user_achievements
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_result, '{"total_points": 0, "points_this_week": 0, "points_this_month": 0}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_points_summary IS
'Get points summary for a user (total, weekly, monthly)';

-- Function: get_user_social_summary
CREATE OR REPLACE FUNCTION public.get_user_social_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Placeholder implementation - customize based on your social features
  SELECT json_build_object(
    'followers', 0,
    'following', 0,
    'friends', 0
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_social_summary IS
'Get social summary for a user (followers, following, friends)';

-- ============================================================================
-- CREATE USER_LEVELS TABLE IF MISSING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_levels
CREATE POLICY "Users can view own level"
ON user_levels FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own level"
ON user_levels FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Service role bypass for user_levels"
ON user_levels FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(level DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_user_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_levels_updated_at ON user_levels;
CREATE TRIGGER update_user_levels_updated_at
  BEFORE UPDATE ON user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_levels_updated_at();

-- ============================================================================
-- FIX ACHIEVEMENTS FOREIGN KEY RELATIONSHIP
-- ============================================================================

DO $$
BEGIN
  -- Check if achievements table exists and has category_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' AND column_name = 'category_id'
  ) THEN
    -- Add foreign key if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'achievements_category_id_fkey'
    ) THEN
      ALTER TABLE achievements 
      ADD CONSTRAINT achievements_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES achievement_categories(id) 
      ON DELETE SET NULL;
      
      RAISE NOTICE '✅ Added foreign key relationship: achievements -> achievement_categories';
    ELSE
      RAISE NOTICE '⏭️  Foreign key achievements_category_id_fkey already exists';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 023_fix_schema_issues.sql completed successfully';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Fixed Issues:';
  RAISE NOTICE '   - RLS policies now use inline subqueries (more reliable)';
  RAISE NOTICE '   - Added saved_searches.deleted_at column';
  RAISE NOTICE '   - Created get_user_points_summary function';
  RAISE NOTICE '   - Created get_user_social_summary function';
  RAISE NOTICE '   - Created user_levels table';
  RAISE NOTICE '   - Fixed achievements -> achievement_categories relationship';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   - Hard refresh browser (Ctrl+Shift+F5)';
  RAISE NOTICE '   - Test enrollment with learner@abr-insights.com';
  RAISE NOTICE '   - Verify no 409 or schema errors in console';
END $$;
