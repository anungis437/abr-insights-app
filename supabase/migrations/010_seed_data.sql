-- Migration: 010_seed_data.sql
-- Description: Seed initial data (roles, permissions, categories)
-- Created: 2025-11-05
-- Requires: All previous migrations

-- ============================================================================
-- SEED ROLES
-- ============================================================================

INSERT INTO roles (name, slug, description, level, is_system) VALUES
('System', 'system', 'System role for automated processes', 70, true),
('Super Admin', 'super_admin', 'Full system access across all organizations', 60, true),
('Admin', 'admin', 'Full access within organization', 50, true),
('Manager', 'manager', 'Manage team and content within organization', 40, true),
('Analyst', 'analyst', 'Advanced data analysis and reporting', 30, true),
('Instructor', 'instructor', 'Create and manage training content', 20, true),
('Learner', 'learner', 'Basic access to training and resources', 10, true),
('Guest', 'guest', 'Limited read-only access', 0, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED PERMISSIONS
-- ============================================================================

-- User Management
INSERT INTO permissions (name, slug, resource, action, is_system) VALUES
('Create Users', 'users:create', 'users', 'create', true),
('Read Users', 'users:read', 'users', 'read', true),
('Update Users', 'users:update', 'users', 'update', true),
('Delete Users', 'users:delete', 'users', 'delete', true),

-- Course Management
('Create Courses', 'courses:create', 'courses', 'create', true),
('Read Courses', 'courses:read', 'courses', 'read', true),
('Update Courses', 'courses:update', 'courses', 'update', true),
('Delete Courses', 'courses:delete', 'courses', 'delete', true),
('Publish Courses', 'courses:publish', 'courses', 'publish', true),

-- Case Management
('Create Cases', 'cases:create', 'cases', 'create', true),
('Read Cases', 'cases:read', 'cases', 'read', true),
('Update Cases', 'cases:update', 'cases', 'update', true),
('Delete Cases', 'cases:delete', 'cases', 'delete', true),

-- Analytics
('Read Analytics', 'analytics:read', 'analytics', 'read', true),
('Export Analytics', 'analytics:export', 'analytics', 'export', true),

-- Organization Management
('Read Organization', 'organization:read', 'organization', 'read', true),
('Update Organization', 'organization:update', 'organization', 'update', true),
('Manage Billing', 'billing:manage', 'billing', 'manage', true),

-- Roles & Permissions
('Assign Roles', 'roles:assign', 'roles', 'assign', true),
('Read Roles', 'roles:read', 'roles', 'read', true),

-- Audit Logs
('Read Audit Logs', 'audit_logs:read', 'audit_logs', 'read', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Most permissions except system-level
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'admin'
AND p.slug IN (
    'users:create', 'users:read', 'users:update', 'users:delete',
    'courses:create', 'courses:read', 'courses:update', 'courses:delete', 'courses:publish',
    'cases:read', 'cases:update',
    'analytics:read', 'analytics:export',
    'organization:read', 'organization:update',
    'billing:manage',
    'roles:assign', 'roles:read',
    'audit_logs:read'
)
ON CONFLICT DO NOTHING;

-- Manager: Team and content management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'manager'
AND p.slug IN (
    'users:read', 'users:update',
    'courses:create', 'courses:read', 'courses:update',
    'cases:read', 'cases:update',
    'analytics:read',
    'organization:read'
)
ON CONFLICT DO NOTHING;

-- Analyst: Data and reporting
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'analyst'
AND p.slug IN (
    'courses:read',
    'cases:read',
    'analytics:read', 'analytics:export',
    'organization:read'
)
ON CONFLICT DO NOTHING;

-- Instructor: Content creation
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'instructor'
AND p.slug IN (
    'courses:create', 'courses:read', 'courses:update',
    'cases:read'
)
ON CONFLICT DO NOTHING;

-- Learner: Basic access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'learner'
AND p.slug IN (
    'courses:read',
    'cases:read'
)
ON CONFLICT DO NOTHING;

-- Guest: Read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'guest'
AND p.slug IN (
    'courses:read'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED CONTENT CATEGORIES
-- ============================================================================

INSERT INTO content_categories (name, slug, description, icon, sort_order) VALUES
('Anti-Black Racism Fundamentals', 'abr-fundamentals', 'Foundational knowledge about systemic racism', 'book-open', 1),
('Legal Framework', 'legal-framework', 'Human rights legislation and case law', 'scale', 2),
('Workplace Equity', 'workplace-equity', 'Creating equitable workplaces', 'briefcase', 3),
('Data & Reporting', 'data-reporting', 'Measuring and reporting on equity', 'chart-bar', 4),
('Allyship & Advocacy', 'allyship-advocacy', 'Being an effective ally', 'users', 5),
('Leadership & Change Management', 'leadership', 'Leading equity initiatives', 'trending-up', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED ACHIEVEMENTS
-- ============================================================================

INSERT INTO achievements (name, slug, description, type, rarity, points_value, icon_url) VALUES
-- Course Completions
('First Steps', 'first-steps', 'Complete your first course', 'course_completion', 'common', 10, '/badges/first-steps.svg'),
('Knowledge Builder', 'knowledge-builder', 'Complete 5 courses', 'milestone', 'uncommon', 50, '/badges/knowledge-builder.svg'),
('Expert Learner', 'expert-learner', 'Complete 10 courses', 'milestone', 'rare', 100, '/badges/expert-learner.svg'),
('Master Scholar', 'master-scholar', 'Complete 25 courses', 'milestone', 'epic', 250, '/badges/master-scholar.svg'),

-- Streaks
('Consistent Learner', 'consistent-learner', 'Maintain a 7-day learning streak', 'streak', 'uncommon', 30, '/badges/consistent-learner.svg'),
('Dedicated Student', 'dedicated-student', 'Maintain a 30-day learning streak', 'streak', 'rare', 100, '/badges/dedicated-student.svg'),
('Unstoppable', 'unstoppable', 'Maintain a 100-day learning streak', 'streak', 'legendary', 500, '/badges/unstoppable.svg'),

-- Engagement
('Quick Learner', 'quick-learner', 'Complete a course in under 2 hours', 'special', 'uncommon', 20, '/badges/quick-learner.svg'),
('Perfect Score', 'perfect-score', 'Score 100% on a quiz', 'special', 'rare', 50, '/badges/perfect-score.svg'),
('Case Explorer', 'case-explorer', 'Review 50 tribunal cases', 'milestone', 'uncommon', 40, '/badges/case-explorer.svg'),
('Community Contributor', 'community-contributor', 'Submit 10 course reviews', 'special', 'rare', 60, '/badges/community-contributor.svg'),

-- Leadership
('Team Leader', 'team-leader', 'Assigned as course instructor', 'special', 'epic', 150, '/badges/team-leader.svg'),
('Mentor', 'mentor', 'Help 10 learners complete courses', 'special', 'rare', 80, '/badges/mentor.svg')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SCRAPER CONFIGURATIONS (SKIPPED - table not yet created)
-- ============================================================================
-- TODO: Add scraper_configurations table in future migration
-- Then uncomment the seed data below

-- ============================================================================
-- SEED SAMPLE COURSE
-- ============================================================================

DO $$
DECLARE
    category_id UUID;
    course_id UUID;
    lesson_id UUID;
BEGIN
    -- Get category
    SELECT id INTO category_id FROM content_categories WHERE slug = 'abr-fundamentals' LIMIT 1;
    
    -- Create sample course
    INSERT INTO courses (
        title,
        slug,
        description,
        category_id,
        level,
        estimated_duration_minutes,
        is_published,
        required_tier,
        points_reward,
        learning_objectives,
        tags
    ) VALUES (
        'Introduction to Anti-Black Racism',
        'intro-to-abr',
        'Understand the fundamentals of anti-Black racism in Canada, its historical context, and contemporary manifestations in workplaces and institutions.',
        category_id,
        'beginner',
        120,
        true,
        'free',
        50,
        '["Understand systemic racism", "Recognize microaggressions", "Apply anti-racist practices"]',
        '["fundamentals", "introduction", "workplace"]'
    )
    RETURNING id INTO course_id;
    
    -- Create sample lessons
    INSERT INTO lessons (
        course_id,
        title,
        slug,
        description,
        content_type,
        module_number,
        lesson_number,
        sort_order,
        is_published,
        is_preview,
        estimated_read_time_minutes
    ) VALUES
    (
        course_id,
        'What is Anti-Black Racism?',
        'what-is-abr',
        'Define anti-Black racism and understand its unique characteristics.',
        'article',
        1,
        1,
        1,
        true,
        true,
        15
    ),
    (
        course_id,
        'Historical Context in Canada',
        'historical-context',
        'Explore the history of anti-Black racism in Canada from slavery to present day.',
        'article',
        1,
        2,
        2,
        true,
        false,
        20
    ),
    (
        course_id,
        'Module 1 Quiz',
        'module-1-quiz',
        'Test your understanding of the fundamentals.',
        'quiz',
        1,
        3,
        3,
        true,
        false,
        10
    );
    
    RAISE NOTICE 'Sample course created with ID: %', course_id;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Seed data migration completed successfully';
    RAISE NOTICE '📊 Seeded: 8 roles, 20+ permissions, 6 categories, 13 achievements, 3 scrapers, 1 sample course';
END $$;



