-- Migration: Skills Validation System
-- Description: Skills taxonomy, proficiency tracking, and competency validation
-- Author: System
-- Date: 2025-11-08

-- ============================================================================
-- SKILLS TAXONOMY
-- ============================================================================

-- Proficiency levels enumeration
CREATE TYPE proficiency_level AS ENUM (
  'novice',        -- 0-25% - Basic awareness
  'beginner',      -- 25-50% - Can perform with guidance
  'intermediate',  -- 50-75% - Can perform independently
  'advanced',      -- 75-90% - Can perform complex tasks
  'expert'         -- 90-100% - Can teach others
);

-- Validation status
CREATE TYPE validation_status AS ENUM (
  'pending',
  'validated',
  'expired',
  'failed'
);

-- Skills table (hierarchical taxonomy)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- e.g., 'Compliance', 'Ethics', 'Products', 'Analysis'
  subcategory VARCHAR(100), -- e.g., 'AML', 'KYC', 'Mutual Funds', 'Risk Assessment'
  parent_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  
  -- Skill Metadata
  regulatory_body VARCHAR(100), -- Associated regulatory body if applicable
  difficulty_level difficulty_level DEFAULT 'intermediate',
  importance_weight DECIMAL(3,2) DEFAULT 1.0, -- 0.0-1.0 for weighted scoring
  
  -- Validation Requirements
  min_quiz_score INTEGER DEFAULT 70, -- Minimum score to validate this skill
  min_practice_attempts INTEGER DEFAULT 1,
  expiry_months INTEGER, -- Skill validation expires after X months (NULL = never)
  
  -- Display & Organization
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(20), -- Color code for visualizations
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_subcategory ON skills(subcategory);
CREATE INDEX idx_skills_parent ON skills(parent_skill_id);
CREATE INDEX idx_skills_regulatory_body ON skills(regulatory_body);
CREATE INDEX idx_skills_slug ON skills(slug);

COMMENT ON TABLE skills IS 'Hierarchical taxonomy of skills and competencies';
COMMENT ON COLUMN skills.importance_weight IS 'Weight for calculating overall proficiency (0.0-1.0)';
COMMENT ON COLUMN skills.expiry_months IS 'Months until skill validation expires (NULL = never expires)';

-- ============================================================================
-- SKILL MAPPINGS
-- ============================================================================

-- Map skills to courses
CREATE TABLE IF NOT EXISTS course_skills (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level NOT NULL, -- Level this course teaches to
  is_primary BOOLEAN DEFAULT false, -- Primary skill for this course
  weight DECIMAL(3,2) DEFAULT 1.0, -- Contribution to overall skill proficiency
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (course_id, skill_id)
);

CREATE INDEX idx_course_skills_course ON course_skills(course_id);
CREATE INDEX idx_course_skills_skill ON course_skills(skill_id);

-- Map skills to lessons
CREATE TABLE IF NOT EXISTS lesson_skills (
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lesson_id, skill_id)
);

CREATE INDEX idx_lesson_skills_lesson ON lesson_skills(lesson_id);
CREATE INDEX idx_lesson_skills_skill ON lesson_skills(skill_id);

-- Map skills to quiz questions
CREATE TABLE IF NOT EXISTS question_skills (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  weight DECIMAL(3,2) DEFAULT 1.0, -- How much this question validates the skill
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (question_id, skill_id)
);

CREATE INDEX idx_question_skills_question ON question_skills(question_id);
CREATE INDEX idx_question_skills_skill ON question_skills(skill_id);

-- ============================================================================
-- USER SKILLS & PROFICIENCY
-- ============================================================================

-- User skill proficiency tracking
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  
  -- Current Proficiency
  proficiency_level proficiency_level NOT NULL DEFAULT 'novice',
  proficiency_score DECIMAL(5,2) NOT NULL DEFAULT 0.0, -- 0-100 percentage
  confidence_score DECIMAL(5,2) DEFAULT 0.0, -- Statistical confidence in assessment
  
  -- Validation Status
  is_validated BOOLEAN DEFAULT false,
  validation_status validation_status DEFAULT 'pending',
  validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Performance Metrics
  total_assessments INTEGER DEFAULT 0,
  passed_assessments INTEGER DEFAULT 0,
  failed_assessments INTEGER DEFAULT 0,
  average_quiz_score DECIMAL(5,2) DEFAULT 0.0,
  best_quiz_score DECIMAL(5,2) DEFAULT 0.0,
  
  -- Learning Progress
  first_attempted_at TIMESTAMPTZ,
  last_practiced_at TIMESTAMPTZ,
  last_validated_at TIMESTAMPTZ,
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_user_skills_proficiency ON user_skills(proficiency_level);
CREATE INDEX idx_user_skills_validated ON user_skills(is_validated, validation_status);
CREATE INDEX idx_user_skills_expires ON user_skills(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE user_skills IS 'User proficiency levels for each skill with validation tracking';
COMMENT ON COLUMN user_skills.confidence_score IS 'Statistical confidence in proficiency assessment (0-100)';

-- ============================================================================
-- SKILL VALIDATION RECORDS
-- ============================================================================

-- Individual validation attempts and results
CREATE TABLE IF NOT EXISTS skill_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  user_skill_id UUID REFERENCES user_skills(id) ON DELETE CASCADE,
  
  -- Validation Source
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  
  -- Validation Results
  validation_type VARCHAR(50) NOT NULL, -- 'quiz', 'assessment', 'course_completion', 'manual'
  validation_status validation_status NOT NULL DEFAULT 'pending',
  score DECIMAL(5,2), -- Score achieved (0-100)
  proficiency_level proficiency_level,
  
  -- Assessment Details
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  
  -- Status & Notes
  passed BOOLEAN,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For manual validations
  validation_notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_validations_user ON skill_validations(user_id);
CREATE INDEX idx_skill_validations_skill ON skill_validations(skill_id);
CREATE INDEX idx_skill_validations_user_skill ON skill_validations(user_skill_id);
CREATE INDEX idx_skill_validations_quiz_attempt ON skill_validations(quiz_attempt_id);
CREATE INDEX idx_skill_validations_status ON skill_validations(validation_status);
CREATE INDEX idx_skill_validations_attempted_at ON skill_validations(attempted_at DESC);

COMMENT ON TABLE skill_validations IS 'Individual skill validation attempts with results and expiry tracking';

-- ============================================================================
-- SKILL PREREQUISITES
-- ============================================================================

-- Define skill prerequisites and learning paths
CREATE TABLE IF NOT EXISTS skill_prerequisites (
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  prerequisite_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  required_proficiency proficiency_level DEFAULT 'beginner',
  is_mandatory BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (skill_id, prerequisite_skill_id),
  -- Prevent circular dependencies
  CONSTRAINT no_self_prerequisite CHECK (skill_id != prerequisite_skill_id)
);

CREATE INDEX idx_skill_prerequisites_skill ON skill_prerequisites(skill_id);
CREATE INDEX idx_skill_prerequisites_prerequisite ON skill_prerequisites(prerequisite_skill_id);

COMMENT ON TABLE skill_prerequisites IS 'Define prerequisite skills needed before learning advanced skills';

-- ============================================================================
-- VIEWS FOR SKILL ANALYTICS
-- ============================================================================

-- User skill summary view
CREATE OR REPLACE VIEW user_skills_summary AS
SELECT 
  us.user_id,
  s.category,
  s.regulatory_body,
  COUNT(DISTINCT us.skill_id) AS total_skills,
  COUNT(DISTINCT CASE WHEN us.is_validated THEN us.skill_id END) AS validated_skills,
  COUNT(DISTINCT CASE WHEN us.validation_status = 'expired' THEN us.skill_id END) AS expired_skills,
  COUNT(DISTINCT CASE WHEN us.proficiency_level IN ('advanced', 'expert') THEN us.skill_id END) AS advanced_skills,
  ROUND(AVG(us.proficiency_score), 2) AS avg_proficiency_score,
  ROUND(AVG(us.confidence_score), 2) AS avg_confidence_score,
  ROUND(AVG(us.average_quiz_score), 2) AS avg_quiz_score,
  MIN(us.first_attempted_at) AS first_practice_date,
  MAX(us.last_practiced_at) AS last_practice_date,
  SUM(us.total_assessments) AS total_assessments,
  SUM(us.passed_assessments) AS passed_assessments,
  SUM(us.courses_completed) AS courses_completed
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
WHERE s.is_active = true
GROUP BY us.user_id, s.category, s.regulatory_body;

COMMENT ON VIEW user_skills_summary IS 'Aggregated skill metrics by user, category, and regulatory body';

-- Skills needing renewal view
CREATE OR REPLACE VIEW skills_expiring_soon AS
SELECT 
  us.user_id,
  u.email,
  COALESCE(up.display_name, CONCAT(up.first_name, ' ', up.last_name)) as full_name,
  s.id AS skill_id,
  s.name AS skill_name,
  s.category,
  s.regulatory_body,
  us.proficiency_level,
  us.proficiency_score,
  us.expires_at,
  us.expires_at - CURRENT_DATE AS days_until_expiry,
  us.last_validated_at
FROM user_skills us
JOIN auth.users u ON us.user_id = u.id
LEFT JOIN profiles up ON us.user_id = up.id
JOIN skills s ON us.skill_id = s.id
WHERE us.expires_at IS NOT NULL
  AND us.expires_at <= CURRENT_DATE + INTERVAL '90 days'
  AND us.validation_status = 'validated'
  AND s.is_active = true
ORDER BY us.expires_at ASC;

COMMENT ON VIEW skills_expiring_soon IS 'Skills that will expire within 90 days';

-- Active validated skills view
CREATE OR REPLACE VIEW active_validated_skills AS
SELECT 
  us.user_id,
  us.skill_id,
  s.name AS skill_name,
  s.category,
  s.subcategory,
  s.regulatory_body,
  us.proficiency_level,
  us.proficiency_score,
  us.confidence_score,
  us.validated_at,
  us.expires_at,
  CASE 
    WHEN us.expires_at IS NULL THEN NULL
    ELSE us.expires_at - CURRENT_DATE
  END AS days_until_expiry,
  CASE 
    WHEN us.expires_at IS NULL THEN false
    WHEN us.expires_at <= CURRENT_DATE + INTERVAL '90 days' THEN true
    ELSE false
  END AS expiring_soon
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
WHERE us.is_validated = true
  AND us.validation_status = 'validated'
  AND (us.expires_at IS NULL OR us.expires_at > CURRENT_DATE)
  AND s.is_active = true;

COMMENT ON VIEW active_validated_skills IS 'Currently valid skills with expiry tracking';

-- ============================================================================
-- FUNCTIONS FOR SKILL MANAGEMENT
-- ============================================================================

-- Function: Get user skills dashboard data
CREATE OR REPLACE FUNCTION get_user_skills_dashboard(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Build comprehensive dashboard data
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
        'novice', COUNT(DISTINCT CASE WHEN proficiency_level = 'novice' THEN skill_id END),
        'beginner', COUNT(DISTINCT CASE WHEN proficiency_level = 'beginner' THEN skill_id END),
        'intermediate', COUNT(DISTINCT CASE WHEN proficiency_level = 'intermediate' THEN skill_id END),
        'advanced', COUNT(DISTINCT CASE WHEN proficiency_level = 'advanced' THEN skill_id END),
        'expert', COUNT(DISTINCT CASE WHEN proficiency_level = 'expert' THEN skill_id END),
        'avg_proficiency', ROUND(AVG(proficiency_score), 2),
        'avg_confidence', ROUND(AVG(confidence_score), 2),
        'total_assessments', SUM(total_assessments),
        'passed_assessments', SUM(passed_assessments),
        'pass_rate', CASE 
          WHEN SUM(total_assessments) > 0 
          THEN ROUND((SUM(passed_assessments)::DECIMAL / SUM(total_assessments)) * 100, 2)
          ELSE 0 
        END
      )
      FROM user_skills
      WHERE user_id = p_user_id
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_user_skills_dashboard IS 'Get comprehensive skills dashboard data for a user';

-- Function: Calculate skill proficiency from quiz performance
CREATE OR REPLACE FUNCTION calculate_skill_proficiency(
  p_user_id UUID,
  p_skill_id UUID,
  p_quiz_score DECIMAL
)
RETURNS proficiency_level
LANGUAGE plpgsql
AS $$
DECLARE
  v_proficiency proficiency_level;
BEGIN
  -- Map quiz score to proficiency level
  v_proficiency := CASE 
    WHEN p_quiz_score >= 90 THEN 'expert'::proficiency_level
    WHEN p_quiz_score >= 75 THEN 'advanced'::proficiency_level
    WHEN p_quiz_score >= 50 THEN 'intermediate'::proficiency_level
    WHEN p_quiz_score >= 25 THEN 'beginner'::proficiency_level
    ELSE 'novice'::proficiency_level
  END;
  
  RETURN v_proficiency;
END;
$$;

COMMENT ON FUNCTION calculate_skill_proficiency IS 'Convert quiz score to proficiency level';

-- Function: Validate skill from quiz attempt
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
  v_quiz_record RECORD;
  v_skill_record RECORD;
  v_user_skill_id UUID;
  v_proficiency proficiency_level;
  v_passed BOOLEAN;
  v_validation_status validation_status;
  v_expires_at TIMESTAMPTZ;
BEGIN
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

COMMENT ON FUNCTION validate_skill_from_quiz IS 'Update user skills based on quiz attempt performance';

-- Function: Get skill validation history
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
BEGIN
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

COMMENT ON FUNCTION get_skill_validation_history IS 'Get skill validation history for a user';

-- Function: Get recommended courses based on skill gaps
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
BEGIN
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

COMMENT ON FUNCTION get_recommended_courses_for_skills IS 'Recommend courses based on user skill gaps';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON skills TO authenticated;
GRANT SELECT ON course_skills TO authenticated;
GRANT SELECT ON lesson_skills TO authenticated;
GRANT SELECT ON question_skills TO authenticated;
GRANT SELECT ON skill_prerequisites TO authenticated;

GRANT SELECT, INSERT, UPDATE ON user_skills TO authenticated;
GRANT SELECT, INSERT ON skill_validations TO authenticated;

GRANT SELECT ON user_skills_summary TO authenticated;
GRANT SELECT ON skills_expiring_soon TO authenticated;
GRANT SELECT ON active_validated_skills TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_skills_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_skill_proficiency TO authenticated;
GRANT EXECUTE ON FUNCTION validate_skill_from_quiz TO authenticated;
GRANT EXECUTE ON FUNCTION get_skill_validation_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_courses_for_skills TO authenticated;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample skill categories
INSERT INTO skills (name, slug, category, subcategory, description, difficulty_level, min_quiz_score, expiry_months, color, order_index) VALUES
('Anti-Money Laundering Fundamentals', 'aml-fundamentals', 'Compliance', 'AML', 'Understanding AML regulations and detection techniques', 'beginner', 70, 24, '#ef4444', 1),
('Know Your Client Requirements', 'kyc-requirements', 'Compliance', 'KYC', 'Client identification and verification procedures', 'intermediate', 75, 24, '#f59e0b', 2),
('Mutual Fund Products', 'mutual-fund-products', 'Products', 'Investment Products', 'Understanding mutual fund structures and features', 'intermediate', 70, NULL, '#3b82f6', 3),
('Risk Assessment', 'risk-assessment', 'Analysis', 'Risk Management', 'Evaluating client risk profiles and suitability', 'advanced', 80, 12, '#8b5cf6', 4),
('Ethical Conduct', 'ethical-conduct', 'Ethics', 'Professional Standards', 'Professional ethics and conduct standards', 'beginner', 70, 36, '#10b981', 5),
('Portfolio Construction', 'portfolio-construction', 'Analysis', 'Asset Allocation', 'Building diversified investment portfolios', 'advanced', 75, NULL, '#06b6d4', 6),
('Regulatory Reporting', 'regulatory-reporting', 'Compliance', 'Reporting', 'Regulatory filing and reporting requirements', 'intermediate', 75, 24, '#f97316', 7),
('Client Communication', 'client-communication', 'Soft Skills', 'Communication', 'Effective client interaction and disclosure', 'beginner', 65, NULL, '#ec4899', 8)
ON CONFLICT (slug) DO NOTHING;
