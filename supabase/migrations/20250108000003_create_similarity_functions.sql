-- Semantic similarity search functions
-- Migration: 20250108000003_create_similarity_functions.sql
-- Description: Creates database functions for vector similarity search

-- =====================================================
-- Search Similar Cases Function
-- =====================================================
CREATE OR REPLACE FUNCTION search_similar_cases(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10,
  filter_tribunal_name TEXT DEFAULT NULL,
  filter_discrimination_grounds TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  case_id UUID,
  case_title TEXT,
  tribunal_name TEXT,
  case_number TEXT,
  decision_date DATE,
  similarity_score FLOAT,
  discrimination_grounds TEXT[],
  case_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id AS case_id,
    tc.case_title,
    tc.tribunal_name,
    tc.case_number,
    tc.decision_date,
    (1 - (ce.embedding <=> query_embedding)) AS similarity_score,
    tc.discrimination_grounds,
    tc.case_url
  FROM case_embeddings ce
  JOIN tribunal_cases tc ON tc.id = ce.case_id
  WHERE 
    (1 - (ce.embedding <=> query_embedding)) >= similarity_threshold
    AND (filter_tribunal_name IS NULL OR tc.tribunal_name = filter_tribunal_name)
    AND (filter_discrimination_grounds IS NULL OR tc.discrimination_grounds && filter_discrimination_grounds)
    AND ce.embedding_type = 'full_text'
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Search Similar Courses Function
-- =====================================================
CREATE OR REPLACE FUNCTION search_similar_courses(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10,
  filter_difficulty TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  course_description TEXT,
  difficulty TEXT,
  category TEXT,
  similarity_score FLOAT,
  estimated_duration_minutes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS course_id,
    c.title AS course_title,
    c.description AS course_description,
    c.difficulty,
    c.category,
    (1 - (ce.embedding <=> query_embedding)) AS similarity_score,
    c.estimated_duration_minutes
  FROM course_embeddings ce
  JOIN courses c ON c.id = ce.course_id
  WHERE 
    (1 - (ce.embedding <=> query_embedding)) >= similarity_threshold
    AND (filter_difficulty IS NULL OR c.difficulty = filter_difficulty)
    AND (filter_category IS NULL OR c.category = filter_category)
    AND ce.embedding_type = 'full_content'
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Find Related Lessons Function
-- =====================================================
CREATE OR REPLACE FUNCTION find_related_lessons(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 5,
  exclude_course_id UUID DEFAULT NULL
)
RETURNS TABLE (
  lesson_id UUID,
  lesson_title TEXT,
  lesson_content TEXT,
  course_id UUID,
  course_title TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id AS lesson_id,
    l.title AS lesson_title,
    l.content AS lesson_content,
    c.id AS course_id,
    c.title AS course_title,
    (1 - (le.embedding <=> query_embedding)) AS similarity_score
  FROM lesson_embeddings le
  JOIN lessons l ON l.id = le.lesson_id
  JOIN courses c ON c.id = l.course_id
  WHERE 
    (1 - (le.embedding <=> query_embedding)) >= similarity_threshold
    AND (exclude_course_id IS NULL OR c.id != exclude_course_id)
    AND le.embedding_type = 'full_content'
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Find Duplicate Cases Function (for deduplication)
-- =====================================================
CREATE OR REPLACE FUNCTION find_duplicate_cases(
  target_case_id UUID,
  similarity_threshold FLOAT DEFAULT 0.95
)
RETURNS TABLE (
  duplicate_case_id UUID,
  case_title TEXT,
  case_number TEXT,
  tribunal_name TEXT,
  similarity_score FLOAT,
  decision_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id AS duplicate_case_id,
    tc.case_title,
    tc.case_number,
    tc.tribunal_name,
    (1 - (ce1.embedding <=> ce2.embedding)) AS similarity_score,
    tc.decision_date
  FROM case_embeddings ce1
  JOIN case_embeddings ce2 ON ce2.case_id = target_case_id 
    AND ce2.embedding_type = ce1.embedding_type
  JOIN tribunal_cases tc ON tc.id = ce1.case_id
  WHERE 
    ce1.case_id != target_case_id
    AND (1 - (ce1.embedding <=> ce2.embedding)) >= similarity_threshold
    AND ce1.embedding_type = 'full_text'
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Search Cases by Text Query (generates embedding on-the-fly)
-- =====================================================
CREATE OR REPLACE FUNCTION search_cases_by_text(
  query_text TEXT,
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  case_id UUID,
  case_title TEXT,
  tribunal_name TEXT,
  case_number TEXT,
  decision_date DATE,
  relevance_score FLOAT
) AS $$
DECLARE
  query_vec vector(1536);
BEGIN
  -- Note: In practice, this would call an external embedding API
  -- For now, we'll use a placeholder that needs to be implemented
  -- via application code that generates the embedding first
  
  RAISE NOTICE 'search_cases_by_text requires application-level embedding generation';
  
  -- Placeholder return
  RETURN QUERY
  SELECT 
    tc.id AS case_id,
    tc.case_title,
    tc.tribunal_name,
    tc.case_number,
    tc.decision_date,
    0.0::FLOAT AS relevance_score
  FROM tribunal_cases tc
  WHERE FALSE; -- Placeholder, should not return results
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Get Case Recommendations for User
-- =====================================================
CREATE OR REPLACE FUNCTION get_case_recommendations_for_user(
  user_id UUID,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  case_id UUID,
  case_title TEXT,
  tribunal_name TEXT,
  relevance_score FLOAT,
  recommendation_reason TEXT
) AS $$
DECLARE
  user_history_embedding vector(1536);
BEGIN
  -- Calculate user's learning profile embedding based on:
  -- 1. Cases they've viewed
  -- 2. Courses they're enrolled in
  -- 3. Their quiz performance patterns
  
  -- For now, this is a placeholder that needs sophisticated implementation
  -- combining multiple embeddings weighted by user activity
  
  RAISE NOTICE 'get_case_recommendations_for_user requires user profile embedding calculation';
  
  -- Placeholder return
  RETURN QUERY
  SELECT 
    tc.id AS case_id,
    tc.case_title,
    tc.tribunal_name,
    0.0::FLOAT AS relevance_score,
    'Based on your learning history'::TEXT AS recommendation_reason
  FROM tribunal_cases tc
  WHERE FALSE; -- Placeholder
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Statistics and Analytics Functions
-- =====================================================

-- Get embedding coverage statistics
CREATE OR REPLACE FUNCTION get_embedding_coverage_stats()
RETURNS TABLE (
  entity_type TEXT,
  total_entities BIGINT,
  embedded_entities BIGINT,
  coverage_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'tribunal_cases'::TEXT,
    COUNT(DISTINCT tc.id),
    COUNT(DISTINCT ce.case_id),
    ROUND((COUNT(DISTINCT ce.case_id)::NUMERIC / NULLIF(COUNT(DISTINCT tc.id), 0)) * 100, 2)
  FROM tribunal_cases tc
  LEFT JOIN case_embeddings ce ON ce.case_id = tc.id
  UNION ALL
  SELECT 
    'courses'::TEXT,
    COUNT(DISTINCT c.id),
    COUNT(DISTINCT coe.course_id),
    ROUND((COUNT(DISTINCT coe.course_id)::NUMERIC / NULLIF(COUNT(DISTINCT c.id), 0)) * 100, 2)
  FROM courses c
  LEFT JOIN course_embeddings coe ON coe.course_id = c.id
  UNION ALL
  SELECT 
    'lessons'::TEXT,
    COUNT(DISTINCT l.id),
    COUNT(DISTINCT le.lesson_id),
    ROUND((COUNT(DISTINCT le.lesson_id)::NUMERIC / NULLIF(COUNT(DISTINCT l.id), 0)) * 100, 2)
  FROM lessons l
  LEFT JOIN lesson_embeddings le ON le.lesson_id = l.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Indexes for query performance
-- =====================================================

-- Composite indexes for filtered similarity searches  
CREATE INDEX IF NOT EXISTS tribunal_cases_tribunal_name_idx ON tribunal_cases(tribunal_name);
CREATE INDEX IF NOT EXISTS tribunal_cases_decision_date_idx ON tribunal_cases(decision_date DESC);
-- Note: courses table doesn't have difficulty/category columns, those are in learning_paths
-- CREATE INDEX IF NOT EXISTS courses_difficulty_category_idx ON courses(difficulty, category);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON FUNCTION search_similar_cases IS 'Finds tribunal cases similar to a query embedding with optional filters';
COMMENT ON FUNCTION search_similar_courses IS 'Finds courses similar to a query embedding with difficulty/category filters';
COMMENT ON FUNCTION find_related_lessons IS 'Finds lessons related to a query embedding across all courses';
COMMENT ON FUNCTION find_duplicate_cases IS 'Detects potential duplicate tribunal cases based on high similarity';
COMMENT ON FUNCTION get_embedding_coverage_stats IS 'Returns statistics on embedding coverage across entity types';
