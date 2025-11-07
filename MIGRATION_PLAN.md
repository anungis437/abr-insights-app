# Legacy Application Migration Plan

**Date**: November 7, 2025  
**Status**: Phase 2 Complete ✅ - Starting Phase 3  
**Goal**: Migrate legacy React+Vite+Base44 app to Next.js 15 + Supabase architecture

## 🎯 Base44 Elimination Strategy

**CRITICAL**: This migration completely eliminates Base44 SDK. The `legacy/` folder will be **DELETED** after all pages are migrated.

**Progress**:
- ✅ Phase 1: Foundation & Authentication (Commit: `481327e`)
- ✅ Phase 2: Core UI Components (Commit: `023d22f`)
- 🔄 Phase 3: Data Layer (Current) - Replaces ALL `@base44/sdk` usage
- ⏳ Phase 4-6: Page Migration (moves all pages from `legacy/` to `app/`)
- ⏳ Phase 7: **DELETE `legacy/` folder entirely**
- ⏳ Phase 8: Final Testing & Deployment

---

## 🔍 Legacy Application Analysis

### Technology Stack (Legacy)
- **Framework**: React 18.3 + Vite 6.0
- **Backend**: Base44 SDK (proprietary, vendor lock-in)
- **UI Library**: shadcn/ui (Radix UI) + Tailwind CSS
- **State**: TanStack Query v5
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod

### Application Structure

```
legacy/src/
├── api/                    [Base44 SDK integration - NEEDS REPLACEMENT]
│   ├── base44Client.js     # Main client (appId: 690bbbdf28265eac6f4907af)
│   ├── entities.js         # Entity exports (20+ entities)
│   └── integrations.js     # LLM integration
│
├── pages/                  [22 pages - MIGRATE TO app/ router]
│   ├── Home.jsx           # Marketing landing page
│   ├── Dashboard.jsx      # User dashboard (Base44 auth, entities)
│   ├── CaseDetails.jsx    # Tribunal case detail view
│   ├── DataExplorer.jsx   # Main data exploration interface
│   ├── DataIngestion.jsx  # Admin ingestion management
│   ├── TrainingHub.jsx    # Course catalog
│   ├── CoursePlayer.jsx   # Course video player + progress
│   ├── Library.jsx        # Resource library
│   ├── AIAssistant.jsx    # AI chat interface
│   ├── AICoach.jsx        # Coaching interface
│   ├── AIModelManagement.jsx # AI model admin
│   ├── Analytics.jsx      # Analytics dashboard
│   ├── Profile.jsx        # User profile management
│   ├── Achievements.jsx   # Gamification achievements
│   ├── Leaderboard.jsx    # Leaderboard display
│   ├── OrgDashboard.jsx   # Organization dashboard
│   ├── OrgSettings.jsx    # Organization settings
│   ├── TeamManagement.jsx # Team management
│   ├── UserManagement.jsx # User administration
│   ├── Resources.jsx      # Resources page
│   ├── Layout.jsx         # Layout wrapper
│   └── index.jsx          # Page exports
│
├── components/            [Organized by feature - PRESERVE STRUCTURE]
│   ├── ai/               # AI-related components
│   ├── coaching/         # Coaching components
│   ├── explorer/         # Data explorer components
│   ├── gamification/     # Achievements, badges, points
│   ├── ingestion/        # Admin ingestion UI
│   ├── player/           # Course player components
│   ├── shared/           # Shared components (Navigation, Footer)
│   └── ui/               # shadcn/ui components (KEEP AS-IS)
│
├── hooks/                [Custom React hooks]
│   └── use-mobile.jsx    # Mobile detection hook
│
├── lib/                  [Utilities - MINIMAL CHANGES]
│   └── utils.ts          # Helper functions
│
└── utils/                [Utility functions]
    └── [various helpers]
```

### Base44 SDK Usage Analysis

**Critical Dependencies** (20+ matches found):
- `base44.entities.TribunalCase` - Tribunal case CRUD
- `base44.entities.Course` - Course management
- `base44.entities.Lesson` - Lesson management
- `base44.entities.Progress` - User progress tracking
- `base44.entities.Organization` - Organization data
- `base44.entities.Certificate` - Certificates
- `base44.entities.Notification` - Notifications
- `base44.entities.Bookmark` - User bookmarks
- `base44.entities.Resource` - Resource library
- `base44.entities.Onboarding` - Onboarding flow
- `base44.entities.UserAchievement` - Gamification
- `base44.entities.AICoachingSession` - AI coaching
- `base44.entities.CustomBadge` - Custom badges
- `base44.entities.LearningPath` - Learning paths
- `base44.entities.NotificationPreference` - Notification settings
- `base44.entities.SyncJob` - Data sync jobs
- `base44.entities.ClassificationFeedback` - AI feedback
- `base44.entities.TrainingJob` - AI training jobs
- `base44.entities.AutomatedTrainingConfig` - AI config
- `base44.entities.SavedSearch` - Saved searches
- `base44.integrations.Core.InvokeLLM` - LLM invocation

**Impact**: Every page and component using Base44 SDK requires API replacement.

---

## 🎯 Migration Strategy

### Phase 1: Foundation & Authentication ✅ COMPLETE
**Goal**: Set up Next.js app structure + Supabase auth

#### Tasks
- [x] Create Next.js 14 app structure (already exists in `app/`)
- [x] Verify Supabase setup (database schema from `create_tables.sql`)
- [x] Create Supabase client utility (`lib/supabase.ts` exists)
- [x] Implement Supabase Auth (replace Base44 auth)
  - [x] Signup flow (`app/auth/signup/`)
  - [x] Login flow (`app/auth/login/`)
  - [x] Password reset (`app/auth/reset-password/`)
  - [x] Forgot password (`app/auth/forgot-password/`)
- [x] Create auth context/hooks
- [x] Test authentication end-to-end

**Deliverables**:
- ✅ Working Supabase authentication
- ✅ User session management
- ✅ Protected routes working
- ✅ AuthContext with useAuth and useRequireAuth hooks
- ✅ Email verification callback route

---

### Phase 2: Core UI Components ✅ COMPLETE
**Goal**: Migrate reusable components to Next.js

#### Tasks
- [x] Migrate `components/ui/` (shadcn/ui components - NO CHANGES NEEDED)
- [x] Migrate `components/shared/Navigation.tsx` (updated with Supabase auth)
- [x] Migrate `components/shared/Footer.tsx` (NO CHANGES NEEDED - already Next.js compatible)
- [x] Create shared layout components (ProtectedRoute wrapper)
- [x] Migrate utility hooks (`use-mobile.jsx` → `lib/hooks/use-mobile.ts`)
- [x] Test components build successfully

**Deliverables**:
- ✅ All UI components working in Next.js
- ✅ Navigation shows user state (signed in/out)
- ✅ ProtectedRoute component for auth-required pages
- ✅ useMobile hook migrated to TypeScript
- ✅ Component index files for easier imports
- ✅ Build successful (497 pages)

---

### Phase 3: Data Layer - Base44 SDK Elimination (Current Phase)
**Goal**: Replace ALL Base44 entities with Supabase service layer

**CRITICAL**: This phase eliminates ALL `@base44/sdk` imports. No Base44 code will remain after this phase.

#### Tasks
- [ ] Create Supabase service layer (`lib/supabase/services/`)
  - [ ] `tribunalCases.ts` - Replace `base44.entities.TribunalCase`
  - [ ] `courses.ts` - Replace `base44.entities.Course`
  - [ ] `lessons.ts` - Replace `base44.entities.Lesson`
  - [ ] `progress.ts` - Replace `base44.entities.Progress`
  - [ ] `achievements.ts` - Replace `base44.entities.UserAchievement`
  - [ ] `organizations.ts` - Replace `base44.entities.Organization`
  - [ ] `resources.ts` - Replace `base44.entities.Resource`
  - [ ] `notifications.ts` - Replace `base44.entities.Notification`
  - [ ] `bookmarks.ts` - Replace `base44.entities.Bookmark`
  - [ ] `certificates.ts` - Replace `base44.entities.Certificate`
  - [ ] `onboarding.ts` - Replace `base44.entities.Onboarding`
  - [ ] `aiSessions.ts` - Replace `base44.entities.AICoachingSession`
  - [ ] `badges.ts` - Replace `base44.entities.CustomBadge`
  - [ ] `learningPaths.ts` - Replace `base44.entities.LearningPath`
  - [ ] `savedSearches.ts` - Replace `base44.entities.SavedSearch`
  - [ ] (5+ more services as needed)
- [ ] Map ALL Base44 entity methods to Supabase PostgREST queries
- [ ] Implement Row-Level Security (RLS) policies for all tables
- [ ] Create React Query hooks for all data operations
- [ ] Create index file `lib/supabase/services/index.ts` for exports
- [ ] Test all service methods with Supabase backend
- [ ] **Verify ZERO `@base44/sdk` imports in service layer**

**Deliverables**:
- Complete Supabase service layer (20+ entity services)
- RLS policies active on all tables
- React Query hooks for all data fetching
- Zero Base44 SDK dependencies in service layer
- All service tests passing

**Post-Phase 3**: Service layer ready for page migrations (Phase 4-6)

---

### Phase 4: Page Migration - Public Pages (Week 4)
**Goal**: Migrate public/marketing pages

#### Priority Order
1. **Home.jsx** → `app/page.tsx` (ALREADY EXISTS)
   - Pure marketing content
   - No Base44 dependencies
   - Static/minimal data needs
   - **Status**: ✅ Already migrated

2. **About** → `app/about/page.tsx` (EXISTS)
3. **Pricing** → `app/pricing/page.tsx` (EXISTS)
4. **Contact** → `app/contact/page.tsx` (EXISTS)
5. **Blog** → `app/blog/page.tsx` (EXISTS)
6. **FAQ** → `app/faq/page.tsx` (EXISTS)

**Deliverables**:
- All public pages working
- SEO metadata correct
- Links functional

---

### Phase 5: Page Migration - Authenticated Pages (Week 5-6)
**Goal**: Migrate authenticated user pages

#### Priority Order (by dependency complexity)

**Tier 1: Foundation Pages** (No external data dependencies)
1. **Profile.jsx** → `app/profile/page.tsx`
   - User profile display
   - Base44: `base44.entities.User` → Supabase: `auth.users` + `profiles`
   - Update profile form
   
2. **Achievements.jsx** → `app/achievements/page.tsx`
   - Gamification display
   - Base44: `UserAchievement` → Supabase: `user_achievements`
   - Badge display components

**Tier 2: Data-Heavy Pages** (Read-only data views)
3. **DataExplorer.jsx** → `app/cases/browse/page.tsx` (EXISTS as browse/)
   - Main data exploration interface
   - Base44: `TribunalCase.list()` → Supabase: `tribunal_cases` table
   - Complex filtering/search
   - Priority: HIGH (core feature)

4. **CaseDetails.jsx** → `app/cases/[id]/page.tsx` (EXISTS as [id]/)
   - Tribunal case detail view
   - Base44: `TribunalCase.get(id)` → Supabase: `tribunal_cases` by ID
   - Related cases query
   - Priority: HIGH (core feature)

5. **Library.jsx** → `app/resources/page.tsx` (EXISTS)
   - Resource library
   - Base44: `Resource.list()` → Supabase: `resources` table

**Tier 3: Training System** (Complex workflows)
6. **TrainingHub.jsx** → `app/courses/page.tsx` (EXISTS)
   - Course catalog
   - Base44: `Course.list()` → Supabase: `courses` table
   - Progress tracking integration

7. **CoursePlayer.jsx** → `app/courses/[slug]/page.tsx` (EXISTS as [slug]/)
   - Video player + progress tracking
   - Base44: `Course.get()`, `Progress.update()` → Supabase: `courses`, `progress`
   - Complex state management

**Tier 4: Dashboard & Analytics**
8. **Dashboard.jsx** → `app/dashboard/page.tsx` (CREATE)
   - User dashboard
   - Base44: Multiple entity queries → Supabase: Aggregated queries
   - Real-time notifications (Supabase Realtime)
   - Priority: HIGH (landing page for users)

9. **Analytics.jsx** → `app/analytics/page.tsx` (EXISTS)
   - Analytics dashboard
   - Base44: Analytics queries → Supabase: Custom analytics queries
   - Chart components

10. **Leaderboard.jsx** → `app/leaderboard/page.tsx` (CREATE)
    - Leaderboard display
    - Base44: `UserAchievement` queries → Supabase: Aggregated queries

**Tier 5: AI Features**
11. **AIAssistant.jsx** → `app/ai-assistant/page.tsx` (CREATE)
    - AI chat interface
    - Base44: `integrations.Core.InvokeLLM` → Azure OpenAI direct
    - Session management

12. **AICoach.jsx** → `app/ai-coach/page.tsx` (CREATE)
    - AI coaching interface
    - Base44: `AICoachingSession` → Supabase: `ai_coaching_sessions`
    - Azure OpenAI integration

**Tier 6: Admin Pages**
13. **DataIngestion.jsx** → `app/admin/ingestion/page.tsx` (EXISTS)
    - Admin ingestion management
    - Base44: `SyncJob`, `TrainingJob` → Supabase: `ingestion_jobs`
    - Already have ingestion system in `ingestion/`

14. **AIModelManagement.jsx** → `app/admin/ai-models/page.tsx` (CREATE)
    - AI model configuration
    - Base44: `AutomatedTrainingConfig` → Supabase: Custom table

15. **OrgDashboard.jsx** → `app/org/dashboard/page.tsx` (CREATE)
    - Organization dashboard
    - Base44: `Organization` → Supabase: `organizations`

16. **OrgSettings.jsx** → `app/org/settings/page.tsx` (CREATE)
    - Organization settings
    - Base44: `Organization.update()` → Supabase: `organizations` update

17. **TeamManagement.jsx** → `app/org/teams/page.tsx` (CREATE)
    - Team management
    - Base44: Team entities → Supabase: `teams`, `team_members`

18. **UserManagement.jsx** → `app/admin/users/page.tsx` (CREATE)
    - User administration
    - Base44: `User` → Supabase: `auth.users` + `profiles`

**Deliverables**:
- All authenticated pages migrated
- Base44 SDK fully replaced
- Feature parity achieved

---

### Phase 6: Feature Components (Week 7)
**Goal**: Migrate feature-specific components

#### Tasks
- [ ] Migrate `components/ai/` (AI components)
- [ ] Migrate `components/coaching/` (Coaching components)
- [ ] Migrate `components/explorer/` (Explorer components)
- [ ] Migrate `components/gamification/` (Gamification components)
- [ ] Migrate `components/ingestion/` (Ingestion admin UI)
- [ ] Migrate `components/player/` (Course player components)
- [ ] Update all component imports
- [ ] Test components with real data

**Deliverables**:
- All feature components working
- Component integration complete

---

### Phase 7: Legacy Cleanup - DELETE Base44 & Legacy Code
**Goal**: Complete elimination of Base44 and legacy folder

**CRITICAL**: This phase permanently removes all Base44 dependencies.

#### Tasks
- [ ] **Verify ZERO `@base44/sdk` imports across entire codebase**
  - [ ] Search for `from '@base44/sdk'`
  - [ ] Search for `base44.entities`
  - [ ] Search for `base44.integrations`
  - [ ] Confirm all imports replaced with Supabase services
- [ ] **Verify all pages migrated from `legacy/src/pages/`**
  - [ ] Confirm all 22 pages have equivalents in `app/`
  - [ ] Test all migrated pages work correctly
- [ ] **DELETE `legacy/` folder entirely** 🗑️
  - [ ] Remove `legacy/src/`
  - [ ] Remove `legacy/package.json`
  - [ ] Remove any legacy config files
- [ ] **Remove Base44 from package.json**
  - [ ] Remove `@base44/sdk` dependency
  - [ ] Run `npm install` to update lock file
- [ ] **Update documentation**
  - [ ] Remove Base44 references from README
  - [ ] Update architecture diagrams
  - [ ] Document Supabase migration complete
- [ ] **Final verification build**
  - [ ] Run `npm run build` successfully
  - [ ] Verify zero Base44 imports remain
  - [ ] Confirm all tests pass

**Deliverables**:
- ✅ `legacy/` folder deleted
- ✅ Zero Base44 SDK dependencies
- ✅ All pages migrated to Next.js
- ✅ Build successful
- ✅ Base44 completely eliminated

---

### Phase 8: Testing & Validation (Week 8)
**Goal**: Comprehensive testing post-migration

#### Tasks
- [ ] Unit tests for all Supabase services
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows (Playwright)
- [ ] User acceptance testing (UAT)
- [ ] Performance testing (compare vs. Base44 baseline)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit (RLS policies, auth)
- [ ] Cross-browser testing

**Deliverables**:
- Test coverage > 80%
- All UAT scenarios passing
- Performance improved vs. Base44
- Security audit passed

---

### Phase 9: Deployment (Week 9)
**Goal**: Production deployment with Supabase backend

#### Tasks
- [ ] Configure Azure Static Web Apps
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure environment variables (Supabase URLs, keys)
- [ ] Set up monitoring (Application Insights + Supabase Analytics)
- [ ] Create deployment documentation
- [ ] Beta launch with test users
- [ ] Monitor and fix issues
- [ ] Full production launch
- [ ] **Confirm Base44 decommissioned** ✅

**Deliverables**:
- Production app running on Supabase
- Zero Base44 dependencies
- Monitoring active
- Users successfully migrated

**Deliverables**:
- Production app live
- Monitoring active
- Legacy app retired

---

## 📊 Base44 → Supabase API Mapping

### Entity Mapping

| Base44 Entity | Supabase Table | Service File |
|--------------|----------------|--------------|
| `TribunalCase` | `tribunal_cases` | `tribunalCases.ts` |
| `Course` | `courses` | `courses.ts` |
| `Lesson` | `lessons` | `courses.ts` |
| `Progress` | `progress` | `progress.ts` |
| `Organization` | `organizations` | `organizations.ts` |
| `Certificate` | `certificates` | `achievements.ts` |
| `Notification` | `notifications` | `notifications.ts` |
| `Bookmark` | `bookmarks` | `bookmarks.ts` |
| `Resource` | `resources` | `resources.ts` |
| `Onboarding` | `onboarding_progress` | `onboarding.ts` |
| `UserAchievement` | `user_achievements` | `achievements.ts` |
| `AICoachingSession` | `ai_coaching_sessions` | `aiCoaching.ts` |
| `CustomBadge` | `custom_badges` | `achievements.ts` |
| `LearningPath` | `learning_paths` | `courses.ts` |
| `NotificationPreference` | `notification_preferences` | `notifications.ts` |
| `SyncJob` | `ingestion_jobs` | `ingestion.ts` |
| `ClassificationFeedback` | `classification_feedback` | `ingestion.ts` |
| `TrainingJob` | `training_jobs` | `aiModels.ts` |
| `AutomatedTrainingConfig` | `ai_training_configs` | `aiModels.ts` |
| `SavedSearch` | `saved_searches` | `savedSearches.ts` |

### Common Operation Patterns

#### Base44 Pattern
```javascript
// List entities
const cases = await base44.entities.TribunalCase.list({
  filter: { year: 2023 },
  limit: 10
});

// Get single entity
const case = await base44.entities.TribunalCase.get(id);

// Create entity
const newCase = await base44.entities.TribunalCase.create({
  title: "Example Case",
  year: 2023
});

// Update entity
await base44.entities.TribunalCase.update(id, {
  title: "Updated Title"
});

// Delete entity
await base44.entities.TribunalCase.delete(id);
```

#### Supabase Pattern
```typescript
// List entities
const { data: cases, error } = await supabase
  .from('tribunal_cases')
  .select('*')
  .eq('year', 2023)
  .limit(10);

// Get single entity
const { data: case, error } = await supabase
  .from('tribunal_cases')
  .select('*')
  .eq('id', id)
  .single();

// Create entity
const { data: newCase, error } = await supabase
  .from('tribunal_cases')
  .insert({
    title: 'Example Case',
    year: 2023
  })
  .select()
  .single();

// Update entity
const { data: updatedCase, error } = await supabase
  .from('tribunal_cases')
  .update({ title: 'Updated Title' })
  .eq('id', id)
  .select()
  .single();

// Delete entity
const { error } = await supabase
  .from('tribunal_cases')
  .delete()
  .eq('id', id);
```

---

## 🚀 Next Steps

### Immediate Actions (This Week)
1. ✅ Complete this migration plan
2. Verify Supabase database schema (run `create_tables.sql`)
3. Create authentication flows (signup, login, reset)
4. Test Supabase client connection
5. Begin migrating first page (Profile or Dashboard)

### Decision Points
- **UI Framework**: Keep shadcn/ui (already integrated)
- **State Management**: Keep TanStack Query (works well with Supabase)
- **Routing**: Migrate from React Router to Next.js App Router
- **Forms**: Keep React Hook Form + Zod (framework-agnostic)

### Risk Assessment
| Risk | Mitigation |
|------|-----------|
| Data loss during migration | Export all Base44 data first, validate integrity |
| Authentication complexity | Use Supabase Auth (proven solution) |
| Feature regression | Comprehensive testing + UAT |
| Performance degradation | Load testing before launch |
| User disruption | Beta testing + gradual rollout |

---

## 📝 Notes

- **Ingestion System**: Already complete in `ingestion/` folder (35/35 tests passing)
- **Database Schema**: Already defined in `create_tables.sql`
- **Public Pages**: Many already exist in `app/` directory
- **Supabase Client**: Already exists in `lib/supabase.ts`
- **Priority**: Focus on authentication first, then Dashboard, then DataExplorer (core features)

---

**Last Updated**: 2025-06-01  
**Next Review**: After Phase 1 completion
