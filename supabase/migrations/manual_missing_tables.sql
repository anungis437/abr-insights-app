-- Manual migration to create missing tables
-- Run this to fix the remaining missing tables

-- Resources table (if not exists from 003_content_tables.sql)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document', 'video', 'link', 'tool')),
  url TEXT,
  file_path TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- AI Chat Sessions (for AI assistant/coach features)
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'general' CHECK (session_type IN ('general', 'course', 'case_analysis', 'study')),
  context JSONB,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB
);

-- Leaderboard table (for gamification)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  week_points INTEGER DEFAULT 0,
  month_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Buddy Requests (for study buddies feature)
CREATE TABLE IF NOT EXISTS buddy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user_id, to_user_id)
);

-- Quiz Sessions (for quiz functionality) 
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  quiz_type TEXT DEFAULT 'practice' CHECK (quiz_type IN ('practice', 'assessment', 'final')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score DECIMAL(5,2),
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- seconds
  completed_at TIMESTAMPTZ
);

-- CE Credits and Claims
CREATE TABLE IF NOT EXISTS ce_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  credit_hours DECIMAL(4,2) NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('CPD', 'CLE', 'CE', 'CME')),
  accreditation_number TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS ce_credit_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ce_credit_id UUID REFERENCES ce_credits(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  certificate_id UUID REFERENCES certificates(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  UNIQUE(user_id, ce_credit_id)
);

-- SSO Connections (for enterprise SSO)
CREATE TABLE IF NOT EXISTS sso_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sso_provider_id UUID REFERENCES sso_providers(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  UNIQUE(sso_provider_id, external_user_id)
);

-- Ingestion Sources (for data ingestion pipeline)
CREATE TABLE IF NOT EXISTS ingestion_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('api', 'scraper', 'manual', 'file')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ
);

-- Social Features Tables
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('course_completed', 'quiz_passed', 'achievement_earned', 'buddy_added', 'comment_posted')),
  reference_id UUID, -- ID of the related entity (course, quiz, etc.)
  reference_type TEXT, -- Type of the related entity
  metadata JSONB,
  is_public BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  entity_id UUID NOT NULL, -- Course, lesson, or tribunal case ID
  entity_type TEXT NOT NULL CHECK (entity_type IN ('course', 'lesson', 'tribunal_case', 'resource')),
  is_edited BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL, -- Comment, course, etc.
  entity_type TEXT NOT NULL CHECK (entity_type IN ('comment', 'course', 'lesson')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'love', 'insightful')),
  UNIQUE(user_id, entity_id, reaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_users ON buddy_requests(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_lesson ON quiz_sessions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_ce_credit_claims_user ON ce_credit_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_connections_user ON sso_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_reactions_entity ON reactions(entity_id, entity_type);

-- Enable RLS on all tables
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ce_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ce_credit_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can access their own data)
CREATE POLICY "Users can view their own chat sessions" ON ai_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own chat sessions" ON ai_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their chat messages" ON ai_chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM ai_chat_sessions WHERE id = ai_chat_messages.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view leaderboard" ON leaderboard FOR SELECT USING (true);

CREATE POLICY "Users can view their buddy requests" ON buddy_requests FOR SELECT USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

CREATE POLICY "Users can create buddy requests" ON buddy_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update their buddy requests" ON buddy_requests FOR UPDATE USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

CREATE POLICY "Users can view their quiz sessions" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create quiz sessions" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their quiz sessions" ON quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view CE credits" ON ce_credits FOR SELECT USING (true);
CREATE POLICY "Users can view their credit claims" ON ce_credit_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create credit claims" ON ce_credit_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public activities" ON user_activities FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create their activities" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public resources are viewable" ON resources FOR SELECT USING (is_public = true OR auth.uid() = created_by);
