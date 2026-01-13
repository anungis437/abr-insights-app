-- Migration: 020_comprehensive_permissions_seed.sql
-- Description: Phase 3 - Comprehensive permission seeding for RBAC
-- Adds all granular permissions for AI, embeddings, courses, cases, and features
-- Created: 2025-01-13
-- Requires: 001_initial_schema.sql, 010_seed_data.sql

-- ============================================================================
-- AI & ML PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- AI Chat
('Use AI Chat', 'ai.chat.use', 'ai', 'chat', 'Access to AI chat assistant for HR/employment law questions', false),
('Manage AI Chat', 'ai.chat.manage', 'ai', 'manage_chat', 'Configure AI chat settings and prompts', true),

-- AI Coach
('Use AI Coach', 'ai.coach.use', 'ai', 'coach', 'Access to personalized AI learning coach', false),
('Manage AI Coach', 'ai.coach.manage', 'ai', 'manage_coach', 'Configure AI coach settings and workflows', true),

-- AI Administration
('Manage AI', 'admin.ai.manage', 'admin', 'ai', 'Full AI administration including training and configuration', true),
('View AI Usage', 'ai.usage.view', 'ai', 'view_usage', 'View AI usage logs and statistics', false),
('Export AI Usage', 'ai.usage.export', 'ai', 'export_usage', 'Export AI usage data for analysis', true),

-- AI Training & Feedback
('Submit AI Feedback', 'ai.feedback.submit', 'ai', 'feedback', 'Submit feedback on AI responses for training', false),
('Review AI Feedback', 'ai.feedback.review', 'ai', 'review_feedback', 'Review and approve AI feedback for training', true),
('Manage Training Jobs', 'ai.training.manage', 'ai', 'training', 'Create and manage AI model training jobs', true),
('Manage Automation', 'ai.automation.manage', 'ai', 'automation', 'Configure automated AI workflows', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- EMBEDDINGS & SEARCH PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Embeddings Management
('Generate Embeddings', 'embeddings.generate', 'embeddings', 'generate', 'Generate vector embeddings for cases/courses (expensive)', true),
('Manage Embeddings', 'embeddings.manage', 'embeddings', 'manage', 'Full embeddings administration', true),
('View Embeddings Status', 'embeddings.view', 'embeddings', 'view', 'View embeddings generation status', false),

-- Semantic Search
('Search Embeddings', 'embeddings.search', 'embeddings', 'search', 'Perform semantic search using embeddings', false),
('Search Cases', 'cases.search', 'cases', 'search', 'Semantic search of tribunal cases', false),
('Search Courses', 'courses.search', 'courses', 'search', 'Semantic search of courses', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ENHANCED COURSE PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Course Content
('View Courses', 'courses.view', 'courses', 'view', 'View published courses', false),
('Enroll Courses', 'courses.enroll', 'courses', 'enroll', 'Enroll in courses', false),
('Create Lessons', 'lessons.create', 'lessons', 'create', 'Create lessons within courses', false),
('Update Lessons', 'lessons.update', 'lessons', 'update', 'Update lesson content', false),
('Delete Lessons', 'lessons.delete', 'lessons', 'delete', 'Delete lessons', true),
('Publish Lessons', 'lessons.publish', 'lessons', 'publish', 'Publish lessons to learners', false),

-- Quiz System
('Create Quizzes', 'quizzes.create', 'quizzes', 'create', 'Create quizzes and questions', false),
('Update Quizzes', 'quizzes.update', 'quizzes', 'update', 'Update quiz content and settings', false),
('Delete Quizzes', 'quizzes.delete', 'quizzes', 'delete', 'Delete quizzes', true),
('Take Quizzes', 'quizzes.take', 'quizzes', 'take', 'Take quizzes and submit answers', false),
('Review Submissions', 'quizzes.review', 'quizzes', 'review', 'Review quiz submissions', false),

-- Certificates
('Issue Certificates', 'certificates.issue', 'certificates', 'issue', 'Issue completion certificates', false),
('Revoke Certificates', 'certificates.revoke', 'certificates', 'revoke', 'Revoke issued certificates', true),
('View Own Certificates', 'certificates.view_own', 'certificates', 'view_own', 'View own certificates', false),
('View All Certificates', 'certificates.view_all', 'certificates', 'view_all', 'View all certificates in org', true),

-- CE Credits
('Earn CE Credits', 'ce_credits.earn', 'ce_credits', 'earn', 'Earn continuing education credits', false),
('Manage CE Credits', 'ce_credits.manage', 'ce_credits', 'manage', 'Manage CE credit configurations', true),
('Export CE Reports', 'ce_credits.export', 'ce_credits', 'export', 'Export CE credit reports', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TRIBUNAL CASES PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Case Management
('View Cases', 'cases.view', 'cases', 'view', 'View tribunal case details', false),
('Import Cases', 'cases.import', 'cases', 'import', 'Import case data from external sources', true),
('Export Cases', 'cases.export', 'cases', 'export', 'Export case data', false),
('Annotate Cases', 'cases.annotate', 'cases', 'annotate', 'Add annotations to cases', false),

-- Case Analysis
('Analyze Outcomes', 'cases.analyze', 'cases', 'analyze', 'Use AI to analyze case outcomes', false),
('View Statistics', 'cases.statistics', 'cases', 'statistics', 'View case statistics and trends', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- GAMIFICATION PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Points & Rewards
('Earn Points', 'gamification.earn_points', 'gamification', 'earn_points', 'Earn points through activities', false),
('View Leaderboard', 'gamification.view_leaderboard', 'gamification', 'view_leaderboard', 'View leaderboard rankings', false),
('Manage Points', 'gamification.manage_points', 'gamification', 'manage_points', 'Manage point configurations', true),

-- Achievements
('Earn Achievements', 'achievements.earn', 'achievements', 'earn', 'Unlock achievements', false),
('View Achievements', 'achievements.view', 'achievements', 'view', 'View achievement details', false),
('Manage Achievements', 'achievements.manage', 'achievements', 'manage', 'Create and configure achievements', true),

-- Social Features
('Create Study Groups', 'social.create_groups', 'social', 'create_groups', 'Create study buddy groups', false),
('Join Study Groups', 'social.join_groups', 'social', 'join_groups', 'Join existing study groups', false),
('Moderate Groups', 'social.moderate_groups', 'social', 'moderate_groups', 'Moderate study group content', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ORGANIZATION & USER MANAGEMENT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Organization
('View Organization Settings', 'organization.view', 'organization', 'view', 'View organization settings', false),
('Configure Organization', 'organization.configure', 'organization', 'configure', 'Configure organization settings', true),
('Manage Subscriptions', 'subscriptions.manage', 'subscriptions', 'manage', 'Manage subscription plans', true),
('View Billing', 'billing.view', 'billing', 'view', 'View billing information', false),

-- User Administration
('Invite Users', 'users.invite', 'users', 'invite', 'Invite new users to organization', false),
('Remove Users', 'users.remove', 'users', 'remove', 'Remove users from organization', true),
('View User Profiles', 'profiles.view', 'profiles', 'view', 'View user profile information', false),
('Update Own Profile', 'profiles.update_own', 'profiles', 'update_own', 'Update own profile', false),
('Update Any Profile', 'profiles.update_any', 'profiles', 'update_any', 'Update any user profile', true),

-- Team Management
('Manage Teams', 'teams.manage', 'teams', 'manage', 'Create and manage teams', false),
('Assign Teams', 'teams.assign', 'teams', 'assign', 'Assign users to teams', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CONTENT AUTHORING PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Content Creation
('Create Resources', 'resources.create', 'resources', 'create', 'Create learning resources', false),
('Update Resources', 'resources.update', 'resources', 'update', 'Update learning resources', false),
('Delete Resources', 'resources.delete', 'resources', 'delete', 'Delete learning resources', true),
('Publish Resources', 'resources.publish', 'resources', 'publish', 'Publish resources to learners', false),

-- Blog Management
('Create Blog Posts', 'blog.create', 'blog', 'create', 'Create blog posts', false),
('Publish Blog Posts', 'blog.publish', 'blog', 'publish', 'Publish blog posts', false),
('Moderate Comments', 'blog.moderate', 'blog', 'moderate', 'Moderate blog comments', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ANALYTICS & REPORTING PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Analytics
('View Own Analytics', 'analytics.view_own', 'analytics', 'view_own', 'View own progress and analytics', false),
('View Team Analytics', 'analytics.view_team', 'analytics', 'view_team', 'View team analytics', false),
('View Org Analytics', 'analytics.view_org', 'analytics', 'view_org', 'View organization-wide analytics', true),

-- Reports
('Generate Reports', 'reports.generate', 'reports', 'generate', 'Generate custom reports', false),
('Schedule Reports', 'reports.schedule', 'reports', 'schedule', 'Schedule automatic report generation', false),
('Export Reports', 'reports.export', 'reports', 'export', 'Export reports to various formats', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- AUDIT & COMPLIANCE PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Audit Logs
('View Own Audit Logs', 'audit_logs.view_own', 'audit_logs', 'view_own', 'View own audit logs', false),
('View Team Audit Logs', 'audit_logs.view_team', 'audit_logs', 'view_team', 'View team audit logs', true),
('View All Audit Logs', 'audit_logs.view_all', 'audit_logs', 'view_all', 'View all organization audit logs', true),
('Export Audit Logs', 'audit_logs.export', 'audit_logs', 'export', 'Export audit logs', true),

-- Compliance
('Manage Compliance', 'compliance.manage', 'compliance', 'manage', 'Manage compliance settings', true),
('Generate Compliance Reports', 'compliance.reports', 'compliance', 'reports', 'Generate compliance reports', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- INSTRUCTOR PORTAL PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, slug, resource, action, description, is_system) VALUES
-- Instructor Features
('Access Instructor Portal', 'instructor.access', 'instructor', 'access', 'Access instructor portal', false),
('View Course Analytics', 'instructor.analytics', 'instructor', 'analytics', 'View detailed course analytics', false),
('Manage Enrollments', 'instructor.enrollments', 'instructor', 'enrollments', 'Manage course enrollments', false),
('Grade Submissions', 'instructor.grade', 'instructor', 'grade', 'Grade quiz/assignment submissions', false),
('Message Students', 'instructor.message', 'instructor', 'message', 'Send messages to enrolled students', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- UPDATE ROLE PERMISSIONS WITH NEW PERMISSIONS
-- ============================================================================

-- Super Admin: Gets all new permissions automatically (already handled in seed data)

-- Admin: Add AI, embeddings, and advanced management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'admin'
AND p.slug IN (
    -- AI & Embeddings
    'ai.chat.use', 'ai.coach.use', 'admin.ai.manage', 'ai.usage.view', 'ai.usage.export',
    'ai.feedback.submit', 'ai.feedback.review', 'ai.training.manage', 'ai.automation.manage',
    'embeddings.generate', 'embeddings.manage', 'embeddings.view', 'embeddings.search',
    
    -- Cases & Courses
    'cases.search', 'courses.search', 'cases.view', 'cases.import', 'cases.export', 
    'cases.annotate', 'cases.analyze', 'cases.statistics',
    
    -- Advanced Course Features
    'courses.view', 'courses.enroll', 'lessons.create', 'lessons.update', 'lessons.delete', 'lessons.publish',
    'quizzes.create', 'quizzes.update', 'quizzes.delete', 'quizzes.review',
    'certificates.issue', 'certificates.revoke', 'certificates.view_all',
    'ce_credits.manage', 'ce_credits.export',
    
    -- Gamification
    'gamification.manage_points', 'achievements.manage', 'social.moderate_groups',
    
    -- Organization
    'organization.configure', 'subscriptions.manage', 'billing.view',
    'users.invite', 'users.remove', 'profiles.view', 'profiles.update_any',
    'teams.manage', 'teams.assign',
    
    -- Content & Analytics
    'resources.create', 'resources.update', 'resources.delete', 'resources.publish',
    'blog.create', 'blog.publish', 'blog.moderate',
    'analytics.view_org', 'reports.generate', 'reports.schedule', 'reports.export',
    
    -- Audit & Compliance
    'audit_logs.view_all', 'audit_logs.export', 'compliance.manage', 'compliance.reports'
)
ON CONFLICT DO NOTHING;

-- Manager: Team management and content creation
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'manager'
AND p.slug IN (
    -- AI (limited)
    'ai.chat.use', 'ai.coach.use', 'ai.usage.view', 'ai.feedback.submit',
    
    -- Search & View
    'cases.search', 'courses.search', 'cases.view', 'cases.export', 'cases.statistics',
    'embeddings.search',
    
    -- Course Management
    'courses.view', 'courses.enroll', 'lessons.create', 'lessons.update', 'lessons.publish',
    'quizzes.create', 'quizzes.update', 'quizzes.review',
    'certificates.view_all', 'ce_credits.export',
    
    -- Team Management
    'organization.view', 'billing.view', 'users.invite', 'profiles.view',
    'teams.manage', 'teams.assign',
    
    -- Content Creation
    'resources.create', 'resources.update', 'resources.publish',
    
    -- Analytics
    'analytics.view_team', 'reports.generate', 'reports.export',
    
    -- Audit (team only)
    'audit_logs.view_team'
)
ON CONFLICT DO NOTHING;

-- Instructor: Content creation and teaching
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'instructor'
AND p.slug IN (
    -- AI (basic)
    'ai.chat.use', 'ai.feedback.submit',
    
    -- Search & View
    'cases.search', 'courses.search', 'cases.view', 'embeddings.search',
    
    -- Course Creation
    'courses.view', 'lessons.create', 'lessons.update', 'lessons.publish',
    'quizzes.create', 'quizzes.update', 'quizzes.take', 'quizzes.review',
    'certificates.issue', 'certificates.view_own',
    
    -- Resources
    'resources.create', 'resources.update', 'resources.publish',
    
    -- Instructor Portal
    'instructor.access', 'instructor.analytics', 'instructor.enrollments',
    'instructor.grade', 'instructor.message',
    
    -- Own Analytics
    'analytics.view_own', 'reports.generate',
    
    -- Profile
    'profiles.update_own'
)
ON CONFLICT DO NOTHING;

-- Learner: Learning and engagement
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'learner'
AND p.slug IN (
    -- AI (basic)
    'ai.chat.use', 'ai.coach.use', 'ai.feedback.submit',
    
    -- Search & View
    'cases.search', 'courses.search', 'cases.view', 'embeddings.search',
    
    -- Learning
    'courses.view', 'courses.enroll', 'quizzes.take',
    'certificates.view_own', 'ce_credits.earn',
    
    -- Gamification
    'gamification.earn_points', 'gamification.view_leaderboard',
    'achievements.earn', 'achievements.view',
    'social.create_groups', 'social.join_groups',
    
    -- Own Data
    'analytics.view_own', 'profiles.update_own', 'audit_logs.view_own'
)
ON CONFLICT DO NOTHING;

-- Analyst: Data and reporting focus
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'analyst'
AND p.slug IN (
    -- AI Usage Analysis
    'ai.usage.view', 'ai.usage.export',
    
    -- Search & View
    'cases.search', 'courses.search', 'cases.view', 'cases.statistics',
    'embeddings.search', 'embeddings.view',
    
    -- Analytics & Reporting
    'analytics.view_org', 'reports.generate', 'reports.schedule', 'reports.export',
    
    -- Audit
    'audit_logs.view_team',
    
    -- Own Data
    'profiles.view'
)
ON CONFLICT DO NOTHING;

-- Guest: Very limited read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'guest'
AND p.slug IN (
    'courses.view',
    'cases.view',
    'achievements.view'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Count total permissions by resource
DO $$
DECLARE
    v_total_permissions INTEGER;
    v_resource_count RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_permissions FROM permissions;
    RAISE NOTICE 'Total Permissions: %', v_total_permissions;
    
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Permissions by Resource:';
    RAISE NOTICE '----------------------------------------';
    
    FOR v_resource_count IN
        SELECT resource, COUNT(*) as count
        FROM permissions
        GROUP BY resource
        ORDER BY resource
    LOOP
        RAISE NOTICE '%: %', RPAD(v_resource_count.resource, 20), v_resource_count.count;
    END LOOP;
    
    RAISE NOTICE '----------------------------------------';
END $$;
