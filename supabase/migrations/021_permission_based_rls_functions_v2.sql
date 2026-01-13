-- Migration: 021_permission_based_rls_functions_v2.sql
-- Description: Phase 3 - Permission-based RLS helper functions (PUBLIC SCHEMA VERSION)
-- Modified to use public schema instead of auth schema due to permission constraints
-- Created: 2025-01-13
-- Requires: 018_permission_check_functions.sql, 020_comprehensive_permissions_seed.sql

-- ============================================================================
-- PERMISSION CHECK FUNCTIONS (Enhanced) - PUBLIC SCHEMA
-- Note: Using CREATE OR REPLACE to update existing functions without breaking policies
-- ============================================================================

-- Check if user has a specific permission (with org context)
CREATE OR REPLACE FUNCTION public.has_permission(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has the permission through their role(s)
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        JOIN profiles prof ON prof.id = ur.user_id
        WHERE ur.user_id = p_user_id
        AND prof.organization_id = p_organization_id
        AND p.slug = p_permission_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_permission IS 'Check if user has specific permission in org context';

-- Check if user has ANY of the provided permissions
CREATE OR REPLACE FUNCTION public.has_any_permission(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission_slugs TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        JOIN profiles prof ON prof.id = ur.user_id
        WHERE ur.user_id = p_user_id
        AND prof.organization_id = p_organization_id
        AND p.slug = ANY(p_permission_slugs)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_any_permission IS 'Check if user has ANY of the specified permissions';

-- Check if user has ALL of the provided permissions
CREATE OR REPLACE FUNCTION public.has_all_permissions(
    p_user_id UUID,
    p_organization_id UUID,
    p_permission_slugs TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_required_count INTEGER;
    v_matched_count INTEGER;
BEGIN
    v_required_count := array_length(p_permission_slugs, 1);
    
    SELECT COUNT(DISTINCT p.slug) INTO v_matched_count
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    JOIN profiles prof ON prof.id = ur.user_id
    WHERE ur.user_id = p_user_id
    AND prof.organization_id = p_organization_id
    AND p.slug = ANY(p_permission_slugs);
    
    RETURN v_matched_count >= v_required_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_all_permissions IS 'Check if user has ALL of the specified permissions';

-- Check if user has permission on specific resource
CREATE OR REPLACE FUNCTION public.has_resource_permission(
    p_user_id UUID,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check role-based permissions first
    IF EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = p_user_id
        AND p.resource = p_resource_type
        AND p.action = p_action
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check resource-specific permissions (if table exists)
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'resource_permissions'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM resource_permissions rp
            WHERE rp.resource_type = p_resource_type
            AND rp.resource_id = p_resource_id
            AND rp.action = p_action
            AND rp.revoked_at IS NULL
            AND (rp.expires_at IS NULL OR rp.expires_at > NOW())
            AND (
                (rp.scope_type = 'user' AND rp.scope_id = p_user_id)
                OR (rp.scope_type = 'role' AND rp.scope_id IN (
                    SELECT role_id FROM user_roles WHERE user_id = p_user_id
                ))
                OR (rp.scope_type = 'public')
            )
        ) THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_resource_permission IS 'Check permission on specific resource instance';

-- ============================================================================
-- ROLE-BASED CONVENIENCE FUNCTIONS (For backwards compatibility)
-- ============================================================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(
    p_user_id UUID,
    p_role_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND r.slug = p_role_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_role IS 'Check if user has specific role (backwards compatibility)';

-- Check if user has ANY of the provided roles
CREATE OR REPLACE FUNCTION public.has_any_role(
    p_user_id UUID,
    p_role_slugs TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND r.slug = ANY(p_role_slugs)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_any_role IS 'Check if user has ANY of the specified roles';

-- Check if user is admin or higher
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND r.slug IN ('admin', 'super_admin', 'org_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_admin IS 'Check if user has admin, org_admin, or super_admin role';

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND r.slug = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_super_admin IS 'Check if user has super_admin role';

-- ============================================================================
-- TENANT ISOLATION HELPER FUNCTIONS
-- ============================================================================

-- Get user's organization ID
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.user_organization_id IS 'Get the organization ID for the current user';

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION public.belongs_to_organization(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = p_user_id
        AND organization_id = p_organization_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.belongs_to_organization IS 'Check if user belongs to specific organization';

-- Check if resource belongs to user's organization
CREATE OR REPLACE FUNCTION public.resource_in_user_org(
    p_table_name TEXT,
    p_resource_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_query TEXT;
    v_result BOOLEAN;
    v_user_org_id UUID;
BEGIN
    -- Get user's org ID
    v_user_org_id := public.user_organization_id();
    
    IF v_user_org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Build dynamic query
    v_query := format(
        'SELECT EXISTS (SELECT 1 FROM %I WHERE id = $1 AND organization_id = $2)',
        p_table_name
    );
    
    EXECUTE v_query INTO v_result USING p_resource_id, v_user_org_id;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.resource_in_user_org IS 'Check if resource belongs to user organization (dynamic)';

-- ============================================================================
-- PERFORMANCE: CREATE INDEXES ON USER_ROLES FOR PERMISSION CHECKS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id 
    ON user_roles(user_id, role_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_permission 
    ON role_permissions(role_id, permission_id);

CREATE INDEX IF NOT EXISTS idx_permissions_slug_resource_action 
    ON permissions(slug, resource, action);

-- ============================================================================
-- MIGRATION HELPER: Find tables with role-based RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION find_role_based_rls_policies()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    policy_name TEXT,
    policy_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT,
        tablename::TEXT,
        policyname::TEXT,
        pg_get_expr(polqual, polrelid)::TEXT AS definition
    FROM pg_policies
    WHERE schemaname = 'public'
    AND (
        pg_get_expr(polqual, polrelid) LIKE '%role%'
        OR pg_get_expr(polqual, polrelid) LIKE '%r.slug%'
        OR policyname LIKE '%role%'
    )
    ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_role_based_rls_policies IS 'Find all RLS policies that use role-based checks';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test permission checks
DO $$
DECLARE
    v_test_user_id UUID;
    v_test_org_id UUID;
    v_has_perm BOOLEAN;
BEGIN
    -- Get a test user (first user found)
    SELECT id, organization_id INTO v_test_user_id, v_test_org_id
    FROM profiles
    WHERE organization_id IS NOT NULL
    LIMIT 1;
    
    IF v_test_user_id IS NOT NULL THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Testing permission functions';
        RAISE NOTICE 'User ID: %', v_test_user_id;
        RAISE NOTICE 'Org ID: %', v_test_org_id;
        RAISE NOTICE '========================================';
        
        -- Test has_permission
        v_has_perm := public.has_permission(v_test_user_id, v_test_org_id, 'courses.read');
        RAISE NOTICE '✓ has_permission(courses.read): %', v_has_perm;
        
        -- Test has_any_permission
        v_has_perm := public.has_any_permission(v_test_user_id, v_test_org_id, ARRAY['courses.read', 'cases.read']);
        RAISE NOTICE '✓ has_any_permission([courses.read, cases.read]): %', v_has_perm;
        
        -- Test is_admin
        v_has_perm := public.is_admin(v_test_user_id);
        RAISE NOTICE '✓ is_admin(): %', v_has_perm;
        
        -- Test has_role
        v_has_perm := public.has_role(v_test_user_id, 'learner');
        RAISE NOTICE '✓ has_role(learner): %', v_has_perm;
        
        RAISE NOTICE '========================================';
        RAISE NOTICE 'All permission functions created successfully!';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '⚠ No test user found - skipping permission tests';
    END IF;
END $$;

-- List all permission functions created
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'has_permission',
        'has_any_permission',
        'has_all_permissions',
        'has_resource_permission',
        'has_role',
        'has_any_role',
        'is_admin',
        'is_super_admin',
        'user_organization_id',
        'belongs_to_organization',
        'resource_in_user_org'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Permission functions created: % of 11', func_count;
    RAISE NOTICE 'Schema: public (not auth - due to permissions)';
    RAISE NOTICE 'Security: SECURITY DEFINER STABLE';
    RAISE NOTICE 'Indexes: 3 performance indexes created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next: Apply migrations 022 and 023';
    RAISE NOTICE '========================================';
END $$;
