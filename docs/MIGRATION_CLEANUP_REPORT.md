# Migration Cleanup Report

## Duplicate Migration Numbers

The following migration numbers have duplicate files in the `supabase/migrations/` directory:

### 018 - Courses Enhancement RLS vs Permission Check Functions

- `018_courses_enhancement_rls.sql` - **CURRENT** (applied to remote)
- `SKIP_018_permission_check_functions.sql` - Duplicate (already applied, marked as SKIP)

### 019 - AI Usage Logging vs Courses Gamification

- `019_ai_usage_logging.sql` - **CURRENT** (applied to remote)
- `SKIP_019_courses_gamification.sql` - Duplicate (already applied, marked as SKIP)

### 021 - Permission Based RLS Functions (Two Versions)

- `021_permission_based_rls_functions.sql` - **CURRENT** (applied to remote)
- `SKIP_021_permission_based_rls_functions_v2.sql` - Duplicate v2 (already applied, marked as SKIP)

### 023 - Migrate Feature Table RLS (Two Versions)

- `023_migrate_feature_table_rls.sql` - **CURRENT** (applied to remote)
- `SKIP_023_migrate_feature_table_rls_FIXED.sql` - Fixed duplicate (already applied, marked as SKIP)

### Gamification Migrations (3 duplicates)

- `SKIP_20250115000009_gamification_achievements.sql` - Duplicate
- `SKIP_20250115000010_gamification_points_rewards.sql` - Duplicate
- `SKIP_20250115000011_gamification_social.sql` - Duplicate

## Resolution Status

✅ **All duplicates have been marked with `SKIP_` prefix**

This prevents Supabase CLI from re-applying them while preserving the migration history for reference.

## Why Duplicates Exist

These duplicates were created during iterative development when:

1. Migrations were applied out of order
2. Updated versions were created with same number but different content
3. Migrations failed and were fixed, creating "FIXED" versions

The `SKIP_` prefix prevents conflicts with the remote migration history table while maintaining local audit trail.

## Clean Migration History

Current active migrations (in chronological order):

```
000_enable_extensions.sql
001_initial_schema.sql
002_rls_policies.sql
003_content_tables.sql
004_user_engagement.sql
010_seed_data.sql
011_newsletter_subscribers.sql
012_tribunal_case_stats_rpc.sql
013_testimonials.sql
014_add_role_to_profiles.sql
015_ai_training_system.sql
016_rbac_test_accounts.sql
017_courses_enhancement_phase1.sql
018_courses_enhancement_rls.sql
019_ai_usage_logging.sql
020_comprehensive_permissions_seed.sql
021_permission_based_rls_functions.sql
022_migrate_critical_table_rls.sql
023_migrate_feature_table_rls.sql
20250108000001_enable_pgvector.sql
20250108000002_create_embeddings_tables.sql
20250108000003_create_similarity_functions.sql
20250108000004_create_outcome_prediction.sql
20250115000001_lesson_notes.sql
20250115000002_watch_history.sql
20250115000003_quiz_system.sql
20250115000004_certificates.sql
20250115000005_ce_credit_tracking.sql
20250115000006_skills_validation.sql
20250115000007_course_workflow.sql
20250115000008_instructor_portal.sql
20250116000001_enterprise_sso_auth.sql
20250116000002_advanced_rbac.sql
20250116000003_audit_logs_enhancement.sql
20250116000004_ingestion_pipeline.sql
20250116000005_migrate_gamification_schema.sql
20250116000006_gamification_social.sql
20250116000007_comprehensive_demo_seed.sql
20250117000001_cleanup_test_users.sql
20250117000002_fix_profiles_rls_recursion.sql
20250117000003_fix_profiles_rls_simple.sql
20250117000004_fix_remaining_recursive_policies.sql
20250127000000_enable_rls_on_missing_tables.sql
20260113000001_fix_sso_providers_rls.sql
20260113000002_create_missing_gamification_tables.sql
20260113000003_fix_user_points_columns.sql
```

## Recommendation

Keep SKIP\_ files for historical reference but they can be safely deleted if needed. They will not affect database state as they've already been applied and the remote migration history table is the source of truth.
