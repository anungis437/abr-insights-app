-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for all core tables
-- Created: 2025-11-05
-- Requires: 001_initial_schema.sql

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_slug TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
        AND p.slug = permission_slug
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user has role
CREATE OR REPLACE FUNCTION public.has_role(role_slug TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.slug = role_slug
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
    SELECT public.has_role('admin') OR public.has_role('super_admin');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS RLS POLICIES
-- ============================================================================

-- Users can read their own organization
CREATE POLICY "Users can read own organization"
    ON organizations FOR SELECT
    USING (id = public.user_organization_id());

-- Admins can update their organization
CREATE POLICY "Admins can update own organization"
    ON organizations FOR UPDATE
    USING (id = public.user_organization_id() AND public.is_org_admin())
    WITH CHECK (id = public.user_organization_id() AND public.is_org_admin());

-- System can do anything (service role)
CREATE POLICY "Service role has full access"
    ON organizations FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Users can read profiles in their organization
CREATE POLICY "Users can read profiles in own org"
    ON profiles FOR SELECT
    USING (organization_id = public.user_organization_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can update profiles in their organization
CREATE POLICY "Admins can update profiles in own org"
    ON profiles FOR UPDATE
    USING (organization_id = public.user_organization_id() AND public.is_org_admin())
    WITH CHECK (organization_id = public.user_organization_id() AND public.is_org_admin());

-- Admins can insert profiles in their organization
CREATE POLICY "Admins can insert profiles in own org"
    ON profiles FOR INSERT
    WITH CHECK (organization_id = public.user_organization_id() AND public.is_org_admin());

-- Admins can delete profiles in their organization (soft delete)
CREATE POLICY "Admins can delete profiles in own org"
    ON profiles FOR DELETE
    USING (organization_id = public.user_organization_id() AND public.is_org_admin());

-- Service role has full access
CREATE POLICY "Service role has full access to profiles"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- ROLES RLS POLICIES
-- ============================================================================

-- All authenticated users can read roles
CREATE POLICY "Authenticated users can read roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

-- Only super admins can modify roles
CREATE POLICY "Super admins can manage roles"
    ON roles FOR ALL
    USING (public.has_role('super_admin'))
    WITH CHECK (public.has_role('super_admin'));

-- Service role has full access
CREATE POLICY "Service role has full access to roles"
    ON roles FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- PERMISSIONS RLS POLICIES
-- ============================================================================

-- All authenticated users can read permissions
CREATE POLICY "Authenticated users can read permissions"
    ON permissions FOR SELECT
    TO authenticated
    USING (true);

-- Only super admins can modify permissions
CREATE POLICY "Super admins can manage permissions"
    ON permissions FOR ALL
    USING (public.has_role('super_admin'))
    WITH CHECK (public.has_role('super_admin'));

-- Service role has full access
CREATE POLICY "Service role has full access to permissions"
    ON permissions FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- ROLE_PERMISSIONS RLS POLICIES
-- ============================================================================

-- All authenticated users can read role permissions
CREATE POLICY "Authenticated users can read role permissions"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

-- Only super admins can modify role permissions
CREATE POLICY "Super admins can manage role permissions"
    ON role_permissions FOR ALL
    USING (public.has_role('super_admin'))
    WITH CHECK (public.has_role('super_admin'));

-- Service role has full access
CREATE POLICY "Service role has full access to role permissions"
    ON role_permissions FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- USER_ROLES RLS POLICIES
-- ============================================================================

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
    ON user_roles FOR SELECT
    USING (user_id = auth.uid());

-- Admins can read roles in their organization
CREATE POLICY "Admins can read roles in own org"
    ON user_roles FOR SELECT
    USING (organization_id = public.user_organization_id() AND public.is_org_admin());

-- Admins can assign/revoke roles in their organization
CREATE POLICY "Admins can manage roles in own org"
    ON user_roles FOR ALL
    USING (organization_id = public.user_organization_id() AND public.is_org_admin())
    WITH CHECK (organization_id = public.user_organization_id() AND public.is_org_admin());

-- Service role has full access
CREATE POLICY "Service role has full access to user roles"
    ON user_roles FOR ALL
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- AUDIT_LOGS RLS POLICIES
-- ============================================================================

-- Users can read audit logs in their organization (if they have permission)
CREATE POLICY "Users with permission can read audit logs"
    ON audit_logs FOR SELECT
    USING (
        organization_id = public.user_organization_id() 
        AND public.has_permission('audit_logs:read')
    );

-- System can insert audit logs (service role only)
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = '.*');

-- Audit logs are immutable (no updates or deletes)
-- No UPDATE or DELETE policies = no one can modify audit logs

-- Service role can read all audit logs
CREATE POLICY "Service role can read all audit logs"
    ON audit_logs FOR SELECT
    USING (auth.jwt()->>'role' = '.*');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can read own organization" ON organizations IS 'Multi-tenancy: users see only their organization';
COMMENT ON POLICY "Users can read profiles in own org" ON profiles IS 'Multi-tenancy: users see only profiles in their organization';
COMMENT ON POLICY "Users can update own profile" ON profiles IS 'Users maintain their own profile information';
COMMENT ON POLICY "Authenticated users can read roles" ON roles IS 'Roles are visible to all authenticated users';
COMMENT ON POLICY "Users with permission can read audit logs" ON audit_logs IS 'Audit logs require explicit permission';
