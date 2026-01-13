# Database Migration - Manual Application Guide

## Issue
PowerShell scripts are failing due to emoji encoding and psql authentication issues.

## Solution: Use Supabase Dashboard

### Step 1: Access SQL Editor
1. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Apply Migrations

Run migrations in this order by copy-pasting each file's content into the SQL Editor:

**Core Schema (Required First)**
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/014_add_role_to_profiles.sql`
3. `supabase/migrations/016_rbac_test_accounts.sql`

**ML Features**
4. `supabase/migrations/20250108000001_enable_pgvector.sql`
5. `supabase/migrations/20250108000002_create_embeddings_tables.sql`
6. `supabase/migrations/20250108000003_create_similarity_functions.sql`
7. `supabase/migrations/20250108000004_create_outcome_prediction.sql`

**Phase 2 Features**
8. `supabase/migrations/20250115000001_lesson_notes.sql`
9. `supabase/migrations/20250115000002_watch_history.sql`
10. `supabase/migrations/20250115000003_quiz_system.sql`
11. `supabase/migrations/20250115000004_certificates.sql`
12. `supabase/migrations/20250115000005_ce_credit_tracking.sql`
13. `supabase/migrations/20250115000006_skills_validation.sql`
14. `supabase/migrations/20250115000007_course_workflow.sql`
15. `supabase/migrations/20250115000008_instructor_portal.sql`

**Enterprise Features**
16. `supabase/migrations/20250116000001_enterprise_sso_auth.sql`
17. `supabase/migrations/20250116000002_advanced_rbac.sql`
18. `supabase/migrations/20250116000003_audit_logs_enhancement.sql`
19. `supabase/migrations/20250116000004_ingestion_pipeline.sql`
20. `supabase/migrations/20250116000005_migrate_gamification_schema.sql`
21. `supabase/migrations/20250116000006_gamification_social.sql`
22. `supabase/migrations/20250116000007_comprehensive_demo_seed.sql`

**Fixes & Cleanup**
23. `supabase/migrations/20250117000001_cleanup_test_users.sql`
24. `supabase/migrations/20250117000002_fix_profiles_rls_recursion.sql`
25. `supabase/migrations/20250117000003_fix_profiles_rls_simple.sql`
26. `supabase/migrations/20250117000004_fix_remaining_recursive_policies.sql`

### Step 3: Verify

After applying all migrations, run this query to verify tables were created:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

Expected: ~100 tables including:
- profiles
- courses  
- lessons
- user_progress
- tribunal_cases
- achievements
- certificates
- etc.

### Step 4: Test Application

Once migrations are applied:
1. Refresh your app at http://localhost:3001
2. Errors should be gone
3. Data should load correctly

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref zdcmugkafbczvxcyofiz

# Apply all migrations
npx supabase db push
```

## Notes

- Skip any files prefixed with `SKIP_` - these are deprecated
- Some migrations may report "already exists" - this is OK
- The comprehensive_demo_seed migration will create test data
- Default admin account: super_admin@abr-insights.com / TestPass123!
