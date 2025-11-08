/**
 * Validate Current Supabase Database State
 * Checks what tables, columns, indexes, and policies already exist
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TableInfo {
  tableName: string;
  columns: string[];
  indexes: string[];
  policies: string[];
}

async function validateDatabaseState() {
  console.log('🔍 Validating Supabase Database State...\n');

  try {
    // Migration-specific tables to check
    const expectedTables = {
      // Phase 10 SSO tables
      sso_providers: ['id', 'organization_id', 'provider_type', 'provider_name', 'is_active'],
      enterprise_sessions: ['id', 'user_id', 'sso_provider_id', 'session_token'],
      identity_provider_mapping: ['id', 'user_id', 'sso_provider_id', 'external_id'],
      sso_login_attempts: ['id', 'provider_id', 'user_id', 'success'],
      
      // Phase 10 RBAC tables
      resource_permissions: ['id', 'resource_type', 'resource_id', 'role_id', 'permission_level'],
      permission_overrides: ['id', 'user_id', 'resource_type', 'resource_id', 'permission_level'],
      role_hierarchy: ['id', 'parent_role_id', 'child_role_id'],
      permission_cache: ['id', 'user_id', 'resource_type', 'cached_permissions'],
      
      // Phase 10 Audit tables
      compliance_reports: ['id', 'organization_id', 'report_type', 'period_start', 'period_end'],
      audit_log_exports: ['id', 'organization_id', 'export_format', 'file_path'],
      audit_logs_archive: ['id', 'original_log_id', 'user_id', 'action'],
      
      // Course workflow tables
      course_versions: ['id', 'course_id', 'version_number', 'created_by'],
      course_reviews: ['id', 'course_id', 'version_id', 'review_type', 'reviewer_id'],
      course_workflow_history: ['id', 'course_id', 'action_type', 'performed_by'],
      content_quality_checklists: ['id', 'course_id', 'checked_by', 'completion_percentage'],
      
      // Quiz system tables
      quizzes: ['id', 'title', 'course_id', 'lesson_id', 'is_published'],
      questions: ['id', 'quiz_id', 'question_text', 'question_type'],
      question_options: ['id', 'question_id', 'option_text', 'is_correct'],
      quiz_attempts: ['id', 'quiz_id', 'user_id', 'score', 'status'],
      quiz_responses: ['id', 'attempt_id', 'question_id', 'selected_option_id'],
      
      // Certificate tables
      certificate_templates: ['id', 'template_type', 'name', 'is_default'],
      user_certificates: ['id', 'user_id', 'course_id', 'certificate_number'],
      digital_badges: ['id', 'user_id', 'badge_type', 'issued_at'],
      
      // Instructor portal tables
      instructor_analytics: ['id', 'instructor_id', 'course_id', 'total_students'],
      student_progress_tracking: ['id', 'instructor_id', 'student_id', 'course_id'],
      course_feedback: ['id', 'course_id', 'student_id', 'rating'],
      instructor_notifications: ['id', 'instructor_id', 'notification_type', 'is_read'],
      
      // Gamification tables
      achievements: ['id', 'code', 'name', 'description', 'points'],
      user_achievements: ['id', 'user_id', 'achievement_id', 'unlocked_at'],
      points_transactions: ['id', 'user_id', 'amount', 'transaction_type'],
      reward_items: ['id', 'name', 'cost', 'item_type'],
      user_rewards: ['id', 'user_id', 'reward_id', 'claimed_at'],
      leaderboards: ['id', 'name', 'timeframe', 'metric_type'],
      social_interactions: ['id', 'user_id', 'target_user_id', 'interaction_type'],
      activity_feed: ['id', 'user_id', 'activity_type', 'created_at'],
    };

    // Simple table existence check
    console.log('Checking table existence via pg_tables...\n');
    
    const checkResults: Record<string, boolean> = {};
    
    for (const tableName of Object.keys(expectedTables)) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        checkResults[tableName] = !error;
        
        if (!error) {
          console.log(`✅ ${tableName} - EXISTS (${count ?? 0} rows)`);
        } else {
          console.log(`❌ ${tableName} - MISSING`);
        }
      } catch (err) {
        checkResults[tableName] = false;
        console.log(`❌ ${tableName} - MISSING`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY\n');
    
    const existingTables = Object.keys(checkResults).filter(t => checkResults[t]);
    const missingTables = Object.keys(checkResults).filter(t => !checkResults[t]);
    
    console.log(`✅ Existing Tables: ${existingTables.length}/${Object.keys(expectedTables).length}`);
    console.log(`❌ Missing Tables: ${missingTables.length}/${Object.keys(expectedTables).length}\n`);
    
    if (missingTables.length > 0) {
      console.log('Missing Tables:');
      missingTables.forEach(t => console.log(`  - ${t}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Check which migrations need to be applied
    console.log('\n📝 Migration Status Analysis:\n');
    
    const migrationTableGroups = {
      '20250115000007_course_workflow': ['course_versions', 'course_reviews', 'course_workflow_history', 'content_quality_checklists'],
      '20250115000003_quiz_system': ['quizzes', 'questions', 'question_options', 'quiz_attempts', 'quiz_responses'],
      '20250115000004_certificates': ['certificate_templates', 'user_certificates', 'digital_badges'],
      '20250115000008_instructor_portal': ['instructor_analytics', 'student_progress_tracking', 'course_feedback', 'instructor_notifications'],
      '20250115000009_gamification_achievements': ['achievements', 'user_achievements'],
      '20250115000010_gamification_points_rewards': ['points_transactions', 'reward_items', 'user_rewards', 'leaderboards'],
      '20250115000011_gamification_social': ['social_interactions', 'activity_feed'],
      '20250116000001_enterprise_sso_auth': ['sso_providers', 'enterprise_sessions', 'identity_provider_mapping', 'sso_login_attempts'],
      '20250116000002_advanced_rbac': ['resource_permissions', 'permission_overrides', 'role_hierarchy', 'permission_cache'],
      '20250116000003_audit_logs_enhancement': ['compliance_reports', 'audit_log_exports', 'audit_logs_archive'],
    };
    
    for (const [migration, tables] of Object.entries(migrationTableGroups)) {
      const allExist = tables.every(t => checkResults[t]);
      const someExist = tables.some(t => checkResults[t]);
      const noneExist = !someExist;
      
      if (allExist) {
        console.log(`✅ ${migration} - FULLY APPLIED`);
      } else if (someExist) {
        const existing = tables.filter(t => checkResults[t]);
        const missing = tables.filter(t => !checkResults[t]);
        console.log(`⚠️  ${migration} - PARTIALLY APPLIED`);
        console.log(`   Existing: ${existing.join(', ')}`);
        console.log(`   Missing: ${missing.join(', ')}`);
      } else {
        console.log(`❌ ${migration} - NOT APPLIED`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

validateDatabaseState();
