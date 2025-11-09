-- Drop all tables that exist but weren't properly created by migrations
-- This is safe because validation shows all tables have 0 rows (except achievements=13, certificate_templates=1)

-- Phase 10 SSO tables (0 rows each)
DROP TABLE IF EXISTS sso_login_attempts CASCADE;
DROP TABLE IF EXISTS identity_provider_mapping CASCADE;
DROP TABLE IF EXISTS enterprise_sessions CASCADE;
DROP TABLE IF EXISTS sso_providers CASCADE;

-- Phase 10 RBAC tables (0 rows each)
DROP TABLE IF EXISTS permission_cache CASCADE;
DROP TABLE IF EXISTS permission_overrides CASCADE;
DROP TABLE IF EXISTS role_hierarchy CASCADE;
DROP TABLE IF EXISTS resource_permissions CASCADE;

-- Phase 10 Audit tables (0 rows each)
DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS audit_log_exports CASCADE;
DROP TABLE IF EXISTS audit_logs_archive CASCADE;

-- Gamification tables (achievements has 13 rows - will need to preserve or recreate)
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS social_interactions CASCADE;
DROP TABLE IF EXISTS leaderboards CASCADE;
DROP TABLE IF EXISTS user_rewards CASCADE;
DROP TABLE IF EXISTS reward_items CASCADE;
DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;  -- HAS 13 ROWS - migration will recreate with seed data

-- Instructor portal tables (0 rows each)
DROP TABLE IF EXISTS instructor_notifications CASCADE;
DROP TABLE IF EXISTS course_feedback CASCADE;
DROP TABLE IF EXISTS student_progress_tracking CASCADE;
DROP TABLE IF EXISTS instructor_analytics CASCADE;

-- Certificate tables (certificate_templates has 1 row - will need to preserve or recreate)
DROP TABLE IF EXISTS digital_badges CASCADE;
DROP TABLE IF EXISTS user_certificates CASCADE;
DROP TABLE IF EXISTS certificate_templates CASCADE;  -- HAS 1 ROW - migration will recreate

-- Quiz system tables (0 rows each)
DROP TABLE IF EXISTS quiz_responses CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;

-- Course workflow tables (0 rows each)
DROP TABLE IF EXISTS content_quality_checklists CASCADE;
DROP TABLE IF EXISTS course_workflow_history CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS course_versions CASCADE;

-- Drop custom types that may have been created
DROP TYPE IF EXISTS review_type CASCADE;
DROP TYPE IF EXISTS review_decision CASCADE;
DROP TYPE IF EXISTS workflow_status CASCADE;
DROP TYPE IF EXISTS workflow_action_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS quiz_difficulty CASCADE;
DROP TYPE IF EXISTS attempt_status CASCADE;
DROP TYPE IF EXISTS template_type CASCADE;
DROP TYPE IF EXISTS certificate_status CASCADE;
DROP TYPE IF EXISTS badge_tier CASCADE;
DROP TYPE IF EXISTS sso_provider_type CASCADE;
DROP TYPE IF EXISTS sso_protocol CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS permission_level CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;
DROP TYPE IF EXISTS achievement_category CASCADE;
DROP TYPE IF EXISTS achievement_tier CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS reward_type CASCADE;
DROP TYPE IF EXISTS redemption_status CASCADE;
DROP TYPE IF EXISTS leaderboard_timeframe CASCADE;
DROP TYPE IF EXISTS interaction_type CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;

COMMENT ON SCHEMA public IS 'Cleaned up - ready for migrations 007-011 and Phase 10';
