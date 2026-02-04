-- Migration: 022_support_individual_users.sql
-- Description: Make organization_id nullable to support individual users without organizations
-- Created: 2026-02-04
-- Purpose: Allow individuals to use the app without being part of an organization

-- ============================================================================
-- MAKE ORGANIZATION_ID NULLABLE IN KEY TABLES
-- ============================================================================

-- 1. Enrollments - Allow individual users to enroll in courses
ALTER TABLE enrollments 
ALTER COLUMN organization_id DROP NOT NULL;

COMMENT ON COLUMN enrollments.organization_id IS 
'Organization ID - NULL for individual users, UUID for organization members';

-- 2. User Achievements - Allow individual users to earn achievements
ALTER TABLE user_achievements 
ALTER COLUMN organization_id DROP NOT NULL;

COMMENT ON COLUMN user_achievements.organization_id IS 
'Organization ID - NULL for individual users, UUID for organization members';

-- 3. AI Usage Logs - Allow individual users to access AI features
ALTER TABLE ai_usage_logs 
ALTER COLUMN organization_id DROP NOT NULL;

COMMENT ON COLUMN ai_usage_logs.organization_id IS 
'Organization ID - NULL for individual users, UUID for organization members. Used for quota tracking.';

-- ============================================================================
-- UPDATE INDEXES TO HANDLE NULL VALUES
-- ============================================================================

-- Enrollments: Add partial index for individual users (where org_id is null)
CREATE INDEX IF NOT EXISTS idx_enrollments_user_individual 
ON enrollments(user_id) 
WHERE organization_id IS NULL;

-- User Achievements: Add partial index for individual users
CREATE INDEX IF NOT EXISTS idx_user_achievements_individual 
ON user_achievements(user_id) 
WHERE organization_id IS NULL;

-- AI Usage Logs: Add partial index for individual users
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_individual 
ON ai_usage_logs(user_id, created_at DESC) 
WHERE organization_id IS NULL;

-- ============================================================================
-- CREATE/UPDATE HELPER FUNCTIONS (BEFORE RLS POLICIES)
-- ============================================================================

-- Update user_organization_id to return NULL instead of failing
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
BEGIN
    -- Returns NULL for individual users instead of failing
    RETURN (
        SELECT organization_id
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.user_organization_id IS 
'Get the organization ID for the current user. Returns NULL for individual users.';

-- Function to check if user is an individual (not part of organization)
CREATE OR REPLACE FUNCTION public.is_individual_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = p_user_id
        AND organization_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_individual_user IS 
'Check if user is an individual user (no organization). Returns true if user has no organization_id in profile.';

-- Function to get user's organization or null for individuals
CREATE OR REPLACE FUNCTION public.user_org_or_null()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.user_org_or_null IS 
'Get user organization ID or NULL for individual users. Does not throw error if no org.';

-- ============================================================================
-- UPDATE RLS POLICIES TO SUPPORT INDIVIDUAL USERS
-- ============================================================================

-- Drop ALL existing policies on these tables first to avoid conflicts
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all enrollments policies
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'enrollments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON enrollments', pol.policyname);
    END LOOP;
    
    -- Drop all user_achievements policies
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_achievements'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_achievements', pol.policyname);
    END LOOP;
    
    -- Drop all ai_usage_logs policies
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'ai_usage_logs'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON ai_usage_logs', pol.policyname);
    END LOOP;
END $$;

-- Enrollments: Create clean policies for individual users
CREATE POLICY "Users can view own enrollments"
ON enrollments FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = public.user_organization_id()
  )
);

CREATE POLICY "Users can insert own enrollments"
ON enrollments FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (
    organization_id IS NULL  -- Individual users can enroll
    OR organization_id = public.user_organization_id()  -- Org users in their org
  )
);

CREATE POLICY "Users can update own enrollments"
ON enrollments FOR UPDATE
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = public.user_organization_id()
  )
);

CREATE POLICY "Service role bypass for enrollments"
ON enrollments FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- User Achievements: Create clean policies for individual users
CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = public.user_organization_id()
  )
);

CREATE POLICY "System can insert achievements"
ON user_achievements FOR INSERT
WITH CHECK (
  -- System/service role can insert for any user
  auth.jwt() ->> 'role' = 'service_role'
  OR (
    user_id = auth.uid()
    AND (
      organization_id IS NULL  -- Individual users
      OR organization_id = public.user_organization_id()  -- Org users
    )
  )
);

CREATE POLICY "Service role bypass for achievements"
ON user_achievements FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- AI Usage Logs: Create clean policies for individual users
CREATE POLICY "Users can view own AI usage"
ON ai_usage_logs FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND organization_id = public.user_organization_id()
    AND public.has_permission(auth.uid(), organization_id, 'admin.view_analytics')
  )
);

CREATE POLICY "System can insert AI usage logs"
ON ai_usage_logs FOR INSERT
WITH CHECK (
  -- Service role can always insert
  auth.jwt() ->> 'role' = 'service_role'
  OR (
    user_id = auth.uid()
    AND (
      organization_id IS NULL  -- Individual users
      OR organization_id = public.user_organization_id()  -- Org users
    )
  )
);

CREATE POLICY "Service role bypass for AI logs"
ON ai_usage_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify nullable columns
DO $$
DECLARE
    v_enrollments_nullable BOOLEAN;
    v_achievements_nullable BOOLEAN;
    v_ai_logs_nullable BOOLEAN;
BEGIN
    -- Check if columns are nullable
    SELECT is_nullable = 'YES' INTO v_enrollments_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'enrollments' 
    AND column_name = 'organization_id';
    
    SELECT is_nullable = 'YES' INTO v_achievements_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_achievements' 
    AND column_name = 'organization_id';
    
    SELECT is_nullable = 'YES' INTO v_ai_logs_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'ai_usage_logs' 
    AND column_name = 'organization_id';
    
    IF v_enrollments_nullable AND v_achievements_nullable AND v_ai_logs_nullable THEN
        RAISE NOTICE '✅ All organization_id columns successfully made nullable';
    ELSE
        RAISE WARNING '⚠️  Some columns may not be nullable: enrollments=%, achievements=%, ai_logs=%',
            v_enrollments_nullable, v_achievements_nullable, v_ai_logs_nullable;
    END IF;
END;
$$;

-- List all policies on affected tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('enrollments', 'user_achievements', 'ai_usage_logs')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 022_support_individual_users.sql completed successfully';
    RAISE NOTICE '   - enrollments.organization_id is now nullable';
    RAISE NOTICE '   - user_achievements.organization_id is now nullable';
    RAISE NOTICE '   - ai_usage_logs.organization_id is now nullable';
    RAISE NOTICE '   - RLS policies updated to support individual users';
    RAISE NOTICE '   - Helper functions created for individual user checks';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Individual users can now:';
    RAISE NOTICE '   - Enroll in courses without an organization';
    RAISE NOTICE '   - Earn achievements as individuals';
    RAISE NOTICE '   - Access AI features without organization membership';
END;
$$;
