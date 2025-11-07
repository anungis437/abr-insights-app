# ABR Insights App - Refactor Strategy

**Version**: 2.1.0
**Date**: November 7, 2025
**Status**: In Progress - Phase 2 Complete ✅

## Executive Summary

This document outlines the comprehensive refactoring strategy for migrating the ABR Insights application from a Base44-dependent architecture to a modern, cloud-native stack using Supabase (PostgreSQL + Auth + Storage) and Azure Static Web Apps. This migration addresses competitive gaps, improves scalability, reduces vendor lock-in, and positions the platform for enterprise adoption.

### 🎯 Base44 Elimination Strategy

**Primary Goal**: Complete elimination of Base44 SDK and all legacy code

**Approach**:
1. ✅ **Phase 1-2 Complete**: Foundation (auth, UI components, ingestion)
2. 🔄 **Phase 3 (Current)**: Replace ALL `@base44/sdk` usage with Supabase service layer
3. **Phase 4-6**: Migrate all pages from `legacy/src/pages/` to Next.js `app/` router
4. **Phase 7**: **DELETE entire `legacy/` folder** - Base44 fully eliminated
5. **Phase 8**: Production launch with zero Base44 dependencies

**Timeline**: Legacy folder deletion targeted for end of Phase 7 (after all page migrations complete)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Target Architecture](#target-architecture)
3. [Migration Strategy](#migration-strategy)
4. [Technology Stack](#technology-stack)
5. [Data Migration Plan](#data-migration-plan)
6. [Feature Parity & Enhancements](#feature-parity--enhancements)
7. [Security & Compliance](#security--compliance)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Rollback Strategy](#rollback-strategy)
12. [Success Metrics](#success-metrics)

---

## Current State Analysis

### Existing Architecture (Legacy)

```text
┌─────────────────┐
│   React SPA     │
│   (Vite)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  @base44/sdk    │ ◄── Proprietary SDK (Vendor Lock-in)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Base44 API     │ ◄── Black Box Backend
│  (Closed)       │
└─────────────────┘
```

### Pain Points

1. **Vendor Lock-in**: Entire backend tied to Base44 proprietary service
2. **Limited Control**: Cannot optimize database queries or add custom indexes
3. **Scaling Concerns**: Unknown infrastructure limitations
4. **Cost Uncertainty**: Opaque pricing model
5. **Missing Features**: No real-time subscriptions, file storage, or edge functions
6. **Compliance Gaps**: Cannot implement WCAG 2.1 AA, AODA, or custom security policies
7. **Integration Challenges**: No native HRIS/SSO integration capabilities
8. **Data Portability**: Difficult to export or migrate data

### Strengths to Preserve

- ✅ Excellent UI/UX with shadcn/ui components
- ✅ Comprehensive gamification system
- ✅ Well-structured React component architecture
- ✅ AI-powered insights and recommendations
- ✅ Multi-tenant organization support
- ✅ Rich data visualization capabilities

---

## Target Architecture

### New Architecture (Supabase + Azure)

```text
┌─────────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React SPA   │  │    API       │  │   Azure      │      │
│  │  (Vite)      │  │  Functions   │  │  Functions   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase      │  │   Azure AI   │  │   Azure      │
│  ┌───────────┐  │  │   Services   │  │  Blob Store  │
│  │PostgreSQL │  │  │              │  │              │
│  ├───────────┤  │  └──────────────┘  └──────────────┘
│  │   Auth    │  │
│  ├───────────┤  │  ┌──────────────┐
│  │  Storage  │  │  │   SendGrid   │
│  ├───────────┤  │  │   (Email)    │
│  │  Realtime │  │  └──────────────┘
│  └───────────┘  │
└─────────────────┘
```

### Architecture Principles

1. **Cloud-Native**: Leverage managed services for scalability
2. **API-First**: RESTful + GraphQL APIs via Supabase
3. **Serverless**: Azure Functions for custom business logic
4. **Real-Time**: WebSocket support via Supabase Realtime
5. **Edge-Optimized**: Azure CDN for global performance
6. **Security-First**: Row-Level Security (RLS) + JWT authentication
7. **Observable**: Application Insights + Supabase Analytics
8. **Cost-Efficient**: Pay-per-use pricing model

---

## Migration Strategy

### Phase-Based Approach

#### Phase 1: Foundation & Authentication ✅ COMPLETE

**Goal**: Set up infrastructure and authentication layer

- [x] Provision Supabase project (PostgreSQL 15+)
- [x] Design and create database schema with RLS policies
- [x] Set up Next.js app with App Router
- [x] Configure authentication (Supabase Auth with SSR)
- [x] Implement AuthContext with React hooks
- [x] Create login/signup/reset password flows
- [x] Set up email verification callback
- [x] Test authentication end-to-end

**Deliverables**: ✅ All Complete

- ✅ Supabase database with all tables and relationships
- ✅ Authentication flow working (signup, login, email verification)
- ✅ Protected route middleware
- ✅ AuthContext providing global auth state
- ✅ Build successful (497 pages)

**Commit**: `481327e` (Nov 7, 2025)

#### Phase 2: Core UI Components & Ingestion System ✅ COMPLETE

**Goal**: Migrate UI components + Build automated ingestion pipeline

##### Sub-Phase 2A: UI Components Migration

- [x] Migrate Navigation component with Supabase auth state
- [x] Verify Footer component (already Next.js compatible)
- [x] Create ProtectedRoute wrapper component
- [x] Migrate utility hooks (useMobile to TypeScript)
- [x] Create component index files for easier imports
- [x] Verify shadcn/ui components work in Next.js

##### Sub-Phase 2B: Ingestion Pipeline (Complete - Separate Track)

- [x] Create `tribunal_cases_raw`, `tribunal_sources`, `ingestion_jobs` tables
- [x] Build scraper module with pluggable adapters (HRTO, CanLII)
- [x] Implement content fetcher with throttling/retry logic
- [x] Create rule-based classifier (keyword matching)
- [x] Integrate Azure OpenAI for AI classification
- [x] Build admin UI for reviewing ingested cases
- [x] Test end-to-end with demo data (35/35 tests passing)
- [x] Storage integration complete (Supabase + Azure Blob)

**Deliverables**: ✅ All Complete

- ✅ All UI components working in Next.js with auth integration
- ✅ Navigation shows user state (signed in/out)
- ✅ ProtectedRoute component for auth-required pages
- ✅ Working ingestion system with HRTO and CanLII sources
- ✅ Admin dashboard at `/admin/ingestion`
- ✅ AI classification with Azure OpenAI
- ✅ Build successful (497 pages)

**Commit**: `023d22f` (Nov 7, 2025)

**Note on Base44 Data**: Legacy Base44 data migration is **NOT REQUIRED**. The ingestion system replaces Base44 by fetching tribunal cases directly from public sources. No Base44 export needed.

#### Phase 3: Data Layer & Base44 Elimination (Current Phase)

**Goal**: Create Supabase service layer to replace ALL Base44 SDK usage

**Critical**: This phase eliminates ALL dependencies on `@base44/sdk`. The `legacy/` folder will be deleted after Phase 3.

- [ ] Create Supabase service layer (`lib/supabase/services/`)
  - [ ] `tribunalCases.ts` - Replace `base44.entities.TribunalCase`
  - [ ] `courses.ts` - Replace `base44.entities.Course`
  - [ ] `progress.ts` - Replace `base44.entities.Progress`
  - [ ] `achievements.ts` - Replace `base44.entities.UserAchievement`
  - [ ] `organizations.ts` - Replace `base44.entities.Organization`
  - [ ] `resources.ts` - Replace `base44.entities.Resource`
  - [ ] `notifications.ts` - Replace `base44.entities.Notification`
  - [ ] `bookmarks.ts` - Replace `base44.entities.Bookmark`
  - [ ] `certificates.ts` - Replace `base44.entities.Certificate`
  - [ ] (15+ more entity mappings - see MIGRATION_PLAN.md)
- [ ] Map all Base44 entity methods to Supabase PostgREST queries
- [ ] Implement Row-Level Security (RLS) policies for all tables
- [ ] Create React Query hooks for data fetching
- [ ] Replace `@base44/sdk` imports in legacy components
- [ ] Test data fetching with real Supabase data
- [ ] Verify NO remaining Base44 SDK imports

**Deliverables**:

- Complete Supabase service layer (20+ entity services)
- RLS policies active on all tables
- React Query hooks for all data operations
- Zero `@base44/sdk` imports remaining
- All tests passing with Supabase backend

**Post-Phase 3**: Delete `legacy/` folder entirely (Base44 eliminated)

#### Phase 4: Page Migration - Foundation & Data Pages

**Goal**: Migrate pages from `legacy/src/pages/` to Next.js `app/` router

**Note**: This phase uses the Supabase service layer from Phase 3.

- [ ] Migrate Profile page (`Profile.jsx` → `app/profile/page.tsx`)
- [ ] Migrate Dashboard (`Dashboard.jsx` → `app/dashboard/page.tsx`)
- [ ] Migrate Data Explorer (`DataExplorer.jsx` → `app/cases/browse/page.tsx`)
- [ ] Migrate Case Details (`CaseDetails.jsx` → `app/cases/[id]/page.tsx`)
- [ ] Update all data fetching to use Supabase services
- [ ] Test protected routes with ProtectedRoute component
- [ ] Verify all pages build successfully

**Deliverables**:

- Foundation pages migrated to Next.js
- All Base44 data fetching replaced with Supabase
- Protected routes working correctly

#### Phase 5: Page Migration - Training & Gamification

**Goal**: Migrate training and gamification features

- [ ] Migrate Training Hub (`TrainingHub.jsx` → `app/courses/page.tsx`)
- [ ] Migrate Course Player (`CoursePlayer.jsx` → `app/courses/[slug]/page.tsx`)
- [ ] Migrate Achievements (`Achievements.jsx` → `app/achievements/page.tsx`)
- [ ] Migrate Leaderboard (`Leaderboard.jsx` → `app/leaderboard/page.tsx`)
- [ ] Test gamification features with Supabase backend
- [ ] Verify progress tracking works correctly

**Deliverables**:

- Training and gamification features migrated
- Course completion tracking functional
- Achievements and leaderboards working

#### Phase 6: Page Migration - Admin & AI Features

**Goal**: Migrate admin and AI-powered features

- [ ] Migrate AI Assistant (`AIAssistant.jsx` → `app/ai/assistant/page.tsx`)
- [ ] Migrate AI Coach (`AICoach.jsx` → `app/ai/coach/page.tsx`)
- [ ] Migrate Data Ingestion UI (already at `app/admin/ingestion/page.tsx`)
- [ ] Migrate User Management (`UserManagement.jsx` → `app/admin/users/page.tsx`)
- [ ] Migrate Team Management (`TeamManagement.jsx` → `app/admin/teams/page.tsx`)
- [ ] Migrate Organization Settings (`OrgSettings.jsx` → `app/admin/org-settings/page.tsx`)
- [ ] Test admin features with role-based access

**Deliverables**:

- All admin pages migrated
- AI features integrated with Azure OpenAI
- Role-based access control working

#### Phase 7: Legacy Cleanup & Enhancement

**Goal**: Remove legacy code and add enterprise features

- [ ] **DELETE `legacy/` folder entirely** (Base44 eliminated)
- [ ] Remove all `@base44/sdk` dependencies from package.json
- [ ] Verify zero Base44 imports across entire codebase
- [ ] Implement SSO (SAML 2.0, OAuth 2.0)
- [ ] Add industry benchmarking features
- [ ] Build compliance reporting templates
- [ ] Implement WCAG 2.1 AA accessibility improvements
- [ ] Add mobile PWA support

**Deliverables**:

- Legacy folder deleted ✅
- Base44 completely eliminated ✅
- Enterprise features operational
- Accessibility audit passed

#### Phase 8: Testing & Launch

**Goal**: Comprehensive testing and production launch

- [ ] Load testing (10,000+ concurrent users)
- [ ] Security audit and penetration testing
- [ ] User acceptance testing (UAT)
- [ ] Beta launch with select users
- [ ] Monitor performance and fix issues
- [ ] Full production launch
- [ ] **Confirm Base44 decommissioned** ✅

**Deliverables**:

- Production-ready application
- Performance and security reports
- User migration complete
- Base44 fully replaced with Supabase

---

## Technology Stack

### Frontend

```json
{
  "framework": "React 18.3+",
  "buildTool": "Vite 6.0+",
  "language": "TypeScript 5.3+",
  "styling": "Tailwind CSS 3.4+",
  "uiLibrary": "shadcn/ui (Radix UI)",
  "stateManagement": "TanStack Query v5",
  "routing": "React Router v7",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts + D3.js",
  "animations": "Framer Motion",
  "icons": "Lucide React"
}
```

### Backend

```json
{
  "database": "Supabase (PostgreSQL 15)",
  "authentication": "Supabase Auth + Azure AD B2C",
  "storage": "Supabase Storage + Azure Blob",
  "realtime": "Supabase Realtime (WebSockets)",
  "serverless": "Azure Functions (Node.js 20)",
  "apiFramework": "Express.js",
  "orm": "Supabase Client (PostgREST)",
  "caching": "Redis (Azure Cache)"
}
```

### AI/ML

```json
{
  "llm": "Azure OpenAI Service (GPT-4o)",
  "embeddings": "Azure OpenAI (text-embedding-ada-002)",
  "vectorDB": "Supabase pgvector extension",
  "mlOps": "Azure Machine Learning"
}
```

### DevOps

```json
{
  "hosting": "Azure Static Web Apps",
  "cicd": "GitHub Actions",
  "monitoring": "Azure Application Insights",
  "logging": "Azure Log Analytics",
  "cdn": "Azure CDN",
  "dns": "Azure DNS"
}
```

### Testing

```json
{
  "unitTesting": "Vitest",
  "e2eTesting": "Playwright",
  "componentTesting": "Testing Library",
  "apiTesting": "Supertest",
  "loadTesting": "Artillery",
  "accessibility": "axe-core"
}
```

---

## Data Migration Plan

### Database Schema Design

#### Core Entities

##### Users Table (Supabase Auth integrated)

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('super_admin', 'admin', 'analyst', 'investigator', 'learner', 'viewer')),
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

##### Organizations Table

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org" ON organizations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = organizations.id
    )
  );
```

##### Tribunal Sources Table (Source Configuration)

```sql
CREATE TABLE public.tribunal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'HRTO', 'CHRT', 'CanLII'
  display_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  listing_url TEXT,
  scraper_config JSONB DEFAULT '{}',
  
  enabled BOOLEAN DEFAULT true,
  fetch_frequency TEXT DEFAULT 'daily',
  throttle_delay_ms INTEGER DEFAULT 2000,
  max_decisions_per_run INTEGER DEFAULT 50,
  
  classification_prompts JSONB DEFAULT '{}',
  
  last_fetch_at TIMESTAMPTZ,
  last_fetch_count INTEGER DEFAULT 0,
  total_fetched INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tribunal_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sources" ON tribunal_sources
  FOR SELECT USING (auth.role() = 'authenticated');
```

##### Tribunal Cases Raw Table (Ingestion Pipeline)

```sql
CREATE TABLE public.tribunal_cases_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE,
  url TEXT UNIQUE NOT NULL,
  decision_type TEXT,
  full_text TEXT,
  html_excerpt TEXT,
  
  is_race_related BOOLEAN DEFAULT false,
  is_anti_black_likely BOOLEAN DEFAULT false,
  grounds_detected TEXT[],
  confidence_scores JSONB DEFAULT '{}',
  ai_summary TEXT,
  
  processing_status TEXT DEFAULT 'pending',
  processing_error TEXT,
  
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_raw_status ON tribunal_cases_raw(processing_status);
CREATE INDEX idx_cases_raw_is_race ON tribunal_cases_raw(is_race_related);
CREATE INDEX idx_cases_raw_ingested ON tribunal_cases_raw(ingested_at DESC);

ALTER TABLE tribunal_cases_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view raw cases" ON tribunal_cases_raw
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

##### Tribunal Cases Table (Clean/Production)

```sql
CREATE TABLE public.tribunal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  year INTEGER,
  outcome TEXT,
  race_category TEXT,
  protected_ground TEXT[],
  discrimination_type TEXT[],
  summary_en TEXT,
  summary_fr TEXT,
  ai_generated_summary TEXT,
  keywords TEXT[],
  monetary_award DECIMAL(12, 2),
  precedent_value TEXT,
  url TEXT,
  embedding VECTOR(1536),
  source_id UUID REFERENCES tribunal_sources(id),
  ingested_from_raw_id UUID REFERENCES tribunal_cases_raw(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tribunal_cases_year ON tribunal_cases(year DESC);
CREATE INDEX idx_tribunal_cases_tribunal ON tribunal_cases(tribunal);
CREATE INDEX idx_tribunal_cases_outcome ON tribunal_cases(outcome);
CREATE INDEX idx_tribunal_cases_embedding ON tribunal_cases USING ivfflat (embedding vector_cosine_ops);

ALTER TABLE tribunal_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cases" ON tribunal_cases
  FOR SELECT USING (auth.role() = 'authenticated');
```

##### Ingestion Jobs Table (Job Tracking)

```sql
CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES tribunal_sources(id),
  job_status TEXT DEFAULT 'queued',
  run_type TEXT DEFAULT 'scheduled',
  
  decisions_discovered INTEGER DEFAULT 0,
  decisions_classified INTEGER DEFAULT 0,
  race_related_found INTEGER DEFAULT 0,
  anti_black_found INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_source ON ingestion_jobs(source_id);
CREATE INDEX idx_jobs_status ON ingestion_jobs(job_status);

ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view jobs" ON ingestion_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

##### Courses Table

```sql
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_fr TEXT,
  description_en TEXT,
  description_fr TEXT,
  category TEXT,
  level TEXT,
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER,
  tier_required TEXT DEFAULT 'free',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses visible to all" ON courses
  FOR SELECT USING (is_published = true);
```

##### User Progress Table

```sql
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

##### User Achievements Table

```sql
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]',
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
```

### Migration Scripts

#### Script 1: Export from Base44

```typescript
// scripts/export-base44-data.ts
import { base44 } from '../legacy/src/api/base44Client';
import fs from 'fs';

async function exportData() {
  console.log('Exporting tribunal cases...');
  const cases = await base44.entities.TribunalCase.list();
  fs.writeFileSync('./migration/cases.json', JSON.stringify(cases, null, 2));

  console.log('Exporting courses...');
  const courses = await base44.entities.Course.list();
  fs.writeFileSync('./migration/courses.json', JSON.stringify(courses, null, 2));

  console.log('Exporting users...');
  // Note: May need special access for user data
  const users = await base44.entities.User.list();
  fs.writeFileSync('./migration/users.json', JSON.stringify(users, null, 2));

  console.log('Export complete!');
}

exportData();
```

#### Script 2: Transform and Import to Supabase

```typescript
// scripts/import-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import cases from './migration/cases.json';
import courses from './migration/courses.json';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function importCases() {
  console.log(`Importing ${cases.length} tribunal cases...`);
  
  // Batch insert (1000 at a time)
  for (let i = 0; i < cases.length; i += 1000) {
    const batch = cases.slice(i, i + 1000);
    const { error } = await supabase
      .from('tribunal_cases')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
    } else {
      console.log(`Imported ${i + batch.length} cases`);
    }
  }
}

async function importCourses() {
  console.log(`Importing ${courses.length} courses...`);
  
  const { error } = await supabase
    .from('courses')
    .insert(courses);
  
  if (error) {
    console.error('Error importing courses:', error);
  } else {
    console.log('Courses imported successfully');
  }
}

async function migrate() {
  await importCases();
  await importCourses();
  console.log('Migration complete!');
}

migrate();
```

#### Script 3: Automated Ingestion (Azure Function)

```typescript
// api/functions/ingest-tribunal-cases.ts
import { app, InvocationContext, Timer } from '@azure/functions';
import { createClient } from '@supabase/supabase-js';
import { AzureOpenAI } from 'openai';
import * as cheerio from 'cheerio';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2024-08-01-preview',
});

// Pluggable scraper interface
interface ScraperAdapter {
  name: string;
  discoverDecisions(config: any): Promise<DecisionLink[]>;
  fetchContent(url: string): Promise<DecisionContent>;
}

interface DecisionLink {
  title: string;
  url: string;
  date: string;
  decisionType?: string;
}

interface DecisionContent {
  fullText: string;
  htmlExcerpt: string;
}

// HRTO Scraper Implementation
class HRTOScraper implements ScraperAdapter {
  name = 'HRTO';

  async discoverDecisions(config: any): Promise<DecisionLink[]> {
    const response = await fetch(config.listing_url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const decisions: DecisionLink[] = [];
    $(config.scraper_config.selector).each((i, elem) => {
      if (i >= config.max_decisions_per_run) return false;
      
      decisions.push({
        title: $(elem).text().trim(),
        url: $(elem).attr('href') || '',
        date: $(elem).closest('.result').find('.date').text() || '',
      });
    });
    
    return decisions;
  }

  async fetchContent(url: string): Promise<DecisionContent> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Throttle
    
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove navigation, headers, footers
    $('nav, header, footer, .sidebar').remove();
    
    const fullText = $('.decision-content').text().trim();
    const htmlExcerpt = $('.decision-content').html()?.substring(0, 5000) || '';
    
    return { fullText, htmlExcerpt };
  }
}

// Rule-based classifier
function ruleBasedClassification(text: string) {
  const lowerText = text.toLowerCase();
  
  const raceKeywords = ['race', 'racial', 'colour', 'color', 'ancestry', 'ethnic'];
  const blackKeywords = ['black', 'anti-black', 'african', 'caribbean'];
  const discriminationKeywords = ['discrimination', 'discriminatory', 'profiling', 'harassment', 'bias'];
  
  const isRaceRelated = raceKeywords.some(kw => lowerText.includes(kw)) &&
                        discriminationKeywords.some(kw => lowerText.includes(kw));
  
  const isAntiBlackLikely = blackKeywords.some(kw => lowerText.includes(kw)) && isRaceRelated;
  
  const groundsDetected = [];
  if (lowerText.includes('race') || lowerText.includes('racial')) groundsDetected.push('race');
  if (lowerText.includes('colour') || lowerText.includes('color')) groundsDetected.push('colour');
  if (lowerText.includes('ancestry')) groundsDetected.push('ancestry');
  if (lowerText.includes('place of origin')) groundsDetected.push('place_of_origin');
  
  return { isRaceRelated, isAntiBlackLikely, groundsDetected };
}

// AI-based classifier
async function aiClassification(text: string) {
  const prompt = `Analyze this human rights tribunal decision and answer:

1. Is this decision about discrimination on the basis of race or colour? (Yes/No)
2. Does the fact pattern indicate a Black complainant or anti-Black context? (Yes/No)
3. What protected grounds are mentioned? (race, colour, ancestry, place_of_origin, etc.)
4. Provide a 2-3 sentence summary of the key facts.

Decision text:
${text.substring(0, 4000)}

Respond in JSON format:
{
  "is_race_related": true/false,
  "race_confidence": 0.0-1.0,
  "is_anti_black_likely": true/false,
  "anti_black_confidence": 0.0-1.0,
  "grounds_detected": [],
  "summary": ""
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert in Canadian human rights law and anti-Black racism analysis.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

// Main ingestion function
export async function ingestTribunalCases(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('Starting tribunal ingestion job');

  // Get active sources
  const { data: sources } = await supabase
    .from('tribunal_sources')
    .select('*')
    .eq('enabled', true);

  if (!sources?.length) {
    context.log('No active sources found');
    return;
  }

  for (const source of sources) {
    context.log(`Processing source: ${source.name}`);

    // Create job record
    const { data: job } = await supabase
      .from('ingestion_jobs')
      .insert({
        source_id: source.id,
        run_type: 'scheduled',
        max_decisions: source.max_decisions_per_run,
        job_status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    try {
      // Initialize scraper
      const scraper = new HRTOScraper(); // TODO: Factory pattern for multiple sources

      // Discover decisions
      const decisions = await scraper.discoverDecisions(source);
      context.log(`Discovered ${decisions.length} decisions`);

      await supabase
        .from('ingestion_jobs')
        .update({ decisions_discovered: decisions.length })
        .eq('id', job.id);

      let raceRelatedCount = 0;
      let antiBlackCount = 0;

      // Process each decision
      for (const decision of decisions) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('tribunal_cases_raw')
            .select('id')
            .eq('url', decision.url)
            .single();

          if (existing) {
            context.log(`Skipping existing decision: ${decision.url}`);
            continue;
          }

          // Fetch content
          const content = await scraper.fetchContent(decision.url);

          // Classify
          const ruleResults = ruleBasedClassification(content.fullText);
          const aiResults = await aiClassification(content.fullText);

          // Merge classifications (AI takes precedence)
          const isRaceRelated = aiResults.is_race_related || ruleResults.isRaceRelated;
          const isAntiBlackLikely = aiResults.is_anti_black_likely || ruleResults.isAntiBlackLikely;
          const groundsDetected = [...new Set([...aiResults.grounds_detected, ...ruleResults.groundsDetected])];

          if (isRaceRelated) raceRelatedCount++;
          if (isAntiBlackLikely) antiBlackCount++;

          // Store in raw table
          await supabase.from('tribunal_cases_raw').insert({
            source: source.name,
            title: decision.title,
            date: decision.date,
            url: decision.url,
            full_text: content.fullText,
            html_excerpt: content.htmlExcerpt,
            decision_type: decision.decisionType,
            is_race_related: isRaceRelated,
            is_anti_black_likely: isAntiBlackLikely,
            grounds_detected: groundsDetected,
            confidence_scores: {
              race_related: aiResults.race_confidence,
              anti_black: aiResults.anti_black_confidence
            },
            ai_summary: aiResults.summary,
            processing_status: 'classified'
          });

          context.log(`✓ Classified: ${decision.title} (Race: ${isRaceRelated}, Anti-Black: ${isAntiBlackLikely})`);

        } catch (error) {
          context.error(`Error processing decision ${decision.url}:`, error);
          await supabase.from('tribunal_cases_raw').insert({
            source: source.name,
            url: decision.url,
            title: decision.title,
            processing_status: 'failed',
            processing_error: error.message
          });
        }
      }

      // Update job as completed
      await supabase
        .from('ingestion_jobs')
        .update({
          job_status: 'completed',
          decisions_fetched: decisions.length,
          decisions_classified: raceRelatedCount + antiBlackCount,
          race_related_found: raceRelatedCount,
          anti_black_found: antiBlackCount,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Update source statistics
      await supabase
        .from('tribunal_sources')
        .update({
          last_fetch_at: new Date().toISOString(),
          last_fetch_count: decisions.length,
          total_fetched: source.total_fetched + decisions.length,
          total_classified: source.total_classified + raceRelatedCount
        })
        .eq('id', source.id);

      context.log(`✅ Completed ${source.name}: ${raceRelatedCount} race-related, ${antiBlackCount} anti-Black`);

    } catch (error) {
      context.error(`Error processing source ${source.name}:`, error);
      await supabase
        .from('ingestion_jobs')
        .update({
          job_status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }
  }

  context.log('Ingestion job completed');
}

// Schedule: Run daily at 2 AM
app.timer('ingestTribunalCases', {
  schedule: '0 0 2 * * *', // Daily at 2 AM
  handler: ingestTribunalCases
});
```

---

## Feature Parity & Enhancements

### Must-Have Features (Parity)

| Feature | Legacy | New | Notes |
|---------|--------|-----|-------|
| Authentication | ✅ Base44 | ✅ Supabase Auth | Add SSO support |
| User Profiles | ✅ | ✅ | Enhanced with avatars |
| Data Explorer | ✅ | ✅ | Add real-time filters |
| Advanced Filters | ✅ | ✅ | Improved performance |
| AI Insights Panel | ✅ | ✅ | Azure OpenAI |
| Training Hub | ✅ | ✅ | Add video support |
| Course Player | ✅ | ✅ | Track video progress |
| Gamification | ✅ | ✅ | Add leaderboards |
| Certificates | ✅ | ✅ | PDF generation |
| Dashboard | ✅ | ✅ | Real-time updates |
| Org Management | ✅ | ✅ | Enhanced analytics |
| Notifications | ✅ | ✅ | Push + Email |
| Global Search | ✅ | ✅ | Semantic search |
| **Data Ingestion** | ⚠️ Manual | ✅ Automated | Scheduled scraping |
| **Ingestion Admin** | ❌ | ✅ | View/manage ingestion jobs |

### New Features (Competitive Advantages)

| Feature | Priority | Status | Impact |
|---------|----------|--------|--------|
| **Automated Ingestion Pipeline** | P0 | 🟡 In Design | Core data source |
| **SSO (SAML/OAuth)** | P0 | 🔴 Not Started | Enterprise requirement |
| **Industry Benchmarking** | P0 | 🔴 Not Started | Key differentiator |
| **Compliance Reports** | P0 | 🔴 Not Started | Regulatory requirement |
| **WCAG 2.1 AA** | P0 | 🔴 Not Started | Legal requirement |
| **Multi-Source Scrapers** | P1 | 🔴 Not Started | CHRT, BCHRT, NSHRC |
| **Live Webinars** | P1 | 🔴 Not Started | Engagement driver |
| **HRIS Integration** | P1 | 🔴 Not Started | Enterprise feature |
| **Mobile PWA** | P1 | 🔴 Not Started | User convenience |
| **Ingestion Quality Dashboard** | P2 | 🔴 Not Started | Admin tool |
| **Community Forums** | P2 | 🔴 Not Started | User engagement |
| **White-Label** | P2 | 🔴 Not Started | Enterprise sales |
| **API Marketplace** | P3 | 🔴 Not Started | Ecosystem |

---

## Security & Compliance

### Authentication Strategy

**Multi-Provider Support**:

```typescript
// Supabase Auth Providers
// - Email/Password (Built-in)
// - Magic Link (Passwordless)
// - OAuth (Google, Microsoft, LinkedIn)
// - SAML 2.0 (Enterprise SSO via Azure AD B2C)
// - Azure Active Directory (Native)

// Implementation
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// SSO Login
async function loginWithSSO(provider: 'azure' | 'google') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      scopes: 'email profile openid',
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
}
```

### Advanced RBAC & Governance

🔐 **Enterprise-Grade Security**: Our RBAC system meets the **highest Canadian governance, transparency, and security standards** required for government, public sector, and highly regulated enterprise deployments.

**Key Features**:

- **Granular Permissions** - 50+ action-level permissions across 10+ resource types
- **Multi-Tenancy Isolation** - Complete data segregation with RLS policies
- **Comprehensive Audit Logging** - Immutable logs tracking who, what, when, where, why, how
- **Data Classification** - Public, Internal, Confidential, Restricted levels
- **Delegation Framework** - Time-bound temporary access with full audit trail
- **MFA Enforcement** - Required for admin roles with high-risk permissions
- **Session Management** - 8-hour inactivity timeout, IP whitelisting (enterprise)
- **Zero Trust Architecture** - Never trust, always verify approach

**User Roles**:

1. **super_admin** - Platform-wide access (ABR Insights staff only)
2. **compliance_officer** - Audit logs, compliance reports, governance
3. **org_admin** - Manage organization users and settings
4. **analyst** - Advanced data analysis and reporting
5. **investigator** - View cases, conduct investigations
6. **educator** - Create and manage training content
7. **learner** - Complete training, view own progress
8. **viewer** - Read-only access to published content

**Permission Model**:

Permissions follow the `resource.action` pattern (e.g., `tribunal_cases.export`, `users.create`). Each user inherits role-based permissions plus user-specific grants/revocations. High-risk actions require MFA and are logged with full context.

**Example RLS Policies**:

```sql
-- Multi-tenant data isolation
CREATE POLICY "org_data_isolation" ON progress
  FOR ALL USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    ) OR auth.uid() = user_id
  );

-- Dynamic data classification enforcement
CREATE POLICY "classified_data_access" ON tribunal_cases
  FOR SELECT USING (
    -- Public: Everyone | Internal: Authenticated | Confidential: Admins/Investigators | Restricted: Super Admins
    NOT EXISTS (SELECT 1 FROM data_classifications WHERE resource_id = tribunal_cases.id) OR
    EXISTS (
      SELECT 1 FROM data_classifications dc
      JOIN profiles p ON p.id = auth.uid()
      WHERE dc.resource_id = tribunal_cases.id
      AND (
        (dc.classification = 'public') OR
        (dc.classification = 'internal' AND auth.role() = 'authenticated') OR
        (dc.classification = 'confidential' AND p.role IN ('super_admin', 'org_admin', 'investigator', 'compliance_officer')) OR
        (dc.classification = 'restricted' AND p.role = 'super_admin')
      )
    )
  );
```

**Audit Logging**:

Every sensitive action (data exports, user changes, permission grants, deletions) is logged with:

- **Who**: User ID, email, role, impersonation context
- **What**: Action, resource type/ID, before/after changes
- **When**: Timestamp with millisecond precision
- **Where**: IP address, user agent, geolocation
- **Why**: User-provided reason for sensitive operations
- **How**: Session ID, request ID, query parameters

Audit logs are **immutable** (no UPDATE/DELETE allowed) and retained for **7 years** per PIPEDA requirements.

**📚 Full Documentation**: See [RBAC_GOVERNANCE.md](./RBAC_GOVERNANCE.md) for comprehensive implementation guide including:

- Detailed permission matrix (50+ permissions)
- Complete RLS policy library
- Delegation API and workflows
- Compliance automation (PIPEDA, SOC 2, ISO 27001)
- Security controls catalog
- Incident response procedures

### Data Protection

- **Encryption at Rest**: AES-256 (Supabase + Azure default)
- **Encryption in Transit**: TLS 1.3 with perfect forward secrecy
- **PII Masking**: Automatic for logs, analytics, and exports
- **Data Residency**: Supabase Canada region (Toronto), Azure Canada Central
- **Audit Logs**: Comprehensive logging with 7-year retention
- **Backup Strategy**: Daily automated backups with 30-day retention, encrypted at rest
- **Data Sovereignty**: All data stored in Canadian data centers for PIPEDA compliance

### Compliance Requirements

| Standard | Status | Implementation |
|----------|--------|----------------|
| **PIPEDA** (Canada) | ✅ Planned | Canada region, consent management, data minimization, right to erasure |
| **GDPR** (EU) | ✅ Planned | Data portability, right to erasure, explicit consent |
| **WCAG 2.1 AA** | 🔴 Required | Accessibility audit + remediation (keyboard nav, screen readers, ARIA) |
| **AODA** (Ontario) | 🔴 Required | Accessibility standards, annual accessibility plans |
| **SOC 2 Type II** | ✅ Inherited | Supabase + Azure certifications (audit annually) |
| **ISO 27001** | ✅ Inherited | Azure certification (information security management) |
| **Treasury Board** (Canada) | ✅ Planned | Government of Canada security standards alignment |
| **FOIPPA** (BC) | ✅ Planned | Freedom of Information and Protection of Privacy Act |
| **FIPPA** (Ontario) | ✅ Planned | Freedom of Information and Protection of Privacy Act |

**Bilingual Support**: All UI components and documentation available in English and French (official languages of Canada).

---

## Performance Optimization

### Target Metrics

| Metric | Target | Current | Strategy |
|--------|--------|---------|----------|
| **Time to First Byte (TTFB)** | < 200ms | TBD | Azure CDN, edge caching |
| **First Contentful Paint (FCP)** | < 1.5s | TBD | Code splitting, lazy loading |
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD | Image optimization, preload |
| **Time to Interactive (TTI)** | < 3.5s | TBD | Minimize JavaScript |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD | Skeleton loaders |
| **API Response Time (p95)** | < 500ms | TBD | Database indexing, caching |
| **Concurrent Users** | 10,000+ | TBD | Horizontal scaling |

### Optimization Strategies

#### 1. Database Optimization

```sql
-- Materialized views for complex queries
CREATE MATERIALIZED VIEW org_analytics AS
SELECT
  o.id as organization_id,
  o.name,
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(DISTINCT pr.course_id) as courses_started,
  AVG(pr.completion_percentage) as avg_completion,
  SUM(ua.total_points) as total_org_points
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id
LEFT JOIN progress pr ON pr.user_id = p.id
LEFT JOIN user_achievements ua ON ua.user_id = p.id
GROUP BY o.id, o.name;

-- Refresh strategy (cron job every hour)
REFRESH MATERIALIZED VIEW CONCURRENTLY org_analytics;
```

#### 2. Caching Strategy

```typescript
// Redis caching layer
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Check cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const data = await fetcher();
  
  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

// Usage
const cases = await getCachedData(
  'tribunal:cases:all',
  () => supabase.from('tribunal_cases').select('*'),
  3600 // 1 hour TTL
);
```

#### 3. Frontend Optimization

```typescript
// Code splitting by route
const DataExplorer = lazy(() => import('./pages/DataExplorer'));
const TrainingHub = lazy(() => import('./pages/TrainingHub'));

// Prefetch critical data
useEffect(() => {
  // Prefetch on idle
  requestIdleCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['courses'],
      queryFn: fetchCourses
    });
  });
}, []);

// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

#### 4. Image Optimization

```typescript
// Automatic WebP conversion + CDN
const optimizedImageUrl = (url: string, width: number) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/render/image/public/${url}?width=${width}&format=webp`;
};

// Usage
<img
  src={optimizedImageUrl('avatars/user.jpg', 400)}
  srcSet={`
    ${optimizedImageUrl('avatars/user.jpg', 400)} 1x,
    ${optimizedImageUrl('avatars/user.jpg', 800)} 2x
  `}
  alt="User avatar"
  loading="lazy"
/>
```

---

## Testing Strategy

### Test Pyramid

```text
       /\
      /E2E\          10% - End-to-End Tests
     /______\
    /        \
   /Integration\    30% - Integration Tests
  /____________\
 /              \
/  Unit Tests    \  60% - Unit Tests
/__________________\
```

### Unit Tests (Vitest)

```typescript
// src/lib/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { hasPermission } from './permissions';

describe('Permission System', () => {
  it('should grant admin full access', () => {
    const user = { role: 'admin', organization_id: '123' };
    expect(hasPermission(user, 'data_access', 'view_all_cases')).toBe(true);
  });

  it('should restrict viewer access', () => {
    const user = { role: 'viewer', organization_id: '123' };
    expect(hasPermission(user, 'sync_jobs', 'create_jobs')).toBe(false);
  });
});
```

### Integration Tests (Supabase)

```typescript
// tests/integration/auth.test.ts
import { createClient } from '@supabase/supabase-js';

describe('Authentication Flow', () => {
  it('should sign up new user', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
  });

  it('should enforce RLS policies', async () => {
    // Try to access another user's data
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', 'another-user-id');

    expect(data).toHaveLength(0); // Should be empty due to RLS
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/data-explorer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Data Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should filter cases by year', async ({ page }) => {
    await page.goto('/data-explorer');
    
    // Select year filter
    await page.click('[data-testid="year-filter"]');
    await page.click('text=2020');
    
    // Wait for results
    await page.waitForSelector('[data-testid="case-card"]');
    
    // Verify all cases are from 2020
    const cases = await page.$$eval(
      '[data-testid="case-year"]',
      (els) => els.map(el => el.textContent)
    );
    
    expect(cases.every(year => year === '2020')).toBe(true);
  });
});
```

### Load Testing (Artillery)

```yaml
# tests/load/api-load-test.yml
config:
  target: "https://abr-insights.azurestaticapps.net"
  phases:
    - duration: 300
      arrivalRate: 10
      rampTo: 100
      name: "Ramp up to 100 users/sec"
    - duration: 600
      arrivalRate: 100
      name: "Sustained load"

scenarios:
  - name: "Browse cases"
    flow:
      - get:
          url: "/api/cases"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 2
      - get:
          url: "/api/cases/{{ caseId }}"
```

---

## Deployment Plan

### Azure Static Web Apps Configuration

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["admin", "super_admin"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".woff2": "font/woff2"
  }
}
```

### GitHub Actions Workflow

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "dist"
```

### Environment Variables

```bash
# .env.example

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc... # Server-side only

# Azure
AZURE_OPENAI_ENDPOINT=https://xxxxx.openai.azure.com
AZURE_OPENAI_API_KEY=xxxxx
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@abrinsights.com

# Redis (Azure Cache)
REDIS_URL=redis://xxxxx.redis.cache.windows.net:6380
REDIS_PASSWORD=xxxxx

# Application
VITE_APP_URL=https://abrinsights.com
NODE_ENV=production
```

---

## Rollback Strategy

### Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Feature flags configured for new features
- [ ] Monitoring dashboards set up
- [ ] Rollback script tested
- [ ] Stakeholders notified
- [ ] Support team briefed

### Rollback Triggers

1. **Critical Errors**: Error rate > 5%
2. **Performance Degradation**: Response time > 3s (p95)
3. **Authentication Failures**: > 10% failure rate
4. **Data Integrity Issues**: Inconsistent data detected
5. **User Complaints**: > 50 support tickets in 1 hour

### Rollback Procedure

```bash
# 1. Revert to previous deployment
az staticwebapp deployment rollback \
  --name abr-insights-app \
  --resource-group rg-abr-insights \
  --deployment-id <previous-deployment-id>

# 2. Restore database if needed
pg_restore -U postgres -d abr_insights backup_YYYYMMDD.dump

# 3. Update DNS if necessary (instant)
# 4. Notify users via status page
# 5. Post-mortem analysis
```

### Feature Flags

```typescript
// Use feature flags to gradually roll out features
const flags = await supabase
  .from('feature_flags')
  .select('*')
  .single();

if (flags.data.enable_benchmarking) {
  // Show benchmarking feature
}

// Gradual rollout (10% of users)
const rolloutPercentage = 10;
const userHash = hashCode(user.id);
if (userHash % 100 < rolloutPercentage) {
  // Enable for this user
}
```

---

## Success Metrics

### Technical Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **API Latency (p95)** | TBD | < 500ms | Application Insights |
| **Error Rate** | TBD | < 0.1% | Logs + Monitoring |
| **Uptime** | TBD | 99.9% | Status page |
| **Database Queries/sec** | TBD | 10,000+ | Supabase metrics |
| **Concurrent Users** | TBD | 10,000+ | Load testing |
| **Bundle Size** | TBD | < 500KB (gzipped) | Webpack analyzer |

### Business Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| **User Adoption** | 0 | 1,000 users | 3 months |
| **Course Completion Rate** | 45% | 65% | 6 months |
| **Daily Active Users** | TBD | 500+ | 6 months |
| **Enterprise Customers** | 0 | 10 | 12 months |
| **Revenue (ARR)** | $0 | $100K | 12 months |
| **Customer Satisfaction (NPS)** | TBD | 50+ | Ongoing |

### Migration Success Criteria

- [ ] Zero data loss during migration
- [ ] < 1 hour downtime for cutover
- [ ] All users successfully migrated
- [ ] Feature parity achieved (100%)
- [ ] Performance improved by 50%
- [ ] Cost reduced by 30%
- [ ] Zero security incidents
- [ ] User satisfaction maintained (NPS ≥ baseline)

---

## Next Steps

### Immediate Actions (This Week)

1. **Provision Infrastructure**
   - Create Supabase project
   - Set up Azure Static Web Apps
   - Configure GitHub Actions

2. **Team Alignment**
   - Review refactor plan with stakeholders
   - Assign responsibilities
   - Set up communication channels

3. **Technical Setup**
   - Initialize new repository structure
   - Set up local development environment
   - Create database schema scripts

### Week 1 Deliverables

- [ ] Supabase project live
- [ ] Azure Static Web Apps configured
- [ ] CI/CD pipeline operational
- [ ] Database schema created (including ingestion tables)
- [ ] Authentication flow working
- [ ] First API endpoint deployed
- [ ] Ingestion prototype with HRTO source (20 decisions)

### Resources Needed

- **Developers**: 2-3 full-stack engineers
- **DevOps**: 1 Azure specialist
- **QA**: 1 tester (part-time)
- **Designer**: 1 UX designer (for accessibility)
- **Budget**: ~$2,000/month (Supabase Pro + Azure)

---

## Conclusion

This refactor represents a strategic investment in the platform's future. By migrating from Base44 to Supabase + Azure, we gain:

1. **Full Control**: Own the entire stack
2. **Scalability**: Cloud-native architecture
3. **Cost Efficiency**: Transparent pricing
4. **Enterprise Readiness**: SSO, compliance, benchmarking
5. **Competitive Edge**: Close all identified gaps
6. **Future-Proof**: Modern, maintainable codebase

The migration will be executed in phases with minimal risk and maximum value delivery. Success will be measured by technical performance, user satisfaction, and business growth.

---

**Document Status**: 📝 Draft
**Last Updated**: November 5, 2025
**Next Review**: Weekly during migration
**Feedback**: Please submit comments via GitHub Issues

---

## Appendix

### A. Glossary

- **RLS**: Row-Level Security
- **PWA**: Progressive Web App
- **SSO**: Single Sign-On
- **SAML**: Security Assertion Markup Language
- **WCAG**: Web Content Accessibility Guidelines
- **AODA**: Accessibility for Ontarians with Disabilities Act
- **PIPEDA**: Personal Information Protection and Electronic Documents Act

### B. References

- [Supabase Documentation](https://supabase.com/docs)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [React 18 Migration Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### C. Contact

- **Project Lead**: TBD
- **Technical Architect**: TBD
- **Product Owner**: TBD
