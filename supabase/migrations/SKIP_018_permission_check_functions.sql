-- Migration: Add permission checking functions for API route guards
-- Description: Creates RPC functions for efficient permission checks used by serverAuth.ts
-- Date: 2026-01-13

-- Function: check_user_permission
-- Checks if a user has a specific permission in an organization
-- Returns: boolean
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_organization_id UUID,
  p_permission_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- Check if user has the permission through any of their roles in the org
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.organization_id = p_organization_id
      AND p.slug = p_permission_slug
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

COMMENT ON FUNCTION public.check_user_permission IS 
  'Checks if a user has a specific permission in an organization via their roles';

-- Function: get_user_permissions
-- Returns all permissions a user has in an organization
-- Returns: array of permission slugs
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  p_user_id UUID,
  p_organization_id UUID
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permissions TEXT[];
BEGIN
  -- Get all unique permission slugs for the user in the org
  SELECT ARRAY_AGG(DISTINCT p.slug)
  INTO v_permissions
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.organization_id = p_organization_id;
  
  RETURN COALESCE(v_permissions, ARRAY[]::TEXT[]);
END;
$$;

COMMENT ON FUNCTION public.get_user_permissions IS 
  'Returns all permission slugs a user has in an organization';

-- Function: get_user_role_names
-- Returns all role names a user has in an organization
-- Returns: array of role names
CREATE OR REPLACE FUNCTION public.get_user_role_names(
  p_user_id UUID,
  p_organization_id UUID
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_roles TEXT[];
BEGIN
  SELECT ARRAY_AGG(r.name)
  INTO v_roles
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.organization_id = p_organization_id;
  
  RETURN COALESCE(v_roles, ARRAY[]::TEXT[]);
END;
$$;

COMMENT ON FUNCTION public.get_user_role_names IS 
  'Returns all role names a user has in an organization';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.check_user_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_names TO authenticated;
