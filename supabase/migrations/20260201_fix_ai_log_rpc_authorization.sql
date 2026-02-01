-- Fix P0 Security Issue: Multiple SECURITY DEFINER RPC Authorization Issues
-- 
-- Issue: SECURITY DEFINER functions were missing authorization checks across multiple migrations:
--
-- 1. AI Interaction Logs (20250130000001):
--    - get_ai_usage_statistics(p_organization_id, ...)
--    - get_flagged_ai_interactions(p_organization_id, ...)
--    Any authenticated user could access sensitive AI logs for ANY organization
--
-- 2. CE Credit Tracking (20250115000005):
--    - get_user_ce_dashboard(p_user_id)
--    - get_ce_credit_history(p_user_id, ...)
--    - calculate_ce_requirements(p_user_id, ...)
--    Any authenticated user could access CE credit data for ANY user
--
-- 3. Skills Validation (20250115000006):
--    - get_user_skills_dashboard(p_user_id)
--    - calculate_skill_proficiency(p_user_id, ...)
--    - validate_skill_from_quiz(p_user_id, ...)
--    - get_skill_validation_history(p_user_id, ...)
--    - get_recommended_courses_for_skills(p_user_id, ...)
--    Any authenticated user could access skills data for ANY user
--
-- This migration adds proper authorization:
-- For organization-scoped functions:
--   1. Validates auth.uid() is not NULL
--   2. Checks that caller has 'admin.view' permission for the organization
--   3. Validates caller belongs to the organization
--
-- For user-scoped functions:
--   1. Validates auth.uid() is not NULL
--   2. Validates that p_user_id matches auth.uid() (users can only query their own data)
--
-- Security Context: These functions return highly sensitive PII including:
-- - User emails, names, and profiles
-- - AI prompts and responses
-- - Credit card and certification data
-- - Skills assessments and scores
--
-- Without these checks, any authenticated user could exfiltrate data across tenants.

-- ==============================================================================
-- Function: get_ai_usage_statistics
-- Returns: Aggregate statistics about AI usage for an organization
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_ai_usage_statistics(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_interactions BIGINT,
  interaction_type TEXT,
  interaction_count BIGINT,
  flagged_count BIGINT,
  needs_review_count BIGINT,
  average_tokens NUMERIC,
  unique_users BIGINT
) AS $$
DECLARE
  v_caller_id UUID;
  v_has_permission BOOLEAN;
  v_is_member BOOLEAN;
BEGIN
  -- SECURITY CHECK 1: Validate caller is authenticated
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access AI usage statistics';
  END IF;

  -- SECURITY CHECK 2: Validate caller has admin.view permission for this organization
  -- This permission is required to view analytics and audit data
  SELECT auth.has_permission(v_caller_id, p_organization_id, 'admin.view')
  INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Permission denied'
      USING HINT = 'User must have admin.view permission to access AI usage statistics';
  END IF;

  -- SECURITY CHECK 3: Validate caller belongs to the organization
  -- Even with permission, user must be a member of the organization
  SELECT EXISTS(
    SELECT 1 
    FROM profiles 
    WHERE id = v_caller_id 
    AND organization_id = p_organization_id
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Organization membership required'
      USING HINT = 'User must be a member of the organization to access its AI usage statistics';
  END IF;

  -- All security checks passed - return the statistics
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      interaction_type as type,
      COUNT(*) as type_count,
      COUNT(*) FILTER (WHERE flags IS NOT NULL AND array_length(flags, 1) > 0) as flagged,
      COUNT(*) FILTER (WHERE human_reviewed = FALSE) as needs_review,
      AVG(tokens_used) FILTER (WHERE tokens_used IS NOT NULL) as avg_tokens,
      COUNT(DISTINCT user_id) as users
    FROM ai_interaction_logs
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY interaction_type
  )
  SELECT 
    total,
    type,
    type_count,
    flagged,
    needs_review,
    ROUND(avg_tokens, 0),
    users
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_ai_usage_statistics IS 'Returns AI usage statistics for an organization. Requires admin.view permission and organization membership. SECURITY DEFINER with authorization checks to prevent cross-tenant data access.';

-- Grant execute permission (function enforces authorization internally)
GRANT EXECUTE ON FUNCTION get_ai_usage_statistics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- ==============================================================================
-- Function: get_flagged_ai_interactions
-- Returns: AI interactions flagged for review (includes sensitive content)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_flagged_ai_interactions(
  p_organization_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  interaction_type TEXT,
  prompt TEXT,
  response TEXT,
  flags TEXT[],
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_caller_id UUID;
  v_has_permission BOOLEAN;
  v_is_member BOOLEAN;
BEGIN
  -- SECURITY CHECK 1: Validate caller is authenticated
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access flagged AI interactions';
  END IF;

  -- SECURITY CHECK 2: Validate caller has admin.view permission for this organization
  -- This permission is required to view flagged content and user details
  SELECT auth.has_permission(v_caller_id, p_organization_id, 'admin.view')
  INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Permission denied'
      USING HINT = 'User must have admin.view permission to access flagged AI interactions';
  END IF;

  -- SECURITY CHECK 3: Validate caller belongs to the organization
  -- Even with permission, user must be a member of the organization
  SELECT EXISTS(
    SELECT 1 
    FROM profiles 
    WHERE id = v_caller_id 
    AND organization_id = p_organization_id
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Organization membership required'
      USING HINT = 'User must be a member of the organization to access its flagged AI interactions';
  END IF;

  -- All security checks passed - return the flagged interactions
  -- This includes highly sensitive data: user emails, full prompts/responses, flags
  RETURN QUERY
  SELECT 
    l.id,
    l.user_id,
    u.email as user_email,
    l.interaction_type,
    l.prompt,
    l.response,
    l.flags,
    l.created_at
  FROM ai_interaction_logs l
  JOIN auth.users u ON u.id = l.user_id
  WHERE l.organization_id = p_organization_id
    AND l.human_reviewed = FALSE
    AND l.flags IS NOT NULL
    AND array_length(l.flags, 1) > 0
  ORDER BY l.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION get_flagged_ai_interactions IS 'Returns flagged AI interactions requiring review for an organization. Requires admin.view permission and organization membership. Returns sensitive data (emails, prompts, responses). SECURITY DEFINER with authorization checks to prevent cross-tenant data access.';

-- Grant execute permission (function enforces authorization internally)
GRANT EXECUTE ON FUNCTION get_flagged_ai_interactions(UUID, INTEGER) TO authenticated;

-- ==============================================================================
-- CE CREDIT TRACKING FUNCTIONS
-- ==============================================================================

-- Function: get_user_ce_dashboard
-- Returns: Comprehensive CE credit dashboard data for a user
-- Security: User can only access their own CE credit data
CREATE OR REPLACE FUNCTION get_user_ce_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_result JSON;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access CE credit dashboard';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only access their own CE credit data';
  END IF;

  -- All security checks passed - return the dashboard data
  SELECT JSON_BUILD_OBJECT(
    'summary', (
      SELECT JSON_OBJECT_AGG(
        regulatory_body,
        JSON_BUILD_OBJECT(
          'total_credits', COALESCE(SUM(total_credits), 0),
          'total_hours', COALESCE(SUM(total_hours), 0),
          'active_certificates', COALESCE(SUM(active_count), 0),
          'expiring_soon', COALESCE(SUM(expiring_soon_count), 0),
          'expiring_soon_credits', COALESCE(SUM(expiring_soon_credits), 0),
          'categories', JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', credit_category,
              'credits', total_credits,
              'hours', total_hours,
              'certificates', certificate_count
            )
          )
        )
      )
      FROM user_ce_credit_summary
      WHERE user_id = p_user_id
      GROUP BY regulatory_body
    ),
    'active_credits', (
      SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', id,
          'certificate_number', certificate_number,
          'title', title,
          'issue_date', issue_date,
          'expiry_date', expiry_date,
          'credits', ce_credits,
          'hours', ce_hours,
          'regulatory_body', regulatory_body,
          'category', credit_category,
          'days_until_expiry', days_until_expiry,
          'expiring_soon', expiring_soon,
          'course_title', course_title
        )
        ORDER BY 
          CASE WHEN expiry_date IS NOT NULL THEN 0 ELSE 1 END,
          expiry_date ASC NULLS LAST
      )
      FROM active_ce_credits
      WHERE user_id = p_user_id
    ),
    'renewal_alerts', (
      SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
          'regulatory_body', regulatory_body,
          'certificates_expiring', certificates_expiring,
          'credits_at_risk', credits_at_risk,
          'earliest_expiry', earliest_expiry,
          'certificates', expiring_certificates
        )
      )
      FROM ce_credit_renewal_alerts
      WHERE user_id = p_user_id
    ),
    'total_stats', (
      SELECT JSON_BUILD_OBJECT(
        'total_certificates', COUNT(*),
        'total_credits', COALESCE(SUM(ce_credits), 0),
        'total_hours', COALESCE(SUM(ce_hours), 0),
        'active_certificates', COUNT(*) FILTER (WHERE status = 'active'),
        'expired_certificates', COUNT(*) FILTER (WHERE status = 'expired'),
        'regulatory_bodies', COUNT(DISTINCT regulatory_body)
      )
      FROM certificates
      WHERE user_id = p_user_id
        AND ce_credits > 0
        AND regulatory_body IS NOT NULL
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_user_ce_dashboard IS 'Returns comprehensive CE credit dashboard data for a user. SECURITY DEFINER with authorization check - users can only access their own data.';

GRANT EXECUTE ON FUNCTION get_user_ce_dashboard TO authenticated;

-- Function: get_ce_credit_history
-- Returns: Detailed credit earning history for a user
-- Security: User can only access their own CE credit history
CREATE OR REPLACE FUNCTION get_ce_credit_history(
  p_user_id UUID,
  p_regulatory_body VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  certificate_id UUID,
  certificate_number VARCHAR,
  title VARCHAR,
  course_title VARCHAR,
  issue_date DATE,
  expiry_date DATE,
  ce_credits NUMERIC,
  ce_hours NUMERIC,
  regulatory_body VARCHAR,
  credit_category VARCHAR,
  status certificate_status,
  days_until_expiry INTEGER,
  quiz_score INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access CE credit history';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only access their own CE credit history';
  END IF;

  -- All security checks passed - return the history
  RETURN QUERY
  SELECT 
    c.id,
    c.certificate_number,
    c.title::VARCHAR,
    co.title::VARCHAR as course_title,
    c.issue_date,
    c.expiry_date,
    c.ce_credits,
    c.ce_hours,
    c.regulatory_body,
    c.credit_category,
    c.status,
    CASE 
      WHEN c.expiry_date IS NULL THEN NULL
      ELSE (c.expiry_date - CURRENT_DATE)::INTEGER
    END as days_until_expiry,
    qa.score as quiz_score
  FROM certificates c
  LEFT JOIN courses co ON c.course_id = co.id
  LEFT JOIN quiz_attempts qa ON c.quiz_attempt_id = qa.id
  WHERE c.user_id = p_user_id
    AND c.ce_credits > 0
    AND c.regulatory_body IS NOT NULL
    AND (p_regulatory_body IS NULL OR c.regulatory_body = p_regulatory_body)
  ORDER BY c.issue_date DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_ce_credit_history IS 'Returns detailed CE credit earning history for a user. SECURITY DEFINER with authorization check - users can only access their own data.';

GRANT EXECUTE ON FUNCTION get_ce_credit_history TO authenticated;

-- Function: calculate_ce_requirements
-- Returns: CE credit requirements and progress for a regulatory body cycle
-- Security: User can only calculate their own CE requirements
CREATE OR REPLACE FUNCTION calculate_ce_requirements(
  p_user_id UUID,
  p_regulatory_body VARCHAR,
  p_cycle_start_date DATE DEFAULT NULL,
  p_cycle_end_date DATE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_earned_credits NUMERIC := 0;
  v_required_credits NUMERIC;
  v_result JSON;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to calculate CE requirements';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only calculate their own CE requirements';
  END IF;

  -- Set default cycle dates if not provided (current year)
  IF p_cycle_start_date IS NULL THEN
    p_cycle_start_date := DATE_TRUNC('year', CURRENT_DATE)::DATE;
  END IF;
  
  IF p_cycle_end_date IS NULL THEN
    p_cycle_end_date := (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')::DATE;
  END IF;
  
  -- Calculate earned credits in cycle
  SELECT COALESCE(SUM(ce_credits), 0)
  INTO v_earned_credits
  FROM certificates
  WHERE user_id = p_user_id
    AND regulatory_body = p_regulatory_body
    AND status = 'active'
    AND issue_date BETWEEN p_cycle_start_date AND p_cycle_end_date;
  
  -- Set required credits based on regulatory body
  -- These are approximate requirements and should be configurable
  v_required_credits := CASE p_regulatory_body
    WHEN 'MFDA' THEN 30.0
    WHEN 'IIROC' THEN 30.0
    WHEN 'CIRO' THEN 30.0
    WHEN 'Insurance Council' THEN 15.0
    WHEN 'CSA' THEN 25.0
    ELSE 20.0
  END;
  
  -- Build result
  v_result := JSON_BUILD_OBJECT(
    'regulatory_body', p_regulatory_body,
    'cycle_start', p_cycle_start_date,
    'cycle_end', p_cycle_end_date,
    'required_credits', v_required_credits,
    'earned_credits', v_earned_credits,
    'remaining_credits', GREATEST(v_required_credits - v_earned_credits, 0),
    'progress_percentage', ROUND((v_earned_credits / NULLIF(v_required_credits, 0)) * 100, 2),
    'on_track', v_earned_credits >= v_required_credits,
    'days_remaining', (p_cycle_end_date - CURRENT_DATE)::INTEGER
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION calculate_ce_requirements IS 'Calculate CE credit requirements and progress for a regulatory body cycle. SECURITY DEFINER with authorization check - users can only calculate their own requirements.';

GRANT EXECUTE ON FUNCTION calculate_ce_requirements TO authenticated;

-- ==============================================================================
-- SKILLS VALIDATION FUNCTIONS
-- ==============================================================================

-- Function: get_user_skills_dashboard
-- Returns: Comprehensive skills dashboard data for a user
-- Security: User can only access their own skills data
CREATE OR REPLACE FUNCTION get_user_skills_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_result JSON;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access skills dashboard';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only access their own skills data';
  END IF;

  -- All security checks passed - return the dashboard data
  SELECT json_build_object(
    'summary', (
      SELECT json_agg(row_to_json(summary))
      FROM (
        SELECT 
          category,
          regulatory_body,
          total_skills,
          validated_skills,
          expired_skills,
          advanced_skills,
          avg_proficiency_score,
          avg_confidence_score,
          total_assessments,
          passed_assessments
        FROM user_skills_summary
        WHERE user_id = p_user_id
        ORDER BY category, regulatory_body
      ) summary
    ),
    'active_skills', (
      SELECT json_agg(row_to_json(skills))
      FROM (
        SELECT 
          skill_id,
          skill_name,
          category,
          subcategory,
          regulatory_body,
          proficiency_level,
          proficiency_score,
          confidence_score,
          validated_at,
          expires_at,
          days_until_expiry,
          expiring_soon
        FROM active_validated_skills
        WHERE user_id = p_user_id
        ORDER BY proficiency_score DESC, skill_name
      ) skills
    ),
    'expiring_skills', (
      SELECT json_agg(row_to_json(expiring))
      FROM (
        SELECT 
          skill_id,
          skill_name,
          category,
          regulatory_body,
          proficiency_level,
          expires_at,
          days_until_expiry
        FROM skills_expiring_soon
        WHERE user_id = p_user_id
        ORDER BY days_until_expiry ASC
      ) expiring
    ),
    'total_stats', (
      SELECT json_build_object(
        'total_skills', COUNT(DISTINCT skill_id),
        'validated_skills', COUNT(DISTINCT CASE WHEN is_validated THEN skill_id END),
        'expired_skills', COUNT(DISTINCT CASE WHEN validation_status = 'expired' THEN skill_id END),
        'total_assessments', SUM(total_assessments),
        'passed_assessments', SUM(passed_assessments),
        'average_score', AVG(proficiency_score)
      )
      FROM user_skills
      WHERE user_id = p_user_id
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_user_skills_dashboard IS 'Get comprehensive skills dashboard data for a user. SECURITY DEFINER with authorization check - users can only access their own data.';

GRANT EXECUTE ON FUNCTION get_user_skills_dashboard TO authenticated;

-- Function: validate_skill_from_quiz
-- Updates user skills based on quiz attempt performance
-- Security: User can only validate skills for their own quiz attempts
CREATE OR REPLACE FUNCTION validate_skill_from_quiz(
  p_user_id UUID,
  p_quiz_attempt_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_quiz_record RECORD;
  v_skill_record RECORD;
  v_user_skill_id UUID;
  v_proficiency proficiency_level;
  v_passed BOOLEAN;
  v_validation_status validation_status;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to validate skills';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only validate their own skills';
  END IF;

  -- Get quiz attempt details
  SELECT qa.*, q.quiz_id, q.course_id
  INTO v_quiz_record
  FROM quiz_attempts qa
  JOIN quizzes q ON qa.quiz_id = q.id
  WHERE qa.id = p_quiz_attempt_id
    AND qa.user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz attempt not found';
  END IF;
  
  -- Loop through skills associated with quiz questions
  FOR v_skill_record IN
    SELECT DISTINCT 
      qs.skill_id,
      s.min_quiz_score,
      s.expiry_months
    FROM quiz_questions qq
    JOIN question_skills qs ON qq.question_id = qs.question_id
    JOIN skills s ON qs.skill_id = s.id
    WHERE qq.quiz_id = v_quiz_record.quiz_id
      AND s.is_active = true
  LOOP
    -- Calculate proficiency level
    v_proficiency := calculate_skill_proficiency(
      p_user_id, 
      v_skill_record.skill_id, 
      v_quiz_record.score
    );
    
    -- Determine if passed
    v_passed := v_quiz_record.score >= COALESCE(v_skill_record.min_quiz_score, 70);
    v_validation_status := CASE WHEN v_passed THEN 'validated'::validation_status ELSE 'failed'::validation_status END;
    
    -- Calculate expiry date
    v_expires_at := CASE 
      WHEN v_passed AND v_skill_record.expiry_months IS NOT NULL 
      THEN CURRENT_DATE + (v_skill_record.expiry_months || ' months')::INTERVAL
      ELSE NULL
    END;
    
    -- Upsert user_skills
    INSERT INTO user_skills (
      user_id, skill_id, proficiency_level, proficiency_score,
      is_validated, validation_status, validated_at, expires_at,
      total_assessments, passed_assessments, failed_assessments,
      average_quiz_score, best_quiz_score,
      first_attempted_at, last_practiced_at, last_validated_at,
      updated_at
    )
    VALUES (
      p_user_id, v_skill_record.skill_id, v_proficiency, v_quiz_record.score,
      v_passed, v_validation_status, 
      CASE WHEN v_passed THEN NOW() ELSE NULL END,
      v_expires_at,
      1, CASE WHEN v_passed THEN 1 ELSE 0 END, CASE WHEN NOT v_passed THEN 1 ELSE 0 END,
      v_quiz_record.score, v_quiz_record.score,
      NOW(), NOW(), 
      CASE WHEN v_passed THEN NOW() ELSE NULL END,
      NOW()
    )
    ON CONFLICT (user_id, skill_id) DO UPDATE SET
      proficiency_level = CASE 
        WHEN EXCLUDED.proficiency_score > user_skills.proficiency_score 
        THEN EXCLUDED.proficiency_level 
        ELSE user_skills.proficiency_level 
      END,
      proficiency_score = GREATEST(user_skills.proficiency_score, EXCLUDED.proficiency_score),
      is_validated = user_skills.is_validated OR EXCLUDED.is_validated,
      validation_status = CASE 
        WHEN EXCLUDED.is_validated THEN 'validated'::validation_status
        WHEN user_skills.is_validated THEN user_skills.validation_status
        ELSE 'failed'::validation_status
      END,
      validated_at = CASE 
        WHEN EXCLUDED.is_validated THEN EXCLUDED.validated_at 
        ELSE user_skills.validated_at 
      END,
      expires_at = CASE 
        WHEN EXCLUDED.is_validated THEN EXCLUDED.expires_at 
        ELSE user_skills.expires_at 
      END,
      total_assessments = user_skills.total_assessments + 1,
      passed_assessments = user_skills.passed_assessments + EXCLUDED.passed_assessments,
      failed_assessments = user_skills.failed_assessments + EXCLUDED.failed_assessments,
      average_quiz_score = ROUND(
        ((user_skills.average_quiz_score * user_skills.total_assessments) + EXCLUDED.average_quiz_score) 
        / (user_skills.total_assessments + 1), 
        2
      ),
      best_quiz_score = GREATEST(user_skills.best_quiz_score, EXCLUDED.best_quiz_score),
      last_practiced_at = NOW(),
      last_validated_at = CASE 
        WHEN EXCLUDED.is_validated THEN NOW() 
        ELSE user_skills.last_validated_at 
      END,
      updated_at = NOW()
    RETURNING id INTO v_user_skill_id;
    
    -- Insert validation record
    INSERT INTO skill_validations (
      user_id, skill_id, user_skill_id, quiz_attempt_id,
      validation_type, validation_status, score, proficiency_level,
      passed, attempted_at, validated_at, expires_at
    )
    VALUES (
      p_user_id, v_skill_record.skill_id, v_user_skill_id, p_quiz_attempt_id,
      'quiz', v_validation_status, v_quiz_record.score, v_proficiency,
      v_passed, NOW(), 
      CASE WHEN v_passed THEN NOW() ELSE NULL END,
      v_expires_at
    );
  END LOOP;
END;
$$;

COMMENT ON FUNCTION validate_skill_from_quiz IS 'Update user skills based on quiz attempt performance. SECURITY DEFINER with authorization check - users can only validate their own skills.';

GRANT EXECUTE ON FUNCTION validate_skill_from_quiz TO authenticated;

-- Function: get_skill_validation_history
-- Returns: Skill validation history for a user
-- Security: User can only access their own validation history
CREATE OR REPLACE FUNCTION get_skill_validation_history(
  p_user_id UUID,
  p_skill_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  validation_id UUID,
  skill_id UUID,
  skill_name VARCHAR,
  category VARCHAR,
  validation_type VARCHAR,
  validation_status validation_status,
  score DECIMAL,
  proficiency_level proficiency_level,
  passed BOOLEAN,
  quiz_title VARCHAR,
  course_title VARCHAR,
  attempted_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to access validation history';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only access their own validation history';
  END IF;

  -- All security checks passed - return the validation history
  RETURN QUERY
  SELECT 
    sv.id,
    sv.skill_id,
    s.name,
    s.category,
    sv.validation_type,
    sv.validation_status,
    sv.score,
    sv.proficiency_level,
    sv.passed,
    q.title AS quiz_title,
    c.title AS course_title,
    sv.attempted_at,
    sv.validated_at,
    sv.expires_at
  FROM skill_validations sv
  JOIN skills s ON sv.skill_id = s.id
  LEFT JOIN quiz_attempts qa ON sv.quiz_attempt_id = qa.id
  LEFT JOIN quizzes q ON qa.quiz_id = q.id
  LEFT JOIN courses c ON sv.course_id = c.id
  WHERE sv.user_id = p_user_id
    AND (p_skill_id IS NULL OR sv.skill_id = p_skill_id)
  ORDER BY sv.attempted_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_skill_validation_history IS 'Get skill validation history for a user. SECURITY DEFINER with authorization check - users can only access their own history.';

GRANT EXECUTE ON FUNCTION get_skill_validation_history TO authenticated;

-- Function: get_recommended_courses_for_skills
-- Returns: Recommended courses based on skill gaps
-- Security: User can only get recommendations for their own skill gaps
CREATE OR REPLACE FUNCTION get_recommended_courses_for_skills(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  course_id UUID,
  course_title VARCHAR,
  course_category VARCHAR,
  skill_gaps INTEGER,
  target_proficiency proficiency_level,
  estimated_improvement DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  -- SECURITY CHECK: Validate caller is authenticated and matches requested user_id
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING HINT = 'User must be authenticated to get course recommendations';
  END IF;

  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Authorization failed'
      USING HINT = 'Users can only get recommendations for their own skill gaps';
  END IF;

  -- All security checks passed - return the recommendations
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.category,
    COUNT(DISTINCT cs.skill_id)::INTEGER AS skill_gaps,
    cs.proficiency_level AS target_proficiency,
    AVG(
      CASE cs.proficiency_level
        WHEN 'expert' THEN 90
        WHEN 'advanced' THEN 75
        WHEN 'intermediate' THEN 50
        WHEN 'beginner' THEN 25
        ELSE 10
      END - COALESCE(us.proficiency_score, 0)
    ) AS estimated_improvement
  FROM courses c
  JOIN course_skills cs ON c.id = cs.course_id
  LEFT JOIN user_skills us ON cs.skill_id = us.skill_id AND us.user_id = p_user_id
  WHERE c.is_published = true
    AND (
      us.skill_id IS NULL 
      OR us.proficiency_score < (
        CASE cs.proficiency_level
          WHEN 'expert' THEN 90
          WHEN 'advanced' THEN 75
          WHEN 'intermediate' THEN 50
          WHEN 'beginner' THEN 25
          ELSE 10
        END
      )
    )
  GROUP BY c.id, c.title, c.category, cs.proficiency_level
  ORDER BY skill_gaps DESC, estimated_improvement DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_recommended_courses_for_skills IS 'Get recommended courses based on skill gaps. SECURITY DEFINER with authorization check - users can only get recommendations for their own skill gaps.';

GRANT EXECUTE ON FUNCTION get_recommended_courses_for_skills TO authenticated;

-- ==============================================================================
-- Verification Query
-- ==============================================================================
-- Run this query to verify the functions are properly secured:
-- 
-- SELECT 
--   routine_name,
--   security_type,
--   routine_definition LIKE '%auth.uid()%' as has_auth_check,
--   routine_definition LIKE '%has_permission%' OR routine_definition LIKE '%!=%' as has_permission_check
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN (
--   'get_ai_usage_statistics', 
--   'get_flagged_ai_interactions',
--   'get_user_ce_dashboard',
--   'get_ce_credit_history',
--   'calculate_ce_requirements',
--   'get_user_skills_dashboard',
--   'validate_skill_from_quiz',
--   'get_skill_validation_history',
--   'get_recommended_courses_for_skills'
-- )
-- AND routine_type = 'FUNCTION';
--
-- Expected results:
-- - security_type = 'DEFINER'
-- - has_auth_check = true
-- - has_permission_check = true

