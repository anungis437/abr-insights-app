-- Migration: 021_permission_based_rls_functions.sql
-- Description: Phase 3 - Permission-based RLS helper functions
-- Replaces role-based RLS with permission-based RLS for better granularity
-- Created: 2025-01-13
-- Requires: 018_permission_check_functions.sql, 020_comprehensive_permissions_seed.sql

-- ============================================================================
-- PERMISSION CHECK FUNCTIONS (Enhanced)
-- ============================================================================

-- Check if user has a specific permission (with org context)
CREATE OR REPLACE FUNCTION auth.has_permission(
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

COMMENT ON FUNCTION auth.has_permission IS 'Check if user has specific permission in org context';

-- Check if user has ANY of the provided permissions
CREATE OR REPLACE FUNCTION auth.has_any_permission(
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

COMMENT ON FUNCTION auth.has_any_permission IS 'Check if user has ANY of the specified permissions';

-- Check if user has ALL of the provided permissions
CREATE OR REPLACE FUNCTION auth.has_all_permissions(
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

COMMENT ON FUNCTION auth.has_all_permissions IS 'Check if user has ALL of the specified permissions';

-- Check if user has permission on specific resource
CREATE OR REPLACE FUNCTION auth.has_resource_permission(
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
    
    -- Check resource-specific permissions
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
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.has_resource_permission IS 'Check permission on specific resource instance';

-- ============================================================================
-- ROLE-BASED CONVENIENCE FUNCTIONS (For backwards compatibility)
-- ============================================================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION auth.has_role(
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

COMMENT ON FUNCTION auth.has_role IS 'Check if user has specific role (backwards compatibility)';

-- Check if user has ANY of the provided roles
CREATE OR REPLACE FUNCTION auth.has_any_role(
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

COMMENT ON FUNCTION auth.has_any_role IS 'Check if user has ANY of the specified roles';

-- Check if user is admin or higher
CREATE OR REPLACE FUNCTION auth.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = p_user_id
        AND r.slug IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.is_admin IS 'Check if user has admin or super_admin role';

-- Check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin(p_user_id UUID)
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

COMMENT ON FUNCTION auth.is_super_admin IS 'Check if user has super_admin role';

-- ============================================================================
-- TENANT ISOLATION HELPER FUNCTIONS
-- ============================================================================

-- Get user's organization ID
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.user_organization_id IS 'Get the organization ID for the current user';

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION auth.belongs_to_organization(
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

COMMENT ON FUNCTION auth.belongs_to_organization IS 'Check if user belongs to specific organization';

-- Check if resource belongs to user's organization
CREATE OR REPLACE FUNCTION auth.resource_in_user_org(
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
    v_user_org_id := auth.user_organization_id();
    
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

COMMENT ON FUNCTION auth.resource_in_user_org IS 'Check if resource belongs to user organization (dynamic)';

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
-- RLS POLICY TEMPLATES
-- ============================================================================

/*
TEMPLATE: Permission-based SELECT policy
-------------------------------------------
CREATE POLICY "policy_name_select"
    ON table_name
    FOR SELECT
    USING (
        organization_id = auth.user_organization_id()
        AND (
            auth.has_permission(auth.uid(), organization_id, 'resource.read')
            OR auth.has_any_permission(auth.uid(), organization_id, ARRAY['resource.read', 'admin.manage'])
        )
    );

TEMPLATE: Permission-based INSERT policy
-------------------------------------------
CREATE POLICY "policy_name_insert"
    ON table_name
    FOR INSERT
    WITH CHECK (
        organization_id = auth.user_organization_id()
        AND auth.has_permission(auth.uid(), organization_id, 'resource.create')
    );

TEMPLATE: Permission-based UPDATE policy
-------------------------------------------
CREATE POLICY "policy_name_update"
    ON table_name
    FOR UPDATE
    USING (
        organization_id = auth.user_organization_id()
        AND auth.has_permission(auth.uid(), organization_id, 'resource.update')
    )
    WITH CHECK (
        organization_id = auth.user_organization_id()
    );

TEMPLATE: Permission-based DELETE policy
-------------------------------------------
CREATE POLICY "policy_name_delete"
    ON table_name
    FOR DELETE
    USING (
        organization_id = auth.user_organization_id()
        AND (
            auth.has_permission(auth.uid(), organization_id, 'resource.delete')
            OR auth.is_admin(auth.uid())
        )
    );

TEMPLATE: Owner-based policy (user owns record)
-------------------------------------------
CREATE POLICY "policy_name_owner"
    ON table_name
    FOR ALL
    USING (
        user_id = auth.uid()
        OR auth.has_permission(auth.uid(), auth.user_organization_id(), 'resource.manage')
    );

TEMPLATE: Resource-specific permission
-------------------------------------------
CREATE POLICY "policy_name_resource"
    ON table_name
    FOR SELECT
    USING (
        auth.has_resource_permission(
            auth.uid(),
            'resource_type',
            id,
            'read'
        )
    );
*/

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
    -- Get a test user (admin user if exists)
    SELECT id, organization_id INTO v_test_user_id, v_test_org_id
    FROM profiles
    WHERE email LIKE '%admin%'
    LIMIT 1;
    
    IF v_test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing permission functions with user: %', v_test_user_id;
        
        -- Test has_permission
        v_has_perm := auth.has_permission(v_test_user_id, v_test_org_id, 'courses.read');
        RAISE NOTICE 'has_permission(courses.read): %', v_has_perm;
        
        -- Test has_any_permission
        v_has_perm := auth.has_any_permission(v_test_user_id, v_test_org_id, ARRAY['courses.read', 'cases.read']);
        RAISE NOTICE 'has_any_permission([courses.read, cases.read]): %', v_has_perm;
        
        -- Test is_admin
        v_has_perm := auth.is_admin(v_test_user_id);
        RAISE NOTICE 'is_admin(): %', v_has_perm;
    ELSE
        RAISE NOTICE 'No test user found - skipping permission tests';
    END IF;
END $$;
