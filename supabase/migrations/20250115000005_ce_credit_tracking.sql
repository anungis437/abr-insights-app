-- ============================================================================
-- CE CREDIT TRACKING SYSTEM
-- ============================================================================
-- This migration adds comprehensive CE credit tracking capabilities:
-- - Aggregated views of credits by regulatory body
-- - Credit expiry tracking and renewal requirements
-- - Credit transaction history
-- ============================================================================

-- ============================================================================
-- VIEW: user_ce_credit_summary
-- ============================================================================
-- Provides a summary of CE credits earned by user and regulatory body

CREATE OR REPLACE VIEW user_ce_credit_summary AS
SELECT 
  c.user_id,
  c.regulatory_body,
  c.credit_category,
  COUNT(*) as certificate_count,
  SUM(c.ce_credits) as total_credits,
  SUM(c.ce_hours) as total_hours,
  MIN(c.issue_date) as first_earned_date,
  MAX(c.issue_date) as last_earned_date,
  COUNT(*) FILTER (WHERE c.status = 'active') as active_count,
  COUNT(*) FILTER (WHERE c.status = 'expired') as expired_count,
  COUNT(*) FILTER (WHERE c.status = 'revoked') as revoked_count,
  -- Credits expiring in next 90 days
  COUNT(*) FILTER (
    WHERE c.status = 'active' 
    AND c.expiry_date IS NOT NULL 
    AND c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  ) as expiring_soon_count,
  SUM(c.ce_credits) FILTER (
    WHERE c.status = 'active' 
    AND c.expiry_date IS NOT NULL 
    AND c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  ) as expiring_soon_credits
FROM certificates c
WHERE c.ce_credits > 0
  AND c.regulatory_body IS NOT NULL
GROUP BY c.user_id, c.regulatory_body, c.credit_category;

COMMENT ON VIEW user_ce_credit_summary IS 'Summary of CE credits earned by user, regulatory body, and category';

-- ============================================================================
-- VIEW: active_ce_credits
-- ============================================================================
-- Shows only currently active CE credits (not expired or revoked)

CREATE OR REPLACE VIEW active_ce_credits AS
SELECT 
  c.id,
  c.user_id,
  c.certificate_number,
  c.course_id,
  c.title,
  c.issue_date,
  c.expiry_date,
  c.ce_credits,
  c.ce_hours,
  c.regulatory_body,
  c.credit_category,
  -- Calculate days until expiry
  CASE 
    WHEN c.expiry_date IS NULL THEN NULL
    ELSE c.expiry_date - CURRENT_DATE
  END as days_until_expiry,
  -- Flag if expiring soon (within 90 days)
  CASE 
    WHEN c.expiry_date IS NULL THEN false
    WHEN c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days' THEN true
    ELSE false
  END as expiring_soon,
  -- User info
  u.email as user_email,
  up.full_name as user_name,
  -- Course info
  co.title as course_title
FROM certificates c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN user_profiles up ON c.user_id = up.user_id
LEFT JOIN courses co ON c.course_id = co.id
WHERE c.status = 'active'
  AND c.ce_credits > 0
  AND c.regulatory_body IS NOT NULL
  AND (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE);

COMMENT ON VIEW active_ce_credits IS 'Active CE credits with expiry tracking and user/course details';

-- ============================================================================
-- VIEW: ce_credit_renewal_alerts
-- ============================================================================
-- Identifies certificates that need renewal attention

CREATE OR REPLACE VIEW ce_credit_renewal_alerts AS
SELECT 
  c.user_id,
  c.regulatory_body,
  u.email as user_email,
  up.full_name as user_name,
  COUNT(*) as certificates_expiring,
  SUM(c.ce_credits) as credits_at_risk,
  MIN(c.expiry_date) as earliest_expiry,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'certificate_id', c.id,
      'certificate_number', c.certificate_number,
      'title', c.title,
      'credits', c.ce_credits,
      'expiry_date', c.expiry_date,
      'days_remaining', c.expiry_date - CURRENT_DATE
    ) ORDER BY c.expiry_date
  ) as expiring_certificates
FROM certificates c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN user_profiles up ON c.user_id = up.user_id
WHERE c.status = 'active'
  AND c.ce_credits > 0
  AND c.regulatory_body IS NOT NULL
  AND c.expiry_date IS NOT NULL
  AND c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
GROUP BY c.user_id, c.regulatory_body, u.email, up.full_name;

COMMENT ON VIEW ce_credit_renewal_alerts IS 'Identifies certificates expiring within 90 days that need renewal';

-- ============================================================================
-- FUNCTION: get_user_ce_dashboard
-- ============================================================================
-- Comprehensive CE credit dashboard data for a user

CREATE OR REPLACE FUNCTION get_user_ce_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
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

COMMENT ON FUNCTION get_user_ce_dashboard IS 'Returns comprehensive CE credit dashboard data for a user';

-- ============================================================================
-- FUNCTION: get_ce_credit_history
-- ============================================================================
-- Detailed credit earning history for a user

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
BEGIN
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

COMMENT ON FUNCTION get_ce_credit_history IS 'Returns detailed CE credit earning history for a user';

-- ============================================================================
-- FUNCTION: calculate_ce_requirements
-- ============================================================================
-- Calculate remaining CE requirements for common regulatory bodies

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
  v_earned_credits NUMERIC := 0;
  v_required_credits NUMERIC;
  v_result JSON;
BEGIN
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

COMMENT ON FUNCTION calculate_ce_requirements IS 'Calculate CE credit requirements and progress for a regulatory body cycle';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to views
GRANT SELECT ON user_ce_credit_summary TO authenticated;
GRANT SELECT ON active_ce_credits TO authenticated;
GRANT SELECT ON ce_credit_renewal_alerts TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_ce_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_ce_credit_history TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_ce_requirements TO authenticated;
