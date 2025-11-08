# Phase 3 Migration Checklist

## Pre-Migration Verification ✅

- [x] All code committed to `feature/courses-enhancement` branch
- [x] Build successful: **532 pages generated**
- [x] TypeScript compilation: **0 errors**
- [x] All 6 migrations present in `/supabase/migrations/`
- [x] Service layers created and functional
- [x] User interfaces implemented
- [x] Documentation complete

## Database Migrations (Execute in Order)

### 1. Lesson Notes & Watch History
```bash
# Migration 1: Lesson notes
psql $DATABASE_URL -f supabase/migrations/20250115000001_lesson_notes.sql

# Migration 2: Watch history tracking
psql $DATABASE_URL -f supabase/migrations/20250115000002_watch_history.sql
```

**Verification**:
- [ ] Table `lesson_notes` exists
- [ ] Table `watch_history` exists
- [ ] RLS policies active

### 2. Quiz System (Core)
```bash
# Migration 3: Quiz system tables and functions
psql $DATABASE_URL -f supabase/migrations/20250115000003_quiz_system.sql
```

**Verification**:
- [ ] Tables created: `questions`, `question_options`, `quizzes`, `quiz_attempts`, `quiz_answers`
- [ ] Enums created: `question_type`, `difficulty_level`
- [ ] Test query: `SELECT * FROM questions LIMIT 1;`

### 3. Certificate Generation
```bash
# Migration 4: Certificates system
psql $DATABASE_URL -f supabase/migrations/20250115000004_certificates.sql
```

**Verification**:
- [ ] Table `certificates` exists
- [ ] Views created: `user_certificates`, `certificate_statistics`
- [ ] Function `generate_certificate` exists
- [ ] Test query: `SELECT * FROM certificate_statistics;`

### 4. CE Credit Tracking
```bash
# Migration 5: CE credit tracking
psql $DATABASE_URL -f supabase/migrations/20250115000005_ce_credit_tracking.sql
```

**Verification**:
- [ ] Views created: `user_ce_credit_summary`, `active_ce_credits`, `ce_credit_renewal_alerts`
- [ ] Function `get_user_ce_dashboard` exists
- [ ] Function `get_ce_credit_history` exists
- [ ] Function `calculate_ce_requirements` exists

### 5. Skills Validation
```bash
# Migration 6: Skills validation system
psql $DATABASE_URL -f supabase/migrations/20250115000006_skills_validation.sql
```

**Verification**:
- [ ] Tables created: `skills`, `user_skills`, `skill_validations`, `skill_prerequisites`
- [ ] Mapping tables: `course_skills`, `lesson_skills`, `question_skills`
- [ ] Views created: `user_skills_summary`, `skills_expiring_soon`, `active_validated_skills`
- [ ] Functions created: All 5 skill functions
- [ ] Sample data: 8 skills inserted
- [ ] Test query: `SELECT COUNT(*) FROM skills;` (should return 8)

## Post-Migration Verification

### Database Structure
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'lesson_notes', 'watch_history', 'questions', 'question_options',
    'quizzes', 'quiz_attempts', 'quiz_answers', 'certificates',
    'skills', 'user_skills', 'skill_validations', 'course_skills',
    'lesson_skills', 'question_skills', 'skill_prerequisites'
  )
ORDER BY table_name;

-- Should return 15 tables
```

### Views Verification
```sql
-- Verify all views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_certificates', 'certificate_statistics',
    'user_ce_credit_summary', 'active_ce_credits', 'ce_credit_renewal_alerts',
    'user_skills_summary', 'skills_expiring_soon', 'active_validated_skills'
  )
ORDER BY table_name;

-- Should return 8 views
```

### Functions Verification
```sql
-- Verify all functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'generate_certificate', 'revoke_certificate', 'get_user_certificates',
    'get_user_ce_dashboard', 'get_ce_credit_history', 'calculate_ce_requirements',
    'get_user_skills_dashboard', 'calculate_skill_proficiency', 
    'validate_skill_from_quiz', 'get_skill_validation_history',
    'get_recommended_courses_for_skills'
  )
ORDER BY routine_name;

-- Should return 11 functions
```

### Sample Data Check
```sql
-- Check skills sample data
SELECT id, name, category, subcategory 
FROM skills 
WHERE is_active = true
ORDER BY order_index;

-- Should return 8 skills:
-- 1. Anti-Money Laundering Fundamentals
-- 2. Know Your Client Requirements
-- 3. Mutual Fund Products
-- 4. Risk Assessment
-- 5. Ethical Conduct
-- 6. Portfolio Construction
-- 7. Regulatory Reporting
-- 8. Client Communication
```

## Application Deployment

### Environment Variables Check
```bash
# Verify all required environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

- [ ] Supabase URL configured
- [ ] Anonymous key configured
- [ ] Service role key configured (for server-side operations)

### Build & Deploy
```bash
# Build the application
npm run build

# Expected output: "✓ Generating static pages (532/532)"

# Deploy to production
npm run start

# Or deploy to your hosting provider
```

### Post-Deployment Testing

#### 1. Quiz System
- [ ] Navigate to a course with quizzes
- [ ] Create a quiz (admin)
- [ ] Take a quiz (user)
- [ ] Verify scoring
- [ ] Check quiz results page

#### 2. Certificate Generation
- [ ] Complete a quiz with passing score
- [ ] Verify certificate generated
- [ ] Download certificate PDF
- [ ] Check QR code works
- [ ] Test public verification at `/certificates/verify/[number]`

#### 3. CE Credits Dashboard
- [ ] Navigate to `/ce-credits`
- [ ] Verify credit aggregation by regulatory body
- [ ] Check expiry tracking
- [ ] Verify renewal alerts appear
- [ ] Review credit history

#### 4. Skills Dashboard
- [ ] Navigate to `/skills`
- [ ] Verify skills displayed
- [ ] Check proficiency levels
- [ ] Review validation history
- [ ] Test course recommendations

#### 5. Integration Testing
- [ ] Take quiz → Certificate generated
- [ ] Certificate → CE credits tracked
- [ ] Quiz → Skills validated
- [ ] Skills → Course recommendations shown

## Rollback Plan

If issues occur, rollback migrations in reverse order:

```bash
# Rollback migration 6
psql $DATABASE_URL -c "DROP TABLE IF EXISTS skill_prerequisites CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS skill_validations CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS user_skills CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS question_skills CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS lesson_skills CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS course_skills CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS skills CASCADE;"
psql $DATABASE_URL -c "DROP TYPE IF EXISTS proficiency_level CASCADE;"
psql $DATABASE_URL -c "DROP TYPE IF EXISTS validation_status CASCADE;"

# Rollback migration 5 (CE Credits)
psql $DATABASE_URL -c "DROP VIEW IF EXISTS ce_credit_renewal_alerts CASCADE;"
psql $DATABASE_URL -c "DROP VIEW IF EXISTS active_ce_credits CASCADE;"
psql $DATABASE_URL -c "DROP VIEW IF EXISTS user_ce_credit_summary CASCADE;"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS calculate_ce_requirements CASCADE;"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS get_ce_credit_history CASCADE;"
psql $DATABASE_URL -c "DROP FUNCTION IF EXISTS get_user_ce_dashboard CASCADE;"

# Continue in reverse order as needed...
```

## Monitoring

### Key Metrics to Monitor
- [ ] Quiz completion rate
- [ ] Certificate generation success rate
- [ ] CE credit calculation accuracy
- [ ] Skills validation accuracy
- [ ] Page load times for dashboards
- [ ] Database query performance
- [ ] Error rates in logs

### Performance Queries
```sql
-- Monitor quiz attempts
SELECT 
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN submitted_at IS NOT NULL THEN 1 END) as completed,
  AVG(score) as avg_score
FROM quiz_attempts
WHERE started_at > NOW() - INTERVAL '7 days';

-- Monitor certificate generation
SELECT 
  COUNT(*) as total_certificates,
  COUNT(CASE WHEN revoked_at IS NULL THEN 1 END) as active,
  DATE_TRUNC('day', issued_at) as issue_date
FROM certificates
WHERE issued_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', issued_at)
ORDER BY issue_date DESC;

-- Monitor skill validations
SELECT 
  s.name,
  COUNT(*) as validations,
  COUNT(CASE WHEN sv.passed THEN 1 END) as passed
FROM skill_validations sv
JOIN skills s ON sv.skill_id = s.id
WHERE sv.attempted_at > NOW() - INTERVAL '30 days'
GROUP BY s.name
ORDER BY validations DESC;
```

## Support Contacts

- **Technical Lead**: [Your Name]
- **Database Admin**: [DBA Name]
- **DevOps**: [DevOps Team]
- **Support**: [Support Email]

## Sign-Off

- [ ] Database migrations applied successfully
- [ ] Application deployed to staging
- [ ] Staging testing completed
- [ ] Production deployment completed
- [ ] Post-deployment verification passed
- [ ] Monitoring dashboards configured
- [ ] Support team notified
- [ ] User documentation updated

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  

---

**Phase 3 Status**: ✅ READY FOR DEPLOYMENT  
**Build**: 532 pages  
**TypeScript Errors**: 0  
**Critical Issues**: None  

---

*Generated: November 8, 2025*
