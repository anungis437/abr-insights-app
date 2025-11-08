-- Migration: Quiz System Tables
-- Description: Question bank, quiz assignments, attempts, and results
-- Author: System
-- Date: 2025-11-07

-- ============================================================================
-- QUESTION BANK TABLES
-- ============================================================================

-- Question types enumeration
CREATE TYPE question_type AS ENUM (
  'multiple_choice',
  'multiple_response',
  'true_false',
  'matching',
  'fill_blank',
  'drag_drop_order',
  'case_study',
  'calculation',
  'essay'
);

-- Difficulty levels
CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question_type question_type NOT NULL,
  difficulty_level difficulty_level DEFAULT 'intermediate',
  question_text TEXT NOT NULL,
  question_html TEXT, -- Rich text version
  explanation TEXT, -- Explanation shown after answer
  points INTEGER DEFAULT 1,
  time_limit_seconds INTEGER, -- Optional time limit per question
  order_index INTEGER DEFAULT 0,
  tags TEXT[], -- For categorization and filtering
  metadata JSONB DEFAULT '{}', -- Flexible storage for question-specific data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Answer options table (for multiple choice, multiple response, matching)
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  option_html TEXT, -- Rich text version
  is_correct BOOLEAN DEFAULT false,
  feedback TEXT, -- Specific feedback for this option
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question pools (for random selection)
CREATE TABLE IF NOT EXISTS question_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Many-to-many: questions in pools
CREATE TABLE IF NOT EXISTS pool_questions (
  pool_id UUID REFERENCES question_pools(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 1, -- For weighted random selection
  PRIMARY KEY (pool_id, question_id)
);

-- ============================================================================
-- QUIZ ASSIGNMENT TABLES
-- ============================================================================

-- Quiz configuration and scheduling
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  quiz_type VARCHAR(50) DEFAULT 'assessment', -- assessment, practice, certification
  passing_score INTEGER DEFAULT 70, -- Percentage
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER, -- Total quiz time limit
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT true, -- After completion
  show_explanations BOOLEAN DEFAULT true,
  allow_review BOOLEAN DEFAULT true,
  require_completion BOOLEAN DEFAULT false, -- Must complete to proceed
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Questions assigned to quizzes
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  question_pool_id UUID REFERENCES question_pools(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 1, -- Override default question points
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  
  -- Either question_id OR question_pool_id must be set, not both
  CONSTRAINT quiz_questions_source_check CHECK (
    (question_id IS NOT NULL AND question_pool_id IS NULL) OR
    (question_id IS NULL AND question_pool_id IS NOT NULL)
  )
);

-- ============================================================================
-- QUIZ ATTEMPTS & RESULTS
-- ============================================================================

-- Student quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  score NUMERIC(5,2), -- 0-100 percentage
  points_earned INTEGER,
  points_possible INTEGER,
  passed BOOLEAN,
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, submitted, graded
  answers JSONB DEFAULT '[]', -- Snapshot of user answers
  metadata JSONB DEFAULT '{}',
  
  UNIQUE (quiz_id, user_id, attempt_number)
);

-- Individual question responses
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  answer_data JSONB NOT NULL, -- Flexible storage for different question types
  is_correct BOOLEAN,
  points_earned NUMERIC(5,2),
  points_possible NUMERIC(5,2),
  time_spent_seconds INTEGER,
  flagged BOOLEAN DEFAULT false, -- Student flagged for review
  grader_feedback TEXT, -- For essay/manual grading
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Questions indexes
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_lesson ON questions(lesson_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

-- Question options indexes
CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_question_options_order ON question_options(question_id, order_index);

-- Quiz indexes
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);
CREATE INDEX idx_quizzes_available ON quizzes(available_from, available_until);

-- Quiz questions indexes
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_question ON quiz_questions(question_id);
CREATE INDEX idx_quiz_questions_pool ON quiz_questions(question_pool_id);

-- Attempts indexes
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_composite ON quiz_attempts(quiz_id, user_id, attempt_number);

-- Responses indexes
CREATE INDEX idx_quiz_responses_attempt ON quiz_responses(attempt_id);
CREATE INDEX idx_quiz_responses_question ON quiz_responses(question_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- Questions: Admins can manage, students can view published questions
CREATE POLICY "Admins can manage all questions"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Students can view active questions in enrolled courses"
  ON questions FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = questions.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Question options: Same as questions
CREATE POLICY "Admins can manage all question options"
  ON question_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Students can view options for accessible questions"
  ON question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN enrollments ON enrollments.course_id = questions.course_id
      WHERE questions.id = question_options.question_id
      AND questions.is_active = true
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Quizzes: Admins manage, students view published quizzes in enrolled courses
CREATE POLICY "Admins can manage all quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Students can view published quizzes in enrolled courses"
  ON quizzes FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Quiz attempts: Users can manage their own attempts
CREATE POLICY "Users can manage their own quiz attempts"
  ON quiz_attempts FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- Quiz responses: Users can manage their own responses
CREATE POLICY "Users can manage their own quiz responses"
  ON quiz_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all quiz responses"
  ON quiz_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger for questions
CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_updated_at();

-- Update timestamp trigger for quizzes
CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_updated_at();

-- Function to calculate quiz score
CREATE OR REPLACE FUNCTION calculate_quiz_score(attempt_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_points NUMERIC;
  earned_points NUMERIC;
  score_percentage NUMERIC;
BEGIN
  -- Calculate total possible points and earned points
  SELECT 
    COALESCE(SUM(points_possible), 0),
    COALESCE(SUM(points_earned), 0)
  INTO total_points, earned_points
  FROM quiz_responses
  WHERE attempt_id = attempt_id_param;
  
  -- Calculate percentage
  IF total_points > 0 THEN
    score_percentage := (earned_points / total_points) * 100;
  ELSE
    score_percentage := 0;
  END IF;
  
  -- Update the attempt record
  UPDATE quiz_attempts
  SET 
    score = score_percentage,
    points_earned = earned_points,
    points_possible = total_points,
    passed = score_percentage >= (
      SELECT passing_score FROM quizzes WHERE id = (
        SELECT quiz_id FROM quiz_attempts WHERE id = attempt_id_param
      )
    )
  WHERE id = attempt_id_param;
  
  RETURN score_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to get next attempt number
CREATE OR REPLACE FUNCTION get_next_attempt_number(quiz_id_param UUID, user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  next_attempt INTEGER;
BEGIN
  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO next_attempt
  FROM quiz_attempts
  WHERE quiz_id = quiz_id_param
  AND user_id = user_id_param;
  
  RETURN next_attempt;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample question for testing (commented out for production)
/*
INSERT INTO questions (course_id, question_type, difficulty_level, question_text, explanation, points)
VALUES (
  (SELECT id FROM courses LIMIT 1),
  'multiple_choice',
  'intermediate',
  'What is the primary purpose of continuing education for financial advisors?',
  'Continuing education ensures advisors stay current with regulations, products, and best practices to serve clients effectively.',
  1
);
*/

COMMENT ON TABLE questions IS 'Question bank for quizzes and assessments';
COMMENT ON TABLE question_options IS 'Answer options for multiple choice, multiple response, and matching questions';
COMMENT ON TABLE question_pools IS 'Collections of questions for random selection';
COMMENT ON TABLE quizzes IS 'Quiz configuration and scheduling';
COMMENT ON TABLE quiz_attempts IS 'Student attempts at quizzes';
COMMENT ON TABLE quiz_responses IS 'Individual question responses within quiz attempts';
