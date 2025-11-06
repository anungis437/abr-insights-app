# Complete Database Schema

**Status**: 🟢 Production Ready
**Database**: Supabase PostgreSQL 15+
**Extensions**: pgvector, pg_cron, pg_stat_statements
**Last Updated**: November 5, 2025

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [Learning Management](#learning-management)
4. [Gamification & Achievements](#gamification--achievements)
5. [Data Ingestion](#data-ingestion)
6. [AI & Analytics](#ai--analytics)
7. [Monetization (Stripe)](#monetization-stripe)
8. [System & Audit](#system--audit)
9. [Relationships & Constraints](#relationships--constraints)
10. [Indexes & Performance](#indexes--performance)

---

## Schema Overview

### Entity Relationship Diagram

```text
┌──────────────┐         ┌─────────────┐         ┌───────────────┐
│   profiles   │────────>│organizations│<────────│ subscriptions │
│              │         │             │         │  (Stripe)     │
└──────┬───────┘         └──────┬──────┘         └───────────────┘
       │                        │
       │                        │
       ├────────────────────────┼──────────────────────┐
       │                        │                      │
       v                        v                      v
┌──────────────┐         ┌─────────────┐       ┌─────────────┐
│   progress   │────────>│   courses   │       │    teams    │
│              │         │             │       │             │
└──────┬───────┘         └──────┬──────┘       └─────────────┘
       │                        │
       │                        v
       │                 ┌─────────────┐
       │                 │   lessons   │
       │                 │             │
       │                 └─────────────┘
       │
       v
┌──────────────┐         ┌──────────────────┐    ┌────────────────┐
│ certificates │         │ user_achievements │    │ learning_paths │
│              │         │                  │    │                │
└──────────────┘         └──────────────────┘    └────────────────┘

┌──────────────────┐     ┌─────────────────────┐
│ tribunal_cases   │────>│ tribunal_cases_raw  │
│                  │     │  (ingestion staging)│
└──────┬───────────┘     └─────────────────────┘
       │
       v
┌──────────────────┐     ┌─────────────────────┐
│   bookmarks      │     │   saved_searches    │
│                  │     │                     │
└──────────────────┘     └─────────────────────┘

┌──────────────────┐     ┌─────────────────────┐
│ ai_coaching_     │     │ classification_     │
│   sessions       │     │   feedback          │
└──────────────────┘     └─────────────────────┘
```

---

## Core Tables

### profiles

**Purpose**: User profiles with authentication (extends Supabase Auth users)

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr')),
  
  -- Organization & Role
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN (
    'super_admin', 'compliance_officer', 'org_admin', 
    'analyst', 'investigator', 'educator', 'learner', 'viewer', 'guest'
  )),
  
  -- Subscription (denormalized for performance)
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise', 'custom')),
  seat_id UUID REFERENCES subscription_seats(id) ON DELETE SET NULL,
  
  -- Security
  mfa_enabled BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "in_app": true}'::jsonb,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  timezone TEXT DEFAULT 'America/Toronto',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_profiles_org ON profiles(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_email ON profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_team ON profiles(team_id) WHERE deleted_at IS NULL;
```

### organizations

**Purpose**: Multi-tenant organizations (companies, government agencies, schools)

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  size_category TEXT CHECK (size_category IN ('1-50', '51-200', '201-500', '501-1000', '1000+')),
  
  -- Contact
  admin_email TEXT NOT NULL,
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  billing_email TEXT,
  
  -- Address (Canadian)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT CHECK (province IN (
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
  )),
  postal_code TEXT,
  country TEXT DEFAULT 'CA',
  
  -- Subscription
  subscription_id UUID REFERENCES subscriptions(id),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN (
    'trial', 'active', 'past_due', 'canceled', 'paused'
  )),
  trial_ends_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{
    "branding": {"logo_url": null, "primary_color": "#0d9488"},
    "features": {"ai_coach": true, "analytics": true, "custom_content": false},
    "compliance": {"sso_required": false, "mfa_required": false, "ip_whitelist": []}
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_orgs_admin ON organizations(admin_email);
CREATE INDEX idx_orgs_subscription ON organizations(subscription_id);
CREATE INDEX idx_orgs_status ON organizations(subscription_status) WHERE deleted_at IS NULL;
```

### teams

**Purpose**: Sub-groups within organizations (departments, cohorts)

```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Settings
  seat_allocation INTEGER DEFAULT 0, -- Number of seats allocated to this team
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_teams_lead ON teams(team_lead_id);
```

---

## Learning Management

### courses

**Purpose**: Training courses on anti-Black racism

```sql
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content (Bilingual)
  title_en TEXT NOT NULL,
  title_fr TEXT,
  description_en TEXT,
  description_fr TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'Foundations', 'Workplace', 'Legal', 'Leadership', 'Specialized', 'Certification'
  )),
  level TEXT NOT NULL CHECK (level IN ('Introductory', 'Intermediate', 'Advanced', 'Specialized')),
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Structure
  duration_minutes INTEGER NOT NULL,
  estimated_hours DECIMAL(4,2),
  lesson_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  
  -- Media
  thumbnail_url TEXT,
  video_intro_url TEXT,
  
  -- Access Control
  is_published BOOLEAN DEFAULT false,
  tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'professional', 'enterprise')),
  prerequisite_course_ids UUID[] DEFAULT '{}',
  
  -- Gamification
  points_value INTEGER DEFAULT 100,
  certificate_template_id UUID,
  
  -- Learning Outcomes
  learning_objectives TEXT[] DEFAULT '{}',
  competencies TEXT[] DEFAULT '{}',
  
  -- Tribunal Case Links
  featured_case_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_courses_category ON courses(category) WHERE is_published = true;
CREATE INDEX idx_courses_level ON courses(level) WHERE is_published = true;
CREATE INDEX idx_courses_tier ON courses(tier_required);
CREATE INDEX idx_courses_published ON courses(is_published, order_index);
CREATE INDEX idx_courses_tags ON courses USING gin(tags);
```

### lessons

**Purpose**: Individual lessons within courses

```sql
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Content (Bilingual)
  title_en TEXT NOT NULL,
  title_fr TEXT,
  content_en TEXT, -- Markdown/HTML
  content_fr TEXT,
  
  -- Structure
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('video', 'reading', 'quiz', 'interactive', 'case_study')),
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  
  -- Media
  video_url TEXT,
  audio_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- [{name, url, type, size}]
  
  -- Quiz Data (for lesson_type = 'quiz')
  quiz_questions JSONB, -- [{question, options, correct_answer, explanation}]
  pass_threshold INTEGER DEFAULT 70, -- Percentage
  
  -- Case Study (for lesson_type = 'case_study')
  tribunal_case_id UUID REFERENCES tribunal_cases(id),
  
  -- Completion Criteria
  requires_completion BOOLEAN DEFAULT true,
  min_time_seconds INTEGER, -- Minimum time to spend
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_lessons_course ON lessons(course_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_case ON lessons(tribunal_case_id) WHERE tribunal_case_id IS NOT NULL;
```

### progress

**Purpose**: User progress through courses and lessons

```sql
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  
  -- Progress Metrics
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER,
  
  -- Quiz Performance
  quiz_attempts INTEGER DEFAULT 0,
  quiz_best_score DECIMAL(5,2),
  quiz_last_score DECIMAL(5,2),
  quiz_passed BOOLEAN DEFAULT false,
  
  -- Time Tracking
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Bookmarks & Notes
  bookmarked BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_id, lesson_id)
);

CREATE INDEX idx_progress_user ON progress(user_id, last_accessed DESC);
CREATE INDEX idx_progress_course ON progress(course_id);
CREATE INDEX idx_progress_completion ON progress(completion_percentage);
CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);
```

### certificates

**Purpose**: Certificates awarded upon course completion

```sql
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Course
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  
  -- Certificate Info
  certificate_number TEXT UNIQUE NOT NULL, -- e.g., ABR-2025-001234
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE, -- Some certificates expire
  
  -- Performance
  final_score DECIMAL(5,2),
  completion_time_hours DECIMAL(6,2),
  
  -- Files
  pdf_url TEXT,
  verification_url TEXT, -- Public verification page
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_user ON certificates(user_id, issued_date DESC);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_status ON certificates(status);
```

---

## Gamification & Achievements

### user_achievements

**Purpose**: User points, badges, streaks, and leaderboard data

```sql
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Points System
  total_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Badges (array of badge slugs)
  badges_earned TEXT[] DEFAULT '{}',
  badge_timestamps JSONB DEFAULT '{}'::jsonb, -- {badge_slug: timestamp}
  
  -- Leaderboard Rank (updated periodically)
  global_rank INTEGER,
  organization_rank INTEGER,
  team_rank INTEGER,
  
  -- Milestones
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  certificates_earned INTEGER DEFAULT 0,
  cases_bookmarked INTEGER DEFAULT 0,
  coaching_sessions INTEGER DEFAULT 0,
  
  -- Level System
  level INTEGER DEFAULT 1,
  level_progress DECIMAL(5,2) DEFAULT 0, -- Progress to next level (0-100%)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_points ON user_achievements(total_points DESC);
CREATE INDEX idx_achievements_streak ON user_achievements(current_streak_days DESC);
CREATE INDEX idx_achievements_level ON user_achievements(level DESC, level_progress DESC);
```

### custom_badges

**Purpose**: Custom badges organizations can create

```sql
CREATE TABLE public.custom_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Badge Info
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  
  -- Criteria
  criteria_type TEXT CHECK (criteria_type IN ('manual', 'automated', 'hybrid')),
  criteria_config JSONB, -- {type: 'course_completion', course_ids: [...], threshold: 5}
  
  -- Rarity
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  points_value INTEGER DEFAULT 10,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_custom_badges_org ON custom_badges(organization_id) WHERE is_active = true;
```

### learning_paths

**Purpose**: Curated learning paths (sequences of courses)

```sql
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info (Bilingual)
  title_en TEXT NOT NULL,
  title_fr TEXT,
  description_en TEXT,
  description_fr TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Structure
  course_ids UUID[] NOT NULL, -- Ordered array of course IDs
  estimated_duration_hours DECIMAL(6,2),
  
  -- Classification
  category TEXT,
  level TEXT,
  
  -- Access
  is_published BOOLEAN DEFAULT false,
  tier_required TEXT DEFAULT 'free',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_published ON learning_paths(is_published);
```

---

## Data Ingestion

### tribunal_cases

**Purpose**: Curated Canadian tribunal cases (production data)

```sql
CREATE TABLE public.tribunal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Case Identification
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tribunal TEXT NOT NULL, -- HRTO, CHRT, BCHRT, etc.
  source_url TEXT NOT NULL,
  
  -- Date Info
  decision_date DATE,
  year INTEGER,
  
  -- Content (Bilingual)
  summary_en TEXT,
  summary_fr TEXT,
  full_text_en TEXT,
  full_text_fr TEXT,
  
  -- Classification
  outcome TEXT CHECK (outcome IN ('Upheld', 'Dismissed', 'Settled', 'Partially Upheld', 'Other')),
  protected_ground TEXT[] DEFAULT '{}', -- ['race', 'disability', 'gender', ...]
  discrimination_type TEXT[] DEFAULT '{}', -- ['hiring', 'harassment', 'accommodation', ...]
  
  -- Anti-Black Racism Specific
  race_category TEXT CHECK (race_category IN ('Anti-Black', 'General', 'Other', 'Unknown')),
  is_race_related BOOLEAN DEFAULT false,
  is_anti_black_specific BOOLEAN DEFAULT false,
  relevance_score DECIMAL(3,2) CHECK (relevance_score BETWEEN 0 AND 1),
  
  -- Legal Analysis
  precedent_value TEXT CHECK (precedent_value IN ('High', 'Medium', 'Low', 'Unknown')),
  key_legal_principles TEXT[] DEFAULT '{}',
  remedies_awarded TEXT[] DEFAULT '{}',
  monetary_award DECIMAL(12,2),
  
  -- AI-Generated
  ai_generated_summary TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  ai_confidence_score DECIMAL(3,2),
  ai_classification_model TEXT, -- 'gpt-4o', 'claude-3-opus', etc.
  ai_classified_at TIMESTAMPTZ,
  
  -- Educational Use
  keywords TEXT[] DEFAULT '{}',
  complexity_level TEXT CHECK (complexity_level IN ('Beginner', 'Intermediate', 'Advanced')),
  featured BOOLEAN DEFAULT false,
  
  -- Lineage (from ingestion)
  ingested_from_raw_id UUID REFERENCES tribunal_cases_raw(id),
  manually_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tribunal_year ON tribunal_cases(year DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_tribunal_tribunal ON tribunal_cases(tribunal);
CREATE INDEX idx_tribunal_race_cat ON tribunal_cases(race_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_tribunal_anti_black ON tribunal_cases(is_anti_black_specific) WHERE is_anti_black_specific = true;
CREATE INDEX idx_tribunal_featured ON tribunal_cases(featured) WHERE featured = true;
CREATE INDEX idx_tribunal_tags ON tribunal_cases USING gin(ai_tags);
CREATE INDEX idx_tribunal_grounds ON tribunal_cases USING gin(protected_ground);
CREATE INDEX idx_tribunal_discrimination ON tribunal_cases USING gin(discrimination_type);

-- Full-text search
CREATE INDEX idx_tribunal_fts ON tribunal_cases USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary_en, '') || ' ' || coalesce(full_text_en, ''))
);
```

### tribunal_cases_raw

**Purpose**: Staging table for ingested cases (before review/classification)

```sql
CREATE TABLE public.tribunal_cases_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  source_name TEXT NOT NULL, -- 'HRTO', 'CHRT', 'CanLII'
  source_url TEXT NOT NULL,
  scraper_version TEXT,
  
  -- Raw Data
  raw_html TEXT,
  raw_text TEXT,
  extracted_title TEXT,
  extracted_case_number TEXT,
  extracted_date DATE,
  extracted_tribunal TEXT,
  
  -- Initial Classification (AI)
  ai_classification JSONB, -- {is_race_related, is_anti_black, confidence, reasoning}
  rule_based_classification JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'classified', 'approved', 'rejected', 'duplicate'
  )),
  rejection_reason TEXT,
  
  -- Duplicate Detection
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of_case_id UUID REFERENCES tribunal_cases(id),
  
  -- Lineage
  ingestion_job_id UUID REFERENCES ingestion_jobs(id),
  promoted_to_case_id UUID REFERENCES tribunal_cases(id),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raw_cases_status ON tribunal_cases_raw(status);
CREATE INDEX idx_raw_cases_source ON tribunal_cases_raw(source_name);
CREATE INDEX idx_raw_cases_job ON tribunal_cases_raw(ingestion_job_id);
CREATE INDEX idx_raw_cases_duplicate ON tribunal_cases_raw(is_duplicate, duplicate_of_case_id);
```

### tribunal_sources

**Purpose**: Configuration for tribunal data sources

```sql
CREATE TABLE public.tribunal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source Info
  name TEXT UNIQUE NOT NULL, -- 'HRTO', 'CHRT', 'CanLII-HRTO'
  tribunal TEXT NOT NULL, -- 'Ontario Human Rights Tribunal'
  base_url TEXT NOT NULL,
  
  -- Scraper Config
  scraper_type TEXT DEFAULT 'generic' CHECK (scraper_type IN ('generic', 'hrto', 'chrt', 'canlii', 'custom')),
  scraper_config JSONB NOT NULL, -- Selectors, pagination, etc.
  
  -- Schedule
  is_active BOOLEAN DEFAULT true,
  schedule_cron TEXT DEFAULT '0 2 * * *', -- Daily at 2 AM
  priority INTEGER DEFAULT 5,
  
  -- Rate Limiting
  rate_limit_delay_seconds DECIMAL(5,2) DEFAULT 2.0,
  max_concurrent_requests INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_successful_run TIMESTAMPTZ,
  last_error TEXT
);

CREATE INDEX idx_sources_active ON tribunal_sources(is_active, priority DESC);
```

### ingestion_jobs

**Purpose**: Tracking of ingestion job runs

```sql
CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES tribunal_sources(id) ON DELETE CASCADE,
  
  -- Job Info
  job_type TEXT DEFAULT 'scheduled' CHECK (job_type IN ('scheduled', 'manual', 'backfill')),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  
  -- Progress
  items_fetched INTEGER DEFAULT 0,
  items_classified INTEGER DEFAULT 0,
  items_approved INTEGER DEFAULT 0,
  items_rejected INTEGER DEFAULT 0,
  items_duplicate INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Errors
  error_message TEXT,
  error_stack TEXT,
  
  -- Logs
  execution_log JSONB DEFAULT '[]'::jsonb, -- [{timestamp, level, message}]
  
  -- Metadata
  triggered_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_source ON ingestion_jobs(source_id, started_at DESC);
CREATE INDEX idx_jobs_status ON ingestion_jobs(status);
```

### classification_feedback

**Purpose**: User feedback on AI classifications for model improvement

```sql
CREATE TABLE public.classification_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Case Reference
  raw_case_id UUID REFERENCES tribunal_cases_raw(id) ON DELETE CASCADE,
  case_id UUID REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  
  -- Feedback
  ai_classification TEXT, -- What AI predicted
  user_classification TEXT, -- What user says it should be
  feedback_type TEXT CHECK (feedback_type IN ('correction', 'confirmation', 'suggestion')),
  
  -- Details
  comments TEXT,
  confidence_rating INTEGER CHECK (confidence_rating BETWEEN 1 AND 5),
  
  -- User
  reviewed_by UUID NOT NULL REFERENCES profiles(id),
  reviewed_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Training Flag
  used_for_training BOOLEAN DEFAULT false,
  training_batch_id UUID,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_raw_case ON classification_feedback(raw_case_id);
CREATE INDEX idx_feedback_case ON classification_feedback(case_id);
CREATE INDEX idx_feedback_training ON classification_feedback(used_for_training) WHERE used_for_training = false;
```

---

## AI & Analytics

### ai_coaching_sessions

**Purpose**: AI coach interactions and recommendations

```sql
CREATE TABLE public.ai_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session Info
  session_type TEXT NOT NULL CHECK (session_type IN (
    'comprehensive', 'at_risk', 'learning_path', 'motivation', 'custom'
  )),
  
  -- Input
  user_query TEXT,
  user_context JSONB, -- {progress, achievements, recent_activity}
  
  -- AI Response
  ai_response TEXT NOT NULL,
  ai_model TEXT, -- 'gpt-4o', 'claude-3-opus'
  ai_prompt TEXT,
  
  -- Recommendations
  recommended_actions JSONB, -- [{action, priority, reason}]
  recommended_courses UUID[] DEFAULT '{}',
  
  -- Feedback
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  was_helpful BOOLEAN,
  user_feedback TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coaching_user ON ai_coaching_sessions(user_id, created_at DESC);
CREATE INDEX idx_coaching_type ON ai_coaching_sessions(session_type);
```

### bookmarks

**Purpose**: User bookmarks for cases and resources

```sql
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Bookmarked Item
  resource_type TEXT NOT NULL CHECK (resource_type IN ('tribunal_case', 'course', 'lesson', 'resource', 'article')),
  resource_id UUID NOT NULL,
  
  -- Notes
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Organization
  folder TEXT DEFAULT 'default',
  is_favorite BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_resource ON bookmarks(resource_type, resource_id);
```

### saved_searches

**Purpose**: Saved search queries for data explorer

```sql
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Search Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Search Criteria
  filters JSONB NOT NULL, -- All filter values from data explorer
  
  -- Usage
  use_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  
  -- Notifications
  notify_on_new_results BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id, last_used DESC NULLS LAST);
```

### notifications

**Purpose**: In-app notifications

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification Content
  type TEXT NOT NULL CHECK (type IN (
    'course_assigned', 'course_completed', 'certificate_earned', 'badge_unlocked',
    'streak_milestone', 'new_content', 'system', 'coaching_tip', 'deadline_reminder'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Links
  link_url TEXT,
  link_text TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE read = false;
```

### resources

**Purpose**: Downloadable resources (templates, guides, toolkits)

```sql
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info (Bilingual)
  title_en TEXT NOT NULL,
  title_fr TEXT,
  description_en TEXT,
  description_fr TEXT,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'Template', 'Guide', 'Toolkit', 'Policy', 'Checklist', 'Report', 'Research', 'Other'
  )),
  tags TEXT[] DEFAULT '{}',
  
  -- File
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'pdf', 'docx', 'xlsx', 'pptx'
  file_size_bytes INTEGER,
  
  -- Access
  is_published BOOLEAN DEFAULT false,
  tier_required TEXT DEFAULT 'free',
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category) WHERE is_published = true;
CREATE INDEX idx_resources_tags ON resources USING gin(tags);
```

---

## Monetization (Stripe)

### subscriptions

**Purpose**: Stripe subscription management

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  -- Plan Details
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('free', 'professional', 'enterprise', 'custom')),
  plan_name TEXT NOT NULL, -- 'Professional - Annual'
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  
  -- Seats
  seat_count INTEGER NOT NULL DEFAULT 1,
  seats_used INTEGER DEFAULT 0,
  
  -- Pricing (CAD)
  amount_cents INTEGER NOT NULL, -- e.g., 199900 = $1999.00
  currency TEXT DEFAULT 'CAD',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'
  )),
  
  -- Dates
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  cancellation_feedback TEXT,
  
  -- Payment
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  last_payment_status TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_cust ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_date) WHERE status = 'active';
```

### subscription_seats

**Purpose**: Individual seats within organization subscriptions

```sql
CREATE TABLE public.subscription_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Assignment
  assigned_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to_email TEXT, -- Email if user not yet registered
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'active', 'suspended')),
  
  -- Team Assignment (optional)
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Usage Tracking
  first_login_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seats_subscription ON subscription_seats(subscription_id);
CREATE INDEX idx_seats_user ON subscription_seats(assigned_to_user_id);
CREATE INDEX idx_seats_status ON subscription_seats(status);
CREATE INDEX idx_seats_email ON subscription_seats(assigned_to_email) WHERE assigned_to_email IS NOT NULL;
```

### invoices

**Purpose**: Stripe invoice tracking

```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  
  -- Invoice Details
  invoice_number TEXT,
  amount_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  
  -- Tax (Canadian)
  tax_gst_cents INTEGER DEFAULT 0,
  tax_hst_cents INTEGER DEFAULT 0,
  tax_qst_cents INTEGER DEFAULT 0,
  tax_pst_cents INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Dates
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  -- Files
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id, created_at DESC);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### payment_methods

**Purpose**: Stored payment methods (Stripe)

```sql
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Card Details (last 4, brand, exp)
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Billing Address
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB, -- {line1, line2, city, province, postal_code, country}
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id) WHERE is_active = true;
CREATE INDEX idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);
```

### usage_tracking

**Purpose**: Track usage for metered billing features

```sql
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Metric
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'api_calls', 'ai_coach_sessions', 'data_exports', 'custom_courses', 'storage_gb'
  )),
  
  -- Usage
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- 'count', 'gb', 'hours'
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Billing
  is_billable BOOLEAN DEFAULT true,
  invoiced BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_org_period ON usage_tracking(organization_id, period_start, period_end);
CREATE INDEX idx_usage_metric ON usage_tracking(metric_type);
CREATE INDEX idx_usage_unbilled ON usage_tracking(is_billable, invoiced) WHERE is_billable = true AND invoiced = false;
```

---

## System & Audit

### audit_logs

**Purpose**: Comprehensive audit trail (already documented in RBAC_GOVERNANCE.md)

```sql
-- See RBAC_GOVERNANCE.md for complete schema
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  changes JSONB,
  organization_id UUID REFERENCES organizations(id),
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  compliance_relevant BOOLEAN DEFAULT false,
  retention_until TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 years'
);
```

### onboarding

**Purpose**: User onboarding progress

```sql
CREATE TABLE public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tour Progress
  tour_completed BOOLEAN DEFAULT false,
  tour_step_completed INTEGER DEFAULT 0,
  tour_dismissed BOOLEAN DEFAULT false,
  
  -- Checklist
  checklist_items JSONB DEFAULT '{}'::jsonb, -- {item_id: {completed, completed_at}}
  
  -- Role-Specific
  role_specific_completed JSONB DEFAULT '{}'::jsonb, -- {role: {completed, steps}}
  
  -- First Actions
  first_course_started BOOLEAN DEFAULT false,
  first_course_completed BOOLEAN DEFAULT false,
  first_search_performed BOOLEAN DEFAULT false,
  profile_completed BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_user ON onboarding(user_id);
```

### feature_flags

**Purpose**: Feature flag management

```sql
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Flag Info
  flag_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Status
  is_enabled BOOLEAN DEFAULT false,
  
  -- Targeting
  target_type TEXT DEFAULT 'global' CHECK (target_type IN ('global', 'tier', 'organization', 'user')),
  target_tiers TEXT[] DEFAULT '{}', -- ['professional', 'enterprise']
  target_org_ids UUID[] DEFAULT '{}',
  target_user_ids UUID[] DEFAULT '{}',
  
  -- Rollout
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;
```

---

## Relationships & Constraints

### Foreign Key Relationships

```sql
-- Core Relationships
profiles.organization_id → organizations.id
profiles.team_id → teams.id
profiles.seat_id → subscription_seats.id

teams.organization_id → organizations.id
teams.team_lead_id → profiles.id

-- Learning
lessons.course_id → courses.id
progress.user_id → profiles.id
progress.course_id → courses.id
progress.lesson_id → lessons.id
certificates.user_id → profiles.id
certificates.course_id → courses.id

-- Gamification
user_achievements.user_id → profiles.id (UNIQUE)
custom_badges.organization_id → organizations.id

-- Tribunal Data
tribunal_cases.ingested_from_raw_id → tribunal_cases_raw.id
tribunal_cases_raw.ingestion_job_id → ingestion_jobs.id
ingestion_jobs.source_id → tribunal_sources.id

-- AI & Analytics
ai_coaching_sessions.user_id → profiles.id
bookmarks.user_id → profiles.id
saved_searches.user_id → profiles.id
notifications.user_id → profiles.id

-- Monetization
subscriptions.organization_id → organizations.id (UNIQUE)
subscription_seats.subscription_id → subscriptions.id
subscription_seats.organization_id → organizations.id
subscription_seats.assigned_to_user_id → profiles.id
invoices.subscription_id → subscriptions.id
payment_methods.organization_id → organizations.id
```

### Cascade Behaviors

```sql
-- Deleting a profile:
- CASCADE: progress, certificates, user_achievements, bookmarks, saved_searches
- SET NULL: teams.team_lead_id, subscription_seats.assigned_to_user_id

-- Deleting an organization:
- CASCADE: teams, custom_badges, subscriptions, subscription_seats
- SET NULL: profiles.organization_id

-- Deleting a course:
- CASCADE: lessons
- RESTRICT: certificates (prevent deletion if certificates exist)

-- Deleting a subscription:
- CASCADE: subscription_seats, invoices
```

---

## Indexes & Performance

### Critical Indexes

```sql
-- User Lookups
CREATE INDEX idx_profiles_email ON profiles(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_org ON profiles(organization_id) WHERE deleted_at IS NULL;

-- Progress Queries
CREATE INDEX idx_progress_user_recent ON progress(user_id, last_accessed DESC);
CREATE INDEX idx_progress_completion ON progress(user_id, completion_percentage) WHERE completion_percentage < 100;

-- Tribunal Case Search
CREATE INDEX idx_tribunal_search ON tribunal_cases USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary_en, ''))
);
CREATE INDEX idx_tribunal_tags ON tribunal_cases USING gin(ai_tags);

-- Leaderboard
CREATE INDEX idx_achievements_leaderboard ON user_achievements(total_points DESC, level DESC);

-- Billing
CREATE INDEX idx_subscriptions_renewal ON subscriptions(next_payment_date, status) 
  WHERE status = 'active' AND cancel_at_period_end = false;
```

### Materialized Views for Analytics

```sql
-- Organization Analytics
CREATE MATERIALIZED VIEW org_analytics AS
SELECT
  o.id as organization_id,
  o.name,
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.completion_percentage > 0) as active_learners,
  COUNT(DISTINCT c.id) as total_certificates,
  AVG(pr.completion_percentage) as avg_completion,
  SUM(ua.total_points) as org_total_points
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id AND p.deleted_at IS NULL
LEFT JOIN progress pr ON pr.user_id = p.id
LEFT JOIN certificates c ON c.user_id = p.id
LEFT JOIN user_achievements ua ON ua.user_id = p.id
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name;

CREATE UNIQUE INDEX ON org_analytics(organization_id);

-- Refresh daily
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-org-analytics', '0 3 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY org_analytics');
```

---

## Summary

**Total Tables**: 30+

**Core**: profiles, organizations, teams
**Learning**: courses, lessons, progress, certificates
**Gamification**: user_achievements, custom_badges, learning_paths
**Ingestion**: tribunal_cases, tribunal_cases_raw, tribunal_sources, ingestion_jobs, classification_feedback
**AI**: ai_coaching_sessions, bookmarks, saved_searches, notifications, resources
**Monetization**: subscriptions, subscription_seats, invoices, payment_methods, usage_tracking
**System**: audit_logs, onboarding, feature_flags

**Next Steps**:

1. Create SQL migration scripts (001_core.sql through 010_indexes.sql)
2. Define RLS policies for all tables
3. Create Supabase RPC functions for complex queries
4. Set up real-time subscriptions
5. Configure pg_cron for automated jobs

**Feature Completeness**: ✅ All legacy features mapped and enhanced
