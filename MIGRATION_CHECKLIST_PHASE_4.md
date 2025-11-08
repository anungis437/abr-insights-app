# Phase 4 Migration Checklist - Deployment Guide

**Target Environment:** Production  
**Migration Files:** 2 new SQL migrations  
**Code Files:** 4 new TypeScript files  
**Estimated Downtime:** None (backwards compatible)  
**Rollback Plan:** See PHASE_4_COMPLETE.md Appendix

---

## Pre-Deployment Checklist

### 1. Environment Verification

- [ ] Confirm target database is PostgreSQL 14+
- [ ] Verify Supabase connection credentials are current
- [ ] Check database has sufficient storage (migrations add ~50MB with sample data)
- [ ] Confirm no conflicting table/view/function names exist
- [ ] Verify existing `courses` table has `instructor_id` column (required for migration)
- [ ] Backup current database (full backup recommended)

### 2. Dependencies Verification

- [ ] Confirm all Phase 1-3 migrations are applied
- [ ] Verify `profiles` table exists (referenced by foreign keys)
- [ ] Verify `courses` table exists with correct schema
- [ ] Check `courses.instructor_id` column is populated (used in sample data migration)
- [ ] Confirm Node.js 18+ installed
- [ ] Verify Next.js 14+ dependencies in package.json

### 3. Code Deployment Preparation

- [ ] Merge `feature/courses-enhancement` branch to main (or create release branch)
- [ ] Run `npm install` to ensure dependencies are current
- [ ] Run `npm run build` locally to verify 0 errors
- [ ] Review build output - expect 534+ pages
- [ ] Test migrations on staging environment first

---

## Deployment Steps

### Phase A: Database Migrations (Execute in Order)

#### Step 1: Apply Course Workflow Migration

```bash
# Connect to database
psql $DATABASE_URL

# Or using Supabase CLI
supabase db push

# Or apply manually
\i supabase/migrations/20250115000007_course_workflow.sql
```

**What this does:**
- Creates 3 enums: `workflow_status`, `review_decision`, `review_type`
- Extends `courses` table with 8 new columns
- Creates 4 new tables: `course_versions`, `course_reviews`, `course_workflow_history`, `content_quality_checklists`
- Creates 2 views: `courses_pending_review`, `course_workflow_summary`
- Creates 5 functions for workflow state transitions
- Creates 3 triggers for automation
- Adds RLS policies for all new tables
- Migrates existing published courses to version control

**Expected duration:** 5-30 seconds (depending on existing course count)

**Verification queries:**
```sql
-- Should return 6 values
SELECT unnest(enum_range(NULL::workflow_status));

-- Should return existing course count
SELECT COUNT(*) FROM course_versions;

-- Should show all courses with workflow_status
SELECT id, title, workflow_status FROM courses LIMIT 5;
```

#### Step 2: Apply Instructor Portal Migration

```bash
# Same database connection
\i supabase/migrations/20250115000008_instructor_portal.sql
```

**What this does:**
- Creates 4 enums: `instructor_status`, `instructor_specialization`, `communication_type`, `period_type`
- Creates 5 new tables: `instructor_profiles`, `course_instructors`, `instructor_analytics`, `instructor_communications`, `instructor_earnings`
- Creates 2 views: `instructor_dashboard_summary`, `active_instructors`
- Creates 4 functions for instructor management
- Creates 2 triggers for automation
- Adds RLS policies for all new tables
- Creates instructor profiles for existing course authors
- Links existing courses to instructors

**Expected duration:** 5-30 seconds (depending on existing instructor count)

**Verification queries:**
```sql
-- Should return 4 values
SELECT unnest(enum_range(NULL::instructor_status));

-- Should return count of unique instructors
SELECT COUNT(*) FROM instructor_profiles;

-- Should show courses linked to instructors
SELECT c.title, i.user_id, ci.role 
FROM courses c
JOIN course_instructors ci ON c.id = ci.course_id
JOIN instructor_profiles i ON ci.instructor_id = i.id
LIMIT 5;

-- Should return dashboard summary for first instructor
SELECT * FROM instructor_dashboard_summary LIMIT 1;
```

**Post-Migration Database Checks:**
```sql
-- Verify all tables created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'course_versions', 'course_reviews', 'course_workflow_history', 
    'content_quality_checklists', 'instructor_profiles', 'course_instructors',
    'instructor_analytics', 'instructor_communications', 'instructor_earnings'
);
-- Expected: 9 rows

-- Verify all views created
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN (
    'courses_pending_review', 'course_workflow_summary',
    'instructor_dashboard_summary', 'active_instructors'
);
-- Expected: 4 rows

-- Verify all functions created
SELECT proname FROM pg_proc 
WHERE proname IN (
    'submit_course_for_review', 'approve_course', 'reject_course', 
    'publish_course', 'get_course_workflow_history',
    'get_instructor_analytics', 'get_instructor_courses',
    'send_instructor_message', 'calculate_instructor_effectiveness'
);
-- Expected: 9 rows

-- Verify sample data migrated
SELECT workflow_status, COUNT(*) FROM courses GROUP BY workflow_status;
-- Should show published/draft counts

SELECT status, COUNT(*) FROM instructor_profiles GROUP BY status;
-- Should show active instructor count
```

### Phase B: Code Deployment

#### Step 3: Deploy Service Layer Files

**Files to deploy:**
- `lib/services/course-workflow.ts`
- `lib/services/instructors.ts`

**Verification:**
```bash
# Check TypeScript compiles
npm run type-check

# Expected: No errors
```

#### Step 4: Deploy UI Components

**Files to deploy:**
- `app/admin/courses/workflow/page.tsx`
- `app/instructor/dashboard/page.tsx`

**New routes created:**
- `/admin/courses/workflow` - Admin workflow management
- `/instructor/dashboard` - Instructor portal dashboard

**Verification:**
```bash
# Build project
npm run build

# Expected output: 534+ pages, 0 TypeScript errors
```

#### Step 5: Deploy to Hosting Platform

**For Vercel:**
```bash
vercel --prod
```

**For Azure Static Web Apps:**
```bash
az staticwebapp deploy \
  --name abr-insights-app \
  --resource-group abr-insights-rg \
  --app-location "./" \
  --output-location ".next"
```

**For Netlify:**
```bash
netlify deploy --prod --dir=.next
```

**Expected deployment time:** 3-5 minutes

---

## Post-Deployment Verification

### Functional Testing

#### Test 1: Admin Workflow Page

1. **Access:** Navigate to `/admin/courses/workflow`
2. **Expected:** 
   - ✅ Page loads without errors
   - ✅ 6 status stat cards displayed (draft, in_review, needs_revision, approved, published, archived)
   - ✅ Course table shows all courses with correct status badges
   - ✅ Search functionality works
   - ✅ Status filter dropdown works
3. **Test Actions:**
   - ✅ Click status card to filter courses
   - ✅ Search for course by title
   - ✅ Select multiple courses (checkbox)
   - ✅ Verify bulk approve button appears
   - ✅ Click "View" action button (should navigate to course details)

**SQL check for stats:**
```sql
SELECT workflow_status, COUNT(*) 
FROM courses 
WHERE deleted_at IS NULL 
GROUP BY workflow_status;
```

#### Test 2: Instructor Dashboard

1. **Access:** Navigate to `/instructor/dashboard` (as authenticated instructor)
2. **Expected:**
   - ✅ Page loads without errors
   - ✅ 4 summary stat cards displayed (total courses, total students, avg rating, earnings)
   - ✅ Analytics chart renders with period selector
   - ✅ Course list table shows instructor's courses
   - ✅ Quick action cards render (earnings, messages, profile)
3. **Test Actions:**
   - ✅ Switch analytics period (daily/weekly/monthly)
   - ✅ Verify course list shows correct data
   - ✅ Click "View Course" action (should navigate)
   - ✅ Click "Create New Course" button

**SQL check for instructor:**
```sql
SELECT * FROM instructor_dashboard_summary WHERE user_id = '<test_user_id>';
```

#### Test 3: Course Workflow Functions

**Test submitForReview:**
```sql
SELECT submit_course_for_review(
    '<course_id>'::UUID,
    '<user_id>'::UUID,
    'Ready for review - all content complete'
);

-- Verify status changed
SELECT workflow_status FROM courses WHERE id = '<course_id>';
-- Expected: in_review

-- Verify history entry created
SELECT * FROM course_workflow_history WHERE course_id = '<course_id>' ORDER BY created_at DESC LIMIT 1;
```

**Test approveCourse:**
```sql
SELECT approve_course(
    '<course_id>'::UUID,
    '<reviewer_id>'::UUID,
    'Content looks good, no issues found'
);

-- Verify status changed
SELECT workflow_status FROM courses WHERE id = '<course_id>';
-- Expected: approved
```

**Test publishCourse:**
```sql
SELECT publish_course(
    '<course_id>'::UUID,
    '<publisher_id>'::UUID
);

-- Verify version created
SELECT * FROM course_versions WHERE course_id = '<course_id>' ORDER BY created_at DESC LIMIT 1;

-- Verify status changed
SELECT workflow_status, published_at FROM courses WHERE id = '<course_id>';
-- Expected: published, published_at should be set
```

#### Test 4: Instructor Functions

**Test get_instructor_courses:**
```sql
SELECT * FROM get_instructor_courses('<instructor_profile_id>'::UUID);
-- Should return courses with stats (enrollments, completions, ratings)
```

**Test get_instructor_analytics:**
```sql
SELECT * FROM get_instructor_analytics(
    '<instructor_profile_id>'::UUID,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
);
-- Should return aggregated analytics
```

**Test calculate_instructor_effectiveness:**
```sql
SELECT calculate_instructor_effectiveness('<instructor_profile_id>'::UUID);
-- Should return effectiveness score (0-100)
```

### Performance Testing

#### Database Query Performance

```sql
-- Test workflow summary view (should be < 500ms even with 1000+ courses)
EXPLAIN ANALYZE 
SELECT * FROM course_workflow_summary;

-- Test instructor dashboard view (should be < 300ms)
EXPLAIN ANALYZE 
SELECT * FROM instructor_dashboard_summary;

-- Test courses pending review (should be < 200ms)
EXPLAIN ANALYZE 
SELECT * FROM courses_pending_review;
```

**Acceptable benchmarks:**
- course_workflow_summary: < 500ms
- instructor_dashboard_summary: < 300ms
- courses_pending_review: < 200ms

If queries exceed these times:
1. Check index usage: `EXPLAIN (ANALYZE, BUFFERS) SELECT ...`
2. Verify statistics updated: `ANALYZE courses; ANALYZE course_reviews;`
3. Consider materialized views for large datasets

#### Page Load Performance

```bash
# Using Lighthouse CLI
npx lighthouse https://your-domain.com/admin/courses/workflow --output=html --output-path=./lighthouse-admin-workflow.html

npx lighthouse https://your-domain.com/instructor/dashboard --output=html --output-path=./lighthouse-instructor-dashboard.html
```

**Target scores:**
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Security Testing

#### Row-Level Security (RLS) Verification

**Test 1: Instructors can only see own data**
```sql
-- Set session to instructor user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "<instructor_user_id>"}';

-- Should only return this instructor's profile
SELECT * FROM instructor_profiles;

-- Should only return this instructor's courses
SELECT * FROM get_instructor_courses('<instructor_profile_id>'::UUID);

-- Should only return this instructor's earnings
SELECT * FROM instructor_earnings;
```

**Test 2: Non-instructors cannot access instructor data**
```sql
-- Set session to regular user (not instructor)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "<regular_user_id>"}';

-- Should return 0 rows (or error if RLS enforced)
SELECT * FROM instructor_profiles;
SELECT * FROM instructor_earnings;
```

**Test 3: Admins can see all data**
```sql
-- Set session to admin user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "<admin_user_id>", "role": "admin"}';

-- Should return all profiles
SELECT COUNT(*) FROM instructor_profiles;

-- Should return all courses
SELECT COUNT(*) FROM course_workflow_summary;
```

---

## Monitoring Setup

### Key Metrics to Track

**1. Workflow Metrics**
```sql
-- Courses by status (daily snapshot)
SELECT 
    workflow_status, 
    COUNT(*) as count,
    CURRENT_DATE as snapshot_date
FROM courses 
WHERE deleted_at IS NULL
GROUP BY workflow_status;
```

**2. Review Backlog**
```sql
-- Pending reviews
SELECT COUNT(*) as pending_reviews
FROM course_reviews
WHERE is_completed = FALSE;

-- Blocking issues
SELECT COUNT(*) as blocking_issues
FROM course_reviews
WHERE is_blocking = TRUE AND is_completed = FALSE;
```

**3. Instructor Activity**
```sql
-- Active instructors
SELECT COUNT(*) as active_instructors
FROM instructor_profiles
WHERE status = 'active';

-- Courses published per instructor
SELECT 
    ip.user_id,
    p.name,
    COUNT(c.id) as published_courses
FROM instructor_profiles ip
JOIN course_instructors ci ON ip.id = ci.instructor_id
JOIN courses c ON ci.course_id = c.id
LEFT JOIN profiles p ON ip.user_id = p.id
WHERE c.workflow_status = 'published' AND c.deleted_at IS NULL
GROUP BY ip.user_id, p.name
ORDER BY published_courses DESC
LIMIT 10;
```

**4. Quality Checklist Completion**
```sql
-- Checklist completion distribution
SELECT 
    CASE 
        WHEN completion_percentage < 50 THEN 'Red (< 50%)'
        WHEN completion_percentage < 90 THEN 'Yellow (50-89%)'
        ELSE 'Green (90-100%)'
    END as status,
    COUNT(*) as count
FROM content_quality_checklists
GROUP BY 
    CASE 
        WHEN completion_percentage < 50 THEN 'Red (< 50%)'
        WHEN completion_percentage < 90 THEN 'Yellow (50-89%)'
        ELSE 'Green (90-100%)'
    END;
```

### Recommended Alerts

**Configure alerts for:**

1. **Review Backlog Alert**
   - Condition: `pending_reviews > 50`
   - Duration: 7 days
   - Action: Notify course admin team

2. **Stuck Workflow Alert**
   - Condition: Course in `in_review` status for > 14 days with blocking issues
   - Action: Escalate to review manager

3. **Low Quality Submission Alert**
   - Condition: Course submitted with checklist completion < 50%
   - Action: Auto-reject with feedback

4. **Instructor Inactive Alert**
   - Condition: Instructor with `status='active'` but no published courses in 90 days
   - Action: Send engagement email

5. **Failed Message Delivery Alert**
   - Condition: `failed_count / total_recipients > 0.1` (10% failure rate)
   - Action: Investigate email service

### Logging

**Enable application logs for:**
- Course workflow state transitions
- Review creation/completion
- Instructor profile approvals
- Message sends (track delivery success/failure)
- Earnings transactions

**Log format example:**
```json
{
  "timestamp": "2025-11-08T10:30:45Z",
  "event": "course_workflow_transition",
  "course_id": "uuid",
  "from_status": "draft",
  "to_status": "in_review",
  "actor_id": "uuid",
  "metadata": {
    "submission_notes": "Ready for review"
  }
}
```

---

## Rollback Plan

If critical issues are discovered post-deployment:

### Option 1: Rollback Code Only (Keep Database Changes)

**If issue is in UI/service layer:**
```bash
# Revert to previous deployment
git revert <commit-hash>
npm run build
vercel --prod  # or your deployment command

# Database stays intact, can re-deploy fixed code later
```

**Impact:** Admin workflow and instructor dashboard pages will 404, but existing course functionality unchanged.

### Option 2: Full Rollback (Database + Code)

**If database schema has issues:**

```sql
-- Execute in reverse order of migrations

-- 1. Drop instructor portal objects
DROP TABLE IF EXISTS instructor_earnings CASCADE;
DROP TABLE IF EXISTS instructor_communications CASCADE;
DROP TABLE IF EXISTS instructor_analytics CASCADE;
DROP TABLE IF EXISTS course_instructors CASCADE;
DROP TABLE IF EXISTS instructor_profiles CASCADE;
DROP VIEW IF EXISTS active_instructors CASCADE;
DROP VIEW IF EXISTS instructor_dashboard_summary CASCADE;
DROP FUNCTION IF EXISTS get_instructor_analytics(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_instructor_courses(UUID);
DROP FUNCTION IF EXISTS send_instructor_message(UUID, UUID, communication_type, VARCHAR, TEXT, UUID[], JSONB);
DROP FUNCTION IF EXISTS calculate_instructor_effectiveness(UUID);
DROP TYPE IF EXISTS communication_type;
DROP TYPE IF EXISTS instructor_specialization;
DROP TYPE IF EXISTS instructor_status;

-- 2. Drop course workflow objects
DROP TABLE IF EXISTS content_quality_checklists CASCADE;
DROP TABLE IF EXISTS course_workflow_history CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS course_versions CASCADE;
DROP VIEW IF EXISTS course_workflow_summary CASCADE;
DROP VIEW IF EXISTS courses_pending_review CASCADE;
DROP FUNCTION IF EXISTS get_course_workflow_history(UUID);
DROP FUNCTION IF EXISTS publish_course(UUID, UUID);
DROP FUNCTION IF EXISTS reject_course(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS approve_course(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS submit_course_for_review(UUID, UUID, TEXT);
DROP TYPE IF EXISTS review_type;
DROP TYPE IF EXISTS review_decision;
DROP TYPE IF EXISTS workflow_status;

-- 3. Remove extended columns from courses table
ALTER TABLE courses DROP COLUMN IF EXISTS workflow_status;
ALTER TABLE courses DROP COLUMN IF EXISTS version_number;
ALTER TABLE courses DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE courses DROP COLUMN IF EXISTS reviewed_at;
ALTER TABLE courses DROP COLUMN IF EXISTS published_by;
ALTER TABLE courses DROP COLUMN IF EXISTS last_modified_by;
ALTER TABLE courses DROP COLUMN IF EXISTS submission_notes;
ALTER TABLE courses DROP COLUMN IF EXISTS rejection_reason;
```

**Then rollback code:**
```bash
git revert <commit-hash>
npm run build
vercel --prod  # or your deployment command
```

**Impact:** Full removal of Phase 4 features. System returns to Phase 3 state.

**Estimated rollback time:** 5-10 minutes

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Cause:** Migration was partially applied or tables exist from previous attempt.

**Solution:**
```sql
-- Check which objects exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'course_%' OR tablename LIKE 'instructor_%';

-- Drop conflicting objects manually, then re-run migration
```

### Issue: RLS policies blocking admin access

**Cause:** Admin role not properly configured in JWT claims.

**Solution:**
```sql
-- Verify admin user has role
SELECT id, email, role FROM auth.users WHERE email = 'admin@example.com';

-- Grant admin role if missing
UPDATE profiles SET role = 'admin' WHERE id = '<admin_user_id>';
```

### Issue: Views return no data

**Cause:** Sample data migration didn't run or no courses exist.

**Solution:**
```sql
-- Check if courses exist
SELECT COUNT(*) FROM courses;

-- Check if instructor_profiles exist
SELECT COUNT(*) FROM instructor_profiles;

-- Manually create test data if needed (see PHASE_4_COMPLETE.md Appendix C)
```

### Issue: Functions not found

**Cause:** Functions didn't create or different schema.

**Solution:**
```sql
-- Check functions exist
SELECT proname, pronamespace::regnamespace 
FROM pg_proc 
WHERE proname LIKE '%course%' OR proname LIKE '%instructor%';

-- If in wrong schema, move to public
ALTER FUNCTION get_instructor_courses(UUID) SET SCHEMA public;
```

### Issue: TypeScript errors in build

**Cause:** Service layer types mismatch with database schema.

**Solution:**
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts

# Verify service layer imports
npm run type-check
```

---

## Success Criteria

Phase 4 deployment is considered successful when:

- [ ] ✅ Both migrations applied without errors
- [ ] ✅ All 9 new tables created
- [ ] ✅ All 4 views return data
- [ ] ✅ All 9 functions execute without errors
- [ ] ✅ Sample data migrated (existing courses have workflow_status, instructors have profiles)
- [ ] ✅ Admin workflow page loads and displays courses
- [ ] ✅ Instructor dashboard loads and displays stats
- [ ] ✅ Course workflow functions work (submit, approve, reject, publish)
- [ ] ✅ Instructor functions work (get courses, get analytics)
- [ ] ✅ RLS policies enforce correct access control
- [ ] ✅ Build generates 534+ pages with 0 TypeScript errors
- [ ] ✅ No P0/P1 bugs reported in first 24 hours
- [ ] ✅ Performance benchmarks met (page load < 2s, queries < 500ms)

---

## Next Steps After Deployment

1. **Monitor for 48 hours** - Watch error logs, review metrics, check user feedback
2. **Gather feedback** - Collect admin and instructor feedback on new interfaces
3. **Performance tuning** - Optimize queries if needed, add caching
4. **Plan Phase 4.5** - Complete remaining tasks:
   - Task 8: Instructor course authoring page
   - Task 9: Quality checklist component
   - Review interface for admins
5. **Documentation** - Create user guides for admins and instructors
6. **Training** - Conduct training sessions for admin team on workflow management

---

## Support Contacts

**Technical Issues:**
- Database: DBA team
- Application: Dev team lead
- Infrastructure: DevOps team

**Business Issues:**
- Course workflow: Course operations manager
- Instructor portal: Instructor relations team
- Quality assurance: Content QA lead

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Author:** ABR Insights Development Team
